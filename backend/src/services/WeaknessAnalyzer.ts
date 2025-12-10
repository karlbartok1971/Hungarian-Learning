// 약점 식별 및 추천 엔진
// Hungarian Learning Platform - Weakness Identification and Recommendation Engine
// T112 [US5] Add weakness identification and recommendation engine

import { LearningSession, PerformanceSnapshot } from '../models/LearningAnalytics';
import { PerformanceMetrics } from '../models/PerformanceMetrics';

export interface WeaknessCategory {
  category: 'vocabulary' | 'pronunciation' | 'grammar' | 'fluency';
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
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
  recommendedActions: Array<{
    actionType: string;
    priority: number;
    estimatedImprovement: number;
    timeInvestment: number;
    description: string;
    resources: string[];
  }>;
}

export interface PriorityRecommendation {
  recommendationId: string;
  title: string;
  description: string;
  targetWeakness: string;
  expectedBenefit: number;
  difficultyLevel: number;
  timeRequirement: number;
  prerequisites: string[];
  resources: string[];
  metrics: string[];
  timeline: string;
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
  };
}

export interface ComparativeAnalysis {
  peerComparison: {
    userPercentile: number;
    averagePerformance: number;
    areasAboveAverage: string[];
    areasBelowAverage: string[];
    cohortSize: number;
    anonymizedBenchmarks: Record<string, number>;
  };
  cefrAlignment: {
    currentLevel: string;
    levelProgress: number;
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
}

export class WeaknessAnalyzer {
  // 약점 카테고리 식별
  public identifyWeaknessCategories(
    sessions: LearningSession[],
    metrics: PerformanceMetrics[]
  ): WeaknessCategory[] {
    const categories: WeaknessCategory[] = [];

    // 어휘 약점 분석
    const vocabularyWeakness = this.analyzeVocabularyWeaknesses(sessions, metrics);
    if (vocabularyWeakness) categories.push(vocabularyWeakness);

    // 발음 약점 분석
    const pronunciationWeakness = this.analyzePronunciationWeaknesses(sessions, metrics);
    if (pronunciationWeakness) categories.push(pronunciationWeakness);

    // 문법 약점 분석
    const grammarWeakness = this.analyzeGrammarWeaknesses(sessions, metrics);
    if (grammarWeakness) categories.push(grammarWeakness);

    // 유창성 약점 분석
    const fluencyWeakness = this.analyzeFluencyWeaknesses(sessions, metrics);
    if (fluencyWeakness) categories.push(fluencyWeakness);

    // 심각도 순으로 정렬
    return categories.sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity));
  }

  // 우선순위 추천사항 생성
  public generatePriorityRecommendations(
    weaknessCategories: WeaknessCategory[],
    userLevel: string = 'A2',
    availableTime: number = 30 // 일일 학습 시간 (분)
  ): PriorityRecommendation[] {
    const recommendations: PriorityRecommendation[] = [];

    // 각 약점 카테고리별로 추천사항 생성
    weaknessCategories.forEach((weakness, index) => {
      const recommendation = this.createRecommendationForWeakness(
        weakness,
        userLevel,
        availableTime,
        index
      );
      if (recommendation) {
        recommendations.push(recommendation);
      }
    });

    // 전반적인 학습 전략 추천 추가
    const strategicRecommendation = this.createStrategicRecommendation(
      weaknessCategories,
      userLevel,
      availableTime
    );
    if (strategicRecommendation) {
      recommendations.push(strategicRecommendation);
    }

    return recommendations.slice(0, 5); // 상위 5개 추천사항만 반환
  }

  // 비교 분석 생성
  public generateComparativeAnalysis(
    sessions: LearningSession[],
    metrics: PerformanceMetrics[],
    userLevel: string = 'A2'
  ): ComparativeAnalysis {
    return {
      peerComparison: this.generatePeerComparison(sessions, metrics, userLevel),
      cefrAlignment: this.analyzeCEFRAlignment(sessions, metrics, userLevel),
      personalBestComparison: this.generatePersonalBestComparison(sessions, metrics)
    };
  }

  // === 어휘 약점 분석 ===
  private analyzeVocabularyWeaknesses(
    sessions: LearningSession[],
    metrics: PerformanceMetrics[]
  ): WeaknessCategory | null {
    const vocabularySessions = sessions.filter(s => s.sessionType === 'vocabulary');
    if (vocabularySessions.length === 0) return null;

    // 전체 정확도 계산
    const totalAttempts = vocabularySessions.reduce((sum, s) => sum + s.totalAttempts, 0);
    const correctAnswers = vocabularySessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const overallAccuracy = totalAttempts > 0 ? correctAnswers / totalAttempts : 0;

    // 약점으로 판단되는 기준
    if (overallAccuracy >= 0.8) return null;

    // 구체적인 약점 영역 식별
    const specificAreas = this.identifyVocabularyAreas(vocabularySessions, metrics);
    const severity = this.calculateSeverity(overallAccuracy, vocabularySessions.length);
    const rootCauses = this.identifyVocabularyRootCauses(vocabularySessions, metrics);

    return {
      category: 'vocabulary',
      severity,
      confidence: Math.min(vocabularySessions.length / 20, 1), // 20세션 기준 100% 신뢰도
      specificAreas,
      rootCauses,
      impactOnOverallProgress: this.calculateProgressImpact('vocabulary', overallAccuracy),
      recommendedActions: this.generateVocabularyActions(specificAreas, overallAccuracy)
    };
  }

  // === 발음 약점 분석 ===
  private analyzePronunciationWeaknesses(
    sessions: LearningSession[],
    metrics: PerformanceMetrics[]
  ): WeaknessCategory | null {
    const pronunciationSessions = sessions.filter(s => s.sessionType === 'pronunciation');
    if (pronunciationSessions.length === 0) return null;

    // 평균 정확도 계산
    const accuracies = pronunciationSessions.map(s =>
      s.totalAttempts > 0 ? s.correctAnswers / s.totalAttempts : 0
    );
    const averageAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;

    if (averageAccuracy >= 0.75) return null;

    const specificAreas = this.identifyPronunciationAreas(pronunciationSessions, metrics);
    const severity = this.calculateSeverity(averageAccuracy, pronunciationSessions.length);

    return {
      category: 'pronunciation',
      severity,
      confidence: Math.min(pronunciationSessions.length / 15, 1),
      specificAreas,
      rootCauses: ['헝가리어 특유 음소', '한국어 간섭', '듣기 경험 부족'],
      impactOnOverallProgress: this.calculateProgressImpact('pronunciation', averageAccuracy),
      recommendedActions: this.generatePronunciationActions(specificAreas, averageAccuracy)
    };
  }

  // === 문법 약점 분석 ===
  private analyzeGrammarWeaknesses(
    sessions: LearningSession[],
    metrics: PerformanceMetrics[]
  ): WeaknessCategory | null {
    const grammarSessions = sessions.filter(s => s.sessionType === 'grammar');
    if (grammarSessions.length === 0) return null;

    const accuracies = grammarSessions.map(s =>
      s.totalAttempts > 0 ? s.correctAnswers / s.totalAttempts : 0
    );
    const averageAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;

    if (averageAccuracy >= 0.8) return null;

    const specificAreas = this.identifyGrammarAreas(grammarSessions, metrics);
    const severity = this.calculateSeverity(averageAccuracy, grammarSessions.length);

    return {
      category: 'grammar',
      severity,
      confidence: Math.min(grammarSessions.length / 25, 1),
      specificAreas,
      rootCauses: this.identifyGrammarRootCauses(averageAccuracy),
      impactOnOverallProgress: this.calculateProgressImpact('grammar', averageAccuracy),
      recommendedActions: this.generateGrammarActions(specificAreas, averageAccuracy)
    };
  }

  // === 유창성 약점 분석 ===
  private analyzeFluencyWeaknesses(
    sessions: LearningSession[],
    metrics: PerformanceMetrics[]
  ): WeaknessCategory | null {
    // 응답 시간과 세션 지속성을 기반으로 유창성 평가
    const recentSessions = sessions.slice(-20); // 최근 20세션
    if (recentSessions.length < 10) return null;

    const averageResponseTimes = recentSessions
      .filter(s => s.averageResponseTime !== null)
      .map(s => s.averageResponseTime!);

    if (averageResponseTimes.length === 0) return null;

    const avgResponseTime = averageResponseTimes.reduce((sum, time) => sum + time, 0) / averageResponseTimes.length;

    // 응답 시간이 너무 길면 유창성 문제
    if (avgResponseTime < 3) return null; // 3초 미만이면 괜찮음

    const specificAreas = [{
      areaName: '응답 속도',
      accuracyRate: Math.max(0, 1 - (avgResponseTime - 3) / 10), // 3초 기준으로 계산
      practiceFrequency: recentSessions.length,
      improvementPotential: 0.8,
      difficultyLevel: 'medium',
      prerequisites: ['기본 어휘 숙달', '문법 기초']
    }];

    return {
      category: 'fluency',
      severity: avgResponseTime > 8 ? 'high' : avgResponseTime > 5 ? 'medium' : 'low',
      confidence: 0.7,
      specificAreas,
      rootCauses: ['사고 시간 과다', '어휘 접근 속도 느림', '문법 처리 지연'],
      impactOnOverallProgress: 0.6,
      recommendedActions: this.generateFluencyActions(avgResponseTime)
    };
  }

  // === 보조 메서드들 ===
  private getSeverityWeight(severity: string): number {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  private calculateSeverity(accuracy: number, sessionCount: number): 'critical' | 'high' | 'medium' | 'low' {
    const severityScore = (1 - accuracy) * Math.min(sessionCount / 10, 1);

    if (severityScore > 0.4) return 'critical';
    if (severityScore > 0.3) return 'high';
    if (severityScore > 0.2) return 'medium';
    return 'low';
  }

  private calculateProgressImpact(category: string, accuracy: number): number {
    const weights = {
      vocabulary: 0.35,
      pronunciation: 0.25,
      grammar: 0.3,
      fluency: 0.1
    };

    const categoryWeight = weights[category as keyof typeof weights] || 0.2;
    const accuracyImpact = 1 - accuracy;

    return categoryWeight * accuracyImpact;
  }

  private identifyVocabularyAreas(
    sessions: LearningSession[],
    metrics: PerformanceMetrics[]
  ): WeaknessCategory['specificAreas'] {
    // 실제 구현에서는 더 세밀한 분석 필요
    return [
      {
        areaName: '헝가리어 격변화',
        accuracyRate: 0.65,
        practiceFrequency: sessions.filter(s => s.sessionType === 'vocabulary').length * 0.3,
        improvementPotential: 0.85,
        difficultyLevel: 'high',
        prerequisites: ['기본 명사', '형용사 이해']
      },
      {
        areaName: '동사 활용',
        accuracyRate: 0.7,
        practiceFrequency: sessions.filter(s => s.sessionType === 'vocabulary').length * 0.25,
        improvementPotential: 0.8,
        difficultyLevel: 'high',
        prerequisites: ['기본 동사', '시제 개념']
      }
    ];
  }

  private identifyPronunciationAreas(
    sessions: LearningSession[],
    metrics: PerformanceMetrics[]
  ): WeaknessCategory['specificAreas'] {
    return [
      {
        areaName: 'gy, ny, ty 음소',
        accuracyRate: 0.6,
        practiceFrequency: sessions.filter(s => s.sessionType === 'pronunciation').length * 0.4,
        improvementPotential: 0.9,
        difficultyLevel: 'high',
        prerequisites: ['기본 자음 이해']
      },
      {
        areaName: '장단음 구분',
        accuracyRate: 0.7,
        practiceFrequency: sessions.filter(s => s.sessionType === 'pronunciation').length * 0.3,
        improvementPotential: 0.8,
        difficultyLevel: 'medium',
        prerequisites: ['모음 체계 이해']
      }
    ];
  }

  private identifyGrammarAreas(
    sessions: LearningSession[],
    metrics: PerformanceMetrics[]
  ): WeaknessCategory['specificAreas'] {
    return [
      {
        areaName: '정동사와 부정동사',
        accuracyRate: 0.65,
        practiceFrequency: sessions.filter(s => s.sessionType === 'grammar').length * 0.2,
        improvementPotential: 0.85,
        difficultyLevel: 'high',
        prerequisites: ['동사의 기본 개념', '어순 이해']
      },
      {
        areaName: '전치사 사용',
        accuracyRate: 0.75,
        practiceFrequency: sessions.filter(s => s.sessionType === 'grammar').length * 0.15,
        improvementPotential: 0.7,
        difficultyLevel: 'medium',
        prerequisites: ['격 시스템 이해']
      }
    ];
  }

  private identifyVocabularyRootCauses(
    sessions: LearningSession[],
    metrics: PerformanceMetrics[]
  ): string[] {
    const causes = [];

    // 세션 빈도가 낮으면
    if (sessions.length < 20) causes.push('학습 빈도 부족');

    // 정확도가 매우 낮으면
    const avgAccuracy = sessions.reduce((sum, s) =>
      sum + (s.totalAttempts > 0 ? s.correctAnswers / s.totalAttempts : 0), 0) / sessions.length;

    if (avgAccuracy < 0.6) causes.push('기초 어휘 부족');
    if (avgAccuracy < 0.5) causes.push('체계적 학습 부족');

    return causes.length > 0 ? causes : ['복습 주기 불규칙'];
  }

  private identifyGrammarRootCauses(accuracy: number): string[] {
    if (accuracy < 0.5) return ['기본 문법 개념 부족', '체계적 학습 필요'];
    if (accuracy < 0.7) return ['문법 규칙 미숙', '실전 적용 부족'];
    return ['고급 문법 개념 어려움'];
  }

  // === 액션 생성 메서드들 ===
  private generateVocabularyActions(
    areas: WeaknessCategory['specificAreas'],
    accuracy: number
  ): WeaknessCategory['recommendedActions'] {
    return [
      {
        actionType: '집중 복습',
        priority: 1,
        estimatedImprovement: 0.25,
        timeInvestment: 15, // 분/일
        description: '약점 어휘 영역 집중 복습 및 반복 학습',
        resources: ['플래시카드', '간격 반복 시스템', '예문 연습']
      },
      {
        actionType: '문맥 학습',
        priority: 2,
        estimatedImprovement: 0.2,
        timeInvestment: 10,
        description: '실제 문장에서 어휘 사용법 학습',
        resources: ['문장 완성 연습', '독해 연습', '작문 연습']
      }
    ];
  }

  private generatePronunciationActions(
    areas: WeaknessCategory['specificAreas'],
    accuracy: number
  ): WeaknessCategory['recommendedActions'] {
    return [
      {
        actionType: '음성 연습',
        priority: 1,
        estimatedImprovement: 0.3,
        timeInvestment: 20,
        description: '발음 정확도 향상을 위한 집중 음성 연습',
        resources: ['발음 가이드', '녹음 연습', '원어민 음성 모델']
      },
      {
        actionType: '듣기 강화',
        priority: 2,
        estimatedImprovement: 0.2,
        timeInvestment: 15,
        description: '헝가리어 음성 인식 능력 향상',
        resources: ['듣기 연습', '음성 구분 연습', '쉐도잉 연습']
      }
    ];
  }

  private generateGrammarActions(
    areas: WeaknessCategory['specificAreas'],
    accuracy: number
  ): WeaknessCategory['recommendedActions'] {
    return [
      {
        actionType: '패턴 학습',
        priority: 1,
        estimatedImprovement: 0.25,
        timeInvestment: 20,
        description: '문법 패턴 인식 및 규칙 학습',
        resources: ['문법 가이드', '패턴 연습', '변환 연습']
      },
      {
        actionType: '실습 적용',
        priority: 2,
        estimatedImprovement: 0.2,
        timeInvestment: 15,
        description: '문법 규칙의 실제 적용 연습',
        resources: ['문장 구성 연습', '오류 수정 연습', '자유 작문']
      }
    ];
  }

  private generateFluencyActions(responseTime: number): WeaknessCategory['recommendedActions'] {
    return [
      {
        actionType: '속도 연습',
        priority: 1,
        estimatedImprovement: 0.3,
        timeInvestment: 10,
        description: '빠른 응답을 위한 반사적 연습',
        resources: ['순간 응답 연습', '시간 제한 연습', '자동화 훈련']
      },
      {
        actionType: '사고 패턴 개선',
        priority: 2,
        estimatedImprovement: 0.2,
        timeInvestment: 15,
        description: '헝가리어 사고 패턴 구축',
        resources: ['논리적 연결 연습', '구조화된 대화 연습']
      }
    ];
  }

  // === 추천사항 생성 메서드들 ===
  private createRecommendationForWeakness(
    weakness: WeaknessCategory,
    userLevel: string,
    availableTime: number,
    priority: number
  ): PriorityRecommendation | null {
    const recommendationId = `rec_${weakness.category}_${Date.now()}`;

    const timeAllocation = Math.min(availableTime * 0.4, 20); // 최대 20분까지

    return {
      recommendationId,
      title: `${this.getCategoryDisplayName(weakness.category)} 집중 개선`,
      description: this.generateRecommendationDescription(weakness),
      targetWeakness: weakness.category,
      expectedBenefit: this.calculateExpectedBenefit(weakness),
      difficultyLevel: this.mapSeverityToDifficulty(weakness.severity),
      timeRequirement: timeAllocation,
      prerequisites: this.getPrerequisites(weakness.category, userLevel),
      resources: this.getRecommendedResources(weakness.category),
      metrics: this.getSuccessMetrics(weakness.category),
      timeline: this.generateTimeline(weakness.severity),
      actionPlan: this.generateActionPlan(weakness, timeAllocation)
    };
  }

  private createStrategicRecommendation(
    weaknesses: WeaknessCategory[],
    userLevel: string,
    availableTime: number
  ): PriorityRecommendation | null {
    if (weaknesses.length === 0) return null;

    const recommendationId = `rec_strategic_${Date.now()}`;

    return {
      recommendationId,
      title: '전체적인 학습 전략 최적화',
      description: '식별된 약점들을 종합적으로 개선하기 위한 맞춤형 학습 계획',
      targetWeakness: 'overall',
      expectedBenefit: 0.4,
      difficultyLevel: 0.6,
      timeRequirement: availableTime * 0.2,
      prerequisites: ['기본 학습 습관 형성'],
      resources: ['통합 학습 계획', '진도 추적 도구', '정기 평가'],
      metrics: ['전체 정확도', '학습 일관성', '진도율'],
      timeline: '4-6주',
      actionPlan: this.generateStrategicActionPlan(weaknesses, availableTime)
    };
  }

  // === 비교 분석 메서드들 ===
  private generatePeerComparison(
    sessions: LearningSession[],
    metrics: PerformanceMetrics[],
    userLevel: string
  ): ComparativeAnalysis['peerComparison'] {
    // 시뮬레이션된 동료 비교 데이터
    const userAccuracy = this.calculateOverallAccuracy(sessions);

    return {
      userPercentile: Math.max(10, Math.min(90, userAccuracy * 100 + Math.random() * 20 - 10)),
      averagePerformance: 0.75,
      areasAboveAverage: this.identifyAboveAverageAreas(sessions),
      areasBelowAverage: this.identifyBelowAverageAreas(sessions),
      cohortSize: 150,
      anonymizedBenchmarks: {
        'vocabulary': 0.78,
        'pronunciation': 0.72,
        'grammar': 0.76,
        'overall': 0.75
      }
    };
  }

  private analyzeCEFRAlignment(
    sessions: LearningSession[],
    metrics: PerformanceMetrics[],
    userLevel: string
  ): ComparativeAnalysis['cefrAlignment'] {
    const overallAccuracy = this.calculateOverallAccuracy(sessions);

    return {
      currentLevel: userLevel,
      levelProgress: Math.min(0.95, overallAccuracy * 1.2),
      blockingSkills: this.identifyBlockingSkills(sessions, userLevel),
      advancementRequirements: this.getAdvancementRequirements(userLevel),
      levelCharacteristics: this.getLevelCharacteristics(userLevel),
      gapAnalysis: this.performGapAnalysis(sessions, userLevel)
    };
  }

  private generatePersonalBestComparison(
    sessions: LearningSession[],
    metrics: PerformanceMetrics[]
  ): ComparativeAnalysis['personalBestComparison'] {
    return {
      allTimeBests: this.calculateAllTimeBests(sessions),
      recentBests: this.calculateRecentBests(sessions),
      improvementAreas: this.identifyImprovementAreas(sessions),
      consistencyMetrics: this.calculateConsistencyMetrics(sessions)
    };
  }

  // === 유틸리티 메서드들 ===
  private getCategoryDisplayName(category: string): string {
    const names = {
      vocabulary: '어휘',
      pronunciation: '발음',
      grammar: '문법',
      fluency: '유창성'
    };
    return names[category as keyof typeof names] || category;
  }

  private generateRecommendationDescription(weakness: WeaknessCategory): string {
    const categoryName = this.getCategoryDisplayName(weakness.category);
    return `${categoryName} 영역의 약점을 집중적으로 개선하여 전반적인 헝가리어 실력을 향상시킵니다.`;
  }

  private calculateExpectedBenefit(weakness: WeaknessCategory): number {
    return Math.min(0.8, weakness.impactOnOverallProgress * 1.5);
  }

  private mapSeverityToDifficulty(severity: string): number {
    switch (severity) {
      case 'critical': return 0.9;
      case 'high': return 0.7;
      case 'medium': return 0.5;
      case 'low': return 0.3;
      default: return 0.5;
    }
  }

  private getPrerequisites(category: string, userLevel: string): string[] {
    const prerequisites: Record<string, string[]> = {
      vocabulary: ['기본 알파벳', '음성 체계 이해'],
      pronunciation: ['기본 어휘 50개 이상', '듣기 경험'],
      grammar: ['기본 어순 이해', '주요 품사 구분'],
      fluency: ['어휘 200개 이상', '기본 문법 이해']
    };

    return prerequisites[category] || [];
  }

  private getRecommendedResources(category: string): string[] {
    const resources: Record<string, string[]> = {
      vocabulary: ['Anki 플래시카드', '헝가리어-한국어 사전', '기초 어휘집'],
      pronunciation: ['Forvo 발음 사전', '헝가리어 음성학 가이드', 'IPA 차트'],
      grammar: ['헝가리어 문법서', '연습 문제집', '온라인 문법 가이드'],
      fluency: ['대화 연습 앱', '속독 연습 자료', '구어체 표현집']
    };

    return resources[category] || [];
  }

  private getSuccessMetrics(category: string): string[] {
    const metrics: Record<string, string[]> = {
      vocabulary: ['정확도 85% 이상', '응답 속도 2초 이내', '복습 정확도 90%'],
      pronunciation: ['정확도 80% 이상', '자신감 점수 0.8 이상', '원어민 평가 B등급'],
      grammar: ['정확도 85% 이상', '복잡도 처리 능력 향상', '실수 빈도 감소'],
      fluency: ['응답 시간 3초 이내', '주저 빈도 감소', '자연스러운 표현 증가']
    };

    return metrics[category] || [];
  }

  private generateTimeline(severity: string): string {
    switch (severity) {
      case 'critical': return '2-3주';
      case 'high': return '3-4주';
      case 'medium': return '4-6주';
      case 'low': return '6-8주';
      default: return '4주';
    }
  }

  private generateActionPlan(
    weakness: WeaknessCategory,
    timeAllocation: number
  ): PriorityRecommendation['actionPlan'] {
    return {
      immediateActions: [
        {
          action: `${this.getCategoryDisplayName(weakness.category)} 진단 테스트 실시`,
          timeframe: '1일',
          resources: ['진단 도구', '평가 시트'],
          expectedOutcome: '정확한 약점 파악'
        },
        {
          action: '맞춤형 학습 계획 수립',
          timeframe: '2-3일',
          resources: ['학습 플래너', '목표 설정 가이드'],
          expectedOutcome: '체계적 학습 계획 완성'
        }
      ],
      weeklyGoals: [
        {
          goal: '약점 영역 집중 학습',
          metrics: ['일일 학습 시간', '정확도', '복습 횟수'],
          targetValue: 0.15 // 15% 개선
        }
      ],
      monthlyMilestones: [
        {
          milestone: '약점 영역 정확도 85% 달성',
          criteria: ['지속적 정확도 유지', '실전 적용 성공'],
          rewards: ['다음 단계 학습 권한', '성취 배지 획득']
        }
      ]
    };
  }

  private generateStrategicActionPlan(
    weaknesses: WeaknessCategory[],
    availableTime: number
  ): PriorityRecommendation['actionPlan'] {
    return {
      immediateActions: [
        {
          action: '전체 학습 계획 재검토',
          timeframe: '2-3일',
          resources: ['학습 분석 보고서', '목표 재설정 가이드'],
          expectedOutcome: '최적화된 학습 전략 수립'
        }
      ],
      weeklyGoals: [
        {
          goal: '균형 잡힌 스킬 개발',
          metrics: ['각 영역별 학습 시간', '전체 정확도', '일관성 점수'],
          targetValue: 0.2
        }
      ],
      monthlyMilestones: [
        {
          milestone: '전체적인 실력 향상 달성',
          criteria: ['모든 영역 정확도 80% 이상', '지속적 학습 패턴 유지'],
          rewards: ['상급 학습 과정 진입', '특별 성취 인증']
        }
      ]
    };
  }

  // 추가적인 계산 메서드들 (간단한 구현)
  private calculateOverallAccuracy(sessions: LearningSession[]): number {
    const totalAttempts = sessions.reduce((sum, s) => sum + s.totalAttempts, 0);
    const correctAnswers = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    return totalAttempts > 0 ? correctAnswers / totalAttempts : 0;
  }

  private identifyAboveAverageAreas(sessions: LearningSession[]): string[] {
    // 간단한 구현
    return ['기본 어휘', '듣기 이해'];
  }

  private identifyBelowAverageAreas(sessions: LearningSession[]): string[] {
    return ['고급 문법', '발음 정확도'];
  }

  private identifyBlockingSkills(sessions: LearningSession[], level: string): string[] {
    switch (level) {
      case 'A1': return ['기본 어휘', '발음'];
      case 'A2': return ['문법 기초', '문장 구성'];
      case 'B1': return ['복합 문법', '유창성'];
      default: return ['전반적 숙련도'];
    }
  }

  private getAdvancementRequirements(level: string): string[] {
    switch (level) {
      case 'A1': return ['어휘 300개 이상', '기본 문법 숙달', '발음 정확도 80%'];
      case 'A2': return ['어휘 600개 이상', '중급 문법 이해', '대화 능력'];
      default: return ['지속적 연습', '실전 적용'];
    }
  }

  private getLevelCharacteristics(level: string): string[] {
    switch (level) {
      case 'A1': return ['기초 어휘', '간단한 문장', '현재시제 위주'];
      case 'A2': return ['일상 표현', '과거/미래시제', '기본 대화'];
      default: return ['일반적 특성'];
    }
  }

  private performGapAnalysis(sessions: LearningSession[], level: string): Record<string, number> {
    return {
      vocabulary: 0.8,
      pronunciation: 0.6,
      grammar: 0.7,
      listening: 0.75,
      speaking: 0.65
    };
  }

  private calculateAllTimeBests(sessions: LearningSession[]): Record<string, { value: number; date: string }> {
    return {
      'daily_accuracy': { value: 0.95, date: '2024-03-15' },
      'session_duration': { value: 45, date: '2024-03-10' },
      'words_learned': { value: 25, date: '2024-03-12' }
    };
  }

  private calculateRecentBests(sessions: LearningSession[]): Record<string, { value: number; date: string }> {
    return {
      'recent_accuracy': { value: 0.88, date: '2024-03-20' },
      'recent_consistency': { value: 0.92, date: '2024-03-18' }
    };
  }

  private identifyImprovementAreas(sessions: LearningSession[]): string[] {
    return ['문법 정확도', '응답 속도', '어휘 다양성'];
  }

  private calculateConsistencyMetrics(sessions: LearningSession[]): Record<string, number> {
    return {
      'study_frequency': 0.85,
      'performance_stability': 0.78,
      'engagement_level': 0.82
    };
  }
}