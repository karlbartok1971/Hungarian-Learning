import { ObjectId } from 'mongodb';
import { VocabularyReviewResponse } from './VocabularyCard';
import { GameEvent } from './GameificationSystem';

/**
 * 복습 세션 모델 - FSRS 기반 간격 반복 학습 세션 관리
 * T086 - ReviewSession 모델 구현
 *
 * 사용자의 어휘 학습 세션을 관리하고 진행 상황을 추적
 */

// 세션 상태
export enum ReviewSessionStatus {
  PENDING = 'pending',         // 대기 중
  ACTIVE = 'active',           // 진행 중
  PAUSED = 'paused',           // 일시 정지
  COMPLETED = 'completed',     // 완료
  EXPIRED = 'expired',         // 만료
  CANCELLED = 'cancelled'      // 취소
}

// 세션 타입
export enum ReviewSessionType {
  DAILY_REVIEW = 'daily_review',           // 일일 복습
  NEW_CARDS = 'new_cards',                 // 새 카드 학습
  FOCUSED_REVIEW = 'focused_review',       // 집중 복습
  QUICK_REVIEW = 'quick_review',           // 빠른 복습
  WEAK_CARDS = 'weak_cards',               // 약점 카드 복습
  CATEGORY_FOCUS = 'category_focus',       // 카테고리 집중 학습
  CHALLENGE_SESSION = 'challenge_session', // 도전과제 세션
  FREE_STUDY = 'free_study'                // 자유 학습
}

// 세션 설정
export interface ReviewSessionSettings {
  max_cards: number;                       // 최대 카드 수
  time_limit_minutes?: number;            // 시간 제한 (분)
  include_new_cards: boolean;             // 새 카드 포함 여부
  include_review_cards: boolean;          // 복습 카드 포함 여부
  include_learning_cards: boolean;        // 학습 중 카드 포함 여부

  // 난이도 및 카테고리 필터
  difficulty_levels?: string[];           // 난이도 레벨 필터
  categories?: string[];                  // 카테고리 필터
  cefr_levels?: string[];                // CEFR 레벨 필터

  // 학습 모드 설정
  show_hints: boolean;                    // 힌트 표시 여부
  auto_play_audio: boolean;              // 자동 음성 재생
  show_examples: boolean;                 // 예문 표시 여부
  randomize_order: boolean;              // 순서 랜덤화

  // 게임화 설정
  enable_gamification: boolean;          // 게임화 요소 활성화
  show_progress_animations: boolean;     // 진행 애니메이션 표시
  enable_achievements: boolean;          // 성취 알림 활성화
}

// 카드 문제 정보
export interface SessionCardInfo {
  card_id: string;
  vocabulary_card_id: string;
  hungarian_word: string;
  korean_meaning: string;

  // 문제 설정
  question_type: 'recognition' | 'production' | 'listening' | 'multiple_choice';
  show_hint: boolean;
  has_audio: boolean;

  // FSRS 정보
  due_date: Date;
  stability: number;
  difficulty: number;
  interval_days: number;

  // 세션 내 순서
  sequence_number: number;
  is_bonus_card: boolean;                // 보너스 카드 여부

  // 응답 정보 (응답 후 채워짐)
  user_response?: string;
  is_correct?: boolean;
  response_time_ms?: number;
  fsrs_rating?: number;
  reviewed_at?: Date;
}

// 세션 진행 통계
export interface SessionProgress {
  total_cards: number;
  completed_cards: number;
  remaining_cards: number;
  progress_percentage: number;

  // 성과 통계
  correct_answers: number;
  incorrect_answers: number;
  accuracy_rate: number;

  // 시간 통계
  total_time_spent_ms: number;
  average_response_time_ms: number;
  estimated_remaining_time_ms: number;

  // 카테고리별 진행률
  category_progress: {
    category: string;
    total: number;
    completed: number;
    accuracy: number;
  }[];

  // 난이도별 진행률
  difficulty_progress: {
    level: string;
    total: number;
    completed: number;
    accuracy: number;
  }[];
}

// 세션 결과 요약
export interface SessionSummary {
  // 기본 통계
  total_cards_reviewed: number;
  correct_answers: number;
  accuracy_percentage: number;
  total_time_minutes: number;
  average_response_time_seconds: number;

  // 성과 분석
  cards_mastered: number;               // 마스터한 카드 수
  cards_need_review: number;           // 추가 복습 필요한 카드 수
  new_cards_learned: number;           // 새로 학습한 카드 수

  // 카테고리별 성과
  category_performance: {
    category: string;
    accuracy: number;
    time_per_card: number;
    cards_count: number;
  }[];

  // 가장 어려웠던/쉬웠던 카드
  most_difficult_cards: string[];      // 카드 ID 배열
  easiest_cards: string[];            // 카드 ID 배열

  // 학습 패턴 분석
  performance_trend: number[];         // 세션 중 성과 변화
  concentration_score: number;         // 집중도 점수 (0-1)
  consistency_score: number;          // 일관성 점수 (0-1)

  // 게임화 보상
  points_earned: number;
  badges_unlocked: string[];
  level_up_achieved: boolean;
  streak_maintained: boolean;
}

// 세션 중 실시간 피드백
export interface SessionFeedback {
  card_id: string;
  feedback_type: 'correct' | 'incorrect' | 'hint' | 'encouragement' | 'warning';
  message: string;
  icon?: string;
  color?: string;

  // 학습 조언
  learning_tip?: string;
  grammar_explanation?: string;
  pronunciation_guide?: string;

  // 게임화 요소
  points_earned?: number;
  combo_count?: number;
  badge_progress?: {
    badge_id: string;
    current_progress: number;
    target_value: number;
  };
}

// 메인 복습 세션 인터페이스
export interface ReviewSession {
  _id: ObjectId;

  // 기본 정보
  session_id: string;
  user_id: string;
  session_type: ReviewSessionType;
  status: ReviewSessionStatus;

  // 세션 설정
  settings: ReviewSessionSettings;

  // 카드 정보
  cards: SessionCardInfo[];
  current_card_index: number;

  // 진행 상황
  progress: SessionProgress;

  // 시간 정보
  created_at: Date;
  started_at?: Date;
  paused_at?: Date;
  resumed_at?: Date;
  completed_at?: Date;
  expires_at: Date;                    // 세션 만료 시간

  // 세션 결과 (완료 후)
  summary?: SessionSummary;

  // 실시간 피드백 로그
  feedback_history: SessionFeedback[];

  // 게임화 이벤트
  gamification_events: GameEvent[];

  // 세션 메타데이터
  metadata: {
    client_platform: string;           // 클라이언트 플랫폼
    session_source: 'manual' | 'scheduled' | 'reminder' | 'challenge';
    previous_session_id?: string;      // 이전 세션 ID (연속 학습)
    study_goal?: string;               // 학습 목표

    // 환경 정보
    study_location?: string;           // 학습 장소
    study_method?: 'focused' | 'relaxed' | 'intensive';
    background_noise_level?: number;   // 주변 소음 수준 (0-1)
  };

  // 품질 관리
  quality_metrics: {
    completion_rate: number;           // 완주율
    engagement_score: number;          // 참여도 점수
    efficiency_score: number;          // 효율성 점수
    session_rating?: number;           // 사용자 평가 (1-5)
    user_feedback?: string;           // 사용자 피드백
  };
}

// 세션 생성용 DTO
export interface CreateReviewSessionDTO {
  user_id: string;
  session_type: ReviewSessionType;
  settings: ReviewSessionSettings;
  study_goal?: string;
  session_source?: 'manual' | 'scheduled' | 'reminder' | 'challenge';
}

// 세션 업데이트용 DTO
export interface UpdateReviewSessionDTO {
  status?: ReviewSessionStatus;
  current_card_index?: number;
  paused_at?: Date;
  resumed_at?: Date;
  session_rating?: number;
  user_feedback?: string;
}

// 카드 응답 제출용 DTO
export interface SubmitCardResponseDTO {
  session_id: string;
  card_id: string;
  user_response: string;
  response_time_ms: number;
  confidence_level?: number;
  hint_used: boolean;
  audio_played: boolean;
}

// 세션 필터링 옵션
export interface ReviewSessionFilterOptions {
  user_id: string;
  session_types?: ReviewSessionType[];
  statuses?: ReviewSessionStatus[];
  date_range?: {
    start_date: Date;
    end_date: Date;
  };

  // 성과 필터
  min_accuracy?: number;
  max_accuracy?: number;
  min_duration_minutes?: number;
  max_duration_minutes?: number;

  // 정렬 옵션
  sort_by?: 'created_at' | 'completed_at' | 'accuracy' | 'duration';
  sort_order?: 'asc' | 'desc';

  // 페이지네이션
  page?: number;
  limit?: number;
}

// 세션 분석 리포트
export interface SessionAnalyticsReport {
  user_id: string;
  period: {
    start_date: Date;
    end_date: Date;
  };

  // 전체 통계
  total_sessions: number;
  completed_sessions: number;
  total_study_time_minutes: number;
  average_session_duration: number;
  completion_rate: number;

  // 성과 통계
  overall_accuracy: number;
  total_cards_reviewed: number;
  cards_mastered: number;
  improvement_rate: number;           // 개선율

  // 세션 타입별 성과
  session_type_performance: {
    type: ReviewSessionType;
    sessions_count: number;
    average_accuracy: number;
    average_duration: number;
    preference_score: number;         // 선호도 점수
  }[];

  // 시간대별 성과 분석
  time_of_day_performance: {
    hour: number;
    sessions_count: number;
    average_accuracy: number;
    concentration_score: number;
  }[];

  // 학습 패턴 분석
  learning_patterns: {
    optimal_session_length: number;   // 최적 세션 길이
    best_performance_time: string;    // 최고 성과 시간
    consistency_score: number;        // 일관성 점수
    motivation_trend: number[];       // 동기 변화 추이
  };

  // 추천사항
  recommendations: {
    suggested_session_length: number;
    recommended_study_time: string;
    focus_categories: string[];
    difficulty_adjustment: {
      category: string;
      suggested_action: 'increase' | 'decrease' | 'maintain';
    }[];
  };
}

// 세션 대기열 관리
export interface SessionQueue {
  user_id: string;
  pending_sessions: {
    session_type: ReviewSessionType;
    priority: number;
    estimated_cards: number;
    estimated_duration_minutes: number;
    due_date?: Date;
    created_at: Date;
  }[];

  // 스케줄링 설정
  auto_scheduling_enabled: boolean;
  preferred_study_times: string[];    // HH:MM 형식
  max_daily_sessions: number;
  preferred_session_duration: number;
}

// 세션 미리보기 정보
export interface SessionPreview {
  session_type: ReviewSessionType;
  estimated_cards: number;
  estimated_duration_minutes: number;

  // 카드 구성 미리보기
  card_breakdown: {
    new_cards: number;
    review_cards: number;
    learning_cards: number;
  };

  // 카테고리별 분포
  category_distribution: {
    category: string;
    count: number;
    percentage: number;
  }[];

  // 난이도 분포
  difficulty_distribution: {
    level: string;
    count: number;
    estimated_accuracy: number;
  }[];

  // 예상 보상
  expected_rewards: {
    points_range: [number, number];
    possible_badges: string[];
    level_up_chance: number;
  };
}

export default {
  ReviewSessionStatus,
  ReviewSessionType,
  ReviewSession,
  CreateReviewSessionDTO,
  UpdateReviewSessionDTO,
  SubmitCardResponseDTO,
  ReviewSessionFilterOptions,
  SessionAnalyticsReport,
  SessionQueue,
  SessionPreview
};