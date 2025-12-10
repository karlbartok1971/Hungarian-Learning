/**
 * 프리미엄 대시보드 페이지
 * 실제 백엔드 API와 연동하여 학습 현황, 통계, 추천 콘텐츠, AI 조언 등을 제공
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  BookOpen,
  Clock,
  Award,
  Target,
  Flame,
  Trophy,
  Star,
  Sparkles,
  ArrowRight,
  Calendar,
  BarChart3,
  CheckCircle2,
  MessageCircle,
  Zap,
  Heart,
  Brain,
  PenTool,
  GraduationCap,
} from 'lucide-react';

interface DashboardStats {
  currentLevel: {
    level: string;
    progress: number;
    nextLevel: string;
  };
  dailyGoals: {
    lessonsCompleted: number;
    lessonsTarget: number;
    studyMinutes: number;
    studyMinutesTarget: number;
    vocabularyReviewed: number;
    vocabularyReviewTarget: number;
  };
  streak: number;
  totalStudyTime: number;
  weeklyActivity: Array<{
    date: string;
    minutes: number;
    lessonsCompleted: number;
  }>;
  progressByArea: {
    grammar: { completed: number; total: number; percentage: number };
    vocabulary: { completed: number; total: number; percentage: number };
    writing: { completed: number; total: number; percentage: number };
    exercises: { completed: number; total: number; percentage: number };
  };
  totalGrammarLessons: number;
  completedGrammarLessons: number;
  totalVocabulary: number;
  learnedVocabulary: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  status: string;
  score: number | null;
}

interface Recommendations {
  nextLesson: {
    id: string;
    title: string;
    level: string;
    reason: string;
    estimatedDuration: number;
  };
  reviewVocabulary: {
    count: number;
    reason: string;
    urgency: string;
  };
  practiceWriting: {
    topic: string;
    reason: string;
    difficulty: string;
  };
  aiAdvice: string;
  weakAreas: Array<{
    area: string;
    score: number;
    suggestion: string;
  }>;
}

interface Achievements {
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
  milestones: Array<{
    name: string;
    progress: number;
    target: number;
    icon: string;
  }>;
  hungarianPlaces: {
    unlocked: string[];
    locked: string[];
    progress: number;
  };
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [achievements, setAchievements] = useState<Achievements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, activitiesRes, recommendationsRes, achievementsRes] = await Promise.all([
        fetch('http://localhost:3001/api/dashboard/stats'),
        fetch('http://localhost:3001/api/dashboard/recent-activities'),
        fetch('http://localhost:3001/api/dashboard/recommendations'),
        fetch('http://localhost:3001/api/dashboard/achievements'),
      ]);

      const [statsData, activitiesData, recommendationsData, achievementsData] = await Promise.all([
        statsRes.json(),
        activitiesRes.json(),
        recommendationsRes.json(),
        achievementsRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (activitiesData.success) setActivities(activitiesData.data);
      if (recommendationsData.success) setRecommendations(recommendationsData.data);
      if (achievementsData.success) setAchievements(achievementsData.data);

    } catch (err: any) {
      console.error('대시보드 데이터 로드 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'grammar': return <BookOpen className="w-4 h-4" />;
      case 'vocabulary': return <GraduationCap className="w-4 h-4" />;
      case 'writing': return <PenTool className="w-4 h-4" />;
      case 'assessment': return <Award className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'bg-blue-100 text-blue-700';
      case 'vocabulary': return 'bg-green-100 text-green-700';
      case 'writing': return 'bg-purple-100 text-purple-700';
      case 'assessment': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}일 전`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">오류 발생</CardTitle>
            <CardDescription>{error || '데이터를 불러올 수 없습니다'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>대시보드 - 헝가리어 학습</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              안녕하세요! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              오늘도 헝가리어 학습을 시작해볼까요?
            </p>
          </div>

          {/* AI 조언 카드 */}
          {recommendations && (
            <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      AI 튜터의 조언
                    </h3>
                    <p className="text-gray-700">{recommendations.aiAdvice}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 주요 통계 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* 현재 레벨 */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardDescription>현재 레벨</CardDescription>
                <CardTitle className="text-3xl">{stats.currentLevel.level}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{stats.currentLevel.nextLevel} 레벨까지</span>
                    <span className="font-bold text-blue-600">{stats.currentLevel.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${stats.currentLevel.progress}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 연속 학습일 */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-600" />
                  연속 학습일
                </CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  {stats.streak}
                  <span className="text-base font-normal text-gray-600">일</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  훌륭해요! 계속 이어가세요 🔥
                </p>
              </CardContent>
            </Card>

            {/* 총 학습 시간 */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  총 학습 시간
                </CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  {Math.floor(stats.totalStudyTime / 60)}
                  <span className="text-base font-normal text-gray-600">시간</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {stats.totalStudyTime % 60}분 추가
                </p>
              </CardContent>
            </Card>

            {/* 완료한 레슨 */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-purple-600" />
                  완료한 레슨
                </CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  {stats.completedGrammarLessons}
                  <span className="text-base font-normal text-gray-600">개</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  전체 {stats.totalGrammarLessons}개 중
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 오늘의 목표 */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    오늘의 목표
                  </CardTitle>
                  <CardDescription>하루 학습 목표를 달성하세요</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  {Math.round(
                    ((stats.dailyGoals.lessonsCompleted / stats.dailyGoals.lessonsTarget) * 100 +
                      (stats.dailyGoals.studyMinutes / stats.dailyGoals.studyMinutesTarget) * 100 +
                      (stats.dailyGoals.vocabularyReviewed / stats.dailyGoals.vocabularyReviewTarget) * 100) / 3
                  )}% 완료
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 레슨 목표 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">레슨 완료</span>
                    <span className="text-sm font-bold text-blue-600">
                      {stats.dailyGoals.lessonsCompleted}/{stats.dailyGoals.lessonsTarget}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.dailyGoals.lessonsCompleted / stats.dailyGoals.lessonsTarget) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* 학습 시간 목표 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">학습 시간</span>
                    <span className="text-sm font-bold text-green-600">
                      {stats.dailyGoals.studyMinutes}/{stats.dailyGoals.studyMinutesTarget}분
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.dailyGoals.studyMinutes / stats.dailyGoals.studyMinutesTarget) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* 어휘 복습 목표 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">어휘 복습</span>
                    <span className="text-sm font-bold text-purple-600">
                      {stats.dailyGoals.vocabularyReviewed}/{stats.dailyGoals.vocabularyReviewTarget}개
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.dailyGoals.vocabularyReviewed / stats.dailyGoals.vocabularyReviewTarget) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* 왼쪽: 추천 학습 & 최근 활동 */}
            <div className="lg:col-span-2 space-y-8">
              {/* 추천 학습 */}
              {recommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      추천 학습
                    </CardTitle>
                    <CardDescription>지금 학습하기 좋은 콘텐츠</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 다음 레슨 */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge className="mb-2 bg-blue-100 text-blue-700">{recommendations.nextLesson.level}</Badge>
                          <h4 className="font-bold text-gray-900">{recommendations.nextLesson.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{recommendations.nextLesson.reason}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {recommendations.nextLesson.estimatedDuration}분
                          </div>
                        </div>
                      </div>
                      <Link href={`/grammar/${recommendations.nextLesson.level.toLowerCase()}/${recommendations.nextLesson.id}`}>
                        <Button className="w-full mt-3">
                          학습 시작하기
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>

                    {/* 어휘 복습 */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">어휘 복습</h4>
                          <p className="text-sm text-gray-600">{recommendations.reviewVocabulary.reason}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">
                          {recommendations.reviewVocabulary.count}개
                        </Badge>
                      </div>
                      <Link href="/vocabulary">
                        <Button variant="outline" className="w-full mt-3">
                          복습하기
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>

                    {/* 작문 연습 */}
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">{recommendations.practiceWriting.topic}</h4>
                          <p className="text-sm text-gray-600">{recommendations.practiceWriting.reason}</p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700">
                          {recommendations.practiceWriting.difficulty}
                        </Badge>
                      </div>
                      <Link href="/writing">
                        <Button variant="outline" className="w-full mt-3">
                          작문 연습하기
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 최근 활동 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-700" />
                    최근 활동
                  </CardTitle>
                  <CardDescription>최근 학습 기록</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-600">{formatTimeAgo(activity.timestamp)}</p>
                          </div>
                        </div>
                        {activity.score !== null && (
                          <Badge className="bg-blue-100 text-blue-700">
                            {activity.score}점
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 오른쪽: 영역별 진도 & 업적 */}
            <div className="space-y-8">
              {/* 영역별 진도 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-gray-700" />
                    영역별 진도
                  </CardTitle>
                  <CardDescription>각 영역의 학습 진행 상황</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 문법 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">문법</span>
                      <span className="text-sm font-bold text-blue-600">
                        {Math.min(stats.progressByArea.grammar.percentage, 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(stats.progressByArea.grammar.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {stats.progressByArea.grammar.completed}/{stats.progressByArea.grammar.total} 레슨 완료
                    </p>
                  </div>

                  {/* 어휘 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">어휘</span>
                      <span className="text-sm font-bold text-green-600">
                        {Math.min(stats.progressByArea.vocabulary.percentage, 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(stats.progressByArea.vocabulary.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {stats.progressByArea.vocabulary.completed}/{stats.progressByArea.vocabulary.total} 단어 학습
                    </p>
                  </div>

                  {/* 작문 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">작문</span>
                      <span className="text-sm font-bold text-purple-600">
                        {Math.min(stats.progressByArea.writing.percentage, 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(stats.progressByArea.writing.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {stats.progressByArea.writing.completed}/{stats.progressByArea.writing.total} 과제 완료
                    </p>
                  </div>

                  {/* 연습 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">종합 연습</span>
                      <span className="text-sm font-bold text-orange-600">
                        {Math.min(stats.progressByArea.exercises.percentage, 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(stats.progressByArea.exercises.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {stats.progressByArea.exercises.completed}/{stats.progressByArea.exercises.total} 연습 완료
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 업적 & 배지 */}
              {achievements && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      업적 & 배지
                    </CardTitle>
                    <CardDescription>획득한 배지와 마일스톤</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 최근 배지 */}
                    <div className="grid grid-cols-2 gap-3">
                      {achievements.badges.slice(0, 4).map((badge) => (
                        <div
                          key={badge.id}
                          className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 text-center"
                        >
                          <div className="text-3xl mb-1">{badge.icon}</div>
                          <p className="text-xs font-bold text-gray-900">{badge.name}</p>
                          <p className="text-xs text-gray-600">{badge.description}</p>
                        </div>
                      ))}
                    </div>

                    {/* 마일스톤 */}
                    <div className="space-y-3">
                      {achievements.milestones.map((milestone, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <span>{milestone.icon}</span>
                              {milestone.name}
                            </span>
                            <span className="text-sm font-bold text-blue-600">
                              {milestone.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                              style={{ width: `${milestone.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 헝가리 명소 컬렉션 */}
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4 text-purple-600" />
                        헝가리 명소 컬렉션
                      </h4>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {achievements.hungarianPlaces.unlocked.map((place, idx) => (
                          <div
                            key={idx}
                            className="aspect-square bg-white rounded-lg flex items-center justify-center text-center p-2 border-2 border-green-300"
                          >
                            <p className="text-xs font-medium text-gray-700">{place}</p>
                          </div>
                        ))}
                        {achievements.hungarianPlaces.locked.slice(0, 3 - achievements.hungarianPlaces.unlocked.length).map((_, idx) => (
                          <div
                            key={`locked-${idx}`}
                            className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-300"
                          >
                            <span className="text-2xl opacity-50">🔒</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-center text-gray-600">
                        {achievements.hungarianPlaces.unlocked.length}/{achievements.hungarianPlaces.unlocked.length + achievements.hungarianPlaces.locked.length} 명소 해금
                      </p>
                    </div>

                    <Link href="/analytics">
                      <Button variant="outline" className="w-full">
                        모든 업적 보기
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* 취약점 분석 (선택적) */}
          {recommendations && recommendations.weakAreas.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-orange-600" />
                  개선이 필요한 영역
                </CardTitle>
                <CardDescription>AI가 분석한 취약점과 개선 방법</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.weakAreas.map((area, idx) => (
                    <div key={idx} className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">{area.area}</h4>
                        <Badge className="bg-orange-100 text-orange-700">
                          {area.score}점
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{area.suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
