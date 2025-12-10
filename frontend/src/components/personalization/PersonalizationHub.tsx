'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  User,
  Settings,
  Target,
  BookOpen,
  TrendingUp,
  Zap,
  Star,
  Brain,
  Award,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Calendar,
  Activity
} from 'lucide-react';

interface UserProfile {
  name: string;
  current_level: string;
  level_progress: number;
  learning_streak: number;
  total_study_hours: number;
  preferred_study_time: string;
  learning_style: {
    primary: string;
    secondary: string;
  };
}

interface QuickActions {
  continue_lesson?: {
    title: string;
    progress: number;
    estimated_time: number;
  };
  daily_challenge?: {
    title: string;
    difficulty: string;
    points: number;
  };
  recommended_content?: {
    title: string;
    type: string;
    relevance_score: number;
  };
}

interface RecentAchievements {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  points: number;
}

interface PersonalizedWidget {
  id: string;
  title: string;
  type: 'progress' | 'recommendation' | 'achievement' | 'schedule' | 'analytics';
  content: any;
  priority: number;
  is_visible: boolean;
}

interface PersonalizationData {
  user_profile: UserProfile;
  quick_actions: QuickActions;
  recent_achievements: RecentAchievements[];
  personalized_widgets: PersonalizedWidget[];
  daily_goals: {
    study_minutes: { target: number; current: number };
    vocabulary_words: { target: number; current: number };
    accuracy_rate: { target: number; current: number };
  };
  smart_notifications: {
    study_reminder: string;
    goal_encouragement?: string;
    achievement_celebration?: string;
    learning_tip?: string;
  };
}

const PersonalizationHub: React.FC = () => {
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('dashboard');

  useEffect(() => {
    fetchPersonalizationData();
  }, []);

  const fetchPersonalizationData = async () => {
    setLoading(true);
    try {
      // 시뮬레이션된 개인화 데이터
      const mockData: PersonalizationData = {
        user_profile: {
          name: "김학습",
          current_level: "A2",
          level_progress: 68,
          learning_streak: 12,
          total_study_hours: 127,
          preferred_study_time: "오후 2시-4시",
          learning_style: {
            primary: "시각적 학습",
            secondary: "체험적 학습"
          }
        },
        quick_actions: {
          continue_lesson: {
            title: "헝가리어 격변화 - 주격과 대격",
            progress: 65,
            estimated_time: 20
          },
          daily_challenge: {
            title: "오늘의 신학 어휘 챌린지",
            difficulty: "중급",
            points: 100
          },
          recommended_content: {
            title: "설교문 작성을 위한 연결어",
            type: "문법",
            relevance_score: 95
          }
        },
        recent_achievements: [
          {
            id: "1",
            title: "꾸준한 학습자",
            description: "12일 연속 학습 달성",
            date: "2024-11-26",
            icon: "🏆",
            points: 100
          },
          {
            id: "2",
            title: "어휘 마스터",
            description: "450개 단어 학습 완료",
            date: "2024-11-25",
            icon: "📚",
            points: 200
          },
          {
            id: "3",
            title: "신학 전문가",
            description: "신학 어휘 50개 습득",
            date: "2024-11-24",
            icon: "⛪",
            points: 150
          }
        ],
        personalized_widgets: [
          {
            id: "progress_tracker",
            title: "학습 진도 추적",
            type: "progress",
            content: {
              current_milestone: "A2 중급 달성",
              next_milestone: "B1 준비",
              completion_percentage: 68,
              estimated_completion: "2024-12-28"
            },
            priority: 1,
            is_visible: true
          },
          {
            id: "smart_recommendations",
            title: "AI 추천 콘텐츠",
            type: "recommendation",
            content: {
              primary_recommendation: {
                title: "신학 기본 어휘",
                reason: "설교 목표와 높은 일치도",
                confidence: 95
              },
              alternative_recommendations: [
                "격변화 연습 문제",
                "발음 교정 세션"
              ]
            },
            priority: 2,
            is_visible: true
          },
          {
            id: "achievement_showcase",
            title: "최근 성과",
            type: "achievement",
            content: {
              latest_achievements: 3,
              total_points: 2450,
              rank: "상위 15%",
              next_badge: "B1 도전자"
            },
            priority: 3,
            is_visible: true
          }
        ],
        daily_goals: {
          study_minutes: { target: 60, current: 45 },
          vocabulary_words: { target: 10, current: 7 },
          accuracy_rate: { target: 85, current: 82 }
        },
        smart_notifications: {
          study_reminder: "오후 2시는 당신의 최적 학습 시간입니다! 20분 학습으로 오늘의 목표를 달성해보세요.",
          goal_encouragement: "오늘 목표의 75%를 달성했습니다! 조금만 더 화이팅!",
          learning_tip: "💡 한국어와 헝가리어의 어순 차이를 의식하며 연습하면 더 빠른 향상이 가능해요."
        }
      };

      setPersonalizationData(mockData);
    } catch (error) {
      console.error('개인화 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUserProfileCard = () => (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {personalizationData?.user_profile.name.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-lg">{personalizationData?.user_profile.name}님</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">
                  {personalizationData?.user_profile.current_level}
                </Badge>
                <span>• {personalizationData?.user_profile.total_study_hours}시간 학습</span>
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-orange-600 font-medium">
              <Zap className="w-4 h-4" />
              {personalizationData?.user_profile.learning_streak}일 연속
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">현재 레벨 진도</span>
              <span className="text-sm text-gray-600">
                {personalizationData?.user_profile.level_progress}%
              </span>
            </div>
            <Progress value={personalizationData?.user_profile.level_progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">학습 스타일</span>
              <p className="font-medium">{personalizationData?.user_profile.learning_style.primary}</p>
            </div>
            <div>
              <span className="text-gray-600">최적 시간</span>
              <p className="font-medium">{personalizationData?.user_profile.preferred_study_time}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderQuickActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 이어서 학습하기 */}
      {personalizationData?.quick_actions.continue_lesson && (
        <Card className="border-green-200 hover:border-green-300 transition-colors cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <BookOpen className="w-5 h-5" />
              이어서 학습하기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h4 className="font-medium mb-2">{personalizationData.quick_actions.continue_lesson.title}</h4>
            <Progress value={personalizationData.quick_actions.continue_lesson.progress} className="mb-3 h-2" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">
                <Clock className="w-3 h-3 inline mr-1" />
                {personalizationData.quick_actions.continue_lesson.estimated_time}분
              </span>
              <Button size="sm">
                계속하기 <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 오늘의 도전 */}
      {personalizationData?.quick_actions.daily_challenge && (
        <Card className="border-yellow-200 hover:border-yellow-300 transition-colors cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Target className="w-5 h-5" />
              오늘의 도전
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h4 className="font-medium mb-2">{personalizationData.quick_actions.daily_challenge.title}</h4>
            <div className="flex justify-between items-center mb-3">
              <Badge variant="outline">{personalizationData.quick_actions.daily_challenge.difficulty}</Badge>
              <span className="text-sm font-medium text-yellow-600">
                +{personalizationData.quick_actions.daily_challenge.points}P
              </span>
            </div>
            <Button size="sm" className="w-full">
              도전하기 <Star className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI 추천 */}
      {personalizationData?.quick_actions.recommended_content && (
        <Card className="border-purple-200 hover:border-purple-300 transition-colors cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Brain className="w-5 h-5" />
              AI 추천
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h4 className="font-medium mb-2">{personalizationData.quick_actions.recommended_content.title}</h4>
            <div className="flex justify-between items-center mb-3">
              <Badge variant="secondary">{personalizationData.quick_actions.recommended_content.type}</Badge>
              <span className="text-xs text-purple-600">
                관련도: {personalizationData.quick_actions.recommended_content.relevance_score}%
              </span>
            </div>
            <Button size="sm" className="w-full">
              시작하기 <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderDailyGoals = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          오늘의 목표
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(personalizationData?.daily_goals || {}).map(([key, goal]) => {
          const progressPercentage = Math.min((goal.current / goal.target) * 100, 100);
          const isCompleted = goal.current >= goal.target;

          const goalNames = {
            study_minutes: '학습 시간',
            vocabulary_words: '새 단어',
            accuracy_rate: '정확도'
          };

          const goalUnits = {
            study_minutes: '분',
            vocabulary_words: '개',
            accuracy_rate: '%'
          };

          return (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border border-gray-300 rounded-full" />
                  )}
                  {goalNames[key as keyof typeof goalNames]}
                </span>
                <span className="text-sm text-gray-600">
                  {goal.current}/{goal.target}{goalUnits[key as keyof typeof goalUnits]}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );

  const renderRecentAchievements = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          최근 성과
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {personalizationData?.recent_achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl">{achievement.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium">{achievement.title}</h4>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                <p className="text-xs text-gray-500">{achievement.date}</p>
              </div>
              <Badge variant="secondary">+{achievement.points}P</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderSmartNotifications = () => (
    <div className="space-y-4">
      {personalizationData?.smart_notifications.study_reminder && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>학습 리마인더</AlertTitle>
          <AlertDescription>
            {personalizationData.smart_notifications.study_reminder}
          </AlertDescription>
        </Alert>
      )}

      {personalizationData?.smart_notifications.goal_encouragement && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertTitle>목표 달성 격려</AlertTitle>
          <AlertDescription>
            {personalizationData.smart_notifications.goal_encouragement}
          </AlertDescription>
        </Alert>
      )}

      {personalizationData?.smart_notifications.learning_tip && (
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertTitle>학습 팁</AlertTitle>
          <AlertDescription>
            {personalizationData.smart_notifications.learning_tip}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderPersonalizedWidgets = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {personalizationData?.personalized_widgets
        .filter(widget => widget.is_visible)
        .sort((a, b) => a.priority - b.priority)
        .map((widget) => (
          <Card key={widget.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {widget.type === 'progress' && <Activity className="w-5 h-5" />}
                {widget.type === 'recommendation' && <Brain className="w-5 h-5" />}
                {widget.type === 'achievement' && <Award className="w-5 h-5" />}
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {widget.type === 'progress' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>현재 마일스톤</span>
                    <span className="font-medium">{widget.content.current_milestone}</span>
                  </div>
                  <Progress value={widget.content.completion_percentage} />
                  <div className="text-sm text-gray-600">
                    다음: {widget.content.next_milestone} (예상: {widget.content.estimated_completion})
                  </div>
                </div>
              )}

              {widget.type === 'recommendation' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">
                      {widget.content.primary_recommendation.title}
                    </h4>
                    <p className="text-sm text-blue-600">
                      {widget.content.primary_recommendation.reason}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      신뢰도: {widget.content.primary_recommendation.confidence}%
                    </Badge>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">대안 추천</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {widget.content.alternative_recommendations.map((rec: string, index: number) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {widget.type === 'achievement' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {widget.content.latest_achievements}
                      </div>
                      <div className="text-sm text-gray-600">최근 성과</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {widget.content.total_points}
                      </div>
                      <div className="text-sm text-gray-600">총 포인트</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-purple-100 text-purple-800">
                      {widget.content.rank} 랭킹
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      다음 배지: {widget.content.next_badge}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">개인화 대시보드를 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">개인화된 학습 허브</h1>
        <p className="text-gray-600">당신만을 위한 맞춤형 헝가리어 학습 환경입니다.</p>
      </div>

      {/* 사용자 프로필 카드 */}
      <div className="mb-8">
        {renderUserProfileCard()}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">대시보드</TabsTrigger>
          <TabsTrigger value="goals">목표 관리</TabsTrigger>
          <TabsTrigger value="achievements">성과</TabsTrigger>
          <TabsTrigger value="notifications">알림</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <div className="space-y-8">
            {/* 빠른 실행 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">빠른 실행</h2>
              {renderQuickActions()}
            </div>

            {/* 개인화된 위젯들 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">맞춤 정보</h2>
              {renderPersonalizedWidgets()}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderDailyGoals()}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  주간 목표 설정
                </CardTitle>
                <CardDescription>
                  다음 주의 학습 목표를 설정해보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  새 목표 추가 <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          {renderRecentAchievements()}
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">스마트 알림</h2>
            {renderSmartNotifications()}
          </div>
        </TabsContent>
      </Tabs>

      {/* 설정 바로가기 */}
      <div className="mt-8 text-center">
        <Button variant="outline" className="mr-4">
          <Settings className="w-4 h-4 mr-2" />
          개인화 설정
        </Button>
        <Button variant="outline">
          <User className="w-4 h-4 mr-2" />
          프로필 편집
        </Button>
      </div>
    </div>
  );
};

export default PersonalizationHub;