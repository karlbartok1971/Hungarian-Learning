/**
 * T083 - Integration Test for Spaced Repetition Scheduling
 *
 * 간격 반복 학습 시스템의 통합 테스트
 * FSRS 알고리즘, 데이터베이스, API 엔드포인트가 함께 작동하는 전체 워크플로우 검증
 *
 * Test Coverage:
 * - 복습 세션 생성 및 관리
 * - FSRS 스케줄링과 데이터베이스 연동
 * - 복습 결과 처리 및 다음 복습 일정 계산
 * - 사용자별 복습 우선순위 관리
 * - 배치 처리 및 성능 최적화
 * - 다중 사용자 동시 접근 처리
 * - 장기간 학습 진행 시나리오
 */

import request from 'supertest';
import { app } from '../../src/app';
import { FSRS, CardState, Rating, fsrs } from '../../src/lib/fsrsAlgorithm';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// 테스트 사용자 설정
const TEST_USERS = [
  { id: 'user-1', email: 'user1@test.com', name: 'Test User 1' },
  { id: 'user-2', email: 'user2@test.com', name: 'Test User 2' },
];

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// 테스트용 JWT 토큰 생성
const createTestToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '1h' });
};

// 테스트용 어휘 카드 데이터
const SAMPLE_VOCABULARY = [
  { hungarian: 'ház', korean: '집', difficulty: 'A1', category: 'daily_life' },
  { hungarian: 'víz', korean: '물', difficulty: 'A1', category: 'daily_life' },
  { hungarian: 'templom', korean: '교회', difficulty: 'A2', category: 'religious' },
  { hungarian: 'szeretet', korean: '사랑', difficulty: 'A2', category: 'emotions' },
  { hungarian: 'bölcsesség', korean: '지혜', difficulty: 'B1', category: 'abstract' },
];

describe('Spaced Repetition Scheduling Integration Tests - T083', () => {
  const baseUrl = '/api/vocabulary';
  let testTokenUser1: string;
  let testTokenUser2: string;

  beforeAll(async () => {
    // 테스트 토큰 생성
    testTokenUser1 = createTestToken(TEST_USERS[0].id, TEST_USERS[0].email);
    testTokenUser2 = createTestToken(TEST_USERS[1].id, TEST_USERS[1].email);

    // 테스트 데이터베이스 초기화 (실제 환경에서는 테스트 DB 사용)
    // await prisma.$executeRaw`TRUNCATE TABLE vocabulary_cards, review_sessions, review_logs CASCADE`;
  });

  beforeEach(async () => {
    // 각 테스트 전에 테스트 데이터 정리
    // await cleanupTestData();
  });

  afterAll(async () => {
    // 테스트 후 정리
    await prisma.$disconnect();
  });

  // ========== 복습 세션 생성 및 관리 ==========
  describe('Review Session Creation and Management', () => {
    test('should create a new review session with proper FSRS initialization', async () => {
      // Step 1: 어휘 카드 생성
      const cardCreationPromises = SAMPLE_VOCABULARY.map(vocab =>
        request(app)
          .post(`${baseUrl}/cards`)
          .set('Authorization', `Bearer ${testTokenUser1}`)
          .send({
            hungarian_word: vocab.hungarian,
            korean_meaning: vocab.korean,
            difficulty_level: vocab.difficulty,
            category: vocab.category,
            pronunciation: '',
            example_sentences: [],
            is_theological: vocab.category === 'religious'
          })
      );

      const cardResponses = await Promise.all(cardCreationPromises);
      cardResponses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Step 2: 복습 세션 시작
      const sessionResponse = await request(app)
        .post(`${baseUrl}/review-session`)
        .set('Authorization', `Bearer ${testTokenUser1}`)
        .send({
          session_type: 'daily_review',
          max_cards: 10,
          include_new_cards: true,
          difficulty_levels: ['A1', 'A2'],
          categories: ['daily_life', 'religious']
        })
        .expect(201);

      expect(sessionResponse.body.success).toBe(true);
      expect(sessionResponse.body.data.session).toBeDefined();
      expect(sessionResponse.body.data.cards_queue).toBeDefined();

      const session = sessionResponse.body.data.session;
      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('user_id');
      expect(session.session_type).toBe('daily_review');
      expect(session.status).toBe('active');
      expect(session.cards_planned).toBeGreaterThan(0);
      expect(session.cards_completed).toBe(0);

      // Cards queue should contain filtered cards
      const cardsQueue = sessionResponse.body.data.cards_queue;
      expect(cardsQueue.length).toBeGreaterThan(0);
      expect(cardsQueue.length).toBeLessThanOrEqual(10);

      // Each card should have FSRS data initialized
      cardsQueue.forEach((queueItem: any) => {
        expect(queueItem).toHaveProperty('card_id');
        expect(queueItem).toHaveProperty('vocabulary_card');
        expect(queueItem).toHaveProperty('fsrs_data');

        const fsrsData = queueItem.fsrs_data;
        expect(fsrsData.state).toBe(CardState.NEW);
        expect(fsrsData.reps).toBe(0);
        expect(fsrsData.lapses).toBe(0);
      });
    });

    test('should handle multiple concurrent review sessions for different users', async () => {
      // Create cards for both users
      const user1CardResponse = await request(app)
        .post(`${baseUrl}/cards`)
        .set('Authorization', `Bearer ${testTokenUser1}`)
        .send({
          hungarian_word: 'béke',
          korean_meaning: '평화',
          difficulty_level: 'A2',
          category: 'religious',
          pronunciation: '',
          example_sentences: [],
          is_theological: true
        })
        .expect(201);

      const user2CardResponse = await request(app)
        .post(`${baseUrl}/cards`)
        .set('Authorization', `Bearer ${testTokenUser2}`)
        .send({
          hungarian_word: 'öröm',
          korean_meaning: '기쁨',
          difficulty_level: 'A2',
          category: 'emotions',
          pronunciation: '',
          example_sentences: [],
          is_theological: false
        })
        .expect(201);

      // Start sessions for both users simultaneously
      const [session1Response, session2Response] = await Promise.all([
        request(app)
          .post(`${baseUrl}/review-session`)
          .set('Authorization', `Bearer ${testTokenUser1}`)
          .send({
            session_type: 'daily_review',
            max_cards: 5,
            include_new_cards: true
          }),
        request(app)
          .post(`${baseUrl}/review-session`)
          .set('Authorization', `Bearer ${testTokenUser2}`)
          .send({
            session_type: 'focused_practice',
            max_cards: 3,
            include_new_cards: true
          })
      ]);

      expect(session1Response.status).toBe(201);
      expect(session2Response.status).toBe(201);

      const session1 = session1Response.body.data.session;
      const session2 = session2Response.body.data.session;

      // Sessions should be isolated per user
      expect(session1.user_id).toBe(TEST_USERS[0].id);
      expect(session2.user_id).toBe(TEST_USERS[1].id);
      expect(session1.id).not.toBe(session2.id);

      // Each user should only see their own cards
      const queue1 = session1Response.body.data.cards_queue;
      const queue2 = session2Response.body.data.cards_queue;

      expect(queue1.length).toBeGreaterThan(0);
      expect(queue2.length).toBeGreaterThan(0);

      // Verify no card overlap between users
      const cardIds1 = queue1.map((item: any) => item.card_id);
      const cardIds2 = queue2.map((item: any) => item.card_id);
      const overlap = cardIds1.filter((id: string) => cardIds2.includes(id));
      expect(overlap).toHaveLength(0);
    });
  });

  // ========== FSRS 스케줄링과 데이터베이스 연동 ==========
  describe('FSRS Scheduling with Database Integration', () => {
    test('should process review result and update FSRS data in database', async () => {
      // Create a test card
      const cardResponse = await request(app)
        .post(`${baseUrl}/cards`)
        .set('Authorization', `Bearer ${testTokenUser1}`)
        .send({
          hungarian_word: 'remény',
          korean_meaning: '소망',
          difficulty_level: 'B1',
          category: 'abstract',
          pronunciation: 'ˈrɛmeːɲ',
          example_sentences: [{
            hungarian: 'A remény sosem hal meg.',
            korean: '소망은 결코 죽지 않습니다.'
          }],
          is_theological: true
        })
        .expect(201);

      const cardId = cardResponse.body.data.card.id;

      // Submit practice result
      const practiceResponse = await request(app)
        .post(`${baseUrl}/practice`)
        .set('Authorization', `Bearer ${testTokenUser1}`)
        .send({
          card_id: cardId,
          rating: Rating.GOOD,
          response_time_ms: 3500,
          practice_type: 'recognition',
          user_answer: '소망',
          is_correct: true
        })
        .expect(200);

      expect(practiceResponse.body.success).toBe(true);
      expect(practiceResponse.body.data).toHaveProperty('practice_result');
      expect(practiceResponse.body.data).toHaveProperty('updated_fsrs_data');

      const updatedFsrs = practiceResponse.body.data.updated_fsrs_data;
      expect(updatedFsrs.reps).toBe(1);
      expect(updatedFsrs.state).toBe(CardState.REVIEW);
      expect(updatedFsrs.stability).toBeGreaterThan(0);
      expect(updatedFsrs.difficulty).toBeGreaterThan(0);
      expect(new Date(updatedFsrs.due)).toBeInstanceOf(Date);

      // Verify data persistence by fetching the card again
      const fetchResponse = await request(app)
        .get(`${baseUrl}/cards/${cardId}`)
        .set('Authorization', `Bearer ${testTokenUser1}`)
        .expect(200);

      const fetchedCard = fetchResponse.body.data.card;
      expect(fetchedCard.fsrs_data.reps).toBe(1);
      expect(fetchedCard.fsrs_data.state).toBe(CardState.REVIEW);
    });

    test('should handle multiple rapid reviews and maintain FSRS consistency', async () => {
      // Create a card for rapid review testing
      const cardResponse = await request(app)
        .post(`${baseUrl}/cards`)
        .set('Authorization', `Bearer ${testTokenUser1}`)
        .send({
          hungarian_word: 'türelem',
          korean_meaning: '인내',
          difficulty_level: 'A2',
          category: 'character',
          pronunciation: '',
          example_sentences: [],
          is_theological: false
        })
        .expect(201);

      const cardId = cardResponse.body.data.card.id;
      const ratings = [Rating.GOOD, Rating.HARD, Rating.GOOD, Rating.EASY];
      let lastFsrsData: any = null;

      // Submit multiple reviews in sequence
      for (let i = 0; i < ratings.length; i++) {
        const practiceResponse = await request(app)
          .post(`${baseUrl}/practice`)
          .set('Authorization', `Bearer ${testTokenUser1}`)
          .send({
            card_id: cardId,
            rating: ratings[i],
            response_time_ms: 2000 + i * 500,
            practice_type: 'recall',
            user_answer: '인내',
            is_correct: true
          })
          .expect(200);

        const currentFsrs = practiceResponse.body.data.updated_fsrs_data;

        // Validate FSRS progression
        expect(currentFsrs.reps).toBe(i + 1);
        expect(currentFsrs.stability).toBeGreaterThan(0);
        expect(currentFsrs.difficulty).toBeGreaterThanOrEqual(1);
        expect(currentFsrs.difficulty).toBeLessThanOrEqual(10);

        if (lastFsrsData) {
          // Stability should generally increase with good performance
          if (ratings[i] >= Rating.GOOD) {
            expect(currentFsrs.stability).toBeGreaterThanOrEqual(lastFsrsData.stability * 0.8);
          }
        }

        lastFsrsData = currentFsrs;
      }
    });
  });

  // ========== 복습 우선순위 관리 ==========
  describe('Review Priority Management', () => {
    test('should prioritize overdue cards correctly', async () => {
      // Create multiple cards with different due dates
      const cardData = [
        { word: 'Isten', meaning: '하나님', daysAgo: 5 }, // Very overdue
        { word: 'ima', meaning: '기도', daysAgo: 2 },     // Moderately overdue
        { word: 'hit', meaning: '믿음', daysAgo: 0 },     // Due today
        { word: 'remény', meaning: '소망', daysAgo: -1 }  // Future
      ];

      const cardIds: string[] = [];

      // Create cards and simulate their review history
      for (const data of cardData) {
        const cardResponse = await request(app)
          .post(`${baseUrl}/cards`)
          .set('Authorization', `Bearer ${testTokenUser1}`)
          .send({
            hungarian_word: data.word,
            korean_meaning: data.meaning,
            difficulty_level: 'A2',
            category: 'religious',
            pronunciation: '',
            example_sentences: [],
            is_theological: true
          })
          .expect(201);

        cardIds.push(cardResponse.body.data.card.id);

        // If the card should have history, create it
        if (data.daysAgo >= 0) {
          const reviewDate = new Date();
          reviewDate.setDate(reviewDate.getDate() - data.daysAgo);

          await request(app)
            .post(`${baseUrl}/practice`)
            .set('Authorization', `Bearer ${testTokenUser1}`)
            .send({
              card_id: cardResponse.body.data.card.id,
              rating: Rating.GOOD,
              response_time_ms: 3000,
              practice_type: 'recognition',
              user_answer: data.meaning,
              is_correct: true,
              review_time: reviewDate.toISOString()
            });
        }
      }

      // Start review session and check priority order
      const sessionResponse = await request(app)
        .post(`${baseUrl}/review-session`)
        .set('Authorization', `Bearer ${testTokenUser1}`)
        .send({
          session_type: 'daily_review',
          max_cards: 10,
          include_new_cards: true,
          priority_overdue: true
        })
        .expect(201);

      const cardsQueue = sessionResponse.body.data.cards_queue;
      expect(cardsQueue.length).toBeGreaterThan(0);

      // Verify that overdue cards appear first in the queue
      let foundOverdueFirst = false;
      for (let i = 0; i < Math.min(cardsQueue.length, 2); i++) {
        const queueItem = cardsQueue[i];
        if (cardIds.includes(queueItem.card_id)) {
          // Check if this is one of the overdue cards
          const cardIndex = cardIds.indexOf(queueItem.card_id);
          if (cardIndex <= 1) { // First two cards are most overdue
            foundOverdueFirst = true;
            break;
          }
        }
      }
      expect(foundOverdueFirst).toBe(true);
    });

    test('should balance new cards and review cards appropriately', async () => {
      // Create a mix of new and review cards
      const newCards = [];
      const reviewCards = [];

      // Create new cards
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post(`${baseUrl}/cards`)
          .set('Authorization', `Bearer ${testTokenUser1}`)
          .send({
            hungarian_word: `új${i}`,
            korean_meaning: `새로운${i}`,
            difficulty_level: 'A1',
            category: 'test',
            pronunciation: '',
            example_sentences: [],
            is_theological: false
          })
          .expect(201);
        newCards.push(response.body.data.card.id);
      }

      // Create and review some cards to make them due
      for (let i = 0; i < 3; i++) {
        const createResponse = await request(app)
          .post(`${baseUrl}/cards`)
          .set('Authorization', `Bearer ${testTokenUser1}`)
          .send({
            hungarian_word: `régi${i}`,
            korean_meaning: `오래된${i}`,
            difficulty_level: 'A2',
            category: 'test',
            pronunciation: '',
            example_sentences: [],
            is_theological: false
          })
          .expect(201);

        const cardId = createResponse.body.data.card.id;
        reviewCards.push(cardId);

        // Review to make it a review card, then make it overdue
        await request(app)
          .post(`${baseUrl}/practice`)
          .set('Authorization', `Bearer ${testTokenUser1}`)
          .send({
            card_id: cardId,
            rating: Rating.GOOD,
            response_time_ms: 2500,
            practice_type: 'recognition',
            user_answer: `오래된${i}`,
            is_correct: true
          });
      }

      // Start session with balanced settings
      const sessionResponse = await request(app)
        .post(`${baseUrl}/review-session`)
        .set('Authorization', `Bearer ${testTokenUser1}`)
        .send({
          session_type: 'balanced_review',
          max_cards: 6,
          include_new_cards: true,
          new_cards_limit: 3,
          balance_new_review: true
        })
        .expect(201);

      const cardsQueue = sessionResponse.body.data.cards_queue;
      expect(cardsQueue.length).toBeLessThanOrEqual(6);

      // Count new vs review cards in queue
      let newCardCount = 0;
      let reviewCardCount = 0;

      cardsQueue.forEach((queueItem: any) => {
        if (newCards.includes(queueItem.card_id)) {
          newCardCount++;
        } else if (reviewCards.includes(queueItem.card_id)) {
          reviewCardCount++;
        }
      });

      // Should have a balanced mix
      expect(newCardCount).toBeGreaterThan(0);
      expect(reviewCardCount).toBeGreaterThan(0);
      expect(newCardCount).toBeLessThanOrEqual(3); // Respects new_cards_limit
    });
  });

  // ========== 배치 처리 및 성능 최적화 ==========
  describe('Batch Processing and Performance Optimization', () => {
    test('should handle large batch review updates efficiently', async () => {
      const batchSize = 20;
      const cardIds: string[] = [];

      // Create a batch of cards
      const cardCreationPromises = Array.from({ length: batchSize }, (_, i) =>
        request(app)
          .post(`${baseUrl}/cards`)
          .set('Authorization', `Bearer ${testTokenUser1}`)
          .send({
            hungarian_word: `batch${i}`,
            korean_meaning: `배치${i}`,
            difficulty_level: 'A1',
            category: 'test',
            pronunciation: '',
            example_sentences: [],
            is_theological: false
          })
      );

      const cardResponses = await Promise.all(cardCreationPromises);
      cardResponses.forEach(response => {
        expect(response.status).toBe(201);
        cardIds.push(response.body.data.card.id);
      });

      // Submit batch reviews
      const startTime = Date.now();

      const reviewPromises = cardIds.map(cardId =>
        request(app)
          .post(`${baseUrl}/practice`)
          .set('Authorization', `Bearer ${testTokenUser1}`)
          .send({
            card_id: cardId,
            rating: Rating.GOOD,
            response_time_ms: 2000,
            practice_type: 'recognition',
            user_answer: 'correct',
            is_correct: true
          })
      );

      const reviewResponses = await Promise.all(reviewPromises);
      const endTime = Date.now();

      // All reviews should succeed
      reviewResponses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Performance check - should complete within reasonable time
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(10000); // 10 seconds for 20 cards

      console.log(`Batch processing ${batchSize} cards took ${totalTime}ms`);
    });

    test('should optimize database queries for review session creation', async () => {
      // Create a substantial number of cards
      const cardCount = 50;

      const cardPromises = Array.from({ length: cardCount }, (_, i) =>
        request(app)
          .post(`${baseUrl}/cards`)
          .set('Authorization', `Bearer ${testTokenUser1}`)
          .send({
            hungarian_word: `perf${i}`,
            korean_meaning: `성능${i}`,
            difficulty_level: i % 2 === 0 ? 'A1' : 'A2',
            category: i % 3 === 0 ? 'religious' : 'daily_life',
            pronunciation: '',
            example_sentences: [],
            is_theological: i % 3 === 0
          })
      );

      await Promise.all(cardPromises);

      // Measure session creation time
      const startTime = Date.now();

      const sessionResponse = await request(app)
        .post(`${baseUrl}/review-session`)
        .set('Authorization', `Bearer ${testTokenUser1}`)
        .send({
          session_type: 'daily_review',
          max_cards: 25,
          include_new_cards: true,
          difficulty_levels: ['A1', 'A2'],
          categories: ['religious', 'daily_life']
        })
        .expect(201);

      const endTime = Date.now();
      const sessionCreationTime = endTime - startTime;

      expect(sessionResponse.body.success).toBe(true);
      expect(sessionCreationTime).toBeLessThan(3000); // Should create session within 3 seconds

      console.log(`Session creation with ${cardCount} available cards took ${sessionCreationTime}ms`);
    });
  });

  // ========== 장기간 학습 진행 시나리오 ==========
  describe('Long-term Learning Progress Scenarios', () => {
    test('should simulate and track learning progress over extended period', async () => {
      // Create a set of cards for long-term tracking
      const vocabularySet = [
        { word: 'szeretet', meaning: '사랑' },
        { word: 'türelem', meaning: '인내' },
        { word: 'remény', meaning: '소망' },
        { word: 'hit', meaning: '믿음' },
        { word: 'béke', meaning: '평화' }
      ];

      const cardIds: string[] = [];

      for (const vocab of vocabularySet) {
        const response = await request(app)
          .post(`${baseUrl}/cards`)
          .set('Authorization', `Bearer ${testTokenUser1}`)
          .send({
            hungarian_word: vocab.word,
            korean_meaning: vocab.meaning,
            difficulty_level: 'A2',
            category: 'religious',
            pronunciation: '',
            example_sentences: [],
            is_theological: true
          })
          .expect(201);

        cardIds.push(response.body.data.card.id);
      }

      // Simulate learning over multiple sessions
      const simulationDays = 30;
      let currentDate = new Date('2024-01-01');

      for (let day = 0; day < simulationDays; day++) {
        // Start daily review session
        const sessionResponse = await request(app)
          .post(`${baseUrl}/review-session`)
          .set('Authorization', `Bearer ${testTokenUser1}`)
          .send({
            session_type: 'daily_review',
            max_cards: 10,
            include_new_cards: day < 5, // Include new cards only in first week
            review_date: currentDate.toISOString()
          });

        if (sessionResponse.status === 201) {
          const cardsQueue = sessionResponse.body.data.cards_queue;

          // Practice each card in queue with varying performance
          for (const queueItem of cardsQueue) {
            // Simulate realistic performance pattern
            let rating: Rating;
            if (queueItem.fsrs_data.reps === 0) {
              // First time seeing card
              rating = Math.random() > 0.3 ? Rating.GOOD : Rating.AGAIN;
            } else {
              // Subsequent reviews - performance improves over time
              const difficultyFactor = queueItem.fsrs_data.difficulty / 10;
              const stabilityFactor = Math.min(queueItem.fsrs_data.stability / 20, 1);
              const successProbability = 0.7 + (stabilityFactor - difficultyFactor) * 0.2;

              const random = Math.random();
              if (random < successProbability * 0.2) rating = Rating.EASY;
              else if (random < successProbability * 0.8) rating = Rating.GOOD;
              else if (random < successProbability) rating = Rating.HARD;
              else rating = Rating.AGAIN;
            }

            await request(app)
              .post(`${baseUrl}/practice`)
              .set('Authorization', `Bearer ${testTokenUser1}`)
              .send({
                card_id: queueItem.card_id,
                rating: rating,
                response_time_ms: Math.floor(Math.random() * 5000) + 2000,
                practice_type: 'recognition',
                user_answer: rating >= Rating.HARD ? 'correct' : 'incorrect',
                is_correct: rating >= Rating.HARD,
                review_time: currentDate.toISOString()
              });
          }
        }

        // Advance to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Analyze learning progress
      const statsResponse = await request(app)
        .get(`${baseUrl}/stats`)
        .set('Authorization', `Bearer ${testTokenUser1}`)
        .query({ period: '30d', include_graphs: 'true' })
        .expect(200);

      const stats = statsResponse.body.data;
      expect(stats.overview.total_cards_learned).toBeGreaterThan(0);
      expect(stats.overview.current_streak_days).toBeGreaterThan(0);
      expect(stats.overview.average_accuracy).toBeGreaterThan(0.4); // At least 40% accuracy
      expect(stats.overview.average_accuracy).toBeLessThanOrEqual(1.0);

      // Verify progress by level
      const progressByLevel = stats.progress_by_level;
      const a2Progress = progressByLevel.find((p: any) => p.level === 'A2');
      expect(a2Progress).toBeDefined();
      expect(a2Progress.mastered_cards + a2Progress.learning_cards).toBeGreaterThan(0);
    });
  });

  // ========== 복습 세션 상태 관리 ==========
  describe('Review Session State Management', () => {
    test('should handle session pause and resume correctly', async () => {
      // Create test cards and start session
      const cardResponse = await request(app)
        .post(`${baseUrl}/cards`)
        .set('Authorization', `Bearer ${testTokenUser1}`)
        .send({
          hungarian_word: 'kitartás',
          korean_meaning: '끈기',
          difficulty_level: 'A2',
          category: 'character',
          pronunciation: '',
          example_sentences: [],
          is_theological: false
        })
        .expect(201);

      const sessionResponse = await request(app)
        .post(`${baseUrl}/review-session`)
        .set('Authorization', `Bearer ${testTokenUser1}`)
        .send({
          session_type: 'daily_review',
          max_cards: 5,
          include_new_cards: true
        })
        .expect(201);

      const sessionId = sessionResponse.body.data.session.id;

      // Practice one card
      const cardsQueue = sessionResponse.body.data.cards_queue;
      if (cardsQueue.length > 0) {
        await request(app)
          .post(`${baseUrl}/practice`)
          .set('Authorization', `Bearer ${testTokenUser1}`)
          .send({
            card_id: cardsQueue[0].card_id,
            rating: Rating.GOOD,
            response_time_ms: 3000,
            practice_type: 'recognition',
            user_answer: 'correct',
            is_correct: true
          })
          .expect(200);
      }

      // Pause session
      const pauseResponse = await request(app)
        .patch(`${baseUrl}/review-session/${sessionId}`)
        .set('Authorization', `Bearer ${testTokenUser1}`)
        .send({ action: 'pause' })
        .expect(200);

      expect(pauseResponse.body.data.session.status).toBe('paused');

      // Resume session
      const resumeResponse = await request(app)
        .patch(`${baseUrl}/review-session/${sessionId}`)
        .set('Authorization', `Bearer ${testTokenUser1}`)
        .send({ action: 'resume' })
        .expect(200);

      expect(resumeResponse.body.data.session.status).toBe('active');
      expect(resumeResponse.body.data.session.cards_completed).toBeGreaterThan(0);
    });
  });

  // ========== 성능 및 스케일링 테스트 ==========
  describe('Performance and Scaling Tests', () => {
    test('should handle concurrent users without data corruption', async () => {
      const concurrentUsers = 5;
      const cardsPerUser = 3;

      // Create multiple users and their cards concurrently
      const userPromises = Array.from({ length: concurrentUsers }, async (_, userIndex) => {
        const userId = `concurrent-user-${userIndex}`;
        const token = createTestToken(userId, `${userId}@test.com`);

        // Create cards for this user
        const cardPromises = Array.from({ length: cardsPerUser }, (_, cardIndex) =>
          request(app)
            .post(`${baseUrl}/cards`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              hungarian_word: `user${userIndex}card${cardIndex}`,
              korean_meaning: `사용자${userIndex}카드${cardIndex}`,
              difficulty_level: 'A1',
              category: 'test',
              pronunciation: '',
              example_sentences: [],
              is_theological: false
            })
        );

        const cardResponses = await Promise.all(cardPromises);
        const cardIds = cardResponses.map(response => response.body.data.card.id);

        // Start review session
        const sessionResponse = await request(app)
          .post(`${baseUrl}/review-session`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            session_type: 'daily_review',
            max_cards: cardsPerUser,
            include_new_cards: true
          });

        return {
          userId,
          token,
          cardIds,
          sessionId: sessionResponse.body.data.session.id,
          cardsQueue: sessionResponse.body.data.cards_queue
        };
      });

      const users = await Promise.all(userPromises);

      // Have all users practice their cards simultaneously
      const practicePromises = users.flatMap(user =>
        user.cardsQueue.map((queueItem: any) =>
          request(app)
            .post(`${baseUrl}/practice`)
            .set('Authorization', `Bearer ${user.token}`)
            .send({
              card_id: queueItem.card_id,
              rating: Rating.GOOD,
              response_time_ms: 2500,
              practice_type: 'recognition',
              user_answer: 'correct',
              is_correct: true
            })
        )
      );

      const practiceResponses = await Promise.all(practicePromises);

      // Verify all practice sessions succeeded
      practiceResponses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Verify data integrity - each user should have correct stats
      const statsPromises = users.map(user =>
        request(app)
          .get(`${baseUrl}/stats`)
          .set('Authorization', `Bearer ${user.token}`)
          .query({ period: '7d' })
      );

      const statsResponses = await Promise.all(statsPromises);

      statsResponses.forEach((response, index) => {
        expect(response.status).toBe(200);
        const stats = response.body.data.overview;
        expect(stats.total_cards_learned).toBe(cardsPerUser);
        expect(stats.total_practice_time_minutes).toBeGreaterThan(0);
      });
    });
  });
});