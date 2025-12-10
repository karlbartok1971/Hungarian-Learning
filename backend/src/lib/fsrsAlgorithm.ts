/**
 * FSRS (Free Spaced Repetition Scheduler) Algorithm Implementation
 * T082 - FSRS 알고리즘 구현 및 단위 테스트 대상
 *
 * FSRS는 Anki의 SM-2 알고리즘을 개선한 최신 간격 반복 학습 알고리즘입니다.
 * 사용자의 기억 패턴을 더 정확하게 모델링하여 최적의 복습 간격을 제안합니다.
 */

// FSRS 카드 상태 정의
export enum CardState {
  NEW = 0,      // 새로운 카드
  LEARNING = 1, // 학습 중 카드
  REVIEW = 2,   // 복습 카드
  RELEARNING = 3 // 재학습 카드
}

// FSRS 평가 등급 (사용자 응답)
export enum Rating {
  AGAIN = 1,  // 다시 (완전히 틀림)
  HARD = 2,   // 어려움 (틀렸지만 기억남)
  GOOD = 3,   // 좋음 (정답, 적절한 노력)
  EASY = 4    // 쉬움 (정답, 매우 쉬움)
}

// FSRS 카드 데이터 구조
export interface FSRSCard {
  due: Date;                // 다음 복습 날짜
  stability: number;        // 기억의 안정성 (일 단위)
  difficulty: number;       // 카드의 난이도 (0.0 ~ 10.0)
  elapsed_days: number;     // 마지막 복습 이후 경과 일수
  scheduled_days: number;   // 예정된 복습 간격
  reps: number;            // 총 복습 횟수
  lapses: number;          // 실패 횟수 (AGAIN 등급)
  state: CardState;        // 현재 카드 상태
  last_review: Date | null; // 마지막 복습 날짜
}

// FSRS 복습 로그
export interface FSRSReviewLog {
  rating: Rating;
  elapsed_days: number;
  scheduled_days: number;
  review_time: Date;
  card_state: CardState;
}

// FSRS 파라미터 (알고리즘 튜닝)
export interface FSRSParameters {
  request_retention: number;     // 목표 기억 보존률 (0.8-0.95)
  maximum_interval: number;      // 최대 복습 간격 (일)
  w: number[];                  // 가중치 매개변수 (17개)
}

// 기본 FSRS 파라미터 (연구 결과 기반 최적값)
export const DEFAULT_FSRS_PARAMETERS: FSRSParameters = {
  request_retention: 0.9,
  maximum_interval: 36500, // 100년
  w: [
    0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94,
    2.18, 0.05, 0.34, 1.26, 0.29, 2.61
  ]
};

// FSRS 스케줄링 결과
export interface FSRSSchedule {
  [Rating.AGAIN]: FSRSCard;
  [Rating.HARD]: FSRSCard;
  [Rating.GOOD]: FSRSCard;
  [Rating.EASY]: FSRSCard;
}

/**
 * FSRS 알고리즘 핵심 클래스
 */
export class FSRS {
  private parameters: FSRSParameters;

  constructor(parameters: FSRSParameters = DEFAULT_FSRS_PARAMETERS) {
    this.parameters = parameters;
  }

  /**
   * 새 카드 초기화
   */
  createCard(): FSRSCard {
    return {
      due: new Date(),
      stability: 0,
      difficulty: 0,
      elapsed_days: 0,
      scheduled_days: 0,
      reps: 0,
      lapses: 0,
      state: CardState.NEW,
      last_review: null
    };
  }

  /**
   * 카드 복습 처리 및 다음 복습 일정 계산
   */
  review(card: FSRSCard, rating: Rating, reviewTime: Date = new Date()): FSRSCard {
    const updatedCard = { ...card };

    // 경과 일수 계산
    if (updatedCard.last_review) {
      updatedCard.elapsed_days = Math.max(0,
        Math.floor((reviewTime.getTime() - updatedCard.last_review.getTime()) / (24 * 60 * 60 * 1000))
      );
    }

    // 복습 횟수 증가
    updatedCard.reps += 1;
    updatedCard.last_review = new Date(reviewTime);

    // AGAIN 평가 시 실패 횟수 증가
    if (rating === Rating.AGAIN) {
      updatedCard.lapses += 1;
    }

    // 상태별 처리
    switch (updatedCard.state) {
      case CardState.NEW:
        updatedCard.stability = this.initStability(rating);
        updatedCard.difficulty = this.initDifficulty(rating);
        updatedCard.state = rating === Rating.AGAIN ? CardState.LEARNING : CardState.REVIEW;
        break;

      case CardState.LEARNING:
      case CardState.RELEARNING:
        updatedCard.stability = this.calculateNewStability(updatedCard, rating);
        updatedCard.difficulty = this.nextDifficulty(updatedCard.difficulty, rating);
        updatedCard.state = rating === Rating.AGAIN ?
          CardState.LEARNING : CardState.REVIEW;
        break;

      case CardState.REVIEW:
        if (rating === Rating.AGAIN) {
          updatedCard.stability = this.calculateNewStability(updatedCard, rating);
          updatedCard.difficulty = this.nextDifficulty(updatedCard.difficulty, rating);
          updatedCard.state = CardState.RELEARNING;
        } else {
          updatedCard.stability = this.calculateNewStability(updatedCard, rating);
          updatedCard.difficulty = this.nextDifficulty(updatedCard.difficulty, rating);
          updatedCard.state = CardState.REVIEW;
        }
        break;
    }

    // 다음 복습 간격 계산
    updatedCard.scheduled_days = this.calculateInterval(updatedCard.stability);
    updatedCard.due = new Date(reviewTime.getTime() + updatedCard.scheduled_days * 24 * 60 * 60 * 1000);

    return updatedCard;
  }

  /**
   * 카드의 모든 가능한 평가에 대한 스케줄링 미리보기
   */
  scheduleCard(card: FSRSCard, reviewTime: Date = new Date()): FSRSSchedule {
    const schedule: FSRSSchedule = {} as FSRSSchedule;

    for (const rating of [Rating.AGAIN, Rating.HARD, Rating.GOOD, Rating.EASY]) {
      schedule[rating] = this.review(card, rating, reviewTime);
    }

    return schedule;
  }

  /**
   * 초기 안정성 계산 (새 카드용)
   */
  private initStability(rating: Rating): number {
    return Math.max(this.parameters.w[rating - 1], 0.1);
  }

  /**
   * 초기 난이도 계산 (새 카드용)
   */
  private initDifficulty(rating: Rating): number {
    return Math.min(Math.max(this.parameters.w[4] - (rating - 3) * this.parameters.w[5], 1), 10);
  }

  /**
   * 새로운 안정성 계산
   */
  private calculateNewStability(card: FSRSCard, rating: Rating): number {
    if (rating === Rating.AGAIN) {
      // 실패 시 안정성 감소
      return card.stability * Math.exp(this.parameters.w[11] * (Math.max(0, 11 - card.difficulty - this.parameters.w[12])));
    } else {
      // 성공 시 안정성 증가
      const hard_penalty = rating === Rating.HARD ? this.parameters.w[13] : 1;
      const easy_bonus = rating === Rating.EASY ? this.parameters.w[14] : 1;

      return card.stability * (
        1 + Math.exp(this.parameters.w[8]) *
        (11 - card.difficulty) *
        Math.pow(card.stability, -this.parameters.w[9]) *
        (Math.exp((1 - card.elapsed_days / card.scheduled_days) * this.parameters.w[10]) - 1) *
        hard_penalty * easy_bonus
      );
    }
  }

  /**
   * 다음 난이도 계산
   */
  private nextDifficulty(difficulty: number, rating: Rating): number {
    const delta = -this.parameters.w[6] * (rating - 3);
    return Math.min(Math.max(difficulty + delta, 1), 10);
  }

  /**
   * 복습 간격 계산
   */
  private calculateInterval(stability: number): number {
    const interval = stability * (Math.log(this.parameters.request_retention) / Math.log(0.9));
    return Math.min(Math.max(Math.round(interval), 1), this.parameters.maximum_interval);
  }

  /**
   * 기억 가능성 계산 (0-1 사이)
   */
  calculateRetention(card: FSRSCard, days: number): number {
    return Math.pow(0.9, days / card.stability);
  }

  /**
   * 카드가 기한이 지났는지 확인
   */
  isDue(card: FSRSCard, now: Date = new Date()): boolean {
    return card.due.getTime() <= now.getTime();
  }

  /**
   * 기한이 지난 일수 계산
   */
  overdueDays(card: FSRSCard, now: Date = new Date()): number {
    if (!this.isDue(card, now)) return 0;
    return Math.floor((now.getTime() - card.due.getTime()) / (24 * 60 * 60 * 1000));
  }

  /**
   * 학습 진행률 계산 (새 카드 → 성숙한 카드)
   */
  calculateMaturity(card: FSRSCard): number {
    if (card.state === CardState.NEW) return 0;
    if (card.state === CardState.LEARNING || card.state === CardState.RELEARNING) {
      return Math.min(card.stability / 21, 1); // 21일 안정성을 성숙의 기준으로
    }
    return 1; // REVIEW 상태는 성숙한 카드
  }

  /**
   * 최적 배치 크기 계산 (한 번에 학습할 카드 수)
   */
  calculateOptimalBatchSize(cards: FSRSCard[], targetTime: number): number {
    // 간단한 휴리스틱: 평균 복습 시간을 기반으로 계산
    const averageReviewTime = 30; // 초 단위
    const maxCards = Math.floor((targetTime * 60) / averageReviewTime);

    // 기한이 지난 카드를 우선적으로 포함
    const overdueCards = cards.filter(card => this.isDue(card));
    return Math.min(maxCards, overdueCards.length + 5); // 새 카드 5개 추가
  }

  /**
   * 카드 우선순위 점수 계산 (낮을수록 우선순위 높음)
   */
  calculatePriority(card: FSRSCard, now: Date = new Date()): number {
    if (card.state === CardState.NEW) return 1000; // 새 카드는 낮은 우선순위

    const overdue = this.overdueDays(card, now);
    const retention = this.calculateRetention(card,
      Math.max(0, (now.getTime() - card.due.getTime()) / (24 * 60 * 60 * 1000))
    );

    // 기한 초과 + 낮은 기억률 = 높은 우선순위
    return (1 - retention) * 100 + Math.min(overdue * 2, 50);
  }

  /**
   * FSRS 파라미터 업데이트 (사용자 데이터 기반 튜닝)
   */
  updateParameters(newParameters: Partial<FSRSParameters>): void {
    this.parameters = { ...this.parameters, ...newParameters };
  }

  /**
   * 현재 파라미터 조회
   */
  getParameters(): FSRSParameters {
    return { ...this.parameters };
  }

  /**
   * 통계 계산
   */
  calculateStats(cards: FSRSCard[]): {
    total: number;
    new: number;
    learning: number;
    review: number;
    averageStability: number;
    averageDifficulty: number;
    maturityRate: number;
  } {
    const stats = {
      total: cards.length,
      new: cards.filter(c => c.state === CardState.NEW).length,
      learning: cards.filter(c => c.state === CardState.LEARNING || c.state === CardState.RELEARNING).length,
      review: cards.filter(c => c.state === CardState.REVIEW).length,
      averageStability: 0,
      averageDifficulty: 0,
      maturityRate: 0
    };

    if (cards.length === 0) return stats;

    const studiedCards = cards.filter(c => c.state !== CardState.NEW);
    if (studiedCards.length > 0) {
      stats.averageStability = studiedCards.reduce((sum, c) => sum + c.stability, 0) / studiedCards.length;
      stats.averageDifficulty = studiedCards.reduce((sum, c) => sum + c.difficulty, 0) / studiedCards.length;
    }

    const matureCards = cards.filter(c => this.calculateMaturity(c) >= 0.8);
    stats.maturityRate = matureCards.length / cards.length;

    return stats;
  }
}

/**
 * 글로벌 FSRS 인스턴스
 */
export const fsrs = new FSRS();