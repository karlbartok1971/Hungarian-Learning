// Assessment 컴포넌트 통합 내보내기
// 한국인을 위한 헝가리어 학습 플랫폼 - A1~B2 레벨 평가 시스템

export { default as AssessmentStart } from './AssessmentStart';
export { default as AssessmentQuestion } from './AssessmentQuestion';
export { default as AssessmentResult } from './AssessmentResult';
export { default as AssessmentHistory } from './AssessmentHistory';

// 타입 정의들도 함께 내보내기
export type { AssessmentQuestionData } from './AssessmentQuestion';
export type { AssessmentResultData } from './AssessmentResult';
export type { AssessmentHistoryItem } from './AssessmentHistory';

// Assessment 관련 상수들
export const ASSESSMENT_TYPES = {
  PLACEMENT: 'placement' as const,
  PROGRESS: 'progress' as const,
  PASTORAL: 'pastoral' as const
} as const;

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice' as const,
  FILL_BLANK: 'fill_blank' as const,
  AUDIO_RECOGNITION: 'audio_recognition' as const,
  CULTURAL_CONTEXT: 'cultural_context' as const,
  ESSAY: 'essay' as const
} as const;

export const CEFR_LEVELS = {
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
  B2: 'B2'
} as const;

export const ASSESSMENT_CATEGORIES = {
  GRAMMAR: 'grammar' as const,
  VOCABULARY: 'vocabulary' as const,
  PRONUNCIATION: 'pronunciation' as const,
  CULTURAL: 'cultural' as const,
  WRITING: 'writing' as const
} as const;