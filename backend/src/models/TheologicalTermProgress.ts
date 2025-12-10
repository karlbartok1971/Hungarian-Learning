import { TheologicalTermProgress as PrismaTermProgress, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

/**
 * 신학 용어 학습 진도 관리 모델
 * 사용자의 개별 용어 학습 상태와 숙련도를 추적
 */

export interface CreateTermProgressInput {
  user_id: string;
  term_id: string;
  mastery_level?: number; // 0-4: 모름, 인식, 이해, 사용, 숙달
  correct_answers?: number;
  total_attempts?: number;
}

export interface UpdateTermProgressInput {
  mastery_level?: number;
  correct_answers?: number;
  total_attempts?: number;
  last_reviewed_at?: Date;
  next_review_date?: Date;
}

export interface LearningSession {
  term_id: string;
  correct: boolean;
  response_time_ms: number;
  difficulty_perceived: number; // 1-5
  context: 'recognition' | 'translation' | 'usage' | 'writing';
}

export interface MasteryLevel {
  level: number;
  name: string;
  description: string;
  korean_name: string;
  requirements: {
    min_correct_rate: number;
    min_attempts: number;
    max_days_since_review: number;
  };
}

export interface UserTermStatistics {
  user_id: string;
  total_terms_studied: number;
  mastery_distribution: Record<number, number>;
  average_mastery_level: number;
  weekly_progress: number;
  strongest_categories: string[];
  areas_for_improvement: string[];
  recommended_review_terms: string[];
}

export interface SpacedRepetitionSchedule {
  term_id: string;
  current_interval_days: number;
  next_review_date: Date;
  ease_factor: number; // 1.3-2.5
  repetition_count: number;
}

export class TheologicalTermProgressModel {

  /**
   * 숙련도 레벨 정의
   */
  static readonly MASTERY_LEVELS: MasteryLevel[] = [
    {
      level: 0,
      name: 'Unknown',
      korean_name: '모름',
      description: '용어를 처음 보거나 전혀 모르는 상태',
      requirements: { min_correct_rate: 0, min_attempts: 0, max_days_since_review: 999 }
    },
    {
      level: 1,
      name: 'Recognition',
      korean_name: '인식',
      description: '용어를 보면 대략적인 의미를 떠올릴 수 있는 상태',
      requirements: { min_correct_rate: 0.3, min_attempts: 3, max_days_since_review: 7 }
    },
    {
      level: 2,
      name: 'Understanding',
      korean_name: '이해',
      description: '용어의 정확한 의미와 기본 사용법을 아는 상태',
      requirements: { min_correct_rate: 0.6, min_attempts: 5, max_days_since_review: 14 }
    },
    {
      level: 3,
      name: 'Usage',
      korean_name: '사용',
      description: '문맥에 맞게 용어를 사용할 수 있는 상태',
      requirements: { min_correct_rate: 0.8, min_attempts: 8, max_days_since_review: 30 }
    },
    {
      level: 4,
      name: 'Mastery',
      korean_name: '숙달',
      description: '용어를 완전히 숙달하여 자연스럽게 사용할 수 있는 상태',
      requirements: { min_correct_rate: 0.9, min_attempts: 12, max_days_since_review: 60 }
    }
  ];

  /**
   * 새 학습 진도 생성 또는 기존 진도 조회
   */
  static async findOrCreate(userId: string, termId: string): Promise<PrismaTermProgress> {
    try {
      // 기존 진도 조회
      let progress = await prisma.theologicalTermProgress.findUnique({
        where: {
          user_id_term_id: {
            user_id: userId,
            term_id: termId
          }
        }
      });

      // 없으면 새로 생성
      if (!progress) {
        progress = await prisma.theologicalTermProgress.create({
          data: {
            id: `progress_${userId}_${termId}_${Date.now()}`,
            user_id: userId,
            term_id: termId,
            mastery_level: 0,
            correct_answers: 0,
            total_attempts: 0,
            created_at: new Date(),
            updated_at: new Date(),
            next_review_date: new Date() // 즉시 복습 가능
          }
        });
      }

      return progress;
    } catch (error) {
      throw new Error(`학습 진도 생성/조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 학습 세션 기록 및 진도 업데이트
   */
  static async recordLearningSession(
    userId: string,
    termId: string,
    session: LearningSession
  ): Promise<PrismaTermProgress> {
    try {
      const progress = await this.findOrCreate(userId, termId);

      // 새 시도 결과 계산
      const newTotalAttempts = progress.total_attempts + 1;
      const newCorrectAnswers = progress.correct_answers + (session.correct ? 1 : 0);
      const correctRate = newCorrectAnswers / newTotalAttempts;

      // 숙련도 레벨 계산
      const newMasteryLevel = this.calculateMasteryLevel(
        correctRate,
        newTotalAttempts,
        progress.mastery_level
      );

      // 간격 반복 스케줄 계산
      const schedule = this.calculateSpacedRepetition(
        progress.mastery_level,
        newMasteryLevel,
        session.correct
      );

      // 진도 업데이트
      return await prisma.theologicalTermProgress.update({
        where: { id: progress.id },
        data: {
          mastery_level: newMasteryLevel,
          correct_answers: newCorrectAnswers,
          total_attempts: newTotalAttempts,
          last_reviewed_at: new Date(),
          next_review_date: schedule.next_review_date,
          updated_at: new Date()
        }
      });
    } catch (error) {
      throw new Error(`학습 세션 기록 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 숙련도 레벨 계산
   */
  private static calculateMasteryLevel(
    correctRate: number,
    totalAttempts: number,
    currentLevel: number
  ): number {
    // 현재 레벨에서 시작하여 요구사항을 만족하는 최고 레벨 찾기
    for (let level = Math.max(currentLevel, 0); level < this.MASTERY_LEVELS.length; level++) {
      const requirements = this.MASTERY_LEVELS[level].requirements;

      if (correctRate >= requirements.min_correct_rate &&
          totalAttempts >= requirements.min_attempts) {
        continue; // 다음 레벨 확인
      } else {
        return Math.max(level - 1, 0); // 이전 레벨 반환
      }
    }

    return this.MASTERY_LEVELS.length - 1; // 최고 레벨
  }

  /**
   * 간격 반복 스케줄 계산 (Modified Anki Algorithm)
   */
  private static calculateSpacedRepetition(
    currentLevel: number,
    newLevel: number,
    correct: boolean
  ): SpacedRepetitionSchedule {
    const baseIntervals = [1, 3, 7, 14, 30, 60]; // 기본 간격 (일)
    let interval = baseIntervals[Math.min(newLevel, baseIntervals.length - 1)];

    // 정답/오답에 따른 조정
    if (!correct) {
      interval = Math.max(1, Math.floor(interval * 0.5)); // 오답 시 간격 단축
    } else if (newLevel > currentLevel) {
      interval = Math.floor(interval * 1.2); // 레벨업 시 간격 증가
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
      term_id: '',
      current_interval_days: interval,
      next_review_date: nextReviewDate,
      ease_factor: correct ? 2.0 : 1.5,
      repetition_count: newLevel
    };
  }

  /**
   * 사용자 복습 대상 용어 조회
   */
  static async getReviewTerms(
    userId: string,
    limit: number = 20,
    priorityLevel?: number
  ): Promise<PrismaTermProgress[]> {
    try {
      const whereClause: Prisma.TheologicalTermProgressWhereInput = {
        user_id: userId,
        next_review_date: {
          lte: new Date() // 복습 시간이 된 용어들
        }
      };

      if (priorityLevel !== undefined) {
        whereClause.mastery_level = { lte: priorityLevel };
      }

      return await prisma.theologicalTermProgress.findMany({
        where: whereClause,
        orderBy: [
          { mastery_level: 'asc' }, // 낮은 숙련도 우선
          { next_review_date: 'asc' }, // 오래된 복습 일정 우선
        ],
        take: limit,
        include: {
          theological_term: true
        }
      });
    } catch (error) {
      throw new Error(`복습 대상 용어 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 사용자별 학습 통계
   */
  static async getUserStatistics(userId: string): Promise<UserTermStatistics> {
    try {
      const [progressRecords, weeklyData] = await Promise.all([
        prisma.theologicalTermProgress.findMany({
          where: { user_id: userId },
          include: { theological_term: true }
        }),
        prisma.theologicalTermProgress.findMany({
          where: {
            user_id: userId,
            last_reviewed_at: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 지난 7일
            }
          }
        })
      ]);

      // 숙련도 분포 계산
      const masteryDistribution = progressRecords.reduce((acc, record) => {
        acc[record.mastery_level] = (acc[record.mastery_level] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // 평균 숙련도 계산
      const averageMastery = progressRecords.length > 0
        ? progressRecords.reduce((sum, record) => sum + record.mastery_level, 0) / progressRecords.length
        : 0;

      // 카테고리별 강점 분석
      const categoryStrengths = new Map<string, { total: number; strong: number }>();
      progressRecords.forEach(record => {
        const category = record.theological_term.category;
        if (!categoryStrengths.has(category)) {
          categoryStrengths.set(category, { total: 0, strong: 0 });
        }
        const stats = categoryStrengths.get(category)!;
        stats.total++;
        if (record.mastery_level >= 3) stats.strong++;
      });

      const strongestCategories = Array.from(categoryStrengths.entries())
        .filter(([_, stats]) => stats.total >= 3) // 최소 3개 이상 학습한 카테고리
        .sort(([_, a], [__, b]) => (b.strong / b.total) - (a.strong / a.total))
        .slice(0, 3)
        .map(([category, _]) => category);

      // 개선이 필요한 영역
      const areasForImprovement = Array.from(categoryStrengths.entries())
        .filter(([_, stats]) => stats.total >= 3 && (stats.strong / stats.total) < 0.5)
        .sort(([_, a], [__, b]) => (a.strong / a.total) - (b.strong / b.total))
        .slice(0, 3)
        .map(([category, _]) => category);

      // 추천 복습 용어
      const recommendedReview = progressRecords
        .filter(record =>
          record.mastery_level < 3 &&
          record.next_review_date <= new Date()
        )
        .sort((a, b) => a.mastery_level - b.mastery_level)
        .slice(0, 5)
        .map(record => record.term_id);

      return {
        user_id: userId,
        total_terms_studied: progressRecords.length,
        mastery_distribution: masteryDistribution,
        average_mastery_level: Math.round(averageMastery * 10) / 10,
        weekly_progress: weeklyData.length,
        strongest_categories: strongestCategories,
        areas_for_improvement: areasForImprovement,
        recommended_review_terms: recommendedReview
      };
    } catch (error) {
      throw new Error(`사용자 통계 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 용어별 학습 진도 조회
   */
  static async getTermProgress(
    userId: string,
    termId: string
  ): Promise<PrismaTermProgress | null> {
    try {
      return await prisma.theologicalTermProgress.findUnique({
        where: {
          user_id_term_id: {
            user_id: userId,
            term_id: termId
          }
        },
        include: {
          theological_term: true
        }
      });
    } catch (error) {
      throw new Error(`용어 진도 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 학습 진도 초기화 (재학습)
   */
  static async resetProgress(userId: string, termId: string): Promise<PrismaTermProgress> {
    try {
      const progress = await this.findOrCreate(userId, termId);

      return await prisma.theologicalTermProgress.update({
        where: { id: progress.id },
        data: {
          mastery_level: 0,
          correct_answers: 0,
          total_attempts: 0,
          last_reviewed_at: null,
          next_review_date: new Date(),
          updated_at: new Date()
        }
      });
    } catch (error) {
      throw new Error(`학습 진도 초기화 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 일괄 진도 업데이트 (관리자용)
   */
  static async bulkUpdateProgress(
    updates: Array<{
      user_id: string;
      term_id: string;
      mastery_level: number;
    }>
  ): Promise<{ updated: number; errors: string[] }> {
    let updated = 0;
    const errors: string[] = [];

    for (const update of updates) {
      try {
        const progress = await this.findOrCreate(update.user_id, update.term_id);
        await prisma.theologicalTermProgress.update({
          where: { id: progress.id },
          data: {
            mastery_level: update.mastery_level,
            updated_at: new Date()
          }
        });
        updated++;
      } catch (error) {
        errors.push(`${update.user_id}-${update.term_id}: ${(error as Error).message}`);
      }
    }

    return { updated, errors };
  }

  /**
   * 진도 데이터 내보내기 (백업용)
   */
  static async exportUserProgress(userId: string): Promise<any[]> {
    try {
      return await prisma.theologicalTermProgress.findMany({
        where: { user_id: userId },
        include: {
          theological_term: {
            select: {
              hungarian: true,
              korean_meaning: true,
              category: true,
              difficulty_level: true
            }
          }
        }
      });
    } catch (error) {
      throw new Error(`진도 데이터 내보내기 실패: ${(error as Error).message}`);
    }
  }
}

export default TheologicalTermProgressModel;