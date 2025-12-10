/**
 * B2 어휘 학습 페이지
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

// Mock 어휘 데이터 (B2 레벨 - 고급)
const mockVocabulary = {
  신학: [
    {
      id: '1',
      hungarian: 'megváltás',
      korean: '구원, 구속',
      pronunciation: '메그발타시',
      category: '신학',
      level: 'B2',
      example: 'A megváltás Krisztusban van.',
      exampleTranslation: '구원은 그리스도 안에 있습니다.',
      tip: '중요한 신학적 개념',
    },
    {
      id: '2',
      hungarian: 'szentség',
      korean: '거룩함, 성결',
      pronunciation: '센트셰그',
      category: '신학',
      level: 'B2',
      example: 'Az Isten szentségéről prédikálok.',
      exampleTranslation: '하나님의 거룩함에 대해 설교합니다.',
      tip: 'szent = 거룩한 (형용사)',
    },
    {
      id: '3',
      hungarian: 'megtérés',
      korean: '회개',
      pronunciation: '메그테레시',
      category: '신학',
      level: 'B2',
      example: 'A megtérés szükséges az üdvösséghez.',
      exampleTranslation: '회개는 구원에 필수적입니다.',
      tip: 'megtérni = 회개하다',
    },
  ],
  추상개념: [
    {
      id: '4',
      hungarian: 'bölcsesség',
      korean: '지혜',
      pronunciation: '뵐체셰그',
      category: '추상개념',
      level: 'B2',
      example: 'Az Úrtól kérek bölcsességet.',
      exampleTranslation: '주님께 지혜를 구합니다.',
      tip: 'bölcs = 지혜로운',
    },
    {
      id: '5',
      hungarian: 'igazság',
      korean: '진리, 정의',
      pronunciation: '이거주샤그',
      category: '추상개념',
      level: 'B2',
      example: 'Az igazság szabaddá tesz.',
      exampleTranslation: '진리가 너희를 자유케 하리라.',
      tip: '성경 구절에서 자주 사용',
    },
  ],
  수사: [
    {
      id: '6',
      hungarian: 'érvelés',
      korean: '논증, 논거',
      pronunciation: '에르벨레시',
      category: '수사',
      level: 'B2',
      example: 'Az érvelésem bibliai alapon nyugszik.',
      exampleTranslation: '내 논거는 성경적 근거에 기반합니다.',
      tip: '설교에서 중요한 개념',
    },
    {
      id: '7',
      hungarian: 'metafora',
      korean: '은유',
      pronunciation: '메타포라',
      category: '수사',
      level: 'B2',
      example: 'Jézus sok metaforát használt tanításaiban.',
      exampleTranslation: '예수님은 가르침에서 많은 은유를 사용하셨습니다.',
      tip: '수사학적 표현',
    },
  ],
  종교: [
    {
      id: '8',
      hungarian: 'szövetség',
      korean: '언약',
      pronunciation: '쇠베체그',
      category: '종교',
      level: 'B2',
      example: 'Az új szövetség Krisztus vérében van.',
      exampleTranslation: '새 언약은 그리스도의 피 안에 있습니다.',
      tip: 'Ó szövetség = 구약, Új szövetség = 신약',
    },
  ],
};

type Category = '전체' | '신학' | '추상개념' | '수사' | '종교';

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

const B2VocabularyPage = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('신학');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCards, setLearnedCards] = useState<string[]>([]);
  const [needsReview, setNeedsReview] = useState<string[]>([]);
  const [showTip, setShowTip] = useState(false);

  const getCurrentCards = (): VocabCard[] => {
    if (activeCategory === '전체') {
      return [...mockVocabulary.신학, ...mockVocabulary.추상개념, ...mockVocabulary.수사, ...mockVocabulary.종교];
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
        <title>B2 어휘 학습 | 헝가리어 학습 플랫폼</title>
        <meta name="description" content="B2 레벨 헝가리어 어휘 학습" />
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
                <Badge className="bg-orange-100 text-orange-700">B2</Badge>
                <h1 className="text-3xl font-bold text-gray-900">
                  고급 어휘 학습 📚
                </h1>
              </div>
              <p className="text-gray-600">
                설교와 신학을 위한 전문 표현!
              </p>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-orange-50 to-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">학습 진도</span>
                <span className="text-sm font-bold text-orange-600">
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
            <TabsTrigger value="신학">신학</TabsTrigger>
            <TabsTrigger value="추상개념">추상개념</TabsTrigger>
            <TabsTrigger value="수사">수사</TabsTrigger>
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
                  ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300'
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
                      <div className="text-4xl font-bold text-orange-800 mb-2">
                        {currentCard.korean}
                      </div>
                      <Badge variant="outline">{currentCard.category}</Badge>
                    </div>

                    <Card className="bg-white border-orange-200">
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
                  className="bg-orange-600 hover:bg-orange-700"
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
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300">
            <CardContent className="py-12 text-center space-y-6">
              <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  최고입니다! 🎉
                </h2>
                <p className="text-lg text-gray-600">
                  B2 고급 어휘를 모두 정복했습니다!
                </p>
              </div>

              <div className="flex items-center justify-center gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-orange-600">{learnedCards.length}</div>
                  <div className="text-sm text-gray-600">학습 완료</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600">{needsReview.length}</div>
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

        {/* B2 특별 팁 */}
        {!isCompleted && (
          <Card className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-orange-600" />
                B2 레벨 학습 조언
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>💡 신학 용어는 설교 준비에 필수적입니다</p>
              <p>💡 추상 개념은 깊이 있는 성경 해석에 도움됩니다</p>
              <p>💡 수사학 표현은 더 효과적인 전달을 가능하게 합니다</p>
              <p>💡 이 수준의 어휘는 반복 학습이 매우 중요합니다</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default B2VocabularyPage;
