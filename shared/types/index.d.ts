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
export declare enum CEFRLevel {
    A1 = "A1",
    A2 = "A2",
    B1 = "B1",
    B2 = "B2"
}
export declare enum LearningGoal {
    SERMON_WRITING = "sermon_writing",
    CONVERSATION = "conversation",
    READING_COMPREHENSION = "reading_comprehension",
    PRONUNCIATION = "pronunciation",
    GRAMMAR = "grammar",
    VOCABULARY = "vocabulary"
}
export interface LearningPath {
    id: string;
    userId: string;
    name: string;
    description: string;
    currentLevel: CEFRLevel;
    targetLevel: CEFRLevel;
    estimatedDuration: number;
    progress: number;
    lessons: Lesson[];
    createdAt: Date;
    updatedAt: Date;
}
export interface Lesson {
    id: string;
    title: string;
    description: string;
    level: CEFRLevel;
    type: LessonType;
    content: LessonContent;
    estimatedDuration: number;
    isCompleted: boolean;
    order: number;
}
export declare enum LessonType {
    GRAMMAR = "grammar",
    VOCABULARY = "vocabulary",
    PRONUNCIATION = "pronunciation",
    WRITING = "writing",
    READING = "reading",
    LISTENING = "listening",
    SERMON_PRACTICE = "sermon_practice"
}
export type LessonContent = GrammarContent | VocabularyContent | PronunciationContent | WritingContent;
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
export declare enum VocabularyCategory {
    RELIGIOUS = "religious",
    DAILY_LIFE = "daily_life",
    ACADEMIC = "academic",
    BUSINESS = "business",
    FAMILY = "family",
    FOOD = "food",
    TRAVEL = "travel",
    EMOTIONS = "emotions",
    TIME = "time",
    NUMBERS = "numbers"
}
export interface PronunciationPhrase {
    id: string;
    hungarian: string;
    phonetic: string;
    audioUrl: string;
    difficulty: number;
}
export interface PronunciationAssessment {
    id: string;
    userId: string;
    phraseId: string;
    audioUrl: string;
    score: number;
    feedback: string;
    createdAt: Date;
}
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
export declare enum SermonStatus {
    DRAFT = "draft",
    REVIEW = "review",
    COMPLETED = "completed"
}
export interface SermonFeedback {
    id: string;
    type: FeedbackType;
    message: string;
    suggestions: string[];
    lineNumber?: number;
    createdAt: Date;
}
export declare enum FeedbackType {
    GRAMMAR = "grammar",
    VOCABULARY = "vocabulary",
    STYLE = "style",
    THEOLOGICAL = "theological",
    CULTURAL = "cultural"
}
export interface Progress {
    id: string;
    userId: string;
    lessonId: string;
    status: ProgressStatus;
    score?: number;
    timeSpent: number;
    attempts: number;
    lastAttemptAt: Date;
    completedAt?: Date;
}
export declare enum ProgressStatus {
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    MASTERED = "mastered"
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
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
export interface Exercise {
    id: string;
    type: ExerciseType;
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    points: number;
}
export declare enum ExerciseType {
    MULTIPLE_CHOICE = "multiple_choice",
    FILL_BLANK = "fill_blank",
    TRANSLATION = "translation",
    PRONUNCIATION = "pronunciation",
    WRITING = "writing",
    LISTENING = "listening"
}
export interface GrammarRule {
    id: string;
    title: string;
    description: string;
    examples: string[];
    level: CEFRLevel;
}
export interface WritingPrompt {
    id: string;
    topic: string;
    instructions: string;
    minWords: number;
    maxWords: number;
    level: CEFRLevel;
    category: WritingCategory;
}
export declare enum WritingCategory {
    PERSONAL = "personal",
    FORMAL = "formal",
    ACADEMIC = "academic",
    SERMON = "sermon",
    LETTER = "letter",
    STORY = "story"
}
export interface LearningStats {
    totalLessons: number;
    completedLessons: number;
    totalWords: number;
    masteredWords: number;
    studyStreak: number;
    totalStudyTime: number;
    averageScore: number;
    weeklyGoal: number;
    weeklyProgress: number;
}
//# sourceMappingURL=index.d.ts.map