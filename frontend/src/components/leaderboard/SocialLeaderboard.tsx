'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Trophy,
  Crown,
  Medal,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Flame,
  Target,
  Calendar,
  Globe,
  UserPlus,
  Settings,
  Filter,
  Zap,
  Award,
  ChevronUp,
  ChevronDown,
  Minus,
  RefreshCw,
  Share2
} from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url?: string;
  rank: number;
  score: number;
  level: number;
  badges_count: number;
  country?: string;
  rank_change: number;
  score_change: number;
  is_current_user?: boolean;
  streak_days?: number;
  achievements?: number;
}

interface LeaderboardData {
  type: 'global' | 'weekly' | 'monthly' | 'friends' | 'level_based';
  period: string;
  last_updated: string;
  user_rank: number;
  total_participants: number;
  entries: LeaderboardEntry[];
}

interface CompetitionEvent {
  id: string;
  title: string;
  description: string;
  type: 'weekly_challenge' | 'monthly_tournament' | 'seasonal_event';
  start_date: string;
  end_date: string;
  participants_count: number;
  max_participants?: number;
  prizes: {
    first: string;
    second: string;
    third: string;
    participation: string;
  };
  is_active: boolean;
  user_participating: boolean;
  user_rank?: number;
}

interface FriendActivity {
  user_id: string;
  username: string;
  avatar_url?: string;
  activity_type: 'achievement_earned' | 'level_up' | 'challenge_completed' | 'streak_milestone';
  activity_description: string;
  timestamp: string;
  points_earned?: number;
}

const SocialLeaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [competitions, setCompetitions] = useState<CompetitionEvent[]>([]);
  const [friendActivities, setFriendActivities] = useState<FriendActivity[]>([]);
  const [selectedTab, setSelectedTab] = useState('global');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedTab]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gamification/leaderboard?type=${selectedTab}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data.data.leaderboard);
      } else {
        // Mock data for demonstration
        setLeaderboardData({
          type: selectedTab as any,
          period: '2024-11-week4',
          last_updated: '2024-11-26T12:00:00Z',
          user_rank: 8,
          total_participants: 1247,
          entries: [
            {
              user_id: '1',
              username: '헝가리마스터',
              rank: 1,
              score: 12500,
              level: 12,
              badges_count: 24,
              country: 'KR',
              rank_change: 2,
              score_change: 850,
              streak_days: 45,
              achievements: 89
            },
            {
              user_id: '2',
              username: '설교준비생',
              rank: 2,
              score: 11800,
              level: 11,
              badges_count: 21,
              country: 'KR',
              rank_change: -1,
              score_change: 650,
              streak_days: 28,
              achievements: 76
            },
            {
              user_id: '3',
              username: '언어사랑',
              rank: 3,
              score: 11200,
              level: 10,
              badges_count: 19,
              country: 'KR',
              rank_change: 1,
              score_change: 720,
              streak_days: 33,
              achievements: 71
            },
            {
              user_id: '4',
              username: '문법왕',
              rank: 4,
              score: 10950,
              level: 9,
              badges_count: 18,
              country: 'KR',
              rank_change: 0,
              score_change: 480,
              streak_days: 21,
              achievements: 68
            },
            {
              user_id: '5',
              username: '어휘수집가',
              rank: 5,
              score: 10600,
              level: 9,
              badges_count: 17,
              country: 'KR',
              rank_change: 3,
              score_change: 690,
              streak_days: 15,
              achievements: 65
            },
            {
              user_id: 'current',
              username: '김학습',
              rank: 8,
              score: 9800,
              level: 6,
              badges_count: 13,
              country: 'KR',
              rank_change: 2,
              score_change: 420,
              is_current_user: true,
              streak_days: 12,
              achievements: 45
            }
          ]
        });
      }

      // Mock competitions data
      setCompetitions([
        {
          id: 'weekly_sprint',
          title: '주간 학습 스프린트',
          description: '이번 주 가장 많은 포인트를 획득한 상위 10명에게 특별 보상!',
          type: 'weekly_challenge',
          start_date: '2024-11-25T00:00:00Z',
          end_date: '2024-12-01T23:59:59Z',
          participants_count: 234,
          max_participants: 500,
          prizes: {
            first: '1000P + 특별 배지',
            second: '500P + 프리미엄 테마',
            third: '300P + 고급 배지',
            participation: '50P + 참가 배지'
          },
          is_active: true,
          user_participating: true,
          user_rank: 15
        },
        {
          id: 'theology_tournament',
          title: '신학 어휘 토너먼트',
          description: '신학 관련 어휘와 표현에 집중한 특별 대회',
          type: 'monthly_tournament',
          start_date: '2024-12-01T00:00:00Z',
          end_date: '2024-12-31T23:59:59Z',
          participants_count: 89,
          max_participants: 200,
          prizes: {
            first: '2000P + 신학 마스터 타이틀',
            second: '1000P + 고급 신학 컨텐츠 해제',
            third: '500P + 신학 전문가 배지',
            participation: '100P + 신학도 배지'
          },
          is_active: false,
          user_participating: false
        }
      ]);

      // Mock friend activities
      setFriendActivities([
        {
          user_id: 'friend1',
          username: '설교준비생',
          activity_type: 'achievement_earned',
          activity_description: '신학 전문가 배지를 획득했습니다',
          timestamp: '2024-11-26T14:30:00Z',
          points_earned: 500
        },
        {
          user_id: 'friend2',
          username: '언어사랑',
          activity_type: 'level_up',
          activity_description: '레벨 10에 도달했습니다!',
          timestamp: '2024-11-26T12:15:00Z',
          points_earned: 300
        },
        {
          user_id: 'friend3',
          username: '문법왕',
          activity_type: 'streak_milestone',
          activity_description: '21일 연속 학습을 달성했습니다',
          timestamp: '2024-11-26T09:45:00Z',
          points_earned: 210
        }
      ]);

    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshLeaderboard = async () => {
    setRefreshing(true);
    await fetchLeaderboardData();
    setRefreshing(false);
  };

  const joinCompetition = async (competitionId: string) => {
    try {
      const response = await fetch('/api/gamification/join-competition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ competition_id: competitionId })
      });

      if (response.ok) {
        // Update competition state
        setCompetitions(prev =>
          prev.map(comp =>
            comp.id === competitionId
              ? { ...comp, user_participating: true, participants_count: comp.participants_count + 1 }
              : comp
          )
        );
      }
    } catch (error) {
      console.error('Failed to join competition:', error);
    }
  };

  const shareLeaderboard = () => {
    const shareText = `헝가리어 학습 리더보드에서 ${leaderboardData?.user_rank}위를 기록했습니다! 🏆`;
    if (navigator.share) {
      navigator.share({
        title: '리더보드 순위 공유',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('순위가 클립보드에 복사되었습니다!');
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{rank}</span>;
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <ChevronUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <ChevronDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">리더보드를 로드하고 있습니다...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">리더보드 & 경쟁</h1>
            <p className="text-gray-600">다른 학습자들과 함께 성장하고 경쟁해보세요!</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshLeaderboard} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
            <Button variant="outline" onClick={shareLeaderboard}>
              <Share2 className="w-4 h-4 mr-2" />
              공유하기
            </Button>
          </div>
        </div>
      </div>

      {/* 현재 사용자 순위 하이라이트 */}
      {leaderboardData && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Trophy className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">당신의 현재 순위</AlertTitle>
          <AlertDescription className="text-blue-700">
            {leaderboardData.total_participants}명 중 <strong>{leaderboardData.user_rank}위</strong>
            {leaderboardData.entries.find(e => e.is_current_user)?.rank_change && (
              <span className="ml-2">
                (지난 주 대비 {leaderboardData.entries.find(e => e.is_current_user)?.rank_change}단계 상승)
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global">전체 랭킹</TabsTrigger>
          <TabsTrigger value="weekly">주간</TabsTrigger>
          <TabsTrigger value="monthly">월간</TabsTrigger>
          <TabsTrigger value="friends">친구</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 메인 리더보드 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    전체 리더보드
                  </CardTitle>
                  <CardDescription>
                    전체 {leaderboardData?.total_participants}명의 학습자 순위
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {leaderboardData?.entries.map((entry, index) => (
                      <div
                        key={entry.user_id}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                          entry.is_current_user
                            ? 'bg-blue-100 border-blue-300 border-2'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {/* 순위 */}
                        <div className="flex items-center gap-2">
                          {getRankIcon(entry.rank)}
                          {getRankChangeIcon(entry.rank_change)}
                        </div>

                        {/* 사용자 정보 */}
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={entry.avatar_url} />
                          <AvatarFallback>{entry.username.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{entry.username}</span>
                            {entry.is_current_user && (
                              <Badge variant="default" className="text-xs">나</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              Lv.{entry.level}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              {entry.score.toLocaleString()}P
                            </span>
                            <span className="flex items-center gap-1">
                              <Medal className="w-3 h-3" />
                              {entry.badges_count}개
                            </span>
                            {entry.streak_days && (
                              <span className="flex items-center gap-1">
                                <Flame className="w-3 h-3" />
                                {entry.streak_days}일
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 점수 변화 */}
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {entry.score.toLocaleString()}P
                          </div>
                          {entry.score_change !== 0 && (
                            <div className={`text-xs ${
                              entry.score_change > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {entry.score_change > 0 ? '+' : ''}{entry.score_change}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 사이드바: 경쟁 이벤트 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    진행 중인 경쟁
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {competitions.filter(c => c.is_active).map(competition => (
                      <div key={competition.id} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{competition.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{competition.description}</p>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>참가자</span>
                            <span>{competition.participants_count}/{competition.max_participants}</span>
                          </div>
                          {competition.user_participating && competition.user_rank && (
                            <div className="flex justify-between">
                              <span>나의 순위</span>
                              <span className="font-medium">{competition.user_rank}위</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          {competition.user_participating ? (
                            <Badge className="w-full justify-center">참여 중</Badge>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => joinCompetition(competition.id)}
                            >
                              참가하기
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 친구 활동 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    친구 활동
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {friendActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.avatar_url} />
                          <AvatarFallback>{activity.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.username}</span>님이 {activity.activity_description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{formatTimeAgo(activity.timestamp)}</span>
                            {activity.points_earned && (
                              <>
                                <span>•</span>
                                <span className="text-green-600">+{activity.points_earned}P</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                이번 주 랭킹
              </CardTitle>
              <CardDescription>
                이번 주(11월 4주차) 학습 성과 순위
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600">주간 리더보드 기능을 준비 중입니다.</p>
                <Button variant="outline" className="mt-4">
                  곧 출시됩니다!
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                이달의 챔피언
              </CardTitle>
              <CardDescription>
                11월 한 달간의 학습 성과 순위
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600">월간 리더보드 기능을 준비 중입니다.</p>
                <Button variant="outline" className="mt-4">
                  곧 출시됩니다!
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                친구 랭킹
              </CardTitle>
              <CardDescription>
                친구들과의 학습 경쟁
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">아직 친구가 없습니다.</p>
                <Button>
                  친구 추가하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialLeaderboard;