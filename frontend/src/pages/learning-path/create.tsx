import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  ArrowLeftIcon,
  HomeIcon,
  PlusIcon,
  UserIcon,
  TargetIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from 'lucide-react';

// 학습 경로 생성 폼 데이터
interface CreateLearningPathForm {
  name: string;
  description: string;
  currentLevel: string;
  targetLevel: string;
  learningGoals: string[];
  focusAreas: {
    [key: string]: number; // 1-5 우선순위
  };
  weeklyHours: number;
  sessionLength: number;
  intensity: 'relaxed' | 'moderate' | 'intensive';
  specializations: {
    pastoral: boolean;
    cultural: boolean;
    business: boolean;
    academic: boolean;
  };
}

interface CreateLearningPathPageProps {
  fromAssessment?: string;
  assessmentLevel?: string;
}

const CreateLearningPathPage: React.FC<CreateLearningPathPageProps> = ({
  fromAssessment,
  assessmentLevel
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateLearningPathForm>({
    name: '',
    description: '',
    currentLevel: assessmentLevel || 'A1',
    targetLevel: 'B2',
    learningGoals: [],
    focusAreas: {
      grammar: 3,
      vocabulary: 3,
      pronunciation: 3,
      cultural: 3,
      writing: 3,
      listening: 3
    },
    weeklyHours: 8,
    sessionLength: 60,
    intensity: 'moderate',
    specializations: {
      pastoral: true, // 기본적으로 목회자 특화 활성화
      cultural: true,
      business: false,
      academic: false
    }
  });

  const levels = ['A1', 'A2', 'B1', 'B2'];
  const intensityLabels = {
    relaxed: { label: '여유로운', desc: '천천히 꾸준히', color: 'bg-green-500' },
    moderate: { label: '보통', desc: '적당한 페이스', color: 'bg-yellow-500' },
    intensive: { label: '집중적', desc: '빠른 진도', color: 'bg-red-500' }
  };

  const learningGoals = [
    { id: 'conversation', label: '일상 대화 능력' },
    { id: 'sermon_writing', label: '설교문 작성 능력' },
    { id: 'reading_comprehension', label: '읽기 이해력' },
    { id: 'pronunciation', label: '정확한 발음' },
    { id: 'cultural_adaptation', label: '문화적 적응' },
    { id: 'professional_communication', label: '전문적 의사소통' },
    { id: 'liturgical_language', label: '예배 언어 이해' },
    { id: 'biblical_vocabulary', label: '성경 어휘 습득' }
  ];

  const focusAreaLabels = {
    grammar: '문법',
    vocabulary: '어휘',
    pronunciation: '발음',
    cultural: '문화',
    writing: '작문',
    listening: '청취'
  };

  // 평가에서 온 경우 자동 설정
  useEffect(() => {
    if (fromAssessment && assessmentLevel) {
      const targetLevel = assessmentLevel === 'A1' ? 'A2' :
                         assessmentLevel === 'A2' ? 'B1' :
                         assessmentLevel === 'B1' ? 'B2' : 'C1';

      setFormData(prev => ({
        ...prev,
        name: `${assessmentLevel}에서 ${targetLevel}로 - 목회자 특화 과정`,
        description: '평가 결과를 바탕으로 생성된 개인화된 헝가리어 학습 경로입니다.',
        currentLevel: assessmentLevel,
        targetLevel,
        learningGoals: ['sermon_writing', 'cultural_adaptation', 'liturgical_language']
      }));
    }
  }, [fromAssessment, assessmentLevel]);

  const updateFormData = (field: keyof CreateLearningPathForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFocusArea = (area: string, priority: number) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: { ...prev.focusAreas, [area]: priority }
    }));
  };

  const toggleLearningGoal = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      learningGoals: prev.learningGoals.includes(goalId)
        ? prev.learningGoals.filter(id => id !== goalId)
        : [...prev.learningGoals, goalId]
    }));
  };

  const toggleSpecialization = (spec: keyof CreateLearningPathForm['specializations']) => {
    setFormData(prev => ({
      ...prev,
      specializations: {
        ...prev.specializations,
        [spec]: !prev.specializations[spec]
      }
    }));
  };

  // 학습 경로 생성
  const handleCreateLearningPath = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/learning-path/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userProfile: {
            currentLevel: formData.currentLevel,
            targetLevel: formData.targetLevel,
            learningGoals: formData.learningGoals,
            weeklyStudyTime: formData.weeklyHours,
            sessionPreference: formData.sessionLength,
            specialNeeds: Object.keys(formData.specializations).filter(key =>
              formData.specializations[key as keyof typeof formData.specializations]
            )
          },
          assessmentResult: fromAssessment ? {
            sessionId: fromAssessment,
            finalLevel: formData.currentLevel,
            focusAreas: Object.keys(formData.focusAreas).filter(area =>
              formData.focusAreas[area] >= 4
            )
          } : null,
          customization: {
            name: formData.name,
            description: formData.description,
            focusAreas: formData.focusAreas,
            intensity: formData.intensity
          }
        })
      });

      if (!response.ok) {
        throw new Error('학습 경로 생성에 실패했습니다.');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '학습 경로 생성에 실패했습니다.');
      }

      // 생성된 학습 경로로 이동
      router.push({
        pathname: '/learning-path',
        query: { created: 'true', pathId: data.data.pathId }
      });

    } catch (error) {
      console.error('학습 경로 생성 오류:', error);
      setError(error instanceof Error ? error.message : '학습 경로 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.currentLevel && formData.targetLevel;
      case 2:
        return formData.learningGoals.length > 0;
      case 3:
        return true; // 우선순위는 선택사항
      case 4:
        return formData.weeklyHours > 0 && formData.sessionLength > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">학습 경로 이름 *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="예: 김목사님의 헝가리어 목회 과정"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">설명</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="이 학습 경로에 대한 간단한 설명을 입력하세요..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">현재 레벨 *</label>
                  <Select value={formData.currentLevel} onValueChange={(value) => updateFormData('currentLevel', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">목표 레벨 *</label>
                  <Select value={formData.targetLevel} onValueChange={(value) => updateFormData('targetLevel', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {fromAssessment && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center text-blue-800">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    <span className="font-medium">평가 기반 추천</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    최근 레벨 평가 결과를 바탕으로 설정이 자동으로 구성되었습니다.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TargetIcon className="w-5 h-5 mr-2" />
                학습 목표 선택
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                달성하고 싶은 학습 목표를 선택하세요. (복수 선택 가능)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {learningGoals.map(goal => (
                  <div
                    key={goal.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.learningGoals.includes(goal.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleLearningGoal(goal.id)}
                  >
                    <Checkbox
                      checked={formData.learningGoals.includes(goal.id)}
                      onChange={() => {}} // onClick 핸들러가 처리
                    />
                    <span className="font-medium">{goal.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">특화 영역</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(formData.specializations).map(([spec, enabled]) => (
                    <div
                      key={spec}
                      className={`flex items-center space-x-2 p-2 rounded border cursor-pointer ${
                        enabled ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}
                      onClick={() => toggleSpecialization(spec as any)}
                    >
                      <Checkbox checked={enabled} onChange={() => {}} />
                      <span className="text-sm">
                        {spec === 'pastoral' ? '목회자' :
                         spec === 'cultural' ? '문화' :
                         spec === 'business' ? '비즈니스' : '학술'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpenIcon className="w-5 h-5 mr-2" />
                학습 영역 우선순위
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-gray-600">
                각 영역의 중요도를 1(낮음)부터 5(높음)까지 설정하세요.
              </p>

              {Object.entries(formData.focusAreas).map(([area, priority]) => (
                <div key={area} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{focusAreaLabels[area as keyof typeof focusAreaLabels]}</span>
                    <Badge variant="outline">우선순위 {priority}</Badge>
                  </div>
                  <Slider
                    value={[priority]}
                    onValueChange={(value) => updateFocusArea(area, value[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>낮음</span>
                    <span>보통</span>
                    <span>높음</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                학습 일정 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">주간 학습 시간</label>
                  <Slider
                    value={[formData.weeklyHours]}
                    onValueChange={(value) => updateFormData('weeklyHours', value[0])}
                    min={2}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600">
                    주 {formData.weeklyHours}시간
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">한 세션 길이</label>
                  <Slider
                    value={[formData.sessionLength]}
                    onValueChange={(value) => updateFormData('sessionLength', value[0])}
                    min={15}
                    max={120}
                    step={15}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600">
                    {formData.sessionLength}분
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">학습 강도</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(intensityLabels).map(([key, config]) => (
                      <div
                        key={key}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.intensity === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateFormData('intensity', key)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${config.color}`}></div>
                          <div>
                            <div className="font-medium">{config.label}</div>
                            <div className="text-sm text-gray-600">{config.desc}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>설정 확인</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{formData.name}</h4>
                  <p className="text-gray-600">{formData.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">현재 레벨:</span>
                    <Badge className="ml-2">{formData.currentLevel}</Badge>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">목표 레벨:</span>
                    <Badge className="ml-2">{formData.targetLevel}</Badge>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-600">학습 목표:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.learningGoals.map(goalId => {
                      const goal = learningGoals.find(g => g.id === goalId);
                      return goal ? (
                        <Badge key={goalId} variant="outline">{goal.label}</Badge>
                      ) : null;
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">주간 시간:</span>
                    <div className="font-semibold">{formData.weeklyHours}시간</div>
                  </div>
                  <div>
                    <span className="text-gray-600">세션 길이:</span>
                    <div className="font-semibold">{formData.sessionLength}분</div>
                  </div>
                  <div>
                    <span className="text-gray-600">학습 강도:</span>
                    <div className="font-semibold">
                      {intensityLabels[formData.intensity].label}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">
                    예상 완료 시간
                  </h5>
                  <p className="text-blue-700">
                    현재 설정으로 약 {Math.ceil((levels.indexOf(formData.targetLevel) - levels.indexOf(formData.currentLevel)) * 12 * (8 / formData.weeklyHours))}주 소요 예상
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>새 학습 경로 만들기 - 한국인을 위한 헝가리어 학습</title>
        <meta name="description" content="개인화된 헝가리어 학습 경로를 생성하세요" />
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
                  새 학습 경로 만들기
                </h1>
              </div>

              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="flex items-center"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </div>
          </div>
        </div>

        {/* 진행 단계 표시 */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`flex items-center ${step < 5 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 5 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>기본정보</span>
              <span>학습목표</span>
              <span>우선순위</span>
              <span>학습일정</span>
              <span>최종확인</span>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <main className="py-8">
          <div className="max-w-4xl mx-auto px-4">
            {/* 오류 메시지 */}
            {error && (
              <Card className="border-red-200 bg-red-50 mb-6">
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
            )}

            {/* 단계별 폼 */}
            <div className="space-y-6">
              {renderStep()}

              {/* 네비게이션 버튼 */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  이전
                </Button>

                <div className="flex space-x-4">
                  {currentStep < 5 ? (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={!canProceedToNext()}
                    >
                      다음
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCreateLearningPath}
                      disabled={isLoading}
                      className="px-8"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          생성 중...
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-4 h-4 mr-2" />
                          학습 경로 생성
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

// 서버 사이드 렌더링
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { fromAssessment, level } = context.query;

  return {
    props: {
      fromAssessment: fromAssessment || null,
      assessmentLevel: level || null,
    },
  };
};

export default CreateLearningPathPage;