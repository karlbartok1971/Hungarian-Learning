import { UserProfile, UserLearningContext, LearningStyle, LearningPreference, LearningGoal } from '../models/UserProfile';

/**
 * 개인화 학습 경로 추천 알고리즘
 * 사용자의 학습 스타일, 현재 레벨, 목표, 성과를 기반으로 최적의 학습 경로를 추천
 */

// 학습 콘텐츠 타입
export enum ContentType {
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  READING = 'reading',
  WRITING = 'writing',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
  THEOLOGICAL_TERMS = 'theological_terms',
  SERMON_PRACTICE = 'sermon_practice'
}

// 난이도 레벨
export enum DifficultyLevel {
  BEGINNER = 'beginner',     // A1
  ELEMENTARY = 'elementary', // A2
  INTERMEDIATE = 'intermediate', // B1
  UPPER_INTERMEDIATE = 'upper_intermediate', // B2
  ADVANCED = 'advanced',     // C1
  PROFICIENCY = 'proficiency' // C2
}

// 학습 활동 타입
export interface LearningActivity {
  id: string;
  title: string;
  description: string;
  content_type: ContentType;
  difficulty_level: DifficultyLevel;
  estimated_duration: number; // 분 단위
  prerequisites: string[];
  learning_objectives: string[];
  tags: string[];
  priority_score: number;
  engagement_score: number;
}

// 추천 학습 경로
export interface LearningPath {
  id: string;
  user_id: string;
  name: string;
  description: string;
  activities: LearningActivity[];
  total_duration: number;
  difficulty_progression: DifficultyLevel[];
  content_balance: { [key in ContentType]?: number };
  confidence_score: number;
  created_at: Date;
  expires_at: Date;
}

// 추천 이유
export interface RecommendationReason {
  factor: string;
  explanation: string;
  impact_score: number;
}

// 추천 결과
export interface LearningRecommendation {
  paths: LearningPath[];
  primary_path: LearningPath;
  alternative_paths: LearningPath[];
  reasons: RecommendationReason[];
  confidence_level: number;
  next_assessment_suggestion?: Date;
}

export class PersonalizedLearningPathEngine {

  /**
   * 메인 추천 엔진 - 사용자 컨텍스트를 기반으로 개인화된 학습 경로 생성
   */
  async generateLearningPath(context: UserLearningContext): Promise<LearningRecommendation> {
    const { profile } = context;

    // 1. 사용자 분석
    const userAnalysis = this.analyzeUser(profile);

    // 2. 콘텐츠 우선순위 계산
    const contentPriorities = this.calculateContentPriorities(profile, context);

    // 3. 난이도 조정
    const difficultyStrategy = this.determineDifficultyStrategy(profile, context);

    // 4. 학습 경로 생성
    const paths = await this.createLearningPaths(
      userAnalysis,
      contentPriorities,
      difficultyStrategy,
      context
    );

    // 5. 추천 이유 생성
    const reasons = this.generateRecommendationReasons(profile, paths[0]);

    return {
      paths,
      primary_path: paths[0],
      alternative_paths: paths.slice(1),
      reasons,
      confidence_level: this.calculateConfidenceLevel(profile, paths[0]),
      next_assessment_suggestion: this.suggestNextAssessment(profile)
    };
  }

  /**
   * 사용자 프로필 분석
   */
  private analyzeUser(profile: UserProfile) {
    return {
      learning_efficiency: this.calculateLearningEfficiency(profile),
      engagement_pattern: this.analyzeEngagementPattern(profile),
      strength_areas: profile.strength_weakness.strengths,
      improvement_areas: profile.strength_weakness.weaknesses,
      motivation_level: this.calculateMotivationLevel(profile),
      time_availability: profile.personalization.daily_goal_minutes
    };
  }

  /**
   * 콘텐츠 우선순위 계산
   */
  private calculateContentPriorities(profile: UserProfile, context: UserLearningContext) {
    const priorities: { [key in ContentType]?: number } = {};

    // 목표 기반 우선순위
    profile.learning_goals.forEach(goal => {
      switch (goal) {
        case LearningGoal.SERMON_WRITING:
          priorities[ContentType.WRITING] = (priorities[ContentType.WRITING] || 0) + 30;
          priorities[ContentType.THEOLOGICAL_TERMS] = (priorities[ContentType.THEOLOGICAL_TERMS] || 0) + 25;
          priorities[ContentType.GRAMMAR] = (priorities[ContentType.GRAMMAR] || 0) + 20;
          break;
        case LearningGoal.THEOLOGICAL_STUDY:
          priorities[ContentType.THEOLOGICAL_TERMS] = (priorities[ContentType.THEOLOGICAL_TERMS] || 0) + 35;
          priorities[ContentType.READING] = (priorities[ContentType.READING] || 0) + 25;
          break;
        case LearningGoal.BASIC_COMMUNICATION:
          priorities[ContentType.VOCABULARY] = (priorities[ContentType.VOCABULARY] || 0) + 30;
          priorities[ContentType.SPEAKING] = (priorities[ContentType.SPEAKING] || 0) + 25;
          break;
      }
    });

    // 학습 스타일 기반 조정
    switch (profile.learning_style) {
      case LearningStyle.VISUAL:
        priorities[ContentType.READING] = (priorities[ContentType.READING] || 0) + 15;
        priorities[ContentType.VOCABULARY] = (priorities[ContentType.VOCABULARY] || 0) + 10;
        break;
      case LearningStyle.AUDITORY:
        priorities[ContentType.LISTENING] = (priorities[ContentType.LISTENING] || 0) + 20;
        priorities[ContentType.SPEAKING] = (priorities[ContentType.SPEAKING] || 0) + 15;
        break;
      case LearningStyle.KINESTHETIC:
        priorities[ContentType.WRITING] = (priorities[ContentType.WRITING] || 0) + 15;
        priorities[ContentType.SERMON_PRACTICE] = (priorities[ContentType.SERMON_PRACTICE] || 0) + 10;
        break;
    }

    // 약점 영역 강화
    profile.strength_weakness.weaknesses.forEach(weakness => {
      const contentType = this.mapWeaknessToContent(weakness);
      if (contentType) {
        priorities[contentType] = (priorities[contentType] || 0) + 20;
      }
    });

    return this.normalizePriorities(priorities);
  }

  /**
   * 난이도 전략 결정
   */
  private determineDifficultyStrategy(profile: UserProfile, context: UserLearningContext) {
    const currentLevel = this.levelToNumber(profile.current_level.overall_level);
    const targetLevel = this.levelToNumber(profile.target_level.overall_level);
    const accuracyRate = profile.learning_statistics.accuracy_rate;
    const improvementRate = profile.learning_statistics.improvement_rate;

    let strategy = {
      base_difficulty: currentLevel,
      progression_rate: 'medium' as 'slow' | 'medium' | 'fast',
      challenge_level: 'balanced' as 'conservative' | 'balanced' | 'aggressive',
      adaptive_adjustment: true
    };

    // 성과 기반 조정
    if (accuracyRate > 85 && improvementRate > 0.1) {
      strategy.progression_rate = 'fast';
      strategy.challenge_level = 'aggressive';
    } else if (accuracyRate < 65 || improvementRate < 0.05) {
      strategy.progression_rate = 'slow';
      strategy.challenge_level = 'conservative';
    }

    // 시간 제약 고려
    if (context.available_study_time < 30) {
      strategy.progression_rate = 'slow';
    }

    return strategy;
  }

  /**
   * 학습 경로 생성
   */
  private async createLearningPaths(
    userAnalysis: any,
    contentPriorities: { [key in ContentType]?: number },
    difficultyStrategy: any,
    context: UserLearningContext
  ): Promise<LearningPath[]> {

    const activities = await this.selectOptimalActivities(
      contentPriorities,
      difficultyStrategy,
      userAnalysis,
      context.available_study_time
    );

    const mainPath: LearningPath = {
      id: `path_${Date.now()}`,
      user_id: context.profile.user_id,
      name: this.generatePathName(context.profile, contentPriorities),
      description: this.generatePathDescription(context.profile, userAnalysis),
      activities: activities.slice(0, 10), // 메인 경로는 10개 활동
      total_duration: activities.slice(0, 10).reduce((sum, act) => sum + act.estimated_duration, 0),
      difficulty_progression: this.calculateDifficultyProgression(activities.slice(0, 10)),
      content_balance: this.calculateContentBalance(activities.slice(0, 10)),
      confidence_score: this.calculatePathConfidence(activities.slice(0, 10), userAnalysis),
      created_at: new Date(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후 만료
    };

    // 대안 경로 생성
    const alternativePaths = await this.generateAlternativePaths(mainPath, context);

    return [mainPath, ...alternativePaths];
  }

  /**
   * 최적 활동 선택
   */
  private async selectOptimalActivities(
    contentPriorities: { [key in ContentType]?: number },
    difficultyStrategy: any,
    userAnalysis: any,
    availableTime: number
  ): Promise<LearningActivity[]> {

    // 가상의 활동 풀 (실제로는 데이터베이스에서 조회)
    const activityPool = await this.getAvailableActivities();

    // 우선순위 스코어링
    const scoredActivities = activityPool.map(activity => ({
      ...activity,
      final_score: this.calculateActivityScore(
        activity,
        contentPriorities,
        difficultyStrategy,
        userAnalysis
      )
    }));

    // 정렬 및 선택
    scoredActivities.sort((a, b) => b.final_score - a.final_score);

    // 시간 제약 고려하여 선택
    const selectedActivities: LearningActivity[] = [];
    let totalTime = 0;

    for (const activity of scoredActivities) {
      if (totalTime + activity.estimated_duration <= availableTime) {
        selectedActivities.push(activity);
        totalTime += activity.estimated_duration;
      }
      if (selectedActivities.length >= 15) break; // 최대 15개 활동
    }

    return selectedActivities;
  }

  /**
   * 활동 스코어 계산
   */
  private calculateActivityScore(
    activity: LearningActivity,
    contentPriorities: { [key in ContentType]?: number },
    difficultyStrategy: any,
    userAnalysis: any
  ): number {
    let score = 0;

    // 콘텐츠 타입 우선순위
    score += (contentPriorities[activity.content_type] || 0) * 0.4;

    // 난이도 적합성
    const difficultyMatch = this.calculateDifficultyMatch(
      activity.difficulty_level,
      difficultyStrategy.base_difficulty
    );
    score += difficultyMatch * 0.3;

    // 사용자 참여도
    score += activity.engagement_score * 0.2;

    // 학습 효율성
    score += userAnalysis.learning_efficiency * activity.priority_score * 0.1;

    return score;
  }

  /**
   * 추천 이유 생성
   */
  private generateRecommendationReasons(profile: UserProfile, path: LearningPath): RecommendationReason[] {
    const reasons: RecommendationReason[] = [];

    // 목표 기반 이유
    if (profile.learning_goals.includes(LearningGoal.SERMON_WRITING)) {
      const writingActivities = path.activities.filter(a =>
        a.content_type === ContentType.WRITING || a.content_type === ContentType.SERMON_PRACTICE
      ).length;

      if (writingActivities > 0) {
        reasons.push({
          factor: '설교문 작성 목표',
          explanation: `설교문 작성 목표에 맞춰 ${writingActivities}개의 관련 활동을 포함했습니다.`,
          impact_score: 85
        });
      }
    }

    // 학습 스타일 기반 이유
    reasons.push({
      factor: '학습 스타일 맞춤',
      explanation: `${this.getLearningStyleDescription(profile.learning_style)} 학습자에게 적합한 활동들로 구성했습니다.`,
      impact_score: 75
    });

    // 약점 보완 이유
    if (profile.strength_weakness.weaknesses.length > 0) {
      reasons.push({
        factor: '약점 영역 강화',
        explanation: `${profile.strength_weakness.weaknesses.join(', ')} 영역 개선을 위한 집중 학습을 포함했습니다.`,
        impact_score: 80
      });
    }

    return reasons;
  }

  /**
   * 헬퍼 메서드들
   */
  private levelToNumber(level: string): number {
    const levelMap: { [key: string]: number } = {
      'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6
    };
    return levelMap[level] || 3;
  }

  private mapWeaknessToContent(weakness: string): ContentType | null {
    const mappings: { [key: string]: ContentType } = {
      'vocabulary': ContentType.VOCABULARY,
      'grammar': ContentType.GRAMMAR,
      'writing': ContentType.WRITING,
      'reading': ContentType.READING,
      'listening': ContentType.LISTENING,
      'speaking': ContentType.SPEAKING
    };
    return mappings[weakness.toLowerCase()] || null;
  }

  private normalizePriorities(priorities: { [key in ContentType]?: number }): { [key in ContentType]?: number } {
    const total = Object.values(priorities).reduce((sum, val) => sum + (val || 0), 0);
    const normalized: { [key in ContentType]?: number } = {};

    for (const [key, value] of Object.entries(priorities)) {
      normalized[key as ContentType] = total > 0 ? (value || 0) / total * 100 : 0;
    }

    return normalized;
  }

  private calculateLearningEfficiency(profile: UserProfile): number {
    const stats = profile.learning_statistics;
    return (stats.accuracy_rate * 0.4 + stats.improvement_rate * 100 * 0.6) / 100;
  }

  private analyzeEngagementPattern(profile: UserProfile): string {
    const streak = profile.learning_statistics.current_streak_days;
    if (streak > 14) return 'highly_engaged';
    if (streak > 7) return 'moderately_engaged';
    return 'low_engagement';
  }

  private calculateMotivationLevel(profile: UserProfile): number {
    const stats = profile.learning_statistics;
    const recentActivity = new Date().getTime() - profile.learning_statistics.last_active_date.getTime();
    const daysSinceActive = recentActivity / (1000 * 60 * 60 * 24);

    let motivation = 0.5;
    if (stats.current_streak_days > 7) motivation += 0.3;
    if (daysSinceActive < 1) motivation += 0.2;
    if (stats.improvement_rate > 0.1) motivation += 0.2;

    return Math.min(motivation, 1.0);
  }

  private async getAvailableActivities(): Promise<LearningActivity[]> {
    // 실제 구현에서는 데이터베이스에서 조회
    // 여기서는 샘플 데이터 반환
    return [
      {
        id: 'vocab_basic_1',
        title: '기본 헝가리어 어휘 학습',
        description: '일상생활에서 자주 사용되는 기본 어휘 학습',
        content_type: ContentType.VOCABULARY,
        difficulty_level: DifficultyLevel.BEGINNER,
        estimated_duration: 20,
        prerequisites: [],
        learning_objectives: ['기본 어휘 50개 학습', '발음 연습'],
        tags: ['basic', 'daily'],
        priority_score: 0.8,
        engagement_score: 0.7
      },
      {
        id: 'theological_terms_1',
        title: '신학 용어 기초',
        description: '기본적인 신학 용어 학습',
        content_type: ContentType.THEOLOGICAL_TERMS,
        difficulty_level: DifficultyLevel.ELEMENTARY,
        estimated_duration: 25,
        prerequisites: ['vocab_basic_1'],
        learning_objectives: ['신학 용어 30개 학습'],
        tags: ['theology', 'terms'],
        priority_score: 0.9,
        engagement_score: 0.8
      },
      {
        id: 'grammar_intro_1',
        title: '헝가리어 문법 입문',
        description: '기본 문법 구조 이해',
        content_type: ContentType.GRAMMAR,
        difficulty_level: DifficultyLevel.BEGINNER,
        estimated_duration: 30,
        prerequisites: [],
        learning_objectives: ['기본 문법 구조 이해'],
        tags: ['grammar', 'basic'],
        priority_score: 0.85,
        engagement_score: 0.6
      }
    ];
  }

  private calculateDifficultyMatch(activityLevel: DifficultyLevel, userLevel: number): number {
    const activityLevelNum = this.difficultyLevelToNumber(activityLevel);
    const difference = Math.abs(activityLevelNum - userLevel);

    if (difference === 0) return 100;
    if (difference === 1) return 80;
    if (difference === 2) return 60;
    return Math.max(20, 60 - (difference - 2) * 20);
  }

  private difficultyLevelToNumber(level: DifficultyLevel): number {
    const levelMap: { [key in DifficultyLevel]: number } = {
      [DifficultyLevel.BEGINNER]: 1,
      [DifficultyLevel.ELEMENTARY]: 2,
      [DifficultyLevel.INTERMEDIATE]: 3,
      [DifficultyLevel.UPPER_INTERMEDIATE]: 4,
      [DifficultyLevel.ADVANCED]: 5,
      [DifficultyLevel.PROFICIENCY]: 6
    };
    return levelMap[level];
  }

  private generatePathName(profile: UserProfile, priorities: { [key in ContentType]?: number }): string {
    const topContent = Object.entries(priorities).sort(([,a], [,b]) => (b || 0) - (a || 0))[0];
    const contentName = this.getContentTypeDisplayName(topContent[0] as ContentType);
    return `${profile.name}님을 위한 ${contentName} 중심 학습`;
  }

  private generatePathDescription(profile: UserProfile, analysis: any): string {
    return `${profile.current_level.overall_level} 레벨에서 ${profile.target_level.overall_level} 레벨로 향상을 위한 개인 맞춤 학습 경로입니다. 현재 학습 효율성 ${Math.round(analysis.learning_efficiency * 100)}%를 기반으로 설계되었습니다.`;
  }

  private calculateDifficultyProgression(activities: LearningActivity[]): DifficultyLevel[] {
    return activities.map(activity => activity.difficulty_level);
  }

  private calculateContentBalance(activities: LearningActivity[]): { [key in ContentType]?: number } {
    const balance: { [key in ContentType]?: number } = {};
    activities.forEach(activity => {
      balance[activity.content_type] = (balance[activity.content_type] || 0) + 1;
    });
    return balance;
  }

  private calculatePathConfidence(activities: LearningActivity[], analysis: any): number {
    const avgEngagement = activities.reduce((sum, act) => sum + act.engagement_score, 0) / activities.length;
    const avgPriority = activities.reduce((sum, act) => sum + act.priority_score, 0) / activities.length;
    return (avgEngagement * 0.4 + avgPriority * 0.3 + analysis.learning_efficiency * 0.3) * 100;
  }

  private suggestNextAssessment(profile: UserProfile): Date {
    const lastAssessment = profile.last_assessment_date || profile.created_at;
    const daysSinceAssessment = (Date.now() - lastAssessment.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceAssessment > 14) {
      return new Date(); // 즉시 평가 권장
    }

    return new Date(Date.now() + (14 - daysSinceAssessment) * 24 * 60 * 60 * 1000);
  }

  private calculateConfidenceLevel(profile: UserProfile, path: LearningPath): number {
    return path.confidence_score;
  }

  private async generateAlternativePaths(mainPath: LearningPath, context: UserLearningContext): Promise<LearningPath[]> {
    // 대안 경로 생성 로직 (간소화)
    return [];
  }

  private getLearningStyleDescription(style: LearningStyle): string {
    const descriptions: { [key in LearningStyle]: string } = {
      [LearningStyle.VISUAL]: '시각적',
      [LearningStyle.AUDITORY]: '청각적',
      [LearningStyle.KINESTHETIC]: '체감각적',
      [LearningStyle.READING]: '읽기/쓰기'
    };
    return descriptions[style];
  }

  private getContentTypeDisplayName(contentType: ContentType): string {
    const names: { [key in ContentType]: string } = {
      [ContentType.VOCABULARY]: '어휘',
      [ContentType.GRAMMAR]: '문법',
      [ContentType.READING]: '읽기',
      [ContentType.WRITING]: '쓰기',
      [ContentType.LISTENING]: '듣기',
      [ContentType.SPEAKING]: '말하기',
      [ContentType.THEOLOGICAL_TERMS]: '신학 용어',
      [ContentType.SERMON_PRACTICE]: '설교 연습'
    };
    return names[contentType];
  }
}