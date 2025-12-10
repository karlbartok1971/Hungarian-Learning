import { PrismaClient } from '@prisma/client';
import {
  Curriculum,
  CurriculumLevel,
  CurriculumUnit,
  CurriculumModel,
  CurriculumConfig,
  PersonalizedCurriculumSequence,
  ContentSearchCriteria,
  CurriculumSearchResult,
  LearnerProfile
} from '../models/Curriculum';
import { AssessmentResults } from '../models/Assessment';
import { CEFRLevel, LearningGoal } from '../../../shared/types';

/**
 * Curriculum Service
 *
 * A1-B2 헝가리어 커리큘럼 관리 및 개인화 서비스
 * 한국인 목회자를 위한 체계적이고 적응형인 학습 커리큘럼 제공
 */

export class CurriculumService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * 개인화된 커리큘럼 생성
   */
  async generatePersonalizedCurriculum(
    userId: string,
    assessmentResults: AssessmentResults,
    userPreferences: UserPreferences,
    constraints: LearningConstraints
  ): Promise<PersonalizedCurriculum> {
    try {
      console.log(`🎯 개인화 커리큘럼 생성 시작: 사용자 ${userId}, 시작 수준 ${assessmentResults.finalLevel}`);

      // 기본 커리큘럼 템플릿 선택
      const baseTemplate = await this.selectOptimalTemplate(
        assessmentResults,
        userPreferences,
        constraints
      );

      // 개인화 요소 분석
      const personalizationFactors = this.analyzePersonalizationNeeds(
        assessmentResults,
        userPreferences,
        constraints
      );

      // 커리큘럼 적응
      const adaptedCurriculum = await this.adaptCurriculumToLearner(
        baseTemplate,
        personalizationFactors,
        assessmentResults.finalLevel as any
      );

      // 한국인 특화 요소 강화
      const koreanOptimizedCurriculum = await this.applyKoreanOptimizations(
        adaptedCurriculum,
        assessmentResults.koreanLearnerAnalysis
      );

      // 목회자 특화 요소 통합
      const pastoralCurriculum = await this.integratePastoralElements(
        koreanOptimizedCurriculum,
        userPreferences.pastoralContext as any,
        assessmentResults.finalLevel as any
      );

      // 학습 경로 최적화
      const optimizedSequence = await this.optimizeLearningSequence(
        pastoralCurriculum,
        constraints
      );

      console.log(`✅ 개인화 커리큘럼 생성 완료: ${optimizedSequence.totalPhases}개 단계, ${optimizedSequence.estimatedWeeks}주`);

      return optimizedSequence;
    } catch (error) {
      console.error('개인화 커리큘럼 생성 오류:', error);
      throw new Error(`커리큘럼 생성에 실패했습니다: ${error}`);
    }
  }

  /**
   * 커리큘럼 적응형 조정
   */
  async adaptCurriculum(
    curriculumId: string,
    learningAnalytics: LearningAnalytics,
    performanceData: PerformanceData,
    learnerFeedback?: LearnerFeedback
  ): Promise<CurriculumAdaptation> {
    try {
      console.log(`🔧 커리큘럼 적응 시작: ${curriculumId}`);

      const currentCurriculum = await this.getCurriculumById(curriculumId);
      if (!currentCurriculum) {
        throw new Error('커리큘럼을 찾을 수 없습니다.');
      }

      // 적응 필요성 분석
      const adaptationNeeds = await this.analyzeAdaptationNeeds(
        learningAnalytics,
        performanceData,
        learnerFeedback
      );

      if (adaptationNeeds.length === 0) {
        return {
          adaptationId: `no_change_${Date.now()}`,
          changes: [],
          reason: '현재 커리큘럼이 학습자에게 적합하여 변경이 필요하지 않습니다.',
          estimatedImprovement: 0
        };
      }

      // 적응 전략 생성
      const adaptationStrategies = await this.generateAdaptationStrategies(adaptationNeeds);

      // 적응 실행
      const adaptedCurriculum = await this.executeAdaptations(
        currentCurriculum,
        adaptationStrategies
      );

      // 적응 효과 예측
      const expectedImprovement = this.predictAdaptationEffectiveness(adaptationStrategies);

      const adaptation: CurriculumAdaptation = {
        adaptationId: `adapt_${Date.now()}`,
        changes: adaptationStrategies,
        reason: this.generateAdaptationExplanation(adaptationNeeds),
        estimatedImprovement: expectedImprovement,
        implementedAt: new Date()
      };

      console.log(`🎉 커리큘럼 적응 완료: ${adaptation.changes.length}개 변경사항 적용`);

      return adaptation;
    } catch (error) {
      console.error('커리큘럼 적응 오류:', error);
      throw new Error(`커리큘럼 적응에 실패했습니다: ${error}`);
    }
  }

  /**
   * 사용 가능한 커리큘럼 템플릿 조회
   */
  async getAvailableTemplates(
    targetLevel: CEFRLevel,
    goal: LearningGoal,
    timeframe: 'fast' | 'standard' | 'relaxed' = 'standard'
  ): Promise<CurriculumTemplate[]> {
    try {
      console.log(`📚 커리큘럼 템플릿 조회: ${targetLevel}, ${goal}, ${timeframe}`);

      // 사용 가능한 템플릿 목록 (실제로는 데이터베이스에서 조회)
      const templates: CurriculumTemplate[] = [
        {
          templateId: 'korean_pastor_standard',
          name: '한국인 목회자 표준 과정',
          description: '설교문 작성을 목표로 하는 체계적인 52주 커리큘럼',
          targetAudience: '한국인 목회자',
          duration: {
            total: 52,
            breakdown: {
              A1: 13,
              A2: 13,
              B1: 13,
              B2: 13
            }
          },
          features: [
            '종교 어휘 집중 학습',
            '설교문 작성 단계별 훈련',
            '헝가리 교회 문화 이해',
            '발음 교정 특화 프로그램'
          ],
          successRate: 87,
          difficulty: 'intermediate',
          specializations: ['theological_vocabulary', 'sermon_writing', 'cultural_adaptation']
        },
        {
          templateId: 'accelerated_pastor',
          name: '집중 목회자 과정',
          description: '빠른 기간 내 실용적 소통 능력 달성을 위한 26주 과정',
          targetAudience: '경험 있는 목회자',
          duration: {
            total: 26,
            breakdown: {
              A1: 6,
              A2: 6,
              B1: 7,
              B2: 7
            }
          },
          features: [
            '실용적 의사소통 집중',
            '목회 상황별 시나리오 학습',
            '강화된 말하기 훈련'
          ],
          successRate: 73,
          difficulty: 'advanced',
          specializations: ['practical_communication', 'pastoral_scenarios']
        },
        {
          templateId: 'comprehensive_beginner',
          name: '기초 탄탄 과정',
          description: '완전 초보자를 위한 체계적이고 상세한 65주 커리큘럼',
          targetAudience: '헝가리어 완전 초보자',
          duration: {
            total: 65,
            breakdown: {
              A1: 20,
              A2: 16,
              B1: 15,
              B2: 14
            }
          },
          features: [
            '기초 문법 완전 정복',
            '발음 집중 훈련',
            '충분한 연습 시간',
            '단계별 세밀한 진도 관리'
          ],
          successRate: 94,
          difficulty: 'beginner',
          specializations: ['foundation_building', 'pronunciation_mastery']
        }
      ];

      // 조건에 맞는 템플릿 필터링
      const filteredTemplates = templates.filter(template => {
        if (goal === 'sermon_writing' && !template.features.some(f => f.includes('설교'))) {
          return false;
        }

        if (timeframe === 'fast' && template.duration.total > 30) {
          return false;
        }

        if (timeframe === 'relaxed' && template.duration.total < 50) {
          return false;
        }

        return true;
      });

      // 성공률 순으로 정렬
      filteredTemplates.sort((a, b) => b.successRate - a.successRate);

      console.log(`📋 ${filteredTemplates.length}개 템플릿 발견`);

      return filteredTemplates;
    } catch (error) {
      console.error('템플릿 조회 오류:', error);
      throw new Error(`템플릿을 불러올 수 없습니다: ${error}`);
    }
  }

  /**
   * 커리큘럼 콘텐츠 검색
   */
  async searchContent(
    curriculumId: string,
    searchCriteria: ContentSearchCriteria
  ): Promise<SearchResults> {
    try {
      console.log(`🔍 콘텐츠 검색: ${curriculumId}`);

      const curriculum = await this.getCurriculumById(curriculumId);
      if (!curriculum) {
        throw new Error('커리큘럼을 찾을 수 없습니다.');
      }

      const results = await CurriculumModel.searchContent(curriculumId, searchCriteria);

      // 검색 결과 분류 및 우선순위 지정
      const categorizedResults = this.categorizeSearchResults(results);

      // 목회자 특화 결과 우선 표시
      const prioritizedResults = this.prioritizePastoralContent(categorizedResults);

      return {
        query: searchCriteria,
        totalResults: results.length,
        categories: categorizedResults,
        recommendations: prioritizedResults.slice(0, 10),
        relatedTopics: await this.findRelatedTopics(searchCriteria, curriculum)
      };
    } catch (error) {
      console.error('콘텐츠 검색 오류:', error);
      throw new Error(`검색에 실패했습니다: ${error}`);
    }
  }

  /**
   * 학습 진도 기반 다음 추천 콘텐츠
   */
  async getNextRecommendations(
    curriculumId: string,
    currentProgress: LearningProgress,
    learnerProfile: LearnerProfile
  ): Promise<ContentRecommendations> {
    try {
      console.log(`💡 다음 추천 콘텐츠 생성: ${curriculumId}`);

      const curriculum = await this.getCurriculumById(curriculumId);
      if (!curriculum) {
        throw new Error('커리큘럼을 찾을 수 없습니다.');
      }

      // 현재 위치 분석
      const currentPosition = await this.analyzeCurrentPosition(currentProgress, curriculum);

      // 학습자 성향 분석
      const learnerAnalysis = this.analyzeLearnerPreferences(learnerProfile, currentProgress);

      // 추천 콘텐츠 생성
      const recommendations: ContentRecommendations = {
        immediate: await this.generateImmediateRecommendations(currentPosition, learnerAnalysis),
        upcoming: await this.generateUpcomingRecommendations(currentPosition, curriculum),
        review: await this.generateReviewRecommendations(currentProgress, learnerAnalysis),
        enrichment: await this.generateEnrichmentRecommendations(learnerProfile, curriculum),
        pastoral: await this.generatePastoralRecommendations(currentPosition, learnerProfile)
      };

      console.log(`📝 추천 완료: 즉시 ${recommendations.immediate.length}개, 예정 ${recommendations.upcoming.length}개`);

      return recommendations;
    } catch (error) {
      console.error('추천 콘텐츠 생성 오류:', error);
      throw new Error(`추천을 생성할 수 없습니다: ${error}`);
    }
  }

  /**
   * 커리큘럼 피드백 처리
   */
  async processCurriculumFeedback(
    curriculumId: string,
    moduleId: string,
    feedback: LearnerFeedback
  ): Promise<FeedbackResponse> {
    try {
      console.log(`💬 피드백 처리: 모듈 ${moduleId}`);

      // 피드백 분석
      const analysis = await this.analyzeFeedback(feedback);

      // 즉각적인 개선사항 식별
      const immediateActions = await this.identifyImmediateActions(analysis, moduleId);

      // 장기적 개선사항 기록
      await this.recordLongTermImprovements(curriculumId, analysis);

      // 적응 제안 생성
      const adaptationSuggestions = await this.generateAdaptationSuggestions(analysis);

      // 다음 모듈 추천 조정
      const nextModuleAdjustments = await this.adjustNextModuleRecommendation(
        moduleId,
        feedback,
        curriculumId
      );

      const response: FeedbackResponse = {
        feedbackId: `feedback_${Date.now()}`,
        acknowledgment: this.generateFeedbackAcknowledgment(feedback),
        adaptationSuggestions,
        nextModuleRecommendation: nextModuleAdjustments,
        estimatedImprovement: this.calculateFeedbackImpact(analysis),
        implementationTimeline: this.createImplementationTimeline(immediateActions)
      };

      console.log(`✅ 피드백 처리 완료: ${adaptationSuggestions.length}개 개선 제안`);

      return response;
    } catch (error) {
      console.error('피드백 처리 오류:', error);
      throw new Error(`피드백 처리에 실패했습니다: ${error}`);
    }
  }

  // Private helper methods

  private async selectOptimalTemplate(
    assessmentResults: AssessmentResults,
    preferences: UserPreferences,
    constraints: LearningConstraints
  ): Promise<Curriculum> {
    const templates = await this.getAvailableTemplates(
      (preferences.targetLevel || CEFRLevel.B2) as any,
      (preferences.primaryGoal || LearningGoal.SERMON_WRITING) as any,
      constraints.timeframe || 'standard'
    );

    // 최적 템플릿 선택 로직
    const bestTemplate = templates.reduce((best, current) => {
      const currentScore = this.calculateTemplateScore(current, assessmentResults, preferences);
      const bestScore = this.calculateTemplateScore(best, assessmentResults, preferences);
      return currentScore > bestScore ? current : best;
    });

    // 템플릿을 기반으로 커리큘럼 생성
    return await this.createCurriculumFromTemplate(bestTemplate);
  }

  private analyzePersonalizationNeeds(
    assessmentResults: AssessmentResults,
    preferences: UserPreferences,
    constraints: LearningConstraints
  ): PersonalizationFactors {
    return {
      strengthAreas: assessmentResults.statistics.strongestAreas,
      weaknessAreas: assessmentResults.statistics.weakestAreas,
      learningStyle: preferences.learningStyle || 'visual_auditory',
      timeConstraints: constraints,
      koreanInterference: assessmentResults.koreanLearnerAnalysis.grammarInterferenceIssues,
      pastoralPriorities: preferences.pastoralContext?.priorities || [],
      motivationalFactors: this.identifyMotivationalFactors(preferences),
      culturalBackground: preferences.culturalBackground || 'korean_christian'
    };
  }

  private async adaptCurriculumToLearner(
    baseCurriculum: Curriculum,
    factors: PersonalizationFactors,
    startLevel: CEFRLevel
  ): Promise<Curriculum> {
    // 약점 영역 강화
    const reinforcedCurriculum = await this.reinforceWeakAreas(baseCurriculum, factors.weaknessAreas);

    // 강점 영역 활용
    const leveragedCurriculum = await this.leverageStrongAreas(reinforcedCurriculum, factors.strengthAreas);

    // 시간 제약 반영
    const timeAdjustedCurriculum = await this.adjustForTimeConstraints(leveragedCurriculum, factors.timeConstraints);

    // 시작 수준 조정
    const levelAdjustedCurriculum = await this.adjustForStartLevel(timeAdjustedCurriculum, startLevel);

    return levelAdjustedCurriculum;
  }

  private async applyKoreanOptimizations(
    curriculum: Curriculum,
    koreanAnalysis: any
  ): Promise<Curriculum> {
    // 한국어 간섭 현상 대응
    const interferenceOptimized = await this.addressLanguageInterference(
      curriculum,
      koreanAnalysis.grammarInterferenceIssues
    );

    // 발음 도전사항 강화
    const pronunciationOptimized = await this.enhancePronunciationSupport(
      interferenceOptimized,
      koreanAnalysis.pronunciationChallenges
    );

    // 문화적 격차 해소
    const culturallyOptimized = await this.bridgeCulturalGaps(
      pronunciationOptimized,
      koreanAnalysis.culturalKnowledgeGaps
    );

    return culturallyOptimized;
  }

  private async integratePastoralElements(
    curriculum: Curriculum,
    pastoralContext: PastoralContext,
    currentLevel: CEFRLevel
  ): Promise<Curriculum> {
    // 목회적 어휘 통합
    const vocabIntegrated = await this.integratePastoralVocabulary(curriculum, currentLevel);

    // 설교 기술 단계별 통합
    const sermonSkillsIntegrated = await this.integrateSermonSkills(vocabIntegrated, currentLevel);

    // 목회적 시나리오 추가
    const scenariosIntegrated = await this.addPastoralScenarios(sermonSkillsIntegrated, pastoralContext);

    return scenariosIntegrated;
  }

  private async optimizeLearningSequence(
    curriculum: Curriculum,
    constraints: LearningConstraints
  ): Promise<PersonalizedCurriculum> {
    // 학습 순서 최적화
    const optimizedSequence = await this.reorderLearningUnits(curriculum, constraints);

    // 마일스톤 설정
    const milestonesAdded = await this.addPersonalizedMilestones(optimizedSequence);

    // 평가 체계 조정
    const assessmentAdjusted = await this.adjustAssessmentFrequency(milestonesAdded, constraints);

    return {
      curriculumId: `personal_${Date.now()}`,
      basedOnTemplate: curriculum.id,
      personalizedFor: 'user_id', // 실제 사용자 ID로 대체
      totalPhases: assessmentAdjusted.levels.length,
      estimatedWeeks: assessmentAdjusted.totalDurationWeeks,
      adaptedContent: assessmentAdjusted,
      personalizationSummary: this.generatePersonalizationSummary(curriculum, assessmentAdjusted),
      createdAt: new Date()
    };
  }

  private calculateTemplateScore(
    template: CurriculumTemplate,
    assessment: AssessmentResults,
    preferences: UserPreferences
  ): number {
    let score = template.successRate; // 기본 점수는 성공률

    // 목표 일치도
    if (preferences.primaryGoal === 'sermon_writing' && template.features.some(f => f.includes('설교'))) {
      score += 15;
    }

    // 시작 수준 적합성
    const levelMatch = this.assessLevelCompatibility(template, assessment.finalLevel as any);
    score += levelMatch * 10;

    // 시간 제약 고려
    const timePreference = preferences.timeConstraints?.weeklyHours || 10;
    if (timePreference >= 15 && template.name.includes('집중')) {
      score += 10;
    } else if (timePreference <= 7 && template.name.includes('기초')) {
      score += 10;
    }

    return score;
  }

  private assessLevelCompatibility(template: CurriculumTemplate, currentLevel: CEFRLevel): number {
    // 현재 수준과 템플릿의 적합성 평가 (0-1 스케일)
    const levelIndex = ['A1', 'A2', 'B1', 'B2'].indexOf(currentLevel);

    if (template.difficulty === 'beginner' && levelIndex <= 1) return 1;
    if (template.difficulty === 'intermediate' && levelIndex >= 1 && levelIndex <= 2) return 1;
    if (template.difficulty === 'advanced' && levelIndex >= 2) return 1;

    return 0.5; // 부분 적합
  }

  // Placeholder methods for detailed implementations
  private async getCurriculumById(curriculumId: string): Promise<Curriculum | null> { return null; }
  private async analyzeAdaptationNeeds(analytics: LearningAnalytics, performance: PerformanceData, feedback?: LearnerFeedback): Promise<AdaptationNeed[]> { return []; }
  private async generateAdaptationStrategies(needs: AdaptationNeed[]): Promise<AdaptationStrategy[]> { return []; }
  private async executeAdaptations(curriculum: Curriculum, strategies: AdaptationStrategy[]): Promise<Curriculum> { return curriculum; }
  private predictAdaptationEffectiveness(strategies: AdaptationStrategy[]): number { return 0.1; }
  private generateAdaptationExplanation(needs: AdaptationNeed[]): string { return '성능 개선을 위한 조정'; }
  private categorizeSearchResults(results: CurriculumSearchResult[]): CategoryResult[] { return []; }
  private prioritizePastoralContent(results: CategoryResult[]): CurriculumSearchResult[] { return []; }
  private async findRelatedTopics(criteria: ContentSearchCriteria, curriculum: Curriculum): Promise<string[]> { return []; }
  private async analyzeCurrentPosition(progress: LearningProgress, curriculum: Curriculum): Promise<CurrentPosition> { return {} as CurrentPosition; }
  private analyzeLearnerPreferences(profile: LearnerProfile, progress: LearningProgress): LearnerAnalysis { return {} as LearnerAnalysis; }
  private async generateImmediateRecommendations(position: CurrentPosition, analysis: LearnerAnalysis): Promise<ContentItem[]> { return []; }
  private async generateUpcomingRecommendations(position: CurrentPosition, curriculum: Curriculum): Promise<ContentItem[]> { return []; }
  private async generateReviewRecommendations(progress: LearningProgress, analysis: LearnerAnalysis): Promise<ContentItem[]> { return []; }
  private async generateEnrichmentRecommendations(profile: LearnerProfile, curriculum: Curriculum): Promise<ContentItem[]> { return []; }
  private async generatePastoralRecommendations(position: CurrentPosition, profile: LearnerProfile): Promise<ContentItem[]> { return []; }
  private async analyzeFeedback(feedback: LearnerFeedback): Promise<FeedbackAnalysis> { return {} as FeedbackAnalysis; }
  private async identifyImmediateActions(analysis: FeedbackAnalysis, moduleId: string): Promise<ImmediateAction[]> { return []; }
  private async recordLongTermImprovements(curriculumId: string, analysis: FeedbackAnalysis): Promise<void> { }
  private async generateAdaptationSuggestions(analysis: FeedbackAnalysis): Promise<AdaptationSuggestion[]> { return []; }
  private async adjustNextModuleRecommendation(moduleId: string, feedback: LearnerFeedback, curriculumId: string): Promise<ModuleRecommendation> { return {} as ModuleRecommendation; }
  private generateFeedbackAcknowledgment(feedback: LearnerFeedback): string { return '소중한 피드백 감사합니다.'; }
  private calculateFeedbackImpact(analysis: FeedbackAnalysis): number { return 0.1; }
  private createImplementationTimeline(actions: ImmediateAction[]): string { return '즉시 적용'; }
  private async createCurriculumFromTemplate(template: CurriculumTemplate): Promise<Curriculum> { return {} as Curriculum; }
  private identifyMotivationalFactors(preferences: UserPreferences): string[] { return ['achievement', 'progress']; }
  private async reinforceWeakAreas(curriculum: Curriculum, areas: string[]): Promise<Curriculum> { return curriculum; }
  private async leverageStrongAreas(curriculum: Curriculum, areas: string[]): Promise<Curriculum> { return curriculum; }
  private async adjustForTimeConstraints(curriculum: Curriculum, constraints: LearningConstraints): Promise<Curriculum> { return curriculum; }
  private async adjustForStartLevel(curriculum: Curriculum, level: CEFRLevel): Promise<Curriculum> { return curriculum; }
  private async addressLanguageInterference(curriculum: Curriculum, issues: string[]): Promise<Curriculum> { return curriculum; }
  private async enhancePronunciationSupport(curriculum: Curriculum, challenges: string[]): Promise<Curriculum> { return curriculum; }
  private async bridgeCulturalGaps(curriculum: Curriculum, gaps: string[]): Promise<Curriculum> { return curriculum; }
  private async integratePastoralVocabulary(curriculum: Curriculum, level: CEFRLevel): Promise<Curriculum> { return curriculum; }
  private async integrateSermonSkills(curriculum: Curriculum, level: CEFRLevel): Promise<Curriculum> { return curriculum; }
  private async addPastoralScenarios(curriculum: Curriculum, context: PastoralContext): Promise<Curriculum> { return curriculum; }
  private async reorderLearningUnits(curriculum: Curriculum, constraints: LearningConstraints): Promise<Curriculum> { return curriculum; }
  private async addPersonalizedMilestones(curriculum: Curriculum): Promise<Curriculum> { return curriculum; }
  private async adjustAssessmentFrequency(curriculum: Curriculum, constraints: LearningConstraints): Promise<Curriculum> { return curriculum; }
  private generatePersonalizationSummary(original: Curriculum, adapted: Curriculum): PersonalizationSummary { return {} as PersonalizationSummary; }
}

// Supporting interfaces
export interface UserPreferences {
  primaryGoal?: LearningGoal;
  targetLevel?: CEFRLevel;
  learningStyle?: string;
  timeConstraints?: {
    weeklyHours: number;
    sessionsPerWeek: number;
  };
  pastoralContext?: PastoralContext;
  culturalBackground?: string;
}

export interface LearningConstraints {
  weeklyHours: number;
  maxSessionLength: number;
  timeframe: 'fast' | 'standard' | 'relaxed';
  priorityAreas?: string[];
}

export interface PersonalizedCurriculum {
  curriculumId: string;
  basedOnTemplate: string;
  personalizedFor: string;
  totalPhases: number;
  estimatedWeeks: number;
  adaptedContent: Curriculum;
  personalizationSummary: PersonalizationSummary;
  createdAt: Date;
}

export interface CurriculumTemplate {
  templateId: string;
  name: string;
  description: string;
  targetAudience: string;
  duration: {
    total: number;
    breakdown: {
      A1: number;
      A2: number;
      B1: number;
      B2: number;
    };
  };
  features: string[];
  successRate: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  specializations: string[];
}

export interface CurriculumAdaptation {
  adaptationId: string;
  changes: AdaptationStrategy[];
  reason: string;
  estimatedImprovement: number;
  implementedAt?: Date;
}

export interface SearchResults {
  query: ContentSearchCriteria;
  totalResults: number;
  categories: CategoryResult[];
  recommendations: CurriculumSearchResult[];
  relatedTopics: string[];
}

export interface ContentRecommendations {
  immediate: ContentItem[];
  upcoming: ContentItem[];
  review: ContentItem[];
  enrichment: ContentItem[];
  pastoral: ContentItem[];
}

export interface FeedbackResponse {
  feedbackId: string;
  acknowledgment: string;
  adaptationSuggestions: AdaptationSuggestion[];
  nextModuleRecommendation: ModuleRecommendation;
  estimatedImprovement: number;
  implementationTimeline: string;
}

// Additional supporting types (simplified)
export interface LearningAnalytics { metrics: any[]; }
export interface PerformanceData { scores: any[]; }
export interface LearnerFeedback { rating: number; comments: string; }
export interface PersonalizationFactors { strengthAreas: string[]; weaknessAreas: string[]; learningStyle: string; timeConstraints: LearningConstraints; koreanInterference: string[]; pastoralPriorities: string[]; motivationalFactors: string[]; culturalBackground: string; }
export interface AdaptationNeed { type: string; priority: number; }
export interface AdaptationStrategy { action: string; target: string; }
export interface CategoryResult { category: string; items: CurriculumSearchResult[]; }
export interface CurrentPosition { level: CEFRLevel; unit: string; completion: number; }
export interface LearnerAnalysis { preferences: any; patterns: any; }
export interface ContentItem { id: string; title: string; type: string; }
export interface FeedbackAnalysis { satisfaction: number; issues: string[]; }
export interface ImmediateAction { action: string; priority: number; }
export interface AdaptationSuggestion { suggestion: string; impact: number; }
export interface ModuleRecommendation { moduleId: string; adjustments: string[]; }
export interface PersonalizationSummary { changes: string[]; rationale: string; }
export interface LearningProgress { currentLevel: CEFRLevel; completion: number; timeSpent: number; }
export interface PastoralContext { priorities: string[]; experience: string; }