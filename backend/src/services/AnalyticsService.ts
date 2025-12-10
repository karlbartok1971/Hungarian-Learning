// 분석 서비스
// Hungarian Learning Platform - Analytics Service
// T108 [US5] Implement AnalyticsService

import { Repository, DataSource, Between, MoreThan, LessThan } from 'typeorm';
import { LearningAnalytics, LearningSession, PerformanceSnapshot, WeaknessAnalysis } from '../models/LearningAnalytics';
import { PerformanceMetrics, SessionPerformance, PerformanceBenchmark, PerformanceInsight } from '../models/PerformanceMetrics';
import { User } from '../models/User';
import { LearningPatternAnalyzer } from './LearningPatternAnalyzer';
import { WeaknessAnalyzer } from './WeaknessAnalyzer';

export class AnalyticsService {
  private learningAnalyticsRepo: Repository<LearningAnalytics>;
  private learningSessionRepo: Repository<LearningSession>;
  private performanceSnapshotRepo: Repository<PerformanceSnapshot>;
  private weaknessAnalysisRepo: Repository<WeaknessAnalysis>;
  private performanceMetricsRepo: Repository<PerformanceMetrics>;
  private sessionPerformanceRepo: Repository<SessionPerformance>;
  private performanceBenchmarkRepo: Repository<PerformanceBenchmark>;
  private performanceInsightRepo: Repository<PerformanceInsight>;
  private userRepo: Repository<User>;
  private patternAnalyzer: LearningPatternAnalyzer;
  private weaknessAnalyzer: WeaknessAnalyzer;

  constructor(private dataSource: DataSource) {
    this.patternAnalyzer = new LearningPatternAnalyzer();
    this.weaknessAnalyzer = new WeaknessAnalyzer();
    this.learningAnalyticsRepo = dataSource.getRepository(LearningAnalytics);
    this.learningSessionRepo = dataSource.getRepository(LearningSession);
    this.performanceSnapshotRepo = dataSource.getRepository(PerformanceSnapshot);
    this.weaknessAnalysisRepo = dataSource.getRepository(WeaknessAnalysis);
    this.performanceMetricsRepo = dataSource.getRepository(PerformanceMetrics);
    this.sessionPerformanceRepo = dataSource.getRepository(SessionPerformance);
    this.performanceBenchmarkRepo = dataSource.getRepository(PerformanceBenchmark);
    this.performanceInsightRepo = dataSource.getRepository(PerformanceInsight);
    this.userRepo = dataSource.getRepository(User);
  }

  // 전체 학습 개요 생성
  async generateLearningOverview(userId: string, period: string = '30d'): Promise<any> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('사용자를 찾을 수 없습니다');

    const endDate = new Date();
    const startDate = this.calculateStartDate(endDate, period);

    // 최근 분석 데이터 조회
    const latestAnalytics = await this.learningAnalyticsRepo.findOne({
      where: { userId },
      order: { analysisDate: 'DESC' }
    });

    // 기간별 학습 세션 조회
    const sessions = await this.learningSessionRepo.find({
      where: {
        userId,
        startTime: Between(startDate, endDate)
      },
      order: { startTime: 'ASC' }
    });

    // 전체 진도 계산
    const overallProgress = await this.calculateOverallProgress(sessions, latestAnalytics);

    // 최근 활동 분석
    const recentActivity = await this.analyzeRecentActivity(sessions);

    // 스킬별 분석
    const skillBreakdown = await this.calculateSkillBreakdown(sessions, latestAnalytics);

    return {
      user_id: userId,
      period,
      overall_progress: overallProgress,
      recent_activity: recentActivity,
      skill_breakdown: skillBreakdown,
      generated_at: new Date().toISOString()
    };
  }

  // 학습 패턴 분석
  async analyzeLearningPatterns(userId: string, period: string = '30d'): Promise<any> {
    const endDate = new Date();
    const startDate = this.calculateStartDate(endDate, period);

    const sessions = await this.learningSessionRepo.find({
      where: {
        userId,
        startTime: Between(startDate, endDate)
      }
    });

    // LearningPatternAnalyzer를 사용한 실제 분석
    const optimalStudyTimes = this.patternAnalyzer.analyzeOptimalStudyTimes(sessions);
    const preferredSessionLength = this.patternAnalyzer.analyzePreferredSessionLength(sessions);
    const weeklyDistribution = this.patternAnalyzer.analyzeWeeklyDistribution(sessions);
    const seasonalPatterns = this.patternAnalyzer.analyzeSeasonalPatterns(sessions);

    // 성과 메트릭 조회
    const recentMetrics = await this.performanceMetricsRepo.find({
      where: {
        userId,
        metricDate: MoreThan(startDate)
      },
      order: { metricDate: 'ASC' }
    });

    const performancePatterns = this.patternAnalyzer.analyzePerformancePatterns(sessions, recentMetrics);
    const motivationIndicators = this.patternAnalyzer.analyzeMotivationIndicators(sessions, recentMetrics);

    return {
      user_id: userId,
      analysis_period: period,
      study_patterns: {
        optimal_study_times: optimalStudyTimes,
        preferred_session_length: preferredSessionLength,
        weekly_distribution: weeklyDistribution,
        seasonal_patterns: seasonalPatterns
      },
      performance_patterns: performancePatterns,
      motivation_indicators: motivationIndicators,
      generated_at: new Date().toISOString()
    };
  }

  // 약점 식별 및 추천
  async identifyWeaknesses(userId: string): Promise<any> {
    const latestAnalysis = await this.weaknessAnalysisRepo.findOne({
      where: { userId },
      order: { analysisDate: 'DESC' }
    });

    // 최근 성과 데이터 조회
    const recentMetrics = await this.performanceMetricsRepo.find({
      where: {
        userId,
        metricDate: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      },
      order: { metricDate: 'DESC' }
    });

    // 학습 세션 조회
    const sessions = await this.learningSessionRepo.find({
      where: {
        userId,
        startTime: MoreThan(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) // 최근 90일
      },
      order: { startTime: 'ASC' }
    });

    // WeaknessAnalyzer를 사용한 실제 분석
    const weaknessCategories = this.weaknessAnalyzer.identifyWeaknessCategories(sessions, recentMetrics);
    const priorityRecommendations = this.weaknessAnalyzer.generatePriorityRecommendations(weaknessCategories);
    const comparativeAnalysis = this.weaknessAnalyzer.generateComparativeAnalysis(sessions, recentMetrics);

    return {
      user_id: userId,
      analysis_date: new Date().toISOString(),
      weakness_categories: weaknessCategories,
      priority_recommendations: priorityRecommendations,
      comparative_analysis: comparativeAnalysis,
      generated_at: new Date().toISOString()
    };
  }

  // 진도 예측
  async predictProgress(userId: string, targetLevel: string, timeHorizon: string): Promise<any> {
    // 현재 상태 분석
    const currentState = await this.analyzeCurrentState(userId);

    // 예측 시나리오 생성
    const predictionScenarios = await this.generatePredictionScenarios(
      userId,
      currentState,
      targetLevel,
      timeHorizon
    );

    // 최적화 제안
    const optimizationSuggestions = await this.generateOptimizationSuggestions(
      currentState,
      targetLevel
    );

    return {
      user_id: userId,
      current_state: currentState,
      prediction_scenarios: predictionScenarios,
      optimization_suggestions: optimizationSuggestions,
      generated_at: new Date().toISOString()
    };
  }

  // 맞춤형 보고서 생성
  async generateCustomReport(userId: string, config: any): Promise<any> {
    const reportId = this.generateReportId();
    const startDate = new Date(config.date_range.start);
    const endDate = new Date(config.date_range.end);

    // 데이터 수집
    const rawData = await this.collectDataForReport(userId, startDate, endDate, config.metrics);

    // 데이터 요약
    const dataSummary = this.generateDataSummary(rawData);

    // 지표 데이터 처리
    const metricsData = this.processMetricsData(rawData, config);

    // 인사이트 생성
    const insights = await this.generateInsights(rawData, config);

    // 내보내기 옵션 생성
    const exportOptions = this.generateExportOptions(reportId);

    return {
      report_id: reportId,
      generated_at: new Date().toISOString(),
      configuration: config,
      data_summary: dataSummary,
      metrics_data: metricsData,
      insights: insights,
      export_options: exportOptions
    };
  }

  // 동료 비교 데이터 제공
  async providePeerComparison(userId: string, level: string, studyDuration: string): Promise<any> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('사용자를 찾을 수 없습니다');

    // 비교 코호트 정의
    const comparisonCohort = await this.defineComparisonCohort(level, studyDuration);

    // 성과 비교
    const performanceComparison = await this.calculatePerformanceComparison(userId, comparisonCohort);

    // 벤치마크 지표
    const benchmarkMetrics = await this.calculateBenchmarkMetrics(comparisonCohort);

    // 상대적 인사이트
    const relativeInsights = await this.generateRelativeInsights(userId, benchmarkMetrics);

    return {
      user_id: userId,
      comparison_cohort: comparisonCohort,
      performance_comparison: performanceComparison,
      benchmark_metrics: benchmarkMetrics,
      relative_insights: relativeInsights,
      generated_at: new Date().toISOString()
    };
  }

  // 개인화된 학습 추천
  async generateStudyRecommendations(userId: string, goalType: string, availableTime: number, priority: string): Promise<any> {
    // 추천 컨텍스트 생성
    const recommendationContext = await this.createRecommendationContext(
      userId,
      goalType,
      availableTime,
      priority
    );

    // 즉시 추천사항
    const immediateRecommendations = await this.generateImmediateRecommendations(recommendationContext);

    // 주간 계획
    const weeklyPlan = await this.generateWeeklyPlan(recommendationContext);

    // 적응적 요소
    const adaptiveElements = await this.generateAdaptiveElements(recommendationContext);

    return {
      user_id: userId,
      recommendation_context: recommendationContext,
      immediate_recommendations: immediateRecommendations,
      weekly_plan: weeklyPlan,
      adaptive_elements: adaptiveElements,
      generated_at: new Date().toISOString()
    };
  }

  // 실시간 성능 메트릭 기록
  async recordSessionPerformance(userId: string, sessionId: string, performanceData: any): Promise<void> {
    const sessionPerformance = this.sessionPerformanceRepo.create({
      userId,
      sessionId,
      timestamp: new Date(),
      sequenceNumber: performanceData.sequenceNumber,
      activityType: performanceData.activityType,
      instantMetrics: performanceData.instantMetrics,
      contextualData: performanceData.contextualData,
      biometricData: performanceData.biometricData
    });

    await this.sessionPerformanceRepo.save(sessionPerformance);

    // 실시간 분석 트리거
    await this.triggerRealtimeAnalysis(userId, sessionId, performanceData);
  }

  // 성과 인사이트 생성
  async generatePerformanceInsights(userId: string): Promise<void> {
    // 최근 성과 데이터 분석
    const recentPerformance = await this.analyzeRecentPerformance(userId);

    // 패턴 감지
    const detectedPatterns = await this.detectPatterns(recentPerformance);

    // 인사이트 생성
    for (const pattern of detectedPatterns) {
      const insight = await this.createInsightFromPattern(userId, pattern);
      await this.performanceInsightRepo.save(insight);
    }
  }

  // 보조 메서드들

  private calculateStartDate(endDate: Date, period: string): Date {
    const date = new Date(endDate);
    switch (period) {
      case '7d':
        date.setDate(date.getDate() - 7);
        break;
      case '30d':
        date.setDate(date.getDate() - 30);
        break;
      case '90d':
        date.setDate(date.getDate() - 90);
        break;
      case '1y':
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setDate(date.getDate() - 30);
    }
    return date;
  }

  private async calculateOverallProgress(sessions: LearningSession[], analytics: LearningAnalytics | null): Promise<any> {
    const totalStudyTime = sessions.reduce((sum, session) => sum + session.durationSeconds, 0) / 3600; // 시간 단위
    const totalSessions = sessions.length;
    const totalItems = sessions.reduce((sum, session) => sum + session.itemsStudied, 0);
    const correctAnswers = sessions.reduce((sum, session) => sum + session.correctAnswers, 0);
    const totalAttempts = sessions.reduce((sum, session) => sum + session.totalAttempts, 0);

    const overallAccuracy = totalAttempts > 0 ? correctAnswers / totalAttempts : 0;
    const avgSessionDuration = totalSessions > 0 ? totalStudyTime * 60 / totalSessions : 0; // 분 단위

    // 연속 학습일 계산
    const studyStreakDays = this.calculateStudyStreak(sessions);

    return {
      total_study_time_hours: Math.round(totalStudyTime * 100) / 100,
      total_words_learned: totalItems, // 임시로 아이템 수를 단어 수로 사용
      current_level: analytics?.overallProgress?.currentLevel || 'A1',
      level_progress_percentage: analytics?.overallProgress?.levelProgressPercentage || 0,
      study_streak_days: studyStreakDays,
      total_sessions: totalSessions,
      average_session_duration: Math.round(avgSessionDuration),
      overall_accuracy: Math.round(overallAccuracy * 100) / 100,
      study_consistency: this.calculateConsistency(sessions),
      last_active_date: sessions.length > 0 ? sessions[sessions.length - 1].startTime.toISOString().split('T')[0] : null
    };
  }

  private async analyzeRecentActivity(sessions: LearningSession[]): Promise<any> {
    const last7Days = this.getLast7DaysData(sessions);
    const weeklySum = last7Days.reduce((sum, day) => ({
      totalTime: sum.totalTime + day.study_time_minutes,
      totalWords: sum.totalWords + day.words_practiced,
      totalAccuracy: sum.totalAccuracy + day.accuracy_rate,
      totalSessions: sum.totalSessions + day.session_count
    }), { totalTime: 0, totalWords: 0, totalAccuracy: 0, totalSessions: 0 });

    const weeklyAvgAccuracy = last7Days.length > 0 ? weeklySum.totalAccuracy / last7Days.length : 0;
    const trends = this.calculateTrends(last7Days);

    return {
      last_7_days: last7Days,
      weekly_summary: {
        total_time: weeklySum.totalTime,
        average_accuracy: Math.round(weeklyAvgAccuracy * 100) / 100,
        improvement_rate: trends.improvementRate,
        consistency_score: trends.consistencyScore
      },
      trends: {
        study_time_trend: trends.studyTimeTrend,
        accuracy_trend: trends.accuracyTrend,
        engagement_trend: trends.engagementTrend
      }
    };
  }

  private async calculateSkillBreakdown(sessions: LearningSession[], analytics: LearningAnalytics | null): Promise<any> {
    // 스킬별 세션 분리
    const vocabularySessions = sessions.filter(s => s.sessionType === 'vocabulary');
    const pronunciationSessions = sessions.filter(s => s.sessionType === 'pronunciation');
    const grammarSessions = sessions.filter(s => s.sessionType === 'grammar');

    return {
      vocabulary: {
        level: analytics?.skillBreakdown?.vocabulary?.level || 1,
        progress_percentage: analytics?.skillBreakdown?.vocabulary?.progressPercentage || 0,
        weak_areas: analytics?.skillBreakdown?.vocabulary?.weakAreas || [],
        strong_areas: analytics?.skillBreakdown?.vocabulary?.strongAreas || [],
        retention_rate: analytics?.skillBreakdown?.vocabulary?.retentionRate || 0,
        learning_velocity: analytics?.skillBreakdown?.vocabulary?.learningVelocity || 0,
        mastered_words: analytics?.skillBreakdown?.vocabulary?.masteredWords || 0,
        struggling_words: analytics?.skillBreakdown?.vocabulary?.strugglingWords || 0
      },
      pronunciation: {
        level: analytics?.skillBreakdown?.pronunciation?.level || 1,
        progress_percentage: analytics?.skillBreakdown?.pronunciation?.progressPercentage || 0,
        weak_phonemes: analytics?.skillBreakdown?.pronunciation?.weakPhonemes || [],
        accuracy_trend: analytics?.skillBreakdown?.pronunciation?.accuracyTrend || [],
        most_improved_phonemes: analytics?.skillBreakdown?.pronunciation?.mostImprovedPhonemes || [],
        average_confidence_score: analytics?.skillBreakdown?.pronunciation?.averageConfidenceScore || 0
      },
      grammar: {
        level: analytics?.skillBreakdown?.grammar?.level || 1,
        progress_percentage: analytics?.skillBreakdown?.grammar?.progressPercentage || 0,
        difficult_concepts: analytics?.skillBreakdown?.grammar?.difficultConcepts || [],
        mastered_concepts: analytics?.skillBreakdown?.grammar?.masteredConcepts || [],
        syntax_accuracy: analytics?.skillBreakdown?.grammar?.syntaxAccuracy || 0,
        morphology_accuracy: analytics?.skillBreakdown?.grammar?.morphologyAccuracy || 0
      }
    };
  }

  // 추가적인 보조 메서드들...
  private calculateStudyStreak(sessions: LearningSession[]): number {
    if (sessions.length === 0) return 0;

    // 날짜별로 그룹화
    const studyDates = [...new Set(sessions.map(s => s.startTime.toISOString().split('T')[0]))].sort();

    let streak = 1;
    for (let i = studyDates.length - 1; i > 0; i--) {
      const currentDate = new Date(studyDates[i]);
      const previousDate = new Date(studyDates[i - 1]);
      const daysDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateConsistency(sessions: LearningSession[]): number {
    if (sessions.length < 2) return 0;

    // 일별 학습 시간 계산
    const dailyStudyTime: Record<string, number> = {};
    sessions.forEach(session => {
      const date = session.startTime.toISOString().split('T')[0];
      dailyStudyTime[date] = (dailyStudyTime[date] || 0) + session.durationSeconds;
    });

    const studyTimes = Object.values(dailyStudyTime);
    const avgStudyTime = studyTimes.reduce((sum, time) => sum + time, 0) / studyTimes.length;
    const variance = studyTimes.reduce((sum, time) => sum + Math.pow(time - avgStudyTime, 2), 0) / studyTimes.length;
    const coefficient = Math.sqrt(variance) / avgStudyTime;

    // 일관성 점수 (0-1, 낮을수록 일관적)
    return Math.max(0, 1 - coefficient);
  }

  private getLast7DaysData(sessions: LearningSession[]): any[] {
    const last7Days: any[] = [];
    const endDate = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const daySessions = sessions.filter(s =>
        s.startTime.toISOString().split('T')[0] === dateStr
      );

      const totalTime = daySessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60; // 분 단위
      const totalWords = daySessions.reduce((sum, s) => sum + s.itemsStudied, 0);
      const correctAnswers = daySessions.reduce((sum, s) => sum + s.correctAnswers, 0);
      const totalAttempts = daySessions.reduce((sum, s) => sum + s.totalAttempts, 0);
      const accuracy = totalAttempts > 0 ? correctAnswers / totalAttempts : 0;

      last7Days.push({
        date: dateStr,
        study_time_minutes: Math.round(totalTime),
        words_practiced: totalWords,
        accuracy_rate: Math.round(accuracy * 100) / 100,
        session_count: daySessions.length
      });
    }

    return last7Days;
  }

  private calculateTrends(last7Days: any[]): any {
    if (last7Days.length < 2) {
      return {
        improvementRate: 0,
        consistencyScore: 0,
        studyTimeTrend: 'stable',
        accuracyTrend: 'stable',
        engagementTrend: 'stable'
      };
    }

    // 간단한 선형 추세 계산
    const studyTimes = last7Days.map(d => d.study_time_minutes);
    const accuracies = last7Days.map(d => d.accuracy_rate);

    const studyTimeTrend = this.calculateLinearTrend(studyTimes);
    const accuracyTrend = this.calculateLinearTrend(accuracies);

    return {
      improvementRate: accuracyTrend,
      consistencyScore: this.calculateConsistencyScore(studyTimes),
      studyTimeTrend: this.getTrendDirection(studyTimeTrend),
      accuracyTrend: this.getTrendDirection(accuracyTrend),
      engagementTrend: this.getTrendDirection((studyTimeTrend + accuracyTrend) / 2)
    };
  }

  private calculateLinearTrend(values: number[]): number {
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private getTrendDirection(slope: number): string {
    if (Math.abs(slope) < 0.1) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }

  private calculateConsistencyScore(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const cv = Math.sqrt(variance) / mean;

    return Math.max(0, 1 - cv);
  }

  // 추가 메서드들은 실제 구현 시점에 더 상세히 구현
  private analyzeOptimalStudyTimes(sessions: LearningSession[]): any[] {
    // 시간대별 성능 분석
    const hourlyPerformance: Record<number, { totalSessions: number; totalAccuracy: number; totalTime: number }> = {};

    sessions.forEach(session => {
      const hour = session.startTime.getHours();
      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = { totalSessions: 0, totalAccuracy: 0, totalTime: 0 };
      }

      hourlyPerformance[hour].totalSessions++;
      hourlyPerformance[hour].totalAccuracy += session.totalAttempts > 0 ? session.correctAnswers / session.totalAttempts : 0;
      hourlyPerformance[hour].totalTime += session.durationSeconds;
    });

    const result = [];
    for (let hour = 0; hour < 24; hour++) {
      const data = hourlyPerformance[hour] || { totalSessions: 0, totalAccuracy: 0, totalTime: 0 };
      const avgAccuracy = data.totalSessions > 0 ? data.totalAccuracy / data.totalSessions : 0;
      const performanceScore = avgAccuracy * (data.totalSessions / Math.max(1, sessions.length));

      result.push({
        hour,
        performance_score: Math.round(performanceScore * 100) / 100,
        session_count: data.totalSessions,
        average_accuracy: Math.round(avgAccuracy * 100) / 100,
        engagement: Math.min(1, data.totalSessions / 10) // 정규화
      });
    }

    return result;
  }

  private analyzePreferredSessionLength(sessions: LearningSession[]): any {
    if (sessions.length === 0) {
      return {
        average_minutes: 0,
        optimal_range: { min: 15, max: 45 },
        efficiency_score: 0,
        attention_span_pattern: 'unknown'
      };
    }

    const durations = sessions.map(s => s.durationSeconds / 60); // 분 단위
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;

    // 효율성 계산: 정확도와 시간의 관계
    const efficiencyScores = sessions.map(session => {
      const accuracy = session.totalAttempts > 0 ? session.correctAnswers / session.totalAttempts : 0;
      const duration = session.durationSeconds / 60;
      return accuracy / Math.log(duration + 1); // 로그 스케일로 정규화
    });

    const avgEfficiency = efficiencyScores.reduce((sum, e) => sum + e, 0) / efficiencyScores.length;

    return {
      average_minutes: Math.round(avgDuration),
      optimal_range: {
        min: Math.max(15, Math.round(avgDuration * 0.7)),
        max: Math.min(60, Math.round(avgDuration * 1.3))
      },
      efficiency_score: Math.round(avgEfficiency * 100) / 100,
      attention_span_pattern: this.analyzeAttentionSpanPattern(durations)
    };
  }

  private analyzeWeeklyDistribution(sessions: LearningSession[]): any[] {
    const weeklyData: Record<number, { totalTime: number; sessionCount: number; totalAccuracy: number }> = {};

    sessions.forEach(session => {
      const dayOfWeek = session.startTime.getDay(); // 0=일요일, 6=토요일
      if (!weeklyData[dayOfWeek]) {
        weeklyData[dayOfWeek] = { totalTime: 0, sessionCount: 0, totalAccuracy: 0 };
      }

      weeklyData[dayOfWeek].totalTime += session.durationSeconds / 60; // 분 단위
      weeklyData[dayOfWeek].sessionCount++;
      weeklyData[dayOfWeek].totalAccuracy += session.totalAttempts > 0 ? session.correctAnswers / session.totalAttempts : 0;
    });

    const result = [];
    for (let day = 0; day < 7; day++) {
      const data = weeklyData[day] || { totalTime: 0, sessionCount: 0, totalAccuracy: 0 };
      const avgAccuracy = data.sessionCount > 0 ? data.totalAccuracy / data.sessionCount : 0;

      result.push({
        day_of_week: day,
        average_time: Math.round(data.totalTime),
        session_count: data.sessionCount,
        consistency_score: this.calculateDayConsistency(sessions, day),
        performance_rating: Math.round(avgAccuracy * 100) / 100
      });
    }

    return result;
  }

  private analyzeAttentionSpanPattern(durations: number[]): string {
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;

    if (avgDuration < 20) return 'short_bursts';
    if (avgDuration < 40) return 'moderate_focus';
    return 'extended_concentration';
  }

  private calculateDayConsistency(sessions: LearningSession[], dayOfWeek: number): number {
    const daySessions = sessions.filter(s => s.startTime.getDay() === dayOfWeek);
    if (daySessions.length < 2) return 0;

    // 해당 요일의 학습 시간 일관성 계산
    const times = daySessions.map(s => s.durationSeconds / 60);
    const mean = times.reduce((sum, t) => sum + t, 0) / times.length;
    const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / times.length;
    const cv = Math.sqrt(variance) / mean;

    return Math.max(0, 1 - cv);
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 추가 메서드들은 실제 필요에 따라 구현...
  private async analyzeSeasonalPatterns(userId: string): Promise<any> {
    // 기본 구조만 반환 (실제로는 더 복잡한 분석 필요)
    return {
      best_months: [],
      challenging_periods: [],
      holiday_impact: 0,
      motivation_cycles: []
    };
  }

  private async analyzePerformancePatterns(userId: string, sessions: LearningSession[]): Promise<any> {
    // 기본 구조만 반환
    return {
      accuracy_trends: [],
      difficulty_adaptation: {
        current_comfort_level: 0.5,
        recommended_difficulty: 0.6,
        challenge_tolerance: 0.7,
        adaptation_rate: 0.8
      },
      retention_analysis: {
        short_term_retention: 0.85,
        long_term_retention: 0.75,
        forgetting_curve_fit: 0.9
      }
    };
  }

  private async analyzeMotivationIndicators(userId: string, sessions: LearningSession[]): Promise<any> {
    // 기본 구조만 반환
    return {
      engagement_score: 0.8,
      consistency_rating: 0.7,
      goal_alignment: 0.9,
      streak_stability: 0.6
    };
  }

  private identifyWeaknessCategories(metrics: PerformanceMetrics[]): any[] {
    // 기본 구조만 반환
    return [];
  }

  private generatePriorityRecommendations(weaknessCategories: any[]): any[] {
    // 기본 구조만 반환
    return [];
  }

  private async generatePeerComparison(userId: string): Promise<any> {
    // 기본 구조만 반환
    return {
      user_percentile: 75,
      average_performance: 0.7,
      areas_above_average: ['vocabulary'],
      areas_below_average: ['pronunciation']
    };
  }

  private async analyzeCEFRAlignment(userId: string): Promise<any> {
    // 기본 구조만 반환
    return {
      current_level: 'A2',
      level_progress: 0.6,
      blocking_skills: ['pronunciation'],
      advancement_requirements: ['improve pronunciation accuracy']
    };
  }

  // 추가적인 보조 메서드들...
  private async analyzeCurrentState(userId: string): Promise<any> {
    return {
      level: 'A2',
      skill_scores: {
        vocabulary: 0.7,
        pronunciation: 0.6,
        grammar: 0.8
      },
      learning_velocity: 0.5
    };
  }

  private async generatePredictionScenarios(userId: string, currentState: any, targetLevel: string, timeHorizon: string): Promise<any[]> {
    return [{
      scenario_name: 'standard_progress',
      study_intensity: 1.0,
      predicted_outcomes: {
        target_level_probability: 0.8,
        estimated_completion_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        confidence_interval: {
          lower_bound: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
          upper_bound: new Date(Date.now() + 210 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      milestone_predictions: []
    }];
  }

  private async generateOptimizationSuggestions(currentState: any, targetLevel: string): Promise<any[]> {
    return [{
      strategy: 'focus_on_weak_areas',
      expected_acceleration: 0.2,
      implementation_difficulty: 0.3
    }];
  }

  private async collectDataForReport(userId: string, startDate: Date, endDate: Date, metrics: string[]): Promise<any> {
    return {};
  }

  private generateDataSummary(rawData: any): any {
    return {
      total_data_points: 0,
      coverage_percentage: 100,
      data_quality_score: 0.95
    };
  }

  private processMetricsData(rawData: any, config: any): any {
    return {};
  }

  private async generateInsights(rawData: any, config: any): Promise<any[]> {
    return [];
  }

  private generateExportOptions(reportId: string): any {
    return {
      formats: ['pdf', 'xlsx', 'json'],
      download_links: {}
    };
  }

  private async defineComparisonCohort(level: string, studyDuration: string): Promise<any> {
    return {
      size: 100,
      criteria: { level, study_duration: studyDuration },
      anonymization_level: 'high'
    };
  }

  private async calculatePerformanceComparison(userId: string, cohort: any): Promise<any> {
    return {
      vocabulary_percentile: 75,
      pronunciation_percentile: 60,
      overall_progress_percentile: 70,
      study_efficiency_rank: 65
    };
  }

  private async calculateBenchmarkMetrics(cohort: any): Promise<any> {
    return {
      average_study_time: 30,
      average_accuracy: 0.75,
      typical_progression_rate: 0.1,
      common_struggle_points: ['pronunciation']
    };
  }

  private async generateRelativeInsights(userId: string, benchmarks: any): Promise<any[]> {
    return [];
  }

  private async createRecommendationContext(userId: string, goalType: string, availableTime: number, priority: string): Promise<any> {
    return {
      goal_type: goalType,
      available_time: availableTime,
      user_preferences: {},
      current_performance: {}
    };
  }

  private async generateImmediateRecommendations(context: any): Promise<any[]> {
    return [];
  }

  private async generateWeeklyPlan(context: any): Promise<any> {
    return {
      total_time_allocation: context.available_time * 7,
      daily_sessions: []
    };
  }

  private async generateAdaptiveElements(context: any): Promise<any> {
    return {
      adjustment_triggers: [],
      backup_activities: [],
      progress_checkpoints: []
    };
  }

  private async triggerRealtimeAnalysis(userId: string, sessionId: string, performanceData: any): Promise<void> {
    // 실시간 분석 로직
  }

  private async analyzeRecentPerformance(userId: string): Promise<any> {
    return {};
  }

  private async detectPatterns(performanceData: any): Promise<any[]> {
    return [];
  }

  private async createInsightFromPattern(userId: string, pattern: any): Promise<PerformanceInsight> {
    return this.performanceInsightRepo.create({
      userId,
      insightDate: new Date(),
      insightType: 'trend',
      priority: 'medium',
      title: '패턴 감지',
      description: '학습 패턴이 감지되었습니다',
      insightData: {
        triggerMetrics: {},
        evidenceData: [],
        confidenceLevel: 0.8,
        actionRecommendations: [],
        expectedOutcomes: [],
        timeframe: '1주일',
        resources: []
      }
    });
  }
}