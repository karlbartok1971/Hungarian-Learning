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

// Mock 진도 데이터
const mockProgress = {
  A1: { learned: 48, total: 150, percentage: 32 },
  A2: { learned: 12, total: 200, percentage: 6 },
  B1: { learned: 0, total: 250, percentage: 0 },
  B2: { learned: 0, total: 300, percentage: 0 },
};

const mockStats = {
  totalLearned: 60,
  totalWords: 900,
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                어휘 학습 📚
              </h1>
              <p className="text-gray-600 text-lg">
                체계적인 어휘 학습으로 헝가리어 실력을 쌓아보세요
              </p>
            </div>
          </div>

          {/* 전체 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">학습한 단어</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {mockStats.totalLearned}
                    </p>
                  </div>
                  <BookOpen className="w-12 h-12 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">전체 진도</p>
                    <p className="text-3xl font-bold text-green-900">
                      {Math.round((mockStats.totalLearned / mockStats.totalWords) * 100)}%
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-400" />
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

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">정확도</p>
                    <p className="text-3xl font-bold text-purple-900">
                      {mockStats.accuracy}%
                    </p>
                  </div>
                  <Award className="w-12 h-12 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 레벨별 어휘 카드 */}
        <div className="space-y-6">
          {levels.map((levelData) => {
            const Icon = levelData.icon;
            const isLocked = levelData.progress.learned === 0 && levelData.level !== 'A1';

            return (
              <Card
                key={levelData.level}
                className={`transition-all duration-200 border-2 ${getColorClasses(levelData.color)} ${
                  isLocked ? 'opacity-60' : 'hover:shadow-xl'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-xl ${getBadgeColor(levelData.color)}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getBadgeColor(levelData.color)}>
                            {levelData.level}
                          </Badge>
                          <CardTitle className="text-2xl">
                            {levelData.title}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-base mb-4">
                          {levelData.description}
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {levelData.categories.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
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
                    {/* 진도 바 */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">학습 진도</span>
                        <span className="font-semibold text-gray-900">
                          {levelData.progress.learned} / {levelData.progress.total} 단어
                        </span>
                      </div>
                      <Progress value={levelData.progress.percentage} className="h-3" />
                    </div>

                    {/* 액션 버튼 */}
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
                            <Button className="w-full" size="lg">
                              <Play className="w-5 h-5 mr-2" />
                              {levelData.progress.learned > 0 ? '계속 학습하기' : '학습 시작'}
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                          </Link>
                          {levelData.progress.learned > 0 && (
                            <Button variant="outline" size="lg">
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

        {/* 학습 팁 */}
        <Card className="mt-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              어휘 학습 팁
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <p className="flex-1">
                <strong>매일 조금씩:</strong> 하루 10개씩 꾸준히 학습하면 한 달에 300개의 단어를 습득할 수 있어요!
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">🔄</span>
              <p className="flex-1">
                <strong>복습은 필수:</strong> 학습한 단어는 3일, 7일, 14일 후에 다시 복습하면 장기 기억으로 전환됩니다.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">📝</span>
              <p className="flex-1">
                <strong>예문으로 학습:</strong> 단어만 외우지 말고 예문을 통해 실제 사용법을 익히세요.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">🎯</span>
              <p className="flex-1">
                <strong>카테고리 집중:</strong> 관련된 단어들을 묶어서 학습하면 기억에 더 오래 남아요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VocabularyPage;
