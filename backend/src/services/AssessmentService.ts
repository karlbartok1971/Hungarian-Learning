import { PrismaClient } from '@prisma/client';

// 로컬 타입 정의 (shared/types 대체)
export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2'
}

export type LearningGoal = 'sermon_preparation' | 'general_communication' | 'academic' | 'professional';
export type AssessmentType = 'level_placement' | 'progress_check' | 'diagnostic' | 'certification';
export type QuestionType = 'multiple_choice' | 'fill_blank' | 'translation' | 'listening' | 'speaking';
export type AssessmentStatus = 'pending' | 'in_progress' | 'paused' | 'completed' | 'abandoned';

export interface AssessmentConfiguration {
  targetLanguage: string;
  sourceLanguage: string;
  primaryGoal: LearningGoal;
  assessmentType: AssessmentType;
  adaptiveMode: boolean;
  koreanSpecificOptimizations?: any;
  timeConstraints?: any;
}

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  level: CEFRLevel;
  category: string;
  question: string;
  instruction: string;
  options?: string[];
  correctAnswer: string;
  difficulty: number;
  estimatedTimeSeconds: number;
  tags?: string[];
  koreanSpecificFeatures?: any;
}

export interface QuestionResponse {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
  confidence: number;
  submittedAt: Date;
}

export interface AdaptiveState {
  currentLevel: CEFRLevel;
  levelConfidence: number;
  questionCount: number;
  correctAnswers: number;
  averageResponseTime: number;
  difficultyTrend: number[];
  stabilityThreshold: number;
  categoryPerformance: { [key: string]: number };
}

export interface AssessmentSession {
  id: string;
  userId: string;
  type: AssessmentType;
  status: AssessmentStatus;
  configuration: AssessmentConfiguration;
  currentQuestionIndex: number;
  totalQuestions: number;
  responses: QuestionResponse[];
  adaptiveState: AdaptiveState;
  questionHistory: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface LevelCalculationResult {
  estimatedLevel: CEFRLevel;
  confidence: number;
  categoryScores: { [key: string]: number };
  strongestCategories: string[];
  weakestCategories: string[];
}

export interface AssessmentResult {
  sessionId: string;
  finalLevel: CEFRLevel;
  confidence: number;
  detailedScores: { [key: string]: number };
  recommendations: any;
  statistics: any;
  koreanLearnerAnalysis: any;
}

export interface UserProfile {
  id: string;
  primaryGoal: LearningGoal;
  previousHungarianExperience?: boolean;
}

// 사용되지 않지만 import에 있던 타입들 (빈 정의)
export interface QuestionResult { }
export interface QuestionGenerationCriteria { }
export interface KoreanInterferenceAnalysis { }
export interface PastoralRelevance { }

export class AssessmentService {
  constructor(private prisma: PrismaClient) { }

  // 기본 문제 은행 (실제 헝가리어 A1-B2 문제들)
  private questionBank: AssessmentQuestion[] = [
    // A1 레벨 문제들
    {
      id: 'a1-001',
      type: 'multiple_choice' as QuestionType,
      level: CEFRLevel.A1,
      category: 'religious' as any,
      question: '헝가리어로 "하느님"은 무엇입니까?',
      instruction: '올바른 답을 선택하세요.',
      options: ['Isten', 'Ember', 'Ház', 'Könyv'],
      correctAnswer: 'Isten',
      difficulty: 1,
      estimatedTimeSeconds: 30,
      tags: ['기본어휘', '종교'],
      koreanSpecificFeatures: {
        interferenceType: 'vocabulary_transfer',
        difficultyForKoreans: 2,
        commonMistakes: ['발음 혼동', '어순 실수']
      }
    },
    {
      id: 'a1-002',
      type: 'multiple_choice' as QuestionType,
      level: CEFRLevel.A1,
      category: 'religious' as any,
      question: '헝가리어로 "교회"는 무엇입니까?',
      instruction: '올바른 답을 선택하세요.',
      options: ['templom', 'iskola', 'bolt', 'kórház'],
      correctAnswer: 'templom',
      difficulty: 1,
      estimatedTimeSeconds: 30,
      tags: ['기본어휘', '종교', '건물']
    },
    // A2 레벨 문제들
    {
      id: 'a2-001',
      type: 'multiple_choice' as QuestionType,
      level: CEFRLevel.A2,
      category: 'religious' as any,
      question: '"Jézus Krisztus a mi Megváltónk." 이 문장에서 "Megváltó"의 의미는?',
      instruction: '올바른 의미를 선택하세요.',
      options: ['구세주', '선생님', '친구', '왕'],
      correctAnswer: '구세주',
      difficulty: 3,
      estimatedTimeSeconds: 45,
      tags: ['종교어휘', '문법', '구원론']
    },
    // B1 레벨 문제들
    {
      id: 'b1-001',
      type: 'multiple_choice' as QuestionType,
      level: CEFRLevel.B1,
      category: 'religious' as any,
      question: '"A prédikáció témája a hit és remény kapcsolata volt." 여기서 사용된 문법 구조를 분석하세요.',
      instruction: '올바른 문법적 설명을 선택하세요.',
      options: ['소유격 + 연결사', '비교급 구조', '조건문', '수동태'],
      correctAnswer: '소유격 + 연결사',
      difficulty: 5,
      estimatedTimeSeconds: 60,
      tags: ['문법', '설교', '복합문']
    },
    // B2 레벨 문제들
    {
      id: 'b2-001',
      type: 'multiple_choice' as QuestionType,
      level: CEFRLevel.B2,
      category: 'religious' as any,
      question: '"Amennyiben elfogadjuk Krisztus tanítását, úgy kell élnünk, hogy másoknak példát mutassunk." 이 복문의 구조와 의미를 설명하세요.',
      instruction: '가장 정확한 분석을 선택하세요.',
      options: [
        '조건부 + 목적절: "그리스도의 가르침을 받아들인다면, 다른 이들에게 본보기가 되도록 살아야 한다"',
        '인과관계: 원인과 결과를 표현',
        '대조문: 두 개념의 차이점 강조',
        '시간순서: 순차적 행동 표현'
      ],
      correctAnswer: '조건부 + 목적절: "그리스도의 가르침을 받아들인다면, 다른 이들에게 본보기가 되도록 살아야 한다"',
      difficulty: 8,
      estimatedTimeSeconds: 90,
      tags: ['고급문법', '신학', '복합문', '설교작문']
    }
  ];

  // 평가 시작
  async startAssessment(
    userId: string,
    configuration: AssessmentConfiguration
  ): Promise<AssessmentSession> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 초기 적응형 상태 설정
    const initialAdaptiveState: AdaptiveState = {
      currentLevel: CEFRLevel.A1,
      levelConfidence: 0.5,
      questionCount: 0,
      correctAnswers: 0,
      averageResponseTime: 0,
      difficultyTrend: [],
      stabilityThreshold: 3,
      categoryPerformance: {
        vocabulary: 0,
        grammar: 0,
        listening: 0,
        cultural: 0,
        pronunciation: 0
      }
    };

    const session: AssessmentSession = {
      id: sessionId,
      userId: userId,
      type: configuration.assessmentType,
      status: 'in_progress' as AssessmentStatus,
      configuration: configuration,
      currentQuestionIndex: 0,
      totalQuestions: 20,
      responses: [],
      adaptiveState: initialAdaptiveState,
      questionHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 메모리에 세션 저장 (실제로는 데이터베이스에 저장)
    await this.saveSession(session);

    return session;
  }

  // 다음 문제 조회
  async getNextQuestion(sessionId: string): Promise<AssessmentQuestion | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    // 모든 문제를 완료했으면 null 반환
    if (session.currentQuestionIndex >= session.totalQuestions) {
      return null;
    }

    // 적응형 알고리즘으로 다음 문제 선택
    const nextQuestion = this.selectAdaptiveQuestion(session);
    return nextQuestion;
  }

  // 답안 제출
  async submitAnswer(
    sessionId: string,
    questionId: string,
    answer: string,
    timeSpent: number,
    confidence: number
  ): Promise<{
    isCorrect: boolean;
    response: QuestionResponse;
    feedback: string;
    progressUpdate: {
      correctAnswers: number;
      progressPercentage: number;
      estimatedLevel: CEFRLevel;
    };
    nextQuestion: AssessmentQuestion | null;
  }> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('세션을 찾을 수 없습니다.');
    }

    const question = this.questionBank.find(q => q.id === questionId);
    if (!question) {
      throw new Error('문제를 찾을 수 없습니다.');
    }

    // 답안 정확성 확인
    const isCorrect = this.checkAnswer(question, answer);

    // 응답 기록
    const response: QuestionResponse = {
      questionId: questionId,
      answer: answer,
      isCorrect: isCorrect,
      timeSpent: timeSpent,
      confidence: confidence,
      submittedAt: new Date()
    };

    session.responses.push(response);
    session.currentQuestionIndex++;
    session.updatedAt = new Date();

    // 적응형 상태 업데이트
    this.updateAdaptiveState(session, question, isCorrect, timeSpent);

    // 세션 저장
    await this.saveSession(session);

    // 진도 계산
    const progressPercentage = (session.currentQuestionIndex / session.totalQuestions) * 100;
    const estimatedLevel = this.calculateCurrentLevel(session);

    // 다음 문제 선택 (남은 문제가 있는 경우)
    let nextQuestion: AssessmentQuestion | null = null;
    if (session.currentQuestionIndex < session.totalQuestions) {
      nextQuestion = this.selectAdaptiveQuestion(session);
    }

    return {
      isCorrect,
      response,
      feedback: this.generateFeedback(question, isCorrect, answer),
      progressUpdate: {
        correctAnswers: session.adaptiveState.correctAnswers,
        progressPercentage,
        estimatedLevel
      },
      nextQuestion
    };
  }

  // 평가 완료
  async completeAssessment(sessionId: string): Promise<AssessmentResult> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('세션을 찾을 수 없습니다.');
    }

    session.status = 'completed' as AssessmentStatus;
    session.completedAt = new Date();
    await this.saveSession(session);

    // CEFR 레벨 계산
    const levelResult = this.calculateFinalLevel(session);

    // 상세 분석
    const statistics = this.generateStatistics(session);
    const recommendations = this.generateRecommendations(levelResult);
    const koreanLearnerAnalysis = this.analyzeKoreanLearnerPatterns(session);

    const result: AssessmentResult = {
      sessionId: session.id,
      finalLevel: levelResult.estimatedLevel,
      confidence: levelResult.confidence,
      detailedScores: levelResult.categoryScores,
      recommendations: {
        startingLevel: levelResult.estimatedLevel,
        suggestedPath: {
          duration: this.calculateStudyDuration(levelResult.estimatedLevel),
          focusAreas: levelResult.weakestCategories
        },
        pastoralRecommendations: {
          sermonWritingReadiness: this.assessSermonReadiness(levelResult.estimatedLevel)
        }
      },
      statistics: {
        totalQuestions: session.totalQuestions,
        correctAnswers: statistics.totalCorrect,
        averageTimePerQuestion: statistics.avgTime,
        weakestAreas: levelResult.weakestCategories
      },
      koreanLearnerAnalysis: {
        interferencePatterns: koreanLearnerAnalysis.interferencePattern,
        recommendedFocusAreas: koreanLearnerAnalysis.recommendedFocusAreas,
        culturalContextNeeds: koreanLearnerAnalysis.weaknesses,
        pronunciationChallenges: koreanLearnerAnalysis.interferencePattern,
        grammarInterferenceIssues: koreanLearnerAnalysis.strengths,
        culturalKnowledgeGaps: koreanLearnerAnalysis.weaknesses
      }
    };

    return result;
  }

  // 평가 이력 조회
  async getAssessmentHistory(
    userId: string,
    limit: number = 10,
    offset: number = 0,
    type?: AssessmentType
  ): Promise<{
    assessments: any[];
    total: number;
    levelProgression: any[];
  }> {
    // 실제로는 데이터베이스에서 조회
    return {
      assessments: [],
      total: 0,
      levelProgression: []
    };
  }

  // 평가 일시정지
  async pauseAssessment(sessionId: string, reason: string): Promise<{
    resumeToken: string;
    expiresAt: Date;
    currentProgress: any;
  }> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('세션을 찾을 수 없습니다.');
    }

    session.status = 'paused' as AssessmentStatus;
    await this.saveSession(session);

    const resumeToken = `resume-${sessionId}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후 만료

    return {
      resumeToken,
      expiresAt,
      currentProgress: {
        currentQuestion: session.currentQuestionIndex,
        totalQuestions: session.totalQuestions
      }
    };
  }

  // 평가 재개
  async resumeAssessment(userId: string, resumeToken: string): Promise<{
    session: AssessmentSession;
    nextQuestion: AssessmentQuestion | null;
  }> {
    // 토큰 검증 및 세션 찾기 (실제로는 데이터베이스에서)
    const sessionId = resumeToken.split('-')[1];
    const session = await this.getSession(sessionId);

    if (!session || session.userId !== userId) {
      throw new Error('유효하지 않은 재개 토큰입니다.');
    }

    session.status = 'in_progress' as AssessmentStatus;
    await this.saveSession(session);

    const nextQuestion = session.currentQuestionIndex < session.totalQuestions
      ? this.selectAdaptiveQuestion(session)
      : null;

    return {
      session,
      nextQuestion
    };
  }

  // 초기 평가 (신규 사용자용)
  async conductInitialAssessment(userProfile: UserProfile): Promise<AssessmentResult> {
    const configuration: AssessmentConfiguration = {
      targetLanguage: 'hungarian',
      sourceLanguage: 'korean',
      primaryGoal: userProfile.primaryGoal,
      assessmentType: 'level_placement' as AssessmentType,
      adaptiveMode: true,
      koreanSpecificOptimizations: {
        emphasizePronunciation: true,
        includeCulturalContext: true,
        useKoreanExplanations: true,
        adjustForLanguageTransfer: true
      },
      timeConstraints: {
        maxTotalMinutes: 20,
        maxQuestionSeconds: 60,
        allowPause: true
      }
    };

    const session = await this.startAssessment(userProfile.id, configuration);

    // 간소화된 초기 평가 로직
    const mockResult: AssessmentResult = {
      sessionId: session.id,
      finalLevel: userProfile.previousHungarianExperience ? CEFRLevel.A2 : 'A1' as CEFRLevel,
      confidence: 0.7,
      detailedScores: {
        vocabulary: 60,
        grammar: 55,
        listening: 50,
        cultural: 45,
        pronunciation: 40
      },
      recommendations: {
        startingLevel: CEFRLevel.A1,
        suggestedPath: {
          duration: 180, // 180일
          focusAreas: ['기본 어휘', '발음', '기초 문법']
        },
        pastoralRecommendations: {
          sermonWritingReadiness: '기초 과정 완료 후 가능'
        }
      },
      statistics: {
        totalQuestions: 10,
        correctAnswers: 6,
        averageTimePerQuestion: 45,
        weakestAreas: ['발음', '문화적 맥락']
      },
      koreanLearnerAnalysis: {
        interferencePatterns: ['어순 혼동', '격변화 어려움'],
        recommendedFocusAreas: ['격변화', '어순', '발음'],
        culturalContextNeeds: ['헝가리 교회 문화', '예배 용어'],
        pronunciationChallenges: ['ű, ő 발음', '자음 클러스터'],
        grammarInterferenceIssues: ['격변화', '동사 활용'],
        culturalKnowledgeGaps: ['헝가리 개신교 전통']
      }
    };

    return mockResult;
  }

  // === 헬퍼 메서드들 ===

  private async saveSession(session: AssessmentSession): Promise<void> {
    // 실제로는 데이터베이스에 저장
    // 현재는 메모리에 저장 (데모용)
  }

  private async getSession(sessionId: string): Promise<AssessmentSession | null> {
    // 실제로는 데이터베이스에서 조회
    // 현재는 메모리에서 조회 (데모용)
    return null;
  }

  private selectAdaptiveQuestion(session: AssessmentSession): AssessmentQuestion | null {
    const targetLevel = session.adaptiveState.currentLevel;
    const usedQuestions = session.questionHistory;

    // 현재 레벨에 맞는 문제 필터링
    const availableQuestions = this.questionBank.filter(q =>
      q.level === targetLevel && !usedQuestions.includes(q.id)
    );

    if (availableQuestions.length === 0) {
      // 같은 레벨 문제가 없으면 인근 레벨에서 선택
      return this.questionBank.find(q => !usedQuestions.includes(q.id)) || null;
    }

    // 첫 번째 사용 가능한 문제 반환 (실제로는 더 정교한 선택 알고리즘 사용)
    return availableQuestions[0];
  }

  private checkAnswer(question: AssessmentQuestion, answer: string): boolean {
    return answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
  }

  private updateAdaptiveState(
    session: AssessmentSession,
    question: AssessmentQuestion,
    isCorrect: boolean,
    timeSpent: number
  ): void {
    const state = session.adaptiveState;

    state.questionCount++;
    if (isCorrect) {
      state.correctAnswers++;
    }

    // 평균 응답 시간 업데이트
    state.averageResponseTime = (
      (state.averageResponseTime * (state.questionCount - 1) + timeSpent) /
      state.questionCount
    );

    // 난이도 트렌드 업데이트
    state.difficultyTrend.push(question.difficulty);

    // 레벨 신뢰도 조정
    if (isCorrect && question.level === state.currentLevel) {
      state.levelConfidence = Math.min(1.0, state.levelConfidence + 0.1);
    } else if (!isCorrect && question.level === state.currentLevel) {
      state.levelConfidence = Math.max(0.0, state.levelConfidence - 0.1);
    }

    // 카테고리별 성능 추적
    const category = question.category as string;
    if (!state.categoryPerformance[category]) {
      state.categoryPerformance[category] = 0;
    }
    state.categoryPerformance[category] = (
      state.categoryPerformance[category] + (isCorrect ? 1 : 0)
    ) / 2;
  }

  private calculateCurrentLevel(session: AssessmentSession): CEFRLevel {
    const correctRate = session.adaptiveState.correctAnswers / session.adaptiveState.questionCount;

    if (correctRate >= 0.8) return CEFRLevel.B2;
    if (correctRate >= 0.7) return CEFRLevel.B1;
    if (correctRate >= 0.6) return CEFRLevel.A2;
    return CEFRLevel.A1;
  }

  private calculateFinalLevel(session: AssessmentSession): LevelCalculationResult {
    const state = session.adaptiveState;
    const correctRate = state.correctAnswers / state.questionCount;

    let estimatedLevel: CEFRLevel = CEFRLevel.A1;
    if (correctRate >= 0.8) estimatedLevel = CEFRLevel.B2;
    else if (correctRate >= 0.7) estimatedLevel = CEFRLevel.B1;
    else if (correctRate >= 0.6) estimatedLevel = CEFRLevel.A2;

    return {
      estimatedLevel,
      confidence: state.levelConfidence,
      categoryScores: {
        vocabulary: state.categoryPerformance['vocabulary'] || 0.5,
        grammar: state.categoryPerformance['grammar'] || 0.5,
        listening: state.categoryPerformance['listening'] || 0.5,
        cultural: state.categoryPerformance['cultural'] || 0.5,
        pronunciation: state.categoryPerformance['pronunciation'] || 0.5
      },
      strongestCategories: ['vocabulary'],
      weakestCategories: ['pronunciation', 'grammar']
    };
  }

  private generateFeedback(question: AssessmentQuestion, isCorrect: boolean, answer: string): string {
    if (isCorrect) {
      return '정답입니다! 훌륭합니다.';
    } else {
      return `아쉽습니다. 정답은 "${question.correctAnswer}"입니다. ${question.instruction}`;
    }
  }

  private generateStatistics(session: AssessmentSession): {
    totalCorrect: number;
    avgTime: number;
  } {
    const totalCorrect = session.responses.filter(r => r.isCorrect).length;
    const avgTime = session.responses.reduce((sum, r) => sum + r.timeSpent, 0) / session.responses.length;

    return {
      totalCorrect,
      avgTime
    };
  }

  private generateRecommendations(levelResult: LevelCalculationResult): any {
    return {
      focusAreas: levelResult.weakestCategories,
      studyPlan: `${levelResult.estimatedLevel} 레벨 맞춤 학습`
    };
  }

  private analyzeKoreanLearnerPatterns(session: AssessmentSession): {
    interferencePattern: string[];
    strengths: string[];
    weaknesses: string[];
    recommendedFocusAreas: string[];
  } {
    return {
      interferencePattern: ['어순 혼동', '격변화 어려움'],
      strengths: ['암기 능력', '성실성'],
      weaknesses: ['발음', '어순'],
      recommendedFocusAreas: ['격변화 연습', '발음 교정', '문화적 맥락 학습']
    };
  }

  private calculateStudyDuration(level: CEFRLevel): number {
    const durations = {
      'A1': 90,  // 3개월
      'A2': 120, // 4개월
      'B1': 150, // 5개월
      'B2': 180  // 6개월
    };
    return durations[level] || 120;
  }

  private assessSermonReadiness(level: CEFRLevel): string {
    const readiness = {
      'A1': '기초 과정 완료 후 가능',
      'A2': '간단한 설교문 번역 수정 가능',
      'B1': '기본 설교문 작성 가능',
      'B2': '완전한 설교문 작성 및 수정 가능'
    };
    return readiness[level] || '추가 학습 필요';
  }
}