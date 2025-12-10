import { ObjectId } from 'mongodb';
import { VocabularyCategory, DifficultyLevel } from './VocabularyCard';
import { ReviewSessionType } from './ReviewSession';

/**
 * 학습 통계 모델 - 사용자의 학습 데이터 분석 및 진도 추적
 * T087 - LearningStatistics 모델 구현
 *
 * 개인화된 학습 분석과 진도 관리를 위한 포괄적 통계 시스템
 */

// 학습 진도 레벨
export enum ProgressLevel {
  BEGINNER = 'beginner',           // 초급 (A1)
  ELEMENTARY = 'elementary',       // 초중급 (A2)
  INTERMEDIATE = 'intermediate',   // 중급 (B1)
  UPPER_INTERMEDIATE = 'upper_intermediate', // 중상급 (B2)
  ADVANCED = 'advanced',          // 고급 (C1+)
  MASTERY = 'mastery'            // 숙달 (원어민 수준)
}

// 학습 영역별 성과 분석
export interface LearningDomainAnalysis {
  domain: VocabularyCategory;

  // 기본 통계
  total_cards: number;
  cards_learned: number;
  cards_mastered: number;
  average_accuracy: number;

  // 진도 분석
  current_level: ProgressLevel;
  progress_percentage: number;
  estimated_completion_date: Date;

  // 성과 메트릭
  retention_rate: number;          // 기억 유지율
  learning_velocity: number;       // 학습 속도 (카드/시간)
  difficulty_adaptation: number;   // 난이도 적응도

  // 약점 분석
  weak_areas: {
    subcategory: string;
    accuracy: number;
    frequency_errors: number;
    suggested_focus: boolean;
  }[];

  // 강점 분석
  strong_areas: {
    subcategory: string;
    accuracy: number;
    mastery_speed: number;
    confidence_level: number;
  }[];

  // 예측 분석
  predicted_mastery_date: Date;
  recommended_study_frequency: number; // 주당 세션 수
  optimal_session_duration: number;   // 분 단위
}

// 시간대별 학습 패턴
export interface TemporalLearningPattern {
  // 일별 패턴
  daily_patterns: {
    day_of_week: number;           // 0=일요일, 6=토요일
    average_study_time: number;    // 분 단위
    average_accuracy: number;
    sessions_count: number;
    preferred_session_type: ReviewSessionType;
    peak_performance_hour: number;
  }[];

  // 시간대별 패턴
  hourly_patterns: {
    hour: number;                  // 0-23
    performance_score: number;     // 0-1
    concentration_level: number;   // 0-1
    sessions_count: number;
    average_accuracy: number;
  }[];

  // 월별/장기 트렌드
  monthly_trends: {
    year_month: string;           // YYYY-MM
    total_study_time: number;
    cards_learned: number;
    average_accuracy: number;
    consistency_score: number;    // 학습 일관성
    motivation_indicator: number; // 동기 지표
  }[];

  // 학습 주기 분석
  learning_cycles: {
    cycle_type: 'daily' | 'weekly' | 'monthly';
    optimal_frequency: number;
    fatigue_threshold: number;    // 피로도 임계점
    recovery_time_needed: number; // 회복 시간 (분)
  }[];
}

// 인지 능력 분석
export interface CognitiveAbilityAnalysis {
  // 기억 관련 능력
  memory_analysis: {
    short_term_retention: number;     // 단기 기억 (0-1)
    long_term_retention: number;      // 장기 기억 (0-1)
    working_memory_capacity: number;  // 작업 기억 용량
    forgetting_curve_slope: number;   // 망각 곡선 기울기
  };

  // 처리 속도
  processing_speed: {
    average_response_time: number;    // 평균 응답 시간 (ms)
    reading_comprehension_speed: number;
    pattern_recognition_speed: number;
    decision_making_speed: number;
  };

  // 학습 스타일 분석
  learning_style: {
    visual_learner_score: number;     // 시각적 학습자 점수
    auditory_learner_score: number;   // 청각적 학습자 점수
    kinesthetic_learner_score: number; // 신체적 학습자 점수
    mixed_style_preference: boolean;
  };

  // 주의 집중력
  attention_analysis: {
    sustained_attention_span: number; // 지속적 주의력 (분)
    selective_attention_score: number; // 선택적 주의력
    divided_attention_score: number;   // 분할 주의력
    attention_consistency: number;     // 주의력 일관성
  };
}

// 학습 동기 및 참여도 분석
export interface MotivationEngagementAnalysis {
  // 동기 지표
  motivation_indicators: {
    intrinsic_motivation: number;     // 내재적 동기 (0-1)
    extrinsic_motivation: number;     // 외재적 동기 (0-1)
    goal_orientation: number;         // 목표 지향성
    self_efficacy: number;           // 자기 효능감
  };

  // 참여도 메트릭
  engagement_metrics: {
    session_completion_rate: number; // 세션 완료율
    voluntary_extra_practice: number; // 자발적 추가 연습
    feature_usage_diversity: number; // 기능 사용 다양성
    social_interaction_level: number; // 소셜 상호작용 수준
  };

  // 만족도 및 피드백
  satisfaction_feedback: {
    overall_satisfaction: number;     // 전체 만족도 (1-5)
    content_quality_rating: number;
    difficulty_appropriateness: number;
    interface_usability_rating: number;
    progress_visibility_satisfaction: number;
  };

  // 도전과제 및 게임화 반응
  gamification_response: {
    badge_collection_motivation: number;
    leaderboard_competitiveness: number;
    challenge_participation_rate: number;
    reward_effectiveness: number;
  };
}

// 언어 능력 발달 추적
export interface LanguageDevelopmentTracking {
  // CEFR 수준별 진도
  cefr_progress: {
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    mastery_percentage: number;
    estimated_achievement_date: Date;
    current_focus_areas: string[];
  }[];

  // 언어 기능별 발달
  language_skills: {
    vocabulary_breadth: number;       // 어휘 폭
    vocabulary_depth: number;         // 어휘 깊이
    grammatical_accuracy: number;     // 문법 정확도
    pronunciation_quality: number;    // 발음 품질
    comprehension_speed: number;      // 이해 속도
    production_fluency: number;       // 산출 유창성
  };

  // 특수 목적 언어 능력 (목회자 특화)
  specialized_competence: {
    theological_vocabulary: number;   // 신학 어휘 숙달도
    liturgical_language: number;      // 예배 언어 숙달도
    pastoral_communication: number;   // 목회적 소통 능력
    biblical_language_understanding: number; // 성경 언어 이해도
  };

  // 문화적 능력
  cultural_competence: {
    cultural_awareness: number;       // 문화적 인식
    pragmatic_competence: number;     // 화용적 능력
    intercultural_sensitivity: number; // 문화간 감수성
    hungarian_cultural_knowledge: number; // 헝가리 문화 지식
  };
}

// 학습 효율성 분석
export interface LearningEfficiencyAnalysis {
  // 투입 대비 산출
  roi_metrics: {
    time_to_mastery_ratio: number;   // 숙달까지 시간 비율
    effort_to_progress_ratio: number; // 노력 대비 진도 비율
    accuracy_improvement_rate: number; // 정확도 개선율
    retention_efficiency: number;     // 기억 효율성
  };

  // 학습 전략 효과성
  strategy_effectiveness: {
    spaced_repetition_benefit: number; // 간격 반복 효과
    interleaving_benefit: number;      // 교차 학습 효과
    elaborative_rehearsal_impact: number; // 정교화 연습 효과
    context_variation_benefit: number;  // 맥락 변화 효과
  };

  // 최적화 제안
  optimization_suggestions: {
    suggested_session_length: number; // 권장 세션 길이 (분)
    optimal_break_frequency: number;  // 최적 휴식 빈도
    recommended_difficulty_curve: number[]; // 권장 난이도 곡선
    personalized_learning_path: string[]; // 개인화 학습 경로
  };
}

// 예측 모델 결과
export interface PredictiveModelResults {
  // 성과 예측
  performance_predictions: {
    next_week_accuracy: number;
    next_month_progress: number;
    long_term_success_probability: number;
    plateau_risk_assessment: number;
  };

  // 목표 달성 예측
  goal_achievement_forecast: {
    target_level: ProgressLevel;
    estimated_completion_date: Date;
    confidence_interval: [Date, Date];
    required_effort_increase: number;
  };

  // 위험 요소 예측
  risk_assessments: {
    dropout_risk: number;             // 중도 포기 위험
    plateau_risk: number;             // 정체 위험
    burnout_risk: number;            // 번아웃 위험
    motivation_decline_risk: number;  // 동기 저하 위험
  };

  // 적응형 추천
  adaptive_recommendations: {
    content_difficulty_adjustment: number; // 콘텐츠 난이도 조정
    session_frequency_adjustment: number;  // 세션 빈도 조정
    motivation_intervention_needed: boolean; // 동기 부여 개입 필요
    learning_path_modification: string[];   // 학습 경로 수정
  };
}

// 메인 학습 통계 인터페이스
export interface LearningStatistics {
  _id: ObjectId;

  // 기본 정보
  user_id: string;
  statistics_id: string;

  // 전반적 학습 현황
  overall_progress: {
    total_study_time_minutes: number;
    total_sessions_completed: number;
    total_cards_studied: number;
    overall_accuracy: number;
    current_streak_days: number;
    longest_streak_days: number;
    level_progression: ProgressLevel;
  };

  // 도메인별 분석
  domain_analysis: LearningDomainAnalysis[];

  // 시간 패턴 분석
  temporal_patterns: TemporalLearningPattern;

  // 인지 능력 분석
  cognitive_analysis: CognitiveAbilityAnalysis;

  // 동기 및 참여도
  motivation_analysis: MotivationEngagementAnalysis;

  // 언어 발달 추적
  language_development: LanguageDevelopmentTracking;

  // 효율성 분석
  efficiency_analysis: LearningEfficiencyAnalysis;

  // 예측 모델 결과
  predictive_insights: PredictiveModelResults;

  // 메타데이터
  metadata: {
    last_calculated_at: Date;
    calculation_version: string;
    data_completeness_score: number; // 데이터 완성도 (0-1)
    confidence_level: number;        // 분석 신뢰도 (0-1)
  };

  // 시스템 정보
  created_at: Date;
  updated_at: Date;
}

// 통계 계산용 DTO
export interface CalculateStatisticsDTO {
  user_id: string;
  calculation_scope: 'full' | 'incremental' | 'domain_specific';
  include_predictions: boolean;
  target_domains?: VocabularyCategory[];
}

// 통계 조회 옵션
export interface StatisticsQueryOptions {
  user_id: string;
  domains?: VocabularyCategory[];
  time_range?: {
    start_date: Date;
    end_date: Date;
  };
  include_predictions: boolean;
  granularity: 'summary' | 'detailed' | 'comprehensive';
}

// 통계 대시보드 데이터
export interface StatisticsDashboardData {
  user_id: string;

  // 요약 카드
  summary_cards: {
    total_study_time: string;
    accuracy_this_week: number;
    cards_mastered: number;
    current_streak: number;
    level_progress: {
      current: ProgressLevel;
      percentage: number;
    };
  };

  // 차트 데이터
  charts_data: {
    progress_chart: {
      dates: string[];
      accuracy: number[];
      study_time: number[];
      cards_learned: number[];
    };

    category_performance: {
      categories: string[];
      accuracy: number[];
      time_spent: number[];
    };

    hourly_performance: {
      hours: number[];
      performance_scores: number[];
    };
  };

  // 인사이트 및 추천
  insights: {
    key_insights: string[];
    improvement_suggestions: string[];
    strength_highlights: string[];
    goal_recommendations: string[];
  };

  // 비교 데이터
  comparative_data: {
    vs_previous_week: {
      accuracy_change: number;
      study_time_change: number;
      progress_change: number;
    };
    vs_peer_average: {
      accuracy_percentile: number;
      progress_percentile: number;
      engagement_percentile: number;
    };
  };
}

// 학습 분석 리포트
export interface LearningAnalyticsReport {
  user_id: string;
  report_type: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  period: {
    start_date: Date;
    end_date: Date;
  };

  // 실행 요약
  executive_summary: {
    overall_grade: 'A' | 'B' | 'C' | 'D' | 'F';
    key_achievements: string[];
    areas_for_improvement: string[];
    next_period_goals: string[];
  };

  // 상세 분석
  detailed_analysis: LearningStatistics;

  // 액션 플랜
  action_plan: {
    priority_focus_areas: VocabularyCategory[];
    recommended_study_schedule: {
      frequency: number;
      duration: number;
      best_times: string[];
    };
    specific_goals: {
      goal: string;
      target_date: Date;
      success_metrics: string[];
    }[];
  };

  // 생성 정보
  generated_at: Date;
  report_version: string;
}

export default {
  ProgressLevel,
  LearningStatistics,
  CalculateStatisticsDTO,
  StatisticsQueryOptions,
  StatisticsDashboardData,
  LearningAnalyticsReport
};