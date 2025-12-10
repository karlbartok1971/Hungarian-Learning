'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  Clock,
  Target,
  TrendingUp,
  Brain,
  BookOpen,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  difficulty_level: string;
  skill_areas: string[];
  estimated_duration_minutes: number;
  learning_objectives: string[];
  tags: string[];
  theological_relevance?: number;
}

interface RecommendationScore {
  total_score: number;
  relevance_score: number;
  difficulty_match_score: number;
  learning_style_match: number;
  goal_alignment: number;
  korean_adaptation: number;
  theological_focus: number;
  predicted_engagement: number;
  reasoning: string[];
}

interface PersonalizationFactors {
  adjusted_difficulty: string;
  estimated_completion_time: number;
  suggested_approach: string;
  prerequisite_check: boolean;
  follow_up_suggestions: string[];
}

interface ContentRecommendation {
  content_item: ContentItem;
  recommendation_score: RecommendationScore;
  personalization_factors: PersonalizationFactors;
}

interface SkillGapAnalysis {
  identified_gaps: string[];
  priority_order: string[];
  gap_closing_content: ContentRecommendation[];
}

interface LearningPathIntegration {
  current_milestone: string;
  progress_towards_goal: number;
  next_milestone_content: ContentRecommendation[];
}

interface SessionPlan {
  warm_up_content: ContentRecommendation[];
  main_content: ContentRecommendation[];
  review_content: ContentRecommendation[];
  total_estimated_time: number;
}

interface RecommendationData {
  primary_recommendations: ContentRecommendation[];
  alternative_options: ContentRecommendation[];
  skill_gap_analysis: SkillGapAnalysis;
  learning_path_integration: LearningPathIntegration;
  session_plan: SessionPlan;
}

const PersonalizedRecommendations: React.FC = () => {
  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('recommendations');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recommendations/personalized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          session_type: 'intensive_study',
          time_available_minutes: 30
        })
      });

      if (!response.ok) {
        throw new Error('추천 데이터를 가져오는데 실패했습니다');
      }

      const data = await response.json();
      if (data.success) {
        setRecommendationData(data.data);
      } else {
        throw new Error('추천 데이터 처리 중 오류 발생');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'A1': 'bg-green-100 text-green-800',
      'A2': 'bg-blue-100 text-blue-800',
      'B1': 'bg-yellow-100 text-yellow-800',
      'B2': 'bg-orange-100 text-orange-800',
      'C1': 'bg-red-100 text-red-800',
      'C2': 'bg-purple-100 text-purple-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getContentTypeIcon = (type: string) => {
    const icons = {
      'vocabulary': <BookOpen className="w-4 h-4" />,
      'grammar': <Brain className="w-4 h-4" />,
      'theological_terms': <Star className="w-4 h-4" />,
      'listening': <Zap className="w-4 h-4" />,
      'reading': <BookOpen className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <BookOpen className="w-4 h-4" />;
  };

  const renderRecommendationCard = (recommendation: ContentRecommendation, isPrimary: boolean = true) => (
    <Card key={recommendation.content_item.id} className={`mb-4 ${isPrimary ? 'border-blue-200' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2 mb-2">
              {getContentTypeIcon(recommendation.content_item.content_type)}
              {recommendation.content_item.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getDifficultyColor(recommendation.content_item.difficulty_level)}>
                {recommendation.content_item.difficulty_level}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {recommendation.personalization_factors.estimated_completion_time}분
              </Badge>
              <Badge variant="secondary" className="text-xs">
                추천도: {recommendation.recommendation_score.total_score}%
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 학습 목표 */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">학습 목표</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {recommendation.content_item.learning_objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>

        {/* 추천 이유 */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">추천 이유</h4>
          <ul className="space-y-1">
            {recommendation.recommendation_score.reasoning.map((reason, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* 개인화 조언 */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-sm text-blue-800 mb-1">학습 조언</h4>
          <p className="text-sm text-blue-700">{recommendation.personalization_factors.suggested_approach}</p>
        </div>

        {/* 후속 활동 */}
        {recommendation.personalization_factors.follow_up_suggestions.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">후속 활동</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {recommendation.personalization_factors.follow_up_suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 시작하기 버튼 */}
        <Button className="w-full" onClick={() => {
          // 콘텐츠 시작 로직
          console.log('Starting content:', recommendation.content_item.id);
        }}>
          학습 시작하기
        </Button>
      </CardContent>
    </Card>
  );

  const renderSkillGapAnalysis = () => (
    <div className="space-y-6">
      {/* 스킬 갭 현황 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            스킬 갭 분석
          </CardTitle>
          <CardDescription>
            현재 부족한 영역과 우선순위를 분석했습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">부족한 영역 (우선순위 순)</h4>
              <div className="flex flex-wrap gap-2">
                {recommendationData?.skill_gap_analysis.priority_order.map((skill, index) => (
                  <Badge key={skill} variant={index === 0 ? "destructive" : index === 1 ? "default" : "secondary"}>
                    {index + 1}. {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 갭 해소 콘텐츠 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          갭 해소를 위한 추천 콘텐츠
        </h3>
        {recommendationData?.skill_gap_analysis.gap_closing_content.map(recommendation =>
          renderRecommendationCard(recommendation, false)
        )}
      </div>
    </div>
  );

  const renderLearningPath = () => (
    <div className="space-y-6">
      {/* 현재 진도 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            학습 진도 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">현재 마일스톤</span>
                <span className="text-sm text-gray-600">
                  {recommendationData?.learning_path_integration.current_milestone}
                </span>
              </div>
              <Progress
                value={recommendationData?.learning_path_integration.progress_towards_goal}
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                목표 달성률: {recommendationData?.learning_path_integration.progress_towards_goal}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 다음 마일스톤 콘텐츠 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">다음 마일스톤을 위한 콘텐츠</h3>
        {recommendationData?.learning_path_integration.next_milestone_content.map(recommendation =>
          renderRecommendationCard(recommendation, false)
        )}
      </div>
    </div>
  );

  const renderSessionPlan = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            오늘의 학습 세션 플랜
          </CardTitle>
          <CardDescription>
            총 예상 시간: {recommendationData?.session_plan.total_estimated_time}분
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 워밍업 */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          워밍업 (5분)
        </h3>
        {recommendationData?.session_plan.warm_up_content.map(recommendation =>
          renderRecommendationCard(recommendation, false)
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-500" />
          메인 학습 (20분)
        </h3>
        {recommendationData?.session_plan.main_content.map(recommendation =>
          renderRecommendationCard(recommendation, true)
        )}
      </div>

      {/* 복습 */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          복습 (10분)
        </h3>
        {recommendationData?.session_plan.review_content.map(recommendation =>
          renderRecommendationCard(recommendation, false)
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">개인화된 추천을 생성하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">추천 로드 실패</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchRecommendations}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">개인화된 학습 추천</h1>
        <p className="text-gray-600">당신의 학습 스타일과 목표에 맞춘 최적의 콘텐츠를 추천해드립니다.</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">추천 콘텐츠</TabsTrigger>
          <TabsTrigger value="gaps">스킬 갭 분석</TabsTrigger>
          <TabsTrigger value="path">학습 경로</TabsTrigger>
          <TabsTrigger value="session">세션 플랜</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="mt-6">
          <div className="space-y-6">
            {/* 주요 추천 */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                주요 추천 콘텐츠
              </h2>
              {recommendationData?.primary_recommendations.map(recommendation =>
                renderRecommendationCard(recommendation, true)
              )}
            </div>

            {/* 대안 옵션 */}
            {recommendationData?.alternative_options.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">대안 콘텐츠</h2>
                {recommendationData.alternative_options.map(recommendation =>
                  renderRecommendationCard(recommendation, false)
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="gaps" className="mt-6">
          {renderSkillGapAnalysis()}
        </TabsContent>

        <TabsContent value="path" className="mt-6">
          {renderLearningPath()}
        </TabsContent>

        <TabsContent value="session" className="mt-6">
          {renderSessionPlan()}
        </TabsContent>
      </Tabs>

      {/* 새로고침 버튼 */}
      <div className="mt-8 text-center">
        <Button variant="outline" onClick={fetchRecommendations}>
          추천 새로고침
        </Button>
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;