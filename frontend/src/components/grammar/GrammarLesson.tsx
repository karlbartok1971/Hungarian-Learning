import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, XCircle, Lightbulb, Volume2, ArrowRight, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

// 문법 레슨 인터페이스
interface GrammarLessonProps {
  lesson: GrammarLesson;
  onComplete: (lessonId: string, score: number) => void;
  onNext?: () => void;
  className?: string;
}

interface GrammarLesson {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  unit: number;
  lesson: number;
  title: string;
  titleKorean: string;
  category: string;
  difficulty: number;
  estimatedMinutes: number;
  objectives: string[];
  explanation: GrammarExplanation;
  examples: GrammarExample[];
  exercises: GrammarExercise[];
  notes: string[];
  hungarianSpecifics: string[];
}

interface GrammarExplanation {
  korean: string;
  hungarian: string;
  keyPoints: string[];
  rules: GrammarRule[];
  commonMistakes: string[];
}

interface GrammarRule {
  rule: string;
  explanation: string;
  pattern: string;
  exceptions?: string[];
}

interface GrammarExample {
  hungarian: string;
  korean: string;
  romanization?: string;
  breakdown?: WordBreakdown[];
  audioUrl?: string;
}

interface WordBreakdown {
  word: string;
  role: string;
  explanation: string;
}

interface GrammarExercise {
  id: string;
  type: 'fill_blank' | 'multiple_choice' | 'translation' | 'conjugation' | 'declension' | 'word_order';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  hints: string[];
}

// 학습 단계 열거형
enum LearningPhase {
  OVERVIEW = 'overview',
  EXPLANATION = 'explanation',
  EXAMPLES = 'examples',
  EXERCISES = 'exercises',
  SUMMARY = 'summary'
}

const GrammarLesson: React.FC<GrammarLessonProps> = ({
  lesson,
  onComplete,
  onNext,
  className = ''
}) => {
  const [currentPhase, setCurrentPhase] = useState<LearningPhase>(LearningPhase.OVERVIEW);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [exerciseResults, setExerciseResults] = useState<Record<string, boolean>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [lessonProgress, setLessonProgress] = useState(0);

  // 진행률 계산
  useEffect(() => {
    const phaseWeights = {
      [LearningPhase.OVERVIEW]: 10,
      [LearningPhase.EXPLANATION]: 20,
      [LearningPhase.EXAMPLES]: 20,
      [LearningPhase.EXERCISES]: 40,
      [LearningPhase.SUMMARY]: 10
    };

    let progress = 0;
    const phases = Object.keys(phaseWeights) as LearningPhase[];
    const currentIndex = phases.indexOf(currentPhase);

    // 완료된 단계들의 진행률
    for (let i = 0; i < currentIndex; i++) {
      progress += phaseWeights[phases[i]];
    }

    // 현재 단계 내 진행률
    if (currentPhase === LearningPhase.EXERCISES) {
      const exerciseProgress = (currentExercise / lesson.exercises.length) * phaseWeights[currentPhase];
      progress += exerciseProgress;
    } else {
      progress += phaseWeights[currentPhase];
    }

    setLessonProgress(Math.min(progress, 100));
  }, [currentPhase, currentExercise, lesson.exercises.length]);

  // 답안 처리
  const handleAnswerSubmit = (exerciseId: string, answer: string) => {
    const exercise = lesson.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    setUserAnswers(prev => ({ ...prev, [exerciseId]: answer }));

    const isCorrect = Array.isArray(exercise.correctAnswer)
      ? exercise.correctAnswer.some(correct =>
          answer.toLowerCase().trim() === correct.toLowerCase().trim())
      : answer.toLowerCase().trim() === exercise.correctAnswer.toLowerCase().trim();

    setExerciseResults(prev => ({ ...prev, [exerciseId]: isCorrect }));
  };

  // 난이도별 색상
  const getDifficultyColor = (difficulty: number): string => {
    if (difficulty <= 1) return 'bg-green-500';
    if (difficulty <= 2) return 'bg-yellow-500';
    if (difficulty <= 3) return 'bg-orange-500';
    if (difficulty <= 4) return 'bg-red-500';
    return 'bg-purple-500';
  };

  // 오디오 재생
  const playAudio = (audioUrl: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
    }
  };

  // 힌트 토글
  const toggleHint = (exerciseId: string) => {
    setShowHints(prev => ({ ...prev, [exerciseId]: !prev[exerciseId] }));
  };

  // 최종 점수 계산
  const calculateFinalScore = (): number => {
    const correctCount = Object.values(exerciseResults).filter(Boolean).length;
    return Math.round((correctCount / lesson.exercises.length) * 100);
  };

  // 단계별 렌더링
  const renderPhaseContent = () => {
    switch (currentPhase) {
      case LearningPhase.OVERVIEW:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">{lesson.titleKorean}</h2>
              <p className="text-lg text-muted-foreground">{lesson.title}</p>

              <div className="flex items-center justify-center space-x-4">
                <Badge variant="outline" className={getDifficultyColor(lesson.difficulty)}>
                  난이도 {lesson.difficulty}/5
                </Badge>
                <Badge variant="outline">
                  {lesson.estimatedMinutes}분
                </Badge>
                <Badge variant="outline">
                  {lesson.level}
                </Badge>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>학습 목표</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lesson.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={() => setCurrentPhase(LearningPhase.EXPLANATION)}
                size="lg"
              >
                학습 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        );

      case LearningPhase.EXPLANATION:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>문법 설명</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none">
                  <p className="text-lg">{lesson.explanation.korean}</p>
                  <p className="text-muted-foreground italic">{lesson.explanation.hungarian}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">핵심 포인트</h4>
                  <ul className="space-y-1">
                    {lesson.explanation.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">문법 규칙</h4>
                  {lesson.explanation.rules.map((rule, index) => (
                    <Card key={index} className="border-l-4 border-blue-500">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h5 className="font-medium">{rule.rule}</h5>
                          <p className="text-sm text-muted-foreground">{rule.explanation}</p>
                          <div className="bg-muted p-2 rounded font-mono text-sm">
                            {rule.pattern}
                          </div>
                          {rule.exceptions && (
                            <div className="text-sm text-orange-600">
                              <strong>예외:</strong> {rule.exceptions.join(', ')}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {lesson.explanation.commonMistakes.length > 0 && (
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>자주 하는 실수:</strong>
                      <ul className="mt-2 space-y-1">
                        {lesson.explanation.commonMistakes.map((mistake, index) => (
                          <li key={index}>• {mistake}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentPhase(LearningPhase.OVERVIEW)}
              >
                이전
              </Button>
              <Button onClick={() => setCurrentPhase(LearningPhase.EXAMPLES)}>
                예문 보기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        );

      case LearningPhase.EXAMPLES:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">예문으로 이해하기</h3>

            <div className="space-y-4">
              {lesson.examples.map((example, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <p className="text-xl font-bold text-blue-600">
                            {example.hungarian}
                          </p>
                          {example.audioUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => playAudio(example.audioUrl!)}
                            >
                              <Volume2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-lg">{example.korean}</p>
                        {example.romanization && (
                          <p className="text-sm text-muted-foreground italic">
                            [{example.romanization}]
                          </p>
                        )}
                      </div>

                      {example.breakdown && (
                        <div className="space-y-2">
                          <h5 className="font-medium">단어별 분석</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {example.breakdown.map((word, wordIndex) => (
                              <div key={wordIndex} className="bg-muted p-3 rounded">
                                <div className="font-medium">{word.word}</div>
                                <div className="text-sm text-blue-600">{word.role}</div>
                                <div className="text-sm text-muted-foreground">
                                  {word.explanation}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentPhase(LearningPhase.EXPLANATION)}
              >
                이전
              </Button>
              <Button onClick={() => setCurrentPhase(LearningPhase.EXERCISES)}>
                연습 문제 풀기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        );

      case LearningPhase.EXERCISES:
        const exercise = lesson.exercises[currentExercise];
        if (!exercise) return null;

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">연습 문제</h3>
              <Badge variant="outline">
                {currentExercise + 1} / {lesson.exercises.length}
              </Badge>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-lg">{exercise.question}</p>

                  <div className="space-y-3">
                    {exercise.type === 'multiple_choice' && exercise.options ? (
                      <div className="space-y-2">
                        {exercise.options.map((option, index) => (
                          <Button
                            key={index}
                            variant={userAnswers[exercise.id] === option ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => handleAnswerSubmit(exercise.id, option)}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="답을 입력하세요..."
                          value={userAnswers[exercise.id] || ''}
                          onChange={(e) => setUserAnswers(prev => ({
                            ...prev,
                            [exercise.id]: e.target.value
                          }))}
                        />
                        <Button
                          onClick={() => handleAnswerSubmit(exercise.id, userAnswers[exercise.id] || '')}
                          disabled={!userAnswers[exercise.id]?.trim()}
                        >
                          답안 제출
                        </Button>
                      </div>
                    )}
                  </div>

                  {exerciseResults[exercise.id] !== undefined && (
                    <Alert variant={exerciseResults[exercise.id] ? "default" : "destructive"}>
                      {exerciseResults[exercise.id] ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        {exerciseResults[exercise.id] ? "정답입니다!" : "틀렸습니다."}
                        <div className="mt-2">{exercise.explanation}</div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleHint(exercise.id)}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      힌트 {showHints[exercise.id] ? '숨기기' : '보기'}
                    </Button>

                    {showHints[exercise.id] && (
                      <div className="bg-blue-50 p-3 rounded">
                        {exercise.hints.map((hint, index) => (
                          <p key={index} className="text-sm text-blue-700">
                            💡 {hint}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentExercise > 0) {
                    setCurrentExercise(currentExercise - 1);
                  } else {
                    setCurrentPhase(LearningPhase.EXAMPLES);
                  }
                }}
              >
                이전
              </Button>

              <Button
                onClick={() => {
                  if (currentExercise < lesson.exercises.length - 1) {
                    setCurrentExercise(currentExercise + 1);
                  } else {
                    setCurrentPhase(LearningPhase.SUMMARY);
                  }
                }}
                disabled={exerciseResults[exercise.id] === undefined}
              >
                {currentExercise < lesson.exercises.length - 1 ? '다음 문제' : '학습 완료'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        );

      case LearningPhase.SUMMARY:
        const finalScore = calculateFinalScore();

        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">학습 완료!</h3>
              <div className="text-4xl font-bold text-blue-600">
                {finalScore}점
              </div>
              <Progress value={finalScore} className="w-full max-w-md mx-auto" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>학습 요약</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(exerciseResults).filter(Boolean).length}
                    </div>
                    <div className="text-sm text-muted-foreground">정답</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {Object.values(exerciseResults).filter(result => !result).length}
                    </div>
                    <div className="text-sm text-muted-foreground">오답</div>
                  </div>
                </div>

                {lesson.notes.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium">추가 학습 노트</h5>
                    <ul className="space-y-1">
                      {lesson.notes.map((note, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {lesson.hungarianSpecifics.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium">헝가리어 특징</h5>
                    <ul className="space-y-1">
                      {lesson.hungarianSpecifics.map((specific, index) => (
                        <li key={index} className="text-sm text-blue-600">
                          🇭🇺 {specific}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentPhase(LearningPhase.OVERVIEW);
                  setCurrentExercise(0);
                  setUserAnswers({});
                  setExerciseResults({});
                  setShowHints({});
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                다시 학습
              </Button>

              {onNext && (
                <Button
                  onClick={() => {
                    onComplete(lesson.id, finalScore);
                    onNext();
                  }}
                >
                  다음 레슨
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="text-sm text-muted-foreground">
              {lesson.level} Unit {lesson.unit} Lesson {lesson.lesson}
            </span>
          </div>
          <Badge variant="outline">{lesson.category}</Badge>
        </div>

        <Progress value={lessonProgress} className="h-2" />
        <div className="text-right text-sm text-muted-foreground mt-1">
          {Math.round(lessonProgress)}% 완료
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      {renderPhaseContent()}
    </div>
  );
};

export default GrammarLesson;