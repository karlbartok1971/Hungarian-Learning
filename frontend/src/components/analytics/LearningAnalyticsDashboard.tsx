'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  BookOpen,
  Brain,
  Star,
  Activity,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Award,
  AlertTriangle
} from 'lucide-react';

interface SkillProgress {
  skill: string;
  current_level: string;
  target_level: string;
  progress_percentage: number;
  recent_improvement: number;
  strength_areas: string[];
  weakness_areas: string[];
}

interface StudySession {
  date: string;
  duration_minutes: number;
  content_types: string[];
  completion_rate: number;
  accuracy_score: number;
  engagement_level: number;
}

interface LearningGoalProgress {
  goal_id: string;
  goal_description: string;
  target_date: string;
  progress_percentage: number;
  milestones_completed: number;
  total_milestones: number;
  estimated_completion_date: string;
  is_on_track: boolean;
}

interface WeeklyStats {
  week: string;
  study_hours: number;
  sessions_completed: number;
  average_score: number;
  vocabulary_learned: number;
  grammar_concepts: number;
}

interface AnalyticsData {
  overall_progress: {
    current_level: string;
    level_progress: number;
    total_study_hours: number;
    streak_days: number;
    vocabulary_mastered: number;
    grammar_concepts_learned: number;
  };
  skill_progress: SkillProgress[];
  recent_sessions: StudySession[];
  learning_goals: LearningGoalProgress[];
  weekly_stats: WeeklyStats[];
  performance_insights: {
    strongest_skill: string;
    weakest_skill: string;
    optimal_study_time: string;
    learning_velocity: number;
    predicted_next_level_date: string;
  };
  korean_adaptation_analysis: {
    interference_score: number;
    common_mistakes: string[];
    improvement_trends: string[];
    cultural_adaptation_level: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const LearningAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // 시뮬레이션된 데이터 생성
      const mockData: AnalyticsData = {
        overall_progress: {
          current_level: 'A2',
          level_progress: 68,
          total_study_hours: 127,
          streak_days: 12,
          vocabulary_mastered: 453,
          grammar_concepts_learned: 28
        },
        skill_progress: [
          {
            skill: 'vocabulary',
            current_level: 'A2',
            target_level: 'B1',
            progress_percentage: 75,
            recent_improvement: 8,
            strength_areas: ['신학 어휘', '일상 표현'],
            weakness_areas: ['추상적 개념', '관용구']
          },
          {
            skill: 'grammar',
            current_level: 'A1',
            target_level: 'A2',
            progress_percentage: 45,
            recent_improvement: -2,
            strength_areas: ['기본 어순', '현재시제'],
            weakness_areas: ['격변화', '과거시제']
          },
          {
            skill: 'listening',
            current_level: 'A2',
            target_level: 'B1',
            progress_percentage: 62,
            recent_improvement: 12,
            strength_areas: ['느린 발음', '짧은 대화'],
            weakness_areas: ['빠른 발음', '방언']
          },
          {
            skill: 'speaking',
            current_level: 'A1',
            target_level: 'A2',
            progress_percentage: 38,
            recent_improvement: 5,
            strength_areas: ['발음', '인사'],
            weakness_areas: ['문법 정확성', '유창성']
          },
          {
            skill: 'reading',
            current_level: 'A2',
            target_level: 'B1',
            progress_percentage: 71,
            recent_improvement: 6,
            strength_areas: ['짧은 텍스트', '신학 문서'],
            weakness_areas: ['긴 문장', '문학적 표현']
          },
          {
            skill: 'writing',
            current_level: 'A1',
            target_level: 'A2',
            progress_percentage: 42,
            recent_improvement: 3,
            strength_areas: ['단문', '기본 표현'],
            weakness_areas: ['복문', '문단 구성']
          }
        ],
        recent_sessions: [
          {
            date: '2024-11-26',
            duration_minutes: 45,
            content_types: ['theological_terms', 'grammar'],
            completion_rate: 85,
            accuracy_score: 78,
            engagement_level: 92
          },
          {
            date: '2024-11-25',
            duration_minutes: 30,
            content_types: ['vocabulary', 'pronunciation'],
            completion_rate: 92,
            accuracy_score: 82,
            engagement_level: 88
          },
          {
            date: '2024-11-24',
            duration_minutes: 60,
            content_types: ['listening', 'reading'],
            completion_rate: 78,
            accuracy_score: 75,
            engagement_level: 85
          }
        ],
        learning_goals: [
          {
            goal_id: '1',
            goal_description: 'A2 레벨 달성',
            target_date: '2024-12-31',
            progress_percentage: 68,
            milestones_completed: 8,
            total_milestones: 12,
            estimated_completion_date: '2024-12-28',
            is_on_track: true
          },
          {
            goal_id: '2',
            goal_description: '설교문 500단어 작성 능력',
            target_date: '2025-02-01',
            progress_percentage: 35,
            milestones_completed: 2,
            total_milestones: 8,
            estimated_completion_date: '2025-02-15',
            is_on_track: false
          }
        ],
        weekly_stats: [
          { week: '11월 1주', study_hours: 8.5, sessions_completed: 12, average_score: 78, vocabulary_learned: 45, grammar_concepts: 3 },
          { week: '11월 2주', study_hours: 9.2, sessions_completed: 14, average_score: 82, vocabulary_learned: 52, grammar_concepts: 4 },
          { week: '11월 3주', study_hours: 7.8, sessions_completed: 11, average_score: 75, vocabulary_learned: 38, grammar_concepts: 2 },
          { week: '11월 4주', study_hours: 10.1, sessions_completed: 16, average_score: 85, vocabulary_learned: 63, grammar_concepts: 5 }
        ],
        performance_insights: {
          strongest_skill: 'vocabulary',
          weakest_skill: 'speaking',
          optimal_study_time: '오후 2시-4시',
          learning_velocity: 1.2,
          predicted_next_level_date: '2024-12-28'
        },
        korean_adaptation_analysis: {
          interference_score: 65,
          common_mistakes: ['격변화 혼동', '어순 오류', '조사 생략'],
          improvement_trends: ['발음 정확도 향상', '어휘량 증가'],
          cultural_adaptation_level: 78
        }
      };

      setAnalyticsData(mockData);
    } catch (err) {
      setError('분석 데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">현재 레벨</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analyticsData?.overall_progress.current_level}</div>
          <Progress value={analyticsData?.overall_progress.level_progress} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            다음 레벨까지 {analyticsData?.overall_progress.level_progress}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 학습 시간</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analyticsData?.overall_progress.total_study_hours}시간</div>
          <p className="text-xs text-muted-foreground">
            연속 학습: {analyticsData?.overall_progress.streak_days}일
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">습득 어휘</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analyticsData?.overall_progress.vocabulary_mastered}</div>
          <p className="text-xs text-muted-foreground">
            문법 개념: {analyticsData?.overall_progress.grammar_concepts_learned}개
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">학습 속도</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analyticsData?.performance_insights.learning_velocity}x</div>
          <p className="text-xs text-muted-foreground">
            평균 대비 학습 속도
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderSkillProgressRadar = () => {
    const radarData = analyticsData?.skill_progress.map(skill => ({
      skill: skill.skill,
      progress: skill.progress_percentage
    }));

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            스킬별 진도 분석
          </CardTitle>
          <CardDescription>
            각 영역별 현재 진도와 목표 달성률
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis angle={0} domain={[0, 100]} />
              <Radar
                name="진도율"
                dataKey="progress"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-3">
            {analyticsData?.skill_progress.map((skill, index) => (
              <div key={skill.skill} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">{skill.skill}</span>
                  <Badge variant={skill.recent_improvement >= 0 ? "default" : "destructive"} className="text-xs">
                    {skill.recent_improvement >= 0 ? '+' : ''}{skill.recent_improvement}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{skill.current_level}</span>
                  <span className="text-xs text-gray-400">→</span>
                  <span className="text-sm text-blue-600">{skill.target_level}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderWeeklyStatsChart = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          주간 학습 통계
        </CardTitle>
        <CardDescription>
          최근 4주간의 학습 성과 추이
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData?.weekly_stats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="study_hours" fill="#8884d8" name="학습 시간" />
            <Bar dataKey="average_score" fill="#82ca9d" name="평균 점수" />
            <Bar dataKey="sessions_completed" fill="#ffc658" name="세션 수" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderGoalProgress = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          학습 목표 달성 현황
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {analyticsData?.learning_goals.map((goal) => (
          <div key={goal.goal_id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{goal.goal_description}</h4>
              <Badge variant={goal.is_on_track ? "default" : "destructive"}>
                {goal.is_on_track ? "순조" : "지연"}
              </Badge>
            </div>

            <Progress value={goal.progress_percentage} className="h-2" />

            <div className="flex justify-between text-sm text-gray-600">
              <span>진행률: {goal.progress_percentage}%</span>
              <span>마일스톤: {goal.milestones_completed}/{goal.total_milestones}</span>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>목표일: {goal.target_date}</span>
              <span>예상 완료: {goal.estimated_completion_date}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderPerformanceInsights = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          성과 인사이트
        </CardTitle>
        <CardDescription>
          AI가 분석한 당신의 학습 패턴과 개선 방안
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-green-600">강점 영역</h4>
            <p className="text-sm text-gray-600">
              {analyticsData?.performance_insights.strongest_skill} 영역에서 우수한 성과
            </p>
            <Badge variant="secondary" className="text-xs">
              상위 20% 수준
            </Badge>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-red-600">집중 필요 영역</h4>
            <p className="text-sm text-gray-600">
              {analyticsData?.performance_insights.weakest_skill} 영역 중점 학습 권장
            </p>
            <Badge variant="destructive" className="text-xs">
              추가 연습 필요
            </Badge>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">맞춤형 학습 조언</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              최적 학습 시간: {analyticsData?.performance_insights.optimal_study_time}
            </li>
            <li className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              다음 레벨 예상일: {analyticsData?.performance_insights.predicted_next_level_date}
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              현재 학습 속도: 평균의 {analyticsData?.performance_insights.learning_velocity}배
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  const renderKoreanAdaptationAnalysis = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          한국인 학습자 적응 분석
        </CardTitle>
        <CardDescription>
          한국어 간섭 현상과 적응 수준 분석
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">언어 간섭 수준</h4>
          <Progress value={analyticsData?.korean_adaptation_analysis.interference_score} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            간섭 점수: {analyticsData?.korean_adaptation_analysis.interference_score}% (낮을수록 좋음)
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-3">문화적 적응도</h4>
          <Progress value={analyticsData?.korean_adaptation_analysis.cultural_adaptation_level} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            적응도: {analyticsData?.korean_adaptation_analysis.cultural_adaptation_level}%
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-3">자주 하는 실수</h4>
          <div className="flex flex-wrap gap-2">
            {analyticsData?.korean_adaptation_analysis.common_mistakes.map((mistake, index) => (
              <Badge key={index} variant="destructive" className="text-xs">
                {mistake}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">개선 추세</h4>
          <div className="flex flex-wrap gap-2">
            {analyticsData?.korean_adaptation_analysis.improvement_trends.map((trend, index) => (
              <Badge key={index} variant="default" className="text-xs">
                {trend}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">학습 분석을 진행하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">분석 로드 실패</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchAnalyticsData}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">학습 진도 분석</h1>
            <p className="text-gray-600">상세한 학습 성과와 개선 방향을 확인하세요.</p>
          </div>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">최근 7일</SelectItem>
              <SelectItem value="30days">최근 30일</SelectItem>
              <SelectItem value="90days">최근 3개월</SelectItem>
              <SelectItem value="1year">최근 1년</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 전체 개요 카드들 */}
      {renderOverviewCards()}

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">스킬 진도</TabsTrigger>
          <TabsTrigger value="statistics">통계</TabsTrigger>
          <TabsTrigger value="goals">목표 달성</TabsTrigger>
          <TabsTrigger value="insights">인사이트</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderSkillProgressRadar()}
            {renderKoreanAdaptationAnalysis()}
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <div className="space-y-6">
            {renderWeeklyStatsChart()}

            {/* 최근 세션 성과 */}
            <Card>
              <CardHeader>
                <CardTitle>최근 학습 세션</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.recent_sessions.map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{session.date}</p>
                        <p className="text-sm text-gray-600">{session.duration_minutes}분 학습</p>
                        <div className="flex gap-1 mt-1">
                          {session.content_types.map((type, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">완료율: {session.completion_rate}%</p>
                        <p className="text-sm">정확도: {session.accuracy_score}%</p>
                        <p className="text-sm">참여도: {session.engagement_level}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          {renderGoalProgress()}
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          {renderPerformanceInsights()}
        </TabsContent>
      </Tabs>

      {/* 새로고침 버튼 */}
      <div className="mt-8 text-center">
        <Button variant="outline" onClick={fetchAnalyticsData}>
          데이터 새로고침
        </Button>
      </div>
    </div>
  );
};

export default LearningAnalyticsDashboard;