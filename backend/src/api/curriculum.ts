import express, { Request, Response } from 'express';
import { asyncHandler } from '../lib/errorHandler';
import { authenticateToken } from '../lib/auth';
import { PrismaClient } from '@prisma/client';

// 로컬 타입 정의 (shared/types 대체)
export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2'
}

export type LearningGoal = 'sermon_preparation' | 'general_communication' | 'academic' | 'professional';

// API 응답을 위한 간소화된 인터페이스들
interface CurriculumApiResponse {
  id: string;
  startLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  estimatedDuration: number;
  phases: Array<{
    level: CEFRLevel;
    units: number;
    estimatedWeeks: number;
  }>;
  koreanSpecificAdaptations?: any;
  pastoralSpecialization?: any;
  personalization?: any;
}

const prisma = new PrismaClient();

export const curriculumRoutes = express.Router();

/**
 * Curriculum API Routes
 *
 * A1-B2 헝가리어 커리큘럼 관리를 위한 RESTful API
 * 한국인 목회자 특화 커리큘럼, 개인화된 학습 경로 제공
 */

// 개인화된 커리큘럼 생성
curriculumRoutes.post('/personalized', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  const {
    assessmentResults,
    userPreferences = {},
    learningGoals = ['sermon_writing', 'congregation_communication'],
    availableTime = 'moderate',
    urgencyLevel = 'normal'
  } = req.body;

  if (!assessmentResults) {
    return res.status(400).json({
      success: false,
      error: '평가 결과가 필요합니다.'
    });
  }

  try {
    // 간소화된 mock 구현 - 실제로 동작하는 커리큘럼 생성
    console.log(`📚 개인화 커리큘럼 생성 시작: 사용자 ${userId}`);

    const mockCurriculum: CurriculumApiResponse = {
      id: `curriculum_${userId}_${Date.now()}`,
      startLevel: assessmentResults?.finalLevel || CEFRLevel.A1,
      targetLevel: CEFRLevel.B2,
      estimatedDuration: 52,
      phases: [
        { level: CEFRLevel.A1, units: 8, estimatedWeeks: 12 },
        { level: CEFRLevel.A2, units: 10, estimatedWeeks: 14 },
        { level: CEFRLevel.B1, units: 12, estimatedWeeks: 16 },
        { level: CEFRLevel.B2, units: 10, estimatedWeeks: 10 }
      ],
      koreanSpecificAdaptations: {
        emphasizePronunciation: true,
        culturalContextIntegration: true,
        koreanGrammarTransfer: true
      },
      pastoralSpecialization: {
        liturgicalVocabulary: true,
        sermonWritingModules: true,
        theologicalTexts: true
      }
    };

    res.status(200).json({
      success: true,
      message: '개인화된 커리큘럼이 생성되었습니다.',
      data: {
        curriculumId: mockCurriculum.id,
        startLevel: mockCurriculum.startLevel,
        targetLevel: mockCurriculum.targetLevel,
        estimatedDuration: mockCurriculum.estimatedDuration,
        totalLessons: mockCurriculum.phases.reduce((total, phase) =>
          total + phase.units, 0
        ),
        phases: mockCurriculum.phases.map((phase, index) => ({
          phaseId: `phase_${index + 1}`,
          level: phase.level,
          title: `${phase.level} 레벨 과정`,
          description: `${phase.level} 수준의 헝가리어 학습`,
          lessonCount: phase.units,
          estimatedWeeks: phase.estimatedWeeks,
          koreanFocusAreas: ['발음교정', '문법간섭해결'],
          pastoralRelevance: 'high'
        })),
        koreanOptimizations: mockCurriculum.koreanSpecificAdaptations,
        pastoralSpecialization: mockCurriculum.pastoralSpecialization,
        personalizationProfile: {
          learningGoals,
          availableTime,
          urgencyLevel,
          adaptedForUser: userId
        }
      }
    });
  } catch (error) {
    console.error('개인화 커리큘럼 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '커리큘럼 생성 중 오류가 발생했습니다.'
    });
  }
}));

// 레벨별 커리큘럼 조회
curriculumRoutes.get('/level/:level', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { level } = req.params;

  if (!Object.values(CEFRLevel).includes(level as CEFRLevel)) {
    return res.status(400).json({
      success: false,
      error: '유효하지 않은 CEFR 레벨입니다.'
    });
  }

  try {
    // Mock 커리큘럼 데이터 생성
    const mockLevelCurriculum = {
      level: level as CEFRLevel,
      totalUnits: level === 'A1' ? 8 : level === 'A2' ? 10 : level === 'B1' ? 12 : 10,
      estimatedWeeks: level === 'A1' ? 12 : level === 'A2' ? 14 : level === 'B1' ? 16 : 10,
      units: Array.from({ length: level === 'A1' ? 8 : 10 }, (_, i) => ({
        unitId: `${level}_unit_${i + 1}`,
        title: `단원 ${i + 1}`,
        description: `${level} 레벨 ${i + 1}번째 학습 단원`,
        lessons: [`lesson_${i + 1}_1`, `lesson_${i + 1}_2`],
        pastoralScenarios: [`scenario_${i + 1}`]
      }))
    };

    console.log(`📖 ${level} 레벨 커리큘럼 조회 완료`);

    res.status(200).json({
      success: true,
      data: mockLevelCurriculum
    });
  } catch (error) {
    console.error('레벨 커리큘럼 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '커리큘럼 조회 중 오류가 발생했습니다.'
    });
  }
}));

// 학습 경로 조회
curriculumRoutes.get('/learning-path/:curriculumId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { curriculumId } = req.params;

  try {
    // Mock 학습 경로 데이터
    const mockLearningPath = {
      pathId: `path_${curriculumId}`,
      curriculum: curriculumId,
      totalPhases: 4,
      currentPhase: 1,
      phases: [
        {
          phaseNumber: 1,
          level: CEFRLevel.A1,
          title: 'A1 기초 과정',
          lessons: Array.from({ length: 8 }, (_, i) => ({
            lessonId: `lesson_a1_${i + 1}`,
            title: `A1 레슨 ${i + 1}`,
            completed: false,
            estimatedMinutes: 45
          }))
        }
      ]
    };

    console.log(`🛤️ 학습 경로 조회: ${curriculumId}`);

    res.status(200).json({
      success: true,
      data: mockLearningPath
    });
  } catch (error) {
    console.error('학습 경로 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '학습 경로 조회 중 오류가 발생했습니다.'
    });
  }
}));

// 학습 진도 업데이트
curriculumRoutes.post('/progress', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  const {
    curriculumId,
    lessonId,
    progressPercentage,
    completionStatus,
    timeSpent,
    score
  } = req.body;

  if (!curriculumId || !lessonId || typeof progressPercentage !== 'number') {
    return res.status(400).json({
      success: false,
      error: '필수 필드가 누락되었습니다.'
    });
  }

  try {
    // Mock 진도 업데이트
    const progressUpdate = {
      userId,
      curriculumId,
      lessonId,
      progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
      completionStatus: completionStatus || 'in_progress',
      timeSpent: timeSpent || 0,
      score: score || null,
      updatedAt: new Date().toISOString()
    };

    console.log(`📈 학습 진도 업데이트: ${lessonId} (${progressPercentage}%)`);

    res.status(200).json({
      success: true,
      message: '학습 진도가 업데이트되었습니다.',
      data: progressUpdate
    });
  } catch (error) {
    console.error('진도 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '진도 업데이트 중 오류가 발생했습니다.'
    });
  }
}));

// 레슨 콘텐츠 조회
curriculumRoutes.get('/lesson/:lessonId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;

  try {
    // Mock 레슨 콘텐츠
    const mockLesson = {
      lessonId,
      title: '기본 인사말',
      level: CEFRLevel.A1,
      estimatedDuration: 45,
      content: {
        vocabulary: ['Jó napot', 'Köszönöm', 'Viszlát'],
        grammar: ['기본 문장 구조'],
        exercises: [
          { id: 'ex1', type: 'multiple_choice', question: '안녕하세요의 헝가리어는?' }
        ],
        pastoralContext: {
          liturgicalUse: true,
          examples: ['교회에서의 인사', '목회 상담 시작']
        }
      },
      koreanNotes: ['ㅈ, ㄱ 발음 주의', '경어 체계 차이점']
    };

    console.log(`📚 레슨 콘텐츠 조회: ${lessonId}`);

    res.status(200).json({
      success: true,
      data: mockLesson
    });
  } catch (error) {
    console.error('레슨 콘텐츠 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '레슨 조회 중 오류가 발생했습니다.'
    });
  }
}));

// 개인화 설정 업데이트
curriculumRoutes.put('/personalization', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  const {
    curriculumId,
    learningGoals,
    availableTime,
    urgencyLevel,
    koreanFocusAreas,
    pastoralPriorities
  } = req.body;

  try {
    // Mock 개인화 업데이트
    const personalizationUpdate = {
      userId,
      curriculumId,
      learningGoals: learningGoals || [],
      availableTime: availableTime || 'moderate',
      urgencyLevel: urgencyLevel || 'normal',
      koreanFocusAreas: koreanFocusAreas || [],
      pastoralPriorities: pastoralPriorities || [],
      updatedAt: new Date().toISOString()
    };

    console.log(`⚙️ 개인화 설정 업데이트: ${curriculumId}`);

    res.status(200).json({
      success: true,
      message: '개인화 설정이 업데이트되었습니다.',
      data: personalizationUpdate
    });
  } catch (error) {
    console.error('개인화 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '개인화 설정 업데이트 중 오류가 발생했습니다.'
    });
  }
}));

// 학습 추천 조회
curriculumRoutes.get('/recommendations', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  try {
    // Mock 추천 데이터
    const recommendations = {
      nextLessons: [
        { lessonId: 'lesson_a1_3', title: '숫자와 시간', priority: 'high' },
        { lessonId: 'lesson_a1_4', title: '가족 소개', priority: 'medium' }
      ],
      reviewTopics: ['기본 인사말', '자기소개'],
      pastoralRecommendations: ['liturgy_basics', 'prayer_vocabulary'],
      weeklyGoal: {
        lessonsToComplete: 3,
        vocabularyToLearn: 25,
        exercisesToPractice: 10
      }
    };

    console.log(`💡 학습 추천 조회: 사용자 ${userId}`);

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('추천 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '추천 조회 중 오류가 발생했습니다.'
    });
  }
}));

// 학습 통계 조회
curriculumRoutes.get('/statistics', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  try {
    // Mock 통계 데이터
    const statistics = {
      totalLessonsCompleted: 15,
      totalTimeSpent: 750, // 분
      averageScore: 85,
      currentStreak: 5,
      levelProgress: {
        A1: { completed: 8, total: 8 },
        A2: { completed: 3, total: 10 },
        B1: { completed: 0, total: 12 },
        B2: { completed: 0, total: 10 }
      },
      weeklyStats: {
        lessonsThisWeek: 3,
        timeThisWeek: 120,
        goalProgress: 75
      }
    };

    console.log(`📊 학습 통계 조회: 사용자 ${userId}`);

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '통계 조회 중 오류가 발생했습니다.'
    });
  }
}));