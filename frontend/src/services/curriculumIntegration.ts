// User Story 1 커리큘럼과 User Story 2 발음 연습 통합
// T060 - 개인화된 학습 경로와 실시간 발음 연습 시스템 연계

import { pronunciationApi } from './pronunciationApi';

// 커리큘럼 통합 인터페이스
export interface CurriculumIntegration {
  levelId: string;
  lessonId: string;
  pronunciationExercises: PronunciationExercise[];
  grammarIntegration: GrammarPronunciationLink[];
  progressTracking: IntegratedProgress;
}

export interface PronunciationExercise {
  id: string;
  lessonId: string;
  text: string;
  phonetics: string;
  grammarFocus: string[];
  difficulty: number;
  category: 'vocabulary' | 'grammar' | 'sentence' | 'dialogue';
  contextualHints: string[];
  prerequisites: string[];
  learningObjectives: string[];
}

export interface GrammarPronunciationLink {
  grammarRuleId: string;
  grammarRuleName: string;
  relevantPhonemes: string[];
  practiceExercises: string[];
  explanationKorean: string;
  commonMistakes: string[];
}

export interface IntegratedProgress {
  userId: string;
  levelId: string;
  grammarProgress: GrammarProgress;
  pronunciationProgress: PronunciationProgress;
  integrationScore: number;
  recommendations: LearningRecommendation[];
}

export interface GrammarProgress {
  completedLessons: string[];
  currentLesson: string;
  masteryScores: Record<string, number>;
  weakAreas: string[];
}

export interface PronunciationProgress {
  completedExercises: string[];
  averageScore: number;
  phonemeScores: Record<string, number>;
  improvementAreas: string[];
}

export interface LearningRecommendation {
  type: 'grammar_review' | 'pronunciation_practice' | 'integrated_exercise';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  resourceId: string;
  estimatedTime: number;
}

/**
 * 커리큘럼 통합 서비스 클래스
 */
export class CurriculumIntegrationService {

  /**
   * 특정 레벨의 통합 커리큘럼 생성
   */
  async generateIntegratedCurriculum(levelId: string, userId: string): Promise<CurriculumIntegration> {
    try {
      // 사용자의 현재 진도 정보 가져오기
      const [grammarProgress, pronunciationProgress] = await Promise.all([
        this.getGrammarProgress(userId, levelId),
        pronunciationApi.getUserProgress(userId)
      ]);

      // 레벨별 발음 연습 문제 생성
      const pronunciationExercises = await this.generatePronunciationExercises(levelId, grammarProgress);

      // 문법-발음 연계 정보 생성
      const grammarIntegration = await this.createGrammarPronunciationLinks(levelId, grammarProgress);

      // 통합 진도 추적 설정
      const progressTracking = this.createIntegratedProgress(
        userId,
        levelId,
        grammarProgress,
        pronunciationProgress
      );

      return {
        levelId,
        lessonId: grammarProgress.currentLesson,
        pronunciationExercises,
        grammarIntegration,
        progressTracking
      };

    } catch (error) {
      throw new Error(`통합 커리큘럼 생성 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 문법 진도에 맞는 발음 연습 문제 생성
   */
  private async generatePronunciationExercises(
    levelId: string,
    grammarProgress: GrammarProgress
  ): Promise<PronunciationExercise[]> {

    const exercises: PronunciationExercise[] = [];

    // A1 레벨 기본 발음 연습
    if (levelId === 'A1') {
      exercises.push(
        {
          id: 'A1-pron-01',
          lessonId: 'A1-01-01',
          text: 'Péter tanár.',
          phonetics: '[ˈpeːtɛr ˈtɒnaːr]',
          grammarFocus: ['기본 문장구조', 'van 생략'],
          difficulty: 1,
          category: 'sentence',
          contextualHints: [
            'Péter는 첫음절에 강세',
            'tanár의 á는 장모음으로 발음',
            'van은 생략됨'
          ],
          prerequisites: [],
          learningObjectives: [
            '헝가리어 기본 어순 익히기',
            '첫음절 강세 연습하기',
            '장모음과 단모음 구분하기'
          ]
        },
        {
          id: 'A1-pron-02',
          lessonId: 'A1-01-02',
          text: 'Én vagyok.',
          phonetics: '[eːn ˈvɒɟok]',
          grammarFocus: ['인칭대명사', 'van 동사 활용'],
          difficulty: 1,
          category: 'grammar',
          contextualHints: [
            'én의 é는 장모음',
            'vagyok에서 gy는 구개음',
            '첫음절 강세 유지'
          ],
          prerequisites: ['A1-pron-01'],
          learningObjectives: [
            '인칭대명사 발음하기',
            'van 동사 활용 익히기',
            '구개음 gy 연습하기'
          ]
        }
      );
    }

    // 문법 진도에 따른 추가 연습문제 생성
    for (const completedLesson of grammarProgress.completedLessons) {
      const additionalExercises = await this.generateExercisesForLesson(completedLesson);
      exercises.push(...additionalExercises);
    }

    return exercises;
  }

  /**
   * 특정 레슨에 대한 발음 연습문제 생성
   */
  private async generateExercisesForLesson(lessonId: string): Promise<PronunciationExercise[]> {
    // 레슨별 발음 연습 매핑
    const lessonExerciseMap: Record<string, PronunciationExercise[]> = {
      'A1-01-03': [
        {
          id: 'A1-pron-03',
          lessonId: 'A1-01-03',
          text: 'Mi vagyunk itt.',
          phonetics: '[mi ˈvɒɟunk ˈitt]',
          grammarFocus: ['van 동사 복수형', '장소 표현'],
          difficulty: 2,
          category: 'sentence',
          contextualHints: [
            'vagyunk에서 복수 어미 -unk',
            'itt는 짧고 강하게',
            '첫음절 강세 유지'
          ],
          prerequisites: ['A1-pron-02'],
          learningObjectives: [
            'van 동사 복수형 연습',
            '복수 인칭 발음하기',
            '장소 부사 익히기'
          ]
        }
      ]
    };

    return lessonExerciseMap[lessonId] || [];
  }

  /**
   * 문법-발음 연계 정보 생성
   */
  private async createGrammarPronunciationLinks(
    levelId: string,
    grammarProgress: GrammarProgress
  ): Promise<GrammarPronunciationLink[]> {

    const links: GrammarPronunciationLink[] = [];

    // A1 레벨 문법-발음 연계
    if (levelId === 'A1') {
      links.push(
        {
          grammarRuleId: 'A1-rule-01',
          grammarRuleName: 'van 동사 활용',
          relevantPhonemes: ['ɒ', 'ɟ', 'u', 'o'],
          practiceExercises: ['A1-pron-02', 'A1-pron-03'],
          explanationKorean: 'van 동사 활용시 각 인칭별 음성 변화를 정확히 발음해야 합니다.',
          commonMistakes: [
            'vagyok의 gy를 g로 발음',
            'vannak의 이중 n을 단순하게 발음',
            '어미 변화 무시'
          ]
        },
        {
          grammarRuleId: 'A1-rule-02',
          grammarRuleName: '첫음절 강세',
          relevantPhonemes: ['강세'],
          practiceExercises: ['A1-pron-01', 'A1-pron-02', 'A1-pron-03'],
          explanationKorean: '헝가리어는 항상 첫음절에 강세가 옵니다. 이는 문법 구조와 무관합니다.',
          commonMistakes: [
            '마지막 음절에 강세',
            '영어식 강세 패턴 적용',
            '강세 없이 평평하게 발음'
          ]
        }
      );
    }

    return links;
  }

  /**
   * 통합 진도 추적 생성
   */
  private createIntegratedProgress(
    userId: string,
    levelId: string,
    grammarProgress: GrammarProgress,
    pronunciationProgress: any
  ): IntegratedProgress {

    // 통합 점수 계산
    const grammarAvg = Object.values(grammarProgress.masteryScores).reduce((a, b) => a + b, 0) /
                     Object.keys(grammarProgress.masteryScores).length || 0;
    const pronunciationAvg = pronunciationProgress.data?.averageScore || 0;
    const integrationScore = (grammarAvg + pronunciationAvg) / 2;

    // 개인화된 추천 생성
    const recommendations = this.generatePersonalizedRecommendations(
      grammarProgress,
      pronunciationProgress.data
    );

    return {
      userId,
      levelId,
      grammarProgress,
      pronunciationProgress: {
        completedExercises: pronunciationProgress.data?.completedExercises || [],
        averageScore: pronunciationAvg,
        phonemeScores: {},
        improvementAreas: pronunciationProgress.data?.improvementAreas || []
      },
      integrationScore,
      recommendations
    };
  }

  /**
   * 개인화된 학습 추천 생성
   */
  private generatePersonalizedRecommendations(
    grammarProgress: GrammarProgress,
    pronunciationProgress: any
  ): LearningRecommendation[] {

    const recommendations: LearningRecommendation[] = [];

    // 문법 약점 기반 추천
    for (const weakArea of grammarProgress.weakAreas) {
      recommendations.push({
        type: 'pronunciation_practice',
        priority: 'high',
        title: `${weakArea} 발음 연습`,
        description: `${weakArea} 문법 규칙과 관련된 발음 패턴을 집중 연습하세요.`,
        resourceId: `pron-${weakArea}`,
        estimatedTime: 15
      });
    }

    // 발음 약점 기반 추천
    if (pronunciationProgress?.improvementAreas) {
      for (const improvementArea of pronunciationProgress.improvementAreas) {
        recommendations.push({
          type: 'grammar_review',
          priority: 'medium',
          title: `${improvementArea} 관련 문법 복습`,
          description: `발음이 어려운 ${improvementArea}와 관련된 문법 규칙을 다시 학습해보세요.`,
          resourceId: `grammar-${improvementArea}`,
          estimatedTime: 10
        });
      }
    }

    // 통합 연습 추천
    recommendations.push({
      type: 'integrated_exercise',
      priority: 'medium',
      title: '문법-발음 통합 연습',
      description: '학습한 문법 규칙을 활용한 발음 연습으로 실전 감각을 키워보세요.',
      resourceId: 'integrated-practice',
      estimatedTime: 20
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 문법 진도 정보 조회 (모의 구현)
   */
  private async getGrammarProgress(userId: string, levelId: string): Promise<GrammarProgress> {
    // 실제로는 API 호출이나 데이터베이스 쿼리
    return {
      completedLessons: ['A1-01-01', 'A1-01-02'],
      currentLesson: 'A1-01-03',
      masteryScores: {
        'A1-01-01': 85,
        'A1-01-02': 78
      },
      weakAreas: ['van 동사 활용', '구개음 발음']
    };
  }

  /**
   * 사용자별 통합 진도 업데이트
   */
  async updateIntegratedProgress(
    userId: string,
    lessonId: string,
    exerciseId: string,
    score: number
  ): Promise<void> {
    try {
      // 진도 정보 업데이트 로직
      console.log(`사용자 ${userId}의 레슨 ${lessonId}, 연습 ${exerciseId} 점수 ${score}로 업데이트`);

      // 실제 구현에서는 데이터베이스 업데이트
    } catch (error) {
      throw new Error(`진도 업데이트 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 다음 추천 학습 컨텐츠 조회
   */
  async getNextRecommendedContent(userId: string, levelId: string): Promise<LearningRecommendation | null> {
    try {
      const integration = await this.generateIntegratedCurriculum(levelId, userId);
      return integration.progressTracking.recommendations[0] || null;
    } catch (error) {
      console.error('추천 컨텐츠 조회 실패:', error);
      return null;
    }
  }

  /**
   * 레벨 완성도 체크
   */
  async checkLevelCompletion(userId: string, levelId: string): Promise<{
    isCompleted: boolean;
    grammarCompletion: number;
    pronunciationCompletion: number;
    overallCompletion: number;
  }> {
    try {
      const integration = await this.generateIntegratedCurriculum(levelId, userId);

      const grammarCompletion = integration.progressTracking.grammarProgress.completedLessons.length / 10 * 100; // 가정: 레벨당 10개 레슨
      const pronunciationCompletion = integration.progressTracking.pronunciationProgress.completedExercises.length / 20 * 100; // 가정: 레벨당 20개 연습
      const overallCompletion = integration.progressTracking.integrationScore;

      return {
        isCompleted: overallCompletion >= 80 && grammarCompletion >= 80 && pronunciationCompletion >= 80,
        grammarCompletion,
        pronunciationCompletion,
        overallCompletion
      };
    } catch (error) {
      throw new Error(`레벨 완성도 체크 실패: ${(error as Error).message}`);
    }
  }
}

// 기본 인스턴스 내보내기
export const curriculumIntegration = new CurriculumIntegrationService();

export default curriculumIntegration;