'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Lightbulb,
  BookOpen,
  Target,
  Clock,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

/**
 * T080 - 설교 구조 제안 시스템
 * AI 기반 설교 구조 자동 생성 및 제안
 */

interface StructureSuggestion {
  id: string;
  title: string;
  description: string;
  estimated_time: number;
  structure_type: 'expository' | 'topical' | 'narrative' | 'textual';
  sections: {
    order: number;
    hungarian_title: string;
    korean_title: string;
    time_minutes: number;
    key_points: string[];
    suggested_phrases: string[];
    biblical_references?: string[];
  }[];
  theological_focus: string[];
  practical_applications: string[];
  transition_suggestions: string[];
}

interface SermonStructureSuggestionsProps {
  topic?: string;
  scriptureReference?: string;
  targetAudience?: string;
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2';
  onStructureSelect: (structure: StructureSuggestion) => void;
}

const SermonStructureSuggestions: React.FC<SermonStructureSuggestionsProps> = ({
  topic = '',
  scriptureReference = '',
  targetAudience = '',
  difficulty = 'A2',
  onStructureSelect
}) => {
  const [inputTopic, setInputTopic] = useState(topic);
  const [inputScripture, setInputScripture] = useState(scriptureReference);
  const [inputAudience, setInputAudience] = useState(targetAudience);
  const [suggestions, setSuggestions] = useState<StructureSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  // Mock AI 구조 제안 생성 (실제로는 백엔드 API 호출)
  const generateStructureSuggestions = async () => {
    setIsGenerating(true);

    // 실제 구현에서는 API 호출
    const mockSuggestions: StructureSuggestion[] = [
      {
        id: 'suggestion-1',
        title: '3-포인트 강해설교 구조',
        description: '본문을 세 개의 주요 포인트로 나누어 체계적으로 설명하는 전통적 강해설교 방식',
        estimated_time: 25,
        structure_type: 'expository',
        sections: [
          {
            order: 1,
            hungarian_title: 'Bevezetés és kontextus',
            korean_title: '도입 및 배경설명',
            time_minutes: 4,
            key_points: ['본문의 역사적 배경', '저자와 수신자', '문학적 장르'],
            suggested_phrases: [
              'A mai igénk így szól...',
              'Pál apostol ezt írta...',
              'A történelmi háttér...'
            ],
            biblical_references: [inputScripture]
          },
          {
            order: 2,
            hungarian_title: 'Első fő pont: [주제1]',
            korean_title: '첫 번째 요점: 하나님의 사랑',
            time_minutes: 7,
            key_points: ['본문에서 드러나는 하나님의 성품', '무조건적 사랑의 증거', '구체적 사례들'],
            suggested_phrases: [
              'Isten szeretete itt látható...',
              'A szöveg megmutatja...',
              'Ez azt jelenti számunkra...'
            ]
          },
          {
            order: 3,
            hungarian_title: 'Második fő pont: [주제2]',
            korean_title: '두 번째 요점: 우리의 응답',
            time_minutes: 7,
            key_points: ['사랑에 대한 우리의 응답', '믿음으로 살아가기', '실제적 순종'],
            suggested_phrases: [
              'Hogyan válaszoljunk?',
              'A mi feladatunk...',
              'Ezt így éljük meg...'
            ]
          },
          {
            order: 4,
            hungarian_title: 'Harmadik fő pont: [주제3]',
            korean_title: '세 번째 요점: 미래의 소망',
            time_minutes: 7,
            key_points: ['약속의 성취', '영원한 관점', '현재의 의미'],
            suggested_phrases: [
              'Az Úr megígérte...',
              'A jövő reménysége...',
              'Ez ad erőt nekünk...'
            ]
          }
        ],
        theological_focus: ['하나님의 사랑', '구원', '신뢰'],
        practical_applications: [
          '매일 하나님의 사랑을 묵상하기',
          '다른 사람들에게 사랑 실천하기',
          '어려운 상황에서도 하나님을 신뢰하기'
        ],
        transition_suggestions: [
          'Most térjünk át a következőre...',
          'A második fontos dolog...',
          'Ez vezet bennünket a harmadik pontra...'
        ]
      },
      {
        id: 'suggestion-2',
        title: '문제-해결 구조',
        description: '인간의 문제를 제시하고 복음으로 해결책을 제시하는 실용적 접근방식',
        estimated_time: 30,
        structure_type: 'topical',
        sections: [
          {
            order: 1,
            hungarian_title: 'A probléma felvetése',
            korean_title: '문제 제기',
            time_minutes: 5,
            key_points: ['현대인의 고민', '실제적 어려움', '공감대 형성'],
            suggested_phrases: [
              'Mindannyian tapasztaljuk...',
              'Ki ne ismerné ezt a helyzetet?',
              'Ez a probléma közös...'
            ]
          },
          {
            order: 2,
            hungarian_title: 'A probléma mélyebb elemzése',
            korean_title: '문제의 근본 원인',
            time_minutes: 8,
            key_points: ['죄의 결과', '관계의 단절', '영적 차원'],
            suggested_phrases: [
              'A gyökere itt van...',
              'Ez azért történik mert...',
              'A Biblia ezt mondja...'
            ]
          },
          {
            order: 3,
            hungarian_title: 'Isten megoldása',
            korean_title: '하나님의 해결책',
            time_minutes: 10,
            key_points: ['복음의 능력', '그리스도의 역사', '성령의 도우심'],
            suggested_phrases: [
              'Isten választ ad...',
              'Jézus ezt mondta...',
              'A megoldás itt van...'
            ]
          },
          {
            order: 4,
            hungarian_title: 'Gyakorlati alkalmazás',
            korean_title: '실천적 적용',
            time_minutes: 7,
            key_points: ['구체적 행동', '매일의 선택', '공동체적 실천'],
            suggested_phrases: [
              'Mit tehetünk?',
              'A gyakorlatban ez azt jelenti...',
              'Kezdjük el így...'
            ]
          }
        ],
        theological_focus: ['구원', '실천', '변화'],
        practical_applications: [
          '매일 기도하는 시간 갖기',
          '말씀 묵상 습관 기르기',
          '공동체와 함께 성장하기'
        ],
        transition_suggestions: [
          'De mi a megoldás?',
          'Isten másképp gondolkodik...',
          'Most nézzük meg, mit tehetünk...'
        ]
      },
      {
        id: 'suggestion-3',
        title: '내러티브 여행 구조',
        description: '성경 이야기를 따라가며 청중과 함께 영적 여행을 떠나는 스토리텔링 방식',
        estimated_time: 28,
        structure_type: 'narrative',
        sections: [
          {
            order: 1,
            hungarian_title: 'Az út kezdete',
            korean_title: '여행의 시작',
            time_minutes: 5,
            key_points: ['이야기 배경 설정', '등장인물 소개', '갈등의 시작'],
            suggested_phrases: [
              'Képzeljük el...',
              'Egy történet kezdődik...',
              'Velük tartunk ezen az úton...'
            ]
          },
          {
            order: 2,
            hungarian_title: 'Kihívások és akadályok',
            korean_title: '도전과 장애물들',
            time_minutes: 8,
            key_points: ['시련의 의미', '믿음의 시험', '인간의 한계'],
            suggested_phrases: [
              'Nehézségek jönnek...',
              'Úgy tűnik, hogy...',
              'A szereplők azt érzik...'
            ]
          },
          {
            order: 3,
            hungarian_title: 'Isten beavatkozása',
            korean_title: '하나님의 개입',
            time_minutes: 10,
            key_points: ['하나님의 신실하심', '예상치 못한 은혜', '구원의 역사'],
            suggested_phrases: [
              'De Isten...',
              'Váratlanul történik...',
              'Az Úr nem hagy el...'
            ]
          },
          {
            order: 4,
            hungarian_title: 'Az út vége és új kezdet',
            korean_title: '여행의 끝과 새로운 시작',
            time_minutes: 5,
            key_points: ['변화된 삶', '새로운 관점', '지속적 성장'],
            suggested_phrases: [
              'A történet vége...',
              'De ez csak a kezdet...',
              'Mi is hasonló úton járunk...'
            ]
          }
        ],
        theological_focus: ['하나님의 인도하심', '믿음의 여정', '성장'],
        practical_applications: [
          '자신의 영적 여정 돌아보기',
          '어려움 중에도 하나님 신뢰하기',
          '다른 사람들과 간증 나누기'
        ],
        transition_suggestions: [
          'A történet folytatódik...',
          'Most egy fordulópont jön...',
          'És akkor váratlanul...'
        ]
      }
    ];

    // 시뮬레이션 딜레이
    await new Promise(resolve => setTimeout(resolve, 2000));

    setSuggestions(mockSuggestions);
    setIsGenerating(false);
  };

  useEffect(() => {
    if (inputTopic || inputScripture) {
      generateStructureSuggestions();
    }
  }, [inputTopic, inputScripture, difficulty]);

  const getStructureTypeIcon = (type: string) => {
    switch (type) {
      case 'expository': return <BookOpen className="w-4 h-4" />;
      case 'topical': return <Target className="w-4 h-4" />;
      case 'narrative': return <MessageSquare className="w-4 h-4" />;
      case 'textual': return <Lightbulb className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getStructureTypeName = (type: string) => {
    switch (type) {
      case 'expository': return '강해설교';
      case 'topical': return '주제설교';
      case 'narrative': return '내러티브';
      case 'textual': return '본문설교';
      default: return '기타';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">AI 설교 구조 제안</h2>
        <p className="text-gray-600">
          주제나 본문을 입력하면 적절한 설교 구조를 제안해드립니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            설교 정보 입력
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">설교 주제</label>
            <Input
              placeholder="예: 하나님의 사랑, 믿음, 소망..."
              value={inputTopic}
              onChange={(e) => setInputTopic(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">성경 본문</label>
            <Input
              placeholder="예: 요한복음 3:16, 로마서 8:28..."
              value={inputScripture}
              onChange={(e) => setInputScripture(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">대상 청중</label>
            <Input
              placeholder="예: 청년, 장년, 새신자..."
              value={inputAudience}
              onChange={(e) => setInputAudience(e.target.value)}
            />
          </div>

          <Button
            onClick={generateStructureSuggestions}
            disabled={isGenerating || (!inputTopic && !inputScripture)}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                AI가 구조를 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                설교 구조 제안받기
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">제안된 설교 구조</h3>

          {suggestions.map((suggestion) => (
            <Card
              key={suggestion.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedSuggestion === suggestion.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedSuggestion(suggestion.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStructureTypeIcon(suggestion.structure_type)}
                    <Badge variant="secondary">
                      {getStructureTypeName(suggestion.structure_type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {suggestion.estimated_time}분
                  </div>
                </div>
                <CardTitle>{suggestion.title}</CardTitle>
                <p className="text-gray-600">{suggestion.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">설교 흐름:</h5>
                  <div className="space-y-2">
                    {suggestion.sections.map((section, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {section.order}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{section.korean_title}</span>
                            <Badge variant="outline" className="text-xs">
                              {section.time_minutes}분
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 italic">
                            {section.hungarian_title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h6 className="font-medium text-sm mb-2">신학적 초점:</h6>
                    <div className="flex flex-wrap gap-1">
                      {suggestion.theological_focus.map((focus, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h6 className="font-medium text-sm mb-2">실천적 적용:</h6>
                    <div className="space-y-1">
                      {suggestion.practical_applications.slice(0, 2).map((app, idx) => (
                        <p key={idx} className="text-xs text-gray-600">
                          • {app}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStructureSelect(suggestion);
                  }}
                  className="w-full"
                >
                  이 구조 사용하기 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedSuggestion && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="w-5 h-5" />
              선택된 구조 상세 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const selected = suggestions.find(s => s.id === selectedSuggestion);
              if (!selected) return null;

              return (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">각 섹션별 제안 표현:</h4>
                    <div className="space-y-3">
                      {selected.sections.map((section, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border">
                          <h5 className="font-medium text-sm mb-1">
                            {section.order}. {section.korean_title}
                          </h5>
                          <p className="text-xs text-gray-600 mb-2 italic">
                            {section.hungarian_title}
                          </p>
                          <div className="space-y-1">
                            <p className="text-xs font-medium">핵심 포인트:</p>
                            <ul className="text-xs text-gray-700">
                              {section.key_points.map((point, idx) => (
                                <li key={idx} className="ml-4">• {point}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">제안 표현:</p>
                            <div className="flex flex-wrap gap-1">
                              {section.suggested_phrases.map((phrase, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {phrase}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm mb-2">전환 표현 제안:</h5>
                    <div className="flex flex-wrap gap-1">
                      {selected.transition_suggestions.map((transition, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {transition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SermonStructureSuggestions;