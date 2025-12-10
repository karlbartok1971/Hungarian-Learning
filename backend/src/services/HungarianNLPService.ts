import TheologicalTermModel from '../models/TheologicalTerm';
import { hungarianNLP } from '../lib/hungarianNLPClient';
import { getLanguageToolClient, type LanguageToolClient } from '../lib/languageToolClient';

/**
 * HungarianNLPService
 * T067 - 헝가리어 자연어 처리 서비스
 *
 * HuSpaCy와 LanguageTool을 활용한 헝가리어 문법 검사, 구문 분석, 문체 개선
 * 설교문 작성 지원을 위한 종합 NLP 기능 제공
 */

// 토큰 정보
export interface Token {
  text: string;
  lemma: string;
  pos: string; // 품사 태그
  tag: string; // 세부 형태소 태그
  start: number;
  end: number;
  is_theological_term?: boolean;
}

// 문장 정보
export interface Sentence {
  text: string;
  start: number;
  end: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  complexity_score: number; // 1-10 (문장 복잡도)
  theological_content: boolean;
}

// 명명된 개체 인식
export interface Entity {
  text: string;
  label: 'THEOLOGICAL_TERM' | 'BIBLICAL_TEXT' | 'PERSON' | 'PLACE' | 'DATE';
  start: number;
  end: number;
  confidence: number;
}

// 의존성 관계
export interface Dependency {
  head: string;
  child: string;
  relation: string;
  head_index: number;
  child_index: number;
}

// 구문 트리
export interface SyntaxTree {
  root: string;
  children: TreeNode[];
}

export interface TreeNode {
  node: string;
  children: TreeNode[] | string[];
  relation?: string;
}

// 텍스트 분석 결과
export interface TextAnalysisResult {
  tokens: Token[];
  sentences: Sentence[];
  entities: Entity[];
  dependencies: Dependency[];
  syntax_tree: SyntaxTree;
  metadata: {
    total_words: number;
    total_sentences: number;
    avg_sentence_length: number;
    theological_term_count: number;
    complexity_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  };
}

// 문법 오류 정보
export interface GrammarError {
  type: 'article_agreement' | 'case_agreement' | 'verb_conjugation' | 'word_order' |
        'definite_conjugation' | 'possessive_agreement' | 'number_agreement';
  position: { start: number; end: number };
  original_text: string;
  suggested_correction: string;
  explanation_korean: string;
  severity: 'high' | 'medium' | 'low';
  confidence: number;
  rule_id: string;
}

// 문법 검사 결과
export interface GrammarCheckResult {
  errors: GrammarError[];
  corrected_text: string;
  confidence_score: number;
  style_issues: StyleIssue[];
  overall_score: number; // 1-100
  suggestions_applied: number;
}

// 문체 문제
export interface StyleIssue {
  type: 'inappropriate_greeting' | 'informal_pronoun' | 'repetitive_structure' |
        'wrong_register' | 'unclear_reference' | 'weak_conclusion';
  position: { start: number; end: number };
  message: string;
  suggestions: string[];
  severity: 'high' | 'medium' | 'low';
}

// 설교문 문체 검사 결과
export interface SermonStyleResult {
  style_issues: StyleIssue[];
  formality_score: number; // 1-10
  suggested_rewrite: string;
  theological_appropriateness: number; // 1-100
  audience_suitability: {
    general_congregation: number;
    mature_believers: number;
    new_believers: number;
  };
}

// 신학 용어 인식 결과
export interface TheologicalTermsResult {
  terms: TheologicalTermInfo[];
  complexity_score: number;
  suggested_simplifications: TermSimplification[];
  missing_explanations: string[];
}

export interface TheologicalTermInfo {
  term: string;
  category: string;
  korean_meaning: string;
  definition_hungarian: string;
  definition_korean: string;
  difficulty_level: string;
  position: { start: number; end: number };
  related_terms: string[];
  usage_frequency: number;
}

export interface TermSimplification {
  original: string;
  simplified: string;
  explanation: string;
  target_level: string;
}

// 성경 구절 참조
export interface BibleReference {
  reference: string;
  type: 'direct_quote' | 'indirect_reference' | 'paraphrase';
  position: { start: number; end: number };
  book: string;
  chapter: number;
  verses: number[];
  quote_accuracy?: number; // 직접 인용일 경우
  standardized_form: string;
  hungarian_text?: string;
}

// 성경 인용 검증 결과
export interface BibleQuoteVerification {
  references: BibleReference[];
  quote_verification: {
    total_references: number;
    accurate_quotes: number;
    needs_correction: number;
    missing_citations: string[];
  };
}

// 표현 개선 결과
export interface ExpressionEnhancement {
  original: string;
  improved: string;
  improvement_type: 'naturalness' | 'elegance' | 'clarity' | 'formality' | 'theological_accuracy';
  explanation: string;
  confidence: number;
  cultural_note?: string;
}

export interface ExpressionEnhancementResult {
  enhancements: ExpressionEnhancement[];
  overall_improvement_score: number;
  style_consistency: 'formal_religious' | 'conversational' | 'academic' | 'liturgical';
  reading_level: string;
}

// 문장 구조 개선
export interface StructuralImprovement {
  issue: 'repetitive_structure' | 'run_on_sentence' | 'fragment' | 'unclear_subject' |
         'poor_transitions' | 'weak_opening' | 'abrupt_ending';
  suggestion: string;
  reason: string;
  impact: 'better_flow' | 'increased_clarity' | 'improved_engagement' | 'stronger_emphasis';
  examples?: string[];
}

export interface SentenceStructureResult {
  structural_improvements: StructuralImprovement[];
  readability_score: {
    before: number;
    after: number;
    improvement: number;
  };
  suggested_transitions: string[];
  flow_analysis: {
    introduction_strength: number;
    main_body_coherence: number;
    conclusion_effectiveness: number;
  };
}

// 문화적 적응 결과
export interface CulturalAdaptation {
  aspect: 'prayer_style' | 'greeting_form' | 'scriptural_reference' |
          'liturgical_language' | 'hungarian_traditions';
  original: string;
  adapted: string;
  cultural_note: string;
  regional_preference?: 'budapest' | 'rural' | 'reformed' | 'catholic' | 'evangelical';
}

export interface CulturalAdaptationResult {
  cultural_adaptations: CulturalAdaptation[];
  cultural_appropriateness_score: number;
  local_expressions: string[];
  avoided_expressions: string[];
  denominational_notes: string[];
}

/**
 * 헝가리어 NLP 서비스 클래스
 */
export class HungarianNLPService {

  private static instance: HungarianNLPService;
  private husSpacyLoaded: boolean = false;
  private languageToolLoaded: boolean = false;
  private languageToolClient: LanguageToolClient;

  constructor() {
    this.languageToolClient = getLanguageToolClient();
    this.initializeNLPTools();
  }

  public static getInstance(): HungarianNLPService {
    if (!HungarianNLPService.instance) {
      HungarianNLPService.instance = new HungarianNLPService();
    }
    return HungarianNLPService.instance;
  }

  /**
   * NLP 도구 초기화
   */
  private async initializeNLPTools(): Promise<void> {
    try {
      // HuSpaCy 초기화 (Python 서버와 통신)
      await this.initializeHuSpaCy();
      this.husSpacyLoaded = true;

      // LanguageTool 초기화
      await this.initializeLanguageTool();
      this.languageToolLoaded = true;

      console.log('Hungarian NLP tools initialized successfully');
    } catch (error) {
      console.error('Failed to initialize NLP tools:', error);
      // 실패해도 서비스는 계속 동작 (fallback 사용)
      console.warn('Using fallback NLP processing');
    }
  }

  private async initializeHuSpaCy(): Promise<void> {
    try {
      // HuSpaCy Python 서버 연결 확인
      const isReady = await hungarianNLP.isReady();
      if (!isReady) {
        throw new Error('HuSpaCy server not ready');
      }
      console.log('HuSpaCy Hungarian model connected successfully');
    } catch (error) {
      console.warn('HuSpaCy server connection failed, using fallback:', error);
      throw error;
    }
  }

  private async initializeLanguageTool(): Promise<void> {
    try {
      // LanguageTool 서버 연결 확인
      const isConnected = await this.languageToolClient.checkConnection();
      if (!isConnected) {
        throw new Error('LanguageTool server not connected');
      }
      console.log('LanguageTool server connected successfully');
    } catch (error) {
      console.warn('LanguageTool server connection failed, using fallback:', error);
      throw error;
    }
  }

  /**
   * 텍스트 분석 (토큰화, 품사 태깅, NER)
   */
  async analyzeText(text: string): Promise<TextAnalysisResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('유효한 텍스트를 입력해주세요');
    }

    try {
      if (this.husSpacyLoaded) {
        // HuSpaCy 서버를 통한 실제 분석
        const analysisResult = await hungarianNLP.analyzeText({
          text,
          include_entities: true,
          include_dependencies: true,
          include_sentiment: true
        });

        // HuSpaCy 결과를 내부 포맷으로 변환
        const tokens: Token[] = analysisResult.tokens.map(token => ({
          text: token.text,
          lemma: token.lemma,
          pos: token.pos,
          tag: token.tag,
          start: token.start,
          end: token.end,
          is_theological_term: token.is_theological_term
        }));

        const sentences: Sentence[] = analysisResult.sentences.map(sentence => ({
          text: sentence.text,
          start: sentence.start,
          end: sentence.end,
          sentiment: sentence.sentiment as 'positive' | 'negative' | 'neutral',
          complexity_score: sentence.complexity_score,
          theological_content: sentence.theological_content
        }));

        const entities: Entity[] = analysisResult.entities.map(entity => ({
          text: entity.text,
          label: entity.label as 'THEOLOGICAL_TERM' | 'BIBLICAL_TEXT' | 'PERSON' | 'PLACE' | 'DATE',
          start: entity.start,
          end: entity.end,
          confidence: entity.confidence
        }));

        const dependencies: Dependency[] = analysisResult.dependencies.map(dep => ({
          head: dep.head,
          child: dep.child,
          relation: dep.relation,
          head_index: dep.head_index,
          child_index: dep.child_index
        }));

        const syntax_tree = await this.buildSyntaxTree(dependencies);

        return {
          tokens,
          sentences,
          entities,
          dependencies,
          syntax_tree,
          metadata: {
            total_words: analysisResult.metadata.total_words,
            total_sentences: analysisResult.metadata.total_sentences,
            avg_sentence_length: analysisResult.metadata.avg_sentence_length,
            theological_term_count: analysisResult.metadata.theological_term_count,
            complexity_level: analysisResult.metadata.complexity_level as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          },
        };
      } else {
        // Fallback 처리: HuSpaCy가 사용 불가능할 때
        console.warn('HuSpaCy not available, using fallback analysis');
        return await this.fallbackAnalysis(text);
      }
    } catch (error) {
      console.error('HuSpaCy analysis failed, falling back to basic analysis:', error);
      return await this.fallbackAnalysis(text);
    }
  }

  /**
   * Fallback 텍스트 분석 (HuSpaCy 사용 불가능할 때)
   */
  private async fallbackAnalysis(text: string): Promise<TextAnalysisResult> {
    const tokens = await this.tokenizeText(text);
    const sentences = await this.segmentSentences(text);
    const entities = await this.recognizeEntities(text);
    const dependencies = await this.parseDependencies(text);
    const syntax_tree = await this.buildSyntaxTree(dependencies);

    // 신학 용어 표시
    await this.markTheologicalTerms(tokens);

    // 메타데이터 계산
    const metadata = this.calculateTextMetadata(tokens, sentences);

    return {
      tokens,
      sentences,
      entities,
      dependencies,
      syntax_tree,
      metadata,
    };
  }

  /**
   * 텍스트 토큰화 (Fallback)
   */
  private async tokenizeText(text: string): Promise<Token[]> {
    // Mock implementation - 실제로는 HuSpaCy 호출
    const words = text.split(/\s+/);
    const tokens: Token[] = [];
    let position = 0;

    for (const word of words) {
      const start = text.indexOf(word, position);
      const end = start + word.length;

      tokens.push({
        text: word,
        lemma: this.getLemma(word),
        pos: this.getPOS(word),
        tag: this.getTag(word),
        start,
        end,
      });

      position = end;
    }

    return tokens;
  }

  /**
   * 문장 분할
   */
  private async segmentSentences(text: string): Promise<Sentence[]> {
    // Mock implementation
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const results: Sentence[] = [];
    let position = 0;

    for (const sentence of sentences) {
      const start = text.indexOf(sentence.trim(), position);
      const end = start + sentence.trim().length;

      results.push({
        text: sentence.trim(),
        start,
        end,
        sentiment: this.analyzeSentiment(sentence),
        complexity_score: this.calculateComplexity(sentence),
        theological_content: this.hasTheologicalContent(sentence),
      });

      position = end;
    }

    return results;
  }

  /**
   * 명명된 개체 인식
   */
  private async recognizeEntities(text: string): Promise<Entity[]> {
    // Mock implementation - 실제로는 HuSpaCy NER + 커스텀 신학 용어 인식
    const entities: Entity[] = [];

    // 신학 용어 인식
    const theologicalTerms = ['Isten', 'Jézus', 'Krisztus', 'kegyelem', 'üdvösség'];
    for (const term of theologicalTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        entities.push({
          text: match[0],
          label: 'THEOLOGICAL_TERM',
          start: match.index,
          end: match.index + match[0].length,
          confidence: 0.95,
        });
      }
    }

    // 성경 구절 인식
    const bibleRegex = /(\w+)\s+(\d+):(\d+)/g;
    let match;
    while ((match = bibleRegex.exec(text)) !== null) {
      entities.push({
        text: match[0],
        label: 'BIBLICAL_TEXT',
        start: match.index,
        end: match.index + match[0].length,
        confidence: 0.9,
      });
    }

    return entities;
  }

  /**
   * 의존성 구문 분석
   */
  async parseDependencies(text: string): Promise<Dependency[]> {
    // Mock implementation - 실제로는 HuSpaCy 의존성 파서 사용
    return [
      {
        head: 'jön',
        child: 'ember',
        relation: 'nsubj',
        head_index: 2,
        child_index: 1,
      },
    ];
  }

  /**
   * 구문 트리 구축
   */
  private async buildSyntaxTree(dependencies: Dependency[]): Promise<SyntaxTree> {
    // Mock implementation
    return {
      root: 'jön',
      children: [
        {
          node: 'ember',
          children: ['Az'],
        },
      ],
    };
  }

  /**
   * 문법 검사
   */
  async checkGrammar(text: string, options: {
    grammar: boolean;
    style: boolean;
    theology: boolean;
    pronunciation_hints: boolean;
  } = { grammar: true, style: true, theology: true, pronunciation_hints: false }): Promise<GrammarCheckResult> {
    try {
      let errors: GrammarError[] = [];
      const style_issues: StyleIssue[] = [];

      if (this.husSpacyLoaded && options.grammar) {
        try {
          // HuSpaCy 서버를 통한 문법 검사
          const grammarResult = await hungarianNLP.checkGrammar({
            text,
            level: 'B1',
            check_style: options.style
          });

          // HuSpaCy 결과를 내부 포맷으로 변환
          errors = grammarResult.errors.map(error => ({
            type: error.type as 'article_agreement' | 'case_agreement' | 'verb_conjugation' | 'word_order' |
                  'definite_conjugation' | 'possessive_agreement' | 'number_agreement',
            position: error.position,
            original_text: error.original_text,
            suggested_correction: error.suggested_correction,
            explanation_korean: error.explanation_korean,
            severity: error.severity as 'high' | 'medium' | 'low',
            confidence: error.confidence,
            rule_id: error.type
          }));

          return {
            errors,
            corrected_text: grammarResult.corrected_text,
            confidence_score: grammarResult.confidence_score,
            style_issues,
            overall_score: grammarResult.overall_score,
            suggestions_applied: errors.length,
          };
        } catch (husSpacyError) {
          console.warn('HuSpaCy grammar check failed, falling back to local rules:', husSpacyError);
        }
      }

      // Fallback: 로컬 문법 규칙 사용
      if (options.grammar) {
        const grammarErrors = await this.runLanguageToolCheck(text);
        errors.push(...grammarErrors);
      }

      // 커스텀 헝가리어 규칙 검사
      const customErrors = await this.checkHungarianSpecificRules(text);
      errors.push(...customErrors);

      // 문체 검사
      if (options.style) {
        const styleProblems = await this.checkStyle(text);
        style_issues.push(...styleProblems);
      }

      // 교정된 텍스트 생성
      const corrected_text = this.applyCorrections(text, errors);

      // 전체 점수 계산
      const overall_score = this.calculateOverallScore(text, errors, style_issues);

      return {
        errors,
        corrected_text,
        confidence_score: this.calculateConfidence(errors),
        style_issues,
        overall_score,
        suggestions_applied: errors.length,
      };
    } catch (error) {
      throw new Error(`문법 검사 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 설교문 전용 문체 검사
   */
  async checkSermonStyle(text: string, target_style: 'formal' | 'conversational' = 'formal'): Promise<SermonStyleResult> {
    try {
      const style_issues: StyleIssue[] = [];

      // 부적절한 인사말 검사
      if (text.match(/\b(Hé|Szevasz|Szia)\b/i)) {
        style_issues.push({
          type: 'inappropriate_greeting',
          position: { start: 0, end: 12 },
          message: '설교에는 더 격식 있는 인사말을 사용하세요',
          suggestions: ['Kedves testvérek!', 'Szeretett gyülekezet!'],
          severity: 'high',
        });
      }

      // 비공식적 대명사 사용
      if (text.match(/\bmit gondoltok\b/i)) {
        style_issues.push({
          type: 'informal_pronoun',
          position: { start: 13, end: 24 },
          message: '설교에서는 더 존경하는 표현을 사용하세요',
          suggestions: ['Mit gondolnak', 'Hogyan vélekednek'],
          severity: 'medium',
        });
      }

      const formality_score = this.calculateFormality(text);
      const suggested_rewrite = this.suggestFormalRewrite(text);

      return {
        style_issues,
        formality_score,
        suggested_rewrite,
        theological_appropriateness: 85,
        audience_suitability: {
          general_congregation: 90,
          mature_believers: 95,
          new_believers: 80,
        },
      };
    } catch (error) {
      throw new Error(`설교문 문체 검사 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 신학 용어 인식
   */
  async recognizeTheologicalTerms(text: string): Promise<TheologicalTermsResult> {
    try {
      const terms: TheologicalTermInfo[] = [];
      const suggested_simplifications: TermSimplification[] = [];

      // 데이터베이스에서 신학 용어 매칭
      const words = text.toLowerCase().split(/\s+/);
      for (const word of words) {
        const term = await TheologicalTermModel.findByHungarian(word);
        if (term) {
          const position = text.toLowerCase().indexOf(word);
          terms.push({
            term: term.hungarian,
            category: term.category,
            korean_meaning: term.korean_meaning,
            definition_hungarian: term.definition_hungarian,
            definition_korean: term.definition_korean,
            difficulty_level: term.difficulty_level,
            position: { start: position, end: position + word.length },
            related_terms: JSON.parse(term.related_terms || '[]'),
            usage_frequency: term.usage_frequency,
          });

          // 어려운 용어에 대한 간소화 제안
          if (term.difficulty_level === 'B2' || term.difficulty_level === 'C1') {
            suggested_simplifications.push({
              original: term.hungarian,
              simplified: this.findSimplifiedTerm(term.hungarian),
              explanation: 'A1-A2 수준 학습자를 위한 단순화',
              target_level: 'A2',
            });
          }
        }
      }

      return {
        terms,
        complexity_score: this.calculateTermComplexity(terms),
        suggested_simplifications,
        missing_explanations: this.findMissingExplanations(terms),
      };
    } catch (error) {
      throw new Error(`신학 용어 인식 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 성경 구절 인용 인식 및 검증
   */
  async recognizeBibleReferences(text: string): Promise<BibleQuoteVerification> {
    try {
      const references: BibleReference[] = [];

      // 성경 구절 패턴 인식
      const patterns = [
        /(\w+)\s+(\d+):(\d+)(-(\d+))?/g, // János 3:16, Márk 1:15-17
        /(\w+)\s+evangélium\s+(\d+)\.\s*fejezet\s+(\d+)\.\s*vers/g, // Márk evangélium 1. fejezet 15. verse
      ];

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const book = match[1];
          const chapter = parseInt(match[2]);
          const startVerse = parseInt(match[3]);
          const endVerse = match[5] ? parseInt(match[5]) : startVerse;

          const verses = [];
          for (let v = startVerse; v <= endVerse; v++) {
            verses.push(v);
          }

          references.push({
            reference: match[0],
            type: this.determineReferenceType(text, match[0]),
            position: { start: match.index, end: match.index + match[0].length },
            book,
            chapter,
            verses,
            standardized_form: `${book} ${chapter}:${verses.join('-')}`,
            quote_accuracy: this.verifyQuoteAccuracy(text, match[0]),
          });
        }
      }

      return {
        references,
        quote_verification: {
          total_references: references.length,
          accurate_quotes: references.filter(r => r.quote_accuracy && r.quote_accuracy > 0.9).length,
          needs_correction: references.filter(r => r.quote_accuracy && r.quote_accuracy < 0.8).length,
          missing_citations: this.findMissingCitations(text),
        },
      };
    } catch (error) {
      throw new Error(`성경 구절 인식 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 표현 개선
   */
  async enhanceExpression(
    text: string,
    enhancement_type: 'naturalness' | 'elegance' | 'clarity' | 'all' = 'all'
  ): Promise<ExpressionEnhancementResult> {
    try {
      const enhancements: ExpressionEnhancement[] = [];

      // 부자연스러운 표현 개선
      const unnaturalExpressions = this.findUnnaturalExpressions(text);
      for (const expr of unnaturalExpressions) {
        enhancements.push({
          original: expr.original,
          improved: expr.improved,
          improvement_type: 'naturalness',
          explanation: '더 자연스러운 헝가리어 표현',
          confidence: expr.confidence,
        });
      }

      // 격식 개선
      if (enhancement_type === 'elegance' || enhancement_type === 'all') {
        const eleganceImprovements = this.improveElegance(text);
        enhancements.push(...eleganceImprovements);
      }

      return {
        enhancements,
        overall_improvement_score: this.calculateImprovementScore(enhancements),
        style_consistency: 'formal_religious',
        reading_level: this.determineReadingLevel(text),
      };
    } catch (error) {
      throw new Error(`표현 개선 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 문장 구조 개선
   */
  async improveSentenceStructure(text: string): Promise<SentenceStructureResult> {
    try {
      const structural_improvements: StructuralImprovement[] = [];

      // 반복적 구조 감지
      if (this.hasRepetitiveStructure(text)) {
        structural_improvements.push({
          issue: 'repetitive_structure',
          suggestion: this.suggestStructureImprovement(text),
          reason: '반복적인 문장 구조를 연결사로 개선',
          impact: 'better_flow',
        });
      }

      const readability_before = this.calculateReadability(text);
      const improved_text = this.applyStructuralImprovements(text, structural_improvements);
      const readability_after = this.calculateReadability(improved_text);

      return {
        structural_improvements,
        readability_score: {
          before: readability_before,
          after: readability_after,
          improvement: readability_after - readability_before,
        },
        suggested_transitions: ['továbbá', 'ráadásul', 'mindezek mellett'],
        flow_analysis: this.analyzeTextFlow(text),
      };
    } catch (error) {
      throw new Error(`문장 구조 개선 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 문화적 맥락 적응
   */
  async adaptToCulturalContext(
    text: string,
    context: 'hungarian_protestant' | 'hungarian_catholic' | 'general'
  ): Promise<CulturalAdaptationResult> {
    try {
      const cultural_adaptations: CulturalAdaptation[] = [];

      // 기도 스타일 적응
      const prayerMatches = text.match(/(하나님 아버지|감사합니다)/g);
      if (prayerMatches) {
        cultural_adaptations.push({
          aspect: 'prayer_style',
          original: '하나님 아버지, 감사합니다',
          adapted: 'Mennyei Atyánk, hálásan köszönjük',
          cultural_note: '헝가리 개신교 기도 형식에 맞게 조정',
        });
      }

      return {
        cultural_adaptations,
        cultural_appropriateness_score: 8.7,
        local_expressions: ['Áldott legyen az Isten', 'Isten áldása legyen rajtatok'],
        avoided_expressions: ['너무 한국적인 표현들'],
        denominational_notes: ['개신교 전통에 맞는 용어 사용'],
      };
    } catch (error) {
      throw new Error(`문화적 적응 실패: ${(error as Error).message}`);
    }
  }

  // ========== Helper Methods ==========

  private async markTheologicalTerms(tokens: Token[]): Promise<void> {
    for (const token of tokens) {
      const term = await TheologicalTermModel.findByHungarian(token.text.toLowerCase());
      if (term) {
        token.is_theological_term = true;
      }
    }
  }

  private calculateTextMetadata(tokens: Token[], sentences: Sentence[]) {
    const total_words = tokens.length;
    const total_sentences = sentences.length;
    const avg_sentence_length = total_words / total_sentences || 0;
    const theological_term_count = tokens.filter(t => t.is_theological_term).length;

    let complexity_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' = 'A1';
    if (avg_sentence_length > 15 || theological_term_count > 5) complexity_level = 'B1';
    if (avg_sentence_length > 20 || theological_term_count > 10) complexity_level = 'B2';

    return {
      total_words,
      total_sentences,
      avg_sentence_length,
      theological_term_count,
      complexity_level,
    };
  }

  private getLemma(word: string): string {
    // Mock lemmatization - 실제로는 HuSpaCy 사용
    return word.toLowerCase();
  }

  private getPOS(word: string): string {
    // Mock POS tagging
    if (word.match(/^[A-ZÁÉÍÓÖŐÚÜŰ]/)) return 'NOUN';
    return 'WORD';
  }

  private getTag(word: string): string {
    return 'Word';
  }

  private analyzeSentiment(sentence: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['szeretet', 'kegyelem', 'áldás', 'öröm'];
    const hasPositive = positiveWords.some(word => sentence.toLowerCase().includes(word));
    return hasPositive ? 'positive' : 'neutral';
  }

  private calculateComplexity(sentence: string): number {
    const words = sentence.split(/\s+/).length;
    return Math.min(10, Math.max(1, Math.ceil(words / 3)));
  }

  private hasTheologicalContent(sentence: string): boolean {
    const theologicalWords = ['Isten', 'Jézus', 'kegyelem', 'hit', 'szeretet'];
    return theologicalWords.some(word => sentence.includes(word));
  }

  private async runLanguageToolCheck(text: string): Promise<GrammarError[]> {
    if (!this.languageToolLoaded) {
      // Fallback 처리
      console.warn('LanguageTool not loaded, using basic rules');
      return await this.checkHungarianSpecificRules(text);
    }

    try {
      // LanguageTool 서버를 통한 문법 검사
      const result = await this.languageToolClient.checkHungarianSermon(text);

      // LanguageTool 결과를 내부 포맷으로 변환
      return result.matches.map(match => {
        const errorType = this.mapLanguageToolRuleToType(match.rule.id);
        const severity = this.mapLanguageToolSeverity(match.rule.issueType);

        return {
          type: errorType,
          position: { start: match.offset, end: match.offset + match.length },
          original_text: match.context.text.substring(match.context.offset, match.context.offset + match.context.length),
          suggested_correction: match.replacements.length > 0 ? match.replacements[0].value : match.context.text,
          explanation_korean: this.translateLanguageToolMessage(match.message),
          severity,
          confidence: this.calculateConfidenceFromMatch(match),
          rule_id: match.rule.id,
        };
      });
    } catch (error) {
      console.error('LanguageTool check failed, using fallback:', error);
      return await this.checkHungarianSpecificRules(text);
    }
  }

  /**
   * LanguageTool 규칙 ID를 내부 타입으로 매핑
   */
  private mapLanguageToolRuleToType(ruleId: string):
    'article_agreement' | 'case_agreement' | 'verb_conjugation' | 'word_order' |
    'definite_conjugation' | 'possessive_agreement' | 'number_agreement' {

    const mapping: Record<string, any> = {
      'HU_ARTICLE_AGREEMENT_THEOLOGICAL': 'article_agreement',
      'HU_ARTICLE_AGREEMENT_CONSONANT': 'article_agreement',
      'HU_THEOLOGICAL_CASE_AGREEMENT': 'case_agreement',
      'HU_WORD_ORDER_EMPHASIS': 'word_order',
      'AGREEMENT_SENT_START': 'case_agreement',
      'HUNGARIAN_DEFINITE_CONJUGATION': 'definite_conjugation',
      'POSSESSIVE_AGREEMENT': 'possessive_agreement',
      'NUMBER_AGREEMENT': 'number_agreement',
      'VERB_CONJUGATION': 'verb_conjugation',
    };

    return mapping[ruleId] || 'case_agreement';
  }

  /**
   * LanguageTool 심각도를 내부 형식으로 매핑
   */
  private mapLanguageToolSeverity(issueType: string): 'high' | 'medium' | 'low' {
    const mapping: Record<string, 'high' | 'medium' | 'low'> = {
      'misspelling': 'high',
      'grammar': 'high',
      'style': 'medium',
      'other': 'low',
    };

    return mapping[issueType] || 'medium';
  }

  /**
   * LanguageTool 메시지를 한국어로 번역
   */
  private translateLanguageToolMessage(message: string): string {
    const translations: Record<string, string> = {
      'Use "az" instead of "a" before words starting with a vowel': '모음으로 시작하는 단어 앞에는 "az"를 사용해야 합니다',
      'Use "a" instead of "az" before words starting with a consonant': '자음으로 시작하는 단어 앞에는 "a"를 사용해야 합니다',
      'This word is misspelled': '철자가 틀렸습니다',
      'Possible spelling mistake found': '철자 오류가 있을 수 있습니다',
      'Consider using more formal language': '더 격식 있는 표현을 사용하세요',
      'Repetitive sentence structure detected': '반복적인 문장 구조가 감지되었습니다',
      'Use respectful language when referring to God': '하나님을 언급할 때는 경어를 사용하세요',
      'Consider proper word order for emphasis': '강조를 위한 올바른 어순을 고려하세요'
    };

    // 정확한 매치 먼저 시도
    if (translations[message]) {
      return translations[message];
    }

    // 부분 매치 시도
    for (const [english, korean] of Object.entries(translations)) {
      if (message.includes(english) || english.includes(message.substring(0, 20))) {
        return korean;
      }
    }

    // 기본 번역
    if (message.includes('article')) return '정관사 사용법을 확인하세요';
    if (message.includes('spelling')) return '철자를 확인하세요';
    if (message.includes('grammar')) return '문법을 확인하세요';
    if (message.includes('style')) return '문체를 개선하세요';

    return `문법 검사: ${message}`;
  }

  /**
   * LanguageTool 매치에서 신뢰도 계산
   */
  private calculateConfidenceFromMatch(match: any): number {
    // LanguageTool은 신뢰도를 직접 제공하지 않으므로 추정
    let confidence = 0.8; // 기본값

    // 규칙 유형에 따른 신뢰도 조정
    if (match.rule.id.includes('ARTICLE_AGREEMENT')) confidence = 0.95;
    if (match.rule.id.includes('THEOLOGICAL')) confidence = 0.9;
    if (match.rule.issueType === 'misspelling') confidence = 0.85;
    if (match.rule.issueType === 'grammar') confidence = 0.9;
    if (match.rule.issueType === 'style') confidence = 0.7;

    // 대체 제안 개수에 따른 조정
    if (match.replacements.length === 0) confidence *= 0.8;
    if (match.replacements.length === 1) confidence *= 1.0;
    if (match.replacements.length > 3) confidence *= 0.9;

    return Math.min(0.99, Math.max(0.5, confidence));
  }

  private async checkHungarianSpecificRules(text: string): Promise<GrammarError[]> {
    const errors: GrammarError[] = [];

    // 정관사 규칙 검사
    const articleMatches = text.match(/\ba\s+[aeiouáéíóöőúüű]/gi);
    if (articleMatches) {
      articleMatches.forEach(match => {
        const position = text.indexOf(match);
        errors.push({
          type: 'article_agreement',
          position: { start: position, end: position + match.length },
          original_text: match,
          suggested_correction: match.replace(/^a\s/, 'az '),
          explanation_korean: '모음으로 시작하는 단어 앞에는 "az"를 사용해야 합니다',
          severity: 'high',
          confidence: 0.95,
          rule_id: 'HU_ARTICLE_VOWEL',
        });
      });
    }

    return errors;
  }

  private async checkStyle(text: string): Promise<StyleIssue[]> {
    const issues: StyleIssue[] = [];

    // 반복적 구조 검사
    if (this.hasRepetitiveStructure(text)) {
      issues.push({
        type: 'repetitive_structure',
        position: { start: 0, end: text.length },
        message: '반복적인 문장 구조가 발견되었습니다',
        suggestions: ['연결사를 사용하여 문장을 연결해보세요'],
        severity: 'medium',
      });
    }

    return issues;
  }

  private applyCorrections(text: string, errors: GrammarError[]): string {
    let corrected = text;

    // 오류를 역순으로 정렬하여 위치가 변경되지 않도록 처리
    const sortedErrors = errors.sort((a, b) => b.position.start - a.position.start);

    for (const error of sortedErrors) {
      corrected = corrected.substring(0, error.position.start) +
                  error.suggested_correction +
                  corrected.substring(error.position.end);
    }

    return corrected;
  }

  private calculateOverallScore(text: string, errors: GrammarError[], styleIssues: StyleIssue[]): number {
    const errorPenalty = errors.length * 10;
    const stylePenalty = styleIssues.length * 5;
    return Math.max(0, 100 - errorPenalty - stylePenalty);
  }

  private calculateConfidence(errors: GrammarError[]): number {
    if (errors.length === 0) return 1.0;
    const avgConfidence = errors.reduce((sum, error) => sum + error.confidence, 0) / errors.length;
    return avgConfidence;
  }

  private calculateFormality(text: string): number {
    const informalMarkers = ['hé', 'szevasz', 'gondolsz'];
    const formalMarkers = ['kedves', 'tisztelt', 'gondolnak'];

    let score = 5; // 중간값
    informalMarkers.forEach(marker => {
      if (text.toLowerCase().includes(marker)) score -= 1;
    });
    formalMarkers.forEach(marker => {
      if (text.toLowerCase().includes(marker)) score += 1;
    });

    return Math.max(1, Math.min(10, score));
  }

  private suggestFormalRewrite(text: string): string {
    return text
      .replace(/Hé,?\s*/gi, 'Kedves testvérek! ')
      .replace(/mit gondoltok/gi, 'mit gondolnak')
      .replace(/Jézus miatt/gi, 'Jézus Krisztus üzenetéről');
  }

  private calculateTermComplexity(terms: TheologicalTermInfo[]): number {
    if (terms.length === 0) return 0;

    const difficultyScores: Record<string, number> = {
      'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6
    };

    const avgDifficulty = terms.reduce((sum, term) => {
      return sum + (difficultyScores[term.difficulty_level] || 3);
    }, 0) / terms.length;

    return Math.round(avgDifficulty * 10) / 10;
  }

  private findMissingExplanations(terms: TheologicalTermInfo[]): string[] {
    return terms
      .filter(term => !term.definition_korean || term.definition_korean.length < 10)
      .map(term => term.term);
  }

  private findSimplifiedTerm(complex: string): string {
    const simplifications: Record<string, string> = {
      'megszentelődés': 'Istenhez hasonlóvá válás',
      'megigazulás': 'Isten által történő elfogadás',
      'predesztináció': 'Isten előre tudása',
    };
    return simplifications[complex] || complex;
  }

  private determineReferenceType(text: string, reference: string): 'direct_quote' | 'indirect_reference' | 'paraphrase' {
    const beforeRef = text.substring(0, text.indexOf(reference)).toLowerCase();
    if (beforeRef.includes('így ír') || beforeRef.includes('így szól')) {
      return 'direct_quote';
    }
    return 'indirect_reference';
  }

  private verifyQuoteAccuracy(text: string, reference: string): number {
    // Mock implementation - 실제로는 성경 데이터베이스와 비교
    return 0.95;
  }

  private findMissingCitations(text: string): string[] {
    // Mock implementation
    return [];
  }

  private findUnnaturalExpressions(text: string): Array<{ original: string; improved: string; confidence: number }> {
    return [
      {
        original: 'Ma én szeretném mondani nektek valamit',
        improved: 'Ma szeretném megosztani veletek egy fontos gondolatot',
        confidence: 0.89,
      },
    ];
  }

  private improveElegance(text: string): ExpressionEnhancement[] {
    return [
      {
        original: 'Az Isten nagyon jó és ő szeret minket',
        improved: 'Isten jóságos és végtelen szeretettel fordul felénk',
        improvement_type: 'elegance',
        explanation: '신학적으로 더 적절한 표현',
        confidence: 0.92,
      },
    ];
  }

  private calculateImprovementScore(enhancements: ExpressionEnhancement[]): number {
    if (enhancements.length === 0) return 0;
    const avgConfidence = enhancements.reduce((sum, enh) => sum + enh.confidence, 0) / enhancements.length;
    return avgConfidence * 10;
  }

  private determineReadingLevel(text: string): string {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;

    if (avgWordsPerSentence < 10) return 'A1-A2';
    if (avgWordsPerSentence < 15) return 'B1';
    return 'B2-C1';
  }

  private hasRepetitiveStructure(text: string): boolean {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const patterns = sentences.map(s => s.trim().split(/\s+/).slice(0, 3).join(' '));
    const uniquePatterns = new Set(patterns);
    return patterns.length > uniquePatterns.size;
  }

  private suggestStructureImprovement(text: string): string {
    return text.replace(/\.\s+/g, ', és ').replace(/, és ([^,]+)$/, ', valamint $1.');
  }

  private calculateReadability(text: string): number {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const avgWordsPerSentence = words / sentences || 0;

    // 간단한 가독성 점수 (낮을수록 읽기 쉬움)
    return Math.max(1, Math.min(10, avgWordsPerSentence / 2));
  }

  private applyStructuralImprovements(text: string, improvements: StructuralImprovement[]): string {
    let improved = text;
    for (const improvement of improvements) {
      if (improvement.issue === 'repetitive_structure') {
        improved = this.suggestStructureImprovement(improved);
      }
    }
    return improved;
  }

  private analyzeTextFlow(text: string) {
    return {
      introduction_strength: 8.0,
      main_body_coherence: 7.5,
      conclusion_effectiveness: 8.5,
    };
  }
}

export const hungarianNLPService = HungarianNLPService.getInstance();