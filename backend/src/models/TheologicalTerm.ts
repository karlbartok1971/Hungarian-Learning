import { TheologicalTerm as PrismaTheologicalTerm, TheologicalCategory, DifficultyLevel } from '@prisma/client';
import prisma from '../lib/prisma';

/**
 * 신학 용어 생성을 위한 입력 데이터
 */
export interface CreateTheologicalTermInput {
  hungarian: string;
  korean_meaning: string;
  category: TheologicalCategory;
  difficulty_level: DifficultyLevel;
  definition_hungarian: string;
  definition_korean: string;
  usage_examples: string[];
  related_terms?: string[];
  pronunciation_guide?: string;
  etymology?: string;
  scripture_references?: string[];
  synonyms?: string[];
  antonyms?: string[];
  notes?: string;
}

/**
 * 신학 용어 업데이트를 위한 입력 데이터
 */
export interface UpdateTheologicalTermInput {
  hungarian?: string;
  korean_meaning?: string;
  category?: TheologicalCategory;
  difficulty_level?: DifficultyLevel;
  definition_hungarian?: string;
  definition_korean?: string;
  usage_examples?: string[];
  related_terms?: string[];
  pronunciation_guide?: string;
  etymology?: string;
  scripture_references?: string[];
  synonyms?: string[];
  antonyms?: string[];
  notes?: string;
  usage_frequency?: number;
  last_used_at?: Date;
}

/**
 * 신학 용어 검색 필터
 */
export interface TheologicalTermFilters {
  category?: TheologicalCategory[];
  difficulty_level?: DifficultyLevel[];
  search_term?: string;
  starts_with?: string; // 특정 글자로 시작하는 용어들
  usage_frequency_min?: number;
  recently_used?: boolean;
  has_pronunciation?: boolean;
  has_etymology?: boolean;
}

/**
 * 신학 용어 검색 결과
 */
export interface TheologicalTermSearchResult {
  terms: PrismaTheologicalTerm[];
  total_count: number;
  categories_found: TheologicalCategory[];
  difficulty_distribution: Record<DifficultyLevel, number>;
}

/**
 * 용어 사용 통계
 */
export interface TermUsageStats {
  term_id: string;
  hungarian: string;
  usage_count: number;
  last_used_at: Date | null;
  contexts: string[]; // 어떤 설교문에서 사용되었는지
  user_frequency: number; // 특정 사용자의 사용 빈도
}

/**
 * 신학 용어 추천 결과
 */
export interface TermRecommendation {
  term: PrismaTheologicalTerm;
  relevance_score: number;
  reason: 'related_topic' | 'difficulty_match' | 'frequent_combination' | 'semantic_similarity';
  explanation: string;
}

/**
 * 신학 용어 모델 클래스
 * 헝가리어-한국어 신학 전문 용어 관리를 위한 데이터 모델
 */
export class TheologicalTermModel {

  /**
   * 새 신학 용어 생성
   */
  static async create(termData: CreateTheologicalTermInput): Promise<PrismaTheologicalTerm> {
    try {
      return await prisma.theologicalTerm.create({
        data: {
          hungarian: termData.hungarian.toLowerCase().trim(),
          korean_meaning: termData.korean_meaning,
          category: termData.category,
          difficulty_level: termData.difficulty_level,
          definition_hungarian: termData.definition_hungarian,
          definition_korean: termData.definition_korean,
          usage_examples: JSON.stringify(termData.usage_examples || []),
          related_terms: JSON.stringify(termData.related_terms || []),
          pronunciation_guide: termData.pronunciation_guide,
          etymology: termData.etymology,
          scripture_references: JSON.stringify(termData.scripture_references || []),
          synonyms: JSON.stringify(termData.synonyms || []),
          antonyms: JSON.stringify(termData.antonyms || []),
          notes: termData.notes,
          usage_frequency: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw new Error(`신학 용어 생성 실패: ${(error as Error).message}`);
    }
  }

  /**
   * ID로 신학 용어 조회
   */
  static async findById(id: string): Promise<PrismaTheologicalTerm | null> {
    try {
      return await prisma.theologicalTerm.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error(`신학 용어 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 헝가리어 용어로 검색
   */
  static async findByHungarian(hungarian: string): Promise<PrismaTheologicalTerm | null> {
    try {
      return await prisma.theologicalTerm.findUnique({
        where: { hungarian: hungarian.toLowerCase().trim() },
      });
    } catch (error) {
      throw new Error(`신학 용어 검색 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 한국어 의미로 검색
   */
  static async findByKoreanMeaning(korean: string): Promise<PrismaTheologicalTerm[]> {
    try {
      return await prisma.theologicalTerm.findMany({
        where: {
          korean_meaning: {
            contains: korean,
          },
        },
        orderBy: { usage_frequency: 'desc' },
      });
    } catch (error) {
      throw new Error(`한국어 의미 검색 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 복합 검색 (다양한 필터 적용)
   */
  static async search(
    filters: TheologicalTermFilters,
    options: {
      limit?: number;
      offset?: number;
      sort?: 'relevance' | 'alphabetical' | 'frequency' | 'difficulty';
    } = {}
  ): Promise<TheologicalTermSearchResult> {
    try {
      const { limit = 20, offset = 0, sort = 'relevance' } = options;

      // 검색 조건 구성
      const whereClause: any = {};

      if (filters.category && filters.category.length > 0) {
        whereClause.category = { in: filters.category };
      }

      if (filters.difficulty_level && filters.difficulty_level.length > 0) {
        whereClause.difficulty_level = { in: filters.difficulty_level };
      }

      if (filters.search_term) {
        whereClause.OR = [
          { hungarian: { contains: filters.search_term } },
          { korean_meaning: { contains: filters.search_term } },
          { definition_hungarian: { contains: filters.search_term } },
          { definition_korean: { contains: filters.search_term } },
        ];
      }

      if (filters.starts_with) {
        whereClause.hungarian = { startsWith: filters.starts_with.toLowerCase() };
      }

      if (filters.usage_frequency_min) {
        whereClause.usage_frequency = { gte: filters.usage_frequency_min };
      }

      if (filters.recently_used) {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        whereClause.last_used_at = { gte: oneMonthAgo };
      }

      if (filters.has_pronunciation) {
        whereClause.pronunciation_guide = { not: null };
      }

      if (filters.has_etymology) {
        whereClause.etymology = { not: null };
      }

      // 정렬 조건 구성
      let orderBy: any = { usage_frequency: 'desc' }; // 기본값: 사용 빈도순
      switch (sort) {
        case 'alphabetical':
          orderBy = { hungarian: 'asc' };
          break;
        case 'difficulty':
          orderBy = [{ difficulty_level: 'asc' }, { hungarian: 'asc' }];
          break;
        case 'frequency':
          orderBy = { usage_frequency: 'desc' };
          break;
      }

      const [terms, total_count, categoryStats, difficultyStats] = await Promise.all([
        prisma.theologicalTerm.findMany({
          where: whereClause,
          orderBy,
          take: limit,
          skip: offset,
        }),
        prisma.theologicalTerm.count({
          where: whereClause,
        }),
        prisma.theologicalTerm.groupBy({
          by: ['category'],
          where: whereClause,
          _count: true,
        }),
        prisma.theologicalTerm.groupBy({
          by: ['difficulty_level'],
          where: whereClause,
          _count: true,
        }),
      ]);

      const categories_found = categoryStats.map(stat => stat.category);
      const difficulty_distribution = difficultyStats.reduce((acc, stat) => {
        acc[stat.difficulty_level] = stat._count;
        return acc;
      }, {} as Record<DifficultyLevel, number>);

      return {
        terms,
        total_count,
        categories_found,
        difficulty_distribution,
      };
    } catch (error) {
      throw new Error(`신학 용어 검색 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 카테고리별 용어 목록 조회
   */
  static async findByCategory(
    category: TheologicalCategory,
    difficulty?: DifficultyLevel
  ): Promise<PrismaTheologicalTerm[]> {
    try {
      const whereClause: any = { category };
      if (difficulty) {
        whereClause.difficulty_level = difficulty;
      }

      return await prisma.theologicalTerm.findMany({
        where: whereClause,
        orderBy: [{ difficulty_level: 'asc' }, { hungarian: 'asc' }],
      });
    } catch (error) {
      throw new Error(`카테고리별 용어 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 신학 용어 업데이트
   */
  static async update(id: string, updateData: UpdateTheologicalTermInput): Promise<PrismaTheologicalTerm> {
    try {
      const existingTerm = await prisma.theologicalTerm.findUnique({
        where: { id },
      });

      if (!existingTerm) {
        throw new Error('신학 용어를 찾을 수 없습니다');
      }

      const updatedData: any = {
        updatedAt: new Date(),
      };

      // 간단한 필드들 업데이트
      const simpleFields = ['hungarian', 'korean_meaning', 'category', 'difficulty_level',
                           'definition_hungarian', 'definition_korean', 'pronunciation_guide',
                           'etymology', 'notes', 'usage_frequency', 'last_used_at'];

      simpleFields.forEach(field => {
        if (updateData[field as keyof UpdateTheologicalTermInput] !== undefined) {
          updatedData[field] = updateData[field as keyof UpdateTheologicalTermInput];
        }
      });

      // JSON 배열 필드들 업데이트
      if (updateData.usage_examples) {
        updatedData.usage_examples = JSON.stringify(updateData.usage_examples);
      }
      if (updateData.related_terms) {
        updatedData.related_terms = JSON.stringify(updateData.related_terms);
      }
      if (updateData.scripture_references) {
        updatedData.scripture_references = JSON.stringify(updateData.scripture_references);
      }
      if (updateData.synonyms) {
        updatedData.synonyms = JSON.stringify(updateData.synonyms);
      }
      if (updateData.antonyms) {
        updatedData.antonyms = JSON.stringify(updateData.antonyms);
      }

      return await prisma.theologicalTerm.update({
        where: { id },
        data: updatedData,
      });
    } catch (error) {
      throw new Error(`신학 용어 업데이트 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 용어 사용 빈도 증가
   */
  static async incrementUsage(termId: string, context?: string): Promise<void> {
    try {
      await prisma.theologicalTerm.update({
        where: { id: termId },
        data: {
          usage_frequency: { increment: 1 },
          last_used_at: new Date(),
        },
      });

      // 사용 컨텍스트 기록 (별도 테이블에 저장)
      if (context) {
        // TODO: 사용 기록 테이블에 저장하는 로직 구현
        console.log(`용어 ${termId} 사용 기록: ${context}`);
      }
    } catch (error) {
      throw new Error(`용어 사용 기록 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 관련 용어 추천
   */
  static async getRecommendedTerms(
    baseTermId: string,
    context?: string,
    limit: number = 5
  ): Promise<TermRecommendation[]> {
    try {
      const baseTerm = await this.findById(baseTermId);
      if (!baseTerm) {
        throw new Error('기준 용어를 찾을 수 없습니다');
      }

      const relatedTerms = JSON.parse(baseTerm.related_terms || '[]');
      const recommendations: TermRecommendation[] = [];

      // 1. 직접 관련 용어들
      if (relatedTerms.length > 0) {
        const directlyRelated = await prisma.theologicalTerm.findMany({
          where: {
            hungarian: { in: relatedTerms },
          },
          take: Math.min(3, limit),
        });

        directlyRelated.forEach(term => {
          recommendations.push({
            term,
            relevance_score: 0.9,
            reason: 'related_topic',
            explanation: '직접적으로 관련된 신학 용어입니다',
          });
        });
      }

      // 2. 같은 카테고리의 유사 난이도 용어들
      if (recommendations.length < limit) {
        const similarTerms = await prisma.theologicalTerm.findMany({
          where: {
            category: baseTerm.category,
            difficulty_level: baseTerm.difficulty_level,
            id: { not: baseTermId },
            hungarian: { notIn: relatedTerms },
          },
          orderBy: { usage_frequency: 'desc' },
          take: limit - recommendations.length,
        });

        similarTerms.forEach(term => {
          recommendations.push({
            term,
            relevance_score: 0.7,
            reason: 'difficulty_match',
            explanation: '같은 난이도의 관련 분야 용어입니다',
          });
        });
      }

      // 3. 자주 함께 사용되는 용어들 (실제로는 사용 기록 분석 필요)
      if (recommendations.length < limit) {
        const frequentTerms = await prisma.theologicalTerm.findMany({
          where: {
            category: baseTerm.category,
            id: { not: baseTermId },
            usage_frequency: { gte: 1 },
          },
          orderBy: { usage_frequency: 'desc' },
          take: limit - recommendations.length,
        });

        frequentTerms.forEach(term => {
          recommendations.push({
            term,
            relevance_score: 0.5,
            reason: 'frequent_combination',
            explanation: '자주 함께 사용되는 용어입니다',
          });
        });
      }

      return recommendations.slice(0, limit);
    } catch (error) {
      throw new Error(`관련 용어 추천 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 사용자별 용어 사용 통계 조회
   */
  static async getUserTermStats(userId: string, limit: number = 10): Promise<TermUsageStats[]> {
    try {
      // TODO: 실제로는 사용자별 용어 사용 기록 테이블에서 조회
      // 현재는 모의 데이터 반환
      const mockStats: TermUsageStats[] = [
        {
          term_id: 'term1',
          hungarian: 'kegyelem',
          usage_count: 15,
          last_used_at: new Date(),
          contexts: ['설교문1', '설교문3'],
          user_frequency: 0.8,
        },
        {
          term_id: 'term2',
          hungarian: 'megigazulás',
          usage_count: 12,
          last_used_at: new Date(),
          contexts: ['설교문2', '설교문4'],
          user_frequency: 0.6,
        },
      ];

      return mockStats.slice(0, limit);
    } catch (error) {
      throw new Error(`사용자 용어 통계 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 신학 용어 일괄 추가 (CSV나 JSON에서 가져오기)
   */
  static async bulkCreate(terms: CreateTheologicalTermInput[]): Promise<{
    created: number;
    skipped: number;
    errors: string[];
  }> {
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const termData of terms) {
      try {
        // 중복 확인
        const existing = await this.findByHungarian(termData.hungarian);
        if (existing) {
          skipped++;
          continue;
        }

        await this.create(termData);
        created++;
      } catch (error) {
        errors.push(`${termData.hungarian}: ${(error as Error).message}`);
      }
    }

    return { created, skipped, errors };
  }

  /**
   * 알파벳순 용어 목록 (사전 기능)
   */
  static async getDictionary(
    startLetter?: string,
    category?: TheologicalCategory
  ): Promise<{ [key: string]: PrismaTheologicalTerm[] }> {
    try {
      const whereClause: any = {};
      if (startLetter) {
        whereClause.hungarian = { startsWith: startLetter.toLowerCase() };
      }
      if (category) {
        whereClause.category = category;
      }

      const terms = await prisma.theologicalTerm.findMany({
        where: whereClause,
        orderBy: { hungarian: 'asc' },
      });

      // 첫 글자별로 그룹화
      const dictionary: { [key: string]: PrismaTheologicalTerm[] } = {};
      terms.forEach(term => {
        const firstLetter = term.hungarian.charAt(0).toUpperCase();
        if (!dictionary[firstLetter]) {
          dictionary[firstLetter] = [];
        }
        dictionary[firstLetter].push(term);
      });

      return dictionary;
    } catch (error) {
      throw new Error(`신학 용어 사전 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 용어 삭제
   */
  static async delete(id: string): Promise<boolean> {
    try {
      await prisma.theologicalTerm.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      throw new Error(`신학 용어 삭제 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 무작위 용어 조회 (학습 목적)
   */
  static async getRandomTerms(
    count: number = 5,
    difficulty?: DifficultyLevel,
    category?: TheologicalCategory
  ): Promise<PrismaTheologicalTerm[]> {
    try {
      const whereClause: any = {};
      if (difficulty) {
        whereClause.difficulty_level = difficulty;
      }
      if (category) {
        whereClause.category = category;
      }

      // PostgreSQL의 RANDOM() 함수 사용
      const terms = await prisma.$queryRaw`
        SELECT * FROM "TheologicalTerm"
        ${difficulty || category ? 'WHERE' : ''}
        ${difficulty ? 'difficulty_level = ${difficulty}' : ''}
        ${difficulty && category ? 'AND' : ''}
        ${category ? 'category = ${category}' : ''}
        ORDER BY RANDOM()
        LIMIT ${count}
      ` as PrismaTheologicalTerm[];

      return terms;
    } catch (error) {
      throw new Error(`무작위 용어 조회 실패: ${(error as Error).message}`);
    }
  }
}

export default TheologicalTermModel;