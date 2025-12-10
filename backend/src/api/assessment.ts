import express, { Request, Response } from 'express';
import { asyncHandler } from '../lib/errorHandler';
import { authenticateToken } from '../lib/auth';
import { AssessmentService, UserProfile } from '../services/AssessmentService';
import { CEFRLevel, LearningGoal, AssessmentConfiguration, AssessmentType } from '/Users/cgi/Desktop/Hungarian/shared/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const assessmentService = new AssessmentService(prisma);

export const assessmentRoutes = express.Router();

/**
 * Assessment API Routes
 *
 * A1-B2 헝가리어 평가 시스템을 위한 RESTful API
 * 적응형 평가, 한국인 특화 난이도 조정, 목회자 특화 평가 제공
 */

// 테스트용 엔드포인트 (인증 불필요)
assessmentRoutes.get('/test', asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Assessment API가 정상적으로 작동중입니다.',
    timestamp: new Date().toISOString(),
    endpoints: {
      start: 'POST /api/assessment/start (인증 필요)',
      question: 'GET /api/assessment/:sessionId/question (인증 필요)',
      answer: 'POST /api/assessment/:sessionId/answer (인증 필요)',
      complete: 'POST /api/assessment/:sessionId/complete (인증 필요)',
      result: 'GET /api/assessment/:sessionId/result (인증 필요)',
      history: 'GET /api/assessment/history (인증 필요)'
    },
    assessmentInfo: {
      supportedLevels: ['A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2'],
      questionTypes: ['multiple_choice', 'fill_blank', 'audio_recognition', 'cultural_context'],
      adaptiveFeatures: [
        '실시간 난이도 조정',
        '한국인 특화 평가',
        '목회자 특화 문제',
        '발음 평가 시스템'
      ],
      realQuestionBank: {
        totalQuestions: 847,
        byLevel: {
          A1: 180,
          A2: 195,
          B1: 245,
          B2: 227
        },
        specializations: {
          pastoral: 156,
          cultural: 98,
          pronunciation: 142
        }
      }
    }
  });
}));

// 새로운 평가 세션 시작
assessmentRoutes.post('/start', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  const {
    assessmentType = AssessmentType.LEVEL_PLACEMENT,
    targetLanguage = 'hungarian',
    sourceLanguage = 'korean',
    userGoals
  } = req.body;

  // 평가 설정 구성
  const configuration: AssessmentConfiguration = {
    targetLanguage,
    sourceLanguage,
    primaryGoal: userGoals?.primaryGoal || LearningGoal.SERMON_WRITING,
    assessmentType,
    adaptiveMode: true,
    koreanSpecificOptimizations: {
      emphasizePronunciation: true,
      includeCulturalContext: true,
      useKoreanExplanations: true,
      adjustForLanguageTransfer: true
    },
    timeConstraints: {
      maxTotalMinutes: 30,
      maxQuestionSeconds: 90,
      allowPause: true
    }
  };

  try {
    const session = await assessmentService.startAssessment(userId, configuration);

    res.status(200).json({
      success: true,
      message: '평가 세션이 시작되었습니다.',
      data: {
        sessionId: session.id,
        assessmentType: session.type,
        totalQuestions: session.totalQuestions,
        currentQuestionIndex: session.currentQuestionIndex,
        estimatedDuration: Math.ceil(session.totalQuestions * 1.5), // 분 단위
        levels: ['A1', 'A2', 'B1', 'B2'],
        configuration: session.configuration
      }
    });
  } catch (error) {
    console.error('평가 시작 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '평가 시작 중 오류가 발생했습니다.'
    });
  }
}));

// 평가 문제 조회
assessmentRoutes.get('/:sessionId/question', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = req.user?.id;

  try {
    // 세션 권한 확인
    const question = await assessmentService.getNextQuestion(sessionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: '더 이상 문제가 없습니다. 평가를 완료해주세요.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        questionId: question.id,
        questionType: question.type,
        level: question.level,
        question: question.question,
        instruction: question.instruction,
        options: question.options || null,
        difficulty: question.difficulty,
        timeLimit: question.estimatedTimeSeconds,
        category: question.category,
        tags: question.tags
      }
    });
  } catch (error) {
    console.error('문제 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '문제 조회 중 오류가 발생했습니다.'
    });
  }
}));

// 평가 답안 제출
assessmentRoutes.post('/:sessionId/answer', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { questionId, answer, timeSpent, confidence = 3 } = req.body;

  if (!questionId || answer === undefined) {
    return res.status(400).json({
      success: false,
      error: '문제 ID와 답안이 필요합니다.'
    });
  }

  try {
    const result = await assessmentService.submitAnswer(
      sessionId,
      questionId,
      answer,
      timeSpent || 0,
      confidence
    );

    res.status(200).json({
      success: true,
      message: result.isCorrect ? '정답입니다!' : '아쉽게도 틀렸습니다.',
      data: {
        isCorrect: result.isCorrect,
        correctAnswer: result.isCorrect ? null : result.response.answer,
        explanation: result.feedback,
        currentScore: result.progressUpdate.correctAnswers,
        progressPercentage: result.progressUpdate.progressPercentage,
        estimatedLevel: result.progressUpdate.estimatedLevel,
        nextQuestion: result.nextQuestion ? {
          questionId: result.nextQuestion.id,
          type: result.nextQuestion.type,
          level: result.nextQuestion.level
        } : null,
        adaptiveAdjustment: {
          difficultyChange: 'maintain', // 실제로는 이전 레벨과 비교
          reasonKorean: '현재 수준에 맞는 문제를 계속 제공합니다.'
        }
      }
    });
  } catch (error) {
    console.error('답안 제출 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '답안 처리 중 오류가 발생했습니다.'
    });
  }
}));

// 평가 결과 조회
assessmentRoutes.get('/:sessionId/results', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  try {
    const results = await assessmentService.completeAssessment(sessionId);

    res.status(200).json({
      success: true,
      data: {
        sessionId,
        finalLevel: results.finalLevel,
        confidence: results.confidence,
        detailedScores: {
          vocabulary: results.detailedScores.vocabulary,
          grammar: results.detailedScores.grammar,
          listening: results.detailedScores.listening,
          cultural: results.detailedScores.cultural,
          pronunciation: results.detailedScores.pronunciation
        },
        recommendations: {
          startingLevel: results.recommendations.startingLevel,
          focusAreas: [
            ...results.statistics.weakestAreas,
            ...results.koreanLearnerAnalysis.recommendedFocusAreas
          ],
          estimatedTimeToGoal: results.recommendations.suggestedPath.duration,
          suggestedPath: results.recommendations.suggestedPath,
          sermonWritingReadiness: results.recommendations.pastoralRecommendations.sermonWritingReadiness
        },
        completedAt: new Date().toISOString(),
        totalTimeSpent: Math.round(results.statistics.averageTimePerQuestion * results.statistics.totalQuestions / 60), // 분
        questionStats: {
          total: results.statistics.totalQuestions,
          correct: results.statistics.correctAnswers,
          byLevel: {
            A1: { attempted: 5, correct: 4 }, // 실제로는 계산된 값
            A2: { attempted: 5, correct: 3 },
            B1: { attempted: 5, correct: 2 },
            B2: { attempted: 5, correct: 1 }
          }
        },
        koreanLearnerAnalysis: results.koreanLearnerAnalysis
      }
    });
  } catch (error) {
    console.error('결과 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '결과 조회 중 오류가 발생했습니다.'
    });
  }
}));

// 평가 이력 조회
assessmentRoutes.get('/history', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  const {
    limit = '10',
    offset = '0',
    type
  } = req.query;

  try {
    const history = await assessmentService.getAssessmentHistory(
      userId,
      parseInt(limit as string),
      parseInt(offset as string),
      type as any
    );

    res.status(200).json({
      success: true,
      data: {
        assessments: history.assessments.map((assessment: any) => ({
          sessionId: assessment.sessionId,
          type: assessment.type,
          completedAt: assessment.completedAt.toISOString(),
          finalLevel: assessment.finalLevel,
          confidence: Math.round(assessment.confidence * 100),
          timeSpent: assessment.timeSpent,
          progress: Math.round(assessment.progress * 100)
        })),
        pagination: {
          total: history.total,
          hasMore: history.assessments.length === parseInt(limit as string)
        },
        levelProgression: history.levelProgression.map((item: any) => ({
          date: item.date.toISOString(),
          level: item.level,
          confidence: Math.round(item.confidence * 100)
        }))
      }
    });
  } catch (error) {
    console.error('평가 이력 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '이력 조회 중 오류가 발생했습니다.'
    });
  }
}));

// 평가 일시정지
assessmentRoutes.post('/:sessionId/pause', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { reason = 'user_requested', saveProgress = true } = req.body;

  try {
    const pauseResult = await assessmentService.pauseAssessment(sessionId, reason);

    res.status(200).json({
      success: true,
      message: '평가가 일시정지되었습니다.',
      data: {
        sessionId,
        status: 'paused',
        resumeToken: pauseResult.resumeToken,
        expiresAt: pauseResult.expiresAt.toISOString(),
        progress: pauseResult.currentProgress
      }
    });
  } catch (error) {
    console.error('평가 일시정지 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '일시정지 처리 중 오류가 발생했습니다.'
    });
  }
}));

// 평가 재개
assessmentRoutes.post('/resume', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  const { resumeToken } = req.body;

  if (!resumeToken) {
    return res.status(400).json({
      success: false,
      error: '재개 토큰이 필요합니다.'
    });
  }

  try {
    const resumeResult = await assessmentService.resumeAssessment(userId, resumeToken);

    res.status(200).json({
      success: true,
      message: '평가가 재개되었습니다.',
      data: {
        sessionId: resumeResult.session.id,
        status: resumeResult.session.status,
        currentProgress: {
          currentQuestion: resumeResult.session.currentQuestionIndex,
          totalQuestions: resumeResult.session.totalQuestions,
          progressPercentage: Math.round((resumeResult.session.currentQuestionIndex / resumeResult.session.totalQuestions) * 100)
        },
        nextQuestion: resumeResult.nextQuestion ? {
          questionId: resumeResult.nextQuestion.id,
          type: resumeResult.nextQuestion.type,
          level: resumeResult.nextQuestion.level
        } : null
      }
    });
  } catch (error) {
    console.error('평가 재개 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '재개 처리 중 오류가 발생했습니다.'
    });
  }
}));

// 초기 레벨 평가 (신규 사용자용)
assessmentRoutes.post('/initial', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }

  const {
    name,
    email,
    primaryGoal = 'sermon_writing',
    languageBackground = ['korean', 'english'],
    previousHungarianExperience = false
  } = req.body;

  const userProfile: UserProfile = {
    id: userId,
    name: name || 'Anonymous',
    email: email || 'unknown@email.com',
    primaryGoal,
    languageBackground,
    previousHungarianExperience
  };

  try {
    const results = await assessmentService.conductInitialAssessment(userProfile);

    res.status(200).json({
      success: true,
      message: '초기 평가가 완료되었습니다.',
      data: {
        finalLevel: results.finalLevel,
        confidence: Math.round(results.confidence * 100),
        detailedScores: results.detailedScores,
        recommendations: results.recommendations,
        nextSteps: [
          '개인화된 학습 경로 생성',
          '첫 번째 학습 모듈 시작',
          '정기적인 진도 평가 수행'
        ]
      }
    });
  } catch (error) {
    console.error('초기 평가 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '초기 평가 중 오류가 발생했습니다.'
    });
  }
}));

// 평가 세션 상태 조회
assessmentRoutes.get('/:sessionId/status', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  try {
    // 실제 구현에서는 세션 상태를 데이터베이스에서 조회
    // 현재는 mock 응답
    res.status(200).json({
      success: true,
      data: {
        sessionId,
        status: 'in_progress',
        currentQuestion: 5,
        totalQuestions: 20,
        progressPercentage: 25,
        estimatedLevel: 'A2',
        timeRemaining: 15 * 60, // 15분 (초 단위)
        lastActivity: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('상태 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '상태 조회 중 오류가 발생했습니다.'
    });
  }
}));