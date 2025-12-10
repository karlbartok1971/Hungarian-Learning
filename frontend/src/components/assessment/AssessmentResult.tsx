'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrophyIcon,
  TargetIcon,
  BookOpenIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  BarChart3Icon,
  DownloadIcon,
  ShareIcon,
  RefreshCwIcon
} from "lucide-react";

export interface AssessmentResultData {
  sessionId: string;
  finalLevel: string;
  confidence: number;
  totalScore: number;
  maxScore: number;
  timeSpent: number;
  completedAt: string;

  // 영역별 점수
  categoryScores: {
    grammar: { score: number; maxScore: number; level: string };
    vocabulary: { score: number; maxScore: number; level: string };
    pronunciation: { score: number; maxScore: number; level: string };
    cultural: { score: number; maxScore: number; level: string };
    writing?: { score: number; maxScore: number; level: string };
  };

  // 강점/약점 분석
  strengths: string[];
  weaknesses: string[];

  // 한국인 특화 분석
  koreanSpecificAnalysis: {
    interferenceLevel: 'low' | 'medium' | 'high';
    commonMistakes: string[];
    improvementAreas: string[];
  };

  // 목회자 특화 (해당하는 경우)
  pastoralAnalysis?: {
    sermonWritingReadiness: number;
    biblicalVocabularyLevel: string;
    liturgicalComprehension: number;
  };

  // 다음 단계 추천
  recommendations: {
    immediateSteps: string[];
    studyPlan: string[];
    estimatedTimeToNextLevel: number; // 주 단위
  };
}

interface AssessmentResultProps {
  result: AssessmentResultData;
  onStartLearningPath: () => void;
  onRetakeAssessment: () => void;
  onDownloadReport?: () => void;
  onShareResult?: () => void;
}

export const AssessmentResult: React.FC<AssessmentResultProps> = ({
  result,
  onStartLearningPath,
  onRetakeAssessment,
  onDownloadReport,
  onShareResult
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const levelColors = {
    'A1': 'bg-red-500',
    'A2': 'bg-orange-500',
    'B1': 'bg-yellow-500',
    'B2': 'bg-green-500',
    'C1': 'bg-blue-500',
    'C2': 'bg-purple-500'
  };

  const levelDescriptions = {
    'A1': '입문 수준',
    'A2': '초급 수준',
    'B1': '중급 수준',
    'B2': '중상급 수준',
    'C1': '고급 수준',
    'C2': '최고급 수준'
  };

  const interferenceLabels = {
    low: { label: '낮음', color: 'bg-green-500', desc: '한국어 간섭이 적습니다' },
    medium: { label: '보통', color: 'bg-yellow-500', desc: '일부 간섭 현상이 있습니다' },
    high: { label: '높음', color: 'bg-red-500', desc: '상당한 간섭이 있습니다' }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  const getScorePercentage = (score: number, maxScore: number) => {
    return Math.round((score / maxScore) * 100);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 결과 헤더 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <TrophyIcon className="w-16 h-16 text-yellow-500" />
          </div>
          <CardTitle className="text-3xl text-blue-900">
            평가 결과
          </CardTitle>
          <div className="flex justify-center items-center space-x-4 mt-4">
            <Badge
              className={`text-white text-2xl px-6 py-2 ${levelColors[result.finalLevel as keyof typeof levelColors]}`}
            >
              {result.finalLevel}
            </Badge>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {getScorePercentage(result.totalScore, result.maxScore)}%
              </div>
              <div className="text-sm text-blue-700">
                정확도 {result.confidence}%
              </div>
            </div>
          </div>
          <p className="text-lg text-blue-800 mt-2">
            {levelDescriptions[result.finalLevel as keyof typeof levelDescriptions]}에 도달했습니다!
          </p>
        </CardHeader>
      </Card>

      {/* 탭 네비게이션 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">종합 결과</TabsTrigger>
          <TabsTrigger value="detailed">세부 분석</TabsTrigger>
          <TabsTrigger value="korean">한국인 특화</TabsTrigger>
          <TabsTrigger value="recommendations">학습 계획</TabsTrigger>
        </TabsList>

        {/* 종합 결과 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <TargetIcon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{result.finalLevel}</div>
                <div className="text-sm text-gray-600">최종 레벨</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <BarChart3Icon className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">
                  {getScorePercentage(result.totalScore, result.maxScore)}%
                </div>
                <div className="text-sm text-gray-600">총점</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUpIcon className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{result.confidence}%</div>
                <div className="text-sm text-gray-600">신뢰도</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpenIcon className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">{formatTime(result.timeSpent)}</div>
                <div className="text-sm text-gray-600">소요 시간</div>
              </CardContent>
            </Card>
          </div>

          {/* 영역별 점수 */}
          <Card>
            <CardHeader>
              <CardTitle>영역별 성취도</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(result.categoryScores).map(([category, data]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">
                      {category === 'grammar' ? '문법' :
                       category === 'vocabulary' ? '어휘' :
                       category === 'pronunciation' ? '발음' :
                       category === 'cultural' ? '문화' : '작문'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{data.level}</Badge>
                      <span className="text-sm font-medium">
                        {getScorePercentage(data.score, data.maxScore)}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={getScorePercentage(data.score, data.maxScore)}
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 강점과 약점 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  강점 분야
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center text-green-600">
                      <CheckCircleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <AlertTriangleIcon className="w-5 h-5 mr-2" />
                  개선 필요 분야
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-center text-orange-600">
                      <AlertTriangleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 세부 분석 */}
        <TabsContent value="detailed" className="space-y-6">
          {/* 목회자 특화 분석 (해당하는 경우) */}
          {result.pastoralAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>목회자 특화 분석</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.pastoralAnalysis.sermonWritingReadiness}%
                    </div>
                    <div className="text-sm text-gray-600">설교문 작성 준비도</div>
                  </div>
                  <div className="text-center">
                    <Badge className="text-lg px-4 py-2">
                      {result.pastoralAnalysis.biblicalVocabularyLevel}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-1">성경 어휘 수준</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.pastoralAnalysis.liturgicalComprehension}%
                    </div>
                    <div className="text-sm text-gray-600">예배 이해도</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 한국인 특화 분석 */}
        <TabsContent value="korean" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>언어 간섭 분석</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium">간섭 정도:</span>
                <Badge
                  className={`text-white ${interferenceLabels[result.koreanSpecificAnalysis.interferenceLevel].color}`}
                >
                  {interferenceLabels[result.koreanSpecificAnalysis.interferenceLevel].label}
                </Badge>
                <span className="text-sm text-gray-600">
                  {interferenceLabels[result.koreanSpecificAnalysis.interferenceLevel].desc}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-red-700">주요 실수 패턴</h4>
                  <ul className="space-y-1 text-sm">
                    {result.koreanSpecificAnalysis.commonMistakes.map((mistake, index) => (
                      <li key={index} className="flex items-center text-red-600">
                        <AlertTriangleIcon className="w-3 h-3 mr-2 flex-shrink-0" />
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-blue-700">개선 영역</h4>
                  <ul className="space-y-1 text-sm">
                    {result.koreanSpecificAnalysis.improvementAreas.map((area, index) => (
                      <li key={index} className="flex items-center text-blue-600">
                        <TargetIcon className="w-3 h-3 mr-2 flex-shrink-0" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 학습 계획 */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>다음 단계 학습 계획</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  다음 레벨 도달 예상 시간
                </h4>
                <div className="text-2xl font-bold text-blue-700">
                  약 {result.recommendations.estimatedTimeToNextLevel}주
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  주 8시간 학습 기준
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-700">즉시 실행 단계</h4>
                  <ul className="space-y-2">
                    {result.recommendations.immediateSteps.map((step, index) => (
                      <li key={index} className="flex items-start text-green-600">
                        <CheckCircleIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-purple-700">장기 학습 계획</h4>
                  <ul className="space-y-2">
                    {result.recommendations.studyPlan.map((plan, index) => (
                      <li key={index} className="flex items-start text-purple-600">
                        <BookOpenIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        {plan}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 액션 버튼들 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={onStartLearningPath}
              size="lg"
              className="px-8"
            >
              <BookOpenIcon className="w-5 h-5 mr-2" />
              맞춤 학습 경로 시작
            </Button>

            <Button
              variant="outline"
              onClick={onRetakeAssessment}
              size="lg"
            >
              <RefreshCwIcon className="w-5 h-5 mr-2" />
              다시 평가받기
            </Button>

            {onDownloadReport && (
              <Button
                variant="outline"
                onClick={onDownloadReport}
                size="lg"
              >
                <DownloadIcon className="w-5 h-5 mr-2" />
                결과 다운로드
              </Button>
            )}

            {onShareResult && (
              <Button
                variant="outline"
                onClick={onShareResult}
                size="lg"
              >
                <ShareIcon className="w-5 h-5 mr-2" />
                결과 공유
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentResult;