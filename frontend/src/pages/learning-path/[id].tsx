import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { LearningPathOverview, LearningPathData } from '@/components/learning-path';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, HomeIcon, SettingsIcon, BarChart3Icon, PlayIcon } from 'lucide-react';

interface LearningPathDetailPageProps {
  initialPathData?: LearningPathData | null;
  pathId: string;
}

const LearningPathDetailPage: React.FC<LearningPathDetailPageProps> = ({
  initialPathData,
  pathId
}) => {
  const router = useRouter();
  const [pathData, setPathData] = useState<LearningPathData | null>(initialPathData || null);
  const [isLoading, setIsLoading] = useState(!initialPathData);
  const [error, setError] = useState<string | null>(null);

  // 학습 경로 상세 데이터 로드
  const loadLearningPathData = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/learning-path/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('학습 경로 정보를 가져오는데 실패했습니다.');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '학습 경로 정보를 가져오는데 실패했습니다.');
      }

      setPathData(data.data);

    } catch (error) {
      console.error('학습 경로 로드 오류:', error);
      setError(error instanceof Error ? error.message : '학습 경로 정보를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드 (초기 데이터가 없는 경우)
  useEffect(() => {
    if (!pathData && pathId) {
      loadLearningPathData(pathId);
    }
  }, [pathId, pathData]);

  // 레슨 시작
  const handleStartLesson = (lessonId: string) => {
    router.push(`/learning-path/${pathId}/lesson/${lessonId}`);
  };

  // 학습 경로 커스터마이징
  const handleCustomizePath = () => {
    router.push(`/learning-path/${pathId}/customize`);
  };

  // 상세 분석 보기
  const handleViewAnalytics = () => {
    router.push(`/learning-path/${pathId}/analytics`);
  };

  // 진도 업데이트
  const handleUpdateProgress = async (lessonId: string, progress: number) => {
    try {
      const response = await fetch(`/api/learning-path/${pathId}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          lessonId,
          progress,
          completedAt: progress === 100 ? new Date().toISOString() : null,
          timeSpent: 0 // 실제로는 세션에서 추적
        })
      });

      if (response.ok) {
        // 데이터 새로고침
        await loadLearningPathData(pathId);
      } else {
        throw new Error('진도 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('진도 업데이트 오류:', error);
      setError(error instanceof Error ? error.message : '진도 업데이트 중 오류가 발생했습니다.');
    }
  };

  // 홈으로 돌아가기
  const handleGoHome = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <Head>
        <title>
          {pathData
            ? `${pathData.name} - 학습 경로`
            : '학습 경로'
          } - 한국인을 위한 헝가리어 학습
        </title>
        <meta
          name="description"
          content={pathData
            ? `${pathData.description} - 현재 ${pathData.progress}% 완료`
            : '개인화된 헝가리어 학습 경로를 확인하세요'
          }
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* 네비게이션 헤더 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="flex items-center"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  뒤로가기
                </Button>

                <div className="h-6 w-px bg-gray-300"></div>

                <h1 className="text-xl font-semibold text-gray-900">
                  {pathData ? pathData.name : '학습 경로'}
                </h1>

                {pathData && (
                  <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                    <span>•</span>
                    <span>{pathData.progress}% 완료</span>
                    <span>•</span>
                    <span>{pathData.currentLevel} → {pathData.targetLevel}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {pathData && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleStartLesson(pathData.lessons.current.id)}
                      className="flex items-center"
                    >
                      <PlayIcon className="w-4 h-4 mr-2" />
                      레슨 시작
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleCustomizePath}
                      className="flex items-center"
                    >
                      <SettingsIcon className="w-4 h-4 mr-2" />
                      설정
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleViewAnalytics}
                      className="flex items-center"
                    >
                      <BarChart3Icon className="w-4 h-4 mr-2" />
                      분석
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  onClick={handleGoHome}
                  className="flex items-center"
                >
                  <HomeIcon className="w-4 h-4 mr-2" />
                  홈으로
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <main className="py-8">
          {/* 오류 메시지 */}
          {error && (
            <div className="max-w-7xl mx-auto px-4 mb-6">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between text-red-800">
                    <div className="text-sm">
                      <strong>오류:</strong> {error}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setError(null)}
                      size="sm"
                    >
                      닫기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="max-w-4xl mx-auto px-4">
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <div className="text-lg font-medium text-gray-900">
                    학습 경로를 불러오는 중입니다...
                  </div>
                  <div className="text-gray-600 mt-2">
                    상세한 진도와 분석 데이터를 준비하고 있습니다.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 학습 경로 없음 */}
          {!isLoading && !pathData && !error && (
            <div className="max-w-4xl mx-auto px-4">
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    학습 경로를 찾을 수 없습니다
                  </div>
                  <div className="text-gray-600 mb-6">
                    요청하신 학습 경로가 존재하지 않거나 접근 권한이 없습니다.
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={() => router.push('/learning-path')}>
                      학습 경로 목록
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/learning-path/create')}>
                      새 경로 만들기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 학습 경로 개요 컴포넌트 */}
          {pathData && (
            <LearningPathOverview
              pathData={pathData}
              onStartLesson={handleStartLesson}
              onCustomizePath={handleCustomizePath}
              onViewAnalytics={handleViewAnalytics}
              onUpdateProgress={handleUpdateProgress}
              isLoading={isLoading}
            />
          )}

          {/* 빠른 액션 섹션 */}
          {pathData && (
            <div className="max-w-7xl mx-auto px-4 mt-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      빠른 액션
                    </h3>
                    <div className="flex justify-center space-x-4">
                      <Button
                        onClick={() => handleStartLesson(pathData.lessons.current.id)}
                        className="flex items-center"
                      >
                        <PlayIcon className="w-4 h-4 mr-2" />
                        {pathData.lessons.current.progress > 0 ? '계속 학습하기' : '첫 레슨 시작'}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => router.push('/assessment')}
                      >
                        실력 재평가
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => router.push('/learning-path')}
                      >
                        다른 경로 보기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

// 서버 사이드 렌더링
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;

  if (!id || typeof id !== 'string') {
    return {
      notFound: true,
    };
  }

  // 인증 확인
  const { req } = context;
  // const token = req.cookies.authToken;

  // if (!token) {
  //   return {
  //     redirect: {
  //       destination: '/auth/login',
  //       permanent: false,
  //     },
  //   };
  // }

  // 학습 경로 사전 로드 (선택사항)
  try {
    // const pathData = await fetchLearningPath(id, token);
    // return {
    //   props: {
    //     initialPathData: pathData,
    //     pathId: id,
    //   },
    // };

    return {
      props: {
        initialPathData: null,
        pathId: id,
      },
    };
  } catch (error) {
    console.error('서버 사이드 데이터 로드 오류:', error);
    return {
      props: {
        initialPathData: null,
        pathId: id,
      },
    };
  }
};

export default LearningPathDetailPage;