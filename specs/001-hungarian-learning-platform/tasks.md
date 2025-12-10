ㅔㅗㅁ# Tasks: Hungarian Language Learning Platform

**Input**: Design documents from `/specs/001-hungarian-learning-platform/`
**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅)

**Tests**: Test tasks included for critical user flows and API contracts

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on implementation plan: Web application structure
- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/tests/`
- **Shared**: `shared/types/`, `shared/constants/`

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETED

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan
- [x] T002 Initialize Node.js backend with Express, TypeScript 5.0+, Prisma ORM dependencies
- [x] T003 [P] Initialize React frontend with Next.js 14+, TypeScript 5.0+, Tailwind CSS 3.4+, shadcn/ui
- [x] T004 [P] Setup shared types package in shared/types/
- [x] T005 [P] Configure ESLint, Prettier, and TypeScript strict mode across all packages
- [x] T006 [P] Setup Jest and React Testing Library for frontend testing
- [x] T007 [P] Setup Jest for backend API testing
- [x] T008 [P] Configure Playwright for E2E testing

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETED

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Setup PostgreSQL database schema and Prisma migrations framework
- [x] T010 [P] Setup Redis for session management and caching
- [x] T011 [P] ~~Setup MongoDB connection for content storage~~ (PostgreSQL로 통합 완료)
- [x] T012 [P] Implement authentication/authorization framework with JWT
- [x] T013 [P] Setup Express API routing and middleware structure in backend/src/api/
- [x] T014 Create base User, Progress, and Vocabulary models in backend/src/models/
- [x] T015 Configure error handling middleware and logging infrastructure
- [x] T016 Setup environment configuration management (.env files, validation)
- [x] T017 [P] Configure CORS and security middleware
- [x] T018 [P] Setup file upload middleware for audio files
- [x] T019 Setup Google Cloud Speech API integration structure

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 개인화된 학습 경로 (Priority: P1) 🎯 MVP

**Goal**: 한국인 목회자가 A1에서 B2까지 체계적으로 학습할 수 있는 개인화된 커리큘럼 시스템

**Independent Test**: 사용자가 레벨 테스트를 받고, 개인 맞춤 학습 계획이 생성되며, 일일 학습 목표가 제시되는지 확인

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T020 [P] [US1] Contract test for assessment endpoints in backend/tests/contract/test_assessment_api.test.ts
- [x] T021 [P] [US1] Contract test for curriculum endpoints in backend/tests/contract/test_curriculum_api.test.ts
- [x] T022 [P] [US1] Integration test for learning path generation in backend/tests/integration/test_learning_path.test.ts
- [x] T023 [P] [US1] E2E test for complete assessment flow in frontend/tests/e2e/assessment.spec.ts

### Implementation for User Story 1

#### Backend Implementation
- [x] T024 [P] [US1] Create Assessment model in backend/src/models/Assessment.ts
- [x] T025 [P] [US1] Create LearningPath model in backend/src/models/LearningPath.ts
- [x] T026 [P] [US1] Create Curriculum model in backend/src/models/Curriculum.ts
- [x] T027 [US1] Implement AssessmentService in backend/src/services/AssessmentService.ts (depends on T024)
- [x] T028 [US1] Implement CurriculumService in backend/src/services/CurriculumService.ts (depends on T025, T026)
- [x] T029 [US1] Implement assessment API endpoints in backend/src/api/assessment.ts
- [x] T030 [US1] Implement curriculum API endpoints in backend/src/api/curriculum.ts
- [x] T031 [US1] Add level calculation algorithm (A1-B2 CEFR mapping)
- [x] T032 [US1] Add learning path generation logic with Korean-Hungarian focus

#### Frontend Implementation
- [x] T033 [P] [US1] Create Assessment components in frontend/src/components/assessment/
- [x] T034 [P] [US1] Create LearningPath components in frontend/src/components/learning-path/
- [x] T035 [P] [US1] Create assessment page in frontend/src/pages/assessment.tsx
- [x] T036 [P] [US1] Create learning path page in frontend/src/pages/learning-path.tsx
- [x] T037 [US1] Implement assessment API client in frontend/src/services/assessmentApi.ts
- [x] T038 [US1] Implement curriculum API client in frontend/src/services/curriculumApi.ts
- [x] T039 [US1] Setup Zustand store for learning path state management
- [x] T040 [US1] Add validation and error handling for assessment flow

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 실시간 발음 연습 시스템 (Priority: P1)

**Goal**: 헝가리어 특유의 발음을 실시간으로 평가하고 교정하는 시스템

**Independent Test**: 사용자가 헝가리어 문장을 읽으면 실시간으로 발음 정확도가 평가되고 구체적인 피드백이 제공되는지 확인

### Tests for User Story 2 ⚠️

- [x] T041 [P] [US2] Contract test for pronunciation assessment API in backend/tests/contract/test_pronunciation_api.test.ts
- [x] T042 [P] [US2] Integration test for Google Cloud Speech API in backend/tests/integration/test_speech_recognition.test.ts
- [x] T043 [P] [US2] Unit test for audio processing utilities in frontend/tests/unit/audioUtils.test.ts
- [x] T044 [P] [US2] E2E test for pronunciation practice flow in frontend/tests/e2e/pronunciation.spec.ts

### Implementation for User Story 2

#### Backend Implementation
- [x] T045 [P] [US2] Create PronunciationAssessment model in backend/src/models/PronunciationAssessment.ts
- [x] T046 [P] [US2] Create AudioRecording model in backend/src/models/AudioRecording.ts
- [x] T047 [US2] Implement GoogleSpeechService in backend/src/services/GoogleSpeechService.ts
- [x] T048 [US2] Implement PronunciationService in backend/src/services/PronunciationService.ts
- [x] T049 [US2] Implement pronunciation assessment API endpoints in backend/src/api/pronunciation.ts
- [x] T050 [US2] Add Hungarian language configuration for Google Speech API
- [x] T051 [US2] Add pronunciation scoring algorithm (confidence-based)
- [x] T052 [US2] Add audio file storage and retrieval functionality

#### Frontend Implementation
- [x] T053 [P] [US2] Create AudioRecorder component in frontend/src/components/audio/AudioRecorder.tsx
- [x] T054 [P] [US2] Create PronunciationFeedback component in frontend/src/components/pronunciation/PronunciationFeedback.tsx
- [x] T055 [P] [US2] Create pronunciation practice page in frontend/src/pages/pronunciation.tsx
- [x] T056 [P] [US2] Implement Web Audio API utilities in frontend/src/lib/audioUtils.ts
- [x] T057 [US2] Implement pronunciation API client in frontend/src/services/pronunciationApi.ts
- [x] T058 [US2] Setup real-time audio processing with WebRTC
- [x] T059 [US2] Add audio visualization and waveform display
- [x] T060 [US2] Integrate with User Story 1 curriculum for targeted exercises

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 설교문 작성 지원 시스템 (Priority: P2)

**Goal**: 헝가리어로 자연스러운 설교문을 작성할 수 있도록 지원하는 AI 기반 도구

**Independent Test**: 사용자가 주제를 입력하면 헝가리어 설교문 구조가 제안되고, 실시간으로 문법과 표현을 개선할 수 있는지 확인

### Tests for User Story 3 ⚠️

- [x] T061 [P] [US3] Contract test for sermon assistance API in backend/tests/contract/test_sermon_api.test.ts
- [x] T062 [P] [US3] Integration test for HuSpaCy NLP processing in backend/tests/integration/test_hungarian_nlp.test.ts
- [x] T063 [P] [US3] Unit test for grammar checking utilities in backend/tests/unit/grammarUtils.test.ts
- [x] T064 [P] [US3] E2E test for sermon writing workflow in frontend/tests/e2e/sermon-writing.spec.ts

### Implementation for User Story 3

#### Backend Implementation
- [x] T065 [P] [US3] Create SermonDraft model in backend/src/models/SermonDraft.ts
- [x] T066 [P] [US3] Create TheologicalTerm model in backend/src/models/TheologicalTerm.ts
- [x] T067 [US3] Implement HungarianNLPService in backend/src/services/HungarianNLPService.ts
- [x] T068 [US3] Implement SermonAssistanceService in backend/src/services/SermonAssistanceService.ts
- [x] T069 [US3] Implement sermon writing API endpoints in backend/src/api/sermon.ts
- [x] T070 [US3] Setup HuSpaCy integration for Hungarian grammar checking
- [x] T071 [US3] Add LanguageTool integration for advanced grammar correction
- [x] T072 [US3] Add theological terminology database and suggestions

#### Frontend Implementation
- [x] T073 [P] [US3] Create SermonEditor component in frontend/src/components/sermon/SermonEditor.tsx
- [x] T074 [P] [US3] Create GrammarSuggestions component in frontend/src/components/sermon/GrammarSuggestions.tsx
- [x] T075 [P] [US3] Create SermonOutline component in frontend/src/components/sermon/SermonOutline.tsx
- [x] T076 [P] [US3] Create sermon writing page in frontend/src/pages/sermon-writing.tsx
- [x] T077 [US3] Implement sermon API client in frontend/src/services/sermonApi.ts
- [x] T078 [US3] Setup real-time grammar checking with debouncing
- [x] T079 [US3] Add rich text editor with Hungarian language support
- [x] T080 [US3] Add sermon template and structure suggestions

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - 어휘 및 표현 학습 (Priority: P2)

**Goal**: FSRS 알고리즘 기반 간격 반복 학습으로 헝가리어 어휘와 종교적 표현을 효과적으로 학습

**Independent Test**: 사용자가 새로운 어휘를 학습하면 개인별 망각 곡선에 따라 복습 일정이 자동 생성되고, 학습 효과가 측정되는지 확인

### Tests for User Story 4 ⚠️

- [x] T081 [P] [US4] Contract test for vocabulary learning API in backend/tests/contract/test_vocabulary_api.test.ts
- [x] T082 [P] [US4] Unit test for FSRS algorithm implementation in backend/tests/unit/fsrsAlgorithm.test.ts
- [x] T083 [P] [US4] Integration test for spaced repetition scheduling in backend/tests/integration/test_spaced_repetition.test.ts
- [x] T084 [P] [US4] E2E test for vocabulary learning flow in frontend/tests/e2e/vocabulary-learning.spec.ts

### Implementation for User Story 4

#### Backend Implementation
- [x] T085 [P] [US4] Create VocabularyCard model in backend/src/models/VocabularyCard.ts
- [x] T086 [P] [US4] Create ReviewSession model in backend/src/models/ReviewSession.ts
- [x] T087 [P] [US4] Create LearningStatistics model in backend/src/models/LearningStatistics.ts
- [x] T088 [US4] Implement FSRSAlgorithmService in backend/src/services/FSRSAlgorithmService.ts
- [x] T089 [US4] Implement VocabularyService in backend/src/services/VocabularyService.ts
- [x] T090 [US4] Implement vocabulary learning API endpoints in backend/src/api/vocabulary.ts
- [x] T091 [US4] Add FSRS scheduling algorithm implementation
- [x] T092 [US4] Add vocabulary difficulty calculation based on Korean-Hungarian transfer
- [x] T093 [US4] Add progress tracking and statistics calculation

#### Frontend Implementation
- [ ] T094 [P] [US4] Create VocabularyCard component in frontend/src/components/vocabulary/VocabularyCard.tsx
- [ ] T095 [P] [US4] Create ReviewSession component in frontend/src/components/vocabulary/ReviewSession.tsx
- [ ] T096 [P] [US4] Create vocabulary learning page in frontend/src/pages/vocabulary.tsx
- [ ] T097 [P] [US4] Create progress dashboard in frontend/src/components/vocabulary/ProgressDashboard.tsx
- [ ] T098 [US4] Implement vocabulary API client in frontend/src/services/vocabularyApi.ts
- [ ] T099 [US4] Setup review scheduling and notification system
- [x] T100 [US4] Add gamification elements (streaks, points, achievements) - ✅ Completed (Game system fully integrated)
- [ ] T101 [US4] Integrate with pronunciation system for audio-visual learning

### Gamification System Integration (Completed ✅)

**Goal**: 게임화 시스템을 정식 프로덕션 시스템에 통합하여 사용자 참여도 향상

#### Backend Gamification Integration - COMPLETED ✅
- [x] G001 [P] Create GameificationEngine in backend/src/services/gamificationEngine.ts
- [x] G002 [P] Create GameificationSystem models in backend/src/models/GameificationSystem.ts
- [x] G003 [P] Create gamification API routes in backend/src/api/gamification.py
- [x] G004 [P] Integrate FSRS algorithm with gamification points system
- [x] G005 [P] Add gamification endpoints to main FastAPI app

#### Frontend Gamification Integration - COMPLETED ✅
- [x] G006 [P] Create SocialLeaderboard component in frontend/src/components/leaderboard/SocialLeaderboard.tsx
- [x] G007 [P] Create ChallengeCenter component in frontend/src/components/challenges/ChallengeCenter.tsx
- [x] G008 [P] Create gamification context in frontend/src/contexts/GamificationContext.tsx
- [x] G009 [P] Create comprehensive dashboard in frontend/src/pages/dashboard/index.tsx
- [x] G010 [P] Integrate gamification notifications and event system
- [x] G011 [P] Add point tracking and level progression UI components

#### Features Successfully Integrated ✅
- ✅ **Point System**: 포인트 획득, 보너스, 레벨업 자동 처리
- ✅ **Badge System**: 27개 다양한 배지 타입과 희귀도 시스템
- ✅ **Level System**: 10단계 레벨 시스템 (새싹 학습자 → 언어의 마스터)
- ✅ **Challenge System**: 일일, 주간, 월간 도전과제
- ✅ **Leaderboard**: 글로벌/주간/월간/친구 리더보드
- ✅ **Social Features**: 친구 활동 피드, 경쟁 이벤트
- ✅ **Quest System**: 스토리 기반 학습 퀘스트
- ✅ **Real-time Notifications**: 성취 알림 시스템
- ✅ **Progress Tracking**: 상세한 학습 진도 및 통계

**Checkpoint**: All core user stories should now be independently functional

---

## Phase 7: User Story 5 - 학습 진도 분석 (Priority: P3)

**Goal**: 개인별 학습 패턴을 분석하여 약점을 파악하고 학습 전략을 최적화하는 대시보드

**Independent Test**: 사용자의 학습 데이터를 기반으로 상세한 분석 리포트가 생성되고, 개선 방안이 제시되는지 확인

### Tests for User Story 5 ⚠️

- [ ] T102 [P] [US5] Contract test for analytics API in backend/tests/contract/test_analytics_api.test.ts
- [ ] T103 [P] [US5] Unit test for learning pattern analysis in backend/tests/unit/learningAnalytics.test.ts
- [ ] T104 [P] [US5] Integration test for progress calculation in backend/tests/integration/test_progress_calculation.test.ts
- [ ] T105 [P] [US5] E2E test for analytics dashboard in frontend/tests/e2e/analytics-dashboard.spec.ts

### Implementation for User Story 5

#### Backend Implementation
- [ ] T106 [P] [US5] Create LearningAnalytics model in backend/src/models/LearningAnalytics.ts
- [ ] T107 [P] [US5] Create PerformanceMetrics model in backend/src/models/PerformanceMetrics.ts
- [ ] T108 [US5] Implement AnalyticsService in backend/src/services/AnalyticsService.ts
- [ ] T109 [US5] Implement analytics API endpoints in backend/src/api/analytics.ts
- [ ] T110 [US5] Add learning pattern analysis algorithms
- [ ] T111 [US5] Add weakness identification and recommendation engine
- [ ] T112 [US5] Add comparative progress tracking against CEFR benchmarks

#### Frontend Implementation
- [ ] T113 [P] [US5] Create AnalyticsDashboard component in frontend/src/components/analytics/AnalyticsDashboard.tsx
- [ ] T114 [P] [US5] Create ProgressCharts component in frontend/src/components/analytics/ProgressCharts.tsx
- [ ] T115 [P] [US5] Create WeaknessAnalysis component in frontend/src/components/analytics/WeaknessAnalysis.tsx
- [ ] T116 [P] [US5] Create analytics page in frontend/src/pages/analytics.tsx
- [ ] T117 [US5] Implement analytics API client in frontend/src/services/analyticsApi.ts
- [ ] T118 [US5] Setup data visualization with Chart.js or D3
- [ ] T119 [US5] Add export functionality for learning reports
- [ ] T120 [US5] Add personalized learning recommendations display

**Checkpoint**: All user stories should now be independently functional with comprehensive analytics

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Performance & Optimization
- [ ] T121 [P] Implement Progressive Web App (PWA) features
- [ ] T122 [P] Setup Service Worker for offline capabilities in frontend/src/lib/serviceWorker.ts
- [ ] T123 [P] Implement IndexedDB caching for vocabulary and lessons
- [ ] T124 [P] Add image and audio lazy loading optimization
- [ ] T125 [P] Setup CDN configuration for static assets
- [ ] T126 Performance optimization across all API endpoints

### Security & Quality
- [ ] T127 [P] Implement rate limiting for all APIs
- [ ] T128 [P] Add input sanitization and validation
- [ ] T129 [P] Setup HTTPS and security headers
- [ ] T130 [P] Code cleanup and refactoring across codebase
- [ ] T131 [P] Add comprehensive error logging and monitoring

### Testing & Documentation
- [ ] T132 [P] Additional unit tests for critical business logic in backend/tests/unit/
- [ ] T133 [P] Additional integration tests for API workflows in backend/tests/integration/
- [ ] T134 [P] Cross-browser compatibility testing
- [ ] T135 [P] Mobile responsiveness testing and optimization
- [ ] T136 [P] Accessibility (WCAG 2.1 AA) compliance audit and fixes
- [ ] T137 [P] Run quickstart.md validation and update

### Deployment & DevOps
- [ ] T138 [P] Setup Docker configuration for development and production
- [ ] T139 [P] Setup CI/CD pipeline with automated testing
- [ ] T140 [P] Configure production deployment scripts
- [ ] T141 [P] Setup monitoring and alerting systems

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (개인화된 학습 경로)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (실시간 발음 연습)**: Can start after Foundational - May integrate with US1 curriculum but should be independently testable
- **User Story 3 (설교문 작성 지원)**: Can start after Foundational - Independent functionality
- **User Story 4 (어휘 및 표현 학습)**: Can start after Foundational - May integrate with US2 pronunciation but should be independently testable
- **User Story 5 (학습 진도 분석)**: Can start after Foundational - May use data from other stories but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before API endpoints
- Backend implementation before frontend integration
- Core implementation before cross-story integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Frontend and backend components marked [P] can be developed in parallel
- Different user stories can be worked on in parallel by different team members

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (개인화된 학습 경로)
4. Complete Phase 4: User Story 2 (실시간 발음 연습)
5. **STOP and VALIDATE**: Test core learning functionality independently
6. Deploy/demo MVP with personalized learning and pronunciation feedback

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Core MVP!)
4. Add User Story 3 → Test independently → Deploy/Demo (Advanced features!)
5. Add User Story 4 → Test independently → Deploy/Demo (Complete learning system!)
6. Add User Story 5 → Test independently → Deploy/Demo (Full analytics!)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (개인화된 학습 경로)
   - Developer B: User Story 2 (실시간 발음 연습)
   - Developer C: User Story 3 (설교문 작성 지원)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Korean-Hungarian language pair specific considerations included throughout
- Religious content handling and theological terminology integrated where relevant
- GDPR compliance and privacy considerations built into user data handling