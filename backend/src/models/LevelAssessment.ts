import { ObjectId } from 'mongodb';

/**
 * 사용자 레벨 평가 시스템 모델
 * CEFR 기준을 바탕으로 한 헝가리어 레벨 평가
 */

// CEFR 레벨
export enum CEFRLevel {
  A1 = 'A1', // 기초
  A2 = 'A2', // 초급
  B1 = 'B1', // 중급
  B2 = 'B2', // 중고급
  C1 = 'C1', // 고급
  C2 = 'C2'  // 숙련
}

// 평가 영역
export enum SkillArea {
  LISTENING = 'listening',       // 듣기
  READING = 'reading',          // 읽기
  SPEAKING = 'speaking',        // 말하기
  WRITING = 'writing',          // 쓰기
  VOCABULARY = 'vocabulary',    // 어휘
  GRAMMAR = 'grammar',          // 문법
  PRONUNCIATION = 'pronunciation' // 발음
}

// 질문 타입
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',      // 객관식
  LISTENING_COMPREHENSION = 'listening',    // 듣기 이해
  READING_COMPREHENSION = 'reading',        // 읽기 이해
  VOCABULARY_MATCHING = 'vocabulary',       // 어휘 매칭
  GRAMMAR_COMPLETION = 'grammar',           // 문법 완성
  PRONUNCIATION_RECORDING = 'pronunciation', // 발음 녹음
  WRITING_SAMPLE = 'writing',               // 작문 샘플
  CONVERSATION_SIMULATION = 'conversation'   // 대화 시뮬레이션
}

// 평가 질문
export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  skill_area: SkillArea;
  difficulty_level: CEFRLevel;
  question_text: string;
  options?: string[];           // 객관식 선택지
  correct_answer: string;
  audio_url?: string;          // 듣기 문제용 오디오
  image_url?: string;          // 시각적 보조 자료
  context?: string;            // 문맥 정보
  points: number;              // 배점
  time_limit_seconds: number;  // 제한 시간
  explanation?: string;        // 해설
  tags: string[];             // 태그
}

// 사용자 답안
export interface UserResponse {
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  time_taken_seconds: number;
  confidence_level?: number;   // 확신도 (1-5)
  audio_response_url?: string; // 발음/말하기 답안 오디오
  submitted_at: Date;
}

// 영역별 평가 결과
export interface SkillAssessmentResult {
  skill_area: SkillArea;
  estimated_level: CEFRLevel;
  confidence_score: number;    // 0-100
  correct_answers: number;
  total_questions: number;
  accuracy_percentage: number;
  time_efficiency: number;     // 시간 효율성
  strengths: string[];         // 강점
  weaknesses: string[];        // 약점
  detailed_scores: {
    [level in CEFRLevel]?: number;  // 각 레벨별 스코어
  };
}

// 종합 평가 결과
export interface ComprehensiveAssessmentResult {
  id: string;
  user_id: string;
  assessment_date: Date;

  // 전체 결과
  overall_level: CEFRLevel;
  overall_confidence: number;

  // 영역별 결과
  skill_results: SkillAssessmentResult[];

  // 상세 분석
  analysis: {
    korean_interference: {
      severity: 'low' | 'medium' | 'high';
      affected_areas: SkillArea[];
      specific_challenges: string[];
    };
    learning_style_indicators: {
      visual_learner: number;     // 0-100
      auditory_learner: number;   // 0-100
      kinesthetic_learner: number; // 0-100
      reading_writing_learner: number; // 0-100
    };
    motivation_indicators: {
      persistence_score: number;
      engagement_level: number;
      goal_orientation: number;
    };
  };

  // 추천 사항
  recommendations: {
    suggested_level: CEFRLevel;
    focus_areas: SkillArea[];
    learning_path_suggestions: string[];
    estimated_study_hours_weekly: number;
    target_timeline_months: number;
  };

  // 메타데이터
  total_questions: number;
  total_time_minutes: number;
  assessment_type: 'initial' | 'progress' | 'final';
  validity_score: number;      // 평가의 신뢰성
}

// 적응형 평가 세션
export interface AdaptiveAssessmentSession {
  id: string;
  user_id: string;
  started_at: Date;
  completed_at?: Date;
  current_question_index: number;

  // 적응형 로직 상태
  current_estimated_level: CEFRLevel;
  confidence_interval: [number, number]; // 신뢰구간
  questions_asked: string[];
  responses: UserResponse[];

  // 동적 조정 정보
  difficulty_adjustment_history: {
    question_index: number;
    previous_level: CEFRLevel;
    new_level: CEFRLevel;
    reason: string;
    timestamp: Date;
  }[];

  // 세션 설정
  target_precision: number;    // 목표 정확도
  max_questions: number;       // 최대 문제 수
  min_questions: number;       // 최소 문제 수
  skill_focus?: SkillArea[];   // 집중 평가 영역
}

// 평가 통계
export interface AssessmentStatistics {
  user_id: string;
  assessment_history: {
    date: Date;
    level: CEFRLevel;
    confidence: number;
  }[];

  skill_progression: {
    [skill in SkillArea]: {
      level_history: { date: Date; level: CEFRLevel }[];
      improvement_rate: number;  // 월별 향상률
    };
  };

  learning_insights: {
    most_improved_skill: SkillArea;
    challenging_areas: SkillArea[];
    study_consistency: number;  // 학습 일관성 점수
    optimal_study_time: string; // 최적 학습 시간대
  };
}

// 평가 설정
export interface AssessmentConfiguration {
  type: 'quick' | 'comprehensive' | 'skill_specific';
  duration_minutes: number;
  skill_areas: SkillArea[];
  difficulty_range: [CEFRLevel, CEFRLevel];
  adaptive_mode: boolean;
  include_pronunciation: boolean;
  include_cultural_context: boolean;
  korean_specific_challenges: boolean;
}

// CAT (Computer Adaptive Testing) 알고리즘 설정
export interface CATConfiguration {
  initial_theta: number;       // 초기 능력 추정값
  standard_error_threshold: number; // 표준오차 임계값
  max_items: number;          // 최대 문항 수
  min_items: number;          // 최소 문항 수
  termination_criterion: 'precision' | 'fixed_length' | 'classification';
  item_selection_method: 'maximum_info' | 'bayesian' | 'weighted';
  exposure_control: boolean;   // 문항 노출 제어
}

export default {
  CEFRLevel,
  SkillArea,
  QuestionType,
  AssessmentQuestion,
  UserResponse,
  SkillAssessmentResult,
  ComprehensiveAssessmentResult,
  AdaptiveAssessmentSession,
  AssessmentStatistics,
  AssessmentConfiguration,
  CATConfiguration
};