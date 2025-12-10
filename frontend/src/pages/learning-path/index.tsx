/**
 * 프리미엄 학습 경로 페이지
 * 개인화된 학습 경로 생성, 추천, 진행 상황 추적
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  BookOpen,
  Clock,
  Target,
  CheckCircle2,
  Circle,
  Play,
  Plus,
  Sparkles,
  Award,
  Calendar,
  ArrowRight,
  Zap,
  Star,
  Brain,
  MapPin,
  Route,
} from 'lucide-react';

interface LearningPath {
  id: string;
  name: string;
  description: string;
  level: string;
  totalLessons: number;
  completedLessons: number;
  estimatedWeeks: number;
  progress: number;
  status: 'active' | 'paused' | 'completed';
  icon: string;
  color: string;
  tags: string[];
}

interface RecommendedPath {
  id: string;
  name: string;
  description: string;
  reason: string;
  level: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
}

const LearningPathPage = () => {
  const router = useRouter();
  const [myPaths, setMyPaths] = useState<LearningPath[]>([]);
  const [recommendedPaths, setRecommendedPaths] = useState<RecommendedPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);

      // TODO: 실제 API 연동 (현재는 Mock 데이터)
      // const response = await fetch('http://localhost:3001/api/learning-path');

      // Mock 데이터
      const mockMyPaths: LearningPath[] = [
        {
          id: 'path-1',
          name: '설교문 작성 마스터',
          description: 'A1부터 시작하여 헝가리어로 설교문을 작성할 수 있는 수준까지',
          level: 'A2',
          totalLessons: 45,
          completedLessons: 28,
          estimatedWeeks: 12,
          progress: 62,
          status: 'active',
          icon: '⛪',
          color: 'bg-blue-500',
          tags: ['설교', '종교어휘', '작문'],
        },
        {
          id: 'path-2',
          name: '일상 회화 마스터',
          description: '기본적인 일상 대화와 의사소통 능력 향상',
          level: 'A1',
          totalLessons: 30,
          completedLessons: 15,
          estimatedWeeks: 8,
          progress: 50,
          status: 'active',
          icon: '💬',
          color: 'bg-green-500',
          tags: ['회화', '일상', '기초'],
        },
      ];

      const mockRecommendedPaths: RecommendedPath[] = [
        {
          id: 'rec-1',
          name: '성경 헝가리어',
          description: '성경을 헝가리어로 읽고 이해하기',
          reason: '설교문 작성과 연계된 추천 경로입니다',
          level: 'A2-B1',
          duration: '10주',
          difficulty: 'intermediate',
          icon: '📖',
        },
        {
          id: 'rec-2',
          name: 'B1 종합 과정',
          description: 'A2 완성 후 B1 레벨로 도약하기',
          reason: '현재 학습 진도에 맞는 다음 단계입니다',
          level: 'B1',
          duration: '16주',
          difficulty: 'intermediate',
          icon: '🚀',
        },
        {
          id: 'rec-3',
          name: '헝가리 문화 이해',
          description: '언어와 함께 배우는 헝가리 문화와 역사',
          level: 'A2',
          duration: '6주',
          difficulty: 'beginner',
          reason: '언어 학습에 문화적 맥락을 더할 수 있습니다',
          icon: '🏛️',
        },
      ];

      setMyPaths(mockMyPaths);
      setRecommendedPaths(mockRecommendedPaths);

    } catch (err: any) {
      console.error('학습 경로 로드 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return '일반';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">학습 경로를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">오류 발생</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>학습 경로 - 헝가리어 학습</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Route className="h-10 w-10 text-blue-600" />
              학습 경로
            </h1>
            <p className="text-gray-600 text-lg">
              목표에 맞는 학습 경로를 선택하고 단계별로 학습하세요
            </p>
          </div>

          {/* AI 추천 카드 */}
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI 맞춤 학습 경로
                  </h3>
                  <p className="text-gray-700 mb-4">
                    현재 A2 레벨에서 설교문 작성 능력 향상을 목표로 하고 있습니다.
                    '설교문 작성 마스터' 경로를 62% 완료했으며, 문법과 어휘를 균형있게 학습하고 있습니다.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button size="sm">
                      <Zap className="w-4 h-4 mr-2" />
                      새 경로 생성
                    </Button>
                    <Button size="sm" variant="outline">
                      목표 수정
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 내 학습 경로 */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-blue-600" />
                내 학습 경로
              </h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                새 경로 시작
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myPaths.map((path) => (
                <Card key={path.id} className="hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: path.color.replace('bg-', '#') }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{path.icon}</div>
                        <div>
                          <CardTitle className="text-xl mb-1">{path.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{path.level}</Badge>
                            <Badge className={path.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {path.status === 'active' ? '진행중' : '일시정지'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{path.description}</p>

                    {/* 진도율 */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">진행률</span>
                        <span className="text-sm font-bold text-blue-600">{path.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(path.progress, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {path.completedLessons}/{path.totalLessons} 레슨 완료
                      </p>
                    </div>

                    {/* 상세 정보 */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{path.estimatedWeeks}주</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{path.totalLessons}개 레슨</span>
                      </div>
                    </div>

                    {/* 태그 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {path.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2">
                      <Link href={`/learning-path/${path.id}`} className="flex-1">
                        <Button className="w-full">
                          {path.status === 'active' ? (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              계속하기
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              재개하기
                            </>
                          )}
                        </Button>
                      </Link>
                      <Button variant="outline">
                        상세보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {myPaths.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Route className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    시작된 학습 경로가 없습니다
                  </h3>
                  <p className="text-gray-500 mb-4">
                    아래 추천 경로 중 하나를 선택하거나 직접 경로를 만들어보세요
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    새 경로 시작
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 추천 학습 경로 */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-yellow-600" />
                추천 학습 경로
              </h2>
              <p className="text-gray-600">
                현재 학습 상황에 맞춘 AI 추천 경로입니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedPaths.map((path) => (
                <Card key={path.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="text-4xl mb-3 text-center">{path.icon}</div>
                    <CardTitle className="text-lg text-center mb-2">{path.name}</CardTitle>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Badge variant="outline">{path.level}</Badge>
                      <Badge className={getDifficultyColor(path.difficulty)}>
                        {getDifficultyText(path.difficulty)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">{path.description}</p>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                      <p className="text-xs font-medium text-blue-900 mb-1">💡 추천 이유</p>
                      <p className="text-xs text-blue-700">{path.reason}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{path.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{path.level}</span>
                      </div>
                    </div>

                    <Button className="w-full" variant="outline">
                      자세히 보기
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 학습 경로 가이드 */}
          <Card className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                학습 경로 활용 팁
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">1️⃣</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">명확한 목표 설정</h4>
                    <p className="text-sm text-gray-600">
                      학습 목표를 구체적으로 설정하면 더 효과적인 경로를 추천받을 수 있습니다
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">2️⃣</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">꾸준한 학습</h4>
                    <p className="text-sm text-gray-600">
                      매일 조금씩이라도 학습하는 것이 간헐적으로 많이 하는 것보다 효과적입니다
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">3️⃣</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">진도 관리</h4>
                    <p className="text-sm text-gray-600">
                      정기적으로 진도를 확인하고 필요시 경로를 조정하세요
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LearningPathPage;
