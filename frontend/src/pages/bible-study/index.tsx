/**
 * 성경 일일 학습 메인 페이지
 * 매일 성경 구절을 학습하고 문법을 분석하는 시스템
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Volume2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Download,
  MessageSquare
} from 'lucide-react';

interface BibleVerse {
  id: string;
  book: string;
  bookHungarian: string;
  chapter: number;
  verse: number;
  textHungarian: string;
  textKorean: string;
  grammarAnalysis: WordAnalysis[];
  difficulty: string;
  grammarTopics: string[];
  vocabularyCount: number;
  theologicalTheme?: string;
}

interface WordAnalysis {
  word: string;
  lemma: string;
  pos: string;
  meaning: string;
  grammarFeature: string;
  level: string;
  relatedLesson?: string;
  relatedLessonTitle?: string;
}

const BibleStudyPage = () => {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  useEffect(() => {
    fetchDailyVerse();
  }, []);

  const fetchDailyVerse = async () => {
    try {
      setLoading(true);
      // TODO: 실제 사용자 ID 가져오기
      const userId = 'user_1234';
      const response = await fetch(`http://localhost:3901/api/bible/daily?userId=${userId}`);

      if (!response.ok) {
        throw new Error('성경 구절을 불러오는데 실패했습니다');
      }

      const data = await response.json();

      if (data.success && data.data.verse) {
        setVerse(data.data.verse);
      }
    } catch (error: any) {
      console.error('성경 구절 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (text: string) => {
    // TTS 음성 재생
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hu-HU';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'A1': return 'bg-green-100 text-green-700';
      case 'A2': return 'bg-blue-100 text-blue-700';
      case 'B1': return 'bg-yellow-100 text-yellow-700';
      case 'B2': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">오늘의 성경을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!verse) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">오류 발생</CardTitle>
            <CardDescription>성경 구절을 찾을 수 없습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchDailyVerse} className="w-full">
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
        <title>성경 일일 학습 | 헝가리어 학습 플랫폼</title>
        <meta name="description" content="매일 성경을 읽으며 헝가리어 문법을 학습하세요" />
      </Head>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📖 오늘의 성경
              </h1>
              <p className="text-gray-600">
                성경을 읽으며 헝가리어 문법을 자연스럽게 학습하세요
              </p>
            </div>
            <Badge className={getDifficultyColor(verse.difficulty)}>
              {verse.difficulty} 레벨
            </Badge>
          </div>

          {/* 성경 정보 */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {verse.book} {verse.chapter}:{verse.verse}
            </span>
            <span>|</span>
            <span>{verse.bookHungarian} {verse.chapter}:{verse.verse}</span>
            {verse.theologicalTheme && (
              <>
                <span>|</span>
                <span className="text-purple-600">🙏 {verse.theologicalTheme}</span>
              </>
            )}
          </div>
        </div>

        {/* 성경 본문 카드 */}
        <Card className="mb-6 border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-3">
                  {verse.textHungarian}
                </CardTitle>
                <CardDescription className="text-lg">
                  {verse.textKorean}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => playAudio(verse.textHungarian)}
                className="ml-4"
              >
                <Volume2 className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {verse.grammarTopics.map((topic) => (
                <Badge key={topic} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>

            {/* 전체보기 버튼 */}
            <div className="flex items-center justify-center">
              <Button
                onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                className="w-full max-w-md"
              >
                {showFullAnalysis ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    문법 분석 접기
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    전체 문법 분석 보기
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 전체 문법 분석 (펼침 상태) */}
        {showFullAnalysis && (
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                📖 {verse.book} {verse.chapter}:{verse.verse} 문법 완전 분석
              </CardTitle>
              <CardDescription>
                총 {verse.grammarAnalysis.length}개 단어 • {verse.grammarTopics.length}개 문법 포인트
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 단어별 분석 */}
              {verse.grammarAnalysis.map((wordData, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-xl font-bold text-blue-600">
                          {wordData.word}
                        </h4>
                        <Badge variant="outline">{wordData.pos}</Badge>
                        <Badge className={getDifficultyColor(wordData.level)}>
                          {wordData.level}
                        </Badge>
                      </div>

                      <p className="text-gray-700 mb-3">{wordData.meaning}</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-500">원형</span>
                          <p className="font-medium">{wordData.lemma}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">문법 특징</span>
                          <p className="font-medium">{wordData.grammarFeature}</p>
                        </div>
                      </div>

                      {/* 관련 강의 링크 */}
                      {wordData.relatedLesson && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm">
                            <BookOpen className="w-4 h-4 mr-2" />
                            관련 강의: {wordData.relatedLessonTitle || '문법 강의'}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* 음성 재생 */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => playAudio(wordData.word)}
                      className="ml-4"
                    >
                      <Volume2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* 문법 요약 */}
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    💡 이 구절에서 배운 문법
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {verse.grammarTopics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-sm">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 설교 아이디어 */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                    🎤 이 구절로 설교하기
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    이 구절은 {verse.theologicalTheme || '중요한 신학적 주제'}를 다루고 있습니다.
                    헝가리어로 설교할 때 이 표현들을 활용할 수 있습니다.
                  </p>
                  <div className="mt-4 space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      설교 아이디어 메모하기
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Bookmark className="w-4 h-4 mr-2" />
                      북마크에 추가
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}

        {/* 학습 도구 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button variant="outline" className="justify-start">
            <Download className="w-4 h-4 mr-2" />
            PDF 다운로드
          </Button>
          <Button variant="outline" className="justify-start">
            <Bookmark className="w-4 h-4 mr-2" />
            북마크
          </Button>
          <Button variant="outline" className="justify-start">
            <MessageSquare className="w-4 h-4 mr-2" />
            메모 작성
          </Button>
        </div>

        {/* 학습 팁 */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-lg">📚 학습 팁</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p>💡 단어를 클릭하면 문법 설명을 볼 수 있습니다</p>
            <p>💡 스피커 아이콘을 클릭하면 음성을 들을 수 있습니다</p>
            <p>💡 관련 강의를 통해 더 깊이 학습할 수 있습니다</p>
            <p>💡 설교 아이디어를 메모해두고 나중에 활용하세요</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default BibleStudyPage;
