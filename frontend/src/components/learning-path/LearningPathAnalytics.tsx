'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3Icon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  CalendarIcon,
  TargetIcon,
  BookOpenIcon,
  BrainIcon,
  AwardIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  DownloadIcon,
  FilterIcon
} from "lucide-react";

export interface LearningAnalyticsData {
  pathId: string;
  period: string;
  generatedAt: string;

  overview: {
    totalStudyTime: number;
    averageDailyTime: number;
    completionRate: number;
    consistencyScore: number;
    difficultyProgression: string;
  };

  performanceMetrics: {
    vocabularyRetention: number;
    grammarAccuracy: number;
    pronunciationImprovement: number;
    culturalAdaptation: number;
    sermonWritingReadiness: number;
  };

  learningPattern: {
    peakPerformanceHours: string[];
    mostEffectiveLessonTypes: string[];
    strugglingAreas: string[];
    preferredSessionLength: string;
  };

  interferenceReduction: {
    phonological: {
      initialScore: number;
      currentScore: number;
      improvement: string;
      trend: string;
    };
    grammatical: {
      initialScore: number;
      currentScore: number;
      improvement: string;
      trend: string;
    };
    cultural: {
      initialScore: number;
      currentScore: number;
      improvement: string;
      trend: string;
    };
  };

  milestoneProgress: {
    nextMilestone: string;
    daysUntilDue: number;
    preparedness: number;
    recommendedActions: string[];
  };

  predictions: {
    targetLevelAchievement: {
      level: string;
      estimatedDate: string;
      confidence: number;
    };
    sermonWritingReadiness: {
      estimatedDate: string;
      confidence: number;
    };
  };

  recommendations: {
    immediate: string[];
    strategic: string[];
  };

  weeklyProgress: Array<{
    week: string;
    studyTime: number;
    lessonsCompleted: number;
    averageScore: number;
    streakDays: number;
  }>;

  categoryTrends: Array<{
    category: string;
    trend: 'improving' | 'stable' | 'declining';
    currentScore: number;
    change: number;
  }>;
}

interface LearningPathAnalyticsProps {
  analyticsData: LearningAnalyticsData;
  onDownloadReport?: () => void;
  onUpdatePeriod?: (period: string) => void;
  isLoading?: boolean;
}

export const LearningPathAnalytics: React.FC<LearningPathAnalyticsProps> = ({
  analyticsData,
  onDownloadReport,
  onUpdatePeriod,
  isLoading = false
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(analyticsData.period);
  const [activeTab, setActiveTab] = useState('overview');

  const periods = [
    { value: '7', label: '지난 7일' },
    { value: '30', label: '지난 30일' },
    { value: '90', label: '지난 3개월' },
    { value: '365', label: '지난 1년' }
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDownIcon className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'declining':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    if (onUpdatePeriod) {
      onUpdatePeriod(period);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">학습 분석</h1>
          <p className="text-gray-600 mt-1">
            상세한 학습 패턴 분석 및 성과 리포트
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FilterIcon className="w-4 h-4 text-gray-500" />
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {onDownloadReport && (
            <Button onClick={onDownloadReport} variant="outline">
              <DownloadIcon className="w-4 h-4 mr-2" />
              리포트 다운로드
            </Button>
          )}
        </div>
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <ClockIcon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">
              {formatTime(analyticsData.overview.totalStudyTime)}
            </div>
            <div className="text-sm text-gray-600">총 학습시간</div>
            <div className="text-xs text-gray-500 mt-1">
              일평균 {formatTime(analyticsData.overview.averageDailyTime)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <TargetIcon className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">
              {analyticsData.overview.completionRate}%
            </div>
            <div className="text-sm text-gray-600">완료율</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">
              {analyticsData.overview.consistencyScore}%
            </div>
            <div className="text-sm text-gray-600">일관성 점수</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <BookOpenIcon className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">
              {analyticsData.performanceMetrics.vocabularyRetention}%
            </div>
            <div className="text-sm text-gray-600">어휘 기억률</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <BrainIcon className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">
              {analyticsData.performanceMetrics.sermonWritingReadiness}%
            </div>
            <div className="text-sm text-gray-600">설교문 준비도</div>
          </CardContent>
        </Card>
      </div>

      {/* 탭 네비게이션 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">종합 분석</TabsTrigger>
          <TabsTrigger value="performance">성과 지표</TabsTrigger>
          <TabsTrigger value="patterns">학습 패턴</TabsTrigger>
          <TabsTrigger value="interference">언어 간섭</TabsTrigger>
          <TabsTrigger value="predictions">예측 분석</TabsTrigger>
        </TabsList>

        {/* 종합 분석 */}
        <TabsContent value="overview" className="space-y-6">
          {/* 주간 진도 트렌드 */}
          <Card>
            <CardHeader>
              <CardTitle>주간 학습 진도</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.weeklyProgress.map((week, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-900">
                        {week.week}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <span>{formatTime(week.studyTime)}</span>
                        <span>•</span>
                        <span>{week.lessonsCompleted}개 레슨</span>
                        <span>•</span>
                        <span>{week.streakDays}일 연속</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-blue-600">
                        {week.averageScore}점
                      </div>
                      <div className="text-xs text-gray-500">평균 점수</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 카테고리별 성과 트렌드 */}
          <Card>
            <CardHeader>
              <CardTitle>영역별 성과 트렌드</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsData.categoryTrends.map((category) => (
                  <div
                    key={category.category}
                    className={`p-4 rounded-lg border ${getTrendColor(category.trend)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">
                        {category.category === 'grammar' ? '문법' :
                         category.category === 'vocabulary' ? '어휘' :
                         category.category === 'pronunciation' ? '발음' :
                         category.category === 'cultural' ? '문화' : category.category}
                      </span>
                      {getTrendIcon(category.trend)}
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold">
                        {category.currentScore}%
                      </div>
                      <div className="flex items-center text-xs">
                        <span>
                          {category.change > 0 ? '+' : ''}{category.change}%
                        </span>
                        <span className="ml-1 opacity-75">
                          ({category.trend === 'improving' ? '개선' :
                            category.trend === 'declining' ? '하락' : '안정'})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 성과 지표 */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 기본 성과 지표 */}
            <Card>
              <CardHeader>
                <CardTitle>핵심 성과 지표</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analyticsData.performanceMetrics).map(([metric, score]) => (
                  <div key={metric} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {metric === 'vocabularyRetention' ? '어휘 기억률' :
                         metric === 'grammarAccuracy' ? '문법 정확도' :
                         metric === 'pronunciationImprovement' ? '발음 개선도' :
                         metric === 'culturalAdaptation' ? '문화 적응도' : '설교문 준비도'}
                      </span>
                      <Badge variant="outline">{score}%</Badge>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 다가오는 마일스톤 */}
            <Card>
              <CardHeader>
                <CardTitle>다음 마일스톤</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    {analyticsData.milestoneProgress.nextMilestone}
                  </h3>
                  <div className="text-2xl font-bold text-blue-700">
                    {analyticsData.milestoneProgress.daysUntilDue}일 남음
                  </div>
                  <div className="mt-2">
                    <Progress
                      value={analyticsData.milestoneProgress.preparedness}
                      className="h-2"
                    />
                    <div className="text-sm text-blue-600 mt-1">
                      준비도: {analyticsData.milestoneProgress.preparedness}%
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">추천 액션</h4>
                  <ul className="space-y-1">
                    {analyticsData.milestoneProgress.recommendedActions.map((action, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircleIcon className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 학습 패턴 */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>최적 학습 시간</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">
                      최고 성과 시간대
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analyticsData.learningPattern.peakPerformanceHours.map((hour, index) => (
                        <Badge key={index} className="bg-green-500 text-white">
                          {hour}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">
                      선호 세션 길이
                    </h4>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {analyticsData.learningPattern.preferredSessionLength}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>효과적인 학습 유형</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">
                      가장 효과적
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analyticsData.learningPattern.mostEffectiveLessonTypes.map((type, index) => (
                        <Badge key={index} className="bg-blue-500 text-white">
                          {type === 'vocabulary' ? '어휘' :
                           type === 'grammar' ? '문법' :
                           type === 'pronunciation' ? '발음' : '문화'}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">
                      어려운 영역
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analyticsData.learningPattern.strugglingAreas.map((area, index) => (
                        <Badge key={index} variant="outline" className="border-orange-300 text-orange-600">
                          {area === 'pronunciation' ? '발음' :
                           area === 'grammar' ? '문법' :
                           area === 'vocabulary' ? '어휘' : '문화'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 언어 간섭 */}
        <TabsContent value="interference" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(analyticsData.interferenceReduction).map(([type, data]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="text-center">
                    {type === 'phonological' ? '음성학적 간섭' :
                     type === 'grammatical' ? '문법적 간섭' : '문화적 간섭'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {data.improvement}
                    </div>
                    <div className="text-sm text-gray-600">개선도</div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <div className="font-medium">초기</div>
                      <div className="text-gray-600">{data.initialScore}점</div>
                    </div>
                    <TrendingUpIcon className="w-6 h-6 text-green-500" />
                    <div>
                      <div className="font-medium">현재</div>
                      <div className="text-gray-600">{data.currentScore}점</div>
                    </div>
                  </div>

                  <Badge
                    className={`
                      ${data.trend === 'improving' ? 'bg-green-500' :
                        data.trend === 'steady progress' ? 'bg-blue-500' : 'bg-gray-500'}
                      text-white
                    `}
                  >
                    {data.trend === 'improving' ? '빠른 개선' :
                     data.trend === 'steady progress' ? '꾸준한 진보' : '안정'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 예측 분석 */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 레벨 달성 예측 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AwardIcon className="w-5 h-5 mr-2 text-yellow-500" />
                  목표 레벨 달성 예측
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700">
                    {analyticsData.predictions.targetLevelAchievement.level}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">목표 레벨</div>

                  <div className="mt-3">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatDate(analyticsData.predictions.targetLevelAchievement.estimatedDate)}
                    </div>
                    <div className="text-sm text-gray-600">예상 달성일</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">예측 신뢰도</span>
                  <Badge className="bg-blue-500 text-white">
                    {analyticsData.predictions.targetLevelAchievement.confidence}%
                  </Badge>
                </div>
                <Progress
                  value={analyticsData.predictions.targetLevelAchievement.confidence}
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* 설교문 작성 준비도 예측 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpenIcon className="w-5 h-5 mr-2 text-purple-500" />
                  설교문 작성 준비도
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                  <div className="text-lg font-semibold text-purple-700">
                    설교문 작성 가능
                  </div>
                  <div className="text-sm text-gray-600 mt-1">예상 상태</div>

                  <div className="mt-3">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatDate(analyticsData.predictions.sermonWritingReadiness.estimatedDate)}
                    </div>
                    <div className="text-sm text-gray-600">예상 달성일</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">예측 신뢰도</span>
                  <Badge className="bg-purple-500 text-white">
                    {analyticsData.predictions.sermonWritingReadiness.confidence}%
                  </Badge>
                </div>
                <Progress
                  value={analyticsData.predictions.sermonWritingReadiness.confidence}
                  className="h-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* 추천사항 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">즉시 실행 추천</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analyticsData.recommendations.immediate.map((rec, index) => (
                    <li key={index} className="flex items-start text-green-600">
                      <CheckCircleIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">전략적 추천</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analyticsData.recommendations.strategic.map((rec, index) => (
                    <li key={index} className="flex items-start text-blue-600">
                      <TargetIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 리포트 생성 정보 */}
      <Card className="bg-gray-50">
        <CardContent className="pt-4 text-center">
          <div className="text-sm text-gray-600">
            리포트 생성일: {formatDate(analyticsData.generatedAt)} •
            분석 기간: {analyticsData.period}일 •
            데이터 포인트: {analyticsData.weeklyProgress.length}주
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningPathAnalytics;