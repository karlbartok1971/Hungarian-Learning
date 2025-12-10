// 학습 분석 모델
// Hungarian Learning Platform - Learning Analytics Model
// T106 [P] [US5] Create LearningAnalytics model

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany
} from 'typeorm';
import { User } from './User';
import { PerformanceMetrics } from './PerformanceMetrics';

// 학습 패턴 분석 결과
@Entity('learning_analytics')
@Index(['userId', 'analysisDate'])
export class LearningAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('date')
  @Index()
  analysisDate: Date;

  @Column('varchar', { length: 20, default: '30d' })
  analysisPeriod: string; // 7d, 30d, 90d, 1y

  // 전체 학습 현황
  @Column('jsonb')
  overallProgress: {
    totalStudyTimeHours: number;
    totalWordsLearned: number;
    currentLevel: string; // A1, A2, B1, B2, C1, C2
    levelProgressPercentage: number;
    studyStreakDays: number;
    totalSessions: number;
    averageSessionDuration: number;
    overallAccuracy: number;
    studyConsistency: number;
    lastActiveDate: string;
  };

  // 최근 활동 분석
  @Column('jsonb')
  recentActivity: {
    last7Days: Array<{
      date: string;
      studyTimeMinutes: number;
      wordsPracticed: number;
      accuracyRate: number;
      sessionCount: number;
    }>;
    weeklySummary: {
      totalTime: number;
      averageAccuracy: number;
      improvementRate: number;
      consistencyScore: number;
    };
    trends: {
      studyTimetrend: 'increasing' | 'decreasing' | 'stable';
      accuracyTrend: 'improving' | 'declining' | 'stable';
      engagementTrend: 'increasing' | 'decreasing' | 'stable';
    };
  };

  // 스킬별 분석
  @Column('jsonb')
  skillBreakdown: {
    vocabulary: {
      level: number;
      progressPercentage: number;
      weakAreas: string[];
      strongAreas: string[];
      retentionRate: number;
      learningVelocity: number;
      difficultyComfortZone: string;
      masteredWords: number;
      strugglingWords: number;
    };
    pronunciation: {
      level: number;
      progressPercentage: number;
      weakPhonemes: string[];
      accuracyTrend: number[];
      mostImprovedPhonemes: string[];
      averageConfidenceScore: number;
      nativelikePhonemes: string[];
      practiceRecommendations: string[];
    };
    grammar: {
      level: number;
      progressPercentage: number;
      difficultConcepts: string[];
      masteredConcepts: string[];
      conceptualGaps: string[];
      syntaxAccuracy: number;
      morphologyAccuracy: number;
      pragmaticAccuracy: number;
    };
  };

  // 학습 패턴 분석
  @Column('jsonb')
  studyPatterns: {
    optimalStudyTimes: Array<{
      hour: number;
      performanceScore: number;
      sessionCount: number;
      averageAccuracy: number;
      engagement: number;
    }>;
    preferredSessionLength: {
      averageMinutes: number;
      optimalRange: { min: number; max: number };
      efficiencyScore: number;
      attentionSpanPattern: string;
    };
    weeklyDistribution: Array<{
      dayOfWeek: number; // 0=Sunday, 6=Saturday
      averageTime: number;
      sessionCount: number;
      consistencyScore: number;
      performanceRating: number;
    }>;
    seasonalPatterns: {
      bestMonths: number[];
      challengingPeriods: string[];
      holidayImpact: number;
      motivationCycles: string[];
    };
  };

  // 성과 패턴
  @Column('jsonb')
  performancePatterns: {
    accuracyTrends: Array<{
      skillType: 'vocabulary' | 'pronunciation' | 'grammar';
      trendDirection: 'improving' | 'declining' | 'stable';
      changeRate: number; // percentage change per week
      confidenceLevel: number; // 0-1
      dataPoints: number;
      correlationFactors: string[];
    }>;
    difficultyAdaptation: {
      currentComfortLevel: number; // 0-1
      recommendedDifficulty: number; // 0-1
      challengeTolerance: number; // 0-1
      adaptationRate: number; // how quickly user adapts to new difficulty
      plateauRisk: number; // 0-1, risk of hitting learning plateau
    };
    retentionAnalysis: {
      shortTermRetention: number; // 24 hours
      longTermRetention: number; // 30 days
      forgettingCurve: {
        initialStrength: number;
        decayRate: number;
        asymptote: number;
        halfLife: number; // days
      };
      optimalReviewIntervals: number[]; // days
      spaceRepetitionEfficiency: number;
    };
    errorPatterns: {
      commonMistakeTypes: string[];
      errorFrequencyTrends: Record<string, number>;
      persistentErrors: string[];
      improvingAreas: string[];
      errorCorrectionSpeed: number;
    };
  };

  // 동기 지표
  @Column('jsonb')
  motivationIndicators: {
    engagementScore: number; // 0-1
    consistencyRating: number; // 0-1
    goalAlignment: number; // 0-1
    streakStability: number; // 0-1
    progressSatisfaction: number; // 0-1
    challengeAppetite: number; // 0-1
    intrinsicMotivation: {
      curiosityScore: number;
      masteryOrientation: number;
      autonomyPreference: number;
      socialConnectionValue: number;
    };
    extrinsicMotivation: {
      goalOriented: number;
      rewardResponsive: number;
      competitionDriven: number;
      recognitionSeeking: number;
    };
    riskFactors: {
      burnoutRisk: number;
      plateauRisk: number;
      motivationDecline: number;
      dropoutRisk: number;
    };
  };

  // 학습 효율성 분석
  @Column('jsonb')
  learningEfficiency: {
    timeToMastery: {
      vocabularyWordsPerHour: number;
      pronunciationImprovementRate: number;
      grammarConceptsPerSession: number;
      overallLearningVelocity: number;
    };
    resourceUtilization: {
      toolUsageEffectiveness: Record<string, number>;
      contentTypePreferences: Record<string, number>;
      practiceMethodEfficiency: Record<string, number>;
      feedbackUtilization: number;
    };
    cognitiveLoad: {
      averageWorkingMemoryLoad: number;
      attentionFatiguePatterns: string;
      multitaskingImpact: number;
      cognitiveOverloadRisk: number;
    };
    transferEfficiency: {
      crossSkillTransfer: number;
      realWorldApplication: number;
      contextualAdaptation: number;
      metacognitiveAwareness: number;
    };
  };

  // 예측 분석 (AI 기반)
  @Column('jsonb')
  predictiveInsights: {
    progressPrediction: {
      nextLevelAchievementProbability: number;
      estimatedTimeToNextLevel: number; // days
      confidenceInterval: { lower: number; upper: number };
      assumptionsUsed: string[];
    };
    riskAssessment: {
      dropoutRisk: { score: number; factors: string[] };
      plateauRisk: { score: number; indicators: string[] };
      overworkRisk: { score: number; symptoms: string[] };
      motivationDeclineRisk: { score: number; earlyWarnings: string[] };
    };
    opportunityIdentification: {
      accelerationOpportunities: Array<{
        type: string;
        impact: number;
        effort: number;
        description: string;
      }>;
      untappedStrengths: string[];
      crossSkillSynergies: string[];
      optimalChallengeZones: string[];
    };
    adaptiveRecommendations: {
      immediateActions: string[];
      weeklyGoals: string[];
      monthlyMilestones: string[];
      strategicAdjustments: string[];
    };
  };

  // 비교 분석
  @Column('jsonb')
  comparativeAnalysis: {
    peerComparison: {
      userPercentile: number; // 0-100
      averagePerformance: number;
      areasAboveAverage: string[];
      areasBelowAverage: string[];
      cohortSize: number;
      anonymizedBenchmarks: Record<string, number>;
    };
    cefrAlignment: {
      currentLevel: string;
      levelProgress: number; // 0-1
      blockingSkills: string[];
      advancementRequirements: string[];
      levelCharacteristics: string[];
      gapAnalysis: Record<string, number>;
    };
    personalBestComparison: {
      allTimeBests: Record<string, { value: number; date: string }>;
      recentBests: Record<string, { value: number; date: string }>;
      improvementAreas: string[];
      consistencyMetrics: Record<string, number>;
    };
  };

  // 메타데이터
  @Column('jsonb')
  analysisMetadata: {
    dataQualityScore: number; // 0-1
    coveragePercentage: number; // how much of the period has data
    reliabilityIndicators: Record<string, number>;
    methodsUsed: string[];
    assumptions: string[];
    limitations: string[];
    nextAnalysisDate: string;
    updateFrequency: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => PerformanceMetrics, metrics => metrics.analytics)
  performanceMetrics: PerformanceMetrics[];
}

// 학습 세션 원시 데이터
@Entity('learning_sessions')
@Index(['userId', 'startTime'])
export class LearningSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('varchar', { length: 50 })
  sessionType: string; // vocabulary, pronunciation, grammar, mixed

  @Column('timestamp')
  @Index()
  startTime: Date;

  @Column('timestamp', { nullable: true })
  endTime: Date;

  @Column('integer')
  durationSeconds: number;

  @Column('integer', { default: 0 })
  itemsStudied: number;

  @Column('integer', { default: 0 })
  correctAnswers: number;

  @Column('integer', { default: 0 })
  totalAttempts: number;

  @Column('decimal', { precision: 5, scale: 3, nullable: true })
  averageResponseTime: number; // seconds

  @Column('jsonb', { nullable: true })
  detailedMetrics: {
    difficultyDistribution: Record<string, number>;
    topicBreakdown: Record<string, number>;
    accuracyByTopic: Record<string, number>;
    timeSpentByTopic: Record<string, number>;
    engagementMetrics: {
      focusScore: number;
      interactionRate: number;
      completionRate: number;
    };
    cognitiveLoad: {
      workingMemoryLoad: number;
      attentionLevel: number;
      fatigueLevel: number;
    };
  };

  @Column('jsonb', { nullable: true })
  contextualData: {
    timeOfDay: string;
    dayOfWeek: number;
    device: string;
    location: string;
    environmentalFactors: string[];
    userMood: string;
    energyLevel: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// 성과 스냅샷 (일별/주별 요약)
@Entity('performance_snapshots')
@Index(['userId', 'snapshotDate', 'granularity'])
export class PerformanceSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('date')
  @Index()
  snapshotDate: Date;

  @Column('varchar', { length: 10 })
  granularity: string; // daily, weekly, monthly

  @Column('jsonb')
  aggregatedMetrics: {
    totalStudyTime: number; // minutes
    sessionsCount: number;
    itemsStudied: number;
    overallAccuracy: number;
    averageSessionDuration: number;
    skillSpecificMetrics: Record<string, {
      timeSpent: number;
      accuracy: number;
      itemsCompleted: number;
      improvement: number;
    }>;
    engagementScore: number;
    consistencyScore: number;
  };

  @Column('jsonb')
  progressIndicators: {
    vocabularyGrowth: number;
    pronunciationImprovement: number;
    grammarMastery: number;
    retentionRate: number;
    difficultyProgression: number;
    confidenceLevel: number;
  };

  @Column('jsonb', { nullable: true })
  notableEvents: {
    achievements: string[];
    breakthroughs: string[];
    challenges: string[];
    milestones: string[];
  };

  @CreateDateColumn()
  createdAt: Date;
}

// 약점 식별 및 추천
@Entity('weakness_analyses')
@Index(['userId', 'analysisDate'])
export class WeaknessAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('timestamp')
  @Index()
  analysisDate: Date;

  @Column('jsonb')
  identifiedWeaknesses: Array<{
    category: 'vocabulary' | 'pronunciation' | 'grammar' | 'fluency';
    severity: 'critical' | 'high' | 'medium' | 'low';
    confidence: number; // 0-1
    specificAreas: Array<{
      areaName: string;
      accuracyRate: number;
      practiceFrequency: number;
      improvementPotential: number;
      difficultyLevel: string;
      prerequisites: string[];
    }>;
    rootCauses: string[];
    impactOnOverallProgress: number;
  }>;

  @Column('jsonb')
  priorityRecommendations: Array<{
    recommendationId: string;
    title: string;
    description: string;
    targetWeakness: string;
    expectedBenefit: number; // 0-1
    difficultyLevel: number; // 0-1
    timeRequirement: number; // hours
    prerequisites: string[];
    resources: string[];
    metrics: string[];
    timeline: string;
  }>;

  @Column('jsonb')
  actionPlan: {
    immediateActions: Array<{
      action: string;
      timeframe: string;
      resources: string[];
      expectedOutcome: string;
    }>;
    weeklyGoals: Array<{
      goal: string;
      metrics: string[];
      targetValue: number;
    }>;
    monthlyMilestones: Array<{
      milestone: string;
      criteria: string[];
      rewards: string[];
    }>;
    strategicObjectives: Array<{
      objective: string;
      timeframe: string;
      keyResults: string[];
    }>;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export { LearningAnalytics, LearningSession, PerformanceSnapshot, WeaknessAnalysis };