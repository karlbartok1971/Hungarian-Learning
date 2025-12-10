# 🔧 프로젝트 리팩토링 계획서

**작성일**: 2024-12-04
**목적**: 발음 기능 제거 및 문법/어휘/작문 중심 플랫폼으로 재편

---

## 📋 제거 대상 파일 목록

### Frontend (16개 파일)
```
삭제:
- frontend/src/pages/pronunciation-practice/index.tsx
- frontend/src/components/audio/PronunciationFeedback.tsx
- frontend/src/components/audio/AudioRecorder.tsx
- frontend/src/components/audio/AudioVisualizer.tsx
- frontend/src/components/vocabulary/PronunciationPlayer.tsx
- frontend/src/components/vocabulary/PronunciationGame.tsx
- frontend/src/services/pronunciationApi.ts
- frontend/src/services/pronunciationService.ts
- frontend/src/lib/webrtcAudio.ts
- frontend/src/lib/audioUtils.ts
- frontend/tests/e2e/pronunciation-practice-flow.spec.ts
- frontend/tests/unit/audioUtils.test.ts

정리 필요 (발음 관련 부분만 제거):
- frontend/src/components/layout/Sidebar.tsx (발음 연습 메뉴 제거)
- frontend/src/pages/dashboard/index.tsx (발음 관련 퀵액션 제거)
- frontend/src/services/vocabularyApi.ts (발음 API 호출 제거)
- frontend/src/components/assessment/AssessmentQuestion.tsx (발음 평가 제거)
```

### Backend (13개 파일)
```
삭제:
- backend/src/api/pronunciation.ts
- backend/src/api/audioStorage.ts
- backend/src/services/PronunciationService.ts
- backend/src/services/GoogleSpeechService.ts
- backend/src/models/PronunciationAssessment.ts
- backend/src/models/AudioRecording.ts
- backend/src/lib/speechApi.ts
- backend/src/lib/pronunciationScoring.ts
- backend/tests/contract/test_pronunciation_api.test.ts
- backend/tests/integration/test_speech_recognition.test.ts

정리 필요:
- backend/main.py (발음 API 라우트 제거)
- backend/src/index.ts (발음 서비스 import 제거)
- backend/src/lib/hungarianLanguageConfig.ts (음성 관련 설정 제거)
```

---

## 🎯 새로운 프로젝트 구조

### 핵심 기능 3가지
1. **문법 학습** (Grammar Mastery)
2. **어휘 학습** (Vocabulary Building with FSRS)
3. **작문 연습** (Writing Practice & Sermon Composition)

### 새 디렉토리 구조
```
frontend/src/
├── pages/
│   ├── index.tsx → dashboard로 리다이렉트
│   ├── dashboard/
│   ├── grammar/
│   │   ├── index.tsx (문법 레벨 선택)
│   │   ├── [level]/
│   │   │   ├── index.tsx (해당 레벨 문법 목록)
│   │   │   └── [lessonId].tsx (문법 강의 페이지)
│   ├── vocabulary/
│   │   ├── index.tsx (어휘 학습 메인)
│   │   ├── flashcards.tsx (플래시카드)
│   │   ├── review.tsx (복습 세션)
│   │   └── quiz.tsx (어휘 퀴즈)
│   ├── writing/
│   │   ├── index.tsx (작문 연습 메인)
│   │   ├── exercises.tsx (문장 작성 연습)
│   │   ├── sermon/
│   │   │   ├── index.tsx (설교문 목록)
│   │   │   ├── editor.tsx (설교문 작성)
│   │   │   └── templates.tsx (템플릿)
│   ├── assessment/
│   ├── analytics/
│   └── learning-path/
├── components/
│   ├── grammar/
│   │   ├── GrammarLesson.tsx
│   │   ├── GrammarExercise.tsx
│   │   └── GrammarQuiz.tsx
│   ├── vocabulary/
│   │   ├── VocabularyCard.tsx
│   │   ├── FlashcardDeck.tsx
│   │   ├── ReviewSession.tsx
│   │   └── VocabularyQuiz.tsx
│   ├── writing/
│   │   ├── WritingEditor.tsx
│   │   ├── GrammarChecker.tsx
│   │   ├── SermonEditor.tsx
│   │   └── WritingFeedback.tsx
│   └── ...

backend/src/
├── api/
│   ├── grammar.ts (문법 강의 API)
│   ├── vocabulary.ts (어휘 학습 API)
│   ├── writing.ts (작문 평가 API)
│   ├── sermon.ts (설교문 작성 지원)
│   ├── assessment.ts
│   └── analytics.ts
├── services/
│   ├── GrammarService.ts
│   ├── VocabularyService.ts (FSRS 통합)
│   ├── WritingService.ts
│   ├── GrammarCheckService.ts (LanguageTool 연동)
│   └── FSRSAlgorithmService.ts
├── models/
│   ├── GrammarLesson.ts
│   ├── GrammarExercise.ts
│   ├── VocabularyCard.ts
│   ├── WritingExercise.ts
│   ├── SermonDraft.ts
│   └── ...
```

---

## 🗄️ 데이터베이스 스키마 재설계

### 새로운 핵심 테이블

#### 1. grammar_lessons (문법 강의)
```sql
CREATE TABLE grammar_lessons (
  id UUID PRIMARY KEY,
  level VARCHAR(2) NOT NULL, -- A1, A2, B1, B2
  order_index INT NOT NULL,
  title_korean VARCHAR(200) NOT NULL,
  title_hungarian VARCHAR(200) NOT NULL,

  -- 강의 내용
  explanation_korean TEXT NOT NULL,
  explanation_hungarian TEXT,
  grammar_rules JSONB NOT NULL, -- 문법 규칙 상세
  examples JSONB NOT NULL, -- 예문 배열

  -- 한국인 특화
  korean_interference_notes TEXT, -- 한국어 간섭 주의사항
  common_mistakes JSONB, -- 흔한 실수

  -- 메타데이터
  estimated_duration INT, -- 분
  difficulty_score INT, -- 1-10
  prerequisites UUID[], -- 선수 강의

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. grammar_exercises (문법 연습문제)
```sql
CREATE TABLE grammar_exercises (
  id UUID PRIMARY KEY,
  lesson_id UUID REFERENCES grammar_lessons(id),
  exercise_type VARCHAR(50) NOT NULL, -- multiple_choice, fill_blank, translation, sentence_building

  -- 문제 내용
  question_korean TEXT NOT NULL,
  question_hungarian TEXT,
  correct_answer TEXT NOT NULL,
  options JSONB, -- 선택지 (객관식인 경우)

  -- 피드백
  explanation_korean TEXT,
  explanation_hungarian TEXT,
  hint TEXT,

  difficulty_level INT, -- 1-5
  order_index INT,

  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. vocabulary_enhanced (강화된 어휘 시스템)
```sql
CREATE TABLE vocabulary_enhanced (
  id UUID PRIMARY KEY,

  -- 기본 정보
  hungarian_word VARCHAR(200) NOT NULL,
  korean_translation VARCHAR(200) NOT NULL,
  word_type VARCHAR(50), -- noun, verb, adjective, etc.

  -- 상세 정보
  level VARCHAR(2) NOT NULL, -- A1, A2, B1, B2
  frequency_rank INT, -- 사용 빈도 순위

  -- 문법 정보
  conjugations JSONB, -- 활용형
  case_forms JSONB, -- 격변화
  gender VARCHAR(20), -- 성별 (해당 시)

  -- 학습 지원
  example_sentences JSONB NOT NULL, -- [{hu: "", ko: "", context: ""}]
  mnemonics TEXT, -- 암기법
  related_words UUID[], -- 관련 단어

  -- 카테고리
  categories VARCHAR(100)[], -- daily, theological, academic, etc.
  semantic_tags VARCHAR(50)[], -- 의미 태그

  -- 신학 특화
  is_theological BOOLEAN DEFAULT false,
  biblical_references TEXT[],
  theological_context TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. user_vocabulary_progress (FSRS 통합)
```sql
CREATE TABLE user_vocabulary_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  vocabulary_id UUID REFERENCES vocabulary_enhanced(id),

  -- FSRS 파라미터
  stability FLOAT NOT NULL DEFAULT 0,
  difficulty FLOAT NOT NULL DEFAULT 0,
  elapsed_days INT NOT NULL DEFAULT 0,
  scheduled_days INT NOT NULL DEFAULT 0,
  reps INT NOT NULL DEFAULT 0,
  lapses INT NOT NULL DEFAULT 0,
  state VARCHAR(20) NOT NULL DEFAULT 'new', -- new, learning, review, relearning
  last_review TIMESTAMP,

  -- 다음 복습
  next_review_date TIMESTAMP NOT NULL,

  -- 학습 통계
  total_study_time INT DEFAULT 0, -- 초
  correct_count INT DEFAULT 0,
  incorrect_count INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, vocabulary_id)
);
```

#### 5. writing_exercises (작문 연습)
```sql
CREATE TABLE writing_exercises (
  id UUID PRIMARY KEY,
  level VARCHAR(2) NOT NULL,
  exercise_type VARCHAR(50) NOT NULL, -- sentence_translation, paragraph_writing, sermon_outline, etc.

  -- 문제
  prompt_korean TEXT NOT NULL,
  prompt_hungarian TEXT,
  required_grammar_points UUID[], -- 사용해야 할 문법
  required_vocabulary UUID[], -- 사용해야 할 어휘

  -- 모범 답안
  sample_answer_hungarian TEXT,
  sample_answer_korean TEXT,

  -- 평가 기준
  evaluation_criteria JSONB, -- {grammar: 40, vocabulary: 30, fluency: 30}

  min_words INT,
  max_words INT,
  estimated_time INT, -- 분

  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. user_writing_submissions (작문 제출물)
```sql
CREATE TABLE user_writing_submissions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  exercise_id UUID REFERENCES writing_exercises(id),

  -- 제출 내용
  user_answer TEXT NOT NULL,
  word_count INT NOT NULL,

  -- AI 평가
  grammar_errors JSONB, -- LanguageTool 결과
  vocabulary_score INT, -- 1-100
  grammar_score INT,
  fluency_score INT,
  overall_score INT,

  -- 피드백
  ai_feedback TEXT,
  strengths JSONB,
  areas_for_improvement JSONB,

  -- 메타
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  time_spent INT -- 초
);
```

#### 7. sermon_drafts_enhanced (강화된 설교문)
```sql
CREATE TABLE sermon_drafts_enhanced (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),

  -- 설교 기본 정보
  title_korean VARCHAR(300),
  title_hungarian VARCHAR(300),
  scripture_references TEXT[], -- ["창세기 1:1-3", "요한복음 3:16"]
  sermon_theme VARCHAR(200),

  -- 내용
  content_hungarian TEXT NOT NULL,
  outline JSONB, -- 설교 개요

  -- AI 지원
  grammar_check_results JSONB,
  vocabulary_suggestions JSONB,
  theological_terms_used UUID[], -- 사용된 신학 용어

  -- 통계
  word_count INT,
  estimated_duration INT, -- 설교 예상 시간 (분)
  readability_score INT, -- 가독성 점수
  level_assessment VARCHAR(2), -- A1, A2, B1, B2

  -- 상태
  status VARCHAR(20) DEFAULT 'draft', -- draft, reviewed, finalized

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  finalized_at TIMESTAMP
);
```

---

## 📚 학습 콘텐츠 크롤링 계획

### 타겟 사이트 및 자료

#### 1. 문법 자료
- **HungarianReference.com**: 전체 문법 구조
- **Duolingo Hungarian**: 레벨별 문법 포인트
- **Hungarian Grammar (WikiBooks)**: 상세 문법 설명
- **magyartanulas.hu**: 한국인을 위한 헝가리어 문법

#### 2. 어휘 자료
- **Memrise Hungarian Courses**: 레벨별 어휘 세트
- **Anki Shared Decks**: 헝가리어 덱
- **Wiktionary Hungarian**: 단어 상세 정보
- **SZTAKI Szótár**: 헝가리어 사전 API

#### 3. 신학 용어 (오순절 특화)
- **Hungarian Bible (Károli)**: 성경 용어 추출
- **Pentecostal Hungarian Churches**: 설교 스크립트
- **Hungarian Theological Dictionaries**: 신학 사전
- **Assemblies of God Hungary**: 오순절 교단 자료

#### 4. 작문 예시
- **Hungarian News Sites**: 현대 헝가리어 문장 구조
- **Hungarian Sermon Archives**: 실제 설교문
- **Hungarian Writing Samples**: CEFR 레벨별 작문 예시

---

## 🎯 구현 우선순위

### Week 1-2: 클린업 및 재구조화
- [x] 발음 관련 코드 제거
- [ ] 디렉토리 구조 최적화
- [ ] 데이터베이스 스키마 재설계
- [ ] API 라우트 정리

### Week 3-4: A1 문법 시스템 완성
- [ ] 크롤링으로 A1 문법 자료 수집
- [ ] 문법 강의 20개 작성 (한국어 설명)
- [ ] 연습문제 각 10개씩 총 200개
- [ ] 문법 학습 페이지 UI/UX

### Week 5-6: 어휘 시스템 (FSRS)
- [ ] 핵심 어휘 1,000개 수집
- [ ] 신학 용어 500개 수집
- [ ] FSRS 알고리즘 실제 구현
- [ ] 플래시카드 UI 완성

### Week 7-8: 작문 시스템
- [ ] 작문 연습 문제 50개
- [ ] LanguageTool API 연동
- [ ] 문법 체크 자동화
- [ ] 피드백 시스템 구축

### Week 9-10: 설교문 작성 지원
- [ ] 설교문 템플릿 20개
- [ ] 성경 구절 검색 기능
- [ ] 신학 용어 자동 제안
- [ ] AI 피드백 시스템

---

## 🔄 다음 단계

1. **즉시 시작**: 발음 관련 파일 삭제
2. **디렉토리 정리**: 중복 제거, 구조 최적화
3. **크롤링 준비**: 자료 수집 스크립트 작성
4. **A1 콘텐츠**: 첫 번째 학습 자료 구축

---

**진행 상황은 이 문서에 계속 업데이트됩니다.**
