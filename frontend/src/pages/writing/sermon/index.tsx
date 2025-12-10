import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PenTool, BookOpen, Target, TrendingUp, Clock, FileText } from 'lucide-react';
import { LazyWrapper } from '@/components/common/LazyWrapper';
import {
  LazySermonEditor,
  LazySermonLibrary,
  LazyTheologicalTermLearning
} from '@/components/common/LazyWrapper';

interface LearningStats {
  current_level: 'A1' | 'A2' | 'B1' | 'B2';
  progress_percentage: number;
  sermons_completed: number;
  words_learned: number;
  study_streak: number;
  next_milestone: string;
}

interface RecommendedTopic {
  id: string;
  title: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2';
  theological_focus: string[];
  estimated_time: number;
  description: string;
}

export default function SermonWorkspace() {
  const [activeTab, setActiveTab] = useState('overview');
  const [learningStats] = useState<LearningStats>({
    current_level: 'B1',
    progress_percentage: 65,
    sermons_completed: 12,
    words_learned: 340,
    study_streak: 7,
    next_milestone: 'B2 레벨 도달 (35% 남음)'
  });

  const [recommendedTopics] = useState<RecommendedTopic[]>([
    {
      id: '1',
      title: '크리스마스 메시지',
      difficulty: 'B1',
      theological_focus: ['구원', '성육신', '사랑'],
      estimated_time: 45,
      description: '성탄절 설교를 위한 헝가리어 작성 연습'
    },
    {
      id: '2',
      title: '신앙과 일상',
      difficulty: 'B1',
      theological_focus: ['믿음', '순종', '일상'],
      estimated_time: 30,
      description: '일상생활에서의 믿음 실천에 대한 설교'
    },
    {
      id: '3',
      title: '사랑의 계명',
      difficulty: 'B2',
      theological_focus: ['사랑', '계명', '실천'],
      estimated_time: 50,
      description: '예수님의 사랑 계명에 대한 심화 설교'
    }
  ]);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-green-100 text-green-800';
      case 'A2': return 'bg-blue-100 text-blue-800';
      case 'B1': return 'bg-yellow-100 text-yellow-800';
      case 'B2': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startNewSermon = (topic?: RecommendedTopic) => {
    setActiveTab('editor');
    // 추천 주제가 있다면 에디터에 기본 값 설정
    if (topic) {
      // SermonEditor에 props로 전달하거나 전역 상태로 관리
      console.log('새 설교 시작:', topic.title);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">설교문 작성 워크스페이스</h1>
          <p className="text-gray-600">헝가리어 설교문 작성 및 학습을 위한 통합 환경입니다</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">대시보드</TabsTrigger>
            <TabsTrigger value="editor">설교 작성</TabsTrigger>
            <TabsTrigger value="library">설교 라이브러리</TabsTrigger>
            <TabsTrigger value="learning">학습 도구</TabsTrigger>
          </TabsList>

          {/* 대시보드 탭 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 학습 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">현재 레벨</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{learningStats.current_level}</div>
                  <Progress value={learningStats.progress_percentage} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {learningStats.next_milestone}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">완성한 설교</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{learningStats.sermons_completed}편</div>
                  <p className="text-xs text-muted-foreground">
                    학습한 단어: {learningStats.words_learned}개
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">연속 학습</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{learningStats.study_streak}일</div>
                  <p className="text-xs text-muted-foreground">
                    꾸준한 학습으로 실력 향상! 🔥
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 빠른 시작 */}
            <Card>
              <CardHeader>
                <CardTitle>빠른 시작</CardTitle>
                <CardDescription>
                  새로운 설교문을 작성하거나 기존 작업을 계속하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => startNewSermon()}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <PenTool className="h-6 w-6" />
                    <span>새 설교 작성</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('library')}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <BookOpen className="h-6 w-6" />
                    <span>기존 설교 편집</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 추천 주제 */}
            <Card>
              <CardHeader>
                <CardTitle>추천 설교 주제</CardTitle>
                <CardDescription>
                  현재 학습 레벨에 맞는 설교 주제를 추천해드립니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {recommendedTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{topic.title}</h3>
                          <Badge className={getDifficultyColor(topic.difficulty)}>
                            {topic.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {topic.estimated_time}분 예상
                          </div>
                          <div className="flex gap-1">
                            {topic.theological_focus.map((focus, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {focus}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => startNewSermon(topic)}
                        variant="outline"
                        size="sm"
                      >
                        시작하기
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 설교 작성 탭 */}
          <TabsContent value="editor">
            <LazyWrapper>
              <LazySermonEditor />
            </LazyWrapper>
          </TabsContent>

          {/* 설교 라이브러리 탭 */}
          <TabsContent value="library">
            <LazyWrapper>
              <LazySermonLibrary />
            </LazyWrapper>
          </TabsContent>

          {/* 학습 도구 탭 */}
          <TabsContent value="learning">
            <LazyWrapper>
              <LazyTheologicalTermLearning />
            </LazyWrapper>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}