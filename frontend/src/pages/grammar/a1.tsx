/**
 * A1 문법 강의 목록 페이지
 * 실제 DB에서 데이터를 가져와서 표시
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  ArrowRight,
  Clock,
  Award,
  Sparkles,
  ChevronLeft
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
  isPublished: boolean;
}

const A1GrammarPage = () => {
  const [lessons, setLessons] = useState<GrammarLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3901/api/grammar-lessons?level=A1');

      if (!response.ok) {
        throw new Error('문법 강의를 불러오는데 실패했습니다');
      }

      const data = await response.json();

      if (data.success && data.data) {
        // orderIndex로 정렬
        const sortedLessons = data.data.sort((a: GrammarLesson, b: GrammarLesson) =>
          a.orderIndex - b.orderIndex
        );
        setLessons(sortedLessons);
      }
    } catch (err: any) {
      console.error('문법 강의 로드 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (score: number) => {
    if (score <= 1) return 'bg-green-100 text-green-700';
    if (score <= 2) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getDifficultyText = (score: number) => {
    if (score <= 1) return '쉬움';
    if (score <= 2) return '보통';
    return '어려움';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">문법 강의를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">오류 발생</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchLessons} className="w-full">
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>A1 문법 | 헝가리어 학습 플랫폼</title>
        <meta name="description" content="A1 레벨 헝가리어 문법 강의" />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 뒤로가기 & 헤더 */}
        <div className="mb-8">
          <Link href="/grammar">
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              문법 홈으로
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-blue-100 text-blue-700">A1</Badge>
                <h1 className="text-3xl font-bold text-gray-900">
                  A1 문법 강의 📚
                </h1>
              </div>
              <p className="text-gray-600">
                헝가리어 기초 문법을 단계별로 학습하세요
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{lessons.length}</div>
              <div className="text-sm text-gray-600">강의</div>
            </div>
          </div>
        </div>

        {lessons.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                아직 강의가 없습니다
              </h3>
              <p className="text-gray-500">
                곧 훌륭한 강의들이 추가될 예정입니다!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <Card
                key={lesson.id}
                className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {index + 1}강
                        </Badge>
                        <Badge className={getDifficultyColor(lesson.difficultyScore)}>
                          {getDifficultyText(lesson.difficultyScore)}
                        </Badge>
                        {lesson.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <CardTitle className="text-xl mb-2">
                        {lesson.titleKorean}
                      </CardTitle>

                      <CardDescription className="line-clamp-2">
                        {lesson.explanationKorean}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{lesson.estimatedDuration}분</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>예문 포함</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span>AI 튜터 지원</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <GrammarQuestionDialog
                        grammarTopic={lesson.titleKorean}
                        userLevel="A1"
                      />

                      <Link href={`/grammar/a1/${lesson.id}`}>
                        <Button>
                          학습하기
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 학습 팁 */}
        {lessons.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                학습 팁
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>💡 순서대로 학습하면 이해가 더 쉽습니다</p>
              <p>💡 각 강의마다 AI 튜터에게 질문할 수 있습니다</p>
              <p>💡 예문을 소리내어 읽으면 학습 효과가 2배!</p>
              <p>💡 어려운 부분은 반복해서 학습하세요</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default A1GrammarPage;
