import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Assessment Model
 *
 * A1-B2 헝가리어 수준 평가를 위한 데이터 모델
 * 적응형 평가 시스템과 한국인 특화 난이도 조정을 지원
 */

// CEFR 레벨 정의 (A1-B2)
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

// 학습 목표 정의
export type LearningGoal =
  | 'sermon_writing'          // 설교문 작성
  | 'congregation_communication'  // 교인과의 소통
  | 'biblical_study'         // 성경 연구
  | 'pastoral_care'          // 목회 상담
  | 'cultural_immersion'     // 문화 적응
  | 'business_communication' // 업무 소통
  | 'academic_study';        // 학술 연구

export interface AssessmentSession {
  id: string;
  userId: string;
  type: AssessmentType;
  status: AssessmentStatus;
  startedAt: Date;
  completedAt?: Date;
  pausedAt?: Date;

  // 평가 설정
  configuration: AssessmentConfiguration;

  // 현재 진행 상태
  currentQuestionIndex: number;
  totalQuestions: number;

  // 적응형 평가 상태
  currentEstimatedLevel: CEFRLevel;
  confidence: number; // 0-1 신뢰도

  // 응답 기록
  responses: QuestionResponse[];

  // 최종 결과 (완료 시에만)
  finalResults?: AssessmentResults;

  // 메타데이터
  userAgent?: string;
  ipAddress?: string;
  resumeToken?: string; // 일시정지 시 재개용
}

export interface AssessmentConfiguration {
  targetLanguage: 'hungarian';
  sourceLanguage: 'korean';

  // 평가 목적
  primaryGoal: LearningGoal;
  assessmentType: AssessmentType;

  // 적응형 설정
  adaptiveMode: boolean;
  startingLevel?: CEFRLevel; // 재평가 시 이전 수준에서 시작

  // 한국인 특화 설정
  koreanSpecificOptimizations: {
    emphasizePronunciation: boolean;
    includeCulturalContext: boolean;
    useKoreanExplanations: boolean;
    adjustForLanguageTransfer: boolean; // 한국어 간섭 현상 고려
  };

  // 시간 제한
  timeConstraints: {
    maxTotalMinutes?: number;
    maxQuestionSeconds?: number;
    allowPause: boolean;
  };
}

export interface Question {
  id: string;
  type: QuestionType;
  level: CEFRLevel;
  category: QuestionCategory;
  difficulty: number; // 1-10 스케일

  // 문제 내용
  content: QuestionContent;

  // 정답 및 채점
  correctAnswer: any;
  scoringCriteria: ScoringCriteria;

  // 한국인 특화 요소
  koreanSpecificFeatures?: {
    commonMistakes: string[]; // 한국인이 자주 하는 실수
    transferIssues: string[];  // 언어 전이 문제점
    culturalNotes?: string;    // 문화적 맥락 설명
  };

  // 메타데이터
  tags: string[];
  estimatedTimeSeconds: number;
  prerequisites?: string[]; // 필요 선수 지식
}

export interface QuestionContent {
  question: string;
  instruction: string;
  context?: string;

  // 문제 타입별 특화 내용
  multipleChoice?: {
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
      explanation?: string;
    }[];
  };

  fillBlank?: {
    template: string; // "Én ____ vagyok" 형태
    blanks: {
      position: number;
      acceptableAnswers: string[];
      hints?: string;
    }[];
  };

  audioRecognition?: {
    audioUrl: string;
    transcript: string;
    focusPhonemes?: string[]; // 특히 주의할 발음
  };

  translation?: {
    sourceText: string;
    targetLanguage: 'hungarian' | 'korean';
    acceptableTranslations: string[];
  };

  imageSelection?: {
    imageUrls: string[];
    correctImageIndex: number;
  };

  // 종교 특화 문제
  theological?: {
    context: 'biblical' | 'liturgical' | 'pastoral' | 'cultural';
    verseReference?: string;
    culturalBackground?: string;
  };
}

export interface QuestionResponse {
  questionId: string;
  answer: any;
  isCorrect: boolean;
  confidence: number; // 사용자가 표시한 확신도 1-5
  timeSpentSeconds: number;
  timestamp: Date;

  // 부분 점수 (복합 문제의 경우)
  partialScores?: {
    component: string;
    score: number;
    maxScore: number;
  }[];

  // 오답 분석
  errorAnalysis?: {
    errorType: ErrorType;
    expectedAnswer: any;
    userAnswer: any;
    koreanTransferError?: boolean; // 한국어 간섭으로 인한 오답
  };
}

export interface AssessmentResults {
  finalLevel: CEFRLevel;
  confidence: number; // 0-1

  // 상세 점수
  detailedScores: {
    vocabulary: number;    // 어휘 능력
    grammar: number;       // 문법 능력
    listening: number;     // 청해 능력
    cultural: number;      // 문화 이해
    pronunciation?: number; // 발음 (오디오 문제 있을 때)
  };

  // 수준별 성취도
  levelBreakdown: {
    A1: LevelAchievement;
    A2: LevelAchievement;
    B1: LevelAchievement;
    B2: LevelAchievement;
  };

  // 개인화된 추천
  recommendations: AssessmentRecommendations;

  // 통계 정보
  statistics: {
    totalQuestions: number;
    correctAnswers: number;
    averageTimePerQuestion: number;
    strongestAreas: QuestionCategory[];
    weakestAreas: QuestionCategory[];
  };

  // 한국인 특화 분석
  koreanLearnerAnalysis: {
    pronunciationChallenges: string[];
    grammarInterferenceIssues: string[];
    culturalKnowledgeGaps: string[];
    recommendedFocusAreas: string[];
  };
}

export interface LevelAchievement {
  level: CEFRLevel;
  achievementPercentage: number; // 0-100
  masteredSkills: string[];
  developingSkills: string[];
  needsWorkSkills: string[];
  readinessForNext: boolean;
}

export interface AssessmentRecommendations {
  startingLevel: CEFRLevel;

  // 학습 경로 추천
  suggestedPath: {
    duration: number; // 주 단위
    intensity: 'relaxed' | 'standard' | 'intensive';
    focusAreas: string[];
  };

  // 목회자 특화 추천
  pastoralRecommendations: {
    sermonWritingReadiness: {
      currentCapability: 'none' | 'basic' | 'intermediate' | 'advanced';
      nextMilestone: string;
      estimatedWeeksToBasicSermon: number;
    };

    theologicalVocabularyLevel: {
      current: number; // 1-10
      targetForSermons: number;
      keyTermsToLearn: string[];
    };

    culturalPreparation: {
      hungarianChurchFamiliarity: number; // 1-10
      recommendedCulturalStudies: string[];
    };
  };

  // 학습 방법 추천
  methodologyRecommendations: {
    preferredLearningStyles: string[];
    recommendedResources: string[];
    practiceFrequency: {
      daily: number; // 분
      weekly: number; // 세션 수
    };
  };
}

export interface ScoringCriteria {
  maxScore: number;
  passingScore: number;

  // 부분 점수 규칙
  partialCredit?: {
    enabled: boolean;
    criteria: {
      component: string;
      weight: number;
    }[];
  };

  // 적응형 평가용 난이도 조정 규칙
  adaptiveRules?: {
    correctThreshold: number;    // 이 점수 이상이면 난이도 상승
    incorrectThreshold: number;  // 이 점수 이하면 난이도 하락
    levelAdjustment: number;     // 조정 강도
  };
}

// Enums and Types
export enum AssessmentType {
  LEVEL_PLACEMENT = 'level_placement',     // 초기 수준 배정
  PROGRESS_CHECK = 'progress_check',       // 중간 점검
  COMPETENCY_VALIDATION = 'competency_validation', // 특정 능력 검증
  READINESS_ASSESSMENT = 'readiness_assessment'    // 다음 단계 준비도
}

export enum AssessmentStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  EXPIRED = 'expired'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_BLANK = 'fill_blank',
  AUDIO_RECOGNITION = 'audio_recognition',
  TRANSLATION = 'translation',
  IMAGE_SELECTION = 'image_selection',
  DRAG_DROP = 'drag_drop',
  SPEAKING_RESPONSE = 'speaking_response'
}

export enum QuestionCategory {
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  LISTENING = 'listening',
  READING = 'reading',
  CULTURAL = 'cultural',
  PRONUNCIATION = 'pronunciation',
  THEOLOGICAL = 'theological'
}

export enum ErrorType {
  VOCABULARY_UNKNOWN = 'vocabulary_unknown',
  GRAMMAR_MISTAKE = 'grammar_mistake',
  PRONUNCIATION_ERROR = 'pronunciation_error',
  CULTURAL_MISUNDERSTANDING = 'cultural_misunderstanding',
  KOREAN_INTERFERENCE = 'korean_interference',
  CARELESS_MISTAKE = 'careless_mistake'
}

/**
 * Assessment Model Class
 * 평가 세션 관리를 위한 메인 모델 클래스
 */
export class AssessmentModel {

  /**
   * 새로운 평가 세션 생성
   */
  static async createSession(
    userId: string,
    configuration: AssessmentConfiguration
  ): Promise<AssessmentSession> {

    // 총 문제 수 계산 (적응형/고정형에 따라)
    const totalQuestions = configuration.adaptiveMode ?
      this.calculateAdaptiveQuestionCount(configuration) : 20;

    const session: AssessmentSession = {
      id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: configuration.assessmentType,
      status: AssessmentStatus.NOT_STARTED,
      startedAt: new Date(),
      configuration,
      currentQuestionIndex: 0,
      totalQuestions,
      currentEstimatedLevel: configuration.startingLevel || 'A1',
      confidence: 0.5,
      responses: []
    };

    // 데이터베이스에 저장 (실제 Prisma 스키마 구현 후)
    // await prisma.assessmentSession.create({ data: session });

    return session;
  }

  /**
   * 다음 문제 선택 (적응형 알고리즘)
   */
  static async selectNextQuestion(
    sessionId: string,
    previousResponse?: QuestionResponse
  ): Promise<Question | null> {

    const session = await this.getSession(sessionId);
    if (!session) throw new Error('세션을 찾을 수 없습니다.');

    // 적응형 난이도 조정
    if (previousResponse && session.configuration.adaptiveMode) {
      session.currentEstimatedLevel = this.adjustDifficultyLevel(
        session.currentEstimatedLevel,
        previousResponse,
        session.responses
      );
    }

    // 문제 풀 에서 다음 문제 선택
    const nextQuestion = await this.selectQuestionByLevel(
      session.currentEstimatedLevel,
      session.responses.map(r => r.questionId),
      session.configuration.koreanSpecificOptimizations
    );

    return nextQuestion;
  }

  /**
   * 응답 기록 및 분석
   */
  static async recordResponse(
    sessionId: string,
    questionId: string,
    answer: any,
    timeSpent: number,
    confidence: number = 3
  ): Promise<QuestionResponse> {

    const question = await this.getQuestion(questionId);
    const isCorrect = this.evaluateAnswer(question, answer);

    const response: QuestionResponse = {
      questionId,
      answer,
      isCorrect,
      confidence,
      timeSpentSeconds: timeSpent,
      timestamp: new Date()
    };

    // 오답 분석
    if (!isCorrect) {
      response.errorAnalysis = this.analyzeError(question, answer);
    }

    // 세션에 응답 추가
    const session = await this.getSession(sessionId);
    session!.responses.push(response);

    // 진행률 업데이트
    session!.currentQuestionIndex++;

    // 데이터베이스 업데이트
    // await this.updateSession(sessionId, session);

    return response;
  }

  /**
   * 평가 완료 및 결과 생성
   */
  static async completeAssessment(sessionId: string): Promise<AssessmentResults> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('세션을 찾을 수 없습니다.');

    // 최종 결과 계산
    const results = this.calculateFinalResults(session);

    // 세션 상태 업데이트
    session.status = AssessmentStatus.COMPLETED;
    session.completedAt = new Date();
    session.finalResults = results;

    // 데이터베이스 업데이트
    // await this.updateSession(sessionId, session);

    return results;
  }

  // Private helper methods
  private static calculateAdaptiveQuestionCount(config: AssessmentConfiguration): number {
    // 적응형 평가의 경우 동적 문제 수 계산
    switch (config.assessmentType) {
      case AssessmentType.LEVEL_PLACEMENT: return 20;
      case AssessmentType.PROGRESS_CHECK: return 15;
      case AssessmentType.COMPETENCY_VALIDATION: return 10;
      default: return 20;
    }
  }

  private static adjustDifficultyLevel(
    currentLevel: CEFRLevel,
    response: QuestionResponse,
    allResponses: QuestionResponse[]
  ): CEFRLevel {

    // 최근 5문제의 정답률 계산
    const recentResponses = allResponses.slice(-4).concat(response);
    const correctRate = recentResponses.filter(r => r.isCorrect).length / recentResponses.length;

    // 적응형 조정 로직
    if (correctRate >= 0.8 && currentLevel !== 'B2') {
      // 80% 이상 정답률이면 레벨 상승
      const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
      const currentIndex = levels.indexOf(currentLevel);
      return levels[currentIndex + 1] || currentLevel;
    } else if (correctRate <= 0.4 && currentLevel !== 'A1') {
      // 40% 이하 정답률이면 레벨 하강
      const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
      const currentIndex = levels.indexOf(currentLevel);
      return levels[currentIndex - 1] || currentLevel;
    }

    return currentLevel; // 레벨 유지
  }

  private static async selectQuestionByLevel(
    level: CEFRLevel,
    usedQuestionIds: string[],
    koreanOptimizations: any
  ): Promise<Question | null> {

    // 문제 선택 로직 (실제 데이터베이스 쿼리로 대체 예정)
    // const questions = await prisma.question.findMany({
    //   where: {
    //     level,
    //     id: { notIn: usedQuestionIds }
    //   },
    //   orderBy: { difficulty: 'asc' }
    // });

    // 임시 mock 데이터 반환
    return {
      id: `q_${level}_${Date.now()}`,
      type: QuestionType.MULTIPLE_CHOICE,
      level,
      category: QuestionCategory.VOCABULARY,
      difficulty: 5,
      content: {
        question: `${level} 수준 테스트 문제`,
        instruction: '정답을 선택하세요',
        multipleChoice: {
          options: [
            { id: 'A', text: '옵션 A', isCorrect: true },
            { id: 'B', text: '옵션 B', isCorrect: false },
            { id: 'C', text: '옵션 C', isCorrect: false },
            { id: 'D', text: '옵션 D', isCorrect: false }
          ]
        }
      },
      correctAnswer: 'A',
      scoringCriteria: {
        maxScore: 100,
        passingScore: 70
      },
      tags: [level, 'vocabulary'],
      estimatedTimeSeconds: 30
    };
  }

  private static evaluateAnswer(question: Question, answer: any): boolean {
    // 답안 평가 로직 (문제 타입별 구현)
    return answer === question.correctAnswer;
  }

  private static analyzeError(question: Question, answer: any) {
    // 오답 분석 로직
    return {
      errorType: ErrorType.VOCABULARY_UNKNOWN,
      expectedAnswer: question.correctAnswer,
      userAnswer: answer,
      koreanTransferError: false
    };
  }

  private static calculateFinalResults(session: AssessmentSession): AssessmentResults {
    // 최종 결과 계산 로직
    const correctCount = session.responses.filter(r => r.isCorrect).length;
    const totalCount = session.responses.length;
    const accuracy = correctCount / totalCount;

    // CEFR 레벨 결정
    let finalLevel: CEFRLevel = 'A1';
    if (accuracy >= 0.85) finalLevel = 'B2';
    else if (accuracy >= 0.75) finalLevel = 'B1';
    else if (accuracy >= 0.65) finalLevel = 'A2';

    return {
      finalLevel,
      confidence: Math.min(accuracy + 0.1, 1.0),
      detailedScores: {
        vocabulary: Math.round(accuracy * 100),
        grammar: Math.round(accuracy * 95),
        listening: Math.round(accuracy * 90),
        cultural: Math.round(accuracy * 85)
      },
      levelBreakdown: {
        A1: { level: 'A1', achievementPercentage: 100, masteredSkills: [], developingSkills: [], needsWorkSkills: [], readinessForNext: true },
        A2: { level: 'A2', achievementPercentage: finalLevel === 'A1' ? 0 : 100, masteredSkills: [], developingSkills: [], needsWorkSkills: [], readinessForNext: finalLevel !== 'A1' },
        B1: { level: 'B1', achievementPercentage: ['B1', 'B2'].includes(finalLevel) ? 100 : 0, masteredSkills: [], developingSkills: [], needsWorkSkills: [], readinessForNext: finalLevel === 'B2' },
        B2: { level: 'B2', achievementPercentage: finalLevel === 'B2' ? 100 : 0, masteredSkills: [], developingSkills: [], needsWorkSkills: [], readinessForNext: false }
      },
      recommendations: {
        startingLevel: finalLevel,
        suggestedPath: {
          duration: 52 - (['A1', 'A2', 'B1', 'B2'].indexOf(finalLevel) * 13),
          intensity: 'standard',
          focusAreas: []
        },
        pastoralRecommendations: {
          sermonWritingReadiness: {
            currentCapability: finalLevel === 'B2' ? 'advanced' : finalLevel === 'B1' ? 'intermediate' : finalLevel === 'A2' ? 'basic' : 'none',
            nextMilestone: '기초 설교 구조 이해',
            estimatedWeeksToBasicSermon: ['A1', 'A2', 'B1', 'B2'].indexOf(finalLevel) * 13 + 26
          },
          theologicalVocabularyLevel: {
            current: ['A1', 'A2', 'B1', 'B2'].indexOf(finalLevel) * 2 + 2,
            targetForSermons: 8,
            keyTermsToLearn: []
          },
          culturalPreparation: {
            hungarianChurchFamiliarity: Math.min((['A1', 'A2', 'B1', 'B2'].indexOf(finalLevel) + 1) * 2, 10),
            recommendedCulturalStudies: []
          }
        },
        methodologyRecommendations: {
          preferredLearningStyles: ['visual', 'auditory'],
          recommendedResources: [],
          practiceFrequency: {
            daily: 30,
            weekly: 5
          }
        }
      },
      statistics: {
        totalQuestions: totalCount,
        correctAnswers: correctCount,
        averageTimePerQuestion: session.responses.reduce((sum, r) => sum + r.timeSpentSeconds, 0) / totalCount,
        strongestAreas: [QuestionCategory.VOCABULARY],
        weakestAreas: [QuestionCategory.GRAMMAR]
      },
      koreanLearnerAnalysis: {
        pronunciationChallenges: ['gy', 'ny', 'sz'],
        grammarInterferenceIssues: ['word_order', 'case_system'],
        culturalKnowledgeGaps: ['hungarian_church_customs'],
        recommendedFocusAreas: ['pronunciation_drills', 'case_practice']
      }
    };
  }

  // Placeholder methods for database operations
  private static async getSession(sessionId: string): Promise<AssessmentSession | null> {
    // 실제 구현에서는 Prisma 쿼리
    return null;
  }

  private static async getQuestion(questionId: string): Promise<Question> {
    // 실제 구현에서는 Prisma 쿼리
    return {} as Question;
  }
}