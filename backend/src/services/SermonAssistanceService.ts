import SermonDraftModel, {
  CreateSermonDraftInput,
  UpdateSermonDraftInput,
  SermonSection,
  SermonStats,
  SermonSearchFilters,
} from '../models/SermonDraft';
import TheologicalTermModel, {
  TheologicalTermFilters,
  TermRecommendation,
} from '../models/TheologicalTerm';
import { hungarianNLPService, GrammarCheckResult, SermonStyleResult } from './HungarianNLPService';

/**
 * SermonAssistanceService
 * T068 - 설교문 작성 지원 서비스
 *
 * AI 기반 설교 개요 생성, 문법 검사, 표현 개선, 신학 용어 지원 등
 * 헝가리어 설교문 작성의 전 과정을 지원하는 종합 서비스
 */

// 설교 개요 생성 요청
export interface GenerateOutlineRequest {
  topic: {
    korean?: string;
    scripture?: string;
    targetAudience: 'general_congregation' | 'mature_believers' | 'new_believers' | 'youth' | 'children';
    sermonLength: 'short' | 'medium' | 'long'; // 15분, 25분, 35분
    exposition_mode?: boolean;
  };
  userLevel: 'A1' | 'A2' | 'B1' | 'B2';
  preferences: {
    style: 'traditional' | 'contemporary' | 'expository';
    emphasis: string[]; // 'practical_application', 'scriptural_depth', 'verse_by_verse', etc.
    avoidTopics?: string[];
  };
}

// 생성된 설교 개요
export interface GeneratedSermonOutline {
  title: {
    hungarian: string;
    korean_meaning: string;
  };
  sections: SermonSection[];
  theological_terms: TheologicalTermInfo[];
  total_estimated_duration: number;
  scripture_passages: ScripturePassage[];
  cultural_notes: string[];
  difficulty_analysis: {
    vocabulary_level: string;
    grammar_complexity: number;
    theological_depth: number;
  };
}

export interface TheologicalTermInfo {
  hungarian: string;
  korean_meaning: string;
  category: string;
  difficulty_level: string;
  usage_context: string;
  related_terms: string[];
}

export interface ScripturePassage {
  reference: string;
  hungarian_text: string;
  context: string;
  theological_significance: string;
  pronunciation_guide?: string;
}

// 문법 및 표현 검사 요청
export interface CheckGrammarRequest {
  text: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  check_options: {
    grammar: boolean;
    style: boolean;
    theology: boolean;
    pronunciation_hints: boolean;
  };
}

// 문법 검사 결과 (확장된)
export interface SermonGrammarResult extends GrammarCheckResult {
  theological_review: {
    accuracy_score: number;
    terminology_suggestions: TheologicalTermSuggestion[];
    doctrinal_concerns: DoctrineConcern[];
  };
  pronunciation_guides: PronunciationGuide[];
}

export interface TheologicalTermSuggestion {
  position: { start: number; end: number };
  current_term: string;
  suggested_term: string;
  reason: string;
  theological_accuracy: number;
}

export interface DoctrineConcern {
  type: 'doctrinal_accuracy' | 'denominational_preference' | 'cultural_sensitivity';
  message: string;
  severity: 'high' | 'medium' | 'low';
  suggestions: string[];
}

export interface PronunciationGuide {
  word: string;
  phonetic: string;
  audio_available: boolean;
  difficulty: 'easy' | 'moderate' | 'hard';
  tips: string[];
}

// 표현 개선 요청
export interface ImproveExpressionRequest {
  text: string;
  context: 'sermon_introduction' | 'main_body' | 'conclusion' | 'prayer' | 'illustration';
  target_level: 'A1' | 'A2' | 'B1' | 'B2';
  improvement_focus: ('naturalness' | 'formality' | 'clarity' | 'theological_accuracy')[];
}

// 표현 개선 결과
export interface ExpressionImprovementResult {
  suggestions: ExpressionSuggestion[];
  overall_score: number;
  cultural_adaptation: CulturalAdaptation[];
}

export interface ExpressionSuggestion {
  improved_text: string;
  explanation_korean: string;
  confidence_score: number;
  formality_level: 'informal' | 'neutral' | 'formal' | 'liturgical';
  why_better: string;
  examples?: string[];
}

export interface CulturalAdaptation {
  aspect: 'hungarian_church_culture' | 'protestant_tradition' | 'regional_preference';
  original: string;
  adapted: string;
  explanation: string;
}

// 예화 생성 요청
export interface GenerateIllustrationsRequest {
  main_point: {
    korean: string;
    theological_concept: string;
  };
  illustration_type: 'biblical' | 'historical' | 'contemporary' | 'personal';
  target_audience: 'general_congregation' | 'youth' | 'children' | 'mature_believers';
  cultural_context: 'hungarian_church' | 'universal';
}

// 예화 생성 결과
export interface IllustrationResult {
  illustrations: SermonIllustration[];
  usage_tips: string[];
}

export interface SermonIllustration {
  title: string;
  story_hungarian: string;
  application_point: string;
  cultural_relevance_score: number;
  suggested_transitions: {
    opening: string[];
    closing: string[];
  };
  theological_connection: string;
  target_age_group?: string;
}

// 신학 용어 검색 요청
export interface SearchTheologicalTermsRequest {
  search: string;
  category?: 'soteriology' | 'christology' | 'pneumatology' | 'eschatology' | 'biblical_studies';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'all';
}

// 설교문 저장 요청
export interface SaveSermonRequest {
  userId: string;
  draft: {
    title: {
      hungarian: string;
      korean: string;
    };
    scripture_reference: string;
    content: {
      introduction: string;
      main_body: string;
      conclusion: string;
    };
    metadata: {
      target_audience: string;
      estimated_duration: number;
      difficulty_level: string;
      tags: string[];
    };
  };
}

/**
 * 설교문 작성 지원 서비스 클래스
 */
export class SermonAssistanceService {

  private static instance: SermonAssistanceService;

  public static getInstance(): SermonAssistanceService {
    if (!SermonAssistanceService.instance) {
      SermonAssistanceService.instance = new SermonAssistanceService();
    }
    return SermonAssistanceService.instance;
  }

  /**
   * 설교 개요 생성 (AI 기반)
   */
  async generateSermonOutline(request: GenerateOutlineRequest): Promise<GeneratedSermonOutline> {
    try {
      // 입력 검증
      this.validateOutlineRequest(request);

      // 주제 분석 및 신학적 개념 추출
      const theologicalConcepts = await this.analyzeTopicTheology(request.topic);

      // 성경 구절 분석 (제공된 경우)
      const scriptureAnalysis = request.topic.scripture
        ? await this.analyzeScripture(request.topic.scripture)
        : null;

      // 대상 회중과 사용자 레벨에 맞는 구조 생성
      const outline = await this.createSermonStructure(request, theologicalConcepts, scriptureAnalysis);

      // 관련 신학 용어 추천
      const recommendedTerms = await this.recommendTheologicalTerms(
        request.topic.korean || '',
        request.userLevel,
        request.topic.targetAudience
      );

      // 성경 구절 추가 추천
      const additionalScriptures = await this.recommendScriptures(
        theologicalConcepts,
        request.topic.scripture
      );

      return {
        title: outline.title,
        sections: outline.sections,
        theological_terms: recommendedTerms,
        total_estimated_duration: this.calculateTotalDuration(outline.sections),
        scripture_passages: [...(scriptureAnalysis ? [scriptureAnalysis] : []), ...additionalScriptures],
        cultural_notes: await this.generateCulturalNotes(request.topic.targetAudience),
        difficulty_analysis: await this.analyzeDifficulty(outline, recommendedTerms),
      };
    } catch (error) {
      throw new Error(`설교 개요 생성 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 문법 및 표현 검사 (신학적 검토 포함)
   */
  async checkGrammarAndTheology(request: CheckGrammarRequest): Promise<SermonGrammarResult> {
    try {
      // 기본 문법 검사
      const grammarResult = await hungarianNLPService.checkGrammar(request.text, request.check_options);

      // 설교문 전용 문체 검사
      const styleResult = await hungarianNLPService.checkSermonStyle(request.text, 'formal');

      // 신학적 내용 검토
      const theologicalReview = await this.reviewTheologicalAccuracy(request.text);

      // 발음 가이드 생성 (요청된 경우)
      const pronunciationGuides = request.check_options.pronunciation_hints
        ? await this.generatePronunciationGuides(request.text, request.level)
        : [];

      return {
        ...grammarResult,
        style_issues: [...grammarResult.style_issues, ...styleResult.style_issues],
        theological_review: theologicalReview,
        pronunciation_guides: pronunciationGuides,
      };
    } catch (error) {
      throw new Error(`문법 및 신학 검사 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 표현 개선 (헝가리 교회 문화 고려)
   */
  async improveExpression(request: ImproveExpressionRequest): Promise<ExpressionImprovementResult> {
    try {
      // NLP 서비스를 통한 표현 개선
      const enhancementResult = await hungarianNLPService.enhanceExpression(
        request.text,
        request.improvement_focus.includes('naturalness') ? 'naturalness' : 'all'
      );

      // 문화적 적응 추가
      const culturalResult = await hungarianNLPService.adaptToCulturalContext(
        request.text,
        'hungarian_protestant'
      );

      // 설교 컨텍스트에 맞는 추가 개선사항
      const contextualImprovements = await this.generateContextualImprovements(
        request.text,
        request.context,
        request.target_level
      );

      // 제안 통합 및 순위화
      const suggestions = this.prioritizeExpressionSuggestions(
        enhancementResult.enhancements,
        contextualImprovements,
        request.improvement_focus
      );

      return {
        suggestions,
        overall_score: enhancementResult.overall_improvement_score,
        cultural_adaptation: culturalResult.cultural_adaptations.map(adaptation => ({
          aspect: 'hungarian_church_culture',
          original: adaptation.original,
          adapted: adaptation.adapted,
          explanation: adaptation.cultural_note,
        })),
      };
    } catch (error) {
      throw new Error(`표현 개선 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 예화 생성
   */
  async generateIllustrations(request: GenerateIllustrationsRequest): Promise<IllustrationResult> {
    try {
      const illustrations: SermonIllustration[] = [];

      // 요청된 타입에 따른 예화 생성
      switch (request.illustration_type) {
        case 'contemporary':
          illustrations.push(...await this.generateContemporaryIllustrations(request));
          break;
        case 'biblical':
          illustrations.push(...await this.generateBiblicalIllustrations(request));
          break;
        case 'historical':
          illustrations.push(...await this.generateHistoricalIllustrations(request));
          break;
        case 'personal':
          illustrations.push(...await this.generatePersonalIllustrations(request));
          break;
      }

      // 헝가리 교회 문화에 맞게 조정
      const culturallyAdaptedIllustrations = await this.adaptIllustrationsForCulture(
        illustrations,
        request.cultural_context
      );

      return {
        illustrations: culturallyAdaptedIllustrations,
        usage_tips: this.generateIllustrationUsageTips(request.target_audience),
      };
    } catch (error) {
      throw new Error(`예화 생성 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 신학 용어 검색 및 설명
   */
  async searchTheologicalTerms(request: SearchTheologicalTermsRequest) {
    try {
      const filters: TheologicalTermFilters = {
        search_term: request.search,
      };

      if (request.category) {
        filters.category = [request.category];
      }

      if (request.level !== 'all') {
        filters.difficulty_level = [request.level];
      }

      const searchResult = await TheologicalTermModel.search(filters, {
        limit: 20,
        sort: 'relevance',
      });

      // 검색 결과에 사용 예시 및 발음 가이드 추가
      const enrichedTerms = await this.enrichTermsWithExamples(searchResult.terms);

      return {
        terms: enrichedTerms,
        total_count: searchResult.total_count,
        categories_found: searchResult.categories_found,
        difficulty_distribution: searchResult.difficulty_distribution,
      };
    } catch (error) {
      throw new Error(`신학 용어 검색 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 설교문 저장
   */
  async saveSermon(request: SaveSermonRequest) {
    try {
      const sermonData: CreateSermonDraftInput = {
        userId: request.userId,
        title: request.draft.title,
        scriptureReference: request.draft.scripture_reference,
        content: {
          introduction: request.draft.content.introduction,
          main_body: request.draft.content.main_body,
          conclusion: request.draft.content.conclusion,
        },
        metadata: {
          target_audience: request.draft.metadata.target_audience as any,
          estimated_duration: request.draft.metadata.estimated_duration,
          difficulty_level: request.draft.metadata.difficulty_level,
          tags: request.draft.metadata.tags,
        },
      };

      const savedDraft = await SermonDraftModel.create(sermonData);

      return {
        draft_id: savedDraft.id,
        created_at: savedDraft.createdAt,
        version: savedDraft.version,
      };
    } catch (error) {
      throw new Error(`설교문 저장 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 사용자 설교문 목록 조회
   */
  async getUserSermons(userId: string, options: {
    limit?: number;
    sort?: 'recent' | 'title' | 'status';
    filters?: SermonSearchFilters;
  } = {}) {
    try {
      const result = await SermonDraftModel.findByUserId(userId, options);

      // 각 설교문에 추가 메타데이터 포함
      const enrichedDrafts = await Promise.all(
        result.drafts.map(async (draft) => ({
          ...draft,
          word_count: this.calculateWordCount(draft.content),
          theological_terms_used: await this.extractTheologicalTerms(draft.content),
          last_grammar_check: null, // TODO: 문법 검사 기록에서 조회
        }))
      );

      return {
        drafts: enrichedDrafts,
        total_count: result.total_count,
        pagination: {
          limit: options.limit || 10,
          has_more: result.total_count > (options.limit || 10),
        },
      };
    } catch (error) {
      throw new Error(`설교문 목록 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 설교문 통계 조회
   */
  async getUserSermonStats(userId: string): Promise<SermonStats> {
    try {
      return await SermonDraftModel.getUserStats(userId);
    } catch (error) {
      throw new Error(`설교문 통계 조회 실패: ${(error as Error).message}`);
    }
  }

  // ========== Private Helper Methods ==========

  private validateOutlineRequest(request: GenerateOutlineRequest): void {
    if (!request.topic.korean && !request.topic.scripture) {
      throw new Error('주제 또는 성경 구절을 제공해주세요');
    }

    if (!request.userLevel) {
      throw new Error('사용자 헝가리어 레벨을 제공해주세요');
    }
  }

  private async analyzeTopicTheology(topic: any): Promise<string[]> {
    // 주제에서 신학적 개념 추출
    const concepts = [];

    if (topic.korean) {
      const koreanConcepts: Record<string, string[]> = {
        '사랑': ['kegyelem', 'szeretet', 'irgalom'],
        '구원': ['üdvösség', 'megigazulás', 'megváltás'],
        '은혜': ['kegyelem', 'ajándék', 'ingyen kapott'],
        '믿음': ['hit', 'bizalom', 'hűség'],
      };

      Object.entries(koreanConcepts).forEach(([korean, hungarian]) => {
        if (topic.korean.includes(korean)) {
          concepts.push(...hungarian);
        }
      });
    }

    return [...new Set(concepts)]; // 중복 제거
  }

  private async analyzeScripture(reference: string): Promise<ScripturePassage> {
    // Mock implementation - 실제로는 성경 데이터베이스 조회
    return {
      reference,
      hungarian_text: 'Mert úgy szerette Isten a világot, hogy egyszülött Fiát adta érte...',
      context: '하나님의 사랑을 보여주는 핵심 구절',
      theological_significance: '구원의 보편성과 하나님의 희생적 사랑',
      pronunciation_guide: '[ˈmɛrt ˈuːɟ ˈsɛrɛtɛ ˈiʃtɛn]',
    };
  }

  private async createSermonStructure(
    request: GenerateOutlineRequest,
    concepts: string[],
    scripture: ScripturePassage | null
  ) {
    const duration = this.getDurationInMinutes(request.topic.sermonLength);
    const sections: SermonSection[] = [];

    // 서론 (20%)
    sections.push({
      type: 'introduction',
      title: 'Bevezetés',
      suggested_content: '인사말과 주제 소개',
      key_vocabulary: ['kedves testvérek', 'ma beszélni szeretnék'],
      estimated_duration: Math.round(duration * 0.2),
      order: 1,
    });

    // 본론 (60%)
    const mainBodyDuration = Math.round(duration * 0.6);
    if (request.preferences.style === 'expository' && scripture) {
      sections.push({
        type: 'main_point',
        title: 'Igei magyarázat',
        suggested_content: `${scripture.reference} 구절별 해설`,
        key_vocabulary: concepts.slice(0, 5),
        estimated_duration: mainBodyDuration,
        order: 2,
      });
    } else {
      // 3-point 설교
      for (let i = 1; i <= 3; i++) {
        sections.push({
          type: 'main_point',
          title: `${i}. főpont`,
          suggested_content: `주요 논점 ${i}`,
          key_vocabulary: concepts.slice((i-1)*2, i*2),
          estimated_duration: Math.round(mainBodyDuration / 3),
          order: i + 1,
        });
      }
    }

    // 적용 및 결론 (20%)
    sections.push({
      type: 'application',
      title: 'Gyakorlati alkalmazás',
      suggested_content: '실생활 적용점',
      key_vocabulary: ['mindennapi életben', 'gyakorlatban'],
      estimated_duration: Math.round(duration * 0.15),
      order: sections.length + 1,
    });

    sections.push({
      type: 'conclusion',
      title: 'Befejezés',
      suggested_content: '요약 및 기도로 마무리',
      key_vocabulary: ['összefoglalva', 'imádkozzunk'],
      estimated_duration: Math.round(duration * 0.05),
      order: sections.length + 1,
    });

    return {
      title: {
        hungarian: await this.generateHungarianTitle(request.topic.korean || scripture?.reference || ''),
        korean_meaning: request.topic.korean || '하나님의 말씀',
      },
      sections,
    };
  }

  private getDurationInMinutes(length: string): number {
    switch (length) {
      case 'short': return 15;
      case 'medium': return 25;
      case 'long': return 35;
      default: return 25;
    }
  }

  private async generateHungarianTitle(korean: string): Promise<string> {
    const titleTemplates: Record<string, string> = {
      '사랑': 'Isten végtelen szeretete',
      '구원': 'Az üdvösség útja',
      '은혜': 'A kegyelem ajándéka',
      '믿음': 'A hit ereje',
    };

    for (const [koreanKey, hungarianTitle] of Object.entries(titleTemplates)) {
      if (korean.includes(koreanKey)) {
        return hungarianTitle;
      }
    }

    return 'Isten üzenete számunkra';
  }

  private calculateTotalDuration(sections: SermonSection[]): number {
    return sections.reduce((total, section) => total + (section.estimated_duration || 0), 0);
  }

  private async recommendTheologicalTerms(
    topic: string,
    level: string,
    audience: string
  ): Promise<TheologicalTermInfo[]> {
    // Mock implementation
    return [
      {
        hungarian: 'kegyelem',
        korean_meaning: '은혜',
        category: 'soteriology',
        difficulty_level: 'A2',
        usage_context: '하나님의 선물에 대해 말할 때',
        related_terms: ['ajándék', 'szeretet', 'irgalom'],
      },
    ];
  }

  private async recommendScriptures(
    concepts: string[],
    mainScripture?: string
  ): Promise<ScripturePassage[]> {
    // Mock implementation - 실제로는 개념과 관련된 성경 구절 추천
    return [];
  }

  private async generateCulturalNotes(audience: string): Promise<string[]> {
    const notes = [
      '헝가리 교회에서는 설교 시작 시 "Kedves testvérek!"으로 인사하는 것이 일반적입니다',
      '성경 구절을 인용할 때는 헝가리어 성경(Károli) 번역을 사용하세요',
    ];

    if (audience === 'youth') {
      notes.push('젊은이들을 대상으로 할 때는 현대적 예시를 사용하되 격식은 유지하세요');
    }

    return notes;
  }

  private async analyzeDifficulty(outline: any, terms: TheologicalTermInfo[]) {
    return {
      vocabulary_level: 'B1',
      grammar_complexity: 7.5,
      theological_depth: 8.0,
    };
  }

  private async reviewTheologicalAccuracy(text: string) {
    // Mock implementation - 실제로는 신학적 정확성 검토
    return {
      accuracy_score: 90,
      terminology_suggestions: [],
      doctrinal_concerns: [],
    };
  }

  private async generatePronunciationGuides(
    text: string,
    level: string
  ): Promise<PronunciationGuide[]> {
    // Mock implementation
    return [
      {
        word: 'kegyelem',
        phonetic: '[ˈkɛɟɛlɛm]',
        audio_available: true,
        difficulty: 'moderate',
        tips: ['gy는 구개음으로 발음하세요', '첫음절에 강세'],
      },
    ];
  }

  private async generateContextualImprovements(
    text: string,
    context: string,
    level: string
  ): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private prioritizeExpressionSuggestions(
    enhancements: any[],
    contextual: any[],
    focus: string[]
  ): ExpressionSuggestion[] {
    // Mock implementation
    return [
      {
        improved_text: '개선된 텍스트',
        explanation_korean: '더 자연스러운 표현',
        confidence_score: 0.9,
        formality_level: 'formal',
        why_better: '헝가리 교회 문화에 더 적합',
      },
    ];
  }

  private async generateContemporaryIllustrations(
    request: GenerateIllustrationsRequest
  ): Promise<SermonIllustration[]> {
    return [
      {
        title: '현대적 예화',
        story_hungarian: '헝가리어 예화 내용...',
        application_point: '적용점',
        cultural_relevance_score: 9.0,
        suggested_transitions: {
          opening: ['Képzeljék el...', 'Gondoljanak egy pillanatra...'],
          closing: ['Ez pontosan azt mutatja...', 'Ugyanígy...'],
        },
        theological_connection: '신학적 연결점',
      },
    ];
  }

  private async generateBiblicalIllustrations(request: GenerateIllustrationsRequest): Promise<SermonIllustration[]> {
    return [];
  }

  private async generateHistoricalIllustrations(request: GenerateIllustrationsRequest): Promise<SermonIllustration[]> {
    return [];
  }

  private async generatePersonalIllustrations(request: GenerateIllustrationsRequest): Promise<SermonIllustration[]> {
    return [];
  }

  private async adaptIllustrationsForCulture(
    illustrations: SermonIllustration[],
    context: string
  ): Promise<SermonIllustration[]> {
    return illustrations; // Mock - 실제로는 문화적 적응 처리
  }

  private generateIllustrationUsageTips(audience: string): string[] {
    return [
      '예화는 간결하고 명확하게 전달하세요',
      '헝가리 문화에 친숙한 소재를 선택하세요',
      '예화 후에는 반드시 적용점을 명확히 하세요',
    ];
  }

  private async enrichTermsWithExamples(terms: any[]): Promise<any[]> {
    return terms; // Mock implementation
  }

  private calculateWordCount(content: string | null): number {
    if (!content) return 0;
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      const allText = Object.values(parsed).join(' ');
      return allText.split(/\s+/).filter(word => word.length > 0).length;
    } catch {
      return 0;
    }
  }

  private async extractTheologicalTerms(content: string | null): Promise<string[]> {
    if (!content) return [];
    // Mock implementation - 실제로는 NLP 서비스 사용
    return ['kegyelem', 'szeretet'];
  }
}

export const sermonAssistanceService = SermonAssistanceService.getInstance();