import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { LearningPathCustomizer, LearningPathCustomization } from '@/components/learning-path';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, HomeIcon, SaveIcon } from 'lucide-react';

interface LearningPathCustomizePageProps {
  initialSettings?: LearningPathCustomization | null;
  pathId: string;
}

const LearningPathCustomizePage: React.FC<LearningPathCustomizePageProps> = ({
  initialSettings,
  pathId
}) => {
  const router = useRouter();
  const [settings, setSettings] = useState<LearningPathCustomization | null>(initialSettings || null);
  const [isLoading, setIsLoading] = useState(!initialSettings);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 현재 설정 로드
  const loadCurrentSettings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/learning-path/${pathId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('학습 경로 설정을 가져오는데 실패했습니다.');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '학습 경로 설정을 가져오는데 실패했습니다.');
      }

      // API 응답을 커스터마이징 형태로 변환
      const pathData = data.data;
      const currentSettings: LearningPathCustomization = {
        studySchedule: {
          weeklyHours: pathData.statistics?.weeklyGoal || 8,
          preferredTimes: ['저녁'], // 기본값
          intensity: 'moderate',
          sessionLength: pathData.statistics?.averageSessionLength || 60
        },
        preferences: {
          focusOnPronunciation: true,
          emphasizeSermonWriting: pathData.pastoralProgress ? true : false,
          culturalContexts: true,
          includeGames: false,
          audioLearning: true,
          visualLearning: true,
          practiceWriting: true
        },
        goals: {
          primaryGoal: 'sermon_writing',
          targetDate: '',
          specificNeeds: ['church_vocabulary', 'formal_writing'],
          motivations: ['목회 사역', '문화 적응']
        },
        focusAreas: {
          grammar: 3,
          vocabulary: 4,
          pronunciation: 3,
          cultural: 4,
          writing: 5,
          listening: 3
        },
        adaptiveSettings: {
          difficultyAdjustment: 'automatic',
          reviewFrequency: 'medium',
          challengeLevel: 5,
          allowSkipping: false
        },
        pastoralSpecialization: {
          sermonWritingFocus: true,
          liturgicalLanguage: true,
          biblicalVocabulary: true,
          churchCultureEmphasis: true,
          congregationInteraction: false
        }
      };

      setSettings(currentSettings);

    } catch (error) {
      console.error('설정 로드 오류:', error);
      setError(error instanceof Error ? error.message : '설정을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (!settings && pathId) {
      loadCurrentSettings();
    }
  }, [pathId, settings]);

  // 설정 저장
  const handleSaveSettings = async (newSettings: LearningPathCustomization) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/learning-path/${pathId}/customize`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          studySchedule: newSettings.studySchedule,
          preferences: newSettings.preferences,
          goals: newSettings.goals,
          focusAreas: newSettings.focusAreas
        })
      });

      if (!response.ok) {
        throw new Error('설정 저장에 실패했습니다.');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '설정 저장에 실패했습니다.');
      }

      setSettings(newSettings);

      // 성공 메시지와 함께 상세 페이지로 이동
      router.push({
        pathname: `/learning-path/${pathId}`,
        query: { updated: 'true' }
      });

    } catch (error) {
      console.error('설정 저장 오류:', error);
      setError(error instanceof Error ? error.message : '설정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 설정 리셋
  const handleResetSettings = async () => {
    if (confirm('정말로 설정을 기본값으로 되돌리시겠습니까?')) {
      await loadCurrentSettings();
    }
  };

  // 설정 미리보기
  const handlePreviewSettings = (newSettings: LearningPathCustomization) => {
    // 미리보기 모달이나 별도 페이지에서 보여줄 수 있음
    console.log('미리보기 설정:', newSettings);
    alert('설정 변경 사항이 적용될 예상 효과를 확인하는 기능입니다.');
  };

  // 홈으로 돌아가기
  const handleGoHome = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <Head>
        <title>학습 경로 설정 - 한국인을 위한 헝가리어 학습</title>
        <meta name="description" content="개인화된 학습 설정으로 더 효과적인 헝가리어 학습을 경험하세요" />
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
                  학습 경로 설정
                </h1>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/learning-path/${pathId}`)}
                  className="flex items-center"
                >
                  학습 경로로 돌아가기
                </Button>

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

          {/* 성공 메시지 (쿼리 파라미터 기반) */}
          {router.query.saved && (
            <div className="max-w-6xl mx-auto px-4 mb-6">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between text-green-800">
                    <div className="text-sm">
                      <strong>성공:</strong> 설정이 성공적으로 저장되었습니다!
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const { saved, ...query } = router.query;
                        router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
                      }}
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
                    현재 설정을 불러오는 중입니다...
                  </div>
                  <div className="text-gray-600 mt-2">
                    개인화된 설정을 준비하고 있습니다.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 설정 없음 */}
          {!isLoading && !settings && !error && (
            <div className="max-w-4xl mx-auto px-4">
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    설정을 불러올 수 없습니다
                  </div>
                  <div className="text-gray-600 mb-6">
                    학습 경로 설정을 가져오는데 문제가 발생했습니다.
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={loadCurrentSettings}>
                      다시 시도
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/learning-path/${pathId}`)}>
                      학습 경로로 돌아가기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 커스터마이저 컴포넌트 */}
          {settings && (
            <LearningPathCustomizer
              currentSettings={settings}
              pathId={pathId}
              onSave={handleSaveSettings}
              onReset={handleResetSettings}
              onPreview={handlePreviewSettings}
              isLoading={isSaving}
            />
          )}

          {/* 추가 도움말 */}
          {settings && (
            <div className="max-w-6xl mx-auto px-4 mt-8">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-blue-900 mb-2">💡 설정 팁</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• <strong>학습 강도:</strong> 무리하지 않는 범위에서 꾸준히 할 수 있는 수준으로 설정하세요.</p>
                    <p>• <strong>우선순위:</strong> 목회 사역에 필요한 영역(작문, 어휘)에 높은 우선순위를 두는 것이 좋습니다.</p>
                    <p>• <strong>목회자 특화:</strong> 설교문 작성과 예배 언어는 실제 사역에 직접적으로 도움이 됩니다.</p>
                    <p>• <strong>적응형 설정:</strong> 자동 난이도 조정을 활용하면 개인 수준에 맞는 학습이 가능합니다.</p>
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

  // 현재 설정 사전 로드 (선택사항)
  try {
    // const settings = await fetchLearningPathSettings(id, token);
    // return {
    //   props: {
    //     initialSettings: settings,
    //     pathId: id,
    //   },
    // };

    return {
      props: {
        initialSettings: null,
        pathId: id,
      },
    };
  } catch (error) {
    console.error('서버 사이드 데이터 로드 오류:', error);
    return {
      props: {
        initialSettings: null,
        pathId: id,
      },
    };
  }
};

export default LearningPathCustomizePage;