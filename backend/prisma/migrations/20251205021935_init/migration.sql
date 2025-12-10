-- CreateEnum
CREATE TYPE "CEFRLevel" AS ENUM ('A1', 'A2', 'B1', 'B2');

-- CreateEnum
CREATE TYPE "LearningGoal" AS ENUM ('SERMON_WRITING', 'GRAMMAR_MASTERY', 'VOCABULARY_BUILDING', 'WRITING_FLUENCY', 'READING_COMPREHENSION', 'TRANSLATION');

-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('MULTIPLE_CHOICE', 'FILL_BLANK', 'TRANSLATION', 'SENTENCE_BUILDING', 'ERROR_CORRECTION', 'MATCHING');

-- CreateEnum
CREATE TYPE "WordType" AS ENUM ('NOUN', 'VERB', 'ADJECTIVE', 'ADVERB', 'PRONOUN', 'PREPOSITION', 'CONJUNCTION', 'INTERJECTION', 'PARTICLE');

-- CreateEnum
CREATE TYPE "VocabularyCategory" AS ENUM ('THEOLOGICAL_CORE', 'BIBLICAL_TERMS', 'WORSHIP_LITURGY', 'PENTECOSTAL_SPECIFIC', 'PRAYER_DEVOTION', 'DAILY_LIFE', 'FAMILY', 'FOOD', 'TRAVEL', 'EMOTIONS', 'TIME', 'NUMBERS', 'ACADEMIC', 'CULTURAL', 'ABSTRACT_CONCEPTS');

-- CreateEnum
CREATE TYPE "FSRSState" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'RELEARNING');

-- CreateEnum
CREATE TYPE "WritingType" AS ENUM ('SENTENCE_TRANSLATION', 'PARAGRAPH_WRITING', 'ESSAY_WRITING', 'SERMON_OUTLINE', 'SERMON_INTRO', 'DIALOGUE_COMPLETION', 'DESCRIPTION', 'ARGUMENTATION');

-- CreateEnum
CREATE TYPE "SermonStatus" AS ENUM ('DRAFT', 'REVIEW', 'REVISED', 'FINALIZED');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('GRAMMAR', 'VOCABULARY', 'STYLE', 'THEOLOGICAL', 'CULTURAL', 'CLARITY', 'STRUCTURE');

-- CreateEnum
CREATE TYPE "FeedbackSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "ProgressType" AS ENUM ('GRAMMAR', 'VOCABULARY', 'WRITING', 'SERMON');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MASTERED');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('VOCABULARY', 'GRAMMAR', 'WRITING', 'MIXED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "currentLevel" "CEFRLevel" NOT NULL,
    "targetLevel" "CEFRLevel" NOT NULL,
    "learningGoals" "LearningGoal"[],
    "dailyGoal" INTEGER NOT NULL DEFAULT 30,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Seoul',
    "language" TEXT NOT NULL DEFAULT 'ko',
    "profileImage" TEXT,
    "bio" TEXT,
    "ministryInfo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammar_lessons" (
    "id" TEXT NOT NULL,
    "level" "CEFRLevel" NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "titleKorean" TEXT NOT NULL,
    "titleHungarian" TEXT,
    "explanationKorean" TEXT NOT NULL,
    "explanationHungarian" TEXT,
    "grammarRules" JSONB NOT NULL,
    "examples" JSONB NOT NULL,
    "koreanInterferenceNotes" TEXT,
    "commonMistakes" JSONB,
    "comparisonWithKorean" TEXT,
    "estimatedDuration" INTEGER NOT NULL,
    "difficultyScore" INTEGER NOT NULL DEFAULT 1,
    "prerequisites" TEXT[],
    "tags" TEXT[],
    "theologicalRelevance" BOOLEAN NOT NULL DEFAULT false,
    "theologicalExamples" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammar_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammar_exercises" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "exerciseType" "ExerciseType" NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "questionKorean" TEXT NOT NULL,
    "questionHungarian" TEXT,
    "correctAnswer" TEXT NOT NULL,
    "options" JSONB,
    "explanationKorean" TEXT,
    "explanationHungarian" TEXT,
    "hint" TEXT,
    "difficultyLevel" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammar_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammar_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "score" DOUBLE PRECISION,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "exercisesCompleted" INTEGER NOT NULL DEFAULT 0,
    "exercisesTotal" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "lastStudiedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammar_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_items" (
    "id" TEXT NOT NULL,
    "hungarian" TEXT NOT NULL,
    "korean" TEXT NOT NULL,
    "wordType" "WordType" NOT NULL,
    "level" "CEFRLevel" NOT NULL,
    "category" "VocabularyCategory" NOT NULL,
    "frequencyRank" INTEGER,
    "conjugations" JSONB,
    "caseForms" JSONB,
    "gender" TEXT,
    "examples" JSONB NOT NULL,
    "mnemonics" TEXT,
    "relatedWords" TEXT[],
    "semanticTags" TEXT[],
    "isTheological" BOOLEAN NOT NULL DEFAULT false,
    "biblicalReferences" TEXT[],
    "theologicalContext" TEXT,
    "pentecostalRelevance" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "elapsedDays" INTEGER NOT NULL DEFAULT 0,
    "scheduledDays" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "state" "FSRSState" NOT NULL DEFAULT 'NEW',
    "lastReview" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3) NOT NULL,
    "totalStudyTime" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "incorrectCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writing_exercises" (
    "id" TEXT NOT NULL,
    "level" "CEFRLevel" NOT NULL,
    "exerciseType" "WritingType" NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "promptKorean" TEXT NOT NULL,
    "promptHungarian" TEXT,
    "requiredGrammar" TEXT[],
    "requiredVocabulary" TEXT[],
    "sampleAnswerHungarian" TEXT,
    "sampleAnswerKorean" TEXT,
    "evaluationCriteria" JSONB NOT NULL,
    "minWords" INTEGER,
    "maxWords" INTEGER,
    "estimatedTime" INTEGER NOT NULL,
    "difficultyScore" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL DEFAULT 20,
    "tags" TEXT[],
    "isTheological" BOOLEAN NOT NULL DEFAULT false,
    "sermonRelevance" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "writing_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writing_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "grammarErrors" JSONB,
    "vocabularyScore" INTEGER,
    "grammarScore" INTEGER,
    "fluencyScore" INTEGER,
    "overallScore" INTEGER,
    "aiFeedback" TEXT,
    "strengths" JSONB,
    "areasForImprovement" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "timeSpent" INTEGER NOT NULL,

    CONSTRAINT "writing_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sermon_drafts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titleKorean" TEXT NOT NULL,
    "titleHungarian" TEXT,
    "scriptureReferences" TEXT[],
    "sermonTheme" TEXT,
    "targetAudience" TEXT,
    "contentHungarian" TEXT NOT NULL,
    "outline" JSONB,
    "grammarCheckResults" JSONB,
    "vocabularySuggestions" JSONB,
    "theologicalTermsUsed" TEXT[],
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "estimatedDuration" INTEGER,
    "readabilityScore" INTEGER,
    "levelAssessment" "CEFRLevel",
    "status" "SermonStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finalizedAt" TIMESTAMP(3),

    CONSTRAINT "sermon_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sermon_feedback" (
    "id" TEXT NOT NULL,
    "sermonId" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "message" TEXT NOT NULL,
    "suggestions" TEXT[],
    "lineNumber" INTEGER,
    "startPos" INTEGER,
    "endPos" INTEGER,
    "severity" "FeedbackSeverity" NOT NULL DEFAULT 'INFO',
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sermon_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_paths" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "currentLevel" "CEFRLevel" NOT NULL,
    "targetLevel" "CEFRLevel" NOT NULL,
    "focusAreas" "LearningGoal"[],
    "estimatedDuration" INTEGER NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "progressType" "ProgressType" NOT NULL,
    "referenceId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "score" DOUBLE PRECISION,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ReviewType" NOT NULL,
    "duration" INTEGER NOT NULL,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "correctItems" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "review_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_session_items" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "vocabularyId" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "rating" INTEGER,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_session_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_results" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "overallLevel" "CEFRLevel" NOT NULL,
    "overallConfidence" DOUBLE PRECISION NOT NULL,
    "grammarLevel" "CEFRLevel",
    "grammarScore" DOUBLE PRECISION,
    "vocabularyLevel" "CEFRLevel",
    "vocabularyScore" DOUBLE PRECISION,
    "writingLevel" "CEFRLevel",
    "writingScore" DOUBLE PRECISION,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "recommendations" JSONB NOT NULL,
    "koreanInterference" JSONB,
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studyStreakDays" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalStudyTime" INTEGER NOT NULL DEFAULT 0,
    "grammarLessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "grammarAverageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vocabularyTotal" INTEGER NOT NULL DEFAULT 0,
    "vocabularyMastered" INTEGER NOT NULL DEFAULT 0,
    "vocabularyLearning" INTEGER NOT NULL DEFAULT 0,
    "writingExercisesCompleted" INTEGER NOT NULL DEFAULT 0,
    "writingAverageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sermonsStarted" INTEGER NOT NULL DEFAULT 0,
    "sermonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "overallAverageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bestScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weeklyGoalMinutes" INTEGER NOT NULL DEFAULT 300,
    "weeklyProgressMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "badgesEarned" TEXT[],
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastStudyDate" TIMESTAMP(3),

    CONSTRAINT "learning_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "grammar_lessons_level_orderIndex_key" ON "grammar_lessons"("level", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "grammar_progress_userId_lessonId_key" ON "grammar_progress"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "vocabulary_progress_userId_vocabularyId_key" ON "vocabulary_progress"("userId", "vocabularyId");

-- CreateIndex
CREATE UNIQUE INDEX "progress_userId_progressType_referenceId_key" ON "progress"("userId", "progressType", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_results_sessionId_key" ON "assessment_results"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_stats_userId_key" ON "learning_stats"("userId");

-- AddForeignKey
ALTER TABLE "grammar_exercises" ADD CONSTRAINT "grammar_exercises_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "grammar_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_progress" ADD CONSTRAINT "grammar_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_progress" ADD CONSTRAINT "grammar_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "grammar_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_progress" ADD CONSTRAINT "vocabulary_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_progress" ADD CONSTRAINT "vocabulary_progress_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "vocabulary_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_submissions" ADD CONSTRAINT "writing_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_submissions" ADD CONSTRAINT "writing_submissions_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "writing_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sermon_drafts" ADD CONSTRAINT "sermon_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sermon_feedback" ADD CONSTRAINT "sermon_feedback_sermonId_fkey" FOREIGN KEY ("sermonId") REFERENCES "sermon_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress" ADD CONSTRAINT "progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_sessions" ADD CONSTRAINT "review_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_session_items" ADD CONSTRAINT "review_session_items_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "review_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_session_items" ADD CONSTRAINT "review_session_items_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "vocabulary_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
