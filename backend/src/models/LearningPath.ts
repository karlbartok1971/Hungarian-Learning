import { PrismaClient } from '@prisma/client';
import { CEFRLevel, LearningGoal } from '../../../shared/types';

const prisma = new PrismaClient();

/**
 * Learning Path Model
 *
 * 개인화된 헝가리어 학습 경로를 관리하는 데이터 모델
 * A1→B2 진행과정과 한국인 목회자 특화 커리큘럼을 지원
 */

export interface LearningPath {
  id: string;
  userId: string;
  title: string;
  description: string;

  // 기본 정보
  startLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  primaryGoal: LearningGoal;

  // 시간 계획
  totalDurationWeeks: number;
  estimatedHoursPerWeek: number;
  intensityLevel: IntensityLevel;

  // 학습 단계
  phases: LearningPhase[];

  // 개인화 요소
  personalization: PersonalizationProfile;

  // 진행 상황
  progress: LearningProgress;

  // 적응형 조정 이력
  adaptations: LearningPathAdaptation[];

  // 메타데이터
  createdAt: Date;
  lastUpdated: Date;
  lastAccessed: Date;
  status: LearningPathStatus;
}

export interface LearningPhase {
  phaseId: string;
  phaseNumber: number;
  level: CEFRLevel;
  title: string;
  description: string;

  // 목표 및 성과
  learningGoals: string[];
  expectedOutcomes: string[];

  // 시간 및 구조
  durationWeeks: number;
  modules: LearningModule[];

  // 평가 및 마일스톤
  milestones: Milestone[];

  // 목회자 특화 요소
  pastoralElements?: PastoralSpecialization;

  // 한국인 특화 요소
  koreanLearnerSupport: KoreanLearnerSupport;

  // 상태
  status: PhaseStatus;
  completionDate?: Date;
  actualDurationWeeks?: number;
}

export interface LearningModule {
  moduleId: string;
  title: string;
  description: string;
  type: ModuleType;

  // 내용 구성
  lessons: Lesson[];
  totalLessons: number;
  estimatedHours: number;

  // 학습 목표
  objectives: LearningObjective[];
  prerequisites: string[];

  // 평가
  assessments: ModuleAssessment[];
  passingCriteria: PassingCriteria;

  // 한국인 특화 지원
  koreanSpecificFeatures: {
    contrastiveAnalysis: LanguageContrast[]; // 한-헝 대조분석
    commonDifficulties: Difficulty[];
    culturalNotes: CulturalNote[];
  };

  // 진도 추적
  progress: ModuleProgress;
}

export interface Lesson {
  lessonId: string;
  moduleId: string;
  lessonNumber: number;
  title: string;
  type: LessonType;

  // 학습 내용
  content: LessonContent;
  activities: LearningActivity[];
  resources: LearningResource[];

  // 시간 및 난이도
  estimatedMinutes: number;
  difficulty: number; // 1-10
  complexity: ComplexityLevel;

  // 목회자 관련성
  pastoralRelevance?: {
    context: PastoralContext;
    applicationExamples: string[];
    sermonUsage?: SermonUsageExample;
  };

  // 완료 기준
  completionCriteria: CompletionCriteria;

  // 진행 상태
  status: LessonStatus;
  attempts: number;
  bestScore?: number;
  completedAt?: Date;
}

export interface PersonalizationProfile {
  // 학습자 특성
  learningStyle: LearningStyle;
  preferences: LearningPreferences;
  constraints: LearningConstraints;

  // 강점과 약점
  strengths: SkillArea[];
  weaknesses: SkillArea[];
  priorityAreas: SkillArea[];

  // 한국인 특화 프로필
  koreanLearnerProfile: {
    languageBackground: string[];
    culturalFamiliarity: number; // 1-10
    religiousBackground: string;
    previousHungarianExposure: boolean;
    koreanInterferencePatterns: string[];
  };

  // 목회적 맥락
  ministerialProfile: {
    currentRole: string;
    churchSize: ChurchSize;
    targetCongregation: CongregationType;
    hungarianMinistryGoals: string[];
    urgency: UrgencyLevel;
  };
}

// Enums and Types
export enum IntensityLevel {
  RELAXED = 'relaxed',           // 5-8시간/주
  STANDARD = 'standard',         // 8-12시간/주
  INTENSIVE = 'intensive',       // 12-20시간/주
  ACCELERATED = 'accelerated'    // 20+시간/주
}

export enum LearningPathStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  DISCONTINUED = 'discontinued',
  ARCHIVED = 'archived'
}

export enum PhaseStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped'
}

export enum ModuleType {
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  PRONUNCIATION = 'pronunciation',
  LISTENING = 'listening',
  READING = 'reading',
  SPEAKING = 'speaking',
  CULTURAL = 'cultural',
  THEOLOGICAL = 'theological',
  PRACTICAL = 'practical'
}

export enum LessonType {
  INTRODUCTION = 'introduction',
  CONTENT = 'content',
  PRACTICE = 'practice',
  ASSESSMENT = 'assessment',
  REVIEW = 'review',
  PROJECT = 'project'
}

export enum LessonStatus {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MASTERED = 'mastered'
}

export enum PastoralContext {
  WORSHIP = 'worship',
  PREACHING = 'preaching',
  COUNSELING = 'counseling',
  ADMINISTRATION = 'administration',
  COMMUNITY = 'community',
  BIBLICAL_STUDY = 'biblical_study'
}

export enum ComplexityLevel {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  ADVANCED = 'advanced'
}

export enum UrgencyLevel {
  LOW = 'low',              // 1년 이상 계획
  MEDIUM = 'medium',        // 6개월-1년
  HIGH = 'high',           // 3-6개월
  URGENT = 'urgent'        // 3개월 이내
}

/**
 * Learning Path Model Class
 */
export class LearningPathModel {

  static async createPersonalizedPath(
    userId: string,
    assessmentResults: any,
    preferences: any,
    constraints: any
  ): Promise<LearningPath> {
    const path: LearningPath = {
      id: `path_${Date.now()}_${userId.slice(-4)}`,
      userId,
      title: `${assessmentResults.finalLevel}→B2: 헝가리어 설교 마스터 과정`,
      description: '한국인 목회자를 위한 체계적인 헝가리어 학습 프로그램',
      startLevel: assessmentResults.finalLevel,
      targetLevel: preferences.targetLevel || 'B2',
      primaryGoal: preferences.primaryGoal,
      totalDurationWeeks: 52,
      estimatedHoursPerWeek: preferences.availableTimePerWeek || 10,
      intensityLevel: IntensityLevel.STANDARD,
      phases: [],
      personalization: {} as PersonalizationProfile,
      progress: {} as LearningProgress,
      adaptations: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
      lastAccessed: new Date(),
      status: LearningPathStatus.ACTIVE
    };

    return path;
  }

  static async getPath(pathId: string): Promise<LearningPath | null> {
    // 실제 구현에서는 Prisma 쿼리
    return null;
  }
}

// Supporting type definitions
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'visual_auditory';
export type SkillArea = 'vocabulary' | 'grammar' | 'pronunciation' | 'listening' | 'cultural';
export type ChurchSize = 'small' | 'medium' | 'large' | 'mega';
export type CongregationType = 'korean_immigrants' | 'multicultural' | 'hungarian_native';

export interface LearningProgress {
  overallCompletionPercentage: number;
  currentPhase: number;
  currentModule: string;
  currentLesson: string;
  totalTimeSpentMinutes: number;
}

export interface LearningPathAdaptation {
  adaptationId: string;
  timestamp: Date;
  reason: string;
  changes: any[];
}

export interface Milestone {
  milestoneId: string;
  week: number;
  title: string;
  description: string;
}

export interface PastoralSpecialization {
  focusAreas: string[];
}

export interface KoreanLearnerSupport {
  contrastiveGuidance: any;
}

export interface LearningObjective {
  id: string;
  description: string;
  level: string;
}

export interface ModuleAssessment {
  id: string;
  type: string;
  criteria: any;
}

export interface PassingCriteria {
  minScore: number;
  maxAttempts: number;
}

export interface Difficulty {
  area: string;
  description: string;
  mitigation: string;
}

export interface CulturalNote {
  topic: string;
  explanation: string;
  relevance: string;
}

export interface ModuleProgress {
  completion: number;
  timeSpent: number;
  scores: any[];
}

export interface LessonContent {
  materials: any[];
  instructions: string;
}

export interface LearningActivity {
  type: string;
  content: any;
  duration: number;
}

export interface LearningResource {
  type: string;
  url: string;
  description: string;
}

export interface SermonUsageExample {
  context: string;
  example: string;
}

export interface CompletionCriteria {
  type: string;
  threshold: any;
}

export interface LearningPreferences {
  sessionLength: number;
  difficulty: string;
  feedback: string;
}

export interface LearningConstraints {
  timePerWeek: number;
  sessionsPerWeek: number;
  maxSessionLength: number;
}

export interface LanguageContrast {
  area: string;
  hungarian: string;
  korean: string;
  difficulty: string;
}