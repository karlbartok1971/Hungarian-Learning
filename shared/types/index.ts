// 사용자 관련 타입
export interface User {
  id: string;
  email: string;
  name: string;
  currentLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  learningGoals: LearningGoal[];
  createdAt: Date;
  updatedAt: Date;
}

// CEFR 레벨
export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
}

// 학습 목표
export enum LearningGoal {
  SERMON_WRITING = 'sermon_writing',
  CONVERSATION = 'conversation',
  READING_COMPREHENSION = 'reading_comprehension',
  PRONUNCIATION = 'pronunciation',
  GRAMMAR = 'grammar',
  VOCABULARY = 'vocabulary',
}

// 학습 경로
export interface LearningPath {
  id: string;
  userId: string;
  name: string;
  description: string;
  currentLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  estimatedDuration: number; // 일 단위
  progress: number; // 0-100
  lessons: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

// 레슨
export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: CEFRLevel;
  type: LessonType;
  content: LessonContent;
  estimatedDuration: number; // 분 단위
  isCompleted: boolean;
  order: number;
}

export enum LessonType {
  GRAMMAR = 'grammar',
  VOCABULARY = 'vocabulary',
  PRONUNCIATION = 'pronunciation',
  WRITING = 'writing',
  READING = 'reading',
  LISTENING = 'listening',
  SERMON_PRACTICE = 'sermon_practice',
}

// 레슨 컨텐츠 (유니온 타입으로 다양한 형태 지원)
export type LessonContent =
  | GrammarContent
  | VocabularyContent
  | PronunciationContent
  | WritingContent;

export interface GrammarContent {
  type: 'grammar';
  rules: GrammarRule[];
  exercises: Exercise[];
}

export interface VocabularyContent {
  type: 'vocabulary';
  words: VocabularyItem[];
  exercises: Exercise[];
}

export interface PronunciationContent {
  type: 'pronunciation';
  phrases: PronunciationPhrase[];
  audioExamples: string[];
}

export interface WritingContent {
  type: 'writing';
  prompts: WritingPrompt[];
  examples: string[];
}

// 어휘 아이템
export interface VocabularyItem {
  id: string;
  hungarian: string;
  korean: string;
  phonetic: string;
  level: CEFRLevel;
  category: VocabularyCategory;
  examples: string[];
  audioUrl?: string;
  imageUrl?: string;
  tags: string[];
}

export enum VocabularyCategory {
  RELIGIOUS = 'religious',
  DAILY_LIFE = 'daily_life',
  ACADEMIC = 'academic',
  BUSINESS = 'business',
  FAMILY = 'family',
  FOOD = 'food',
  TRAVEL = 'travel',
  EMOTIONS = 'emotions',
  TIME = 'time',
  NUMBERS = 'numbers',
}

// 발음 관련
export interface PronunciationPhrase {
  id: string;
  hungarian: string;
  phonetic: string;
  audioUrl: string;
  difficulty: number; // 1-10
}

export interface PronunciationAssessment {
  id: string;
  userId: string;
  phraseId: string;
  audioUrl: string;
  score: number; // 0-100
  feedback: string;
  createdAt: Date;
}

// 설교문 관련
export interface SermonDraft {
  id: string;
  userId: string;
  title: string;
  content: string;
  theme: string;
  targetAudience: string;
  status: SermonStatus;
  feedback: SermonFeedback[];
  createdAt: Date;
  updatedAt: Date;
}

export enum SermonStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  COMPLETED = 'completed',
}

export interface SermonFeedback {
  id: string;
  type: FeedbackType;
  message: string;
  suggestions: string[];
  lineNumber?: number;
  createdAt: Date;
}

export enum FeedbackType {
  GRAMMAR = 'grammar',
  VOCABULARY = 'vocabulary',
  STYLE = 'style',
  THEOLOGICAL = 'theological',
  CULTURAL = 'cultural',
}

// 진도 추적
export interface Progress {
  id: string;
  userId: string;
  lessonId: string;
  status: ProgressStatus;
  score?: number;
  timeSpent: number; // 초 단위
  attempts: number;
  lastAttemptAt: Date;
  completedAt?: Date;
}

export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MASTERED = 'mastered',
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 인증 관련
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  currentLevel: CEFRLevel;
  learningGoals: LearningGoal[];
}

// 연습 문제
export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export enum ExerciseType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_BLANK = 'fill_blank',
  TRANSLATION = 'translation',
  PRONUNCIATION = 'pronunciation',
  WRITING = 'writing',
  LISTENING = 'listening',
}

// 문법 규칙
export interface GrammarRule {
  id: string;
  title: string;
  description: string;
  examples: string[];
  level: CEFRLevel;
}

// 작문 프롬프트
export interface WritingPrompt {
  id: string;
  topic: string;
  instructions: string;
  minWords: number;
  maxWords: number;
  level: CEFRLevel;
  category: WritingCategory;
}

export enum WritingCategory {
  PERSONAL = 'personal',
  FORMAL = 'formal',
  ACADEMIC = 'academic',
  SERMON = 'sermon',
  LETTER = 'letter',
  STORY = 'story',
}

// 학습 통계
export interface LearningStats {
  totalLessons: number;
  completedLessons: number;
  totalWords: number;
  masteredWords: number;
  studyStreak: number;
  totalStudyTime: number; // 분 단위
  averageScore: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

// 평가 관련 타입
export enum AssessmentType {
  LEVEL_PLACEMENT = 'level_placement',
  PROGRESS_CHECK = 'progress_check',
  SKILL_SPECIFIC = 'skill_specific',
  ADAPTIVE = 'adaptive'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_BLANK = 'fill_blank',
  TRANSLATION = 'translation',
  LISTENING = 'listening',
  PRONUNCIATION = 'pronunciation',
  WRITING = 'writing'
}

export enum AssessmentStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  level: CEFRLevel;
  category: VocabularyCategory;
  question: string;
  instruction?: string;
  options?: string[];
  correctAnswer: string;
  difficulty: number;
  estimatedTimeSeconds: number;
  tags: string[];
  koreanSpecificFeatures?: {
    interferenceType?: string;
    difficultyForKoreans?: number;
    commonMistakes?: string[];
  };
  pastoralRelevance?: {
    applicable: boolean;
    context?: string;
    examples?: string[];
  };
}

export interface AssessmentSession {
  id: string;
  userId: string;
  type: AssessmentType;
  status: AssessmentStatus;
  configuration: AssessmentConfiguration;
  currentQuestionIndex: number;
  totalQuestions: number;
  responses: QuestionResponse[];
  adaptiveState: AdaptiveState;
  questionHistory: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface AssessmentConfiguration {
  targetLanguage: string;
  sourceLanguage: string;
  primaryGoal: LearningGoal;
  assessmentType: AssessmentType;
  adaptiveMode: boolean;
  koreanSpecificOptimizations: {
    emphasizePronunciation: boolean;
    includeCulturalContext: boolean;
    useKoreanExplanations: boolean;
    adjustForLanguageTransfer: boolean;
  };
  timeConstraints: {
    maxTotalMinutes: number;
    maxQuestionSeconds: number;
    allowPause: boolean;
  };
}

export interface QuestionResponse {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
  confidence: number;
  submittedAt: Date;
}

export interface AssessmentResult {
  sessionId: string;
  finalLevel: CEFRLevel;
  confidence: number;
  detailedScores: {
    vocabulary: number;
    grammar: number;
    listening: number;
    cultural: number;
    pronunciation: number;
  };
  recommendations: {
    startingLevel: CEFRLevel;
    suggestedPath: {
      duration: number;
      focusAreas: string[];
    };
    pastoralRecommendations: {
      sermonWritingReadiness: string;
    };
  };
  statistics: {
    totalQuestions: number;
    correctAnswers: number;
    averageTimePerQuestion: number;
    weakestAreas: string[];
  };
  koreanLearnerAnalysis: {
    interferencePatterns: string[];
    recommendedFocusAreas: string[];
    culturalContextNeeds: string[];
    pronunciationChallenges: string[];
    grammarInterferenceIssues: string[];
    culturalKnowledgeGaps: string[];
  };
}

// CEFR 레벨 계산 결과
export interface LevelCalculationResult {
  estimatedLevel: CEFRLevel;
  confidence: number;
  categoryScores: {
    vocabulary: number;
    grammar: number;
    listening: number;
    cultural: number;
    pronunciation: number;
  };
  strongestCategories: string[];
  weakestCategories: string[];
}

// 문제 결과
export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  timeSpent: number;
  confidence: number;
  category: string;
  level: CEFRLevel;
}

// 사용자 프로필
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  primaryGoal: LearningGoal;
  languageBackground: string[];
  previousHungarianExperience: boolean;
}

// 적응형 상태
export interface AdaptiveState {
  currentLevel: CEFRLevel;
  levelConfidence: number;
  questionCount: number;
  correctAnswers: number;
  averageResponseTime: number;
  difficultyTrend: number[];
  stabilityThreshold: number;
  categoryPerformance: {
    [key: string]: number;
  };
}

// 질문 생성 기준
export interface QuestionGenerationCriteria {
  targetLevel: CEFRLevel;
  category: string;
  difficulty: number;
  excludeIds?: string[];
}

// 한국어 간섭 분석
export interface KoreanInterferenceAnalysis {
  commonMistakes: string[];
  transferIssues: string[];
  culturalContext?: string;
  pronunciationTips?: string[];
}

// 목회자 관련성
export interface PastoralRelevance {
  applicable: boolean;
  context: string[];
  liturgicalUse?: boolean;
  theologicalConnection?: string;
}

// === 한국인 특화 학습 경로 타입들 ===

// 한국-헝가리 언어 간섭 분석
export interface LanguageInterferenceAnalysis {
  phonological: PhonologicalInterference[];
  grammatical: GrammaticalInterference[];
  lexical: LexicalInterference[];
  cultural: CulturalInterference[];
  severity: 'low' | 'medium' | 'high';
}

export interface PhonologicalInterference {
  hungarianSound: string;
  koreanApproximation: string;
  difficulty: number; // 1-10
  practiceExamples: string[];
  commonMistakes: string[];
}

export interface GrammaticalInterference {
  feature: string; // 예: '격변화', '어순', '동사활용'
  hungarianRule: string;
  koreanDifference: string;
  difficulty: number;
  learningStrategy: string;
  practiceExercises: string[];
}

export interface LexicalInterference {
  category: string; // 예: '종교용어', '일상어휘', '문법용어'
  falseFreinds: string[]; // 가짜 친구들
  cognatePairs: string[]; // 동족어
  learningTips: string[];
}

export interface CulturalInterference {
  domain: string; // 예: '종교문화', '사회관습', '언어예의'
  description: string;
  koreanContext: string;
  hungarianContext: string;
  adaptationStrategy: string;
}

// 한국인 특화 학습 경로
export interface KoreanSpecificLearningPath extends LearningPath {
  interferenceAnalysis: LanguageInterferenceAnalysis;
  pastoralSpecialization: PastoralSpecialization;
  adaptiveFeatures: AdaptiveFeatures;
  progressTracking: KoreanLearnerProgressTracking;
}

// 목회자 특화 과정
export interface PastoralSpecialization {
  sermonWritingTrack: SermonWritingTrack;
  liturgicalLanguage: LiturgicalLanguage;
  biblicalVocabulary: BiblicalVocabulary;
  hungarianChurchCulture: ChurchCulture;
}

export interface SermonWritingTrack {
  phases: SermonWritingPhase[];
  milestones: SermonWritingMilestone[];
  practiceAssignments: SermonAssignment[];
}

export interface SermonWritingPhase {
  phase: 'foundation' | 'basic_structure' | 'advanced_rhetoric' | 'cultural_adaptation';
  name: string;
  description: string;
  prerequisites: CEFRLevel;
  duration: number; // 주 단위
  skills: string[];
  assessmentCriteria: string[];
}

export interface SermonWritingMilestone {
  id: string;
  title: string;
  description: string;
  requiredLevel: CEFRLevel;
  deliverables: string[];
  evaluationRubric: string[];
}

export interface SermonAssignment {
  id: string;
  title: string;
  instruction: string;
  expectedLength: number; // 단어 수
  topics: string[];
  difficulty: CEFRLevel;
  feedback: AssignmentFeedback[];
}

export interface AssignmentFeedback {
  aspect: 'grammar' | 'vocabulary' | 'structure' | 'theology' | 'cultural_sensitivity';
  score: number; // 1-5
  comments: string;
  suggestions: string[];
}

// 전례 언어
export interface LiturgicalLanguage {
  prayers: LiturgicalItem[];
  hymns: LiturgicalItem[];
  rituals: LiturgicalItem[];
  seasonalTexts: LiturgicalItem[];
}

export interface LiturgicalItem {
  id: string;
  title: string;
  hungarianText: string;
  koreanTranslation: string;
  pronunciation: string;
  contextualNotes: string[];
  difficulty: CEFRLevel;
}

// 성경 어휘
export interface BiblicalVocabulary {
  categories: BiblicalVocabularyCategory[];
  verses: BiblicalVerse[];
  concepts: TheologicalConcept[];
}

export interface BiblicalVocabularyCategory {
  name: string;
  terms: BiblicalTerm[];
  importance: 'essential' | 'important' | 'supplementary';
}

export interface BiblicalTerm {
  hungarian: string;
  korean: string;
  definition: string;
  biblicalReferences: string[];
  usage: string[];
}

export interface BiblicalVerse {
  reference: string;
  hungarianText: string;
  koreanText: string;
  keyTerms: string[];
  difficulty: CEFRLevel;
}

export interface TheologicalConcept {
  name: string;
  hungarianTerms: string[];
  koreanEquivalent: string;
  definition: string;
  importance: number; // 1-10
}

// 헝가리 교회 문화
export interface ChurchCulture {
  history: CulturalAspect[];
  traditions: CulturalAspect[];
  modernPractices: CulturalAspect[];
  interfaithRelations: CulturalAspect[];
}

export interface CulturalAspect {
  topic: string;
  description: string;
  significance: string;
  practicalImplications: string[];
  learningResources: string[];
}

// 적응형 기능
export interface AdaptiveFeatures {
  difficultyAdjustment: DifficultyAdjustment;
  contentPersonalization: ContentPersonalization;
  scheduleOptimization: ScheduleOptimization;
  motivationalElements: MotivationalElements;
}

export interface DifficultyAdjustment {
  currentDifficulty: number; // 1-10
  adjustmentHistory: DifficultyChange[];
  triggers: AdjustmentTrigger[];
  constraints: AdjustmentConstraint[];
}

export interface DifficultyChange {
  timestamp: Date;
  fromLevel: number;
  toLevel: number;
  reason: string;
  impact: string;
}

export interface AdjustmentTrigger {
  condition: string;
  threshold: number;
  action: string;
  priority: number;
}

export interface AdjustmentConstraint {
  type: string;
  value: number;
  reason: string;
}

// 콘텐츠 개인화
export interface ContentPersonalization {
  preferredTopics: string[];
  avoidedTopics: string[];
  learningStyle: LearningStyle;
  culturalSensitivities: string[];
  timeConstraints: TimeConstraints;
}

export interface LearningStyle {
  visual: number; // 0-1
  auditory: number; // 0-1
  kinesthetic: number; // 0-1
  readingWriting: number; // 0-1
  preferredPace: 'slow' | 'medium' | 'fast';
  practiceFrequency: 'daily' | 'alternate' | 'weekly';
}

export interface TimeConstraints {
  availableHoursPerWeek: number;
  preferredStudyTimes: string[];
  intensivePeriods: string[];
  breakPeriods: string[];
}

// 일정 최적화
export interface ScheduleOptimization {
  studySchedule: StudySchedule;
  milestoneSchedule: MilestoneSchedule;
  reviewSchedule: ReviewSchedule;
  adaptations: ScheduleAdaptation[];
}

export interface StudySchedule {
  weeklyHours: number;
  sessionsPerWeek: number;
  sessionDuration: number; // 분
  preferredTimes: TimeSlot[];
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  priority: number;
}

export interface MilestoneSchedule {
  milestones: ScheduledMilestone[];
  buffer: number; // 여유시간 (일)
  flexibility: 'rigid' | 'moderate' | 'flexible';
}

export interface ScheduledMilestone {
  milestoneId: string;
  targetDate: Date;
  prerequisites: string[];
  estimatedEffort: number; // 시간
}

export interface ReviewSchedule {
  frequency: number; // 일 단위
  intensity: 'light' | 'medium' | 'intensive';
  focusAreas: string[];
}

export interface ScheduleAdaptation {
  trigger: string;
  modification: string;
  impact: string;
  timestamp: Date;
}

// 동기부여 요소
export interface MotivationalElements {
  gamification: GamificationFeatures;
  socialElements: SocialFeatures;
  rewards: RewardSystem;
  progress: ProgressVisualization;
}

export interface GamificationFeatures {
  points: number;
  badges: Badge[];
  achievements: Achievement[];
  streaks: Streak[];
  challenges: Challenge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt?: Date;
  requirements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  target: number;
  reward: string;
}

export interface Streak {
  type: string;
  current: number;
  longest: number;
  lastUpdate: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // 일
  progress: number; // 0-100
  rewards: string[];
}

// 소셜 기능
export interface SocialFeatures {
  studyGroups: StudyGroup[];
  mentorship: MentorshipProgram;
  community: CommunityFeatures;
}

export interface StudyGroup {
  id: string;
  name: string;
  members: string[];
  currentLevel: CEFRLevel;
  activities: string[];
  schedule: string;
}

export interface MentorshipProgram {
  mentor?: UserProfile;
  mentees: UserProfile[];
  schedule: MentorshipSchedule[];
  goals: string[];
}

export interface MentorshipSchedule {
  date: Date;
  duration: number;
  topic: string;
  notes?: string;
}

export interface CommunityFeatures {
  forums: Forum[];
  events: CommunityEvent[];
  resources: CommunityResource[];
}

export interface Forum {
  id: string;
  title: string;
  description: string;
  posts: number;
  lastActivity: Date;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'webinar' | 'workshop' | 'practice' | 'cultural';
  participants: string[];
}

export interface CommunityResource {
  id: string;
  title: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  tags: string[];
}

// 보상 시스템
export interface RewardSystem {
  points: PointSystem;
  unlockables: Unlockable[];
  certificates: Certificate[];
}

export interface PointSystem {
  total: number;
  breakdown: PointBreakdown[];
  spendingHistory: PointSpending[];
}

export interface PointBreakdown {
  source: string;
  amount: number;
  earnedAt: Date;
}

export interface PointSpending {
  item: string;
  cost: number;
  spentAt: Date;
}

export interface Unlockable {
  id: string;
  name: string;
  description: string;
  cost: number; // 포인트
  type: 'content' | 'feature' | 'customization';
  unlocked: boolean;
}

export interface Certificate {
  id: string;
  name: string;
  description: string;
  level: CEFRLevel;
  earnedAt: Date;
  skills: string[];
}

// 진도 시각화
export interface ProgressVisualization {
  charts: ProgressChart[];
  metrics: ProgressMetric[];
  comparisons: ProgressComparison[];
}

export interface ProgressChart {
  type: 'line' | 'bar' | 'pie' | 'radar';
  title: string;
  data: ChartData[];
  period: 'day' | 'week' | 'month' | 'all';
}

export interface ChartData {
  label: string;
  value: number;
  date: Date;
}

export interface ProgressMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface ProgressComparison {
  type: 'peer' | 'historical' | 'goal';
  metric: string;
  userValue: number;
  comparisonValue: number;
  interpretation: string;
}

// 한국인 학습자 진도 추적
export interface KoreanLearnerProgressTracking {
  interferenceReduction: InterferenceReductionTracking;
  culturalAdaptation: CulturalAdaptationTracking;
  sermonWritingProgress: SermonWritingProgressTracking;
  overallProficiency: ProficiencyTracking;
}

export interface InterferenceReductionTracking {
  phoneticImprovements: PhoneticProgress[];
  grammaticalMastery: GrammaticalProgress[];
  lexicalExpansion: LexicalProgress[];
  recentImprovements: string[];
}

export interface PhoneticProgress {
  sound: string;
  accuracy: number; // 0-100
  improvement: number; // 변화량
  lastAssessed: Date;
}

export interface GrammaticalProgress {
  feature: string;
  mastery: number; // 0-100
  accuracy: number; // 0-100
  commonMistakes: string[];
}

export interface LexicalProgress {
  category: string;
  wordsLearned: number;
  retention: number; // 0-100
  activeUse: number; // 0-100
}

export interface CulturalAdaptationTracking {
  culturalCompetency: number; // 0-100
  contextualApprorpriateness: number; // 0-100
  churchCultureFamiliarity: number; // 0-100
  recentLearning: string[];
}

export interface SermonWritingProgressTracking {
  currentPhase: string;
  phaseMastery: number; // 0-100
  completedAssignments: number;
  skillsAcquired: string[];
  recentFeedback: AssignmentFeedback[];
}

export interface ProficiencyTracking {
  currentLevel: CEFRLevel;
  subSkillBreakdown: SubSkillProficiency[];
  projectedTimeline: LevelProjection[];
  milestones: CompletedMilestone[];
}

export interface SubSkillProficiency {
  skill: string;
  level: number; // 0-100
  cefrEquivalent: CEFRLevel;
  lastAssessed: Date;
}

export interface LevelProjection {
  targetLevel: CEFRLevel;
  estimatedDate: Date;
  confidence: number; // 0-100
  assumptions: string[];
}

export interface CompletedMilestone {
  id: string;
  title: string;
  completedAt: Date;
  achievementScore: number;
  feedback: string;
}