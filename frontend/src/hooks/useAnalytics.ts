/**
 * Analytics 데이터 관리를 위한 React Hook
 * T117 [US5] Implement analytics API client - Hook implementation
 */
import { useState, useEffect, useCallback } from 'react';
import analyticsApi, {
  AnalyticsOverview,
  ProgressData,
  LearningPattern,
  WeaknessAnalysisData,
  ComparisonData,
} from '@/services/analyticsApi';

interface UseAnalyticsOptions {
  userId: string;
  period?: '7days' | '30days' | '3months' | 'all';
  autoRefresh?: boolean;
  refreshInterval?: number; // 밀리초 단위
}

interface AnalyticsState {
  overview: AnalyticsOverview | null;
  progressData: ProgressData | null;
  learningPatterns: LearningPattern | null;
  weaknessAnalysis: WeaknessAnalysisData | null;
  comparisonData: ComparisonData | null;
  isLoading: boolean;
  errors: {
    overview: string | null;
    progressData: string | null;
    learningPatterns: string | null;
    weaknessAnalysis: string | null;
    comparisonData: string | null;
  };
  lastUpdated: Date | null;
}

export const useAnalytics = ({
  userId,
  period = '30days',
  autoRefresh = false,
  refreshInterval = 300000, // 5분
}: UseAnalyticsOptions) => {
  const [state, setState] = useState<AnalyticsState>({
    overview: null,
    progressData: null,
    learningPatterns: null,
    weaknessAnalysis: null,
    comparisonData: null,
    isLoading: false,
    errors: {
      overview: null,
      progressData: null,
      learningPatterns: null,
      weaknessAnalysis: null,
      comparisonData: null,
    },
    lastUpdated: null,
  });

  // 에러 상태 업데이트 헬퍼
  const setError = useCallback((key: keyof AnalyticsState['errors'], error: string | null) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [key]: error,
      },
    }));
  }, []);

  // 로딩 상태 업데이트 헬퍼
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
    }));
  }, []);

  // 분석 개요 데이터 가져오기
  const fetchOverview = useCallback(async () => {
    try {
      setError('overview', null);
      const data = await analyticsApi.getAnalyticsOverview(userId, period);
      setState(prev => ({
        ...prev,
        overview: data,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '분석 개요를 불러올 수 없습니다.';
      setError('overview', errorMessage);
      console.error('Overview fetch error:', error);
    }
  }, [userId, period, setError]);

  // 진도 데이터 가져오기
  const fetchProgressData = useCallback(async () => {
    try {
      setError('progressData', null);
      const data = await analyticsApi.getProgressData(userId, period);
      setState(prev => ({
        ...prev,
        progressData: data,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '진도 데이터를 불러올 수 없습니다.';
      setError('progressData', errorMessage);
      console.error('Progress data fetch error:', error);
    }
  }, [userId, period, setError]);

  // 학습 패턴 데이터 가져오기
  const fetchLearningPatterns = useCallback(async () => {
    try {
      setError('learningPatterns', null);
      const data = await analyticsApi.getLearningPatterns(userId);
      setState(prev => ({
        ...prev,
        learningPatterns: data,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '학습 패턴을 불러올 수 없습니다.';
      setError('learningPatterns', errorMessage);
      console.error('Learning patterns fetch error:', error);
    }
  }, [userId, setError]);

  // 약점 분석 데이터 가져오기
  const fetchWeaknessAnalysis = useCallback(async () => {
    try {
      setError('weaknessAnalysis', null);
      const data = await analyticsApi.getWeaknessAnalysis(userId);
      setState(prev => ({
        ...prev,
        weaknessAnalysis: data,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '약점 분석을 불러올 수 없습니다.';
      setError('weaknessAnalysis', errorMessage);
      console.error('Weakness analysis fetch error:', error);
    }
  }, [userId, setError]);

  // 비교 분석 데이터 가져오기
  const fetchComparisonData = useCallback(async (level?: string) => {
    try {
      setError('comparisonData', null);
      const data = await analyticsApi.getComparisonData(userId, level);
      setState(prev => ({
        ...prev,
        comparisonData: data,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '비교 분석을 불러올 수 없습니다.';
      setError('comparisonData', errorMessage);
      console.error('Comparison data fetch error:', error);
    }
  }, [userId, setError]);

  // 모든 데이터 가져오기
  const fetchAllData = useCallback(async () => {
    setLoading(true);

    try {
      await Promise.allSettled([
        fetchOverview(),
        fetchProgressData(),
        fetchLearningPatterns(),
        fetchWeaknessAnalysis(),
        // comparisonData는 별도로 호출 (옵션)
      ]);

      setState(prev => ({
        ...prev,
        lastUpdated: new Date(),
      }));
    } finally {
      setLoading(false);
    }
  }, [fetchOverview, fetchProgressData, fetchLearningPatterns, fetchWeaknessAnalysis, setLoading]);

  // 데이터 새로고침
  const refreshData = useCallback(async () => {
    try {
      await analyticsApi.refreshAnalytics(userId);
      await fetchAllData();
    } catch (error) {
      console.error('데이터 새로고침 실패:', error);
      throw error;
    }
  }, [userId, fetchAllData]);

  // 데이터 내보내기
  const exportData = useCallback(async (
    format: 'json' | 'csv' | 'pdf' = 'json'
  ) => {
    try {
      const blob = await analyticsApi.exportAnalyticsData(userId, format, period);

      // 파일 다운로드
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${userId}-${period}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
      throw error;
    }
  }, [userId, period]);

  // 학습 활동 추적
  const trackActivity = useCallback(async (activity: {
    type: string;
    details: Record<string, any>;
  }) => {
    try {
      await analyticsApi.trackLearningActivity(userId, activity);
    } catch (error) {
      console.error('활동 추적 실패:', error);
      // 추적 실패는 조용히 처리
    }
  }, [userId]);

  // 초기 데이터 로드
  useEffect(() => {
    if (userId) {
      fetchAllData();
    }
  }, [userId, period, fetchAllData]);

  // 자동 새로고침 설정
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchAllData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchAllData]);

  // 전체 에러 상태 계산
  const hasErrors = Object.values(state.errors).some(error => error !== null);
  const errorMessages = Object.values(state.errors).filter(Boolean);

  return {
    // 데이터
    overview: state.overview,
    progressData: state.progressData,
    learningPatterns: state.learningPatterns,
    weaknessAnalysis: state.weaknessAnalysis,
    comparisonData: state.comparisonData,

    // 상태
    isLoading: state.isLoading,
    hasErrors,
    errors: state.errors,
    errorMessages,
    lastUpdated: state.lastUpdated,

    // 액션
    refreshData,
    exportData,
    trackActivity,
    fetchComparisonData,

    // 개별 데이터 가져오기 함수
    fetchOverview,
    fetchProgressData,
    fetchLearningPatterns,
    fetchWeaknessAnalysis,
  };
};

// 간단한 버전의 hook (개요 데이터만)
export const useAnalyticsOverview = (userId: string, period?: '7days' | '30days' | '3months' | 'all') => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const overview = await analyticsApi.getAnalyticsOverview(userId, period);
      setData(overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
  };
};