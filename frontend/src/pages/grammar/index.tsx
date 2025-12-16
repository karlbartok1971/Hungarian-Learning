import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  Sparkles,
  Brain,
  Zap,
  TrendingUp
} from 'lucide-react';

const GrammarPage = () => {
  const grammarLevels = [
    {
      level: 'A1',
      title: 'A1 문법 (기초)',
      description: '헝가리어 기초 문법을 학습합니다',
      topics: 12,
      completed: 0,
      color: 'blue',
      href: '/grammar/a1',
      icon: BookOpen
    },
    {
      level: 'A2',
      title: 'A2 문법 (초중급)',
      description: '헝가리어 초중급 문법을 학습합니다',
      topics: 15,
      completed: 0,
      color: 'green',
      href: '/grammar/a2',
      icon: Target
    },
    {
      level: 'B1',
      title: 'B1 문법 (중급)',
      description: '헝가리어 중급 문법을 학습합니다',
      topics: 18,
      completed: 0,
      color: 'orange',
      href: '/grammar/b1',
      icon: Brain
    },
    {
      level: 'B2',
      title: 'B2 문법 (중고급)',
      description: '헝가리어 중고급 문법을 학습합니다',
      topics: 20,
      completed: 0,
      color: 'purple',
      href: '/grammar/b2',
      icon: Sparkles
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
      green: 'bg-green-50 border-green-200 hover:border-green-400',
      orange: 'bg-orange-50 border-orange-200 hover:border-orange-400',
      purple: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getBadgeColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      orange: 'bg-orange-100 text-orange-700',
      purple: 'bg-purple-100 text-purple-700',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <>
      <Head>
        <title>문법 학습 | 헝가리어 학습 플랫폼</title>
        <meta name="description" content="레벨별 헝가리어 문법 학습" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
        <div className="max-w-6xl mx-auto px-4 py-10">

          {/* Hero Section */}
          <div className="mb-16 animate-in slide-in-from-top-8 fade-in duration-700">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-teal-600 to-cyan-700 text-white p-12 lg:p-16 shadow-2xl group">
              {/* Decorative Background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              </div>

              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge className="bg-white/20 text-white border-white/30 px-4 py-1.5 text-sm font-bold backdrop-blur-sm">
                    GRAMMAR MASTER
                  </Badge>
                  <Badge className="bg-yellow-400/90 text-yellow-900 border-yellow-500/30 px-4 py-1.5 text-sm font-bold">
                    {grammarLevels.reduce((sum, l) => sum + l.topics, 0)} 주제
                  </Badge>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  체계적인 <span className="text-yellow-300">문법</span> 학습 📚
                </h1>
                <p className="text-lg text-green-100 max-w-2xl mx-auto mb-8">
                  레벨별로 구조화된 헝가리어 문법을 마스터하세요
                </p>

                {/* Quick Stats */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                    <BookOpen className="w-5 h-5 text-yellow-300" />
                    <span className="font-bold">65 주제</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                    <Zap className="w-5 h-5 text-green-300" />
                    <span className="font-bold">체계적 학습</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                    <TrendingUp className="w-5 h-5 text-blue-300" />
                    <span className="font-bold">단계별 진행</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grammar Level Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {grammarLevels.map((level, idx) => {
              const Icon = level.icon;
              const progress = Math.round((level.completed / level.topics) * 100);

              return (
                <Card
                  key={level.level}
                  className={`transition-all duration-300 border-2 ${getColorClasses(level.color)} hover:shadow-2xl hover:-translate-y-1 animate-in slide-in-from-bottom-4 fade-in duration-500 fill-mode-backwards`}
                  style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-2xl ${getBadgeColor(level.color)} transition-transform hover:scale-110 shadow-md`}>
                        <Icon className="w-10 h-10" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${getBadgeColor(level.color)} text-base px-3 py-1 font-bold`}>
                            {level.level}
                          </Badge>
                          <span className="text-sm font-medium text-gray-600">
                            {level.completed}/{level.topics} 완료
                          </span>
                        </div>
                        <CardTitle className="text-2xl font-bold mb-2">{level.title}</CardTitle>
                        <CardDescription className="text-base text-gray-600">{level.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-600">진행률</span>
                          <span className="font-bold text-gray-900">{progress}%</span>
                        </div>
                        <Progress
                          value={progress}
                          className="h-3 bg-gray-100 [\u0026>div]:transition-all [\u0026>div]:duration-1000"
                        />
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-white/60 p-3 rounded-xl border border-gray-100">
                          <BookOpen className="w-5 h-5 mx-auto text-gray-600 mb-1" />
                          <div className="text-xl font-bold text-gray-900">{level.topics}</div>
                          <div className="text-xs text-gray-600">주제</div>
                        </div>
                        <div className="bg-white/60 p-3 rounded-xl border border-gray-100">
                          <CheckCircle className="w-5 h-5 mx-auto text-green-600 mb-1" />
                          <div className="text-xl font-bold text-gray-900">{level.completed}</div>
                          <div className="text-xs text-gray-600">완료</div>
                        </div>
                        <div className="bg-white/60 p-3 rounded-xl border border-gray-100">
                          <Clock className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                          <div className="text-xl font-bold text-gray-900">0h</div>
                          <div className="text-xs text-gray-600">시간</div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link href={level.href}>
                        <Button
                          className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                          variant={level.completed > 0 ? "default" : "outline"}
                          size="lg"
                        >
                          {level.completed > 0 ? '계속하기' : '시작하기'}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Learning Guide */}
          <Card className="bg-gradient-to-r from-green-50 via-teal-50 to-cyan-50 border-2 border-green-200 shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-500 delay-500 fill-mode-backwards">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="w-6 h-6 text-green-600" />
                학습 가이드
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <span className="text-2xl">📖</span>
                <p className="flex-1">
                  <strong className="text-gray-900">체계적 구성:</strong> 각 레벨은 약 12-20개의 문법 주제로 구성되어 있습니다.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <span className="text-2xl">🎯</span>
                <p className="flex-1">
                  <strong className="text-gray-900">자유로운 학습:</strong> 순서대로 학습하는 것을 권장하지만, 자유롭게 선택할 수 있습니다.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <span className="text-2xl">✍️</span>
                <p className="flex-1">
                  <strong className="text-gray-900">실전 연습:</strong> 각 주제는 설명, 예문, 연습문제로 구성되어 있습니다.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <span className="text-2xl">✅</span>
                <p className="flex-1">
                  <strong className="text-gray-900">단계별 진행:</strong> 연습문제를 통과하면 다음 주제로 진행할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default GrammarPage;
