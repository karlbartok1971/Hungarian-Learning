'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import VocabularyCard from './VocabularyCard';
import {
  Play,
  Pause,
  Square,
  SkipForward,
  RotateCcw,
  Clock,
  Target,
  TrendingUp,
  Award,
  Settings,
  Volume2,
  Brain,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

/**
 * ReviewSession 컴포넌트
 * T095 - 복습 세션 인터페이스 및 FSRS 알고리즘 통합
 *
 * 사용자의 복습 세션을 관리하고 실시간 피드백을 제공
 */

// 세션 상태
type SessionStatus = 'pending' | 'active' | 'paused' | 'completed' | 'expired' | 'cancelled';

// 세션 타입
type SessionType = 'daily_review' | 'new_cards' | 'focused_review' | 'quick_review' |
                  'weak_cards' | 'category_focus' | 'challenge_session' | 'free_study';

// 카드 응답 데이터
interface CardResponse {
  card_id: string;
  user_response: string;
  is_correct: boolean;
  response_time_ms: number;
  fsrs_rating: 1 | 2 | 3 | 4;
  hint_used: boolean;
  audio_played: boolean;
  confidence_level?: number;
}

// 세션 진행 상황
interface SessionProgress {
  total_cards: number;
  completed_cards: number;
  remaining_cards: number;
  progress_percentage: number;
  correct_answers: number;
  incorrect_answers: number;
  accuracy_rate: number;
  total_time_spent_ms: number;
  average_response_time_ms: number;
  estimated_remaining_time_ms: number;
}

// 세션 설정
interface SessionSettings {
  max_cards: number;
  time_limit_minutes?: number;
  include_new_cards: boolean;
  include_review_cards: boolean;
  include_learning_cards: boolean;
  show_hints: boolean;
  auto_play_audio: boolean;
  show_examples: boolean;
  randomize_order: boolean;
  enable_gamification: boolean;
}

// 실시간 피드백
interface SessionFeedback {
  type: 'correct' | 'incorrect' | 'hint' | 'encouragement' | 'warning';
  message: string;
  icon?: string;
  color?: string;
  learning_tip?: string;
  points_earned?: number;
  combo_count?: number;
}

// 세션 데이터
interface ReviewSessionData {
  session_id: string;
  user_id: string;
  session_type: SessionType;
  status: SessionStatus;
  settings: SessionSettings;
  cards: any[];
  current_card_index: number;
  progress: SessionProgress;
  created_at: string;
  started_at?: string;
  paused_at?: string;
  completed_at?: string;
  expires_at: string;
  feedback_history: SessionFeedback[];
}

interface ReviewSessionProps {
  sessionId?: string;
  sessionType: SessionType;
  settings?: Partial<SessionSettings>;
  onSessionComplete?: (summary: any) => void;
  onSessionPause?: () => void;
  onSessionResume?: () => void;
  onSessionCancel?: () => void;
  className?: string;
}

const ReviewSession: React.FC<ReviewSessionProps> = ({
  sessionId,
  sessionType,
  settings: propSettings,
  onSessionComplete,
  onSessionPause,
  onSessionResume,
  onSessionCancel,
  className
}) => {
  // 상태 관리
  const [session, setSession] = useState<ReviewSessionData | null>(null);
  const [currentCard, setCurrentCard] = useState<any | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [cardStartTime, setCardStartTime] = useState<number>(0);
  const [responses, setResponses] = useState<CardResponse[]>([]);
  const [feedback, setFeedback] = useState<SessionFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [comboCount, setComboCount] = useState(0);
  const [totalPointsEarned, setTotalPointsEarned] = useState(0);

  // 기본 설정
  const defaultSettings: SessionSettings = {
    max_cards: 20,
    time_limit_minutes: 30,
    include_new_cards: true,
    include_review_cards: true,
    include_learning_cards: true,
    show_hints: true,
    auto_play_audio: false,
    show_examples: true,
    randomize_order: true,
    enable_gamification: true,
    ...propSettings
  };

  // 세션 초기화
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    } else {
      createNewSession();
    }
  }, [sessionId, sessionType]);

  // 세션 로드
  const loadSession = async (id: string) => {
    setIsLoading(true);
    try {
      // API 호출로 세션 데이터 로드
      const response = await fetch(`/api/vocabulary/sessions/${id}`);
      const sessionData = await response.json();

      setSession(sessionData.data);
      setCurrentCard(sessionData.data.cards[sessionData.data.current_card_index]);
      setSessionStartTime(new Date(sessionData.data.started_at || Date.now()).getTime());
      setCardStartTime(Date.now());
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 새 세션 생성
  const createNewSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vocabulary/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_type: sessionType,
          settings: defaultSettings
        })
      });

      const sessionData = await response.json();
      setSession(sessionData.data);
      setCurrentCard(sessionData.data.cards[0]);
      setSessionStartTime(Date.now());
      setCardStartTime(Date.now());
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 세션 시작
  const startSession = async () => {
    if (!session) return;

    try {
      await fetch(`/api/vocabulary/sessions/${session.session_id}/start`, {
        method: 'POST'
      });

      setSession(prev => prev ? { ...prev, status: 'active', started_at: new Date().toISOString() } : null);
      setSessionStartTime(Date.now());
      setCardStartTime(Date.now());
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  // 세션 일시 정지
  const pauseSession = async () => {
    if (!session) return;

    try {
      await fetch(`/api/vocabulary/sessions/${session.session_id}/pause`, {
        method: 'POST'
      });

      setSession(prev => prev ? { ...prev, status: 'paused', paused_at: new Date().toISOString() } : null);
      onSessionPause?.();
    } catch (error) {
      console.error('Failed to pause session:', error);
    }
  };

  // 세션 재시작
  const resumeSession = async () => {
    if (!session) return;

    try {
      await fetch(`/api/vocabulary/sessions/${session.session_id}/resume`, {
        method: 'POST'
      });

      setSession(prev => prev ? { ...prev, status: 'active' } : null);
      setCardStartTime(Date.now());
      onSessionResume?.();
    } catch (error) {
      console.error('Failed to resume session:', error);
    }
  };

  // 카드 응답 처리
  const handleCardResponse = async (rating: 1 | 2 | 3 | 4, responseTime: number) => {
    if (!session || !currentCard) return;

    const response: CardResponse = {
      card_id: currentCard.card_id,
      user_response: '',
      is_correct: rating >= 3,
      response_time_ms: responseTime,
      fsrs_rating: rating,
      hint_used: false,
      audio_played: false
    };

    try {
      // API로 응답 전송
      const result = await fetch(`/api/vocabulary/sessions/${session.session_id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: currentCard.card_id,
          user_response: '',
          response_time_ms: responseTime,
          fsrs_rating: rating,
          hint_used: false,
          audio_played: false
        })
      });

      const responseData = await result.json();

      // 응답 추가
      setResponses(prev => [...prev, response]);

      // 피드백 생성
      generateFeedback(response, responseData);

      // 콤보 및 포인트 계산
      updateComboAndPoints(response);

      // 다음 카드로 이동
      if (autoAdvance) {
        setTimeout(() => moveToNextCard(), 1500);
      }
    } catch (error) {
      console.error('Failed to submit response:', error);
    }
  };

  // 피드백 생성
  const generateFeedback = (response: CardResponse, apiResponse: any) => {
    let feedbackMessage = '';
    let feedbackType: SessionFeedback['type'] = 'correct';
    let learningTip = '';

    if (response.is_correct) {
      const correctMessages = ['정답입니다!', '훌륭해요!', '잘했습니다!', '완벽해요!'];
      feedbackMessage = correctMessages[Math.floor(Math.random() * correctMessages.length)];
      feedbackType = 'correct';

      if (response.response_time_ms < 3000) {
        learningTip = '빠른 응답이었네요! 단어를 잘 기억하고 있어요.';
      }
    } else {
      feedbackMessage = '다시 한 번 연습해보세요!';
      feedbackType = 'incorrect';
      learningTip = '이 단어는 더 자주 복습이 필요합니다.';
    }

    setFeedback({
      type: feedbackType,
      message: feedbackMessage,
      learning_tip: learningTip,
      points_earned: apiResponse.points_earned || 0,
      combo_count: comboCount
    });
  };

  // 콤보 및 포인트 업데이트
  const updateComboAndPoints = (response: CardResponse) => {
    if (response.is_correct) {
      setComboCount(prev => prev + 1);
      setTotalPointsEarned(prev => prev + (10 + comboCount)); // 기본 10점 + 콤보 보너스
    } else {
      setComboCount(0);
    }
  };

  // 다음 카드로 이동
  const moveToNextCard = () => {
    if (!session) return;

    const nextIndex = session.current_card_index + 1;

    if (nextIndex >= session.cards.length) {
      completeSession();
    } else {
      setCurrentCard(session.cards[nextIndex]);
      setSession(prev => prev ? { ...prev, current_card_index: nextIndex } : null);
      setCardStartTime(Date.now());
      setFeedback(null);
    }
  };

  // 이전 카드로 이동
  const moveToPreviousCard = () => {
    if (!session || session.current_card_index <= 0) return;

    const prevIndex = session.current_card_index - 1;
    setCurrentCard(session.cards[prevIndex]);
    setSession(prev => prev ? { ...prev, current_card_index: prevIndex } : null);
    setCardStartTime(Date.now());
    setFeedback(null);
  };

  // 세션 완료
  const completeSession = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/vocabulary/sessions/${session.session_id}/complete`, {
        method: 'POST'
      });

      const completionData = await response.json();
      setSession(prev => prev ? { ...prev, status: 'completed', completed_at: new Date().toISOString() } : null);
      onSessionComplete?.(completionData.data.summary);
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  };

  // 진행률 계산
  const progressInfo = useMemo(() => {
    if (!session) return null;

    const completed = session.current_card_index;
    const total = session.cards.length;
    const correct = responses.filter(r => r.is_correct).length;
    const accuracy = responses.length > 0 ? (correct / responses.length) * 100 : 0;
    const timeSpent = Date.now() - sessionStartTime;

    return {
      completed,
      total,
      percentage: (completed / total) * 100,
      accuracy,
      timeSpent,
      correctCount: correct,
      incorrectCount: responses.length - correct
    };
  }, [session, responses, sessionStartTime]);

  // 세션 타입별 제목
  const getSessionTitle = (type: SessionType): string => {
    const titles = {
      daily_review: '일일 복습',
      new_cards: '새 카드 학습',
      focused_review: '집중 복습',
      quick_review: '빠른 복습',
      weak_cards: '약점 카드',
      category_focus: '카테고리 집중',
      challenge_session: '도전과제',
      free_study: '자유 학습'
    };
    return titles[type] || '어휘 학습';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">세션을 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 세션 헤더 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{getSessionTitle(sessionType)}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>{session.settings.max_cards}장 목표</span>
                </div>
                {session.settings.time_limit_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{session.settings.time_limit_minutes}분 제한</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{totalPointsEarned} 포인트</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>

              {session.status === 'active' ? (
                <Button variant="outline" size="sm" onClick={pauseSession}>
                  <Pause className="w-4 h-4" />
                </Button>
              ) : session.status === 'paused' ? (
                <Button variant="outline" size="sm" onClick={resumeSession}>
                  <Play className="w-4 h-4" />
                </Button>
              ) : session.status === 'pending' ? (
                <Button size="sm" onClick={startSession}>
                  <Play className="w-4 h-4 mr-2" />
                  시작
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>

        {/* 진행률 및 통계 */}
        {progressInfo && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>진행률</span>
                    <span>{progressInfo.completed}/{progressInfo.total}</span>
                  </div>
                  <Progress value={progressInfo.percentage} className="h-2" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(progressInfo.percentage)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {progressInfo.correctCount}
                  </div>
                  <div className="text-sm text-gray-600">정답</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-600">
                    {progressInfo.incorrectCount}
                  </div>
                  <div className="text-sm text-gray-600">오답</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {Math.round(progressInfo.accuracy)}%
                  </div>
                  <div className="text-sm text-gray-600">정확도</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-purple-600">
                    {comboCount}
                  </div>
                  <div className="text-sm text-gray-600">연속 정답</div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 피드백 표시 */}
      {feedback && (
        <Card className={cn(
          "border-2 transition-all duration-300",
          feedback.type === 'correct' ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full",
                feedback.type === 'correct' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              )}>
                {feedback.type === 'correct' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{feedback.message}</div>
                {feedback.learning_tip && (
                  <div className="text-sm text-gray-600 mt-1">
                    {feedback.learning_tip}
                  </div>
                )}
              </div>
              {feedback.points_earned && (
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    +{feedback.points_earned}
                  </div>
                  <div className="text-xs text-gray-500">포인트</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 현재 카드 */}
      {currentCard && session.status === 'active' && (
        <div className="space-y-4">
          <VocabularyCard
            card={currentCard}
            mode="review"
            onResponse={handleCardResponse}
            isReviewMode={true}
            className="max-w-2xl mx-auto"
          />

          {/* 네비게이션 컨트롤 */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={moveToPreviousCard}
              disabled={session.current_card_index === 0}
            >
              이전
            </Button>
            <Button
              variant="outline"
              onClick={moveToNextCard}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              건너뛰기
            </Button>
            <Button
              variant="outline"
              onClick={() => setAutoAdvance(!autoAdvance)}
              className={autoAdvance ? 'bg-blue-50' : ''}
            >
              자동 진행: {autoAdvance ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>
      )}

      {/* 세션 완료 화면 */}
      {session.status === 'completed' && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">🎉</div>
              <div className="text-2xl font-bold">세션 완료!</div>
              <div className="text-gray-600">
                총 {progressInfo?.total}장의 카드를 학습했습니다.
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {progressInfo?.correctCount}
                  </div>
                  <div className="text-sm text-gray-600">정답</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(progressInfo?.accuracy || 0)}%
                  </div>
                  <div className="text-sm text-gray-600">정확도</div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {totalPointsEarned}
                </div>
                <div className="text-sm text-gray-600">획득 포인트</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 세션 설정 (접힌 상태) */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">세션 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span>힌트 표시</span>
                <Badge variant={session.settings.show_hints ? 'default' : 'outline'}>
                  {session.settings.show_hints ? 'ON' : 'OFF'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>자동 음성 재생</span>
                <Badge variant={session.settings.auto_play_audio ? 'default' : 'outline'}>
                  {session.settings.auto_play_audio ? 'ON' : 'OFF'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>예문 표시</span>
                <Badge variant={session.settings.show_examples ? 'default' : 'outline'}>
                  {session.settings.show_examples ? 'ON' : 'OFF'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>게임화 요소</span>
                <Badge variant={session.settings.enable_gamification ? 'default' : 'outline'}>
                  {session.settings.enable_gamification ? 'ON' : 'OFF'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewSession;

// 세션 미리보기 컴포넌트
interface SessionPreviewProps {
  sessionType: SessionType;
  estimatedCards: number;
  estimatedDuration: number;
  onStart: () => void;
  className?: string;
}

export const SessionPreview: React.FC<SessionPreviewProps> = ({
  sessionType,
  estimatedCards,
  estimatedDuration,
  onStart,
  className
}) => {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>{sessionType}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>예상 카드 수:</span>
            <span>{estimatedCards}장</span>
          </div>
          <div className="flex justify-between">
            <span>예상 소요 시간:</span>
            <span>{estimatedDuration}분</span>
          </div>
          <Button onClick={onStart} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            세션 시작
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};