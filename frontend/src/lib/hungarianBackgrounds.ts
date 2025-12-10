export interface HungarianBackground {
  id: string;
  name: string;
  nameKorean: string;
  url: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'any';
  description: string;
  overlayColor?: string;
}

export const hungarianBackgrounds: HungarianBackground[] = [
  {
    id: 'parliament-night',
    name: 'Hungarian Parliament at Night',
    nameKorean: '부다페스트 국회의사당 야경',
    url: 'https://images.unsplash.com/photo-1541849546-216549ae216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    timeOfDay: 'night',
    season: 'any',
    description: '다뉴브강에 반사된 웅장한 국회의사당의 야경',
    overlayColor: 'rgba(30, 58, 138, 0.6)' // 파란색 오버레이
  },
  {
    id: 'fishermans-bastion',
    name: 'Fisherman\'s Bastion',
    nameKorean: '어부의 요새',
    url: 'https://images.unsplash.com/photo-1520637836862-4d197d17c13a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    timeOfDay: 'morning',
    season: 'any',
    description: '동화같은 건축물과 부다페스트 파노라마',
    overlayColor: 'rgba(252, 211, 77, 0.5)' // 황금색 오버레이
  },
  {
    id: 'szechenyi-baths',
    name: 'Széchenyi Thermal Baths',
    nameKorean: '세체니 온천',
    url: 'https://images.unsplash.com/photo-1551340244-57db55848578?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    timeOfDay: 'afternoon',
    season: 'winter',
    description: '김이 모락모락 나는 헝가리 전통 온천',
    overlayColor: 'rgba(59, 130, 246, 0.4)' // 연한 파란색
  },
  {
    id: 'lake-balaton-sunset',
    name: 'Lake Balaton Sunset',
    nameKorean: '발라톤 호수 일몰',
    url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    timeOfDay: 'evening',
    season: 'summer',
    description: '헝가리 최대 호수의 황금빛 일몰',
    overlayColor: 'rgba(251, 146, 60, 0.5)' // 주황색 오버레이
  },
  {
    id: 'hungarian-countryside',
    name: 'Hungarian Countryside',
    nameKorean: '헝가리 시골 풍경',
    url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    timeOfDay: 'morning',
    season: 'spring',
    description: '푸른 초원과 전통 농가의 평온한 풍경',
    overlayColor: 'rgba(34, 197, 94, 0.4)' // 초록색 오버레이
  },
  {
    id: 'buda-castle',
    name: 'Buda Castle',
    nameKorean: '부다 성',
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    timeOfDay: 'afternoon',
    season: 'autumn',
    description: '가을 단풍과 어우러진 왕궁의 위엄',
    overlayColor: 'rgba(202, 138, 4, 0.5)' // 갈색/황금색
  }
];

export function getCurrentBackground(): HungarianBackground {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth() + 1;

  // 시간대 결정
  let timeOfDay: HungarianBackground['timeOfDay'] = 'morning';
  if (hour >= 6 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';

  // 계절 결정
  let season: HungarianBackground['season'] = 'spring';
  if (month >= 3 && month <= 5) season = 'spring';
  else if (month >= 6 && month <= 8) season = 'summer';
  else if (month >= 9 && month <= 11) season = 'autumn';
  else season = 'winter';

  // 조건에 맞는 배경 찾기
  let matchingBackgrounds = hungarianBackgrounds.filter(bg =>
    (bg.timeOfDay === timeOfDay || bg.timeOfDay === 'any') &&
    (bg.season === season || bg.season === 'any')
  );

  // 조건에 완전히 맞는 배경이 없으면 시간대만 맞추기
  if (matchingBackgrounds.length === 0) {
    matchingBackgrounds = hungarianBackgrounds.filter(bg =>
      bg.timeOfDay === timeOfDay || bg.timeOfDay === 'any'
    );
  }

  // 그래도 없으면 아무거나
  if (matchingBackgrounds.length === 0) {
    matchingBackgrounds = hungarianBackgrounds;
  }

  // 랜덤하게 선택 (하지만 일관성을 위해 날짜 기반으로)
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % matchingBackgrounds.length;

  return matchingBackgrounds[index];
}

export function preloadBackgroundImages(): void {
  if (typeof window === 'undefined') return;

  hungarianBackgrounds.forEach(bg => {
    const img = new Image();
    img.src = bg.url;
  });
}