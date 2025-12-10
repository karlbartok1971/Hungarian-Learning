'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  CalendarIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  EyeIcon,
  DownloadIcon,
  SearchIcon,
  FilterIcon
} from "lucide-react";
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export interface AssessmentHistoryItem {
  id: string;
  type: 'placement' | 'progress' | 'pastoral';
  level: string;
  score: number;
  maxScore: number;
  confidence: number;
  timeSpent: number;
  completedAt: string;
  focusAreas: string[];

  // 진전도 비교용
  previousLevel?: string;
  levelChange?: 'up' | 'down' | 'same';

  // 세부 점수
  categoryScores: {
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    cultural: number;
    writing?: number;
  };
}

interface AssessmentHistoryProps {
  history: AssessmentHistoryItem[];
  onViewDetail: (assessmentId: string) => void;
  onDownloadReport?: (assessmentId: string) => void;
  isLoading?: boolean;
}

export const AssessmentHistory: React.FC<AssessmentHistoryProps> = ({
  history,
  onViewDetail,
  onDownloadReport,
  isLoading = false
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const assessmentTypeLabels = {
    placement: '초기 레벨 평가',
    progress: '진도 평가',
    pastoral: '목회자 특화 평가'
  };

  const levelColors = {
    'A1': 'bg-red-500',
    'A2': 'bg-orange-500',
    'B1': 'bg-yellow-500',
    'B2': 'bg-green-500',
    'C1': 'bg-blue-500',
    'C2': 'bg-purple-500'
  };

  // 필터링된 기록
  const filteredHistory = history.filter(item => {
    const typeMatch = filterType === 'all' || item.type === filterType;
    const levelMatch = filterLevel === 'all' || item.level === filterLevel;
    const searchMatch = searchQuery === '' ||
      assessmentTypeLabels[item.type].toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.level.toLowerCase().includes(searchQuery.toLowerCase());

    return typeMatch && levelMatch && searchMatch;
  });

  // 통계 계산
  const stats = {
    total: history.length,
    lastLevel: history.length > 0 ? history[0].level : 'N/A',
    averageScore: history.length > 0
      ? Math.round(history.reduce((sum, item) => sum + (item.score / item.maxScore * 100), 0) / history.length)
      : 0,
    totalTime: history.reduce((sum, item) => sum + item.timeSpent, 0)
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  const getScorePercentage = (score: number, maxScore: number) => {
    return Math.round((score / maxScore) * 100);
  };

  const getLevelChangeIcon = (change?: 'up' | 'down' | 'same') => {
    switch (change) {
      case 'up':
        return <TrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDownIcon className="w-4 h-4 text-red-500" />;
      case 'same':
        return <MinusIcon className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const renderCategoryScores = (scores: AssessmentHistoryItem['categoryScores']) => {
    const categories = Object.entries(scores).filter(([_, score]) => score !== undefined);

    return (
      <div className="flex flex-wrap gap-1">
        {categories.map(([category, score]) => (
          <Badge key={category} variant="outline" className="text-xs">
            {category === 'grammar' ? '문법' :
             category === 'vocabulary' ? '어휘' :
             category === 'pronunciation' ? '발음' :
             category === 'cultural' ? '문화' : '작문'}: {score}%
          </Badge>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 헤더와 통계 */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">평가 기록</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold">{stats.total}회</div>
              <div className="text-sm text-gray-600">총 평가 횟수</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 text-center">
              <Badge className={`text-lg px-3 py-1 text-white ${levelColors[stats.lastLevel as keyof typeof levelColors] || 'bg-gray-500'}`}>
                {stats.lastLevel}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">최근 레벨</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <div className="text-sm text-gray-600">평균 점수</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold">{formatTime(stats.totalTime)}</div>
              <div className="text-sm text-gray-600">총 평가 시간</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FilterIcon className="w-5 h-5 mr-2" />
            필터 및 검색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="평가 유형이나 레벨로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="평가 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 유형</SelectItem>
                <SelectItem value="placement">초기 레벨 평가</SelectItem>
                <SelectItem value="progress">진도 평가</SelectItem>
                <SelectItem value="pastoral">목회자 특화</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="레벨" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 레벨</SelectItem>
                <SelectItem value="A1">A1</SelectItem>
                <SelectItem value="A2">A2</SelectItem>
                <SelectItem value="B1">B1</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 평가 기록 목록 */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <div className="text-gray-500 text-lg">
                {searchQuery || filterType !== 'all' || filterLevel !== 'all'
                  ? '검색 조건에 맞는 평가 기록이 없습니다.'
                  : '아직 평가 기록이 없습니다.'
                }
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* 기본 정보 */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <Badge className={`text-white ${levelColors[assessment.level as keyof typeof levelColors]}`}>
                        {assessment.level}
                      </Badge>

                      <span className="font-semibold text-lg">
                        {assessmentTypeLabels[assessment.type]}
                      </span>

                      {getLevelChangeIcon(assessment.levelChange)}

                      <Badge variant="outline">
                        신뢰도 {assessment.confidence}%
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {format(new Date(assessment.completedAt), 'yyyy년 M월 d일', { locale: ko })}
                      </div>

                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatTime(assessment.timeSpent)}
                      </div>

                      <div className="font-medium text-blue-600">
                        {getScorePercentage(assessment.score, assessment.maxScore)}점
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">평가 영역:</div>
                      {renderCategoryScores(assessment.categoryScores)}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {assessment.focusAreas.map((area) => (
                        <Badge key={area} variant="secondary" className="text-xs">
                          {area === 'grammar' ? '문법' :
                           area === 'vocabulary' ? '어휘' :
                           area === 'pronunciation' ? '발음' :
                           area === 'cultural' ? '문화' :
                           area === 'writing' ? '작문' : area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex flex-col space-y-2 lg:ml-6">
                    <Button
                      onClick={() => onViewDetail(assessment.id)}
                      variant="outline"
                      size="sm"
                      className="w-full lg:w-auto"
                    >
                      <EyeIcon className="w-4 h-4 mr-2" />
                      상세 보기
                    </Button>

                    {onDownloadReport && (
                      <Button
                        onClick={() => onDownloadReport(assessment.id)}
                        variant="ghost"
                        size="sm"
                        className="w-full lg:w-auto"
                      >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        다운로드
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 더보기 버튼 (페이지네이션이 필요한 경우) */}
      {filteredHistory.length >= 10 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            더 많은 기록 보기
          </Button>
        </div>
      )}
    </div>
  );
};

export default AssessmentHistory;