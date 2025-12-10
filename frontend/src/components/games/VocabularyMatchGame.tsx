'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shuffle,
  Clock,
  Star,
  Trophy,
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle,
  Target,
  Brain
} from 'lucide-react';

interface VocabularyItem {
  id: string;
  hungarian_word: string;
  korean_meaning: string;
  category: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2';
  is_theological: boolean;
}

interface MatchedPair {
  hungarianId: string;
  koreanId: string;
  isCorrect: boolean;
}

interface GameState {
  status: 'ready' | 'playing' | 'completed' | 'paused';
  score: number;
  timeElapsed: number;
  correctMatches: number;
  totalPairs: number;
  streak: number;
  mistakes: number;
}

interface GameCard {
  id: string;
  content: string;
  type: 'hungarian' | 'korean';
  vocabularyId: string;
  isSelected: boolean;
  isMatched: boolean;
  isCorrect?: boolean;
}

const VocabularyMatchGame: React.FC = () => {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [gameCards, setGameCards] = useState<GameCard[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    status: 'ready',
    score: 0,
    timeElapsed: 0,
    correctMatches: 0,
    totalPairs: 6,
    streak: 0,
    mistakes: 0
  });
  const [selectedCards, setSelectedCards] = useState<GameCard[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<MatchedPair[]>([]);
  const [difficulty, setDifficulty] = useState<'A1' | 'A2' | 'B1' | 'B2'>('A2');
  const [gameMode, setGameMode] = useState<'standard' | 'theological' | 'mixed'>('standard');
  const [showCelebration, setShowCelebration] = useState(false);

  // 게임 타이머
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.status === 'playing') {
      timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState.status]);

  // 어휘 데이터 로드
  const loadVocabulary = useCallback(async () => {
    // 시뮬레이션된 어휘 데이터
    const mockVocabulary: VocabularyItem[] = [
      { id: '1', hungarian_word: 'ház', korean_meaning: '집', category: 'daily_life', difficulty: 'A1', is_theological: false },
      { id: '2', hungarian_word: 'víz', korean_meaning: '물', category: 'daily_life', difficulty: 'A1', is_theological: false },
      { id: '3', hungarian_word: 'ember', korean_meaning: '사람', category: 'daily_life', difficulty: 'A1', is_theological: false },
      { id: '4', hungarian_word: 'alma', korean_meaning: '사과', category: 'food', difficulty: 'A1', is_theological: false },
      { id: '5', hungarian_word: 'könyv', korean_meaning: '책', category: 'education', difficulty: 'A1', is_theological: false },
      { id: '6', hungarian_word: 'barát', korean_meaning: '친구', category: 'relationships', difficulty: 'A1', is_theological: false },

      // A2 레벨
      { id: '7', hungarian_word: 'család', korean_meaning: '가족', category: 'relationships', difficulty: 'A2', is_theological: false },
      { id: '8', hungarian_word: 'munka', korean_meaning: '일', category: 'work', difficulty: 'A2', is_theological: false },
      { id: '9', hungarian_word: 'iskola', korean_meaning: '학교', category: 'education', difficulty: 'A2', is_theological: false },
      { id: '10', hungarian_word: 'időjárás', korean_meaning: '날씨', category: 'nature', difficulty: 'A2', is_theological: false },
      { id: '11', hungarian_word: 'egészség', korean_meaning: '건강', category: 'health', difficulty: 'A2', is_theological: false },
      { id: '12', hungarian_word: 'szeretet', korean_meaning: '사랑', category: 'emotions', difficulty: 'A2', is_theological: false },

      // 신학 관련 어휘
      { id: '13', hungarian_word: 'Isten', korean_meaning: '하나님', category: 'theology', difficulty: 'A1', is_theological: true },
      { id: '14', hungarian_word: 'ima', korean_meaning: '기도', category: 'theology', difficulty: 'A1', is_theological: true },
      { id: '15', hungarian_word: 'templom', korean_meaning: '교회', category: 'theology', difficulty: 'A1', is_theological: true },
      { id: '16', hungarian_word: 'hit', korean_meaning: '믿음', category: 'theology', difficulty: 'A2', is_theological: true },
      { id: '17', hungarian_word: 'áldás', korean_meaning: '축복', category: 'theology', difficulty: 'A2', is_theological: true },
      { id: '18', hungarian_word: 'megváltás', korean_meaning: '구원', category: 'theology', difficulty: 'B1', is_theological: true },
    ];

    // 난이도와 모드에 따라 필터링
    let filteredVocab = mockVocabulary.filter(item => item.difficulty === difficulty);

    if (gameMode === 'theological') {
      filteredVocab = filteredVocab.filter(item => item.is_theological);
    } else if (gameMode === 'standard') {
      filteredVocab = filteredVocab.filter(item => !item.is_theological);
    }

    // 게임에 사용할 단어 개수만큼 랜덤 선택
    const shuffled = filteredVocab.sort(() => Math.random() - 0.5);
    setVocabulary(shuffled.slice(0, gameState.totalPairs));
  }, [difficulty, gameMode, gameState.totalPairs]);

  // 게임 카드 생성
  const generateGameCards = useCallback(() => {
    const cards: GameCard[] = [];

    vocabulary.forEach(item => {
      // 헝가리어 카드
      cards.push({
        id: `hun_${item.id}`,
        content: item.hungarian_word,
        type: 'hungarian',
        vocabularyId: item.id,
        isSelected: false,
        isMatched: false
      });

      // 한국어 카드
      cards.push({
        id: `kor_${item.id}`,
        content: item.korean_meaning,
        type: 'korean',
        vocabularyId: item.id,
        isSelected: false,
        isMatched: false
      });
    });

    // 카드 섞기
    const shuffledCards = cards.sort(() => Math.random() - 0.5);
    setGameCards(shuffledCards);
  }, [vocabulary]);

  // 게임 시작
  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      score: 0,
      timeElapsed: 0,
      correctMatches: 0,
      streak: 0,
      mistakes: 0
    }));
    setSelectedCards([]);
    setMatchedPairs([]);
    setShowCelebration(false);
    generateGameCards();
  };

  // 카드 선택 처리
  const handleCardSelect = (card: GameCard) => {
    if (card.isMatched || card.isSelected || selectedCards.length >= 2) {
      return;
    }

    const updatedCard = { ...card, isSelected: true };
    const newSelectedCards = [...selectedCards, updatedCard];
    setSelectedCards(newSelectedCards);

    // 카드 상태 업데이트
    setGameCards(prev =>
      prev.map(c => (c.id === card.id ? updatedCard : c))
    );

    // 2장이 선택되면 매칭 검사
    if (newSelectedCards.length === 2) {
      setTimeout(() => checkMatch(newSelectedCards), 500);
    }
  };

  // 매칭 검사
  const checkMatch = (cards: GameCard[]) => {
    const [card1, card2] = cards;
    const isMatch = card1.vocabularyId === card2.vocabularyId && card1.type !== card2.type;

    if (isMatch) {
      // 정답 처리
      handleCorrectMatch(card1, card2);
    } else {
      // 오답 처리
      handleIncorrectMatch(card1, card2);
    }

    // 선택된 카드 초기화
    setSelectedCards([]);
  };

  // 정답 처리
  const handleCorrectMatch = (card1: GameCard, card2: GameCard) => {
    const newPair: MatchedPair = {
      hungarianId: card1.type === 'hungarian' ? card1.id : card2.id,
      koreanId: card1.type === 'korean' ? card1.id : card2.id,
      isCorrect: true
    };

    setMatchedPairs(prev => [...prev, newPair]);

    // 카드 상태 업데이트
    setGameCards(prev =>
      prev.map(card => {
        if (card.id === card1.id || card.id === card2.id) {
          return { ...card, isMatched: true, isCorrect: true, isSelected: false };
        }
        return { ...card, isSelected: false };
      })
    );

    // 게임 상태 업데이트
    setGameState(prev => {
      const newCorrectMatches = prev.correctMatches + 1;
      const newStreak = prev.streak + 1;
      const baseScore = 100;
      const streakBonus = Math.min(newStreak * 10, 100); // 연속 보너스 (최대 100)
      const timeBonus = Math.max(0, 60 - prev.timeElapsed); // 시간 보너스
      const scoreIncrease = baseScore + streakBonus + timeBonus;

      return {
        ...prev,
        correctMatches: newCorrectMatches,
        streak: newStreak,
        score: prev.score + scoreIncrease
      };
    });

    // 게임 완료 확인
    if (gameState.correctMatches + 1 >= gameState.totalPairs) {
      completeGame();
    }
  };

  // 오답 처리
  const handleIncorrectMatch = (card1: GameCard, card2: GameCard) => {
    // 카드 상태 업데이트 (잠시 빨간색으로 표시)
    setGameCards(prev =>
      prev.map(card => {
        if (card.id === card1.id || card.id === card2.id) {
          return { ...card, isCorrect: false, isSelected: false };
        }
        return { ...card, isSelected: false };
      })
    );

    // 게임 상태 업데이트
    setGameState(prev => ({
      ...prev,
      mistakes: prev.mistakes + 1,
      streak: 0, // 연속 기록 초기화
      score: Math.max(0, prev.score - 25) // 실수 페널티
    }));

    // 잠시 후 오답 표시 제거
    setTimeout(() => {
      setGameCards(prev =>
        prev.map(card => ({ ...card, isCorrect: undefined }))
      );
    }, 1000);
  };

  // 게임 완료
  const completeGame = () => {
    setGameState(prev => ({ ...prev, status: 'completed' }));
    setShowCelebration(true);

    // 성과 보고 (API 호출)
    reportGameResults();

    setTimeout(() => setShowCelebration(false), 3000);
  };

  // 게임 결과 보고
  const reportGameResults = async () => {
    const results = {
      game_type: 'vocabulary_match',
      difficulty: difficulty,
      mode: gameMode,
      score: gameState.score,
      time_taken: gameState.timeElapsed,
      correct_matches: gameState.correctMatches,
      mistakes: gameState.mistakes,
      accuracy: (gameState.correctMatches / (gameState.correctMatches + gameState.mistakes)) * 100
    };

    try {
      // API 호출 (실제 구현에서)
      console.log('Game results:', results);
    } catch (error) {
      console.error('Failed to report game results:', error);
    }
  };

  // 게임 재시작
  const restartGame = () => {
    setGameState(prev => ({
      ...prev,
      status: 'ready',
      score: 0,
      timeElapsed: 0,
      correctMatches: 0,
      streak: 0,
      mistakes: 0
    }));
    setSelectedCards([]);
    setMatchedPairs([]);
    setGameCards([]);
    loadVocabulary();
  };

  // 카드 스타일 결정
  const getCardStyle = (card: GameCard) => {
    let baseClasses = 'p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center min-h-[80px] flex items-center justify-center';

    if (card.isMatched) {
      if (card.isCorrect) {
        baseClasses += ' bg-green-100 border-green-500 text-green-800';
      } else {
        baseClasses += ' bg-red-100 border-red-500 text-red-800';
      }
    } else if (card.isSelected) {
      baseClasses += ' bg-blue-100 border-blue-500 text-blue-800 scale-105';
    } else if (card.isCorrect === false) {
      baseClasses += ' bg-red-100 border-red-500 text-red-800 animate-pulse';
    } else {
      baseClasses += card.type === 'hungarian'
        ? ' bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100'
        : ' bg-orange-50 border-orange-200 hover:border-orange-400 hover:bg-orange-100';
    }

    return baseClasses;
  };

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    loadVocabulary();
  }, [loadVocabulary]);

  useEffect(() => {
    if (vocabulary.length > 0) {
      generateGameCards();
    }
  }, [vocabulary, generateGameCards]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 게임 헤더 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                어휘 매칭 게임
              </CardTitle>
              <CardDescription>
                헝가리어 단어와 한국어 뜻을 매칭해보세요!
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1">
                점수: {gameState.score}
              </Badge>
              <Badge variant="outline" className="text-lg px-3 py-1">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(gameState.timeElapsed)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* 게임 설정 */}
          {gameState.status === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">난이도</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="A1">A1 - 기초</option>
                    <option value="A2">A2 - 초급</option>
                    <option value="B1">B1 - 중급</option>
                    <option value="B2">B2 - 중고급</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">게임 모드</label>
                  <select
                    value={gameMode}
                    onChange={(e) => setGameMode(e.target.value as any)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="standard">일반 어휘</option>
                    <option value="theological">신학 어휘</option>
                    <option value="mixed">혼합 모드</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">카드 쌍 수</label>
                  <select
                    value={gameState.totalPairs}
                    onChange={(e) => setGameState(prev => ({ ...prev, totalPairs: Number(e.target.value) }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={4}>4쌍 (쉬움)</option>
                    <option value={6}>6쌍 (보통)</option>
                    <option value={8}>8쌍 (어려움)</option>
                  </select>
                </div>
              </div>

              <Button onClick={startGame} className="w-full" size="lg">
                <Target className="w-4 h-4 mr-2" />
                게임 시작하기
              </Button>
            </div>
          )}

          {/* 게임 진행 상황 */}
          {gameState.status === 'playing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{gameState.correctMatches}</div>
                  <div className="text-sm text-gray-600">정답</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{gameState.mistakes}</div>
                  <div className="text-sm text-gray-600">실수</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{gameState.streak}</div>
                  <div className="text-sm text-gray-600">연속 정답</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((gameState.correctMatches / gameState.totalPairs) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">진행률</div>
                </div>
              </div>

              <Progress
                value={(gameState.correctMatches / gameState.totalPairs) * 100}
                className="h-3"
              />
            </div>
          )}

          {/* 게임 완료 */}
          {gameState.status === 'completed' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center items-center gap-2 text-2xl font-bold text-green-600">
                <Trophy className="w-8 h-8" />
                게임 완료!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{gameState.score}</div>
                  <div className="text-sm text-gray-600">최종 점수</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatTime(gameState.timeElapsed)}</div>
                  <div className="text-sm text-gray-600">소요 시간</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((gameState.correctMatches / (gameState.correctMatches + gameState.mistakes)) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">정확도</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    +{Math.round(gameState.score * 0.1)}
                  </div>
                  <div className="text-sm text-gray-600">경험치</div>
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                <Button onClick={restartGame} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 하기
                </Button>
                <Button onClick={() => window.location.href = '/games'}>
                  다른 게임하기
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 게임 카드 그리드 */}
      {gameState.status === 'playing' && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {gameCards.map(card => (
                <div
                  key={card.id}
                  className={getCardStyle(card)}
                  onClick={() => handleCardSelect(card)}
                >
                  <div className="font-medium text-lg">
                    {card.content}
                  </div>
                  {card.type === 'hungarian' && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs">
                      HU
                    </Badge>
                  )}
                  {card.type === 'korean' && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs">
                      KR
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* 선택된 카드 표시 */}
            {selectedCards.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">선택된 카드:</div>
                <div className="flex gap-2">
                  {selectedCards.map(card => (
                    <Badge key={card.id} variant="outline">
                      {card.content}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 축하 애니메이션 */}
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg text-center animate-bounce">
            <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">축하합니다!</h2>
            <p className="text-gray-600">모든 단어를 성공적으로 매칭했습니다!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabularyMatchGame;