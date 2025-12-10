/**
 * Analytics API 클라이언트
 * T117 [US5] Implement analytics API client
 * 백엔드 AnalyticsService와의 통신을 담당
 */

import axios, { AxiosResponse } from 'axios';

// 백엔드 인터페이스와 동기화된 타입 정의
export interface LearningSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  lessonType: 'vocabulary' | 'grammar' | 'pronunciation' | 'writing' | 'cultural';
  level: 'A1' | 'A2' | 'B1' | 'B2';
  completedActivities: string[];
  timeSpent: number; // 분 단위
  accuracyRate: number; // 0-1
  engagementScore: number; // 0-1
  difficultyRating: number; // 1-5
  mistakePatterns: string[];
  achievements: string[];
}

export interface PerformanceMetrics {
  userId: string;
  date: Date;
  overallAccuracy: number;
  vocabularyAccuracy: number;
  grammarAccuracy: number;
  pronunciationAccuracy: number;
  fluencyScore: number;
  comprehensionScore: number;
  culturalKnowledgeScore: number;
  studyTimeMinutes: number;
  lessonsCompleted: number;
  streakDays: number;
  level: string;
  cefrAlignment: number; // CEFR 기준 정렬도 (0-1)
}

export interface LearningPattern {
  userId: string;
  analysisDate: Date;
  optimalStudyTimes: Array<{
    hour: number;
    performance: number;
    engagement: number;
    retention: number;
  }>;
  preferredLessonTypes: Array<{
    type: string;
    preference: number;
    effectiveness: number;
  }>;
  learningVelocity: {
    vocabularyRate: number;
    grammarRate: number;
    pronunciationRate: number;
    overallRate: number;
  };
  retentionPatterns: Array<{
    timeframe: string; // '1day', '1week', '1month'
    retentionRate: number;
    forgettingCurve: number[];
  }>;
  motivationTriggers: Array<{
    trigger: string;
    effectiveness: number;
    frequency: number;
  }>;
  challengePreference: {
    preferredDifficulty: number;
    adaptationRate: number;
    frustractionTolerance: number;
  };
  socialLearningPreference: number;
  gamificationResponse: Array<{
    element: string;
    engagement: number;
  }>;
  attentionSpan: {
    averageMinutes: number;
    optimalSessionLength: number;
    breakFrequency: number;
  };
  errorPatterns: Array<{
    errorType: string;
    frequency: number;
    improvementRate: number;
  }>;
  plateauIndicators: Array<{
    skill: string;
    plateauDuration: number;
    breakthoughProbability: number;
  }>;
}

export interface WeaknessAnalysisData {
  weaknessCategories: Array<{
    category: 'vocabulary' | 'pronunciation' | 'grammar' | 'fluency';
    severity: 'critical' | 'high' | 'medium' | 'low';
    confidence: number;
    specificAreas: Array<{
      areaName: string;
      accuracyRate: number;
      practiceFrequency: number;
      improvementPotential: number;
      difficultyLevel: string;
      prerequisites: string[];
    }>;
    rootCauses: string[];
    impactOnOverallProgress: number;
    recommendedActions: Array<{
      actionType: string;
      priority: number;
      estimatedImprovement: number;
      timeInvestment: number;
      description: string;
      resources: string[];
    }>;
  }>;
  priorityRecommendations: Array<{
    recommendationId: string;
    title: string;
    description: string;
    targetWeakness: string;
    expectedBenefit: number;
    difficultyLevel: number;
    timeRequirement: number;
    prerequisites: string[];
    resources: string[];
    metrics: string[];
    timeline: string;
    actionPlan: {
      immediateActions: Array<{
        action: string;
        timeframe: string;
        resources: string[];
        expectedOutcome: string;
      }>;
      longTermGoals: Array<{
        goal: string;
        timeline: string;
        milestones: string[];
        successCriteria: string[];
      }>;
    };
  }>;
  overallWeaknessScore: number;
  improvementPotential: number;
  estimatedTimeToImprove: number;
}

export interface AnalyticsOverview {
  totalStudyTime: number;
  completedLessons: number;
  currentLevel: string;
  progressPercentage: number;
  weeklyGoalProgress: number;
  streakDays: number;
  averageAccuracy: number;
  strongestSkill: string;
  weakestSkill: string;
  recentImprovement: number;
}

export interface ProgressData {
  dailyProgress: Array<{
    date: string;
    accuracy: number;
    studyTime: number;
    lessonsCompleted: number;
    engagementScore: number;
  }>;
  weeklyTrends: Array<{
    week: string;
    score: number;
    improvement: number;
  }>;
  skillLevels: Array<{
    skill: string;
    level: number;
    change: string;
    trend: 'up' | 'down' | 'stable';
  }>;
  monthlyComparison: Array<{
    month: string;
    totalTime: number;
    lessonsCompleted: number;
    averageAccuracy: number;
  }>;
}

export interface ComparisonData {
  userPerformance: PerformanceMetrics;
  peerAverage: PerformanceMetrics;
  ranking: {
    overall: number;
    totalUsers: number;
    percentile: number;
  };
  comparisons: Array<{
    metric: string;
    userValue: number;
    peerAverage: number;
    performance: 'above' | 'below' | 'average';
  }>;
}

// API 클라이언트 클래스
class AnalyticsApiClient {
  private baseURL: string;
  private axiosInstance;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터 - 인증 토큰 추가
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터 - 에러 핸들링
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // 인증 실패 시 로그인 페이지로 리다이렉트
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // 분석 개요 데이터 조회
  async getAnalyticsOverview(
    userId: string,
    period: '7days' | '30days' | '3months' | 'all' = '7days'
  ): Promise<AnalyticsOverview> {
    try {
      const response: AxiosResponse<AnalyticsOverview> = await this.axiosInstance.get(
        `/analytics/overview/${userId}`,
        { params: { period } }
      );
      return response.data;
    } catch (error) {
      console.error('Analytics overview 조회 실패:', error);
      throw new Error('분석 개요 데이터를 불러올 수 없습니다.');
    }
  }

  // 진도 데이터 조회
  async getProgressData(
    userId: string,
    period: '7days' | '30days' | '3months' | 'all' = '30days'
  ): Promise<ProgressData> {
    try {
      const response: AxiosResponse<ProgressData> = await this.axiosInstance.get(
        `/analytics/progress/${userId}`,
        { params: { period } }
      );
      return response.data;
    } catch (error) {
      console.error('Progress data 조회 실패:', error);
      throw new Error('진도 데이터를 불러올 수 없습니다.');
    }
  }

  // 학습 패턴 분석 조회
  async getLearningPatterns(userId: string): Promise<LearningPattern> {
    try {
      const response: AxiosResponse<LearningPattern> = await this.axiosInstance.get(
        `/analytics/patterns/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error('Learning patterns 조회 실패:', error);
      throw new Error('학습 패턴 데이터를 불러올 수 없습니다.');
    }
  }

  // 약점 분석 데이터 조회
  async getWeaknessAnalysis(userId: string): Promise<WeaknessAnalysisData> {
    try {
      const response: AxiosResponse<WeaknessAnalysisData> = await this.axiosInstance.get(
        `/analytics/weakness/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error('Weakness analysis 조회 실패:', error);
      throw new Error('약점 분석 데이터를 불러올 수 없습니다.');
    }
  }

  // 비교 분석 데이터 조회
  async getComparisonData(userId: string, level?: string): Promise<ComparisonData> {
    try {
      const response: AxiosResponse<ComparisonData> = await this.axiosInstance.get(
        `/analytics/comparison/${userId}`,
        { params: { level } }
      );
      return response.data;
    } catch (error) {
      console.error('Comparison data 조회 실패:', error);
      throw new Error('비교 분석 데이터를 불러올 수 없습니다.');
    }
  }

  // 학습 세션 데이터 저장
  async saveLearningSession(sessionData: Omit<LearningSession, 'sessionId'>): Promise<string> {
    try {
      const response: AxiosResponse<{ sessionId: string }> = await this.axiosInstance.post(
        '/analytics/sessions',
        sessionData
      );
      return response.data.sessionId;
    } catch (error) {
      console.error('Learning session 저장 실패:', error);
      throw new Error('학습 세션 데이터 저장에 실패했습니다.');
    }
  }

  // 성과 메트릭 데이터 저장
  async savePerformanceMetrics(metricsData: Omit<PerformanceMetrics, 'date'>): Promise<void> {
    try {
      await this.axiosInstance.post('/analytics/metrics', {
        ...metricsData,
        date: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Performance metrics 저장 실패:', error);
      throw new Error('성과 메트릭 데이터 저장에 실패했습니다.');
    }
  }

  // 분석 데이터 내보내기
  async exportAnalyticsData(
    userId: string,
    format: 'json' | 'csv' | 'pdf' = 'json',
    period: '7days' | '30days' | '3months' | 'all' = 'all'
  ): Promise<Blob> {
    try {
      const response = await this.axiosInstance.get(
        `/analytics/export/${userId}`,
        {
          params: { format, period },
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Analytics data export 실패:', error);
      throw new Error('분석 데이터 내보내기에 실패했습니다.');
    }
  }

  // 분석 데이터 새로고침 (캐시 무효화)
  async refreshAnalytics(userId: string): Promise<void> {
    try {
      await this.axiosInstance.post(`/analytics/refresh/${userId}`);
    } catch (error) {
      console.error('Analytics refresh 실패:', error);
      throw new Error('분석 데이터 새로고침에 실패했습니다.');
    }
  }

  // 실시간 학습 활동 추적
  async trackLearningActivity(userId: string, activity: {
    type: string;
    details: Record<string, any>;
    timestamp?: Date;
  }): Promise<void> {
    try {
      await this.axiosInstance.post(`/analytics/track/${userId}`, {
        ...activity,
        timestamp: activity.timestamp || new Date().toISOString(),
      });
    } catch (error) {
      console.error('Learning activity tracking 실패:', error);
      // 추적 실패는 사용자 경험을 방해하지 않도록 조용히 처리
    }
  }

  // 학습 목표 설정 및 추적
  async setLearningGoals(userId: string, goals: {
    dailyStudyTime: number; // 분 단위
    weeklyLessons: number;
    targetLevel: string;
    targetDate: Date;
    specificSkills: string[];
  }): Promise<void> {
    try {
      await this.axiosInstance.post(`/analytics/goals/${userId}`, goals);
    } catch (error) {
      console.error('Learning goals 설정 실패:', error);
      throw new Error('학습 목표 설정에 실패했습니다.');
    }
  }

  // 학습 목표 진도 조회
  async getLearningGoalsProgress(userId: string): Promise<{
    goals: any;
    progress: any;
    achievements: string[];
    recommendations: string[];
  }> {
    try {
      const response = await this.axiosInstance.get(`/analytics/goals/${userId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Learning goals progress 조회 실패:', error);
      throw new Error('학습 목표 진도를 불러올 수 없습니다.');
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const analyticsApi = new AnalyticsApiClient();

export default analyticsApi;

// 개별 함수로도 사용할 수 있도록 내보내기
export const {
  getAnalyticsOverview,
  getProgressData,
  getLearningPatterns,
  getWeaknessAnalysis,
  getComparisonData,
  saveLearningSession,
  savePerformanceMetrics,
  exportAnalyticsData,
  refreshAnalytics,
  trackLearningActivity,
  setLearningGoals,
  getLearningGoalsProgress,
} = analyticsApi;