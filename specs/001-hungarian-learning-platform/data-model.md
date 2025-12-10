# Data Model: Hungarian Language Learning Platform

**Date**: 2025-11-20
**Status**: Draft
**Phase**: 1 - Data Model Design

## Overview

헝가리어 학습 플랫폼의 데이터 모델은 하이브리드 데이터베이스 아키텍처를 사용합니다:
- **PostgreSQL**: 관계형 데이터 (사용자, 진도, 평가)
- **MongoDB**: 문서 기반 콘텐츠 (레슨, 어휘, 멀티미디어)
- **Redis**: 캐싱 및 실시간 세션 데이터

## Core Entities

### 1. User Management (PostgreSQL)

#### Users
사용자 기본 정보 및 인증 관리

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    native_language VARCHAR(10) DEFAULT 'ko',
    target_language VARCHAR(10) DEFAULT 'hu',
    current_cefr_level VARCHAR(2) CHECK (current_cefr_level IN ('A1', 'A2', 'B1', 'B2')),
    learning_goal TEXT DEFAULT 'sermon_writing',
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cefr_level ON users(current_cefr_level);
```

#### User Profiles
상세한 사용자 프로필 및 학습 설정

```sql
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    ministry_background TEXT,
    hungarian_experience_years INTEGER DEFAULT 0,
    study_time_preference INTEGER DEFAULT 30, -- minutes per day
    notification_settings JSONB DEFAULT '{
        "daily_reminder": true,
        "progress_updates": true,
        "new_content": false
    }'::jsonb,
    accessibility_settings JSONB DEFAULT '{
        "high_contrast": false,
        "large_text": false,
        "screen_reader": false,
        "reduced_motion": false
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Learning Progress (PostgreSQL)

#### User Progress
전체적인 학습 진도 추적

```sql
CREATE TABLE user_progress (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    time_spent_minutes INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0, -- total minutes
    cefr_progress JSONB DEFAULT '{
        "A1": {"reading": 0, "writing": 0, "speaking": 0, "listening": 0},
        "A2": {"reading": 0, "writing": 0, "speaking": 0, "listening": 0},
        "B1": {"reading": 0, "writing": 0, "speaking": 0, "listening": 0},
        "B2": {"reading": 0, "writing": 0, "speaking": 0, "listening": 0}
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX idx_progress_user_completion ON user_progress(user_id, completion_percentage);
CREATE INDEX idx_progress_last_accessed ON user_progress(last_accessed);
```

#### Vocabulary Progress
어휘 학습 진도 및 간격 반복 데이터

```sql
CREATE TABLE vocabulary_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_id UUID NOT NULL, -- Reference to MongoDB vocabulary
    mastery_level DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 1.00
    review_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    next_review TIMESTAMP WITH TIME ZONE,
    ease_factor DECIMAL(3,2) DEFAULT 2.50, -- FSRS ease factor
    stability_days DECIMAL(8,2) DEFAULT 1.00, -- FSRS stability
    difficulty DECIMAL(3,2) DEFAULT 0.50, -- FSRS difficulty
    retrievability DECIMAL(3,2), -- FSRS retrievability
    spaced_repetition_data JSONB DEFAULT '{
        "interval": 1,
        "repetitions": 0,
        "lapses": 0
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, vocabulary_id)
);

CREATE INDEX idx_vocab_progress_next_review ON vocabulary_progress(user_id, next_review);
CREATE INDEX idx_vocab_progress_mastery ON vocabulary_progress(user_id, mastery_level);
```

#### Assessment Results
평가 및 테스트 결과

```sql
CREATE TABLE assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assessment_type VARCHAR(50) NOT NULL, -- 'pronunciation', 'grammar', 'composition', 'speaking'
    content_id UUID NOT NULL, -- Reference to assessed content
    score DECIMAL(5,2) NOT NULL, -- 0.00 to 100.00
    max_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    skill_breakdown JSONB, -- detailed skill scores
    feedback TEXT,
    audio_data_url TEXT, -- for pronunciation assessments
    completion_time_seconds INTEGER,
    assessment_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_assessment_user_type ON assessment_results(user_id, assessment_type);
CREATE INDEX idx_assessment_created_at ON assessment_results(created_at);
```

### 3. Learning Content (MongoDB)

#### Lessons Collection
구조화된 레슨 콘텐츠

```typescript
interface Lesson {
  _id: ObjectId;
  title: {
    korean: string;
    hungarian: string;
  };
  description: {
    korean: string;
    hungarian: string;
  };
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2';
  lesson_type: 'vocabulary' | 'grammar' | 'speaking' | 'writing' | 'reading' | 'listening';
  religious_focus: boolean;
  estimated_duration_minutes: number;
  prerequisites: ObjectId[]; // Other lesson IDs
  content_sections: ContentSection[];
  exercises: Exercise[];
  vocabulary_introduced: ObjectId[]; // Vocabulary IDs
  tags: string[];
  difficulty_score: number; // 1-10
  created_at: Date;
  updated_at: Date;
  version: number;
  published: boolean;
  metadata: {
    author: string;
    reviewer: string;
    last_reviewed: Date;
    source_materials: string[];
  };
}

interface ContentSection {
  id: string;
  type: 'text' | 'audio' | 'video' | 'interactive';
  title: string;
  content: any; // Flexible content structure
  order: number;
  optional: boolean;
}

interface Exercise {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'pronunciation' | 'composition' | 'matching';
  instructions: {
    korean: string;
    hungarian: string;
  };
  content: any; // Exercise-specific structure
  points: number;
  time_limit_seconds?: number;
  difficulty: number;
}
```

#### Vocabulary Collection
어휘 데이터베이스

```typescript
interface VocabularyItem {
  _id: ObjectId;
  hungarian: string;
  korean: string;
  english?: string; // Optional English translation
  pronunciation: {
    ipa: string; // International Phonetic Alphabet
    hangul_approximation?: string; // Korean pronunciation guide
  };
  part_of_speech: string;
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2';
  frequency_rank: number; // 1-10000 (1 being most common)
  religious_context: boolean;
  category: string; // 'theology', 'church', 'bible', 'general', etc.
  examples: Example[];
  audio_files: AudioFile[];
  images: ImageFile[];
  etymology?: string;
  conjugations?: Conjugation[]; // For verbs
  declensions?: Declension[]; // For nouns
  synonyms: ObjectId[];
  antonyms: ObjectId[];
  related_words: ObjectId[];
  created_at: Date;
  updated_at: Date;
  tags: string[];
  verified_by_native: boolean;
  difficulty_factors: {
    pronunciation_difficulty: number; // 1-10
    grammatical_complexity: number; // 1-10
    cultural_specificity: number; // 1-10
  };
}

interface Example {
  hungarian: string;
  korean: string;
  context: 'formal' | 'informal' | 'religious' | 'academic';
  audio_id?: ObjectId;
  source?: string;
}

interface AudioFile {
  file_id: string; // Reference to storage system
  speaker_gender: 'male' | 'female';
  speaker_region: string;
  quality: 'high' | 'medium' | 'low';
  duration_seconds: number;
  file_size_bytes: number;
}
```

#### Sermon Content Collection
설교문 작성 특화 콘텐츠

```typescript
interface SermonContent {
  _id: ObjectId;
  title: {
    korean: string;
    hungarian: string;
  };
  category: 'biblical_passage' | 'sermon_template' | 'theological_concept' | 'prayer';
  biblical_reference?: string; // e.g., "마태복음 5:1-12"
  hungarian_text: string;
  korean_translation: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  theological_concepts: string[];
  vocabulary_highlighted: ObjectId[]; // Vocabulary IDs
  structural_analysis: {
    introduction_pattern: string;
    main_points: string[];
    conclusion_pattern: string;
    rhetorical_devices: string[];
  };
  cultural_notes: {
    hungarian_church_context: string;
    korean_adaptation_notes: string;
  };
  practice_exercises: ObjectId[]; // Exercise IDs
  created_at: Date;
  updated_at: Date;
  approved_by_theologian: boolean;
  source_attribution: string;
}
```

#### User Generated Content
사용자가 생성한 설교문 및 연습 결과

```typescript
interface UserSermonDraft {
  _id: ObjectId;
  user_id: string; // Reference to PostgreSQL user
  title: string;
  content: string;
  status: 'draft' | 'review' | 'completed';
  biblical_reference?: string;
  language: 'ko' | 'hu';
  created_at: Date;
  updated_at: Date;
  word_count: number;
  estimated_reading_time: number; // minutes
  ai_analysis: {
    grammar_score: number;
    vocabulary_level: string;
    theological_accuracy: number;
    suggestions: string[];
    complexity_analysis: any;
  };
  revision_history: Revision[];
  shared_with_mentor: boolean;
  mentor_feedback?: {
    mentor_id: string;
    feedback: string;
    score: number;
    created_at: Date;
  };
}

interface Revision {
  version: number;
  content: string;
  changes_summary: string;
  timestamp: Date;
  change_type: 'grammar' | 'content' | 'structure' | 'vocabulary';
}
```

### 4. Media Assets (MongoDB)

#### Audio Assets
오디오 파일 메타데이터 및 관리

```typescript
interface AudioAsset {
  _id: ObjectId;
  file_path: string; // Cloud storage path
  original_filename: string;
  content_type: 'vocabulary' | 'pronunciation' | 'lesson' | 'example' | 'user_recording';
  related_content_id: ObjectId; // Related vocabulary, lesson, etc.
  speaker_info: {
    gender: 'male' | 'female';
    age_range: string;
    region: string; // Hungarian region/dialect
    native_speaker: boolean;
    professional_speaker: boolean;
  };
  technical_info: {
    duration_seconds: number;
    file_size_bytes: number;
    format: string; // 'mp3', 'wav', 'opus'
    sample_rate: number;
    bit_rate: number;
    channels: number;
  };
  quality_metrics: {
    clarity_score: number; // 1-10
    background_noise_level: number; // 1-10 (1 = no noise)
    pronunciation_clarity: number; // 1-10
    approved_for_learning: boolean;
  };
  processing_status: 'pending' | 'processed' | 'error';
  transcription?: {
    text: string;
    confidence: number;
    generated_by: 'human' | 'ai';
  };
  created_at: Date;
  updated_at: Date;
  tags: string[];
}
```

## Data Relationships

### Cross-Database References

PostgreSQL과 MongoDB 간의 관계는 UUID/ObjectId를 통해 관리됩니다:

```typescript
interface CrossReferenceMap {
  // PostgreSQL user_id -> MongoDB user content
  user_content: {
    user_id: string; // PostgreSQL UUID
    sermon_drafts: ObjectId[]; // MongoDB ObjectIds
    progress_data: ObjectId[];
  };

  // MongoDB lesson -> PostgreSQL progress
  lesson_progress: {
    lesson_id: ObjectId; // MongoDB
    user_progress_records: string[]; // PostgreSQL UUIDs
  };

  // MongoDB vocabulary -> PostgreSQL progress
  vocabulary_tracking: {
    vocabulary_id: ObjectId; // MongoDB
    user_progress_records: string[]; // PostgreSQL UUIDs
  };
}
```

## Data Validation Rules

### Business Rules

```typescript
interface ValidationRules {
  user_registration: {
    email: 'valid_email_format' | 'unique';
    password: 'min_8_chars' | 'contains_special_char';
    cefr_level: 'A1' | 'A2' | 'B1' | 'B2';
  };

  vocabulary_progress: {
    mastery_level: 'range_0_to_1';
    next_review: 'future_date_only';
    ease_factor: 'range_1.3_to_2.5';
  };

  assessment_results: {
    score: 'range_0_to_max_score';
    completion_time: 'positive_integer';
  };

  lesson_content: {
    cefr_level_progression: 'prerequisites_lower_level';
    estimated_duration: 'range_5_to_120_minutes';
  };
}
```

## Performance Considerations

### Indexing Strategy

**PostgreSQL Indexes:**
```sql
-- User queries
CREATE INDEX idx_users_active_premium ON users(id) WHERE premium_until > NOW();

-- Progress tracking
CREATE INDEX idx_progress_active_users ON user_progress(user_id, last_accessed)
WHERE last_accessed > NOW() - INTERVAL '30 days';

-- Vocabulary optimization
CREATE INDEX idx_vocab_due_reviews ON vocabulary_progress(user_id, next_review)
WHERE next_review <= NOW() + INTERVAL '1 day';

-- Assessment analytics
CREATE INDEX idx_assessment_recent ON assessment_results(user_id, assessment_type, created_at)
WHERE created_at > NOW() - INTERVAL '90 days';
```

**MongoDB Indexes:**
```typescript
// Lesson content
db.lessons.createIndex({ cefr_level: 1, lesson_type: 1, published: 1 });
db.lessons.createIndex({ tags: 1 });
db.lessons.createIndex({ "metadata.last_reviewed": 1 });

// Vocabulary
db.vocabulary.createIndex({
  hungarian: "text",
  korean: "text",
  "examples.hungarian": "text",
  "examples.korean": "text"
});
db.vocabulary.createIndex({ cefr_level: 1, religious_context: 1 });
db.vocabulary.createIndex({ frequency_rank: 1 });

// User content
db.user_sermon_drafts.createIndex({ user_id: 1, status: 1, updated_at: -1 });
db.user_sermon_drafts.createIndex({ created_at: -1 });
```

## Data Migration Strategy

### Schema Evolution

```typescript
interface MigrationPlan {
  version_1_0: {
    initial_schema: 'create_all_tables_and_collections';
    sample_data: 'load_basic_hungarian_vocabulary_500_words';
  };

  version_1_1: {
    schema_changes: [
      'add_accessibility_settings_to_user_profiles',
      'add_pronunciation_difficulty_to_vocabulary'
    ];
    data_migration: 'backfill_existing_user_preferences';
  };

  version_1_2: {
    schema_changes: [
      'add_sermon_template_collection',
      'add_mentor_feedback_system'
    ];
    data_migration: 'convert_existing_drafts_to_new_format';
  };
}
```

## Security Considerations

### Data Protection

```sql
-- Row Level Security for user data
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_progress_policy ON user_progress
    FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

-- Audit trail
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    user_id UUID,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Privacy Compliance (GDPR)

```typescript
interface PrivacyCompliance {
  data_subject_rights: {
    access: 'export_all_user_data_in_json_format';
    portability: 'provide_structured_export';
    erasure: 'anonymize_or_delete_all_user_records';
    rectification: 'allow_user_profile_updates';
  };

  data_minimization: {
    retention_policy: '3_years_inactive_users';
    anonymization_schedule: 'quarterly_cleanup';
    consent_tracking: 'log_all_consent_changes';
  };
}
```

---

**Data Model Status**: ✅ Complete
**Next Phase**: API Contract Design
**Ready for**: Phase 1 Implementation