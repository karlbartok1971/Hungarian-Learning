import express, { Request, Response } from 'express';
import { asyncHandler } from '../lib/errorHandler';
import { authenticateToken } from '../lib/auth';
import { sermonAssistanceService } from '../services/SermonAssistanceService';
import { PrismaClient } from '@prisma/client';

/**
 * Sermon Writing API Routes
 * T069 - 헝가리어 설교문 작성 지원 API 엔드포인트
 * T080 - 설교문 템플릿 및 구조 제안 시스템
 *
 * 설교 개요 생성, 문법 검사, 표현 개선, 신학 용어 지원 등
 * 헝가리어 설교문 작성의 전 과정을 지원하는 RESTful API
 * 템플릿 제공 및 AI 기반 구조 제안 기능 포함
 */

const prisma = new PrismaClient();
export const sermonRoutes = express.Router();

// ========== 설교 개요 생성 ==========

/**
 * POST /api/sermon/generate-outline
 * 주제를 기반으로 헝가리어 설교 구조를 생성
 */
sermonRoutes.post('/generate-outline', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다'
    });
  }

  const {
    topic,
    userLevel,
    preferences
  } = req.body;

  // 입력 검증
  if (!topic || !userLevel || !preferences) {
    return res.status(400).json({
      success: false,
      error: '필수 필드가 누락되었습니다: topic, userLevel, preferences'
    });
  }

  if (!topic.korean && !topic.scripture) {
    return res.status(400).json({
      success: false,
      error: '주제 또는 성경 구절을 제공해주세요'
    });
  }

  try {
    const outline = await sermonAssistanceService.generateSermonOutline({
      topic,
      userLevel,
      preferences
    });

    res.json({
      success: true,
      data: {
        outline
      },
      message: '설교 개요가 성공적으로 생성되었습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `설교 개요 생성 실패: ${(error as Error).message}`
    });
  }
}));

// ========== 문법 및 표현 검사 ==========

/**
 * POST /api/sermon/check-grammar
 * 헝가리어 설교문의 문법을 검사하고 개선 사항을 제안
 */
sermonRoutes.post('/check-grammar', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const {
    text,
    level,
    check_options = { grammar: true, style: true, theology: true, pronunciation_hints: false }
  } = req.body;

  // 입력 검증
  if (!text || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: '검사할 텍스트를 입력해주세요'
    });
  }

  if (!level || !['A1', 'A2', 'B1', 'B2'].includes(level)) {
    return res.status(400).json({
      success: false,
      error: '유효한 레벨을 제공해주세요 (A1, A2, B1, B2)'
    });
  }

  try {
    const analysis = await sermonAssistanceService.checkGrammarAndTheology({
      text,
      level,
      check_options
    });

    res.json({
      success: true,
      data: {
        analysis
      },
      message: '문법 검사가 완료되었습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `문법 검사 실패: ${(error as Error).message}`
    });
  }
}));

// ========== 신학 용어 검색 ==========

/**
 * GET /api/sermon/theological-terms
 * 한국어 검색으로 헝가리어 신학 용어를 찾기
 */
sermonRoutes.get('/theological-terms', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const {
    search = '',
    category,
    level = 'all'
  } = req.query as { search?: string; category?: string; level?: string };

  try {
    const result = await sermonAssistanceService.searchTheologicalTerms({
      search,
      category: category as any,
      level: level as any
    });

    res.json({
      success: true,
      data: result,
      message: '신학 용어 검색이 완료되었습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `신학 용어 검색 실패: ${(error as Error).message}`
    });
  }
}));

// ========== 설교문 초안 저장 ==========

/**
 * POST /api/sermon/save-draft
 * 설교문 초안을 저장하고 관리
 */
sermonRoutes.post('/save-draft', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다'
    });
  }

  const { draft } = req.body;

  // 입력 검증
  if (!draft) {
    return res.status(400).json({
      success: false,
      error: '설교문 초안 데이터가 필요합니다'
    });
  }

  if (!draft.title || !draft.title.hungarian || !draft.title.korean) {
    return res.status(400).json({
      success: false,
      error: '설교문 제목 (한국어, 헝가리어)이 필요합니다'
    });
  }

  try {
    const result = await sermonAssistanceService.saveSermon({
      userId,
      draft
    });

    res.status(201).json({
      success: true,
      data: result,
      message: '설교문이 성공적으로 저장되었습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `설교문 저장 실패: ${(error as Error).message}`
    });
  }
}));

// ========== 사용자의 설교문 목록 조회 ==========

/**
 * GET /api/sermon/drafts/:userId
 * 사용자의 저장된 설교문 목록을 가져오기
 */
sermonRoutes.get('/drafts/:userId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const requestedUserId = req.params.userId;
  const authenticatedUserId = req.user?.id;

  // 본인의 설교문만 조회 가능
  if (requestedUserId !== authenticatedUserId) {
    return res.status(403).json({
      success: false,
      error: '본인의 설교문만 조회할 수 있습니다'
    });
  }

  const {
    limit = 10,
    offset = 0,
    sort = 'recent'
  } = req.query as { limit?: string; offset?: string; sort?: string };

  try {
    const result = await sermonAssistanceService.getUserSermons(requestedUserId, {
      limit: parseInt(limit),
      sort: sort as any,
      filters: {
        // 추가 필터링 옵션들
      }
    });

    res.json({
      success: true,
      data: result,
      message: '설교문 목록을 성공적으로 가져왔습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `설교문 목록 조회 실패: ${(error as Error).message}`
    });
  }
}));

// ========== 표현 개선 제안 ==========

/**
 * POST /api/sermon/improve-expression
 * 자연스럽지 않은 헝가리어 표현을 개선
 */
sermonRoutes.post('/improve-expression', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const {
    text,
    context = 'sermon_introduction',
    target_level,
    improvement_focus = ['naturalness', 'formality', 'clarity']
  } = req.body;

  // 입력 검증
  if (!text || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: '개선할 텍스트를 입력해주세요'
    });
  }

  if (!target_level || !['A1', 'A2', 'B1', 'B2'].includes(target_level)) {
    return res.status(400).json({
      success: false,
      error: '유효한 목표 레벨을 제공해주세요'
    });
  }

  try {
    const suggestions = await sermonAssistanceService.improveExpression({
      text,
      context,
      target_level,
      improvement_focus
    });

    res.json({
      success: true,
      data: {
        suggestions: suggestions.suggestions,
        overall_score: suggestions.overall_score,
        cultural_adaptations: suggestions.cultural_adaptation
      },
      message: '표현 개선 제안이 생성되었습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `표현 개선 실패: ${(error as Error).message}`
    });
  }
}));

// ========== 예화 생성 ==========

/**
 * POST /api/sermon/generate-illustrations
 * 설교 주제에 맞는 헝가리어 예화를 생성
 */
sermonRoutes.post('/generate-illustrations', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const {
    main_point,
    illustration_type,
    target_audience = 'general_congregation',
    cultural_context = 'hungarian_church'
  } = req.body;

  // 입력 검증
  if (!main_point || !main_point.korean || !main_point.theological_concept) {
    return res.status(400).json({
      success: false,
      error: '주요 논점 (korean, theological_concept)이 필요합니다'
    });
  }

  if (!illustration_type || !['biblical', 'historical', 'contemporary', 'personal'].includes(illustration_type)) {
    return res.status(400).json({
      success: false,
      error: '유효한 예화 타입을 선택해주세요 (biblical, historical, contemporary, personal)'
    });
  }

  try {
    const result = await sermonAssistanceService.generateIllustrations({
      main_point,
      illustration_type,
      target_audience,
      cultural_context
    });

    res.json({
      success: true,
      data: result,
      message: '예화가 성공적으로 생성되었습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `예화 생성 실패: ${(error as Error).message}`
    });
  }
}));

// ========== 설교문 업데이트 ==========

/**
 * PUT /api/sermon/drafts/:draftId
 * 기존 설교문 초안 업데이트
 */
sermonRoutes.put('/drafts/:draftId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const draftId = req.params.draftId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다'
    });
  }

  const updateData = req.body;

  try {
    // 기존 설교문이 해당 사용자의 것인지 확인
    const existingDraft = await prisma.sermonDraft.findFirst({
      where: {
        id: draftId,
        userId: userId
      }
    });

    if (!existingDraft) {
      return res.status(404).json({
        success: false,
        error: '설교문을 찾을 수 없거나 수정 권한이 없습니다'
      });
    }

    // 업데이트 실행
    const updatedDraft = await prisma.sermonDraft.update({
      where: { id: draftId },
      data: {
        ...updateData,
        updatedAt: new Date(),
        lastEditedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedDraft,
      message: '설교문이 성공적으로 업데이트되었습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `설교문 업데이트 실패: ${(error as Error).message}`
    });
  }
}));

// ========== 설교문 삭제 ==========

/**
 * DELETE /api/sermon/drafts/:draftId
 * 설교문 삭제 (실제로는 상태를 ARCHIVED로 변경)
 */
sermonRoutes.delete('/drafts/:draftId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const draftId = req.params.draftId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다'
    });
  }

  try {
    // 권한 확인 및 삭제 (아카이브)
    const deletedDraft = await prisma.sermonDraft.updateMany({
      where: {
        id: draftId,
        userId: userId
      },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date()
      }
    });

    if (deletedDraft.count === 0) {
      return res.status(404).json({
        success: false,
        error: '설교문을 찾을 수 없거나 삭제 권한이 없습니다'
      });
    }

    res.json({
      success: true,
      message: '설교문이 성공적으로 삭제되었습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `설교문 삭제 실패: ${(error as Error).message}`
    });
  }
}));

// ========== 설교문 통계 조회 ==========

/**
 * GET /api/sermon/stats/:userId
 * 사용자별 설교문 작성 통계
 */
sermonRoutes.get('/stats/:userId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const requestedUserId = req.params.userId;
  const authenticatedUserId = req.user?.id;

  // 본인의 통계만 조회 가능
  if (requestedUserId !== authenticatedUserId) {
    return res.status(403).json({
      success: false,
      error: '본인의 통계만 조회할 수 있습니다'
    });
  }

  try {
    const stats = await sermonAssistanceService.getUserSermonStats(requestedUserId);

    res.json({
      success: true,
      data: stats,
      message: '설교문 통계를 성공적으로 가져왔습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `설교문 통계 조회 실패: ${(error as Error).message}`
    });
  }
}));

// ========== 설교문 상태 변경 ==========

/**
 * PATCH /api/sermon/drafts/:draftId/status
 * 설교문 상태 변경 (작성 중 → 완료 → 보관됨)
 */
sermonRoutes.patch('/drafts/:draftId/status', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const draftId = req.params.draftId;
  const { status } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다'
    });
  }

  if (!status || !['DRAFT', 'COMPLETED', 'ARCHIVED'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: '유효한 상태를 제공해주세요 (DRAFT, COMPLETED, ARCHIVED)'
    });
  }

  try {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const updatedDraft = await prisma.sermonDraft.updateMany({
      where: {
        id: draftId,
        userId: userId
      },
      data: updateData
    });

    if (updatedDraft.count === 0) {
      return res.status(404).json({
        success: false,
        error: '설교문을 찾을 수 없거나 수정 권한이 없습니다'
      });
    }

    res.json({
      success: true,
      message: '설교문 상태가 성공적으로 변경되었습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `설교문 상태 변경 실패: ${(error as Error).message}`
    });
  }
}));

// ========== 설교문 복제 ==========

/**
 * POST /api/sermon/drafts/:draftId/duplicate
 * 기존 설교문을 복제하여 새로운 초안 생성
 */
sermonRoutes.post('/drafts/:draftId/duplicate', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const draftId = req.params.draftId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다'
    });
  }

  try {
    // 원본 설교문 확인
    const originalDraft = await prisma.sermonDraft.findFirst({
      where: {
        id: draftId,
        userId: userId
      }
    });

    if (!originalDraft) {
      return res.status(404).json({
        success: false,
        error: '복제할 설교문을 찾을 수 없습니다'
      });
    }

    // 제목에 "(복사본)" 추가
    const title = JSON.parse(originalDraft.title || '{}');
    const duplicatedTitle = {
      hungarian: `${title.hungarian} (másolat)`,
      korean: `${title.korean} (복사본)`
    };

    // 복제본 생성
    const duplicatedDraft = await prisma.sermonDraft.create({
      data: {
        userId,
        title: JSON.stringify(duplicatedTitle),
        scriptureReference: originalDraft.scriptureReference,
        topic: originalDraft.topic,
        content: originalDraft.content,
        metadata: originalDraft.metadata,
        status: 'DRAFT',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      data: {
        draft_id: duplicatedDraft.id,
        created_at: duplicatedDraft.createdAt
      },
      message: '설교문이 성공적으로 복제되었습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `설교문 복제 실패: ${(error as Error).message}`
    });
  }
}));

// ========== 설교문 검색 ==========

/**
 * GET /api/sermon/search
 * 설교문 검색 (제목, 내용, 성경 구절)
 */
sermonRoutes.get('/search', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const {
    q: searchTerm,
    status,
    tags,
    difficulty_level,
    limit = 20
  } = req.query as {
    q?: string;
    status?: string;
    tags?: string;
    difficulty_level?: string;
    limit?: string;
  };

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다'
    });
  }

  if (!searchTerm || searchTerm.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: '검색어를 입력해주세요'
    });
  }

  try {
    const whereClause: any = {
      userId,
      OR: [
        { title: { contains: searchTerm } },
        { content: { contains: searchTerm } },
        { scriptureReference: { contains: searchTerm } }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    const results = await prisma.sermonDraft.findMany({
      where: whereClause,
      take: parseInt(limit),
      orderBy: { updatedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        sermons: results,
        total_found: results.length,
        search_term: searchTerm
      },
      message: '검색이 완료되었습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `검색 실패: ${(error as Error).message}`
    });
  }
}));

// ========== T080 - 설교 템플릿 및 구조 제안 시스템 ==========

/**
 * GET /api/sermon/templates
 * 사용자 레벨에 맞는 설교 템플릿 목록 조회
 */
sermonRoutes.get('/templates', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다'
    });
  }

  const { difficulty, category, occasion } = req.query;

  try {
    // Mock 템플릿 데이터 (실제로는 데이터베이스에서 조회)
    const mockTemplates = [
      {
        id: 'basic-expository-a1',
        title_korean: '기본 강해설교 (A1 초급)',
        title_hungarian: 'Alapvető expozitórikus prédikáció',
        category: 'expository',
        difficulty: 'A1',
        estimated_time: 30,
        target_occasions: ['주일예배', '수요예배', '소그룹 모임'],
        theological_themes: ['하나님의 사랑', '구원', '믿음', '순종'],
        structure_sections: 6,
        usage_count: 145,
        rating: 4.8,
        created_at: '2024-01-15',
        updated_at: '2024-11-20'
      },
      {
        id: 'topical-faith-a2',
        title_korean: '주제별 설교 - 믿음 (A2 중급)',
        title_hungarian: 'Tematikus prédikáció - A hit',
        category: 'topical',
        difficulty: 'A2',
        estimated_time: 35,
        target_occasions: ['주일예배', '신앙강좌', '청년부 모임'],
        theological_themes: ['믿음', '신뢰', '순종', '성장', '도전'],
        structure_sections: 6,
        usage_count: 89,
        rating: 4.6,
        created_at: '2024-02-10',
        updated_at: '2024-11-18'
      },
      {
        id: 'narrative-parable-b1',
        title_korean: '내러티브 설교 - 예수님의 비유 (B1 고급)',
        title_hungarian: 'Narratív prédikáció - Jézus példázatai',
        category: 'narrative',
        difficulty: 'B1',
        estimated_time: 40,
        target_occasions: ['주일예배', '부활절', '추수감사절', '특별집회'],
        theological_themes: ['하나님의 나라', '용서', '사랑', '회개', '구원'],
        structure_sections: 6,
        usage_count: 67,
        rating: 4.9,
        created_at: '2024-03-05',
        updated_at: '2024-11-15'
      },
      {
        id: 'special-christmas-b2',
        title_korean: '특별예배 설교 - 크리스마스 (B2 최고급)',
        title_hungarian: 'Különleges istentisztelet - Karácsony',
        category: 'special',
        difficulty: 'B2',
        estimated_time: 42,
        target_occasions: ['크리스마스 이브', '성탄절', '송년예배'],
        theological_themes: ['성육신', '구원', '하나님의 사랑', '구약 성취', '새로운 탄생'],
        structure_sections: 6,
        usage_count: 34,
        rating: 5.0,
        created_at: '2024-04-12',
        updated_at: '2024-11-25'
      }
    ];

    let filteredTemplates = mockTemplates;

    // 필터링 적용
    if (difficulty) {
      filteredTemplates = filteredTemplates.filter(t => t.difficulty === difficulty);
    }
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }
    if (occasion) {
      filteredTemplates = filteredTemplates.filter(t =>
        t.target_occasions.some(occ =>
          occ.toLowerCase().includes((occasion as string).toLowerCase())
        )
      );
    }

    res.json({
      success: true,
      data: {
        templates: filteredTemplates,
        total_count: filteredTemplates.length,
        categories: ['expository', 'topical', 'narrative', 'special'],
        difficulties: ['A1', 'A2', 'B1', 'B2']
      },
      message: '설교 템플릿 목록을 조회했습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `템플릿 조회 실패: ${(error as Error).message}`
    });
  }
}));

/**
 * GET /api/sermon/templates/:templateId
 * 특정 설교 템플릿의 상세 정보 조회
 */
sermonRoutes.get('/templates/:templateId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다'
    });
  }

  const { templateId } = req.params;

  try {
    // Mock 템플릿 상세 데이터
    const templateDetails = {
      id: templateId,
      title_korean: '기본 강해설교 (A1 초급)',
      title_hungarian: 'Alapvető expozitórikus prédikáció',
      category: 'expository',
      difficulty: 'A1',
      structure: [
        {
          section: 'opening',
          hungarian_title: 'Megnyitás és köszöntő',
          korean_title: '인사 및 환영',
          description: '따뜻한 인사와 함께 예배를 시작합니다',
          example_phrases: [
            'Jó napot kívánok mindenkinek!',
            'Köszöntöm Önöket Isten házában.',
            'Örülök, hogy ma együtt lehetünk.'
          ],
          time_estimate: 2
        },
        {
          section: 'scripture_reading',
          hungarian_title: 'Szentírás olvasása',
          korean_title: '성경 봉독',
          description: '오늘의 본문을 천천히 읽고 소개합니다',
          example_phrases: [
            'A mai igénk a következő:',
            'Olvassuk együtt a Szentírást.',
            'Ez az Úr beszéde.'
          ],
          time_estimate: 3
        }
      ],
      theological_themes: ['하나님의 사랑', '구원', '믿음', '순종'],
      target_occasions: ['주일예배', '수요예배', '소그룹 모임'],
      example_outline: `
1. 인사 및 환영 (2분)
   - 따뜻한 인사
   - 오늘의 주제 소개

2. 성경 봉독 (3분)
   - 본문 읽기
   - 배경 설명
      `,
      hungarian_phrases: {
        opening: [
          'Jó napot kívánok mindenkinek!',
          'Köszöntöm Önöket az Úr házában.'
        ],
        transitions: [
          'Most pedig térjünk át a következőre...',
          'A másik fontos dolog...'
        ],
        closing: [
          'Imádkozzunk együtt.',
          'Az Úr áldjon meg bennünket.'
        ]
      }
    };

    res.json({
      success: true,
      data: templateDetails,
      message: '템플릿 상세 정보를 조회했습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `템플릿 상세 조회 실패: ${(error as Error).message}`
    });
  }
}));

/**
 * POST /api/sermon/structure-suggestions
 * 주제/본문 기반 AI 설교 구조 제안 생성
 */
sermonRoutes.post('/structure-suggestions', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다'
    });
  }

  const {
    topic,
    scripture_reference,
    target_audience,
    difficulty = 'A2',
    sermon_type = 'expository'
  } = req.body;

  // 입력 검증
  if (!topic && !scripture_reference) {
    return res.status(400).json({
      success: false,
      error: '주제 또는 성경 구절을 제공해주세요'
    });
  }

  try {
    // Mock AI 구조 제안 (실제로는 AI 서비스 호출)
    const suggestions = [
      {
        id: 'suggestion-1',
        title: '3-포인트 강해설교 구조',
        description: '본문을 세 개의 주요 포인트로 나누어 체계적으로 설명하는 전통적 강해설교 방식',
        estimated_time: 25,
        structure_type: 'expository',
        confidence_score: 0.92,
        sections: [
          {
            order: 1,
            hungarian_title: 'Bevezetés és kontextus',
            korean_title: '도입 및 배경설명',
            time_minutes: 4,
            key_points: ['본문의 역사적 배경', '저자와 수신자', '문학적 장르'],
            suggested_phrases: [
              'A mai igénk így szól...',
              'Pál apostol ezt írta...',
              'A történelmi háttér...'
            ]
          }
        ],
        theological_focus: ['하나님의 사랑', '구원', '신뢰'],
        practical_applications: [
          '매일 하나님의 사랑을 묵상하기',
          '다른 사람들에게 사랑 실천하기'
        ]
      },
      {
        id: 'suggestion-2',
        title: '문제-해결 구조',
        description: '인간의 문제를 제시하고 복음으로 해결책을 제시하는 실용적 접근방식',
        estimated_time: 30,
        structure_type: 'topical',
        confidence_score: 0.87,
        sections: [
          {
            order: 1,
            hungarian_title: 'A probléma felvetése',
            korean_title: '문제 제기',
            time_minutes: 5,
            key_points: ['현대인의 고민', '실제적 어려움', '공감대 형성'],
            suggested_phrases: [
              'Mindannyian tapasztaljuk...',
              'Ki ne ismerné ezt a helyzetet?'
            ]
          }
        ],
        theological_focus: ['구원', '실천', '변화'],
        practical_applications: [
          '매일 기도하는 시간 갖기',
          '말씀 묵상 습관 기르기'
        ]
      }
    ];

    res.json({
      success: true,
      data: {
        suggestions,
        generation_metadata: {
          input_topic: topic,
          input_scripture: scripture_reference,
          target_audience,
          difficulty,
          generation_time: new Date().toISOString(),
          ai_model_version: 'hungarian-sermon-v1.2'
        }
      },
      message: 'AI 설교 구조 제안을 생성했습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `구조 제안 생성 실패: ${(error as Error).message}`
    });
  }
}));

/**
 * POST /api/sermon/apply-template
 * 선택한 템플릿을 기반으로 새 설교 초안 생성
 */
sermonRoutes.post('/apply-template', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다'
    });
  }

  const {
    template_id,
    sermon_title,
    scripture_reference,
    custom_topic,
    target_audience
  } = req.body;

  // 입력 검증
  if (!template_id || !sermon_title) {
    return res.status(400).json({
      success: false,
      error: '필수 필드가 누락되었습니다: template_id, sermon_title'
    });
  }

  try {
    // 새 설교 초안 생성 (실제로는 데이터베이스에 저장)
    const newSermonDraft = {
      id: `sermon_${Date.now()}`,
      user_id: userId,
      title: sermon_title,
      template_used: template_id,
      scripture_reference,
      topic: custom_topic,
      target_audience,
      difficulty: 'A2', // 템플릿에서 가져옴
      content: '', // 템플릿 구조로 초기화됨
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      template_applied: true,
      structure_sections: [
        {
          section_id: 'opening',
          title: '인사 및 환영',
          content: '',
          completed: false,
          estimated_time: 2
        },
        {
          section_id: 'scripture_reading',
          title: '성경 봉독',
          content: '',
          completed: false,
          estimated_time: 3
        }
      ]
    };

    res.json({
      success: true,
      data: {
        sermon_draft: newSermonDraft,
        next_steps: [
          '각 섹션의 내용을 작성해주세요',
          '문법 검사를 통해 표현을 개선하세요',
          '신학 용어 도움말을 활용하세요'
        ]
      },
      message: '템플릿이 성공적으로 적용되었습니다'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: `템플릿 적용 실패: ${(error as Error).message}`
    });
  }
}));

export default sermonRoutes;