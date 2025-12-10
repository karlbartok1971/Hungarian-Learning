import {
  CEFRLevel,
  SkillArea,
  QuestionType,
  AssessmentQuestion,
  UserResponse,
  SkillAssessmentResult,
  ComprehensiveAssessmentResult,
  AdaptiveAssessmentSession,
  CATConfiguration
} from '../models/LevelAssessment';

/**
 * 적응형 레벨 평가 엔진 (CAT - Computer Adaptive Testing)
 * 사용자의 답변을 기반으로 실시간으로 난이도를 조정하며 정확한 레벨을 판정
 */

export class AdaptiveAssessmentEngine {
  private catConfig: CATConfiguration;

  constructor(config: Partial<CATConfiguration> = {}) {
    this.catConfig = {
      initial_theta: 0,              // 중간 난이도부터 시작
      standard_error_threshold: 0.3, // 표준오차 임계값
      max_items: 30,                 // 최대 30문항
      min_items: 10,                 // 최소 10문항
      termination_criterion: 'precision',
      item_selection_method: 'maximum_info',
      exposure_control: true,
      ...config
    };
  }

  /**
   * 새로운 적응형 평가 세션 시작
   */
  async startAssessmentSession(
    userId: string,
    skillAreas: SkillArea[] = Object.values(SkillArea)
  ): Promise<AdaptiveAssessmentSession> {
    return {
      id: `assess_${userId}_${Date.now()}`,
      user_id: userId,
      started_at: new Date(),
      current_question_index: 0,
      current_estimated_level: CEFRLevel.B1, // 중간에서 시작
      confidence_interval: [-1, 1],
      questions_asked: [],
      responses: [],
      difficulty_adjustment_history: [],
      target_precision: this.catConfig.standard_error_threshold,
      max_questions: this.catConfig.max_items,
      min_questions: this.catConfig.min_items,
      skill_focus: skillAreas
    };
  }

  /**
   * 다음 질문 선택 (적응형 알고리즘)
   */
  async selectNextQuestion(
    session: AdaptiveAssessmentSession
  ): Promise<AssessmentQuestion | null> {
    // 종료 조건 확인
    if (this.shouldTerminateAssessment(session)) {
      return null;
    }

    // 현재 추정 레벨을 기반으로 최적 난이도 계산
    const targetDifficulty = this.calculateOptimalDifficulty(session);

    // 아직 출제되지 않은 문제 중에서 선택
    const availableQuestions = await this.getAvailableQuestions(
      targetDifficulty,
      session.questions_asked,
      session.skill_focus
    );

    if (availableQuestions.length === 0) {
      return null; // 더 이상 적절한 문제가 없음
    }

    // 정보량 최대화 기준으로 문제 선택
    const selectedQuestion = this.selectQuestionByInformation(
      availableQuestions,
      session.current_estimated_level
    );

    return selectedQuestion;
  }

  /**
   * 사용자 응답 처리 및 레벨 재추정
   */
  async processResponse(
    session: AdaptiveAssessmentSession,
    response: UserResponse
  ): Promise<AdaptiveAssessmentSession> {
    // 응답 기록
    session.responses.push(response);
    session.questions_asked.push(response.question_id);
    session.current_question_index++;

    // 새로운 능력 추정 (IRT 모델 사용)
    const newEstimate = await this.updateAbilityEstimate(session);

    // 레벨이 변경된 경우 히스토리 기록
    if (newEstimate.level !== session.current_estimated_level) {
      session.difficulty_adjustment_history.push({
        question_index: session.current_question_index,
        previous_level: session.current_estimated_level,
        new_level: newEstimate.level,
        reason: this.getAdjustmentReason(response, newEstimate),
        timestamp: new Date()
      });

      session.current_estimated_level = newEstimate.level;
    }

    session.confidence_interval = newEstimate.confidence_interval;

    return session;
  }

  /**
   * 평가 완료 및 종합 결과 생성
   */
  async completeAssessment(
    session: AdaptiveAssessmentSession
  ): Promise<ComprehensiveAssessmentResult> {
    session.completed_at = new Date();

    // 영역별 결과 계산
    const skillResults = await this.calculateSkillResults(session);

    // 전체 레벨 결정
    const overallLevel = this.determineOverallLevel(skillResults);

    // 한국어 간섭 분석
    const koreanInterference = await this.analyzeKoreanInterference(session);

    // 학습 스타일 분석
    const learningStyleIndicators = await this.analyzeLearningStyle(session);

    // 추천 사항 생성
    const recommendations = await this.generateRecommendations(
      overallLevel,
      skillResults,
      koreanInterference
    );

    const result: ComprehensiveAssessmentResult = {
      id: `result_${session.id}`,
      user_id: session.user_id,
      assessment_date: session.completed_at!,
      overall_level: overallLevel,
      overall_confidence: this.calculateOverallConfidence(skillResults),
      skill_results: skillResults,
      analysis: {
        korean_interference: koreanInterference,
        learning_style_indicators: learningStyleIndicators,
        motivation_indicators: this.analyzeMotiationIndicators(session)
      },
      recommendations,
      total_questions: session.responses.length,
      total_time_minutes: Math.round(
        (session.completed_at!.getTime() - session.started_at.getTime()) / 60000
      ),
      assessment_type: 'initial',
      validity_score: this.calculateValidityScore(session)
    };

    return result;
  }

  // 내부 헬퍼 메서드들

  /**
   * 평가 종료 조건 확인
   */
  private shouldTerminateAssessment(session: AdaptiveAssessmentSession): boolean {
    // 최소 문항 수 미달
    if (session.responses.length < this.catConfig.min_items) {
      return false;
    }

    // 최대 문항 수 도달
    if (session.responses.length >= this.catConfig.max_items) {
      return true;
    }

    // 정밀도 기준 충족
    if (this.catConfig.termination_criterion === 'precision') {
      const currentPrecision = this.calculateCurrentPrecision(session);
      return currentPrecision <= this.catConfig.standard_error_threshold;
    }

    return false;
  }

  /**
   * 최적 난이도 계산
   */
  private calculateOptimalDifficulty(session: AdaptiveAssessmentSession): CEFRLevel {
    const theta = this.levelToTheta(session.current_estimated_level);
    const precision = this.calculateCurrentPrecision(session);

    // 정밀도가 낮으면 현재 레벨 근처에서 문제 선택
    // 정밀도가 높으면 약간 더 어려운 문제로 도전
    if (precision > 0.5) {
      return session.current_estimated_level;
    } else {
      // 현재 추정 레벨보다 약간 어려운 레벨 선택
      return this.getNextDifficultyLevel(session.current_estimated_level);
    }
  }

  /**
   * 사용 가능한 문제 조회
   */
  private async getAvailableQuestions(
    targetLevel: CEFRLevel,
    usedQuestionIds: string[],
    skillFocus?: SkillArea[]
  ): Promise<AssessmentQuestion[]> {
    // 실제 구현에서는 데이터베이스에서 조회
    // 여기서는 샘플 데이터 반환
    const allQuestions = await this.getSampleQuestions();

    return allQuestions.filter(question => {
      // 이미 사용된 문제 제외
      if (usedQuestionIds.includes(question.id)) {
        return false;
      }

      // 목표 난이도 매칭 (±1 레벨)
      const levelMatch = this.isLevelInRange(
        question.difficulty_level,
        targetLevel,
        1
      );

      // 특정 스킬 영역 포커스
      const skillMatch = !skillFocus || skillFocus.includes(question.skill_area);

      return levelMatch && skillMatch;
    });
  }

  /**
   * 정보량 기준 문제 선택
   */
  private selectQuestionByInformation(
    questions: AssessmentQuestion[],
    currentLevel: CEFRLevel
  ): AssessmentQuestion {
    // 현재 레벨에 가장 적합한 정보량을 제공하는 문제 선택
    const theta = this.levelToTheta(currentLevel);

    const questionWithInfo = questions.map(question => {
      const questionTheta = this.levelToTheta(question.difficulty_level);
      const information = this.calculateItemInformation(theta, questionTheta);

      return { question, information };
    });

    // 정보량이 가장 높은 문제 선택
    questionWithInfo.sort((a, b) => b.information - a.information);

    return questionWithInfo[0].question;
  }

  /**
   * IRT 모델을 사용한 능력 재추정
   */
  private async updateAbilityEstimate(
    session: AdaptiveAssessmentSession
  ): Promise<{ level: CEFRLevel; confidence_interval: [number, number] }> {
    if (session.responses.length === 0) {
      return {
        level: CEFRLevel.B1,
        confidence_interval: [-1, 1]
      };
    }

    // 최대우도추정법(MLE) 또는 베이지안 추정
    const theta = await this.estimateTheta(session.responses);
    const standardError = await this.calculateStandardError(session.responses, theta);

    // 신뢰구간 계산 (95% 신뢰구간)
    const confidenceInterval: [number, number] = [
      theta - 1.96 * standardError,
      theta + 1.96 * standardError
    ];

    const level = this.thetaToLevel(theta);

    return { level, confidence_interval: confidenceInterval };
  }

  /**
   * 영역별 평가 결과 계산
   */
  private async calculateSkillResults(
    session: AdaptiveAssessmentSession
  ): Promise<SkillAssessmentResult[]> {
    const skillAreas = session.skill_focus || Object.values(SkillArea);
    const results: SkillAssessmentResult[] = [];

    for (const skill of skillAreas) {
      const skillResponses = session.responses.filter(response => {
        // 실제로는 question_id로 문제를 조회해서 skill_area 확인
        return true; // 임시로 모든 응답 포함
      });

      if (skillResponses.length === 0) continue;

      const correctCount = skillResponses.filter(r => r.is_correct).length;
      const accuracy = correctCount / skillResponses.length;
      const avgTime = skillResponses.reduce((sum, r) => sum + r.time_taken_seconds, 0) / skillResponses.length;

      // 스킬별 레벨 추정
      const skillLevel = this.estimateSkillLevel(skillResponses, accuracy);

      results.push({
        skill_area: skill,
        estimated_level: skillLevel,
        confidence_score: Math.min(95, 60 + accuracy * 35), // 60-95 범위
        correct_answers: correctCount,
        total_questions: skillResponses.length,
        accuracy_percentage: accuracy * 100,
        time_efficiency: this.calculateTimeEfficiency(avgTime, skill),
        strengths: this.identifyStrengths(skill, accuracy, avgTime),
        weaknesses: this.identifyWeaknesses(skill, accuracy, avgTime),
        detailed_scores: this.calculateDetailedScores(skillResponses)
      });
    }

    return results;
  }

  /**
   * 한국어 간섭 분석
   */
  private async analyzeKoreanInterference(session: AdaptiveAssessmentSession): Promise<{
    severity: 'low' | 'medium' | 'high';
    affected_areas: SkillArea[];
    specific_challenges: string[];
  }> {
    // 한국어 간섭이 예상되는 패턴 분석
    const grammarErrors = session.responses.filter(r =>
      !r.is_correct && r.question_id.includes('grammar')
    ).length;

    const pronunciationIssues = session.responses.filter(r =>
      !r.is_correct && r.question_id.includes('pronunciation')
    ).length;

    let severity: 'low' | 'medium' | 'high' = 'low';
    const affectedAreas: SkillArea[] = [];
    const challenges: string[] = [];

    if (grammarErrors > 3) {
      severity = grammarErrors > 6 ? 'high' : 'medium';
      affectedAreas.push(SkillArea.GRAMMAR);
      challenges.push('헝가리어 격변화 시스템 적응');
      challenges.push('어순 차이로 인한 혼란');
    }

    if (pronunciationIssues > 2) {
      if (severity === 'low') severity = 'medium';
      affectedAreas.push(SkillArea.PRONUNCIATION);
      challenges.push('헝가리어 특유 발음 (ü, ő, ű)');
      challenges.push('한국어에 없는 자음 클러스터');
    }

    return {
      severity,
      affected_areas: affectedAreas,
      specific_challenges: challenges
    };
  }

  /**
   * 학습 스타일 분석
   */
  private async analyzeLearningStyle(session: AdaptiveAssessmentSession): Promise<{
    visual_learner: number;
    auditory_learner: number;
    kinesthetic_learner: number;
    reading_writing_learner: number;
  }> {
    // 문제 유형별 성능 분석으로 학습 스타일 추정
    const visualScore = this.calculateVisualLearningScore(session);
    const auditoryScore = this.calculateAuditoryLearningScore(session);
    const kinestheticScore = this.calculateKinestheticLearningScore(session);
    const readingWritingScore = this.calculateReadingWritingLearningScore(session);

    return {
      visual_learner: visualScore,
      auditory_learner: auditoryScore,
      kinesthetic_learner: kinestheticScore,
      reading_writing_learner: readingWritingScore
    };
  }

  // 유틸리티 메서드들

  private levelToTheta(level: CEFRLevel): number {
    const levelMap: { [key in CEFRLevel]: number } = {
      [CEFRLevel.A1]: -2,
      [CEFRLevel.A2]: -1,
      [CEFRLevel.B1]: 0,
      [CEFRLevel.B2]: 1,
      [CEFRLevel.C1]: 2,
      [CEFRLevel.C2]: 3
    };
    return levelMap[level];
  }

  private thetaToLevel(theta: number): CEFRLevel {
    if (theta < -1.5) return CEFRLevel.A1;
    if (theta < -0.5) return CEFRLevel.A2;
    if (theta < 0.5) return CEFRLevel.B1;
    if (theta < 1.5) return CEFRLevel.B2;
    if (theta < 2.5) return CEFRLevel.C1;
    return CEFRLevel.C2;
  }

  private async getSampleQuestions(): Promise<AssessmentQuestion[]> {
    // 실제 구현에서는 데이터베이스에서 조회
    return [
      {
        id: 'grammar_a2_1',
        type: QuestionType.MULTIPLE_CHOICE,
        skill_area: SkillArea.GRAMMAR,
        difficulty_level: CEFRLevel.A2,
        question_text: '다음 중 올바른 헝가리어 격변화는?',
        options: ['a házban', 'a házba', 'a házról', 'a háztól'],
        correct_answer: 'a házban',
        points: 1,
        time_limit_seconds: 30,
        tags: ['grammar', 'case', 'sublative']
      },
      {
        id: 'vocab_b1_1',
        type: QuestionType.VOCABULARY_MATCHING,
        skill_area: SkillArea.VOCABULARY,
        difficulty_level: CEFRLevel.B1,
        question_text: '"church"를 헝가리어로?',
        correct_answer: 'templom',
        points: 1,
        time_limit_seconds: 20,
        tags: ['vocabulary', 'religious', 'basic']
      }
    ];
  }

  private calculateCurrentPrecision(session: AdaptiveAssessmentSession): number {
    if (session.responses.length < 3) return 1.0; // 초기에는 낮은 정밀도

    const recentCorrect = session.responses
      .slice(-5) // 최근 5문제
      .filter(r => r.is_correct).length;

    return Math.abs(0.5 - (recentCorrect / Math.min(5, session.responses.length)));
  }

  private getAdjustmentReason(response: UserResponse, estimate: any): string {
    if (response.is_correct) {
      return '정답으로 인한 레벨 상향 조정';
    } else {
      return '오답으로 인한 레벨 하향 조정';
    }
  }

  private calculateItemInformation(theta: number, difficulty: number): number {
    // IRT 1PL 모델의 정보함수
    const diff = theta - difficulty;
    const probability = 1 / (1 + Math.exp(-diff));
    return probability * (1 - probability);
  }

  private async estimateTheta(responses: UserResponse[]): Promise<number> {
    // 간단한 정답률 기반 theta 추정
    const correctRate = responses.filter(r => r.is_correct).length / responses.length;

    // 정답률을 theta로 변환 (로지스틱 변환)
    const logit = Math.log(correctRate / (1 - correctRate + 0.001)); // 0으로 나누기 방지
    return Math.max(-3, Math.min(3, logit)); // -3 ~ 3 범위로 제한
  }

  private async calculateStandardError(responses: UserResponse[], theta: number): Promise<number> {
    // 정보함수의 역수의 제곱근
    const totalInfo = responses.length * 0.25; // 간단한 근사
    return 1 / Math.sqrt(totalInfo);
  }

  private isLevelInRange(level: CEFRLevel, target: CEFRLevel, range: number): boolean {
    const levelOrder = [CEFRLevel.A1, CEFRLevel.A2, CEFRLevel.B1, CEFRLevel.B2, CEFRLevel.C1, CEFRLevel.C2];
    const levelIndex = levelOrder.indexOf(level);
    const targetIndex = levelOrder.indexOf(target);

    return Math.abs(levelIndex - targetIndex) <= range;
  }

  private getNextDifficultyLevel(currentLevel: CEFRLevel): CEFRLevel {
    const levels = [CEFRLevel.A1, CEFRLevel.A2, CEFRLevel.B1, CEFRLevel.B2, CEFRLevel.C1, CEFRLevel.C2];
    const currentIndex = levels.indexOf(currentLevel);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }

  private determineOverallLevel(skillResults: SkillAssessmentResult[]): CEFRLevel {
    if (skillResults.length === 0) return CEFRLevel.B1;

    // 가중평균으로 전체 레벨 계산 (문법과 어휘에 더 큰 가중치)
    const weights = {
      [SkillArea.GRAMMAR]: 0.25,
      [SkillArea.VOCABULARY]: 0.25,
      [SkillArea.READING]: 0.15,
      [SkillArea.WRITING]: 0.15,
      [SkillArea.LISTENING]: 0.1,
      [SkillArea.SPEAKING]: 0.1
    };

    let weightedSum = 0;
    let totalWeight = 0;

    skillResults.forEach(result => {
      const weight = weights[result.skill_area] || 0.1;
      const levelValue = this.levelToTheta(result.estimated_level);

      weightedSum += levelValue * weight;
      totalWeight += weight;
    });

    const averageTheta = totalWeight > 0 ? weightedSum / totalWeight : 0;
    return this.thetaToLevel(averageTheta);
  }

  private calculateOverallConfidence(skillResults: SkillAssessmentResult[]): number {
    if (skillResults.length === 0) return 50;

    const avgConfidence = skillResults.reduce(
      (sum, result) => sum + result.confidence_score, 0
    ) / skillResults.length;

    return Math.round(avgConfidence);
  }

  private estimateSkillLevel(responses: UserResponse[], accuracy: number): CEFRLevel {
    if (accuracy >= 0.9) return CEFRLevel.C2;
    if (accuracy >= 0.8) return CEFRLevel.C1;
    if (accuracy >= 0.7) return CEFRLevel.B2;
    if (accuracy >= 0.6) return CEFRLevel.B1;
    if (accuracy >= 0.4) return CEFRLevel.A2;
    return CEFRLevel.A1;
  }

  private calculateTimeEfficiency(avgTime: number, skill: SkillArea): number {
    // 각 스킬별 기준 시간 대비 효율성 계산
    const standardTimes = {
      [SkillArea.VOCABULARY]: 15,
      [SkillArea.GRAMMAR]: 30,
      [SkillArea.READING]: 45,
      [SkillArea.LISTENING]: 40,
      [SkillArea.WRITING]: 180,
      [SkillArea.SPEAKING]: 120,
      [SkillArea.PRONUNCIATION]: 30
    };

    const standardTime = standardTimes[skill] || 30;
    return Math.max(0, Math.min(100, 100 - (avgTime - standardTime) / standardTime * 50));
  }

  private identifyStrengths(skill: SkillArea, accuracy: number, avgTime: number): string[] {
    const strengths: string[] = [];

    if (accuracy > 0.8) {
      strengths.push(`${skill} 영역 높은 정확도`);
    }

    if (avgTime < 20) {
      strengths.push(`${skill} 영역 빠른 반응 속도`);
    }

    return strengths;
  }

  private identifyWeaknesses(skill: SkillArea, accuracy: number, avgTime: number): string[] {
    const weaknesses: string[] = [];

    if (accuracy < 0.5) {
      weaknesses.push(`${skill} 영역 정확도 부족`);
    }

    if (avgTime > 60) {
      weaknesses.push(`${skill} 영역 응답 속도 개선 필요`);
    }

    return weaknesses;
  }

  private calculateDetailedScores(responses: UserResponse[]): { [level in CEFRLevel]?: number } {
    // 각 레벨별 예상 점수 계산
    return {
      [CEFRLevel.A1]: 85,
      [CEFRLevel.A2]: 72,
      [CEFRLevel.B1]: 58,
      [CEFRLevel.B2]: 35
    };
  }

  private calculateVisualLearningScore(session: AdaptiveAssessmentSession): number {
    // 시각적 문제에서의 성능 분석
    return 75; // 임시값
  }

  private calculateAuditoryLearningScore(session: AdaptiveAssessmentSession): number {
    // 청각적 문제에서의 성능 분석
    return 60; // 임시값
  }

  private calculateKinestheticLearningScore(session: AdaptiveAssessmentSession): number {
    // 체감각적 문제에서의 성능 분석
    return 45; // 임시값
  }

  private calculateReadingWritingLearningScore(session: AdaptiveAssessmentSession): number {
    // 읽기/쓰기 문제에서의 성능 분석
    return 80; // 임시값
  }

  private analyzeMotiationIndicators(session: AdaptiveAssessmentSession) {
    return {
      persistence_score: 75,
      engagement_level: 85,
      goal_orientation: 70
    };
  }

  private calculateValidityScore(session: AdaptiveAssessmentSession): number {
    // 평가의 신뢰성 점수 계산
    const consistencyScore = this.calculateResponseConsistency(session);
    const timeConsistencyScore = this.calculateTimeConsistency(session);

    return Math.round((consistencyScore + timeConsistencyScore) / 2);
  }

  private calculateResponseConsistency(session: AdaptiveAssessmentSession): number {
    // 응답 일관성 분석
    return 85; // 임시값
  }

  private calculateTimeConsistency(session: AdaptiveAssessmentSession): number {
    // 응답 시간 일관성 분석
    return 78; // 임시값
  }

  private async generateRecommendations(
    overallLevel: CEFRLevel,
    skillResults: SkillAssessmentResult[],
    koreanInterference: any
  ) {
    const weakestSkills = skillResults
      .filter(result => result.confidence_score < 70)
      .map(result => result.skill_area);

    return {
      suggested_level: overallLevel,
      focus_areas: weakestSkills,
      learning_path_suggestions: [
        `${overallLevel} 레벨 집중 학습`,
        '한국어 간섭 극복 프로그램',
        '개인 맞춤 약점 보강 코스'
      ],
      estimated_study_hours_weekly: this.calculateRecommendedStudyHours(overallLevel),
      target_timeline_months: this.calculateTimelineMonths(overallLevel, skillResults)
    };
  }

  private calculateRecommendedStudyHours(level: CEFRLevel): number {
    const hourMap = {
      [CEFRLevel.A1]: 8,
      [CEFRLevel.A2]: 10,
      [CEFRLevel.B1]: 12,
      [CEFRLevel.B2]: 15,
      [CEFRLevel.C1]: 18,
      [CEFRLevel.C2]: 20
    };
    return hourMap[level];
  }

  private calculateTimelineMonths(level: CEFRLevel, skillResults: SkillAssessmentResult[]): number {
    const baseMonths = {
      [CEFRLevel.A1]: 6,
      [CEFRLevel.A2]: 8,
      [CEFRLevel.B1]: 10,
      [CEFRLevel.B2]: 12,
      [CEFRLevel.C1]: 15,
      [CEFRLevel.C2]: 18
    };

    const avgConfidence = skillResults.reduce(
      (sum, result) => sum + result.confidence_score, 0
    ) / skillResults.length;

    // 신뢰도가 낮으면 더 많은 시간 필요
    const adjustmentFactor = avgConfidence < 60 ? 1.3 : avgConfidence < 80 ? 1.1 : 1.0;

    return Math.round(baseMonths[level] * adjustmentFactor);
  }
}