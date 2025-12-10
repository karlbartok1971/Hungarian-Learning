import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Volume2,
  Heart,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Target,
  Trophy,
  Clock,
  Lightbulb
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TheologicalTerm {
  id: string;
  hungarian_term: string;
  korean_translation: string;
  category: string;
  difficulty_level: 'A1' | 'A2' | 'B1' | 'B2';
  definition_hungarian: string;
  definition_korean: string;
  usage_examples: string[];
  biblical_references: string[];
  pronunciation_guide: string;
  related_terms: string[];
  synonyms: string[];
  is_favorite: boolean;
}

interface LearningSession {
  id: string;
  session_type: 'recognition' | 'translation' | 'usage' | 'quiz' | 'writing' | 'listening';
  target_level: string;
  target_categories: string[];
  terms_studied: string[];
  correct_answers: number;
  total_questions: number;
  duration_seconds: number;
  started_at: string;
}

interface QuizQuestion {
  id: string;
  type: 'recognition' | 'translation' | 'multiple_choice' | 'fill_blank';
  question: string;
  options?: string[];
  correct_answer: string;
  term: TheologicalTerm;
  context?: string;
}

export default function TheologicalTermLearning() {
  const [activeMode, setActiveMode] = useState<'browse' | 'quiz' | 'favorites' | 'progress'>('browse');
  const [terms, setTerms] = useState<TheologicalTerm[]>([]);
  const [favorites, setFavorites] = useState<TheologicalTerm[]>([]);
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [loading, setLoading] = useState(false);

  // 신학 용어 검색 및 로드
  const loadTerms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('query', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedLevel !== 'all') params.append('difficulty_level', selectedLevel);

      const response = await fetch(`/api/theological-terms/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTerms(data.data.terms);
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "신학 용어를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 즐겨찾기 토글
  const toggleFavorite = async (termId: string) => {
    try {
      const response = await fetch(`/api/theological-terms/${termId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        await loadTerms();
        await loadFavorites();
        toast({
          title: "성공",
          description: "즐겨찾기가 업데이트되었습니다.",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "즐겨찾기 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 즐겨찾기 목록 로드
  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/theological-terms/favorites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.data.favorites);
      }
    } catch (error) {
      console.error('즐겨찾기 로드 실패:', error);
    }
  };

  // 퀴즈 세션 시작
  const startQuizSession = async (sessionType: 'recognition' | 'translation' | 'usage' | 'quiz') => {
    try {
      const response = await fetch('/api/theological-terms/session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          session_type: sessionType,
          target_level: selectedLevel !== 'all' ? selectedLevel : undefined,
          target_categories: selectedCategory !== 'all' ? [selectedCategory] : undefined,
          planned_duration_minutes: 15,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.data.session);
        await generateQuizQuestions(sessionType);
        setActiveMode('quiz');
        setCurrentQuestionIndex(0);
        setShowResult(false);
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "퀴즈 세션을 시작할 수 없습니다.",
        variant: "destructive",
      });
    }
  };

  // 퀴즈 문제 생성
  const generateQuizQuestions = async (sessionType: string) => {
    try {
      const response = await fetch(`/api/theological-terms/random?count=10&difficulty=${selectedLevel}&category=${selectedCategory}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const questions: QuizQuestion[] = data.data.terms.map((term: TheologicalTerm, index: number) => ({
          id: `q${index}`,
          type: sessionType === 'recognition' ? 'recognition' : 'translation',
          question: sessionType === 'recognition'
            ? `다음 헝가리어 단어의 뜻은 무엇인가요?`
            : `다음 한국어를 헝가리어로 번역하세요:`,
          correct_answer: sessionType === 'recognition' ? term.korean_translation : term.hungarian_term,
          term,
          context: sessionType === 'recognition' ? term.hungarian_term : term.korean_translation,
        }));
        setQuizQuestions(questions);
      }
    } catch (error) {
      console.error('퀴즈 문제 생성 실패:', error);
    }
  };

  // 답안 제출
  const submitAnswer = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const correct = userAnswer.trim().toLowerCase() === currentQuestion.correct_answer.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);

    // 진도 기록
    recordProgress(currentQuestion.term.id, correct);

    if (correct) {
      toast({
        title: "정답! 🎉",
        description: "잘하셨습니다!",
      });
    } else {
      toast({
        title: "틀렸습니다",
        description: `정답: ${currentQuestion.correct_answer}`,
        variant: "destructive",
      });
    }
  };

  // 다음 문제
  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setShowResult(false);
    } else {
      completeSession();
    }
  };

  // 세션 완료
  const completeSession = async () => {
    if (!currentSession) return;

    try {
      const correctCount = quizQuestions.filter((_, idx) => idx <= currentQuestionIndex).length; // 임시 계산
      await fetch(`/api/theological-terms/session/${currentSession.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          correct_count: correctCount,
          total_count: quizQuestions.length,
          duration_seconds: Math.floor((Date.now() - new Date(currentSession.started_at).getTime()) / 1000),
          questions: quizQuestions.map(q => q.term.id),
          performance_metrics: {},
        }),
      });

      setCurrentSession(null);
      setActiveMode('progress');
      toast({
        title: "세션 완료! 🎊",
        description: "훌륭한 학습이었습니다!",
      });
    } catch (error) {
      console.error('세션 완료 실패:', error);
    }
  };

  // 진도 기록
  const recordProgress = async (termId: string, correct: boolean) => {
    try {
      await fetch('/api/theological-terms/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          term_id: termId,
          correct,
          response_time_ms: 5000, // 실제 응답 시간 계산 필요
          difficulty_perceived: 3,
          context: 'quiz',
        }),
      });
    } catch (error) {
      console.error('진도 기록 실패:', error);
    }
  };

  // 발음 재생
  const playPronunciation = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hu-HU';
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    loadTerms();
    loadFavorites();
  }, [searchTerm, selectedCategory, selectedLevel]);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-green-100 text-green-800';
      case 'A2': return 'bg-blue-100 text-blue-800';
      case 'B1': return 'bg-yellow-100 text-yellow-800';
      case 'B2': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeMode} onValueChange={(value: any) => setActiveMode(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">용어 탐색</TabsTrigger>
          <TabsTrigger value="quiz">퀴즈</TabsTrigger>
          <TabsTrigger value="favorites">즐겨찾기</TabsTrigger>
          <TabsTrigger value="progress">학습 진도</TabsTrigger>
        </TabsList>

        {/* 용어 탐색 */}
        <TabsContent value="browse">
          <Card>
            <CardHeader>
              <CardTitle>신학 용어 사전</CardTitle>
              <CardDescription>헝가리어 신학 용어를 검색하고 학습하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 검색 필터 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="용어 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="all">모든 카테고리</option>
                  <option value="salvation">구원론</option>
                  <option value="christology">기독론</option>
                  <option value="pneumatology">성령론</option>
                  <option value="ecclesiology">교회론</option>
                  <option value="eschatology">종말론</option>
                </select>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="all">모든 레벨</option>
                  <option value="A1">A1 (초급)</option>
                  <option value="A2">A2 (초중급)</option>
                  <option value="B1">B1 (중급)</option>
                  <option value="B2">B2 (중고급)</option>
                </select>
              </div>

              {/* 용어 목록 */}
              <div className="grid gap-4">
                {terms.map((term) => (
                  <Card key={term.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium">{term.hungarian_term}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playPronunciation(term.hungarian_term)}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <Badge className={getDifficultyColor(term.difficulty_level)}>
                            {term.difficulty_level}
                          </Badge>
                          <Badge variant="outline">{term.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{term.korean_translation}</p>
                        <p className="text-xs text-gray-500 mb-2">{term.definition_korean}</p>
                        {term.usage_examples.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-gray-700">사용 예:</p>
                            <p className="text-xs text-gray-600">{term.usage_examples[0]}</p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(term.id)}
                      >
                        <Heart
                          className={`h-4 w-4 ${term.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                        />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 퀴즈 모드 */}
        <TabsContent value="quiz">
          {!currentSession ? (
            <Card>
              <CardHeader>
                <CardTitle>학습 퀴즈</CardTitle>
                <CardDescription>신학 용어 학습을 위한 다양한 퀴즈를 선택하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => startQuizSession('recognition')}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Target className="h-6 w-6" />
                    <span>단어 인식</span>
                  </Button>
                  <Button
                    onClick={() => startQuizSession('translation')}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <BookOpen className="h-6 w-6" />
                    <span>번역 연습</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>퀴즈 진행 중</CardTitle>
                  <div className="text-sm text-gray-600">
                    {currentQuestionIndex + 1} / {quizQuestions.length}
                  </div>
                </div>
                <Progress
                  value={(currentQuestionIndex / quizQuestions.length) * 100}
                  className="w-full"
                />
              </CardHeader>
              <CardContent>
                {quizQuestions.length > 0 && currentQuestionIndex < quizQuestions.length && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">
                        {quizQuestions[currentQuestionIndex].question}
                      </h3>
                      <div className="text-xl font-bold text-blue-600 mb-4">
                        {quizQuestions[currentQuestionIndex].context}
                      </div>
                    </div>

                    {!showResult ? (
                      <div className="space-y-4">
                        <Input
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="답을 입력하세요..."
                          onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                        />
                        <Button
                          onClick={submitAnswer}
                          disabled={!userAnswer.trim()}
                          className="w-full"
                        >
                          답안 제출
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4 text-center">
                        <div className={`flex items-center justify-center gap-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {isCorrect ? (
                            <CheckCircle2 className="h-8 w-8" />
                          ) : (
                            <XCircle className="h-8 w-8" />
                          )}
                          <span className="text-lg font-medium">
                            {isCorrect ? '정답입니다!' : '틀렸습니다'}
                          </span>
                        </div>
                        {!isCorrect && (
                          <p className="text-gray-600">
                            정답: {quizQuestions[currentQuestionIndex].correct_answer}
                          </p>
                        )}
                        <Button onClick={nextQuestion} className="w-full">
                          {currentQuestionIndex < quizQuestions.length - 1 ? '다음 문제' : '퀴즈 완료'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 즐겨찾기 */}
        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>즐겨찾기 용어</CardTitle>
              <CardDescription>자주 학습하는 신학 용어들을 모아보세요</CardDescription>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">아직 즐겨찾기한 용어가 없습니다.</p>
                  <p className="text-sm text-gray-500 mt-1">용어 탐색에서 ♥ 버튼을 눌러 즐겨찾기에 추가하세요.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {favorites.map((term) => (
                    <Card key={term.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-medium">{term.hungarian_term}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => playPronunciation(term.hungarian_term)}
                            >
                              <Volume2 className="h-4 w-4" />
                            </Button>
                            <Badge className={getDifficultyColor(term.difficulty_level)}>
                              {term.difficulty_level}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{term.korean_translation}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(term.id)}
                        >
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 학습 진도 */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>학습 통계</CardTitle>
              <CardDescription>신학 용어 학습 진도를 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-gray-600">완료된 퀴즈</div>
                </div>
                <div className="text-center">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">45분</div>
                  <div className="text-sm text-gray-600">총 학습 시간</div>
                </div>
                <div className="text-center">
                  <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">85%</div>
                  <div className="text-sm text-gray-600">정답률</div>
                </div>
                <div className="text-center">
                  <Lightbulb className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">127</div>
                  <div className="text-sm text-gray-600">학습한 용어</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}