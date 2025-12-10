/**
 * AI 튜터 API 엔드포인트
 * Gemini Flash 기반 학습 지원 기능
 */

import { Router, Request, Response } from 'express';
import AITutorService from '../services/AITutorService';

const router = Router();

// Gemini API 키 확인
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
  console.warn('⚠️ Gemini API 키가 설정되지 않았습니다. AI 튜터 기능이 비활성화됩니다.');
}

// AI 튜터 서비스 인스턴스
let aiTutorService: AITutorService | null = null;
if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  aiTutorService = new AITutorService(GEMINI_API_KEY);
}

/**
 * POST /api/ai-tutor/grammar-question
 * 문법 질문에 답변
 */
router.post('/grammar-question', async (req: Request, res: Response) => {
  try {
    if (!aiTutorService) {
      return res.status(503).json({
        success: false,
        error: 'AI 튜터 서비스가 활성화되지 않았습니다. Gemini API 키를 설정해주세요.'
      });
    }

    const { grammarTopic, question, userLevel, context } = req.body;

    // 입력 검증
    if (!grammarTopic || !question || !userLevel) {
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다: grammarTopic, question, userLevel'
      });
    }

    // 레벨 검증
    const validLevels = ['A1', 'A2', 'B1', 'B2'];
    if (!validLevels.includes(userLevel)) {
      return res.status(400).json({
        success: false,
        error: `유효하지 않은 레벨입니다. 허용: ${validLevels.join(', ')}`
      });
    }

    const answer = await aiTutorService.answerGrammarQuestion({
      grammarTopic,
      question,
      userLevel,
      context
    });

    res.json({
      success: true,
      data: {
        grammarTopic,
        question,
        answer,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('문법 질문 처리 오류:', error);
    res.status(500).json({
      success: false,
      error: 'AI 튜터 응답 생성 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

/**
 * POST /api/ai-tutor/vocabulary-explain
 * 어휘 심화 설명
 */
router.post('/vocabulary-explain', async (req: Request, res: Response) => {
  try {
    if (!aiTutorService) {
      return res.status(503).json({
        success: false,
        error: 'AI 튜터 서비스가 활성화되지 않았습니다. Gemini API 키를 설정해주세요.'
      });
    }

    const { word, userLevel, requestType } = req.body;

    // 입력 검증
    if (!word || !userLevel || !requestType) {
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다: word, userLevel, requestType'
      });
    }

    // requestType 검증
    const validTypes = ['examples', 'etymology', 'usage', 'synonyms', 'full'];
    if (!validTypes.includes(requestType)) {
      return res.status(400).json({
        success: false,
        error: `유효하지 않은 requestType입니다. 허용: ${validTypes.join(', ')}`
      });
    }

    const explanation = await aiTutorService.explainVocabulary({
      word,
      userLevel,
      requestType
    });

    res.json({
      success: true,
      data: {
        word,
        requestType,
        explanation,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('어휘 설명 처리 오류:', error);
    res.status(500).json({
      success: false,
      error: 'AI 튜터 응답 생성 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

/**
 * POST /api/ai-tutor/writing-feedback
 * 작문 첨삭
 */
router.post('/writing-feedback', async (req: Request, res: Response) => {
  try {
    if (!aiTutorService) {
      return res.status(503).json({
        success: false,
        error: 'AI 튜터 서비스가 활성화되지 않았습니다. Gemini API 키를 설정해주세요.'
      });
    }

    const { originalText, userLevel, writingType, focusAreas } = req.body;

    // 입력 검증
    if (!originalText || !userLevel || !writingType) {
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다: originalText, userLevel, writingType'
      });
    }

    // writingType 검증
    const validTypes = ['sentence', 'paragraph', 'sermon'];
    if (!validTypes.includes(writingType)) {
      return res.status(400).json({
        success: false,
        error: `유효하지 않은 writingType입니다. 허용: ${validTypes.join(', ')}`
      });
    }

    const feedback = await aiTutorService.provideFeedback({
      originalText,
      userLevel,
      writingType,
      focusAreas
    });

    res.json({
      success: true,
      data: {
        originalText,
        feedback,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('작문 첨삭 처리 오류:', error);
    res.status(500).json({
      success: false,
      error: 'AI 튜터 응답 생성 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

/**
 * POST /api/ai-tutor/generate-examples
 * 예문 생성
 */
router.post('/generate-examples', async (req: Request, res: Response) => {
  try {
    if (!aiTutorService) {
      return res.status(503).json({
        success: false,
        error: 'AI 튜터 서비스가 활성화되지 않았습니다. Gemini API 키를 설정해주세요.'
      });
    }

    const { grammarPoint, difficulty, count } = req.body;

    // 입력 검증
    if (!grammarPoint || !difficulty) {
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다: grammarPoint, difficulty'
      });
    }

    // count 기본값 및 제한
    const exampleCount = Math.min(count || 5, 20); // 최대 20개

    const examples = await aiTutorService.generateExamples({
      grammarPoint,
      difficulty,
      count: exampleCount
    });

    res.json({
      success: true,
      data: {
        grammarPoint,
        difficulty,
        count: exampleCount,
        examples,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('예문 생성 처리 오류:', error);
    res.status(500).json({
      success: false,
      error: 'AI 튜터 응답 생성 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

/**
 * POST /api/ai-tutor/study-advice
 * 학습 조언 생성
 */
router.post('/study-advice', async (req: Request, res: Response) => {
  try {
    if (!aiTutorService) {
      return res.status(503).json({
        success: false,
        error: 'AI 튜터 서비스가 활성화되지 않았습니다. Gemini API 키를 설정해주세요.'
      });
    }

    const { userLevel, weakAreas } = req.body;

    // 입력 검증
    if (!userLevel || !weakAreas || !Array.isArray(weakAreas)) {
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었거나 형식이 잘못되었습니다: userLevel, weakAreas (배열)'
      });
    }

    const advice = await aiTutorService.provideStudyAdvice(userLevel, weakAreas);

    res.json({
      success: true,
      data: {
        userLevel,
        weakAreas,
        advice,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('학습 조언 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: 'AI 튜터 응답 생성 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

/**
 * GET /api/ai-tutor/status
 * AI 튜터 서비스 상태 확인
 */
router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      isActive: !!aiTutorService,
      model: 'gemini-1.5-flash',
      features: {
        grammarQuestion: !!aiTutorService,
        vocabularyExplanation: !!aiTutorService,
        writingFeedback: !!aiTutorService,
        exampleGeneration: !!aiTutorService,
        studyAdvice: !!aiTutorService
      },
      message: aiTutorService
        ? 'AI 튜터 서비스가 정상적으로 작동 중입니다.'
        : 'AI 튜터 서비스가 비활성화되어 있습니다. Gemini API 키를 설정해주세요.'
    }
  });
});

export default router;
