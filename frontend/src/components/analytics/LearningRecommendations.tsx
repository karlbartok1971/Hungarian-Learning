// 개인화된 학습 추천 컴포넌트
// T120 [P] [US5] Add personalized learning recommendations display
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Target,
  TrendingUp,
  Clock,
  Star,
  BookOpen,
  Play,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Calendar,
  ArrowRight,
  Users,
  Award,
  Zap,
  Brain,
  HeartHandshake
} from 'lucide-react';

interface LearningRecommendation {
  id: string;
  type: 'immediate' | 'weekly' | 'monthly' | 'long_term';
  priority: 'high' | 'medium' | 'low';
  category: 'vocabulary' | 'grammar' | 'pronunciation' | 'fluency' | 'cultural';
  title: string;
  description: string;
  reasoning: string;
  estimatedTime: number; // 분 단위
  difficulty: number; // 1-5
  expectedImprovement: number; // 0-1
  actions: Array<{
    id: string;
    title: string;
    description: string;
    type: 'lesson' | 'practice' | 'review' | 'assessment';
    url?: string;
    completed?: boolean;
  }>;
  prerequisites?: string[];
  resources: string[];
  successMetrics: string[];
  dueDate?: Date;
  adaptiveAdjustments?: {
    basedOn: string;
    adjustment: string;
  }[];
}

interface LearningRecommendationsProps {
  userId: string;
  weaknessData?: any;
  progressData?: any;
}

const LearningRecommendations: React.FC<LearningRecommendationsProps> = ({
  userId,
  weaknessData,
  progressData
}) => {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  // 목업 추천 데이터 (실제 구현에서는 백엔드에서 가져옴)
  const mockRecommendations: LearningRecommendation[] = [
    {
      id: 'rec_001',
      type: 'immediate',
      priority: 'high',
      category: 'vocabulary',
      title: '종교 어휘 집중 학습',
      description: '설교문 작성 목표를 위한 핵심 종교 용어 30개 마스터',
      reasoning: '종교 어휘 정확도가 45%로 낮고, 설교문 작성 목표 달성을 위해 우선 개선이 필요합니다.',
      estimatedTime: 90, // 1.5시간
      difficulty: 3,
      expectedImprovement: 0.25,
      actions: [
        {
          id: 'act_001_1',
          title: '플래시카드로 핵심 용어 학습',
          description: '매일 10개씩 새로운 종교 용어를 플래시카드로 학습',
          type: 'lesson',
          completed: false
        },
        {
          id: 'act_001_2',
          title: '예문을 통한 문맥 학습',
          description: '학습한 용어들을 실제 종교 텍스트에서 찾아 문맥 파악',
          type: 'practice',
          completed: false
        },
        {
          id: 'act_001_3',
          title: '작문 연습으로 활용',
          description: '새로 배운 용어들을 사용하여 짧은 문장 5개 작성',
          type: 'practice',
          completed: false
        }
      ],
      prerequisites: ['기본 어휘 500개'],
      resources: ['종교 어휘 카드덱', '성경 구절 모음', '헝가리 개신교 용어집'],
      successMetrics: ['어휘 정확도 70% 달성', '종교 텍스트 이해도 향상'],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1주일 후
      adaptiveAdjustments: [
        {
          basedOn: '최근 학습 패턴',
          adjustment: '오후 2-4시 학습 효율이 높아 해당 시간대 학습 권장'
        }
      ]
    },
    {
      id: 'rec_002',
      type: 'weekly',
      priority: 'medium',
      category: 'grammar',
      title: '격변화 패턴 정복',
      description: '헝가리어 격변화 중 자주 실수하는 3가지 패턴 집중 학습',
      reasoning: '문법 정확도가 65%이며, 특히 격변화에서 반복적인 실수가 발견됩니다.',
      estimatedTime: 180, // 3시간
      difficulty: 4,
      expectedImprovement: 0.20,
      actions: [
        {
          id: 'act_002_1',
          title: '격변화 규칙 학습',
          description: '주격, 대격, 여격 변화 규칙 체계적 학습',
          type: 'lesson'
        },
        {
          id: 'act_002_2',
          title: '변화표 암기',
          description: '자주 사용하는 명사 20개의 격변화표 완전 암기',
          type: 'practice'
        },
        {
          id: 'act_002_3',
          title: '실전 연습',
          description: '격변화가 포함된 문장 50개 번역 및 작성 연습',
          type: 'practice'
        }
      ],
      resources: ['격변화 참고표', '연습 문제집', '헝가리어 문법책'],
      successMetrics: ['격변화 정확도 85% 달성', '문법 테스트 점수 향상']
    },
    {
      id: 'rec_003',
      type: 'monthly',
      priority: 'low',
      category: 'pronunciation',
      title: '발음 정확도 개선',
      description: '헝가리어 특유의 자음 조합 발음 마스터',
      reasoning: '발음 점수가 58%로 상대적으로 낮으며, 의사소통 개선을 위해 점진적 향상이 필요합니다.',
      estimatedTime: 300, // 5시간
      difficulty: 3,
      expectedImprovement: 0.15,
      actions: [
        {
          id: 'act_003_1',
          title: '발음 가이드 학습',
          description: 'IPA 표기법으로 헝가리어 발음 체계 이해',
          type: 'lesson'
        },
        {
          id: 'act_003_2',
          title: '녹음 연습',
          description: '어려운 단어 50개 녹음하여 원어민 발음과 비교',
          type: 'practice'
        }
      ],
      resources: ['발음 가이드 영상', '음성 녹음 앱', 'IPA 참고표'],
      successMetrics: ['발음 정확도 75% 달성']
    }
  ];

  useEffect(() => {
    setRecommendations(mockRecommendations);
  }, []);

  // 우선순위별 색상 설정
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock };
      case 'low':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: Lightbulb };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Target };
    }
  };

  // 카테고리별 아이콘
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vocabulary': return BookOpen;
      case 'grammar': return Brain;
      case 'pronunciation': return Users;
      case 'fluency': return Zap;
      case 'cultural': return HeartHandshake;
      default: return Target;
    }
  };

  // 액션 완료 처리
  const handleActionComplete = (recommendationId: string, actionId: string) => {
    setCompletedActions(prev => new Set([...prev, actionId]));

    toast({
      title: "액션 완료!",
      description: "학습 활동이 완료되었습니다. 계속 좋은 진전을 보이고 있어요!",
    });

    // 실제 구현에서는 백엔드에 진행 상황 저장
  };

  // 추천 시작하기
  const handleStartRecommendation = (recommendation: LearningRecommendation) => {
    toast({
      title: `"${recommendation.title}" 시작`,
      description: "맞춤 학습이 시작되었습니다. 꾸준히 진행해보세요!",
    });

    // 실제 구현에서는 해당 학습 페이지로 이동하거나 학습 세션 시작
  };

  // 필터링된 추천사항
  const filteredRecommendations = selectedCategory === 'all'
    ? recommendations
    : recommendations.filter(rec => rec.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>맞춤 학습 추천</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            AI가 분석한 당신의 학습 패턴과 약점을 기반으로 개인화된 학습 계획을 제안합니다.
          </p>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: '전체', icon: Target },
              { value: 'vocabulary', label: '어휘', icon: BookOpen },
              { value: 'grammar', label: '문법', icon: Brain },
              { value: 'pronunciation', label: '발음', icon: Users },
              { value: 'fluency', label: '유창성', icon: Zap },
              { value: 'cultural', label: '문화', icon: HeartHandshake },
            ].map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="flex items-center space-x-1"
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 추천사항 목록 */}
      <div className="grid gap-6">
        {filteredRecommendations.map((recommendation) => {
          const priorityConfig = getPriorityConfig(recommendation.priority);
          const PriorityIcon = priorityConfig.icon;
          const CategoryIcon = getCategoryIcon(recommendation.category);

          const completedActionsCount = recommendation.actions.filter(
            action => completedActions.has(action.id)
          ).length;

          const progressPercentage = (completedActionsCount / recommendation.actions.length) * 100;

          return (
            <Card key={recommendation.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <CategoryIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {recommendation.title}
                        </h3>
                        <Badge className={priorityConfig.color}>
                          <PriorityIcon className="h-3 w-3 mr-1" />
                          {recommendation.priority === 'high' ? '긴급' :
                           recommendation.priority === 'medium' ? '보통' : '여유'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{recommendation.description}</p>

                      {/* 상세 정보 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{Math.floor(recommendation.estimatedTime / 60)}시간 {recommendation.estimatedTime % 60}분</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-gray-400" />
                          <span>난이도 {recommendation.difficulty}/5</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-gray-400" />
                          <span>예상 개선 {Math.round(recommendation.expectedImprovement * 100)}%</span>
                        </div>
                        {recommendation.dueDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>마감 {recommendation.dueDate.toLocaleDateString('ko-KR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <Button
                      onClick={() => handleStartRecommendation(recommendation)}
                      className="flex items-center space-x-2"
                      size="sm"
                    >
                      <Play className="h-4 w-4" />
                      <span>시작하기</span>
                    </Button>

                    {/* 진행률 */}
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">
                        진행률 {Math.round(progressPercentage)}%
                      </div>
                      <Progress value={progressPercentage} className="w-20 h-2" />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* 이유 설명 */}
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">왜 이 학습이 추천되나요?</h4>
                      <p className="text-sm text-blue-800">{recommendation.reasoning}</p>
                    </div>
                  </div>
                </div>

                {/* 액션 아이템들 */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 mb-3">학습 단계</h4>
                  {recommendation.actions.map((action, index) => (
                    <div
                      key={action.id}
                      className={`border rounded-lg p-3 transition-all ${
                        completedActions.has(action.id)
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            completedActions.has(action.id)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {completedActions.has(action.id) ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className={`font-medium ${
                              completedActions.has(action.id) ? 'text-green-800' : 'text-gray-900'
                            }`}>
                              {action.title}
                            </h5>
                            <p className="text-sm text-gray-600 mt-1">
                              {action.description}
                            </p>
                            <Badge variant="secondary" className="mt-2 text-xs">
                              {action.type === 'lesson' ? '학습' :
                               action.type === 'practice' ? '연습' :
                               action.type === 'review' ? '복습' : '평가'}
                            </Badge>
                          </div>
                        </div>

                        {!completedActions.has(action.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActionComplete(recommendation.id, action.id)}
                            className="flex items-center space-x-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>완료</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 추가 정보 */}
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  {/* 필요 자료 */}
                  {recommendation.resources.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">필요 자료</h5>
                      <div className="flex flex-wrap gap-1">
                        {recommendation.resources.map((resource, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 성공 지표 */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">성공 지표</h5>
                    <ul className="space-y-1">
                      {recommendation.successMetrics.map((metric, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <Award className="h-3 w-3 text-yellow-500" />
                          <span>{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 적응적 조정 */}
                {recommendation.adaptiveAdjustments && recommendation.adaptiveAdjustments.length > 0 && (
                  <div className="mt-4 bg-purple-50 p-3 rounded-lg">
                    <h5 className="font-medium text-purple-900 mb-2">AI 맞춤 조정</h5>
                    {recommendation.adaptiveAdjustments.map((adjustment, index) => (
                      <div key={index} className="text-sm text-purple-800">
                        <strong>{adjustment.basedOn}:</strong> {adjustment.adjustment}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRecommendations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              추천 학습이 없습니다
            </h3>
            <p className="text-gray-600">
              선택한 카테고리에 대한 추천 학습이 없습니다.<br />
              다른 카테고리를 선택해보세요.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningRecommendations;