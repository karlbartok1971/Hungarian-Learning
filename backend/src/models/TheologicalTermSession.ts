import { TheologicalTermSession as PrismaTermSession, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

/**
 * 신학 용어 학습 세션 관리 모델
 * 사용자의 학습 활동과 게임화된 학습 경험 추적
 */

export type SessionType = 'recognition' | 'translation' | 'usage' | 'quiz' | 'writing' | 'listening';

export interface CreateSessionInput {
  user_id: string;
  session_type: SessionType;
  target_level?: string; // A1, A2, B1, B2
  target_categories?: string[];
  planned_duration_minutes?: number;
}

export interface SessionQuestion {
  term_id: string;
  question_type: 'meaning' | 'usage' | 'pronunciation' | 'context';
  question: string;
  options?: string[];
  correct_answer: string;
  user_answer?: string;
  is_correct?: boolean;
  response_time_ms?: number;
  difficulty_rating?: number; // 1-5, 사용자 체감 난이도
}

export interface UpdateSessionInput {
  terms_studied?: string[];
  correct_count?: number;
  total_count?: number;
  duration_seconds?: number;
  completed_at?: Date;
  questions?: SessionQuestion[];
  performance_metrics?: SessionPerformanceMetrics;
}

export interface SessionPerformanceMetrics {
  average_response_time_ms: number;
  accuracy_rate: number;
  improvement_rate: number; // 이전 세션 대비 향상도
  consistency_score: number; // 1-10, 일관성 점수
  focus_level: number; // 1-10, 집중도 (response time 기반)
  categories_practiced: Record<string, number>; // 카테고리별 연습 횟수
  difficulty_adaptation: {
    started_at: string;
    ended_at: string;
    adaptation_count: number;
  };
}

export interface SessionStatistics {
  total_sessions: number;
  total_study_time_minutes: number;
  average_session_length_minutes: number;
  overall_accuracy: number;
  best_session_score: number;
  current_streak: number;
  favorite_session_type: SessionType;
  weekly_sessions: number;
  monthly_improvement: number;
}

export interface LearningPathRecommendation {
  recommended_session_type: SessionType;
  recommended_duration: number;
  target_terms: string[];
  focus_areas: string[];
  difficulty_level: string;
  reasoning: string;
}

export interface SessionReward {
  type: 'xp' | 'badge' | 'achievement' | 'streak_bonus';
  amount?: number;
  badge_name?: string;
  achievement_name?: string;
  description: string;
}

export class TheologicalTermSessionModel {

  /**
   * 새 학습 세션 시작
   */
  static async startSession(sessionData: CreateSessionInput): Promise<PrismaTermSession> {
    try {
      const sessionId = `session_${sessionData.user_id}_${Date.now()}`;

      return await prisma.theologicalTermSession.create({
        data: {
          id: sessionId,
          user_id: sessionData.user_id,
          session_type: sessionData.session_type,
          terms_studied: JSON.stringify([]),
          correct_count: 0,
          total_count: 0,
          duration_seconds: 0,
          created_at: new Date()
        }
      });
    } catch (error) {
      throw new Error(`학습 세션 시작 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 세션 진행 상황 업데이트
   */
  static async updateSession(
    sessionId: string,
    updateData: UpdateSessionInput
  ): Promise<PrismaTermSession> {
    try {
      const updatePayload: any = {
        updated_at: new Date()
      };

      // 기본 필드 업데이트
      const simpleFields = ['correct_count', 'total_count', 'duration_seconds', 'completed_at'];
      simpleFields.forEach(field => {
        if (updateData[field as keyof UpdateSessionInput] !== undefined) {
          updatePayload[field] = updateData[field as keyof UpdateSessionInput];
        }
      });

      // JSON 필드 업데이트
      if (updateData.terms_studied) {
        updatePayload.terms_studied = JSON.stringify(updateData.terms_studied);
      }

      return await prisma.theologicalTermSession.update({
        where: { id: sessionId },
        data: updatePayload
      });
    } catch (error) {
      throw new Error(`세션 업데이트 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 세션 완료 처리
   */
  static async completeSession(
    sessionId: string,
    finalData: {
      correct_count: number;
      total_count: number;
      duration_seconds: number;
      questions?: SessionQuestion[];
      performance_metrics?: SessionPerformanceMetrics;
    }
  ): Promise<{
    session: PrismaTermSession;
    rewards: SessionReward[];
    achievements: string[];
  }> {
    try {
      // 세션 완료 처리
      const session = await this.updateSession(sessionId, {
        ...finalData,
        completed_at: new Date()
      });

      // 성과 분석 및 보상 계산
      const rewards = await this.calculateRewards(session, finalData.performance_metrics);

      // 업적 확인
      const achievements = await this.checkAchievements(session.user_id, session);

      return { session, rewards, achievements };
    } catch (error) {
      throw new Error(`세션 완료 처리 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 사용자별 세션 통계
   */
  static async getUserSessionStats(userId: string): Promise<SessionStatistics> {
    try {
      const [allSessions, recentSessions] = await Promise.all([
        prisma.theologicalTermSession.findMany({
          where: {
            user_id: userId,
            completed_at: { not: null }
          },
          orderBy: { completed_at: 'desc' }
        }),
        prisma.theologicalTermSession.findMany({
          where: {
            user_id: userId,
            completed_at: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 지난 7일
            }
          }
        })
      ]);

      if (allSessions.length === 0) {
        return {
          total_sessions: 0,
          total_study_time_minutes: 0,
          average_session_length_minutes: 0,
          overall_accuracy: 0,
          best_session_score: 0,
          current_streak: 0,
          favorite_session_type: 'recognition',
          weekly_sessions: 0,
          monthly_improvement: 0
        };
      }

      // 기본 통계 계산
      const totalStudyTime = allSessions.reduce((sum, s) => sum + s.duration_seconds, 0);
      const totalCorrect = allSessions.reduce((sum, s) => sum + s.correct_count, 0);
      const totalQuestions = allSessions.reduce((sum, s) => sum + s.total_count, 0);

      // 세션 타입별 빈도 분석
      const sessionTypeCount = allSessions.reduce((acc, s) => {
        acc[s.session_type] = (acc[s.session_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const favoriteType = Object.entries(sessionTypeCount)
        .sort(([,a], [,b]) => b - a)[0][0] as SessionType;

      // 연속 학습 일수 계산
      const currentStreak = this.calculateStudyStreak(allSessions);

      // 최고 점수 계산
      const bestScore = Math.max(...allSessions.map(s =>
        s.total_count > 0 ? (s.correct_count / s.total_count) * 100 : 0
      ));

      // 월간 개선도 계산 (간단한 버전)
      const monthlyImprovement = this.calculateMonthlyImprovement(allSessions);

      return {
        total_sessions: allSessions.length,
        total_study_time_minutes: Math.round(totalStudyTime / 60),
        average_session_length_minutes: Math.round(totalStudyTime / 60 / allSessions.length),
        overall_accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) / 100 : 0,
        best_session_score: Math.round(bestScore),
        current_streak: currentStreak,
        favorite_session_type: favoriteType,
        weekly_sessions: recentSessions.length,
        monthly_improvement: monthlyImprovement
      };
    } catch (error) {
      throw new Error(`세션 통계 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 학습 경로 추천
   */
  static async getRecommendedLearningPath(userId: string): Promise<LearningPathRecommendation> {
    try {
      const [userStats, recentProgress] = await Promise.all([
        this.getUserSessionStats(userId),
        prisma.theologicalTermProgress.findMany({
          where: { user_id: userId },
          include: { theological_term: true },
          orderBy: { updated_at: 'desc' },
          take: 20
        })
      ]);

      // 약한 영역 식별
      const weakAreas = recentProgress
        .filter(p => p.mastery_level < 2)
        .map(p => p.theological_term.category);

      const focusAreas = [...new Set(weakAreas)].slice(0, 3);

      // 추천 세션 타입 결정
      let recommendedType: SessionType = 'recognition';
      if (userStats.overall_accuracy > 0.7) {
        recommendedType = 'usage';
      } else if (userStats.overall_accuracy > 0.5) {
        recommendedType = 'translation';
      }

      // 추천 용어 선별
      const targetTerms = recentProgress
        .filter(p => p.mastery_level <= 2)
        .slice(0, 10)
        .map(p => p.term_id);

      // 추천 난이도 결정
      const averageMastery = recentProgress.length > 0
        ? recentProgress.reduce((sum, p) => sum + p.mastery_level, 0) / recentProgress.length
        : 0;

      const difficultyLevel = averageMastery < 1 ? 'A1' :
                            averageMastery < 2 ? 'A2' :
                            averageMastery < 3 ? 'B1' : 'B2';

      return {
        recommended_session_type: recommendedType,
        recommended_duration: userStats.average_session_length_minutes || 15,
        target_terms: targetTerms,
        focus_areas: focusAreas,
        difficulty_level: difficultyLevel,
        reasoning: this.generateRecommendationReasoning(userStats, focusAreas, recommendedType)
      };
    } catch (error) {
      throw new Error(`학습 경로 추천 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 세션 기반 보상 계산
   */
  private static async calculateRewards(
    session: PrismaTermSession,
    metrics?: SessionPerformanceMetrics
  ): Promise<SessionReward[]> {
    const rewards: SessionReward[] = [];
    const accuracy = session.total_count > 0 ? session.correct_count / session.total_count : 0;

    // 기본 경험치
    const baseXP = Math.floor(session.correct_count * 10 + session.duration_seconds / 60);
    rewards.push({
      type: 'xp',
      amount: baseXP,
      description: `${session.correct_count}문제 정답으로 ${baseXP}XP 획득`
    });

    // 정확도 보너스
    if (accuracy >= 0.9) {
      rewards.push({
        type: 'badge',
        badge_name: '완벽주의자',
        description: '90% 이상의 정확도로 세션 완료!'
      });
    } else if (accuracy >= 0.8) {
      rewards.push({
        type: 'xp',
        amount: 50,
        description: '높은 정확도 보너스 +50XP'
      });
    }

    // 지속 학습 보상
    if (session.duration_seconds >= 1200) { // 20분 이상
      rewards.push({
        type: 'achievement',
        achievement_name: '집중력 왕',
        description: '20분 이상 집중해서 학습 완료!'
      });
    }

    return rewards;
  }

  /**
   * 업적 확인
   */
  private static async checkAchievements(
    userId: string,
    currentSession: PrismaTermSession
  ): Promise<string[]> {
    const achievements: string[] = [];

    // 첫 세션 완료
    const sessionCount = await prisma.theologicalTermSession.count({
      where: {
        user_id: userId,
        completed_at: { not: null }
      }
    });

    if (sessionCount === 1) {
      achievements.push('첫 걸음을 내디뎠군요! 🎉');
    } else if (sessionCount === 10) {
      achievements.push('꾸준한 학습자 🌟');
    } else if (sessionCount === 50) {
      achievements.push('헝가리어 마스터의 길 👑');
    }

    return achievements;
  }

  /**
   * 연속 학습 일수 계산
   */
  private static calculateStudyStreak(sessions: PrismaTermSession[]): number {
    if (sessions.length === 0) return 0;

    const sortedSessions = sessions
      .filter(s => s.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.completed_at!);
      sessionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff === streak + 1) {
        streak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * 월간 개선도 계산
   */
  private static calculateMonthlyImprovement(sessions: PrismaTermSession[]): number {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recentSessions = sessions.filter(s =>
      s.completed_at && new Date(s.completed_at) >= oneMonthAgo
    );

    const olderSessions = sessions.filter(s =>
      s.completed_at && new Date(s.completed_at) < oneMonthAgo
    );

    if (recentSessions.length === 0 || olderSessions.length === 0) return 0;

    const recentAccuracy = recentSessions.reduce((sum, s) =>
      sum + (s.total_count > 0 ? s.correct_count / s.total_count : 0), 0
    ) / recentSessions.length;

    const olderAccuracy = olderSessions.reduce((sum, s) =>
      sum + (s.total_count > 0 ? s.correct_count / s.total_count : 0), 0
    ) / olderSessions.length;

    return Math.round((recentAccuracy - olderAccuracy) * 100);
  }

  /**
   * 추천 이유 생성
   */
  private static generateRecommendationReasoning(
    stats: SessionStatistics,
    focusAreas: string[],
    recommendedType: SessionType
  ): string {
    let reasoning = '';

    if (stats.overall_accuracy < 0.6) {
      reasoning += '정확도 향상이 필요해서 ';
    } else if (stats.overall_accuracy > 0.8) {
      reasoning += '높은 실력을 유지하고 있어서 ';
    }

    if (focusAreas.length > 0) {
      reasoning += `${focusAreas.join(', ')} 분야의 집중 학습이 필요해서 `;
    }

    reasoning += `${recommendedType} 세션을 추천합니다.`;

    return reasoning;
  }

  /**
   * 세션 목록 조회
   */
  static async getUserSessions(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      session_type?: SessionType;
      completed_only?: boolean;
    } = {}
  ): Promise<PrismaTermSession[]> {
    try {
      const { limit = 20, offset = 0, session_type, completed_only = false } = options;

      const whereClause: Prisma.TheologicalTermSessionWhereInput = {
        user_id: userId
      };

      if (session_type) {
        whereClause.session_type = session_type;
      }

      if (completed_only) {
        whereClause.completed_at = { not: null };
      }

      return await prisma.theologicalTermSession.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
      });
    } catch (error) {
      throw new Error(`세션 목록 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 세션 삭제
   */
  static async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await prisma.theologicalTermSession.delete({
        where: { id: sessionId }
      });
      return true;
    } catch (error) {
      throw new Error(`세션 삭제 실패: ${(error as Error).message}`);
    }
  }
}

export default TheologicalTermSessionModel;