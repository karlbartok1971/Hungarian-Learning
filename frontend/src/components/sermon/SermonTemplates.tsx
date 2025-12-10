'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Star,
  Heart,
  Crown,
  Mountain,
  Cross,
  Users,
  Calendar,
  ChevronRight,
  FileText,
  Lightbulb
} from 'lucide-react';

/**
 * T080 - 설교문 템플릿 및 구조 제안 시스템
 * 한국인 목회자를 위한 헝가리어 설교문 템플릿 라이브러리
 */

export interface SermonTemplate {
  id: string;
  title_korean: string;
  title_hungarian: string;
  category: 'expository' | 'topical' | 'textual' | 'narrative' | 'special';
  difficulty: 'A1' | 'A2' | 'B1' | 'B2';
  structure: {
    section: string;
    hungarian_title: string;
    korean_title: string;
    description: string;
    example_phrases: string[];
    time_estimate: number; // minutes
  }[];
  theological_themes: string[];
  target_occasions: string[];
  example_outline: string;
  hungarian_phrases: {
    opening: string[];
    transitions: string[];
    closing: string[];
    emphasis: string[];
  };
}

interface SermonTemplatesProps {
  onTemplateSelect: (template: SermonTemplate) => void;
  selectedDifficulty?: 'A1' | 'A2' | 'B1' | 'B2';
}

const sermonTemplates: SermonTemplate[] = [
  {
    id: 'basic-expository-a1',
    title_korean: '기본 강해설교 (A1 초급)',
    title_hungarian: 'Alapvető expozitórikus prédikáció',
    category: 'expository',
    difficulty: 'A1',
    structure: [
      {
        section: 'opening',
        hungarian_title: 'Megnyitás és köszöntő',
        korean_title: '인사 및 환영',
        description: '따뜻한 인사와 함께 예배를 시작합니다',
        example_phrases: [
          'Jó napot kívánok mindenkinek!',
          'Köszöntöm Önöket Isten házában.',
          'Örülök, hogy ma együtt lehetünk.'
        ],
        time_estimate: 2
      },
      {
        section: 'scripture_reading',
        hungarian_title: 'Szentírás olvasása',
        korean_title: '성경 봉독',
        description: '오늘의 본문을 천천히 읽고 소개합니다',
        example_phrases: [
          'A mai igénk a következő:',
          'Olvassuk együtt a Szentírást.',
          'Ez az Úr beszéde.'
        ],
        time_estimate: 3
      },
      {
        section: 'main_point_1',
        hungarian_title: 'Első fő pont',
        korean_title: '첫 번째 요점',
        description: '본문의 첫 번째 핵심 메시지를 전달합니다',
        example_phrases: [
          'Az első dolog, amit látunk...',
          'A szöveg azt tanítja nekünk...',
          'Isten megmutatja nekünk...'
        ],
        time_estimate: 8
      },
      {
        section: 'main_point_2',
        hungarian_title: 'Második fő pont',
        korean_title: '두 번째 요점',
        description: '본문의 두 번째 핵심 메시지를 설명합니다',
        example_phrases: [
          'A második fontos dolog...',
          'Tovább megyünk és látjuk...',
          'Az Úr ezt is mondja nekünk...'
        ],
        time_estimate: 8
      },
      {
        section: 'application',
        hungarian_title: 'Gyakorlati alkalmazás',
        korean_title: '실제적 적용',
        description: '말씀을 우리 삶에 어떻게 적용할지 나눕니다',
        example_phrases: [
          'Mit jelent ez számunkra?',
          'Hogyan élhetjük ezt meg?',
          'Az Úr ezt kéri tőlünk...'
        ],
        time_estimate: 5
      },
      {
        section: 'closing',
        hungarian_title: 'Lezárás és imádság',
        korean_title: '마무리 및 기도',
        description: '설교를 마무리하고 기도로 마칩니다',
        example_phrases: [
          'Imádkozzunk együtt.',
          'Az Úr áldjon meg bennünket.',
          'Ámen.'
        ],
        time_estimate: 4
      }
    ],
    theological_themes: ['하나님의 사랑', '구원', '믿음', '순종'],
    target_occasions: ['주일예배', '수요예배', '소그룹 모임'],
    example_outline: `
1. 인사 및 환영 (2분)
   - 따뜻한 인사
   - 오늘의 주제 소개

2. 성경 봉독 (3분)
   - 본문 읽기
   - 배경 설명

3. 첫 번째 요점 (8분)
   - 본문의 첫 번째 교훈
   - 예시와 설명

4. 두 번째 요점 (8분)
   - 본문의 두 번째 교훈
   - 삶의 적용

5. 실제적 적용 (5분)
   - 우리 삶에의 적용
   - 실천 방안

6. 마무리 및 기도 (4분)
   - 요약
   - 마침 기도
    `,
    hungarian_phrases: {
      opening: [
        'Jó napot kívánok mindenkinek!',
        'Köszöntöm Önöket az Úr házában.',
        'Örülök, hogy ma együtt lehetünk.',
        'Az Úr nevében köszöntöm Önöket.'
      ],
      transitions: [
        'Most pedig térjünk át a következőre...',
        'A másik fontos dolog...',
        'Tovább folytatva...',
        'És most látjuk azt is, hogy...'
      ],
      closing: [
        'Imádkozzunk együtt.',
        'Az Úr áldjon meg bennünket.',
        'Kérjük az Úr áldását.',
        'Ámen és ámen.'
      ],
      emphasis: [
        'Ez nagyon fontos!',
        'Figyeljük meg ezt!',
        'Ez az üzenet lényege.',
        'Ezt ne felejtsük el!'
      ]
    }
  },
  {
    id: 'topical-faith-a2',
    title_korean: '주제별 설교 - 믿음 (A2 중급)',
    title_hungarian: 'Tematikus prédikáció - A hit',
    category: 'topical',
    difficulty: 'A2',
    structure: [
      {
        section: 'opening',
        hungarian_title: 'Bevezetés és téma bemutatása',
        korean_title: '도입 및 주제 소개',
        description: '믿음이라는 주제를 흥미롭게 소개합니다',
        example_phrases: [
          'Ma a hitről szeretnék beszélni.',
          'Mi az a hit, amit Isten vár el tőlünk?',
          'A hit nem csak szó, hanem élet.'
        ],
        time_estimate: 4
      },
      {
        section: 'definition',
        hungarian_title: 'A hit meghatározása',
        korean_title: '믿음의 정의',
        description: '성경적 관점에서 믿음이 무엇인지 설명합니다',
        example_phrases: [
          'A Szentírás szerint a hit...',
          'Pál apostol így fogalmaz...',
          'A hit látni azt, ami láthatatlan.'
        ],
        time_estimate: 6
      },
      {
        section: 'examples',
        hungarian_title: 'Bibliai példák',
        korean_title: '성경의 믿음 예시들',
        description: '성경에 나오는 믿음의 영웅들을 소개합니다',
        example_phrases: [
          'Ábrahám hite példa nekünk.',
          'Mózesnek is kellett hinnie.',
          'Dávid király hogyan hitt?'
        ],
        time_estimate: 8
      },
      {
        section: 'challenges',
        hungarian_title: 'A hit kihívásai',
        korean_title: '믿음의 도전들',
        description: '현대인이 믿음에서 겪는 어려움들을 다룹니다',
        example_phrases: [
          'Néha nehéz hinni.',
          'A kételyek természetesek.',
          'Isten megérti küzdelmünket.'
        ],
        time_estimate: 6
      },
      {
        section: 'growth',
        hungarian_title: 'A hit növekedése',
        korean_title: '믿음의 성장',
        description: '믿음을 어떻게 키워갈 수 있는지 제시합니다',
        example_phrases: [
          'A hit növekedhet.',
          'Mit tehetünk a hitünkért?',
          'Az Úr segít nekünk hinni.'
        ],
        time_estimate: 6
      },
      {
        section: 'closing',
        hungarian_title: 'Záró gondolatok',
        korean_title: '마무리 말씀',
        description: '믿음으로 살아가자는 도전과 격려로 마무리합니다',
        example_phrases: [
          'Éljünk hittel!',
          'Az Úr hűséges hozzánk.',
          'Bízzunk Őbenne minden napban.'
        ],
        time_estimate: 5
      }
    ],
    theological_themes: ['믿음', '신뢰', '순종', '성장', '도전'],
    target_occasions: ['주일예배', '신앙강좌', '청년부 모임'],
    example_outline: `
1. 도입 및 주제 소개 (4분)
   - 믿음의 중요성
   - 오늘의 질문들

2. 믿음의 정의 (6분)
   - 히브리서 11:1 중심
   - 성경적 믿음의 특징

3. 성경의 믿음 예시들 (8분)
   - 아브라함의 믿음
   - 모세의 믿음
   - 다윗의 믿음

4. 믿음의 도전들 (6분)
   - 현대인의 어려움
   - 의심과 두려움 극복

5. 믿음의 성장 (6분)
   - 믿음 성장 방법
   - 실천적 조언

6. 마무리 말씀 (5분)
   - 믿음으로 사는 삶
   - 격려와 도전
    `,
    hungarian_phrases: {
      opening: [
        'Ma a hitről szeretnék beszélni.',
        'Mi az a hit?',
        'Miért olyan fontos a hit?',
        'A hit változtatja meg az életet.'
      ],
      transitions: [
        'Most pedig nézzük meg...',
        'Térjünk át a következő pontra...',
        'Ez vezet bennünket arra...',
        'Mindez azt jelenti, hogy...'
      ],
      closing: [
        'Éljünk hittel!',
        'Bízzunk az Úrban!',
        'A hit győzelem.',
        'Az Úr velünk van.'
      ],
      emphasis: [
        'Ez a kulcs!',
        'Itt van a titok!',
        'Ez nagyon fontos számunkra!',
        'Ezt ne felejtsük el soha!'
      ]
    }
  },
  {
    id: 'narrative-parable-b1',
    title_korean: '내러티브 설교 - 예수님의 비유 (B1 고급)',
    title_hungarian: 'Narratív prédikáció - Jézus példázatai',
    category: 'narrative',
    difficulty: 'B1',
    structure: [
      {
        section: 'context_setting',
        hungarian_title: 'Történelmi és kulturális háttér',
        korean_title: '역사적, 문화적 배경',
        description: '비유가 주어진 상황과 당시 문화를 설명합니다',
        example_phrases: [
          'Jézus korában az emberek...',
          'A korabeli zsidó kultúrában...',
          'A hallgatóság számára ez azt jelentette...'
        ],
        time_estimate: 5
      },
      {
        section: 'story_retelling',
        hungarian_title: 'A példázat újramondása',
        korean_title: '비유 다시 들려주기',
        description: '비유를 생동감 있게 다시 이야기합니다',
        example_phrases: [
          'Képzeljük el együtt...',
          'A történet így szól...',
          'Mintha ott lennénk velük...'
        ],
        time_estimate: 7
      },
      {
        section: 'characters_analysis',
        hungarian_title: 'Szereplők elemzése',
        korean_title: '등장인물 분석',
        description: '비유 속 인물들의 의미와 상징을 해석합니다',
        example_phrases: [
          'Az első szereplő azt képviseli...',
          'Ez a figura ránk emlékeztet...',
          'Mindannyian felismerhetjük magunkat...'
        ],
        time_estimate: 8
      },
      {
        section: 'central_message',
        hungarian_title: 'A központi üzenet feltárása',
        korean_title: '중심 메시지 발견',
        description: '비유의 핵심 교훈을 명확히 제시합니다',
        example_phrases: [
          'Jézus fő üzenete itt az, hogy...',
          'A példázat szíve ez...',
          'Isten így akarja, hogy értsük...'
        ],
        time_estimate: 8
      },
      {
        section: 'modern_application',
        hungarian_title: 'Mai alkalmazás',
        korean_title: '현대적 적용',
        description: '고대의 교훈을 현대 상황에 적용합니다',
        example_phrases: [
          'A mai világban ez azt jelenti...',
          'Számunkra ez úgy néz ki...',
          'Hogyan élhetjük meg ezt ma?'
        ],
        time_estimate: 7
      },
      {
        section: 'personal_challenge',
        hungarian_title: 'Személyes kihívás',
        korean_title: '개인적 도전',
        description: '각자의 삶에 구체적으로 적용하도록 도전합니다',
        example_phrases: [
          'Mit kér tőlem az Úr?',
          'Hol kell változnom?',
          'Milyen lépéseket tegyem?'
        ],
        time_estimate: 5
      }
    ],
    theological_themes: ['하나님의 나라', '용서', '사랑', '회개', '구원'],
    target_occasions: ['주일예배', '부활절', '추수감사절', '특별집회'],
    example_outline: `
1. 역사적, 문화적 배경 (5분)
   - 예수님 시대의 상황
   - 청중들의 일상 이해
   - 비유의 맥락 설정

2. 비유 다시 들려주기 (7분)
   - 생동감 있는 재화
   - 세부 묘사와 감정
   - 당시 상황 재현

3. 등장인물 분석 (8분)
   - 각 인물의 상징적 의미
   - 우리 자신과의 연결점
   - 인물들 간의 관계

4. 중심 메시지 발견 (8분)
   - 예수님의 핵심 교훈
   - 하나님 나라의 진리
   - 영적 교훈 도출

5. 현대적 적용 (7분)
   - 21세기 상황에 적용
   - 구체적 예시들
   - 실제적 지침

6. 개인적 도전 (5분)
   - 각자에게 주는 도전
   - 실천 방안 제시
   - 기도와 다짐
    `,
    hungarian_phrases: {
      opening: [
        'Jézus csodálatos példázatot mondott.',
        'Egy történetet szeretnék elmesélni.',
        'Képzeljük el együtt...',
        'Jézus így tanított...'
      ],
      transitions: [
        'Most nézzük meg közelebbről...',
        'Ez arra vezet bennünket...',
        'A következő fontos elem...',
        'Ebből következik, hogy...'
      ],
      closing: [
        'Ez Jézus üzenete nekünk.',
        'Válaszoljunk az Úr hívására!',
        'Éljünk eszerint a példázat szerint!',
        'Az Úr segítsen megélnünk ezt!'
      ],
      emphasis: [
        'Ez a példázat kulcsa!',
        'Itt rejlik a titok!',
        'Ez megváltoztatja az életünket!',
        'Figyeljük meg ezt a részletet!'
      ]
    }
  },
  {
    id: 'special-christmas-b2',
    title_korean: '특별예배 설교 - 크리스마스 (B2 최고급)',
    title_hungarian: 'Különleges istentisztelet - Karácsony',
    category: 'special',
    difficulty: 'B2',
    structure: [
      {
        section: 'festive_opening',
        hungarian_title: 'Ünnepi megnyitás',
        korean_title: '축제적 시작',
        description: '크리스마스의 기쁨과 경이로움으로 설교를 시작합니다',
        example_phrases: [
          'Áldott karácsonyi ünnepet kívánok!',
          'Ma az egész világ örül...',
          'Ez a legcsodálatosabb nap az évben.'
        ],
        time_estimate: 3
      },
      {
        section: 'incarnation_mystery',
        hungarian_title: 'A megtestesülés misztériuma',
        korean_title: '성육신의 신비',
        description: '하나님이 사람이 되신 놀라운 진리를 깊이 있게 다룹니다',
        example_phrases: [
          'Isten emberré lett - felfoghatatlan!',
          'A Végtelen végesbe zárkózott.',
          'A Mindenható kisbabává lett.'
        ],
        time_estimate: 8
      },
      {
        section: 'prophetic_fulfillment',
        hungarian_title: 'Prófétai beteljesedés',
        korean_title: '예언의 성취',
        description: '구약의 예언들이 어떻게 예수님께서 성취되었는지 설명합니다',
        example_phrases: [
          'Évszázadok óta várták...',
          'A próféták ezt jövendölték...',
          'Minden beteljesedett Betlehemben.'
        ],
        time_estimate: 7
      },
      {
        section: 'theological_reflection',
        hungarian_title: 'Teológiai elmélkedés',
        korean_title: '신학적 성찰',
        description: '크리스마스의 깊은 신학적 의미를 성찰합니다',
        example_phrases: [
          'Mit jelent számunkra a megtestesülés?',
          'Isten így mutatta meg szeretetét.',
          'A kárhozattól a megváltásig.'
        ],
        time_estimate: 10
      },
      {
        section: 'personal_transformation',
        hungarian_title: 'Személyes átalakulás',
        korean_title: '개인적 변화',
        description: '크리스마스가 우리 각자에게 가져다주는 변화를 다룹니다',
        example_phrases: [
          'Karácsony megváltoztatja a szívünket.',
          'Új életet kínál mindenkinek.',
          'Mi is újjászülethetünk.'
        ],
        time_estimate: 8
      },
      {
        section: 'universal_invitation',
        hungarian_title: 'Egyetemes meghívás',
        korean_title: '만인을 향한 초청',
        description: '모든 사람을 향한 하나님의 사랑과 초청으로 마무리합니다',
        example_phrases: [
          'Jézus mindenkiért jött.',
          'Senki sincs kizárva a szeretetből.',
          'Jöjjetek mindnyájan!'
        ],
        time_estimate: 6
      }
    ],
    theological_themes: ['성육신', '구원', '하나님의 사랑', '구약 성취', '새로운 탄생'],
    target_occasions: ['크리스마스 이브', '성탄절', '송년예배'],
    example_outline: `
1. 축제적 시작 (3분)
   - 크리스마스 축복 인사
   - 기쁨과 감사의 마음
   - 함께 모인 것의 의미

2. 성육신의 신비 (8분)
   - 하나님이 사람이 되심
   - 무한이 유한 안으로
   - 신성과 인성의 결합

3. 예언의 성취 (7분)
   - 구약의 메시아 예언
   - 베들레헴에서의 성취
   - 하나님의 신실하심

4. 신학적 성찰 (10분)
   - 성육신의 목적과 의미
   - 구원 역사의 절정
   - 삼위일체 하나님의 사랑

5. 개인적 변화 (8분)
   - 크리스마스가 주는 변화
   - 새로운 삶의 가능성
   - 개인적 만남의 초대

6. 만인을 향한 초청 (6분)
   - 보편적 구원의 초대
   - 모든 민족을 향한 사랑
   - 크리스마스의 영원한 의미
    `,
    hungarian_phrases: {
      opening: [
        'Áldott karácsonyi ünnepet kívánok mindenkinek!',
        'Ma az angyalok éneke újra felcsendül.',
        'Eljött a várt Messiás!',
        'Örüljünk és ujjongjunk!'
      ],
      transitions: [
        'Ugyanakkor el kell gondolkodnunk azon...',
        'Ez mélyebb jelentést is hordoz...',
        'Tovább menve felismerhetjük...',
        'Mindez arra mutat, hogy...'
      ],
      closing: [
        'Ez a karácsony igazi üzenete!',
        'Fogadjuk be szívünkbe a kis Jézust!',
        'Áldott karácsonyt mindenkinek!',
        'Az Úr Jézus áldása legyen velünk!'
      ],
      emphasis: [
        'Ez a keresztény hit szíve!',
        'Itt van minden remény!',
        'Ez változtatja meg a világot!',
        'Ez a legnagyobb ajándék!'
      ]
    }
  }
];

const SermonTemplates: React.FC<SermonTemplatesProps> = ({
  onTemplateSelect,
  selectedDifficulty
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<SermonTemplate | null>(null);

  const filteredTemplates = sermonTemplates.filter(template => {
    const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory;
    const difficultyMatch = !selectedDifficulty || template.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const categoryStats = {
    expository: sermonTemplates.filter(t => t.category === 'expository').length,
    topical: sermonTemplates.filter(t => t.category === 'topical').length,
    textual: sermonTemplates.filter(t => t.category === 'textual').length,
    narrative: sermonTemplates.filter(t => t.category === 'narrative').length,
    special: sermonTemplates.filter(t => t.category === 'special').length
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'expository': return <BookOpen className="w-4 h-4" />;
      case 'topical': return <Lightbulb className="w-4 h-4" />;
      case 'textual': return <FileText className="w-4 h-4" />;
      case 'narrative': return <Users className="w-4 h-4" />;
      case 'special': return <Star className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'A1': return 'bg-green-100 text-green-800';
      case 'A2': return 'bg-blue-100 text-blue-800';
      case 'B1': return 'bg-orange-100 text-orange-800';
      case 'B2': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalTime = (template: SermonTemplate) => {
    return template.structure.reduce((total, section) => total + section.time_estimate, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">설교문 템플릿 라이브러리</h2>
        <Badge variant="secondary">
          {filteredTemplates.length}개 템플릿
        </Badge>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="expository" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            강해 ({categoryStats.expository})
          </TabsTrigger>
          <TabsTrigger value="topical" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            주제별 ({categoryStats.topical})
          </TabsTrigger>
          <TabsTrigger value="narrative" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            내러티브 ({categoryStats.narrative})
          </TabsTrigger>
          <TabsTrigger value="special" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            특별 ({categoryStats.special})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getCategoryIcon(template.category)}
                      <span className="capitalize">{template.category}</span>
                    </div>
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{template.title_korean}</CardTitle>
                  <p className="text-sm text-gray-600 italic">
                    {template.title_hungarian}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>총 {getTotalTime(template)}분</span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">적용 상황:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.target_occasions.slice(0, 2).map((occasion) => (
                          <Badge key={occasion} variant="outline" className="text-xs">
                            {occasion}
                          </Badge>
                        ))}
                        {template.target_occasions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.target_occasions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">주요 주제:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.theological_themes.slice(0, 3).map((theme) => (
                          <Badge key={theme} variant="secondary" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTemplateSelect(template);
                      }}
                      className="w-full mt-4"
                      size="sm"
                    >
                      템플릿 사용하기 <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedTemplate && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  설교 구조 미리보기
                  <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                    {selectedTemplate.difficulty}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg mb-2">{selectedTemplate.title_korean}</h4>
                  <p className="text-sm text-gray-600 italic mb-4">
                    {selectedTemplate.title_hungarian}
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium">설교 구조:</h5>
                  {selectedTemplate.structure.map((section, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="font-medium">{index + 1}. {section.korean_title}</h6>
                        <Badge variant="outline" className="text-xs">
                          {section.time_estimate}분
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 italic">
                        {section.hungarian_title}
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        {section.description}
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600">예시 표현:</p>
                        <div className="flex flex-wrap gap-1">
                          {section.example_phrases.slice(0, 2).map((phrase, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {phrase}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={() => onTemplateSelect(selectedTemplate)}
                    className="w-full"
                  >
                    이 템플릿으로 설교 작성 시작하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SermonTemplates;
export { sermonTemplates };