// 진도 차트 컴포넌트
// Hungarian Learning Platform - Progress Charts Component
// T114 [P] [US5] Create ProgressCharts component

"use client";

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  Activity
} from 'lucide-react';

interface ProgressChartsProps {
  data?: {
    recent_activity: {
      last_7_days: Array<{
        date: string;
        study_time_minutes: number;
        words_practiced: number;
        accuracy_rate: number;
        session_count: number;
      }>;
      weekly_summary: {
        total_time: number;
        average_accuracy: number;
        improvement_rate: number;
      };
      trends: {
        study_time_trend: 'increasing' | 'decreasing' | 'stable';
        accuracy_trend: 'improving' | 'declining' | 'stable';
        engagement_trend: 'increasing' | 'decreasing' | 'stable';
      };
    };
    skill_breakdown: {
      vocabulary: {
        level: number;
        progress_percentage: number;
        mastered_words: number;
        struggling_words: number;
      };
      pronunciation: {
        level: number;
        progress_percentage: number;
        accuracy_trend: number[];
      };
      grammar: {
        level: number;
        progress_percentage: number;
        syntax_accuracy: number;
        morphology_accuracy: number;
      };
    };
  };
}

const ProgressCharts: React.FC<ProgressChartsProps> = ({ data }) => {
  // 색상 팔레트
  const colors = {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    muted: '#6B7280'
  };

  const skillColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>진도 차트</CardTitle>
          <CardDescription>학습 진도 및 성과 데이터를 시각화합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            데이터를 불러오는 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  // 트렌드 아이콘 가져오기
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing':
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  // 스킬 레이더 차트 데이터
  const skillRadarData = [
    {
      skill: '어휘',
      level: data.skill_breakdown.vocabulary.level,
      progress: data.skill_breakdown.vocabulary.progress_percentage
    },
    {
      skill: '발음',
      level: data.skill_breakdown.pronunciation.level,
      progress: data.skill_breakdown.pronunciation.progress_percentage
    },
    {
      skill: '문법',
      level: data.skill_breakdown.grammar.level,
      progress: data.skill_breakdown.grammar.progress_percentage
    }
  ];

  // 어휘 학습 상태 파이 차트 데이터
  const vocabularyPieData = [
    {
      name: '숙달한 단어',
      value: data.skill_breakdown.vocabulary.mastered_words,
      color: colors.accent
    },
    {
      name: '학습 중인 단어',
      value: data.skill_breakdown.vocabulary.struggling_words,
      color: colors.warning
    }
  ];

  // 문법 정확도 비교 데이터
  const grammarComparisonData = [
    {
      type: '구문 정확도',
      accuracy: (data.skill_breakdown.grammar.syntax_accuracy * 100).toFixed(1)
    },
    {
      type: '형태소 정확도',
      accuracy: (data.skill_breakdown.grammar.morphology_accuracy * 100).toFixed(1)
    }
  ];

  return (
    <div className="space-y-6" data-testid="progress-charts">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>개요</span>
          </TabsTrigger>
          <TabsTrigger value="daily" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>일별</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>스킬별</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center space-x-2">
            <LineChartIcon className="w-4 h-4" />
            <span>트렌드</span>
          </TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 스킬 레이더 차트 */}
            <Card>
              <CardHeader>
                <CardTitle>스킬 레벨 비교</CardTitle>
                <CardDescription>각 영역별 현재 레벨과 진도율</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={skillRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} />
                    <Radar
                      name="레벨"
                      dataKey="level"
                      stroke={colors.primary}
                      fill={colors.primary}
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="진도율 (%)"
                      dataKey="progress"
                      stroke={colors.secondary}
                      fill={colors.secondary}
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 주간 학습 통계 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>이번 주 성과</span>
                </CardTitle>
                <CardDescription>주간 학습 요약 및 트렌드</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {data.recent_activity.weekly_summary.total_time}분
                      </p>
                      <p className="text-sm text-muted-foreground">총 학습 시간</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {(data.recent_activity.weekly_summary.average_accuracy * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">평균 정확도</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">학습 시간</span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(data.recent_activity.trends.study_time_trend)}
                        <Badge variant="outline">
                          {data.recent_activity.trends.study_time_trend === 'increasing' ? '증가' :
                            data.recent_activity.trends.study_time_trend === 'decreasing' ? '감소' : '안정'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">정확도</span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(data.recent_activity.trends.accuracy_trend)}
                        <Badge variant="outline">
                          {data.recent_activity.trends.accuracy_trend === 'improving' ? '개선' :
                            data.recent_activity.trends.accuracy_trend === 'declining' ? '하락' : '안정'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">참여도</span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(data.recent_activity.trends.engagement_trend)}
                        <Badge variant="outline">
                          {data.recent_activity.trends.engagement_trend === 'increasing' ? '증가' :
                            data.recent_activity.trends.engagement_trend === 'decreasing' ? '감소' : '안정'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {data.recent_activity.weekly_summary.improvement_rate && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          이번 주 개선율: {(data.recent_activity.weekly_summary.improvement_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 일별 탭 */}
        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>일별 학습 진도</CardTitle>
              <CardDescription>최근 7일간의 학습 활동</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.recent_activity.last_7_days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      if (name === 'accuracy_rate') {
                        return [`${(value * 100).toFixed(1)}%`, '정확도'];
                      }
                      return [value, name === 'study_time_minutes' ? '학습시간(분)' :
                        name === 'words_practiced' ? '연습 단어 수' : '세션 수'];
                    }}
                    labelFormatter={(label) => `날짜: ${label}`}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="study_time_minutes"
                    fill={colors.primary}
                    name="학습시간(분)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="accuracy_rate"
                    stroke={colors.accent}
                    strokeWidth={2}
                    name="정확도"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="words_practiced"
                    stroke={colors.warning}
                    strokeWidth={2}
                    name="연습 단어 수"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>학습 시간 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.recent_activity.last_7_days}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}분`, '학습시간']} />
                    <Area
                      type="monotone"
                      dataKey="study_time_minutes"
                      stroke={colors.primary}
                      fill={colors.primary}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>정확도 변화</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.recent_activity.last_7_days}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Tooltip formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, '정확도']} />
                    <Line
                      type="monotone"
                      dataKey="accuracy_rate"
                      stroke={colors.accent}
                      strokeWidth={3}
                      dot={{ fill: colors.accent, strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 스킬별 탭 */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 어휘 학습 상태 */}
            <Card>
              <CardHeader>
                <CardTitle>어휘 학습 현황</CardTitle>
                <CardDescription>단어 숙달 상태 분포</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={vocabularyPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value}개 (${((percent || 0) * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {vocabularyPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 문법 정확도 비교 */}
            <Card>
              <CardHeader>
                <CardTitle>문법 정확도 분석</CardTitle>
                <CardDescription>구문 vs 형태소 정확도</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={grammarComparisonData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="type" type="category" width={100} />
                    <Tooltip formatter={(value) => [`${value}%`, '정확도']} />
                    <Bar dataKey="accuracy" fill={colors.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 발음 정확도 트렌드 */}
          {data.skill_breakdown.pronunciation.accuracy_trend.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>발음 정확도 트렌드</CardTitle>
                <CardDescription>시간에 따른 발음 정확도 변화</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={data.skill_breakdown.pronunciation.accuracy_trend.map((value, index) => ({
                      session: `세션 ${index + 1}`,
                      accuracy: value
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="session" />
                    <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Tooltip formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, '발음 정확도']} />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke={colors.primary}
                      strokeWidth={2}
                      dot={{ fill: colors.primary, strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 트렌드 탭 */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>종합 학습 트렌드</CardTitle>
              <CardDescription>최근 7일간의 종합적인 학습 성과</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.recent_activity.last_7_days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      if (name === 'accuracy_rate') {
                        return [`${(value * 100).toFixed(1)}%`, '정확도'];
                      }
                      return [value, name === 'study_time_minutes' ? '학습시간(분)' :
                        name === 'words_practiced' ? '연습 단어' : '세션 수'];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="study_time_minutes"
                    stroke={colors.primary}
                    strokeWidth={2}
                    name="학습시간(분)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="accuracy_rate"
                    stroke={colors.accent}
                    strokeWidth={2}
                    name="정확도"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="words_practiced"
                    stroke={colors.warning}
                    strokeWidth={2}
                    name="연습 단어"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="session_count"
                    stroke={colors.secondary}
                    strokeWidth={2}
                    name="세션 수"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressCharts;