'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 게임화 관련 타입 정의
export interface UserGameProfile {
  user_id: string;
  total_points: number;
  current_level: number;
  level_title: string;
  points_to_next_level: number;
  badges_earned: Badge[];
  statistics: UserStatistics;
  preferences: GamePreferences;
}

export interface Badge {
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  is_displayed: boolean;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface UserStatistics {
  total_lessons_completed: number;
  total_quizzes_completed: number;
  current_streak_days: number;
  longest_streak_days: number;
  total_study_time_minutes: number;
  average_accuracy: number;
  perfect_scores_count: number;
}

export interface GamePreferences {
  show_point_animations: boolean;
  show_badge_notifications: boolean;
  show_level_up_celebrations: boolean;
  public_profile: boolean;
  enable_leaderboard: boolean;
}

export interface GameEvent {
  id: string;
  event_type: 'point_earned' | 'badge_unlocked' | 'level_up' | 'challenge_completed';
  details: any;
  display_info: {
    title: string;
    message: string;
    icon?: string;
    color?: string;
    animation_type?: string;
  };
  shown_to_user: boolean;
}

// API 응답 타입
interface PointsAwardResponse {
  points_awarded: number;
  level_up?: boolean;
  new_level?: number;
  badges_earned?: string[];
  events: GameEvent[];
}

// Context 타입 정의
interface GamificationContextType {
  userProfile: UserGameProfile | null;
  pendingEvents: GameEvent[];
  isLoading: boolean;
  error: string | null;

  // 메서드
  fetchUserProfile: () => Promise<void>;
  awardPoints: (source: string, points: number, metadata?: any) => Promise<PointsAwardResponse | null>;
  updateProgress: (lessonId: string, score: number, accuracy: number, studyTime: number) => Promise<void>;
  dismissEvent: (eventId: string) => void;
  markEventAsShown: (eventId: string) => void;
}

// Context 생성
const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

// Provider 컴포넌트
interface GamificationProviderProps {
  children: ReactNode;
}

export const GamificationProvider: React.FC<GamificationProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserGameProfile | null>(null);
  const [pendingEvents, setPendingEvents] = useState<GameEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 사용자 프로필 조회
  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다');
      }

      const response = await fetch('/api/gamification/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('프로필 조회에 실패했습니다');
      }

      const data = await response.json();
      if (data.success) {
        setUserProfile(data.data.user_profile);
      } else {
        throw new Error(data.message || '프로필 조회에 실패했습니다');
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');

      // Mock 데이터로 대체 (개발 환경)
      setUserProfile({
        user_id: 'user123',
        total_points: 2850,
        current_level: 6,
        level_title: '헝가리어 애호가',
        points_to_next_level: 650,
        badges_earned: [
          {
            badge_id: 'streak_7_days',
            name: '한 주의 달인',
            description: '일주일 연속 학습을 완주했습니다',
            icon: '⭐',
            earned_at: '2024-11-20T10:00:00Z',
            is_displayed: true,
            category: '연속 학습',
            rarity: 'uncommon'
          }
        ],
        statistics: {
          total_lessons_completed: 45,
          total_quizzes_completed: 128,
          current_streak_days: 12,
          longest_streak_days: 15,
          total_study_time_minutes: 1820,
          average_accuracy: 87.5,
          perfect_scores_count: 23
        },
        preferences: {
          show_point_animations: true,
          show_badge_notifications: true,
          show_level_up_celebrations: true,
          public_profile: true,
          enable_leaderboard: true
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 포인트 지급
  const awardPoints = async (
    source: string,
    points: number,
    metadata?: any
  ): Promise<PointsAwardResponse | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다');
      }

      const response = await fetch('/api/gamification/award-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ source, points, metadata })
      });

      if (!response.ok) {
        throw new Error('포인트 지급에 실패했습니다');
      }

      const data = await response.json();
      if (data.success) {
        const result = data.data;

        // 사용자 프로필 업데이트
        if (userProfile) {
          setUserProfile(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              total_points: prev.total_points + result.points_awarded,
              current_level: result.new_level || prev.current_level,
              points_to_next_level: result.level_up
                ? 1000 // 임시값
                : prev.points_to_next_level - result.points_awarded
            };
          });
        }

        // 이벤트 큐에 추가
        if (result.events && result.events.length > 0) {
          setPendingEvents(prev => [...prev, ...result.events]);
        }

        return result;
      } else {
        throw new Error(data.message || '포인트 지급에 실패했습니다');
      }
    } catch (err) {
      console.error('Failed to award points:', err);
      setError(err instanceof Error ? err.message : '포인트 지급 중 오류가 발생했습니다');
      return null;
    }
  };

  // 학습 진행률 업데이트
  const updateProgress = async (
    lessonId: string,
    score: number,
    accuracy: number,
    studyTime: number
  ) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다');
      }

      const response = await fetch('/api/gamification/update-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lesson_id: lessonId,
          score,
          accuracy,
          study_time_minutes: studyTime
        })
      });

      if (!response.ok) {
        throw new Error('진행률 업데이트에 실패했습니다');
      }

      const data = await response.json();
      if (data.success) {
        // 자동으로 포인트 지급 처리
        if (data.data.points_awarded > 0) {
          await awardPoints('lesson_completion', data.data.points_awarded, {
            lesson_id: lessonId,
            score,
            accuracy
          });
        }
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
      setError(err instanceof Error ? err.message : '진행률 업데이트 중 오류가 발생했습니다');
    }
  };

  // 이벤트 제거
  const dismissEvent = (eventId: string) => {
    setPendingEvents(prev => prev.filter(event => event.id !== eventId));
  };

  // 이벤트를 표시됨으로 마크
  const markEventAsShown = (eventId: string) => {
    setPendingEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? { ...event, shown_to_user: true }
          : event
      )
    );
  };

  // 컴포넌트 마운트 시 사용자 프로필 조회
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Context value
  const value: GamificationContextType = {
    userProfile,
    pendingEvents,
    isLoading,
    error,
    fetchUserProfile,
    awardPoints,
    updateProgress,
    dismissEvent,
    markEventAsShown
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

// Hook for using the context
export const useGamification = (): GamificationContextType => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

// 게임화 이벤트 알림 컴포넌트
export const GamificationNotifications: React.FC = () => {
  const { pendingEvents, dismissEvent, markEventAsShown } = useGamification();
  const [visibleEvents, setVisibleEvents] = useState<string[]>([]);

  // 새 이벤트가 추가될 때마다 표시
  useEffect(() => {
    const newEvents = pendingEvents.filter(event => !event.shown_to_user);
    newEvents.forEach(event => {
      if (!visibleEvents.includes(event.id)) {
        setVisibleEvents(prev => [...prev, event.id]);
        markEventAsShown(event.id);

        // 3초 후 자동으로 제거
        setTimeout(() => {
          dismissEvent(event.id);
          setVisibleEvents(prev => prev.filter(id => id !== event.id));
        }, 3000);
      }
    });
  }, [pendingEvents]);

  if (pendingEvents.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {pendingEvents
        .filter(event => visibleEvents.includes(event.id))
        .map(event => (
          <div
            key={event.id}
            className={`
              bg-white border rounded-lg shadow-lg p-4 min-w-80 max-w-96
              transform transition-all duration-300 ease-in-out
              animate-in slide-in-from-right-4
            `}
            style={{ borderLeftColor: event.display_info.color || '#3b82f6', borderLeftWidth: '4px' }}
          >
            <div className="flex items-start gap-3">
              {event.display_info.icon && (
                <div className="text-2xl">{event.display_info.icon}</div>
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{event.display_info.title}</h4>
                <p className="text-sm text-gray-600">{event.display_info.message}</p>
              </div>
              <button
                onClick={() => dismissEvent(event.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        ))
      }
    </div>
  );
};

export default GamificationContext;