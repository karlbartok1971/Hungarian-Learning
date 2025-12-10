/**
 * Assessment Flow 통합 컴포넌트
 * T040 - 전체 평가 플로우를 관리하고 에러 처리를 담당
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

import AssessmentStart from './AssessmentStart';
import AssessmentQuestion, { AssessmentQuestionData } from './AssessmentQuestion';
import AssessmentResult from './AssessmentResult';
import {
  useAssessmentStore,
  useCurrentSession,
  useCurrentQuestion,
  useAssessmentActions,
  useAssessmentTimer,
  useAssessmentError,
  useAssessmentLoading,
  useAssessmentValidation,
} from '@/stores/assessmentStore';

export type AssessmentFlowStage = 'start' | 'question' | 'result' | 'error';

export interface AssessmentFlowProps {
  initialStage?: AssessmentFlowStage;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export const AssessmentFlow: React.FC<AssessmentFlowProps> = ({
  initialStage = 'start',
  onComplete,
  onError
}) => {
  const router = useRouter();

  // Zustand store hooks
  const currentSession = useCurrentSession();
  const currentQuestion = useCurrentQuestion();
  const actions = useAssessmentActions();
  const { timeRemaining, isTimerActive } = useAssessmentTimer();
  const error = useAssessmentError();
  const isLoading = useAssessmentLoading();
  const validationErrors = useAssessmentValidation();

  // 로컬 상태
  const [currentStage, setCurrentStage] = useState<AssessmentFlowStage>(initialStage);
  const [retryCount, setRetryCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  // 페이지 새로고침 감지 및 세션 복원
  useEffect(() => {
    const handlePageReload = async () => {
      if (currentSession) {
        try {
          setIsRecovering(true);
          await actions.restoreSession();
          setCurrentStage('question');
        } catch (err) {
          console.error('세션 복원 실패:', err);
          setCurrentStage('start');
        } finally {
          setIsRecovering(false);
        }
      }
    };

    // 브라우저 탭 닫기/새로고침 경고
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentSession && isTimerActive) {
        e.preventDefault();
        e.returnValue = '평가가 진행 중입니다. 페이지를 나가시겠습니까?';
        return e.returnValue;
      }
    };

    // 백스페이스/브라우저 뒤로가기 방지
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && currentSession) {
        const target = e.target as HTMLElement;
        if (!target || (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA')) {
          e.preventDefault();
        }
      }
    };

    handlePageReload();
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSession, isTimerActive, actions]);

  // 에러 상태 감지
  useEffect(() => {
    if (error) {
      setCurrentStage('error');
      onError?.(error);
    }
  }, [error, onError]);

  // 세션 완료 감지
  useEffect(() => {
    if (!currentSession && currentStage === 'question') {
      setCurrentStage('result');
    }
  }, [currentSession, currentStage]);

  // 시간 종료 감지
  useEffect(() => {
    if (timeRemaining === 0 && isTimerActive) {
      handleTimeExpired();
    }
  }, [timeRemaining, isTimerActive]);

  // 평가 시작 핸들러
  const handleStartAssessment = async (config: any) => {
    try {
      setRetryCount(0);
      await actions.startAssessment(config);
      setCurrentStage('question');
    } catch (err) {
      console.error('평가 시작 오류:', err);
      // AssessmentStart 컴포넌트에서 에러 표시됨
    }
  };

  // 답변 제출 핸들러
  const handleAnswerSubmit = async (answer: string) => {
    if (!currentQuestion) return;

    try {
      await actions.submitAnswer(currentQuestion.id, answer);

      // 검증 에러 확인
      const hasValidationError = validationErrors[currentQuestion.id];
      if (hasValidationError) {
        return; // 검증 실패시 다음으로 넘어가지 않음
      }
    } catch (err) {
      console.error('답변 제출 오류:', err);
      // 에러는 store에서 관리되므로 여기서는 로그만
    }
  };

  // 다음 문제 핸들러
  const handleNextQuestion = async () => {
    try {
      await actions.loadNextQuestion();
    } catch (err) {
      console.error('다음 문제 로드 오류:', err);
    }
  };

  // 시간 종료 핸들러
  const handleTimeExpired = async () => {
    try {
      await actions.completeAssessment();
      setCurrentStage('result');
    } catch (err) {
      console.error('시간 종료 처리 오류:', err);
    }
  };

  // 에러 복구 핸들러
  const handleErrorRecovery = async () => {
    if (retryCount >= 3) {
      // 최대 재시도 횟수 초과시 홈으로
      router.push('/dashboard');
      return;
    }

    try {
      setRetryCount(prev => prev + 1);
      actions.clearError();

      // 세션이 있다면 복원 시도
      if (currentSession) {
        await actions.restoreSession();
        setCurrentStage('question');
      } else {
        setCurrentStage('start');
      }
    } catch (err) {
      console.error('에러 복구 실패:', err);
    }
  };

  // 평가 완전 리셋
  const handleResetAssessment = () => {
    actions.resetAssessment();
    setCurrentStage('start');
    setRetryCount(0);
  };

  // 평가 완료 핸들러
  const handleAssessmentComplete = (result: any) => {
    onComplete?.(result);
  };

  // 로딩 상태 렌더링
  if (isRecovering || isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <div>
                <h3 className="text-lg font-semibold">
                  {isRecovering ? '평가 복원 중...' : '로딩 중...'}
                </h3>
                <p className="text-gray-600">
                  {isRecovering ? '이전 평가 세션을 복원하고 있습니다.' : '잠시만 기다려주세요.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 에러 상태 렌더링
  if (currentStage === 'error') {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <strong>평가 중 오류가 발생했습니다</strong>
              <p>{error}</p>
            </div>
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">문제 해결 옵션</h3>

              <div className="space-y-3">
                {retryCount < 3 && (
                  <Button
                    onClick={handleErrorRecovery}
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    평가 복구 시도 ({3 - retryCount}회 남음)
                  </Button>
                )}

                <Button
                  onClick={handleResetAssessment}
                  className="w-full"
                  variant="outline"
                >
                  평가 다시 시작
                </Button>

                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                  variant="secondary"
                >
                  <Home className="w-4 h-4 mr-2" />
                  대시보드로 돌아가기
                </Button>
              </div>

              {retryCount >= 3 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertDescription className="text-yellow-800">
                    계속해서 오류가 발생합니다. 네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 각 단계별 컴포넌트 렌더링
  switch (currentStage) {
    case 'start':
      return (
        <AssessmentStart
          onStart={handleStartAssessment}
          isLoading={isLoading}
        />
      );

    case 'question':
      if (!currentQuestion || !currentSession) {
        setCurrentStage('start');
        return null;
      }

      // AssessmentQuestionData 타입으로 변환
      const questionData: AssessmentQuestionData = {
        id: currentQuestion.id,
        type: currentQuestion.type as any,
        level: currentQuestion.level,
        category: currentQuestion.category as any,
        question: currentQuestion.question,
        options: currentQuestion.options,
        correctAnswer: currentQuestion.correctAnswer,
        audioUrl: currentQuestion.audioUrl,
        context: (currentQuestion as any).context || undefined,
        hint: (currentQuestion as any).hint || undefined,
        pastoralContext: (currentQuestion as any).pastoralContext || false,
      };

      return (
        <div>
          <AssessmentQuestion
            question={questionData}
            questionNumber={useAssessmentStore.getState().currentQuestionIndex}
            totalQuestions={currentSession.totalQuestions}
            onAnswer={handleAnswerSubmit}
            onNext={handleNextQuestion}
            timeRemaining={timeRemaining}
            isLoading={isLoading}
          />

          {/* 검증 에러 표시 */}
          {validationErrors[currentQuestion.id] && (
            <div className="max-w-4xl mx-auto px-6 mt-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {validationErrors[currentQuestion.id]}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      );

    case 'result':
      // 임시 결과 데이터 (실제로는 store에서 가져와야 함)
      const mockResult = {
        sessionId: 'test-session',
        finalLevel: 'A2',
        confidence: 85,
        totalScore: 85,
        maxScore: 100,
        timeSpent: 25,
        completedAt: new Date().toISOString(),
        categoryScores: {
          grammar: { score: 80, maxScore: 100, level: 'A2' },
          vocabulary: { score: 90, maxScore: 100, level: 'B1' },
          pronunciation: { score: 75, maxScore: 100, level: 'A2' },
          cultural: { score: 85, maxScore: 100, level: 'A2' },
        },
        strengths: ['어휘력', '문화적 이해'],
        weaknesses: ['발음', '문법 정확성'],
        koreanSpecificAnalysis: {
          interferenceLevel: 'medium' as const,
          commonMistakes: ['동사 활용', '격변화'],
          improvementAreas: ['발음 연습', '문법 강화'],
        },
        recommendations: {
          immediateSteps: ['매일 발음 연습', '문법 규칙 복습'],
          studyPlan: ['A2 레벨 커리큘럼 시작', '주 3회 학습'],
          estimatedTimeToNextLevel: 12,
        },
      };

      return (
        <AssessmentResult
          result={mockResult}
          onStartLearningPath={() => handleAssessmentComplete(mockResult)}
          onRetakeAssessment={() => setCurrentStage('start')}
          onDownloadReport={() => console.log('Download report')}
          onShareResult={() => console.log('Share result')}
        />
      );

    default:
      return null;
  }
};

export default AssessmentFlow;