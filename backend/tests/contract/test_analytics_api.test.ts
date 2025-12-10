// Analytics API 계약 테스트
// Hungarian Learning Platform - Analytics API Contract Tests
// T102 [P] [US5] Contract test for analytics API

import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { app } from '../../src/app';
import { DatabaseManager } from '../../src/lib/database';

describe('Analytics API Contract Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // 테스트 데이터베이스 연결
    await DatabaseManager.connect();

    // 테스트용 사용자 생성 및 로그인
    const signupResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'analytics.test@example.com',
        password: 'testpassword123',
        full_name: 'Analytics Test User',
        korean_level: 'native'
      });

    userId = signupResponse.body.user.id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'analytics.test@example.com',
        password: 'testpassword123'
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await DatabaseManager.cleanup();
    await DatabaseManager.disconnect();
  });

  beforeEach(async () => {
    // 각 테스트 전에 학습 데이터 초기화
    await DatabaseManager.cleanupLearningData();
  });

  describe('GET /api/analytics/overview', () => {
    test('should return user learning overview with valid structure', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        user_id: expect.any(String),
        period: expect.any(String),
        overall_progress: expect.objectContaining({
          total_study_time_hours: expect.any(Number),
          total_words_learned: expect.any(Number),
          current_level: expect.stringMatching(/^(A1|A2|B1|B2|C1|C2)$/),
          level_progress_percentage: expect.any(Number),
          study_streak_days: expect.any(Number),
          total_sessions: expect.any(Number)
        }),
        recent_activity: expect.objectContaining({
          last_7_days: expect.arrayOf(expect.objectContaining({
            date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
            study_time_minutes: expect.any(Number),
            words_practiced: expect.any(Number),
            accuracy_rate: expect.any(Number),
            session_count: expect.any(Number)
          })),
          weekly_summary: expect.objectContaining({
            total_time: expect.any(Number),
            average_accuracy: expect.any(Number),
            improvement_rate: expect.any(Number)
          })
        }),
        skill_breakdown: expect.objectContaining({
          vocabulary: expect.objectContaining({
            level: expect.any(Number),
            progress_percentage: expect.any(Number),
            weak_areas: expect.arrayOf(expect.any(String)),
            strong_areas: expect.arrayOf(expect.any(String))
          }),
          pronunciation: expect.objectContaining({
            level: expect.any(Number),
            progress_percentage: expect.any(Number),
            weak_phonemes: expect.arrayOf(expect.any(String)),
            accuracy_trend: expect.arrayOf(expect.any(Number))
          }),
          grammar: expect.objectContaining({
            level: expect.any(Number),
            progress_percentage: expect.any(Number),
            difficult_concepts: expect.arrayOf(expect.any(String))
          })
        })
      });
    });

    test('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/analytics/overview');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/analytics/learning-patterns', () => {
    test('should return learning pattern analysis', async () => {
      const response = await request(app)
        .get('/api/analytics/learning-patterns')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ period: '30d' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        user_id: expect.any(String),
        analysis_period: expect.any(String),
        study_patterns: expect.objectContaining({
          optimal_study_times: expect.arrayOf(expect.objectContaining({
            hour: expect.any(Number),
            performance_score: expect.any(Number),
            session_count: expect.any(Number)
          })),
          preferred_session_length: expect.objectContaining({
            average_minutes: expect.any(Number),
            optimal_range: expect.objectContaining({
              min: expect.any(Number),
              max: expect.any(Number)
            }),
            efficiency_score: expect.any(Number)
          }),
          weekly_distribution: expect.arrayOf(expect.objectContaining({
            day_of_week: expect.any(Number),
            average_time: expect.any(Number),
            consistency_score: expect.any(Number)
          }))
        }),
        performance_patterns: expect.objectContaining({
          accuracy_trends: expect.arrayOf(expect.objectContaining({
            skill_type: expect.stringMatching(/^(vocabulary|pronunciation|grammar)$/),
            trend_direction: expect.stringMatching(/^(improving|declining|stable)$/),
            change_rate: expect.any(Number),
            confidence_level: expect.any(Number)
          })),
          difficulty_adaptation: expect.objectContaining({
            current_comfort_level: expect.any(Number),
            recommended_difficulty: expect.any(Number),
            challenge_tolerance: expect.any(Number)
          }),
          retention_analysis: expect.objectContaining({
            short_term_retention: expect.any(Number),
            long_term_retention: expect.any(Number),
            forgetting_curve_fit: expect.any(Number)
          })
        }),
        motivation_indicators: expect.objectContaining({
          engagement_score: expect.any(Number),
          consistency_rating: expect.any(Number),
          goal_alignment: expect.any(Number),
          streak_stability: expect.any(Number)
        })
      });
    });

    test('should accept different time periods', async () => {
      const periods = ['7d', '30d', '90d', '1y'];

      for (const period of periods) {
        const response = await request(app)
          .get('/api/analytics/learning-patterns')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ period });

        expect(response.status).toBe(200);
        expect(response.body.analysis_period).toBe(period);
      }
    });
  });

  describe('GET /api/analytics/weaknesses', () => {
    test('should identify and prioritize learning weaknesses', async () => {
      const response = await request(app)
        .get('/api/analytics/weaknesses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        user_id: expect.any(String),
        analysis_date: expect.any(String),
        weakness_categories: expect.arrayOf(expect.objectContaining({
          category: expect.stringMatching(/^(vocabulary|pronunciation|grammar|fluency)$/),
          severity: expect.stringMatching(/^(critical|high|medium|low)$/),
          confidence: expect.any(Number),
          specific_areas: expect.arrayOf(expect.objectContaining({
            area_name: expect.any(String),
            accuracy_rate: expect.any(Number),
            practice_frequency: expect.any(Number),
            improvement_potential: expect.any(Number)
          })),
          recommended_actions: expect.arrayOf(expect.objectContaining({
            action_type: expect.any(String),
            priority: expect.any(Number),
            estimated_improvement: expect.any(Number),
            time_investment: expect.any(Number)
          }))
        })),
        priority_recommendations: expect.arrayOf(expect.objectContaining({
          recommendation_id: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          expected_benefit: expect.any(Number),
          difficulty_level: expect.any(Number),
          time_requirement: expect.any(Number)
        })),
        comparative_analysis: expect.objectContaining({
          peer_comparison: expect.objectContaining({
            user_percentile: expect.any(Number),
            average_performance: expect.any(Number),
            areas_above_average: expect.arrayOf(expect.any(String)),
            areas_below_average: expect.arrayOf(expect.any(String))
          }),
          cefr_alignment: expect.objectContaining({
            current_level: expect.any(String),
            level_progress: expect.any(Number),
            blocking_skills: expect.arrayOf(expect.any(String)),
            advancement_requirements: expect.arrayOf(expect.any(String))
          })
        })
      });
    });
  });

  describe('GET /api/analytics/progress-prediction', () => {
    test('should provide learning progress predictions', async () => {
      const response = await request(app)
        .get('/api/analytics/progress-prediction')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ target_level: 'B1', time_horizon: '6m' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        user_id: expect.any(String),
        current_state: expect.objectContaining({
          level: expect.any(String),
          skill_scores: expect.any(Object),
          learning_velocity: expect.any(Number)
        }),
        prediction_scenarios: expect.arrayOf(expect.objectContaining({
          scenario_name: expect.any(String),
          study_intensity: expect.any(Number),
          predicted_outcomes: expect.objectContaining({
            target_level_probability: expect.any(Number),
            estimated_completion_date: expect.any(String),
            confidence_interval: expect.objectContaining({
              lower_bound: expect.any(String),
              upper_bound: expect.any(String)
            })
          }),
          milestone_predictions: expect.arrayOf(expect.objectContaining({
            milestone: expect.any(String),
            predicted_date: expect.any(String),
            probability: expect.any(Number)
          }))
        })),
        optimization_suggestions: expect.arrayOf(expect.objectContaining({
          strategy: expect.any(String),
          expected_acceleration: expect.any(Number),
          implementation_difficulty: expect.any(Number)
        }))
      });
    });

    test('should validate target level parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/progress-prediction')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ target_level: 'INVALID', time_horizon: '6m' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: expect.any(String),
        details: expect.stringContaining('target_level')
      });
    });
  });

  describe('POST /api/analytics/custom-report', () => {
    test('should generate custom analytics report', async () => {
      const reportConfig = {
        report_type: 'comprehensive',
        date_range: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        metrics: ['vocabulary', 'pronunciation', 'study_patterns'],
        comparison_type: 'self_progress',
        granularity: 'weekly'
      };

      const response = await request(app)
        .post('/api/analytics/custom-report')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportConfig);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        report_id: expect.any(String),
        generated_at: expect.any(String),
        configuration: expect.objectContaining(reportConfig),
        data_summary: expect.objectContaining({
          total_data_points: expect.any(Number),
          coverage_percentage: expect.any(Number),
          data_quality_score: expect.any(Number)
        }),
        metrics_data: expect.any(Object),
        insights: expect.arrayOf(expect.objectContaining({
          insight_type: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          confidence: expect.any(Number),
          supporting_data: expect.any(Object)
        })),
        export_options: expect.objectContaining({
          formats: expect.arrayOf(expect.any(String)),
          download_links: expect.any(Object)
        })
      });
    });

    test('should validate report configuration', async () => {
      const invalidConfig = {
        report_type: 'invalid_type',
        metrics: []
      };

      const response = await request(app)
        .post('/api/analytics/custom-report')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidConfig);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/analytics/peer-comparison', () => {
    test('should provide anonymized peer comparison data', async () => {
      const response = await request(app)
        .get('/api/analytics/peer-comparison')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          level: 'A2',
          study_duration: '3m'
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        user_id: expect.any(String),
        comparison_cohort: expect.objectContaining({
          size: expect.any(Number),
          criteria: expect.any(Object),
          anonymization_level: expect.any(String)
        }),
        performance_comparison: expect.objectContaining({
          vocabulary_percentile: expect.any(Number),
          pronunciation_percentile: expect.any(Number),
          overall_progress_percentile: expect.any(Number),
          study_efficiency_rank: expect.any(Number)
        }),
        benchmark_metrics: expect.objectContaining({
          average_study_time: expect.any(Number),
          average_accuracy: expect.any(Number),
          typical_progression_rate: expect.any(Number),
          common_struggle_points: expect.arrayOf(expect.any(String))
        }),
        relative_insights: expect.arrayOf(expect.objectContaining({
          metric: expect.any(String),
          user_value: expect.any(Number),
          cohort_average: expect.any(Number),
          interpretation: expect.any(String),
          actionable_advice: expect.any(String)
        }))
      });
    });
  });

  describe('GET /api/analytics/study-recommendations', () => {
    test('should provide personalized study recommendations', async () => {
      const response = await request(app)
        .get('/api/analytics/study-recommendations')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          goal_type: 'level_advancement',
          available_time: '30',
          priority: 'balanced'
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        user_id: expect.any(String),
        recommendation_context: expect.objectContaining({
          goal_type: 'level_advancement',
          available_time: 30,
          user_preferences: expect.any(Object),
          current_performance: expect.any(Object)
        }),
        immediate_recommendations: expect.arrayOf(expect.objectContaining({
          activity_type: expect.any(String),
          estimated_duration: expect.any(Number),
          expected_benefit: expect.any(Number),
          difficulty_match: expect.any(Number),
          rationale: expect.any(String)
        })),
        weekly_plan: expect.objectContaining({
          total_time_allocation: expect.any(Number),
          daily_sessions: expect.arrayOf(expect.objectContaining({
            day: expect.any(String),
            activities: expect.arrayOf(expect.any(Object)),
            focus_areas: expect.arrayOf(expect.any(String))
          }))
        }),
        adaptive_elements: expect.objectContaining({
          adjustment_triggers: expect.arrayOf(expect.any(String)),
          backup_activities: expect.arrayOf(expect.any(Object)),
          progress_checkpoints: expect.arrayOf(expect.any(String))
        })
      });
    });
  });
});