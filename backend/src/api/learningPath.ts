import express, { Request, Response } from 'express';
import { asyncHandler } from '../lib/errorHandler';
import { authenticateToken } from '../lib/auth';
// import { LearningPathService, KoreanSpecificLearningPath } from '../services/LearningPathService';
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

export interface UserProfile {
  id: string;
  primaryGoal: LearningGoal;
  previousHungarianExperience?: boolean;
}

export interface AssessmentResult {
  finalLevel: CEFRLevel;
  detailedScores: { [key: string]: number };
}

const prisma = new PrismaClient();
// LearningPathService 비활성화 (shared/types 의존성 문제)
// const learningPathService = new LearningPathService(prisma);

export const learningPathRoutes = express.Router();

/**
 * 학습 경로 API Routes
 *
 * 한국인 목회자를 위한 헝가리어 학습 경로 생성 및 관리
 * 개인화된 커리큘럼과 적응형 학습 시스템 제공
 */

// 테스트용 엔드포인트 (인증 불필요)
learningPathRoutes.get('/test', asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Learning Path API가 정상적으로 작동중입니다.',
    timestamp: new Date().toISOString(),
    endpoints: {
      create: 'POST /api/learning-path/create (인증 필요)',
      list: 'GET /api/learning-path/list (인증 필요)',
      detail: 'GET /api/learning-path/:pathId (인증 필요)',
      updateProgress: 'PATCH /api/learning-path/:pathId/progress (인증 필요)',
      customize: 'PATCH /api/learning-path/:pathId/customize (인증 필요)',
      analytics: 'GET /api/learning-path/:pathId/analytics (인증 필요)',
      delete: 'DELETE /api/learning-path/:pathId (인증 필요)'
    },
    serviceInfo: {
      koreanSpecificFeatures: [
        '한국어-헝가리어 언어 간섭 분석',
        '목회자 특화 커리큘럼',
        '설교문 작성 특화 과정',
        '한국 교회 문화 적응 프로그램'
      ],
      adaptiveFeatures: [
        '개인별 학습 속도 조절',
        '실시간 난이도 조정',
        '발음 교정 시스템',
        '문화적 컨텍스트 학습'
      ]
    }
  });
}));

// 새로운 학습 경로 생성
learningPathRoutes.post('/create', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  const {
    userProfile,
    assessmentResult
  } = req.body;

  // 입력 검증
  if (!userProfile || !assessmentResult) {
    return res.status(400).json({
      success: false,
      error: '사용자 프로필과 평가 결과가 필요합니다.'
    });
  }

  try {
    // LearningPathService 비활성화 - mock 응답 반환
    // const learningPath = await learningPathService.generateKoreanSpecificPath(
    //   userProfile,
    //   assessmentResult
    // );

    res.status(201).json({
      success: true,
      message: '한국인 특화 학습 경로가 생성되었습니다. (Mock 응답)',
      data: {
        pathId: `path-${Date.now()}`,
        name: '한국인 목회자를 위한 헝가리어 학습 경로',
        description: '개인화된 학습 커리큘럼',
        currentLevel: 'A1',
        targetLevel: 'B2',
        estimatedDuration: 180,
        totalLessons: 45,
        specializations: {
          sermonWritingPhases: 4,
          liturgicalItems: 20,
          biblicalConcepts: 50,
          culturalAspects: 15
        },
        interferenceAnalysis: {
          severity: 'medium',
          mainChallenges: {
            phonological: 5,
            grammatical: 4,
            lexical: 3,
            cultural: 4
          }
        },
        nextSteps: [
          '첫 번째 레슨 시작하기',
          '발음 기초 연습하기',
          '기본 종교 어휘 학습하기',
          '학습 일정 설정하기'
        ]
      }
    });
  } catch (error) {
    console.error('학습 경로 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '학습 경로 생성 중 오류가 발생했습니다.'
    });
  }
}));

// 학습 경로 목록 조회
learningPathRoutes.get('/list', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  const {
    page = '1',
    limit = '10',
    status = 'all'
  } = req.query;

  try {
    // 실제로는 데이터베이스에서 조회
    // 현재는 목적 응답
    const mockPaths = [
      {
        id: 'path-1',
        name: '김목사님의 헝가리어 목회 과정',
        currentLevel: 'A2',
        targetLevel: 'B2',
        progress: 25,
        estimatedDuration: 280,
        lastAccessed: new Date().toISOString(),
        status: 'active'
      },
      {
        id: 'path-2',
        name: '설교문 작성 집중 과정',
        currentLevel: 'B1',
        targetLevel: 'B2',
        progress: 60,
        estimatedDuration: 120,
        lastAccessed: new Date(Date.now() - 86400000).toISOString(),
        status: 'active'
      }
    ];

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedPaths = mockPaths.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: {
        paths: paginatedPaths,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(mockPaths.length / limitNum),
          totalItems: mockPaths.length,
          hasNext: endIndex < mockPaths.length,
          hasPrevious: pageNum > 1
        },
        summary: {
          totalPaths: mockPaths.length,
          activePaths: mockPaths.filter(p => p.status === 'active').length,
          averageProgress: Math.round(mockPaths.reduce((sum, p) => sum + p.progress, 0) / mockPaths.length)
        }
      }
    });
  } catch (error) {
    console.error('학습 경로 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '학습 경로 목록 조회 중 오류가 발생했습니다.'
    });
  }
}));

// 특정 학습 경로 상세 조회
learningPathRoutes.get('/:pathId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { pathId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  try {
    // 실제로는 데이터베이스에서 조회
    // 현재는 목적 응답
    const mockDetailedPath = {
      id: pathId,
      name: '김목사님의 헝가리어 목회 과정',
      description: 'A2부터 시작하는 한국인 목회자 특화 헝가리어 학습 과정',
      currentLevel: 'A2',
      targetLevel: 'B2',
      estimatedDuration: 280,
      progress: 25,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), // 30일 전
      updatedAt: new Date().toISOString(),

      // 레슨 정보
      lessons: {
        total: 45,
        completed: 11,
        current: {
          id: 'lesson-12',
          title: '격변화 기초 1: 주격과 목적격',
          type: 'grammar',
          difficulty: 'A2',
          estimatedTime: 45,
          progress: 30
        },
        upcoming: [
          {
            id: 'lesson-13',
            title: '격변화 기초 2: 소유격과 여격',
            type: 'grammar',
            difficulty: 'A2'
          },
          {
            id: 'lesson-14',
            title: '종교 어휘 확장: 예배 용어',
            type: 'vocabulary',
            difficulty: 'A2'
          }
        ]
      },

      // 목회자 특화 진도
      pastoralProgress: {
        sermonWriting: {
          currentPhase: 'foundation',
          phaseProgress: 60,
          completedAssignments: 3,
          totalAssignments: 8,
          nextMilestone: {
            title: '첫 번째 간증 작성',
            dueDate: new Date(Date.now() + 14 * 86400000).toISOString(), // 2주 후
            progress: 40
          }
        },
        liturgicalLanguage: {
          learnedPrayers: 2,
          totalPrayers: 5,
          learnedHymns: 1,
          totalHymns: 8,
          recentlyMastered: ['주기도문', '복음성가 1편']
        },
        biblicalVocabulary: {
          masteredTerms: 45,
          totalTerms: 200,
          categories: [
            { name: '핵심 신학 용어', progress: 70 },
            { name: '예배 관련 용어', progress: 55 },
            { name: '목회 실무 용어', progress: 30 }
          ]
        }
      },

      // 언어 간섭 개선 현황
      interferenceProgress: {
        phonological: {
          initialDifficulties: 5,
          currentDifficulties: 3,
          improvementRate: 40,
          recentImprovements: ['ü 발음', 'gy 발음']
        },
        grammatical: {
          initialChallenges: 8,
          currentChallenges: 6,
          masteredConcepts: ['기본 어순', '인칭 대명사'],
          strugglingWith: ['격변화', '동사 활용']
        },
        cultural: {
          adaptationScore: 65,
          recentLearning: [
            '헝가리 교회 예배 순서',
            '종교적 인사법',
            '교회 내 호칭'
          ]
        }
      },

      // 학습 통계
      statistics: {
        totalStudyTime: 2340, // 분
        averageSessionLength: 52, // 분
        studyStreak: 12, // 일
        weeklyGoal: 8, // 시간
        weeklyProgress: 6.5, // 시간
        strengthAreas: ['어휘 학습', '문화 이해'],
        improvementNeeded: ['발음', '격변화']
      },

      // 다음 단계 추천
      recommendations: {
        immediate: [
          '격변화 집중 연습 (주 3회, 30분씩)',
          '헝가리 교회 예배 동영상 시청',
          '발음 교정 앱 사용 (일 15분)'
        ],
        shortTerm: [
          '현지 헝가리어 교회 예배 참석',
          '간단한 신앙 간증문 작성 연습',
          '헝가리 기독교 문화 서적 읽기'
        ],
        longTerm: [
          'B1 레벨 달성 후 설교문 작성 시작',
          '헝가리 신학 서적 읽기 도전',
          '현지 목회자와 교류 프로그램 참여'
        ]
      }
    };

    res.status(200).json({
      success: true,
      data: mockDetailedPath
    });
  } catch (error) {
    console.error('학습 경로 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '학습 경로 조회 중 오류가 발생했습니다.'
    });
  }
}));

// 학습 경로 진도 업데이트
learningPathRoutes.patch('/:pathId/progress', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { pathId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  const {
    lessonId,
    progress,
    completedAt,
    timeSpent,
    notes
  } = req.body;

  if (!lessonId || progress === undefined) {
    return res.status(400).json({
      success: false,
      error: '레슨 ID와 진도 정보가 필요합니다.'
    });
  }

  try {
    // 실제로는 데이터베이스에서 업데이트
    // 현재는 목적 응답
    const updateResult = {
      pathId,
      lessonId,
      previousProgress: 30,
      newProgress: progress,
      overallPathProgress: Math.min(progress, 100),
      achievements: [] as string[]
    };

    // 성취 확인
    if (progress === 100 && updateResult.previousProgress < 100) {
      updateResult.achievements.push('레슨 완료');
    }

    if (updateResult.overallPathProgress >= 25 && updateResult.overallPathProgress < 30) {
      updateResult.achievements.push('25% 달성 배지');
    }

    res.status(200).json({
      success: true,
      message: '학습 진도가 업데이트되었습니다.',
      data: {
        ...updateResult,
        nextRecommendation: progress >= 80 ? '다음 레슨 준비됨' : '현재 레슨 계속 학습',
        studyTip: '꾸준한 학습이 가장 중요합니다. 매일 조금씩이라도 계속하세요!'
      }
    });
  } catch (error) {
    console.error('진도 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '진도 업데이트 중 오류가 발생했습니다.'
    });
  }
}));

// 학습 경로 커스터마이징
learningPathRoutes.patch('/:pathId/customize', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { pathId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  const {
    studySchedule,
    preferences,
    goals,
    focusAreas
  } = req.body;

  try {
    // 실제로는 학습 경로 개인화 설정 업데이트
    // 현재는 목적 응답
    const customizationResult = {
      pathId,
      updatedSettings: {
        studySchedule: studySchedule || {
          weeklyHours: 10,
          preferredTimes: ['저녁'],
          intensity: 'medium'
        },
        preferences: preferences || {
          focusOnPronunciation: true,
          emphasizeSermonWriting: true,
          culturalContexts: true
        },
        adaptedContent: {
          addedLessons: 3,
          modifiedDifficulty: 'adjusted to user level',
          specializedModules: ['발음 집중', '설교문 작성 기초']
        }
      },
      estimatedImpact: {
        timeToCompletion: 'reduced by 2 weeks',
        difficultyAdjustment: 'optimized for current level',
        additionalSupport: 'pronunciation coaching added'
      }
    };

    res.status(200).json({
      success: true,
      message: '학습 경로가 성공적으로 커스터마이징되었습니다.',
      data: customizationResult
    });
  } catch (error) {
    console.error('학습 경로 커스터마이징 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '학습 경로 커스터마이징 중 오류가 발생했습니다.'
    });
  }
}));

// 학습 경로 통계 조회
learningPathRoutes.get('/:pathId/analytics', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { pathId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  const {
    period = '30', // 일 단위
    metrics = 'all'
  } = req.query;

  try {
    // 실제로는 학습 분석 데이터 조회
    // 현재는 목적 응답
    const analytics = {
      pathId,
      period: `${period}일`,
      generatedAt: new Date().toISOString(),

      overview: {
        totalStudyTime: 2340, // 분
        averageDailyTime: 78, // 분
        completionRate: 25, // %
        consistencyScore: 85, // %
        difficultyProgression: 'appropriate'
      },

      performanceMetrics: {
        vocabularyRetention: 78,
        grammarAccuracy: 65,
        pronunciationImprovement: 40,
        culturalAdaptation: 55,
        sermonWritingReadiness: 30
      },

      learningPattern: {
        peakPerformanceHours: ['19:00-21:00', '09:00-11:00'],
        mostEffectiveLessonTypes: ['vocabulary', 'cultural'],
        strugglingAreas: ['pronunciation', 'grammar'],
        preferredSessionLength: '45-60분'
      },

      interferenceReduction: {
        phonological: {
          initialScore: 30,
          currentScore: 50,
          improvement: '+20점',
          trend: 'improving'
        },
        grammatical: {
          initialScore: 25,
          currentScore: 40,
          improvement: '+15점',
          trend: 'steady progress'
        },
        cultural: {
          initialScore: 10,
          currentScore: 45,
          improvement: '+35점',
          trend: 'rapid improvement'
        }
      },

      milestoneProgress: {
        nextMilestone: '첫 번째 간증 작성',
        daysUntilDue: 14,
        preparedness: 65,
        recommendedActions: [
          '어휘 복습 강화',
          '문장 구성 연습',
          '발음 연습 증대'
        ]
      },

      predictions: {
        targetLevelAchievement: {
          level: 'B2',
          estimatedDate: new Date(Date.now() + 200 * 86400000).toISOString(),
          confidence: 78
        },
        sermonWritingReadiness: {
          estimatedDate: new Date(Date.now() + 120 * 86400000).toISOString(),
          confidence: 65
        }
      },

      recommendations: {
        immediate: [
          '발음 연습 시간 증대 (주 3회 → 5회)',
          '격변화 집중 드릴 수행',
          '헝가리 교회 영상 시청 (주 2회)'
        ],
        strategic: [
          '스터디 그룹 참여 고려',
          '현지 언어 교환 파트너 찾기',
          '헝가리 기독교 문헌 읽기 시작'
        ]
      }
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('학습 분석 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '학습 분석 조회 중 오류가 발생했습니다.'
    });
  }
}));

// 학습 경로 삭제
learningPathRoutes.delete('/:pathId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { pathId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  const { confirm = false } = req.body;

  if (!confirm) {
    return res.status(400).json({
      success: false,
      error: '삭제 확인이 필요합니다. confirm: true를 포함해주세요.'
    });
  }

  try {
    // 실제로는 데이터베이스에서 삭제 (소프트 삭제 권장)
    // 현재는 목적 응답
    const deletionResult = {
      pathId,
      deletedAt: new Date().toISOString(),
      backupCreated: true,
      recoveryPeriod: '30일',
      impactedData: [
        '학습 진도 기록',
        '개인화 설정',
        '통계 데이터'
      ]
    };

    res.status(200).json({
      success: true,
      message: '학습 경로가 성공적으로 삭제되었습니다.',
      data: deletionResult
    });
  } catch (error) {
    console.error('학습 경로 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '학습 경로 삭제 중 오류가 발생했습니다.'
    });
  }
}));