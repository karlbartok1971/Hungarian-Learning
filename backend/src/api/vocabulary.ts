import express from 'express';
import { PrismaClient, CEFRLevel, WordType } from '@prisma/client';

export const vocabularyRoutes = express.Router();
const prisma = new PrismaClient();

// 품사 역매핑 (WordType -> 한글)
function mapWordTypeToKorean(type: WordType): string {
  switch (type) {
    case WordType.NOUN: return '명사';
    case WordType.VERB: return '동사';
    case WordType.ADJECTIVE: return '형용사';
    case WordType.ADVERB: return '부사';
    case WordType.PRONOUN: return '대명사';
    case WordType.PREPOSITION: return '전치사';
    case WordType.CONJUNCTION: return '접속사';
    case WordType.INTERJECTION: return '감탄사';
    case WordType.PARTICLE: return '조사';
    case WordType.NUMERAL: return '수사';
    case WordType.PHRASE: return '표현';
    case WordType.DETERMINER: return '관사';
    default: return '기타';
  }
}

/**
 * GET /api/vocabulary/:level
 * 특정 레벨의 단어장 데이터 반환 (Supabase DB 조회)
 */
vocabularyRoutes.get('/:level', async (req, res) => {
  try {
    const { level } = req.params;
    const targetLevel = level.toUpperCase() as CEFRLevel;

    // 유효한 레벨인지 확인
    if (!Object.values(CEFRLevel).includes(targetLevel)) {
      return res.status(400).json({ error: '유효하지 않은 레벨입니다.' });
    }

    console.log(`[Vocabulary API] Fetching from DB for level: ${targetLevel}`);

    // DB에서 단어 조회
    const words = await prisma.vocabularyItem.findMany({
      where: {
        level: targetLevel,
        isActive: true
      },
      orderBy: [
        { topicId: 'asc' }, // 토픽별 정렬
        { hungarian: 'asc' }
      ]
    });

    if (words.length === 0) {
      return res.status(404).json({ error: '데이터가 없습니다.' });
    }

    // 데이터 그룹핑 (Topic 기준)
    const topicsMap = new Map<string, any>();

    words.forEach(word => {
      const topicId = word.topicId || 'misc';

      if (!topicsMap.has(topicId)) {
        topicsMap.set(topicId, {
          id: topicId,
          title: word.topicTitle || '기타',
          emoji: '📚', // DB에 이모지가 없으면 기본값 (추후 스키마 추가 고려)
          words: []
        });
      }

      // 프론트엔드 포맷으로 단어 변환
      const wordData = {
        hu: word.hungarian,
        ko: word.korean,
        pron: word.pronunciation || '',
        pos: mapWordTypeToKorean(word.wordType),
        exHu: (word.examples as any[])?.[0]?.hu || '',
        exKo: (word.examples as any[])?.[0]?.ko || ''
      };

      topicsMap.get(topicId).words.push(wordData);
    });

    // 최종 응답 데이터 구성
    const responseData = {
      level: level.toLowerCase(),
      title: `${targetLevel} 필수 어휘`,
      description: `Supabase에서 불러온 ${targetLevel} 레벨 단어장입니다.`,
      topics: Array.from(topicsMap.values())
    };

    res.json(responseData);

  } catch (error) {
    console.error('[Vocabulary API] Error:', error);
    res.status(500).json({ error: 'DB에서 어휘 데이터를 불러오는 중 오류가 발생했습니다.' });
  }
});

// 헬스 체크용
vocabularyRoutes.get('/status', (_, res) => {
  res.json({ success: true, message: 'Vocabulary API Active (Supabase Connected)' });
});
