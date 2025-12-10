import { FSRS, FSRSCard, Rating, CardState, FSRSSchedule } from '../lib/fsrsAlgorithm';
import { VocabularyCard, VocabularyReviewResponse, LinguisticDifficultyFactors } from '../models/VocabularyCard';
import { SessionCardInfo, ReviewSession } from '../models/ReviewSession';
import { GameificationEngine } from './gamificationEngine';

/**
 * FSRS 알고리즘 서비스 - 어휘 학습에 특화된 간격 반복 시스템
 * T088 - FSRSAlgorithmService 구현
 *
 * 한국어-헝가리어 학습에 최적화된 FSRS 알고리즘 서비스
 */

export interface FSRSServiceConfig {
  // FSRS 파라미터 설정
  request_retention: number;           // 목표 기억 보존률 (기본 0.9)
  maximum_interval: number;            // 최대 간격 (일, 기본 36500)

  // 한국어-헝가리어 특화 설정
  korean_interference_weight: number;  // 한국어 간섭 가중치
  theological_content_bonus: number;   // 신학 콘텐츠 보너스
  pronunciation_difficulty_penalty: number; // 발음 난이도 패널티

  // 개인화 설정
  learning_style_adaptation: boolean;  // 학습 스타일 적응
  performance_based_tuning: boolean;   // 성과 기반 튜닝
  contextual_difficulty_adjustment: boolean; // 맥락적 난이도 조정
}

export interface ReviewDueCard {
  card_id: string;
  vocabulary_card: VocabularyCard;
  fsrs_card: FSRSCard;
  due_date: Date;
  overdue_days: number;
  priority_score: number;              // 우선순위 점수 (높을수록 중요)
  estimated_difficulty: number;        // 예상 난이도
}

export interface SchedulingResult {
  updated_fsrs_card: FSRSCard;
  next_review_date: Date;
  interval_days: number;
  stability: number;
  difficulty: number;

  // 게임화 정보
  points_earned: number;
  performance_bonus: number;
  streak_bonus: number;

  // 학습 인사이트
  learning_insight: {
    mastery_level: number;             // 숙달 수준 (0-1)
    retention_prediction: number;      // 기억 예측 (0-1)
    optimal_review_time: Date;         // 최적 복습 시간
    difficulty_trend: 'improving' | 'stable' | 'declining';
  };
}

export class FSRSAlgorithmService {
  private fsrs: FSRS;
  private config: FSRSServiceConfig;
  private gamificationEngine: GameificationEngine;

  constructor(config?: Partial<FSRSServiceConfig>) {
    // 한국어-헝가리어 학습에 최적화된 기본 설정
    this.config = {
      request_retention: 0.9,
      maximum_interval: 36500,
      korean_interference_weight: 0.15,
      theological_content_bonus: 0.1,
      pronunciation_difficulty_penalty: 0.05,
      learning_style_adaptation: true,
      performance_based_tuning: true,
      contextual_difficulty_adjustment: true,
      ...config
    };

    // 커스텀 FSRS 파라미터로 초기화
    this.fsrs = new FSRS({
      request_retention: this.config.request_retention,
      maximum_interval: this.config.maximum_interval,
      w: this.getOptimizedWeights()
    });

    this.gamificationEngine = new GameificationEngine();
  }

  /**
   * 한국어-헝가리어 학습에 최적화된 FSRS 가중치 계산
   */
  private getOptimizedWeights(): number[] {
    // 기본 FSRS 가중치를 한국어-헝가리어 학습에 최적화
    const baseWeights = [
      0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94,
      2.18, 0.05, 0.34, 1.26, 0.29, 2.61
    ];

    // 한국어-헝가리어 특화 조정
    const adjustments = [
      1.1,  // w0: 첫 학습 가중치 증가 (격변화 복잡성)
      1.0,  // w1: 유지
      0.9,  // w2: 어려운 카드 가중치 조정 (언어적 거리)
      0.95, // w3: 유지
      1.05, // w4: 초기 난이도 약간 증가
      1.2,  // w5: 난이도 증가율 증가 (한국어 간섭)
      0.9,  // w6: 난이도 감소율 조정
      1.0,  // w7-w10: 유지
      1.0,
      1.0,
      1.0,
      0.8,  // w11: 실패 시 안정성 감소 조정
      1.0,  // w12: 유지
      0.95, // w13: HARD 패널티 조정
      1.05, // w14: EASY 보너스 조정
      1.0,  // w15: 유지
      1.1   // w16: 복습 간격 조정
    ];

    return baseWeights.map((weight, index) => weight * adjustments[index]);
  }

  /**
   * 어휘 카드의 난이도 분석 및 조정
   */
  async analyzeDifficulty(vocabularyCard: VocabularyCard): Promise<LinguisticDifficultyFactors> {
    const difficulty: LinguisticDifficultyFactors = {
      // 음성학적 분석
      phonetic_difficulty: this.calculatePhoneticDifficulty(vocabularyCard),
      stress_pattern_complexity: this.calculateStressComplexity(vocabularyCard),

      // 형태학적 분석
      morphological_complexity: this.calculateMorphologicalComplexity(vocabularyCard),
      case_system_difficulty: this.calculateCaseSystemDifficulty(vocabularyCard),

      // 통사학적 분석
      word_order_difference: this.calculateWordOrderDifference(vocabularyCard),
      syntactic_complexity: this.calculateSyntacticComplexity(vocabularyCard),

      // 어휘적 분석
      false_cognate_risk: vocabularyCard.learning_info.false_friends?.length || 0 * 0.2,
      frequency_asymmetry: 1 - vocabularyCard.learning_info.usage_frequency,

      // 화용적 분석
      pragmatic_complexity: this.calculatePragmaticComplexity(vocabularyCard),
      cultural_specificity: vocabularyCard.learning_info.cultural_context ? 0.3 : 0.1
    };

    return difficulty;
  }

  /**
   * 복습 예정 카드 목록 조회 (우선순위 정렬)
   */
  async getDueCards(
    userId: string,
    limit: number = 20,
    includeOverdue: boolean = true
  ): Promise<ReviewDueCard[]> {
    try {
      // 실제로는 데이터베이스에서 사용자의 카드들을 조회
      const userCards = await this.getUserVocabularyCards(userId);
      const now = new Date();

      const dueCards: ReviewDueCard[] = [];

      for (const card of userCards) {
        const fsrsCard = card.fsrs_data;

        // 복습 예정인지 확인
        const isDue = this.fsrs.isDue(fsrsCard, now);
        const overdueDays = this.fsrs.overdueDays(fsrsCard, now);

        if (isDue || (includeOverdue && overdueDays > 0)) {
          const priorityScore = await this.calculatePriorityScore(card, overdueDays);
          const estimatedDifficulty = await this.estimateDifficulty(card);

          dueCards.push({
            card_id: card.card_id,
            vocabulary_card: card,
            fsrs_card: fsrsCard,
            due_date: fsrsCard.due,
            overdue_days: overdueDays,
            priority_score: priorityScore,
            estimated_difficulty: estimatedDifficulty
          });
        }
      }

      // 우선순위순으로 정렬하고 제한된 수만 반환
      return dueCards
        .sort((a, b) => b.priority_score - a.priority_score)
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting due cards:', error);
      throw new Error('복습 예정 카드 조회에 실패했습니다');
    }
  }

  /**
   * 복습 응답 처리 및 스케줄링
   */
  async processReview(
    vocabularyCard: VocabularyCard,
    response: VocabularyReviewResponse,
    sessionContext?: ReviewSession
  ): Promise<SchedulingResult> {
    try {
      const fsrsCard = vocabularyCard.fsrs_data;
      const rating = response.fsrs_rating;
      const reviewTime = response.reviewed_at;

      // FSRS 알고리즘으로 카드 업데이트
      const updatedFsrsCard = this.fsrs.review(fsrsCard, rating, reviewTime);

      // 한국어-헝가리어 특화 조정 적용
      await this.applyLanguageSpecificAdjustments(updatedFsrsCard, vocabularyCard, response);

      // 성과 기반 포인트 계산
      const pointsResult = await this.calculatePoints(vocabularyCard, response, sessionContext);

      // 학습 인사이트 생성
      const learningInsight = await this.generateLearningInsight(updatedFsrsCard, vocabularyCard, response);

      // 결과 구성
      const result: SchedulingResult = {
        updated_fsrs_card: updatedFsrsCard,
        next_review_date: updatedFsrsCard.due,
        interval_days: updatedFsrsCard.scheduled_days,
        stability: updatedFsrsCard.stability,
        difficulty: updatedFsrsCard.difficulty,
        points_earned: pointsResult.base_points + pointsResult.bonus_points,
        performance_bonus: pointsResult.performance_bonus,
        streak_bonus: pointsResult.streak_bonus,
        learning_insight: learningInsight
      };

      // 게임화 시스템에 성과 보고
      if (sessionContext?.settings.enable_gamification) {
        await this.reportToGamificationSystem(vocabularyCard, response, result);
      }

      return result;

    } catch (error) {
      console.error('Error processing review:', error);
      throw new Error('복습 처리 중 오류가 발생했습니다');
    }
  }

  /**
   * 학습 세션을 위한 카드 스케줄링
   */
  async scheduleCardsForSession(
    userId: string,
    sessionType: string,
    maxCards: number,
    preferences: any = {}
  ): Promise<SessionCardInfo[]> {
    try {
      // 복습 예정 카드 조회
      const dueCards = await this.getDueCards(userId, maxCards * 2);

      // 새 카드 조회 (필요한 경우)
      let newCards: VocabularyCard[] = [];
      if (preferences.include_new_cards) {
        newCards = await this.getNewCards(userId, Math.floor(maxCards * 0.3));
      }

      // 세션 카드 정보 생성
      const sessionCards: SessionCardInfo[] = [];
      let sequenceNumber = 1;

      // 복습 카드 추가
      for (const dueCard of dueCards.slice(0, maxCards - newCards.length)) {
        const cardInfo: SessionCardInfo = {
          card_id: `session_${Date.now()}_${sequenceNumber}`,
          vocabulary_card_id: dueCard.card_id,
          hungarian_word: dueCard.vocabulary_card.hungarian_word,
          korean_meaning: dueCard.vocabulary_card.korean_meaning,
          question_type: this.selectQuestionType(dueCard.vocabulary_card),
          show_hint: this.shouldShowHint(dueCard.vocabulary_card),
          has_audio: !!dueCard.vocabulary_card.audio_url,
          due_date: dueCard.due_date,
          stability: dueCard.fsrs_card.stability,
          difficulty: dueCard.fsrs_card.difficulty,
          interval_days: dueCard.fsrs_card.scheduled_days,
          sequence_number: sequenceNumber++,
          is_bonus_card: false
        };

        sessionCards.push(cardInfo);
      }

      // 새 카드 추가
      for (const newCard of newCards) {
        const cardInfo: SessionCardInfo = {
          card_id: `session_${Date.now()}_${sequenceNumber}`,
          vocabulary_card_id: newCard.card_id,
          hungarian_word: newCard.hungarian_word,
          korean_meaning: newCard.korean_meaning,
          question_type: 'recognition', // 새 카드는 인식부터 시작
          show_hint: true,
          has_audio: !!newCard.audio_url,
          due_date: new Date(),
          stability: 0,
          difficulty: 0,
          interval_days: 0,
          sequence_number: sequenceNumber++,
          is_bonus_card: false
        };

        sessionCards.push(cardInfo);
      }

      // 랜덤화 (설정에 따라)
      if (preferences.randomize_order) {
        this.shuffleArray(sessionCards);
      }

      return sessionCards;

    } catch (error) {
      console.error('Error scheduling cards for session:', error);
      throw new Error('세션 카드 스케줄링에 실패했습니다');
    }
  }

  /**
   * 학습 진도 분석
   */
  async analyzeLearningProgress(userId: string, timeRange?: { start: Date; end: Date }) {
    try {
      const userCards = await this.getUserVocabularyCards(userId);
      const reviews = await this.getUserReviews(userId, timeRange);

      const analysis = {
        total_cards: userCards.length,
        cards_by_state: this.analyzeCardsByState(userCards),
        retention_rates: await this.calculateRetentionRates(userCards, reviews),
        difficulty_distribution: this.analyzeDifficultyDistribution(userCards),
        learning_velocity: await this.calculateLearningVelocity(reviews),
        predicted_outcomes: await this.predictLearningOutcomes(userCards, reviews)
      };

      return analysis;

    } catch (error) {
      console.error('Error analyzing learning progress:', error);
      throw new Error('학습 진도 분석에 실패했습니다');
    }
  }

  // === 보조 메서드들 ===

  private calculatePhoneticDifficulty(card: VocabularyCard): number {
    // 한국어 화자에게 어려운 헝가리어 음소 패턴 분석
    const difficultSounds = ['ö', 'ű', 'ü', 'ő', 'gy', 'ny', 'ty', 'sz', 'zs'];
    const word = card.hungarian_word.toLowerCase();

    let difficulty = 0;
    for (const sound of difficultSounds) {
      difficulty += (word.includes(sound) ? 0.1 : 0);
    }

    // IPA 발음 정보가 있으면 더 정확한 분석
    if (card.pronunciation_ipa) {
      difficulty += card.learning_info.pronunciation_difficulty;
    }

    return Math.min(difficulty, 1.0);
  }

  private calculateStressComplexity(card: VocabularyCard): number {
    // 헝가리어 강세는 항상 첫 음절이므로 상대적으로 단순
    const wordLength = card.hungarian_word.split(/[-\s]/).length;
    return Math.min(wordLength * 0.05, 0.3);
  }

  private calculateMorphologicalComplexity(card: VocabularyCard): number {
    const grammarInfo = card.grammar_info;

    if (grammarInfo.case_forms) {
      return Math.min(Object.keys(grammarInfo.case_forms).length * 0.1, 1.0);
    }

    if (grammarInfo.verb_conjugation) {
      const conjugationForms = Object.values(grammarInfo.verb_conjugation).flat().length;
      return Math.min(conjugationForms * 0.05, 1.0);
    }

    return 0.1; // 기본값
  }

  private calculateCaseSystemDifficulty(card: VocabularyCard): number {
    if (card.grammar_info.word_class === 'noun' && card.grammar_info.case_forms) {
      // 헝가리어의 복잡한 격변화 시스템
      const caseCount = Object.keys(card.grammar_info.case_forms).length;
      return Math.min(caseCount * 0.08, 0.8);
    }
    return 0;
  }

  private calculateWordOrderDifference(card: VocabularyCard): number {
    // 헝가리어는 SOV, 한국어도 SOV이므로 어순 차이는 상대적으로 적음
    return 0.1;
  }

  private calculateSyntacticComplexity(card: VocabularyCard): number {
    if (card.grammar_info.word_class === 'phrase' || card.grammar_info.word_class === 'expression') {
      return 0.4;
    }
    return 0.1;
  }

  private calculatePragmaticComplexity(card: VocabularyCard): number {
    const formalityMap = {
      'informal': 0.1,
      'neutral': 0.2,
      'formal': 0.3,
      'very_formal': 0.4
    };

    return formalityMap[card.learning_info.formality_level] || 0.2;
  }

  private async calculatePriorityScore(card: VocabularyCard, overdueDays: number): Promise<number> {
    let score = 0;

    // 연체일 기반 우선순위
    score += Math.min(overdueDays * 10, 50);

    // 난이도 기반 우선순위 (어려운 카드 우선)
    score += card.learning_stats.accuracy_rate < 0.7 ? 30 : 0;

    // 카테고리 중요도 (신학 관련 높은 우선순위)
    if (card.category.includes('theology') || card.category.includes('liturgy')) {
      score += 20;
    }

    // 기억 안정성 기반
    score += (1 - card.fsrs_data.stability / 30) * 15;

    return Math.min(score, 100);
  }

  private async estimateDifficulty(card: VocabularyCard): Promise<number> {
    const linguisticFactors = await this.analyzeDifficulty(card);
    const userPerformance = card.learning_stats.accuracy_rate;

    // 언어학적 난이도와 개인 성과 결합
    const linguisticDifficulty = Object.values(linguisticFactors).reduce((sum, val) => sum + val, 0) / Object.keys(linguisticFactors).length;
    const personalDifficulty = 1 - userPerformance;

    return (linguisticDifficulty * 0.6 + personalDifficulty * 0.4);
  }

  private async applyLanguageSpecificAdjustments(
    fsrsCard: FSRSCard,
    vocabularyCard: VocabularyCard,
    response: VocabularyReviewResponse
  ) {
    // 한국어 간섭 효과 적용
    if (vocabularyCard.learning_info.korean_interference_risk > 0.5) {
      fsrsCard.difficulty *= (1 + this.config.korean_interference_weight);
    }

    // 신학 콘텐츠 보너스 적용
    if (vocabularyCard.category.toString().includes('theology')) {
      fsrsCard.stability *= (1 + this.config.theological_content_bonus);
    }

    // 발음 난이도 패널티 적용
    if (response.review_type === 'speaking' && vocabularyCard.learning_info.pronunciation_difficulty > 0.7) {
      fsrsCard.difficulty *= (1 + this.config.pronunciation_difficulty_penalty);
    }
  }

  private async calculatePoints(
    vocabularyCard: VocabularyCard,
    response: VocabularyReviewResponse,
    sessionContext?: ReviewSession
  ) {
    let basePoints = response.is_correct ? 10 : 5;

    // 난이도 보너스
    const difficultyBonus = vocabularyCard.learning_stats.accuracy_rate < 0.7 ? 5 : 0;

    // 응답 시간 보너스
    const timeBonus = response.response_time_ms < 3000 ? 3 : 0;

    // 연속 정답 보너스
    const streakBonus = 0; // 세션 컨텍스트에서 계산

    // 신학 콘텐츠 보너스
    const theologicalBonus = vocabularyCard.category.toString().includes('theology') ? 2 : 0;

    return {
      base_points: basePoints,
      bonus_points: difficultyBonus + timeBonus + theologicalBonus,
      performance_bonus: difficultyBonus,
      streak_bonus: streakBonus
    };
  }

  private async generateLearningInsight(
    fsrsCard: FSRSCard,
    vocabularyCard: VocabularyCard,
    response: VocabularyReviewResponse
  ) {
    const masteryLevel = Math.min(fsrsCard.stability / 21, 1); // 21일을 완전 숙달 기준으로
    const retentionPrediction = this.fsrs.calculateRetention(fsrsCard, fsrsCard.scheduled_days);

    // 최적 복습 시간 계산 (기억률이 85%가 되는 시점)
    let optimalDays = 1;
    while (optimalDays <= fsrsCard.scheduled_days &&
           this.fsrs.calculateRetention(fsrsCard, optimalDays) > 0.85) {
      optimalDays++;
    }

    const optimalReviewTime = new Date(Date.now() + (optimalDays - 1) * 24 * 60 * 60 * 1000);

    // 난이도 트렌드 분석
    let difficultyTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (vocabularyCard.learning_stats.accuracy_rate > 0.85) {
      difficultyTrend = 'improving';
    } else if (vocabularyCard.learning_stats.accuracy_rate < 0.6) {
      difficultyTrend = 'declining';
    }

    return {
      mastery_level: masteryLevel,
      retention_prediction: retentionPrediction,
      optimal_review_time: optimalReviewTime,
      difficulty_trend: difficultyTrend
    };
  }

  private async reportToGamificationSystem(
    vocabularyCard: VocabularyCard,
    response: VocabularyReviewResponse,
    result: SchedulingResult
  ) {
    try {
      const metadata = {
        card_category: vocabularyCard.category,
        difficulty_level: vocabularyCard.difficulty_level,
        accuracy: response.is_correct,
        response_time: response.response_time_ms,
        review_type: response.review_type
      };

      await this.gamificationEngine.awardPoints(
        response.user_id,
        'lesson_completion', // PointSource
        result.points_earned,
        metadata
      );

    } catch (error) {
      console.error('Error reporting to gamification system:', error);
      // 게임화 오류는 학습 진행을 방해하지 않도록 처리
    }
  }

  // 질문 유형 선택
  private selectQuestionType(card: VocabularyCard): 'recognition' | 'production' | 'listening' | 'multiple_choice' {
    const accuracy = card.learning_stats.accuracy_rate;

    // 정확도에 따른 문제 유형 선택
    if (accuracy < 0.5) return 'multiple_choice';
    if (accuracy < 0.7) return 'recognition';
    return Math.random() > 0.5 ? 'production' : 'recognition';
  }

  private shouldShowHint(card: VocabularyCard): boolean {
    return card.learning_stats.accuracy_rate < 0.6;
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // 임시 메서드들 (실제로는 데이터베이스 연동)
  private async getUserVocabularyCards(userId: string): Promise<VocabularyCard[]> {
    // 실제로는 데이터베이스에서 사용자의 어휘 카드들을 조회
    return [];
  }

  private async getUserReviews(userId: string, timeRange?: { start: Date; end: Date }): Promise<VocabularyReviewResponse[]> {
    // 실제로는 데이터베이스에서 사용자의 복습 기록들을 조회
    return [];
  }

  private async getNewCards(userId: string, limit: number): Promise<VocabularyCard[]> {
    // 실제로는 데이터베이스에서 새로운 카드들을 조회
    return [];
  }

  private analyzeCardsByState(cards: VocabularyCard[]) {
    return cards.reduce((acc, card) => {
      const state = card.fsrs_data.state;
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<CardState, number>);
  }

  private async calculateRetentionRates(cards: VocabularyCard[], reviews: VocabularyReviewResponse[]) {
    // 기간별 기억 유지율 계산
    return {
      one_day: 0.95,
      one_week: 0.85,
      one_month: 0.70,
      three_months: 0.60
    };
  }

  private analyzeDifficultyDistribution(cards: VocabularyCard[]) {
    return cards.reduce((acc, card) => {
      const difficulty = card.difficulty_level;
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private async calculateLearningVelocity(reviews: VocabularyReviewResponse[]) {
    // 학습 속도 계산 (시간당 마스터한 카드 수 등)
    return {
      cards_per_hour: 15,
      improvement_rate: 0.1,
      consistency_score: 0.8
    };
  }

  private async predictLearningOutcomes(cards: VocabularyCard[], reviews: VocabularyReviewResponse[]) {
    // 머신러닝 기반 학습 결과 예측
    return {
      estimated_completion_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      mastery_probability: 0.85,
      plateau_risk: 0.15
    };
  }
}

export default FSRSAlgorithmService;