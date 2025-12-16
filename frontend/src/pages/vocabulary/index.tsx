/**
 * 어휘 학습 메인 페이지
 * 레벨별 어휘 학습 섹션 선택
 */

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Play,
  Target,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Book,
  Heart,
  Zap
} from 'lucide-react';

import { WordOfTheDayCard } from '@/components/vocabulary/WordOfTheDayCard';
import { StatsCards } from '@/components/vocabulary/StatsCards';

// Mock 진도 데이터 (Unlocked for Demo)
const mockProgress = {
  A1: { learned: 48, total: 500, percentage: 10 },
  A2: { learned: 12, total: 800, percentage: 2 },
  B1: { learned: 0, total: 1200, percentage: 0 },
  B2: { learned: 0, total: 1500, percentage: 0 },
};

const mockStats = {
  totalLearned: 60,
  totalWords: 4000,
  streak: 5, // 연속 학습 일수
  accuracy: 85,
};

const VocabularyPage = () => {
  const levels = [
    {
      level: 'A1',
      title: '기초 어휘',
      description: '일상생활에서 가장 많이 사용하는 필수 단어',
      color: 'blue',
      icon: Book,
      href: '/vocabulary/a1',
      progress: mockProgress.A1,
      categories: ['일상', '인사', '숫자', '시간'],
    },
    {
      level: 'A2',
      title: '초급 어휘',
      description: '친숙한 주제의 기본 표현과 단어',
      color: 'green',
      icon: Sparkles,
      href: '/vocabulary/a2',
      progress: mockProgress.A2,
      categories: ['가족', '음식', '쇼핑', '날씨'],
    },
    {
      level: 'B1',
      title: '중급 어휘',
      description: '업무와 학습에 필요한 실용 어휘',
      color: 'purple',
      icon: Target,
      href: '/vocabulary/b1',
      progress: mockProgress.B1,
      categories: ['직업', '교육', '여행', '취미'],
    },
    {
      level: 'B2',
      title: '고급 어휘',
      description: '설교와 글쓰기를 위한 전문 표현',
      color: 'orange',
      icon: Award,
      href: '/vocabulary/b2',
      progress: mockProgress.B2,
      categories: ['신학', '추상개념', '논리', '수사'],
    },
  ];

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
        <title>어휘 학습 | 헝가리어 학습 플랫폼</title>
        <meta name="description" content="레벨별 헝가리어 어휘 학습" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <div className="max-w-6xl mx-auto px-4 py-10">

          {/* Hero Section with Animation */}
          <div className="mb-16 animate-in slide-in-from-top-8 fade-in duration-700">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-12 lg:p-16 shadow-2xl group">
              {/* Decorative Background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              </div>

              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge className="bg-white/20 text-white border-white/30 px-4 py-1.5 text-sm font-bold backdrop-blur-sm">
                    VOCABULARY MASTER
                  </Badge>
                  <Badge className="bg-yellow-400/90 text-yellow-900 border-yellow-500/30 px-4 py-1.5 text-sm font-bold">
                    {mockStats.totalLearned} / {mockStats.totalWords} 단어
                  </Badge>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  매일 성장하는 <span className="text-yellow-300">어휘력</span> 📈
                </h1>
                <p className="text-lg text-indigo-100 max-w-2xl mx-auto mb-8">
                  하루 한 단어부터 차근차근, 헝가리어 마스터를 향한 여정을 시작하세요.
                </p>

                {/* Quick Stats */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    <span className="font-bold">{mockStats.streak}일 연속</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                    <Target className="w-5 h-5 text-green-300" />
                    <span className="font-bold">{mockStats.accuracy}% 정확도</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                    <TrendingUp className="w-5 h-5 text-blue-300" />
                    <span className="font-bold">상승세</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Word of the Day */}
          <div className="mb-12 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100 fill-mode-backwards">
            <WordOfTheDayCard />
          </div>

          {/* Stats Cards */}
          <div className="mb-12 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200 fill-mode-backwards">
            <StatsCards stats={mockStats} />
          </div>

          {/* Level Cards with Staggered Animation */}
          <div className="space-y-6">
            {levels.map((levelData, idx) => {
              const Icon = levelData.icon;
              const isLocked = false;

              return (
                <Card
                  key={levelData.level}
                  className={`transition-all duration-300 border-2 ${getColorClasses(levelData.color)} ${isLocked ? 'opacity-60' : 'hover:shadow-2xl hover:-translate-y-1'
                    } animate-in slide-in-from-left-8 fade-in duration-500 fill-mode-backwards`}
                  style={{ animationDelay: `${(idx + 3) * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-4 rounded-2xl ${getBadgeColor(levelData.color)} transition-transform group-hover:scale-110 shadow-md`}>
                          <Icon className="w-10 h-10" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={`${getBadgeColor(levelData.color)} text-base px-3 py-1 font-bold`}>
                              {levelData.level}
                            </Badge>
                            <CardTitle className="text-2xl font-bold">
                              {levelData.title}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-base mb-4 text-gray-600">
                            {levelData.description}
                          </CardDescription>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {levelData.categories.map((category) => (
                              <Badge key={category} variant="outline" className="text-xs font-medium">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress Bar with Animation */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 font-medium">학습 진도</span>
                          <span className="font-bold text-gray-900">
                            {levelData.progress.learned} / {levelData.progress.total} 단어
                          </span>
                        </div>
                        <Progress
                          value={levelData.progress.percentage}
                          className="h-3 bg-gray-100 [\u0026>div]:transition-all [\u0026>div]:duration-1000"
                        />
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>시작</span>
                          <span className="font-bold">{levelData.progress.percentage}%</span>
                          <span>완료</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        {isLocked ? (
                          <Button
                            disabled
                            variant="outline"
                            className="flex-1"
                          >
                            🔒 이전 레벨을 먼저 완료하세요
                          </Button>
                        ) : (
                          <>
                            <Link href={levelData.href} className="flex-1">
                              <Button className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5" size="lg">
                                <Play className="w-5 h-5 mr-2" />
                                {levelData.progress.learned > 0 ? '계속 학습하기' : '학습 시작'}
                                <ArrowRight className="w-5 h-5 ml-2" />
                              </Button>
                            </Link>
                            {levelData.progress.learned > 0 && (
                              <Button variant="outline" size="lg" className="h-12 px-6 border-2 hover:bg-gray-50">
                                <Heart className="w-5 h-5 mr-2" />
                                복습하기
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Learning Tips */}
          <Card className="mt-12 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-500 delay-700 fill-mode-backwards">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-6 h-6 text-purple-600" />
                어휘 학습 팁
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <span className="text-2xl">💡</span>
                <p className="flex-1">
                  <strong className="text-gray-900">매일 조금씩:</strong> 하루 10개씩 꾸준히 학습하면 한 달에 300개의 단어를 습득할 수 있어요!
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <span className="text-2xl">🔄</span>
                <p className="flex-1">
                  <strong className="text-gray-900">복습은 필수:</strong> 학습한 단어는 3일, 7일, 14일 후에 다시 복습하면 장기 기억으로 전환됩니다.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <span className="text-2xl">📝</span>
                <p className="flex-1">
                  <strong className="text-gray-900">예문으로 학습:</strong> 단어만 외우지 말고 예문을 통해 실제 사용법을 익히세요.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <span className="text-2xl">🎯</span>
                <p className="flex-1">
                  <strong className="text-gray-900">카테고리 집중:</strong> 관련된 단어들을 묶어서 학습하면 기억에 더 오래 남아요.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default VocabularyPage;
