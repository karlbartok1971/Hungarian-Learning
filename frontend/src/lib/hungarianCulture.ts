// 헝가리 전통 문화 요소들
export interface HungarianCulturalElement {
  id: string;
  name: string;
  nameKorean: string;
  type: 'pattern' | 'icon' | 'color' | 'achievement' | 'phrase';
  value: string;
  description: string;
  category?: string;
}

export const hungarianPatterns: HungarianCulturalElement[] = [
  {
    id: 'folk-pattern-1',
    name: 'Kalocsa Embroidery',
    nameKorean: '칼로차 자수',
    type: 'pattern',
    value: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cdefs%3E%3Cpattern id="kalocsa" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse"%3E%3Ccircle cx="25" cy="25" r="8" fill="%23dc2626" opacity="0.1"/%3E%3Cpath d="M20 25 Q25 20 30 25 Q25 30 20 25" fill="%2316a34a" opacity="0.15"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23kalocsa)"/%3E%3C/svg%3E',
    description: '칼로차 지역의 전통 꽃무늬 자수 패턴',
    category: 'folk-art'
  },
  {
    id: 'folk-pattern-2',
    name: 'Matyó Embroidery',
    nameKorean: '마토 자수',
    type: 'pattern',
    value: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cdefs%3E%3Cpattern id="matyo" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"%3E%3Ccircle cx="20" cy="20" r="6" fill="%23dc2626" opacity="0.08"/%3E%3Cpath d="M15 20 L25 20 M20 15 L20 25" stroke="%232563eb" stroke-width="1" opacity="0.1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23matyo)"/%3E%3C/svg%3E',
    description: '마토 민족의 전통 기하학적 자수 패턴',
    category: 'folk-art'
  }
];

export const hungarianIcons: HungarianCulturalElement[] = [
  {
    id: 'parliament-icon',
    name: 'Parliament Building',
    nameKorean: '국회의사당',
    type: 'icon',
    value: '🏛️',
    description: '부다페스트의 상징적 건물',
    category: 'landmark'
  },
  {
    id: 'thermal-bath-icon',
    name: 'Thermal Bath',
    nameKorean: '온천',
    type: 'icon',
    value: '♨️',
    description: '헝가리의 유명한 온천 문화',
    category: 'culture'
  },
  {
    id: 'paprika-icon',
    name: 'Paprika',
    nameKorean: '파프리카',
    type: 'icon',
    value: '🌶️',
    description: '헝가리의 대표적인 향신료',
    category: 'food'
  },
  {
    id: 'crown-icon',
    name: 'Holy Crown',
    nameKorean: '성 이슈트반 왕관',
    type: 'icon',
    value: '👑',
    description: '헝가리 왕국의 성스러운 왕관',
    category: 'history'
  },
  {
    id: 'violin-icon',
    name: 'Hungarian Violin',
    nameKorean: '헝가리 바이올린',
    type: 'icon',
    value: '🎻',
    description: '헝가리 전통 음악의 상징',
    category: 'music'
  },
  {
    id: 'wine-icon',
    name: 'Tokaj Wine',
    nameKorean: '토카이 와인',
    type: 'icon',
    value: '🍷',
    description: '헝가리의 세계적으로 유명한 와인',
    category: 'food'
  }
];

export const hungarianColors: HungarianCulturalElement[] = [
  {
    id: 'hungarian-red',
    name: 'Hungarian Red',
    nameKorean: '헝가리 빨강',
    type: 'color',
    value: '#cd212a',
    description: '헝가리 국기의 빨간색',
    category: 'national'
  },
  {
    id: 'hungarian-white',
    name: 'Hungarian White',
    nameKorean: '헝가리 하양',
    type: 'color',
    value: '#ffffff',
    description: '헝가리 국기의 흰색',
    category: 'national'
  },
  {
    id: 'hungarian-green',
    name: 'Hungarian Green',
    nameKorean: '헝가리 초록',
    type: 'color',
    value: '#436f4d',
    description: '헝가리 국기의 초록색',
    category: 'national'
  },
  {
    id: 'danube-blue',
    name: 'Danube Blue',
    nameKorean: '다뉴브강 파랑',
    type: 'color',
    value: '#0077be',
    description: '다뉴브강을 연상시키는 파란색',
    category: 'nature'
  },
  {
    id: 'thermal-blue',
    name: 'Thermal Blue',
    nameKorean: '온천 파랑',
    type: 'color',
    value: '#4a90e2',
    description: '헝가리 온천의 맑은 물색',
    category: 'nature'
  }
];

export const hungarianAchievements: HungarianCulturalElement[] = [
  {
    id: 'danube-explorer',
    name: 'Danube Explorer',
    nameKorean: '다뉴브 탐험가',
    type: 'achievement',
    value: '🚢',
    description: '다뉴브강 관련 어휘 20개 학습 완료',
    category: 'geography'
  },
  {
    id: 'thermal-master',
    name: 'Thermal Bath Master',
    nameKorean: '온천 마스터',
    type: 'achievement',
    value: '♨️',
    description: '헝가리 온천 문화 레슨 완료',
    category: 'culture'
  },
  {
    id: 'paprika-chef',
    name: 'Paprika Chef',
    nameKorean: '파프리카 요리사',
    type: 'achievement',
    value: '👨‍🍳',
    description: '헝가리 요리 관련 어휘 마스터',
    category: 'food'
  },
  {
    id: 'parliament-scholar',
    name: 'Parliament Scholar',
    nameKorean: '국회의사당 학자',
    type: 'achievement',
    value: '🏛️',
    description: '헝가리 정치/역사 어휘 완성',
    category: 'history'
  },
  {
    id: 'fire-streak-master',
    name: 'Fire Streak Master',
    nameKorean: '불꽃 연속학습 마스터',
    type: 'achievement',
    value: '🔥',
    description: '연속 학습 기록 달성',
    category: 'streak'
  },
  {
    id: 'balaton-swimmer',
    name: 'Balaton Swimmer',
    nameKorean: '발라톤 수영선수',
    type: 'achievement',
    value: '🏊‍♂️',
    description: '발라톤 호수 관련 레슨 완료',
    category: 'geography'
  }
];

export const hungarianPhrases: HungarianCulturalElement[] = [
  {
    id: 'good-morning',
    name: 'Jó reggelt',
    nameKorean: '좋은 아침',
    type: 'phrase',
    value: 'Jó reggelt! ☀️',
    description: '헝가리어 아침 인사',
    category: 'greeting'
  },
  {
    id: 'welcome',
    name: 'Üdvözöljük',
    nameKorean: '환영합니다',
    type: 'phrase',
    value: 'Üdvözöljük! 🤝',
    description: '헝가리어 환영 인사',
    category: 'greeting'
  },
  {
    id: 'thank-you',
    name: 'Köszönöm',
    nameKorean: '감사합니다',
    type: 'phrase',
    value: 'Köszönöm szépen! 🙏',
    description: '헝가리어 감사 표현',
    category: 'politeness'
  },
  {
    id: 'gods-blessing',
    name: 'Isten áldása',
    nameKorean: '하나님의 축복',
    type: 'phrase',
    value: 'Isten áldása legyen Önnel! ✝️',
    description: '종교적 축복 인사',
    category: 'religious'
  }
];

// 시간대와 상황에 따른 적절한 문구 선택
export function getDailyHungarianPhrase(): HungarianCulturalElement {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) {
    return hungarianPhrases[0]; // 좋은 아침
  } else if (hour >= 12 && hour < 18) {
    return hungarianPhrases[1]; // 환영합니다
  } else if (hour >= 18 && hour < 22) {
    return hungarianPhrases[2]; // 감사합니다
  } else {
    return hungarianPhrases[3]; // 하나님의 축복
  }
}

// 성취도에 따른 뱃지 선택
export function getAchievementBadge(type: string): HungarianCulturalElement | undefined {
  return hungarianAchievements.find(achievement => achievement.category === type);
}

// 헝가리 문화 요소 랜덤 선택
export function getRandomCulturalElement(type: HungarianCulturalElement['type']): HungarianCulturalElement {
  let elements: HungarianCulturalElement[] = [];

  switch (type) {
    case 'icon':
      elements = hungarianIcons;
      break;
    case 'color':
      elements = hungarianColors;
      break;
    case 'achievement':
      elements = hungarianAchievements;
      break;
    case 'phrase':
      elements = hungarianPhrases;
      break;
    case 'pattern':
      elements = hungarianPatterns;
      break;
    default:
      elements = [...hungarianIcons, ...hungarianColors, ...hungarianAchievements];
  }

  const randomIndex = Math.floor(Math.random() * elements.length);
  return elements[randomIndex];
}