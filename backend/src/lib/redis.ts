import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Redis 클라이언트 생성
const redis = createClient({
  url: REDIS_URL,
});

// 에러 핸들링
redis.on('error', (err) => {
  console.error('Redis 연결 에러:', err);
});

redis.on('connect', () => {
  console.log('✅ Redis 연결 성공');
});

// 연결 초기화
let isConnected = false;

export const connectRedis = async (): Promise<void> => {
  if (!isConnected) {
    try {
      await redis.connect();
      isConnected = true;
      console.log('🔗 Redis 클라이언트가 연결되었습니다.');
    } catch (error) {
      console.warn('⚠️ Redis 연결 실패 (선택적 기능이므로 계속 진행):', error);
    }
  }
};

// 세션 관리 함수들
export const sessionService = {
  /**
   * 세션 저장
   */
  async set(key: string, value: any, expireInSeconds = 3600): Promise<void> {
    try {
      if (isConnected) {
        await redis.setEx(key, expireInSeconds, JSON.stringify(value));
      }
    } catch (error) {
      console.warn('Redis 저장 실패:', error);
    }
  },

  /**
   * 세션 조회
   */
  async get(key: string): Promise<any | null> {
    try {
      if (isConnected) {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
      }
      return null;
    } catch (error) {
      console.warn('Redis 조회 실패:', error);
      return null;
    }
  },

  /**
   * 세션 삭제
   */
  async del(key: string): Promise<void> {
    try {
      if (isConnected) {
        await redis.del(key);
      }
    } catch (error) {
      console.warn('Redis 삭제 실패:', error);
    }
  },

  /**
   * 세션 만료시간 설정
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      if (isConnected) {
        await redis.expire(key, seconds);
      }
    } catch (error) {
      console.warn('Redis 만료시간 설정 실패:', error);
    }
  },
};

// 캐싱 서비스
export const cacheService = {
  /**
   * 캐시 저장
   */
  async set(key: string, value: any, ttlSeconds = 3600): Promise<void> {
    await sessionService.set(`cache:${key}`, value, ttlSeconds);
  },

  /**
   * 캐시 조회
   */
  async get(key: string): Promise<any | null> {
    return await sessionService.get(`cache:${key}`);
  },

  /**
   * 캐시 삭제
   */
  async del(key: string): Promise<void> {
    await sessionService.del(`cache:${key}`);
  },

  /**
   * 패턴으로 캐시 무효화
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (isConnected) {
        const keys = await redis.keys(`cache:${pattern}`);
        if (keys.length > 0) {
          await redis.del(keys);
        }
      }
    } catch (error) {
      console.warn('Redis 패턴 무효화 실패:', error);
    }
  },
};

export default redis;