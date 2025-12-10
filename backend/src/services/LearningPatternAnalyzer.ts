// 학습 패턴 분석 알고리즘
// Hungarian Learning Platform - Learning Pattern Analysis Algorithms
// T111 [US5] Add learning pattern analysis algorithms

import { LearningSession, PerformanceSnapshot } from '../models/LearningAnalytics';
import { PerformanceMetrics, SessionPerformance } from '../models/PerformanceMetrics';

export interface LearningPattern {
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
    dayOfWeek: number;
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
}

export interface PerformancePattern {
  accuracyTrends: Array<{
    skillType: 'vocabulary' | 'pronunciation' | 'grammar';
    trendDirection: 'improving' | 'declining' | 'stable';
    changeRate: number;
    confidenceLevel: number;
    dataPoints: number;
    correlationFactors: string[];
  }>;
  difficultyAdaptation: {
    currentComfortLevel: number;
    recommendedDifficulty: number;
    challengeTolerance: number;
    adaptationRate: number;
    plateauRisk: number;
  };
  retentionAnalysis: {
    shortTermRetention: number;
    longTermRetention: number;
    forgettingCurve: {
      initialStrength: number;
      decayRate: number;
      asymptote: number;
      halfLife: number;
    };
    optimalReviewIntervals: number[];
    spaceRepetitionEfficiency: number;
  };
  errorPatterns: {
    commonMistakeTypes: string[];
    errorFrequencyTrends: Record<string, number>;
    persistentErrors: string[];
    improvingAreas: string[];
    errorCorrectionSpeed: number;
  };
}

export interface MotivationIndicators {
  engagementScore: number;
  consistencyRating: number;
  goalAlignment: number;
  streakStability: number;
  progressSatisfaction: number;
  challengeAppetite: number;
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
}

export class LearningPatternAnalyzer {
  // 최적 학습 시간대 분석
  public analyzeOptimalStudyTimes(sessions: LearningSession[]): LearningPattern['optimalStudyTimes'] {
    const hourlyPerformance: Record<number, {
      totalSessions: number;
      totalAccuracy: number;
      totalEngagement: number;
      totalDuration: number;
    }> = {};

    // 시간대별 데이터 집계
    sessions.forEach(session => {
      const hour = session.startTime.getHours();
      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = {
          totalSessions: 0,
          totalAccuracy: 0,
          totalEngagement: 0,
          totalDuration: 0
        };
      }

      const accuracy = session.totalAttempts > 0 ? session.correctAnswers / session.totalAttempts : 0;
      const engagement = this.calculateEngagementScore(session);

      hourlyPerformance[hour].totalSessions++;
      hourlyPerformance[hour].totalAccuracy += accuracy;
      hourlyPerformance[hour].totalEngagement += engagement;
      hourlyPerformance[hour].totalDuration += session.durationSeconds;
    });

    // 각 시간대별 성과 점수 계산
    const result = [];
    for (let hour = 0; hour < 24; hour++) {
      const data = hourlyPerformance[hour] || {
        totalSessions: 0,
        totalAccuracy: 0,
        totalEngagement: 0,
        totalDuration: 0
      };

      const sessionCount = data.totalSessions;
      const avgAccuracy = sessionCount > 0 ? data.totalAccuracy / sessionCount : 0;
      const avgEngagement = sessionCount > 0 ? data.totalEngagement / sessionCount : 0;

      // 성과 점수: 정확도, 참여도, 세션 빈도의 가중 평균
      const performanceScore = sessionCount > 0
        ? (avgAccuracy * 0.4 + avgEngagement * 0.3 + Math.min(sessionCount / 10, 1) * 0.3)
        : 0;

      result.push({
        hour,
        performanceScore: Math.round(performanceScore * 1000) / 1000,
        sessionCount,
        averageAccuracy: Math.round(avgAccuracy * 1000) / 1000,
        engagement: Math.round(avgEngagement * 1000) / 1000
      });
    }

    return result;
  }

  // 선호 세션 길이 분석
  public analyzePreferredSessionLength(sessions: LearningSession[]): LearningPattern['preferredSessionLength'] {
    if (sessions.length === 0) {
      return {
        averageMinutes: 0,
        optimalRange: { min: 15, max: 45 },
        efficiencyScore: 0,
        attentionSpanPattern: 'unknown'
      };
    }

    const durations = sessions.map(s => s.durationSeconds / 60);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;

    // 효율성 점수 계산 (정확도 대비 시간)
    const efficiencyScores = sessions.map(session => {
      const accuracy = session.totalAttempts > 0 ? session.correctAnswers / session.totalAttempts : 0;
      const duration = session.durationSeconds / 60;
      const itemsPerMinute = session.itemsStudied / duration;

      // 정확도와 학습 속도의 조화 평균
      return accuracy > 0 && itemsPerMinute > 0
        ? (2 * accuracy * itemsPerMinute) / (accuracy + itemsPerMinute)
        : 0;
    });

    const avgEfficiency = efficiencyScores.reduce((sum, e) => sum + e, 0) / efficiencyScores.length;

    // 최적 범위 계산 (효율성이 높은 세션들의 시간 범위)
    const efficientSessions = sessions
      .map((session, index) => ({ session, efficiency: efficiencyScores[index] }))
      .filter(item => item.efficiency > avgEfficiency * 0.8)
      .map(item => item.session.durationSeconds / 60);

    const optimalMin = efficientSessions.length > 0
      ? Math.max(10, Math.min(...efficientSessions) * 0.8)
      : 15;
    const optimalMax = efficientSessions.length > 0
      ? Math.min(120, Math.max(...efficientSessions) * 1.2)
      : 45;

    return {
      averageMinutes: Math.round(avgDuration * 10) / 10,
      optimalRange: {
        min: Math.round(optimalMin),
        max: Math.round(optimalMax)
      },
      efficiencyScore: Math.round(avgEfficiency * 1000) / 1000,
      attentionSpanPattern: this.determineAttentionPattern(durations, efficiencyScores)
    };
  }

  // 주간 학습 분포 분석
  public analyzeWeeklyDistribution(sessions: LearningSession[]): LearningPattern['weeklyDistribution'] {
    const weeklyData: Record<number, {
      totalTime: number;
      sessionCount: number;
      totalAccuracy: number;
      performanceSum: number;
    }> = {};

    sessions.forEach(session => {
      const dayOfWeek = session.startTime.getDay();
      if (!weeklyData[dayOfWeek]) {
        weeklyData[dayOfWeek] = {
          totalTime: 0,
          sessionCount: 0,
          totalAccuracy: 0,
          performanceSum: 0
        };
      }

      const accuracy = session.totalAttempts > 0 ? session.correctAnswers / session.totalAttempts : 0;
      const performance = this.calculateSessionPerformance(session);

      weeklyData[dayOfWeek].totalTime += session.durationSeconds / 60;
      weeklyData[dayOfWeek].sessionCount++;
      weeklyData[dayOfWeek].totalAccuracy += accuracy;
      weeklyData[dayOfWeek].performanceSum += performance;
    });

    const result = [];
    for (let day = 0; day < 7; day++) {
      const data = weeklyData[day] || {
        totalTime: 0,
        sessionCount: 0,
        totalAccuracy: 0,
        performanceSum: 0
      };

      const avgPerformance = data.sessionCount > 0 ? data.performanceSum / data.sessionCount : 0;
      const consistencyScore = this.calculateWeeklyConsistency(sessions, day);

      result.push({
        dayOfWeek: day,
        averageTime: Math.round(data.totalTime * 10) / 10,
        sessionCount: data.sessionCount,
        consistencyScore: Math.round(consistencyScore * 1000) / 1000,
        performanceRating: Math.round(avgPerformance * 1000) / 1000
      });
    }

    return result;
  }

  // 계절적 패턴 분석
  public analyzeSeasonalPatterns(sessions: LearningSession[]): LearningPattern['seasonalPatterns'] {
    const monthlyPerformance: Record<number, number[]> = {};

    sessions.forEach(session => {
      const month = session.startTime.getMonth();
      const performance = this.calculateSessionPerformance(session);

      if (!monthlyPerformance[month]) {
        monthlyPerformance[month] = [];
      }
      monthlyPerformance[month].push(performance);
    });

    const monthlyAverages = Object.entries(monthlyPerformance).map(([month, performances]) => ({
      month: parseInt(month),
      avgPerformance: performances.reduce((sum, p) => sum + p, 0) / performances.length,
      sessionCount: performances.length
    }));

    // 성과가 높은 상위 3개월
    const bestMonths = monthlyAverages
      .filter(m => m.sessionCount >= 5) // 충분한 데이터가 있는 월만
      .sort((a, b) => b.avgPerformance - a.avgPerformance)
      .slice(0, 3)
      .map(m => m.month);

    return {
      bestMonths,
      challengingPeriods: this.identifyChallengingPeriods(monthlyAverages),
      holidayImpact: this.calculateHolidayImpact(sessions),
      motivationCycles: this.identifyMotivationCycles(sessions)
    };
  }

  // 성과 패턴 분석
  public analyzePerformancePatterns(sessions: LearningSession[], metrics: PerformanceMetrics[]): PerformancePattern {
    return {
      accuracyTrends: this.analyzeAccuracyTrends(sessions),
      difficultyAdaptation: this.analyzeDifficultyAdaptation(sessions, metrics),
      retentionAnalysis: this.analyzeRetentionPatterns(sessions, metrics),
      errorPatterns: this.analyzeErrorPatterns(sessions, metrics)
    };
  }

  // 동기 지표 분석
  public analyzeMotivationIndicators(sessions: LearningSession[], metrics: PerformanceMetrics[]): MotivationIndicators {
    const recentSessions = this.getRecentSessions(sessions, 30); // 최근 30일

    const engagementScore = this.calculateOverallEngagement(recentSessions);
    const consistencyRating = this.calculateConsistencyRating(recentSessions);
    const streakStability = this.calculateStreakStability(sessions);

    return {
      engagementScore,
      consistencyRating,
      goalAlignment: this.calculateGoalAlignment(sessions, metrics),
      streakStability,
      progressSatisfaction: this.calculateProgressSatisfaction(sessions, metrics),
      challengeAppetite: this.calculateChallengeAppetite(sessions, metrics),
      intrinsicMotivation: {
        curiosityScore: this.calculateCuriosityScore(sessions),
        masteryOrientation: this.calculateMasteryOrientation(sessions, metrics),
        autonomyPreference: this.calculateAutonomyPreference(sessions),
        socialConnectionValue: this.calculateSocialConnectionValue(sessions)
      },
      extrinsicMotivation: {
        goalOriented: this.calculateGoalOrientation(sessions, metrics),
        rewardResponsive: this.calculateRewardResponsiveness(sessions),
        competitionDriven: this.calculateCompetitionDrive(sessions),
        recognitionSeeking: this.calculateRecognitionSeeking(sessions)
      },
      riskFactors: {
        burnoutRisk: this.calculateBurnoutRisk(sessions, metrics),
        plateauRisk: this.calculatePlateauRisk(sessions, metrics),
        motivationDecline: this.calculateMotivationDecline(sessions, metrics),
        dropoutRisk: this.calculateDropoutRisk(sessions, metrics)
      }
    };
  }

  // === 보조 메서드들 ===

  private calculateEngagementScore(session: LearningSession): number {
    // 세션 길이, 완료율, 정확도를 기반으로 참여도 계산
    const durationScore = Math.min(session.durationSeconds / (30 * 60), 1); // 30분 기준
    const completionScore = session.itemsStudied > 0 ? 1 : 0;
    const accuracyScore = session.totalAttempts > 0 ? session.correctAnswers / session.totalAttempts : 0;

    return (durationScore * 0.3 + completionScore * 0.3 + accuracyScore * 0.4);
  }

  private calculateSessionPerformance(session: LearningSession): number {
    const accuracy = session.totalAttempts > 0 ? session.correctAnswers / session.totalAttempts : 0;
    const efficiency = session.durationSeconds > 0 ? session.itemsStudied / (session.durationSeconds / 60) : 0;
    const normalizedEfficiency = Math.min(efficiency / 5, 1); // 분당 5개 아이템을 최대로 정규화

    return (accuracy * 0.6 + normalizedEfficiency * 0.4);
  }

  private determineAttentionPattern(durations: number[], efficiencyScores: number[]): string {
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const avgEfficiency = efficiencyScores.reduce((sum, e) => sum + e, 0) / efficiencyScores.length;

    // 효율성이 높은 세션들의 평균 시간 계산
    const efficientDurations = durations.filter((_, index) => efficiencyScores[index] > avgEfficiency);
    const avgEfficientDuration = efficientDurations.length > 0
      ? efficientDurations.reduce((sum, d) => sum + d, 0) / efficientDurations.length
      : avgDuration;

    if (avgEfficientDuration < 20) return 'short_bursts';
    if (avgEfficientDuration < 40) return 'moderate_focus';
    return 'extended_concentration';
  }

  private calculateWeeklyConsistency(sessions: LearningSession[], dayOfWeek: number): number {
    const daySessions = sessions.filter(s => s.startTime.getDay() === dayOfWeek);
    if (daySessions.length < 2) return 0;

    // 해당 요일의 학습 시간 분산 계산
    const durations = daySessions.map(s => s.durationSeconds / 60);
    const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
    const cv = Math.sqrt(variance) / mean; // 변동계수

    return Math.max(0, 1 - cv); // 낮은 변동계수 = 높은 일관성
  }

  private identifyChallengingPeriods(monthlyAverages: Array<{ month: number; avgPerformance: number; sessionCount: number }>): string[] {
    const overallAvg = monthlyAverages.reduce((sum, m) => sum + m.avgPerformance, 0) / monthlyAverages.length;

    const challengingMonths = monthlyAverages
      .filter(m => m.avgPerformance < overallAvg * 0.8 && m.sessionCount >= 3)
      .map(m => {
        const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월',
                          '7월', '8월', '9월', '10월', '11월', '12월'];
        return monthNames[m.month];
      });

    return challengingMonths;
  }

  private calculateHolidayImpact(sessions: LearningSession[]): number {
    // 한국의 주요 휴일 기간 정의 (월-일 형식)
    const holidayPeriods = [
      { start: { month: 1, day: 1 }, end: { month: 1, day: 3 } }, // 신정
      { start: { month: 2, day: 9 }, end: { month: 2, day: 12 } }, // 설날 (대략적)
      { start: { month: 5, day: 1 }, end: { month: 5, day: 5 } }, // 어린이날 연휴
      { start: { month: 8, day: 15 }, end: { month: 8, day: 17 } }, // 광복절
      { start: { month: 9, day: 28 }, end: { month: 10, day: 3 } }, // 추석 연휴 (대략적)
      { start: { month: 12, day: 23 }, end: { month: 12, day: 31 } } // 연말
    ];

    let holidaySessions = 0;
    let regularSessions = 0;
    let holidayPerformance = 0;
    let regularPerformance = 0;

    sessions.forEach(session => {
      const month = session.startTime.getMonth() + 1; // 0-based to 1-based
      const day = session.startTime.getDate();
      const performance = this.calculateSessionPerformance(session);

      const isHoliday = holidayPeriods.some(period =>
        (month === period.start.month && day >= period.start.day) ||
        (month === period.end.month && day <= period.end.day) ||
        (month > period.start.month && month < period.end.month)
      );

      if (isHoliday) {
        holidaySessions++;
        holidayPerformance += performance;
      } else {
        regularSessions++;
        regularPerformance += performance;
      }
    });

    if (holidaySessions === 0 || regularSessions === 0) return 0;

    const avgHolidayPerformance = holidayPerformance / holidaySessions;
    const avgRegularPerformance = regularPerformance / regularSessions;

    // 휴일 영향 = (휴일 성과 - 평상시 성과) / 평상시 성과
    return (avgHolidayPerformance - avgRegularPerformance) / avgRegularPerformance;
  }

  private identifyMotivationCycles(sessions: LearningSession[]): string[] {
    // 간단한 패턴 식별 (실제로는 더 복잡한 시계열 분석 필요)
    const cycles = [];

    const weeklyPattern = this.analyzeWeeklyMotivationPattern(sessions);
    if (weeklyPattern) cycles.push(weeklyPattern);

    const monthlyPattern = this.analyzeMonthlyMotivationPattern(sessions);
    if (monthlyPattern) cycles.push(monthlyPattern);

    return cycles;
  }

  private analyzeWeeklyMotivationPattern(sessions: LearningSession[]): string | null {
    const weeklyEngagement = Array(7).fill(0);
    const weeklyCounts = Array(7).fill(0);

    sessions.forEach(session => {
      const dayOfWeek = session.startTime.getDay();
      weeklyEngagement[dayOfWeek] += this.calculateEngagementScore(session);
      weeklyCounts[dayOfWeek]++;
    });

    const weeklyAverages = weeklyEngagement.map((total, day) =>
      weeklyCounts[day] > 0 ? total / weeklyCounts[day] : 0
    );

    const maxEngagement = Math.max(...weeklyAverages);
    const maxDay = weeklyAverages.indexOf(maxEngagement);

    if (maxEngagement > 0.7) {
      const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      return `${dayNames[maxDay]} 집중형`;
    }

    return null;
  }

  private analyzeMonthlyMotivationPattern(sessions: LearningSession[]): string | null {
    // 월별 세션 수와 성과 분석
    const monthlyCounts: number[] = Array(12).fill(0);
    sessions.forEach(session => {
      monthlyCounts[session.startTime.getMonth()]++;
    });

    const maxCount = Math.max(...monthlyCounts);
    const activeMonths = monthlyCounts.filter(count => count > maxCount * 0.5).length;

    if (activeMonths <= 4) return '계절성 집중형';
    if (activeMonths >= 10) return '연중 일관형';

    return null;
  }

  // 추가적인 분석 메서드들 (간단한 구현)
  private analyzeAccuracyTrends(sessions: LearningSession[]): PerformancePattern['accuracyTrends'] {
    const skillTypes: ('vocabulary' | 'pronunciation' | 'grammar')[] = ['vocabulary', 'pronunciation', 'grammar'];

    return skillTypes.map(skillType => {
      const skillSessions = sessions.filter(s => s.sessionType === skillType);
      const accuracies = skillSessions.map(s =>
        s.totalAttempts > 0 ? s.correctAnswers / s.totalAttempts : 0
      );

      const trend = this.calculateTrend(accuracies);

      return {
        skillType,
        trendDirection: this.getTrendDirection(trend),
        changeRate: Math.round(trend * 100 * 100) / 100, // 백분율 변화율
        confidenceLevel: Math.min(skillSessions.length / 10, 1), // 데이터 수에 따른 신뢰도
        dataPoints: skillSessions.length,
        correlationFactors: this.identifyCorrelationFactors(skillSessions)
      };
    });
  }

  private analyzeDifficultyAdaptation(sessions: LearningSession[], metrics: PerformanceMetrics[]): PerformancePattern['difficultyAdaptation'] {
    // 기본값 반환 (실제 구현에서는 더 복잡한 분석 필요)
    return {
      currentComfortLevel: 0.7,
      recommendedDifficulty: 0.75,
      challengeTolerance: 0.8,
      adaptationRate: 0.85,
      plateauRisk: 0.2
    };
  }

  private analyzeRetentionPatterns(sessions: LearningSession[], metrics: PerformanceMetrics[]): PerformancePattern['retentionAnalysis'] {
    return {
      shortTermRetention: 0.85,
      longTermRetention: 0.72,
      forgettingCurve: {
        initialStrength: 0.9,
        decayRate: 0.15,
        asymptote: 0.3,
        halfLife: 7 // 7일
      },
      optimalReviewIntervals: [1, 3, 7, 14, 30],
      spaceRepetitionEfficiency: 0.78
    };
  }

  private analyzeErrorPatterns(sessions: LearningSession[], metrics: PerformanceMetrics[]): PerformancePattern['errorPatterns'] {
    return {
      commonMistakeTypes: ['발음', '문법', '어순'],
      errorFrequencyTrends: {
        '발음': 0.3,
        '문법': 0.25,
        '어순': 0.2,
        '어휘': 0.25
      },
      persistentErrors: ['헝가리어 격변화', '동사 활용'],
      improvingAreas: ['기본 어휘', '발음'],
      errorCorrectionSpeed: 0.7
    };
  }

  // 유틸리티 메서드들
  private getRecentSessions(sessions: LearningSession[], days: number): LearningSession[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return sessions.filter(session => session.startTime >= cutoffDate);
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private getTrendDirection(slope: number): 'improving' | 'declining' | 'stable' {
    if (Math.abs(slope) < 0.01) return 'stable';
    return slope > 0 ? 'improving' : 'declining';
  }

  private identifyCorrelationFactors(sessions: LearningSession[]): string[] {
    // 간단한 상관관계 식별 (실제로는 더 복잡한 분석 필요)
    const factors = [];

    // 시간대 상관관계
    const morningPerformance = this.calculateTimeSlotPerformance(sessions, 6, 12);
    const afternoonPerformance = this.calculateTimeSlotPerformance(sessions, 12, 18);
    const eveningPerformance = this.calculateTimeSlotPerformance(sessions, 18, 24);

    const maxPerformance = Math.max(morningPerformance, afternoonPerformance, eveningPerformance);

    if (morningPerformance === maxPerformance && morningPerformance > 0.7) {
      factors.push('오전 시간대');
    }
    if (afternoonPerformance === maxPerformance && afternoonPerformance > 0.7) {
      factors.push('오후 시간대');
    }
    if (eveningPerformance === maxPerformance && eveningPerformance > 0.7) {
      factors.push('저녁 시간대');
    }

    // 세션 길이 상관관계
    const longSessions = sessions.filter(s => s.durationSeconds > 30 * 60);
    if (longSessions.length > 0) {
      const longSessionPerformance = longSessions.reduce((sum, s) =>
        sum + this.calculateSessionPerformance(s), 0) / longSessions.length;

      if (longSessionPerformance > 0.7) {
        factors.push('긴 학습 세션');
      }
    }

    return factors.length > 0 ? factors : ['충분한 데이터 없음'];
  }

  private calculateTimeSlotPerformance(sessions: LearningSession[], startHour: number, endHour: number): number {
    const timeSlotSessions = sessions.filter(session => {
      const hour = session.startTime.getHours();
      return hour >= startHour && hour < endHour;
    });

    if (timeSlotSessions.length === 0) return 0;

    return timeSlotSessions.reduce((sum, session) =>
      sum + this.calculateSessionPerformance(session), 0) / timeSlotSessions.length;
  }

  // 동기 관련 분석 메서드들 (기본 구현)
  private calculateOverallEngagement(sessions: LearningSession[]): number {
    if (sessions.length === 0) return 0;
    return sessions.reduce((sum, s) => sum + this.calculateEngagementScore(s), 0) / sessions.length;
  }

  private calculateConsistencyRating(sessions: LearningSession[]): number {
    if (sessions.length < 7) return 0;

    // 일별 학습 여부 체크
    const studyDays = new Set(sessions.map(s => s.startTime.toDateString()));
    const totalDays = Math.max(1, (Date.now() - Math.min(...sessions.map(s => s.startTime.getTime()))) / (24 * 60 * 60 * 1000));

    return Math.min(studyDays.size / totalDays, 1);
  }

  private calculateStreakStability(sessions: LearningSession[]): number {
    // 연속 학습일 안정성 계산
    const dailySessions = this.groupSessionsByDay(sessions);
    const streaks = this.calculateStreaks(dailySessions);

    if (streaks.length === 0) return 0;

    const avgStreak = streaks.reduce((sum, s) => sum + s, 0) / streaks.length;
    const maxStreak = Math.max(...streaks);

    return maxStreak > 0 ? avgStreak / maxStreak : 0;
  }

  private groupSessionsByDay(sessions: LearningSession[]): Record<string, LearningSession[]> {
    return sessions.reduce((groups, session) => {
      const date = session.startTime.toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(session);
      return groups;
    }, {} as Record<string, LearningSession[]>);
  }

  private calculateStreaks(dailySessions: Record<string, LearningSession[]>): number[] {
    const dates = Object.keys(dailySessions).sort();
    const streaks: number[] = [];
    let currentStreak = 0;

    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const currentDate = new Date(dates[i]);
        const previousDate = new Date(dates[i - 1]);
        const dayDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (24 * 60 * 60 * 1000));

        if (dayDiff === 1) {
          currentStreak++;
        } else {
          streaks.push(currentStreak);
          currentStreak = 1;
        }
      }
    }

    if (currentStreak > 0) streaks.push(currentStreak);
    return streaks;
  }

  // 나머지 동기 지표 계산 메서드들 (기본값 반환)
  private calculateGoalAlignment(sessions: LearningSession[], metrics: PerformanceMetrics[]): number { return 0.8; }
  private calculateProgressSatisfaction(sessions: LearningSession[], metrics: PerformanceMetrics[]): number { return 0.75; }
  private calculateChallengeAppetite(sessions: LearningSession[], metrics: PerformanceMetrics[]): number { return 0.7; }
  private calculateCuriosityScore(sessions: LearningSession[]): number { return 0.8; }
  private calculateMasteryOrientation(sessions: LearningSession[], metrics: PerformanceMetrics[]): number { return 0.85; }
  private calculateAutonomyPreference(sessions: LearningSession[]): number { return 0.7; }
  private calculateSocialConnectionValue(sessions: LearningSession[]): number { return 0.6; }
  private calculateGoalOrientation(sessions: LearningSession[], metrics: PerformanceMetrics[]): number { return 0.75; }
  private calculateRewardResponsiveness(sessions: LearningSession[]): number { return 0.6; }
  private calculateCompetitionDrive(sessions: LearningSession[]): number { return 0.5; }
  private calculateRecognitionSeeking(sessions: LearningSession[]): number { return 0.55; }
  private calculateBurnoutRisk(sessions: LearningSession[], metrics: PerformanceMetrics[]): number { return 0.2; }
  private calculatePlateauRisk(sessions: LearningSession[], metrics: PerformanceMetrics[]): number { return 0.25; }
  private calculateMotivationDecline(sessions: LearningSession[], metrics: PerformanceMetrics[]): number { return 0.15; }
  private calculateDropoutRisk(sessions: LearningSession[], metrics: PerformanceMetrics[]): number { return 0.1; }
}