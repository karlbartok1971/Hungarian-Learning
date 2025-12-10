import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { AssessmentResult, AssessmentResultData } from '@/components/assessment';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, HomeIcon, ShareIcon, DownloadIcon } from 'lucide-react';

interface AssessmentResultPageProps {
  initialResult?: AssessmentResultData | null;
  assessmentId: string;
}

const AssessmentResultPage: React.FC<AssessmentResultPageProps> = ({
  initialResult,
  assessmentId
}) => {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResultData | null>(initialResult || null);
  const [isLoading, setIsLoading] = useState(!initialResult);
  const [error, setError] = useState<string | null>(null);

  // 평가 결과 로드
  const loadAssessmentResult = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/assessment/${id}/result`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('평가 결과를 가져오는데 실패했습니다.');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '평가 결과를 가져오는데 실패했습니다.');
      }

      setResult(data.data);

    } catch (error) {
      console.error('평가 결과 로드 오류:', error);
      setError(error instanceof Error ? error.message : '평가 결과를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드 (초기 데이터가 없는 경우)
  useEffect(() => {
    if (!result && assessmentId) {
      loadAssessmentResult(assessmentId);
    }
  }, [assessmentId, result]);

  // 학습 경로 시작
  const handleStartLearningPath = () => {
    if (result) {
      // 평가 결과를 기반으로 학습 경로 생성 페이지로 이동
      router.push({
        pathname: '/learning-path/create',
        query: {
          fromAssessment: assessmentId,
          level: result.finalLevel
        }
      });
    }
  };

  // 재평가
  const handleRetakeAssessment = () => {
    router.push('/assessment');
  };

  // 결과 다운로드
  const handleDownloadReport = async () => {
    try {
      const response = await fetch(`/api/assessment/${assessmentId}/report`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assessment-report-${assessmentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('리포트 다운로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('리포트 다운로드 오류:', error);
      setError(error instanceof Error ? error.message : '리포트 다운로드 중 오류가 발생했습니다.');
    }
  };

  // 결과 공유
  const handleShareResult = async () => {
    if (!result) return;

    const shareData = {
      title: '헝가리어 레벨 평가 결과',
      text: `제가 헝가리어 레벨 평가에서 ${result.finalLevel} 레벨을 달성했습니다! 정확도: ${Math.round((result.totalScore / result.maxScore) * 100)}%`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // 폴백: 클립보드에 복사
        await navigator.clipboard.writeText(shareData.url);
        alert('결과 링크가 클립보드에 복사되었습니다!');
      }
    } catch (error) {
      console.error('공유 오류:', error);
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
          {result
            ? `평가 결과 - ${result.finalLevel} 레벨`
            : '평가 결과'
          } - 한국인을 위한 헝가리어 학습
        </title>
        <meta
          name="description"
          content={result
            ? `헝가리어 레벨 평가에서 ${result.finalLevel} 레벨을 달성했습니다. 정확도: ${Math.round((result.totalScore / result.maxScore) * 100)}%`
            : '헝가리어 레벨 평가 결과를 확인하세요'
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
                  평가 결과
                  {result && (
                    <span className="ml-2 text-blue-600">
                      {result.finalLevel} 레벨
                    </span>
                  )}
                </h1>
              </div>

              <div className="flex items-center space-x-3">
                {result && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleShareResult}
                      className="flex items-center"
                    >
                      <ShareIcon className="w-4 h-4 mr-2" />
                      공유하기
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleDownloadReport}
                      className="flex items-center"
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      다운로드
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
            <div className="max-w-6xl mx-auto px-4 mb-6">
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
                    평가 결과를 불러오는 중입니다...
                  </div>
                  <div className="text-gray-600 mt-2">
                    상세한 분석 결과를 준비하고 있습니다.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 평가 결과 없음 */}
          {!isLoading && !result && !error && (
            <div className="max-w-4xl mx-auto px-4">
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    평가 결과를 찾을 수 없습니다
                  </div>
                  <div className="text-gray-600 mb-6">
                    요청하신 평가 결과가 존재하지 않거나 접근 권한이 없습니다.
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={() => router.push('/assessment/history')}>
                      평가 기록 보기
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/assessment')}>
                      새 평가 시작
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 평가 결과 컴포넌트 */}
          {result && (
            <AssessmentResult
              result={result}
              onStartLearningPath={handleStartLearningPath}
              onRetakeAssessment={handleRetakeAssessment}
              onDownloadReport={handleDownloadReport}
              onShareResult={handleShareResult}
            />
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

  // 평가 결과 사전 로드 (선택사항)
  try {
    // const result = await fetchAssessmentResult(id, token);
    // return {
    //   props: {
    //     initialResult: result,
    //     assessmentId: id,
    //   },
    // };

    return {
      props: {
        initialResult: null,
        assessmentId: id,
      },
    };
  } catch (error) {
    console.error('서버 사이드 데이터 로드 오류:', error);
    return {
      props: {
        initialResult: null,
        assessmentId: id,
      },
    };
  }
};

export default AssessmentResultPage;