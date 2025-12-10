// 학습 패턴 분석 단위 테스트
// Hungarian Learning Platform - Learning Analytics Unit Tests
// T103 [P] [US5] Unit test for learning pattern analysis

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { LearningPatternAnalyzer } from '../../src/services/analytics/LearningPatternAnalyzer';
import { WeaknessIdentifier } from '../../src/services/analytics/WeaknessIdentifier';
import { ProgressPredictor } from '../../src/services/analytics/ProgressPredictor';
import { StudyOptimizer } from '../../src/services/analytics/StudyOptimizer';

describe('LearningPatternAnalyzer', () => {
  let analyzer: LearningPatternAnalyzer;
  let mockUserData: any;

  beforeEach(() => {
    analyzer = new LearningPatternAnalyzer();

    // 테스트용 사용자 학습 데이터
    mockUserData = {
      userId: 'test-user-123',
      sessions: [
        {
          sessionId: 'session-1',
          startTime: new Date('2024-01-01T09:00:00Z'),
          endTime: new Date('2024-01-01T09:30:00Z'),
          activityType: 'vocabulary',
          accuracy: 0.85,
          itemsStudied: 15,
          difficulty: 'intermediate'
        },
        {
          sessionId: 'session-2',
          startTime: new Date('2024-01-01T19:00:00Z'),
          endTime: new Date('2024-01-01T19:45:00Z'),
          activityType: 'pronunciation',
          accuracy: 0.72,
          itemsStudied: 12,
          difficulty: 'advanced'
        },
        {
          sessionId: 'session-3',
          startTime: new Date('2024-01-02T08:30:00Z'),
          endTime: new Date('2024-01-02T09:15:00Z'),
          activityType: 'grammar',
          accuracy: 0.91,
          itemsStudied: 18,
          difficulty: 'beginner'
        }
      ],
      vocabularyProgress: {
        totalWords: 450,
        masteredWords: 320,
        strugglingWords: 85,
        newWords: 45
      },
      pronunciationData: {
        phonemeAccuracy: {
          'ö': 0.65,
          'ű': 0.58,
          'gy': 0.78,
          'ny': 0.82,
          'sz': 0.92
        },
        overallAccuracy: 0.75
      },
      grammarProgress: {
        concepts: {
          'definite_conjugation': { mastery: 0.85, attempts: 45 },
          'case_system': { mastery: 0.62, attempts: 38 },
          'verb_prefixes': { mastery: 0.71, attempts: 29 }
        }
      }
    };
  });

  describe('analyzeStudyPatterns', () => {
    test('should identify optimal study times', async () => {
      const patterns = await analyzer.analyzeStudyPatterns(mockUserData);

      expect(patterns.optimalStudyTimes).toHaveLength(24); // 24시간
      expect(patterns.optimalStudyTimes[9]).toMatchObject({
        hour: 9,
        performanceScore: expect.any(Number),
        sessionCount: expect.any(Number),
        averageAccuracy: expect.any(Number)
      });

      // 아침 시간대(9시)가 높은 성과를 보여야 함
      const morningPerformance = patterns.optimalStudyTimes[9].performanceScore;
      const nightPerformance = patterns.optimalStudyTimes[22].performanceScore;
      expect(morningPerformance).toBeGreaterThan(nightPerformance);
    });

    test('should calculate preferred session length', async () => {
      const patterns = await analyzer.analyzeStudyPatterns(mockUserData);

      expect(patterns.preferredSessionLength).toMatchObject({
        averageMinutes: expect.any(Number),
        optimalRange: {
          min: expect.any(Number),
          max: expect.any(Number)
        },
        efficiencyScore: expect.any(Number)
      });

      expect(patterns.preferredSessionLength.averageMinutes).toBeGreaterThan(0);
      expect(patterns.preferredSessionLength.optimalRange.min).toBeLessThanOrEqual(
        patterns.preferredSessionLength.optimalRange.max
      );
    });

    test('should analyze weekly distribution', async () => {
      const patterns = await analyzer.analyzeStudyPatterns(mockUserData);

      expect(patterns.weeklyDistribution).toHaveLength(7); // 7일
      expect(patterns.weeklyDistribution[0]).toMatchObject({
        dayOfWeek: 0, // 일요일
        averageTime: expect.any(Number),
        sessionCount: expect.any(Number),
        consistencyScore: expect.any(Number)
      });
    });
  });

  describe('analyzePerformancePatterns', () => {
    test('should identify accuracy trends by skill type', async () => {
      const performance = await analyzer.analyzePerformancePatterns(mockUserData);

      expect(performance.accuracyTrends).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            skillType: expect.stringMatching(/^(vocabulary|pronunciation|grammar)$/),
            trendDirection: expect.stringMatching(/^(improving|declining|stable)$/),
            changeRate: expect.any(Number),
            confidenceLevel: expect.any(Number),
            dataPoints: expect.any(Number)
          })
        ])
      );
    });

    test('should calculate difficulty adaptation metrics', async () => {
      const performance = await analyzer.analyzePerformancePatterns(mockUserData);

      expect(performance.difficultyAdaptation).toMatchObject({
        currentComfortLevel: expect.any(Number),
        recommendedDifficulty: expect.any(Number),
        challengeTolerance: expect.any(Number),
        adaptationRate: expect.any(Number)
      });

      // 난이도 값이 유효한 범위에 있는지 확인
      expect(performance.difficultyAdaptation.currentComfortLevel).toBeGreaterThanOrEqual(0);
      expect(performance.difficultyAdaptation.currentComfortLevel).toBeLessThanOrEqual(1);
    });

    test('should analyze retention patterns', async () => {
      const performance = await analyzer.analyzePerformancePatterns(mockUserData);

      expect(performance.retentionAnalysis).toMatchObject({
        shortTermRetention: expect.any(Number),
        longTermRetention: expect.any(Number),
        forgettingCurve: expect.objectContaining({
          initialStrength: expect.any(Number),
          decayRate: expect.any(Number),
          asymptote: expect.any(Number)
        }),
        optimalReviewIntervals: expect.any(Array)
      });
    });
  });

  describe('calculateMotivationIndicators', () => {
    test('should compute engagement metrics', async () => {
      const motivation = await analyzer.calculateMotivationIndicators(mockUserData);

      expect(motivation).toMatchObject({
        engagementScore: expect.any(Number),
        consistencyRating: expect.any(Number),
        goalAlignment: expect.any(Number),
        streakStability: expect.any(Number),
        progressSatisfaction: expect.any(Number)
      });

      // 모든 점수가 0-1 범위에 있는지 확인
      Object.values(motivation).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      });
    });

    test('should handle sparse data gracefully', async () => {
      const sparseData = {
        ...mockUserData,
        sessions: [mockUserData.sessions[0]] // 단일 세션
      };

      const motivation = await analyzer.calculateMotivationIndicators(sparseData);

      expect(motivation.engagementScore).toBeGreaterThanOrEqual(0);
      expect(motivation.consistencyRating).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('WeaknessIdentifier', () => {
  let identifier: WeaknessIdentifier;
  let mockAnalyticsData: any;

  beforeEach(() => {
    identifier = new WeaknessIdentifier();

    mockAnalyticsData = {
      skillPerformance: {
        vocabulary: { accuracy: 0.75, consistency: 0.82, progress: 0.68 },
        pronunciation: { accuracy: 0.58, consistency: 0.65, progress: 0.45 },
        grammar: { accuracy: 0.89, consistency: 0.78, progress: 0.72 }
      },
      specificAreas: {
        pronunciationPhonemes: {
          'ö': { accuracy: 0.45, attempts: 23 },
          'ű': { accuracy: 0.52, attempts: 18 },
          'gy': { accuracy: 0.78, attempts: 34 }
        },
        grammarConcepts: {
          'case_system': { mastery: 0.58, difficulty: 0.85 },
          'definite_conjugation': { mastery: 0.83, difficulty: 0.72 }
        },
        vocabularyCategories: {
          'religious_terms': { accuracy: 0.68, retention: 0.72 },
          'everyday_conversation': { accuracy: 0.82, retention: 0.85 }
        }
      },
      learningVelocity: {
        current: 0.65,
        target: 0.80,
        trend: 'stable'
      }
    };
  });

  describe('identifyWeaknesses', () => {
    test('should identify critical weaknesses correctly', async () => {
      const weaknesses = await identifier.identifyWeaknesses(mockAnalyticsData);

      expect(weaknesses).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: expect.any(String),
            severity: expect.stringMatching(/^(critical|high|medium|low)$/),
            confidence: expect.any(Number),
            specificAreas: expect.any(Array),
            recommendedActions: expect.any(Array)
          })
        ])
      );

      // 발음이 가장 약한 영역으로 식별되어야 함
      const pronunciationWeakness = weaknesses.find(w => w.category === 'pronunciation');
      expect(pronunciationWeakness).toBeDefined();
      expect(pronunciationWeakness?.severity).toMatch(/^(critical|high)$/);
    });

    test('should prioritize weaknesses by impact and effort', async () => {
      const weaknesses = await identifier.identifyWeaknesses(mockAnalyticsData);
      const prioritized = await identifier.prioritizeWeaknesses(weaknesses);

      expect(prioritized).toHaveLength(weaknesses.length);

      // 우선순위가 올바르게 정렬되었는지 확인
      for (let i = 1; i < prioritized.length; i++) {
        const currentPriority = prioritized[i].priority;
        const previousPriority = prioritized[i - 1].priority;
        expect(currentPriority).toBeLessThanOrEqual(previousPriority);
      }
    });

    test('should generate specific recommendations for each weakness', async () => {
      const weaknesses = await identifier.identifyWeaknesses(mockAnalyticsData);

      weaknesses.forEach(weakness => {
        expect(weakness.recommendedActions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              actionType: expect.any(String),
              priority: expect.any(Number),
              estimatedImprovement: expect.any(Number),
              timeInvestment: expect.any(Number),
              description: expect.any(String)
            })
          ])
        );
      });
    });
  });

  describe('generateRecommendations', () => {
    test('should provide actionable improvement strategies', async () => {
      const weaknesses = await identifier.identifyWeaknesses(mockAnalyticsData);
      const recommendations = await identifier.generateRecommendations(weaknesses[0]);

      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            strategy: expect.any(String),
            expectedBenefit: expect.any(Number),
            implementationDifficulty: expect.any(Number),
            timeframe: expect.any(String),
            resources: expect.any(Array)
          })
        ])
      );
    });

    test('should consider user constraints in recommendations', async () => {
      const constraints = {
        availableTime: 30, // 30분
        preferredDifficulty: 'medium',
        focusAreas: ['pronunciation']
      };

      const weaknesses = await identifier.identifyWeaknesses(mockAnalyticsData);
      const recommendations = await identifier.generateRecommendations(
        weaknesses[0],
        constraints
      );

      // 시간 제약이 고려되었는지 확인
      recommendations.forEach(rec => {
        expect(rec.estimatedDuration).toBeLessThanOrEqual(constraints.availableTime);
      });
    });
  });
});

describe('ProgressPredictor', () => {
  let predictor: ProgressPredictor;
  let mockHistoricalData: any;

  beforeEach(() => {
    predictor = new ProgressPredictor();

    mockHistoricalData = {
      learningHistory: [
        { date: '2024-01-01', level: 'A2', skillScores: { vocabulary: 0.65, grammar: 0.72, pronunciation: 0.58 } },
        { date: '2024-02-01', level: 'A2', skillScores: { vocabulary: 0.71, grammar: 0.76, pronunciation: 0.62 } },
        { date: '2024-03-01', level: 'A2', skillScores: { vocabulary: 0.78, grammar: 0.81, pronunciation: 0.68 } }
      ],
      currentState: {
        level: 'A2',
        overallScore: 0.75,
        skillScores: { vocabulary: 0.78, grammar: 0.81, pronunciation: 0.68 },
        studyVelocity: 0.12 // 점수 향상률 per month
      },
      studyPatterns: {
        averageSessionsPerWeek: 4.5,
        averageStudyTimePerDay: 35,
        consistencyScore: 0.78
      }
    };
  });

  describe('predictLevelProgression', () => {
    test('should predict next level achievement time', async () => {
      const prediction = await predictor.predictLevelProgression(
        mockHistoricalData,
        'B1',
        '6m'
      );

      expect(prediction).toMatchObject({
        targetLevel: 'B1',
        currentLevel: 'A2',
        scenarios: expect.arrayContaining([
          expect.objectContaining({
            scenarioName: expect.any(String),
            studyIntensity: expect.any(Number),
            predictedOutcome: expect.objectContaining({
              achievementProbability: expect.any(Number),
              estimatedCompletionDate: expect.any(String),
              confidenceInterval: expect.objectContaining({
                lowerBound: expect.any(String),
                upperBound: expect.any(String)
              })
            }),
            milestones: expect.any(Array)
          })
        ])
      });
    });

    test('should handle different study intensity scenarios', async () => {
      const prediction = await predictor.predictLevelProgression(
        mockHistoricalData,
        'B1',
        '6m'
      );

      const scenarios = prediction.scenarios;
      expect(scenarios).toHaveLength(3); // conservative, moderate, intensive

      const intensities = scenarios.map(s => s.studyIntensity);
      expect(intensities).toEqual(intensities.sort((a, b) => a - b)); // 증가 순서
    });

    test('should provide realistic time estimates', async () => {
      const prediction = await predictor.predictLevelProgression(
        mockHistoricalData,
        'C1', // 매우 높은 목표
        '1y'
      );

      // 현실적이지 않은 목표에 대해서는 낮은 확률을 반환해야 함
      const bestScenario = prediction.scenarios[prediction.scenarios.length - 1];
      expect(bestScenario.predictedOutcome.achievementProbability).toBeLessThan(0.7);
    });
  });

  describe('predictSkillDevelopment', () => {
    test('should forecast individual skill progression', async () => {
      const skillPredictions = await predictor.predictSkillDevelopment(
        mockHistoricalData,
        6 // 6개월
      );

      ['vocabulary', 'grammar', 'pronunciation'].forEach(skill => {
        expect(skillPredictions[skill]).toMatchObject({
          currentScore: expect.any(Number),
          projectedScore: expect.any(Number),
          confidence: expect.any(Number),
          milestones: expect.any(Array),
          potentialBottlenecks: expect.any(Array)
        });
      });
    });

    test('should identify potential bottlenecks', async () => {
      const skillPredictions = await predictor.predictSkillDevelopment(
        mockHistoricalData,
        6
      );

      // 발음이 병목으로 식별되어야 함 (가장 낮은 점수)
      expect(skillPredictions.pronunciation.potentialBottlenecks).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/phoneme|accuracy|practice/)
        ])
      );
    });
  });
});

describe('StudyOptimizer', () => {
  let optimizer: StudyOptimizer;
  let mockUserProfile: any;

  beforeEach(() => {
    optimizer = new StudyOptimizer();

    mockUserProfile = {
      userId: 'test-user',
      currentLevel: 'A2',
      goals: {
        targetLevel: 'B1',
        timeframe: '6m',
        priority: 'balanced'
      },
      preferences: {
        studyTimeSlots: ['09:00-10:00', '19:00-20:00'],
        difficultyPreference: 'challenging',
        activityTypes: ['vocabulary', 'pronunciation', 'grammar'],
        sessionDuration: 45
      },
      performance: {
        vocabulary: 0.78,
        pronunciation: 0.65,
        grammar: 0.82,
        retention: 0.74
      },
      constraints: {
        availableTimePerDay: 60,
        unavailableDays: ['Sunday'],
        intensityLimit: 'medium'
      }
    };
  });

  describe('optimizeStudyPlan', () => {
    test('should generate personalized weekly study plan', async () => {
      const studyPlan = await optimizer.optimizeStudyPlan(mockUserProfile);

      expect(studyPlan).toMatchObject({
        weeklyStructure: expect.objectContaining({
          totalTime: expect.any(Number),
          dailySessions: expect.any(Array),
          skillDistribution: expect.any(Object)
        }),
        adaptiveElements: expect.objectContaining({
          difficultyAdjustment: expect.any(Object),
          progressCheckpoints: expect.any(Array),
          fallbackActivities: expect.any(Array)
        }),
        expectedOutcomes: expect.objectContaining({
          weeklyProgress: expect.any(Number),
          skillImprovements: expect.any(Object)
        })
      });

      // 사용자 제약사항이 반영되었는지 확인
      expect(studyPlan.weeklyStructure.totalTime).toBeLessThanOrEqual(
        mockUserProfile.constraints.availableTimePerDay * 6 // 일요일 제외
      );
    });

    test('should prioritize weak areas appropriately', async () => {
      const studyPlan = await optimizer.optimizeStudyPlan(mockUserProfile);

      // 발음(가장 약한 영역)에 더 많은 시간이 할당되어야 함
      const pronunciationTime = studyPlan.weeklyStructure.skillDistribution.pronunciation;
      const grammarTime = studyPlan.weeklyStructure.skillDistribution.grammar;

      expect(pronunciationTime).toBeGreaterThan(grammarTime);
    });

    test('should respect user preferences and constraints', async () => {
      const studyPlan = await optimizer.optimizeStudyPlan(mockUserProfile);

      studyPlan.weeklyStructure.dailySessions.forEach(session => {
        if (session.day === 'Sunday') {
          expect(session.activities).toHaveLength(0);
        }

        session.activities.forEach((activity: any) => {
          expect(activity.duration).toBeLessThanOrEqual(
            mockUserProfile.preferences.sessionDuration + 15 // 15분 여유
          );
        });
      });
    });
  });

  describe('optimizeSessionContent', () => {
    test('should create balanced session content', async () => {
      const sessionParams = {
        duration: 45,
        primarySkill: 'pronunciation',
        userLevel: 'A2',
        recentPerformance: { accuracy: 0.72, engagement: 0.81 }
      };

      const sessionContent = await optimizer.optimizeSessionContent(
        sessionParams,
        mockUserProfile
      );

      expect(sessionContent).toMatchObject({
        activities: expect.arrayContaining([
          expect.objectContaining({
            type: expect.any(String),
            duration: expect.any(Number),
            difficulty: expect.any(String),
            content: expect.any(Object)
          })
        ]),
        totalDuration: sessionParams.duration,
        difficultyProgression: expect.any(String),
        engagementElements: expect.any(Array)
      });

      // 총 시간이 요청된 시간과 일치하는지 확인
      const totalTime = sessionContent.activities.reduce(
        (sum: number, activity: any) => sum + activity.duration, 0
      );
      expect(Math.abs(totalTime - sessionParams.duration)).toBeLessThanOrEqual(5);
    });

    test('should adapt difficulty based on recent performance', async () => {
      const highPerformanceParams = {
        duration: 30,
        primarySkill: 'vocabulary',
        userLevel: 'A2',
        recentPerformance: { accuracy: 0.92, engagement: 0.88 }
      };

      const sessionContent = await optimizer.optimizeSessionContent(
        highPerformanceParams,
        mockUserProfile
      );

      // 높은 성과에 대해 더 도전적인 내용이 포함되어야 함
      expect(sessionContent.difficultyProgression).toMatch(/challenging|progressive/);
    });
  });
});