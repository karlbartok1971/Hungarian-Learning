import {
  VocabularyCard,
  CreateVocabularyCardDTO,
  UpdateVocabularyCardDTO,
  VocabularyCardFilterOptions,
  VocabularyReviewResponse,
  VocabularyPerformanceReport,
  VocabularyCategory,
  DifficultyLevel
} from '../models/VocabularyCard';

import {
  ReviewSession,
  CreateReviewSessionDTO,
  UpdateReviewSessionDTO,
  SubmitCardResponseDTO,
  SessionPreview,
  ReviewSessionType,
  ReviewSessionStatus
} from '../models/ReviewSession';

import { LearningStatistics, StatisticsDashboardData } from '../models/LearningStatistics';
import { FSRSAlgorithmService, ReviewDueCard } from './FSRSAlgorithmService';
import { GameificationEngine } from './gamificationEngine';

/**
 * 어휘 학습 서비스 - 종합적인 어휘 학습 관리 시스템
 * T089 - VocabularyService 구현
 *
 * FSRS 알고리즘과 게임화 시스템이 통합된 어휘 학습 서비스
 */

export interface VocabularyServiceConfig {
  // 학습 설정
  max_new_cards_per_day: number;          // 일일 새 카드 최대 개수
  max_review_cards_per_day: number;       // 일일 복습 카드 최대 개수
  default_session_duration: number;       // 기본 세션 시간 (분)

  // 품질 관리
  auto_verification_enabled: boolean;     // 자동 품질 검증
  user_generated_content_moderation: boolean; // 사용자 생성 콘텐츠 검토

  // 개인화
  adaptive_difficulty_enabled: boolean;   // 적응형 난이도
  personalized_recommendations: boolean;  // 개인화 추천

  // 게임화 통합
  gamification_enabled: boolean;         // 게임화 활성화
  social_features_enabled: boolean;      // 소셜 기능 활성화
}

export interface StudyPlan {
  user_id: string;
  plan_id: string;
  plan_name: string;

  // 목표 설정
  target_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  target_date: Date;
  daily_time_minutes: number;
  weekly_sessions: number;

  // 학습 영역
  focus_categories: VocabularyCategory[];
  priority_areas: {
    category: VocabularyCategory;
    weight: number;                      // 가중치 (0-1)
  }[];

  // 진도 추적
  progress: {
    current_level_progress: number;      // 현재 레벨 진도 (0-1)
    cards_mastered: number;
    total_study_time: number;
    accuracy_trend: number[];           // 최근 정확도 추이
    estimated_completion_date: Date;
  };

  // 자동 조정
  auto_adjust_difficulty: boolean;
  auto_adjust_volume: boolean;

  created_at: Date;
  updated_at: Date;
}

export class VocabularyService {
  private fsrsService: FSRSAlgorithmService;
  private gamificationEngine: GameificationEngine;
  private config: VocabularyServiceConfig;

  constructor(config?: Partial<VocabularyServiceConfig>) {
    this.config = {
      max_new_cards_per_day: 20,
      max_review_cards_per_day: 100,
      default_session_duration: 30,
      auto_verification_enabled: true,
      user_generated_content_moderation: true,
      adaptive_difficulty_enabled: true,
      personalized_recommendations: true,
      gamification_enabled: true,
      social_features_enabled: true,
      ...config
    };

    this.fsrsService = new FSRSAlgorithmService();
    this.gamificationEngine = new GameificationEngine();
  }

  // === 어휘 카드 관리 ===

  /**
   * 새로운 어휘 카드 생성
   */
  async createVocabularyCard(
    userId: string,
    cardData: CreateVocabularyCardDTO
  ): Promise<VocabularyCard> {
    try {
      // 카드 데이터 검증
      await this.validateCardData(cardData);

      // 중복 체크
      await this.checkForDuplicates(userId, cardData.hungarian_word);

      // FSRS 초기 데이터 생성
      const initialFsrsCard = this.fsrsService.createCard();

      // 언어학적 분석 수행
      const mockCard = this.createMockCard(cardData);
      const linguisticAnalysis = await this.fsrsService.analyzeDifficulty(mockCard);

      // 어휘 카드 생성
      const vocabularyCard: VocabularyCard = {
        _id: new (require('mongodb')).ObjectId(),
        card_id: this.generateCardId(),
        user_id: userId,

        // 기본 어휘 정보
        hungarian_word: cardData.hungarian_word,
        korean_meaning: cardData.korean_meaning,
        pronunciation_ipa: cardData.pronunciation_ipa,
        pronunciation_hangul: cardData.pronunciation_hangul,
        audio_url: undefined,

        // 분류 정보
        difficulty_level: cardData.difficulty_level,
        category: cardData.category,
        cefr_level: cardData.cefr_level,

        // 문법 정보 (기본값 또는 AI 분석 결과)
        grammar_info: await this.analyzeGrammar(cardData.hungarian_word),

        // 학습 정보
        learning_info: {
          korean_similarity_score: this.calculateSimilarity(cardData.hungarian_word, cardData.korean_meaning),
          korean_interference_risk: linguisticAnalysis.false_cognate_risk,
          pronunciation_difficulty: linguisticAnalysis.phonetic_difficulty,
          korean_mnemonic: cardData.user_notes,
          usage_frequency: 0.5, // 기본값
          formality_level: 'neutral'
        },

        // 예문 (기본값 또는 제공된 값)
        examples: cardData.examples?.map((example, index) => ({
          id: `example_${index}`,
          ...example
        })) || [],

        // 관련 어휘 (초기에는 빈 배열)
        related_words: [],
        synonyms: [],
        antonyms: [],
        word_family: [],

        // FSRS 데이터
        fsrs_data: initialFsrsCard,

        // 초기 학습 통계
        learning_stats: {
          total_reviews: 0,
          correct_answers: 0,
          accuracy_rate: 0,
          avg_response_time_ms: 0,
          recognition_accuracy: 0,
          production_accuracy: 0,
          pronunciation_score: 0,
          retention_curve: [],
          last_review_type: 'recognition',
          last_review_accuracy: 0,
          last_response_time_ms: 0
        },

        // 사용자 설정
        user_notes: cardData.user_notes,
        user_tags: cardData.user_tags || [],
        is_favorite: false,
        personal_difficulty_rating: undefined,

        // 시스템 정보
        source: 'user_added',
        created_at: new Date(),
        updated_at: new Date(),
        last_reviewed_at: undefined,

        // 품질 관리
        verification_status: this.config.auto_verification_enabled ? 'verified' : 'pending',
        quality_score: 0.8,
        admin_notes: undefined
      };

      // 데이터베이스에 저장
      const savedCard = await this.saveVocabularyCard(vocabularyCard);

      // 게임화 시스템에 알림 (카드 생성 포인트)
      if (this.config.gamification_enabled) {
        await this.gamificationEngine.awardPoints(
          userId,
          'vocabulary_card_created',
          10,
          { card_category: cardData.category }
        );
      }

      return savedCard;

    } catch (error) {
      console.error('Error creating vocabulary card:', error);
      throw new Error('어휘 카드 생성에 실패했습니다');
    }
  }

  /**
   * 어휘 카드 목록 조회 (필터링 및 정렬)
   */
  async getVocabularyCards(
    filterOptions: VocabularyCardFilterOptions
  ): Promise<{
    cards: VocabularyCard[];
    total_count: number;
    has_more: boolean;
    filters_applied: any;
  }> {
    try {
      // 필터링 로직 적용
      let cards = await this.queryVocabularyCards(filterOptions);

      // FSRS 기반 필터링
      if (filterOptions.due_only) {
        cards = cards.filter(card =>
          this.fsrsService.isDue(card.fsrs_data, new Date())
        );
      }

      if (filterOptions.new_cards_only) {
        cards = cards.filter(card => card.fsrs_data.reps === 0);
      }

      if (filterOptions.learning_cards_only) {
        cards = cards.filter(card =>
          card.fsrs_data.state === 1 || card.fsrs_data.state === 3 // LEARNING or RELEARNING
        );
      }

      // 성과 기반 필터링
      if (filterOptions.low_accuracy_cards) {
        cards = cards.filter(card => card.learning_stats.accuracy_rate < 0.7);
      }

      if (filterOptions.frequently_wrong) {
        cards = cards.filter(card =>
          card.learning_stats.total_reviews > 3 &&
          card.learning_stats.accuracy_rate < 0.5
        );
      }

      // 정렬
      cards = this.sortCards(cards, filterOptions.sort_by, filterOptions.sort_order);

      // 페이지네이션
      const page = filterOptions.page || 1;
      const limit = filterOptions.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedCards = cards.slice(startIndex, endIndex);

      return {
        cards: paginatedCards,
        total_count: cards.length,
        has_more: endIndex < cards.length,
        filters_applied: {
          categories: filterOptions.categories,
          difficulty_levels: filterOptions.difficulty_levels,
          cefr_levels: filterOptions.cefr_levels,
          due_only: filterOptions.due_only,
          search_term: filterOptions.search_term
        }
      };

    } catch (error) {
      console.error('Error getting vocabulary cards:', error);
      throw new Error('어휘 카드 조회에 실패했습니다');
    }
  }

  // === 학습 세션 관리 ===

  /**
   * 새로운 학습 세션 생성
   */
  async createReviewSession(
    sessionData: CreateReviewSessionDTO
  ): Promise<ReviewSession> {
    try {
      // 일일 한도 체크
      await this.checkDailyLimits(sessionData.user_id);

      // 세션 카드 스케줄링
      const sessionCards = await this.fsrsService.scheduleCardsForSession(
        sessionData.user_id,
        sessionData.session_type,
        sessionData.settings.max_cards,
        sessionData.settings
      );

      // 진행 상황 초기화
      const initialProgress = this.initializeSessionProgress(sessionCards);

      // 세션 생성
      const reviewSession: ReviewSession = {
        _id: new (require('mongodb')).ObjectId(),
        session_id: this.generateSessionId(),
        user_id: sessionData.user_id,
        session_type: sessionData.session_type as any,
        status: ReviewSessionStatus.PENDING,

        settings: sessionData.settings,
        cards: sessionCards,
        current_card_index: 0,
        progress: initialProgress,

        created_at: new Date(),
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2시간 후 만료

        summary: undefined,
        feedback_history: [],
        gamification_events: [],

        metadata: {
          client_platform: 'web',
          session_source: sessionData.session_source || 'manual',
          previous_session_id: undefined,
          study_goal: sessionData.study_goal
        },

        quality_metrics: {
          completion_rate: 0,
          engagement_score: 0,
          efficiency_score: 0,
          session_rating: undefined,
          user_feedback: undefined
        }
      };

      // 데이터베이스에 저장
      const savedSession = await this.saveReviewSession(reviewSession);

      return savedSession;

    } catch (error) {
      console.error('Error creating review session:', error);
      throw new Error('학습 세션 생성에 실패했습니다');
    }
  }

  /**
   * 세션 미리보기 생성
   */
  async createSessionPreview(
    userId: string,
    sessionType: ReviewSessionType,
    maxCards: number = 20
  ): Promise<SessionPreview> {
    try {
      // 복습 예정 카드 조회
      const dueCards = await this.fsrsService.getDueCards(userId, maxCards * 2);

      // 새 카드 조회
      const newCards = await this.getNewCardsCount(userId);

      // 카드 구성 계산
      const maxNewCards = Math.min(newCards, Math.floor(maxCards * 0.3));
      const maxReviewCards = Math.min(dueCards.length, maxCards - maxNewCards);

      // 카테고리 분포 분석
      const categoryDistribution = this.calculateCategoryDistribution(
        dueCards.slice(0, maxReviewCards)
      );

      // 난이도 분포 분석
      const difficultyDistribution = await this.calculateDifficultyDistribution(
        dueCards.slice(0, maxReviewCards)
      );

      // 예상 시간 계산
      const estimatedDuration = this.estimateSessionDuration(
        maxReviewCards + maxNewCards,
        sessionType
      );

      // 예상 보상 계산
      const expectedRewards = await this.calculateExpectedRewards(
        userId,
        maxReviewCards + maxNewCards
      );

      return {
        session_type: sessionType,
        estimated_cards: maxReviewCards + maxNewCards,
        estimated_duration_minutes: estimatedDuration,

        card_breakdown: {
          new_cards: maxNewCards,
          review_cards: maxReviewCards,
          learning_cards: dueCards.filter(card =>
            card.fsrs_card.state === 1 || card.fsrs_card.state === 3
          ).length
        },

        category_distribution: categoryDistribution,
        difficulty_distribution: difficultyDistribution,
        expected_rewards: expectedRewards
      };

    } catch (error) {
      console.error('Error creating session preview:', error);
      throw new Error('세션 미리보기 생성에 실패했습니다');
    }
  }

  /**
   * 카드 응답 제출 및 처리
   */
  async submitCardResponse(
    sessionId: string,
    responseData: SubmitCardResponseDTO
  ): Promise<{
    updated_session: ReviewSession;
    scheduling_result: any;
    feedback: any;
    gamification_events: any[];
  }> {
    try {
      // 세션 조회
      const session = await this.getReviewSession(sessionId);
      if (!session) {
        throw new Error('세션을 찾을 수 없습니다');
      }

      // 현재 카드 정보 조회
      const currentCard = session.cards[session.current_card_index];
      if (currentCard.card_id !== responseData.card_id) {
        throw new Error('카드 ID가 일치하지 않습니다');
      }

      // 어휘 카드 정보 조회
      const vocabularyCard = await this.getVocabularyCard(currentCard.vocabulary_card_id);
      if (!vocabularyCard) {
        throw new Error('어휘 카드를 찾을 수 없습니다');
      }

      // 정답 확인
      const isCorrect = this.checkAnswer(
        responseData.user_response,
        vocabularyCard,
        currentCard.question_type
      );

      // FSRS 평가 등급 결정
      const fsrsRating = this.determineFSRSRating(
        isCorrect,
        responseData.response_time_ms,
        responseData.confidence_level || 3,
        responseData.hint_used
      );

      // 복습 응답 기록 생성
      const reviewResponse: VocabularyReviewResponse = {
        card_id: vocabularyCard.card_id,
        user_id: session.user_id,
        session_id: sessionId,
        user_response: responseData.user_response,
        correct_answer: this.getCorrectAnswer(vocabularyCard, currentCard.question_type),
        is_correct: isCorrect,
        response_time_ms: responseData.response_time_ms,
        review_type: currentCard.question_type as any,
        fsrs_rating: fsrsRating as any,
        hint_used: responseData.hint_used,
        audio_played: responseData.audio_played,
        confidence_level: responseData.confidence_level,
        reviewed_at: new Date(),
        client_info: {
          platform: 'web',
          user_agent: 'unknown'
        }
      };

      // FSRS 스케줄링 처리
      const schedulingResult = await this.fsrsService.processReview(
        vocabularyCard,
        reviewResponse,
        session
      );

      // 세션 카드 정보 업데이트
      currentCard.user_response = responseData.user_response;
      currentCard.is_correct = isCorrect;
      currentCard.response_time_ms = responseData.response_time_ms;
      currentCard.fsrs_rating = fsrsRating;
      currentCard.reviewed_at = new Date();

      // 세션 진행 상황 업데이트
      const updatedSession = await this.updateSessionProgress(session, isCorrect, responseData.response_time_ms);

      // 피드백 생성
      const feedback = await this.generateCardFeedback(
        vocabularyCard,
        reviewResponse,
        currentCard
      );

      // 게임화 이벤트 처리
      let gamificationEvents: any[] = [];
      if (session.settings.enable_gamification) {
        gamificationEvents = await this.processGamificationEvents(
          session.user_id,
          vocabularyCard,
          reviewResponse,
          schedulingResult,
          session
        );
      }

      // 어휘 카드 통계 업데이트
      await this.updateVocabularyCardStats(vocabularyCard, reviewResponse);

      // 복습 응답 저장
      await this.saveReviewResponse(reviewResponse);

      return {
        updated_session: updatedSession,
        scheduling_result: schedulingResult,
        feedback: feedback,
        gamification_events: gamificationEvents
      };

    } catch (error) {
      console.error('Error submitting card response:', error);
      throw new Error('카드 응답 제출에 실패했습니다');
    }
  }

  // === 학습 분석 및 통계 ===

  /**
   * 사용자별 학습 통계 대시보드 생성
   */
  async generateDashboardData(userId: string): Promise<StatisticsDashboardData> {
    try {
      // 기본 통계 계산
      const summaryCards = await this.calculateSummaryStats(userId);

      // 차트 데이터 생성
      const chartsData = await this.generateChartsData(userId);

      // 학습 인사이트 생성
      const insights = await this.generateLearningInsights(userId);

      // 비교 데이터 생성
      const comparativeData = await this.generateComparativeData(userId);

      return {
        user_id: userId,
        summary_cards: summaryCards,
        charts_data: chartsData,
        insights: insights,
        comparative_data: comparativeData
      };

    } catch (error) {
      console.error('Error generating dashboard data:', error);
      throw new Error('대시보드 데이터 생성에 실패했습니다');
    }
  }

  /**
   * 학습 성과 리포트 생성
   */
  async generatePerformanceReport(
    userId: string,
    period: { start_date: Date; end_date: Date }
  ): Promise<VocabularyPerformanceReport> {
    try {
      // 전체 통계 계산
      const overallStats = await this.calculateOverallStats(userId, period);

      // 카테고리별 성과 분석
      const categoryPerformance = await this.analyzeCategoryPerformance(userId, period);

      // 난이도별 성과 분석
      const difficultyPerformance = await this.analyzeDifficultyPerformance(userId, period);

      // 학습 패턴 분석
      const learningPatterns = await this.analyzeLearningPatterns(userId, period);

      // 추천사항 생성
      const recommendations = await this.generateRecommendations(userId, period);

      return {
        user_id: userId,
        period: period,
        overall_stats: overallStats,
        category_performance: categoryPerformance,
        difficulty_performance: difficultyPerformance,
        learning_patterns: learningPatterns,
        recommendations: recommendations
      };

    } catch (error) {
      console.error('Error generating performance report:', error);
      throw new Error('성과 리포트 생성에 실패했습니다');
    }
  }

  // === 개인화된 학습 계획 ===

  /**
   * 개인화된 학습 계획 생성
   */
  async createStudyPlan(
    userId: string,
    targetLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
    targetDate: Date,
    dailyTimeMinutes: number
  ): Promise<StudyPlan> {
    try {
      // 현재 수준 평가
      const currentLevel = await this.assessCurrentLevel(userId);

      // 학습 목표 분석
      const focusAreas = await this.identifyFocusAreas(userId, targetLevel);

      // 진도 예측
      const progressPrediction = await this.predictProgress(
        userId,
        targetLevel,
        dailyTimeMinutes
      );

      const studyPlan: StudyPlan = {
        user_id: userId,
        plan_id: this.generatePlanId(),
        plan_name: `${targetLevel} 달성 계획`,

        target_level: targetLevel,
        target_date: targetDate,
        daily_time_minutes: dailyTimeMinutes,
        weekly_sessions: Math.ceil(dailyTimeMinutes * 7 / 30), // 30분 세션 기준

        focus_categories: focusAreas.categories,
        priority_areas: focusAreas.priorities,

        progress: {
          current_level_progress: currentLevel.progress,
          cards_mastered: 0,
          total_study_time: 0,
          accuracy_trend: [],
          estimated_completion_date: progressPrediction.estimated_date
        },

        auto_adjust_difficulty: true,
        auto_adjust_volume: true,

        created_at: new Date(),
        updated_at: new Date()
      };

      // 학습 계획 저장
      await this.saveStudyPlan(studyPlan);

      return studyPlan;

    } catch (error) {
      console.error('Error creating study plan:', error);
      throw new Error('학습 계획 생성에 실패했습니다');
    }
  }

  // === 보조 메서드들 ===

  private generateCardId(): string {
    return `card_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private generatePlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async validateCardData(cardData: CreateVocabularyCardDTO): Promise<void> {
    if (!cardData.hungarian_word.trim()) {
      throw new Error('헝가리어 단어는 필수입니다');
    }
    if (!cardData.korean_meaning.trim()) {
      throw new Error('한국어 의미는 필수입니다');
    }
  }

  private async checkForDuplicates(userId: string, hungarianWord: string): Promise<void> {
    // 실제로는 데이터베이스에서 중복 체크
    // const existing = await this.findCardByWord(userId, hungarianWord);
    // if (existing) throw new Error('이미 존재하는 단어입니다');
  }

  private createMockCard(cardData: CreateVocabularyCardDTO): VocabularyCard {
    // 분석을 위한 임시 카드 객체 생성
    return {
      hungarian_word: cardData.hungarian_word,
      korean_meaning: cardData.korean_meaning,
      learning_info: {
        korean_similarity_score: 0,
        korean_interference_risk: 0,
        pronunciation_difficulty: 0,
        usage_frequency: 0.5,
        formality_level: 'neutral'
      }
    } as VocabularyCard;
  }

  private calculateSimilarity(hungarian: string, korean: string): number {
    // 간단한 유사도 계산 (실제로는 더 정교한 알고리즘 사용)
    return 0.1; // 기본적으로 낮은 유사도
  }

  private async analyzeGrammar(hungarianWord: string) {
    // 문법 분석 (실제로는 NLP 라이브러리나 AI 서비스 사용)
    return {
      word_class: 'noun' as any,
      case_forms: undefined,
      verb_conjugation: undefined,
      comparative_forms: undefined,
      irregular_forms: undefined,
      stem_changes: undefined
    };
  }

  private checkAnswer(userResponse: string, card: VocabularyCard, questionType: string): boolean {
    const normalizedResponse = userResponse.trim().toLowerCase();
    const correctAnswer = card.korean_meaning.toLowerCase();

    // 정확한 일치 확인
    if (normalizedResponse === correctAnswer) return true;

    // 부분 일치 허용 (80% 이상)
    const similarity = this.calculateStringSimilarity(normalizedResponse, correctAnswer);
    return similarity >= 0.8;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // 레벤슈타인 거리 기반 유사도 계산
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private determineFSRSRating(
    isCorrect: boolean,
    responseTime: number,
    confidence: number,
    hintUsed: boolean
  ): number {
    if (!isCorrect) return 1; // AGAIN

    if (hintUsed) return 2; // HARD

    // 응답 시간과 신뢰도 기반 평가
    if (responseTime < 2000 && confidence >= 4) return 4; // EASY
    if (responseTime < 5000 && confidence >= 3) return 3; // GOOD

    return 2; // HARD
  }

  private getCorrectAnswer(card: VocabularyCard, questionType: string): string {
    switch (questionType) {
      case 'recognition':
        return card.korean_meaning;
      case 'production':
        return card.hungarian_word;
      default:
        return card.korean_meaning;
    }
  }

  private initializeSessionProgress(cards: any[]) {
    return {
      total_cards: cards.length,
      completed_cards: 0,
      remaining_cards: cards.length,
      progress_percentage: 0,
      correct_answers: 0,
      incorrect_answers: 0,
      accuracy_rate: 0,
      total_time_spent_ms: 0,
      average_response_time_ms: 0,
      estimated_remaining_time_ms: cards.length * 30000, // 30초 per card
      category_progress: [],
      difficulty_progress: []
    };
  }

  private sortCards(cards: VocabularyCard[], sortBy?: string, sortOrder?: string) {
    if (!sortBy) return cards;

    return cards.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'created_at':
          aValue = a.created_at.getTime();
          bValue = b.created_at.getTime();
          break;
        case 'due_date':
          aValue = a.fsrs_data.due.getTime();
          bValue = b.fsrs_data.due.getTime();
          break;
        case 'accuracy':
          aValue = a.learning_stats.accuracy_rate;
          bValue = b.learning_stats.accuracy_rate;
          break;
        case 'difficulty':
          aValue = a.fsrs_data.difficulty;
          bValue = b.fsrs_data.difficulty;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'desc') {
        return bValue - aValue;
      }
      return aValue - bValue;
    });
  }

  // 임시 메서드들 (실제로는 데이터베이스 연동)
  private async saveVocabularyCard(card: VocabularyCard): Promise<VocabularyCard> {
    return card;
  }

  private async queryVocabularyCards(filter: VocabularyCardFilterOptions): Promise<VocabularyCard[]> {
    return [];
  }

  private async saveReviewSession(session: ReviewSession): Promise<ReviewSession> {
    return session;
  }

  private async getReviewSession(sessionId: string): Promise<ReviewSession | null> {
    return null;
  }

  private async getVocabularyCard(cardId: string): Promise<VocabularyCard | null> {
    return null;
  }

  private async saveReviewResponse(response: VocabularyReviewResponse): Promise<void> {
    // 데이터베이스에 복습 응답 저장
  }

  private async updateVocabularyCardStats(card: VocabularyCard, response: VocabularyReviewResponse): Promise<void> {
    // 어휘 카드 통계 업데이트
  }

  private async updateSessionProgress(session: ReviewSession, isCorrect: boolean, responseTime: number): Promise<ReviewSession> {
    // 세션 진행 상황 업데이트
    session.progress.completed_cards++;
    session.progress.remaining_cards--;
    session.progress.progress_percentage = (session.progress.completed_cards / session.progress.total_cards) * 100;

    if (isCorrect) {
      session.progress.correct_answers++;
    } else {
      session.progress.incorrect_answers++;
    }

    session.progress.accuracy_rate = session.progress.correct_answers / session.progress.completed_cards;
    session.progress.total_time_spent_ms += responseTime;
    session.progress.average_response_time_ms = session.progress.total_time_spent_ms / session.progress.completed_cards;

    session.current_card_index++;

    return session;
  }

  private async generateCardFeedback(card: VocabularyCard, response: VocabularyReviewResponse, cardInfo: any) {
    return {
      card_id: card.card_id,
      feedback_type: response.is_correct ? 'correct' : 'incorrect',
      message: response.is_correct ? '정답입니다!' : '틀렸습니다. 다시 시도해보세요.',
      learning_tip: card.user_notes,
      points_earned: response.is_correct ? 10 : 0
    };
  }

  private async processGamificationEvents(userId: string, card: VocabularyCard, response: VocabularyReviewResponse, result: any, session: ReviewSession) {
    return [];
  }

  private async checkDailyLimits(userId: string): Promise<void> {
    // 일일 학습 한도 체크
  }

  private async getNewCardsCount(userId: string): Promise<number> {
    return 10; // 임시값
  }

  private calculateCategoryDistribution(cards: ReviewDueCard[]) {
    const distribution: any = {};
    cards.forEach(card => {
      const category = card.vocabulary_card.category;
      distribution[category] = (distribution[category] || 0) + 1;
    });

    return Object.entries(distribution).map(([category, count]: [string, any]) => ({
      category,
      count,
      percentage: (count / cards.length) * 100
    }));
  }

  private async calculateDifficultyDistribution(cards: ReviewDueCard[]) {
    return cards.reduce((acc: any, card) => {
      const level = card.vocabulary_card.difficulty_level;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
  }

  private estimateSessionDuration(cardCount: number, sessionType: ReviewSessionType): number {
    const baseTimePerCard = 30; // seconds
    const typeMultiplier = sessionType === 'quick_review' ? 0.7 : 1.0;
    return Math.ceil(cardCount * baseTimePerCard * typeMultiplier / 60); // minutes
  }

  private async calculateExpectedRewards(userId: string, cardCount: number) {
    return {
      points_range: [cardCount * 5, cardCount * 15] as [number, number],
      possible_badges: ['daily_achiever', 'consistent_learner'],
      level_up_chance: 0.1
    };
  }

  private async calculateSummaryStats(userId: string) {
    return {
      total_study_time: '25시간',
      accuracy_this_week: 85,
      cards_mastered: 120,
      current_streak: 7,
      level_progress: {
        current: 'intermediate' as any,
        percentage: 65
      }
    };
  }

  private async generateChartsData(userId: string) {
    return {
      progress_chart: {
        dates: ['2024-11-20', '2024-11-21', '2024-11-22', '2024-11-23', '2024-11-24', '2024-11-25', '2024-11-26'],
        accuracy: [80, 82, 85, 83, 87, 89, 88],
        study_time: [30, 25, 35, 40, 30, 45, 35],
        cards_learned: [12, 10, 15, 18, 14, 20, 16]
      },
      category_performance: {
        categories: ['기초', '음식', '교통', '신학'],
        accuracy: [85, 78, 82, 90],
        time_spent: [300, 250, 200, 400]
      },
      hourly_performance: {
        hours: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        performance_scores: [0.7, 0.8, 0.85, 0.9, 0.85, 0.8, 0.75, 0.8, 0.85, 0.9, 0.85, 0.75]
      }
    };
  }

  private async generateLearningInsights(userId: string) {
    return {
      key_insights: [
        '신학 분야에서 가장 높은 정확도를 보입니다',
        '오후 6시경에 학습 성과가 가장 좋습니다',
        '연속 학습 7일째로 꾸준한 진전을 보이고 있습니다'
      ],
      improvement_suggestions: [
        '교통 관련 어휘에 더 집중해보세요',
        '아침 시간대 학습을 시도해보세요',
        '발음 연습을 늘려보세요'
      ],
      strength_highlights: [
        '신학 어휘 숙달도가 우수합니다',
        '일관된 학습 패턴을 유지하고 있습니다',
        '어려운 카드에 대한 집중력이 좋습니다'
      ],
      goal_recommendations: [
        '다음 주까지 B1 레벨 80% 달성',
        '교통 카테고리 정확도 85% 이상',
        '일일 학습 시간 40분 유지'
      ]
    };
  }

  private async generateComparativeData(userId: string) {
    return {
      vs_previous_week: {
        accuracy_change: 5,
        study_time_change: 10,
        progress_change: 8
      },
      vs_peer_average: {
        accuracy_percentile: 78,
        progress_percentile: 82,
        engagement_percentile: 85
      }
    };
  }

  private async calculateOverallStats(userId: string, period: any) {
    return {
      total_cards_studied: 85,
      total_reviews: 156,
      average_accuracy: 0.87,
      total_study_time_minutes: 420,
      cards_mastered: 23
    };
  }

  private async analyzeCategoryPerformance(userId: string, period: any) {
    return [
      {
        category: VocabularyCategory.BASIC,
        accuracy: 0.85,
        review_count: 45,
        difficult_cards: ['card1', 'card2']
      }
    ];
  }

  private async analyzeDifficultyPerformance(userId: string, period: any) {
    return [
      {
        level: DifficultyLevel.BEGINNER,
        accuracy: 0.9,
        retention_rate: 0.85,
        avg_reviews_to_master: 3
      }
    ];
  }

  private async analyzeLearningPatterns(userId: string, period: any) {
    return {
      best_performance_time: '18:00',
      consistency_score: 0.85,
      retention_curve: [0.9, 0.85, 0.8, 0.75, 0.7],
      interference_patterns: ['한국어 어순 간섭']
    };
  }

  private async generateRecommendations(userId: string, period: any) {
    return {
      focus_areas: [VocabularyCategory.TRANSPORTATION, VocabularyCategory.HEALTH],
      suggested_cards: ['card123', 'card124'],
      review_frequency_adjustment: [
        {
          card_id: 'card123',
          suggested_multiplier: 1.2
        }
      ]
    };
  }

  private async assessCurrentLevel(userId: string) {
    return {
      level: 'A2',
      progress: 0.65
    };
  }

  private async identifyFocusAreas(userId: string, targetLevel: string) {
    return {
      categories: [VocabularyCategory.BASIC, VocabularyCategory.THEOLOGY],
      priorities: [
        {
          category: VocabularyCategory.THEOLOGY,
          weight: 0.4
        }
      ]
    };
  }

  private async predictProgress(userId: string, targetLevel: string, dailyTime: number) {
    return {
      estimated_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    };
  }

  private async saveStudyPlan(plan: StudyPlan): Promise<void> {
    // 데이터베이스에 학습 계획 저장
  }
}

export default VocabularyService;