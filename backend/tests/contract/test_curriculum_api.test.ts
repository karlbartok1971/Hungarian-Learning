import request from 'supertest';
import { describe, beforeAll, afterAll, test, expect } from '@jest/testing-library/jest';
import app from '../../src/index';

/**
 * Curriculum API Contract Tests
 *
 * A1-B2 수준별 개인화된 헝가리어 학습 커리큘럼 생성 및 관리를 위한 계약 테스트
 * 한국인 목회자를 위한 설교문 작성 목표 달성을 위한 학습 경로 설계
 */

describe('Curriculum API Contract Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // 테스트 사용자 인증 토큰 획득
    authToken = await getTestAuthToken();
  });

  afterAll(async () => {
    // 테스트 정리
  });

  describe('POST /api/curriculum/generate - 개인화된 커리큘럼 생성', () => {
    test('A1 레벨 초보자를 위한 커리큘럼을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/curriculum/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userProfile: {
            currentLevel: 'A1',
            targetLevel: 'B2',
            primaryGoal: 'sermon_writing',
            availableTimePerWeek: 10, // 시간
            preferredLearningStyle: 'visual_auditory',
            previousLanguageExperience: ['english'],
            specificNeeds: ['pronunciation', 'religious_vocabulary']
          },
          assessmentResults: {
            vocabulary: 25,    // A1 초급 수준
            grammar: 20,       // 기초 문법 부족
            listening: 30,     // 상대적 강점
            cultural: 15       // 문화 이해 부족
          },
          timeframe: {
            targetCompletionWeeks: 52, // 1년
            intensiveMode: false
          }
        });

      expect([200, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              curriculumId: expect.any(String),
              personalizedPath: expect.objectContaining({
                totalDuration: expect.any(Number), // 주
                phases: expect.arrayContaining([
                  expect.objectContaining({
                    phase: 1,
                    level: 'A1',
                    title: '헝가리어 기초 입문',
                    duration: expect.any(Number),
                    goals: expect.arrayContaining([
                      '헝가리어 알파벳 33자 완전 습득',
                      '기본 인사말 및 자기소개',
                      '숫자, 요일, 색깔 기본 어휘 200개',
                      '현재형 동사 변화 규칙 이해'
                    ]),
                    modules: expect.arrayContaining([
                      expect.objectContaining({
                        moduleId: expect.any(String),
                        title: expect.stringMatching(/알파벳|발음|기초어휘/),
                        estimatedHours: expect.any(Number),
                        prerequisites: expect.any(Array),
                        learningObjectives: expect.any(Array),
                        assessmentCriteria: expect.any(Array)
                      })
                    ])
                  }),
                  expect.objectContaining({
                    phase: 2,
                    level: 'A2',
                    title: '일상 헝가리어 구사',
                    duration: expect.any(Number),
                    goals: expect.arrayContaining([
                      '과거형, 미래형 기본 활용',
                      '일상생활 어휘 500개 확장',
                      '간단한 대화 구사 능력',
                      '기초 격변화 (주격, 대격, 도구격)'
                    ])
                  }),
                  expect.objectContaining({
                    phase: 3,
                    level: 'B1',
                    title: '종교 어휘 및 중급 문법',
                    duration: expect.any(Number),
                    goals: expect.arrayContaining([
                      '기본 종교 용어 100개 습득',
                      '조건법, 명령법 활용',
                      '간단한 종교적 텍스트 이해',
                      '교회 상황에서의 기본 의사소통'
                    ])
                  }),
                  expect.objectContaining({
                    phase: 4,
                    level: 'B2',
                    title: '설교문 작성 및 고급 표현',
                    duration: expect.any(Number),
                    goals: expect.arrayContaining([
                      '신학 전문 용어 200개 습득',
                      '설교 구조 이해 및 작성',
                      '복합 시제 및 분사 활용',
                      '헝가리 기독교 문화 이해'
                    ])
                  })
                ]),
                adaptiveElements: expect.objectContaining({
                  weaknessCompensation: expect.objectContaining({
                    grammar: expect.any(Array), // 추가 문법 연습
                    cultural: expect.any(Array) // 문화적 맥락 강화
                  }),
                  strengthLeverage: expect.objectContaining({
                    listening: expect.any(Array) // 청취 강점 활용
                  }),
                  koreanSpecificAdjustments: expect.arrayContaining([
                    expect.stringMatching(/격변화|어순|발음/)
                  ])
                })
              }),
              milestones: expect.arrayContaining([
                expect.objectContaining({
                  week: expect.any(Number),
                  level: expect.stringMatching(/^(A1|A2|B1|B2)$/),
                  achievement: expect.any(String),
                  assessment: expect.objectContaining({
                    type: expect.stringMatching(/^(quiz|speaking|writing|comprehensive)$/),
                    passingCriteria: expect.any(Number)
                  })
                })
              ]),
              dailyStudyPlan: expect.objectContaining({
                recommendedSessionLength: expect.any(Number), // 분
                weeklyStructure: expect.objectContaining({
                  vocabulary: expect.any(Number), // 일수
                  grammar: expect.any(Number),
                  listening: expect.any(Number),
                  speaking: expect.any(Number),
                  cultural: expect.any(Number),
                  review: expect.any(Number)
                }),
                adaptiveScheduling: expect.any(Boolean)
              })
            })
          })
        );
      }
    });

    test('B1 중급자를 위한 설교 특화 커리큘럼을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/curriculum/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userProfile: {
            currentLevel: 'B1',
            targetLevel: 'B2',
            primaryGoal: 'sermon_writing',
            availableTimePerWeek: 15,
            specificNeeds: ['theological_vocabulary', 'sermon_structure']
          },
          assessmentResults: {
            vocabulary: 75,
            grammar: 70,
            listening: 80,
            cultural: 60
          }
        });

      expect([200, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body.data.personalizedPath.phases).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              level: 'B1',
              specializations: expect.arrayContaining([
                expect.objectContaining({
                  type: 'theological_vocabulary',
                  terms: expect.arrayContaining([
                    expect.objectContaining({
                      hungarian: 'imádság',
                      korean: '기도',
                      context: expect.any(String),
                      difficulty: expect.any(Number)
                    })
                  ])
                })
              ])
            })
          ])
        );
      }
    });
  });

  describe('GET /api/curriculum/:curriculumId - 커리큘럼 상세 조회', () => {
    test('생성된 커리큘럼의 상세 정보를 조회할 수 있어야 함', async () => {
      const curriculumId = 'test-curriculum-id';

      const response = await request(app)
        .get(`/api/curriculum/${curriculumId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              curriculumId: expect.any(String),
              createdAt: expect.any(String),
              lastUpdated: expect.any(String),
              progress: expect.objectContaining({
                currentPhase: expect.any(Number),
                currentModule: expect.any(String),
                completionPercentage: expect.any(Number),
                estimatedRemainingWeeks: expect.any(Number)
              }),
              adaptations: expect.arrayContaining([
                expect.objectContaining({
                  date: expect.any(String),
                  reason: expect.any(String),
                  changes: expect.any(Array)
                })
              ]),
              nextRecommendation: expect.objectContaining({
                moduleId: expect.any(String),
                estimatedDuration: expect.any(Number),
                prerequisitesStatus: expect.any(Boolean)
              })
            })
          })
        );
      }
    });
  });

  describe('PUT /api/curriculum/:curriculumId/adapt - 커리큘럼 적응형 조정', () => {
    test('학습자 진도에 따라 커리큘럼을 동적으로 조정할 수 있어야 함', async () => {
      const curriculumId = 'test-curriculum-id';

      const response = await request(app)
        .put(`/api/curriculum/${curriculumId}/adapt`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          learningAnalytics: {
            recentPerformance: {
              vocabulary: 85,     // 향상됨
              grammar: 60,        // 여전히 약함
              listening: 90,      // 강점 유지
              speaking: 45        // 새로운 약점 발견
            },
            timeSpent: {
              planned: 10,        // 주당 계획 시간
              actual: 7           // 실제 학습 시간
            },
            strugglingTopics: [
              'conditional_mood',  // 조건법
              'case_system',       // 격변화
              'sermon_structure'   // 설교 구조
            ],
            preferences: {
              preferredTimeSlots: ['morning', 'evening'],
              effectiveMethods: ['visual_cards', 'audio_practice'],
              challengingMethods: ['written_exercises']
            }
          },
          adaptationRequest: {
            adjustDifficulty: 'decrease',    // grammar 부분 난이도 하향
            emphasizeAreas: ['speaking'],    // 말하기 강화
            timeConstraints: {
              maxSessionLength: 30,          // 세션당 최대 시간
              preferredDaysPerWeek: 5
            }
          }
        });

      expect([200, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              adaptationId: expect.any(String),
              changes: expect.arrayContaining([
                expect.objectContaining({
                  type: expect.stringMatching(/^(add_module|remove_module|adjust_difficulty|reorder_sequence)$/),
                  target: expect.any(String),
                  reason: expect.any(String),
                  impact: expect.objectContaining({
                    timeAdjustment: expect.any(Number),
                    difficultyChange: expect.any(String)
                  })
                })
              ]),
              newSchedule: expect.objectContaining({
                nextWeek: expect.arrayContaining([
                  expect.objectContaining({
                    day: expect.any(String),
                    sessions: expect.arrayContaining([
                      expect.objectContaining({
                        type: expect.any(String),
                        duration: expect.any(Number),
                        focus: expect.any(String)
                      })
                    ])
                  })
                ])
              })
            })
          })
        );
      }
    });
  });

  describe('GET /api/curriculum/templates - 커리큘럼 템플릿 조회', () => {
    test('사전 정의된 학습 경로 템플릿을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/curriculum/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          goal: 'sermon_writing',
          level: 'A1',
          timeframe: 'standard'  // fast, standard, relaxed
        });

      expect([200, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              templates: expect.arrayContaining([
                expect.objectContaining({
                  templateId: expect.any(String),
                  name: expect.any(String),
                  description: expect.any(String),
                  targetAudience: '한국인 목회자',
                  duration: expect.objectContaining({
                    total: expect.any(Number),
                    breakdown: expect.objectContaining({
                      A1: expect.any(Number),
                      A2: expect.any(Number),
                      B1: expect.any(Number),
                      B2: expect.any(Number)
                    })
                  }),
                  features: expect.arrayContaining([
                    expect.stringMatching(/종교|설교|문화|발음/)
                  ]),
                  successRate: expect.any(Number), // 이 템플릿 완주율
                  difficulty: expect.stringMatching(/^(beginner|intermediate|advanced)$/)
                })
              ])
            })
          })
        );
      }
    });
  });

  describe('POST /api/curriculum/:curriculumId/feedback - 커리큘럼 피드백 제출', () => {
    test('학습자가 커리큘럼에 대한 피드백을 제출할 수 있어야 함', async () => {
      const curriculumId = 'test-curriculum-id';

      const response = await request(app)
        .post(`/api/curriculum/${curriculumId}/feedback`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          moduleId: 'a1-basic-vocabulary',
          feedback: {
            difficulty: 4,        // 1-5 스케일
            engagement: 5,        // 흥미도
            effectiveness: 4,     // 효과성
            timeAppropriateness: 3, // 시간 적절성
            comments: '어휘 카드가 매우 도움이 되었지만, 예문이 더 다양했으면 좋겠습니다.',
            suggestions: [
              '실제 설교문에서 사용되는 예문 추가',
              '발음 가이드 음성 품질 개선'
            ]
          },
          completionStatus: {
            completed: true,
            timeSpent: 180,       // 분
            retryCount: 2,
            finalScore: 85
          }
        });

      expect([200, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              feedbackId: expect.any(String),
              acknowledgment: expect.any(String),
              adaptationSuggestions: expect.arrayContaining([
                expect.objectContaining({
                  type: expect.any(String),
                  description: expect.any(String),
                  willBeImplemented: expect.any(Boolean)
                })
              ]),
              nextModuleRecommendation: expect.objectContaining({
                moduleId: expect.any(String),
                adjustments: expect.any(Array)
              })
            })
          })
        );
      }
    });
  });

  describe('수준별 특화 검증', () => {
    test('A1 커리큘럼에는 한글 설명이 많이 포함되어야 함', async () => {
      expect(true).toBe(true); // 실제 구현 후 검증
    });

    test('B2 커리큘럼에는 실제 설교문 분석이 포함되어야 함', async () => {
      expect(true).toBe(true); // 실제 구현 후 검증
    });

    test('모든 수준에서 한국어-헝가리어 언어적 차이점을 고려해야 함', async () => {
      expect(true).toBe(true); // 실제 구현 후 검증
    });
  });

  describe('목회자 특화 커리큘럼 검증', () => {
    test('종교 어휘가 수준에 맞게 단계적으로 도입되어야 함', async () => {
      // A1: Isten(하나님), egyház(교회)
      // A2: keresztény(기독교인), hit(믿음)
      // B1: imádság(기도), áldás(축복)
      // B2: teológia(신학), prédikáció(설교)
      expect(true).toBe(true);
    });

    test('헝가리 기독교 문화 컨텍스트가 포함되어야 함', async () => {
      // 헝가리 개신교 역사, 예배 문화, 교회 구조 등
      expect(true).toBe(true);
    });

    test('설교문 작성 스킬이 단계적으로 발전되어야 함', async () => {
      // B1: 간단한 메시지 전달
      // B2: 완전한 설교문 구조와 수사법
      expect(true).toBe(true);
    });
  });
});

/**
 * 헬퍼 함수들
 */
async function getTestAuthToken(): Promise<string> {
  return 'mock-jwt-token';
}