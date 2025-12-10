'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  Square,
  Clock,
  Target,
  Zap,
  BookOpen,
  Trophy,
  RefreshCw,
  Settings,
  TrendingUp
} from 'lucide-react';

interface DroppingWord {
  id: string;
  word: string;
  correctCategory: string;
  position: { x: number; y: number };
  speed: number;
  isActive: boolean;
}

interface DropZone {
  id: string;
  category: string;
  label: string;
  color: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}

interface GameStats {
  score: number;
  timeElapsed: number;
  wordsDropped: number;
  correctCatches: number;
  missedWords: number;
  accuracy: number;
  combo: number;
  level: number;
}

interface GrammarRule {
  category: string;
  words: string[];
  description: string;
  examples: string[];
}

const GrammarDropGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'finished'>('ready');
  const [droppingWords, setDroppingWords] = useState<DroppingWord[]>([]);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    timeElapsed: 0,
    wordsDropped: 0,
    correctCatches: 0,
    missedWords: 0,
    accuracy: 0,
    combo: 0,
    level: 1
  });

  const [selectedTopic, setSelectedTopic] = useState<string>('cases');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameSpeed, setGameSpeed] = useState<number>(1);
  const [showInstructions, setShowInstructions] = useState(true);

  // 문법 규칙 정의
  const grammarRules: { [key: string]: GrammarRule[] } = {
    cases: [
      {
        category: 'nominative',
        words: ['a ház', 'az ember', 'a könyv', 'az alma', 'a macska'],
        description: '주격 - 주어 역할',
        examples: ['A ház nagy. (집이 크다)', 'Az ember dolgozik. (사람이 일한다)']
      },
      {
        category: 'accusative',
        words: ['a házat', 'az embert', 'a könyvet', 'az almát', 'a macskát'],
        description: '대격 - 직접목적어',
        examples: ['Látom a házat. (집을 본다)', 'Olvasom a könyvet. (책을 읽는다)']
      },
      {
        category: 'dative',
        words: ['a háznak', 'az embernek', 'a könyvnek', 'az almának', 'a macskának'],
        description: '여격 - 간접목적어',
        examples: ['Adok az embernek. (사람에게 준다)']
      }
    ],
    verbs: [
      {
        category: 'present',
        words: ['dolgozom', 'tanulok', 'eszem', 'írok', 'olvasok'],
        description: '현재시제',
        examples: ['Most dolgozom. (지금 일한다)']
      },
      {
        category: 'past',
        words: ['dolgoztam', 'tanultam', 'ettem', 'írtam', 'olvastam'],
        description: '과거시제',
        examples: ['Tegnap dolgoztam. (어제 일했다)']
      },
      {
        category: 'future',
        words: ['fog dolgozni', 'fog tanulni', 'fog enni', 'fog írni', 'fog olvasni'],
        description: '미래시제',
        examples: ['Holnap fog dolgozni. (내일 일할 것이다)']
      }
    ]
  };

  // 드롭 존 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rules = grammarRules[selectedTopic];
    const zoneWidth = 180;
    const zoneHeight = 80;
    const canvasWidth = canvas.width;
    const spacing = (canvasWidth - (rules.length * zoneWidth)) / (rules.length + 1);

    const zones: DropZone[] = rules.map((rule, index) => ({
      id: rule.category,
      category: rule.category,
      label: rule.description,
      color: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'][index] || '#6b7280',
      position: {
        x: spacing + index * (zoneWidth + spacing),
        y: canvas.height - zoneHeight - 20
      },
      width: zoneWidth,
      height: zoneHeight
    }));

    setDropZones(zones);
  }, [selectedTopic]);

  // 게임 루프
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 드롭 존 그리기
    dropZones.forEach(zone => {
      ctx.fillStyle = zone.color + '40';
      ctx.strokeStyle = zone.color;
      ctx.lineWidth = 2;
      ctx.fillRect(zone.position.x, zone.position.y, zone.width, zone.height);
      ctx.strokeRect(zone.position.x, zone.position.y, zone.width, zone.height);

      // 라벨
      ctx.fillStyle = zone.color;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        zone.label,
        zone.position.x + zone.width / 2,
        zone.position.y + zone.height / 2 + 5
      );
    });

    // 떨어지는 단어들 업데이트 및 그리기
    setDroppingWords(prev => {
      const updated = prev.map(word => {
        if (!word.isActive) return word;

        const newY = word.position.y + word.speed * gameSpeed;

        // 화면 밖으로 나가면 놓친 것으로 처리
        if (newY > canvas.height) {
          setGameStats(stats => ({
            ...stats,
            missedWords: stats.missedWords + 1,
            combo: 0
          }));
          return { ...word, isActive: false };
        }

        return {
          ...word,
          position: { ...word.position, y: newY }
        };
      }).filter(word => word.isActive || word.position.y <= canvas.height);

      // 단어 그리기
      updated.forEach(word => {
        if (word.isActive) {
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(word.position.x - 2, word.position.y - 2, 84, 24);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(word.position.x, word.position.y, 80, 20);

          ctx.fillStyle = '#1f2937';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            word.word,
            word.position.x + 40,
            word.position.y + 14
          );
        }
      });

      return updated;
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, dropZones, gameSpeed]);

  // 게임 시작
  const startGame = () => {
    setGameState('playing');
    setGameStats({
      score: 0,
      timeElapsed: 0,
      wordsDropped: 0,
      correctCatches: 0,
      missedWords: 0,
      accuracy: 0,
      combo: 0,
      level: 1
    });
    setDroppingWords([]);
    setShowInstructions(false);
  };

  // 게임 일시정지
  const pauseGame = () => {
    setGameState(gameState === 'paused' ? 'playing' : 'paused');
  };

  // 게임 종료
  const stopGame = () => {
    setGameState('finished');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // 새 단어 생성
  const spawnNewWord = useCallback(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rules = grammarRules[selectedTopic];
    const randomRule = rules[Math.floor(Math.random() * rules.length)];
    const randomWord = randomRule.words[Math.floor(Math.random() * randomRule.words.length)];

    const newWord: DroppingWord = {
      id: `word_${Date.now()}_${Math.random()}`,
      word: randomWord,
      correctCategory: randomRule.category,
      position: {
        x: Math.random() * (canvas.width - 80),
        y: -20
      },
      speed: 1 + (gameStats.level - 1) * 0.3,
      isActive: true
    };

    setDroppingWords(prev => [...prev, newWord]);
    setGameStats(prev => ({ ...prev, wordsDropped: prev.wordsDropped + 1 }));
  }, [gameState, selectedTopic, gameStats.level]);

  // 캔버스 클릭 처리
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // 클릭된 단어 찾기
    const clickedWord = droppingWords.find(word => {
      if (!word.isActive) return false;
      return (
        clickX >= word.position.x &&
        clickX <= word.position.x + 80 &&
        clickY >= word.position.y &&
        clickY <= word.position.y + 20
      );
    });

    if (!clickedWord) return;

    // 올바른 드롭 존 찾기
    const targetZone = dropZones.find(zone => zone.id === clickedWord.correctCategory);
    if (!targetZone) return;

    // 점수 계산
    const baseScore = 100;
    const comboBonus = gameStats.combo * 10;
    const speedBonus = Math.max(0, 50 - Math.floor(clickedWord.position.y / 10));
    const totalScore = baseScore + comboBonus + speedBonus;

    // 통계 업데이트
    setGameStats(prev => ({
      ...prev,
      score: prev.score + totalScore,
      correctCatches: prev.correctCatches + 1,
      combo: prev.combo + 1,
      accuracy: ((prev.correctCatches + 1) / prev.wordsDropped) * 100
    }));

    // 단어 제거
    setDroppingWords(prev => prev.filter(word => word.id !== clickedWord.id));

    // 이펙트 표시 (간단한 구현)
    showScoreEffect(clickX, clickY, totalScore);
  };

  // 점수 이펙트
  const showScoreEffect = (x: number, y: number, score: number) => {
    // 간단한 점수 표시 (실제 구현에서는 더 정교한 애니메이션)
    console.log(`+${score} at (${x}, ${y})`);
  };

  // 타이머
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing') {
      timer = setInterval(() => {
        setGameStats(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  // 단어 스폰 타이머
  useEffect(() => {
    let spawnTimer: NodeJS.Timeout;
    if (gameState === 'playing') {
      const spawnInterval = Math.max(1000, 3000 - gameStats.level * 200);
      spawnTimer = setInterval(spawnNewWord, spawnInterval);
    }
    return () => clearInterval(spawnTimer);
  }, [gameState, spawnNewWord, gameStats.level]);

  // 게임 루프 시작
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoop();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // 레벨 업 체크
  useEffect(() => {
    const newLevel = Math.floor(gameStats.score / 1000) + 1;
    if (newLevel > gameStats.level) {
      setGameStats(prev => ({ ...prev, level: newLevel }));
    }
  }, [gameStats.score, gameStats.level]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* 게임 헤더 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                문법 드롭 게임
              </CardTitle>
              <CardDescription>
                떨어지는 단어들을 올바른 문법 카테고리에 클릭해서 넣어보세요!
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1">
                <Trophy className="w-4 h-4 mr-1" />
                {gameStats.score}
              </Badge>
              <Badge variant="outline" className="text-lg px-3 py-1">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(gameStats.timeElapsed)}
              </Badge>
              <Badge variant="outline" className="text-lg px-3 py-1">
                레벨 {gameStats.level}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* 게임 설정 */}
          {gameState === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">학습 주제</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="cases">격변화 (Cases)</option>
                    <option value="verbs">동사 활용 (Verbs)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">난이도</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="easy">쉬움</option>
                    <option value="medium">보통</option>
                    <option value="hard">어려움</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">게임 속도</label>
                  <select
                    value={gameSpeed}
                    onChange={(e) => setGameSpeed(Number(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={0.7}>느림</option>
                    <option value={1}>보통</option>
                    <option value={1.3}>빠름</option>
                  </select>
                </div>
              </div>

              {showInstructions && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">게임 방법</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 위에서 떨어지는 단어들을 클릭하세요</li>
                    <li>• 각 단어는 올바른 문법 카테고리에 해당합니다</li>
                    <li>• 빠르게 클릭할수록 높은 점수를 얻습니다</li>
                    <li>• 연속으로 맞히면 콤보 보너스가 있습니다</li>
                    <li>• 놓치면 콤보가 리셋됩니다</li>
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={startGame} className="flex-1" size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  게임 시작
                </Button>
                <Button
                  onClick={() => setShowInstructions(!showInstructions)}
                  variant="outline"
                  size="lg"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {showInstructions ? '설명 숨기기' : '설명 보기'}
                </Button>
              </div>
            </div>
          )}

          {/* 게임 진행 상황 */}
          {(gameState === 'playing' || gameState === 'paused') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{gameStats.correctCatches}</div>
                  <div className="text-sm text-gray-600">정답</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600">{gameStats.missedWords}</div>
                  <div className="text-sm text-gray-600">놓친 단어</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{gameStats.combo}</div>
                  <div className="text-sm text-gray-600">연속 정답</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {Math.round(gameStats.accuracy)}%
                  </div>
                  <div className="text-sm text-gray-600">정확도</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">{gameStats.level}</div>
                  <div className="text-sm text-gray-600">레벨</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={pauseGame} variant="outline" className="flex-1">
                  {gameState === 'paused' ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                  {gameState === 'paused' ? '계속하기' : '일시정지'}
                </Button>
                <Button onClick={stopGame} variant="destructive" className="flex-1">
                  <Square className="w-4 h-4 mr-2" />
                  게임 종료
                </Button>
              </div>
            </div>
          )}

          {/* 게임 완료 */}
          {gameState === 'finished' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center items-center gap-2 text-2xl font-bold text-blue-600">
                <Trophy className="w-8 h-8" />
                게임 종료!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{gameStats.score}</div>
                  <div className="text-sm text-gray-600">최종 점수</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{gameStats.correctCatches}</div>
                  <div className="text-sm text-gray-600">정답 수</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(gameStats.accuracy)}%
                  </div>
                  <div className="text-sm text-gray-600">정확도</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{gameStats.level}</div>
                  <div className="text-sm text-gray-600">도달 레벨</div>
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                <Button onClick={() => setGameState('ready')} variant="outline">
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

      {/* 게임 캔버스 */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className="border-2 border-gray-200 rounded-lg w-full bg-gradient-to-b from-sky-100 to-blue-200"
                onClick={handleCanvasClick}
                style={{ cursor: 'crosshair' }}
              />
              {gameState === 'paused' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-2xl font-bold">게임 일시정지</div>
                </div>
              )}
            </div>

            {/* 문법 규칙 참고 */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
              {grammarRules[selectedTopic].map((rule, index) => (
                <div key={rule.category} className="bg-gray-50 p-3 rounded-lg">
                  <div
                    className="font-semibold mb-1"
                    style={{ color: dropZones[index]?.color || '#6b7280' }}
                  >
                    {rule.description}
                  </div>
                  <div className="text-xs text-gray-600">
                    예: {rule.examples[0]}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GrammarDropGame;