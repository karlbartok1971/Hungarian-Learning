/**
 * A1 문법 강의 상세 페이지
 * 실제 학습 콘텐츠와 예문, 연습문제 표시
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  ChevronLeft,
  Clock,
  Award,
  CheckCircle2,
  Circle,
  Lightbulb,
  MessageCircle,
  Volume2,
  Star
} from 'lucide-react';
import { GrammarQuestionDialog } from '@/components/ai-tutor';

interface GrammarLesson {
  id: string;
  titleKorean: string;
  titleHungarian: string | null;
  level: string;
  orderIndex: number;
  explanationKorean: string;
  estimatedDuration: number;
  difficultyScore: number;
  tags: string[];
  examples: any[];
  grammarRules: any;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const GrammarLessonDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  }, [id]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/grammar-lessons/${id}`);

      if (!response.ok) {
        throw new Error('강의를 불러오는데 실패했습니다');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setLesson(data.data);
      }
    } catch (err: any) {
      console.error('강의 로드 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newCompleted = new Set(completedSections);
    if (newCompleted.has(sectionId)) {
      newCompleted.delete(sectionId);
    } else {
      newCompleted.add(sectionId);
    }
    setCompletedSections(newCompleted);
  };

  const getDifficultyColor = (score: number) => {
    if (score === 1) return 'bg-green-100 text-green-700';
    if (score === 2) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getDifficultyLabel = (score: number) => {
    if (score === 1) return '쉬움';
    if (score === 2) return '보통';
    return '어려움';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">강의를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">오류 발생</CardTitle>
            <CardDescription>{error || '강의를 찾을 수 없습니다'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/grammar/a1')} variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{lesson.titleKorean} - 헝가리어 학습</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.push('/grammar/a1')}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                A1 문법 목록
              </Button>

              <div className="flex items-center gap-3">
                <Badge className={getDifficultyColor(lesson.difficultyScore)}>
                  {getDifficultyLabel(lesson.difficultyScore)}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {lesson.estimatedDuration}분
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 강의 제목 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">제 {lesson.orderIndex}과</Badge>
              <Badge variant="outline">{lesson.level}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {lesson.titleKorean}
            </h1>
            {lesson.titleHungarian && (
              <p className="text-xl text-gray-600">{lesson.titleHungarian}</p>
            )}
            <p className="text-gray-700 mt-4">{lesson.explanationKorean}</p>

            {/* 태그 */}
            <div className="flex flex-wrap gap-2 mt-4">
              {lesson.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* AI 튜터 */}
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">AI 튜터에게 질문하기</p>
                    <p className="text-sm text-gray-600">이해가 안 되는 부분을 물어보세요</p>
                  </div>
                </div>
                <GrammarQuestionDialog
                  grammarTopic={lesson.titleKorean}
                  userLevel={lesson.level}
                />
              </div>
            </CardContent>
          </Card>

          {/* 탭 콘텐츠 */}
          <Tabs defaultValue="explanation" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="explanation">
                <BookOpen className="h-4 w-4 mr-2" />
                설명
              </TabsTrigger>
              <TabsTrigger value="examples">
                <Lightbulb className="h-4 w-4 mr-2" />
                예문
              </TabsTrigger>
              <TabsTrigger value="practice">
                <Award className="h-4 w-4 mr-2" />
                연습
              </TabsTrigger>
            </TabsList>

            {/* 설명 탭 */}
            <TabsContent value="explanation" className="space-y-6 mt-6">
              {lesson.grammarRules?.explanation?.steps?.map((step: any, idx: number) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection(`step-${idx}`)}
                      >
                        {completedSections.has(`step-${idx}`) ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {step.content && typeof step.content === 'string' && (
                      <p className="text-gray-700">{step.content}</p>
                    )}

                    {step.examples && Array.isArray(step.examples) && step.examples.length > 0 && (
                      <div className="space-y-3">
                        {step.examples.map((example: any, exIdx: number) => (
                          <div key={exIdx} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p className="font-medium text-gray-900 mb-1">{example.hungarian}</p>
                            <p className="text-gray-700 text-sm">{example.korean}</p>
                            {example.note && (
                              <p className="text-xs text-blue-700 mt-2 flex items-start gap-1">
                                <Star className="h-3 w-3 mt-0.5" />
                                {example.note}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {step.rules && Array.isArray(step.rules) && step.rules.length > 0 && (
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <p className="font-medium text-yellow-900 mb-2">📌 규칙</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {step.rules.map((rule: any, rIdx: number) => (
                            <li key={rIdx}>{typeof rule === 'string' ? rule : JSON.stringify(rule)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* 예문 탭 */}
            <TabsContent value="examples" className="space-y-6 mt-6">
              {lesson.examples?.map((exampleGroup: any, idx: number) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{exampleGroup.category}</CardTitle>
                    <CardDescription>
                      {exampleGroup.items?.length || 0}개의 예문
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {exampleGroup.items?.map((item: any, itemIdx: number) => (
                        <div key={itemIdx} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-lg text-gray-900 mb-1">
                                {item.hungarian}
                              </p>
                              <p className="text-gray-700">{item.korean}</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Volume2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {item.grammar && (
                            <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded mt-2">
                              💡 {item.grammar}
                            </p>
                          )}

                          {item.vocabulary && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-600 mb-1">어휘:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.vocabulary.map((vocab: string, vIdx: number) => (
                                  <Badge key={vIdx} variant="outline" className="text-xs">
                                    {vocab}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* 연습 탭 */}
            <TabsContent value="practice" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>연습 문제</CardTitle>
                  <CardDescription>
                    학습한 내용을 복습하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      연습 문제 기능은 곧 추가될 예정입니다
                    </p>
                    <p className="text-sm text-gray-500">
                      지금은 예문을 반복해서 읽고 이해하는 연습을 하세요
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 하단 네비게이션 */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/grammar/a1')}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              목록으로
            </Button>

            <Button
              onClick={() => {
                // TODO: 다음 강의로 이동
                alert('다음 강의 기능은 곧 추가됩니다');
              }}
            >
              다음 강의
              <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GrammarLessonDetailPage;
