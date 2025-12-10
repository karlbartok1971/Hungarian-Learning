import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import TheologicalTermModel from '../models/TheologicalTerm';
import TheologicalTermProgressModel from '../models/TheologicalTermProgress';
import TheologicalTermSessionModel from '../models/TheologicalTermSession';

/**
 * 신학 용어 관리 API 엔드포인트
 * 헝가리어-한국어 신학 용어 학습 및 관리 기능
 */

const theologicalTermsRoutes = Router();

// 요청 검증 스키마
const SearchTermsSchema = z.object({
  query: z.string().optional(),
  category: z.array(z.string()).optional(),
  difficulty_level: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sort: z.enum(['relevance', 'alphabetical', 'frequency', 'difficulty']).default('relevance')
});

const CreateProgressSchema = z.object({
  term_id: z.string(),
  correct: z.boolean(),
  response_time_ms: z.number().positive(),
  difficulty_perceived: z.number().min(1).max(5),
  context: z.enum(['recognition', 'translation', 'usage', 'writing'])
});

const CreateSessionSchema = z.object({
  session_type: z.enum(['recognition', 'translation', 'usage', 'quiz', 'writing', 'listening']),
  target_level: z.string().optional(),
  target_categories: z.array(z.string()).optional(),
  planned_duration_minutes: z.number().positive().optional()
});

/**
 * 신학 용어 검색
 * GET /api/theological-terms/search
 */
theologicalTermsRoutes.get('/search', asyncHandler(async (req: Request, res: Response) => {
  const validation = SearchTermsSchema.safeParse(req.query);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid search parameters',
      details: validation.error.errors
    });
  }

  const { query, category, difficulty_level, limit, offset, sort } = validation.data;

  try {
    const filters = {
      search_term: query,
      category: category as any,
      difficulty_level: difficulty_level as any
    };

    const results = await TheologicalTermModel.search(filters, {
      limit,
      offset,
      sort
    });

    res.json({
      success: true,
      data: {
        terms: results.terms.map(term => ({
          ...term,
          // JSON 필드들을 파싱하여 반환
          usage_examples: JSON.parse(term.usage_examples || '[]'),
          related_terms: JSON.parse(term.related_terms || '[]'),
          synonyms: JSON.parse(term.synonyms || '[]'),
          antonyms: JSON.parse(term.antonyms || '[]'),
          example_sentences: JSON.parse(term.example_sentences || '[]'),
          biblical_references: JSON.parse(term.biblical_references || '[]'),
          alternative_forms: JSON.parse(term.alternative_forms || '[]'),
          tags: JSON.parse(term.tags || '[]'),
          denominational_differences: JSON.parse(term.denominational_differences || '{}')
        })),
        pagination: {
          total_count: results.total_count,
          limit,
          offset,
          has_more: results.total_count > offset + limit
        },
        statistics: {
          categories_found: results.categories_found,
          difficulty_distribution: results.difficulty_distribution
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: (error as Error).message
    });
  }
}));

/**
 * 용어 상세 조회
 * GET /api/theological-terms/:id
 */
theologicalTermsRoutes.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const term = await TheologicalTermModel.findById(id);

    if (!term) {
      return res.status(404).json({
        success: false,
        error: 'Term not found'
      });
    }

    // 관련 용어 추천
    const recommendations = await TheologicalTermModel.getRecommendedTerms(id, undefined, 5);

    res.json({
      success: true,
      data: {
        term: {
          ...term,
          usage_examples: JSON.parse(term.usage_examples || '[]'),
          related_terms: JSON.parse(term.related_terms || '[]'),
          synonyms: JSON.parse(term.synonyms || '[]'),
          antonyms: JSON.parse(term.antonyms || '[]'),
          example_sentences: JSON.parse(term.example_sentences || '[]'),
          biblical_references: JSON.parse(term.biblical_references || '[]'),
          alternative_forms: JSON.parse(term.alternative_forms || '[]'),
          tags: JSON.parse(term.tags || '[]'),
          denominational_differences: JSON.parse(term.denominational_differences || '{}')
        },
        recommendations: recommendations.map(rec => ({
          ...rec.term,
          relevance_score: rec.relevance_score,
          reason: rec.reason,
          explanation: rec.explanation
        }))
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch term',
      message: (error as Error).message
    });
  }
}));

/**
 * 카테고리별 용어 조회
 * GET /api/theological-terms/category/:category
 */
theologicalTermsRoutes.get('/category/:category', asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;
  const { difficulty } = req.query;

  try {
    const terms = await TheologicalTermModel.findByCategory(
      category as any,
      difficulty as any
    );

    res.json({
      success: true,
      data: {
        category,
        terms: terms.map(term => ({
          ...term,
          usage_examples: JSON.parse(term.usage_examples || '[]'),
          related_terms: JSON.parse(term.related_terms || '[]'),
          synonyms: JSON.parse(term.synonyms || '[]'),
          antonyms: JSON.parse(term.antonyms || '[]')
        })),
        count: terms.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category terms',
      message: (error as Error).message
    });
  }
}));

/**
 * 무작위 용어 조회 (학습용)
 * GET /api/theological-terms/random
 */
theologicalTermsRoutes.get('/random', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { count = 5, difficulty, category } = req.query;

  try {
    const terms = await TheologicalTermModel.getRandomTerms(
      Number(count),
      difficulty as any,
      category as any
    );

    res.json({
      success: true,
      data: {
        terms: terms.map(term => ({
          ...term,
          usage_examples: JSON.parse(term.usage_examples || '[]'),
          related_terms: JSON.parse(term.related_terms || '[]'),
          synonyms: JSON.parse(term.synonyms || '[]'),
          antonyms: JSON.parse(term.antonyms || '[]')
        }))
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random terms',
      message: (error as Error).message
    });
  }
}));

/**
 * 용어 사전 조회 (알파벳별)
 * GET /api/theological-terms/dictionary
 */
theologicalTermsRoutes.get('/dictionary', asyncHandler(async (req: Request, res: Response) => {
  const { letter, category } = req.query;

  try {
    const dictionary = await TheologicalTermModel.getDictionary(
      letter as string,
      category as any
    );

    res.json({
      success: true,
      data: {
        dictionary: Object.fromEntries(
          Object.entries(dictionary).map(([key, terms]) => [
            key,
            terms.map(term => ({
              ...term,
              usage_examples: JSON.parse(term.usage_examples || '[]'),
              related_terms: JSON.parse(term.related_terms || '[]'),
              synonyms: JSON.parse(term.synonyms || '[]'),
              antonyms: JSON.parse(term.antonyms || '[]')
            }))
          ])
        ),
        available_letters: Object.keys(dictionary).sort()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dictionary',
      message: (error as Error).message
    });
  }
}));

/**
 * 사용자 학습 진도 기록
 * POST /api/theological-terms/progress
 */
theologicalTermsRoutes.post('/progress', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const validation = CreateProgressSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid progress data',
      details: validation.error.errors
    });
  }

  const userId = (req as any).user.userId;
  const { term_id, correct, response_time_ms, difficulty_perceived, context } = validation.data;

  try {
    const updatedProgress = await TheologicalTermProgressModel.recordLearningSession(
      userId,
      term_id,
      {
        term_id,
        correct,
        response_time_ms,
        difficulty_perceived,
        context
      }
    );

    res.json({
      success: true,
      data: {
        progress: updatedProgress,
        message: correct ? '정답입니다! 🎉' : '다시 한번 시도해보세요! 💪'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to record progress',
      message: (error as Error).message
    });
  }
}));

/**
 * 사용자 복습 대상 용어 조회
 * GET /api/theological-terms/review
 */
theologicalTermsRoutes.get('/review', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { limit = 20, priority_level } = req.query;

  try {
    const reviewTerms = await TheologicalTermProgressModel.getReviewTerms(
      userId,
      Number(limit),
      priority_level ? Number(priority_level) : undefined
    );

    res.json({
      success: true,
      data: {
        review_terms: reviewTerms.map(progress => ({
          ...progress,
          theological_term: {
            ...progress.theological_term,
            usage_examples: JSON.parse(progress.theological_term.usage_examples || '[]'),
            related_terms: JSON.parse(progress.theological_term.related_terms || '[]'),
            synonyms: JSON.parse(progress.theological_term.synonyms || '[]'),
            antonyms: JSON.parse(progress.theological_term.antonyms || '[]')
          }
        })),
        count: reviewTerms.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch review terms',
      message: (error as Error).message
    });
  }
}));

/**
 * 사용자 학습 통계 조회
 * GET /api/theological-terms/statistics
 */
theologicalTermsRoutes.get('/statistics', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  try {
    const [userStats, sessionStats] = await Promise.all([
      TheologicalTermProgressModel.getUserStatistics(userId),
      TheologicalTermSessionModel.getUserSessionStats(userId)
    ]);

    res.json({
      success: true,
      data: {
        progress_statistics: userStats,
        session_statistics: sessionStats,
        achievements: {
          total_terms_studied: userStats.total_terms_studied,
          current_streak: sessionStats.current_streak,
          best_session_score: sessionStats.best_session_score,
          weekly_study_time: sessionStats.weekly_sessions
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: (error as Error).message
    });
  }
}));

/**
 * 학습 세션 시작
 * POST /api/theological-terms/session/start
 */
theologicalTermsRoutes.post('/session/start', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const validation = CreateSessionSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid session data',
      details: validation.error.errors
    });
  }

  const userId = (req as any).user.userId;

  try {
    const session = await TheologicalTermSessionModel.startSession({
      user_id: userId,
      ...validation.data
    });

    // 학습 경로 추천
    const recommendation = await TheologicalTermSessionModel.getRecommendedLearningPath(userId);

    res.json({
      success: true,
      data: {
        session,
        recommendation,
        message: '새로운 학습 세션을 시작합니다! 🚀'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start session',
      message: (error as Error).message
    });
  }
}));

/**
 * 학습 세션 완료
 * POST /api/theological-terms/session/:sessionId/complete
 */
theologicalTermsRoutes.post('/session/:sessionId/complete', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { correct_count, total_count, duration_seconds, questions, performance_metrics } = req.body;

  try {
    const result = await TheologicalTermSessionModel.completeSession(sessionId, {
      correct_count,
      total_count,
      duration_seconds,
      questions,
      performance_metrics
    });

    res.json({
      success: true,
      data: {
        session: result.session,
        rewards: result.rewards,
        achievements: result.achievements,
        message: '세션을 완료했습니다! 훌륭한 공부였어요! 🎉'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to complete session',
      message: (error as Error).message
    });
  }
}));

/**
 * 사용자 세션 목록 조회
 * GET /api/theological-terms/sessions
 */
theologicalTermsRoutes.get('/sessions', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { limit = 20, offset = 0, session_type, completed_only = true } = req.query;

  try {
    const sessions = await TheologicalTermSessionModel.getUserSessions(userId, {
      limit: Number(limit),
      offset: Number(offset),
      session_type: session_type as any,
      completed_only: completed_only === 'true'
    });

    res.json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          ...session,
          terms_studied: JSON.parse(session.terms_studied || '[]')
        })),
        count: sessions.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sessions',
      message: (error as Error).message
    });
  }
}));

/**
 * 학습 경로 추천 조회
 * GET /api/theological-terms/recommendation
 */
theologicalTermsRoutes.get('/recommendation', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  try {
    const recommendation = await TheologicalTermSessionModel.getRecommendedLearningPath(userId);

    res.json({
      success: true,
      data: { recommendation }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendation',
      message: (error as Error).message
    });
  }
}));

export default theologicalTermsRoutes;