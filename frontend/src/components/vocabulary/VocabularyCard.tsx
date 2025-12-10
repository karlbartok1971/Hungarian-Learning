'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Volume2,
  Eye,
  EyeOff,
  Heart,
  Star,
  Clock,
  BookOpen,
  Lightbulb,
  Target,
  Award
} from 'lucide-react';
import PronunciationPlayer from './PronunciationPlayer';

/**
 * VocabularyCard 컴포넌트
 * T094 - 어휘 카드 인터페이스 및 학습 상호작용 구현
 *
 * FSRS 알고리즘과 연동하여 개인화된 어휘 학습 경험 제공
 */

// 어휘 카드 데이터 타입
interface VocabularyCardData {
  card_id: string;
  hungarian_word: string;
  korean_meaning: string;
  pronunciation_ipa?: string;
  pronunciation_hangul?: string;
  audio_url?: string;
  difficulty_level: 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced';
  category: string;
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  examples: {
    id: string;
    hungarian_sentence: string;
    korean_translation: string;
    context: string;
  }[];
  grammar_info: {
    word_class: string;
    case_forms?: Record<string, string>;
  };
  learning_info: {
    korean_mnemonic?: string;
    cultural_context?: string;
    usage_frequency: number;
    formality_level: 'informal' | 'neutral' | 'formal' | 'very_formal';
  };
  fsrs_data: {
    due: string;
    stability: number;
    difficulty: number;
    state: number;
    reps: number;
  };
  learning_stats: {
    total_reviews: number;
    accuracy_rate: number;
    avg_response_time_ms: number;
  };
  is_favorite: boolean;
  user_notes?: string;
  user_tags?: string[];
}

// 학습 모드
type LearningMode = 'recognition' | 'production' | 'listening' | 'review';

// 응답 타입
type ResponseRating = 1 | 2 | 3 | 4; // AGAIN, HARD, GOOD, EASY

interface VocabularyCardProps {
  card: VocabularyCardData;
  mode: LearningMode;
  onResponse?: (rating: ResponseRating, responseTime: number) => void;
  onToggleFavorite?: (cardId: string) => void;
  onPlayAudio?: (audioUrl: string) => void;
  onAddNote?: (cardId: string, note: string) => void;
  showAnswer?: boolean;
  className?: string;
  isReviewMode?: boolean;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  card,
  mode,
  onResponse,
  onToggleFavorite,
  onPlayAudio,
  onAddNote,
  showAnswer = false,
  className,
  isReviewMode = false
}) => {
  const [isFlipped, setIsFlipped] = useState(showAnswer);
  const [responseStartTime, setResponseStartTime] = useState<number>(Date.now());
  const [selectedExample, setSelectedExample] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showPronunciationPlayer, setShowPronunciationPlayer] = useState(false);

  useEffect(() => {
    setResponseStartTime(Date.now());
  }, [card.card_id]);

  // 난이도별 색상 매핑
  const getDifficultyColor = (level: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      elementary: 'bg-blue-100 text-blue-800 border-blue-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      upper_intermediate: 'bg-orange-100 text-orange-800 border-orange-200',
      advanced: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[level as keyof typeof colors] || colors.beginner;
  };

  // CEFR 레벨별 색상
  const getCefrColor = (level: string) => {
    const colors = {
      A1: 'bg-emerald-100 text-emerald-800',
      A2: 'bg-cyan-100 text-cyan-800',
      B1: 'bg-indigo-100 text-indigo-800',
      B2: 'bg-purple-100 text-purple-800',
      C1: 'bg-pink-100 text-pink-800',
      C2: 'bg-rose-100 text-rose-800'
    };
    return colors[level as keyof typeof colors] || colors.A1;
  };

  // 응답 처리
  const handleResponse = (rating: ResponseRating) => {
    if (onResponse) {
      const responseTime = Date.now() - responseStartTime;
      onResponse(rating, responseTime);
    }
  };

  // 카드 뒤집기
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // 음성 재생 - 발음 플레이어로 대체
  const playAudio = () => {
    setShowPronunciationPlayer(true);
  };

  // 즐겨찾기 토글
  const toggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(card.card_id);
    }
  };

  // 진도 계산
  const getProgressInfo = () => {
    const { fsrs_data, learning_stats } = card;
    const isdue = new Date(fsrs_data.due) <= new Date();
    const masteryScore = Math.min(100, (fsrs_data.stability / 21) * 100); // 21일 기준

    return {
      isdue,
      masteryScore,
      reviews: learning_stats.total_reviews,
      accuracy: learning_stats.accuracy_rate
    };
  };

  const progressInfo = getProgressInfo();

  return (
    <Card className={cn(
      "w-full max-w-md mx-auto transition-all duration-300 hover:shadow-lg",
      isFlipped && "ring-2 ring-blue-200",
      progressInfo.isdue && "ring-2 ring-yellow-300",
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-2">
            <Badge className={getDifficultyColor(card.difficulty_level)}>
              {card.difficulty_level}
            </Badge>
            <Badge className={getCefrColor(card.cefr_level)}>
              {card.cefr_level}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={card.is_favorite ? 'text-red-500' : 'text-gray-400'}
            >
              <Heart className={cn("w-4 h-4", card.is_favorite && "fill-current")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={playAudio}
              title="발음 듣기"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 진도 정보 */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            <span>{Math.round(progressInfo.masteryScore)}% 숙달</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>{progressInfo.reviews}회 복습</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-3 h-3" />
            <span>{Math.round(progressInfo.accuracy * 100)}% 정확도</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 메인 콘텐츠 */}
        <div className="text-center space-y-3">
          {/* 앞면: 헝가리어 */}
          {!isFlipped ? (
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-800">
                {card.hungarian_word}
              </div>
              {card.pronunciation_hangul && (
                <div className="text-lg text-gray-600">
                  [{card.pronunciation_hangul}]
                </div>
              )}
              {card.pronunciation_ipa && (
                <div className="text-sm text-gray-500 font-mono">
                  /{card.pronunciation_ipa}/
                </div>
              )}
              {mode === 'production' && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="한국어 뜻을 입력하세요"
                    className="w-full p-2 border border-gray-300 rounded-lg text-center"
                  />
                </div>
              )}
            </div>
          ) : (
            /* 뒷면: 한국어 + 상세 정보 */
            <div className="space-y-4">
              <div className="text-2xl font-bold text-blue-800">
                {card.korean_meaning}
              </div>

              {/* 품사 정보 */}
              <div className="text-sm text-gray-600">
                <Badge variant="outline">
                  {card.grammar_info.word_class}
                </Badge>
                <span className="ml-2">{card.category}</span>
              </div>

              {/* 예문 */}
              {card.examples.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-700">예문:</div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm italic text-gray-700">
                      {card.examples[selectedExample]?.hungarian_sentence}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {card.examples[selectedExample]?.korean_translation}
                    </div>
                  </div>
                  {card.examples.length > 1 && (
                    <div className="flex gap-1 justify-center">
                      {card.examples.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedExample(index)}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            index === selectedExample ? "bg-blue-500" : "bg-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 힌트 및 추가 정보 */}
              {showHint && (
                <div className="space-y-2">
                  {card.learning_info.korean_mnemonic && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-semibold text-yellow-800">
                        <Lightbulb className="w-4 h-4" />
                        기억법
                      </div>
                      <div className="text-sm text-yellow-700 mt-1">
                        {card.learning_info.korean_mnemonic}
                      </div>
                    </div>
                  )}
                  {card.learning_info.cultural_context && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm font-semibold text-blue-800">문화적 맥락</div>
                      <div className="text-sm text-blue-700 mt-1">
                        {card.learning_info.cultural_context}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 사용자 노트 */}
              {card.user_notes && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm font-semibold text-green-800">내 메모</div>
                  <div className="text-sm text-green-700 mt-1">
                    {card.user_notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 조작 버튼들 */}
        <div className="space-y-3">
          {/* 카드 뒤집기 버튼 */}
          <Button
            onClick={toggleFlip}
            variant="outline"
            className="w-full"
          >
            {isFlipped ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                답 숨기기
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                답 보기
              </>
            )}
          </Button>

          {/* 힌트 버튼 */}
          {isFlipped && (card.learning_info.korean_mnemonic || card.learning_info.cultural_context) && (
            <Button
              onClick={() => setShowHint(!showHint)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {showHint ? '힌트 숨기기' : '힌트 보기'}
            </Button>
          )}

          {/* FSRS 응답 버튼들 (복습 모드) */}
          {isReviewMode && isFlipped && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              <Button
                onClick={() => handleResponse(1)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
              >
                다시
              </Button>
              <Button
                onClick={() => handleResponse(2)}
                variant="outline"
                size="sm"
                className="text-orange-600 hover:bg-orange-50"
              >
                어려움
              </Button>
              <Button
                onClick={() => handleResponse(3)}
                variant="outline"
                size="sm"
                className="text-green-600 hover:bg-green-50"
              >
                좋음
              </Button>
              <Button
                onClick={() => handleResponse(4)}
                variant="outline"
                size="sm"
                className="text-blue-600 hover:bg-blue-50"
              >
                쉬움
              </Button>
            </div>
          )}

          {/* 격변화 정보 (명사인 경우) */}
          {isFlipped && card.grammar_info.case_forms && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-semibold text-gray-700 mb-2">격변화</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(card.grammar_info.case_forms).slice(0, 6).map(([caseType, form]) => (
                  <div key={caseType} className="flex justify-between">
                    <span className="text-gray-600">{caseType}:</span>
                    <span className="font-semibold">{form}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 태그 */}
        {card.user_tags && card.user_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.user_tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* 다음 복습 일정 */}
        {progressInfo.isdue ? (
          <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
            <Clock className="w-4 h-4" />
            <span>복습 예정</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>다음 복습: {new Date(card.fsrs_data.due).toLocaleDateString()}</span>
          </div>
        )}

        {/* 발음 플레이어 */}
        {showPronunciationPlayer && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">발음 학습</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPronunciationPlayer(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <PronunciationPlayer
              word={card.hungarian_word}
              audioUrl={card.audio_url}
              showControls={true}
              showPhonetics={true}
              showTips={true}
              className="border rounded-lg"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VocabularyCard;

// 어휘 카드 리스트 컴포넌트
interface VocabularyCardListProps {
  cards: VocabularyCardData[];
  mode: LearningMode;
  onCardResponse?: (cardId: string, rating: ResponseRating, responseTime: number) => void;
  onToggleFavorite?: (cardId: string) => void;
  onPlayAudio?: (audioUrl: string) => void;
  className?: string;
}

export const VocabularyCardList: React.FC<VocabularyCardListProps> = ({
  cards,
  mode,
  onCardResponse,
  onToggleFavorite,
  onPlayAudio,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {cards.map((card) => (
        <VocabularyCard
          key={card.card_id}
          card={card}
          mode={mode}
          onResponse={(rating, responseTime) =>
            onCardResponse?.(card.card_id, rating, responseTime)
          }
          onToggleFavorite={onToggleFavorite}
          onPlayAudio={onPlayAudio}
          isReviewMode={mode === 'review'}
        />
      ))}
    </div>
  );
};

// 어휘 카드 그리드 컴포넌트
interface VocabularyCardGridProps {
  cards: VocabularyCardData[];
  columns?: 1 | 2 | 3 | 4;
  onCardClick?: (cardId: string) => void;
  className?: string;
}

export const VocabularyCardGrid: React.FC<VocabularyCardGridProps> = ({
  cards,
  columns = 2,
  onCardClick,
  className
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {cards.map((card) => (
        <div
          key={card.card_id}
          className="cursor-pointer"
          onClick={() => onCardClick?.(card.card_id)}
        >
          <VocabularyCard
            card={card}
            mode="recognition"
            className="hover:shadow-lg transition-shadow"
          />
        </div>
      ))}
    </div>
  );
};