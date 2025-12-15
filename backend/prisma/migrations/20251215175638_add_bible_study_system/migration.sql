-- CreateTable
CREATE TABLE "bible_verses" (
    "id" TEXT NOT NULL,
    "book" TEXT NOT NULL,
    "bookHungarian" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "textHungarian" TEXT NOT NULL,
    "textKorean" TEXT NOT NULL,
    "grammarAnalysis" JSONB NOT NULL,
    "difficulty" "CEFRLevel" NOT NULL,
    "grammarTopics" TEXT[],
    "vocabularyCount" INTEGER NOT NULL DEFAULT 0,
    "sermonRelevance" BOOLEAN NOT NULL DEFAULT false,
    "theologicalTheme" TEXT,
    "audioUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bible_verses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bible_study_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verseId" TEXT NOT NULL,
    "studiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "wordsStudied" INTEGER NOT NULL DEFAULT 0,
    "wordsMarked" TEXT[],
    "quizScore" INTEGER,
    "quizAttempts" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "highlights" JSONB,
    "sermonIdeas" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "bible_study_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_bible_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "description" TEXT,
    "currentBook" TEXT NOT NULL,
    "currentChapter" INTEGER NOT NULL,
    "currentVerse" INTEGER NOT NULL,
    "dailyVerseCount" INTEGER NOT NULL DEFAULT 1,
    "level" "CEFRLevel",
    "totalVersesPlanned" INTEGER NOT NULL DEFAULT 0,
    "totalVersesCompleted" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastStudiedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_bible_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bible_word_analysis" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "lemma" TEXT NOT NULL,
    "hungarian" TEXT NOT NULL,
    "korean" TEXT NOT NULL,
    "partOfSpeech" TEXT NOT NULL,
    "grammarFeatures" JSONB NOT NULL,
    "level" "CEFRLevel" NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 0,
    "explanation" TEXT,
    "relatedGrammarLessonId" TEXT,
    "examples" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bible_word_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bible_verses_difficulty_idx" ON "bible_verses"("difficulty");

-- CreateIndex
CREATE INDEX "bible_verses_book_chapter_idx" ON "bible_verses"("book", "chapter");

-- CreateIndex
CREATE UNIQUE INDEX "bible_verses_book_chapter_verse_key" ON "bible_verses"("book", "chapter", "verse");

-- CreateIndex
CREATE INDEX "bible_study_progress_userId_studiedAt_idx" ON "bible_study_progress"("userId", "studiedAt");

-- CreateIndex
CREATE UNIQUE INDEX "bible_study_progress_userId_verseId_key" ON "bible_study_progress"("userId", "verseId");

-- CreateIndex
CREATE INDEX "daily_bible_plans_userId_isActive_idx" ON "daily_bible_plans"("userId", "isActive");

-- CreateIndex
CREATE INDEX "bible_word_analysis_lemma_idx" ON "bible_word_analysis"("lemma");

-- CreateIndex
CREATE INDEX "bible_word_analysis_level_idx" ON "bible_word_analysis"("level");

-- CreateIndex
CREATE UNIQUE INDEX "bible_word_analysis_word_lemma_key" ON "bible_word_analysis"("word", "lemma");

-- AddForeignKey
ALTER TABLE "bible_study_progress" ADD CONSTRAINT "bible_study_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bible_study_progress" ADD CONSTRAINT "bible_study_progress_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "bible_verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_bible_plans" ADD CONSTRAINT "daily_bible_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
