/**
 * 평가 상태 관리 스토어 (Zustand)
 * T040 - 평가 플로우, 검증, 에러 처리를 전역적으로 관리
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  AssessmentSession,
  AssessmentQuestion,
  AssessmentResult,
  AssessmentStats,
  CreateAssessmentRequest,
  SubmitAnswerRequest,
  assessmentApi,
} from '@/services/assessmentApi';

export interface AssessmentState {
  // 현재 평가 세션
  currentSession: AssessmentSession | null;
  currentQuestion: AssessmentQuestion | null;
  currentQuestionIndex: number;
  answers: Record<string, string>; // questionId -> answer

  // 평가 결과
  currentResult: AssessmentResult | null;
  stats: AssessmentStats | null;

  // UI 상태
  isLoading: boolean;
  isSubmittingAnswer: boolean;
  isCompletingAssessment: boolean;
  error: string | null;

  // 타이머 상태
  timeRemaining: number; // 초 단위
  isTimerActive: boolean;

  // 검증 상태
  validationErrors: Record<string, string>; // questionId -> error message

  // 액션들
  actions: {
    // 평가 세션 관리
    startAssessment: (config?: CreateAssessmentRequest) => Promise<void>;
    loadCurrentSession: () => Promise<void>;
    completeAssessment: () => Promise<void>;

    // 문제 및 답변 관리
    loadNextQuestion: () => Promise<void>;
    loadPreviousQuestion: () => Promise<void>;
    submitAnswer: (questionId: string, answer: string) => Promise<void>;
    saveAnswer: (questionId: string, answer: string) => void;

    // 타이머 관리
    startTimer: () => void;
    stopTimer: () => void;
    updateTimer: () => void;

    // 검증
    validateAnswer: (questionId: string, answer: string) => boolean;
    clearValidationError: (questionId: string) => void;

    // 결과 및 통계
    loadAssessmentResult: (sessionId: string) => Promise<void>;
    loadAssessmentStats: () => Promise<void>;

    // 유틸리티
    clearError: () => void;
    resetAssessment: () => void;
    restoreSession: () => Promise<void>;
  };
}

export const useAssessmentStore = create<AssessmentState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 초기 상태
        currentSession: null,
        currentQuestion: null,
        currentQuestionIndex: 0,
        answers: {},
        currentResult: null,
        stats: null,
        isLoading: false,
        isSubmittingAnswer: false,
        isCompletingAssessment: false,
        error: null,
        timeRemaining: 0,
        isTimerActive: false,
        validationErrors: {},

        actions: {
          // 평가 시작
          startAssessment: async (config = {}) => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
              state.currentSession = null;
              state.answers = {};
              state.currentQuestionIndex = 0;
              state.validationErrors = {};
            });

            try {
              const session = await assessmentApi.createAssessment(config);

              set((state) => {
                state.currentSession = session;
                state.timeRemaining = session.timeLimit * 60; // 분을 초로 변환
                state.isLoading = false;
              });

              // 첫 번째 문제 로드
              await get().actions.loadNextQuestion();

              // 타이머 시작
              get().actions.startTimer();
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '평가 시작에 실패했습니다.';
                state.isLoading = false;
              });
              throw error;
            }
          },

          // 현재 세션 로드
          loadCurrentSession: async () => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              const session = await assessmentApi.getCurrentAssessment();

              if (session) {
                set((state) => {
                  state.currentSession = session;
                  state.isLoading = false;
                });

                // 현재 문제 로드
                await get().actions.loadNextQuestion();
              } else {
                set((state) => {
                  state.isLoading = false;
                });
              }
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '세션 로드에 실패했습니다.';
                state.isLoading = false;
              });
            }
          },

          // 평가 완료
          completeAssessment: async () => {
            const { currentSession } = get();
            if (!currentSession) {
              throw new Error('진행 중인 평가가 없습니다.');
            }

            set((state) => {
              state.isCompletingAssessment = true;
              state.error = null;
            });

            try {
              // 타이머 중지
              get().actions.stopTimer();

              const result = await assessmentApi.completeAssessment(currentSession.id);

              set((state) => {
                state.currentResult = result;
                state.currentSession = null;
                state.currentQuestion = null;
                state.answers = {};
                state.isCompletingAssessment = false;
                state.timeRemaining = 0;
              });

              return result;
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '평가 완료 처리에 실패했습니다.';
                state.isCompletingAssessment = false;
              });
              throw error;
            }
          },

          // 다음 문제 로드
          loadNextQuestion: async () => {
            const { currentSession, currentQuestionIndex } = get();
            if (!currentSession) return;

            set((state) => {
              state.isLoading = true;
            });

            try {
              const question = await assessmentApi.getNextQuestion(currentSession.id);

              if (question) {
                set((state) => {
                  state.currentQuestion = question;
                  state.currentQuestionIndex = currentQuestionIndex + 1;
                  state.isLoading = false;
                });
              } else {
                // 모든 문제 완료
                await get().actions.completeAssessment();
              }
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '문제 로드에 실패했습니다.';
                state.isLoading = false;
              });
            }
          },

          // 이전 문제 로드 (리뷰 모드)
          loadPreviousQuestion: async () => {
            const { currentQuestionIndex } = get();
            if (currentQuestionIndex <= 1) return;

            set((state) => {
              state.currentQuestionIndex = Math.max(1, currentQuestionIndex - 1);
            });
          },

          // 답변 제출
          submitAnswer: async (questionId, answer) => {
            const { currentSession } = get();
            if (!currentSession) {
              throw new Error('진행 중인 평가가 없습니다.');
            }

            // 답변 검증
            if (!get().actions.validateAnswer(questionId, answer)) {
              return;
            }

            set((state) => {
              state.isSubmittingAnswer = true;
              state.error = null;
            });

            try {
              const request: SubmitAnswerRequest = {
                sessionId: currentSession.id,
                questionId,
                answer,
                timeSpent: 60, // 실제로는 문제 시작 시간부터 계산
              };

              const response = await assessmentApi.submitAnswer(request);

              set((state) => {
                state.answers[questionId] = answer;
                state.isSubmittingAnswer = false;

                // 응답에서 피드백이나 점수가 있다면 저장
                if (response.feedback) {
                  // 피드백 처리 로직
                }
              });

              // 다음 문제로 이동
              await get().actions.loadNextQuestion();
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '답변 제출에 실패했습니다.';
                state.isSubmittingAnswer = false;
              });
              throw error;
            }
          },

          // 답변 임시 저장 (로컬)
          saveAnswer: (questionId, answer) => {
            set((state) => {
              state.answers[questionId] = answer;

              // 검증 에러 클리어
              if (state.validationErrors[questionId]) {
                delete state.validationErrors[questionId];
              }
            });
          },

          // 타이머 시작
          startTimer: () => {
            set((state) => {
              state.isTimerActive = true;
            });

            // 1초마다 업데이트
            const timerId = setInterval(() => {
              const { isTimerActive, timeRemaining } = get();

              if (!isTimerActive || timeRemaining <= 0) {
                clearInterval(timerId);
                if (timeRemaining <= 0) {
                  // 시간 종료시 자동 완료
                  get().actions.completeAssessment();
                }
                return;
              }

              get().actions.updateTimer();
            }, 1000);
          },

          // 타이머 중지
          stopTimer: () => {
            set((state) => {
              state.isTimerActive = false;
            });
          },

          // 타이머 업데이트
          updateTimer: () => {
            set((state) => {
              state.timeRemaining = Math.max(0, state.timeRemaining - 1);
            });
          },

          // 답변 검증
          validateAnswer: (questionId, answer) => {
            const { currentQuestion } = get();
            if (!currentQuestion || currentQuestion.id !== questionId) {
              return false;
            }

            let isValid = true;
            let errorMessage = '';

            // 기본 검증: 빈 답변
            if (!answer || answer.trim().length === 0) {
              isValid = false;
              errorMessage = '답변을 입력해주세요.';
            }

            // 문제 타입별 검증
            switch (currentQuestion.type) {
              case 'multiple_choice':
                if (!currentQuestion.options?.includes(answer)) {
                  isValid = false;
                  errorMessage = '유효한 선택지를 선택해주세요.';
                }
                break;

              case 'fill_blank':
                if (answer.trim().length < 1) {
                  isValid = false;
                  errorMessage = '답변을 입력해주세요.';
                }
                break;

              case 'essay':
                if (answer.trim().length < 50) {
                  isValid = false;
                  errorMessage = '최소 50글자 이상 작성해주세요.';
                }
                break;

              case 'audio_recognition':
                if (answer.trim().length < 2) {
                  isValid = false;
                  errorMessage = '들은 내용을 입력해주세요.';
                }
                break;
            }

            // 검증 결과 저장
            if (!isValid) {
              set((state) => {
                state.validationErrors[questionId] = errorMessage;
              });
            } else {
              set((state) => {
                if (state.validationErrors[questionId]) {
                  delete state.validationErrors[questionId];
                }
              });
            }

            return isValid;
          },

          // 검증 에러 클리어
          clearValidationError: (questionId) => {
            set((state) => {
              if (state.validationErrors[questionId]) {
                delete state.validationErrors[questionId];
              }
            });
          },

          // 평가 결과 로드
          loadAssessmentResult: async (sessionId) => {
            set((state) => {
              state.isLoading = true;
            });

            try {
              const result = await assessmentApi.getAssessmentResult(sessionId);

              set((state) => {
                state.currentResult = result;
                state.isLoading = false;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '결과 로드에 실패했습니다.';
                state.isLoading = false;
              });
            }
          },

          // 평가 통계 로드
          loadAssessmentStats: async () => {
            try {
              const stats = await assessmentApi.getAssessmentStats();

              set((state) => {
                state.stats = stats;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '통계 로드에 실패했습니다.';
              });
            }
          },

          // 에러 클리어
          clearError: () => {
            set((state) => {
              state.error = null;
            });
          },

          // 평가 리셋
          resetAssessment: () => {
            set((state) => {
              state.currentSession = null;
              state.currentQuestion = null;
              state.currentQuestionIndex = 0;
              state.answers = {};
              state.currentResult = null;
              state.timeRemaining = 0;
              state.isTimerActive = false;
              state.validationErrors = {};
              state.error = null;
              state.isLoading = false;
              state.isSubmittingAnswer = false;
              state.isCompletingAssessment = false;
            });
          },

          // 세션 복원 (새로고침 후)
          restoreSession: async () => {
            const storedSession = localStorage.getItem('assessment-session');
            if (storedSession) {
              try {
                const session = JSON.parse(storedSession);
                await get().actions.loadCurrentSession();
              } catch (error) {
                console.warn('세션 복원에 실패했습니다:', error);
              }
            }
          },
        },
      })),
      {
        name: 'assessment-storage',
        partialize: (state) => ({
          // 지속할 상태만 선택 (세션 ID, 답변 등)
          answers: state.answers,
          currentQuestionIndex: state.currentQuestionIndex,
          timeRemaining: state.timeRemaining,
        }),
      }
    ),
    {
      name: 'assessment-store',
    }
  )
);

// 편의를 위한 훅들
export const useCurrentSession = () => useAssessmentStore((state) => state.currentSession);
export const useCurrentQuestion = () => useAssessmentStore((state) => state.currentQuestion);
export const useAnswers = () => useAssessmentStore((state) => state.answers);
export const useAssessmentResult = () => useAssessmentStore((state) => state.currentResult);
export const useAssessmentStats = () => useAssessmentStore((state) => state.stats);
export const useAssessmentActions = () => useAssessmentStore((state) => state.actions);
export const useAssessmentTimer = () => useAssessmentStore((state) => ({
  timeRemaining: state.timeRemaining,
  isTimerActive: state.isTimerActive,
}));
export const useAssessmentValidation = () => useAssessmentStore((state) => state.validationErrors);
export const useAssessmentLoading = () => useAssessmentStore((state) =>
  state.isLoading || state.isSubmittingAnswer || state.isCompletingAssessment
);
export const useAssessmentError = () => useAssessmentStore((state) => state.error);