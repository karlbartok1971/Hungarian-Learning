'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Brain,
  Clock,
  Target,
  BookOpen,
  Volume2,
  Eye,
  Activity,
  Save
} from 'lucide-react';

interface ContentType {
  id: string;
  name: string;
  description: string;
}

interface SessionType {
  id: string;
  name: string;
  duration: string;
}

interface LearningStyleWeights {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading_writing: number;
}

interface RecommendationPreferences {
  preferred_content_types: string[];
  session_type: string;
  difficulty_preference: string;
  optimal_session_duration: number;
  theological_focus_level: number;
  learning_style_weights: LearningStyleWeights;
  adaptive_difficulty: boolean;
  korean_specific_challenges: boolean;
  include_cultural_context: boolean;
}

const RecommendationSettings: React.FC = () => {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [preferences, setPreferences] = useState<RecommendationPreferences>({
    preferred_content_types: ['theological_terms', 'grammar'],
    session_type: 'intensive_study',
    difficulty_preference: 'appropriate',
    optimal_session_duration: 30,
    theological_focus_level: 80,
    learning_style_weights: {
      visual: 25,
      auditory: 25,
      kinesthetic: 25,
      reading_writing: 25
    },
    adaptive_difficulty: true,
    korean_specific_challenges: true,
    include_cultural_context: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContentTypes();
    loadUserPreferences();
  }, []);

  const fetchContentTypes = async () => {
    try {
      const response = await fetch('/api/recommendations/content-types');
      if (response.ok) {
        const data = await response.json();
        setContentTypes(data.data.content_types);
        setSessionTypes(data.data.session_types);
      }
    } catch (error) {
      console.error('콘텐츠 타입 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    // 사용자 기존 설정 로드
    const savedPreferences = localStorage.getItem('recommendationPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  };

  const handleContentTypeToggle = (contentTypeId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      preferred_content_types: checked
        ? [...prev.preferred_content_types, contentTypeId]
        : prev.preferred_content_types.filter(id => id !== contentTypeId)
    }));
  };

  const handleLearningStyleChange = (style: keyof LearningStyleWeights, value: number[]) => {
    const totalOthers = Object.entries(preferences.learning_style_weights)
      .filter(([key]) => key !== style)
      .reduce((sum, [, val]) => sum + val, 0);

    const newValue = value[0];
    const remainingForOthers = 100 - newValue;
    const scaleFactor = remainingForOthers / totalOthers;

    setPreferences(prev => ({
      ...prev,
      learning_style_weights: {
        ...prev.learning_style_weights,
        [style]: newValue,
        ...Object.fromEntries(
          Object.entries(prev.learning_style_weights)
            .filter(([key]) => key !== style)
            .map(([key, val]) => [key, Math.round(val * scaleFactor)])
        )
      }
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      // 로컬 스토리지에 저장
      localStorage.setItem('recommendationPreferences', JSON.stringify(preferences));

      // 서버에 피드백 전송
      const response = await fetch('/api/recommendations/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          feedback_type: 'preferences_update',
          preferences: preferences
        })
      });

      if (response.ok) {
        // 성공 메시지
        alert('설정이 성공적으로 저장되었습니다!');
      }
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const renderContentTypeSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          선호 콘텐츠 타입
        </CardTitle>
        <CardDescription>
          관심 있는 학습 콘텐츠 유형을 선택해주세요 (복수 선택 가능)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contentTypes.map((type) => (
            <div key={type.id} className="flex items-start space-x-3">
              <Checkbox
                id={type.id}
                checked={preferences.preferred_content_types.includes(type.id)}
                onCheckedChange={(checked) => handleContentTypeToggle(type.id, !!checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor={type.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {type.name}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {type.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderSessionSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          세션 설정
        </CardTitle>
        <CardDescription>
          학습 세션 환경을 설정해주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 세션 타입 */}
        <div>
          <Label className="text-sm font-medium">선호 세션 타입</Label>
          <Select value={preferences.session_type} onValueChange={(value) =>
            setPreferences(prev => ({ ...prev, session_type: value }))
          }>
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="세션 타입 선택" />
            </SelectTrigger>
            <SelectContent>
              {sessionTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name} ({type.duration})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 세션 지속 시간 */}
        <div>
          <Label className="text-sm font-medium">
            최적 세션 지속 시간: {preferences.optimal_session_duration}분
          </Label>
          <Slider
            value={[preferences.optimal_session_duration]}
            onValueChange={(value) =>
              setPreferences(prev => ({ ...prev, optimal_session_duration: value[0] }))
            }
            max={90}
            min={5}
            step={5}
            className="mt-3"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5분</span>
            <span>90분</span>
          </div>
        </div>

        {/* 난이도 선호도 */}
        <div>
          <Label className="text-sm font-medium">난이도 선호도</Label>
          <Select value={preferences.difficulty_preference} onValueChange={(value) =>
            setPreferences(prev => ({ ...prev, difficulty_preference: value }))
          }>
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="난이도 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">쉬움 - 현재 레벨보다 낮게</SelectItem>
              <SelectItem value="appropriate">적절 - 현재 레벨에 맞게</SelectItem>
              <SelectItem value="challenging">도전적 - 현재 레벨보다 높게</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 신학 중심도 */}
        <div>
          <Label className="text-sm font-medium">
            신학/설교 중심도: {preferences.theological_focus_level}%
          </Label>
          <Slider
            value={[preferences.theological_focus_level]}
            onValueChange={(value) =>
              setPreferences(prev => ({ ...prev, theological_focus_level: value[0] }))
            }
            max={100}
            min={0}
            step={10}
            className="mt-3"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>일반 헝가리어</span>
            <span>신학 특화</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderLearningStyleSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          학습 스타일 가중치
        </CardTitle>
        <CardDescription>
          당신의 학습 스타일 선호도를 조정해주세요 (총합 100%)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 시각적 학습 */}
        <div>
          <Label className="flex items-center gap-2 text-sm font-medium mb-3">
            <Eye className="w-4 h-4" />
            시각적 학습: {preferences.learning_style_weights.visual}%
          </Label>
          <Slider
            value={[preferences.learning_style_weights.visual]}
            onValueChange={(value) => handleLearningStyleChange('visual', value)}
            max={70}
            min={10}
            step={5}
          />
          <p className="text-xs text-gray-500 mt-1">
            이미지, 다이어그램, 색상 코딩 등을 선호
          </p>
        </div>

        {/* 청각적 학습 */}
        <div>
          <Label className="flex items-center gap-2 text-sm font-medium mb-3">
            <Volume2 className="w-4 h-4" />
            청각적 학습: {preferences.learning_style_weights.auditory}%
          </Label>
          <Slider
            value={[preferences.learning_style_weights.auditory]}
            onValueChange={(value) => handleLearningStyleChange('auditory', value)}
            max={70}
            min={10}
            step={5}
          />
          <p className="text-xs text-gray-500 mt-1">
            음성, 음악, 발음 연습 등을 선호
          </p>
        </div>

        {/* 체험적 학습 */}
        <div>
          <Label className="flex items-center gap-2 text-sm font-medium mb-3">
            <Activity className="w-4 h-4" />
            체험적 학습: {preferences.learning_style_weights.kinesthetic}%
          </Label>
          <Slider
            value={[preferences.learning_style_weights.kinesthetic]}
            onValueChange={(value) => handleLearningStyleChange('kinesthetic', value)}
            max={70}
            min={10}
            step={5}
          />
          <p className="text-xs text-gray-500 mt-1">
            실습, 게임, 상호작용 등을 선호
          </p>
        </div>

        {/* 읽기/쓰기 학습 */}
        <div>
          <Label className="flex items-center gap-2 text-sm font-medium mb-3">
            <BookOpen className="w-4 h-4" />
            읽기/쓰기 학습: {preferences.learning_style_weights.reading_writing}%
          </Label>
          <Slider
            value={[preferences.learning_style_weights.reading_writing]}
            onValueChange={(value) => handleLearningStyleChange('reading_writing', value)}
            max={70}
            min={10}
            step={5}
          />
          <p className="text-xs text-gray-500 mt-1">
            텍스트, 노트 작성, 목록 등을 선호
          </p>
        </div>

        {/* 총합 표시 */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            총합: {Object.values(preferences.learning_style_weights).reduce((sum, val) => sum + val, 0)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderAdvancedSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          고급 설정
        </CardTitle>
        <CardDescription>
          추가적인 개인화 옵션을 설정해주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="adaptive-difficulty"
            checked={preferences.adaptive_difficulty}
            onCheckedChange={(checked) =>
              setPreferences(prev => ({ ...prev, adaptive_difficulty: checked }))
            }
          />
          <Label htmlFor="adaptive-difficulty" className="text-sm">
            적응형 난이도 조절
          </Label>
        </div>
        <p className="text-xs text-gray-500">
          학습 진도에 따라 자동으로 난이도를 조절합니다
        </p>

        <div className="flex items-center space-x-2">
          <Switch
            id="korean-challenges"
            checked={preferences.korean_specific_challenges}
            onCheckedChange={(checked) =>
              setPreferences(prev => ({ ...prev, korean_specific_challenges: checked }))
            }
          />
          <Label htmlFor="korean-challenges" className="text-sm">
            한국인 특화 도전 과제
          </Label>
        </div>
        <p className="text-xs text-gray-500">
          한국어와 헝가리어의 차이점을 중점적으로 학습합니다
        </p>

        <div className="flex items-center space-x-2">
          <Switch
            id="cultural-context"
            checked={preferences.include_cultural_context}
            onCheckedChange={(checked) =>
              setPreferences(prev => ({ ...prev, include_cultural_context: checked }))
            }
          />
          <Label htmlFor="cultural-context" className="text-sm">
            문화적 맥락 포함
          </Label>
        </div>
        <p className="text-xs text-gray-500">
          헝가리 문화와 맥락을 함께 학습합니다
        </p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">설정을 로드하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          추천 설정
        </h1>
        <p className="text-gray-600">
          개인화된 학습 추천을 위한 설정을 조정해주세요.
        </p>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">콘텐츠 선호도</TabsTrigger>
          <TabsTrigger value="session">세션 설정</TabsTrigger>
          <TabsTrigger value="learning">학습 스타일</TabsTrigger>
          <TabsTrigger value="advanced">고급 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
          {renderContentTypeSelection()}
        </TabsContent>

        <TabsContent value="session" className="mt-6">
          {renderSessionSettings()}
        </TabsContent>

        <TabsContent value="learning" className="mt-6">
          {renderLearningStyleSettings()}
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          {renderAdvancedSettings()}
        </TabsContent>
      </Tabs>

      {/* 저장 버튼 */}
      <div className="mt-8 text-center">
        <Button onClick={savePreferences} disabled={saving} className="px-8">
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              저장 중...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              설정 저장
            </>
          )}
        </Button>
      </div>

      {/* 선택된 설정 요약 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">현재 설정 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">선호 콘텐츠</h4>
              <div className="flex flex-wrap gap-1">
                {preferences.preferred_content_types.map(typeId => {
                  const type = contentTypes.find(t => t.id === typeId);
                  return (
                    <Badge key={typeId} variant="secondary" className="text-xs">
                      {type?.name || typeId}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">세션 설정</h4>
              <p className="text-sm text-gray-600">
                {preferences.optimal_session_duration}분, 난이도: {preferences.difficulty_preference}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">신학 중심도</h4>
              <p className="text-sm text-gray-600">{preferences.theological_focus_level}%</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">주요 학습 스타일</h4>
              <p className="text-sm text-gray-600">
                {Object.entries(preferences.learning_style_weights)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 2)
                  .map(([style, weight]) => `${style}: ${weight}%`)
                  .join(', ')
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationSettings;