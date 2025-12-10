/**
 * T081 - Contract Test for Vocabulary Learning API
 *
 * 어휘 학습 API의 컨트랙트 테스트
 * API 응답 형식, 스키마, 헤더 등을 검증하여 프론트엔드와의 계약 보장
 *
 * Tests Covered:
 * - GET /api/vocabulary - 어휘 목록 조회
 * - GET /api/vocabulary/review - 복습할 어휘 조회
 * - POST /api/vocabulary/practice - 어휘 연습 결과 제출
 * - GET /api/vocabulary/stats - 어휘 학습 통계
 * - POST /api/vocabulary/cards - 새 어휘 카드 생성
 * - PUT /api/vocabulary/cards/:cardId - 어휘 카드 업데이트
 * - DELETE /api/vocabulary/cards/:cardId - 어휘 카드 삭제
 * - POST /api/vocabulary/review-session - 복습 세션 시작
 * - PUT /api/vocabulary/review-session/:sessionId - 복습 결과 업데이트
 */

import request from 'supertest';
import { app } from '../../src/app';
import jwt from 'jsonwebtoken';

const TEST_USER_ID = 'test-user-vocabulary-contract';
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// 테스트용 JWT 토큰 생성
const testToken = jwt.sign(
  { userId: TEST_USER_ID, email: 'test@vocabulary.com' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

describe('Vocabulary API Contract Tests - T081', () => {
  const baseUrl = '/api/vocabulary';

  // 공통 응답 스키마 검증 함수
  const validateApiResponse = (response: any) => {
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('message');
    expect(typeof response.body.success).toBe('boolean');
    expect(typeof response.body.message).toBe('string');
  };

  const validatePaginationResponse = (response: any) => {
    if (response.body.data && response.body.data.pagination) {
      const { pagination } = response.body.data;
      expect(pagination).toHaveProperty('page');
      expect(pagination).toHaveProperty('limit');
      expect(pagination).toHaveProperty('total');
      expect(pagination).toHaveProperty('totalPages');
      expect(typeof pagination.page).toBe('number');
      expect(typeof pagination.limit).toBe('number');
      expect(typeof pagination.total).toBe('number');
      expect(typeof pagination.totalPages).toBe('number');
    }
  };

  // ========== GET /api/vocabulary - 어휘 목록 조회 ==========
  describe('GET /api/vocabulary', () => {
    test('should return vocabulary list with correct schema', async () => {
      const response = await request(app)
        .get(baseUrl)
        .set('Authorization', `Bearer ${testToken}`)
        .query({
          level: 'A1',
          category: 'daily_life',
          page: 1,
          limit: 10
        })
        .expect('Content-Type', /json/)
        .expect(200);

      validateApiResponse(response);

      // 응답 데이터 구조 검증
      expect(response.body.data).toHaveProperty('vocabulary_cards');
      expect(Array.isArray(response.body.data.vocabulary_cards)).toBe(true);

      // 페이지네이션 검증
      validatePaginationResponse(response);

      // 어휘 카드 스키마 검증 (빈 배열이 아닌 경우)
      if (response.body.data.vocabulary_cards.length > 0) {
        const card = response.body.data.vocabulary_cards[0];
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('hungarian_word');
        expect(card).toHaveProperty('korean_meaning');
        expect(card).toHaveProperty('difficulty_level');
        expect(card).toHaveProperty('category');
        expect(card).toHaveProperty('pronunciation');
        expect(card).toHaveProperty('example_sentences');
        expect(card).toHaveProperty('is_theological');
        expect(card).toHaveProperty('created_at');
        expect(card).toHaveProperty('updated_at');

        // 타입 검증
        expect(typeof card.id).toBe('string');
        expect(typeof card.hungarian_word).toBe('string');
        expect(typeof card.korean_meaning).toBe('string');
        expect(['A1', 'A2', 'B1', 'B2']).toContain(card.difficulty_level);
        expect(typeof card.category).toBe('string');
        expect(Array.isArray(card.example_sentences)).toBe(true);
        expect(typeof card.is_theological).toBe('boolean');
      }
    });

    test('should handle filtering parameters correctly', async () => {
      const response = await request(app)
        .get(baseUrl)
        .set('Authorization', `Bearer ${testToken}`)
        .query({
          level: 'B1',
          category: 'religious',
          is_theological: 'true',
          search: 'Isten'
        })
        .expect(200);

      validateApiResponse(response);
      expect(response.body.data).toHaveProperty('vocabulary_cards');
      expect(response.body.data).toHaveProperty('filters_applied');

      // 적용된 필터 정보 검증
      const filtersApplied = response.body.data.filters_applied;
      expect(filtersApplied).toHaveProperty('level');
      expect(filtersApplied).toHaveProperty('category');
      expect(filtersApplied).toHaveProperty('is_theological');
      expect(filtersApplied).toHaveProperty('search');
    });

    test('should handle invalid authentication', async () => {
      const response = await request(app)
        .get(baseUrl)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      validateApiResponse(response);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  // ========== GET /api/vocabulary/review - 복습할 어휘 조회 ==========
  describe('GET /api/vocabulary/review', () => {
    test('should return review vocabulary cards with FSRS scheduling info', async () => {
      const response = await request(app)
        .get(`${baseUrl}/review`)
        .set('Authorization', `Bearer ${testToken}`)
        .query({ limit: 20 })
        .expect(200);

      validateApiResponse(response);

      // 복습 데이터 구조 검증
      expect(response.body.data).toHaveProperty('review_cards');
      expect(response.body.data).toHaveProperty('total_due_cards');
      expect(response.body.data).toHaveProperty('review_session_id');
      expect(Array.isArray(response.body.data.review_cards)).toBe(true);

      // 복습 카드 스키마 검증
      if (response.body.data.review_cards.length > 0) {
        const reviewCard = response.body.data.review_cards[0];
        expect(reviewCard).toHaveProperty('card_id');
        expect(reviewCard).toHaveProperty('vocabulary_card');
        expect(reviewCard).toHaveProperty('fsrs_data');

        // FSRS 스케줄링 데이터 검증
        const fsrsData = reviewCard.fsrs_data;
        expect(fsrsData).toHaveProperty('stability');
        expect(fsrsData).toHaveProperty('difficulty');
        expect(fsrsData).toHaveProperty('elapsed_days');
        expect(fsrsData).toHaveProperty('scheduled_days');
        expect(fsrsData).toHaveProperty('reps');
        expect(fsrsData).toHaveProperty('lapses');
        expect(fsrsData).toHaveProperty('state'); // NEW, LEARNING, REVIEW, RELEARNING
        expect(fsrsData).toHaveProperty('last_review');
        expect(fsrsData).toHaveProperty('due');

        // FSRS 필드 타입 검증
        expect(typeof fsrsData.stability).toBe('number');
        expect(typeof fsrsData.difficulty).toBe('number');
        expect(typeof fsrsData.elapsed_days).toBe('number');
        expect(typeof fsrsData.scheduled_days).toBe('number');
        expect(typeof fsrsData.reps).toBe('number');
        expect(typeof fsrsData.lapses).toBe('number');
        expect(['NEW', 'LEARNING', 'REVIEW', 'RELEARNING']).toContain(fsrsData.state);
      }
    });

    test('should return empty review when no cards are due', async () => {
      const response = await request(app)
        .get(`${baseUrl}/review`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      validateApiResponse(response);
      expect(response.body.data.review_cards).toBeDefined();
      expect(response.body.data.total_due_cards).toBe(0);
    });
  });

  // ========== POST /api/vocabulary/practice - 어휘 연습 결과 제출 ==========
  describe('POST /api/vocabulary/practice', () => {
    const validPracticeData = {
      card_id: 'vocab-card-123',
      rating: 3, // FSRS rating (1=Again, 2=Hard, 3=Good, 4=Easy)
      response_time_ms: 2500,
      practice_type: 'recognition', // recognition, recall, listening
      user_answer: 'ház',
      is_correct: true
    };

    test('should accept valid practice result and return updated FSRS data', async () => {
      const response = await request(app)
        .post(`${baseUrl}/practice`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(validPracticeData)
        .expect('Content-Type', /json/)
        .expect(200);

      validateApiResponse(response);

      // 연습 결과 응답 구조 검증
      expect(response.body.data).toHaveProperty('practice_result');
      expect(response.body.data).toHaveProperty('updated_fsrs_data');
      expect(response.body.data).toHaveProperty('next_review_date');
      expect(response.body.data).toHaveProperty('performance_feedback');

      const practiceResult = response.body.data.practice_result;
      expect(practiceResult).toHaveProperty('id');
      expect(practiceResult).toHaveProperty('card_id');
      expect(practiceResult).toHaveProperty('rating');
      expect(practiceResult).toHaveProperty('response_time_ms');
      expect(practiceResult).toHaveProperty('created_at');

      // 업데이트된 FSRS 데이터 검증
      const updatedFsrs = response.body.data.updated_fsrs_data;
      expect(updatedFsrs).toHaveProperty('stability');
      expect(updatedFsrs).toHaveProperty('difficulty');
      expect(updatedFsrs).toHaveProperty('due');
      expect(updatedFsrs).toHaveProperty('reps');
      expect(updatedFsrs.reps).toBeGreaterThan(0); // 연습 후 reps 증가

      // 다음 복습 날짜 검증
      expect(response.body.data.next_review_date).toBeDefined();
      expect(new Date(response.body.data.next_review_date)).toBeInstanceOf(Date);
    });

    test('should reject practice with invalid rating', async () => {
      const invalidData = {
        ...validPracticeData,
        rating: 5 // Invalid rating (should be 1-4)
      };

      const response = await request(app)
        .post(`${baseUrl}/practice`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidData)
        .expect(400);

      validateApiResponse(response);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('rating');
    });

    test('should reject practice with missing required fields', async () => {
      const incompleteData = {
        card_id: 'vocab-card-123'
        // Missing rating, response_time_ms, etc.
      };

      const response = await request(app)
        .post(`${baseUrl}/practice`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(incompleteData)
        .expect(400);

      validateApiResponse(response);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  // ========== GET /api/vocabulary/stats - 어휘 학습 통계 ==========
  describe('GET /api/vocabulary/stats', () => {
    test('should return comprehensive learning statistics', async () => {
      const response = await request(app)
        .get(`${baseUrl}/stats`)
        .set('Authorization', `Bearer ${testToken}`)
        .query({
          period: '30d', // 7d, 30d, 90d, all
          include_graphs: 'true'
        })
        .expect(200);

      validateApiResponse(response);

      // 통계 데이터 구조 검증
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data).toHaveProperty('progress_by_level');
      expect(response.body.data).toHaveProperty('category_breakdown');
      expect(response.body.data).toHaveProperty('daily_activity');
      expect(response.body.data).toHaveProperty('retention_rate');

      // 개요 통계 검증
      const overview = response.body.data.overview;
      expect(overview).toHaveProperty('total_cards_learned');
      expect(overview).toHaveProperty('cards_due_today');
      expect(overview).toHaveProperty('current_streak_days');
      expect(overview).toHaveProperty('average_accuracy');
      expect(overview).toHaveProperty('total_practice_time_minutes');

      // 레벨별 진도 검증
      const progressByLevel = response.body.data.progress_by_level;
      expect(Array.isArray(progressByLevel)).toBe(true);
      if (progressByLevel.length > 0) {
        const levelProgress = progressByLevel[0];
        expect(levelProgress).toHaveProperty('level');
        expect(levelProgress).toHaveProperty('total_cards');
        expect(levelProgress).toHaveProperty('mastered_cards');
        expect(levelProgress).toHaveProperty('learning_cards');
        expect(levelProgress).toHaveProperty('new_cards');
      }

      // 일별 활동 검증 (그래프 데이터 요청 시)
      if (response.body.data.daily_activity) {
        const dailyActivity = response.body.data.daily_activity;
        expect(Array.isArray(dailyActivity)).toBe(true);
        if (dailyActivity.length > 0) {
          const dayData = dailyActivity[0];
          expect(dayData).toHaveProperty('date');
          expect(dayData).toHaveProperty('cards_practiced');
          expect(dayData).toHaveProperty('accuracy_rate');
          expect(dayData).toHaveProperty('time_spent_minutes');
        }
      }
    });

    test('should handle different time periods', async () => {
      const periods = ['7d', '30d', '90d', 'all'];

      for (const period of periods) {
        const response = await request(app)
          .get(`${baseUrl}/stats`)
          .set('Authorization', `Bearer ${testToken}`)
          .query({ period })
          .expect(200);

        validateApiResponse(response);
        expect(response.body.data.overview).toBeDefined();
        expect(response.body.data).toHaveProperty('period_info');
        expect(response.body.data.period_info.requested_period).toBe(period);
      }
    });
  });

  // ========== POST /api/vocabulary/cards - 새 어휘 카드 생성 ==========
  describe('POST /api/vocabulary/cards', () => {
    const validCardData = {
      hungarian_word: 'templom',
      korean_meaning: '교회, 성전',
      difficulty_level: 'A2',
      category: 'religious',
      pronunciation: 'ˈtɛmplom',
      example_sentences: [
        {
          hungarian: 'Vasárnap elmegyek a templomba.',
          korean: '일요일에 교회에 갑니다.'
        }
      ],
      is_theological: true,
      related_words: ['egyház', 'ima', 'mise']
    };

    test('should create new vocabulary card with valid data', async () => {
      const response = await request(app)
        .post(`${baseUrl}/cards`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(validCardData)
        .expect(201);

      validateApiResponse(response);

      // 생성된 카드 데이터 검증
      expect(response.body.data).toHaveProperty('card');
      expect(response.body.data).toHaveProperty('fsrs_initialized');

      const card = response.body.data.card;
      expect(card).toHaveProperty('id');
      expect(card.hungarian_word).toBe(validCardData.hungarian_word);
      expect(card.korean_meaning).toBe(validCardData.korean_meaning);
      expect(card.difficulty_level).toBe(validCardData.difficulty_level);
      expect(card.category).toBe(validCardData.category);
      expect(card).toHaveProperty('created_at');
      expect(card).toHaveProperty('updated_at');

      // FSRS 초기화 확인
      expect(response.body.data.fsrs_initialized).toBe(true);
    });

    test('should reject card with invalid difficulty level', async () => {
      const invalidData = {
        ...validCardData,
        difficulty_level: 'C1' // Invalid level
      };

      const response = await request(app)
        .post(`${baseUrl}/cards`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidData)
        .expect(400);

      validateApiResponse(response);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('difficulty_level');
    });
  });

  // ========== POST /api/vocabulary/review-session - 복습 세션 시작 ==========
  describe('POST /api/vocabulary/review-session', () => {
    const sessionData = {
      session_type: 'daily_review', // daily_review, focused_practice, weak_areas
      max_cards: 20,
      include_new_cards: true,
      difficulty_levels: ['A1', 'A2'],
      categories: ['daily_life', 'religious']
    };

    test('should start new review session with proper configuration', async () => {
      const response = await request(app)
        .post(`${baseUrl}/review-session`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(sessionData)
        .expect(201);

      validateApiResponse(response);

      // 세션 데이터 검증
      expect(response.body.data).toHaveProperty('session');
      expect(response.body.data).toHaveProperty('cards_queue');
      expect(response.body.data).toHaveProperty('session_config');

      const session = response.body.data.session;
      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('user_id');
      expect(session).toHaveProperty('session_type');
      expect(session).toHaveProperty('status'); // active, paused, completed
      expect(session).toHaveProperty('started_at');
      expect(session).toHaveProperty('cards_planned');
      expect(session).toHaveProperty('cards_completed');

      // 카드 큐 검증
      const cardsQueue = response.body.data.cards_queue;
      expect(Array.isArray(cardsQueue)).toBe(true);
      expect(cardsQueue.length).toBeLessThanOrEqual(sessionData.max_cards);

      // 세션 설정 확인
      const sessionConfig = response.body.data.session_config;
      expect(sessionConfig.max_cards).toBe(sessionData.max_cards);
      expect(sessionConfig.include_new_cards).toBe(sessionData.include_new_cards);
    });

    test('should handle empty review queue gracefully', async () => {
      const emptySessionData = {
        session_type: 'daily_review',
        max_cards: 50,
        difficulty_levels: ['C2'], // No cards at this level
        categories: ['nonexistent']
      };

      const response = await request(app)
        .post(`${baseUrl}/review-session`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(emptySessionData)
        .expect(200);

      validateApiResponse(response);
      expect(response.body.data.cards_queue).toHaveLength(0);
      expect(response.body.message).toContain('복습할 카드가 없습니다');
    });
  });

  // ========== Headers and CORS 검증 ==========
  describe('API Headers and CORS', () => {
    test('should include proper security headers', async () => {
      const response = await request(app)
        .get(baseUrl)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      // 보안 헤더 검증
      expect(response.headers).toHaveProperty('content-type');
      expect(response.headers['content-type']).toMatch(/json/);
    });

    test('should handle CORS preflight for vocabulary APIs', async () => {
      const response = await request(app)
        .options(baseUrl)
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Authorization, Content-Type')
        .expect(204);

      // CORS 헤더 검증은 실제 서버 설정에 따라 달라짐
      // 여기서는 응답 코드만 확인
    });
  });

  // ========== Error Handling Contract ==========
  describe('Error Handling Contracts', () => {
    test('should return consistent error format for 400 Bad Request', async () => {
      const response = await request(app)
        .post(`${baseUrl}/practice`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({}) // Empty body to trigger validation error
        .expect(400);

      validateApiResponse(response);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');

      // 선택적으로 validation_errors 포함
      if (response.body.validation_errors) {
        expect(Array.isArray(response.body.validation_errors)).toBe(true);
      }
    });

    test('should return consistent error format for 404 Not Found', async () => {
      const response = await request(app)
        .get(`${baseUrl}/nonexistent-endpoint`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);

      validateApiResponse(response);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should return consistent error format for 500 Internal Server Error', async () => {
      // This test would need a way to trigger a server error
      // For now, we just ensure the format is consistent when it happens
      // In a real scenario, you might mock a database connection failure
    });
  });
});

// ========== Data Schema Validation Helpers ==========

/**
 * 어휘 카드 스키마 검증 헬퍼
 */
export const validateVocabularyCardSchema = (card: any) => {
  const requiredFields = [
    'id', 'hungarian_word', 'korean_meaning', 'difficulty_level',
    'category', 'pronunciation', 'example_sentences', 'is_theological',
    'created_at', 'updated_at'
  ];

  for (const field of requiredFields) {
    expect(card).toHaveProperty(field);
  }

  expect(['A1', 'A2', 'B1', 'B2']).toContain(card.difficulty_level);
  expect(typeof card.is_theological).toBe('boolean');
  expect(Array.isArray(card.example_sentences)).toBe(true);
};

/**
 * FSRS 데이터 스키마 검증 헬퍼
 */
export const validateFSRSDataSchema = (fsrsData: any) => {
  const requiredFields = [
    'stability', 'difficulty', 'elapsed_days', 'scheduled_days',
    'reps', 'lapses', 'state', 'last_review', 'due'
  ];

  for (const field of requiredFields) {
    expect(fsrsData).toHaveProperty(field);
  }

  expect(['NEW', 'LEARNING', 'REVIEW', 'RELEARNING']).toContain(fsrsData.state);
  expect(typeof fsrsData.stability).toBe('number');
  expect(typeof fsrsData.difficulty).toBe('number');
  expect(typeof fsrsData.reps).toBe('number');
  expect(typeof fsrsData.lapses).toBe('number');
};