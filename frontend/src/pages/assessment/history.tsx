/**
 * 평가 이력 페이지
 * 과거 레벨 평가 결과 및 진행 추이
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  TrendingUp,
  Trophy,
  Calendar,
  Award,
  Download,
  Eye,
  Target,
  BarChart3,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Clock,
  FileText,
} from 'lucide-react';

// Mock 데이터
const mockHistory = [
  {
    id: '1',
    date: '2024-12-01',
    type: '초기 레벨 테스트',
    level: 'B1',
    score: 78,
    totalQuestions: 25,
    correctAnswers: 19,
    duration: '18분',
    areas: [
      { name: '문법', score: 82 },
      { name: '어휘', score: 85 },
      { name: '독해', score: 75 },
      { name: '듣기', score: 70 },
    ],
  },
  {
    id: '2',
    date: '2024-11-15',
    type: '빠른 레벨 체크',
    level: 'A2',
    score: 72,
    totalQuestions: 15,
    correctAnswers: 11,
    duration: '9분',
    areas: [
      { name: '문법', score: 75 },
      { name: '어휘', score: 80 },
      { name: '독해', score: 68 },
    ],
  },
  {
    id: '3',
    date: '2024-11-01',
    type: '초기 레벨 테스트',
    level: 'A2',
    score: 65,
    totalQuestions: 25,
    correctAnswers: 16,
    duration: '22분',
    areas: [
      { name: '문법', score: 60 },
      { name: '어휘', score: 70 },
      { name: '독해', score: 65 },
      { name: '듣기', score: 65 },
    ],
  },
];

const levelProgression = [
  { date: '2024-11-01', level: 'A2', score: 65 },
  { date: '2024-11-15', level: 'A2', score: 72 },
  { date: '2024-12-01', level: 'B1', score: 78 },
];

const AssessmentHistoryPage = () => {
  const router = useRouter();
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);

  const getLevelColor = (level: string) => {
    const colors = {
      A1: 'bg-green-100 text-green-700',
      A2: 'bg-blue-100 text-blue-700',
      B1: 'bg-purple-100 text-purple-700',
      B2: 'bg-orange-100 text-orange-700',
    };
    return colors[level as keyof typeof colors] || colors.A1;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-orange-600';
  };

  const latestAssessment = mockHistory[0];
  const improvement = latestAssessment.score - mockHistory[mockHistory.length - 1].score;

  return (
    <>
      <Head>
        <title>평가 이력 | 헝가리어 학습 플랫폼</title>
        <meta name="description" content="레벨 평가 이력 및 성장 추이" />
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            평가 이력 📈
          </h1>
          <p className="text-gray-600 text-lg">
            당신의 성장 과정을 확인하세요
          </p>
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">총 평가 횟수</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {mockHistory.length}회
                  </p>
                </div>
                <FileText className="w-12 h-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">현재 레벨</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {latestAssessment.level}
                  </p>
                </div>
                <Target className="w-12 h-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">최고 점수</p>
                  <p className="text-3xl font-bold text-green-900">
                    {latestAssessment.score}점
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
                  <p className="text-sm text-orange-600 font-medium">성장률</p>
                  <p className="text-3xl font-bold text-orange-900">
                    +{improvement}점
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 레벨 진행 차트 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              레벨 진행 추이
            </CardTitle>
            <CardDescription>
              시간에 따른 점수 변화를 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {levelProgression.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 w-24">
                      {item.date}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getLevelColor(item.level)}>
                          {item.level}
                        </Badge>
                        <span className="text-sm font-semibold text-gray-900">
                          {item.score}점
                        </span>
                        {idx > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            {item.score > levelProgression[idx - 1].score ? (
                              <>
                                <ArrowUp className="w-3 h-3 text-green-500" />
                                <span className="text-green-600 font-semibold">
                                  +{item.score - levelProgression[idx - 1].score}
                                </span>
                              </>
                            ) : (
                              <>
                                <ArrowDown className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-500">
                                  {item.score - levelProgression[idx - 1].score}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {idx < levelProgression.length - 1 && (
                    <div className="absolute left-32 top-8 w-0.5 h-6 bg-gray-300" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 mb-1">
                    꾸준한 성장을 보이고 있어요!
                  </p>
                  <p className="text-sm text-green-700">
                    지난 평가 대비 {improvement}점 향상되었습니다. 계속 이 페이스를 유지하세요!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 평가 이력 목록 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">평가 상세 이력</h2>
          {mockHistory.map((assessment) => (
            <Card
              key={assessment.id}
              className={`transition-all duration-200 hover:shadow-xl border-2 ${
                selectedAssessment === assessment.id
                  ? 'ring-2 ring-blue-300 border-blue-400'
                  : 'border-gray-200'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getLevelColor(assessment.level)}>
                        {assessment.level}
                      </Badge>
                      <CardTitle className="text-xl">
                        {assessment.type}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{assessment.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{assessment.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${getScoreColor(assessment.score)}`}>
                      {assessment.score}
                    </div>
                    <p className="text-sm text-gray-500">
                      {assessment.correctAnswers}/{assessment.totalQuestions} 정답
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* 영역별 점수 */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">영역별 성적</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {assessment.areas.map((area, idx) => (
                        <div key={idx} className="text-center">
                          <p className="text-sm text-gray-600 mb-2">{area.name}</p>
                          <div className="relative">
                            <svg className="w-20 h-20 mx-auto" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#E5E7EB"
                                strokeWidth="3"
                              />
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#3B82F6"
                                strokeWidth="3"
                                strokeDasharray={`${area.score}, 100`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-bold text-gray-900">
                                {area.score}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      상세 결과 보기
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      PDF 다운로드
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 새 평가 */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="py-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              실력 향상을 확인하세요!
            </h3>
            <p className="text-gray-600 mb-6">
              새로운 평가로 당신의 성장을 측정해보세요
            </p>
            <Link href="/assessment/start">
              <Button size="lg" className="px-8">
                <Target className="w-5 h-5 mr-2" />
                새 평가 시작하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AssessmentHistoryPage;
