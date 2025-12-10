'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  VolumeXIcon,
  Volume2Icon,
  ClockIcon,
  ChevronRightIcon,
  MicIcon,
  BookOpenIcon,
  LanguagesIcon,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

import {
  validateAnswer,
  createAutoSaveDebounce,
  calculateProgress
} from '@/lib/assessmentValidation';
import {
  useAssessmentActions,
  useAssessmentValidation
} from '@/stores/assessmentStore';

export interface AssessmentQuestionData {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'audio_recognition' | 'cultural_context' | 'essay' | 'listening' | 'speaking' | 'translation';
  level: string;
  category: 'grammar' | 'vocabulary' | 'pronunciation' | 'cultural' | 'writing' | 'listening' | 'speaking';
  question: string;
  options?: string[];
  correctAnswer?: string | number | string[];
  audioUrl?: string;
  context?: string;
  hint?: string;
  pastoralContext?: boolean;
}

interface AssessmentQuestionProps {
  question: AssessmentQuestionData;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  timeRemaining?: number;
  isLoading?: boolean;
  onValidationError?: (error: string) => void;
}

export const AssessmentQuestion: React.FC<AssessmentQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  timeRemaining,
  isLoading = false,
  onValidationError
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [localValidationError, setLocalValidationError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const actions = useAssessmentActions();
  const validationErrors = useAssessmentValidation();

  const { percentage: progress, timeEstimate } = calculateProgress(questionNumber, totalQuestions);
  const currentValidationError = validationErrors[question.id] || localValidationError;

  const categoryIcons = {
    grammar: <BookOpenIcon className="w-4 h-4" />,
    vocabulary: <LanguagesIcon className="w-4 h-4" />,
    pronunciation: <MicIcon className="w-4 h-4" />,
    cultural: <VolumeXIcon className="w-4 h-4" />,
    writing: <BookOpenIcon className="w-4 h-4" />,
    listening: <Volume2Icon className="w-4 h-4" />,
    speaking: <MicIcon className="w-4 h-4" />
  };

  const categoryColors = {
    grammar: 'bg-blue-500',
    vocabulary: 'bg-green-500',
    pronunciation: 'bg-purple-500',
    cultural: 'bg-orange-500',
    writing: 'bg-red-500',
    listening: 'bg-teal-500',
    speaking: 'bg-indigo-500'
  };

  const categoryNames = {
    grammar: '문법',
    vocabulary: '어휘',
    pronunciation: '발음',
    cultural: '문화',
    writing: '작문',
    listening: '청취',
    speaking: '회화'
  };

  // 오디오 재생 함수
  const playAudio = () => {
    if (question.audioUrl) {
      setIsAudioPlaying(true);
      const audio = new Audio(question.audioUrl);
      audio.play();
      audio.onended = () => setIsAudioPlaying(false);
    }
  };

  // 자동 저장 디바운스 함수
  const autoSave = createAutoSaveDebounce((questionId: string, answer: string) => {
    actions.saveAnswer(questionId, answer);
    setIsSaving(false);
  }, 1000);

  // 답변 변경 처리
  const handleAnswerChange = (answer: string) => {
    setSelectedAnswer(answer);
    setLocalValidationError('');
    actions.clearValidationError(question.id);

    // 자동 저장
    setIsSaving(true);
    autoSave(question.id, answer);
  };

  // 실시간 검증
  const performValidation = (answer: string) => {
    const validation = validateAnswer({
      id: question.id,
      type: question.type,
      level: question.level,
      category: question.category,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      audioUrl: question.audioUrl,
      context: question.context,
      hint: question.hint,
      pastoralContext: question.pastoralContext
    } as any, answer);

    if (!validation.isValid && validation.error) {
      setLocalValidationError(validation.error);
      onValidationError?.(validation.error);
      return false;
    }

    setLocalValidationError('');
    return true;
  };

  // 답변 제출
  const handleSubmitAnswer = () => {
    if (!selectedAnswer.trim()) {
      setLocalValidationError('답변을 입력해주세요.');
      return;
    }

    if (performValidation(selectedAnswer)) {
      onAnswer(selectedAnswer);
      onNext();
    }
  };

  // 객관식 선택
  const handleOptionSelect = (option: string) => {
    handleAnswerChange(option);
  };

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 컴포넌트별 렌더링
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-blue-300 ${
                  selectedAnswer === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
                onClick={() => handleOptionSelect(option)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === option
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswer === option && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-lg">{option}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'fill_blank':
        return (
          <div className="space-y-4">
            <div className="text-lg leading-relaxed">
              {question.question.split('___').map((part, index, array) => (
                <React.Fragment key={index}>
                  <span>{part}</span>
                  {index < array.length - 1 && (
                    <Input
                      className="inline-block w-32 mx-2"
                      value={selectedAnswer}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="답 입력"
                      onBlur={() => performValidation(selectedAnswer)}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        );

      case 'audio_recognition':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Button
                onClick={playAudio}
                disabled={isAudioPlaying}
                size="lg"
                variant={isAudioPlaying ? "secondary" : "default"}
                className="px-8 py-6"
              >
                {isAudioPlaying ? (
                  <>
                    <Volume2Icon className="w-6 h-6 mr-2 animate-pulse" />
                    재생 중...
                  </>
                ) : (
                  <>
                    <VolumeXIcon className="w-6 h-6 mr-2" />
                    오디오 재생
                  </>
                )}
              </Button>
            </div>

            <Input
              value={selectedAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="들은 내용을 입력하세요"
              className="text-lg"
              onBlur={() => performValidation(selectedAnswer)}
            />
          </div>
        );

      case 'cultural_context':
        return (
          <div className="space-y-4">
            {question.context && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">상황 설명</h4>
                <p className="text-gray-700">{question.context}</p>
              </div>
            )}

            <Textarea
              value={selectedAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="상황에 맞는 적절한 표현을 입력하세요"
              className="min-h-32"
              onBlur={() => performValidation(selectedAnswer)}
            />
          </div>
        );

      case 'essay':
        return (
          <div className="space-y-4">
            <Textarea
              value={selectedAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="자세한 답변을 작성하세요"
              className="min-h-40"
              onBlur={() => performValidation(selectedAnswer)}
            />
            <div className="text-sm text-gray-500 text-right">
              {selectedAnswer.length} 글자
            </div>
          </div>
        );

      case 'listening':
      case 'speaking':
      case 'translation':
        return (
          <div className="space-y-4">
            <Textarea
              value={selectedAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={question.type === 'listening' ? '들은 내용을 입력하세요' :
                           question.type === 'speaking' ? '발음 연습 결과를 입력하세요' :
                           '번역 결과를 입력하세요'}
              className="min-h-32"
              onBlur={() => performValidation(selectedAnswer)}
            />
          </div>
        );

      default:
        return <div>지원하지 않는 문제 형식입니다.</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 진행률 헤더 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {questionNumber} / {totalQuestions}
            </Badge>
            <Badge className={`text-white ${categoryColors[question.category]}`}>
              {categoryIcons[question.category]}
              <span className="ml-2">{categoryNames[question.category]}</span>
            </Badge>
            <Badge variant="outline">
              {question.level}
            </Badge>
            {question.pastoralContext && (
              <Badge variant="secondary">
                목회자 특화
              </Badge>
            )}
          </div>

          {timeRemaining && (
            <div className="flex items-center space-x-2 text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span className="font-mono text-lg">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        <Progress value={progress} className="h-2" />
      </div>

      {/* 문제 카드 */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">
            {question.question}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderQuestionContent()}

          {/* 힌트 */}
          {question.hint && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(!showHint)}
              >
                💡 힌트 {showHint ? '숨기기' : '보기'}
              </Button>

              {showHint && (
                <div className="mt-2 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-yellow-800">{question.hint}</p>
                </div>
              )}
            </div>
          )}

          {/* 검증 에러 또는 성공 메시지 */}
          {currentValidationError && (
            <Alert className="border-red-200 bg-red-50 mt-4">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {currentValidationError}
              </AlertDescription>
            </Alert>
          )}

          {selectedAnswer && !currentValidationError && (
            <Alert className="border-green-200 bg-green-50 mt-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                답변이 올바르게 입력되었습니다.
                {isSaving && (
                  <span className="ml-2 text-xs text-gray-500">자동 저장 중...</span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 답변 제출 버튼 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {question.type === 'essay'
            ? '최소 50글자 이상 작성해주세요'
            : '답변을 선택하거나 입력해주세요'
          }
        </div>

        <Button
          onClick={handleSubmitAnswer}
          disabled={!selectedAnswer.trim() || isLoading || !!currentValidationError}
          size="lg"
          className="px-8"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              처리 중...
            </>
          ) : questionNumber === totalQuestions ? (
            '평가 완료'
          ) : (
            <>
              다음 문제
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* 진행 상황 */}
      <Card className="bg-gray-50">
        <CardContent className="pt-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>진행률: {progress}%</span>
            <span>남은 문제: {totalQuestions - questionNumber}개 (예상 {timeEstimate}분)</span>
          </div>
          {isSaving && (
            <div className="mt-2 text-xs text-blue-600">
              💾 답변 자동 저장 중...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentQuestion;