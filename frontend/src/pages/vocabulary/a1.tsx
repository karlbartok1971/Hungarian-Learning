/**
 * A1 어휘 학습 페이지
 * 플래시카드 기반 Duolingo 스타일 학습
 */

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronLeft,
  Volume2,
  RotateCcw,
  Check,
  X,
  BookOpen,
  Heart,
  Lightbulb,
  Trophy,
  Zap,
  Star,
} from 'lucide-react';

// Mock 어휘 데이터
const mockVocabulary = {
  일상: [
    {
      id: '1',
      hungarian: 'szia',
      korean: '안녕 (친한 사람에게)',
      pronunciation: '시아',
      category: '일상',
      level: 'A1',
      example: 'Szia! Hogy vagy?',
      exampleTranslation: '안녕! 잘 지내?',
      tip: '친구나 가족에게 사용하는 비격식 인사',
    },
    {
      id: '2',
      hungarian: 'köszönöm',
      korean: '감사합니다',
      pronunciation: '쾨쏘뇜',
      category: '일상',
      level: 'A1',
      example: 'Köszönöm szépen!',
      exampleTranslation: '정말 감사합니다!',
      tip: '기본적인 감사 표현. köszöni는 더 격식있는 표현',
    },
    {
      id: '3',
      hungarian: 'igen',
      korean: '네, 예',
      pronunciation: '이건',
      category: '일상',
      level: 'A1',
      example: 'Igen, megértettem.',
      exampleTranslation: '네, 이해했습니다.',
      tip: '긍정의 대답',
    },
    {
      id: '4',
      hungarian: 'nem',
      korean: '아니요',
      pronunciation: '넴',
      category: '일상',
      level: 'A1',
      example: 'Nem, nem értem.',
      exampleTranslation: '아니요, 이해하지 못했습니다.',
      tip: '부정의 대답',
    },
    {
      id: '5',
      hungarian: 'kérem',
      korean: '제발, 부탁합니다',
      pronunciation: '케렘',
      category: '일상',
      level: 'A1',
      example: 'Kérem, segítsen!',
      exampleTranslation: '부탁합니다, 도와주세요!',
      tip: '정중한 부탁이나 요청',
    },
  ],
  숫자: [
    {
      id: '6',
      hungarian: 'egy',
      korean: '하나, 1',
      pronunciation: '에지',
      category: '숫자',
      level: 'A1',
      example: 'Egy kávét kérek.',
      exampleTranslation: '커피 하나 주세요.',
      tip: '부정관사로도 사용됨',
    },
    {
      id: '7',
      hungarian: 'kettő',
      korean: '둘, 2',
      pronunciation: '케퇴',
      category: '숫자',
      level: 'A1',
      example: 'Kettő gyerek van.',
      exampleTranslation: '아이가 둘 있습니다.',
      tip: '2를 나타내는 기본 숫자',
    },
    {
      id: '8',
      hungarian: 'három',
      korean: '셋, 3',
      pronunciation: '하롬',
      category: '숫자',
      level: 'A1',
      example: 'Három alma.',
      exampleTranslation: '사과 세 개.',
      tip: '3을 나타내는 숫자',
    },
  ],
  종교: [
    {
      id: '9',
      hungarian: 'Isten',
      korean: '하나님',
      pronunciation: '이슈텐',
      category: '종교',
      level: 'A1',
      example: 'Isten szeret téged.',
      exampleTranslation: '하나님은 너를 사랑하신다.',
      tip: '헝가리어에서 하나님은 대문자로 시작',
    },
    {
      id: '10',
      hungarian: 'ima',
      korean: '기도',
      pronunciation: '이마',
      category: '종교',
      level: 'A1',
      example: 'Imádkozom minden nap.',
      exampleTranslation: '나는 매일 기도합니다.',
      tip: 'imádkozik = 기도하다 (동사)',
    },
  ],
};

type Category = '전체' | '일상' | '숫자' | '종교';

interface VocabCard {
  id: string;
  hungarian: string;
  korean: string;
  pronunciation: string;
  category: string;
  level: string;
  example: string;
  exampleTranslation: string;
  tip: string;
}

const A1VocabularyPage = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('일상');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCards, setLearnedCards] = useState<string[]>([]);
  const [needsReview, setNeedsReview] = useState<string[]>([]);
  const [showTip, setShowTip] = useState(false);

  // 현재 카테고리의 카드들
  const getCurrentCards = (): VocabCard[] => {
    if (activeCategory === '전체') {
      return [...mockVocabulary.일상, ...mockVocabulary.숫자, ...mockVocabulary.종교];
    }
    return mockVocabulary[activeCategory as keyof typeof mockVocabulary] || [];
  };

  const currentCards = getCurrentCards();
  const currentCard = currentCards[currentCardIndex];

  // 진도율 계산
  const progress = {
    learned: learnedCards.length,
    total: currentCards.length,
    percentage: (learnedCards.length / currentCards.length) * 100,
  };

  // 카드 뒤집기
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowTip(false);
  };

  // 알고 있어요
  const handleKnow = () => {
    if (!learnedCards.includes(currentCard.id)) {
      setLearnedCards([...learnedCards, currentCard.id]);
    }
    nextCard();
  };

  // 다시 볼게요
  const handleDontKnow = () => {
    if (!needsReview.includes(currentCard.id)) {
      setNeedsReview([...needsReview, currentCard.id]);
    }
    nextCard();
  };

  // 다음 카드
  const nextCard = () => {
    setIsFlipped(false);
    setShowTip(false);
    if (currentCardIndex < currentCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  // 이전 카드
  const previousCard = () => {
    setIsFlipped(false);
    setShowTip(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  // 처음부터 다시
  const restart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowTip(false);
    setLearnedCards([]);
    setNeedsReview([]);
  };

  // 카테고리 변경
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category as Category);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowTip(false);
  };

  // 학습 완료 여부
  const isCompleted = currentCardIndex === currentCards.length - 1 && learnedCards.length === currentCards.length;

  return (
    <>
      <Head>
        <title>A1 어휘 학습 | 헝가리어 학습 플랫폼</title>
        <meta name="description" content="A1 레벨 헝가리어 어휘 학습" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 뒤로가기 & 헤더 */}
        <div className="mb-6">
          <Link href="/vocabulary">
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              어휘 홈으로
            </Button>
          </Link>

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-blue-100 text-blue-700">A1</Badge>
                <h1 className="text-3xl font-bold text-gray-900">
                  기초 어휘 학습 📚
                </h1>
              </div>
              <p className="text-gray-600">
                플래시카드로 재미있게 학습하세요!
              </p>
            </div>
          </div>

          {/* 진도 바 */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">학습 진도</span>
                <span className="text-sm font-bold text-blue-600">
                  {progress.learned} / {progress.total} 단어
                </span>
              </div>
              <Progress value={progress.percentage} className="h-3 mb-4" />
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>학습 완료: {learnedCards.length}개</span>
                </div>
                <div className="flex items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-orange-500" />
                  <span>복습 필요: {needsReview.length}개</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 카테고리 탭 */}
        <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="전체">전체</TabsTrigger>
            <TabsTrigger value="일상">일상</TabsTrigger>
            <TabsTrigger value="숫자">숫자</TabsTrigger>
            <TabsTrigger value="종교">종교</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 플래시카드 */}
        {currentCard && !isCompleted ? (
          <div className="space-y-6">
            {/* 카드 번호 */}
            <div className="text-center text-sm text-gray-500">
              {currentCardIndex + 1} / {currentCards.length}
            </div>

            {/* 카드 */}
            <Card
              className={`min-h-[400px] cursor-pointer transition-all duration-300 ${
                isFlipped
                  ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300'
                  : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
              } border-2 hover:shadow-2xl`}
              onClick={handleFlip}
            >
              <CardContent className="flex flex-col items-center justify-center min-h-[400px] p-8">
                {!isFlipped ? (
                  // 앞면: 헝가리어
                  <div className="text-center space-y-4">
                    <div className="text-5xl font-bold text-gray-800">
                      {currentCard.hungarian}
                    </div>
                    <div className="text-2xl text-gray-500">
                      [{currentCard.pronunciation}]
                    </div>
                    <Button variant="ghost" size="sm" className="mt-4">
                      <Volume2 className="w-5 h-5 mr-2" />
                      발음 듣기
                    </Button>
                    <div className="text-sm text-gray-400 mt-8">
                      클릭해서 답 보기 👆
                    </div>
                  </div>
                ) : (
                  // 뒷면: 한국어 + 상세 정보
                  <div className="w-full space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-800 mb-2">
                        {currentCard.korean}
                      </div>
                      <Badge variant="outline">{currentCard.category}</Badge>
                    </div>

                    {/* 예문 */}
                    <Card className="bg-white border-blue-200">
                      <CardContent className="pt-4">
                        <div className="text-sm font-semibold text-gray-700 mb-2">예문:</div>
                        <div className="text-lg italic text-gray-800 mb-1">
                          {currentCard.example}
                        </div>
                        <div className="text-base text-gray-600">
                          {currentCard.exampleTranslation}
                        </div>
                      </CardContent>
                    </Card>

                    {/* 힌트 */}
                    {showTip ? (
                      <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-sm font-semibold text-yellow-800 mb-1">
                                학습 팁:
                              </div>
                              <div className="text-sm text-yellow-700">
                                {currentCard.tip}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTip(true);
                        }}
                        className="w-full"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        힌트 보기
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 액션 버튼들 */}
            {isFlipped && (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleDontKnow}
                  variant="outline"
                  size="lg"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="w-5 h-5 mr-2" />
                  다시 볼게요
                </Button>
                <Button
                  onClick={handleKnow}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-5 h-5 mr-2" />
                  알고 있어요!
                </Button>
              </div>
            )}

            {/* 네비게이션 */}
            <div className="flex items-center justify-between">
              <Button
                onClick={previousCard}
                disabled={currentCardIndex === 0}
                variant="outline"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                이전
              </Button>

              <Button onClick={restart} variant="ghost" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                처음부터
              </Button>

              <Button
                onClick={nextCard}
                disabled={currentCardIndex === currentCards.length - 1}
                variant="outline"
              >
                다음
                <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </div>
          </div>
        ) : (
          // 학습 완료 화면
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300">
            <CardContent className="py-12 text-center space-y-6">
              <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  축하합니다! 🎉
                </h2>
                <p className="text-lg text-gray-600">
                  모든 단어를 학습했습니다!
                </p>
              </div>

              <div className="flex items-center justify-center gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600">{learnedCards.length}</div>
                  <div className="text-sm text-gray-600">학습 완료</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">{needsReview.length}</div>
                  <div className="text-sm text-gray-600">복습 필요</div>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-center">
                <Button onClick={restart} size="lg">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  다시 학습하기
                </Button>
                <Link href="/vocabulary">
                  <Button variant="outline" size="lg">
                    어휘 홈으로
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 학습 팁 */}
        {!isCompleted && (
          <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="w-5 h-5 text-purple-600" />
                효과적인 학습 방법
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>💡 단어를 소리내어 읽으면 기억에 더 오래 남습니다</p>
              <p>💡 예문을 통해 실제 사용법을 익히세요</p>
              <p>💡 "다시 볼게요" 표시한 단어는 나중에 집중 복습하세요</p>
              <p>💡 매일 10-20개씩 꾸준히 학습하는 것이 가장 효과적입니다</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default A1VocabularyPage;
