import {
  VocabularyCard,
  VocabularyType,
  DifficultyLevel,
  LinguisticDifficultyFactors,
  KoreanHungarianLearningInfo
} from '../models/VocabularyCard';

/**
 * 한국어-헝가리어 어휘 난이도 계산 서비스
 * T092 - 언어 간 전이 특성을 고려한 한국인 학습자 특화 난이도 계산
 *
 * 헝가리어는 우랄-알타이 어족으로 한국어와 일부 공통점이 있지만,
 * 격변화 시스템, 어순, 음성학적 특징에서 큰 차이를 보입니다.
 */

// 헝가리어 음성학적 특징 데이터베이스
interface PhoneticComplexityData {
  // 한국어에 없는 헝가리어 음소들
  hungarianUniquePhonemes: string[];
  // 발음하기 어려운 음소 조합들
  difficultClusters: string[];
  // 모음 조화 패턴
  vowelHarmonyPatterns: string[];
  // 강세 패턴 복잡도 (1-5)
  stressComplexity: Record<string, number>;
}

const PHONETIC_DATA: PhoneticComplexityData = {
  hungarianUniquePhonemes: ['gy', 'ny', 'ty', 'sz', 'cs', 'zs', 'dz', 'dzs', 'ö', 'ü', 'ő', 'ű'],
  difficultClusters: ['ngy', 'mby', 'nty', 'mpy', 'ksz', 'tsz'],
  vowelHarmonyPatterns: ['front', 'back', 'mixed'],
  stressComplexity: {
    'first_syllable': 1,
    'penultimate': 2,
    'variable': 4,
    'compound': 3
  }
};

// 헝가리어 격변화 시스템 복잡도 데이터
interface CaseSystemData {
  // 격변화 타입별 난이도
  caseComplexity: Record<string, number>;
  // 불규칙 변화 패턴
  irregularPatterns: string[];
  // 조건부 변화 규칙
  conditionalRules: string[];
}

const CASE_SYSTEM_DATA: CaseSystemData = {
  caseComplexity: {
    'nominative': 1,
    'accusative': 2,
    'dative': 3,
    'instrumental': 4,
    'sublative': 5,
    'superessive': 4,
    'delative': 5,
    'inessive': 3,
    'elative': 4,
    'illative': 5,
    'adessive': 4,
    'ablative': 5,
    'allative': 5,
    'causal_final': 6,
    'temporal': 5,
    'translative': 6,
    'terminative': 6,
    'essive_modal': 6,
    'essive_formal': 6
  },
  irregularPatterns: [
    'stem_shortening', 'vowel_lengthening', 'consonant_assimilation',
    'linking_vowel_insertion', 'stem_alternation'
  ],
  conditionalRules: [
    'vowel_harmony_back', 'vowel_harmony_front', 'consonant_assimilation',
    'vowel_shortening', 'consonant_cluster_simplification'
  ]
};

// 동사 활용 복잡도 데이터
interface VerbConjugationData {
  conjugationComplexity: Record<string, number>;
  irregularVerbs: string[];
  aspectualPrefixes: string[];
}

const VERB_DATA: VerbConjugationData = {
  conjugationComplexity: {
    'present_indefinite': 2,
    'present_definite': 3,
    'past_indefinite': 3,
    'past_definite': 4,
    'conditional_indefinite': 4,
    'conditional_definite': 5,
    'subjunctive': 5,
    'imperative': 3
  },
  irregularVerbs: ['van', 'megy', 'jön', 'tesz', 'vesz', 'visz', 'eszik', 'iszik'],
  aspectualPrefixes: ['el', 'meg', 'ki', 'be', 'fel', 'le', 'át', 'vissza', 'szét', 'össze']
};

// 어순 및 통사 구조 복잡도
interface SyntacticComplexityData {
  wordOrderFlexibility: number; // 1-5 스케일
  embeddingComplexity: Record<string, number>;
  dependencyDistance: Record<string, number>;
}

const SYNTACTIC_DATA: SyntacticComplexityData = {
  wordOrderFlexibility: 4, // 헝가리어는 비교적 자유로운 어순
  embeddingComplexity: {
    'simple': 1,
    'relative_clause': 3,
    'subordinate_clause': 2,
    'multiple_embedding': 5
  },
  dependencyDistance: {
    'short': 1,
    'medium': 3,
    'long': 4,
    'very_long': 5
  }
};

/**
 * 한국어-헝가리어 난이도 계산 서비스
 */
export class DifficultyCalculationService {

  /**
   * 종합 어휘 난이도 계산
   */
  async calculateVocabularyDifficulty(
    hungarianWord: string,
    wordClass: VocabularyType,
    koreanMeaning: string,
    usageExamples: string[] = []
  ): Promise<{
    overallDifficulty: DifficultyLevel;
    linguisticFactors: LinguisticDifficultyFactors;
    learningInfo: KoreanHungarianLearningInfo;
    detailedAnalysis: any;
  }> {

    // 언어학적 난이도 요소 계산
    const linguisticFactors = await this.calculateLinguisticFactors(hungarianWord, wordClass);

    // 한국어 학습자를 위한 특화 정보 계산
    const learningInfo = await this.calculateKoreanLearnerInfo(hungarianWord, koreanMeaning, wordClass);

    // 종합 난이도 레벨 결정
    const overallDifficulty = this.determineDifficultyLevel(linguisticFactors);

    // 상세 분석 정보
    const detailedAnalysis = this.generateDetailedAnalysis(hungarianWord, wordClass, linguisticFactors);

    return {
      overallDifficulty,
      linguisticFactors,
      learningInfo,
      detailedAnalysis
    };
  }

  /**
   * 언어학적 난이도 요소 계산
   */
  private async calculateLinguisticFactors(
    hungarianWord: string,
    wordClass: VocabularyType
  ): Promise<LinguisticDifficultyFactors> {

    // 음성학적 요소 계산
    const phoneticDifficulty = this.calculatePhoneticDifficulty(hungarianWord);
    const stressPatternComplexity = this.calculateStressComplexity(hungarianWord);

    // 형태학적 요소 계산
    const morphologicalComplexity = this.calculateMorphologicalComplexity(hungarianWord, wordClass);
    const caseSystemDifficulty = wordClass === VocabularyType.NOUN ?
      this.calculateCaseSystemDifficulty(hungarianWord) : 0;

    // 통사학적 요소 계산
    const wordOrderDifference = this.calculateWordOrderDifference(wordClass);
    const syntacticComplexity = this.calculateSyntacticComplexity(hungarianWord, wordClass);

    // 어휘적 요소 계산
    const falseCognateRisk = this.calculateFalseCognateRisk(hungarianWord);
    const frequencyAsymmetry = this.calculateFrequencyAsymmetry(hungarianWord);

    // 화용적 요소 계산
    const pragmaticComplexity = this.calculatePragmaticComplexity(hungarianWord, wordClass);
    const culturalSpecificity = this.calculateCulturalSpecificity(hungarianWord);

    return {
      phonetic_difficulty: phoneticDifficulty,
      stress_pattern_complexity: stressPatternComplexity,
      morphological_complexity: morphologicalComplexity,
      case_system_difficulty: caseSystemDifficulty,
      word_order_difference: wordOrderDifference,
      syntactic_complexity: syntacticComplexity,
      false_cognate_risk: falseCognateRisk,
      frequency_asymmetry: frequencyAsymmetry,
      pragmatic_complexity: pragmaticComplexity,
      cultural_specificity: culturalSpecificity
    };
  }

  /**
   * 음성학적 난이도 계산
   */
  private calculatePhoneticDifficulty(hungarianWord: string): number {
    let difficulty = 0;

    // 한국어에 없는 헝가리어 음소 체크
    for (const phoneme of PHONETIC_DATA.hungarianUniquePhonemes) {
      if (hungarianWord.includes(phoneme)) {
        difficulty += 0.15;
      }
    }

    // 어려운 자음 군집 체크
    for (const cluster of PHONETIC_DATA.difficultClusters) {
      if (hungarianWord.includes(cluster)) {
        difficulty += 0.25;
      }
    }

    // 장모음과 단모음 구별
    const longVowels = ['á', 'é', 'í', 'ó', 'ö', 'ő', 'ú', 'ü', 'ű'];
    const longVowelCount = longVowels.filter(vowel => hungarianWord.includes(vowel)).length;
    difficulty += longVowelCount * 0.1;

    // 모음 조화 복잡도
    const vowelHarmonyComplexity = this.analyzeVowelHarmony(hungarianWord);
    difficulty += vowelHarmonyComplexity * 0.2;

    return Math.min(difficulty, 1.0);
  }

  /**
   * 모음 조화 분석
   */
  private analyzeVowelHarmony(word: string): number {
    const frontVowels = ['e', 'é', 'i', 'í', 'ö', 'ő', 'ü', 'ű'];
    const backVowels = ['a', 'á', 'o', 'ó', 'u', 'ú'];

    let frontCount = 0;
    let backCount = 0;

    for (const char of word) {
      if (frontVowels.includes(char)) frontCount++;
      if (backVowels.includes(char)) backCount++;
    }

    // 혼합 모음 조화는 더 복잡
    if (frontCount > 0 && backCount > 0) return 1.0;
    if (frontCount > backCount) return 0.6; // 전설 모음이 더 어려움
    return 0.3;
  }

  /**
   * 강세 패턴 복잡도 계산
   */
  private calculateStressComplexity(word: string): number {
    // 헝가리어는 일반적으로 첫 음절 강세
    if (word.includes('-')) {
      // 복합어의 경우 더 복잡
      return PHONETIC_DATA.stressComplexity.compound / 5;
    }

    return PHONETIC_DATA.stressComplexity.first_syllable / 5;
  }

  /**
   * 형태학적 복잡도 계산
   */
  private calculateMorphologicalComplexity(word: string, wordClass: VocabularyType): number {
    let complexity = 0;

    switch (wordClass) {
      case VocabularyType.NOUN:
        // 명사의 격변화 복잡도
        complexity = 0.4; // 기본 복잡도
        if (word.endsWith('ség') || word.endsWith('ság')) complexity += 0.2; // 파생 명사
        break;

      case VocabularyType.VERB:
        // 동사 활용 복잡도
        complexity = 0.6; // 동사는 기본적으로 더 복잡
        if (VERB_DATA.irregularVerbs.includes(word)) complexity += 0.3; // 불규칙 동사

        // 접두사가 있는 동사
        for (const prefix of VERB_DATA.aspectualPrefixes) {
          if (word.startsWith(prefix)) {
            complexity += 0.2;
            break;
          }
        }
        break;

      case VocabularyType.ADJECTIVE:
        complexity = 0.3; // 형용사는 비교적 단순
        if (word.endsWith('bb')) complexity += 0.1; // 비교급
        break;

      case VocabularyType.ADVERB:
        complexity = 0.2; // 부사는 대체로 단순
        break;

      default:
        complexity = 0.1;
    }

    return Math.min(complexity, 1.0);
  }

  /**
   * 격변화 시스템 난이도 계산
   */
  private calculateCaseSystemDifficulty(noun: string): number {
    // 명사의 형태에 따른 격변화 복잡도 예측
    let difficulty = 0.5; // 기본 격변화 난이도

    // 어간이 변하는 명사들
    if (noun.endsWith('ly') || noun.endsWith('ny')) {
      difficulty += 0.3; // 자음 군집으로 끝나는 명사
    }

    if (noun.includes('ö') || noun.includes('ő') || noun.includes('ü') || noun.includes('ű')) {
      difficulty += 0.2; // 전설 모음이 포함된 명사 (모음 조화 복잡)
    }

    // 불규칙 복수형
    if (noun.endsWith('ember') || noun.endsWith('gyerek')) {
      difficulty += 0.4;
    }

    return Math.min(difficulty, 1.0);
  }

  /**
   * 어순 차이 계산
   */
  private calculateWordOrderDifference(wordClass: VocabularyType): number {
    // 한국어 SOV vs 헝가리어 SVO (하지만 자유로운 어순)
    switch (wordClass) {
      case VocabularyType.VERB:
        return 0.6; // 동사 위치가 다름
      case VocabularyType.ADJECTIVE:
        return 0.4; // 형용사 위치 차이
      case VocabularyType.NOUN:
        return 0.3; // 명사는 비교적 유연
      default:
        return 0.2;
    }
  }

  /**
   * 통사적 복잡도 계산
   */
  private calculateSyntacticComplexity(word: string, wordClass: VocabularyType): number {
    // 기본 통사적 복잡도
    let complexity = 0.3;

    if (wordClass === VocabularyType.VERB) {
      // 동사의 경우 정/부정 활용 구별
      complexity += 0.4;
    }

    if (wordClass === VocabularyType.CONJUNCTION) {
      // 접속사는 문장 구조에 큰 영향
      complexity += 0.3;
    }

    return complexity;
  }

  /**
   * 가짜 친구 위험도 계산
   */
  private calculateFalseCognateRisk(hungarianWord: string): number {
    // 헝가리어-한국어 가짜 친구는 많지 않지만, 일부 존재
    const potentialFalseFriends = [
      'tea', 'taxi', 'hotel', 'restaurant', 'telefon', 'internet', 'computer'
    ];

    for (const falseFriend of potentialFalseFriends) {
      if (hungarianWord.toLowerCase().includes(falseFriend)) {
        return 0.6; // 중간 정도 위험
      }
    }

    return 0.1; // 일반적으로 가짜 친구 위험은 낮음
  }

  /**
   * 빈도 비대칭성 계산
   */
  private calculateFrequencyAsymmetry(hungarianWord: string): number {
    // 한국어와 헝가리어의 사용 빈도 차이
    // 실제로는 코퍼스 데이터가 필요하지만, 휴리스틱 사용

    // 일상어는 빈도 차이가 적음
    const commonWords = ['és', 'a', 'az', 'van', 'ez', 'az', 'hogy', 'mit', 'ki', 'mikor'];
    if (commonWords.includes(hungarianWord.toLowerCase())) {
      return 0.1;
    }

    // 전문 용어는 빈도 차이가 클 수 있음
    if (hungarianWord.length > 10) {
      return 0.6;
    }

    return 0.3; // 기본값
  }

  /**
   * 화용적 복잡도 계산
   */
  private calculatePragmaticComplexity(word: string, wordClass: VocabularyType): number {
    // 경어법, 격식도, 맥락적 사용
    let complexity = 0.2; // 기본값

    // 인칭 대명사는 화용적으로 복잡
    if (wordClass === VocabularyType.PRONOUN) {
      complexity = 0.7;
    }

    // 격식/비격식 구별이 있는 단어들
    const formalWords = ['ön', 'maga', 'kérem', 'köszönöm', 'elnézést'];
    if (formalWords.includes(word.toLowerCase())) {
      complexity = 0.6;
    }

    return complexity;
  }

  /**
   * 문화적 특수성 계산
   */
  private calculateCulturalSpecificity(word: string): number {
    // 헝가리 고유 문화 요소
    const culturalWords = [
      'pálinka', 'gulyás', 'paprika', 'csárdás', 'táncház', 'forint',
      'magyar', 'budai', 'pesti', 'dunai'
    ];

    for (const culturalWord of culturalWords) {
      if (word.toLowerCase().includes(culturalWord)) {
        return 0.8; // 높은 문화적 특수성
      }
    }

    // 일반적인 유럽 문화 요소
    const europeanWords = ['kávé', 'bor', 'templom', 'egyetem', 'piac'];
    for (const europeanWord of europeanWords) {
      if (word.toLowerCase().includes(europeanWord)) {
        return 0.4;
      }
    }

    return 0.2; // 기본 문화적 특수성
  }

  /**
   * 한국어 학습자를 위한 특화 정보 계산
   */
  private async calculateKoreanLearnerInfo(
    hungarianWord: string,
    koreanMeaning: string,
    wordClass: VocabularyType
  ): Promise<KoreanHungarianLearningInfo> {

    // 한국어와의 유사성 점수
    const similarityScore = this.calculateKoreanSimilarity(hungarianWord, koreanMeaning);

    // 한국어 간섭 위험도
    const interferenceRisk = this.calculateKoreanInterference(hungarianWord, koreanMeaning, wordClass);

    // 발음 난이도
    const pronunciationDifficulty = this.calculatePhoneticDifficulty(hungarianWord);

    // 사용 빈도 (헝가리어 내에서의)
    const usageFrequency = this.estimateUsageFrequency(hungarianWord);

    // 격식도 레벨
    const formalityLevel = this.determineFormalityLevel(hungarianWord);

    // 한국어 기반 기억법 생성
    const koreanMnemonic = this.generateKoreanMnemonic(hungarianWord, koreanMeaning);

    // 문화적 맥락 설명
    const culturalContext = this.generateCulturalContext(hungarianWord);

    return {
      korean_similarity_score: similarityScore,
      korean_interference_risk: interferenceRisk,
      pronunciation_difficulty: pronunciationDifficulty,
      korean_mnemonic: koreanMnemonic,
      cultural_context: culturalContext,
      usage_frequency: usageFrequency,
      formality_level: formalityLevel
    };
  }

  /**
   * 한국어와의 유사성 계산
   */
  private calculateKoreanSimilarity(hungarianWord: string, koreanMeaning: string): number {
    // 음성적 유사성 (매우 제한적)
    let similarity = 0.0;

    // 차용어 확인
    const loanwords = ['taxi', 'hotel', 'telefon', 'internet', 'computer', 'tea'];
    for (const loanword of loanwords) {
      if (hungarianWord.toLowerCase().includes(loanword)) {
        similarity += 0.3;
      }
    }

    // 음성 패턴 유사성 (매우 제한적)
    if (hungarianWord.includes('k') && koreanMeaning.includes('ㄱ')) {
      similarity += 0.1;
    }

    return Math.min(similarity, 1.0);
  }

  /**
   * 한국어 간섭 위험도 계산
   */
  private calculateKoreanInterference(
    hungarianWord: string,
    koreanMeaning: string,
    wordClass: VocabularyType
  ): number {
    let interference = 0.3; // 기본 간섭 위험도

    // 문법적 간섭
    if (wordClass === VocabularyType.VERB) {
      // 한국어 어순(SOV) 간섭
      interference += 0.4;
    }

    if (wordClass === VocabularyType.NOUN) {
      // 한국어 조사 vs 헝가리어 격변화
      interference += 0.3;
    }

    // 음성적 간섭
    const difficultSounds = ['gy', 'ny', 'ty', 'sz', 'cs', 'zs'];
    for (const sound of difficultSounds) {
      if (hungarianWord.includes(sound)) {
        interference += 0.1;
      }
    }

    return Math.min(interference, 1.0);
  }

  /**
   * 사용 빈도 추정
   */
  private estimateUsageFrequency(word: string): number {
    // 실제로는 헝가리어 코퍼스 데이터 필요
    // 휴리스틱 기반 추정

    const highFrequencyWords = [
      'és', 'a', 'az', 'hogy', 'van', 'ez', 'egy', 'nem', 'de', 'csak',
      'meg', 'el', 'ki', 'be', 'fel', 'le', 'jó', 'nagy', 'kicsi'
    ];

    if (highFrequencyWords.includes(word.toLowerCase())) {
      return 0.9;
    }

    if (word.length <= 4) {
      return 0.6; // 짧은 단어는 보통 더 빈번
    }

    if (word.length > 12) {
      return 0.2; // 긴 단어는 보통 덜 빈번
    }

    return 0.4; // 중간 빈도
  }

  /**
   * 격식도 레벨 결정
   */
  private determineFormalityLevel(word: string): 'informal' | 'neutral' | 'formal' | 'very_formal' {
    const informalWords = ['csókolom', 'szia', 'haver', 'csaj', 'srác'];
    const formalWords = ['ön', 'kérem', 'köszönöm', 'elnézést', 'kérem szépen'];
    const veryFormalWords = ['nagyságos', 'méltóságos', 'excellenciás'];

    if (informalWords.some(w => word.toLowerCase().includes(w))) return 'informal';
    if (veryFormalWords.some(w => word.toLowerCase().includes(w))) return 'very_formal';
    if (formalWords.some(w => word.toLowerCase().includes(w))) return 'formal';

    return 'neutral';
  }

  /**
   * 한국어 기반 기억법 생성
   */
  private generateKoreanMnemonic(hungarianWord: string, koreanMeaning: string): string | undefined {
    // 간단한 음성적 연상 기억법
    if (hungarianWord.toLowerCase() === 'ház') {
      return "'하즈'는 '하우스(house)'와 비슷하게 들림";
    }

    if (hungarianWord.toLowerCase() === 'kávé') {
      return "'카베'는 '커피(coffee)'와 발음이 유사함";
    }

    if (hungarianWord.toLowerCase() === 'tea') {
      return "'테아'는 한국어 '차'와 같은 의미";
    }

    // 더 많은 기억법은 실제 구현에서 데이터베이스로 관리
    return undefined;
  }

  /**
   * 문화적 맥락 생성
   */
  private generateCulturalContext(word: string): string | undefined {
    if (word.toLowerCase() === 'gulyás') {
      return "헝가리의 대표적인 전통 수프로, 헝가리 문화의 상징입니다.";
    }

    if (word.toLowerCase() === 'pálinka') {
      return "헝가리 전통 과일 브랜디로, 특별한 날에 마시는 술입니다.";
    }

    if (word.toLowerCase() === 'forint') {
      return "헝가리의 공식 통화 단위입니다.";
    }

    return undefined;
  }

  /**
   * 종합 난이도 레벨 결정
   */
  private determineDifficultyLevel(factors: LinguisticDifficultyFactors): DifficultyLevel {
    // 가중 평균 계산
    const weights = {
      phonetic: 0.25,
      morphological: 0.25,
      syntactic: 0.20,
      lexical: 0.15,
      pragmatic: 0.15
    };

    const phoneticScore = (factors.phonetic_difficulty + factors.stress_pattern_complexity) / 2;
    const morphologicalScore = (factors.morphological_complexity + factors.case_system_difficulty) / 2;
    const syntacticScore = (factors.word_order_difference + factors.syntactic_complexity) / 2;
    const lexicalScore = (factors.false_cognate_risk + factors.frequency_asymmetry) / 2;
    const pragmaticScore = (factors.pragmatic_complexity + factors.cultural_specificity) / 2;

    const overallScore =
      phoneticScore * weights.phonetic +
      morphologicalScore * weights.morphological +
      syntacticScore * weights.syntactic +
      lexicalScore * weights.lexical +
      pragmaticScore * weights.pragmatic;

    // 난이도 레벨 매핑
    if (overallScore <= 0.2) return DifficultyLevel.BEGINNER;
    if (overallScore <= 0.4) return DifficultyLevel.ELEMENTARY;
    if (overallScore <= 0.6) return DifficultyLevel.INTERMEDIATE;
    if (overallScore <= 0.8) return DifficultyLevel.UPPER_INTERMEDIATE;
    return DifficultyLevel.ADVANCED;
  }

  /**
   * 상세 분석 정보 생성
   */
  private generateDetailedAnalysis(
    word: string,
    wordClass: VocabularyType,
    factors: LinguisticDifficultyFactors
  ): any {
    return {
      word_analysis: {
        length: word.length,
        syllable_count: this.countSyllables(word),
        has_unique_phonemes: this.hasUniquePhonemes(word),
        vowel_harmony_type: this.analyzeVowelHarmonyType(word),
        morphological_type: this.analyzeMorphologicalType(word, wordClass)
      },
      difficulty_breakdown: {
        phonetic: {
          score: factors.phonetic_difficulty,
          main_challenges: this.identifyPhoneticChallenges(word)
        },
        morphological: {
          score: factors.morphological_complexity,
          main_challenges: this.identifyMorphologicalChallenges(word, wordClass)
        },
        syntactic: {
          score: factors.syntactic_complexity,
          main_challenges: this.identifySyntacticChallenges(wordClass)
        }
      },
      learning_recommendations: {
        focus_areas: this.generateFocusAreas(factors),
        practice_suggestions: this.generatePracticeSuggestions(word, wordClass, factors),
        common_mistakes: this.predictCommonMistakes(word, wordClass)
      }
    };
  }

  /**
   * 음절 수 계산 (근사)
   */
  private countSyllables(word: string): number {
    const vowels = 'aeiouáéíóöőúüű';
    let count = 0;
    for (let i = 0; i < word.length; i++) {
      if (vowels.includes(word[i].toLowerCase()) &&
          (i === 0 || !vowels.includes(word[i-1].toLowerCase()))) {
        count++;
      }
    }
    return Math.max(count, 1);
  }

  /**
   * 헝가리어 고유 음소 포함 여부
   */
  private hasUniquePhonemes(word: string): boolean {
    return PHONETIC_DATA.hungarianUniquePhonemes.some(phoneme => word.includes(phoneme));
  }

  /**
   * 모음 조화 타입 분석
   */
  private analyzeVowelHarmonyType(word: string): string {
    const frontVowels = ['e', 'é', 'i', 'í', 'ö', 'ő', 'ü', 'ű'];
    const backVowels = ['a', 'á', 'o', 'ó', 'u', 'ú'];

    const hasFront = frontVowels.some(v => word.includes(v));
    const hasBack = backVowels.some(v => word.includes(v));

    if (hasFront && hasBack) return 'mixed';
    if (hasFront) return 'front';
    if (hasBack) return 'back';
    return 'neutral';
  }

  /**
   * 형태학적 타입 분석
   */
  private analyzeMorphologicalType(word: string, wordClass: VocabularyType): string {
    if (wordClass === VocabularyType.NOUN) {
      if (word.endsWith('ség') || word.endsWith('ság')) return 'derived_noun';
      if (word.includes('-')) return 'compound_noun';
      return 'simple_noun';
    }

    if (wordClass === VocabularyType.VERB) {
      for (const prefix of VERB_DATA.aspectualPrefixes) {
        if (word.startsWith(prefix)) return 'prefixed_verb';
      }
      return 'simple_verb';
    }

    return 'simple';
  }

  /**
   * 음성학적 도전 요소 식별
   */
  private identifyPhoneticChallenges(word: string): string[] {
    const challenges: string[] = [];

    if (this.hasUniquePhonemes(word)) {
      challenges.push('헝가리어 고유 음소 포함');
    }

    if (word.includes('gy') || word.includes('ny') || word.includes('ty')) {
      challenges.push('구개음 자음');
    }

    if (word.includes('sz') || word.includes('cs') || word.includes('zs')) {
      challenges.push('마찰음 자음');
    }

    const longVowels = ['á', 'é', 'í', 'ó', 'ö', 'ő', 'ú', 'ü', 'ű'];
    if (longVowels.some(v => word.includes(v))) {
      challenges.push('장모음 구별');
    }

    return challenges;
  }

  /**
   * 형태학적 도전 요소 식별
   */
  private identifyMorphologicalChallenges(word: string, wordClass: VocabularyType): string[] {
    const challenges: string[] = [];

    if (wordClass === VocabularyType.NOUN) {
      challenges.push('격변화 시스템');
      if (word.endsWith('ly') || word.endsWith('ny')) {
        challenges.push('불규칙 어간 변화');
      }
    }

    if (wordClass === VocabularyType.VERB) {
      challenges.push('정/부정 활용');
      if (VERB_DATA.irregularVerbs.includes(word)) {
        challenges.push('불규칙 동사 활용');
      }
    }

    return challenges;
  }

  /**
   * 통사적 도전 요소 식별
   */
  private identifySyntacticChallenges(wordClass: VocabularyType): string[] {
    const challenges: string[] = [];

    if (wordClass === VocabularyType.VERB) {
      challenges.push('어순 차이 (SOV vs SVO)');
      challenges.push('동사 위치 변화');
    }

    if (wordClass === VocabularyType.ADJECTIVE) {
      challenges.push('형용사 어순');
    }

    return challenges;
  }

  /**
   * 집중 학습 영역 생성
   */
  private generateFocusAreas(factors: LinguisticDifficultyFactors): string[] {
    const areas: string[] = [];

    if (factors.phonetic_difficulty > 0.6) {
      areas.push('발음 연습');
    }

    if (factors.morphological_complexity > 0.6) {
      areas.push('형태 변화 규칙');
    }

    if (factors.case_system_difficulty > 0.6) {
      areas.push('격변화 연습');
    }

    if (factors.syntactic_complexity > 0.6) {
      areas.push('문장 구조 연습');
    }

    if (factors.pragmatic_complexity > 0.6) {
      areas.push('맥락적 사용법');
    }

    return areas;
  }

  /**
   * 연습 제안 생성
   */
  private generatePracticeSuggestions(
    word: string,
    wordClass: VocabularyType,
    factors: LinguisticDifficultyFactors
  ): string[] {
    const suggestions: string[] = [];

    if (factors.phonetic_difficulty > 0.5) {
      suggestions.push('음성 파일 반복 청취');
      suggestions.push('발음 기호 학습');
    }

    if (wordClass === VocabularyType.NOUN && factors.case_system_difficulty > 0.5) {
      suggestions.push('격변화표 작성');
      suggestions.push('문장 내 사용 연습');
    }

    if (wordClass === VocabularyType.VERB && factors.morphological_complexity > 0.5) {
      suggestions.push('활용표 암기');
      suggestions.push('시제별 문장 만들기');
    }

    return suggestions;
  }

  /**
   * 흔한 실수 예측
   */
  private predictCommonMistakes(word: string, wordClass: VocabularyType): string[] {
    const mistakes: string[] = [];

    if (word.includes('gy') || word.includes('ny')) {
      mistakes.push('구개음을 일반 자음으로 발음');
    }

    if (wordClass === VocabularyType.NOUN) {
      mistakes.push('한국어 조사 사용 시도');
      mistakes.push('격변화 생략');
    }

    if (wordClass === VocabularyType.VERB) {
      mistakes.push('한국어 어순 적용');
      mistakes.push('정/부정 활용 혼동');
    }

    return mistakes;
  }
}

export const difficultyCalculationService = new DifficultyCalculationService();