// 향상된 약점 분석 컴포넌트
// T115 [US5] Enhanced WeaknessAnalysis component implementation
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BookOpen, Clock, Target, TrendingUp, Users, CheckCircle } from 'lucide-react';

// 백엔드 WeaknessAnalyzer 인터페이스 정의
interface WeaknessCategory {
  category: 'vocabulary' | 'pronunciation' | 'grammar' | 'fluency';
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  specificAreas: Array<{
    areaName: string;
    accuracyRate: number;
    practiceFrequency: number;
    improvementPotential: number;
    difficultyLevel: string;
    prerequisites: string[];
  }>;
  rootCauses: string[];
  impactOnOverallProgress: number;
  recommendedActions: Array<{
    actionType: string;
    priority: number;
    estimatedImprovement: number;
    timeInvestment: number;
    description: string;
    resources: string[];
  }>;
}

interface PriorityRecommendation {
  recommendationId: string;
  title: string;
  description: string;
  targetWeakness: string;
  expectedBenefit: number;
  difficultyLevel: number;
  timeRequirement: number;
  prerequisites: string[];
  resources: string[];
  metrics: string[];
  timeline: string;
  actionPlan: {
    immediateActions: Array<{
      action: string;
      timeframe: string;
      resources: string[];
      expectedOutcome: string;
    }>;
    longTermGoals: Array<{
      goal: string;
      timeline: string;
      milestones: string[];
      successCriteria: string[];
    }>;
  };
}

interface WeaknessAnalysisData {
  weaknessCategories: WeaknessCategory[];
  priorityRecommendations: PriorityRecommendation[];
  overallWeaknessScore: number;
  improvementPotential: number;
  estimatedTimeToImprove: number;
}

interface WeaknessAnalysisProps {
  data?: WeaknessAnalysisData;
}

const WeaknessAnalysis: React.FC<WeaknessAnalysisProps> = ({ data }) => {
  // 목업 데이터 (실제 데이터가 없을 때 사용)
  const mockData: WeaknessAnalysisData = useMemo(() => ({
    weaknessCategories: [
      {
        category: 'vocabulary',
        severity: 'high',
        confidence: 0.92,
        specificAreas: [
          {
            areaName: '종교 어휘',
            accuracyRate: 0.45,
            practiceFrequency: 0.2,
            improvementPotential: 0.8,
            difficultyLevel: 'advanced',
            prerequisites: ['기본 어휘', '격변화']
          },
          {
            areaName: '일상 대화',
            accuracyRate: 0.65,
            practiceFrequency: 0.4,
            improvementPotential: 0.6,
            difficultyLevel: 'intermediate',
            prerequisites: ['기본 문법']
          }
        ],
        rootCauses: ['제한된 노출', '반복 연습 부족', '맥락적 학습 부족'],
        impactOnOverallProgress: 0.7,
        recommendedActions: [
          {
            actionType: '집중 어휘 학습',
            priority: 1,
            estimatedImprovement: 0.3,
            timeInvestment: 30,
            description: '종교 어휘에 집중한 플래시카드 학습',
            resources: ['종교 어휘 덱', '예문 모음집']
          }
        ]
      },
      {
        category: 'grammar',
        severity: 'medium',
        confidence: 0.85,
        specificAreas: [
          {
            areaName: '격변화',
            accuracyRate: 0.55,
            practiceFrequency: 0.3,
            improvementPotential: 0.7,
            difficultyLevel: 'intermediate',
            prerequisites: ['기본 문법 구조']
          }
        ],
        rootCauses: ['복잡한 규칙', '불규칙 변화', '연습 부족'],
        impactOnOverallProgress: 0.6,
        recommendedActions: [
          {
            actionType: '문법 연습',
            priority: 2,
            estimatedImprovement: 0.25,
            timeInvestment: 45,
            description: '격변화 패턴 연습',
            resources: ['문법 연습 문제', '변화표']
          }
        ]
      }
    ],
    priorityRecommendations: [
      {
        recommendationId: 'rec_001',
        title: '종교 어휘 집중 학습',
        description: '설교문 작성 목표를 위한 종교 관련 어휘력 강화',
        targetWeakness: 'vocabulary',
        expectedBenefit: 0.4,
        difficultyLevel: 3,
        timeRequirement: 60,
        prerequisites: ['기본 어휘 500개'],
        resources: ['종교 어휘 카드', '성경 구절 예제'],
        metrics: ['어휘 정확도', '사용 빈도'],
        timeline: '4주',
        actionPlan: {
          immediateActions: [
            {
              action: '매일 20개 새 종교 어휘 학습',
              timeframe: '매일 15분',
              resources: ['플래시카드 앱'],
              expectedOutcome: '주당 140개 어휘 습득'
            }
          ],
          longTermGoals: [
            {
              goal: '종교 어휘 500개 마스터',
              timeline: '8주',
              milestones: ['2주: 200개', '4주: 350개', '8주: 500개'],
              successCriteria: ['90% 정확도', '즉석 사용 가능']
            }
          ]
        }
      }
    ],
    overallWeaknessScore: 0.65,
    improvementPotential: 0.75,
    estimatedTimeToImprove: 120
  }), []);

  const analysisData = data || mockData;

  // 심각도에 따른 색상 및 아이콘 반환
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { color: 'text-red-600 bg-red-50 border-red-200', icon: AlertTriangle, label: '긴급' };
      case 'high':
        return { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: AlertTriangle, label: '높음' };
      case 'medium':
        return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock, label: '보통' };
      case 'low':
        return { color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle, label: '낮음' };
      default:
        return { color: 'text-gray-600 bg-gray-50 border-gray-200', icon: Clock, label: '알 수 없음' };
    }
  };

  // 카테고리별 한국어 이름 반환
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'vocabulary': return '어휘력';
      case 'pronunciation': return '발음';
      case 'grammar': return '문법';
      case 'fluency': return '유창성';
      default: return category;
    }
  };

  return (
    <div className="space-y-6">
      {/* 전체 요약 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            약점 분석 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Math.round((1 - analysisData.overallWeaknessScore) * 100)}%
              </div>
              <div className="text-sm text-gray-600">전체 약점 점수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(analysisData.improvementPotential * 100)}%
              </div>
              <div className="text-sm text-gray-600">개선 가능성</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analysisData.estimatedTimeToImprove}시간
              </div>
              <div className="text-sm text-gray-600">예상 개선 시간</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 기반 상세 분석 */}
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">약점 카테고리</TabsTrigger>
          <TabsTrigger value="recommendations">추천 사항</TabsTrigger>
        </TabsList>

        {/* 약점 카테고리 탭 */}
        <TabsContent value="categories" className="space-y-4">
          {analysisData.weaknessCategories.map((weakness, index) => {
            const severityConfig = getSeverityConfig(weakness.severity);
            const SeverityIcon = severityConfig.icon;

            return (
              <Card key={index} className={`border-l-4 ${severityConfig.color}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SeverityIcon className="h-5 w-5" />
                      {getCategoryName(weakness.category)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{severityConfig.label}</Badge>
                      <span className="text-sm text-gray-600">
                        확신도: {Math.round(weakness.confidence * 100)}%
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 세부 영역 */}
                  <div>
                    <h4 className="font-medium mb-3">세부 영역</h4>
                    <div className="space-y-3">
                      {weakness.specificAreas.map((area, areaIndex) => (
                        <div key={areaIndex} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">{area.areaName}</h5>
                            <Badge variant="outline">{area.difficultyLevel}</Badge>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>정확도</span>
                                <span>{Math.round(area.accuracyRate * 100)}%</span>
                              </div>
                              <Progress value={area.accuracyRate * 100} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>개선 가능성</span>
                                <span>{Math.round(area.improvementPotential * 100)}%</span>
                              </div>
                              <Progress value={area.improvementPotential * 100} className="h-2" />
                            </div>
                          </div>
                          {area.prerequisites.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm text-gray-600 mb-1">선수 요건:</div>
                              <div className="flex flex-wrap gap-1">
                                {area.prerequisites.map((prerequisite, preIndex) => (
                                  <Badge key={preIndex} variant="secondary" className="text-xs">
                                    {prerequisite}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 근본 원인 */}
                  <div>
                    <h4 className="font-medium mb-2">근본 원인</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {weakness.rootCauses.map((cause, causeIndex) => (
                        <li key={causeIndex}>{cause}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 추천 액션 */}
                  <div>
                    <h4 className="font-medium mb-3">추천 액션</h4>
                    <div className="space-y-2">
                      {weakness.recommendedActions.map((action, actionIndex) => (
                        <div key={actionIndex} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">{action.actionType}</h5>
                            <Badge variant="outline">우선순위 {action.priority}</Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{action.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">예상 개선:</span>
                              <span className="ml-1 font-medium">
                                {Math.round(action.estimatedImprovement * 100)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">소요 시간:</span>
                              <span className="ml-1 font-medium">{action.timeInvestment}분</span>
                            </div>
                          </div>
                          {action.resources.length > 0 && (
                            <div className="mt-2">
                              <div className="text-sm text-gray-600 mb-1">필요 자료:</div>
                              <div className="flex flex-wrap gap-1">
                                {action.resources.map((resource, resourceIndex) => (
                                  <Badge key={resourceIndex} variant="secondary" className="text-xs">
                                    {resource}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 전체 진도에 미치는 영향 */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">전체 진도에 미치는 영향</span>
                      <span className="font-medium">
                        {Math.round(weakness.impactOnOverallProgress * 100)}%
                      </span>
                    </div>
                    <Progress value={weakness.impactOnOverallProgress * 100} className="h-2 mt-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* 우선순위 추천 사항 탭 */}
        <TabsContent value="recommendations" className="space-y-4">
          {analysisData.priorityRecommendations.map((recommendation, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {recommendation.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      기대 효과 {Math.round(recommendation.expectedBenefit * 100)}%
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{recommendation.description}</p>

                {/* 추천 정보 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">대상 약점</div>
                    <div className="font-medium">{getCategoryName(recommendation.targetWeakness)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">난이도</div>
                    <div className="font-medium">{recommendation.difficultyLevel}/5</div>
                  </div>
                  <div>
                    <div className="text-gray-600">소요 시간</div>
                    <div className="font-medium">{recommendation.timeRequirement}분/일</div>
                  </div>
                  <div>
                    <div className="text-gray-600">완료 예상</div>
                    <div className="font-medium">{recommendation.timeline}</div>
                  </div>
                </div>

                {/* 즉시 실행 가능한 액션 */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    즉시 실행 액션
                  </h4>
                  <div className="space-y-2">
                    {recommendation.actionPlan.immediateActions.map((action, actionIndex) => (
                      <div key={actionIndex} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">{action.action}</h5>
                          <Badge variant="outline">{action.timeframe}</Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{action.expectedOutcome}</p>
                        {action.resources.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {action.resources.map((resource, resourceIndex) => (
                              <Badge key={resourceIndex} variant="secondary" className="text-xs">
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 장기 목표 */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    장기 목표
                  </h4>
                  <div className="space-y-2">
                    {recommendation.actionPlan.longTermGoals.map((goal, goalIndex) => (
                      <div key={goalIndex} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">{goal.goal}</h5>
                          <Badge variant="outline">{goal.timeline}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">마일스톤:</div>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {goal.milestones.map((milestone, milestoneIndex) => (
                                <li key={milestoneIndex}>{milestone}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">성공 기준:</div>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {goal.successCriteria.map((criteria, criteriaIndex) => (
                                <li key={criteriaIndex}>{criteria}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button size="sm" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    학습 계획 생성
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    멘토와 상담
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeaknessAnalysis;