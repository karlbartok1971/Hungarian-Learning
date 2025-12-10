// 분석 API 엔드포인트
// Hungarian Learning Platform - Analytics API Endpoints
// T109 [US5] Implement analytics API endpoints

import { Router, Request, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { auth } from '../middleware/auth';
import { AnalyticsService } from '../services/AnalyticsService';
import { DatabaseManager } from '../lib/database';

const router = Router();
const analyticsService = new AnalyticsService(DatabaseManager.getDataSource());

// 인증 미들웨어 적용
router.use(auth);

// 입력 검증 미들웨어
const handleValidationErrors = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: '입력 데이터 검증 실패',
      details: errors.array()
    });
  }
  next();
};

// GET /api/analytics/overview - 사용자 학습 개요 조회
router.get('/overview',
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('유효하지 않은 기간입니다'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const period = (req.query.period as string) || '30d';

      const overview = await analyticsService.generateLearningOverview(userId, period);

      res.json(overview);
    } catch (error) {
      console.error('학습 개요 조회 중 오류:', error);
      res.status(500).json({
        error: '학습 개요를 조회하는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
);

// GET /api/analytics/learning-patterns - 학습 패턴 분석
router.get('/learning-patterns',
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('유효하지 않은 기간입니다'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const period = (req.query.period as string) || '30d';

      const patterns = await analyticsService.analyzeLearningPatterns(userId, period);

      res.json(patterns);
    } catch (error) {
      console.error('학습 패턴 분석 중 오류:', error);
      res.status(500).json({
        error: '학습 패턴을 분석하는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
);

// GET /api/analytics/weaknesses - 약점 식별 및 우선순위
router.get('/weaknesses',
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      const weaknesses = await analyticsService.identifyWeaknesses(userId);

      res.json(weaknesses);
    } catch (error) {
      console.error('약점 식별 중 오류:', error);
      res.status(500).json({
        error: '약점을 식별하는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
);

// GET /api/analytics/progress-prediction - 학습 진도 예측
router.get('/progress-prediction',
  query('target_level')
    .notEmpty()
    .withMessage('목표 레벨을 지정해주세요')
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('유효한 CEFR 레벨을 입력해주세요'),
  query('time_horizon')
    .notEmpty()
    .withMessage('시간 범위를 지정해주세요')
    .isIn(['1m', '3m', '6m', '1y'])
    .withMessage('유효한 시간 범위를 입력해주세요'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const targetLevel = req.query.target_level as string;
      const timeHorizon = req.query.time_horizon as string;

      const prediction = await analyticsService.predictProgress(userId, targetLevel, timeHorizon);

      res.json(prediction);
    } catch (error) {
      console.error('진도 예측 중 오류:', error);
      res.status(500).json({
        error: '진도를 예측하는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
);

// POST /api/analytics/custom-report - 맞춤형 보고서 생성
router.post('/custom-report',
  body('report_type')
    .notEmpty()
    .withMessage('보고서 유형을 지정해주세요')
    .isIn(['comprehensive', 'skill_focused', 'progress_summary', 'comparative'])
    .withMessage('유효한 보고서 유형을 선택해주세요'),
  body('date_range.start')
    .notEmpty()
    .withMessage('시작 날짜를 지정해주세요')
    .isISO8601()
    .withMessage('유효한 날짜 형식을 사용해주세요'),
  body('date_range.end')
    .notEmpty()
    .withMessage('종료 날짜를 지정해주세요')
    .isISO8601()
    .withMessage('유효한 날짜 형식을 사용해주세요'),
  body('metrics')
    .isArray({ min: 1 })
    .withMessage('최소 하나의 지표를 선택해주세요'),
  body('metrics.*')
    .isIn(['vocabulary', 'pronunciation', 'grammar', 'study_patterns', 'performance_trends'])
    .withMessage('유효한 지표를 선택해주세요'),
  body('comparison_type')
    .optional()
    .isIn(['self_progress', 'peer_comparison', 'cefr_standards'])
    .withMessage('유효한 비교 유형을 선택해주세요'),
  body('granularity')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('유효한 세분화 단위를 선택해주세요'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const reportConfig = req.body;

      // 날짜 범위 검증
      const startDate = new Date(reportConfig.date_range.start);
      const endDate = new Date(reportConfig.date_range.end);

      if (startDate >= endDate) {
        return res.status(400).json({
          error: '시작 날짜가 종료 날짜보다 이후일 수 없습니다'
        });
      }

      const report = await analyticsService.generateCustomReport(userId, reportConfig);

      res.json(report);
    } catch (error) {
      console.error('맞춤형 보고서 생성 중 오류:', error);
      res.status(500).json({
        error: '맞춤형 보고서를 생성하는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
);

// GET /api/analytics/peer-comparison - 익명화된 동료 비교
router.get('/peer-comparison',
  query('level')
    .optional()
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('유효한 CEFR 레벨을 입력해주세요'),
  query('study_duration')
    .optional()
    .isIn(['1m', '3m', '6m', '1y', '2y'])
    .withMessage('유효한 학습 기간을 입력해주세요'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const level = (req.query.level as string) || 'A2';
      const studyDuration = (req.query.study_duration as string) || '3m';

      const comparison = await analyticsService.providePeerComparison(userId, level, studyDuration);

      res.json(comparison);
    } catch (error) {
      console.error('동료 비교 분석 중 오류:', error);
      res.status(500).json({
        error: '동료 비교를 분석하는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
);

// GET /api/analytics/study-recommendations - 개인화된 학습 추천
router.get('/study-recommendations',
  query('goal_type')
    .notEmpty()
    .withMessage('목표 유형을 지정해주세요')
    .isIn(['level_advancement', 'skill_improvement', 'weakness_focused', 'balanced'])
    .withMessage('유효한 목표 유형을 선택해주세요'),
  query('available_time')
    .notEmpty()
    .withMessage('이용 가능한 시간을 지정해주세요')
    .isInt({ min: 5, max: 240 })
    .withMessage('5분에서 240분 사이의 시간을 입력해주세요'),
  query('priority')
    .optional()
    .isIn(['speed', 'accuracy', 'retention', 'balanced'])
    .withMessage('유효한 우선순위를 선택해주세요'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const goalType = req.query.goal_type as string;
      const availableTime = parseInt(req.query.available_time as string);
      const priority = (req.query.priority as string) || 'balanced';

      const recommendations = await analyticsService.generateStudyRecommendations(
        userId,
        goalType,
        availableTime,
        priority
      );

      res.json(recommendations);
    } catch (error) {
      console.error('학습 추천 생성 중 오류:', error);
      res.status(500).json({
        error: '학습 추천을 생성하는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
);

// POST /api/analytics/session-performance - 실시간 세션 성능 기록
router.post('/session-performance',
  body('session_id')
    .notEmpty()
    .withMessage('세션 ID를 지정해주세요')
    .isUUID()
    .withMessage('유효한 세션 ID 형식을 사용해주세요'),
  body('sequence_number')
    .notEmpty()
    .withMessage('시퀀스 번호를 지정해주세요')
    .isInt({ min: 0 })
    .withMessage('유효한 시퀀스 번호를 입력해주세요'),
  body('activity_type')
    .notEmpty()
    .withMessage('활동 유형을 지정해주세요')
    .isIn(['vocabulary', 'pronunciation', 'grammar', 'listening', 'reading', 'writing'])
    .withMessage('유효한 활동 유형을 선택해주세요'),
  body('instant_metrics')
    .notEmpty()
    .withMessage('즉석 지표를 제공해주세요')
    .isObject()
    .withMessage('즉석 지표는 객체 형태여야 합니다'),
  body('instant_metrics.response_time')
    .notEmpty()
    .withMessage('응답 시간을 지정해주세요')
    .isInt({ min: 0 })
    .withMessage('유효한 응답 시간을 입력해주세요'),
  body('instant_metrics.accuracy')
    .notEmpty()
    .withMessage('정확성을 지정해주세요')
    .isBoolean()
    .withMessage('정확성은 불린 값이어야 합니다'),
  body('instant_metrics.confidence')
    .notEmpty()
    .withMessage('자신감 점수를 지정해주세요')
    .isFloat({ min: 0, max: 1 })
    .withMessage('자신감 점수는 0과 1 사이의 값이어야 합니다'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const performanceData = {
        sequenceNumber: req.body.sequence_number,
        activityType: req.body.activity_type,
        instantMetrics: req.body.instant_metrics,
        contextualData: req.body.contextual_data,
        biometricData: req.body.biometric_data
      };

      await analyticsService.recordSessionPerformance(
        userId,
        req.body.session_id,
        performanceData
      );

      res.status(201).json({
        message: '세션 성능이 성공적으로 기록되었습니다',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('세션 성능 기록 중 오류:', error);
      res.status(500).json({
        error: '세션 성능을 기록하는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
);

// GET /api/analytics/insights - 성과 인사이트 조회
router.get('/insights',
  query('unread_only')
    .optional()
    .isBoolean()
    .withMessage('unread_only는 불린 값이어야 합니다'),
  query('priority')
    .optional()
    .isIn(['high', 'medium', 'low'])
    .withMessage('유효한 우선순위를 선택해주세요'),
  query('insight_type')
    .optional()
    .isIn(['achievement', 'warning', 'recommendation', 'trend'])
    .withMessage('유효한 인사이트 유형을 선택해주세요'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('제한 수는 1과 100 사이여야 합니다'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      // 성과 인사이트 생성 (필요시)
      await analyticsService.generatePerformanceInsights(userId);

      // 인사이트 조회 로직 (실제 구현 필요)
      // const insights = await analyticsService.getPerformanceInsights(userId, req.query);

      // 임시 응답
      res.json({
        insights: [],
        total_count: 0,
        unread_count: 0,
        generated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('성과 인사이트 조회 중 오류:', error);
      res.status(500).json({
        error: '성과 인사이트를 조회하는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
);

// PATCH /api/analytics/insights/:id/read - 인사이트 읽음 처리
router.patch('/insights/:id/read',
  param('id').isUUID().withMessage('유효한 인사이트 ID를 제공해주세요'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const insightId = req.params.id;

      // 인사이트 읽음 처리 로직 (실제 구현 필요)
      // await analyticsService.markInsightAsRead(userId, insightId);

      res.json({
        message: '인사이트가 읽음 처리되었습니다',
        insight_id: insightId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('인사이트 읽음 처리 중 오류:', error);
      res.status(500).json({
        error: '인사이트 읽음 처리 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
);

// POST /api/analytics/insights/:id/action - 인사이트 기반 액션 수행
router.post('/insights/:id/action',
  param('id').isUUID().withMessage('유효한 인사이트 ID를 제공해주세요'),
  body('action_taken')
    .notEmpty()
    .withMessage('수행한 액션을 지정해주세요')
    .isString()
    .withMessage('액션은 문자열이어야 합니다'),
  body('notes')
    .optional()
    .isString()
    .withMessage('노트는 문자열이어야 합니다'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const insightId = req.params.id;
      const actionTaken = req.body.action_taken;
      const notes = req.body.notes;

      // 인사이트 액션 처리 로직 (실제 구현 필요)
      // await analyticsService.recordInsightAction(userId, insightId, actionTaken, notes);

      res.json({
        message: '인사이트 액션이 기록되었습니다',
        insight_id: insightId,
        action_taken: actionTaken,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('인사이트 액션 기록 중 오류:', error);
      res.status(500).json({
        error: '인사이트 액션을 기록하는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
);

// GET /api/analytics/export/:reportId - 보고서 내보내기
router.get('/export/:reportId',
  param('reportId').notEmpty().withMessage('보고서 ID를 제공해주세요'),
  query('format')
    .notEmpty()
    .withMessage('내보내기 형식을 지정해주세요')
    .isIn(['pdf', 'xlsx', 'json', 'csv'])
    .withMessage('유효한 내보내기 형식을 선택해주세요'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const reportId = req.params.reportId;
      const format = req.query.format as string;

      // 보고서 내보내기 로직 (실제 구현 필요)
      // const exportedReport = await analyticsService.exportReport(userId, reportId, format);

      // 임시 응답
      res.json({
        message: '보고서 내보내기가 준비되었습니다',
        report_id: reportId,
        format: format,
        download_url: `/api/analytics/download/${reportId}.${format}`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24시간 후 만료
      });
    } catch (error) {
      console.error('보고서 내보내기 중 오류:', error);
      res.status(500).json({
        error: '보고서를 내보내는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
);

// 오류 처리 미들웨어
router.use((error: Error, req: Request, res: Response, next: any) => {
  console.error('Analytics API 오류:', error);

  res.status(500).json({
    error: '분석 서비스에서 오류가 발생했습니다',
    details: process.env.NODE_ENV === 'development' ? error.message : '내부 서버 오류',
    timestamp: new Date().toISOString()
  });
});

export default router;