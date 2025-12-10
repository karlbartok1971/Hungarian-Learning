/**
 * Curriculum API 클라이언트
 * T038 백엔드 Curriculum 서비스와의 통신을 담당
 */

export interface CurriculumLesson {
  id: string;
  title: string;
  titleKorean: string;
  description: string;
  descriptionKorean: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  category: 'grammar' | 'vocabulary' | 'pronunciation' | 'cultural' | 'writing' | 'listening' | 'speaking';
  difficulty: number; // 1-10
  estimatedDuration: number; // 분 단위
  prerequisites: string[]; // lesson IDs
  objectives: string[];
  content: LessonContent;
  exercises: Exercise[];
  resources: LessonResource[];
  tags: string[];
  isComplete: boolean;
  completionRate: number; // 0-1
}

export interface LessonContent {
  introduction: string;
  mainContent: ContentBlock[];
  summary: string;
  keyPoints: string[];
}

export interface ContentBlock {
  type: 'text' | 'audio' | 'video' | 'interactive' | 'example';
  content: string;
  audioUrl?: string;
  videoUrl?: string;
  examples?: Example[];
  metadata?: Record<string, any>;
}

export interface Example {
  hungarian: string;
  korean: string;
  explanation?: string;
  audioUrl?: string;
  context?: string;
}

export interface Exercise {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'matching' | 'translation' | 'listening' | 'speaking';
  question: string;
  options?: string[];
  correctAnswer: string | number | string[];
  feedback: string;
  audioUrl?: string;
  difficulty: number;
  points: number;
}

export interface LessonResource {
  id: string;
  type: 'pdf' | 'audio' | 'video' | 'link' | 'text';
  title: string;
  url: string;
  description?: string;
  size?: number;
}

export interface LearningPath {
  id: string;
  userId: string;
  name: string;
  description: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  targetLevel: 'A1' | 'A2' | 'B1' | 'B2';
  duration: number; // 주 단위
  lessonsPerWeek: number;
  currentLessonId?: string;
  currentWeek: number;
  completedLessons: string[];
  progress: number; // 0-1
  estimatedCompletionDate: string;
  customization: PathCustomization;
  schedule: LearningSchedule[];
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface PathCustomization {
  focusAreas: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  dailyTimeCommitment: number; // 분 단위
  weeklySchedule: string[]; // ['monday', 'wednesday', 'friday']
  includeReligiousContent: boolean;
  culturalInterests: string[];
  skipBasics: boolean;
  intensiveMode: boolean;
}

export interface LearningSchedule {
  week: number;
  lessons: ScheduledLesson[];
  weeklyGoal: string;
  assessment?: {
    lessonId: string;
    requiredScore: number;
  };
}

export interface ScheduledLesson {
  lessonId: string;
  day: number; // 1-7 (Monday-Sunday)
  estimatedTime: number;
  isOptional: boolean;
  dependencies: string[];
}

export interface Milestone {
  id: string;
  week: number;
  title: string;
  description: string;
  requirements: string[];
  reward?: {
    type: 'badge' | 'certificate' | 'unlock';
    value: string;
  };
  isCompleted: boolean;
  completedAt?: string;
}

export interface CurriculumStats {
  totalLessons: number;
  completedLessons: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeSpent: number; // 분
  averageScore: number;
  levelProgress: {
    [level: string]: {
      total: number;
      completed: number;
      score: number;
    };
  };
  categoryProgress: {
    [category: string]: {
      total: number;
      completed: number;
      score: number;
    };
  };
  weeklyActivity: Array<{
    week: string;
    lessonsCompleted: number;
    timeSpent: number;
  }>;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  nameKorean: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt: string;
  progress?: number; // 0-1 for progressive achievements
}

export interface CreateLearningPathRequest {
  assessmentId?: string;
  targetLevel: 'A1' | 'A2' | 'B1' | 'B2';
  customization: PathCustomization;
  skipAssessment?: boolean;
}

export interface UpdateProgressRequest {
  lessonId: string;
  completionRate: number;
  exerciseResults?: ExerciseResult[];
  timeSpent: number;
  notes?: string;
}

export interface ExerciseResult {
  exerciseId: string;
  userAnswer: string | number | string[];
  isCorrect: boolean;
  timeSpent: number;
  attempts: number;
}

class CurriculumApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return this.authToken;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response;
  }

  /**
   * 학습 경로 생성
   */
  async createLearningPath(request: CreateLearningPathRequest): Promise<LearningPath> {
    const response = await this.fetchWithAuth('/curriculum/learning-path', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '학습 경로 생성에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 학습 경로 조회
   */
  async getLearningPath(pathId?: string): Promise<LearningPath> {
    const url = pathId ? `/curriculum/learning-path/${pathId}` : '/curriculum/learning-path/current';
    const response = await this.fetchWithAuth(url);

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '학습 경로 조회에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 학습 경로 업데이트
   */
  async updateLearningPath(pathId: string, updates: Partial<LearningPath>): Promise<LearningPath> {
    const response = await this.fetchWithAuth(`/curriculum/learning-path/${pathId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '학습 경로 업데이트에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 레슨 목록 조회
   */
  async getLessons(options: {
    level?: 'A1' | 'A2' | 'B1' | 'B2';
    category?: string;
    pathId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    lessons: CurriculumLesson[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await this.fetchWithAuth(`/curriculum/lessons?${params}`);

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '레슨 목록 조회에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 특정 레슨 조회
   */
  async getLesson(lessonId: string): Promise<CurriculumLesson> {
    const response = await this.fetchWithAuth(`/curriculum/lessons/${lessonId}`);

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '레슨 조회에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 다음 레슨 조회
   */
  async getNextLesson(currentLessonId?: string): Promise<CurriculumLesson | null> {
    const params = currentLessonId ? `?currentLessonId=${currentLessonId}` : '';
    const response = await this.fetchWithAuth(`/curriculum/lessons/next${params}`);

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '다음 레슨 조회에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 레슨 진도 업데이트
   */
  async updateLessonProgress(lessonId: string, request: UpdateProgressRequest): Promise<{
    lesson: CurriculumLesson;
    pathProgress: number;
    achievements?: Achievement[];
  }> {
    const response = await this.fetchWithAuth(`/curriculum/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '진도 업데이트에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 레슨 완료 처리
   */
  async completeLesson(lessonId: string, finalScore: number, timeSpent: number): Promise<{
    lesson: CurriculumLesson;
    nextLesson?: CurriculumLesson;
    achievements?: Achievement[];
    milestone?: Milestone;
  }> {
    const response = await this.fetchWithAuth(`/curriculum/lessons/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ finalScore, timeSpent }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '레슨 완료 처리에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 커리큘럼 통계 조회
   */
  async getCurriculumStats(): Promise<CurriculumStats> {
    const response = await this.fetchWithAuth('/curriculum/stats');

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '통계 조회에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 추천 레슨 조회
   */
  async getRecommendedLessons(count: number = 5): Promise<CurriculumLesson[]> {
    const response = await this.fetchWithAuth(`/curriculum/recommendations?count=${count}`);

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '추천 레슨 조회에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 학습 경로 리셋
   */
  async resetLearningPath(pathId: string): Promise<LearningPath> {
    const response = await this.fetchWithAuth(`/curriculum/learning-path/${pathId}/reset`, {
      method: 'POST',
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '학습 경로 리셋에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 주간 스케줄 업데이트
   */
  async updateWeeklySchedule(
    pathId: string,
    week: number,
    schedule: ScheduledLesson[]
  ): Promise<LearningSchedule> {
    const response = await this.fetchWithAuth(
      `/curriculum/learning-path/${pathId}/schedule/${week}`,
      {
        method: 'PUT',
        body: JSON.stringify({ schedule }),
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '주간 스케줄 업데이트에 실패했습니다.');
    }

    return data.data;
  }

  /**
   * 업적 조회
   */
  async getAchievements(): Promise<Achievement[]> {
    const response = await this.fetchWithAuth('/curriculum/achievements');

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '업적 조회에 실패했습니다.');
    }

    return data.data;
  }
}

// 싱글톤 인스턴스 생성
export const curriculumApi = new CurriculumApiClient();

// 편의를 위한 개별 함수들 export
export const {
  createLearningPath,
  getLearningPath,
  updateLearningPath,
  getLessons,
  getLesson,
  getNextLesson,
  updateLessonProgress,
  completeLesson,
  getCurriculumStats,
  getRecommendedLessons,
  resetLearningPath,
  updateWeeklySchedule,
  getAchievements,
} = curriculumApi;

export default curriculumApi;