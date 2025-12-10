/**
 * 종합 연습 메인 페이지
 * 문법, 어휘, 듣기, 작문 종합 연습
 */

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  FileText,
  Mic,
  PenTool,
  Play,
  Trophy,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  Star,
  TrendingUp,
  Award,
  Flame,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

// Mock 데이터
const mockStats = {
  totalCompleted: 145,
  accuracy: 87,
  streak: 7,
  points: 2340,
  level: 'B1',
  nextLevelProgress: 65,
};

const exerciseTypes = [
  {
    id: 'grammar',
    title: '문법 퀴즈',
    description: '문법 규칙과 활용을 테스트합니다',
    icon: BookOpen,
    color: 'blue',
    total: 120,
    completed: 45,
    href: '/exercises/grammar',
    difficulty: 'A1-B2',
    avgTime: '5분',
  },
  {
    id: 'vocabulary',
    title: '어휘 테스트',
    description: '단어와 표현 암기를 확인합니다',
    icon: FileText,
    color: 'green',
    total: 200,
    completed: 68,
    href: '/exercises/vocabulary',
    difficulty: 'A1-B2',
    avgTime: '3분',
  },
  {
    id: 'listening',
    title: '듣기 연습',
    description: '헝가리어 듣기 이해력을 향상시킵니다',
    icon: Mic,
    color: 'purple',
    total: 80,
    completed: 22,
    href: '/exercises/listening',
    difficulty: 'A2-B2',
    avgTime: '7분',
  },
  {
    id: 'mixed',
    title: '종합 문제',
    description: '문법, 어휘, 독해를 통합 테스트합니다',
    icon: Target,
    color: 'orange',
    total: 50,
    completed: 10,
    href: '/exercises/mixed',
    difficulty: 'B1-B2',
    avgTime: '10분',
  },
];

const dailyChallenges = [
  {
    id: '1',
    title: '오늘의 문법 도전',
    type: '문법',
    questions: 10,
    points: 50,
    timeLimit: '5분',
    completed: false,
    difficulty: 'A2',
  },
  {
    id: '2',
    title: '빠른 어휘 테스트',
    type: '어휘',
    questions: 20,
    points: 100,
    timeLimit: '3분',
    completed: true,
    difficulty: 'B1',
  },
  {
    id: '3',
    title: '듣기 챌린지',
    type: '듣기',
    questions: 5,
    points: 75,
    timeLimit: '7분',
    completed: false,
    difficulty: 'B1',
  },
];

const recentActivities = [
  {
    id: '1',
    type: '문법 퀴즈',
    title: '격변화 연습',
    score: 90,
    date: '2시간 전',
    level: 'B1',
  },
  {
    id: '2',
    type: '어휘 테스트',
    title: '종교 용어',
    score: 85,
    date: '1일 전',
    level: 'B2',
  },
  {
    id: '3',
    type: '종합 문제',
    title: '일상 대화',
    score: 92,
    date: '2일 전',
    level: 'A2',
  },
];

const achievements = [
  { icon: '🔥', title: '7일 연속', description: '꾸준한 학습' },
  { icon: '🎯', title: '100문제 돌파', description: '문제 해결사' },
  { icon: '⭐', title: '90점 이상', description: '고득점 달성' },
  { icon: '🏆', title: 'B1 레벨', description: '중급 진입' },
];

const ExercisesPage = () => {
  const [activeTab, setActiveTab] = useState('all');

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:shadow-blue-100',
      green: 'bg-green-50 border-green-200 hover:border-green-400 hover:shadow-green-100',
      purple: 'bg-purple-50 border-purple-200 hover:border-purple-400 hover:shadow-purple-100',
      orange: 'bg-orange-50 border-orange-200 hover:border-orange-400 hover:shadow-orange-100',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getBadgeColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      orange: 'bg-orange-100 text-orange-700',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <>
      <Head>
        <title>종합 연습 | 헝가리어 학습 플랫폼</title>
        <meta name="description" content="헝가리어 종합 연습 문제" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            종합 연습 💪
          </h1>
          <p className="text-gray-600 text-lg">
            다양한 유형의 연습으로 실력을 탄탄하게!
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">완료 문제</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {mockStats.totalCompleted}
                  </p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">정답률</p>
                  <p className="text-3xl font-bold text-green-900">
                    {mockStats.accuracy}%
                  </p>
                </div>
                <Trophy className="w-12 h-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">연속 학습</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {mockStats.streak}일
                  </p>
                </div>
                <Flame className="w-12 h-12 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">포인트</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {mockStats.points}
                  </p>
                </div>
                <Star className="w-12 h-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 레벨 진행 상황 */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-indigo-900">
                  {mockStats.level}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">현재 레벨</p>
                  <p className="text-xs text-gray-500">다음 레벨까지 35% 남음</p>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-600" />
            </div>
            <Progress value={mockStats.nextLevelProgress} className="h-3" />
          </CardContent>
        </Card>

        {/* 오늘의 챌린지 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  오늘의 챌린지
                </CardTitle>
                <CardDescription>
                  매일 새로운 도전으로 포인트를 획득하세요!
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dailyChallenges.map((challenge) => (
                <Card
                  key={challenge.id}
                  className={`border-2 ${
                    challenge.completed
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'border-yellow-200 hover:shadow-lg cursor-pointer'
                  }`}
                >
                  <CardContent className="pt-6">
                    {challenge.completed && (
                      <Badge className="mb-2 bg-green-500">완료 ✓</Badge>
                    )}
                    <h3 className="font-bold text-gray-900 mb-2">
                      {challenge.title}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">유형</span>
                        <Badge variant="outline">{challenge.type}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">문제 수</span>
                        <span className="font-semibold">{challenge.questions}개</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">제한 시간</span>
                        <span className="font-semibold">{challenge.timeLimit}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">보상</span>
                        <span className="font-bold text-yellow-600">
                          +{challenge.points} 포인트
                        </span>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      disabled={challenge.completed}
                      size="sm"
                    >
                      {challenge.completed ? '완료됨' : '도전하기'}
                      {!challenge.completed && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 연습 유형 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">연습 유형</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exerciseTypes.map((exercise) => {
              const Icon = exercise.icon;
              const progress = (exercise.completed / exercise.total) * 100;

              return (
                <Card
                  key={exercise.id}
                  className={`transition-all duration-200 border-2 ${getColorClasses(exercise.color)} hover:shadow-xl`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${getBadgeColor(exercise.color)}`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {exercise.title}
                          </CardTitle>
                          <CardDescription className="text-base mb-3">
                            {exercise.description}
                          </CardDescription>
                          <div className="flex gap-2">
                            <Badge variant="outline">{exercise.difficulty}</Badge>
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {exercise.avgTime}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">진행 상황</span>
                          <span className="font-semibold text-gray-900">
                            {exercise.completed} / {exercise.total}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <Link href={exercise.href}>
                        <Button className="w-full" size="lg">
                          <Play className="w-5 h-5 mr-2" />
                          {exercise.completed > 0 ? '계속하기' : '시작하기'}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 최근 활동 & 업적 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 최근 활동 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                최근 활동
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                        <Badge className={`text-xs ${
                          activity.level === 'A1' || activity.level === 'A2'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {activity.level}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      <span className="text-xl font-bold text-gray-900">
                        {activity.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 업적 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                획득한 업적
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement, idx) => (
                  <div
                    key={idx}
                    className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg"
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {achievement.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 학습 팁 */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6 text-purple-600" />
              연습 학습 팁
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-xl">🎯</span>
              <p className="flex-1">
                <strong>매일 조금씩:</strong> 오늘의 챌린지를 매일 완료하면 연속 학습 스트리크를 유지할 수 있어요!
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">📊</span>
              <p className="flex-1">
                <strong>약점 파악:</strong> 틀린 문제는 다시 풀어보며 약점을 보완하세요.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">⏱️</span>
              <p className="flex-1">
                <strong>시간 관리:</strong> 제한 시간 내에 풀면서 실전 감각을 키우세요.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">🏆</span>
              <p className="flex-1">
                <strong>포인트 수집:</strong> 포인트를 모아 새로운 학습 자료를 언락하세요!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ExercisesPage;
