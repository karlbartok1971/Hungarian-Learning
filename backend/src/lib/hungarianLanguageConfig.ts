/**
 * Hungarian Language Configuration for Google Speech API
 * T050 - 헝가리어 음성 인식을 위한 언어별 특화 설정
 *
 * 한국인 학습자를 위한 헝가리어 발음 평가에 최적화된 설정
 */

// 헝가리어 음성 인식 기본 설정
export const HUNGARIAN_SPEECH_CONFIG = {
  // 언어 코드 (Google Speech API)
  languageCode: 'hu-HU',
  alternativeLanguageCodes: ['en-US'], // 영어 혼재 감지용

  // 음성 인식 모델 설정
  model: 'latest_long', // 긴 발화에 최적화
  useEnhanced: true,    // 향상된 모델 사용

  // 자동 기능
  enableAutomaticPunctuation: true,
  enableWordTimeOffsets: true,
  enableWordConfidence: true,
  enableSpeakerDiarization: false,

  // 프로파일링 설정
  speechContexts: [{
    phrases: [
      // 기본 인사말
      'Szia', 'Szervusz', 'Jó reggelt', 'Jó napot', 'Jó estét',
      'Köszönöm', 'Kérem', 'Elnézést', 'Viszlát',

      // 자주 사용되는 단어
      'igen', 'nem', 'talán', 'persze', 'természetesen',
      'hogy', 'mit', 'hol', 'mikor', 'miért', 'hogyan',

      // 숫자 (기본)
      'egy', 'kettő', 'három', 'négy', 'öt',
      'hat', 'hét', 'nyolc', 'kilenc', 'tíz',

      // 종교 관련 용어 (목적에 맞게)
      'Isten', 'ima', 'templom', 'mise', 'áldás',
      'szentmise', 'prédikáció', 'evangélium', 'keresztény'
    ],
    boost: 20.0 // 인식 가중치 증가
  }],

  // 메타데이터
  metadata: {
    interactionType: 'DISCUSSION', // 대화형 상호작용
    industryNanosicCode: 611310,   // 교육 서비스
    microphoneDistance: 'NEARFIELD', // 근거리 마이크
    originalMediaType: 'AUDIO',
    recordingDeviceType: 'SMARTPHONE' // 모바일 기기
  }
};

// 헝가리어 음소 정의 (IPA 기반)
export const HUNGARIAN_PHONEMES = {
  // 모음 (단모음/장모음)
  vowels: {
    short: ['ɒ', 'ɛ', 'i', 'o', 'ø', 'u', 'y'],
    long: ['aː', 'eː', 'iː', 'oː', 'øː', 'uː', 'yː'],

    // 헝가리어 특수 모음
    frontRounded: ['ø', 'øː', 'y', 'yː'], // 전설 원순모음 (한국인 어려움)
    backUnrounded: ['ɒ', 'aː'],           // 후설 평순모음
  },

  // 자음
  consonants: {
    // 기본 자음
    stops: ['p', 'b', 't', 'd', 'k', 'ɡ'],
    fricatives: ['f', 'v', 's', 'z', 'ʃ', 'ʒ', 'x', 'h'],
    nasals: ['m', 'n', 'ɲ'],
    liquids: ['l', 'r'],

    // 헝가리어 특수 자음
    palatalized: ['ɲ', 'ʎ', 'c', 'ɟ'], // 구개음 (gy, ly, ty, ny)
    affricates: ['t͡s', 'd͡z', 't͡ʃ', 'd͡ʒ'], // 파찰음 (c, dz, cs, dzs)
    trill: ['r'], // 전동음 (한국인 어려움)
  },

  // 한국인이 어려워하는 음소들
  difficultForKoreans: [
    'ø', 'øː', 'y', 'yː',  // 전설 원순모음
    'r',                    // 전동음
    'ɲ', 'ʎ', 'c', 'ɟ',   // 구개음
    'x',                    // 연구개 마찰음
    't͡s', 'd͡z'            // 파찰음
  ]
};

// 헝가리어 발음 규칙
export const HUNGARIAN_PRONUNCIATION_RULES = {
  // 강세 규칙
  stress: {
    pattern: 'initial',     // 항상 첫음절 강세
    description: '헝가리어는 항상 첫음절에 강세가 온다',
    exceptions: []          // 예외 없음
  },

  // 모음 조화
  vowelHarmony: {
    frontVowels: ['e', 'é', 'i', 'í', 'ö', 'ő', 'ü', 'ű'],
    backVowels: ['a', 'á', 'o', 'ó', 'u', 'ú'],
    neutralVowels: ['i', 'í', 'e', 'é'],
    description: '어근의 모음에 따라 접미사의 모음이 결정됨'
  },

  // 자음군 발음
  consonantClusters: {
    common: ['st', 'sz', 'gy', 'ly', 'ny', 'ty'],
    difficult: ['sztr', 'ngv', 'ggy', 'nny'],
    description: '자음군은 각각 명확하게 발음되어야 함'
  },

  // 장단 구별
  lengthDistinction: {
    important: true,
    description: '장모음과 단모음의 구별이 의미 구별에 중요함',
    examples: [
      { short: 'kor', long: 'kór', meaning: '시대 vs 병' },
      { short: 'tud', long: 'túd', meaning: '알다 vs 넘어서다' }
    ]
  }
};

// 한국인 학습자를 위한 발음 가이드
export const KOREAN_LEARNER_GUIDE = {
  // 모음 비교 (한국어 vs 헝가리어)
  vowelComparison: {
    'ɒ': {
      korean: 'ㅏ보다 더 뒤쪽, 입을 더 크게',
      tip: '아기가 하품할 때처럼'
    },
    'ø': {
      korean: 'ㅓ + ㅗ의 중간, 입술을 둥글게',
      tip: '어라고 하면서 입술을 오모양으로'
    },
    'y': {
      korean: 'ㅡ + ㅗ의 중간, 입술을 둥글게',
      tip: '으라고 하면서 입술을 오모양으로'
    }
  },

  // 자음 발음 팁
  consonantTips: {
    'r': {
      korean: 'ㄹ이 아닌 혀끝 떨림음',
      tip: '혀끝을 윗니 뒤에서 떨어뜨리며',
      practice: 'tarararara'
    },
    'ɲ': {
      korean: 'ㄴ + ㅣ가 합쳐진 소리',
      tip: '혀 중간부분을 입천장에 붙이며',
      practice: 'nyanya'
    },
    'ʎ': {
      korean: 'ㄹ + ㅣ가 합쳐진 소리',
      tip: '혀 옆면을 입천장에 붙이며',
      practice: 'lyalya'
    }
  },

  // 흔한 실수
  commonMistakes: [
    {
      error: 'ö를 ㅗ로 발음',
      correction: '입술을 둥글게 하되 혀는 앞쪽에',
      example: 'köszönöm'
    },
    {
      error: 'r을 ㄹ로 발음',
      correction: '혀끝을 떨어서 전동음으로',
      example: 'piros'
    },
    {
      error: '장모음을 단모음으로',
      correction: '장모음은 확실히 길게',
      example: 'kérem (케-렘)'
    }
  ]
};

// Google Speech API 요청 설정 생성 함수
export function createHungarianSpeechConfig(options: {
  sampleRateHertz?: number;
  audioChannelCount?: number;
  encoding?: string;
  enableProfanityFilter?: boolean;
  maxAlternatives?: number;
}) {
  return {
    ...HUNGARIAN_SPEECH_CONFIG,
    sampleRateHertz: options.sampleRateHertz || 44100,
    audioChannelCount: options.audioChannelCount || 1,
    encoding: options.encoding || 'LINEAR16',
    enableProfanityFilter: options.enableProfanityFilter || false,
    maxAlternatives: options.maxAlternatives || 3,
  };
}

// 헝가리어 텍스트 정규화 함수
export function normalizeHungarianText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // 헝가리어 특수 문자는 그대로 유지
    .replace(/[^\wáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]/g, '')
    .replace(/\s+/g, ' ');
}

// 헝가리어 음소 인식 함수
export function extractHungarianPhonemes(text: string): string[] {
  const phonemes: string[] = [];
  const normalizedText = normalizeHungarianText(text);

  // 간단한 음소 추출 (실제로는 더 복잡한 NLP 필요)
  for (const char of normalizedText) {
    if (HUNGARIAN_PHONEMES.vowels.short.includes(char) ||
        HUNGARIAN_PHONEMES.vowels.long.includes(char)) {
      phonemes.push(char);
    }
  }

  return phonemes;
}

// 발음 난이도 계산
export function calculatePronunciationDifficulty(text: string): number {
  const phonemes = extractHungarianPhonemes(text);
  let difficulty = 1;

  // 어려운 음소가 포함된 경우 난이도 증가
  for (const phoneme of phonemes) {
    if (HUNGARIAN_PHONEMES.difficultForKoreans.includes(phoneme)) {
      difficulty += 2;
    }
  }

  // 길이에 따른 난이도 조정
  difficulty += Math.floor(text.length / 10);

  return Math.min(difficulty, 10); // 1-10 스케일
}

// 헝가리어 특화 힌트 생성
export function generateHungarianHints(text: string): string[] {
  const hints: string[] = [];
  const normalizedText = normalizeHungarianText(text);

  // 특수 음소별 힌트
  if (normalizedText.includes('ö') || normalizedText.includes('ő')) {
    hints.push('ö/ő: 입술을 둥글게 하고 혀를 앞쪽에 두세요');
  }

  if (normalizedText.includes('ü') || normalizedText.includes('ű')) {
    hints.push('ü/ű: 으 소리를 내면서 입술을 오 모양으로');
  }

  if (normalizedText.includes('r')) {
    hints.push('r: 혀끝을 떨어서 굴리듯이 발음하세요');
  }

  if (normalizedText.includes('gy')) {
    hints.push('gy: ㄷ과 ㅈ의 중간음으로 부드럽게');
  }

  if (normalizedText.includes('sz')) {
    hints.push('sz: ㅅ보다 강하고 날카롭게');
  }

  // 첫음절 강세 힌트
  if (text.split(' ').length > 0) {
    hints.push('💡 헝가리어는 항상 첫음절에 강세를 두세요');
  }

  return hints;
}

export default {
  HUNGARIAN_SPEECH_CONFIG,
  HUNGARIAN_PHONEMES,
  HUNGARIAN_PRONUNCIATION_RULES,
  KOREAN_LEARNER_GUIDE,
  createHungarianSpeechConfig,
  normalizeHungarianText,
  extractHungarianPhonemes,
  calculatePronunciationDifficulty,
  generateHungarianHints
};