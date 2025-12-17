/**
 * 문법 강의 API 엔드포인트
 * 데이터베이스에서 문법 강의 목록을 조회하여 프론트엔드에 제공
 */

import { Router, Request, Response } from 'express';
import { PrismaClient, CEFRLevel } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ... (주석 생략)

router.get('/', async (req: Request, res: Response) => {
  try {
    const { level } = req.query;

    // 레벨 필터가 있으면 해당 레벨만, 없으면 전체 조회
    let whereClause: any = { isPublished: true };

    if (level && typeof level === 'string') {
      const parsedLevel = level.toUpperCase();
      if (Object.values(CEFRLevel).includes(parsedLevel as CEFRLevel)) {
        whereClause.level = parsedLevel as CEFRLevel;
      }
    }

    const lessons = await prisma.grammarLesson.findMany({
      where: whereClause,
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        titleKorean: true,
        titleHungarian: true,
        level: true,
        orderIndex: true,
        explanationKorean: true,
        estimatedDuration: true,
        difficultyScore: true,
        tags: true,
        examples: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`📖 문법 강의 조회: ${level || '전체'} - ${lessons.length}개 반환`);

    res.json({
      success: true,
      data: lessons,
      count: lessons.length,
    });
  } catch (error: any) {
    console.error('❌ 문법 강의 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message || '문법 강의를 불러오는데 실패했습니다',
    });
  }
});

/**
 * GET /api/grammar-lessons/:id
 * Parameters:
 *   - id: 문법 강의 ID
 *
 * Returns: {
 *   success: boolean,
 *   data: GrammarLesson (with full content)
 * }
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lesson = await prisma.grammarLesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: '해당 문법 강의를 찾을 수 없습니다',
      });
    }

    console.log(`📖 문법 강의 상세 조회: ${lesson.titleKorean}`);

    res.json({
      success: true,
      data: lesson,
    });
  } catch (error: any) {
    console.error('❌ 문법 강의 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message || '문법 강의를 불러오는데 실패했습니다',
    });
  }
});

export default router;
