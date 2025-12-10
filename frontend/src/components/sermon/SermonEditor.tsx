'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Save,
  Download,
  RefreshCw,
  BookOpen,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Target,
  Brain,
  Mic,
  Volume2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 헝가리어 설교문 작성 에디터
 * AI 지원 작성, 실시간 문법 검사, 신학 용어 도움말 통합
 */

interface SermonData {
  id?: string;
  title: string;
  topic: string;
  target_audience: string;
  difficulty_level: 'A1' | 'A2' | 'B1' | 'B2';
  content: string;
  outline: string[];
  theological_focus: string[];
  status: 'draft' | 'in_progress' | 'completed';
}

interface GrammarSuggestion {
  type: string;
  position: { start: number; end: number };
  original_text: string;
  suggested_correction: string;
  explanation_korean: string;
  severity: 'high' | 'medium' | 'low';
}

interface TheologicalTerm {
  id: string;
  hungarian: string;
  korean_meaning: string;
  definition_hungarian: string;
  definition_korean: string;
  category: string;
  difficulty_level: string;
  example_sentences: string[];
  pronunciation_ipa?: string;
}

interface AIOutline {
  introduction: string[];
  main_points: Array<{
    title: string;
    content: string[];
    theological_focus: string;
  }>;
  conclusion: string[];
  suggested_verses: string[];
}

export default function SermonEditor() {
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 설교문 데이터 상태
  const [sermonData, setSermonData] = useState<SermonData>({
    title: '',
    topic: '',
    target_audience: '일반 성도',
    difficulty_level: 'B1',
    content: '',
    outline: [],
    theological_focus: [],
    status: 'draft'
  });

  // UI 상태
  const [activeTab, setActiveTab] = useState('write');
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [estimatedReadingTime, setEstimatedReadingTime] = useState(0);

  // AI 및 분석 상태
  const [grammarSuggestions, setGrammarSuggestions] = useState<GrammarSuggestion[]>([]);
  const [aiOutline, setAIOutline] = useState<AIOutline | null>(null);
  const [suggestedTerms, setSuggestedTerms] = useState<TheologicalTerm[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 실시간 분석 및 자동 저장
  useEffect(() => {
    const words = sermonData.content.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setEstimatedReadingTime(Math.ceil(words / 150)); // 분당 150단어 가정

    if (autoSaveEnabled && sermonData.content.length > 50) {
      const timeoutId = setTimeout(() => {
        handleAutoSave();
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [sermonData.content]);

  // 자동 저장
  const handleAutoSave = async () => {
    try {
      // API 호출하여 자동 저장
      console.log('Auto-saving sermon...');
      // await saveSermonDraft(sermonData);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  // AI 개요 생성
  const handleGenerateOutline = async () => {
    if (!sermonData.topic.trim()) {
      toast({
        title: "주제를 입력하세요",
        description: "AI 개요 생성을 위해 설교 주제를 먼저 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/sermon/generate-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          topic: sermonData.topic,
          userLevel: sermonData.difficulty_level,
          preferences: {
            target_audience: sermonData.target_audience,
            theological_focus: sermonData.theological_focus
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate outline');
      }

      const data = await response.json();
      setAIOutline(data.data.outline);

      toast({
        title: "AI 개요 생성 완료! 🎉",
        description: "설교문 구조가 생성되었습니다. 개요 탭에서 확인하세요.",
      });

    } catch (error) {
      toast({
        title: "개요 생성 실패",
        description: "AI 개요 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 실시간 문법 검사
  const handleGrammarCheck = async () => {
    if (!sermonData.content.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/sermon/check-grammar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          text: sermonData.content,
          level: sermonData.difficulty_level,
          check_style: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to check grammar');
      }

      const data = await response.json();
      setGrammarSuggestions(data.data.suggestions);

    } catch (error) {
      console.error('Grammar check failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 신학 용어 제안
  const handleGetTermSuggestions = async () => {
    try {
      const response = await fetch('/api/theological-terms/search', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get term suggestions');
      }

      const data = await response.json();
      setSuggestedTerms(data.data.terms.slice(0, 5));

    } catch (error) {
      console.error('Term suggestion failed:', error);
    }
  };

  // 문법 제안 적용
  const applySuggestion = (suggestion: GrammarSuggestion) => {
    const newContent = sermonData.content.substring(0, suggestion.position.start) +
                      suggestion.suggested_correction +
                      sermonData.content.substring(suggestion.position.end);

    setSermonData(prev => ({ ...prev, content: newContent }));

    // 적용된 제안 제거
    setGrammarSuggestions(prev =>
      prev.filter(s => s.position.start !== suggestion.position.start)
    );

    toast({
      title: "문법 수정 완료",
      description: "제안사항이 적용되었습니다.",
    });
  };

  // 신학 용어 삽입
  const insertTheologicalTerm = (term: TheologicalTerm) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = sermonData.content;

    const newContent =
      currentContent.substring(0, start) +
      term.hungarian +
      currentContent.substring(end);

    setSermonData(prev => ({ ...prev, content: newContent }));

    // 커서 위치 조정
    setTimeout(() => {
      const newPosition = start + term.hungarian.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);

    toast({
      title: `신학 용어 추가: ${term.hungarian}`,
      description: `${term.korean_meaning} - ${term.definition_korean.substring(0, 50)}...`,
    });
  };

  // 설교문 저장
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // API 호출하여 설교문 저장
      const response = await fetch('/api/sermon/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(sermonData)
      });

      if (!response.ok) {
        throw new Error('Failed to save sermon');
      }

      toast({
        title: "설교문 저장 완료! 💾",
        description: "설교문이 성공적으로 저장되었습니다.",
      });

    } catch (error) {
      toast({
        title: "저장 실패",
        description: "설교문 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 음성 재생
  const handlePlayAudio = async (text: string) => {
    try {
      // TTS API 호출 (실제 구현에서는 적절한 TTS 서비스 사용)
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hu-HU';
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">헝가리어 설교문 작성</h1>
          <div className="flex items-center space-x-2">
            <Badge variant={autoSaveEnabled ? "default" : "secondary"}>
              자동저장 {autoSaveEnabled ? "활성" : "비활성"}
            </Badge>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
          </div>
        </div>

        {/* 기본 정보 입력 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Input
            placeholder="설교 제목"
            value={sermonData.title}
            onChange={(e) => setSermonData(prev => ({ ...prev, title: e.target.value }))}
          />
          <Input
            placeholder="설교 주제 (예: 하나님의 사랑)"
            value={sermonData.topic}
            onChange={(e) => setSermonData(prev => ({ ...prev, topic: e.target.value }))}
          />
          <select
            className="px-3 py-2 border rounded-md"
            value={sermonData.target_audience}
            onChange={(e) => setSermonData(prev => ({ ...prev, target_audience: e.target.value }))}
          >
            <option value="일반 성도">일반 성도</option>
            <option value="새신자">새신자</option>
            <option value="성숙한 신자">성숙한 신자</option>
            <option value="청년">청년</option>
          </select>
          <select
            className="px-3 py-2 border rounded-md"
            value={sermonData.difficulty_level}
            onChange={(e) => setSermonData(prev => ({ ...prev, difficulty_level: e.target.value as any }))}
          >
            <option value="A1">A1 (초급)</option>
            <option value="A2">A2 (초중급)</option>
            <option value="B1">B1 (중급)</option>
            <option value="B2">B2 (중고급)</option>
          </select>
        </div>

        {/* 진행 상황 */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>단어 수: {wordCount.toLocaleString()}</span>
          <span>예상 읽기 시간: {estimatedReadingTime}분</span>
          {grammarSuggestions.length > 0 && (
            <Badge variant="outline" className="text-orange-600">
              문법 제안: {grammarSuggestions.length}개
            </Badge>
          )}
        </div>
      </div>

      {/* 메인 탭 인터페이스 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="write" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            작성
          </TabsTrigger>
          <TabsTrigger value="outline" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            개요
          </TabsTrigger>
          <TabsTrigger value="grammar" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            문법 검사
          </TabsTrigger>
          <TabsTrigger value="terms" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            신학 용어
          </TabsTrigger>
        </TabsList>

        {/* 작성 탭 */}
        <TabsContent value="write" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 메인 에디터 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>설교문 작성</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGrammarCheck}
                        disabled={isAnalyzing}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        문법 검사
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlayAudio(sermonData.content.substring(0, 200))}
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        음성 재생
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    ref={textareaRef}
                    value={sermonData.content}
                    onChange={(e) => setSermonData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="헝가리어로 설교문을 작성해보세요. AI가 문법과 신학적 정확성을 실시간으로 도와드립니다..."
                    className="min-h-[500px] resize-y"
                  />
                </CardContent>
              </Card>
            </div>

            {/* 사이드바 - 실시간 도움말 */}
            <div className="space-y-4">
              {/* AI 개요 생성 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI 설교 개요 생성</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleGenerateOutline}
                    disabled={isLoading || !sermonData.topic.trim()}
                    className="w-full"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    개요 생성
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    주제를 바탕으로 AI가 설교 구조를 제안합니다
                  </p>
                </CardContent>
              </Card>

              {/* 문법 제안 요약 */}
              {grammarSuggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                      문법 제안
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {grammarSuggestions.slice(0, 3).map((suggestion, index) => (
                        <div key={index} className="p-2 bg-orange-50 rounded text-xs">
                          <div className="font-medium">{suggestion.original_text}</div>
                          <div className="text-blue-600">→ {suggestion.suggested_correction}</div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-1 h-6 text-xs"
                            onClick={() => applySuggestion(suggestion)}
                          >
                            적용
                          </Button>
                        </div>
                      ))}
                      {grammarSuggestions.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{grammarSuggestions.length - 3}개 더 (문법 검사 탭에서 확인)
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 추천 신학 용어 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">추천 신학 용어</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleGetTermSuggestions}
                    variant="outline"
                    size="sm"
                    className="w-full mb-2"
                  >
                    용어 제안 받기
                  </Button>
                  <div className="space-y-2">
                    {suggestedTerms.map((term) => (
                      <div key={term.id} className="p-2 bg-blue-50 rounded text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{term.hungarian}</div>
                            <div className="text-gray-600">{term.korean_meaning}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs"
                            onClick={() => insertTheologicalTerm(term)}
                          >
                            삽입
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 개요 탭 */}
        <TabsContent value="outline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI 생성 설교 개요</CardTitle>
            </CardHeader>
            <CardContent>
              {aiOutline ? (
                <div className="space-y-6">
                  {/* 서론 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">서론</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {aiOutline.introduction.map((item, index) => (
                        <li key={index} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 본론 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">본론</h3>
                    {aiOutline.main_points.map((point, index) => (
                      <div key={index} className="mb-4 p-4 bg-gray-50 rounded">
                        <h4 className="font-medium mb-2">{index + 1}. {point.title}</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {point.content.map((item, idx) => (
                            <li key={idx} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                        <Badge variant="outline" className="mt-2">
                          {point.theological_focus}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* 결론 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">결론</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {aiOutline.conclusion.map((item, index) => (
                        <li key={index} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 추천 성경 구절 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">추천 성경 구절</h3>
                    <div className="flex flex-wrap gap-2">
                      {aiOutline.suggested_verses.map((verse, index) => (
                        <Badge key={index} variant="secondary">{verse}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">아직 개요가 생성되지 않았습니다.</p>
                  <p className="text-sm text-gray-400">작성 탭에서 AI 개요 생성 버튼을 클릭하세요.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 문법 검사 탭 */}
        <TabsContent value="grammar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>문법 검사 및 제안</CardTitle>
            </CardHeader>
            <CardContent>
              {grammarSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {grammarSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Badge
                              variant={suggestion.severity === 'high' ? 'destructive' :
                                       suggestion.severity === 'medium' ? 'default' : 'secondary'}
                            >
                              {suggestion.severity === 'high' ? '높음' :
                               suggestion.severity === 'medium' ? '보통' : '낮음'}
                            </Badge>
                            <span className="ml-2 text-sm text-gray-600">{suggestion.type}</span>
                          </div>
                          <div className="mb-2">
                            <span className="font-medium text-red-600">원문:</span> {suggestion.original_text}
                          </div>
                          <div className="mb-2">
                            <span className="font-medium text-green-600">수정안:</span> {suggestion.suggested_correction}
                          </div>
                          <p className="text-sm text-gray-700">{suggestion.explanation_korean}</p>
                        </div>
                        <Button
                          onClick={() => applySuggestion(suggestion)}
                          size="sm"
                        >
                          적용
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                  <p className="text-gray-500">문법 검사 결과가 없습니다.</p>
                  <p className="text-sm text-gray-400">작성 탭에서 문법 검사 버튼을 클릭하세요.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 신학 용어 탭 */}
        <TabsContent value="terms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>신학 용어 도움말</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedTerms.map((term) => (
                  <div key={term.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{term.hungarian}</h4>
                        {term.pronunciation_ipa && (
                          <p className="text-sm text-gray-500">{term.pronunciation_ipa}</p>
                        )}
                      </div>
                      <Badge variant="outline">{term.difficulty_level}</Badge>
                    </div>
                    <p className="text-sm font-medium text-blue-600 mb-1">{term.korean_meaning}</p>
                    <p className="text-xs text-gray-600 mb-3">{term.definition_korean}</p>
                    {term.example_sentences.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">예문:</p>
                        <p className="text-xs text-gray-600 italic">"{term.example_sentences[0]}"</p>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => insertTheologicalTerm(term)}
                      >
                        삽입
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePlayAudio(term.hungarian)}
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {suggestedTerms.length === 0 && (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">신학 용어를 불러오세요.</p>
                  <Button
                    onClick={handleGetTermSuggestions}
                    variant="outline"
                    className="mt-2"
                  >
                    용어 제안 받기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}