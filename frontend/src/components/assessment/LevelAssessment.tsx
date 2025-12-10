import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Clock,
  Brain,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Volume2,
  RefreshCw,
  Target,
  Award,
  TrendingUp
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// 평가 상태 타입
type AssessmentState = 'ready' | 'in_progress' | 'completed';

// 질문 타입
interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'vocabulary' | 'grammar' | 'listening';
  skill_area: string;
  question_text: string;
  options?: string[];
  audio_url?: string;
  time_limit_seconds: number;
}

// 평가 결과 타입
interface AssessmentResult {
  overall_level: string;
  overall_confidence: number;
  skill_results: {
    skill_area: string;
    estimated_level: string;
    confidence_score: number;
    accuracy_percentage: number;
  }[];
  recommendations: {
    suggested_level: string;
    focus_areas: string[];
    estimated_study_hours_weekly: number;
    target_timeline_months: number;
  };
  korean_interference_analysis: {
    severity: string;
    affected_areas: string[];
    specific_challenges: string[];
  };
}

export default function LevelAssessment() {
  const [assessmentState, setAssessmentState] = useState<AssessmentState>('ready');
  const [sessionId, setSessionId] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null);
  const [progress, setProgress] = useState({ completed: 0, remaining: 15, estimate: 'B1' });
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);

  // 타이머 관리
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeRemaining > 0 && assessmentState === 'in_progress' && !showResult) {
      timer = setTimeout(() => setTimeRemaining(prev => prev - 1), 1000);
    } else if (timeRemaining === 0 && currentQuestion && !showResult) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [timeRemaining, assessmentState, showResult, currentQuestion]);

  // 평가 시작
  const startAssessment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/assessment/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSessionId(data.data.session_id);
        setCurrentQuestion(data.data.first_question);
        setTimeRemaining(data.data.first_question.time_limit_seconds);
        setAssessmentState('in_progress');
        toast({
          title: "평가 시작",
          description: `예상 소요 시간: ${data.data.estimated_duration_minutes}분`
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "평가를 시작할 수 없습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 답안 제출
  const submitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/assessment/${sessionId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          user_answer: selectedAnswer,
          time_taken_seconds: currentQuestion.time_limit_seconds - timeRemaining
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsCorrect(data.data.is_correct);
        setShowResult(true);
        setProgress(data.data.progress);

        setTimeout(() => {
          if (data.data.next_question) {
            setCurrentQuestion(data.data.next_question);
            setTimeRemaining(data.data.next_question.time_limit_seconds);
            setSelectedAnswer('');
            setShowResult(false);
            setIsCorrect(null);
          } else {
            completeAssessment();
          }
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "답안 제출에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 시간 초과 처리
  const handleTimeUp = async () => {
    setSelectedAnswer(''); // 빈 답안으로 처리
    await submitAnswer();
  };

  // 평가 완료
  const completeAssessment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/assessment/${sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAssessmentResult(data.data);
        setAssessmentState('completed');
        toast({
          title: "평가 완료! 🎉",
          description: `당신의 헝가리어 레벨: ${data.data.overall_level}`
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "평가 완료 처리에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 음성 재생
  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  // 평가 재시작
  const restartAssessment = () => {
    setAssessmentState('ready');
    setSessionId('');
    setCurrentQuestion(null);
    setProgress({ completed: 0, remaining: 15, estimate: 'B1' });
    setSelectedAnswer('');
    setShowResult(false);
    setIsCorrect(null);
    setAssessmentResult(null);
  };

  // 레벨 색상 결정
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-green-100 text-green-800';
      case 'A2': return 'bg-blue-100 text-blue-800';
      case 'B1': return 'bg-yellow-100 text-yellow-800';
      case 'B2': return 'bg-orange-100 text-orange-800';
      case 'C1': return 'bg-red-100 text-red-800';
      case 'C2': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 신뢰도 색상
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 평가 시작 상태 */}
      {assessmentState === 'ready' && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">헝가리어 레벨 평가</CardTitle>
            <CardDescription>
              당신의 현재 헝가리어 실력을 정확하게 측정하고 맞춤형 학습 계획을 제안해드립니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium">소요 시간</h3>
                <p className="text-sm text-gray-600">15-25분</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium">평가 영역</h3>
                <p className="text-sm text-gray-600">문법, 어휘, 듣기, 읽기</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-medium">결과</h3>
                <p className="text-sm text-gray-600">CEFR 레벨 인증서</p>
              </div>
            </div>

            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertTitle>적응형 평가 시스템</AlertTitle>
              <AlertDescription>
                AI가 당신의 답변을 분석하여 실시간으로 문제 난이도를 조정합니다.
                정확한 실력 측정을 위해 최선을 다해 답변해주세요.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button
                onClick={startAssessment}
                disabled={loading}
                size="lg"
                className="px-8"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    준비 중...
                  </>
                ) : (
                  <>
                    평가 시작하기
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 평가 진행 상태 */}
      {assessmentState === 'in_progress' && currentQuestion && (
        <div className="space-y-6">
          {/* 진행률 표시 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    문제 {progress.completed + 1}
                  </span>
                  <Badge className={getLevelColor(progress.estimate)}>
                    현재 추정: {progress.estimate}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {timeRemaining}초
                </div>
              </div>
              <Progress
                value={(progress.completed / (progress.completed + progress.remaining)) * 100}
                className="h-2"
              />
            </CardContent>
          </Card>

          {/* 질문 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{currentQuestion.skill_area}</Badge>
                  <Badge variant="outline">{currentQuestion.type}</Badge>
                </div>
                {currentQuestion.audio_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playAudio(currentQuestion.audio_url!)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-lg font-medium">
                {currentQuestion.question_text}
              </div>

              {/* 객관식 선택지 */}
              {currentQuestion.options && (
                <div className="grid gap-2">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(option)}
                      disabled={showResult}
                      className={`p-4 text-left border rounded-lg transition-colors ${
                        selectedAnswer === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${showResult ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* 주관식 입력 (어휘 문제 등) */}
              {currentQuestion.type === 'vocabulary' && !currentQuestion.options && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    disabled={showResult}
                    placeholder="헝가리어로 답을 입력하세요..."
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* 결과 표시 */}
              {showResult && isCorrect !== null && (
                <Alert className={isCorrect ? 'border-green-500' : 'border-red-500'}>
                  {isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle>
                    {isCorrect ? '정답입니다! 🎉' : '틀렸습니다 😅'}
                  </AlertTitle>
                  <AlertDescription>
                    {isCorrect
                      ? '잘하셨습니다!'
                      : '다음 문제에서 더 좋은 결과를 기대합니다!'
                    }
                  </AlertDescription>
                </Alert>
              )}

              {/* 답변 버튼 */}
              {!showResult && (
                <div className="flex justify-end">
                  <Button
                    onClick={submitAnswer}
                    disabled={!selectedAnswer || loading}
                  >
                    {loading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    답변 제출
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 평가 완료 상태 */}
      {assessmentState === 'completed' && assessmentResult && (
        <div className="space-y-6">
          {/* 전체 결과 */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">평가 완료!</CardTitle>
              <CardDescription>
                당신의 헝가리어 실력 분석이 완료되었습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div>
                  <Badge className={`${getLevelColor(assessmentResult.overall_level)} text-xl px-4 py-2`}>
                    {assessmentResult.overall_level} 레벨
                  </Badge>
                </div>
                <div className={`text-lg font-medium ${getConfidenceColor(assessmentResult.overall_confidence)}`}>
                  신뢰도: {assessmentResult.overall_confidence}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 영역별 결과 */}
          <Card>
            <CardHeader>
              <CardTitle>영역별 상세 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {assessmentResult.skill_results.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{skill.skill_area}</Badge>
                      <Badge className={getLevelColor(skill.estimated_level)}>
                        {skill.estimated_level}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">정확도: {skill.accuracy_percentage}%</div>
                      <div className={`text-sm ${getConfidenceColor(skill.confidence_score)}`}>
                        신뢰도: {skill.confidence_score}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 한국어 간섭 분석 */}
          <Card>
            <CardHeader>
              <CardTitle>한국어 간섭 분석</CardTitle>
              <CardDescription>
                한국어가 헝가리어 학습에 미치는 영향을 분석했습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">간섭 정도:</span>
                  <Badge variant={
                    assessmentResult.korean_interference_analysis.severity === 'high' ? 'destructive' :
                    assessmentResult.korean_interference_analysis.severity === 'medium' ? 'secondary' : 'default'
                  }>
                    {assessmentResult.korean_interference_analysis.severity}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">영향받는 영역:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {assessmentResult.korean_interference_analysis.affected_areas.map((area, index) => (
                      <Badge key={index} variant="outline">{area}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium">주요 도전 과제:</span>
                  <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-600">
                    {assessmentResult.korean_interference_analysis.specific_challenges.map((challenge, index) => (
                      <li key={index}>{challenge}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 추천 사항 */}
          <Card>
            <CardHeader>
              <CardTitle>맞춤형 학습 추천</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">권장 학습 계획</h4>
                  <div className="space-y-2 text-sm">
                    <div>목표 레벨: <Badge className={getLevelColor(assessmentResult.recommendations.suggested_level)}>{assessmentResult.recommendations.suggested_level}</Badge></div>
                    <div>주당 학습 시간: <span className="font-medium">{assessmentResult.recommendations.estimated_study_hours_weekly}시간</span></div>
                    <div>예상 달성 기간: <span className="font-medium">{assessmentResult.recommendations.target_timeline_months}개월</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">집중 학습 영역</h4>
                  <div className="flex flex-wrap gap-2">
                    {assessmentResult.recommendations.focus_areas.map((area, index) => (
                      <Badge key={index} variant="secondary">{area}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼들 */}
          <div className="flex gap-4 justify-center">
            <Button onClick={restartAssessment} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 평가하기
            </Button>
            <Button onClick={() => {/* 학습 경로 생성으로 이동 */}}>
              학습 계획 생성하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}