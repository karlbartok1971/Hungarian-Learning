import { PrismaClient } from '@prisma/client';

// 로컬 타입 정의 (shared/types 대체)
export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2'
}

export type LearningGoal = 'sermon_preparation' | 'general_communication' | 'academic' | 'professional';

const prisma = new PrismaClient();

/**
 * Curriculum Model
 *
 * A1-B2 헝가리어 커리큘럼 구조와 콘텐츠를 관리하는 데이터 모델
 * 한국인 목회자를 위한 체계적이고 적응형인 학습 커리큘럼
 */

export interface Curriculum {
  id: string;
  title: string;
  description: string;
  version: string;

  // 메타정보
  targetAudience: TargetAudience;
  goals: LearningGoal[];
  totalDurationWeeks: number;
  difficultyProgression: DifficultyProgression;

  // 수준별 구성
  levels: CurriculumLevel[];

  // 한국인 특화 요소
  koreanSpecificAdaptations: KoreanAdaptation;

  // 목회자 특화 요소
  pastoralSpecialization: PastoralCurriculumFeatures;

  // 적응형 요소
  adaptiveFeatures: AdaptiveFeatures;

  // 평가 체계
  assessmentFramework: AssessmentFramework;

  // 메타데이터
  createdAt: Date;
  lastUpdated: Date;
  status: CurriculumStatus;
}

export interface CurriculumLevel {
  level: CEFRLevel;
  title: string;
  description: string;

  // 학습 목표
  canDoStatements: CanDoStatement[];
  learningObjectives: LevelObjective[];

  // 내용 구성
  units: CurriculumUnit[];
  totalUnits: number;
  estimatedWeeks: number;

  // 수준별 특화 요소
  specializations: LevelSpecialization;

  // 평가
  levelAssessment: LevelAssessmentCriteria;

  // 진행 조건
  prerequisiteSkills: string[];
  completionCriteria: CompletionCriteria;
}

export interface CurriculumUnit {
  unitId: string;
  unitNumber: number;
  title: string;
  description: string;
  theme: UnitTheme;

  // 학습 내용
  lessons: CurriculumLesson[];
  totalLessons: number;
  estimatedHours: number;

  // 학습 목표
  unitObjectives: string[];
  keyVocabulary: VocabularyItem[];
  grammarTopics: GrammarTopic[];

  // 목회자 특화 요소
  pastoralApplications?: PastoralApplication[];
  theologicalVocabulary?: TheologicalVocabItem[];

  // 한국인 학습자 지원
  koreanLearnerSupport: UnitKoreanSupport;

  // 평가
  unitAssessment: UnitAssessment;

  // 실용적 활동
  practicalActivities: PracticalActivity[];
}

export interface CurriculumLesson {
  lessonId: string;
  lessonNumber: number;
  title: string;
  type: LessonType;

  // 학습 내용
  mainContent: LessonMainContent;
  supplementaryMaterials: SupplementaryMaterial[];

  // 언어 요소
  vocabulary: VocabularyItem[];
  grammar: GrammarPoint[];
  pronunciation: PronunciationFocus[];

  // 기능적 언어 사용
  communicativeFunctions: CommunicativeFunction[];

  // 문화적 맥락
  culturalContext?: CulturalContext;

  // 목회적 적용
  pastoralRelevance?: PastoralRelevance;

  // 한국인 특화 지원
  koreanContrastiveAnalysis: ContrastiveElement[];

  // 활동 및 연습
  activities: LessonActivity[];
  exercises: Exercise[];

  // 평가
  assessment: LessonAssessment;

  // 메타데이터
  estimatedMinutes: number;
  difficulty: number; // 1-10
  prerequisites: string[];
}

export interface TargetAudience {
  primaryAudience: 'korean_pastors';
  languageBackground: string[];
  culturalBackground: string;
  professionalContext: string;
  ageRange: string;
  motivationalFactors: string[];
}

export interface DifficultyProgression {
  approach: 'gradual' | 'steep' | 'adaptive';
  progressionRate: number; // 1-10 스케일
  scaffoldingLevels: number;
  reviewCycles: number;
}

export interface KoreanAdaptation {
  // 언어적 적응
  linguisticAdaptations: {
    phoneticAdaptations: PhoneticAdaptation[];
    grammaticalContrasts: GrammaticalContrast[];
    lexicalSupport: LexicalSupport[];
  };

  // 문화적 적응
  culturalAdaptations: {
    culturalBridging: CulturalBridge[];
    contextualExplanations: ContextualExplanation[];
    motivationalConnections: MotivationalConnection[];
  };

  // 교수법적 적응
  pedagogicalAdaptations: {
    learningStyleAccommodations: LearningStyleAccommodation[];
    memoryTechniques: MemoryTechnique[];
    errorPrevention: ErrorPreventionStrategy[];
  };
}

export interface PastoralCurriculumFeatures {
  // 종교 어휘 체계
  theologicalVocabularyProgression: {
    A1: TheologicalVocabSet;
    A2: TheologicalVocabSet;
    B1: TheologicalVocabSet;
    B2: TheologicalVocabSet;
  };

  // 설교 기술 발전
  sermonSkillsProgression: {
    basicExpressions: SermonExpressionSet;    // A1-A2
    structuralElements: SermonStructureSet;   // B1
    rhetoricalDevices: SermonRhetoricSet;     // B2
  };

  // 목회적 상황 시나리오
  pastoralScenarios: PastoralScenario[];

  // 헝가리 교회 문화 통합
  hungarianChurchCulture: ChurchCultureIntegration;

  // 성경 헝가리어 소개
  biblicalHungarianIntroduction: BiblicalLanguageIntroduction;
}

export interface AdaptiveFeatures {
  // 개인화 알고리즘
  personalizationRules: PersonalizationRule[];

  // 적응형 순서 조정
  sequenceAdaptation: {
    flexibleOrdering: boolean;
    prerequisiteManagement: PrerequisiteRule[];
    skipLogic: SkipRule[];
  };

  // 난이도 조정
  difficultyAdaptation: {
    dynamicAdjustment: boolean;
    performanceThresholds: PerformanceThreshold[];
    remedialSupport: RemedialSupportRule[];
  };

  // 콘텐츠 추천
  contentRecommendation: {
    algorithmType: 'collaborative' | 'content_based' | 'hybrid';
    recommendationFactors: RecommendationFactor[];
  };
}

export interface AssessmentFramework {
  // 평가 철학
  assessmentPhilosophy: AssessmentPhilosophy;

  // 평가 유형
  assessmentTypes: AssessmentTypeDefinition[];

  // 채점 기준
  gradingCriteria: GradingCriterion[];

  // 피드백 시스템
  feedbackSystem: FeedbackSystemConfig;

  // 진도 추적
  progressTracking: ProgressTrackingConfig;
}

// Supporting Interfaces
export interface CanDoStatement {
  skill: 'listening' | 'reading' | 'speaking' | 'writing' | 'interaction';
  statement: string;
  examples: string[];
  pastoralContext?: string;
}

export interface LevelObjective {
  objectiveId: string;
  category: 'vocabulary' | 'grammar' | 'pronunciation' | 'communication' | 'culture';
  description: string;
  measurableCriteria: string[];
  assessmentMethod: string;
}

export interface VocabularyItem {
  word: string;
  translation: string;
  partOfSpeech: PartOfSpeech;
  frequency: VocabularyFrequency;
  context: string[];
  examples: ExampleSentence[];
  pronunciationGuide: PronunciationGuide;
  memoryAids: MemoryAid[];
  difficulty: number; // 1-10
  thematicCategory: string;
  pastoralRelevance?: PastoralRelevanceLevel;
}

export interface GrammarTopic {
  topicId: string;
  title: string;
  category: GrammarCategory;
  description: string;
  rules: GrammarRule[];
  examples: GrammarExample[];
  exercises: GrammarExercise[];
  koreanContrast: KoreanGrammarContrast;
  difficulty: number;
  prerequisites: string[];
}

export interface TheologicalVocabItem extends VocabularyItem {
  theologicalCategory: 'doctrine' | 'worship' | 'pastoral_care' | 'biblical' | 'liturgical';
  denominationalUsage: string[];
  biblicalReferences?: string[];
  contextualUsage: ContextualUsageExample[];
}

export interface PastoralApplication {
  scenario: string;
  situation: PastoralSituation;
  languageNeeds: string[];
  keyExpressions: string[];
  practiceActivities: string[];
  culturalConsiderations: string[];
}

export interface UnitKoreanSupport {
  contrastiveElements: ContrastiveElement[];
  commonErrors: CommonError[];
  learningStrategies: LearningStrategy[];
  culturalBridges: CulturalBridge[];
  motivationalElements: MotivationalElement[];
}

// Enums and Types
export enum CurriculumStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DEPRECATED = 'deprecated'
}

export enum UnitTheme {
  INTRODUCTION = 'introduction',
  DAILY_LIFE = 'daily_life',
  WORSHIP = 'worship',
  COMMUNITY = 'community',
  PASTORAL_CARE = 'pastoral_care',
  THEOLOGY = 'theology',
  HUNGARIAN_CULTURE = 'hungarian_culture',
  PRACTICAL_MINISTRY = 'practical_ministry'
}

export enum LessonType {
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  PRONUNCIATION = 'pronunciation',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
  READING = 'reading',
  WRITING = 'writing',
  CULTURAL = 'cultural',
  PASTORAL = 'pastoral',
  INTEGRATED = 'integrated'
}

export enum VocabularyFrequency {
  HIGH = 'high',        // 최고 빈도 (1-1000위)
  MEDIUM = 'medium',    // 중간 빈도 (1001-3000위)
  LOW = 'low',          // 낮은 빈도 (3001-5000위)
  SPECIALIZED = 'specialized' // 전문 용어
}

export enum GrammarCategory {
  MORPHOLOGY = 'morphology',     // 형태론 (격변화, 동사변화)
  SYNTAX = 'syntax',             // 통사론 (어순, 문장구조)
  SEMANTICS = 'semantics',       // 의미론
  PRAGMATICS = 'pragmatics'      // 화용론 (언어사용)
}

export enum PastoralSituation {
  PREACHING = 'preaching',
  COUNSELING = 'counseling',
  WORSHIP_LEADING = 'worship_leading',
  COMMUNITY_INTERACTION = 'community_interaction',
  ADMINISTRATIVE = 'administrative',
  BIBLE_STUDY = 'bible_study'
}

export enum PastoralRelevanceLevel {
  ESSENTIAL = 'essential',       // 목회 필수
  IMPORTANT = 'important',       // 목회 중요
  USEFUL = 'useful',            // 목회 유용
  GENERAL = 'general'           // 일반적
}

export enum PartOfSpeech {
  NOUN = 'noun',
  VERB = 'verb',
  ADJECTIVE = 'adjective',
  ADVERB = 'adverb',
  PREPOSITION = 'preposition',
  CONJUNCTION = 'conjunction',
  INTERJECTION = 'interjection',
  PARTICLE = 'particle'
}

/**
 * Curriculum Model Class
 * 커리큘럼 관리를 위한 메인 모델 클래스
 */
export class CurriculumModel {

  /**
   * 새로운 커리큘럼 생성
   */
  static async createCurriculum(
    title: string,
    description: string,
    config: CurriculumConfig
  ): Promise<Curriculum> {

    const curriculum: Curriculum = {
      id: `curriculum_${Date.now()}`,
      title,
      description,
      version: '1.0.0',
      targetAudience: {
        primaryAudience: 'korean_pastors',
        languageBackground: ['korean', 'english'],
        culturalBackground: 'korean_christian',
        professionalContext: 'pastoral_ministry',
        ageRange: '25-65',
        motivationalFactors: ['sermon_preparation', 'pastoral_care', 'cultural_bridge']
      },
      goals: config.goals,
      totalDurationWeeks: config.totalWeeks || 52,
      difficultyProgression: {
        approach: 'gradual',
        progressionRate: 6,
        scaffoldingLevels: 4,
        reviewCycles: 3
      },
      levels: await this.generateLevelStructure(),
      koreanSpecificAdaptations: this.createKoreanAdaptations(),
      pastoralSpecialization: this.createPastoralSpecialization(),
      adaptiveFeatures: this.createAdaptiveFeatures(),
      assessmentFramework: this.createAssessmentFramework(),
      createdAt: new Date(),
      lastUpdated: new Date(),
      status: CurriculumStatus.DRAFT
    };

    // 데이터베이스에 저장 (실제 Prisma 스키마 구현 후)
    // await prisma.curriculum.create({ data: curriculum });

    return curriculum;
  }

  /**
   * 특정 수준의 커리큘럼 유닛 조회
   */
  static async getUnitsForLevel(
    curriculumId: string,
    level: CEFRLevel
  ): Promise<CurriculumUnit[]> {

    const curriculum = await this.getCurriculum(curriculumId);
    if (!curriculum) throw new Error('커리큘럼을 찾을 수 없습니다.');

    const curriculumLevel = curriculum.levels.find(l => l.level === level);
    return curriculumLevel?.units || [];
  }

  /**
   * 개인화된 커리큘럼 시퀀스 생성
   */
  static async generatePersonalizedSequence(
    curriculumId: string,
    learnerProfile: LearnerProfile,
    startLevel: CEFRLevel
  ): Promise<PersonalizedCurriculumSequence> {

    const curriculum = await this.getCurriculum(curriculumId);
    if (!curriculum) throw new Error('커리큘럼을 찾을 수 없습니다.');

    // 학습자 프로필 기반 시퀀스 조정
    const sequence = this.adaptSequenceToLearner(curriculum, learnerProfile, startLevel);

    return {
      sequenceId: `seq_${Date.now()}`,
      curriculumId,
      learnerId: learnerProfile.id,
      startLevel,
      adaptedUnits: sequence.units,
      estimatedDuration: sequence.duration,
      personalizationFactors: sequence.factors,
      createdAt: new Date()
    };
  }

  /**
   * 커리큘럼 콘텐츠 검색
   */
  static async searchContent(
    curriculumId: string,
    searchCriteria: ContentSearchCriteria
  ): Promise<CurriculumSearchResult[]> {

    const curriculum = await this.getCurriculum(curriculumId);
    if (!curriculum) return [];

    // 검색 로직 구현
    const results: CurriculumSearchResult[] = [];

    // 어휘 검색
    if (searchCriteria.vocabularyKeywords) {
      const vocabResults = this.searchVocabulary(curriculum, searchCriteria.vocabularyKeywords);
      results.push(...vocabResults);
    }

    // 문법 주제 검색
    if (searchCriteria.grammarTopics) {
      const grammarResults = this.searchGrammarTopics(curriculum, searchCriteria.grammarTopics);
      results.push(...grammarResults);
    }

    // 목회적 상황 검색
    if (searchCriteria.pastoralContexts) {
      const pastoralResults = this.searchPastoralContent(curriculum, searchCriteria.pastoralContexts);
      results.push(...pastoralResults);
    }

    return results;
  }

  // Private helper methods
  private static async generateLevelStructure(): Promise<CurriculumLevel[]> {
    const levels: CEFRLevel[] = [CEFRLevel.A1, CEFRLevel.A2, CEFRLevel.B1, CEFRLevel.B2];

    return levels.map(level => ({
      level,
      title: this.getLevelTitle(level),
      description: this.getLevelDescription(level),
      canDoStatements: this.generateCanDoStatements(level),
      learningObjectives: this.generateLevelObjectives(level),
      units: this.generateUnitsForLevel(level),
      totalUnits: this.getUnitCountForLevel(level),
      estimatedWeeks: this.getEstimatedWeeksForLevel(level),
      specializations: this.createLevelSpecializations(level),
      levelAssessment: this.createLevelAssessment(level),
      prerequisiteSkills: this.getPrerequisiteSkills(level),
      completionCriteria: this.getCompletionCriteria(level)
    }));
  }

  private static createKoreanAdaptations(): KoreanAdaptation {
    return {
      linguisticAdaptations: {
        phoneticAdaptations: [
          {
            hungarianSound: 'gy',
            koreanApproximation: 'ㄷ+ㅣ',
            difficulty: 8,
            practiceStrategy: 'tongue_position_training'
          },
          {
            hungarianSound: 'ny',
            koreanApproximation: 'ㄴ+ㅣ',
            difficulty: 6,
            practiceStrategy: 'palatal_nasalization'
          }
        ],
        grammaticalContrasts: [
          {
            feature: 'case_system',
            hungarianStructure: 'rich_case_morphology',
            koreanStructure: 'agglutinative_particles',
            difficulty: 9,
            teachingStrategy: 'particle_case_mapping'
          }
        ],
        lexicalSupport: [
          {
            category: 'false_friends',
            examples: ['család (family) vs 사랑 (love)'],
            avoidanceStrategies: ['contextual_emphasis', 'memory_anchors']
          }
        ]
      },
      culturalAdaptations: {
        culturalBridging: [
          {
            hungarianConcept: 'church_hierarchy',
            koreanEquivalent: 'confucian_respect_system',
            explanation: '헝가리 교회의 계급구조를 유교적 존대시스템과 연결하여 이해',
            practicalApplication: '목사님 호칭법 연습'
          }
        ],
        contextualExplanations: [],
        motivationalConnections: []
      },
      pedagogicalAdaptations: {
        learningStyleAccommodations: [],
        memoryTechniques: [],
        errorPrevention: []
      }
    };
  }

  private static createPastoralSpecialization(): PastoralCurriculumFeatures {
    return {
      theologicalVocabularyProgression: {
        A1: {
          level: CEFRLevel.A1,
          terms: ['Isten', 'egyház', 'ima', 'hit'],
          category: 'basic_religious_concepts',
          totalCount: 30
        },
        A2: {
          level: CEFRLevel.A2,
          terms: ['keresztény', 'biblia', 'vasárnap', 'szent'],
          category: 'expanded_religious_vocabulary',
          totalCount: 80
        },
        B1: {
          level: CEFRLevel.B1,
          terms: ['prédikáció', 'lelkipásztor', 'gyülekezet', 'áldás'],
          category: 'pastoral_terminology',
          totalCount: 150
        },
        B2: {
          level: CEFRLevel.B2,
          terms: ['teológia', 'hermeneutika', 'liturgia', 'eszkhatológia'],
          category: 'advanced_theological_terms',
          totalCount: 300
        }
      },
      sermonSkillsProgression: {
        basicExpressions: {
          level: 'basic',
          expressions: ['Kedves testvéreim', 'A mai igéből', 'Imádkozzunk'],
          contexts: ['sermon_opening', 'transitions', 'closing'],
          practiceActivities: ['phrase_drills', 'context_matching']
        },
        structuralElements: {
          level: 'intermediate',
          elements: ['bevezetés', 'kifejtés', 'alkalmazás', 'befejezés'],
          templates: ['classical_sermon_structure', 'topical_approach'],
          practiceActivities: ['outline_creation', 'structure_analysis']
        },
        rhetoricalDevices: {
          level: 'advanced',
          devices: ['metafora', 'analógia', 'exemplum', 'amplifikáció'],
          applications: ['biblical_imagery', 'contemporary_relevance'],
          practiceActivities: ['device_creation', 'sermon_composition']
        }
      },
      pastoralScenarios: [],
      hungarianChurchCulture: {} as ChurchCultureIntegration,
      biblicalHungarianIntroduction: {} as BiblicalLanguageIntroduction
    };
  }

  private static createAdaptiveFeatures(): AdaptiveFeatures {
    return {
      personalizationRules: [],
      sequenceAdaptation: {
        flexibleOrdering: true,
        prerequisiteManagement: [],
        skipLogic: []
      },
      difficultyAdaptation: {
        dynamicAdjustment: true,
        performanceThresholds: [],
        remedialSupport: []
      },
      contentRecommendation: {
        algorithmType: 'hybrid',
        recommendationFactors: []
      }
    };
  }

  private static createAssessmentFramework(): AssessmentFramework {
    return {
      assessmentPhilosophy: {
        approach: 'competency_based',
        principles: ['authenticity', 'fairness', 'transparency']
      },
      assessmentTypes: [],
      gradingCriteria: [],
      feedbackSystem: {} as FeedbackSystemConfig,
      progressTracking: {} as ProgressTrackingConfig
    };
  }

  // Helper methods for level-specific content
  private static getLevelTitle(level: CEFRLevel): string {
    const titles = {
      A1: '헝가리어 기초 완성',
      A2: '일상 헝가리어 구사',
      B1: '종교 어휘 및 중급 문법',
      B2: '설교문 작성 및 고급 표현'
    };
    return titles[level];
  }

  private static getLevelDescription(level: CEFRLevel): string {
    const descriptions = {
      A1: 'A1 수준의 헝가리어 기초를 완벽하게 습득합니다.',
      A2: 'A2 수준의 일상적인 헝가리어 의사소통 능력을 기릅니다.',
      B1: 'B1 수준의 종교적 맥락에서의 헝가리어 사용 능력을 개발합니다.',
      B2: 'B2 수준의 고급 헝가리어로 설교문 작성과 목회적 의사소통을 완성합니다.'
    };
    return descriptions[level];
  }

  // Placeholder methods for database operations and detailed implementations
  private static async getCurriculum(curriculumId: string): Promise<Curriculum | null> { return null; }
  private static generateCanDoStatements(level: CEFRLevel): CanDoStatement[] { return []; }
  private static generateLevelObjectives(level: CEFRLevel): LevelObjective[] { return []; }
  private static generateUnitsForLevel(level: CEFRLevel): CurriculumUnit[] { return []; }
  private static getUnitCountForLevel(level: CEFRLevel): number { return 8; }
  private static getEstimatedWeeksForLevel(level: CEFRLevel): number { return 13; }
  private static createLevelSpecializations(level: CEFRLevel): LevelSpecialization { return {} as LevelSpecialization; }
  private static createLevelAssessment(level: CEFRLevel): LevelAssessmentCriteria { return {} as LevelAssessmentCriteria; }
  private static getPrerequisiteSkills(level: CEFRLevel): string[] { return []; }
  private static getCompletionCriteria(level: CEFRLevel): CompletionCriteria { return {} as CompletionCriteria; }
  private static adaptSequenceToLearner(curriculum: Curriculum, learner: LearnerProfile, startLevel: CEFRLevel): any { return {}; }
  private static searchVocabulary(curriculum: Curriculum, keywords: string[]): CurriculumSearchResult[] { return []; }
  private static searchGrammarTopics(curriculum: Curriculum, topics: string[]): CurriculumSearchResult[] { return []; }
  private static searchPastoralContent(curriculum: Curriculum, contexts: string[]): CurriculumSearchResult[] { return []; }
}

// Supporting type definitions (simplified for space)
export interface CurriculumConfig { goals: LearningGoal[]; totalWeeks?: number; }
export interface LearnerProfile { id: string; preferences: any; constraints: any; }
export interface PersonalizedCurriculumSequence { sequenceId: string; curriculumId: string; learnerId: string; startLevel: CEFRLevel; adaptedUnits: any[]; estimatedDuration: number; personalizationFactors: any[]; createdAt: Date; }
export interface ContentSearchCriteria { vocabularyKeywords?: string[]; grammarTopics?: string[]; pastoralContexts?: string[]; }
export interface CurriculumSearchResult { type: string; content: any; relevance: number; }
export interface LevelSpecialization { specialAreas: string[]; }
export interface LevelAssessmentCriteria { criteria: string[]; }
export interface CompletionCriteria { requirements: string[]; }
export interface PhoneticAdaptation { hungarianSound: string; koreanApproximation: string; difficulty: number; practiceStrategy: string; }
export interface GrammaticalContrast { feature: string; hungarianStructure: string; koreanStructure: string; difficulty: number; teachingStrategy: string; }
export interface LexicalSupport { category: string; examples: string[]; avoidanceStrategies: string[]; }
export interface CulturalBridge { hungarianConcept: string; koreanEquivalent: string; explanation: string; practicalApplication: string; }
export interface ContextualExplanation { context: string; explanation: string; }
export interface MotivationalConnection { element: string; motivation: string; }
export interface LearningStyleAccommodation { style: string; accommodations: string[]; }
export interface MemoryTechnique { name: string; description: string; application: string; }
export interface ErrorPreventionStrategy { errorType: string; prevention: string; }
export interface TheologicalVocabSet { level: CEFRLevel; terms: string[]; category: string; totalCount: number; }
export interface SermonExpressionSet { level: string; expressions: string[]; contexts: string[]; practiceActivities: string[]; }
export interface SermonStructureSet { level: string; elements: string[]; templates: string[]; practiceActivities: string[]; }
export interface SermonRhetoricSet { level: string; devices: string[]; applications: string[]; practiceActivities: string[]; }
export interface PastoralScenario { scenario: string; language: string[]; activities: string[]; }
export interface ChurchCultureIntegration { elements: string[]; }
export interface BiblicalLanguageIntroduction { features: string[]; }
export interface PersonalizationRule { condition: string; action: string; }
export interface PrerequisiteRule { prerequisite: string; rule: string; }
export interface SkipRule { condition: string; skipTo: string; }
export interface PerformanceThreshold { metric: string; threshold: number; }
export interface RemedialSupportRule { trigger: string; support: string; }
export interface RecommendationFactor { factor: string; weight: number; }
export interface AssessmentPhilosophy { approach: string; principles: string[]; }
export interface AssessmentTypeDefinition { type: string; description: string; }
export interface GradingCriterion { criterion: string; scale: string; }
export interface FeedbackSystemConfig { type: string; features: string[]; }
export interface ProgressTrackingConfig { metrics: string[]; frequency: string; }
export interface ExampleSentence { sentence: string; translation: string; context: string; }
export interface PronunciationGuide { ipa: string; audioUrl?: string; tips: string[]; }
export interface MemoryAid { type: string; content: string; effectiveness: number; }
export interface GrammarRule { rule: string; explanation: string; exceptions: string[]; }
export interface GrammarExample { example: string; translation: string; analysis: string; }
export interface GrammarExercise { type: string; content: any; difficulty: number; }
export interface KoreanGrammarContrast { koreanEquivalent: string; differences: string[]; learningTips: string[]; }
export interface ContextualUsageExample { context: string; example: string; appropriateness: string; }
export interface ContrastiveElement { aspect: string; hungarian: string; korean: string; learningTip: string; }
export interface CommonError { error: string; correction: string; explanation: string; }
export interface LearningStrategy { strategy: string; application: string; effectiveness: number; }
export interface MotivationalElement { element: string; impact: string; implementation: string; }
export interface LessonMainContent { type: string; content: any; duration: number; }
export interface SupplementaryMaterial { type: string; url: string; description: string; }
export interface GrammarPoint { point: string; explanation: string; examples: string[]; }
export interface PronunciationFocus { sound: string; difficulty: number; practice: string[]; }
export interface CommunicativeFunction { function: string; expressions: string[]; situations: string[]; }
export interface CulturalContext { aspect: string; explanation: string; relevance: string; }
export interface PastoralRelevance { context: string; application: string; importance: number; }
export interface LessonActivity { type: string; description: string; duration: number; }
export interface Exercise { type: string; content: any; difficulty: number; }
export interface LessonAssessment { type: string; criteria: string[]; scoring: any; }
export interface UnitAssessment { type: string; components: string[]; weighting: any; }
export interface PracticalActivity { activity: string; objective: string; procedure: string[]; }