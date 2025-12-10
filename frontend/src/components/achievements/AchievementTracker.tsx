'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Trophy,
  Star,
  Crown,
  Medal,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Zap,
  Gift,
  Award,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  Share2,
  Download,
  Filter,
  Search
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
  points_reward: number;
  is_earned: boolean;
  earned_at?: string;
  progress_percentage?: number;
  unlock_hint?: string;
  is_hidden: boolean;
  requirements: {
    type: string;
    threshold: number;
    current_progress?: number;
  };
  celebration_unlocked?: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_progress: number;
  unit: string;
  icon: string;
  color: string;
  estimated_completion?: string;
  is_completed: boolean;
  rewards: {
    points: number;
    badges: string[];
    special_unlocks?: string[];
  };
}

interface RewardNotification {
  id: string;
  type: 'badge_earned' | 'milestone_reached' | 'level_up' | 'special_unlock';
  title: string;
  description: string;
  icon: string;
  animation_type: 'bounce' | 'sparkle' | 'glow';
  auto_dismiss_after?: number;
  points_earned?: number;
}

interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  streak_type: 'daily' | 'weekly';
  last_activity: string;
  next_milestone: {
    target: number;
    reward: string;
  };
}

const AchievementTracker: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [rewardNotifications, setRewardNotifications] = useState<RewardNotification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievementData();
  }, []);

  const fetchAchievementData = async () => {
    setLoading(true);
    try {
      // API 호출 시뮬레이션
      const mockData = {
        achievements: [
          {
            id: 'first_steps',
            title: '첫걸음',
            description: '첫 번째 레슨을 완료했습니다',
            icon: '👶',
            rarity: 'common',
            category: '시작',
            points_reward: 50,
            is_earned: true,
            earned_at: '2024-11-20T10:00:00Z',
            is_hidden: false,
            requirements: { type: 'lessons_completed', threshold: 1, current_progress: 1 }
          },
          {
            id: 'week_warrior',
            title: '일주일 전사',
            description: '7일 연속으로 학습했습니다',
            icon: '⚔️',
            rarity: 'uncommon',
            category: '연속성',
            points_reward: 150,
            is_earned: true,
            earned_at: '2024-11-22T15:30:00Z',
            is_hidden: false,
            requirements: { type: 'streak_days', threshold: 7, current_progress: 7 }
          },
          {
            id: 'vocab_collector',
            title: '어휘 수집가',
            description: '100개의 단어를 학습했습니다',
            icon: '📚',
            rarity: 'rare',
            category: '학습',
            points_reward: 300,
            is_earned: true,
            earned_at: '2024-11-25T09:15:00Z',
            is_hidden: false,
            requirements: { type: 'words_learned', threshold: 100, current_progress: 100 }
          },
          {
            id: 'theological_scholar',
            title: '신학자',
            description: '신학 관련 콘텐츠 50시간 학습',
            icon: '⛪',
            rarity: 'epic',
            category: '신학',
            points_reward: 500,
            is_earned: false,
            progress_percentage: 68,
            is_hidden: false,
            requirements: { type: 'theological_hours', threshold: 50, current_progress: 34 }
          },
          {
            id: 'perfectionist',
            title: '완벽주의자',
            description: '연속 10개 퀴즈에서 100% 정확도',
            icon: '🎯',
            rarity: 'legendary',
            category: '정확도',
            points_reward: 1000,
            is_earned: false,
            progress_percentage: 40,
            is_hidden: false,
            requirements: { type: 'perfect_quizzes', threshold: 10, current_progress: 4 }
          },
          {
            id: 'night_owl',
            title: '올빼미 학습자',
            description: '자정 이후에 학습한 용감한 학습자',
            icon: '🦉',
            rarity: 'rare',
            category: '특별',
            points_reward: 200,
            is_earned: false,
            is_hidden: true,
            unlock_hint: '늦은 밤에도 학습을 게을리하지 않는다면...',
            requirements: { type: 'late_night_study', threshold: 1, current_progress: 0 }
          },
          {
            id: 'streak_master',
            title: '연속의 달인',
            description: '30일 연속 학습의 위업',
            icon: '🔥',
            rarity: 'legendary',
            category: '연속성',
            points_reward: 1500,
            is_earned: false,
            progress_percentage: 40,
            is_hidden: false,
            requirements: { type: 'streak_days', threshold: 30, current_progress: 12 }
          }
        ] as Achievement[],
        milestones: [
          {
            id: 'vocab_milestone',
            title: '어휘 500개 달성',
            description: '헝가리어 어휘 500개를 완전히 마스터하세요',
            target_value: 500,
            current_progress: 380,
            unit: '개',
            icon: '📖',
            color: '#3b82f6',
            estimated_completion: '2024-12-15',
            is_completed: false,
            rewards: {
              points: 1000,
              badges: ['vocab_master'],
              special_unlocks: ['advanced_vocabulary_tools']
            }
          },
          {
            id: 'study_hours_milestone',
            title: '학습 시간 100시간',
            description: '총 학습 시간 100시간을 달성하세요',
            target_value: 100,
            current_progress: 67,
            unit: '시간',
            icon: '⏰',
            color: '#10b981',
            estimated_completion: '2024-12-20',
            is_completed: false,
            rewards: {
              points: 800,
              badges: ['time_master'],
              special_unlocks: ['premium_timer_features']
            }
          },
          {
            id: 'accuracy_milestone',
            title: '평균 정확도 90%',
            description: '모든 활동에서 평균 90% 정확도를 유지하세요',
            target_value: 90,
            current_progress: 87.5,
            unit: '%',
            icon: '🎯',
            color: '#ef4444',
            estimated_completion: '2024-12-01',
            is_completed: false,
            rewards: {
              points: 600,
              badges: ['precision_expert'],
              special_unlocks: ['accuracy_analytics']
            }
          },
          {
            id: 'level_milestone',
            title: 'B2 레벨 달성',
            description: 'CEFR B2 레벨에 도달하세요',
            target_value: 4,
            current_progress: 2,
            unit: '레벨',
            icon: '🏆',
            color: '#f59e0b',
            estimated_completion: '2025-03-01',
            is_completed: false,
            rewards: {
              points: 2000,
              badges: ['b2_achiever', 'language_master'],
              special_unlocks: ['b2_exclusive_content']
            }
          }
        ] as Milestone[],
        streak_info: {
          current_streak: 12,
          longest_streak: 15,
          streak_type: 'daily',
          last_activity: '2024-11-26T14:30:00Z',
          next_milestone: {
            target: 14,
            reward: '2주 연속 학습 배지'
          }
        } as StreakInfo
      };

      setAchievements(mockData.achievements);
      setMilestones(mockData.milestones);
      setStreakInfo(mockData.streak_info);
    } catch (error) {
      console.error('Failed to fetch achievement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = (achievementId: string) => {
    setAchievements(prev =>
      prev.map(achievement => {
        if (achievement.id === achievementId) {
          const newNotification: RewardNotification = {
            id: `reward_${Date.now()}`,
            type: 'badge_earned',
            title: '배지 획득!',
            description: `${achievement.icon} ${achievement.title}`,
            icon: achievement.icon,
            animation_type: 'sparkle',
            auto_dismiss_after: 5000,
            points_earned: achievement.points_reward
          };

          setRewardNotifications(prev => [...prev, newNotification]);

          return { ...achievement, celebration_unlocked: true };
        }
        return achievement;
      })
    );
  };

  const dismissNotification = (notificationId: string) => {
    setRewardNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const shareAchievement = (achievement: Achievement) => {
    const shareText = `헝가리어 학습에서 "${achievement.title}" 배지를 획득했습니다! 🎉`;
    if (navigator.share) {
      navigator.share({
        title: '학습 성취 공유',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('성취 내용이 클립보드에 복사되었습니다!');
    }
  };

  const exportProgress = () => {
    const progressData = {
      achievements: achievements.filter(a => a.is_earned),
      milestones: milestones,
      streak_info: streakInfo,
      export_date: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(progressData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learning_progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-100 text-gray-800 border-gray-300',
      uncommon: 'bg-green-100 text-green-800 border-green-300',
      rare: 'bg-blue-100 text-blue-800 border-blue-300',
      epic: 'bg-purple-100 text-purple-800 border-purple-300',
      legendary: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getFilteredAchievements = () => {
    return achievements.filter(achievement => {
      const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
      const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
      const isVisible = showHidden || !achievement.is_hidden;

      return matchesCategory && matchesSearch && isVisible;
    });
  };

  const categories = ['all', ...Array.from(new Set(achievements.map(a => a.category)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">성취 데이터를 로드하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">성취 추적</h1>
            <p className="text-gray-600">학습 여정의 모든 순간을 기록하고 축하하세요!</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportProgress}>
              <Download className="w-4 h-4 mr-2" />
              진행상황 내보내기
            </Button>
            <Button variant="outline" onClick={() => setShowHidden(!showHidden)}>
              {showHidden ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showHidden ? '숨겨진 배지 숨기기' : '숨겨진 배지 보기'}
            </Button>
          </div>
        </div>
      </div>

      {/* 연속 학습 현황 */}
      {streakInfo && (
        <Card className="mb-6 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Flame className="w-6 h-6" />
              연속 학습 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{streakInfo.current_streak}</div>
                <div className="text-sm text-gray-600">현재 연속일</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{streakInfo.longest_streak}</div>
                <div className="text-sm text-gray-600">최고 기록</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-purple-600">{streakInfo.next_milestone.reward}</div>
                <div className="text-sm text-gray-600">다음 마일스톤: {streakInfo.next_milestone.target}일</div>
                <Progress
                  value={(streakInfo.current_streak / streakInfo.next_milestone.target) * 100}
                  className="mt-2 h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 보상 알림 */}
      {rewardNotifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {rewardNotifications.map(notification => (
            <Alert
              key={notification.id}
              className="border-green-200 bg-green-50 animate-bounce"
            >
              <Trophy className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">{notification.title}</AlertTitle>
              <AlertDescription className="text-green-700 flex items-center justify-between">
                <span>{notification.description}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dismissNotification(notification.id)}
                >
                  ×
                </Button>
              </AlertDescription>
              {notification.points_earned && (
                <div className="text-green-800 font-medium">+{notification.points_earned}P</div>
              )}
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">배지 & 성취</TabsTrigger>
          <TabsTrigger value="milestones">마일스톤</TabsTrigger>
          <TabsTrigger value="statistics">통계</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="mt-6">
          {/* 필터 및 검색 */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="배지 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md w-full"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? '전체 카테고리' : category}
                </option>
              ))}
            </select>
          </div>

          {/* 성취 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredAchievements().map(achievement => (
              <Card
                key={achievement.id}
                className={`hover:shadow-lg transition-all ${
                  achievement.is_earned ? 'border-green-200 bg-green-50' :
                  achievement.is_hidden ? 'border-gray-200 bg-gray-50' : 'border-gray-200'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl relative">
                        {achievement.is_hidden && !achievement.is_earned ? '❓' : achievement.icon}
                        {achievement.is_earned && (
                          <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-600 bg-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {achievement.is_hidden && !achievement.is_earned ? '???' : achievement.title}
                        </CardTitle>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                    {achievement.is_earned && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => shareAchievement(achievement)}
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    {achievement.is_hidden && !achievement.is_earned
                      ? (achievement.unlock_hint || '숨겨진 배지입니다')
                      : achievement.description}
                  </p>

                  {/* 진행도 (획득하지 않은 배지만) */}
                  {!achievement.is_earned && achievement.progress_percentage !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>진행률</span>
                        <span>{achievement.progress_percentage}%</span>
                      </div>
                      <Progress value={achievement.progress_percentage} className="h-2" />
                      <div className="text-xs text-gray-500 mt-1">
                        {achievement.requirements.current_progress}/{achievement.requirements.threshold} {achievement.requirements.type}
                      </div>
                    </div>
                  )}

                  {/* 보상 정보 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium">{achievement.points_reward}P</span>
                    </div>

                    {achievement.is_earned && achievement.earned_at && (
                      <span className="text-xs text-gray-500">
                        {new Date(achievement.earned_at).toLocaleDateString('ko-KR')}
                      </span>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  {achievement.is_earned && !achievement.celebration_unlocked && (
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => claimReward(achievement.id)}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      보상 받기
                    </Button>
                  )}

                  {achievement.is_earned && achievement.celebration_unlocked && (
                    <div className="text-center text-green-600 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      보상 수령 완료
                    </div>
                  )}

                  {!achievement.is_earned && achievement.is_hidden && (
                    <div className="text-center">
                      <Lock className="w-4 h-4 text-gray-400 mx-auto" />
                      <span className="text-xs text-gray-500">조건을 달성하여 해제하세요</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {milestones.map(milestone => (
              <Card key={milestone.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{milestone.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{milestone.title}</CardTitle>
                      <CardDescription>{milestone.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 진행도 */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>진행률</span>
                      <span>
                        {milestone.current_progress}/{milestone.target_value} {milestone.unit}
                      </span>
                    </div>
                    <Progress
                      value={(milestone.current_progress / milestone.target_value) * 100}
                      className="h-3"
                      style={{
                        '--progress-background': milestone.color
                      } as React.CSSProperties}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((milestone.current_progress / milestone.target_value) * 100)}% 완료
                    </div>
                  </div>

                  {/* 완료 예상일 */}
                  {milestone.estimated_completion && !milestone.is_completed && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      예상 완료일: {new Date(milestone.estimated_completion).toLocaleDateString('ko-KR')}
                    </div>
                  )}

                  {/* 보상 */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">완료 보상</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span>{milestone.rewards.points}P</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Medal className="w-4 h-4 text-purple-600" />
                        <span>{milestone.rewards.badges.length}개 배지</span>
                      </div>
                    </div>
                    {milestone.rewards.special_unlocks && (
                      <div className="flex items-center gap-1 mt-1 text-sm">
                        <Zap className="w-4 h-4 text-orange-600" />
                        <span>특별 기능 해제</span>
                      </div>
                    )}
                  </div>

                  {milestone.is_completed && (
                    <div className="text-center text-green-600 font-medium">
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      마일스톤 달성 완료!
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 배지 통계 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  배지 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(['common', 'uncommon', 'rare', 'epic', 'legendary'] as const).map(rarity => {
                    const count = achievements.filter(a => a.rarity === rarity && a.is_earned).length;
                    const total = achievements.filter(a => a.rarity === rarity).length;
                    return (
                      <div key={rarity} className="flex items-center justify-between">
                        <Badge className={getRarityColor(rarity)}>{rarity}</Badge>
                        <span className="text-sm">{count}/{total}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 학습 통계 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  학습 통계
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">총 배지 수</span>
                    <span className="font-medium">{achievements.filter(a => a.is_earned).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">완료 마일스톤</span>
                    <span className="font-medium">{milestones.filter(m => m.is_completed).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">총 획득 포인트</span>
                    <span className="font-medium">
                      {achievements.filter(a => a.is_earned).reduce((sum, a) => sum + a.points_reward, 0)}P
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 다음 목표 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  다음 목표
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements
                    .filter(a => !a.is_earned && a.progress_percentage !== undefined)
                    .sort((a, b) => (b.progress_percentage || 0) - (a.progress_percentage || 0))
                    .slice(0, 3)
                    .map(achievement => (
                      <div key={achievement.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{achievement.title}</span>
                          <span>{achievement.progress_percentage}%</span>
                        </div>
                        <Progress value={achievement.progress_percentage} className="h-1" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AchievementTracker;