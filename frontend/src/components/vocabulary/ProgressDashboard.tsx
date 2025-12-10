'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Clock,
  Calendar,
  Award,
  Star,
  Flame,
  BookOpen,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Filter,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

/**
 * ProgressDashboard 컴포넌트
 * T097 - 학습 진도 대시보드 및 분석 시각화
 *
 * 사용자의 학습 진도, 성과, 패턴을 종합적으로 분석하고 시각화
 */

// 통계 데이터 타입들
interface OverallStats {
  total_study_time_minutes: number;
  total_sessions_completed: number;
  total_cards_studied: number;
  overall_accuracy: number;
  current_streak_days: number;
  longest_streak_days: number;
  level_progression: string;
  total_points_earned: number;
}

interface CategoryPerformance {
  category: string;
  total_cards: number;
  cards_learned: number;
  cards_mastered: number;
  average_accuracy: number;
  progress_percentage: number;
  weak_areas: string[];
  strong_areas: string[];
}

interface TemporalAnalysis {
  best_performance_time: string;
  consistency_score: number;
  daily_patterns: {
    day_of_week: number;
    average_study_time: number;
    average_accuracy: number;
    sessions_count: number;
  }[];
  monthly_trends: {
    month: string;
    total_study_time: number;
    cards_learned: number;
    average_accuracy: number;
  }[];
}

interface PredictiveInsights {
  next_week_accuracy: number;
  next_month_progress: number;
  plateau_risk_assessment: number;
  recommended_focus_areas: string[];
  estimated_mastery_dates: {
    category: string;
    estimated_date: string;
    confidence: number;
  }[];
}

interface Recommendations {
  focus_areas: string[];
  improvement_suggestions: string[];
  strength_highlights: string[];
  goal_recommendations: string[];
  optimal_study_schedule: {
    frequency: number;
    duration: number;
    best_times: string[];
  };
}

interface ProgressDashboardProps {
  userId: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  className?: string;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  userId,
  timeRange = 'month',
  className
}) => {
  // 상태 관리
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
  const [temporalAnalysis, setTemporalAnalysis] = useState<TemporalAnalysis | null>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsights | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');

  // 데이터 로드
  useEffect(() => {
    loadDashboardData();
  }, [userId, timeRange]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // 전체 통계 로드
      const statsResponse = await fetch(`/api/vocabulary/stats?granularity=comprehensive&time_range=${timeRange}`);
      const statsData = await statsResponse.json();

      // 대시보드 데이터 로드
      const dashboardResponse = await fetch('/api/vocabulary/dashboard');
      const dashboardData = await dashboardResponse.json();

      // 성과 리포트 로드
      const reportResponse = await fetch('/api/vocabulary/reports/performance');
      const reportData = await reportResponse.json();

      // 분석 리포트 로드
      const analyticsResponse = await fetch('/api/vocabulary/reports/analytics');
      const analyticsData = await analyticsResponse.json();

      // 데이터 설정
      setOverallStats(statsData.data?.overall_progress || {});
      setCategoryPerformance(statsData.data?.domain_analysis || []);
      setTemporalAnalysis(statsData.data?.temporal_patterns || {});
      setPredictiveInsights(statsData.data?.predictive_insights || {});
      setRecommendations({
        focus_areas: reportData.data?.recommendations?.focus_areas || [],
        improvement_suggestions: dashboardData.data?.insights?.improvement_suggestions || [],
        strength_highlights: dashboardData.data?.insights?.strength_highlights || [],
        goal_recommendations: dashboardData.data?.insights?.goal_recommendations || [],
        optimal_study_schedule: analyticsData.data?.action_plan?.recommended_study_schedule || {}
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 진도 레벨 색상
  const getLevelColor = (level: string) => {
    const colors = {
      'beginner': 'text-green-600 bg-green-100',
      'elementary': 'text-blue-600 bg-blue-100',
      'intermediate': 'text-purple-600 bg-purple-100',
      'upper_intermediate': 'text-orange-600 bg-orange-100',
      'advanced': 'text-red-600 bg-red-100',
      'mastery': 'text-yellow-600 bg-yellow-100'
    };
    return colors[level as keyof typeof colors] || colors.beginner;
  };

  // 성과 트렌드 계산
  const performanceTrend = useMemo(() => {
    if (!temporalAnalysis?.monthly_trends) return null;

    const trends = temporalAnalysis.monthly_trends;
    if (trends.length < 2) return null;

    const recent = trends[trends.length - 1];
    const previous = trends[trends.length - 2];

    return {
      accuracy: recent.average_accuracy - previous.average_accuracy,
      study_time: recent.total_study_time - previous.total_study_time,
      cards_learned: recent.cards_learned - previous.cards_learned
    };
  }, [temporalAnalysis]);

  // 요일별 차트 데이터
  const weeklyChartData = useMemo(() => {
    if (!temporalAnalysis?.daily_patterns) return [];

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return temporalAnalysis.daily_patterns.map(pattern => ({
      day: dayNames[pattern.day_of_week],
      accuracy: Math.round(pattern.average_accuracy * 100),
      study_time: pattern.average_study_time,
      sessions: pattern.sessions_count
    }));
  }, [temporalAnalysis]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">학습 진도 분석</h2>
          <p className="text-gray-600">개인 맞춤형 학습 성과 및 진도 리포트</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            리포트 다운로드
          </Button>
        </div>
      </div>

      {/* 전체 통계 카드 */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round(overallStats.total_study_time_minutes / 60)}h
                  </div>
                  <div className="text-sm text-gray-600">총 학습 시간</div>
                  {performanceTrend && (
                    <div className={cn(
                      "text-xs flex items-center gap-1 mt-1",
                      performanceTrend.study_time > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {performanceTrend.study_time > 0 ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      {Math.abs(performanceTrend.study_time)}분
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round(overallStats.overall_accuracy * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">전체 정확도</div>
                  {performanceTrend && (
                    <div className={cn(
                      "text-xs flex items-center gap-1 mt-1",
                      performanceTrend.accuracy > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {performanceTrend.accuracy > 0 ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      {Math.abs(Math.round(performanceTrend.accuracy * 100))}%
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Flame className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{overallStats.current_streak_days}</div>
                  <div className="text-sm text-gray-600">연속 학습일</div>
                  <div className="text-xs text-gray-500 mt-1">
                    최고: {overallStats.longest_streak_days}일
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  getLevelColor(overallStats.level_progression)
                )}>
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold capitalize">
                    {overallStats.level_progression}
                  </div>
                  <div className="text-sm text-gray-600">현재 레벨</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {overallStats.total_points_earned || 0} 포인트
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">종합</TabsTrigger>
          <TabsTrigger value="categories">카테고리별</TabsTrigger>
          <TabsTrigger value="patterns">학습 패턴</TabsTrigger>
          <TabsTrigger value="predictions">예측 분석</TabsTrigger>
          <TabsTrigger value="recommendations">추천사항</TabsTrigger>
        </TabsList>

        {/* 종합 탭 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 주간 성과 차트 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">주간 학습 패턴</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant={chartType === 'bar' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('bar')}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={chartType === 'line' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('line')}
                    >
                      <LineChart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {weeklyChartData.length > 0 ? (
                  <div className="space-y-4">
                    {weeklyChartData.map((data) => (
                      <div key={data.day} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{data.day}요일</span>
                          <span>{data.accuracy}% 정확도</span>
                        </div>
                        <Progress value={data.accuracy} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>데이터가 충분하지 않습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 학습 일관성 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">학습 일관성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {temporalAnalysis ? Math.round(temporalAnalysis.consistency_score * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">일관성 점수</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">최적 학습 시간</span>
                      <Badge variant="outline">
                        {temporalAnalysis?.best_performance_time || '정보 없음'}
                      </Badge>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        학습 패턴 분석
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• 가장 집중도가 높은 시간: {temporalAnalysis?.best_performance_time || '분석 중'}</p>
                        <p>• 평균 세션 길이: {overallStats ? Math.round(overallStats.total_study_time_minutes / overallStats.total_sessions_completed) : 0}분</p>
                        <p>• 학습 빈도: {overallStats ? Math.round(overallStats.total_sessions_completed / 30) : 0}회/주</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 카테고리별 탭 */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {categoryPerformance.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">
                      {category.category} 카테고리
                    </CardTitle>
                    <Badge className={cn(
                      category.progress_percentage >= 80 ? 'bg-green-100 text-green-800' :
                      category.progress_percentage >= 60 ? 'bg-blue-100 text-blue-800' :
                      category.progress_percentage >= 40 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {Math.round(category.progress_percentage)}% 완료
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={category.progress_percentage} className="h-3" />

                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold">{category.total_cards}</div>
                        <div className="text-xs text-gray-600">총 카드</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-blue-600">
                          {category.cards_learned}
                        </div>
                        <div className="text-xs text-gray-600">학습 중</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          {category.cards_mastered}
                        </div>
                        <div className="text-xs text-gray-600">마스터</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-purple-600">
                          {Math.round(category.average_accuracy * 100)}%
                        </div>
                        <div className="text-xs text-gray-600">정확도</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.strong_areas.length > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-sm font-semibold text-green-800 mb-2">
                            <CheckCircle className="w-4 h-4" />
                            강점 영역
                          </div>
                          <div className="text-sm text-green-700">
                            {category.strong_areas.join(', ')}
                          </div>
                        </div>
                      )}

                      {category.weak_areas.length > 0 && (
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-sm font-semibold text-orange-800 mb-2">
                            <AlertCircle className="w-4 h-4" />
                            개선 필요
                          </div>
                          <div className="text-sm text-orange-700">
                            {category.weak_areas.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 학습 패턴 탭 */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>시간대별 성과 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {/* 시간별 성과 차트 영역 */}
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                      <p>시간대별 차트</p>
                      <p className="text-sm">구현 예정</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm font-semibold text-blue-800 mb-2">
                      최적 학습 시간
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {temporalAnalysis?.best_performance_time || '분석 중'}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      학습 일관성
                    </div>
                    <div className="text-2xl font-bold text-gray-600">
                      {temporalAnalysis ? Math.round(temporalAnalysis.consistency_score * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 예측 분석 탭 */}
        <TabsContent value="predictions" className="space-y-4">
          {predictiveInsights ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>성과 예측</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>다음 주 예상 정확도</span>
                      <span className="font-semibold">
                        {Math.round(predictiveInsights.next_week_accuracy * 100)}%
                      </span>
                    </div>
                    <Progress value={predictiveInsights.next_week_accuracy * 100} />

                    <div className="flex justify-between">
                      <span>다음 달 예상 진도</span>
                      <span className="font-semibold">
                        {Math.round(predictiveInsights.next_month_progress * 100)}%
                      </span>
                    </div>
                    <Progress value={predictiveInsights.next_month_progress * 100} />
                  </div>

                  <div className={cn(
                    "p-3 rounded-lg",
                    predictiveInsights.plateau_risk_assessment > 0.7 ? "bg-red-50" :
                    predictiveInsights.plateau_risk_assessment > 0.4 ? "bg-yellow-50" :
                    "bg-green-50"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className={cn(
                        "w-4 h-4",
                        predictiveInsights.plateau_risk_assessment > 0.7 ? "text-red-600" :
                        predictiveInsights.plateau_risk_assessment > 0.4 ? "text-yellow-600" :
                        "text-green-600"
                      )} />
                      <span className="font-semibold text-sm">정체 위험도</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {Math.round(predictiveInsights.plateau_risk_assessment * 100)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>마스터리 예측</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictiveInsights.estimated_mastery_dates?.map((estimate, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold capitalize">{estimate.category}</span>
                          <Badge variant="outline">
                            {Math.round(estimate.confidence * 100)}% 확신
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          예상 완료: {new Date(estimate.estimated_date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">예측 분석을 위한 데이터를 수집 중입니다.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 추천사항 탭 */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations && (
            <div className="grid gap-4">
              {/* 집중 영역 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    집중 학습 영역
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recommendations.focus_areas.map((area, index) => (
                      <div key={index} className="bg-orange-50 p-3 rounded-lg">
                        <div className="font-semibold text-orange-800 capitalize">
                          {area}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 개선 제안 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                    개선 제안사항
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.improvement_suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-800">
                          {index + 1}
                        </div>
                        <div className="text-blue-800">{suggestion}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 강점 하이라이트 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-green-600" />
                    강점 분석
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {recommendations.strength_highlights.map((strength, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div className="text-green-800">{strength}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 최적 학습 스케줄 */}
              {recommendations.optimal_study_schedule && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      추천 학습 스케줄
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {recommendations.optimal_study_schedule.frequency || 0}
                        </div>
                        <div className="text-sm text-purple-800">주당 세션 수</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {recommendations.optimal_study_schedule.duration || 0}분
                        </div>
                        <div className="text-sm text-purple-800">권장 세션 길이</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm font-semibold text-purple-800 mb-2">
                          최적 시간대
                        </div>
                        <div className="text-sm text-purple-700">
                          {recommendations.optimal_study_schedule.best_times?.join(', ') || '분석 중'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressDashboard;