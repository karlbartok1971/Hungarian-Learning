// 헝가리어 문법 커리큘럼 데이터
// A1-B2 CEFR 기준 체계적 문법 학습 과정

export interface GrammarLesson {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  unit: number;
  lesson: number;
  title: string;
  titleKorean: string;
  category: GrammarCategory;
  difficulty: number; // 1-5
  estimatedMinutes: number;
  prerequisites: string[]; // lesson IDs
  objectives: string[];
  explanation: GrammarExplanation;
  examples: GrammarExample[];
  exercises: GrammarExercise[];
  notes: string[];
  hungarianSpecifics: string[];
}

export type GrammarCategory =
  | 'noun_declension' | 'verb_conjugation' | 'adjective' | 'pronoun'
  | 'adverb' | 'preposition' | 'sentence_structure' | 'word_order'
  | 'particle' | 'modal' | 'conditional' | 'passive' | 'subjunctive';

export interface GrammarExplanation {
  korean: string;
  hungarian: string;
  keyPoints: string[];
  rules: GrammarRule[];
  commonMistakes: string[];
}

export interface GrammarRule {
  rule: string;
  explanation: string;
  pattern: string;
  exceptions?: string[];
}

export interface GrammarExample {
  hungarian: string;
  korean: string;
  romanization?: string;
  breakdown?: WordBreakdown[];
  audioUrl?: string;
}

export interface WordBreakdown {
  word: string;
  role: string;
  explanation: string;
}

export interface GrammarExercise {
  id: string;
  type: 'fill_blank' | 'multiple_choice' | 'translation' | 'conjugation' | 'declension' | 'word_order';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  hints: string[];
}

// A1 Level Grammar Curriculum
export const A1_GRAMMAR_CURRICULUM: GrammarLesson[] = [
  {
    id: 'A1-01-01',
    level: 'A1',
    unit: 1,
    lesson: 1,
    title: 'Alapvető mondatszerkezet',
    titleKorean: '기본 문장 구조',
    category: 'sentence_structure',
    difficulty: 1,
    estimatedMinutes: 30,
    prerequisites: [],
    objectives: [
      '헝가리어 기본 어순(SOV) 이해하기',
      'van/vannak 동사의 기본 사용법 익히기',
      '간단한 서술문 만들기'
    ],
    explanation: {
      korean: '헝가리어는 주어-목적어-동사(SOV) 어순을 가진 언어입니다. 영어나 한국어와 다른 특별한 구조를 가지고 있어요.',
      hungarian: 'A magyar nyelv szabad szórendű nyelv, de az alapvető szórend: alany-tárgy-állítmány.',
      keyPoints: [
        '기본 어순: 주어 + 목적어 + 동사',
        '"van/vannak" = "이다/있다"',
        '문장 끝에 동사가 온다',
        '강조하고 싶은 단어를 앞으로 이동 가능'
      ],
      rules: [
        {
          rule: '기본 어순 (SOV)',
          explanation: '주어 + 목적어 + 동사 순서',
          pattern: '[주어] + [목적어] + [동사]',
          exceptions: ['강조 표현시 어순 변경 가능']
        },
        {
          rule: 'van/vannak 사용법',
          explanation: '단수는 van, 복수는 vannak',
          pattern: '[주어] + van/vannak',
          exceptions: ['3인칭에서는 생략 가능']
        }
      ],
      commonMistakes: [
        '영어식 어순(SVO) 사용',
        'van/vannak 생략해야 할 때 사용',
        '복수형에서 van 사용'
      ]
    },
    examples: [
      {
        hungarian: 'Péter tanár.',
        korean: '페테르는 선생님이다.',
        romanization: 'Péter tanár',
        breakdown: [
          { word: 'Péter', role: '주어', explanation: '사람 이름' },
          { word: 'tanár', role: '서술어', explanation: '선생님 (van 생략)' }
        ]
      },
      {
        hungarian: 'A lányok iskolában vannak.',
        korean: '소녀들은 학교에 있다.',
        romanization: 'A lányok iskolában vannak',
        breakdown: [
          { word: 'A lányok', role: '주어', explanation: '그 소녀들 (복수)' },
          { word: 'iskolában', role: '장소', explanation: '학교에서 (-ban/ben: 장소 격)' },
          { word: 'vannak', role: '동사', explanation: '있다 (복수형)' }
        ]
      },
      {
        hungarian: 'Én könyvet olvasok.',
        korean: '나는 책을 읽는다.',
        romanization: 'Én könyvet olvasok',
        breakdown: [
          { word: 'Én', role: '주어', explanation: '나는' },
          { word: 'könyvet', role: '목적어', explanation: '책을 (-t: 대격)' },
          { word: 'olvasok', role: '동사', explanation: '읽는다 (1인칭 단수)' }
        ]
      }
    ],
    exercises: [
      {
        id: 'A1-01-01-ex1',
        type: 'word_order',
        question: '올바른 헝가리어 어순으로 배열하세요: "tanár / Péter"',
        correctAnswer: 'Péter tanár.',
        explanation: '주어(Péter) + 서술어(tanár) 순서입니다. van은 생략됩니다.',
        hints: ['주어가 먼저 온다', 'van은 보통 생략한다']
      },
      {
        id: 'A1-01-01-ex2',
        type: 'fill_blank',
        question: 'A gyerekek az udvaron ____. (아이들은 마당에 있다)',
        correctAnswer: 'vannak',
        explanation: '복수 주어이므로 vannak을 사용합니다.',
        hints: ['복수형 동사가 필요하다', 'van의 복수형은?']
      },
      {
        id: 'A1-01-01-ex3',
        type: 'translation',
        question: '다음을 헝가리어로 번역하세요: "나는 사과를 먹는다"',
        correctAnswer: 'Én almát eszem.',
        explanation: 'Én(나는) + almát(사과를-대격) + eszem(먹는다-1인칭단수)',
        hints: ['SOV 어순을 기억하세요', '목적어에는 -t가 붙는다']
      }
    ],
    notes: [
      '헝가리어는 격변화가 풍부한 언어입니다',
      '동사 활용이 주어에 따라 변합니다',
      '문맥상 명확할 때 주어 생략 가능합니다'
    ],
    hungarianSpecifics: [
      '한국어와 달리 목적어가 동사 바로 앞에 온다',
      'van/vannak은 존재를 나타내지만 종종 생략된다',
      '강조하려는 부분을 문장 맨 앞으로 이동시킬 수 있다'
    ]
  },

  {
    id: 'A1-01-02',
    level: 'A1',
    unit: 1,
    lesson: 2,
    title: 'Névmások - személyes névmások',
    titleKorean: '대명사 - 인칭대명사',
    category: 'pronoun',
    difficulty: 1,
    estimatedMinutes: 25,
    prerequisites: ['A1-01-01'],
    objectives: [
      '헝가리어 인칭대명사 암기하기',
      '단수/복수 구분하기',
      '문장에서 올바르게 사용하기'
    ],
    explanation: {
      korean: '헝가리어 인칭대명사는 한국어와 유사하게 인칭과 수에 따라 변합니다. 주격형을 먼저 배워보겠습니다.',
      hungarian: 'A személyes névmások a magyar nyelvben személyek és számok szerint változnak.',
      keyPoints: [
        '1인칭: én(나), mi(우리)',
        '2인칭: te(너), ti(너희)/Ön(당신)-존칭, Önök(당신들)',
        '3인칭: ő(그/그녀), ők(그들)',
        '존칭 표현 주의'
      ],
      rules: [
        {
          rule: '인칭대명사 기본형',
          explanation: '주격(주어 역할)으로 사용',
          pattern: '인칭 + 수',
          exceptions: ['Ön/Önök은 3인칭 동사 활용 사용']
        }
      ],
      commonMistakes: [
        'Ön을 2인칭 동사와 함께 사용',
        'ő의 성별 구분하려 함',
        'te와 Ön의 상황별 구분 실수'
      ]
    },
    examples: [
      {
        hungarian: 'Én tanár vagyok.',
        korean: '나는 선생님이다.',
        breakdown: [
          { word: 'Én', role: '주어', explanation: '1인칭 단수 주격' },
          { word: 'tanár', role: '서술어', explanation: '선생님' },
          { word: 'vagyok', role: '동사', explanation: '이다 (1인칭 단수 형태)' }
        ]
      },
      {
        hungarian: 'Te diák vagy.',
        korean: '너는 학생이다.',
        breakdown: [
          { word: 'Te', role: '주어', explanation: '2인칭 단수 주격' },
          { word: 'diák', role: '서술어', explanation: '학생' },
          { word: 'vagy', role: '동사', explanation: '이다 (2인칭 단수 형태)' }
        ]
      },
      {
        hungarian: 'Ők orvosok.',
        korean: '그들은 의사들이다.',
        breakdown: [
          { word: 'Ők', role: '주어', explanation: '3인칭 복수 주격' },
          { word: 'orvosok', role: '서술어', explanation: '의사들 (복수)' }
        ]
      }
    ],
    exercises: [
      {
        id: 'A1-01-02-ex1',
        type: 'multiple_choice',
        question: '"우리"를 뜻하는 헝가리어는?',
        options: ['mi', 'ti', 'ők', 'Ön'],
        correctAnswer: 'mi',
        explanation: 'mi는 1인칭 복수 "우리"입니다.',
        hints: ['1인칭 복수를 찾으세요']
      },
      {
        id: 'A1-01-02-ex2',
        type: 'fill_blank',
        question: '____ orvos vagy. (너는 의사다)',
        correctAnswer: 'Te',
        explanation: '2인칭 단수 주어는 Te입니다.',
        hints: ['2인칭 단수 주격', '친근한 표현']
      },
      {
        id: 'A1-01-02-ex3',
        type: 'translation',
        question: '"그녀는 간호사다"를 헝가리어로',
        correctAnswer: 'Ő ápoló.',
        explanation: 'Ő는 성별 구분 없이 3인칭 단수, ápoló는 간호사',
        hints: ['ő는 남녀 공통', '직업명 확인']
      }
    ],
    notes: [
      'Ön/Önök은 존칭이지만 문법적으로는 3인칭 취급',
      'ő는 남성/여성 구분하지 않음',
      '문맥상 명확할 때 인칭대명사 생략 가능'
    ],
    hungarianSpecifics: [
      '한국어와 달리 성별 구분이 없다 (ő)',
      '존칭 표현(Ön)이 있지만 3인칭 활용을 사용한다',
      '인칭대명사 생략이 매우 흔하다'
    ]
  },

  {
    id: 'A1-01-03',
    level: 'A1',
    unit: 1,
    lesson: 3,
    title: 'A van ige ragozása',
    titleKorean: 'van 동사의 활용',
    category: 'verb_conjugation',
    difficulty: 2,
    estimatedMinutes: 35,
    prerequisites: ['A1-01-01', 'A1-01-02'],
    objectives: [
      'van 동사의 전체 활용 익히기',
      '인칭별 형태 구분하기',
      '생략 규칙 이해하기'
    ],
    explanation: {
      korean: 'van("이다/있다") 동사는 헝가리어에서 가장 중요한 동사입니다. 인칭과 수에 따라 활용이 달라집니다.',
      hungarian: 'A "van" ige a magyar nyelv egyik legfontosabb igéje. Személyek és számok szerint ragozódik.',
      keyPoints: [
        '현재시제 활용 6가지 형태',
        '3인칭 단수에서 van 생략 가능',
        '존재와 위치 표현',
        'lennék(~하고 싶다) 형태도 있음'
      ],
      rules: [
        {
          rule: 'van 동사 현재 활용',
          explanation: '인칭별로 다른 형태 사용',
          pattern: 'én vagyok, te vagy, ő van, mi vagyunk, ti vagytok, ők vannak'
        },
        {
          rule: '3인칭 단수 생략',
          explanation: '서술어가 명사일 때 van 생략 가능',
          pattern: 'Péter tanár. (= Péter tanár van.)',
          exceptions: ['강조나 대조할 때는 생략하지 않음']
        }
      ],
      commonMistakes: [
        '모든 상황에서 van 생략',
        '인칭 활용 혼동',
        '복수에서 van 사용'
      ]
    },
    examples: [
      {
        hungarian: 'Én itt vagyok.',
        korean: '나는 여기 있다.',
        breakdown: [
          { word: 'Én', role: '주어', explanation: '1인칭 단수' },
          { word: 'itt', role: '부사', explanation: '여기에' },
          { word: 'vagyok', role: '동사', explanation: 'van의 1인칭 단수형' }
        ]
      },
      {
        hungarian: 'A könyv az asztalon van.',
        korean: '책은 탁자 위에 있다.',
        breakdown: [
          { word: 'A könyv', role: '주어', explanation: '그 책' },
          { word: 'az asztalon', role: '장소', explanation: '탁자 위에' },
          { word: 'van', role: '동사', explanation: '3인칭 단수 (생략 불가 - 위치 강조)' }
        ]
      }
    ],
    exercises: [
      {
        id: 'A1-01-03-ex1',
        type: 'conjugation',
        question: 'van 동사를 "mi"와 함께 활용하세요',
        correctAnswer: 'vagyunk',
        explanation: '1인칭 복수는 vagyunk입니다.',
        hints: ['1인칭 복수 활용', '-unk 어미']
      }
    ],
    notes: [
      'van은 불규칙 동사입니다',
      '과거형과 미래형도 중요하니 나중에 배웁니다'
    ],
    hungarianSpecifics: [
      '한국어 "이다/있다"에 해당하는 만능 동사',
      '생략 규칙이 복잡하므로 주의 필요'
    ]
  }
];

// A2 Level Grammar Curriculum
export const A2_GRAMMAR_CURRICULUM: GrammarLesson[] = [
  {
    id: 'A2-01-01',
    level: 'A2',
    unit: 1,
    lesson: 1,
    title: 'Főnévi igenév és -hat/-het',
    titleKorean: '동명사와 가능 표현 (-hat/-het)',
    category: 'modal',
    difficulty: 3,
    estimatedMinutes: 40,
    prerequisites: ['A1-01-01', 'A1-01-02', 'A1-01-03'],
    objectives: [
      '-hat/-het 가능 표현 익히기',
      '동사 + -ni 동명사 형태 배우기',
      '문장에서 정확히 활용하기'
    ],
    explanation: {
      korean: '헝가리어에서 "할 수 있다"는 -hat/-het을 동사 어간에 붙여 표현합니다. 또한 -ni 형태로 동명사를 만들 수 있습니다.',
      hungarian: 'A magyar nyelvben a képességet a -hat/-het raggal fejezzük ki.',
      keyPoints: [
        '-hat/-het = "할 수 있다"',
        '모음조화 따라 -hat 또는 -het',
        '-ni = 동명사 (to + 동사)',
        '가능성과 허가 모두 표현'
      ],
      rules: [
        {
          rule: '모음조화 규칙',
          explanation: '후설모음은 -hat, 전설모음은 -het',
          pattern: 'olvas + hat = olvashat, ír + het = írhat'
        }
      ],
      commonMistakes: [
        '모음조화 규칙 무시',
        '동명사 -ni와 가능 -hat 혼동'
      ]
    },
    examples: [
      {
        hungarian: 'Tudok magyarul beszélni.',
        korean: '나는 헝가리어로 말할 수 있다.',
        breakdown: [
          { word: 'Tudok', role: '동사', explanation: '알다/할 수 있다' },
          { word: 'magyarul', role: '부사', explanation: '헝가리어로' },
          { word: 'beszélni', role: '동명사', explanation: '말하기 (beszél + ni)' }
        ]
      }
    ],
    exercises: [
      {
        id: 'A2-01-01-ex1',
        type: 'fill_blank',
        question: 'Nem _____ olvasni. (읽을 수 없다)',
        correctAnswer: 'tudok',
        explanation: 'tudni(알다) 동사의 1인칭 단수 부정형',
        hints: ['tud 동사 활용', '1인칭 단수']
      }
    ],
    notes: [
      '-hat/-het은 매우 생산적인 접미사입니다'
    ],
    hungarianSpecifics: [
      '모음조화가 매우 중요한 문법 요소'
    ]
  }
];

// 전체 커리큘럼 구조
export const HUNGARIAN_GRAMMAR_CURRICULUM = {
  A1: A1_GRAMMAR_CURRICULUM,
  A2: A2_GRAMMAR_CURRICULUM,
  B1: [], // TODO: B1 커리큘럼 추가
  B2: []  // TODO: B2 커리큘럼 추가
};

// 문법 카테고리별 설명
export const GRAMMAR_CATEGORIES = {
  noun_declension: {
    name: '명사 격변화',
    description: '헝가리어 명사의 18가지 격 변화',
    importance: 'high'
  },
  verb_conjugation: {
    name: '동사 활용',
    description: '동사의 시제, 인칭, 태 변화',
    importance: 'high'
  },
  sentence_structure: {
    name: '문장 구조',
    description: '어순과 문법적 관계',
    importance: 'high'
  },
  pronoun: {
    name: '대명사',
    description: '인칭, 소유, 지시 대명사',
    importance: 'medium'
  },
  adjective: {
    name: '형용사',
    description: '형용사의 용법과 비교급',
    importance: 'medium'
  },
  modal: {
    name: '법조동사',
    description: '가능, 의무, 추측 표현',
    importance: 'medium'
  }
};

export default HUNGARIAN_GRAMMAR_CURRICULUM;