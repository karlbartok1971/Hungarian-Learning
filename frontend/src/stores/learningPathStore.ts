/**
 * 학습 경로 상태 관리 스토어 (Zustand)
 * T039 - 학습 경로, 진도, 레슨 상태를 전역적으로 관리
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  LearningPath,
  CurriculumLesson,
  Achievement,
  Milestone,
  CurriculumStats,
  curriculumApi,
  assessmentApi,
} from '@/services/curriculumApi';

export interface LearningPathState {
  // 상태
  currentPath: LearningPath | null;
  currentLesson: CurriculumLesson | null;
  lessons: CurriculumLesson[];
  stats: CurriculumStats | null;
  achievements: Achievement[];

  // UI 상태
  isLoading: boolean;
  isCreatingPath: boolean;
  isUpdatingProgress: boolean;
  error: string | null;

  // 선택된 상태
  selectedLessonId: string | null;
  filterLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'all';
  filterCategory: string | 'all';

  // 액션들
  actions: {
    // 학습 경로 관리
    createLearningPath: (assessmentId?: string, customization?: any) => Promise<void>;
    loadCurrentPath: () => Promise<void>;
    updatePathProgress: (lessonId: string, progress: number) => Promise<void>;
    resetPath: () => Promise<void>;

    // 레슨 관리
    loadLessons: (filters?: { level?: string; category?: string }) => Promise<void>;
    loadLesson: (lessonId: string) => Promise<void>;
    completeLesson: (lessonId: string, score: number, timeSpent: number) => Promise<void>;
    setSelectedLesson: (lessonId: string | null) => void;

    // 진도 및 통계
    loadStats: () => Promise<void>;
    updateLessonProgress: (lessonId: string, completionRate: number, timeSpent: number) => Promise<void>;

    // 업적
    loadAchievements: () => Promise<void>;

    // 필터링
    setLevelFilter: (level: 'A1' | 'A2' | 'B1' | 'B2' | 'all') => void;
    setCategoryFilter: (category: string | 'all') => void;

    // 유틸리티
    clearError: () => void;
    reset: () => void;
  };
}

export const useLearningPathStore = create<LearningPathState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 초기 상태
        currentPath: null,
        currentLesson: null,
        lessons: [],
        stats: null,
        achievements: [],
        isLoading: false,
        isCreatingPath: false,
        isUpdatingProgress: false,
        error: null,
        selectedLessonId: null,
        filterLevel: 'all',
        filterCategory: 'all',

        actions: {
          // 학습 경로 생성
          createLearningPath: async (assessmentId?, customization?) => {
            set((state) => {
              state.isCreatingPath = true;
              state.error = null;
            });

            try {
              const path = await curriculumApi.createLearningPath({
                assessmentId,
                targetLevel: 'B2', // 기본값, customization으로 덮어쓸 수 있음
                customization: customization || {
                  focusAreas: ['grammar', 'vocabulary'],
                  learningStyle: 'mixed',
                  dailyTimeCommitment: 30,
                  weeklySchedule: ['monday', 'wednesday', 'friday'],
                  includeReligiousContent: true,
                  culturalInterests: ['history', 'traditions'],
                  skipBasics: false,
                  intensiveMode: false,
                },
              });

              set((state) => {
                state.currentPath = path;
                state.isCreatingPath = false;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '학습 경로 생성에 실패했습니다.';
                state.isCreatingPath = false;
              });
              throw error;
            }
          },

          // 현재 학습 경로 로드
          loadCurrentPath: async () => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              const path = await curriculumApi.getLearningPath();

              set((state) => {
                state.currentPath = path;
                state.isLoading = false;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '학습 경로 로드에 실패했습니다.';
                state.isLoading = false;
              });
            }
          },

          // 경로 진도 업데이트
          updatePathProgress: async (lessonId, progress) => {
            set((state) => {
              state.isUpdatingProgress = true;
            });

            try {
              const result = await curriculumApi.updateLessonProgress(lessonId, {
                lessonId,
                completionRate: progress,
                timeSpent: 0, // 실제 사용시에는 추적된 시간 사용
              });

              set((state) => {
                // 레슨 업데이트
                const lessonIndex = state.lessons.findIndex(l => l.id === lessonId);
                if (lessonIndex !== -1) {
                  state.lessons[lessonIndex] = result.lesson;
                }

                // 현재 레슨 업데이트
                if (state.currentLesson?.id === lessonId) {
                  state.currentLesson = result.lesson;
                }

                // 경로 진도 업데이트
                if (state.currentPath) {
                  state.currentPath.progress = result.pathProgress;
                }

                // 새 업적이 있으면 추가
                if (result.achievements) {
                  state.achievements.push(...result.achievements);
                }

                state.isUpdatingProgress = false;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '진도 업데이트에 실패했습니다.';
                state.isUpdatingProgress = false;
              });
              throw error;
            }
          },

          // 학습 경로 리셋
          resetPath: async () => {
            const { currentPath } = get();
            if (!currentPath) return;

            set((state) => {
              state.isLoading = true;
            });

            try {
              const newPath = await curriculumApi.resetLearningPath(currentPath.id);

              set((state) => {
                state.currentPath = newPath;
                state.currentLesson = null;
                state.selectedLessonId = null;
                state.isLoading = false;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '학습 경로 리셋에 실패했습니다.';
                state.isLoading = false;
              });
              throw error;
            }
          },

          // 레슨 목록 로드
          loadLessons: async (filters = {}) => {
            set((state) => {
              state.isLoading = true;
            });

            try {
              const { filterLevel, filterCategory } = get();

              const result = await curriculumApi.getLessons({
                level: filters.level || (filterLevel !== 'all' ? filterLevel : undefined),
                category: filters.category || (filterCategory !== 'all' ? filterCategory : undefined),
                pathId: get().currentPath?.id,
              });

              set((state) => {
                state.lessons = result.lessons;
                state.isLoading = false;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '레슨 목록 로드에 실패했습니다.';
                state.isLoading = false;
              });
            }
          },

          // 특정 레슨 로드
          loadLesson: async (lessonId) => {
            set((state) => {
              state.isLoading = true;
            });

            try {
              const lesson = await curriculumApi.getLesson(lessonId);

              set((state) => {
                state.currentLesson = lesson;
                state.selectedLessonId = lessonId;
                state.isLoading = false;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '레슨 로드에 실패했습니다.';
                state.isLoading = false;
              });
            }
          },

          // 레슨 완료
          completeLesson: async (lessonId, score, timeSpent) => {
            set((state) => {
              state.isUpdatingProgress = true;
            });

            try {
              const result = await curriculumApi.completeLesson(lessonId, score, timeSpent);

              set((state) => {
                // 완료된 레슨 업데이트
                const lessonIndex = state.lessons.findIndex(l => l.id === lessonId);
                if (lessonIndex !== -1) {
                  state.lessons[lessonIndex] = { ...result.lesson, isComplete: true };
                }

                // 현재 레슨 업데이트
                if (state.currentLesson?.id === lessonId) {
                  state.currentLesson = { ...result.lesson, isComplete: true };
                }

                // 다음 레슨 설정
                if (result.nextLesson) {
                  state.selectedLessonId = result.nextLesson.id;
                }

                // 새 업적 추가
                if (result.achievements) {
                  state.achievements.push(...result.achievements);
                }

                state.isUpdatingProgress = false;
              });

              // 통계 새로고침
              get().actions.loadStats();
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '레슨 완료 처리에 실패했습니다.';
                state.isUpdatingProgress = false;
              });
              throw error;
            }
          },

          // 선택된 레슨 설정
          setSelectedLesson: (lessonId) => {
            set((state) => {
              state.selectedLessonId = lessonId;
            });
          },

          // 통계 로드
          loadStats: async () => {
            try {
              const stats = await curriculumApi.getCurriculumStats();

              set((state) => {
                state.stats = stats;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '통계 로드에 실패했습니다.';
              });
            }
          },

          // 레슨 진도 업데이트
          updateLessonProgress: async (lessonId, completionRate, timeSpent) => {
            try {
              await get().actions.updatePathProgress(lessonId, completionRate);
            } catch (error) {
              // 이미 updatePathProgress에서 에러 처리됨
              throw error;
            }
          },

          // 업적 로드
          loadAchievements: async () => {
            try {
              const achievements = await curriculumApi.getAchievements();

              set((state) => {
                state.achievements = achievements;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : '업적 로드에 실패했습니다.';
              });
            }
          },

          // 레벨 필터 설정
          setLevelFilter: (level) => {
            set((state) => {
              state.filterLevel = level;
            });

            // 필터 변경시 레슨 목록 새로고침
            get().actions.loadLessons();
          },

          // 카테고리 필터 설정
          setCategoryFilter: (category) => {
            set((state) => {
              state.filterCategory = category;
            });

            // 필터 변경시 레슨 목록 새로고침
            get().actions.loadLessons();
          },

          // 에러 클리어
          clearError: () => {
            set((state) => {
              state.error = null;
            });
          },

          // 스토어 리셋
          reset: () => {
            set((state) => {
              state.currentPath = null;
              state.currentLesson = null;
              state.lessons = [];
              state.stats = null;
              state.achievements = [];
              state.isLoading = false;
              state.isCreatingPath = false;
              state.isUpdatingProgress = false;
              state.error = null;
              state.selectedLessonId = null;
              state.filterLevel = 'all';
              state.filterCategory = 'all';
            });
          },
        },
      })),
      {
        name: 'learning-path-storage',
        partialize: (state) => ({
          // 지속할 상태만 선택 (API 결과는 제외하고 UI 상태만)
          filterLevel: state.filterLevel,
          filterCategory: state.filterCategory,
          selectedLessonId: state.selectedLessonId,
        }),
      }
    ),
    {
      name: 'learning-path-store',
    }
  )
);

// 편의를 위한 훅들
export const useCurrentPath = () => useLearningPathStore((state) => state.currentPath);
export const useCurrentLesson = () => useLearningPathStore((state) => state.currentLesson);
export const useLessons = () => useLearningPathStore((state) => state.lessons);
export const useStats = () => useLearningPathStore((state) => state.stats);
export const useAchievements = () => useLearningPathStore((state) => state.achievements);
export const useLearningPathActions = () => useLearningPathStore((state) => state.actions);
export const useIsLoading = () => useLearningPathStore((state) =>
  state.isLoading || state.isCreatingPath || state.isUpdatingProgress
);
export const useError = () => useLearningPathStore((state) => state.error);