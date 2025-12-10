'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ClockIcon, UserIcon, TargetIcon, BookOpenIcon, ChevronRightIcon } from "lucide-react";

interface AssessmentStartProps {
  onStart: (config: AssessmentConfig) => void;
  isLoading?: boolean;
}

interface AssessmentConfig {
  type: 'placement' | 'progress' | 'pastoral';
  targetLevel?: string;
  focusAreas: string[];
  estimatedTime: number;
}

export const AssessmentStart: React.FC<AssessmentStartProps> = ({
  onStart,
  isLoading = false
}) => {
  const [selectedType, setSelectedType] = useState<'placement' | 'progress' | 'pastoral'>('placement');
  const [targetLevel, setTargetLevel] = useState<string>('');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);

  const assessmentTypes = {
    placement: {
      title: '초기 레벨 평가',
      description: '현재 헝가리어 실력을 정확히 측정합니다',
      duration: 25,
      icon: <TargetIcon className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    progress: {
      title: '진도 평가',
      description: '학습 진전도를 확인하고 약점을 파악합니다',
      duration: 15,
      icon: <BookOpenIcon className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    pastoral: {
      title: '목회자 특화 평가',
      description: '종교 어휘와 설교문 작성 능력을 평가합니다',
      duration: 35,
      icon: <UserIcon className="w-5 h-5" />,
      color: 'bg-purple-500'
    }
  };

  const targetLevels = ['A1', 'A2', 'B1', 'B2'];

  const availableFocusAreas = [
    { id: 'grammar', label: '문법', desc: '격변화, 동사 활용' },
    { id: 'vocabulary', label: '어휘', desc: '일반 및 종교 어휘' },
    { id: 'pronunciation', label: '발음', desc: '헝가리어 특유 발음' },
    { id: 'cultural', label: '문화', desc: '헝가리 교회 문화' },
    { id: 'writing', label: '작문', desc: '설교문 작성 능력' },
    { id: 'listening', label: '청취', desc: '헝가리어 이해력' }
  ];

  const handleFocusAreaChange = (areaId: string, checked: boolean) => {
    if (checked) {
      setFocusAreas([...focusAreas, areaId]);
    } else {
      setFocusAreas(focusAreas.filter(id => id !== areaId));
    }
  };

  const handleStart = () => {
    const config: AssessmentConfig = {
      type: selectedType,
      targetLevel: targetLevel || undefined,
      focusAreas,
      estimatedTime: assessmentTypes[selectedType].duration
    };
    onStart(config);
  };

  const canStart = selectedType && (selectedType !== 'progress' || targetLevel) && focusAreas.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          헝가리어 실력 평가
        </h1>
        <p className="text-lg text-gray-600">
          정확한 레벨 측정으로 개인화된 학습 경로를 제공받으세요
        </p>
      </div>

      {/* 평가 타입 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TargetIcon className="w-5 h-5" />
            평가 유형 선택
          </CardTitle>
          <CardDescription>
            목적에 맞는 평가 유형을 선택해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(assessmentTypes).map(([type, config]) => (
              <div
                key={type}
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-blue-300 ${
                  selectedType === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedType(type as any)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`rounded-full p-2 text-white ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {config.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {config.description}
                    </p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      약 {config.duration}분
                    </div>
                  </div>
                </div>
                {selectedType === type && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-blue-500">선택됨</Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 목표 레벨 설정 (진도 평가시만) */}
      {selectedType === 'progress' && (
        <Card>
          <CardHeader>
            <CardTitle>목표 레벨</CardTitle>
            <CardDescription>
              현재 목표로 하는 CEFR 레벨을 선택해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={targetLevel} onValueChange={setTargetLevel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="목표 레벨을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {targetLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level} - {
                      level === 'A1' ? '입문' :
                      level === 'A2' ? '초급' :
                      level === 'B1' ? '중급' : '중상급'
                    }
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* 평가 영역 선택 */}
      <Card>
        <CardHeader>
          <CardTitle>평가 영역</CardTitle>
          <CardDescription>
            중점적으로 평가받고 싶은 영역을 선택해주세요 (최소 1개)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableFocusAreas.map((area) => (
              <div
                key={area.id}
                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50"
              >
                <Checkbox
                  id={area.id}
                  checked={focusAreas.includes(area.id)}
                  onCheckedChange={(checked) =>
                    handleFocusAreaChange(area.id, checked as boolean)
                  }
                />
                <div className="flex-1">
                  <label
                    htmlFor={area.id}
                    className="font-medium text-gray-900 cursor-pointer"
                  >
                    {area.label}
                  </label>
                  <p className="text-sm text-gray-600">{area.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 평가 정보 요약 */}
      {canStart && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-blue-900">평가 준비 완료</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800">평가 유형:</span>
              <Badge className="bg-blue-500">
                {assessmentTypes[selectedType].title}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800">예상 소요시간:</span>
              <span className="font-medium">
                약 {assessmentTypes[selectedType].duration}분
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800">평가 영역:</span>
              <span className="font-medium">
                {focusAreas.length}개 영역
              </span>
            </div>
            {targetLevel && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-800">목표 레벨:</span>
                <Badge variant="outline">{targetLevel}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 시작 버튼 */}
      <div className="text-center">
        <Button
          onClick={handleStart}
          disabled={!canStart || isLoading}
          size="lg"
          className="px-8 py-3 text-lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              평가 준비중...
            </>
          ) : (
            <>
              평가 시작하기
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* 안내사항 */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-yellow-800 mb-2">평가 전 안내사항</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 조용한 환경에서 집중하여 평가받으세요</li>
            <li>• 발음 평가가 포함된 경우 마이크 사용 권한을 허용해주세요</li>
            <li>• 추측이나 찍기보다는 정확한 답변을 우선하세요</li>
            <li>• 평가 중 페이지를 새로고침하지 마세요</li>
            <li>• 모든 문제를 완료해야 정확한 결과를 받을 수 있습니다</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentStart;