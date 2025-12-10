// 스킬별 분석 컴포넌트
// Hungarian Learning Platform - Skill Breakdown Component

"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Mic,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface SkillBreakdownProps {
  data?: {
    vocabulary: {
      level: number;
      progress_percentage: number;
      weak_areas: string[];
      strong_areas: string[];
      retention_rate: number;
      learning_velocity: number;
      mastered_words: number;
      struggling_words: number;
    };
    pronunciation: {
      level: number;
      progress_percentage: number;
      weak_phonemes: string[];
      accuracy_trend: number[];
      most_improved_phonemes: string[];
      average_confidence_score: number;
    };
    grammar: {
      level: number;
      progress_percentage: number;
      difficult_concepts: string[];
      mastered_concepts: string[];
      syntax_accuracy: number;
      morphology_accuracy: number;
    };
  };
}

const SkillBreakdown: React.FC<SkillBreakdownProps> = ({ data }) => {
  if (!data) {
    return (
      <Card data-testid="skill-breakdown-section">
        <CardHeader>
          <CardTitle>스킬별 세부 분석</CardTitle>
          <CardDescription>각 영역별 학습 진도와 성과를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { vocabulary, pronunciation, grammar } = data;

  const getTrendIcon = (trend: number[]) => {
    if (trend.length < 2) return <Minus className="w-4 h-4 text-gray-500" />;
    
    const recent = trend[trend.length - 1];
    const previous = trend[trend.length - 2];
    
    if (recent > previous) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (recent < previous) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  return (
    <Card data-testid="skill-breakdown-section">
      <CardHeader>
        <CardTitle>스킬별 세부 분석</CardTitle>
        <CardDescription>각 영역별 학습 진도와 성과를 확인하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* 어휘 영역 */}
          <div className="space-y-4" data-testid="vocabulary-skill-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold">어휘 (Vocabulary)</h3>
                <Badge variant="outline">레벨 {vocabulary.level}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {vocabulary.progress_percentage}% 완료
              </div>
            </div>
            
            <Progress value={vocabulary.progress_percentage} className="h-3" data-testid="skill-chart" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">학습 현황</p>
                <div className="text-sm space-y-1">
                  <div>숙달한 단어: {vocabulary.mastered_words}개</div>
                  <div>어려운 단어: {vocabulary.struggling_words}개</div>
                  <div>학습 속도: {vocabulary.learning_velocity.toFixed(1)} 단어/일</div>
                  <div>기억 유지율: {(vocabulary.retention_rate * 100).toFixed(1)}%</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">강점 영역</p>
                <div className="flex flex-wrap gap-1">
                  {vocabulary.strong_areas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">약점 영역</p>
                <div className="flex flex-wrap gap-1">
                  {vocabulary.weak_areas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-red-100 text-red-800">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 발음 영역 */}
          <div className="space-y-4" data-testid="pronunciation-skill-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold">발음 (Pronunciation)</h3>
                <Badge variant="outline">레벨 {pronunciation.level}</Badge>
                {getTrendIcon(pronunciation.accuracy_trend)}
              </div>
              <div className="text-sm text-muted-foreground">
                {pronunciation.progress_percentage}% 완료
              </div>
            </div>
            
            <Progress value={pronunciation.progress_percentage} className="h-3" data-testid="skill-chart" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">성과 지표</p>
                <div className="text-sm space-y-1">
                  <div>평균 자신감: {(pronunciation.average_confidence_score * 100).toFixed(1)}%</div>
                  <div>정확도 추세: 
                    {pronunciation.accuracy_trend.length > 1 ? (
                      <span className={`ml-1 ${
                        pronunciation.accuracy_trend[pronunciation.accuracy_trend.length - 1] >
                        pronunciation.accuracy_trend[pronunciation.accuracy_trend.length - 2]
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {pronunciation.accuracy_trend[pronunciation.accuracy_trend.length - 1] >
                        pronunciation.accuracy_trend[pronunciation.accuracy_trend.length - 2]
                          ? '상승' : '하락'}
                      </span>
                    ) : '데이터 부족'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">개선된 음소</p>
                <div className="flex flex-wrap gap-1">
                  {pronunciation.most_improved_phonemes.map((phoneme, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                      {phoneme}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">어려운 음소</p>
                <div className="flex flex-wrap gap-1">
                  {pronunciation.weak_phonemes.map((phoneme, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-red-100 text-red-800">
                      {phoneme}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 문법 영역 */}
          <div className="space-y-4" data-testid="grammar-skill-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold">문법 (Grammar)</h3>
                <Badge variant="outline">레벨 {grammar.level}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {grammar.progress_percentage}% 완료
              </div>
            </div>
            
            <Progress value={grammar.progress_percentage} className="h-3" data-testid="skill-chart" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">정확도 분석</p>
                <div className="text-sm space-y-1">
                  <div>구문 정확도: {(grammar.syntax_accuracy * 100).toFixed(1)}%</div>
                  <div>형태소 정확도: {(grammar.morphology_accuracy * 100).toFixed(1)}%</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">숙달한 개념</p>
                <div className="flex flex-wrap gap-1">
                  {grammar.mastered_concepts.map((concept, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                      {concept}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">어려운 개념</p>
                <div className="flex flex-wrap gap-1">
                  {grammar.difficult_concepts.map((concept, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-red-100 text-red-800">
                      {concept}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillBreakdown;