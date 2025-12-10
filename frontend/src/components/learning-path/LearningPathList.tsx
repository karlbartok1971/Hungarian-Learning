'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  PlayIcon,
  PauseIcon,
  SettingsIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  ClockIcon,
  BookOpenIcon,
  TrendingUpIcon,
  UserIcon,
  StarIcon
} from "lucide-react";
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export interface LearningPathItem {
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

  // 통계 정보
  stats: {
    totalLessons: number;
    completedLessons: number;
    totalStudyTime: number;
    averageSessionLength: number;
    studyStreak: number;
  };

  // 현재 레슨
  currentLesson?: {
    title: string;
    progress: number;
    type: string;
  };

  // 특화 정보
  specialization: {
    isPastoral: boolean;
    focusAreas: string[];
  };
}

interface LearningPathListProps {
  paths: LearningPathItem[];
  onViewPath: (pathId: string) => void;
  onStartPath: (pathId: string) => void;
  onPausePath: (pathId: string) => void;
  onResumePath: (pathId: string) => void;
  onCustomizePath: (pathId: string) => void;
  onDeletePath: (pathId: string) => void;
  onCreateNewPath: () => void;
  isLoading?: boolean;
}

export const LearningPathList: React.FC<LearningPathListProps> = ({
  paths,
  onViewPath,
  onStartPath,
  onPausePath,
  onResumePath,
  onCustomizePath,
  onDeletePath,
  onCreateNewPath,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastAccessed');

  const levelColors = {
    'A1': 'bg-red-500',
    'A2': 'bg-orange-500',
    'B1': 'bg-yellow-500',
    'B2': 'bg-green-500',
    'C1': 'bg-blue-500',
    'C2': 'bg-purple-500'
  };

  const statusColors = {
    active: 'bg-green-500',
    paused: 'bg-yellow-500',
    completed: 'bg-blue-500'
  };

  const statusLabels = {
    active: '진행중',
    paused: '일시정지',
    completed: '완료'
  };

  // 필터링 및 정렬
  const filteredAndSortedPaths = paths
    .filter(path => {
      const matchesSearch = searchQuery === '' ||
        path.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        path.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || path.status === statusFilter;

      const matchesLevel = levelFilter === 'all' ||
        path.currentLevel === levelFilter ||
        path.targetLevel === levelFilter;

      return matchesSearch && matchesStatus && matchesLevel;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return b.progress - a.progress;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastAccessed':
        default:
          return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
      }
    });

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

  const getActionButtons = (path: LearningPathItem) => {
    const buttons = [];

    // 상태별 주요 액션
    if (path.status === 'active') {
      buttons.push(
        <Button
          key="start"
          onClick={() => onStartPath(path.id)}
          size="sm"
          className="px-3"
        >
          <PlayIcon className="w-4 h-4 mr-1" />
          {path.currentLesson && path.currentLesson.progress > 0 ? '계속하기' : '시작하기'}
        </Button>
      );

      buttons.push(
        <Button
          key="pause"
          onClick={() => onPausePath(path.id)}
          variant="outline"
          size="sm"
        >
          <PauseIcon className="w-4 h-4 mr-1" />
          일시정지
        </Button>
      );
    } else if (path.status === 'paused') {
      buttons.push(
        <Button
          key="resume"
          onClick={() => onResumePath(path.id)}
          size="sm"
          className="px-3"
        >
          <PlayIcon className="w-4 h-4 mr-1" />
          재개하기
        </Button>
      );
    } else if (path.status === 'completed') {
      buttons.push(
        <Badge key="completed" className="bg-blue-500 text-white px-3 py-1">
          완료
        </Badge>
      );
    }

    // 공통 액션들
    buttons.push(
      <Button
        key="view"
        onClick={() => onViewPath(path.id)}
        variant="outline"
        size="sm"
      >
        <EyeIcon className="w-4 h-4 mr-1" />
        상세보기
      </Button>
    );

    return buttons;
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-24 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">나의 학습 경로</h1>
          <p className="text-gray-600 mt-1">
            개인화된 헝가리어 학습 경로를 관리하고 진도를 확인하세요
          </p>
        </div>

        <Button onClick={onCreateNewPath} size="lg">
          <PlusIcon className="w-5 h-5 mr-2" />
          새 학습 경로 만들기
        </Button>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FilterIcon className="w-5 h-5 mr-2" />
            필터 및 정렬
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 검색 */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="학습 경로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 상태 필터 */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="active">진행중</SelectItem>
                <SelectItem value="paused">일시정지</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
              </SelectContent>
            </Select>

            {/* 레벨 필터 */}
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
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

            {/* 정렬 */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastAccessed">최근 학습순</SelectItem>
                <SelectItem value="progress">진도순</SelectItem>
                <SelectItem value="created">생성일순</SelectItem>
                <SelectItem value="name">이름순</SelectItem>
              </SelectContent>
            </Select>

            {/* 결과 수 */}
            <div className="flex items-center justify-center text-sm text-gray-600">
              {filteredAndSortedPaths.length}개 결과
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 학습 경로 목록 */}
      {filteredAndSortedPaths.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <BookOpenIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' || levelFilter !== 'all'
                ? '검색 결과가 없습니다'
                : '아직 학습 경로가 없습니다'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all' || levelFilter !== 'all'
                ? '다른 검색 조건을 시도해보세요'
                : '새로운 학습 경로를 만들어 헝가리어 학습을 시작하세요'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && levelFilter === 'all' && (
              <Button onClick={onCreateNewPath}>
                <PlusIcon className="w-4 h-4 mr-2" />
                첫 번째 학습 경로 만들기
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedPaths.map((path) => (
            <Card key={path.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* 헤더 */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-3 lg:space-y-0">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {path.name}
                        </h3>

                        <Badge className={`text-white ${statusColors[path.status]}`}>
                          {statusLabels[path.status]}
                        </Badge>

                        <Badge className={`text-white ${levelColors[path.currentLevel as keyof typeof levelColors]}`}>
                          {path.currentLevel}
                        </Badge>

                        <span className="text-gray-400">→</span>

                        <Badge className={`text-white ${levelColors[path.targetLevel as keyof typeof levelColors]}`}>
                          {path.targetLevel}
                        </Badge>

                        {path.specialization.isPastoral && (
                          <Badge className="bg-purple-500 text-white">
                            <UserIcon className="w-3 h-3 mr-1" />
                            목회자 특화
                          </Badge>
                        )}

                        {path.stats.studyStreak > 7 && (
                          <Badge className="bg-orange-500 text-white">
                            <StarIcon className="w-3 h-3 mr-1" />
                            {path.stats.studyStreak}일 연속
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-600">{path.description}</p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          마지막 학습: {format(new Date(path.lastAccessed), 'M월 d일', { locale: ko })}
                        </div>

                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          총 {formatTime(path.stats.totalStudyTime)}
                        </div>

                        <div className="flex items-center">
                          <BookOpenIcon className="w-4 h-4 mr-1" />
                          {path.stats.completedLessons}/{path.stats.totalLessons} 레슨
                        </div>

                        <div className="flex items-center">
                          <TrendingUpIcon className="w-4 h-4 mr-1" />
                          {formatDuration(path.estimatedDuration)} 과정
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼들 */}
                    <div className="flex flex-wrap gap-2 lg:ml-6">
                      {getActionButtons(path)}

                      <Button
                        onClick={() => onCustomizePath(path.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <SettingsIcon className="w-4 h-4 mr-1" />
                        설정
                      </Button>

                      {path.status !== 'active' && (
                        <Button
                          onClick={() => onDeletePath(path.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          삭제
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 진도 바 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">전체 진도</span>
                      <span className="text-gray-600">{path.progress}%</span>
                    </div>
                    <Progress value={path.progress} className="h-2" />
                  </div>

                  {/* 현재 레슨 정보 */}
                  {path.currentLesson && path.status === 'active' && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-blue-900">
                            현재 레슨: {path.currentLesson.title}
                          </h4>
                          <div className="text-sm text-blue-700">
                            {path.currentLesson.type === 'grammar' ? '문법' :
                             path.currentLesson.type === 'vocabulary' ? '어휘' :
                             path.currentLesson.type === 'pronunciation' ? '발음' : '문화'} 레슨
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-900">
                            {path.currentLesson.progress}%
                          </div>
                          <div className="text-xs text-blue-700">완료</div>
                        </div>
                      </div>
                      <Progress
                        value={path.currentLesson.progress}
                        className="h-1 mt-2"
                      />
                    </div>
                  )}

                  {/* 특화 영역 태그 */}
                  {path.specialization.focusAreas.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">집중 영역:</span>
                      <div className="flex flex-wrap gap-1">
                        {path.specialization.focusAreas.map((area, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {area === 'grammar' ? '문법' :
                             area === 'vocabulary' ? '어휘' :
                             area === 'pronunciation' ? '발음' :
                             area === 'cultural' ? '문화' :
                             area === 'writing' ? '작문' : area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 더보기 버튼 (페이지네이션이 필요한 경우) */}
      {filteredAndSortedPaths.length >= 10 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            더 많은 학습 경로 보기
          </Button>
        </div>
      )}
    </div>
  );
};

export default LearningPathList;