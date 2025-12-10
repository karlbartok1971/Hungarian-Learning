import { ObjectId } from 'mongodb';

/**
 * 게임화 학습 시스템 모델
 * 포인트, 레벨, 배지, 도전과제 등을 포함한 종합적인 게임화 요소
 */

// 배지 타입
export enum BadgeType {
  STREAK = 'streak',                    // 연속 학습
  VOCABULARY = 'vocabulary',            // 어휘 관련
  GRAMMAR = 'grammar',                  // 문법 관련
  THEOLOGICAL = 'theological',          // 신학 관련
  ACCURACY = 'accuracy',                // 정확도 관련
  SPEED = 'speed',                      // 학습 속도
  MILESTONE = 'milestone',              // 레벨 달성
  SPECIAL = 'special',                  // 특별 이벤트
  SOCIAL = 'social',                    // 소셜 활동
  COMPLETION = 'completion'             // 완주 관련
}

// 배지 등급
export enum BadgeRarity {
  COMMON = 'common',        // 일반 (회색)
  UNCOMMON = 'uncommon',    // 고급 (녹색)
  RARE = 'rare',            // 희귀 (파란색)
  EPIC = 'epic',            // 에픽 (보라색)
  LEGENDARY = 'legendary'   // 전설 (주황색)
}

// 포인트 획득 유형
export enum PointSource {
  LESSON_COMPLETION = 'lesson_completion',
  QUIZ_CORRECT_ANSWER = 'quiz_correct_answer',
  STREAK_BONUS = 'streak_bonus',
  DAILY_GOAL_ACHIEVEMENT = 'daily_goal_achievement',
  WEEKLY_GOAL_ACHIEVEMENT = 'weekly_goal_achievement',
  BADGE_EARNED = 'badge_earned',
  LEVEL_UP = 'level_up',
  CHALLENGE_COMPLETION = 'challenge_completion',
  PERFECT_SCORE = 'perfect_score',
  FIRST_TRY_SUCCESS = 'first_try_success',
  SOCIAL_INTERACTION = 'social_interaction',
  SPECIAL_EVENT = 'special_event'
}

// 배지 정의
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  type: BadgeType;
  rarity: BadgeRarity;
  icon: string;
  unlock_criteria: {
    type: string;                    // 조건 타입 (예: 'streak', 'vocabulary_count', 'accuracy_rate')
    threshold: number;               // 달성해야 할 값
    additional_requirements?: any;   // 추가 조건들
  };
  points_reward: number;
  is_hidden: boolean;              // 히든 배지 여부
  unlock_hint?: string;            // 히든 배지의 힌트
  category: string;                // 카테고리 (예: '학습', '성취', '특별')
}

// 사용자 배지
export interface UserBadge {
  badge_id: string;
  earned_at: Date;
  progress?: number;               // 진행 상황 (0-100)
  is_displayed: boolean;           // 프로필에 표시 여부
}

// 레벨 시스템
export interface LevelDefinition {
  level: number;
  required_points: number;
  title: string;                   // 레벨 타이틀 (예: "초보자", "전문가")
  description: string;
  unlock_rewards: {
    badges?: string[];             // 레벨업시 획득하는 배지들
    features?: string[];           // 해제되는 기능들
    bonus_points?: number;         // 보너스 포인트
  };
  icon: string;
  color: string;                   // 레벨 색상
}

// 포인트 내역
export interface PointTransaction {
  id: string;
  user_id: string;
  source: PointSource;
  points: number;
  description: string;
  metadata?: {
    lesson_id?: string;
    quiz_id?: string;
    badge_id?: string;
    accuracy?: number;
    streak_count?: number;
    [key: string]: any;
  };
  earned_at: Date;
}

// 사용자 게임화 프로필
export interface UserGameProfile {
  _id: ObjectId;
  user_id: string;

  // 포인트 및 레벨
  total_points: number;
  current_level: number;
  points_to_next_level: number;

  // 배지
  badges_earned: UserBadge[];
  displayed_badges: string[];      // 프로필에 표시할 배지 ID들 (최대 3-5개)

  // 통계
  statistics: {
    total_lessons_completed: number;
    total_quizzes_completed: number;
    current_streak_days: number;
    longest_streak_days: number;
    total_study_time_minutes: number;
    average_accuracy: number;
    perfect_scores_count: number;
    badges_count_by_rarity: {
      [BadgeRarity.COMMON]: number;
      [BadgeRarity.UNCOMMON]: number;
      [BadgeRarity.RARE]: number;
      [BadgeRarity.EPIC]: number;
      [BadgeRarity.LEGENDARY]: number;
    };
  };

  // 진행 중인 배지
  badge_progress: {
    badge_id: string;
    current_progress: number;
    target_value: number;
    started_at: Date;
  }[];

  // 설정
  preferences: {
    show_point_animations: boolean;
    show_badge_notifications: boolean;
    show_level_up_celebrations: boolean;
    public_profile: boolean;
    enable_leaderboard: boolean;
  };

  created_at: Date;
  updated_at: Date;
}

// 도전과제 (챌린지) 정의
export interface ChallengeDefinition {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';

  objectives: {
    id: string;
    description: string;
    target_value: number;
    current_progress?: number;
    is_completed?: boolean;
  }[];

  rewards: {
    points: number;
    badges?: string[];
    special_items?: string[];
  };

  time_limit: {
    start_date: Date;
    end_date: Date;
    duration_hours?: number;
  };

  requirements: {
    min_level?: number;
    required_badges?: string[];
    skill_level?: { [skill: string]: string };
  };

  is_active: boolean;
  max_participants?: number;
  current_participants?: number;

  metadata: {
    tags: string[];
    category: string;
    created_by: 'system' | 'admin';
    is_featured: boolean;
  };
}

// 사용자 도전과제 진행상황
export interface UserChallenge {
  user_id: string;
  challenge_id: string;
  started_at: Date;
  objectives_progress: {
    objective_id: string;
    current_progress: number;
    completed_at?: Date;
  }[];
  is_completed: boolean;
  completed_at?: Date;
  rewards_claimed: boolean;
  final_score?: number;
}

// 리더보드 항목
export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url?: string;
  rank: number;
  score: number;
  level: number;
  badges_count: number;
  country?: string;

  // 시간별 순위
  weekly_rank?: number;
  monthly_rank?: number;

  // 변화
  rank_change: number;           // 지난 기간 대비 순위 변화 (+5, -2 등)
  score_change: number;          // 지난 기간 대비 점수 변화
}

// 리더보드
export interface Leaderboard {
  type: 'global' | 'weekly' | 'monthly' | 'friends' | 'level_based';
  period: string;                // 기간 (예: '2024-11-week4', 'all-time')
  last_updated: Date;

  entries: LeaderboardEntry[];

  metadata: {
    total_participants: number;
    min_level?: number;
    max_level?: number;
    category?: string;           // 특정 카테고리 리더보드 (예: '신학')
  };
}

// 성취 통계
export interface AchievementStats {
  user_id: string;

  // 일일 통계
  daily_stats: {
    date: string;                // YYYY-MM-DD
    points_earned: number;
    lessons_completed: number;
    quizzes_completed: number;
    study_time_minutes: number;
    badges_earned: number;
  }[];

  // 주간 통계
  weekly_stats: {
    week: string;                // YYYY-MM-WW
    total_points: number;
    avg_daily_study: number;
    streak_maintained: boolean;
    goals_achieved: number;
    new_badges: number;
  }[];

  // 월간 통계
  monthly_stats: {
    month: string;               // YYYY-MM
    points_earned: number;
    level_ups: number;
    perfect_scores: number;
    study_consistency: number;   // 0-1 (매일 학습한 비율)
    achievements_unlocked: number;
  }[];
}

// 게임화 이벤트 (시스템 내부용)
export interface GameificationEvent {
  id: string;
  user_id: string;
  event_type: 'point_earned' | 'badge_unlocked' | 'level_up' | 'challenge_completed' | 'streak_achieved';

  details: {
    points_change?: number;
    new_level?: number;
    badge_id?: string;
    challenge_id?: string;
    streak_count?: number;
    metadata?: any;
  };

  display_info: {
    title: string;
    message: string;
    icon?: string;
    color?: string;
    animation_type?: 'celebration' | 'notification' | 'achievement';
  };

  created_at: Date;
  shown_to_user: boolean;
  user_interaction?: {
    viewed_at?: Date;
    clicked?: boolean;
    dismissed?: boolean;
  };
}

export default {
  BadgeType,
  BadgeRarity,
  PointSource,
  BadgeDefinition,
  UserBadge,
  LevelDefinition,
  PointTransaction,
  UserGameProfile,
  ChallengeDefinition,
  UserChallenge,
  LeaderboardEntry,
  Leaderboard,
  AchievementStats,
  GameificationEvent
};