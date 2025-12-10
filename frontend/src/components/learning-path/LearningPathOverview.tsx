'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpenIcon,
  TrendingUpIcon,
  ClockIcon,
  TargetIcon,
  CheckCircleIcon,
  PlayIcon,
  SettingsIcon,
  BarChart3Icon,
  CalendarIcon,
  UserIcon,
  StarIcon,
  AwardIcon
} from "lucide-react";

export interface LearningPathData {
  id: string;
  name: string;
  description: string;
  currentLevel: string;
  targetLevel: string;
  progress: number;
  estimatedDuration: number;
  createdAt: string;
  lastAccessed: string;
  status: 'active' | 'paused' | 'completed';

  // 레슨 정보
  lessons: {
    total: number;
    completed: number;
    current: {
      id: string;
      title: string;
      type: 'grammar' | 'vocabulary' | 'pronunciation' | 'cultural';
      difficulty: string;
      estimatedTime: number;
      progress: number;
    };
    upcoming: Array<{
      id: string;
      title: string;
      type: string;
      difficulty: string;
    }>;
  };

  // 목회자 특화 진도
  pastoralProgress: {
    sermonWriting: {
      currentPhase: string;
      phaseProgress: number;
      completedAssignments: number;
      totalAssignments: number;
      nextMilestone: {
        title: string;
        dueDate: string;
        progress: number;
      };
    };
    liturgicalLanguage: {
      learnedPrayers: number;
      totalPrayers: number;
      learnedHymns: number;
      totalHymns: number;
      recentlyMastered: string[];
    };
    biblicalVocabulary: {
      masteredTerms: number;
      totalTerms: number;
      categories: Array<{
        name: string;
        progress: number;
      }>;
    };
  };

  // 언어 간섭 개선 현황
  interferenceProgress: {
    phonological: {
      initialDifficulties: number;
      currentDifficulties: number;
      improvementRate: number;
      recentImprovements: string[];
    };
    grammatical: {
      initialChallenges: number;
      currentChallenges: number;
      masteredConcepts: string[];
      strugglingWith: string[];
    };
    cultural: {
      adaptationScore: number;
      recentLearning: string[];
    };
  };

  // 학습 통계
  statistics: {
    totalStudyTime: number;
    averageSessionLength: number;
    studyStreak: number;
    weeklyGoal: number;
    weeklyProgress: number;
    strengthAreas: string[];
    improvementNeeded: string[];
  };

  // 다음 단계 추천
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

interface LearningPathOverviewProps {
  pathData: LearningPathData;
  onStartLesson: (lessonId: string) => void;
  onCustomizePath: () => void;
  onViewAnalytics: () => void;
  onUpdateProgress?: (lessonId: string, progress: number) => void;
  isLoading?: boolean;
}

export const LearningPathOverview: React.FC<LearningPathOverviewProps> = ({
  pathData,
  onStartLesson,
  onCustomizePath,
  onViewAnalytics,
  onUpdateProgress,
  isLoading = false
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

  const phaseLabels = {
    foundation: '기초 다지기',
    development: '실력 향상',
    practice: '실전 연습',
    mastery: '숙련도 완성'
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  const formatDuration = (weeks: number) => {
    if (weeks >= 52) {
      const years = Math.floor(weeks / 52);
      const remainingWeeks = weeks % 52;
      return remainingWeeks > 0 ? `${years}년 ${remainingWeeks}주` : `${years}년`;
    }
    return `${weeks}주`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl text-blue-900">
                {pathData.name}
              </CardTitle>
              <p className="text-blue-700">{pathData.description}</p>

              <div className="flex items-center space-x-4">
                <Badge className={`text-white ${levelColors[pathData.currentLevel as keyof typeof levelColors]}`}>
                  현재: {pathData.currentLevel}
                </Badge>
                <span className="text-blue-600">→</span>
                <Badge className={`text-white ${levelColors[pathData.targetLevel as keyof typeof levelColors]}`}>
                  목표: {pathData.targetLevel}
                </Badge>
                <Badge variant="outline">
                  {formatDuration(pathData.estimatedDuration)} 과정
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-blue-900">
                {pathData.progress}%
              </div>
              <div className="text-sm text-blue-600">전체 진도</div>
            </div>
          </div>

          <Progress
            value={pathData.progress}
            className="h-3 mt-4"
          />
        </CardHeader>
      </Card>

      {/* 현재 레슨 및 빠른 액션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 현재 레슨 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlayIcon className="w-5 h-5 mr-2 text-green-500" />
              현재 레슨
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {pathData.lessons.current.title}
                </h3>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">
                    {pathData.lessons.current.difficulty}
                  </Badge>
                  <Badge className="bg-purple-500 text-white">
                    {pathData.lessons.current.type === 'grammar' ? '문법' :
                     pathData.lessons.current.type === 'vocabulary' ? '어휘' :
                     pathData.lessons.current.type === 'pronunciation' ? '발음' : '문화'}
                  </Badge>
                  <span className="text-sm text-gray-600 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {formatTime(pathData.lessons.current.estimatedTime)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => onStartLesson(pathData.lessons.current.id)}
                size="lg"
                disabled={isLoading}
              >
                {pathData.lessons.current.progress > 0 ? '계속하기' : '시작하기'}
              </Button>
            </div>

            <Progress
              value={pathData.lessons.current.progress}
              className="h-2"
            />

            <div className="text-sm text-gray-600">
              레슨 진도: {pathData.lessons.current.progress}%
            </div>
          </CardContent>
        </Card>

        {/* 학습 통계 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3Icon className="w-5 h-5 mr-2 text-blue-500" />
              이번 주 통계
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">학습 시간</span>
                <span className="font-semibold">
                  {formatTime(pathData.statistics.weeklyProgress * 60)} / {formatTime(pathData.statistics.weeklyGoal * 60)}
                </span>
              </div>
              <Progress
                value={(pathData.statistics.weeklyProgress / pathData.statistics.weeklyGoal) * 100}
                className="h-2"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">연속 학습</span>
              <div className="flex items-center">
                <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="font-semibold">{pathData.statistics.studyStreak}일</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">평균 세션</span>
              <span className="font-semibold">
                {formatTime(pathData.statistics.averageSessionLength)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 탭 네비게이션 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">학습 현황</TabsTrigger>
          <TabsTrigger value="pastoral">목회자 특화</TabsTrigger>
          <TabsTrigger value="interference">언어 간섭</TabsTrigger>
          <TabsTrigger value="recommendations">추천</TabsTrigger>
        </TabsList>

        {/* 학습 현황 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <BookOpenIcon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{pathData.lessons.completed}</div>
                <div className="text-sm text-gray-600">완료된 레슨</div>
                <div className="text-xs text-gray-500">총 {pathData.lessons.total}개 중</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 text-center">
                <ClockIcon className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{formatTime(pathData.statistics.totalStudyTime)}</div>
                <div className="text-sm text-gray-600">총 학습시간</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 text-center">
                <TrendingUpIcon className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{pathData.progress}%</div>
                <div className="text-sm text-gray-600">전체 진도</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 text-center">
                <TargetIcon className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">
                  {pathData.estimatedDuration - Math.floor(pathData.progress * pathData.estimatedDuration / 100)}주
                </div>
                <div className="text-sm text-gray-600">예상 남은 기간</div>
              </CardContent>
            </Card>
          </div>

          {/* 다가오는 레슨들 */}
          <Card>
            <CardHeader>
              <CardTitle>다가오는 레슨</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pathData.lessons.upcoming.slice(0, 3).map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                        {pathData.lessons.completed + index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Badge variant="outline" className="text-xs">
                            {lesson.difficulty}
                          </Badge>
                          <span className="capitalize">{lesson.type}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      미리보기
                    </Button>
                  </div>
                ))}
              </div>
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
                  {pathData.statistics.strengthAreas.map((area, index) => (
                    <li key={index} className="flex items-center text-green-600">
                      <CheckCircleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      {area}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <TargetIcon className="w-5 h-5 mr-2" />
                  개선 필요 분야
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pathData.statistics.improvementNeeded.map((area, index) => (
                    <li key={index} className="flex items-center text-orange-600">
                      <TargetIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      {area}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 목회자 특화 진도 */}
        <TabsContent value="pastoral" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 설교문 작성 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-700">설교문 작성</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge className="bg-purple-500 text-white mb-2">
                    {phaseLabels[pathData.pastoralProgress.sermonWriting.currentPhase as keyof typeof phaseLabels]}
                  </Badge>
                  <div className="text-2xl font-bold">
                    {pathData.pastoralProgress.sermonWriting.phaseProgress}%
                  </div>
                  <Progress
                    value={pathData.pastoralProgress.sermonWriting.phaseProgress}
                    className="h-2 mt-2"
                  />
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>완료한 과제:</span>
                    <span className="font-medium">
                      {pathData.pastoralProgress.sermonWriting.completedAssignments}/
                      {pathData.pastoralProgress.sermonWriting.totalAssignments}
                    </span>
                  </div>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg">
                  <h5 className="font-medium text-purple-800 mb-1">다음 마일스톤</h5>
                  <p className="text-sm text-purple-600">
                    {pathData.pastoralProgress.sermonWriting.nextMilestone.title}
                  </p>
                  <Progress
                    value={pathData.pastoralProgress.sermonWriting.nextMilestone.progress}
                    className="h-1 mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 예배 언어 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">예배 언어</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">기도문</span>
                    <span className="font-medium">
                      {pathData.pastoralProgress.liturgicalLanguage.learnedPrayers}/
                      {pathData.pastoralProgress.liturgicalLanguage.totalPrayers}
                    </span>
                  </div>
                  <Progress
                    value={(pathData.pastoralProgress.liturgicalLanguage.learnedPrayers / pathData.pastoralProgress.liturgicalLanguage.totalPrayers) * 100}
                    className="h-2"
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">찬송가</span>
                    <span className="font-medium">
                      {pathData.pastoralProgress.liturgicalLanguage.learnedHymns}/
                      {pathData.pastoralProgress.liturgicalLanguage.totalHymns}
                    </span>
                  </div>
                  <Progress
                    value={(pathData.pastoralProgress.liturgicalLanguage.learnedHymns / pathData.pastoralProgress.liturgicalLanguage.totalHymns) * 100}
                    className="h-2"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-blue-800 mb-2">최근 습득</h5>
                  {pathData.pastoralProgress.liturgicalLanguage.recentlyMastered.map((item, index) => (
                    <Badge key={index} variant="outline" className="mr-1 mb-1 text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 성경 어휘 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">성경 어휘</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {pathData.pastoralProgress.biblicalVocabulary.masteredTerms}
                  </div>
                  <div className="text-sm text-gray-600">
                    / {pathData.pastoralProgress.biblicalVocabulary.totalTerms} 용어
                  </div>
                  <Progress
                    value={(pathData.pastoralProgress.biblicalVocabulary.masteredTerms / pathData.pastoralProgress.biblicalVocabulary.totalTerms) * 100}
                    className="h-2 mt-2"
                  />
                </div>

                <div className="space-y-2">
                  {pathData.pastoralProgress.biblicalVocabulary.categories.map((category, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{category.name}</span>
                        <span className="font-medium">{category.progress}%</span>
                      </div>
                      <Progress value={category.progress} className="h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 언어 간섭 개선 */}
        <TabsContent value="interference" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 발음 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">발음 (음성학적 간섭)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {pathData.interferenceProgress.phonological.improvementRate}% 개선
                  </div>
                  <div className="text-sm text-gray-600">
                    {pathData.interferenceProgress.phonological.initialDifficulties}개 → {pathData.interferenceProgress.phonological.currentDifficulties}개 문제
                  </div>
                </div>

                <div className="bg-red-50 p-3 rounded-lg">
                  <h5 className="font-medium text-red-800 mb-2">최근 개선</h5>
                  {pathData.interferenceProgress.phonological.recentImprovements.map((improvement, index) => (
                    <Badge key={index} variant="outline" className="mr-1 mb-1 text-xs">
                      {improvement}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 문법 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-700">문법 (구조적 간섭)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">
                    {pathData.interferenceProgress.grammatical.initialChallenges - pathData.interferenceProgress.grammatical.currentChallenges}개 해결
                  </div>
                  <div className="text-sm text-gray-600">
                    {pathData.interferenceProgress.grammatical.currentChallenges}개 남음
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-1 text-sm">습득 완료</h5>
                    {pathData.interferenceProgress.grammatical.masteredConcepts.map((concept, index) => (
                      <Badge key={index} className="mr-1 mb-1 text-xs bg-green-500">
                        {concept}
                      </Badge>
                    ))}
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <h5 className="font-medium text-yellow-800 mb-1 text-sm">학습 중</h5>
                    {pathData.interferenceProgress.grammatical.strugglingWith.map((struggle, index) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1 text-xs">
                        {struggle}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 문화적 적응 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">문화적 적응</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {pathData.interferenceProgress.cultural.adaptationScore}%
                  </div>
                  <div className="text-sm text-gray-600">적응 점수</div>
                  <Progress
                    value={pathData.interferenceProgress.cultural.adaptationScore}
                    className="h-2 mt-2"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-blue-800 mb-2">최근 학습</h5>
                  {pathData.interferenceProgress.cultural.recentLearning.map((item, index) => (
                    <div key={index} className="flex items-center text-blue-600 text-sm mb-1">
                      <CheckCircleIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 추천 사항 */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">즉시 실행</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pathData.recommendations.immediate.map((rec, index) => (
                    <li key={index} className="flex items-start text-green-600">
                      <CheckCircleIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">단기 목표</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pathData.recommendations.shortTerm.map((rec, index) => (
                    <li key={index} className="flex items-start text-blue-600">
                      <TargetIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-700">장기 계획</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pathData.recommendations.longTerm.map((rec, index) => (
                    <li key={index} className="flex items-start text-purple-600">
                      <AwardIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 액션 버튼들 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => onStartLesson(pathData.lessons.current.id)}
              size="lg"
              className="px-8"
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              레슨 시작하기
            </Button>

            <Button
              variant="outline"
              onClick={onCustomizePath}
              size="lg"
            >
              <SettingsIcon className="w-5 h-5 mr-2" />
              학습 경로 커스터마이징
            </Button>

            <Button
              variant="outline"
              onClick={onViewAnalytics}
              size="lg"
            >
              <BarChart3Icon className="w-5 h-5 mr-2" />
              상세 분석 보기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningPathOverview;