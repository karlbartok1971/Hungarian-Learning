import { ObjectId } from 'mongodb';
import { UserProfile, LearningGoal, LearningStyle, CEFRLevel, SkillArea } from '../models/UserProfile';
import { ComprehensiveAssessmentResult, AssessmentQuestion } from '../models/LevelAssessment';

/**
 * 적응형 콘텐츠 추천 엔진
 * 사용자의 학습 프로필과 평가 결과를 기반으로 최적화된 학습 콘텐츠 추천
 */

export enum ContentType {
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  LISTENING = 'listening',
  READING = 'reading',
  SPEAKING = 'speaking',
  WRITING = 'writing',
  PRONUNCIATION = 'pronunciation',
  THEOLOGICAL_TERMS = 'theological_terms',
  SERMON_PRACTICE = 'sermon_practice',
  CULTURAL_CONTEXT = 'cultural_context'
}

export enum DifficultyLevel {
  VERY_EASY = 'very_easy',     // 현재 레벨보다 1단계 아래
  EASY = 'easy',               // 현재 레벨보다 약간 쉬움
  APPROPRIATE = 'appropriate',  // 현재 레벨에 적합
  CHALLENGING = 'challenging',  // 현재 레벨보다 약간 어려움
  VERY_HARD = 'very_hard'      // 현재 레벨보다 1단계 위
}

export interface ContentItem {
  id: string;
  title: string;
  content_type: ContentType;
  difficulty_level: CEFRLevel;
  skill_areas: SkillArea[];
  estimated_duration_minutes: number;
  prerequisite_concepts?: string[];
  learning_objectives: string[];
  tags: string[];
  quality_score: number;        // 콘텐츠 품질 점수 (0-100)
  engagement_score: number;     // 참여도 점수 (0-100)
  effectiveness_score: number;  // 학습 효과 점수 (0-100)
  korean_interference_level: 'low' | 'medium' | 'high';
  theological_relevance?: number; // 신학 관련성 (0-100)
}

export interface RecommendationContext {
  user_profile: UserProfile;
  recent_assessment?: ComprehensiveAssessmentResult;
  current_session_goals?: LearningGoal[];
  time_available_minutes?: number;
  preferred_content_types?: ContentType[];
  focus_skill_areas?: SkillArea[];
  session_type: 'quick_review' | 'intensive_study' | 'assessment_prep' | 'free_study';
}

export interface RecommendationScore {
  total_score: number;         // 총 추천 점수 (0-100)
  relevance_score: number;     // 관련성 점수
  difficulty_match_score: number; // 난이도 적합성
  learning_style_match: number;   // 학습 스타일 매칭
  goal_alignment: number;         // 목표 정렬도
  korean_adaptation: number;      // 한국인 맞춤도
  theological_focus: number;      // 신학 중심도
  predicted_engagement: number;   // 예측 참여도
  reasoning: string[];            // 추천 이유
}

export interface ContentRecommendation {
  content_item: ContentItem;
  recommendation_score: RecommendationScore;
  personalization_factors: {
    adjusted_difficulty: DifficultyLevel;
    estimated_completion_time: number;
    suggested_approach: string;
    prerequisite_check: boolean;
    follow_up_suggestions: string[];
  };
}

export interface RecommendationResult {
  primary_recommendations: ContentRecommendation[];
  alternative_options: ContentRecommendation[];
  skill_gap_analysis: {
    identified_gaps: SkillArea[];
    priority_order: SkillArea[];
    gap_closing_content: ContentRecommendation[];
  };
  learning_path_integration: {
    current_milestone: string;
    progress_towards_goal: number;
    next_milestone_content: ContentRecommendation[];
  };
  session_plan: {
    warm_up_content: ContentRecommendation[];
    main_content: ContentRecommendation[];
    review_content: ContentRecommendation[];
    total_estimated_time: number;
  };
}

export class ContentRecommendationEngine {
  private readonly contentDatabase: ContentItem[] = [];
  private readonly userLearningHistory: Map<string, any[]> = new Map();

  constructor() {
    this.initializeSampleContent();
  }

  /**
   * 메인 추천 알고리즘
   */
  async generateRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationResult> {
    // 1. 사용자 현재 상태 분석
    const userAnalysis = this.analyzeUserCurrentState(context);

    // 2. 콘텐츠 필터링 및 스코어링
    const scoredContent = await this.scoreAllContent(context, userAnalysis);

    // 3. 추천 결과 구성
    const recommendations = this.buildRecommendationResult(scoredContent, context);

    return recommendations;
  }

  /**
   * 사용자 현재 상태 분석
   */
  private analyzeUserCurrentState(context: RecommendationContext) {
    const { user_profile, recent_assessment } = context;

    return {
      current_level: user_profile.current_level,
      learning_style_preferences: this.extractLearningStylePreferences(user_profile),
      skill_strengths: this.identifySkillStrengths(user_profile, recent_assessment),
      skill_weaknesses: this.identifySkillWeaknesses(user_profile, recent_assessment),
      korean_interference_patterns: this.analyzeKoreanInterference(recent_assessment),
      motivation_level: this.assessMotivationLevel(user_profile),
      theological_focus_level: this.assessTheologicalFocus(user_profile)
    };
  }

  /**
   * 모든 콘텐츠에 대한 점수 계산
   */
  private async scoreAllContent(
    context: RecommendationContext,
    userAnalysis: any
  ): Promise<ContentRecommendation[]> {
    const recommendations: ContentRecommendation[] = [];

    for (const content of this.contentDatabase) {
      const score = this.calculateRecommendationScore(content, context, userAnalysis);
      const personalization = this.calculatePersonalizationFactors(content, context, userAnalysis);

      recommendations.push({
        content_item: content,
        recommendation_score: score,
        personalization_factors: personalization
      });
    }

    // 점수순으로 정렬
    return recommendations.sort((a, b) =>
      b.recommendation_score.total_score - a.recommendation_score.total_score
    );
  }

  /**
   * 추천 점수 계산 (핵심 알고리즘)
   */
  private calculateRecommendationScore(
    content: ContentItem,
    context: RecommendationContext,
    userAnalysis: any
  ): RecommendationScore {
    const reasoning: string[] = [];

    // 1. 난이도 적합성 (가중치 25%)
    const difficultyMatch = this.calculateDifficultyMatch(
      content, context.user_profile.current_level
    );
    if (difficultyMatch > 0.8) reasoning.push('난이도가 현재 레벨에 매우 적합함');

    // 2. 학습 스타일 매칭 (가중치 20%)
    const styleMatch = this.calculateLearningStyleMatch(
      content, context.user_profile.learning_style
    );
    if (styleMatch > 0.7) reasoning.push('선호하는 학습 스타일과 일치함');

    // 3. 목표 정렬도 (가중치 20%)
    const goalAlignment = this.calculateGoalAlignment(
      content, context.user_profile.learning_goals
    );
    if (goalAlignment > 0.8) reasoning.push('학습 목표와 높은 일치도');

    // 4. 관련성 점수 (가중치 15%)
    const relevanceScore = this.calculateRelevance(content, context);
    if (relevanceScore > 0.8) reasoning.push('현재 학습 맥락과 매우 관련성 높음');

    // 5. 한국인 맞춤도 (가중치 10%)
    const koreanAdaptation = this.calculateKoreanAdaptation(
      content, userAnalysis.korean_interference_patterns
    );
    if (koreanAdaptation > 0.7) reasoning.push('한국인 학습자에게 특화됨');

    // 6. 신학 중심도 (가중치 10%)
    const theologicalFocus = this.calculateTheologicalFocus(
      content, userAnalysis.theological_focus_level
    );
    if (theologicalFocus > 0.8) reasoning.push('신학/설교 목적에 특화됨');

    // 가중 평균 계산
    const totalScore =
      difficultyMatch * 0.25 +
      styleMatch * 0.20 +
      goalAlignment * 0.20 +
      relevanceScore * 0.15 +
      koreanAdaptation * 0.10 +
      theologicalFocus * 0.10;

    const predictedEngagement = this.predictEngagementLevel(
      content, userAnalysis, totalScore
    );

    return {
      total_score: Math.round(totalScore * 100),
      relevance_score: Math.round(relevanceScore * 100),
      difficulty_match_score: Math.round(difficultyMatch * 100),
      learning_style_match: Math.round(styleMatch * 100),
      goal_alignment: Math.round(goalAlignment * 100),
      korean_adaptation: Math.round(koreanAdaptation * 100),
      theological_focus: Math.round(theologicalFocus * 100),
      predicted_engagement: Math.round(predictedEngagement * 100),
      reasoning
    };
  }

  /**
   * 개인화 요소 계산
   */
  private calculatePersonalizationFactors(
    content: ContentItem,
    context: RecommendationContext,
    userAnalysis: any
  ) {
    const adjustedDifficulty = this.adjustDifficultyForUser(content, context.user_profile);
    const estimatedTime = this.estimateCompletionTime(content, userAnalysis);

    return {
      adjusted_difficulty: adjustedDifficulty,
      estimated_completion_time: estimatedTime,
      suggested_approach: this.generateSuggestedApproach(content, userAnalysis),
      prerequisite_check: this.checkPrerequisites(content, context.user_profile),
      follow_up_suggestions: this.generateFollowUpSuggestions(content, userAnalysis)
    };
  }

  /**
   * 최종 추천 결과 구성
   */
  private buildRecommendationResult(
    scoredContent: ContentRecommendation[],
    context: RecommendationContext
  ): RecommendationResult {
    const primaryCount = Math.min(5, scoredContent.length);
    const alternativeCount = Math.min(3, Math.max(0, scoredContent.length - primaryCount));

    return {
      primary_recommendations: scoredContent.slice(0, primaryCount),
      alternative_options: scoredContent.slice(primaryCount, primaryCount + alternativeCount),

      skill_gap_analysis: this.analyzeSkillGaps(scoredContent, context),

      learning_path_integration: {
        current_milestone: this.identifyCurrentMilestone(context.user_profile),
        progress_towards_goal: this.calculateProgressTowardsGoal(context.user_profile),
        next_milestone_content: this.identifyMilestoneContent(scoredContent, context)
      },

      session_plan: this.createSessionPlan(scoredContent, context)
    };
  }

  // === 보조 메서드들 ===

  private extractLearningStylePreferences(profile: UserProfile) {
    const style = profile.learning_style;
    return {
      visual_preference: style.visual_learner_score,
      auditory_preference: style.auditory_learner_score,
      kinesthetic_preference: style.kinesthetic_learner_score,
      reading_preference: style.reading_writing_learner_score
    };
  }

  private identifySkillStrengths(profile: UserProfile, assessment?: ComprehensiveAssessmentResult): SkillArea[] {
    if (!assessment) return [];

    return assessment.skill_results
      .filter(skill => skill.confidence_score > 75)
      .map(skill => skill.skill_area)
      .slice(0, 3);
  }

  private identifySkillWeaknesses(profile: UserProfile, assessment?: ComprehensiveAssessmentResult): SkillArea[] {
    if (!assessment) return [];

    return assessment.skill_results
      .filter(skill => skill.confidence_score < 60)
      .map(skill => skill.skill_area)
      .slice(0, 3);
  }

  private analyzeKoreanInterference(assessment?: ComprehensiveAssessmentResult) {
    if (!assessment) return { severity: 'medium', patterns: [] };

    return {
      severity: assessment.korean_interference_analysis?.severity || 'medium',
      patterns: assessment.korean_interference_analysis?.specific_challenges || []
    };
  }

  private assessMotivationLevel(profile: UserProfile): number {
    return profile.learning_statistics?.motivation_level || 0.7;
  }

  private assessTheologicalFocus(profile: UserProfile): number {
    const hasTheologicalGoal = profile.learning_goals?.some(
      goal => goal.description.includes('설교') || goal.description.includes('신학')
    );
    return hasTheologicalGoal ? 0.9 : 0.3;
  }

  private calculateDifficultyMatch(content: ContentItem, userLevel: any): number {
    const levelMapping = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
    const contentLevelNum = levelMapping[content.difficulty_level] || 3;
    const userLevelNum = levelMapping[userLevel.overall_cefr_level] || 3;

    const difference = Math.abs(contentLevelNum - userLevelNum);
    return Math.max(0, 1 - (difference * 0.3));
  }

  private calculateLearningStyleMatch(content: ContentItem, learningStyle: LearningStyle): number {
    let score = 0;

    // 콘텐츠 타입과 학습 스타일 매칭
    if (content.content_type === ContentType.LISTENING && learningStyle.auditory_learner_score > 70) score += 0.3;
    if (content.content_type === ContentType.READING && learningStyle.reading_writing_learner_score > 70) score += 0.3;
    if (content.content_type === ContentType.VOCABULARY && learningStyle.visual_learner_score > 70) score += 0.2;
    if (content.content_type === ContentType.SPEAKING && learningStyle.kinesthetic_learner_score > 70) score += 0.2;

    return Math.min(1, score + 0.5); // 기본 점수 0.5 + 매칭 보너스
  }

  private calculateGoalAlignment(content: ContentItem, goals: LearningGoal[]): number {
    if (!goals || goals.length === 0) return 0.5;

    let alignmentScore = 0;
    const totalGoals = goals.length;

    for (const goal of goals) {
      if (goal.description.includes('설교') && content.content_type === ContentType.THEOLOGICAL_TERMS) {
        alignmentScore += 1;
      } else if (goal.description.includes('문법') && content.content_type === ContentType.GRAMMAR) {
        alignmentScore += 1;
      } else if (goal.description.includes('어휘') && content.content_type === ContentType.VOCABULARY) {
        alignmentScore += 1;
      }
      // 기타 매칭 로직...
    }

    return Math.min(1, alignmentScore / totalGoals);
  }

  private calculateRelevance(content: ContentItem, context: RecommendationContext): number {
    let relevance = 0.5; // 기본 관련성

    // 세션 타입별 관련성
    if (context.session_type === 'quick_review' && content.estimated_duration_minutes <= 15) {
      relevance += 0.3;
    } else if (context.session_type === 'intensive_study' && content.estimated_duration_minutes > 20) {
      relevance += 0.3;
    }

    // 선호 콘텐츠 타입 매칭
    if (context.preferred_content_types?.includes(content.content_type)) {
      relevance += 0.2;
    }

    return Math.min(1, relevance);
  }

  private calculateKoreanAdaptation(content: ContentItem, koreanPatterns: any): number {
    let adaptation = 0.5;

    // 한국어 간섭 수준과 콘텐츠의 적응 수준 매칭
    if (koreanPatterns.severity === 'high' && content.korean_interference_level === 'high') {
      adaptation += 0.3; // 높은 간섭 패턴을 다루는 콘텐츠
    } else if (koreanPatterns.severity === 'low' && content.korean_interference_level === 'low') {
      adaptation += 0.2; // 간섭이 적은 학습자를 위한 콘텐츠
    }

    return Math.min(1, adaptation);
  }

  private calculateTheologicalFocus(content: ContentItem, focusLevel: number): number {
    if (!content.theological_relevance) return 0.3;

    return Math.min(1, (content.theological_relevance / 100) * focusLevel);
  }

  private predictEngagementLevel(content: ContentItem, userAnalysis: any, totalScore: number): number {
    let engagement = content.engagement_score / 100;

    // 사용자 동기 레벨 반영
    engagement *= userAnalysis.motivation_level;

    // 총 추천 점수와 상관관계
    engagement = (engagement + totalScore) / 2;

    return Math.min(1, engagement);
  }

  private adjustDifficultyForUser(content: ContentItem, profile: UserProfile): DifficultyLevel {
    const levelMapping = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
    const contentLevel = levelMapping[content.difficulty_level] || 3;
    const userLevel = levelMapping[profile.current_level?.overall_cefr_level] || 3;

    const difference = contentLevel - userLevel;

    if (difference <= -2) return DifficultyLevel.VERY_EASY;
    if (difference === -1) return DifficultyLevel.EASY;
    if (difference === 0) return DifficultyLevel.APPROPRIATE;
    if (difference === 1) return DifficultyLevel.CHALLENGING;
    return DifficultyLevel.VERY_HARD;
  }

  private estimateCompletionTime(content: ContentItem, userAnalysis: any): number {
    let baseTime = content.estimated_duration_minutes;

    // 사용자 레벨에 따른 시간 조정
    const difficultyMultiplier = this.getDifficultyTimeMultiplier(content, userAnalysis);

    return Math.round(baseTime * difficultyMultiplier);
  }

  private getDifficultyTimeMultiplier(content: ContentItem, userAnalysis: any): number {
    // 간단한 난이도 기반 시간 조정
    return 1.0; // 기본값, 실제 구현에서는 더 정교한 로직 필요
  }

  private generateSuggestedApproach(content: ContentItem, userAnalysis: any): string {
    const approaches = [
      "단계별로 천천히 진행하세요",
      "반복 학습을 통해 기억을 강화하세요",
      "한국어와 비교하며 차이점을 파악하세요",
      "실제 설교 맥락에서 사용법을 연습하세요"
    ];

    return approaches[Math.floor(Math.random() * approaches.length)];
  }

  private checkPrerequisites(content: ContentItem, profile: UserProfile): boolean {
    // 선수 조건 체크 로직
    return true; // 간단한 구현
  }

  private generateFollowUpSuggestions(content: ContentItem, userAnalysis: any): string[] {
    return [
      "관련 어휘 복습하기",
      "실제 대화에서 사용해보기",
      "비슷한 난이도의 다른 주제 학습하기"
    ];
  }

  private analyzeSkillGaps(scoredContent: ContentRecommendation[], context: RecommendationContext) {
    const identifiedGaps = [SkillArea.GRAMMAR, SkillArea.PRONUNCIATION]; // 예시
    const priorityOrder = [SkillArea.GRAMMAR, SkillArea.VOCABULARY]; // 예시

    return {
      identified_gaps: identifiedGaps,
      priority_order: priorityOrder,
      gap_closing_content: scoredContent.filter(rec =>
        identifiedGaps.some(gap => rec.content_item.skill_areas.includes(gap))
      ).slice(0, 3)
    };
  }

  private identifyCurrentMilestone(profile: UserProfile): string {
    return profile.current_level?.overall_cefr_level || 'A1 기초 단계';
  }

  private calculateProgressTowardsGoal(profile: UserProfile): number {
    return profile.learning_statistics?.overall_progress_percentage || 25;
  }

  private identifyMilestoneContent(scoredContent: ContentRecommendation[], context: RecommendationContext) {
    return scoredContent.slice(0, 2); // 다음 마일스톤을 위한 상위 2개 콘텐츠
  }

  private createSessionPlan(scoredContent: ContentRecommendation[], context: RecommendationContext) {
    const timeAvailable = context.time_available_minutes || 30;

    return {
      warm_up_content: scoredContent.filter(rec =>
        rec.content_item.estimated_duration_minutes <= 5
      ).slice(0, 1),
      main_content: scoredContent.slice(0, 3),
      review_content: scoredContent.filter(rec =>
        rec.content_item.content_type === ContentType.VOCABULARY
      ).slice(0, 1),
      total_estimated_time: timeAvailable
    };
  }

  /**
   * 샘플 콘텐츠 초기화
   */
  private initializeSampleContent() {
    this.contentDatabase.push(
      {
        id: 'theol_001',
        title: '신학 기본 어휘 - 하나님과 삼위일체',
        content_type: ContentType.THEOLOGICAL_TERMS,
        difficulty_level: CEFRLevel.A2,
        skill_areas: [SkillArea.VOCABULARY],
        estimated_duration_minutes: 20,
        prerequisite_concepts: ['기본 명사 격변화'],
        learning_objectives: ['신학 핵심 용어 20개 습득', '격변화 패턴 이해'],
        tags: ['신학', '어휘', '기초'],
        quality_score: 85,
        engagement_score: 78,
        effectiveness_score: 82,
        korean_interference_level: 'medium',
        theological_relevance: 95
      },
      {
        id: 'gram_001',
        title: '헝가리어 격변화 시스템 - 주격과 대격',
        content_type: ContentType.GRAMMAR,
        difficulty_level: CEFRLevel.A1,
        skill_areas: [SkillArea.GRAMMAR],
        estimated_duration_minutes: 30,
        learning_objectives: ['주격과 대격 구분', '기본 격변화 패턴 이해'],
        tags: ['문법', '격변화', '기초'],
        quality_score: 90,
        engagement_score: 70,
        effectiveness_score: 88,
        korean_interference_level: 'high'
      }
    );
  }
}

export default ContentRecommendationEngine;