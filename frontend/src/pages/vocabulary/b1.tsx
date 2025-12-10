/**
 * B1 어휘 학습 페이지
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
  Lightbulb,
  Trophy,
} from 'lucide-react';

// Mock 어휘 데이터 (B1 레벨 - 중급)
const mockVocabulary = {
  직업: [
    {
      id: '1',
      hungarian: 'munka',
      korean: '일, 직업',
      pronunciation: '문카',
      category: '직업',
      level: 'B1',
      example: 'A munkám nagyon érdekes.',
      exampleTranslation: '내 일은 매우 흥미롭습니다.',
      tip: 'dolgozni = 일하다 (동사)',
    },
    {
      id: '2',
      hungarian: 'tanár',
      korean: '선생님',
      pronunciation: '타나르',
      category: '직업',
      level: 'B1',
      example: 'Tanár szeretnék lenni.',
      exampleTranslation: '나는 선생님이 되고 싶습니다.',
      tip: '남녀 구분 없이 사용',
    },
  ],
  교육: [
    {
      id: '3',
      hungarian: 'tanulni',
      korean: '공부하다, 배우다',
      pronunciation: '타눌니',
      category: '교육',
      level: 'B1',
      example: 'Magyarul tanulok.',
      exampleTranslation: '헝가리어를 배웁니다.',
      tip: '부정형 동사',
    },
    {
      id: '4',
      hungarian: 'vizsga',
      korean: '시험',
      pronunciation: '비주거',
      category: '교육',
      level: 'B1',
      example: 'Holnap vizsgázom.',
      exampleTranslation: '내일 시험을 봅니다.',
      tip: 'vizsgázik = 시험을 보다',
    },
  ],
  여행: [
    {
      id: '5',
      hungarian: 'utazás',
      korean: '여행',
      pronunciation: '우타자시',
      category: '여행',
      level: 'B1',
      example: 'Az utazás fárasztó volt.',
      exampleTranslation: '여행은 피곤했습니다.',
      tip: 'utazni = 여행하다',
    },
  ],
  종교: [
    {
      id: '6',
      hungarian: 'hit',
      korean: '믿음, 신앙',
      pronunciation: '히트',
      category: '종교',
      level: 'B1',
      example: 'A hitem erős.',
      exampleTranslation: '내 신앙은 강합니다.',
      tip: 'hinni = 믿다 (동사)',
    },
    {
      id: '7',
      hungarian: 'kegyelem',
      korean: '은혜',
      pronunciation: '케젤렘',
      category: '종교',
      level: 'B1',
      example: 'Isten kegyelme végtelen.',
      exampleTranslation: '하나님의 은혜는 무한합니다.',
      tip: '중요한 신학 용어',
    },
  ],
};

type Category = '전체' | '직업' | '교육' | '여행' | '종교';

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

const B1VocabularyPage = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('직업');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCards, setLearnedCards] = useState<string[]>([]);
  const [needsReview, setNeedsReview] = useState<string[]>([]);
  const [showTip, setShowTip] = useState(false);

  const getCurrentCards = (): VocabCard[] => {
    if (activeCategory === '전체') {
      return [...mockVocabulary.직업, ...mockVocabulary.교육, ...mockVocabulary.여행, ...mockVocabulary.종교];
    }
    return mockVocabulary[activeCategory as keyof typeof mockVocabulary] || [];
  };

  const currentCards = getCurrentCards();
  const currentCard = currentCards[currentCardIndex];

  const progress = {
    learned: learnedCards.length,
    total: currentCards.length,
    percentage: (learnedCards.length / currentCards.length) * 100,
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowTip(false);
  };

  const handleKnow = () => {
    if (!learnedCards.includes(currentCard.id)) {
      setLearnedCards([...learnedCards, currentCard.id]);
    }
    nextCard();
  };

  const handleDontKnow = () => {
    if (!needsReview.includes(currentCard.id)) {
      setNeedsReview([...needsReview, currentCard.id]);
    }
    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    setShowTip(false);
    if (currentCardIndex < currentCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const previousCard = () => {
    setIsFlipped(false);
    setShowTip(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const restart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowTip(false);
    setLearnedCards([]);
    setNeedsReview([]);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category as Category);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowTip(false);
  };

  const isCompleted = currentCardIndex === currentCards.length - 1 && learnedCards.length === currentCards.length;

  return (
    <>
      <Head>
        <title>B1 어휘 학습 | 헝가리어 학습 플랫폼</title>
        <meta name="description" content="B1 레벨 헝가리어 어휘 학습" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
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
                <Badge className="bg-purple-100 text-purple-700">B1</Badge>
                <h1 className="text-3xl font-bold text-gray-900">
                  중급 어휘 학습 📚
                </h1>
              </div>
              <p className="text-gray-600">
                실용적인 표현을 마스터하세요!
              </p>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">학습 진도</span>
                <span className="text-sm font-bold text-purple-600">
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

        <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="전체">전체</TabsTrigger>
            <TabsTrigger value="직업">직업</TabsTrigger>
            <TabsTrigger value="교육">교육</TabsTrigger>
            <TabsTrigger value="여행">여행</TabsTrigger>
            <TabsTrigger value="종교">종교</TabsTrigger>
          </TabsList>
        </Tabs>

        {currentCard && !isCompleted ? (
          <div className="space-y-6">
            <div className="text-center text-sm text-gray-500">
              {currentCardIndex + 1} / {currentCards.length}
            </div>

            <Card
              className={`min-h-[400px] cursor-pointer transition-all duration-300 ${
                isFlipped
                  ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300'
                  : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
              } border-2 hover:shadow-2xl`}
              onClick={handleFlip}
            >
              <CardContent className="flex flex-col items-center justify-center min-h-[400px] p-8">
                {!isFlipped ? (
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
                  <div className="w-full space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-800 mb-2">
                        {currentCard.korean}
                      </div>
                      <Badge variant="outline">{currentCard.category}</Badge>
                    </div>

                    <Card className="bg-white border-purple-200">
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
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Check className="w-5 h-5 mr-2" />
                  알고 있어요!
                </Button>
              </div>
            )}

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
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300">
            <CardContent className="py-12 text-center space-y-6">
              <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  대단해요! 🎉
                </h2>
                <p className="text-lg text-gray-600">
                  B1 어휘를 모두 마스터했습니다!
                </p>
              </div>

              <div className="flex items-center justify-center gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-purple-600">{learnedCards.length}</div>
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
      </div>
    </>
  );
};

export default B1VocabularyPage;
