/**
 * Assessment API 클라이언트
 * T032 백엔드 Assessment 서비스와의 통신을 담당
 */

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'listening' | 'speaking' | 'translation';
  category: 'grammar' | 'vocabulary' | 'pronunciation' | 'cultural' | 'writing' | 'listening';
  level: 'A1' | 'A2' | 'B1' | 'B2';
  difficulty: number; // 1-10
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  audioUrl?: string;
  points: number;
  timeLimit?: number; // 초 단위
}

export interface AssessmentSession {
  id: string;
  userId: string;
  startedAt: string;
  status: 'in_progress' | 'completed' | 'paused';
  currentQuestionIndex: number;
  totalQuestions: number;
  answers: AssessmentAnswer[];
  timeRemaining?: number;
}

export interface AssessmentAnswer {
  questionId: string;
  userAnswer: string | number;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: string;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  sessionId: string;
  completedAt: string;
  totalScore: number;
  maxScore: number;
  accuracy: number; // 0-1
  finalLevel: 'A1' | 'A2' | 'B1' | 'B2';
  categoryScores: {
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    cultural: number;
    writing: number;
    listening: number;
  };
  levelBreakdown: {
    A1: { correct: number; total: number };
    A2: { correct: number; total: number };
    B1: { correct: number; total: number };
    B2: { correct: number; total: number };
  };
  recommendations: string[];
  timeSpent: number;
}

export interface AssessmentHistory {
  assessments: AssessmentResult[];
  totalAssessments: number;
  averageScore: number;
  progressTrend: 'improving' | 'declining' | 'stable';
  lastAssessment: string;
}

export interface CreateAssessmentRequest {
  targetLevel?: 'A1' | 'A2' | 'B1' | 'B2';
  focusAreas?: string[];
  questionCount?: number;
  includeListening?: boolean;
  includeSpeaking?: boolean;
}

class AssessmentApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return this.authToken;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response;
  }

  /**
   * 새로운 평가 세션 시작
   */
  async createAssessment(request: CreateAssessmentRequest = {}): Promise<AssessmentSession> {
    const response = await this.fetchWithAuth('/assessment/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '평가 생성에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 평가 세션 조회
   */
  async getAssessmentSession(sessionId: string): Promise<AssessmentSession> {
    const response = await this.fetchWithAuth(`/assessment/session/${sessionId}`);

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '평가 세션 조회에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 현재 질문 조회
   */
  async getCurrentQuestion(sessionId: string): Promise<AssessmentQuestion> {
    const response = await this.fetchWithAuth(`/assessment/session/${sessionId}/question`);

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '질문 조회에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 답안 제출
   */
  async submitAnswer(
    sessionId: string,
    questionId: string,
    answer: string | number,
    timeSpent: number
  ): Promise<{ isCorrect: boolean; explanation?: string; nextQuestion?: AssessmentQuestion }> {
    const response = await this.fetchWithAuth(`/assessment/session/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({
        questionId,
        answer,
        timeSpent,
        timestamp: new Date().toISOString(),
      }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '답안 제출에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 평가 완료
   */
  async completeAssessment(sessionId: string): Promise<AssessmentResult> {
    const response = await this.fetchWithAuth(`/assessment/session/${sessionId}/complete`, {
      method: 'POST',
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '평가 완료 처리에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 평가 일시정지
   */
  async pauseAssessment(sessionId: string): Promise<void> {
    const response = await this.fetchWithAuth(`/assessment/session/${sessionId}/pause`, {
      method: 'PATCH',
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '평가 일시정지에 실패했습니다.');
    }
  }

  /**
   * 평가 재개
   */
  async resumeAssessment(sessionId: string): Promise<AssessmentSession> {
    const response = await this.fetchWithAuth(`/assessment/session/${sessionId}/resume`, {
      method: 'PATCH',
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '평가 재개에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 평가 결과 조회
   */
  async getAssessmentResult(assessmentId: string): Promise<AssessmentResult> {
    const response = await this.fetchWithAuth(`/assessment/${assessmentId}/result`);

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '평가 결과 조회에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 평가 기록 조회
   */
  async getAssessmentHistory(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    assessments: AssessmentResult[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: AssessmentHistory;
  }> {
    const response = await this.fetchWithAuth(
      `/assessment/history?page=${page}&limit=${limit}`
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '평가 기록 조회에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 평가 보고서 다운로드
   */
  async downloadAssessmentReport(assessmentId: string): Promise<Blob> {
    const response = await this.fetchWithAuth(`/assessment/${assessmentId}/report`);

    if (!response.ok) {
      throw new Error('평가 보고서 다운로드에 실패했습니다.');
    }

    return response.blob();
  }

  /**
   * 평가 삭제
   */
  async deleteAssessment(assessmentId: string): Promise<void> {
    const response = await this.fetchWithAuth(`/assessment/${assessmentId}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '평가 삭제에 실패했습니다.');
    }
  }

  /**
   * 평가 통계 조회
   */
  async getAssessmentStats(): Promise<{
    totalAssessments: number;
    averageScore: number;
    currentLevel: string;
    improvementRate: number;
    weeklyProgress: Array<{ date: string; score: number }>;
    categoryStrengths: Array<{ category: string; score: number }>;
    categoryWeaknesses: Array<{ category: string; score: number }>;
  }> {
    const response = await this.fetchWithAuth('/assessment/stats');

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '평가 통계 조회에 실패했습니다.');
    }

    return data.data;
  }
}

// 싱글톤 인스턴스 생성
export const assessmentApi = new AssessmentApiClient();

// 편의를 위한 개별 함수들 export
export const {
  createAssessment,
  getAssessmentSession,
  getCurrentQuestion,
  submitAnswer,
  completeAssessment,
  pauseAssessment,
  resumeAssessment,
  getAssessmentResult,
  getAssessmentHistory,
  downloadAssessmentReport,
  deleteAssessment,
  getAssessmentStats,
} = assessmentApi;

export default assessmentApi;