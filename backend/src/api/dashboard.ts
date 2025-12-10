/**
 * 대시보드 API
 * 학습 통계, 진행 상황, 최근 활동 등을 제공
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/dashboard/stats
 * 사용자의 전체 학습 통계 조회
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // TODO: 실제로는 인증된 사용자 ID를 사용해야 함
    const userId = 'demo-user-id';

    // 병렬로 여러 통계 데이터 조회
    const [
      totalGrammarLessons,
      completedGrammarLessons,
      totalVocabulary,
      learnedVocabulary,
      recentActivities,
      currentStreak,
      totalStudyTime,
    ] = await Promise.all([
      // 전체 문법 레슨 수
      prisma.grammarLesson.count({ where: { isPublished: true } }),

      // 완료한 문법 레슨 수 (임시 데이터)
      Promise.resolve(12),

      // 전체 어휘 수
      prisma.vocabularyItem.count({ where: { isActive: true } }),

      // 학습한 어휘 수 (임시 데이터)
      Promise.resolve(85),

      // 최근 활동 (임시 데이터)
      Promise.resolve([]),

      // 연속 학습일 (임시 데이터)
      Promise.resolve(12),

      // 총 학습 시간 (분 단위, 임시 데이터)
      Promise.resolve(1850),
    ]);

    // 현재 레벨 정보 (임시 데이터)
    const currentLevel = {
      level: 'A2',
      progress: 75,
      nextLevel: 'B1',
    };

    // 오늘의 목표 진행 상황 (임시 데이터)
    const dailyGoals = {
      lessonsCompleted: 8,
      lessonsTarget: 10,
      studyMinutes: 180,
      studyMinutesTarget: 200,
      vocabularyReviewed: 25,
      vocabularyReviewTarget: 30,
    };

    // 주간 학습 패턴 (지난 7일, 임시 데이터)
    const weeklyActivity = [
      { date: '2025-11-29', minutes: 45, lessonsCompleted: 3 },
      { date: '2025-11-30', minutes: 60, lessonsCompleted: 4 },
      { date: '2025-12-01', minutes: 30, lessonsCompleted: 2 },
      { date: '2025-12-02', minutes: 75, lessonsCompleted: 5 },
      { date: '2025-12-03', minutes: 50, lessonsCompleted: 3 },
      { date: '2025-12-04', minutes: 90, lessonsCompleted: 6 },
      { date: '2025-12-05', minutes: 180, lessonsCompleted: 8 },
    ];

    // 영역별 진도 (임시 데이터)
    const progressByArea = {
      grammar: { completed: 12, total: totalGrammarLessons, percentage: Math.round((12 / totalGrammarLessons) * 100) },
      vocabulary: { completed: 85, total: totalVocabulary, percentage: Math.round((85 / totalVocabulary) * 100) },
      writing: { completed: 5, total: 20, percentage: 25 },
      exercises: { completed: 18, total: 50, percentage: 36 },
    };

    const stats = {
      currentLevel,
      dailyGoals,
      streak: currentStreak,
      totalStudyTime,
      weeklyActivity,
      progressByArea,
      totalGrammarLessons,
      completedGrammarLessons,
      totalVocabulary,
      learnedVocabulary,
    };

    console.log('📊 대시보드 통계 조회 성공');
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('❌ 대시보드 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/dashboard/recent-activities
 * 최근 활동 내역 조회
 */
router.get('/recent-activities', async (req: Request, res: Response) => {
  try {
    // TODO: 실제 Progress 데이터 조회
    // 임시 데이터
    const activities = [
      {
        id: '1',
        type: 'grammar',
        title: '인칭대명사와 동사 van 활용',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        score: 95,
      },
      {
        id: '2',
        type: 'vocabulary',
        title: '일상 어휘 복습',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        score: 88,
      },
      {
        id: '3',
        type: 'writing',
        title: '자기소개 작문',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in_progress',
        score: null,
      },
      {
        id: '4',
        type: 'grammar',
        title: '명사의 복수형',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        score: 92,
      },
      {
        id: '5',
        type: 'assessment',
        title: 'A2 레벨 중간 평가',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        score: 85,
      },
    ];

    console.log('📝 최근 활동 조회 성공:', activities.length, '개');
    res.json({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    console.error('❌ 최근 활동 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/dashboard/recommendations
 * AI 기반 학습 추천
 */
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    // 임시 추천 데이터
    const recommendations = {
      nextLesson: {
        id: 'a2-lesson-6',
        title: '소유격 접미사',
        level: 'A2',
        reason: '현재 학습 경로의 다음 단계입니다',
        estimatedDuration: 25,
      },
      reviewVocabulary: {
        count: 15,
        reason: '복습이 필요한 어휘가 있습니다',
        urgency: 'medium',
      },
      practiceWriting: {
        topic: '일상생활 묘사',
        reason: '작문 연습이 부족합니다',
        difficulty: 'A2',
      },
      aiAdvice: '훌륭합니다! 꾸준히 학습하고 계시네요. 오늘은 소유격 접미사를 학습해보시는 것을 추천드립니다. 헝가리어의 핵심 문법 중 하나입니다.',
      weakAreas: [
        { area: '격변화', score: 65, suggestion: '격변화 집중 연습 추천' },
        { area: '동사 활용', score: 72, suggestion: '불규칙 동사 복습 필요' },
      ],
    };

    console.log('🤖 AI 추천 조회 성공');
    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error: any) {
    console.error('❌ AI 추천 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/dashboard/achievements
 * 업적 및 배지 조회
 */
router.get('/achievements', async (req: Request, res: Response) => {
  try {
    // 임시 업적 데이터
    const achievements = {
      badges: [
        {
          id: 'first-lesson',
          name: '첫 걸음',
          description: '첫 번째 레슨 완료',
          icon: '🎯',
          unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'week-streak',
          name: '일주일 연속',
          description: '7일 연속 학습',
          icon: '🔥',
          unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'vocab-master-50',
          name: '어휘 마스터 (50)',
          description: '50개 어휘 학습',
          icon: '📚',
          unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'grammar-a1-complete',
          name: 'A1 문법 마스터',
          description: 'A1 문법 모두 완료',
          icon: '⭐',
          unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      milestones: [
        { name: 'A2 레벨 달성', progress: 75, target: 100, icon: '🏆' },
        { name: '100개 어휘 학습', progress: 85, target: 100, icon: '📖' },
        { name: '20시간 학습', progress: 92, target: 100, icon: '⏰' },
      ],
      hungarianPlaces: {
        unlocked: ['부다페스트 국회의사당', '세체니 온천', '부다성'],
        locked: ['어부의 요새', '영웅광장', '마차시 교회'],
        progress: 50,
      },
    };

    console.log('🏆 업적 조회 성공');
    res.json({
      success: true,
      data: achievements,
    });
  } catch (error: any) {
    console.error('❌ 업적 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
