/**
 * 성경 일일 학습 API 엔드포인트
 * 매일 성경 구절을 학습하고 문법을 분석하는 시스템
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/bible/daily
 * 오늘의 성경 구절 가져오기
 *
 * Query Parameters:
 *   - userId: 사용자 ID (필수)
 *   - level: 난이도 필터 (optional: A1, A2, B1, B2)
 *
 * Returns: {
 *   success: boolean,
 *   data: {
 *     verse: BibleVerse,
 *     progress: BibleStudyProgress | null,
 *     plan: DailyBiblePlan | null
 *   }
 * }
 */
router.get('/daily', async (req: Request, res: Response) => {
  try {
    const { userId, level } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID가 필요합니다',
      });
    }

    // 사용자의 활성화된 성경 읽기 계획 가져오기
    const plan = await prisma.dailyBiblePlan.findFirst({
      where: {
        userId: userId as string,
        isActive: true,
      },
      orderBy: {
        lastStudiedAt: 'desc',
      },
    });

    // 오늘의 구절 가져오기
    let verse;

    if (plan) {
      // 계획이 있으면 계획에 따라 구절 가져오기
      verse = await prisma.bibleVerse.findFirst({
        where: {
          book: plan.currentBook,
          chapter: plan.currentChapter,
          verse: plan.currentVerse,
        },
      });
    } else {
      // 계획이 없으면 랜덤 구절 (난이도 필터 적용)
      const whereClause: any = {};
      if (level) {
        whereClause.difficulty = level;
      }

      const verses = await prisma.bibleVerse.findMany({
        where: whereClause,
        take: 10,
        orderBy: {
          createdAt: 'asc',
        },
      });

      verse = verses[Math.floor(Math.random() * verses.length)];
    }

    if (!verse) {
      console.log('⚠️ DB에 사용 가능한 구절이 없어 Mock Data를 반환합니다.');
      verse = {
        id: 'mock_gen_1_1',
        book: '창세기',
        bookHungarian: 'Teremtés könyve',
        chapter: 1,
        verse: 1,
        textHungarian: 'Kezdetben teremtette Isten az eget és a földet.',
        textKorean: '태초에 하나님이 천지를 창조하시니라.',
        grammarAnalysis: [
          { word: 'Kezdetben', lemma: 'kezdet', pos: 'Noun', meaning: '태초에', grammarFeature: 'Inessive case (-ben)', level: 'A1' },
          { word: 'teremtette', lemma: 'teremt', pos: 'Verb', meaning: '창조했다', grammarFeature: 'Past tense, Definite mock', level: 'B1' },
          { word: 'Isten', lemma: 'Isten', pos: 'Noun', meaning: '하나님', grammarFeature: 'Nominative', level: 'A1' },
          { word: 'az', lemma: 'az', pos: 'Article', meaning: '그', grammarFeature: 'Definite article', level: 'A1' },
          { word: 'eget', lemma: 'ég', pos: 'Noun', meaning: '하늘을', grammarFeature: 'Accusative (-et)', level: 'A2' },
          { word: 'és', lemma: 'és', pos: 'Conjunction', meaning: '그리고', grammarFeature: '-', level: 'A1' },
          { word: 'földet', lemma: 'föld', pos: 'Noun', meaning: '땅을', grammarFeature: 'Accusative (-et)', level: 'A2' }
        ],
        difficulty: 'A1',
        grammarTopics: ['Inessive', 'Accusative', 'Past Tense'],
        vocabularyCount: 7,
        theologicalTheme: '창조 (Creation)',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // 사용자의 이 구절 학습 진도 가져오기
    const progress = await prisma.bibleStudyProgress.findUnique({
      where: {
        userId_verseId: {
          userId: userId as string,
          verseId: verse.id,
        },
      },
    });

    console.log(`📖 오늘의 성경: ${verse.book} ${verse.chapter}:${verse.verse}`);

    res.json({
      success: true,
      data: {
        verse,
        progress,
        plan,
      },
    });
  } catch (error: any) {
    console.error('❌ 오늘의 성경 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message || '성경 구절을 불러오는데 실패했습니다',
    });
  }
});

/**
 * GET /api/bible/verse/:book/:chapter/:verse
 * 특정 성경 구절 가져오기
 */
router.get('/verse/:book/:chapter/:verse', async (req: Request, res: Response) => {
  try {
    const { book, chapter, verse } = req.params;

    const bibleVerse = await prisma.bibleVerse.findUnique({
      where: {
        book_chapter_verse: {
          book,
          chapter: parseInt(chapter),
          verse: parseInt(verse),
        },
      },
    });

    if (!bibleVerse) {
      return res.status(404).json({
        success: false,
        error: '해당 성경 구절을 찾을 수 없습니다',
      });
    }

    console.log(`📖 성경 구절 조회: ${book} ${chapter}:${verse}`);

    res.json({
      success: true,
      data: bibleVerse,
    });
  } catch (error: any) {
    console.error('❌ 성경 구절 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message || '성경 구절을 불러오는데 실패했습니다',
    });
  }
});

/**
 * GET /api/bible/analysis/:verseId
 * 성경 구절의 문법 분석 상세 정보 가져오기
 */
router.get('/analysis/:verseId', async (req: Request, res: Response) => {
  try {
    const { verseId } = req.params;

    const verse = await prisma.bibleVerse.findUnique({
      where: { id: verseId },
    });

    if (!verse) {
      return res.status(404).json({
        success: false,
        error: '해당 성경 구절을 찾을 수 없습니다',
      });
    }

    // grammarAnalysis JSON을 반환
    const analysis = verse.grammarAnalysis;

    console.log(`📝 문법 분석 조회: ${verse.book} ${verse.chapter}:${verse.verse}`);

    res.json({
      success: true,
      data: {
        verse,
        analysis,
        grammarTopics: verse.grammarTopics,
        difficulty: verse.difficulty,
      },
    });
  } catch (error: any) {
    console.error('❌ 문법 분석 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message || '문법 분석을 불러오는데 실패했습니다',
    });
  }
});

/**
 * POST /api/bible/progress
 * 성경 학습 진도 기록
 *
 * Body: {
 *   userId: string,
 *   verseId: string,
 *   timeSpent: number,
 *   wordsStudied: number,
 *   wordsMarked?: string[],
 *   quizScore?: number,
 *   notes?: string,
 *   sermonIdeas?: string,
 *   isCompleted: boolean
 * }
 */
router.post('/progress', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      verseId,
      timeSpent,
      wordsStudied,
      wordsMarked,
      quizScore,
      notes,
      sermonIdeas,
      isCompleted,
    } = req.body;

    if (!userId || !verseId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID와 구절 ID가 필요합니다',
      });
    }

    // 진도 기록 생성 또는 업데이트
    const progress = await prisma.bibleStudyProgress.upsert({
      where: {
        userId_verseId: {
          userId,
          verseId,
        },
      },
      update: {
        timeSpent: { increment: timeSpent || 0 },
        wordsStudied: Math.max(wordsStudied || 0, 0),
        wordsMarked: wordsMarked || [],
        quizScore,
        notes,
        sermonIdeas,
        isCompleted,
        studiedAt: new Date(),
      },
      create: {
        userId,
        verseId,
        timeSpent: timeSpent || 0,
        wordsStudied: wordsStudied || 0,
        wordsMarked: wordsMarked || [],
        quizScore,
        notes,
        sermonIdeas,
        isCompleted,
      },
    });

    // 계획이 있으면 다음 구절로 이동
    if (isCompleted) {
      const plan = await prisma.dailyBiblePlan.findFirst({
        where: {
          userId,
          isActive: true,
        },
      });

      if (plan) {
        // 다음 구절 계산
        const currentVerse = await prisma.bibleVerse.findUnique({
          where: { id: verseId },
        });

        if (currentVerse) {
          await prisma.dailyBiblePlan.update({
            where: { id: plan.id },
            data: {
              currentVerse: currentVerse.verse + 1,
              totalVersesCompleted: { increment: 1 },
              lastStudiedAt: new Date(),
            },
          });
        }
      }
    }

    console.log(`✅ 성경 학습 진도 기록: ${userId} - ${verseId}`);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    console.error('❌ 성경 학습 진도 기록 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message || '진도 기록에 실패했습니다',
    });
  }
});

/**
 * GET /api/bible/progress/history
 * 사용자의 성경 학습 히스토리 가져오기
 *
 * Query Parameters:
 *   - userId: 사용자 ID (필수)
 *   - limit: 가져올 개수 (optional, default: 20)
 */
router.get('/progress/history', async (req: Request, res: Response) => {
  try {
    const { userId, limit } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID가 필요합니다',
      });
    }

    const history = await prisma.bibleStudyProgress.findMany({
      where: {
        userId: userId as string,
      },
      include: {
        verse: true,
      },
      orderBy: {
        studiedAt: 'desc',
      },
      take: limit ? parseInt(limit as string) : 20,
    });

    console.log(`📚 성경 학습 히스토리 조회: ${userId}`);

    res.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error: any) {
    console.error('❌ 성경 학습 히스토리 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message || '히스토리를 불러오는데 실패했습니다',
    });
  }
});

/**
 * POST /api/bible/plan
 * 성경 읽기 계획 생성
 *
 * Body: {
 *   userId: string,
 *   planName: string,
 *   description?: string,
 *   startBook: string,
 *   startChapter: number,
 *   startVerse: number,
 *   dailyVerseCount: number,
 *   level?: CEFRLevel
 * }
 */
router.post('/plan', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      planName,
      description,
      startBook,
      startChapter,
      startVerse,
      dailyVerseCount,
      level,
    } = req.body;

    if (!userId || !planName || !startBook) {
      return res.status(400).json({
        success: false,
        error: '필수 정보가 누락되었습니다',
      });
    }

    // 기존 활성화된 계획 비활성화
    await prisma.dailyBiblePlan.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // 새 계획 생성
    const plan = await prisma.dailyBiblePlan.create({
      data: {
        userId,
        planName,
        description,
        currentBook: startBook,
        currentChapter: startChapter || 1,
        currentVerse: startVerse || 1,
        dailyVerseCount: dailyVerseCount || 1,
        level,
        isActive: true,
      },
    });

    console.log(`📅 성경 읽기 계획 생성: ${planName} - ${userId}`);

    res.json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    console.error('❌ 성경 읽기 계획 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message || '계획 생성에 실패했습니다',
    });
  }
});

/**
 * GET /api/bible/books
 * 성경 목록 가져오기 (통계 포함)
 */
router.get('/books', async (req: Request, res: Response) => {
  try {
    // 책별로 그룹화해서 가져오기
    const booksData = await prisma.bibleVerse.groupBy({
      by: ['book', 'bookHungarian'],
      _count: {
        id: true,
      },
      orderBy: {
        book: 'asc',
      },
    });

    const books = booksData.map((book) => ({
      name: book.book,
      nameHungarian: book.bookHungarian,
      verseCount: book._count.id,
    }));

    res.json({
      success: true,
      data: books,
      count: books.length,
    });
  } catch (error: any) {
    console.error('❌ 성경 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message || '성경 목록을 불러오는데 실패했습니다',
    });
  }
});

export default router;
