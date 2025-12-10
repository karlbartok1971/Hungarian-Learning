/**
 * T082 - Unit Test for FSRS Algorithm Implementation
 *
 * FSRS (Free Spaced Repetition Scheduler) 알고리즘 단위 테스트
 * 간격 반복 학습의 핵심 로직을 철저히 검증합니다.
 *
 * Test Coverage:
 * - 새 카드 생성 및 초기화
 * - 복습 처리 및 상태 전환
 * - 안정성 및 난이도 계산
 * - 스케줄링 및 간격 계산
 * - 우선순위 및 성숙도 계산
 * - 통계 및 분석 기능
 * - 경계값 및 예외 상황 처리
 */

import {
  FSRS,
  FSRSCard,
  CardState,
  Rating,
  DEFAULT_FSRS_PARAMETERS,
  fsrs
} from '../../src/lib/fsrsAlgorithm';

describe('FSRS Algorithm Unit Tests - T082', () => {
  let algorithm: FSRS;

  beforeEach(() => {
    algorithm = new FSRS();
  });

  // ========== 카드 생성 및 초기화 ==========
  describe('Card Creation and Initialization', () => {
    test('should create a new card with correct initial values', () => {
      const card = algorithm.createCard();

      expect(card.state).toBe(CardState.NEW);
      expect(card.reps).toBe(0);
      expect(card.lapses).toBe(0);
      expect(card.stability).toBe(0);
      expect(card.difficulty).toBe(0);
      expect(card.elapsed_days).toBe(0);
      expect(card.scheduled_days).toBe(0);
      expect(card.last_review).toBeNull();
      expect(card.due).toBeInstanceOf(Date);
    });

    test('should initialize multiple cards with consistent values', () => {
      const cards = Array.from({ length: 10 }, () => algorithm.createCard());

      cards.forEach(card => {
        expect(card.state).toBe(CardState.NEW);
        expect(card.reps).toBe(0);
        expect(card.lapses).toBe(0);
      });
    });
  });

  // ========== 복습 처리 및 상태 전환 ==========
  describe('Review Processing and State Transitions', () => {
    let newCard: FSRSCard;

    beforeEach(() => {
      newCard = algorithm.createCard();
    });

    test('should correctly process first review of a new card with GOOD rating', () => {
      const reviewTime = new Date('2024-01-01T10:00:00Z');
      const reviewedCard = algorithm.review(newCard, Rating.GOOD, reviewTime);

      expect(reviewedCard.state).toBe(CardState.REVIEW);
      expect(reviewedCard.reps).toBe(1);
      expect(reviewedCard.lapses).toBe(0);
      expect(reviewedCard.last_review).toEqual(reviewTime);
      expect(reviewedCard.stability).toBeGreaterThan(0);
      expect(reviewedCard.difficulty).toBeGreaterThan(0);
      expect(reviewedCard.scheduled_days).toBeGreaterThan(0);
      expect(reviewedCard.due.getTime()).toBeGreaterThan(reviewTime.getTime());
    });

    test('should handle AGAIN rating correctly (card failure)', () => {
      const reviewTime = new Date('2024-01-01T10:00:00Z');
      const reviewedCard = algorithm.review(newCard, Rating.AGAIN, reviewTime);

      expect(reviewedCard.state).toBe(CardState.LEARNING);
      expect(reviewedCard.reps).toBe(1);
      expect(reviewedCard.lapses).toBe(1); // Failure count increased
      expect(reviewedCard.stability).toBeGreaterThan(0);
      expect(reviewedCard.scheduled_days).toBeGreaterThan(0);
    });

    test('should transition from LEARNING to REVIEW on successful rating', () => {
      let card = algorithm.review(newCard, Rating.AGAIN); // First failure
      expect(card.state).toBe(CardState.LEARNING);

      card = algorithm.review(card, Rating.GOOD); // Successful review
      expect(card.state).toBe(CardState.REVIEW);
      expect(card.reps).toBe(2);
    });

    test('should transition from REVIEW to RELEARNING on AGAIN rating', () => {
      let card = algorithm.review(newCard, Rating.GOOD); // Learn successfully
      expect(card.state).toBe(CardState.REVIEW);

      card = algorithm.review(card, Rating.AGAIN); // Forget later
      expect(card.state).toBe(CardState.RELEARNING);
      expect(card.lapses).toBe(1);
    });

    test('should handle all rating types correctly', () => {
      const ratings = [Rating.AGAIN, Rating.HARD, Rating.GOOD, Rating.EASY];

      ratings.forEach(rating => {
        const card = algorithm.createCard();
        const reviewedCard = algorithm.review(card, rating);

        expect(reviewedCard.reps).toBe(1);
        expect(reviewedCard.stability).toBeGreaterThan(0);
        expect(reviewedCard.difficulty).toBeGreaterThan(0);
        expect(reviewedCard.scheduled_days).toBeGreaterThan(0);

        if (rating === Rating.AGAIN) {
          expect(reviewedCard.lapses).toBe(1);
          expect(reviewedCard.state).toBe(CardState.LEARNING);
        } else {
          expect(reviewedCard.lapses).toBe(0);
          expect(reviewedCard.state).toBe(CardState.REVIEW);
        }
      });
    });
  });

  // ========== 안정성 및 난이도 계산 ==========
  describe('Stability and Difficulty Calculations', () => {
    test('should increase stability with successful reviews', () => {
      let card = algorithm.createCard();
      const initialStability = algorithm.review(card, Rating.GOOD).stability;

      card = algorithm.review(card, Rating.GOOD);
      const secondReview = algorithm.review(card, Rating.GOOD);

      expect(secondReview.stability).toBeGreaterThan(initialStability);
    });

    test('should decrease stability after AGAIN rating', () => {
      let card = algorithm.createCard();
      card = algorithm.review(card, Rating.GOOD); // Establish some stability

      const beforeFailure = card.stability;
      const afterFailure = algorithm.review(card, Rating.AGAIN);

      expect(afterFailure.stability).toBeLessThan(beforeFailure);
    });

    test('should adjust difficulty based on rating patterns', () => {
      let easyCard = algorithm.createCard();
      let hardCard = algorithm.createCard();

      // Simulate easy card (multiple EASY ratings)
      for (let i = 0; i < 5; i++) {
        easyCard = algorithm.review(easyCard, Rating.EASY);
      }

      // Simulate hard card (multiple AGAIN and HARD ratings)
      hardCard = algorithm.review(hardCard, Rating.AGAIN);
      hardCard = algorithm.review(hardCard, Rating.HARD);
      hardCard = algorithm.review(hardCard, Rating.AGAIN);

      expect(hardCard.difficulty).toBeGreaterThan(easyCard.difficulty);
    });

    test('should keep difficulty within valid bounds (1-10)', () => {
      let card = algorithm.createCard();

      // Test extreme cases
      for (let i = 0; i < 10; i++) {
        card = algorithm.review(card, Rating.EASY); // Should not exceed 10
      }
      expect(card.difficulty).toBeLessThanOrEqual(10);

      card = algorithm.createCard();
      for (let i = 0; i < 10; i++) {
        card = algorithm.review(card, Rating.AGAIN); // Should not go below 1
      }
      expect(card.difficulty).toBeGreaterThanOrEqual(1);
    });
  });

  // ========== 스케줄링 및 간격 계산 ==========
  describe('Scheduling and Interval Calculations', () => {
    test('should calculate longer intervals for higher stability', () => {
      const highStabilityCard: FSRSCard = {
        ...algorithm.createCard(),
        stability: 30,
        state: CardState.REVIEW
      };

      const lowStabilityCard: FSRSCard = {
        ...algorithm.createCard(),
        stability: 3,
        state: CardState.REVIEW
      };

      const highStabilityReview = algorithm.review(highStabilityCard, Rating.GOOD);
      const lowStabilityReview = algorithm.review(lowStabilityCard, Rating.GOOD);

      expect(highStabilityReview.scheduled_days).toBeGreaterThan(lowStabilityReview.scheduled_days);
    });

    test('should respect maximum interval limit', () => {
      const customAlgorithm = new FSRS({
        ...DEFAULT_FSRS_PARAMETERS,
        maximum_interval: 365 // 1 year max
      });

      const veryStableCard: FSRSCard = {
        ...customAlgorithm.createCard(),
        stability: 1000, // Very high stability
        state: CardState.REVIEW
      };

      const reviewedCard = customAlgorithm.review(veryStableCard, Rating.EASY);
      expect(reviewedCard.scheduled_days).toBeLessThanOrEqual(365);
    });

    test('should schedule all rating options correctly', () => {
      const card = algorithm.createCard();
      const schedule = algorithm.scheduleCard(card);

      // All rating options should be present
      expect(schedule[Rating.AGAIN]).toBeDefined();
      expect(schedule[Rating.HARD]).toBeDefined();
      expect(schedule[Rating.GOOD]).toBeDefined();
      expect(schedule[Rating.EASY]).toBeDefined();

      // EASY should generally have longer intervals than AGAIN
      expect(schedule[Rating.EASY].scheduled_days)
        .toBeGreaterThanOrEqual(schedule[Rating.AGAIN].scheduled_days);
    });

    test('should calculate elapsed days correctly', () => {
      const card = algorithm.createCard();
      const firstReview = new Date('2024-01-01T10:00:00Z');
      const secondReview = new Date('2024-01-05T10:00:00Z'); // 4 days later

      const reviewedCard = algorithm.review(card, Rating.GOOD, firstReview);
      const secondReviewCard = algorithm.review(reviewedCard, Rating.GOOD, secondReview);

      expect(secondReviewCard.elapsed_days).toBe(4);
    });
  });

  // ========== 기억 가능성 및 만료 계산 ==========
  describe('Retention and Due Date Calculations', () => {
    test('should calculate retention probability correctly', () => {
      const card: FSRSCard = {
        ...algorithm.createCard(),
        stability: 10
      };

      const retentionDay0 = algorithm.calculateRetention(card, 0);
      const retentionDay10 = algorithm.calculateRetention(card, 10);
      const retentionDay20 = algorithm.calculateRetention(card, 20);

      expect(retentionDay0).toBe(1); // 100% retention on day 0
      expect(retentionDay10).toBeCloseTo(0.9, 2); // ~90% retention at stability point
      expect(retentionDay20).toBeLessThan(retentionDay10); // Decreasing over time
      expect(retentionDay20).toBeGreaterThan(0); // Should not reach 0
    });

    test('should correctly identify due cards', () => {
      const now = new Date('2024-01-10T10:00:00Z');

      const pastDueCard: FSRSCard = {
        ...algorithm.createCard(),
        due: new Date('2024-01-09T10:00:00Z') // 1 day overdue
      };

      const futureDueCard: FSRSCard = {
        ...algorithm.createCard(),
        due: new Date('2024-01-11T10:00:00Z') // 1 day in future
      };

      expect(algorithm.isDue(pastDueCard, now)).toBe(true);
      expect(algorithm.isDue(futureDueCard, now)).toBe(false);
    });

    test('should calculate overdue days accurately', () => {
      const now = new Date('2024-01-10T10:00:00Z');

      const overdueCard: FSRSCard = {
        ...algorithm.createCard(),
        due: new Date('2024-01-07T10:00:00Z') // 3 days overdue
      };

      const notDueCard: FSRSCard = {
        ...algorithm.createCard(),
        due: new Date('2024-01-11T10:00:00Z') // Future due date
      };

      expect(algorithm.overdueDays(overdueCard, now)).toBe(3);
      expect(algorithm.overdueDays(notDueCard, now)).toBe(0);
    });
  });

  // ========== 우선순위 및 성숙도 계산 ==========
  describe('Priority and Maturity Calculations', () => {
    test('should calculate card maturity correctly', () => {
      const newCard: FSRSCard = { ...algorithm.createCard(), state: CardState.NEW };
      const learningCard: FSRSCard = { ...algorithm.createCard(), state: CardState.LEARNING, stability: 5 };
      const matureCard: FSRSCard = { ...algorithm.createCard(), state: CardState.REVIEW, stability: 30 };

      expect(algorithm.calculateMaturity(newCard)).toBe(0);
      expect(algorithm.calculateMaturity(learningCard)).toBeGreaterThan(0);
      expect(algorithm.calculateMaturity(learningCard)).toBeLessThan(1);
      expect(algorithm.calculateMaturity(matureCard)).toBe(1);
    });

    test('should calculate priority scores for review ordering', () => {
      const now = new Date('2024-01-10T10:00:00Z');

      const newCard: FSRSCard = { ...algorithm.createCard(), state: CardState.NEW };
      const overdueCard: FSRSCard = {
        ...algorithm.createCard(),
        state: CardState.REVIEW,
        due: new Date('2024-01-08T10:00:00Z'), // 2 days overdue
        stability: 5
      };
      const recentCard: FSRSCard = {
        ...algorithm.createCard(),
        state: CardState.REVIEW,
        due: new Date('2024-01-11T10:00:00Z'), // 1 day in future
        stability: 10
      };

      const newCardPriority = algorithm.calculatePriority(newCard, now);
      const overdueCardPriority = algorithm.calculatePriority(overdueCard, now);
      const recentCardPriority = algorithm.calculatePriority(recentCard, now);

      // Lower number = higher priority
      expect(overdueCardPriority).toBeLessThan(recentCardPriority);
      expect(overdueCardPriority).toBeLessThan(newCardPriority);
    });

    test('should calculate optimal batch size based on time constraints', () => {
      const cards: FSRSCard[] = Array.from({ length: 100 }, () => {
        const card = algorithm.createCard();
        return { ...card, due: new Date('2024-01-01T10:00:00Z') }; // All overdue
      });

      const batchSize30min = algorithm.calculateOptimalBatchSize(cards, 30); // 30 minutes
      const batchSize60min = algorithm.calculateOptimalBatchSize(cards, 60); // 60 minutes

      expect(batchSize60min).toBeGreaterThan(batchSize30min);
      expect(batchSize30min).toBeGreaterThan(0);
      expect(batchSize60min).toBeLessThanOrEqual(cards.length);
    });
  });

  // ========== 통계 및 분석 ==========
  describe('Statistics and Analytics', () => {
    test('should calculate comprehensive card statistics', () => {
      const cards: FSRSCard[] = [
        { ...algorithm.createCard(), state: CardState.NEW },
        { ...algorithm.createCard(), state: CardState.NEW },
        { ...algorithm.createCard(), state: CardState.LEARNING, stability: 5, difficulty: 6 },
        { ...algorithm.createCard(), state: CardState.REVIEW, stability: 15, difficulty: 4 },
        { ...algorithm.createCard(), state: CardState.REVIEW, stability: 25, difficulty: 3 },
      ];

      const stats = algorithm.calculateStats(cards);

      expect(stats.total).toBe(5);
      expect(stats.new).toBe(2);
      expect(stats.learning).toBe(1);
      expect(stats.review).toBe(2);
      expect(stats.averageStability).toBeCloseTo(15, 0); // (5 + 15 + 25) / 3
      expect(stats.averageDifficulty).toBeCloseTo(4.33, 1); // (6 + 4 + 3) / 3
      expect(stats.maturityRate).toBeGreaterThan(0);
      expect(stats.maturityRate).toBeLessThanOrEqual(1);
    });

    test('should handle empty card collection in statistics', () => {
      const stats = algorithm.calculateStats([]);

      expect(stats.total).toBe(0);
      expect(stats.new).toBe(0);
      expect(stats.learning).toBe(0);
      expect(stats.review).toBe(0);
      expect(stats.averageStability).toBe(0);
      expect(stats.averageDifficulty).toBe(0);
      expect(stats.maturityRate).toBe(0);
    });
  });

  // ========== 파라미터 관리 ==========
  describe('Parameter Management', () => {
    test('should allow parameter updates', () => {
      const newParameters = {
        request_retention: 0.85,
        maximum_interval: 180
      };

      algorithm.updateParameters(newParameters);
      const updatedParameters = algorithm.getParameters();

      expect(updatedParameters.request_retention).toBe(0.85);
      expect(updatedParameters.maximum_interval).toBe(180);
      expect(updatedParameters.w).toEqual(DEFAULT_FSRS_PARAMETERS.w); // Other params unchanged
    });

    test('should use custom parameters in calculations', () => {
      const customAlgorithm = new FSRS({
        request_retention: 0.8,
        maximum_interval: 100,
        w: DEFAULT_FSRS_PARAMETERS.w
      });

      const standardCard = algorithm.review(algorithm.createCard(), Rating.GOOD);
      const customCard = customAlgorithm.review(customAlgorithm.createCard(), Rating.GOOD);

      // Results should differ due to different parameters
      expect(customCard.scheduled_days).toBeLessThanOrEqual(100);
    });
  });

  // ========== 경계값 및 예외 상황 ==========
  describe('Edge Cases and Error Handling', () => {
    test('should handle very old reviews gracefully', () => {
      const card = algorithm.createCard();
      const veryOldReview = new Date('2020-01-01T10:00:00Z');
      const recentReview = new Date('2024-01-01T10:00:00Z');

      const reviewedCard = algorithm.review(card, Rating.GOOD, veryOldReview);
      const secondReview = algorithm.review(reviewedCard, Rating.GOOD, recentReview);

      expect(secondReview.elapsed_days).toBeGreaterThan(1000);
      expect(secondReview.stability).toBeGreaterThan(0);
      expect(secondReview.difficulty).toBeGreaterThan(0);
    });

    test('should handle rapid successive reviews', () => {
      let card = algorithm.createCard();
      const baseTime = new Date('2024-01-01T10:00:00Z');

      // Multiple reviews within the same day
      for (let i = 0; i < 5; i++) {
        const reviewTime = new Date(baseTime.getTime() + i * 60 * 60 * 1000); // 1 hour apart
        card = algorithm.review(card, Rating.GOOD, reviewTime);
      }

      expect(card.reps).toBe(5);
      expect(card.stability).toBeGreaterThan(0);
      expect(card.difficulty).toBeGreaterThan(0);
    });

    test('should handle future review dates gracefully', () => {
      const card = algorithm.createCard();
      const futureTime = new Date('2030-01-01T10:00:00Z');

      const reviewedCard = algorithm.review(card, Rating.GOOD, futureTime);

      expect(reviewedCard.last_review).toEqual(futureTime);
      expect(reviewedCard.reps).toBe(1);
      expect(reviewedCard.stability).toBeGreaterThan(0);
    });

    test('should maintain data consistency through multiple reviews', () => {
      let card = algorithm.createCard();
      const ratings = [Rating.GOOD, Rating.HARD, Rating.AGAIN, Rating.GOOD, Rating.EASY];

      let totalReps = 0;
      let totalLapses = 0;

      ratings.forEach(rating => {
        card = algorithm.review(card, rating);
        totalReps++;
        if (rating === Rating.AGAIN) totalLapses++;

        // Consistency checks
        expect(card.reps).toBe(totalReps);
        expect(card.lapses).toBe(totalLapses);
        expect(card.stability).toBeGreaterThan(0);
        expect(card.difficulty).toBeGreaterThanOrEqual(1);
        expect(card.difficulty).toBeLessThanOrEqual(10);
      });
    });
  });

  // ========== 실제 사용 시나리오 시뮬레이션 ==========
  describe('Real-world Usage Scenarios', () => {
    test('should simulate a typical learning session', () => {
      const cards: FSRSCard[] = Array.from({ length: 10 }, () => algorithm.createCard());
      const now = new Date('2024-01-01T10:00:00Z');

      // Simulate daily reviews for a week
      for (let day = 0; day < 7; day++) {
        const reviewDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);

        cards.forEach((card, index) => {
          if (algorithm.isDue(card, reviewDate)) {
            // Simulate varying performance
            const rating = index % 4 === 0 ? Rating.AGAIN :
                          index % 3 === 0 ? Rating.HARD :
                          index % 2 === 0 ? Rating.GOOD : Rating.EASY;

            cards[index] = algorithm.review(card, rating, reviewDate);
          }
        });
      }

      const stats = algorithm.calculateStats(cards);
      expect(stats.total).toBe(10);
      expect(stats.new).toBeLessThan(10); // Some cards should have progressed
    });

    test('should handle forgetting and relearning cycle', () => {
      let card = algorithm.createCard();

      // Learn the card
      card = algorithm.review(card, Rating.GOOD);
      expect(card.state).toBe(CardState.REVIEW);

      // Build up stability with multiple successful reviews
      for (let i = 0; i < 3; i++) {
        card = algorithm.review(card, Rating.GOOD);
      }
      const highStability = card.stability;

      // Forget the card
      card = algorithm.review(card, Rating.AGAIN);
      expect(card.state).toBe(CardState.RELEARNING);
      expect(card.stability).toBeLessThan(highStability);

      // Relearn the card
      card = algorithm.review(card, Rating.GOOD);
      expect(card.state).toBe(CardState.REVIEW);
      expect(card.lapses).toBe(1);
    });
  });

  // ========== 전역 인스턴스 테스트 ==========
  describe('Global FSRS Instance', () => {
    test('should provide a working global instance', () => {
      const card = fsrs.createCard();
      const reviewedCard = fsrs.review(card, Rating.GOOD);

      expect(reviewedCard).toBeDefined();
      expect(reviewedCard.reps).toBe(1);
      expect(reviewedCard.state).toBe(CardState.REVIEW);
    });

    test('should maintain consistency across global instance calls', () => {
      const card1 = fsrs.createCard();
      const card2 = fsrs.createCard();

      expect(card1.state).toBe(card2.state);
      expect(card1.reps).toBe(card2.reps);
    });
  });
});