/**
 * 학습 분석 페이지
 * 학습 진도, 성과, 약점 분석
 */

import React, { useState } from 'react';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Trophy,
  Award,
  BookOpen,
  PenTool,
  Zap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Flame,
  Star,
} from 'lucide-react';

// Mock 데이터
const mockStats = {
  totalStudyTime: 48, // 시간
  lessonsCompleted: 67,
  averageScore: 87,
  currentStreak: 12,
  longestStreak: 21,
  totalPoints: 3450,
  currentLevel: 'B1',
  nextLevelProgress: 72,
};

const weeklyData = [
  { day: '월', hours: 2.5, completed: 8 },
  { day: '화', hours: 1.8, completed: 5 },
  { day: '수', hours: 3.2, completed: 10 },
  { day: '목', hours: 2.1, completed: 7 },
  { day: '금', hours: 2.9, completed: 9 },
  { day: '토', hours: 4.5, completed: 12 },
  { day: '일', hours: 3.8, completed: 11 },
];

const skillProgress = [
  { skill: '문법', level: 'B1', progress: 78, trend: 'up', change: '+12%' },
  { skill: '어휘', level: 'B1', progress: 85, trend: 'up', change: '+8%' },
  { skill: '작문', level: 'A2', progress: 62, trend: 'up', change: '+15%' },
  { skill: '듣기', level: 'A2', progress: 55, trend: 'down', change: '-3%' },
];

const weaknesses = [
  {
    category: '격변화',
    accuracy: 65,
    totalAttempts: 45,
    needsPractice: true,
    suggestion: '격변화 연습 문제를 더 풀어보세요',
  },
  {
    category: '동사 활용',
    accuracy: 72,
    totalAttempts: 38,
    needsPractice: true,
    suggestion: '과거 시제 동사 활용 집중 학습',
  },
  {
    category: '종교 용어',
    accuracy: 58,
    totalAttempts: 22,
    needsPractice: true,
    suggestion: '설교 관련 어휘 추가 학습 필요',
  },
];

const achievements = [
  { date: '2024-12-01', title: '7일 연속 학습', points: 100 },
  { date: '2024-11-28', title: '50개 레슨 완료', points: 200 },
  { date: '2024-11-25', title: 'B1 레벨 달성', points: 500 },
  { date: '2024-11-20', title: '90점 이상 10회', points: 150 },
];

const monthlyGoals = [
  { goal: '100개 레슨 완료하기', current: 67, target: 100, progress: 67 },
  { goal: '40시간 학습하기', current: 48, target: 40, progress: 100 },
  { goal: 'B2 레벨 달성하기', current: 72, target: 100, progress: 72 },
];

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const maxHours = Math.max(...weeklyData.map(d => d.hours));

  return (
    <>
      <Head>
        <title>학습 분석 | 헝가리어 학습 플랫폼</title>
        <meta name="description" content="학습 진도 분석 및 통계" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            학습 분석 📊
          </h1>
          <p className="text-gray-600 text-lg">
            당신의 학습 여정을 데이터로 확인하세요
          </p>
        </div>

        {/* 핵심 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">총 학습 시간</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {mockStats.totalStudyTime}h
                  </p>
                </div>
                <Clock className="w-12 h-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">완료 레슨</p>
                  <p className="text-3xl font-bold text-green-900">
                    {mockStats.lessonsCompleted}
                  </p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">평균 점수</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {mockStats.averageScore}점
                  </p>
                </div>
                <Trophy className="w-12 h-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">연속 학습</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {mockStats.currentStreak}일
                  </p>
                </div>
                <Flame className="w-12 h-12 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 레벨 진행 상황 */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-indigo-900">
                  {mockStats.currentLevel}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">현재 레벨</p>
                  <p className="text-sm text-gray-600">B2까지 {100 - mockStats.nextLevelProgress}% 남음</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-indigo-600">{mockStats.totalPoints}</p>
                <p className="text-sm text-gray-600">총 포인트</p>
              </div>
            </div>
            <Progress value={mockStats.nextLevelProgress} className="h-4" />
          </CardContent>
        </Card>

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">주간 활동</TabsTrigger>
            <TabsTrigger value="skills">실력 분석</TabsTrigger>
            <TabsTrigger value="weakness">약점 보완</TabsTrigger>
            <TabsTrigger value="goals">목표 달성</TabsTrigger>
          </TabsList>

          {/* 주간 활동 */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  이번 주 학습 활동
                </CardTitle>
                <CardDescription>
                  일별 학습 시간과 완료한 레슨 수
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {weeklyData.map((day, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 w-8">
                          {day.day}
                        </span>
                        <div className="flex-1 mx-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${(day.hours / maxHours) * 100}%` }}
                              >
                                <span className="text-white text-xs font-semibold">
                                  {day.hours}h
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                            {day.completed}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">훌륭해요!</p>
                      <p className="text-sm text-blue-700">
                        이번 주 평균 2.8시간 학습했습니다. 지난 주보다 18% 증가했어요!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 실력 분석 */}
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-purple-600" />
                  영역별 실력 분석
                </CardTitle>
                <CardDescription>
                  각 학습 영역의 현재 수준과 발전 추이
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {skillProgress.map((skill, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{skill.skill}</h3>
                          <Badge className="bg-blue-100 text-blue-700">
                            {skill.level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {skill.trend === 'up' ? (
                            <ArrowUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-sm font-semibold ${
                            skill.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {skill.change}
                          </span>
                        </div>
                      </div>
                      <Progress value={skill.progress} className="h-3" />
                      <p className="text-sm text-gray-500">{skill.progress}% 완료</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 약점 보완 */}
          <TabsContent value="weakness">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                  집중 학습이 필요한 영역
                </CardTitle>
                <CardDescription>
                  정답률이 낮은 부분을 보완하여 실력을 향상시키세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weaknesses.map((weakness, idx) => (
                    <Card key={idx} className="border-l-4 border-l-orange-400">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {weakness.category}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>정답률: {weakness.accuracy}%</span>
                              <span>시도 횟수: {weakness.totalAttempts}회</span>
                            </div>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700">
                            개선 필요
                          </Badge>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-orange-800">
                            💡 {weakness.suggestion}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          <BookOpen className="w-4 h-4 mr-2" />
                          관련 학습 자료 보기
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 목표 달성 */}
          <TabsContent value="goals">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                    이번 달 목표
                  </CardTitle>
                  <CardDescription>
                    설정한 목표를 향해 꾸준히 나아가세요!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {monthlyGoals.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{item.goal}</h3>
                          <span className="text-sm font-bold text-gray-700">
                            {item.current} / {item.target}
                          </span>
                        </div>
                        <Progress value={item.progress} className="h-3" />
                        {item.progress >= 100 && (
                          <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            목표 달성! 축하합니다! 🎉
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-purple-600" />
                    최근 획득한 업적
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.map((achievement, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Star className="w-5 h-5 text-yellow-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                            <p className="text-xs text-gray-500">{achievement.date}</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-400 text-yellow-900">
                          +{achievement.points} 포인트
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* 인사이트 */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-600" />
              AI 학습 인사이트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-xl">🎯</span>
              <p className="flex-1">
                <strong>집중 학습 시간:</strong> 오후 7-9시에 가장 높은 집중력을 보입니다.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">📊</span>
              <p className="flex-1">
                <strong>약점 보완:</strong> 격변화 연습을 3일 연속으로 진행하면 90% 이상 숙달 가능합니다.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">🏆</span>
              <p className="flex-1">
                <strong>목표 달성 예측:</strong> 현재 페이스라면 B2 레벨에 약 45일 후 도달 예상입니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AnalyticsPage;
