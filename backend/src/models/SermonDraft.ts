import { SermonDraft as PrismaSermonDraft, SermonStatus, SermonAudience, SermonStyle } from '@prisma/client';
import prisma from '../lib/prisma';

/**
 * 설교문 초안 생성을 위한 입력 데이터
 */
export interface CreateSermonDraftInput {
  userId: string;
  title: {
    hungarian: string;
    korean: string;
  };
  scriptureReference: string;
  topic?: {
    korean?: string;
    theological_concept?: string;
  };
  content: {
    introduction?: string;
    main_body?: string;
    conclusion?: string;
    outline?: SermonSection[];
  };
  metadata: {
    target_audience: SermonAudience;
    estimated_duration: number; // 분 단위
    difficulty_level: string; // A1, A2, B1, B2
    tags?: string[];
    style?: SermonStyle;
  };
}

/**
 * 설교문 업데이트를 위한 입력 데이터
 */
export interface UpdateSermonDraftInput {
  title?: {
    hungarian?: string;
    korean?: string;
  };
  scriptureReference?: string;
  content?: {
    introduction?: string;
    main_body?: string;
    conclusion?: string;
    outline?: SermonSection[];
  };
  metadata?: {
    target_audience?: SermonAudience;
    estimated_duration?: number;
    difficulty_level?: string;
    tags?: string[];
    style?: SermonStyle;
  };
  status?: SermonStatus;
  lastEditedAt?: Date;
}

/**
 * 설교 섹션 구조
 */
export interface SermonSection {
  type: 'introduction' | 'main_point' | 'illustration' | 'application' | 'conclusion';
  title: string;
  content?: string;
  suggested_content?: string;
  key_vocabulary?: string[];
  estimated_duration?: number;
  order: number;
}

/**
 * 설교문 검색 필터
 */
export interface SermonSearchFilters {
  userId?: string;
  status?: SermonStatus;
  tags?: string[];
  difficulty_level?: string;
  audience?: SermonAudience;
  style?: SermonStyle;
  dateRange?: {
    from: Date;
    to: Date;
  };
  search_term?: string; // 제목이나 내용에서 검색
}

/**
 * 설교문 통계 정보
 */
export interface SermonStats {
  total_count: number;
  by_status: Record<SermonStatus, number>;
  by_audience: Record<SermonAudience, number>;
  by_difficulty: Record<string, number>;
  recent_activity: {
    created_this_month: number;
    completed_this_month: number;
    avg_duration: number;
  };
}

/**
 * 설교문 초안 모델 클래스
 * 헝가리어 설교문 작성을 위한 데이터 모델 및 비즈니스 로직
 */
export class SermonDraftModel {

  /**
   * 새 설교문 초안 생성
   */
  static async create(draftData: CreateSermonDraftInput): Promise<PrismaSermonDraft> {
    try {
      return await prisma.sermonDraft.create({
        data: {
          userId: draftData.userId,
          title: JSON.stringify(draftData.title),
          scriptureReference: draftData.scriptureReference,
          topic: draftData.topic ? JSON.stringify(draftData.topic) : null,
          content: JSON.stringify(draftData.content),
          metadata: JSON.stringify(draftData.metadata),
          status: 'DRAFT',
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw new Error(`설교문 초안 생성 실패: ${(error as Error).message}`);
    }
  }

  /**
   * ID로 설교문 초안 조회
   */
  static async findById(id: string): Promise<PrismaSermonDraft | null> {
    try {
      return await prisma.sermonDraft.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`설교문 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 사용자의 모든 설교문 목록 조회
   */
  static async findByUserId(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      sort?: 'recent' | 'title' | 'status';
      filters?: SermonSearchFilters;
    } = {}
  ): Promise<{ drafts: PrismaSermonDraft[]; total_count: number }> {
    try {
      const { limit = 10, offset = 0, sort = 'recent', filters = {} } = options;

      // 검색 조건 구성
      const whereClause: any = {
        userId,
        ...(filters.status && { status: filters.status }),
        ...(filters.difficulty_level && {
          metadata: {
            path: ['difficulty_level'],
            equals: filters.difficulty_level
          }
        }),
        ...(filters.search_term && {
          OR: [
            { title: { contains: filters.search_term } },
            { content: { contains: filters.search_term } },
          ],
        }),
        ...(filters.dateRange && {
          createdAt: {
            gte: filters.dateRange.from,
            lte: filters.dateRange.to,
          },
        }),
      };

      // 정렬 조건 구성
      let orderBy: any = { createdAt: 'desc' }; // 기본값: 최신순
      if (sort === 'title') {
        orderBy = { title: 'asc' };
      } else if (sort === 'status') {
        orderBy = { status: 'asc' };
      }

      const [drafts, total_count] = await Promise.all([
        prisma.sermonDraft.findMany({
          where: whereClause,
          orderBy,
          take: limit,
          skip: offset,
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.sermonDraft.count({
          where: whereClause,
        }),
      ]);

      return { drafts, total_count };
    } catch (error) {
      throw new Error(`설교문 목록 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 설교문 초안 업데이트
   */
  static async update(id: string, updateData: UpdateSermonDraftInput): Promise<PrismaSermonDraft> {
    try {
      const existingDraft = await prisma.sermonDraft.findUnique({
        where: { id },
      });

      if (!existingDraft) {
        throw new Error('설교문을 찾을 수 없습니다');
      }

      // 기존 데이터와 새 데이터 병합
      const updatedData: any = {
        updatedAt: new Date(),
        lastEditedAt: new Date(),
      };

      if (updateData.title) {
        const existingTitle = JSON.parse(existingDraft.title || '{}');
        updatedData.title = JSON.stringify({ ...existingTitle, ...updateData.title });
      }

      if (updateData.content) {
        const existingContent = JSON.parse(existingDraft.content || '{}');
        updatedData.content = JSON.stringify({ ...existingContent, ...updateData.content });
      }

      if (updateData.metadata) {
        const existingMetadata = JSON.parse(existingDraft.metadata || '{}');
        updatedData.metadata = JSON.stringify({ ...existingMetadata, ...updateData.metadata });
      }

      if (updateData.scriptureReference) {
        updatedData.scriptureReference = updateData.scriptureReference;
      }

      if (updateData.status) {
        updatedData.status = updateData.status;
      }

      // 버전 증가 (중요한 변경사항이 있을 때만)
      if (updateData.content || updateData.title) {
        updatedData.version = existingDraft.version + 1;
      }

      return await prisma.sermonDraft.update({
        where: { id },
        data: updatedData,
      });
    } catch (error) {
      throw new Error(`설교문 업데이트 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 설교문 상태 변경 (작성 중 → 완료 → 보관됨)
   */
  static async updateStatus(id: string, status: SermonStatus, userId?: string): Promise<PrismaSermonDraft> {
    try {
      const whereClause: any = { id };
      if (userId) {
        whereClause.userId = userId; // 사용자 권한 확인
      }

      return await prisma.sermonDraft.update({
        where: whereClause,
        data: {
          status,
          updatedAt: new Date(),
          ...(status === 'COMPLETED' && { completedAt: new Date() }),
        },
      });
    } catch (error) {
      throw new Error(`설교문 상태 변경 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 설교문 복제 생성
   */
  static async duplicate(id: string, userId: string): Promise<PrismaSermonDraft> {
    try {
      const originalDraft = await this.findById(id);
      if (!originalDraft) {
        throw new Error('원본 설교문을 찾을 수 없습니다');
      }

      const title = JSON.parse(originalDraft.title || '{}');
      const content = JSON.parse(originalDraft.content || '{}');
      const metadata = JSON.parse(originalDraft.metadata || '{}');

      const duplicateData: CreateSermonDraftInput = {
        userId,
        title: {
          hungarian: `${title.hungarian} (복사본)`,
          korean: `${title.korean} (복사본)`,
        },
        scriptureReference: originalDraft.scriptureReference,
        topic: originalDraft.topic ? JSON.parse(originalDraft.topic) : undefined,
        content,
        metadata,
      };

      return await this.create(duplicateData);
    } catch (error) {
      throw new Error(`설교문 복제 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 설교문 삭제 (실제로는 상태를 ARCHIVED로 변경)
   */
  static async delete(id: string, userId: string): Promise<boolean> {
    try {
      await prisma.sermonDraft.update({
        where: {
          id,
          userId, // 사용자 권한 확인
        },
        data: {
          status: 'ARCHIVED',
          updatedAt: new Date(),
        },
      });
      return true;
    } catch (error) {
      throw new Error(`설교문 삭제 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 사용자별 설교문 통계 조회
   */
  static async getUserStats(userId: string): Promise<SermonStats> {
    try {
      const [allSermons, statusCounts] = await Promise.all([
        prisma.sermonDraft.findMany({
          where: { userId },
          select: {
            status: true,
            metadata: true,
            createdAt: true,
            completedAt: true,
          },
        }),
        prisma.sermonDraft.groupBy({
          by: ['status'],
          where: { userId },
          _count: true,
        }),
      ]);

      const total_count = allSermons.length;

      // 상태별 집계
      const by_status = statusCounts.reduce((acc, curr) => {
        acc[curr.status as SermonStatus] = curr._count;
        return acc;
      }, {} as Record<SermonStatus, number>);

      // 대상 회중별 집계
      const by_audience: Record<SermonAudience, number> = {
        GENERAL_CONGREGATION: 0,
        MATURE_BELIEVERS: 0,
        NEW_BELIEVERS: 0,
        YOUTH: 0,
        CHILDREN: 0,
      };

      // 난이도별 집계
      const by_difficulty: Record<string, number> = {};

      allSermons.forEach(sermon => {
        const metadata = JSON.parse(sermon.metadata || '{}');
        if (metadata.target_audience) {
          by_audience[metadata.target_audience as SermonAudience]++;
        }
        if (metadata.difficulty_level) {
          by_difficulty[metadata.difficulty_level] = (by_difficulty[metadata.difficulty_level] || 0) + 1;
        }
      });

      // 최근 활동 통계
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const created_this_month = allSermons.filter(
        sermon => sermon.createdAt >= thisMonth
      ).length;

      const completed_this_month = allSermons.filter(
        sermon => sermon.completedAt && sermon.completedAt >= thisMonth
      ).length;

      const durations = allSermons
        .map(sermon => JSON.parse(sermon.metadata || '{}').estimated_duration)
        .filter(duration => duration && !isNaN(duration));

      const avg_duration = durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

      return {
        total_count,
        by_status,
        by_audience,
        by_difficulty,
        recent_activity: {
          created_this_month,
          completed_this_month,
          avg_duration: Math.round(avg_duration),
        },
      };
    } catch (error) {
      throw new Error(`설교문 통계 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 설교문 검색 (전체 텍스트 검색)
   */
  static async search(
    searchTerm: string,
    userId?: string,
    filters: SermonSearchFilters = {}
  ): Promise<PrismaSermonDraft[]> {
    try {
      const whereClause: any = {
        ...(userId && { userId }),
        OR: [
          { title: { contains: searchTerm } },
          { content: { contains: searchTerm } },
          { scriptureReference: { contains: searchTerm } },
        ],
        ...(filters.status && { status: filters.status }),
        ...(filters.difficulty_level && {
          metadata: {
            path: ['difficulty_level'],
            equals: filters.difficulty_level,
          },
        }),
      };

      return await prisma.sermonDraft.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        take: 20, // 검색 결과 제한
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`설교문 검색 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 최근 편집된 설교문 조회
   */
  static async getRecentlyEdited(userId: string, limit: number = 5): Promise<PrismaSermonDraft[]> {
    try {
      return await prisma.sermonDraft.findMany({
        where: {
          userId,
          status: {
            not: 'ARCHIVED',
          },
        },
        orderBy: { lastEditedAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      throw new Error(`최근 편집 설교문 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 설교문 백업 생성
   */
  static async createBackup(id: string): Promise<{ backup_id: string; created_at: Date }> {
    try {
      const draft = await this.findById(id);
      if (!draft) {
        throw new Error('설교문을 찾을 수 없습니다');
      }

      // 백업 데이터 생성 (실제로는 별도 백업 테이블에 저장)
      const backupId = `backup_${id}_${Date.now()}`;
      const created_at = new Date();

      // TODO: 실제 백업 테이블에 저장하는 로직 구현
      console.log(`설교문 ${id} 백업 생성: ${backupId}`);

      return {
        backup_id: backupId,
        created_at,
      };
    } catch (error) {
      throw new Error(`설교문 백업 실패: ${(error as Error).message}`);
    }
  }
}

export default SermonDraftModel;