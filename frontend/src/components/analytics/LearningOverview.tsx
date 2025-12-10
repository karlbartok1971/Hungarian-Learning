// 학습 개요 컴포넌트
// Hungarian Learning Platform - Learning Overview Component

"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Clock,
  Target,
  Flame,
  Calendar,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';

interface LearningOverviewProps {
  data?: {
    overall_progress: {
      total_study_time_hours: number;
      total_words_learned: number;
      current_level: string;
      level_progress_percentage: number;
      study_streak_days: number;
      total_sessions: number;
      average_session_duration: number;
      overall_accuracy: number;
      study_consistency: number;
      last_active_date: string;
    };
    recent_activity: {
      weekly_summary: {
        total_time: number;
        average_accuracy: number;
        improvement_rate: number;
      };
    };
  };
}

const LearningOverview: React.FC<LearningOverviewProps> = ({ data }) => {
  if (!data?.overall_progress) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { overall_progress, recent_activity } = data;

  // 레벨 색상 매핑
  const getLevelColor = (level: string) => {
    const colors = {
      'A1': 'bg-green-500',
      'A2': 'bg-blue-500',
      'B1': 'bg-purple-500',
      'B2': 'bg-orange-500',
      'C1': 'bg-red-500',
      'C2': 'bg-gray-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500';
  };

  // 성과 상태 계산
  const getPerformanceStatus = (accuracy: number) => {
    if (accuracy >= 0.9) return { status: '우수', color: 'bg-green-100 text-green-800' };
    if (accuracy >= 0.8) return { status: '양호', color: 'bg-blue-100 text-blue-800' };
    if (accuracy >= 0.7) return { status: '보통', color: 'bg-yellow-100 text-yellow-800' };
    return { status: '개선필요', color: 'bg-red-100 text-red-800' };
  };

  const performanceStatus = getPerformanceStatus(overall_progress.overall_accuracy);

  return (
    <div className="space-y-6" data-testid="learning-overview">
      {/* 주요 지표 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 현재 레벨 */}
        <Card data-testid="current-level-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">현재 레벨</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getLevelColor(overall_progress.current_level)}`}></div>
              <div className="text-2xl font-bold">{overall_progress.current_level}</div>
            </div>
            <div className="mt-2">
              <Progress
                value={overall_progress.level_progress_percentage}
                className="h-2"
                data-testid="level-progress"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {overall_progress.level_progress_percentage}% 완료
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 총 학습 시간 */}
        <Card data-testid="study-time-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 학습 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overall_progress.total_study_time_hours.toFixed(1)}시간
            </div>
            <p className="text-xs text-muted-foreground">
              평균 세션: {overall_progress.average_session_duration}분
            </p>
          </CardContent>
        </Card>

        {/* 연속 학습일 */}
        <Card data-testid="streak-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연속 학습일</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overall_progress.study_streak_days}일
            </div>
            <p className="text-xs text-muted-foreground">
              총 {overall_progress.total_sessions}회 세션
            </p>
          </CardContent>
        </Card>

        {/* 전체 정확도 */}
        <Card data-testid="accuracy-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 정확도</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(overall_progress.overall_accuracy * 100).toFixed(1)}%
            </div>
            <Badge className={performanceStatus.color} variant="secondary">
              {performanceStatus.status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* 세부 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 학습된 단어 */}
        <Card data-testid="words-learned-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>학습한 단어</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {overall_progress.total_words_learned}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              누적 어휘 학습량
            </p>
          </CardContent>
        </Card>

        {/* 학습 일관성 */}
        <Card data-testid="consistency-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>학습 일관성</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">
                {(overall_progress.study_consistency * 100).toFixed(0)}%
              </div>
              <Progress value={overall_progress.study_consistency * 100} className="h-2" />
              <p className="text-sm text-muted-foreground">
                규칙적인 학습 패턴
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 최근 활동 */}
        <Card data-testid="recent-activity-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>이번 주 활동</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">총 학습 시간</p>
                <p className="text-lg font-semibold">
                  {recent_activity?.weekly_summary?.total_time || 0}분
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">평균 정확도</p>
                <p className="text-lg font-semibold">
                  {((recent_activity?.weekly_summary?.average_accuracy || 0) * 100).toFixed(1)}%
                </p>
              </div>
              {recent_activity?.weekly_summary?.improvement_rate !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">개선율</p>
                  <div className="flex items-center space-x-1">
                    <p className={`text-lg font-semibold ${
                      recent_activity.weekly_summary.improvement_rate > 0
                        ? 'text-green-600'
                        : recent_activity.weekly_summary.improvement_rate < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}>
                      {recent_activity.weekly_summary.improvement_rate > 0 ? '+' : ''}
                      {(recent_activity.weekly_summary.improvement_rate * 100).toFixed(1)}%
                    </p>
                    {recent_activity.weekly_summary.improvement_rate > 0 && (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 학습 현황 요약 */}
      <Card data-testid="summary-card">
        <CardHeader>
          <CardTitle>학습 현황 요약</CardTitle>
          <CardDescription>
            최근 활동을 기반으로 한 종합 평가
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">강점</h4>
              <div className="space-y-2">
                {overall_progress.study_streak_days >= 7 && (
                  <div className="flex items-center space-x-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">꾸준한 학습 습관</span>
                  </div>
                )}
                {overall_progress.overall_accuracy >= 0.8 && (
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-sm">높은 정확도</span>
                  </div>
                )}
                {overall_progress.study_consistency >= 0.7 && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">일관된 학습 패턴</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">개선 영역</h4>
              <div className="space-y-2">
                {overall_progress.study_streak_days < 3 && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">학습 빈도 증가 필요</span>
                  </div>
                )}
                {overall_progress.overall_accuracy < 0.7 && (
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-red-500" />
                    <span className="text-sm">정확도 개선 필요</span>
                  </div>
                )}
                {overall_progress.average_session_duration < 15 && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">세션 시간 연장 권장</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningOverview;