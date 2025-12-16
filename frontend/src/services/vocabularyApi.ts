// 어휘 학습 시스템을 위한 API 클라이언트 서비스
// Hungarian Learning Platform - Vocabulary API Client

export interface VocabularyCard {
  id: string;
  hungarianWord: string;
  koreanMeaning: string;
  wordClass: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  pronunciation?: string;
  audioUrl?: string;
  usageExamples: string[];
  etymologyInfo?: string;
  culturalContext?: string;
  relatedWords: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CardState {
  id: string;
  cardId: string;
  userId: string;
  state: 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING';
  stability: number;
  difficulty: number;
  retrievability: number;
  lapses: number;
  repCount: number;
  lastReview?: string;
  nextReview?: string;
  interval: number;
  easeFactor: number;
  isFavorite: boolean;
  personalNotes: string[];
  reviewHistory: ReviewRecord[];
}

export interface ReviewRecord {
  id: string;
  cardStateId: string;
  reviewedAt: string;
  rating: 1 | 2 | 3 | 4;
  responseTime: number;
  previousInterval: number;
  newInterval: number;
  sessionId?: string;
}

export interface ReviewSession {
  id: string;
  userId: string;
  sessionType: 'NEW_CARDS' | 'REVIEW' | 'MIXED' | 'WEAK_CARDS';
  startTime: string;
  endTime?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  totalCards: number;
  completedCards: number;
  correctAnswers: number;
  averageResponseTime: number;
  settings: ReviewSessionSettings;
}

export interface ReviewSessionSettings {
  maxNewCards: number;
  maxReviewCards: number;
  targetStudyTime: number;
  difficultyRange: string[];
  includeAudio: boolean;
  shuffleCards: boolean;
  showProgress: boolean;
}

export interface LearningStatistics {
  userId: string;
  period: string;
  totalCardsStudied: number;
  totalReviewTime: number;
  averageAccuracy: number;
  streakDays: number;
  cardsPerDay: number;
  weakAreas: string[];
  strongAreas: string[];
  predictedRetention: number;
  nextReviewLoad: number;
  categoryPerformance: CategoryPerformance[];
  temporalPatterns: TemporalPattern[];
  cognitiveInsights: CognitiveInsight[];
}

export interface CategoryPerformance {
  category: string;
  accuracy: number;
  averageTime: number;
  cardCount: number;
  difficulty: string;
  improvement: number;
}

export interface TemporalPattern {
  timeOfDay: string;
  dayOfWeek: string;
  performance: number;
  studyDuration: number;
  efficiency: number;
}

export interface CognitiveInsight {
  type: string;
  description: string;
  recommendation: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
}

export interface DifficultyAnalysis {
  overallDifficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  linguisticFactors: {
    phonological: number;
    morphological: number;
    syntactic: number;
    semantic: number;
    pragmatic: number;
  };
  learningInfo: {
    estimatedLearningTime: number;
    prerequisiteKnowledge: string[];
    learningTips: string[];
    commonMistakes: string[];
    culturalNotes: string[];
  };
  personalizedFactors: {
    userLevel: string;
    similarityToKnown: number;
    cognitiveLoad: number;
    motivationalRelevance: number;
  };
}

export interface ReviewResponse {
  cardId: string;
  rating: 1 | 2 | 3 | 4;
  responseTime: number;
  sessionId: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: any;
}

class VocabularyApiClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(baseUrl: string = 'http://localhost:3901/api') {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // 인증 토큰 설정
  setAuthToken(token: string): void {
    this.headers = {
      ...this.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  // 에러 처리 헬퍼
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({
        error: 'Unknown error',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.message || errorData.error);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  // HTTP 요청 헬퍼
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: this.headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('API 요청 실패:', error);
      throw error;
    }
  }

  // === 어휘 카드 관리 ===

  // 어휘 카드 목록 조회
  async getVocabularyCards(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    difficulty?: string;
    category?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<PaginatedResponse<VocabularyCard>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, item));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return this.request<PaginatedResponse<VocabularyCard>>(
      `/vocabulary/cards?${queryParams.toString()}`
    );
  }

  // 특정 어휘 카드 조회
  async getVocabularyCard(cardId: string): Promise<VocabularyCard> {
    return this.request<VocabularyCard>(`/vocabulary/cards/${cardId}`);
  }

  // 어휘 카드 생성
  async createVocabularyCard(card: Omit<VocabularyCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<VocabularyCard> {
    return this.request<VocabularyCard>('/vocabulary/cards', {
      method: 'POST',
      body: JSON.stringify(card),
    });
  }

  // 어휘 카드 수정
  async updateVocabularyCard(cardId: string, updates: Partial<VocabularyCard>): Promise<VocabularyCard> {
    return this.request<VocabularyCard>(`/vocabulary/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // 어휘 카드 삭제
  async deleteVocabularyCard(cardId: string): Promise<void> {
    return this.request<void>(`/vocabulary/cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  // === 카드 상태 관리 ===

  // 사용자의 카드 상태 조회
  async getCardState(userId: string, cardId: string): Promise<CardState> {
    return this.request<CardState>(`/vocabulary/users/${userId}/cards/${cardId}/state`);
  }

  // 사용자의 모든 카드 상태 조회
  async getUserCardStates(userId: string, params: {
    state?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  } = {}): Promise<PaginatedResponse<CardState>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<CardState>>(
      `/vocabulary/users/${userId}/cards/states?${queryParams.toString()}`
    );
  }

  // 카드 즐겨찾기 토글
  async toggleCardFavorite(userId: string, cardId: string): Promise<CardState> {
    return this.request<CardState>(`/vocabulary/users/${userId}/cards/${cardId}/favorite`, {
      method: 'POST',
    });
  }

  // 카드 개인 노트 추가
  async addCardNote(userId: string, cardId: string, note: string): Promise<CardState> {
    return this.request<CardState>(`/vocabulary/users/${userId}/cards/${cardId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  // === 리뷰 세션 관리 ===

  // 새 리뷰 세션 시작
  async startReviewSession(userId: string, settings: ReviewSessionSettings): Promise<ReviewSession> {
    return this.request<ReviewSession>(`/vocabulary/users/${userId}/sessions`, {
      method: 'POST',
      body: JSON.stringify({ settings }),
    });
  }

  // 리뷰 세션 조회
  async getReviewSession(sessionId: string): Promise<ReviewSession> {
    return this.request<ReviewSession>(`/vocabulary/sessions/${sessionId}`);
  }

  // 리뷰 세션의 다음 카드 가져오기
  async getNextCard(sessionId: string): Promise<VocabularyCard | null> {
    return this.request<VocabularyCard | null>(`/vocabulary/sessions/${sessionId}/next-card`);
  }

  // 카드 리뷰 응답 제출
  async submitReview(sessionId: string, response: ReviewResponse): Promise<CardState> {
    return this.request<CardState>(`/vocabulary/sessions/${sessionId}/review`, {
      method: 'POST',
      body: JSON.stringify(response),
    });
  }

  // 리뷰 세션 일시정지
  async pauseReviewSession(sessionId: string): Promise<ReviewSession> {
    return this.request<ReviewSession>(`/vocabulary/sessions/${sessionId}/pause`, {
      method: 'POST',
    });
  }

  // 리뷰 세션 재개
  async resumeReviewSession(sessionId: string): Promise<ReviewSession> {
    return this.request<ReviewSession>(`/vocabulary/sessions/${sessionId}/resume`, {
      method: 'POST',
    });
  }

  // 리뷰 세션 완료
  async completeReviewSession(sessionId: string): Promise<ReviewSession> {
    return this.request<ReviewSession>(`/vocabulary/sessions/${sessionId}/complete`, {
      method: 'POST',
    });
  }

  // 리뷰 세션 취소
  async cancelReviewSession(sessionId: string): Promise<ReviewSession> {
    return this.request<ReviewSession>(`/vocabulary/sessions/${sessionId}/cancel`, {
      method: 'POST',
    });
  }

  // === 학습 통계 및 분석 ===

  // 사용자 학습 통계 조회
  async getLearningStatistics(userId: string, params: {
    period?: string;
    includesPredictions?: boolean;
    detailLevel?: 'summary' | 'detailed' | 'comprehensive';
  } = {}): Promise<LearningStatistics> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return this.request<LearningStatistics>(
      `/vocabulary/users/${userId}/statistics?${queryParams.toString()}`
    );
  }

  // 카테고리별 성과 분석
  async getCategoryPerformance(userId: string, timeRange: string = 'month'): Promise<CategoryPerformance[]> {
    return this.request<CategoryPerformance[]>(
      `/vocabulary/users/${userId}/performance/categories?timeRange=${timeRange}`
    );
  }

  // 시간대별 학습 패턴 분석
  async getTemporalPatterns(userId: string, timeRange: string = 'month'): Promise<TemporalPattern[]> {
    return this.request<TemporalPattern[]>(
      `/vocabulary/users/${userId}/patterns/temporal?timeRange=${timeRange}`
    );
  }

  // 인지적 통찰 조회
  async getCognitiveInsights(userId: string): Promise<CognitiveInsight[]> {
    return this.request<CognitiveInsight[]>(`/vocabulary/users/${userId}/insights/cognitive`);
  }

  // === 난이도 분석 ===

  // 어휘 난이도 분석
  async analyzeDifficulty(params: {
    hungarianWord: string;
    wordClass: string;
    koreanMeaning: string;
    usageExamples?: string[];
    userId?: string;
  }): Promise<DifficultyAnalysis> {
    return this.request<DifficultyAnalysis>('/vocabulary/difficulty/analyze', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // === 추천 시스템 ===

  // 다음 학습할 카드 추천
  async getRecommendedCards(userId: string, count: number = 10): Promise<VocabularyCard[]> {
    return this.request<VocabularyCard[]>(
      `/vocabulary/users/${userId}/recommendations/cards?count=${count}`
    );
  }

  // 개인화된 학습 계획 추천
  async getStudyPlan(userId: string, targetDuration: number): Promise<{
    plan: Array<{
      activity: string;
      duration: number;
      cards: VocabularyCard[];
      priority: number;
    }>;
    estimatedBenefit: number;
    difficultyDistribution: Record<string, number>;
  }> {
    return this.request(`/vocabulary/users/${userId}/recommendations/study-plan`, {
      method: 'POST',
      body: JSON.stringify({ targetDuration }),
    });
  }

  // === 오디오 관리 ===

  // 발음 오디오 URL 조회
  async getAudioUrl(cardId: string): Promise<string> {
    const response = await this.request<{ audioUrl: string }>(`/vocabulary/cards/${cardId}/audio`);
    return response.audioUrl;
  }

  // 발음 오디오 업로드
  async uploadAudio(cardId: string, audioFile: File): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch(`${this.baseUrl}/vocabulary/cards/${cardId}/audio`, {
      method: 'POST',
      headers: {
        'Authorization': this.headers['Authorization'] as string,
      },
      body: formData,
    });

    const result = await this.handleResponse<{ audioUrl: string }>(response);
    return result.audioUrl;
  }

  // === 대시보드 데이터 ===

  // 대시보드 종합 데이터 조회
  async getDashboardData(userId: string): Promise<{
    overallStats: {
      totalCards: number;
      studiedToday: number;
      currentStreak: number;
      weeklyGoalProgress: number;
      averageAccuracy: number;
      totalStudyTime: number;
    };
    categoryPerformance: CategoryPerformance[];
    recentActivity: Array<{
      date: string;
      cardsStudied: number;
      studyTime: number;
      accuracy: number;
    }>;
    upcomingReviews: Array<{
      date: string;
      count: number;
      difficulty: string;
    }>;
    weekPoints: number;
    monthlyGoalProgress: number;
    recommendations: string[];
  }> {
    return this.request(`/vocabulary/users/${userId}/dashboard`);
  }

  // === 검색 및 필터링 ===

  // 어휘 검색
  async searchVocabulary(query: string, filters: {
    difficulty?: string[];
    categories?: string[];
    tags?: string[];
    minAccuracy?: number;
    maxAccuracy?: number;
    includeUserProgress?: boolean;
    userId?: string;
  } = {}): Promise<PaginatedResponse<VocabularyCard & { userProgress?: CardState }>> {
    return this.request('/vocabulary/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    });
  }

  // 고급 필터링
  async getFilteredCards(userId: string, filters: {
    states?: string[];
    difficulties?: string[];
    categories?: string[];
    tags?: string[];
    dateRange?: { start: string; end: string };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<VocabularyCard & { state: CardState }>> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, item));
        } else if (typeof value === 'object') {
          queryParams.append(key, JSON.stringify(value));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return this.request(`/vocabulary/users/${userId}/cards/filtered?${queryParams.toString()}`);
  }

  // === 배치 작업 ===

  // 여러 카드 상태 업데이트
  async batchUpdateCardStates(userId: string, updates: Array<{
    cardId: string;
    state?: string;
    isFavorite?: boolean;
    notes?: string[];
  }>): Promise<CardState[]> {
    return this.request(`/vocabulary/users/${userId}/cards/batch-update`, {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  // 여러 카드 리뷰 제출
  async batchSubmitReviews(sessionId: string, reviews: ReviewResponse[]): Promise<CardState[]> {
    return this.request(`/vocabulary/sessions/${sessionId}/batch-review`, {
      method: 'POST',
      body: JSON.stringify({ reviews }),
    });
  }
}

// 기본 API 클라이언트 인스턴스 생성
export const vocabularyApi = new VocabularyApiClient();

// API 클라이언트 클래스 내보내기
export { VocabularyApiClient };

// React Hook 스타일 유틸리티 함수들
export const useVocabularyApi = () => {
  return vocabularyApi;
};

// 에러 처리 유틸리티
export class VocabularyApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'VocabularyApiError';
  }
}

// 타입 가드 함수들
export const isApiError = (error: any): error is VocabularyApiError => {
  return error instanceof VocabularyApiError;
};

export const isNetworkError = (error: any): boolean => {
  return error instanceof TypeError && error.message.includes('fetch');
};

// API 응답 캐싱 유틸리티 (간단한 메모리 캐시)
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

export const apiCache = new SimpleCache();