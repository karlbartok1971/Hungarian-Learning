// 진도 계산 통합 테스트
// Hungarian Learning Platform - Progress Calculation Integration Tests
// T104 [P] [US5] Integration test for progress calculation

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { DatabaseManager } from '../../src/lib/database';
import { AnalyticsService } from '../../src/services/AnalyticsService';
import { VocabularyService } from '../../src/services/VocabularyService';
import { FSRSAlgorithmService } from '../../src/services/FSRSAlgorithmService';
import { ProgressTrackingService } from '../../src/services/ProgressTrackingService';

describe('Progress Calculation Integration Tests', () => {
  let analyticsService: AnalyticsService;
  let vocabularyService: VocabularyService;
  let fsrsService: FSRSAlgorithmService;
  let progressService: ProgressTrackingService;
  let testUserId: string;

  beforeAll(async () => {
    // 데이터베이스 연결
    await DatabaseManager.connect();

    // 서비스 인스턴스 생성
    analyticsService = new AnalyticsService();
    vocabularyService = new VocabularyService();
    fsrsService = new FSRSAlgorithmService();
    progressService = new ProgressTrackingService();

    // 테스트용 사용자 생성
    const testUser = await DatabaseManager.createTestUser({
      email: 'progress.test@example.com',
      full_name: 'Progress Test User',
      korean_level: 'native',
      hungarian_level: 'A1'
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    await DatabaseManager.cleanup();
    await DatabaseManager.disconnect();
  });

  beforeEach(async () => {
    // 각 테스트 전에 학습 데이터 초기화
    await DatabaseManager.cleanupUserProgress(testUserId);
  });

  describe('Overall Progress Calculation', () => {
    test('should calculate accurate progress from learning sessions', async () => {
      // 가상의 학습 세션 데이터 생성
      await createLearningSession({
        userId: testUserId,
        sessionType: 'vocabulary',
        startTime: new Date('2024-01-01T09:00:00Z'),
        duration: 1800, // 30분
        itemsStudied: 15,
        correctAnswers: 12,
        averageResponseTime: 3500
      });

      await createLearningSession({
        userId: testUserId,
        sessionType: 'pronunciation',
        startTime: new Date('2024-01-01T19:00:00Z'),
        duration: 2700, // 45분
        itemsStudied: 20,
        correctAnswers: 14,
        averageResponseTime: 5200
      });

      await createLearningSession({
        userId: testUserId,
        sessionType: 'grammar',
        startTime: new Date('2024-01-02T08:30:00Z'),
        duration: 2100, // 35분
        itemsStudied: 18,
        correctAnswers: 16,
        averageResponseTime: 4100
      });

      // 진도 계산
      const progress = await analyticsService.calculateOverallProgress(testUserId, {
        period: '7d',
        includeProjections: true
      });

      expect(progress).toMatchObject({
        user_id: testUserId,
        calculation_date: expect.any(String),
        overall_metrics: expect.objectContaining({
          total_study_time_hours: expect.any(Number),
          total_sessions: 3,
          average_session_duration: expect.any(Number),
          total_items_studied: 53,
          overall_accuracy: expect.any(Number),
          study_consistency: expect.any(Number)
        }),
        skill_progress: expect.objectContaining({
          vocabulary: expect.objectContaining({
            sessions_count: 1,
            accuracy_rate: 0.8, // 12/15
            time_invested: 1800,
            progress_score: expect.any(Number)
          }),
          pronunciation: expect.objectContaining({
            sessions_count: 1,
            accuracy_rate: 0.7, // 14/20
            time_invested: 2700,
            progress_score: expect.any(Number)
          }),
          grammar: expect.objectContaining({
            sessions_count: 1,
            accuracy_rate: expect.closeTo(0.889, 2), // 16/18
            time_invested: 2100,
            progress_score: expect.any(Number)
          })
        }),
        learning_velocity: expect.objectContaining({
          items_per_hour: expect.any(Number),
          accuracy_trend: expect.any(String),
          efficiency_score: expect.any(Number)
        })
      });

      // 전체 정확도 계산 검증
      const expectedOverallAccuracy = (12 + 14 + 16) / (15 + 20 + 18);
      expect(progress.overall_metrics.overall_accuracy).toBeCloseTo(expectedOverallAccuracy, 2);
    });

    test('should integrate FSRS algorithm data into progress calculation', async () => {
      // 어휘 카드 생성 및 FSRS 데이터 시뮬레이션
      const vocabularyCards = await createVocabularyCards([
        { hungarianWord: 'ház', koreanMeaning: '집', difficulty: 'beginner' },
        { hungarianWord: 'könyv', koreanMeaning: '책', difficulty: 'beginner' },
        { hungarianWord: 'barát', koreanMeaning: '친구', difficulty: 'elementary' }
      ]);

      // 각 카드에 대한 학습 기록 생성
      for (const card of vocabularyCards) {
        await createVocabularyReview({
          userId: testUserId,
          cardId: card.id,
          rating: 3, // GOOD
          responseTime: 2500,
          reviewType: 'learning'
        });
      }

      // FSRS 기반 진도 계산
      const fsrsProgress = await progressService.calculateLearningStatistics(testUserId, {
        includesFsrs: true,
        timeframe: '7d'
      });

      expect(fsrsProgress).toMatchObject({
        vocabulary_mastery: expect.objectContaining({
          total_cards: 3,
          learning_cards: expect.any(Number),
          review_cards: expect.any(Number),
          mastered_cards: expect.any(Number),
          retention_rate: expect.any(Number)
        }),
        fsrs_metrics: expect.objectContaining({
          average_stability: expect.any(Number),
          average_difficulty: expect.any(Number),
          predicted_retention: expect.any(Number),
          optimal_review_load: expect.any(Number)
        }),
        spaced_repetition_efficiency: expect.objectContaining({
          adherence_rate: expect.any(Number),
          timing_accuracy: expect.any(Number),
          algorithm_effectiveness: expect.any(Number)
        })
      });
    });

    test('should handle edge cases in progress calculation', async () => {
      // 학습 데이터가 없는 경우
      const emptyProgress = await analyticsService.calculateOverallProgress(testUserId, {
        period: '30d'
      });

      expect(emptyProgress.overall_metrics.total_sessions).toBe(0);
      expect(emptyProgress.overall_metrics.total_study_time_hours).toBe(0);
      expect(emptyProgress.skill_progress.vocabulary.sessions_count).toBe(0);

      // 단일 세션만 있는 경우
      await createLearningSession({
        userId: testUserId,
        sessionType: 'vocabulary',
        startTime: new Date(),
        duration: 900, // 15분
        itemsStudied: 5,
        correctAnswers: 4,
        averageResponseTime: 3000
      });

      const singleSessionProgress = await analyticsService.calculateOverallProgress(testUserId, {
        period: '7d'
      });

      expect(singleSessionProgress.overall_metrics.total_sessions).toBe(1);
      expect(singleSessionProgress.overall_metrics.overall_accuracy).toBe(0.8);
    });
  });

  describe('Skill-Specific Progress Analysis', () => {
    test('should analyze vocabulary progress with difficulty progression', async () => {
      // 다양한 난이도의 어휘 카드 생성
      const beginnerCards = await createVocabularyCards([
        { hungarianWord: 'igen', koreanMeaning: '네', difficulty: 'beginner' },
        { hungarianWord: 'nem', koreanMeaning: '아니요', difficulty: 'beginner' }
      ]);

      const intermediateCards = await createVocabularyCards([
        { hungarianWord: 'egyetem', koreanMeaning: '대학교', difficulty: 'intermediate' },
        { hungarianWord: 'történelem', koreanMeaning: '역사', difficulty: 'intermediate' }
      ]);

      // 난이도별 학습 성과 시뮬레이션
      for (const card of beginnerCards) {
        await createVocabularyReview({
          userId: testUserId,
          cardId: card.id,
          rating: 4, // EASY
          responseTime: 1500
        });
      }

      for (const card of intermediateCards) {
        await createVocabularyReview({
          userId: testUserId,
          cardId: card.id,
          rating: 2, // HARD
          responseTime: 4500
        });
      }

      const vocabularyAnalysis = await analyticsService.analyzeVocabularyProgress(testUserId);

      expect(vocabularyAnalysis).toMatchObject({
        difficulty_progression: expect.objectContaining({
          beginner: expect.objectContaining({
            total_cards: 2,
            average_rating: 4,
            mastery_rate: expect.any(Number),
            ready_for_next_level: true
          }),
          intermediate: expect.objectContaining({
            total_cards: 2,
            average_rating: 2,
            mastery_rate: expect.any(Number),
            ready_for_next_level: false
          })
        }),
        learning_efficiency: expect.objectContaining({
          retention_curve: expect.any(Object),
          optimal_review_intervals: expect.any(Array),
          difficulty_adaptation_score: expect.any(Number)
        })
      });
    });

    test('should track pronunciation improvement patterns', async () => {
      // 발음 세션 데이터 생성
      const pronunciationSessions = [
        {
          phoneme: 'ö',
          attempts: 10,
          accuracy: 0.6,
          improvement: 0.15
        },
        {
          phoneme: 'ű',
          attempts: 8,
          accuracy: 0.55,
          improvement: 0.05
        },
        {
          phoneme: 'gy',
          attempts: 12,
          accuracy: 0.75,
          improvement: 0.25
        }
      ];

      for (const session of pronunciationSessions) {
        await createPronunciationSession({
          userId: testUserId,
          phoneme: session.phoneme,
          attempts: session.attempts,
          accuracyScore: session.accuracy,
          improvementRate: session.improvement
        });
      }

      const pronunciationAnalysis = await analyticsService.analyzePronunciationProgress(testUserId);

      expect(pronunciationAnalysis).toMatchObject({
        phoneme_analysis: expect.objectContaining({
          'ö': expect.objectContaining({
            current_accuracy: 0.6,
            improvement_trend: 'improving',
            difficulty_level: expect.any(String)
          }),
          'ű': expect.objectContaining({
            current_accuracy: 0.55,
            improvement_trend: expect.any(String),
            difficulty_level: expect.any(String)
          }),
          'gy': expect.objectContaining({
            current_accuracy: 0.75,
            improvement_trend: 'improving',
            difficulty_level: expect.any(String)
          })
        }),
        overall_pronunciation: expect.objectContaining({
          average_accuracy: expect.any(Number),
          most_challenging: expect.arrayContaining(['ö', 'ű']),
          most_improved: expect.arrayContaining(['gy']),
          next_focus_areas: expect.any(Array)
        })
      });
    });

    test('should evaluate grammar concept mastery', async () => {
      // 문법 개념별 학습 데이터 생성
      const grammarConcepts = [
        {
          concept: 'definite_conjugation',
          exercises: [
            { correct: true, difficulty: 'medium' },
            { correct: true, difficulty: 'medium' },
            { correct: false, difficulty: 'hard' },
            { correct: true, difficulty: 'easy' }
          ]
        },
        {
          concept: 'case_system',
          exercises: [
            { correct: false, difficulty: 'hard' },
            { correct: false, difficulty: 'medium' },
            { correct: true, difficulty: 'easy' },
            { correct: true, difficulty: 'easy' }
          ]
        }
      ];

      for (const conceptData of grammarConcepts) {
        await createGrammarLearningData({
          userId: testUserId,
          concept: conceptData.concept,
          exercises: conceptData.exercises
        });
      }

      const grammarAnalysis = await analyticsService.analyzeGrammarProgress(testUserId);

      expect(grammarAnalysis).toMatchObject({
        concept_mastery: expect.objectContaining({
          definite_conjugation: expect.objectContaining({
            mastery_level: expect.any(Number),
            accuracy_by_difficulty: expect.any(Object),
            prerequisite_met: expect.any(Boolean)
          }),
          case_system: expect.objectContaining({
            mastery_level: expect.any(Number),
            accuracy_by_difficulty: expect.any(Object),
            prerequisite_met: expect.any(Boolean)
          })
        }),
        learning_pathway: expect.objectContaining({
          completed_concepts: expect.any(Array),
          current_focus: expect.any(Array),
          next_recommended: expect.any(Array),
          prerequisite_gaps: expect.any(Array)
        })
      });
    });
  });

  describe('Temporal Progress Analysis', () => {
    test('should track progress over time with trend analysis', async () => {
      // 시간에 따른 학습 데이터 생성
      const timePoints = [
        { date: '2024-01-01', accuracy: 0.65, studyTime: 30 },
        { date: '2024-01-08', accuracy: 0.72, studyTime: 35 },
        { date: '2024-01-15', accuracy: 0.78, studyTime: 40 },
        { date: '2024-01-22', accuracy: 0.74, studyTime: 25 }, // 일시적 하락
        { date: '2024-01-29', accuracy: 0.82, studyTime: 45 }
      ];

      for (const point of timePoints) {
        await createWeeklySnapshot({
          userId: testUserId,
          weekStarting: point.date,
          averageAccuracy: point.accuracy,
          totalStudyTimeMinutes: point.studyTime
        });
      }

      const temporalAnalysis = await analyticsService.analyzeTemporalProgress(testUserId, {
        timeframe: '30d',
        granularity: 'weekly'
      });

      expect(temporalAnalysis).toMatchObject({
        trend_analysis: expect.objectContaining({
          overall_trend: 'improving',
          trend_strength: expect.any(Number),
          volatility: expect.any(Number),
          momentum: expect.any(Number)
        }),
        weekly_patterns: expect.arrayContaining([
          expect.objectContaining({
            week_starting: expect.any(String),
            accuracy: expect.any(Number),
            study_time: expect.any(Number),
            relative_performance: expect.any(Number)
          })
        ]),
        performance_forecasting: expect.objectContaining({
          next_week_prediction: expect.any(Object),
          confidence_interval: expect.any(Object),
          factors_considered: expect.any(Array)
        })
      });

      // 전반적인 향상 추세 검증
      expect(temporalAnalysis.trend_analysis.overall_trend).toBe('improving');
    });

    test('should identify learning patterns and optimal study times', async () => {
      // 시간대별 학습 성과 데이터 생성
      const hourlyData = [
        { hour: 9, sessions: 8, averageAccuracy: 0.82 },
        { hour: 14, sessions: 5, averageAccuracy: 0.71 },
        { hour: 19, sessions: 12, averageAccuracy: 0.79 },
        { hour: 22, sessions: 3, averageAccuracy: 0.63 }
      ];

      for (const data of hourlyData) {
        await createHourlyPerformanceData({
          userId: testUserId,
          hour: data.hour,
          sessionCount: data.sessions,
          averageAccuracy: data.averageAccuracy
        });
      }

      const patternAnalysis = await analyticsService.identifyLearningPatterns(testUserId);

      expect(patternAnalysis).toMatchObject({
        optimal_study_times: expect.arrayContaining([
          expect.objectContaining({
            hour: expect.any(Number),
            performance_score: expect.any(Number),
            confidence: expect.any(Number)
          })
        ]),
        session_preferences: expect.objectContaining({
          preferred_duration: expect.any(Number),
          optimal_break_frequency: expect.any(Number),
          attention_span_pattern: expect.any(String)
        }),
        weekly_rhythm: expect.objectContaining({
          most_productive_days: expect.any(Array),
          consistency_score: expect.any(Number),
          weekend_vs_weekday: expect.any(Object)
        })
      });

      // 가장 좋은 학습 시간이 오전 9시로 식별되어야 함
      const bestTime = patternAnalysis.optimal_study_times.reduce((best, current) =>
        current.performance_score > best.performance_score ? current : best
      );
      expect(bestTime.hour).toBe(9);
    });
  });

  // 헬퍼 함수들
  async function createLearningSession(data: any) {
    return DatabaseManager.query(`
      INSERT INTO learning_sessions (
        user_id, session_type, start_time, duration_seconds,
        items_studied, correct_answers, average_response_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      data.userId, data.sessionType, data.startTime, data.duration,
      data.itemsStudied, data.correctAnswers, data.averageResponseTime
    ]);
  }

  async function createVocabularyCards(cards: any[]) {
    const results = [];
    for (const card of cards) {
      const result = await DatabaseManager.query(`
        INSERT INTO vocabulary_cards (
          hungarian_word, korean_meaning, difficulty_level,
          word_class, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `, [card.hungarianWord, card.koreanMeaning, card.difficulty, 'noun']);
      results.push(result.rows[0]);
    }
    return results;
  }

  async function createVocabularyReview(data: any) {
    return DatabaseManager.query(`
      INSERT INTO vocabulary_reviews (
        user_id, card_id, rating, response_time_ms,
        review_type, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `, [
      data.userId, data.cardId, data.rating,
      data.responseTime, data.reviewType || 'review'
    ]);
  }

  async function createPronunciationSession(data: any) {
    return DatabaseManager.query(`
      INSERT INTO pronunciation_sessions (
        user_id, target_phoneme, total_attempts,
        accuracy_score, improvement_rate, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `, [
      data.userId, data.phoneme, data.attempts,
      data.accuracyScore, data.improvementRate
    ]);
  }

  async function createGrammarLearningData(data: any) {
    for (const exercise of data.exercises) {
      await DatabaseManager.query(`
        INSERT INTO grammar_exercises (
          user_id, concept_name, is_correct,
          difficulty_level, completed_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [data.userId, data.concept, exercise.correct, exercise.difficulty]);
    }
  }

  async function createWeeklySnapshot(data: any) {
    return DatabaseManager.query(`
      INSERT INTO weekly_progress_snapshots (
        user_id, week_starting, average_accuracy,
        total_study_time_minutes, created_at
      ) VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `, [
      data.userId, data.weekStarting, data.averageAccuracy,
      data.totalStudyTimeMinutes
    ]);
  }

  async function createHourlyPerformanceData(data: any) {
    return DatabaseManager.query(`
      INSERT INTO hourly_performance (
        user_id, hour_of_day, session_count,
        average_accuracy, created_at
      ) VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `, [data.userId, data.hour, data.sessionCount, data.averageAccuracy]);
  }
});