// 분석 대시보드 메인 컴포넌트
// Hungarian Learning Platform - Analytics Dashboard
// T110 [US5] Create analytics dashboard layout

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Trophy,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  Mic,
  FileText,
  AlertCircle,
  Download,
  Calendar,
  Users,
  Brain,
  Zap
} from 'lucide-react';

// 컴포넌트 임포트
import LearningOverview from './LearningOverview';
import SkillBreakdown from './SkillBreakdown';
import StudyPatterns from './StudyPatterns';
import PerformanceTrends from './PerformanceTrends';
import WeaknessAnalysis from './WeaknessAnalysis';
import ProgressPrediction from './ProgressPrediction';
import PeerComparison from './PeerComparison';
import StudyRecommendations from './StudyRecommendations';
import InsightsPanel from './InsightsPanel';

// 타입 정의
interface AnalyticsData {
  overview?: any;
  learningPatterns?: any;
  weaknesses?: any;
  progressPrediction?: any;
  peerComparison?: any;
  studyRecommendations?: any;
  insights?: any[];
}

interface LoadingState {
  overview: boolean;
  patterns: boolean;
  weaknesses: boolean;
  prediction: boolean;
  comparison: boolean;
  recommendations: boolean;
  insights: boolean;
}

const AnalyticsDashboard: React.FC = () => {
  // 상태 관리
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState<LoadingState>({
    overview: true,
    patterns: false,
    weaknesses: false,
    prediction: false,
    comparison: false,
    recommendations: false,
    insights: false
  });
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 데이터 로딩 함수
  const loadOverviewData = async () => {
    setLoading(prev => ({ ...prev, overview: true }));
    try {
      const response = await fetch(`/api/analytics/overview?period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('데이터 로딩 실패');

      const data = await response.json();
      setAnalyticsData(prev => ({ ...prev, overview: data }));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(prev => ({ ...prev, overview: false }));
    }
  };

  const loadLearningPatterns = async () => {
    setLoading(prev => ({ ...prev, patterns: true }));
    try {
      const response = await fetch(`/api/analytics/learning-patterns?period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('패턴 데이터 로딩 실패');

      const data = await response.json();
      setAnalyticsData(prev => ({ ...prev, learningPatterns: data }));
    } catch (err) {
      console.error('패턴 데이터 로딩 오류:', err);
    } finally {
      setLoading(prev => ({ ...prev, patterns: false }));
    }
  };

  const loadWeaknessAnalysis = async () => {
    setLoading(prev => ({ ...prev, weaknesses: true }));
    try {
      const response = await fetch('/api/analytics/weaknesses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('약점 분석 데이터 로딩 실패');

      const data = await response.json();
      setAnalyticsData(prev => ({ ...prev, weaknesses: data }));
    } catch (err) {
      console.error('약점 분석 데이터 로딩 오류:', err);
    } finally {
      setLoading(prev => ({ ...prev, weaknesses: false }));
    }
  };

  const loadProgressPrediction = async () => {
    setLoading(prev => ({ ...prev, prediction: true }));
    try {
      const response = await fetch('/api/analytics/progress-prediction?target_level=B1&time_horizon=6m', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('진도 예측 데이터 로딩 실패');

      const data = await response.json();
      setAnalyticsData(prev => ({ ...prev, progressPrediction: data }));
    } catch (err) {
      console.error('진도 예측 데이터 로딩 오류:', err);
    } finally {
      setLoading(prev => ({ ...prev, prediction: false }));
    }
  };

  const loadPeerComparison = async () => {
    setLoading(prev => ({ ...prev, comparison: true }));
    try {
      const response = await fetch('/api/analytics/peer-comparison?level=A2&study_duration=3m', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('동료 비교 데이터 로딩 실패');

      const data = await response.json();
      setAnalyticsData(prev => ({ ...prev, peerComparison: data }));
    } catch (err) {
      console.error('동료 비교 데이터 로딩 오류:', err);
    } finally {
      setLoading(prev => ({ ...prev, comparison: false }));
    }
  };

  const loadStudyRecommendations = async () => {
    setLoading(prev => ({ ...prev, recommendations: true }));
    try {
      const response = await fetch('/api/analytics/study-recommendations?goal_type=level_advancement&available_time=30&priority=balanced', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('학습 추천 데이터 로딩 실패');

      const data = await response.json();
      setAnalyticsData(prev => ({ ...prev, studyRecommendations: data }));
    } catch (err) {
      console.error('학습 추천 데이터 로딩 오류:', err);
    } finally {
      setLoading(prev => ({ ...prev, recommendations: false }));
    }
  };

  const loadInsights = async () => {
    setLoading(prev => ({ ...prev, insights: true }));
    try {
      const response = await fetch('/api/analytics/insights', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('인사이트 데이터 로딩 실패');

      const data = await response.json();
      setAnalyticsData(prev => ({ ...prev, insights: data.insights }));
    } catch (err) {
      console.error('인사이트 데이터 로딩 오류:', err);
    } finally {
      setLoading(prev => ({ ...prev, insights: false }));
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    loadOverviewData();
    loadInsights();
  }, [selectedPeriod]);

  // 탭 변경 시 해당 데이터 로딩
  useEffect(() => {
    switch (activeTab) {
      case 'patterns':
        if (!analyticsData.learningPatterns) loadLearningPatterns();
        break;
      case 'weaknesses':
        if (!analyticsData.weaknesses) loadWeaknessAnalysis();
        break;
      case 'prediction':
        if (!analyticsData.progressPrediction) loadProgressPrediction();
        break;
      case 'comparison':
        if (!analyticsData.peerComparison) loadPeerComparison();
        break;
      case 'recommendations':
        if (!analyticsData.studyRecommendations) loadStudyRecommendations();
        break;
    }
  }, [activeTab]);

  // 데이터 새로고침
  const refreshData = async () => {
    setError(null);
    await loadOverviewData();

    // 현재 활성 탭의 데이터도 새로고침
    switch (activeTab) {
      case 'patterns':
        await loadLearningPatterns();
        break;
      case 'weaknesses':
        await loadWeaknessAnalysis();
        break;
      case 'prediction':
        await loadProgressPrediction();
        break;
      case 'comparison':
        await loadPeerComparison();
        break;
      case 'recommendations':
        await loadStudyRecommendations();
        break;
    }
  };

  // 보고서 내보내기
  const exportReport = async (format: 'pdf' | 'xlsx' | 'json') => {
    try {
      const response = await fetch('/api/analytics/custom-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          report_type: 'comprehensive',
          date_range: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          },
          metrics: ['vocabulary', 'pronunciation', 'grammar', 'study_patterns'],
          comparison_type: 'self_progress',
          granularity: 'weekly'
        })
      });

      if (!response.ok) throw new Error('보고서 생성 실패');

      const reportData = await response.json();

      // 내보내기 요청
      const exportResponse = await fetch(`/api/analytics/export/${reportData.report_id}?format=${format}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!exportResponse.ok) throw new Error('보고서 내보내기 실패');

      const exportData = await exportResponse.json();

      // 다운로드 링크 처리 (실제 구현에서는 파일 다운로드)
      console.log('보고서 다운로드 링크:', exportData.download_url);

    } catch (err) {
      console.error('보고서 내보내기 오류:', err);
      setError('보고서 내보내기 중 오류가 발생했습니다');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="analytics-dashboard">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">학습 분석</h1>
            <p className="text-gray-600">개인화된 학습 인사이트와 진도 분석을 확인하세요</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* 기간 선택 */}
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">최근 7일</SelectItem>
                <SelectItem value="30d">최근 30일</SelectItem>
                <SelectItem value="90d">최근 90일</SelectItem>
                <SelectItem value="1y">최근 1년</SelectItem>
              </SelectContent>
            </Select>

            {/* 새로고침 버튼 */}
            <Button onClick={refreshData} variant="outline" size="sm">
              새로고침
            </Button>

            {/* 내보내기 드롭다운 */}
            <Select onValueChange={(value) => exportReport(value as 'pdf' | 'xlsx' | 'json')}>
              <SelectTrigger className="w-32">
                <Download className="w-4 h-4 mr-2" />
                <SelectValue placeholder="내보내기" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 마지막 업데이트 시간 */}
        {lastUpdated && (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            마지막 업데이트: {lastUpdated.toLocaleString()}
          </div>
        )}

        {/* 오류 알림 */}
        {error && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* 인사이트 알림 패널 */}
      <InsightsPanel
        insights={analyticsData.insights || []}
        loading={loading.insights}
        className="mb-6"
      />

      {/* 메인 탭 컨텐츠 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6" data-testid="analytics-tabs">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>개요</span>
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>학습패턴</span>
          </TabsTrigger>
          <TabsTrigger value="weaknesses" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>약점분석</span>
          </TabsTrigger>
          <TabsTrigger value="prediction" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>진도예측</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>동료비교</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>추천</span>
          </TabsTrigger>
        </TabsList>

        {/* 학습 개요 탭 */}
        <TabsContent value="overview" className="space-y-6" data-testid="overview-tab">
          {loading.overview ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <LearningOverview data={analyticsData.overview} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkillBreakdown data={analyticsData.overview?.skill_breakdown} />
                <PerformanceTrends data={analyticsData.overview?.recent_activity} />
              </div>
            </>
          )}
        </TabsContent>

        {/* 학습 패턴 탭 */}
        <TabsContent value="patterns" className="space-y-6" data-testid="patterns-tab">
          {loading.patterns ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          ) : (
            <StudyPatterns data={analyticsData.learningPatterns} />
          )}
        </TabsContent>

        {/* 약점 분석 탭 */}
        <TabsContent value="weaknesses" className="space-y-6" data-testid="weaknesses-tab">
          {loading.weaknesses ? (
            <Skeleton className="h-96" />
          ) : (
            <WeaknessAnalysis data={analyticsData.weaknesses} />
          )}
        </TabsContent>

        {/* 진도 예측 탭 */}
        <TabsContent value="prediction" className="space-y-6" data-testid="prediction-tab">
          {loading.prediction ? (
            <Skeleton className="h-96" />
          ) : (
            <ProgressPrediction data={analyticsData.progressPrediction} />
          )}
        </TabsContent>

        {/* 동료 비교 탭 */}
        <TabsContent value="comparison" className="space-y-6" data-testid="comparison-tab">
          {loading.comparison ? (
            <Skeleton className="h-96" />
          ) : (
            <PeerComparison data={analyticsData.peerComparison} />
          )}
        </TabsContent>

        {/* 학습 추천 탭 */}
        <TabsContent value="recommendations" className="space-y-6" data-testid="recommendations-tab">
          {loading.recommendations ? (
            <Skeleton className="h-96" />
          ) : (
            <StudyRecommendations data={analyticsData.studyRecommendations} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;