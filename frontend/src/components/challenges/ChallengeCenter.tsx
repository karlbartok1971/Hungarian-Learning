'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Target,
  Clock,
  Trophy,
  Star,
  Zap,
  Calendar,
  Users,
  BookOpen,
  Crown,
  Gift,
  Timer,
  CheckCircle,
  AlertCircle,
  Flame,
  Medal,
  TrendingUp,
  Play,
  Lock
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  time_remaining_hours: number;
  objectives: {
    id: string;
    description: string;
    current_progress: number;
    target_value: number;
    is_completed: boolean;
  }[];
  rewards: {
    points: number;
    badges?: string[];
    special_items?: string[];
  };
  progress_percentage: number;
  is_participating: boolean;
  requirements?: {
    min_level?: number;
    required_badges?: string[];
    average_accuracy?: number;
  };
  participants_count?: number;
  max_participants?: number;
  category: string;
  icon: string;
  color: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  story: string;
  chapter: number;
  total_chapters: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number;
  prerequisites: string[];
  rewards: {
    points: number;
    badges: string[];
    unlocks: string[];
    story_progression: boolean;
  };
  progress: {
    completed_steps: number;
    total_steps: number;
    current_step: {
      title: string;
      description: string;
      type: 'lesson' | 'quiz' | 'game' | 'practice';
      target: any;
    };
  };
  is_unlocked: boolean;
  is_completed: boolean;
  theme: 'daily_life' | 'theology' | 'grammar' | 'culture' | 'advanced';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'challenge_completed' | 'quest_completed' | 'streak_achieved' | 'score_milestone';
  timestamp: string;
  points_earned: number;
  celebration_type: 'badge' | 'level_up' | 'streak' | 'challenge';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const ChallengeCenter: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [selectedTab, setSelectedTab] = useState('challenges');
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showCelebration, setShowCelebration] = useState<Achievement | null>(null);

  useEffect(() => {
    fetchChallengesData();
  }, []);

  const fetchChallengesData = async () => {
    setLoading(true);
    try {
      // API 호출 시뮬레이션
      const mockData = {
        challenges: [
          {
            id: 'daily_vocabulary',
            title: '오늘의 어휘 마스터',
            description: '하루에 10개의 새로운 단어를 학습하세요',
            type: 'daily',
            difficulty: 'easy',
            time_remaining_hours: 18,
            objectives: [
              {
                id: 'learn_words',
                description: '새 단어 10개 학습',
                current_progress: 7,
                target_value: 10,
                is_completed: false
              }
            ],
            rewards: { points: 100, badges: ['daily_achiever'] },
            progress_percentage: 70,
            is_participating: true,
            category: 'vocabulary',
            icon: '📚',
            color: '#3b82f6'
          },
          {
            id: 'weekly_theological',
            title: '신학 어휘 집중 주간',
            description: '일주일 동안 신학 관련 콘텐츠에 집중하세요',
            type: 'weekly',
            difficulty: 'medium',
            time_remaining_hours: 96,
            objectives: [
              {
                id: 'theological_lessons',
                description: '신학 레슨 5개 완료',
                current_progress: 2,
                target_value: 5,
                is_completed: false
              },
              {
                id: 'theological_vocabulary',
                description: '신학 어휘 30개 학습',
                current_progress: 18,
                target_value: 30,
                is_completed: false
              }
            ],
            rewards: { points: 500, badges: ['theological_focus_master'] },
            progress_percentage: 45,
            is_participating: true,
            category: 'theology',
            icon: '⛪',
            color: '#8b5cf6'
          },
          {
            id: 'grammar_perfectionist',
            title: '문법 완벽주의자',
            description: '연속 5개 문법 퀴즈에서 95% 이상 정확도 달성',
            type: 'special',
            difficulty: 'hard',
            time_remaining_hours: 72,
            objectives: [
              {
                id: 'perfect_grammar',
                description: '95% 이상 정확도로 문법 퀴즈 5개 완료',
                current_progress: 2,
                target_value: 5,
                is_completed: false
              }
            ],
            rewards: { points: 300, badges: ['grammar_perfectionist'] },
            progress_percentage: 40,
            is_participating: false,
            requirements: { min_level: 4, average_accuracy: 80 },
            category: 'grammar',
            icon: '🎯',
            color: '#ef4444'
          },
          {
            id: 'monthly_marathon',
            title: '헝가리어 마라톤',
            description: '이번 달 총 30시간 학습 목표 달성',
            type: 'monthly',
            difficulty: 'expert',
            time_remaining_hours: 480,
            objectives: [
              {
                id: 'study_hours',
                description: '총 30시간 학습',
                current_progress: 18,
                target_value: 30,
                is_completed: false
              },
              {
                id: 'consistency',
                description: '20일 이상 학습',
                current_progress: 12,
                target_value: 20,
                is_completed: false
              }
            ],
            rewards: { points: 1000, badges: ['marathon_runner', 'dedication_master'], special_items: ['premium_theme'] },
            progress_percentage: 60,
            is_participating: true,
            participants_count: 156,
            max_participants: 500,
            category: 'dedication',
            icon: '🏃‍♂️',
            color: '#f59e0b'
          }
        ] as Challenge[],
        quests: [
          {
            id: 'hungarian_journey',
            title: '헝가리어 여행의 시작',
            description: '헝가리어의 기초부터 차근차근 배워보는 첫 번째 여행',
            story: '당신은 헝가리에 처음 도착한 한국인 유학생입니다. 일상생활을 위해 기본적인 헝가리어를 배워야 합니다.',
            chapter: 1,
            total_chapters: 5,
            difficulty: 'beginner',
            estimated_hours: 8,
            prerequisites: [],
            rewards: {
              points: 500,
              badges: ['journey_starter'],
              unlocks: ['intermediate_quests'],
              story_progression: true
            },
            progress: {
              completed_steps: 3,
              total_steps: 10,
              current_step: {
                title: '기본 인사 배우기',
                description: '일상적인 인사 표현들을 익혀보세요',
                type: 'lesson',
                target: { lesson_id: 'greetings_basic' }
              }
            },
            is_unlocked: true,
            is_completed: false,
            theme: 'daily_life'
          },
          {
            id: 'sermon_preparation',
            title: '설교자의 길',
            description: '헝가리어로 설교문을 작성하기 위한 특별한 여정',
            story: '당신은 헝가리 현지 교회에서 설교를 준비하게 되었습니다. 정확하고 감동적인 설교문을 작성하기 위한 여정을 시작하세요.',
            chapter: 1,
            total_chapters: 8,
            difficulty: 'advanced',
            estimated_hours: 20,
            prerequisites: ['hungarian_journey'],
            rewards: {
              points: 2000,
              badges: ['sermon_master', 'theological_expert'],
              unlocks: ['advanced_theology_content'],
              story_progression: true
            },
            progress: {
              completed_steps: 0,
              total_steps: 25,
              current_step: {
                title: '신학 기본 용어 학습',
                description: '설교에 필요한 기본 신학 용어들을 배워보세요',
                type: 'lesson',
                target: { lesson_id: 'theology_basics' }
              }
            },
            is_unlocked: false,
            is_completed: false,
            theme: 'theology'
          },
          {
            id: 'grammar_master',
            title: '문법의 달인',
            description: '헝가리어 문법을 완전히 정복하는 도전적인 퀘스트',
            story: '헝가리어의 복잡한 격변화와 동사 활용을 마스터하여 진정한 문법의 달인이 되어보세요.',
            chapter: 2,
            total_chapters: 6,
            difficulty: 'intermediate',
            estimated_hours: 15,
            prerequisites: ['hungarian_journey'],
            rewards: {
              points: 1500,
              badges: ['grammar_master', 'syntax_expert'],
              unlocks: ['advanced_writing_tools'],
              story_progression: false
            },
            progress: {
              completed_steps: 5,
              total_steps: 18,
              current_step: {
                title: '복잡한 격변화 연습',
                description: '여러 격변화를 동시에 사용하는 문장을 만들어보세요',
                type: 'practice',
                target: { practice_id: 'complex_cases' }
              }
            },
            is_unlocked: true,
            is_completed: false,
            theme: 'grammar'
          }
        ] as Quest[],
        achievements: [
          {
            id: 'recent_1',
            title: '문법 퀴즈 연속 성공',
            description: '문법 퀴즈 3개를 연속으로 완벽하게 맞혔습니다!',
            type: 'challenge_completed',
            timestamp: '2024-11-26T14:30:00Z',
            points_earned: 150,
            celebration_type: 'challenge',
            icon: '🎯',
            rarity: 'rare'
          },
          {
            id: 'recent_2',
            title: '일주일 연속 학습',
            description: '7일 연속으로 학습을 완료했습니다!',
            type: 'streak_achieved',
            timestamp: '2024-11-26T09:00:00Z',
            points_earned: 200,
            celebration_type: 'streak',
            icon: '🔥',
            rarity: 'epic'
          }
        ] as Achievement[]
      };

      setChallenges(mockData.challenges);
      setQuests(mockData.quests);
      setRecentAchievements(mockData.achievements);
    } catch (error) {
      console.error('Failed to fetch challenges data:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch('/api/gamification/join-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ challenge_id: challengeId })
      });

      if (response.ok) {
        // 챌린지 참여 상태 업데이트
        setChallenges(prev =>
          prev.map(challenge =>
            challenge.id === challengeId
              ? { ...challenge, is_participating: true }
              : challenge
          )
        );
      }
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  const startQuest = (questId: string) => {
    // 퀘스트 시작 로직
    console.log('Starting quest:', questId);
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
      expert: 'bg-purple-100 text-purple-800',
      beginner: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-orange-100 text-orange-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      daily: <Calendar className="w-4 h-4" />,
      weekly: <Timer className="w-4 h-4" />,
      monthly: <Crown className="w-4 h-4" />,
      special: <Star className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <Target className="w-4 h-4" />;
  };

  const formatTimeRemaining = (hours: number) => {
    if (hours < 24) {
      return `${hours}시간 남음`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}일 ${remainingHours}시간 남음`;
  };

  const renderChallengeCard = (challenge: Challenge) => (
    <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{challenge.icon}</div>
            <div>
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              <CardDescription>{challenge.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(challenge.difficulty)}>
              {challenge.difficulty}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {getTypeIcon(challenge.type)}
              {challenge.type}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 진행 상황 */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>진행률</span>
            <span>{challenge.progress_percentage}%</span>
          </div>
          <Progress value={challenge.progress_percentage} className="h-2" />
        </div>

        {/* 목표 리스트 */}
        <div>
          <h4 className="font-medium text-sm mb-2">목표</h4>
          <div className="space-y-2">
            {challenge.objectives.map((objective) => (
              <div key={objective.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {objective.is_completed ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border border-gray-300 rounded-full" />
                  )}
                  <span className={objective.is_completed ? 'line-through text-gray-500' : ''}>
                    {objective.description}
                  </span>
                </div>
                <span className="text-gray-600">
                  {objective.current_progress}/{objective.target_value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 보상 */}
        <div>
          <h4 className="font-medium text-sm mb-2">보상</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-sm">{challenge.rewards.points}P</span>
            </div>
            {challenge.rewards.badges && (
              <div className="flex items-center gap-1">
                <Medal className="w-4 h-4 text-purple-600" />
                <span className="text-sm">{challenge.rewards.badges.length}개 배지</span>
              </div>
            )}
            {challenge.rewards.special_items && (
              <div className="flex items-center gap-1">
                <Gift className="w-4 h-4 text-pink-600" />
                <span className="text-sm">특별 아이템</span>
              </div>
            )}
          </div>
        </div>

        {/* 시간 및 참가자 */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatTimeRemaining(challenge.time_remaining_hours)}
          </span>
          {challenge.participants_count && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {challenge.participants_count}명 참여
            </span>
          )}
        </div>

        {/* 참여 요구사항 */}
        {challenge.requirements && !challenge.is_participating && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>참여 조건</AlertTitle>
            <AlertDescription>
              {challenge.requirements.min_level && `최소 레벨 ${challenge.requirements.min_level}`}
              {challenge.requirements.average_accuracy &&
                `, 평균 정확도 ${challenge.requirements.average_accuracy}% 이상`}
            </AlertDescription>
          </Alert>
        )}

        {/* 액션 버튼 */}
        <div className="pt-2">
          {challenge.is_participating ? (
            <Button variant="outline" className="w-full" disabled>
              <CheckCircle className="w-4 h-4 mr-2" />
              참여 중
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() => joinChallenge(challenge.id)}
            >
              <Play className="w-4 h-4 mr-2" />
              도전하기
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderQuestCard = (quest: Quest) => (
    <Card key={quest.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {quest.is_unlocked ? (
                <BookOpen className="w-5 h-5 text-blue-600" />
              ) : (
                <Lock className="w-5 h-5 text-gray-400" />
              )}
              {quest.title}
            </CardTitle>
            <CardDescription>{quest.description}</CardDescription>
          </div>
          <Badge className={getDifficultyColor(quest.difficulty)}>
            {quest.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 스토리 */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800 italic">{quest.story}</p>
        </div>

        {/* 진행 상황 */}
        {quest.is_unlocked && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>진행률</span>
              <span>{Math.round((quest.progress.completed_steps / quest.progress.total_steps) * 100)}%</span>
            </div>
            <Progress
              value={(quest.progress.completed_steps / quest.progress.total_steps) * 100}
              className="h-2"
            />
            <div className="text-xs text-gray-600 mt-1">
              {quest.progress.completed_steps}/{quest.progress.total_steps} 단계 완료
            </div>
          </div>
        )}

        {/* 현재 단계 */}
        {quest.is_unlocked && !quest.is_completed && (
          <div>
            <h4 className="font-medium text-sm mb-2">현재 단계</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-sm">{quest.progress.current_step.title}</p>
              <p className="text-xs text-gray-600 mt-1">{quest.progress.current_step.description}</p>
            </div>
          </div>
        )}

        {/* 퀘스트 정보 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">챕터</span>
            <p className="font-medium">{quest.chapter}/{quest.total_chapters}</p>
          </div>
          <div>
            <span className="text-gray-600">예상 시간</span>
            <p className="font-medium">{quest.estimated_hours}시간</p>
          </div>
        </div>

        {/* 보상 */}
        <div>
          <h4 className="font-medium text-sm mb-2">완료 보상</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-sm">{quest.rewards.points}P</span>
            </div>
            <div className="flex items-center gap-1">
              <Medal className="w-4 h-4 text-purple-600" />
              <span className="text-sm">{quest.rewards.badges.length}개 배지</span>
            </div>
            {quest.rewards.unlocks.length > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-orange-600" />
                <span className="text-sm">새 콘텐츠 해제</span>
              </div>
            )}
          </div>
        </div>

        {/* 선수 조건 */}
        {quest.prerequisites.length > 0 && !quest.is_unlocked && (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>잠겨있음</AlertTitle>
            <AlertDescription>
              다음 퀘스트를 먼저 완료해주세요: {quest.prerequisites.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* 액션 버튼 */}
        <div className="pt-2">
          {quest.is_completed ? (
            <Button variant="outline" className="w-full" disabled>
              <CheckCircle className="w-4 h-4 mr-2" />
              완료됨
            </Button>
          ) : quest.is_unlocked ? (
            <Button
              className="w-full"
              onClick={() => startQuest(quest.id)}
            >
              <Play className="w-4 h-4 mr-2" />
              {quest.progress.completed_steps > 0 ? '계속하기' : '시작하기'}
            </Button>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              <Lock className="w-4 h-4 mr-2" />
              잠겨있음
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">도전과제를 로드하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">도전과제 & 퀘스트</h1>
        <p className="text-gray-600">다양한 도전과제와 퀘스트를 통해 학습 동기를 높이고 성취감을 느껴보세요!</p>
      </div>

      {/* 최근 성취 알림 */}
      {recentAchievements.length > 0 && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Trophy className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">최근 성취!</AlertTitle>
          <AlertDescription className="text-green-700">
            {recentAchievements[0].title} - {recentAchievements[0].points_earned}P 획득!
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="challenges">도전과제</TabsTrigger>
          <TabsTrigger value="quests">퀘스트</TabsTrigger>
          <TabsTrigger value="achievements">성취 기록</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {challenges.map(challenge => renderChallengeCard(challenge))}
          </div>
        </TabsContent>

        <TabsContent value="quests" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {quests.map(quest => renderQuestCard(quest))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">최근 성취</h2>
            {recentAchievements.map(achievement => (
              <Card key={achievement.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-medium">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-500">{achievement.timestamp}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getDifficultyColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                      <p className="text-sm font-medium mt-1">+{achievement.points_earned}P</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChallengeCenter;