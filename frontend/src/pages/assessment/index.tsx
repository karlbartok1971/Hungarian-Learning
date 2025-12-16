/**
 * 레벨 평가 허브 페이지
 * 평가 시작과 이력 보기의 메인 허브
 */

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  History,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  Zap,
  BarChart3,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

// Mock 데이터 - 최근 평가 결과 요약
const mockRecentAssessment = {
  hasAssessment: true,
  date: '2024-12-01',
  level: 'B1',
  score: 78,
  improvement: '+13점',
  daysAgo: 4,
};

const mockStats = {
  totalAssessments: 3,
  currentLevel: 'B1',
  averageScore: 72,
  trend: 'up', // 'up', 'down', 'stable'
};

const AssessmentHubPage = () => {
  return (
    <>
      <Head>
        <title>레벨 평가 | 헝가리어 학습 플랫폼</title>
        <meta name="description" content="헝가리어 실력을 정확하게 측정하세요" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 py-10">

          {/* Hero Section */}
          <div className="mb-16 animate-in slide-in-from-top-8 fade-in duration-700">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 text-white p-12 lg:p-16 shadow-2xl group">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              </div>

              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge className="bg-white/20 text-white border-white/30 px-4 py-1.5 text-sm font-bold backdrop-blur-sm">
                    LEVEL ASSESSMENT
                  </Badge>
                  <Badge className="bg-yellow-400/90 text-yellow-900 border-yellow-500/30 px-4 py-1.5 text-sm font-bold">
                    {mockStats.currentLevel}
                  </Badge>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  레벨 <span className="text-yellow-300">평가</span> 🎯
                </h1>
                <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
                  정확한 실력 측정으로 맞춤 학습 경로를 제공받으세요
                </p>
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all hover:-translate-y-1 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100 fill-mode-backwards">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">총 평가 횟수</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {mockStats.totalAssessments}회
                    </p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all hover:-translate-y-1 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200 fill-mode-backwards">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">현재 레벨</p>
                    <p className="text-3xl font-bold text-purple-900">
                      {mockStats.currentLevel}
                    </p>
                  </div>
                  <Target className="w-12 h-12 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all hover:-translate-y-1 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300 fill-mode-backwards">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">평균 점수</p>
                    <p className="text-3xl font-bold text-green-900">
                      {mockStats.averageScore}점
                    </p>
                  </div>
                  <Award className="w-12 h-12 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all hover:-translate-y-1 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-500 fill-mode-backwards">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">성장 추세</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-orange-900" />
                      <p className="text-2xl font-bold text-orange-900">
                        상승
                      </p>
                    </div>
                  </div>
                  <Zap className="w-12 h-12 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 최근 평가 결과 (있을 경우) */}
          {mockRecentAssessment.hasAssessment && (
            <Card className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                  최근 평가 결과
                </CardTitle>
                <CardDescription>
                  가장 최근에 완료한 평가 요약
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <Calendar className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">평가 일시</p>
                    <p className="text-lg font-bold text-gray-900">{mockRecentAssessment.date}</p>
                    <p className="text-xs text-gray-500">{mockRecentAssessment.daysAgo}일 전</p>
                  </div>
                  <div className="text-center">
                    <Target className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">측정 레벨</p>
                    <Badge className="bg-purple-100 text-purple-700 text-lg px-4 py-1">
                      {mockRecentAssessment.level}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Award className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">점수</p>
                    <p className="text-lg font-bold text-gray-900">{mockRecentAssessment.score}점</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">이전 대비</p>
                    <p className="text-lg font-bold text-green-600">{mockRecentAssessment.improvement}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 메인 액션 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 새 평가 시작 */}
            <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-4 bg-blue-100 rounded-xl">
                    <Target className="w-12 h-12 text-blue-600" />
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm px-3 py-1">
                    추천
                  </Badge>
                </div>
                <CardTitle className="text-2xl">새 레벨 평가 시작</CardTitle>
                <CardDescription className="text-base">
                  현재 실력을 정확하게 측정하고 맞춤 학습 계획을 받아보세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>문법, 어휘, 독해, 듣기 종합 평가</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>약 20분 소요 (25문항)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>정확한 레벨 진단 및 약점 분석</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>개인화된 학습 경로 추천</span>
                  </div>
                </div>

                <Link href="/assessment/start">
                  <Button className="w-full" size="lg">
                    평가 시작하기
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <p className="text-xs text-gray-500 text-center">
                  마지막 평가 후 2주가 지나면 재평가를 권장합니다
                </p>
              </CardContent>
            </Card>

            {/* 평가 이력 보기 */}
            <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-4 bg-purple-100 rounded-xl">
                    <History className="w-12 h-12 text-purple-600" />
                  </div>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {mockStats.totalAssessments}개 기록
                  </Badge>
                </div>
                <CardTitle className="text-2xl">평가 이력 보기</CardTitle>
                <CardDescription className="text-base">
                  과거 평가 결과와 성장 추이를 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span>레벨 진행 추이 시각화</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span>영역별 상세 점수 분석</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span>성장률 및 개선 포인트 확인</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span>모든 평가 기록 열람</span>
                  </div>
                </div>

                <Link href="/assessment/history">
                  <Button variant="outline" className="w-full border-2" size="lg">
                    이력 확인하기
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <p className="text-xs text-gray-500 text-center">
                  평가 결과는 영구 보관되며 언제든 확인 가능합니다
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 평가 안내 */}
          <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-indigo-600" />
                레벨 평가가 중요한 이유
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-xl">🎯</span>
                <p className="flex-1">
                  <strong>정확한 실력 측정:</strong> 현재 레벨을 객관적으로 파악하여 학습 계획을 세울 수 있습니다.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xl">📊</span>
                <p className="flex-1">
                  <strong>약점 파악:</strong> 영역별 점수 분석으로 집중적으로 보완해야 할 부분을 알 수 있습니다.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xl">📈</span>
                <p className="flex-1">
                  <strong>성장 추적:</strong> 정기적인 평가로 학습 효과를 확인하고 동기부여를 얻을 수 있습니다.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xl">🗺️</span>
                <p className="flex-1">
                  <strong>맞춤 학습:</strong> 레벨에 맞는 콘텐츠와 학습 경로를 추천받아 효율적으로 학습할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AssessmentHubPage;
