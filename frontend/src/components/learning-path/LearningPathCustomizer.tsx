'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SettingsIcon,
  ClockIcon,
  TargetIcon,
  BookOpenIcon,
  VolumeIcon,
  BrainIcon,
  CalendarIcon,
  SaveIcon,
  RefreshCwIcon,
  UserIcon,
  AlertTriangleIcon
} from "lucide-react";

export interface LearningPathCustomization {
  studySchedule: {
    weeklyHours: number;
    preferredTimes: string[];
    intensity: 'relaxed' | 'moderate' | 'intensive';
    sessionLength: number;
  };

  preferences: {
    focusOnPronunciation: boolean;
    emphasizeSermonWriting: boolean;
    culturalContexts: boolean;
    includeGames: boolean;
    audioLearning: boolean;
    visualLearning: boolean;
    practiceWriting: boolean;
  };

  goals: {
    primaryGoal: string;
    targetDate?: string;
    specificNeeds: string[];
    motivations: string[];
  };

  focusAreas: {
    grammar: number;      // 1-5 우선순위
    vocabulary: number;
    pronunciation: number;
    cultural: number;
    writing: number;
    listening: number;
  };

  adaptiveSettings: {
    difficultyAdjustment: 'manual' | 'automatic';
    reviewFrequency: 'low' | 'medium' | 'high';
    challengeLevel: number; // 1-10
    allowSkipping: boolean;
  };

  pastoralSpecialization: {
    sermonWritingFocus: boolean;
    liturgicalLanguage: boolean;
    biblicalVocabulary: boolean;
    churchCultureEmphasis: boolean;
    congregationInteraction: boolean;
  };
}

interface LearningPathCustomizerProps {
  currentSettings: LearningPathCustomization;
  pathId: string;
  onSave: (settings: LearningPathCustomization) => Promise<void>;
  onReset: () => void;
  onPreview?: (settings: LearningPathCustomization) => void;
  isLoading?: boolean;
}

export const LearningPathCustomizer: React.FC<LearningPathCustomizerProps> = ({
  currentSettings,
  pathId,
  onSave,
  onReset,
  onPreview,
  isLoading = false
}) => {
  const [settings, setSettings] = useState<LearningPathCustomization>(currentSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const timeSlots = [
    { id: 'morning', label: '오전 (6-12시)', value: '오전' },
    { id: 'afternoon', label: '오후 (12-18시)', value: '오후' },
    { id: 'evening', label: '저녁 (18-22시)', value: '저녁' },
    { id: 'night', label: '밤 (22-24시)', value: '밤' }
  ];

  const primaryGoals = [
    { value: 'level_advancement', label: '다음 레벨 달성' },
    { value: 'sermon_writing', label: '설교문 작성 능력 향상' },
    { value: 'conversation', label: '일상 대화 능력' },
    { value: 'pronunciation', label: '발음 교정' },
    { value: 'cultural_adaptation', label: '문화적 적응' },
    { value: 'exam_preparation', label: '공인 시험 준비' }
  ];

  const specificNeeds = [
    { id: 'church_vocabulary', label: '교회 전문 어휘' },
    { id: 'formal_writing', label: '격식있는 글쓰기' },
    { id: 'listening_comprehension', label: '듣기 이해력' },
    { id: 'pronunciation_correction', label: '발음 교정' },
    { id: 'grammar_foundation', label: '문법 기초' },
    { id: 'cultural_understanding', label: '문화적 이해' },
    { id: 'liturgical_expressions', label: '예배 표현' },
    { id: 'biblical_language', label: '성경적 언어' }
  ];

  const intensityLabels = {
    relaxed: { label: '여유로운', desc: '꾸준히 천천히', color: 'bg-green-500' },
    moderate: { label: '보통', desc: '적당한 페이스', color: 'bg-yellow-500' },
    intensive: { label: '집중적', desc: '빠른 진도', color: 'bg-red-500' }
  };

  const updateSettings = (section: keyof LearningPathCustomization, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
    setHasChanges(true);
  };

  const updateFocusArea = (area: keyof LearningPathCustomization['focusAreas'], value: number[]) => {
    updateSettings('focusAreas', { [area]: value[0] });
  };

  const updatePreference = (key: keyof LearningPathCustomization['preferences'], value: boolean) => {
    updateSettings('preferences', { [key]: value });
  };

  const updatePastoralSpecialization = (key: keyof LearningPathCustomization['pastoralSpecialization'], value: boolean) => {
    updateSettings('pastoralSpecialization', { [key]: value });
  };

  const updateSpecificNeeds = (needId: string, checked: boolean) => {
    const currentNeeds = settings.goals.specificNeeds;
    const updatedNeeds = checked
      ? [...currentNeeds, needId]
      : currentNeeds.filter(id => id !== needId);

    updateSettings('goals', { specificNeeds: updatedNeeds });
  };

  const updatePreferredTimes = (timeValue: string, checked: boolean) => {
    const currentTimes = settings.studySchedule.preferredTimes;
    const updatedTimes = checked
      ? [...currentTimes, timeValue]
      : currentTimes.filter(time => time !== timeValue);

    updateSettings('studySchedule', { preferredTimes: updatedTimes });
  };

  const handleSave = async () => {
    try {
      await onSave(settings);
      setHasChanges(false);
    } catch (error) {
      console.error('설정 저장 실패:', error);
    }
  };

  const handleReset = () => {
    setSettings(currentSettings);
    setHasChanges(false);
    onReset();
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(settings);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">학습 경로 커스터마이징</h1>
          <p className="text-gray-600 mt-1">개인의 학습 스타일과 목표에 맞게 조정하세요</p>
        </div>

        {hasChanges && (
          <Badge variant="outline" className="bg-yellow-50">
            변경사항이 있습니다
          </Badge>
        )}
      </div>

      {/* 학습 일정 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            학습 일정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 주간 학습 시간 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">주간 학습 목표</label>
            <div className="space-y-2">
              <Slider
                value={[settings.studySchedule.weeklyHours]}
                onValueChange={(value) => updateSettings('studySchedule', { weeklyHours: value[0] })}
                min={2}
                max={20}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>주 {settings.studySchedule.weeklyHours}시간</span>
                <span>
                  {settings.studySchedule.weeklyHours <= 5 ? '여유로운 페이스' :
                   settings.studySchedule.weeklyHours <= 10 ? '적당한 페이스' : '집중적 학습'}
                </span>
              </div>
            </div>
          </div>

          {/* 학습 강도 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">학습 강도</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(intensityLabels).map(([key, config]) => (
                <div
                  key={key}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    settings.studySchedule.intensity === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateSettings('studySchedule', { intensity: key })}
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

          {/* 선호 시간대 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">선호 학습 시간 (복수 선택 가능)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {timeSlots.map((slot) => (
                <div key={slot.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={slot.id}
                    checked={settings.studySchedule.preferredTimes.includes(slot.value)}
                    onCheckedChange={(checked) =>
                      updatePreferredTimes(slot.value, checked as boolean)
                    }
                  />
                  <label htmlFor={slot.id} className="text-sm cursor-pointer">
                    {slot.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 세션 길이 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">한 세션 길이</label>
            <div className="space-y-2">
              <Slider
                value={[settings.studySchedule.sessionLength]}
                onValueChange={(value) => updateSettings('studySchedule', { sessionLength: value[0] })}
                min={15}
                max={120}
                step={15}
                className="w-full"
              />
              <div className="text-sm text-gray-600 text-center">
                {settings.studySchedule.sessionLength}분
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 학습 목표 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TargetIcon className="w-5 h-5 mr-2" />
            학습 목표
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 주요 목표 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">주요 학습 목표</label>
            <Select
              value={settings.goals.primaryGoal}
              onValueChange={(value) => updateSettings('goals', { primaryGoal: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="목표를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {primaryGoals.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 특별한 요구사항 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">특별한 학습 요구사항</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {specificNeeds.map((need) => (
                <div key={need.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={need.id}
                    checked={settings.goals.specificNeeds.includes(need.id)}
                    onCheckedChange={(checked) =>
                      updateSpecificNeeds(need.id, checked as boolean)
                    }
                  />
                  <label htmlFor={need.id} className="text-sm cursor-pointer">
                    {need.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 목표 달성 기한 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">목표 달성 희망 시기 (선택사항)</label>
            <input
              type="date"
              value={settings.goals.targetDate || ''}
              onChange={(e) => updateSettings('goals', { targetDate: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* 학습 영역 우선순위 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BrainIcon className="w-5 h-5 mr-2" />
            학습 영역 우선순위
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600">각 영역의 중요도를 1(낮음)부터 5(높음)까지 설정하세요</p>

          {Object.entries(settings.focusAreas).map(([area, priority]) => (
            <div key={area} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">
                  {area === 'grammar' ? '문법' :
                   area === 'vocabulary' ? '어휘' :
                   area === 'pronunciation' ? '발음' :
                   area === 'cultural' ? '문화' :
                   area === 'writing' ? '작문' : '청취'}
                </span>
                <Badge variant="outline">우선순위 {priority}</Badge>
              </div>
              <Slider
                value={[priority]}
                onValueChange={(value) => updateFocusArea(area as keyof LearningPathCustomization['focusAreas'], value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 학습 선호도 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserIcon className="w-5 h-5 mr-2" />
            학습 선호도
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(settings.preferences).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">
                  {key === 'focusOnPronunciation' ? '발음 집중 학습' :
                   key === 'emphasizeSermonWriting' ? '설교문 작성 강화' :
                   key === 'culturalContexts' ? '문화적 맥락 포함' :
                   key === 'includeGames' ? '게임 요소 포함' :
                   key === 'audioLearning' ? '오디오 학습 선호' :
                   key === 'visualLearning' ? '시각적 학습 선호' : '쓰기 연습 포함'}
                </span>
                <div className="text-xs text-gray-600">
                  {key === 'focusOnPronunciation' ? '발음 교정에 더 많은 시간 할애' :
                   key === 'emphasizeSermonWriting' ? '설교문 작성 능력 향상에 중점' :
                   key === 'culturalContexts' ? '헝가리 교회 문화 맥락 학습' :
                   key === 'includeGames' ? '재미있는 학습 게임 포함' :
                   key === 'audioLearning' ? '듣기와 발음 중심 학습' :
                   key === 'visualLearning' ? '그림과 도표 중심 학습' : '글쓰기 연습 강화'}
                </div>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => updatePreference(key as keyof LearningPathCustomization['preferences'], checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 목회자 특화 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpenIcon className="w-5 h-5 mr-2" />
            목회자 특화 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(settings.pastoralSpecialization).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">
                  {key === 'sermonWritingFocus' ? '설교문 작성 집중' :
                   key === 'liturgicalLanguage' ? '예배 언어 학습' :
                   key === 'biblicalVocabulary' ? '성경 어휘 강화' :
                   key === 'churchCultureEmphasis' ? '교회 문화 이해' : '교인 상호작용'}
                </span>
                <div className="text-xs text-gray-600">
                  {key === 'sermonWritingFocus' ? '설교 준비와 작성 기술 향상' :
                   key === 'liturgicalLanguage' ? '예배 순서와 기도문 학습' :
                   key === 'biblicalVocabulary' ? '성경적 용어와 신학 어휘' :
                   key === 'churchCultureEmphasis' ? '헝가리 교회 전통과 관습' : '교인들과의 소통 기술'}
                </div>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => updatePastoralSpecialization(key as keyof LearningPathCustomization['pastoralSpecialization'], checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 적응형 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            적응형 학습 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 난이도 조정 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">난이도 조정</label>
            <Select
              value={settings.adaptiveSettings.difficultyAdjustment}
              onValueChange={(value: 'manual' | 'automatic') =>
                updateSettings('adaptiveSettings', { difficultyAdjustment: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automatic">자동 조정</SelectItem>
                <SelectItem value="manual">수동 조정</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 도전 수준 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">도전 수준</label>
            <div className="space-y-2">
              <Slider
                value={[settings.adaptiveSettings.challengeLevel]}
                onValueChange={(value) => updateSettings('adaptiveSettings', { challengeLevel: value[0] })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>안전함</span>
                <span>도전적</span>
              </div>
              <div className="text-center text-sm font-medium">
                레벨 {settings.adaptiveSettings.challengeLevel}
              </div>
            </div>
          </div>

          {/* 기타 설정 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">어려운 레슨 건너뛰기 허용</span>
                <div className="text-xs text-gray-600">막히는 부분에서 일시적으로 넘어갈 수 있음</div>
              </div>
              <Switch
                checked={settings.adaptiveSettings.allowSkipping}
                onCheckedChange={(checked) => updateSettings('adaptiveSettings', { allowSkipping: checked })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">복습 빈도</label>
              <Select
                value={settings.adaptiveSettings.reviewFrequency}
                onValueChange={(value: 'low' | 'medium' | 'high') =>
                  updateSettings('adaptiveSettings', { reviewFrequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">낮음 (월 1회)</SelectItem>
                  <SelectItem value="medium">보통 (주 1회)</SelectItem>
                  <SelectItem value="high">높음 (매일)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼들 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={handleSave}
              size="lg"
              disabled={!hasChanges || isLoading}
              className="px-8"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  저장 중...
                </>
              ) : (
                <>
                  <SaveIcon className="w-5 h-5 mr-2" />
                  설정 저장
                </>
              )}
            </Button>

            {onPreview && (
              <Button
                variant="outline"
                onClick={handlePreview}
                size="lg"
                disabled={isLoading}
              >
                <VolumeIcon className="w-5 h-5 mr-2" />
                변경 사항 미리보기
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleReset}
              size="lg"
              disabled={!hasChanges || isLoading}
            >
              <RefreshCwIcon className="w-5 h-5 mr-2" />
              되돌리기
            </Button>
          </div>

          {hasChanges && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center text-yellow-800">
                <AlertTriangleIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  설정을 변경했습니다. 저장을 클릭하여 적용하세요.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningPathCustomizer;