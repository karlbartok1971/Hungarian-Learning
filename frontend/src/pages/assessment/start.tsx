/**
 * 레벨 평가 시작 페이지
 * 매력적인 UI로 사용자의 평가 참여 유도
 */

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  Clock,
  Award,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Info,
  TrendingUp,
  BookOpen,
  Zap,
  Star,
  ChevronLeft,
} from 'lucide-react';

const assessmentTypes = [
  {
    id: 'placement',
    title: '초기 레벨 테스트',
    description: '현재 헝가리어 실력을 정확하게 측정합니다',
    icon: Target,
    color: 'blue',
    duration: 20,
    questions: 25,
    features: [
      '문법, 어휘, 독해, 듣기 종합 평가',
      'A1부터 B2까지 정확한 레벨 진단',
      '개인화된 학습 경로 추천',
      '상세한 강점/약점 분석',
    ],
    difficulty: '전체 레벨',
  },
  {
    id: 'quick',
    title: '빠른 레벨 체크',
    description: '10분 만에 빠르게 현재 수준을 확인합니다',
    icon: Zap,
    color: 'green',
    duration: 10,
    questions: 15,
    features: [
      '핵심 문법과 어휘만 평가',
      '빠른 결과 확인',
      '대략적인 레벨 파악',
      '즉시 학습 시작 가능',
    ],
    difficulty: '간편 테스트',
  },
  {
    id: 'specialized',
    title: '설교 특화 평가',
    description: '설교문 작성에 필요한 실력을 평가합니다',
    icon: BookOpen,
    color: 'purple',
    duration: 30,
    questions: 20,
    features: [
      '신학 용어 및 종교 어휘 평가',
      '설교문 독해 및 작문 능력 측정',
      '예문 번역 및 해석 테스트',
      '맞춤형 설교 학습 경로 제공',
    ],
    difficulty: 'B1-B2',
  },
];

const benefits = [
  {
    icon: Target,
    title: '정확한 레벨 진단',
    description: 'AI 기반 평가로 당신의 정확한 헝가리어 수준을 파악합니다',
  },
  {
    icon: TrendingUp,
    title: '맞춤형 학습 경로',
    description: '평가 결과를 바탕으로 최적화된 학습 계획을 제공합니다',
  },
  {
    icon: Award,
    title: '강점/약점 분석',
    description: '어떤 부분이 강하고 어떤 부분을 보완해야 하는지 명확하게 알려드립니다',
  },
  {
    icon: Sparkles,
    title: '실시간 피드백',
    description: '각 문제마다 즉각적인 피드백으로 학습 효과를 극대화합니다',
  },
];

const AssessmentStartPage = () => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:shadow-blue-100',
      green: 'bg-green-50 border-green-200 hover:border-green-400 hover:shadow-green-100',
      purple: 'bg-purple-50 border-purple-200 hover:border-purple-400 hover:shadow-purple-100',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getBadgeColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const handleStartAssessment = (type: string) => {
    // assessment/index.tsx로 타입 전달하며 이동
    router.push(`/assessment?type=${type}`);
  };

  return (
    <>
      <Head>
        <title>레벨 평가 | 헝가리어 학습 플랫폼</title>
        <meta name="description" content="헝가리어 실력을 정확하게 측정하고 맞춤형 학습을 시작하세요" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 뒤로가기 */}
        <Link href="/assessment">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="w-4 h-4 mr-2" />
            평가 홈으로
          </Button>
        </Link>

        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            레벨 평가 🎯
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            당신의 헝가리어 실력을 정확하게 측정하고<br />
            최적화된 학습 경로를 시작하세요
          </p>
        </div>

        {/* 평가 유형 선택 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            평가 유형을 선택하세요
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assessmentTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;

              return (
                <Card
                  key={type.id}
                  className={`transition-all duration-200 border-2 cursor-pointer ${
                    isSelected
                      ? 'ring-4 ring-blue-200 border-blue-500 shadow-xl'
                      : getColorClasses(type.color)
                  } hover:shadow-xl`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-4 rounded-xl ${getBadgeColor(type.color)}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">
                      {type.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {type.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* 평가 정보 */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{type.duration}분</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <BookOpen className="w-4 h-4" />
                          <span>{type.questions}문제</span>
                        </div>
                      </div>

                      <Badge variant="outline" className="w-full justify-center">
                        {type.difficulty}
                      </Badge>

                      {/* 특징 */}
                      <div className="space-y-2">
                        {type.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* 시작 버튼 */}
                      <Button
                        className="w-full mt-4"
                        size="lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartAssessment(type.id);
                        }}
                        disabled={!isSelected}
                      >
                        {isSelected ? '평가 시작하기' : '선택하기'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 평가의 장점 */}
        <Card className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              왜 레벨 평가가 중요한가요?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 평가 진행 방식 */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Info className="w-6 h-6 text-blue-600" />
              평가 진행 방식
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">평가 유형 선택</h3>
                <p className="text-sm text-gray-600">
                  목적에 맞는 평가를 선택하세요
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">문제 풀이</h3>
                <p className="text-sm text-gray-600">
                  편안한 마음으로 차근차근 풀어보세요
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">결과 확인</h3>
                <p className="text-sm text-gray-600">
                  상세한 분석 결과를 받아보세요
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">학습 시작</h3>
                <p className="text-sm text-gray-600">
                  맞춤형 학습 경로로 바로 시작!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ & 팁 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                평가 팁
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <p>조용하고 집중할 수 있는 환경에서 평가를 시작하세요</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">⏰</span>
                <p>충분한 시간 여유를 두고 편안한 마음으로 응시하세요</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">🎯</span>
                <p>모르는 문제도 추측해서 답하는 것이 좋습니다</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">📱</span>
                <p>평가 중에는 다른 자료를 참고하지 마세요</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                자주 묻는 질문
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  평가를 다시 볼 수 있나요?
                </h4>
                <p className="text-gray-600">
                  네, 언제든지 재평가가 가능합니다. 학습 후 실력 향상을 확인해보세요!
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  평가 비용이 있나요?
                </h4>
                <p className="text-gray-600">
                  초기 레벨 테스트와 빠른 레벨 체크는 무료입니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  결과를 PDF로 받을 수 있나요?
                </h4>
                <p className="text-gray-600">
                  네, 평가 완료 후 상세한 결과를 PDF로 다운로드할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AssessmentStartPage;
