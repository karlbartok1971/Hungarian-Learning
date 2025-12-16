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

import useSWR, { mutate } from 'swr';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DashboardPage = () => {
  const [greeting, setGreeting] = useState('');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3901/api';

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
  }, []);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침입니다';
    if (hour < 18) return '좋은 오후입니다';
    return '좋은 저녁입니다';
  };

  // SWR Hooks for Real-time Data Fetching (Polling every 5 seconds)
  const { data: statsData, error: statsError, isLoading: statsLoading } = useSWR(
    `${API_BASE_URL}/dashboard/stats`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: activitiesData, error: activitiesError, isLoading: activitiesLoading } = useSWR(
    `${API_BASE_URL}/dashboard/recent-activities`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: recommendationsData, error: recommendationsError, isLoading: recommendationsLoading } = useSWR(
    `${API_BASE_URL}/dashboard/recommendations`,
    fetcher,
    { refreshInterval: 10000 } // Recommendations can update less frequently
  );

  const { data: achievementsData, error: achievementsError, isLoading: achievementsLoading } = useSWR(
    `${API_BASE_URL}/dashboard/achievements`,
    fetcher,
    { refreshInterval: 10000 }
  );

  // Consolidated Loading & Error States
  const isLoading = statsLoading || activitiesLoading || recommendationsLoading || achievementsLoading;
  const isError = statsError || activitiesError || recommendationsError || achievementsError;

  // Use isValidating from any of the hooks to show refresh state
  const { isValidating: isStatsValidating } = useSWR(`${API_BASE_URL}/dashboard/stats`, fetcher);
  const isValidating = isStatsValidating; // Simplify for UI

  // Extract Data safely
  const stats: DashboardStats | null = statsData?.success ? statsData.data : null;
  const activities: RecentActivity[] = activitiesData?.success ? activitiesData.data : [];
  const recommendations: Recommendations | null = recommendationsData?.success ? recommendationsData.data : null;
  const achievements: Achievements | null = achievementsData?.success ? achievementsData.data : null;

  const handleRefresh = () => {
    mutate(`${API_BASE_URL}/dashboard/stats`);
    mutate(`${API_BASE_URL}/dashboard/recent-activities`);
    mutate(`${API_BASE_URL}/dashboard/recommendations`);
    mutate(`${API_BASE_URL}/dashboard/achievements`);
  };

  // ... (getActivityIcon, getActivityColor, formatTimeAgo functions remain same) ...
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'grammar': return <BookOpen className="w-5 h-5" />;
      case 'vocabulary': return <GraduationCap className="w-5 h-5" />;
      case 'writing': return <PenTool className="w-5 h-5" />;
      case 'assessment': return <Award className="w-5 h-5" />;
      default: return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'bg-blue-100 text-blue-600';
      case 'vocabulary': return 'bg-green-100 text-green-600';
      case 'writing': return 'bg-purple-100 text-purple-600';
      case 'assessment': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
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

  // Show Skeleton while loading initial data
  if (isLoading && !stats) {
    return <DashboardSkeleton />;
  }

  if (!stats) return null;

  return (
    <>
      <Head>
        <title>대시보드 - 헝가리어 마스터</title>
      </Head>

      <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8 space-y-8">

        {/* 1. Hero Section: 위에서 아래로 쿵! */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-xl p-8 lg:p-12 group transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] animate-in slide-in-from-top-10 fade-in duration-700 ease-out">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Brain className="w-64 h-64 transform rotate-12" />
          </div>

          {/* Error Banner */}
          {isError && (
            <div className="relative z-20 mb-4 bg-red-500/20 border border-red-300/30 rounded-lg p-3 backdrop-blur-sm animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="flex items-center gap-2 text-red-100">
                <span className="text-lg">⚠️</span>
                <p className="text-sm font-medium">
                  데이터를 불러오는데 실패했습니다. (자동 재시도 중...)
                </p>
              </div>
            </div>
          )}

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-200 font-medium">
                <span className="animate-bounce">👋</span>
                <span>{greeting}, 김목사님</span>
              </div>

              {/* Refresh Button */}
              <Button
                onClick={handleRefresh}
                disabled={isValidating}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all"
              >
                {isValidating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    업데이트 중...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2 rotate-[-90deg]" />
                    새로고침
                  </>
                )}
              </Button>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              오늘도 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">헝가리어 정복</span>을<br />
              시작해볼까요?
            </h1>

            {recommendations && (
              <div className="mt-6 flex items-start gap-4 bg-white/10 backdrop-blur-md rounded-xl p-4 max-w-2xl border border-white/20 hover:bg-white/20 transition-colors cursor-default">
                <Sparkles className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-1">AI 튜터의 현실 자각 조언</p>
                  <p className="text-indigo-100">{recommendations.aiAdvice}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 2. Stats Grid: 왼쪽에서 순차적으로 착! 착! 착! */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 현재 레벨 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer animate-in slide-in-from-left-5 fade-in duration-500 delay-100 fill-mode-backwards">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Level Up</Badge>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">현재 레벨</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-3xl font-bold text-gray-900">{stats.currentLevel.level}</span>
              <span className="text-sm text-gray-400 mb-1.5">/ C2</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>다음 레벨 {stats.currentLevel.nextLevel}</span>
                <span className="font-bold text-blue-600">{stats.currentLevel.progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out group-hover:bg-blue-600"
                  style={{ width: `${stats.currentLevel.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* 연속 학습일 (Streak) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden animate-in slide-in-from-left-5 fade-in duration-500 delay-200 fill-mode-backwards">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
                <Flame className="w-6 h-6 text-orange-500 group-hover:animate-pulse" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1 relative z-10">연속 학습일</h3>
            <div className="flex items-end gap-2 relative z-10">
              <span className="text-3xl font-bold text-gray-900">{stats.streak}</span>
              <span className="text-sm text-gray-400 mb-1.5">일째 불태우는 중! 🔥</span>
            </div>
          </div>

          {/* 총 학습 시간 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer animate-in slide-in-from-left-5 fade-in duration-500 delay-300 fill-mode-backwards">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">총 학습 시간</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{Math.floor(stats.totalStudyTime / 60)}</span>
              <span className="text-sm text-gray-400 mb-1.5">시간 {stats.totalStudyTime % 60}분</span>
            </div>
          </div>

          {/* 보유 포인트 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer animate-in slide-in-from-left-5 fade-in duration-500 delay-500 fill-mode-backwards">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                <Trophy className="w-6 h-6 text-purple-600 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">보유 포인트</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">2,850</span>
              <span className="text-sm text-gray-400 mb-1.5">P</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3. Main Content (Left): 아래에서 위로 쑥! */}
          <div className="lg:col-span-2 space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-500 fill-mode-backwards">
            {/* 오늘의 목표 (Progress & Motivation) */}
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Target className="w-5 h-5 text-red-500" />
                    오늘의 전투 목표
                  </CardTitle>
                  <span className="text-sm text-gray-500">목표 달성까지 70%</span>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Goal Items with Hover Effects */}
                <div className="p-4 rounded-xl bg-gray-50 hover:bg-white hover:ring-2 hover:ring-blue-100 transition-all duration-200 cursor-pointer group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">레슨</span>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded border group-hover:text-blue-600">
                      {stats.dailyGoals.lessonsCompleted}/{stats.dailyGoals.lessonsTarget}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-1/3 group-hover:bg-blue-600 transition-colors" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 hover:bg-white hover:ring-2 hover:ring-green-100 transition-all duration-200 cursor-pointer group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">시간</span>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded border group-hover:text-green-600">
                      {stats.dailyGoals.studyMinutes}/{stats.dailyGoals.studyMinutesTarget}분
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-3/4 group-hover:bg-green-600 transition-colors" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 hover:bg-white hover:ring-2 hover:ring-purple-100 transition-all duration-200 cursor-pointer group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">단어</span>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded border group-hover:text-purple-600">
                      {stats.dailyGoals.vocabularyReviewed}/{stats.dailyGoals.vocabularyReviewTarget}개
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-1/2 group-hover:bg-purple-600 transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 추천 학습 (Big CTA) */}
            {recommendations && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <Badge className="mb-3 bg-indigo-500/20 text-indigo-200 border-indigo-500/30 hover:bg-indigo-500/30">
                      RECOMMENDED FOR YOU
                    </Badge>
                    <h3 className="text-2xl font-bold mb-2">{recommendations.nextLesson.title}</h3>
                    <p className="text-gray-400 max-w-md">{recommendations.nextLesson.reason}</p>

                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {recommendations.nextLesson.estimatedDuration}분
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" /> {recommendations.nextLesson.level}
                      </span>
                    </div>
                  </div>

                  <Link href={`/grammar/${recommendations.nextLesson.level.toLowerCase()}/${recommendations.nextLesson.id}`}>
                    <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 h-14 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 transform group-hover:scale-105">
                      지금 학습 시작 <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* 최근 활동 목록 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-lg text-gray-800">최근 활동 기록</h3>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">전체 보기</Button>
              </div>
              {activities.map((activity, idx) => (
                <div
                  key={activity.id}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md hover:scale-[1.005] transition-all duration-200 cursor-pointer"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                  {activity.score && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-mono">
                      {activity.score} 점
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Sidebar Content (Right): 오른쪽에서 왼쪽으로 샥! */}
          <div className="space-y-8 animate-in slide-in-from-right-10 fade-in duration-700 delay-700 fill-mode-backwards">
            {/* 영역별 분석 (Radar Chart style visual) */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-base text-gray-800">나의 전투력 분석</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {['grammar', 'vocabulary', 'writing', 'exercises'].map((area) => {
                  const data = stats.progressByArea[area as keyof typeof stats.progressByArea];
                  const labels = { grammar: '문법', vocabulary: '어휘', writing: '작문', exercises: '실전' };
                  const colors = { grammar: 'bg-blue-500', vocabulary: 'bg-green-500', writing: 'bg-purple-500', exercises: 'bg-orange-500' };

                  return (
                    <div key={area} className="group">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-600 group-hover:text-gray-900">
                          {labels[area as keyof typeof labels]}
                        </span>
                        <span className="font-bold text-gray-900">{data.percentage}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${colors[area as keyof typeof colors]} group-hover:brightness-110`}
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* 헝가리 명소 컬렉션 (Gamification) */}
            {achievements && (
              <Card className="border-none shadow-md overflow-hidden relative group cursor-pointer hover:shadow-xl transition-shadow duration-300">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10 pointer-events-none" />
                <div className="h-48 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596323630656-78b776269299?q=80&w=600&auto=format&fit=crop')" }}></div>

                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-1">CURRENT LOCATION</p>
                      <h3 className="text-xl font-bold">Budapest Parliament</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-yellow-400">3<span className="text-sm text-white/80">/6</span></span>
                    </div>
                  </div>
                  <div className="w-full bg-white/30 h-1.5 rounded-full backdrop-blur-sm overflow-hidden">
                    <div className="h-full bg-yellow-400 w-1/2" />
                  </div>
                  <p className="text-xs text-white/80 mt-2">다음 명소 '어부의 요새'까지 1,200P 남음</p>
                </div>
              </Card>
            )}

            {/* 약점 보완 (Weak Areas) */}
            {recommendations && recommendations.weakAreas.length > 0 && (
              <div className="bg-red-50 rounded-2xl p-6 border border-red-100 shimmer">
                <div className="flex items-center gap-2 mb-4 text-red-800">
                  <Heart className="w-5 h-5 animate-pulse" />
                  <h3 className="font-bold">약점 집중 공략</h3>
                </div>
                <div className="space-y-3">
                  {recommendations.weakAreas.map((area, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-800">{area.area}</span>
                        <span className="text-xs font-bold text-red-600">{area.score}점 (위험)</span>
                      </div>
                      <p className="text-xs text-gray-600">{area.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
