import { ObjectId } from 'mongodb';
import { FSRSCard, CardState, Rating } from '../lib/fsrsAlgorithm';

/**
 * 어휘 카드 모델 - FSRS 알고리즘을 활용한 간격 반복 학습
 * T085 - VocabularyCard 모델 구현
 *
 * 한국어-헝가리어 학습에 특화된 어휘 카드 시스템
 */

// 어휘 카드의 난이도 레벨 (한국인 학습자 기준)
export enum DifficultyLevel {
  BEGINNER = 'beginner',       // A1 수준 - 기본 어휘
  ELEMENTARY = 'elementary',   // A2 수준 - 일상 어휘
  INTERMEDIATE = 'intermediate', // B1 수준 - 확장 어휘
  UPPER_INTERMEDIATE = 'upper_intermediate', // B2 수준 - 고급 어휘
  ADVANCED = 'advanced'        // C1+ 수준 - 전문 어휘
}

// 어휘 카테고리 (한국 목회자 특화)
export enum VocabularyCategory {
  BASIC = 'basic',                    // 기초 일상어휘
  FAMILY = 'family',                  // 가족 관련
  FOOD = 'food',                      // 음식 관련
  TRANSPORTATION = 'transportation',   // 교통 관련
  WEATHER = 'weather',                // 날씨 관련
  EMOTIONS = 'emotions',              // 감정 표현
  BUSINESS = 'business',              // 비즈니스/업무
  EDUCATION = 'education',            // 교육 관련
  HEALTH = 'health',                  // 건강/의료
  TECHNOLOGY = 'technology',          // 기술/IT

  // 신학/종교 특화 카테고리
  THEOLOGY = 'theology',              // 신학 용어
  LITURGY = 'liturgy',               // 예배 관련
  SCRIPTURE = 'scripture',            // 성경 관련
  PASTORAL = 'pastoral',              // 목회 관련
  EVANGELISM = 'evangelism',          // 전도 관련
  CHURCH_ADMIN = 'church_admin',      // 교회 행정
  WORSHIP = 'worship',                // 예배 찬송
  PRAYER = 'prayer',                  // 기도 관련
  SACRAMENT = 'sacrament'            // 성례 관련
}

// 어휘 타입
export enum VocabularyType {
  NOUN = 'noun',                // 명사
  VERB = 'verb',                // 동사
  ADJECTIVE = 'adjective',      // 형용사
  ADVERB = 'adverb',           // 부사
  PRONOUN = 'pronoun',          // 대명사
  PREPOSITION = 'preposition',  // 전치사
  CONJUNCTION = 'conjunction',  // 접속사
  INTERJECTION = 'interjection', // 감탄사
  PHRASE = 'phrase',            // 구문
  IDIOM = 'idiom',             // 관용어
  EXPRESSION = 'expression'     // 표현
}

// 한국어-헝가리어 학습 특화 정보
export interface KoreanHungarianLearningInfo {
  korean_similarity_score: number;        // 한국어와의 유사성 점수 (0-1)
  false_friends?: string[];               // 가짜 친구 (비슷하지만 다른 의미)
  korean_interference_risk: number;      // 한국어 간섭 위험도 (0-1)
  pronunciation_difficulty: number;       // 발음 난이도 (0-1)

  // 한국어 학습자를 위한 특별 정보
  korean_mnemonic?: string;               // 한국어 기반 기억법
  cultural_context?: string;              // 문화적 맥락 설명
  usage_frequency: number;                // 사용 빈도 (0-1)
  formality_level: 'informal' | 'neutral' | 'formal' | 'very_formal';
}

// 문법 정보 (헝가리어 특화)
export interface HungarianGrammarInfo {
  word_class: VocabularyType;

  // 헝가리어 격변화 정보 (명사인 경우)
  case_forms?: {
    nominative: string;        // 주격
    accusative: string;        // 대격
    dative: string;           // 여격
    instrumental: string;      // 조격
    sublative: string;        // 승격
    superessive: string;      // 상격
    delative: string;         // 탈격
    [key: string]: string;    // 기타 격
  };

  // 동사 활용 정보
  verb_conjugation?: {
    present_definite: string[];    // 현재시제 정활용
    present_indefinite: string[];  // 현재시제 부정활용
    past_definite: string[];       // 과거시제 정활용
    past_indefinite: string[];     // 과거시제 부정활용
    conditional: string[];         // 조건법
    imperative: string[];          // 명령법
  };

  // 형용사/부사 비교급
  comparative_forms?: {
    positive: string;    // 원급
    comparative: string; // 비교급
    superlative: string; // 최상급
  };

  irregular_forms?: string[];      // 불규칙 형태들
  stem_changes?: string[];         // 어간 변화
}

// 예문 및 사용 예시
export interface UsageExample {
  id: string;
  hungarian_sentence: string;     // 헝가리어 예문
  korean_translation: string;     // 한국어 번역
  context: string;                // 사용 맥락
  audio_url?: string;             // 음성 파일 URL
  formality_level: 'informal' | 'neutral' | 'formal';

  // 설교/목회 특화 예문인 경우
  theological_context?: string;   // 신학적 맥락
  scripture_reference?: string;   // 성경 구절 참조
  liturgical_usage?: string;      // 예배 중 사용법
}

// 어휘 카드 학습 통계
export interface VocabularyLearningStats {
  total_reviews: number;           // 총 복습 횟수
  correct_answers: number;         // 정답 횟수
  accuracy_rate: number;          // 정확도 (0-1)
  avg_response_time_ms: number;   // 평균 응답 시간

  // 문제 유형별 통계
  recognition_accuracy: number;    // 인식 정확도 (헝→한)
  production_accuracy: number;     // 생산 정확도 (한→헝)
  pronunciation_score: number;     // 발음 점수

  // 학습 패턴
  best_time_of_day?: string;      // 최적 학습 시간대
  retention_curve: number[];       // 기억 곡선 (일별)

  // 마지막 학습 정보
  last_review_type: 'recognition' | 'production' | 'listening' | 'speaking';
  last_review_accuracy: number;
  last_response_time_ms: number;
}

// 메인 어휘 카드 인터페이스
export interface VocabularyCard {
  _id: ObjectId;

  // 기본 정보
  card_id: string;                     // 고유 카드 ID
  user_id: string;                     // 사용자 ID

  // 어휘 정보
  hungarian_word: string;              // 헝가리어 단어/표현
  korean_meaning: string;              // 한국어 의미
  pronunciation_ipa?: string;          // IPA 발음 기호
  pronunciation_hangul?: string;       // 한글 발음 표기
  audio_url?: string;                  // 음성 파일 URL

  // 분류 정보
  difficulty_level: DifficultyLevel;
  category: VocabularyCategory;
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

  // 문법 및 언어학 정보
  grammar_info: HungarianGrammarInfo;
  learning_info: KoreanHungarianLearningInfo;

  // 사용 예시
  examples: UsageExample[];

  // 관련 어휘
  related_words?: string[];            // 관련 어휘 카드 ID들
  synonyms?: string[];                 // 동의어
  antonyms?: string[];                 // 반의어
  word_family?: string[];              // 어족 (어근이 같은 단어들)

  // FSRS 학습 알고리즘 데이터
  fsrs_data: FSRSCard;

  // 학습 통계 및 성과
  learning_stats: VocabularyLearningStats;

  // 사용자 커스터마이징
  user_notes?: string;                 // 사용자 메모
  user_tags?: string[];               // 사용자 태그
  is_favorite: boolean;               // 즐겨찾기 여부
  personal_difficulty_rating?: number; // 개인적 난이도 평가 (1-5)

  // 시스템 정보
  source: 'system' | 'user_added' | 'imported' | 'ai_generated';
  created_at: Date;
  updated_at: Date;
  last_reviewed_at?: Date;

  // 품질 관리
  verification_status: 'pending' | 'verified' | 'flagged' | 'rejected';
  quality_score?: number;             // 카드 품질 점수 (0-1)
  admin_notes?: string;               // 관리자 메모
}

// 어휘 카드 생성용 DTO
export interface CreateVocabularyCardDTO {
  hungarian_word: string;
  korean_meaning: string;
  pronunciation_ipa?: string;
  pronunciation_hangul?: string;
  difficulty_level: DifficultyLevel;
  category: VocabularyCategory;
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  examples?: Omit<UsageExample, 'id'>[];
  user_notes?: string;
  user_tags?: string[];
}

// 어휘 카드 업데이트용 DTO
export interface UpdateVocabularyCardDTO {
  korean_meaning?: string;
  pronunciation_hangul?: string;
  user_notes?: string;
  user_tags?: string[];
  is_favorite?: boolean;
  personal_difficulty_rating?: number;
}

// 어휘 카드 검색/필터링 옵션
export interface VocabularyCardFilterOptions {
  user_id: string;
  categories?: VocabularyCategory[];
  difficulty_levels?: DifficultyLevel[];
  cefr_levels?: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[];

  // FSRS 기반 필터링
  due_only?: boolean;                 // 복습 예정인 카드만
  new_cards_only?: boolean;          // 새 카드만
  learning_cards_only?: boolean;     // 학습 중인 카드만

  // 성과 기반 필터링
  low_accuracy_cards?: boolean;       // 정확도가 낮은 카드들
  frequently_wrong?: boolean;         // 자주 틀리는 카드들

  // 검색
  search_term?: string;              // 한국어/헝가리어 검색
  tags?: string[];                   // 태그 검색
  is_favorite?: boolean;             // 즐겨찾기 필터

  // 정렬
  sort_by?: 'created_at' | 'due_date' | 'accuracy' | 'difficulty' | 'last_reviewed';
  sort_order?: 'asc' | 'desc';

  // 페이지네이션
  page?: number;
  limit?: number;
}

// 어휘 카드 학습 응답 기록
export interface VocabularyReviewResponse {
  card_id: string;
  user_id: string;
  session_id: string;

  // 응답 정보
  user_response: string;              // 사용자 응답
  correct_answer: string;             // 정답
  is_correct: boolean;                // 정답 여부
  response_time_ms: number;           // 응답 시간

  // 리뷰 유형
  review_type: 'recognition' | 'production' | 'listening' | 'speaking';

  // FSRS 평가
  fsrs_rating: Rating;                // FSRS 평가 등급

  // 추가 정보
  hint_used: boolean;                 // 힌트 사용 여부
  audio_played: boolean;              // 음성 재생 여부
  confidence_level?: number;          // 신뢰도 (1-5)

  // 시스템 정보
  reviewed_at: Date;
  client_info?: {
    platform: string;
    user_agent: string;
    screen_size?: string;
  };
}

// 한국어-헝가리어 학습 난이도 계산을 위한 언어학적 요소
export interface LinguisticDifficultyFactors {
  // 음성학적 요소
  phonetic_difficulty: number;        // 발음 난이도
  stress_pattern_complexity: number;  // 강세 패턴 복잡도

  // 형태학적 요소
  morphological_complexity: number;   // 형태 복잡도
  case_system_difficulty: number;     // 격변화 시스템 난이도

  // 통사학적 요소
  word_order_difference: number;      // 어순 차이
  syntactic_complexity: number;       // 통사 복잡도

  // 어휘적 요소
  false_cognate_risk: number;         // 거짓 동족어 위험
  frequency_asymmetry: number;        // 빈도 비대칭성

  // 화용적 요소
  pragmatic_complexity: number;       // 화용 복잡도
  cultural_specificity: number;       // 문화적 특수성
}

// 어휘 카드 성과 분석 리포트
export interface VocabularyPerformanceReport {
  user_id: string;
  period: {
    start_date: Date;
    end_date: Date;
  };

  overall_stats: {
    total_cards_studied: number;
    total_reviews: number;
    average_accuracy: number;
    total_study_time_minutes: number;
    cards_mastered: number;            // 높은 정확도로 안정화된 카드 수
  };

  // 카테고리별 성과
  category_performance: {
    category: VocabularyCategory;
    accuracy: number;
    review_count: number;
    difficult_cards: string[];         // 어려워하는 카드 ID들
  }[];

  // 난이도별 성과
  difficulty_performance: {
    level: DifficultyLevel;
    accuracy: number;
    retention_rate: number;
    avg_reviews_to_master: number;
  }[];

  // 학습 패턴 분석
  learning_patterns: {
    best_performance_time: string;      // 최고 성과 시간대
    consistency_score: number;          // 일관성 점수 (0-1)
    retention_curve: number[];          // 기억 곡선
    interference_patterns: string[];    // 간섭 패턴
  };

  // 추천사항
  recommendations: {
    focus_areas: VocabularyCategory[];  // 집중 학습 영역
    suggested_cards: string[];          // 추천 카드 ID들
    review_frequency_adjustment: {
      card_id: string;
      suggested_multiplier: number;     // 복습 빈도 조정 배수
    }[];
  };
}

export default {
  DifficultyLevel,
  VocabularyCategory,
  VocabularyType,
  VocabularyCard,
  CreateVocabularyCardDTO,
  UpdateVocabularyCardDTO,
  VocabularyCardFilterOptions,
  VocabularyReviewResponse,
  LinguisticDifficultyFactors,
  VocabularyPerformanceReport
};