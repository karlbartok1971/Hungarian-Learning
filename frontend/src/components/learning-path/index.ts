// LearningPath 컴포넌트 통합 내보내기
// 한국인을 위한 헝가리어 학습 플랫폼 - 개인화된 학습 경로 시스템

export { default as LearningPathOverview } from './LearningPathOverview';
export { default as LearningPathCustomizer } from './LearningPathCustomizer';
export { default as LearningPathAnalytics } from './LearningPathAnalytics';
export { default as LearningPathList } from './LearningPathList';

// 타입 정의들도 함께 내보내기
export type { LearningPathData } from './LearningPathOverview';
export type { LearningPathCustomization } from './LearningPathCustomizer';
export type { LearningAnalyticsData } from './LearningPathAnalytics';
export type { LearningPathItem } from './LearningPathList';

// Learning Path 관련 상수들
export const LEARNING_PATH_STATUS = {
  ACTIVE: 'active' as const,
  PAUSED: 'paused' as const,
  COMPLETED: 'completed' as const
} as const;

export const LESSON_TYPES = {
  GRAMMAR: 'grammar' as const,
  VOCABULARY: 'vocabulary' as const,
  PRONUNCIATION: 'pronunciation' as const,
  CULTURAL: 'cultural' as const,
  WRITING: 'writing' as const,
  LISTENING: 'listening' as const
} as const;

export const INTENSITY_LEVELS = {
  RELAXED: 'relaxed' as const,
  MODERATE: 'moderate' as const,
  INTENSIVE: 'intensive' as const
} as const;

export const FOCUS_AREAS = {
  GRAMMAR: 'grammar' as const,
  VOCABULARY: 'vocabulary' as const,
  PRONUNCIATION: 'pronunciation' as const,
  CULTURAL: 'cultural' as const,
  WRITING: 'writing' as const,
  LISTENING: 'listening' as const
} as const;

export const PASTORAL_SPECIALIZATIONS = {
  SERMON_WRITING: 'sermonWritingFocus' as const,
  LITURGICAL_LANGUAGE: 'liturgicalLanguage' as const,
  BIBLICAL_VOCABULARY: 'biblicalVocabulary' as const,
  CHURCH_CULTURE: 'churchCultureEmphasis' as const,
  CONGREGATION_INTERACTION: 'congregationInteraction' as const
} as const;