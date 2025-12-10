import request from 'supertest';
import { describe, beforeAll, afterAll, test, expect } from '@jest/globals';
import app from '../../src/index';

/**
 * Sermon Assistance API Contract Tests
 *
 * 헝가리어 설교문 작성을 위한 AI 기반 도구의 계약 테스트
 * 한국인 목회자가 자연스러운 헝가리어 설교문을 작성할 수 있도록 지원
 */

describe('Sermon API Contract Tests', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // 테스트 사용자 인증 토큰 획득
    authToken = await getTestAuthToken();
    testUserId = 'test-user-pastor-123';
  });

  afterAll(async () => {
    // 테스트 정리
    await cleanupTestData();
  });

  describe('POST /api/sermon/generate-outline - 설교 개요 생성', () => {
    test('주제를 기반으로 헝가리어 설교 구조를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/sermon/generate-outline')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          topic: {
            korean: '하나님의 사랑과 용서',
            scripture: '요한복음 3:16',
            targetAudience: 'general_congregation',
            sermonLength: 'medium' // short(15분), medium(25분), long(35분)
          },
          userLevel: 'B1',
          preferences: {
            style: 'traditional', // traditional, contemporary, expository
            emphasis: ['practical_application', 'scriptural_depth'],
            avoidTopics: []
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('outline');

      const outline = response.body.data.outline;
      expect(outline).toHaveProperty('title');
      expect(outline.title).toHaveProperty('hungarian');
      expect(outline.title).toHaveProperty('korean_meaning');

      expect(outline).toHaveProperty('sections');
      expect(Array.isArray(outline.sections)).toBe(true);
      expect(outline.sections.length).toBeGreaterThan(2);

      // 각 섹션의 구조 검증
      outline.sections.forEach((section: any) => {
        expect(section).toHaveProperty('type'); // introduction, main_point, illustration, application, conclusion
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('suggested_content');
        expect(section).toHaveProperty('key_vocabulary');
        expect(section).toHaveProperty('estimated_duration');
      });

      expect(outline).toHaveProperty('theological_terms');
      expect(outline).toHaveProperty('total_estimated_duration');
    });

    test('성경 본문을 기반으로 강해설교 구조를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/sermon/generate-outline')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          topic: {
            scripture: '로마서 8:28-30',
            exposition_mode: true,
            targetAudience: 'mature_believers'
          },
          userLevel: 'B2',
          preferences: {
            style: 'expository',
            emphasis: ['verse_by_verse', 'theological_depth']
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.data.outline.sections).toContain(
        expect.objectContaining({
          type: 'scripture_analysis'
        })
      );
    });
  });

  describe('POST /api/sermon/check-grammar - 문법 및 표현 검사', () => {
    test('헝가리어 설교문의 문법을 검사하고 개선 사항을 제안할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/sermon/check-grammar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: `Kedves testvérek! Ma beszélni szeretnék Isten szeretetéről.
                 A Biblia mondja nekünk, hogy Isten úgy szerette világot,
                 hogy egyszülött fiát adta érte.`,
          level: 'B1',
          check_options: {
            grammar: true,
            style: true,
            theology: true,
            pronunciation_hints: true
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('analysis');

      const analysis = response.body.data.analysis;
      expect(analysis).toHaveProperty('grammar_issues');
      expect(analysis).toHaveProperty('style_suggestions');
      expect(analysis).toHaveProperty('theological_review');
      expect(analysis).toHaveProperty('pronunciation_guides');
      expect(analysis).toHaveProperty('overall_score');

      // 문법 이슈 구조 검증
      if (analysis.grammar_issues.length > 0) {
        analysis.grammar_issues.forEach((issue: any) => {
          expect(issue).toHaveProperty('type'); // agreement, case, word_order, etc.
          expect(issue).toHaveProperty('position');
          expect(issue).toHaveProperty('original_text');
          expect(issue).toHaveProperty('suggested_correction');
          expect(issue).toHaveProperty('explanation_korean');
          expect(issue).toHaveProperty('severity'); // high, medium, low
        });
      }

      // 신학적 검토 구조
      expect(analysis.theological_review).toHaveProperty('accuracy_score');
      expect(analysis.theological_review).toHaveProperty('terminology_suggestions');
    });

    test('잘못된 텍스트 입력에 대해 적절한 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/sermon/check-grammar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: '', // 빈 텍스트
          level: 'B1'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('텍스트');
    });
  });

  describe('GET /api/sermon/theological-terms - 신학 용어 검색', () => {
    test('한국어 검색으로 헝가리어 신학 용어를 찾을 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/sermon/theological-terms')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          search: '구원',
          category: 'soteriology',
          level: 'B1'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('terms');

      const terms = response.body.data.terms;
      expect(Array.isArray(terms)).toBe(true);

      if (terms.length > 0) {
        terms.forEach((term: any) => {
          expect(term).toHaveProperty('hungarian');
          expect(term).toHaveProperty('korean_meaning');
          expect(term).toHaveProperty('category');
          expect(term).toHaveProperty('difficulty_level');
          expect(term).toHaveProperty('usage_examples');
          expect(term).toHaveProperty('related_terms');
          expect(term).toHaveProperty('pronunciation_guide');
        });
      }
    });

    test('카테고리별 신학 용어 목록을 가져올 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/sermon/theological-terms')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          category: 'christology',
          level: 'all'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.terms).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/sermon/save-draft - 설교문 초안 저장', () => {
    test('설교문 초안을 저장하고 관리할 수 있어야 함', async () => {
      const sermonDraft = {
        title: {
          hungarian: 'Isten szeretete és kegyelme',
          korean: '하나님의 사랑과 은혜'
        },
        scripture_reference: '에베소서 2:8-9',
        content: {
          introduction: 'Kedves testvérek...',
          main_body: 'A mai napon...',
          conclusion: 'Zárásként...'
        },
        metadata: {
          target_audience: 'general_congregation',
          estimated_duration: 25,
          difficulty_level: 'B1',
          tags: ['grace', 'salvation', 'faith']
        }
      };

      const response = await request(app)
        .post('/api/sermon/save-draft')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId,
          draft: sermonDraft
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('draft_id');
      expect(response.body.data).toHaveProperty('created_at');
      expect(response.body.data).toHaveProperty('version');
    });
  });

  describe('GET /api/sermon/drafts/:userId - 사용자의 설교문 목록 조회', () => {
    test('사용자의 저장된 설교문 목록을 가져올 수 있어야 함', async () => {
      const response = await request(app)
        .get(`/api/sermon/drafts/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          limit: 10,
          sort: 'recent'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('drafts');
      expect(response.body.data).toHaveProperty('total_count');
      expect(response.body.data).toHaveProperty('pagination');

      const drafts = response.body.data.drafts;
      if (drafts.length > 0) {
        drafts.forEach((draft: any) => {
          expect(draft).toHaveProperty('id');
          expect(draft).toHaveProperty('title');
          expect(draft).toHaveProperty('created_at');
          expect(draft).toHaveProperty('updated_at');
          expect(draft).toHaveProperty('status'); // draft, completed, archived
        });
      }
    });
  });

  describe('POST /api/sermon/improve-expression - 표현 개선 제안', () => {
    test('자연스럽지 않은 헝가리어 표현을 개선할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/sermon/improve-expression')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Ez a mondat nem túl jó magyar nyelven.',
          context: 'sermon_introduction',
          target_level: 'B2',
          improvement_focus: ['naturalness', 'formality', 'clarity']
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('suggestions');

      const suggestions = response.body.data.suggestions;
      expect(Array.isArray(suggestions)).toBe(true);

      if (suggestions.length > 0) {
        suggestions.forEach((suggestion: any) => {
          expect(suggestion).toHaveProperty('improved_text');
          expect(suggestion).toHaveProperty('explanation_korean');
          expect(suggestion).toHaveProperty('confidence_score');
          expect(suggestion).toHaveProperty('formality_level');
          expect(suggestion).toHaveProperty('why_better');
        });
      }
    });
  });

  describe('POST /api/sermon/generate-illustrations - 예화 생성', () => {
    test('설교 주제에 맞는 헝가리어 예화를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/sermon/generate-illustrations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          main_point: {
            korean: '하나님의 무조건적 사랑',
            theological_concept: 'agape_love'
          },
          illustration_type: 'contemporary', // biblical, historical, contemporary, personal
          target_audience: 'general_congregation',
          cultural_context: 'hungarian_church'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('illustrations');

      const illustrations = response.body.data.illustrations;
      expect(Array.isArray(illustrations)).toBe(true);

      if (illustrations.length > 0) {
        illustrations.forEach((illustration: any) => {
          expect(illustration).toHaveProperty('title');
          expect(illustration).toHaveProperty('story_hungarian');
          expect(illustration).toHaveProperty('application_point');
          expect(illustration).toHaveProperty('cultural_relevance_score');
          expect(illustration).toHaveProperty('suggested_transitions');
        });
      }
    });
  });

  describe('Error Handling', () => {
    test('인증되지 않은 요청에 대해 401을 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/sermon/generate-outline')
        .send({ topic: { korean: '테스트' } });

      expect(response.status).toBe(401);
    });

    test('잘못된 사용자 레벨에 대해 적절한 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/sermon/check-grammar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Test text',
          level: 'INVALID_LEVEL'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('레벨');
    });
  });
});

// 헬퍼 함수들
async function getTestAuthToken(): Promise<string> {
  // 실제 구현에서는 테스트 사용자 로그인 로직
  return 'test-auth-token-for-pastor';
}

async function cleanupTestData(): Promise<void> {
  // 테스트 후 생성된 데이터 정리
  console.log('Cleaning up test data for sermon API tests');
}