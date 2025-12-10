/**
 * 작문 연습 메인 페이지
 * 다양한 작문 유형 및 난이도별 연습
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
  PenTool,
  BookOpen,
  Mail,
  MessageSquare,
  FileText,
  Sparkles,
  Target,
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

// Mock 데이터
const mockStats = {
  totalWritings: 15,
  completedTasks: 8,
  averageScore: 85,
  streak: 4,
};

const writingCategories = [
  {
    id: 'sermon',
    title: '설교문 작성',
    description: '헝가리어 설교문을 작성하고 개선하세요',
    icon: BookOpen,
    color: 'purple',
    level: 'B1-B2',
    tasks: 12,
    completed: 5,
    href: '/writing/sermon',
    isPremium: false,
  },
  {
    id: 'diary',
    title: '일기 쓰기',
    description: '일상을 헝가리어로 기록하며 표현력을 키우세요',
    icon: PenTool,
    color: 'blue',
    level: 'A1-A2',
    tasks: 20,
    completed: 8,
    href: '/writing/diary',
    isPremium: false,
  },
  {
    id: 'letter',
    title: '편지 쓰기',
    description: '격식있는 편지와 이메일 작성 연습',
    icon: Mail,
    color: 'green',
    level: 'A2-B1',
    tasks: 15,
    completed: 3,
    href: '/writing/letter',
    isPremium: false,
  },
  {
    id: 'essay',
    title: '에세이 작성',
    description: '주제에 대한 의견을 논리적으로 전개하세요',
    icon: FileText,
    color: 'orange',
    level: 'B1-B2',
    tasks: 10,
    completed: 2,
    href: '/writing/essay',
    isPremium: true,
  },
];

const recentTasks = [
  {
    id: '1',
    type: '설교문',
    title: '사랑의 계명',
    level: 'B1',
    score: 88,
    feedback: '문법이 정확하고 신학적 표현이 적절합니다.',
    date: '2일 전',
    status: 'completed',
  },
  {
    id: '2',
    type: '일기',
    title: '오늘의 감사',
    level: 'A2',
    score: 92,
    feedback: '자연스러운 표현이 많이 사용되었습니다.',
    date: '4일 전',
    status: 'completed',
  },
  {
    id: '3',
    type: '편지',
    title: '초대 편지',
    level: 'A2',
    score: null,
    feedback: null,
    date: '진행 중',
    status: 'in_progress',
  },
];

const suggestedTopics = [
  {
    id: '1',
    category: '설교문',
    title: '용서와 화해',
    level: 'B1',
    duration: 45,
    tags: ['용서', '화해', '관계'],
  },
  {
    id: '2',
    category: '일기',
    title: '주말 활동',
    level: 'A1',
    duration: 15,
    tags: ['일상', '활동', '감정'],
  },
  {
    id: '3',
    category: '편지',
    title: '감사 편지',
    level: 'A2',
    duration: 20,
    tags: ['감사', '격식', '예의'],
  },
  {
    id: '4',
    category: '에세이',
    title: '현대 사회의 믿음',
    level: 'B2',
    duration: 60,
    tags: ['신앙', '사회', '논리'],
  },
];

type Category = 'all' | 'sermon' | 'diary' | 'letter' | 'essay';

const WritingPage = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'bg-purple-50 border-purple-200 hover:border-purple-400 hover:shadow-purple-100',
      blue: 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:shadow-blue-100',
      green: 'bg-green-50 border-green-200 hover:border-green-400 hover:shadow-green-100',
      orange: 'bg-orange-50 border-orange-200 hover:border-orange-400 hover:shadow-orange-100',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getProgressBarColor = (color: string) => {
    const colors = {
      purple: '[&>div]:bg-gradient-to-r [&>div]:from-purple-400 [&>div]:to-purple-600',
      blue: '[&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:to-green-600',
      green: '[&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-blue-600',
      orange: '[&>div]:bg-gradient-to-r [&>div]:from-orange-400 [&>div]:to-orange-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getBadgeColor = (color: string) => {
    const colors = {
      purple: 'bg-purple-100 text-purple-700',
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      orange: 'bg-orange-100 text-orange-700',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'text-green-600';
    if (status === 'in_progress') return 'text-orange-600';
    return 'text-gray-600';
  };

  const filteredTopics = activeCategory === 'all'
    ? suggestedTopics
    : suggestedTopics.filter(t => t.category === writingCategories.find(c => c.id === activeCategory)?.title);

  return (
    <>
      <Head>
        <title>작문 연습 | 헝가리어 학습 플랫폼</title>
        <meta name="description" content="헝가리어 작문 연습 - 설교문, 일기, 편지, 에세이" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            작문 연습 ✍️
          </h1>
          <p className="text-gray-600 text-lg">
            다양한 유형의 글쓰기로 표현력을 향상시키세요
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">전체 작문</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {mockStats.totalWritings}
                  </p>
                </div>
                <PenTool className="w-12 h-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">완료한 과제</p>
                  <p className="text-3xl font-bold text-green-900">
                    {mockStats.completedTasks}
                  </p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">평균 점수</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {mockStats.averageScore}점
                  </p>
                </div>
                <Award className="w-12 h-12 text-blue-400" />
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
                <Zap className="w-12 h-12 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 작문 유형 카드 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">작문 유형</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {writingCategories.map((category) => {
              const Icon = category.icon;
              const progress = (category.completed / category.tasks) * 100;

              return (
                <Card
                  key={category.id}
                  className={`transition-all duration-200 border-2 ${getColorClasses(category.color)} hover:shadow-xl`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${getBadgeColor(category.color)}`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">
                              {category.title}
                            </CardTitle>
                            {category.isPremium && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                                Premium
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-base mb-3">
                            {category.description}
                          </CardDescription>
                          <Badge variant="outline">{category.level}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* 진도 바 */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">진행 상황</span>
                          <span className="font-semibold text-gray-900">
                            {category.completed} / {category.tasks} 완료
                          </span>
                        </div>
                        <Progress value={progress} className={`h-2 ${getProgressBarColor(category.color)}`} />
                      </div>

                      {/* 액션 버튼 */}
                      <Link href={category.href}>
                        <Button variant="outline" className="w-full border-2" size="lg">
                          {category.completed > 0 ? '계속하기' : '시작하기'}
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

        {/* 최근 작문 & 추천 주제 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 최근 작문 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                최근 작문
              </CardTitle>
              <CardDescription>
                최근에 작성한 글들을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <Card key={task.id} className="border border-gray-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {task.type}
                            </Badge>
                            <Badge className={`text-xs ${
                              task.level === 'A1' ? 'bg-green-100 text-green-700' :
                              task.level === 'A2' ? 'bg-blue-100 text-blue-700' :
                              task.level === 'B1' ? 'bg-purple-100 text-purple-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {task.level}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {task.title}
                          </h4>
                          {task.status === 'completed' ? (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <Award className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-semibold text-gray-700">
                                  {task.score}점
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {task.feedback}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-orange-600 font-medium">
                              작성 중...
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {task.date}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 추천 주제 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                추천 주제
              </CardTitle>
              <CardDescription>
                당신의 레벨에 맞는 작문 주제를 추천합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as Category)}>
                <TabsList className="grid w-full grid-cols-5 mb-4">
                  <TabsTrigger value="all" className="text-xs">전체</TabsTrigger>
                  <TabsTrigger value="sermon" className="text-xs">설교</TabsTrigger>
                  <TabsTrigger value="diary" className="text-xs">일기</TabsTrigger>
                  <TabsTrigger value="letter" className="text-xs">편지</TabsTrigger>
                  <TabsTrigger value="essay" className="text-xs">에세이</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-3">
                {filteredTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {topic.category}
                          </Badge>
                          <Badge className={`text-xs ${
                            topic.level === 'A1' ? 'bg-green-100 text-green-700' :
                            topic.level === 'A2' ? 'bg-blue-100 text-blue-700' :
                            topic.level === 'B1' ? 'bg-purple-100 text-purple-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {topic.level}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {topic.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <Clock className="w-3 h-3" />
                          <span>{topic.duration}분 예상</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {topic.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
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
              <Target className="w-6 h-6 text-purple-600" />
              효과적인 작문 학습법
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-xl">✍️</span>
              <p className="flex-1">
                <strong>매일 조금씩:</strong> 하루 10-15분 짧은 작문으로 꾸준히 연습하세요.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">📖</span>
              <p className="flex-1">
                <strong>모범 예문 참고:</strong> 좋은 헝가리어 텍스트를 많이 읽고 문장 구조를 익히세요.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">🔄</span>
              <p className="flex-1">
                <strong>피드백 반영:</strong> AI가 제공하는 피드백을 꼼꼼히 읽고 다음 작문에 적용하세요.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">🎯</span>
              <p className="flex-1">
                <strong>레벨에 맞게:</strong> 현재 수준에 맞는 주제부터 시작해서 점진적으로 난이도를 높이세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default WritingPage;
