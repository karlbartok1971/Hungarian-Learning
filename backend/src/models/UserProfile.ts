import { ObjectId } from 'mongodb';

/**
 * 사용자 프로필 및 학습 현황 모델
 */

// 사용자 학습 스타일 enum
export enum LearningStyle {
  VISUAL = 'visual',           // 시각적 학습자
  AUDITORY = 'auditory',       // 청각적 학습자
  KINESTHETIC = 'kinesthetic', // 체감각적 학습자
  READING = 'reading'          // 읽기/쓰기 학습자
}

// 학습 선호도
export enum LearningPreference {
  GRAMMAR_FOCUSED = 'grammar_focused',     // 문법 중심
  VOCABULARY_FOCUSED = 'vocabulary_focused', // 어휘 중심
  CONVERSATION_FOCUSED = 'conversation_focused', // 회화 중심
  WRITING_FOCUSED = 'writing_focused',     // 쓰기 중심
  BALANCED = 'balanced'                    // 균형잡힌 학습
}

// 목표 유형
export enum LearningGoal {
  SERMON_WRITING = 'sermon_writing',       // 설교문 작성
  BASIC_COMMUNICATION = 'basic_communication', // 기본 의사소통
  THEOLOGICAL_STUDY = 'theological_study', // 신학 연구
  CULTURAL_UNDERSTANDING = 'cultural_understanding' // 문화 이해
}

// 사용자 레벨 정보
export interface UserLevel {
  overall_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  vocabulary_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  grammar_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  listening_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  speaking_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  reading_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  writing_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

// 학습 통계
export interface LearningStatistics {
  total_study_time_minutes: number;
  lessons_completed: number;
  vocabulary_learned: number;
  grammar_points_mastered: number;
  sermons_written: number;
  current_streak_days: number;
  longest_streak_days: number;
  accuracy_rate: number;
  improvement_rate: number;
  last_active_date: Date;
}

// 강점과 약점 분석
export interface StrengthWeaknessAnalysis {
  strengths: string[];
  weaknesses: string[];
  improvement_areas: string[];
  mastery_areas: string[];
  confidence_level: number; // 0-100
}

// 학습 패턴 분석
export interface LearningPattern {
  preferred_study_time: string; // 'morning', 'afternoon', 'evening'
  average_session_duration: number; // 분 단위
  difficulty_preference: 'easy' | 'medium' | 'hard' | 'mixed';
  content_type_preference: string[]; // ['vocabulary', 'grammar', 'reading', 'writing']
  learning_speed: 'slow' | 'medium' | 'fast';
}

// 개인화 설정
export interface PersonalizationSettings {
  daily_goal_minutes: number;
  reminder_enabled: boolean;
  reminder_time: string;
  adaptive_difficulty: boolean;
  show_korean_hints: boolean;
  pronunciation_practice: boolean;
  grammar_explanations: boolean;
}

// 메인 사용자 프로필 인터페이스
export interface UserProfile {
  _id: ObjectId;
  user_id: string;
  email: string;
  name: string;

  // 학습 관련 정보
  learning_style: LearningStyle;
  learning_preference: LearningPreference;
  learning_goals: LearningGoal[];
  current_level: UserLevel;
  target_level: UserLevel;

  // 통계 및 분석
  learning_statistics: LearningStatistics;
  strength_weakness: StrengthWeaknessAnalysis;
  learning_pattern: LearningPattern;

  // 개인화 설정
  personalization: PersonalizationSettings;

  // 메타데이터
  created_at: Date;
  updated_at: Date;
  last_assessment_date?: Date;
  next_assessment_due?: Date;
}

// 학습 경로 추천을 위한 사용자 컨텍스트
export interface UserLearningContext {
  profile: UserProfile;
  recent_performance: any[]; // 최근 성과 데이터
  current_focus_areas: string[];
  available_study_time: number;
  urgency_level: 'low' | 'medium' | 'high';
}

export default UserProfile;