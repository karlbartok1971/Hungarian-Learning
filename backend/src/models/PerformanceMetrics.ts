// 성능 지표 모델
// Hungarian Learning Platform - Performance Metrics Model
// T107 [P] [US5] Create PerformanceMetrics model

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany
} from 'typeorm';
import { User } from './User';
import { LearningAnalytics } from './LearningAnalytics';

// 실시간 성능 지표 추적
@Entity('performance_metrics')
@Index(['userId', 'metricDate', 'metricType'])
export class PerformanceMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid', { nullable: true })
  analyticsId: string;

  @ManyToOne(() => LearningAnalytics, analytics => analytics.performanceMetrics)
  @JoinColumn({ name: 'analyticsId' })
  analytics: LearningAnalytics;

  @Column('date')
  @Index()
  metricDate: Date;

  @Column('varchar', { length: 50 })
  @Index()
  metricType: string; // vocabulary, pronunciation, grammar, overall, session

  @Column('varchar', { length: 20 })
  granularity: string; // realtime, hourly, daily, weekly, monthly

  // 기본 성능 지표
  @Column('jsonb')
  basicMetrics: {
    accuracy: number; // 정확도 (0-1)
    speed: number; // 응답 속도 (초)
    consistency: number; // 일관성 점수 (0-1)
    efficiency: number; // 학습 효율성 (0-1)
    engagement: number; // 참여도 (0-1)
    retention: number; // 기억 유지율 (0-1)
    improvement: number; // 개선율 (-1 to 1)
    confidence: number; // 자신감 점수 (0-1)
  };

  // 스킬별 세부 성능
  @Column('jsonb')
  skillSpecificMetrics: {
    vocabulary: {
      newWordsLearned: number;
      wordsRetained: number;
      averageRetentionTime: number; // 시간(초)
      difficultyDistribution: Record<string, number>;
      categoryPerformance: Record<string, number>;
      learningVelocity: number; // 단어/시간
      masteryRate: number; // 숙달률 (0-1)
      forgettingRate: number; // 망각률 (0-1)
    };
    pronunciation: {
      phonemeAccuracy: Record<string, number>;
      intonationScore: number;
      fluencyRating: number;
      nativelikeness: number; // 원어민 유사성 (0-1)
      improvementTrend: number[]; // 시간별 개선 추이
      challengingPhonemes: string[];
      masteredSounds: string[];
      pronunciationConfidence: number;
    };
    grammar: {
      structureAccuracy: Record<string, number>;
      complexityHandling: number; // 복잡성 처리 능력
      syntaxErrors: number;
      morphologyScore: number;
      pragmaticUsage: number; // 화용적 사용 능력
      grammarIntuition: number; // 문법 직감
      ruleApplication: number; // 규칙 적용 능력
      contextualAdaptation: number; // 맥락적 적응
    };
  };

  // 인지적 성능 지표
  @Column('jsonb')
  cognitiveMetrics: {
    workingMemoryLoad: number; // 작업 기억 부하
    attentionLevel: number; // 주의 집중 수준
    processingSpeed: number; // 처리 속도
    cognitiveFlexibility: number; // 인지적 유연성
    metacognitiveAwareness: number; // 상위인지 인식
    learningTransfer: number; // 학습 전이 능력
    patternRecognition: number; // 패턴 인식
    abstractThinking: number; // 추상적 사고
    executiveControl: number; // 실행 통제
    cognitiveEfficiency: number; // 인지 효율성
  };

  // 시간적 성능 분석
  @Column('jsonb')
  temporalMetrics: {
    peakPerformanceTime: {
      hour: number;
      performanceScore: number;
      duration: number; // 분
      consistency: number;
    };
    fatiguePattern: {
      onsetTime: number; // 분
      severity: number; // 0-1
      recoveryTime: number; // 분
      pattern: 'linear' | 'exponential' | 'plateau';
    };
    learningMomentum: {
      acceleration: number; // 학습 가속도
      sustainedPeriod: number; // 지속 시간(분)
      peakMoment: number; // 최고점 시간
      decayRate: number; // 감소율
    };
    rhythmAnalysis: {
      naturalPace: number; // 자연적 속도
      optimalIntensity: number; // 최적 강도
      breakFrequency: number; // 휴식 빈도
      sustainabilityIndex: number; // 지속가능성 지수
    };
  };

  // 학습 상태 지표
  @Column('jsonb')
  learningState: {
    flowState: {
      probability: number; // 플로우 상태 확률
      indicators: string[]; // 플로우 지표들
      duration: number; // 지속 시간
      triggerFactors: string[]; // 유발 요인
    };
    motivation: {
      intrinsicLevel: number; // 내재적 동기
      extrinsicLevel: number; // 외재적 동기
      goalOrientation: number; // 목표 지향성
      persistenceIndex: number; // 지속성 지수
    };
    frustrationIndicators: {
      level: number; // 좌절감 수준
      triggers: string[]; // 유발 요인
      copingStrategies: string[]; // 대처 전략
      resolutionTime: number; // 해결 시간
    };
    confidenceMetrics: {
      selfEfficacy: number; // 자기효능감
      taskConfidence: number; // 과제 자신감
      progressConfidence: number; // 진도 자신감
      abilityBelief: number; // 능력에 대한 믿음
    };
  };

  // 상호작용 패턴
  @Column('jsonb')
  interactionPatterns: {
    responsePatterns: {
      averageThinkingTime: number; // 평균 사고 시간
      impulsivityIndex: number; // 충동성 지수
      hesitationPatterns: string[]; // 주저 패턴
      confidenceAlignment: number; // 자신감-정답 일치도
    };
    errorPatterns: {
      errorTypes: Record<string, number>; // 에러 유형별 빈도
      persistencePatterns: string[]; // 지속적 에러 패턴
      correctionSpeed: number; // 수정 속도
      learningFromErrors: number; // 에러 학습 능력
    };
    helpSeekingBehavior: {
      frequency: number; // 도움 요청 빈도
      timing: string[]; // 도움 요청 시점
      effectiveness: number; // 도움 활용 효과
      independence: number; // 독립성 지수
    };
    explorationBehavior: {
      curiosityLevel: number; // 호기심 수준
      experimentationRate: number; // 실험 시도율
      riskTaking: number; // 위험 감수 성향
      creativityIndex: number; // 창의성 지수
    };
  };

  // 적응적 성능
  @Column('jsonb')
  adaptivePerformance: {
    difficultyAdaptation: {
      adaptationSpeed: number; // 적응 속도
      comfortZoneExpansion: number; // 안전지대 확장
      challengeTolerance: number; // 도전 내성
      recoveryRate: number; // 회복률
    };
    contextualFlexibility: {
      topicSwitching: number; // 주제 전환 능력
      modalityAdaptation: number; // 양식 적응 능력
      environmentalAdaptation: number; // 환경 적응
      toolUtilizationFlexibility: number; // 도구 활용 유연성
    };
    learningStyleAdaptation: {
      preferredModalities: string[]; // 선호 학습 양식
      modalityEffectiveness: Record<string, number>; // 양식별 효과
      adaptabilityScore: number; // 적응성 점수
      personalizedOptimization: number; // 개인화 최적화
    };
  };

  // 사회적 학습 지표
  @Column('jsonb')
  socialLearningMetrics: {
    peerInteraction: {
      collaborationEffectiveness: number; // 협력 효과
      socialSupportUtilization: number; // 사회적 지원 활용
      competitiveMotivation: number; // 경쟁적 동기
      communityEngagement: number; // 커뮤니티 참여
    };
    feedbackReceptivity: {
      feedbackAcceptance: number; // 피드백 수용도
      implementationRate: number; // 구현율
      feedbackSeeking: number; // 피드백 추구
      selfReflection: number; // 자기 성찰
    };
    culturalAdaptation: {
      crossCulturalAwareness: number; // 문화간 인식
      contextualSensitivity: number; // 맥락적 민감성
      pragmaticCompetence: number; // 화용적 능력
      culturalBridging: number; // 문화적 연결
    };
  };

  // 진단적 지표
  @Column('jsonb')
  diagnosticMetrics: {
    learningDisabilities: {
      riskIndicators: string[]; // 위험 지표
      compensatoryStrategies: string[]; // 보상 전략
      accommodationNeeds: string[]; // 지원 필요사항
      strengthAreas: string[]; // 강점 영역
    };
    cognitiveProfile: {
      verbalIntelligence: number; // 언어적 지능
      workingMemoryCapacity: number; // 작업 기억 용량
      processingSpeedProfile: string; // 처리 속도 프로필
      executiveFunctioning: number; // 실행 기능
    };
    emotionalFactors: {
      anxietyLevel: number; // 불안 수준
      stressResponse: number; // 스트레스 반응
      emotionalRegulation: number; // 감정 조절
      resilience: number; // 회복력
    };
    personalityFactors: {
      conscientiousness: number; // 성실성
      openness: number; // 개방성
      extraversion: number; // 외향성
      neuroticism: number; // 신경성
      agreeableness: number; // 친화성
    };
  };

  // 예측적 지표
  @Column('jsonb')
  predictiveIndicators: {
    performanceTrend: {
      shortTermTrend: 'improving' | 'stable' | 'declining';
      longTermProjection: number; // 장기 예측 점수
      plateauRisk: number; // 정체 위험도
      breakthroughPotential: number; // 돌파 잠재력
    };
    riskAssessment: {
      dropoutRisk: number; // 중도 포기 위험
      burnoutRisk: number; // 번아웃 위험
      overconfidenceRisk: number; // 과신 위험
      underperformanceRisk: number; // 저조한 성과 위험
    };
    optimizationOpportunities: {
      immediateGains: string[]; // 즉시 개선 가능 영역
      strategicImprovements: string[]; // 전략적 개선 영역
      systemicChanges: string[]; // 체계적 변화 필요 영역
      personalizedInterventions: string[]; // 개인화된 중재
    };
  };

  // 메타데이터 및 품질 지표
  @Column('jsonb')
  metaMetrics: {
    dataQuality: {
      completeness: number; // 완전성 (0-1)
      accuracy: number; // 정확성 (0-1)
      timeliness: number; // 시의성 (0-1)
      consistency: number; // 일관성 (0-1)
      reliability: number; // 신뢰성 (0-1)
    };
    measurementContext: {
      sessionContext: string; // 세션 맥락
      environmentalFactors: string[]; // 환경 요인
      technicalConditions: string[]; // 기술적 조건
      userState: string; // 사용자 상태
    };
    computationMetadata: {
      algorithmVersion: string; // 알고리즘 버전
      computationTime: number; // 계산 시간
      confidenceLevel: number; // 신뢰도 수준
      assumptions: string[]; // 가정사항
      limitations: string[]; // 제한사항
    };
    validationResults: {
      crossValidationScore: number; // 교차 검증 점수
      predictionAccuracy: number; // 예측 정확도
      modelFit: number; // 모델 적합도
      outlierDetection: string[]; // 이상치 탐지
    };
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// 실시간 세션 성능 추적
@Entity('session_performance')
@Index(['userId', 'sessionId', 'timestamp'])
export class SessionPerformance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  sessionId: string;

  @Column('timestamp')
  @Index()
  timestamp: Date;

  @Column('integer')
  sequenceNumber: number; // 세션 내 순서

  @Column('varchar', { length: 50 })
  activityType: string; // 활동 유형

  @Column('jsonb')
  instantMetrics: {
    responseTime: number; // 응답 시간 (밀리초)
    accuracy: boolean; // 정확성
    confidence: number; // 자신감 (0-1)
    difficulty: number; // 난이도 (0-1)
    cognitiveLoad: number; // 인지 부하 (0-1)
    engagement: number; // 참여도 (0-1)
    frustration: number; // 좌절감 (0-1)
    flow: number; // 플로우 상태 (0-1)
  };

  @Column('jsonb', { nullable: true })
  contextualData: {
    timeOfDay: string;
    dayOfWeek: number;
    sessionDuration: number; // 세션 시작부터 경과 시간
    previousAccuracy: number; // 직전 정확도
    streakLength: number; // 연속 정답 수
    breaks: number; // 휴식 횟수
    hints: number; // 힌트 사용 횟수
  };

  @Column('jsonb', { nullable: true })
  biometricData: {
    // 향후 웨어러블 디바이스 연동 시 활용
    heartRate: number;
    stressLevel: number;
    attentionLevel: number;
    fatigueLevel: number;
  };

  @CreateDateColumn()
  createdAt: Date;
}

// 성능 벤치마크
@Entity('performance_benchmarks')
@Index(['userId', 'benchmarkType', 'levelCategory'])
export class PerformanceBenchmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('varchar', { length: 50 })
  benchmarkType: string; // personal_best, peer_average, cefr_standard

  @Column('varchar', { length: 20 })
  levelCategory: string; // A1, A2, B1, B2, C1, C2

  @Column('date')
  benchmarkDate: Date;

  @Column('jsonb')
  benchmarkData: {
    vocabulary: {
      wordsKnown: number;
      learningRate: number; // 단어/일
      retentionRate: number; // 0-1
      difficultyLevel: number; // 0-1
      masteryThreshold: number; // 숙달 기준
    };
    pronunciation: {
      phoneticAccuracy: number; // 0-1
      fluencyScore: number; // 0-1
      nativelikenessRating: number; // 0-1
      intonationControl: number; // 0-1
    };
    grammar: {
      structuralAccuracy: number; // 0-1
      complexityHandling: number; // 0-1
      pragmaticCompetence: number; // 0-1
      errorRecovery: number; // 0-1
    };
    overall: {
      proficiencyScore: number; // 0-1
      learningVelocity: number; // 진도율
      consistencyIndex: number; // 일관성 지수
      adaptabilityScore: number; // 적응성 점수
    };
  };

  @Column('jsonb')
  comparisonMetrics: {
    personalProgress: {
      improvementRate: number; // 개선율
      milestoneProgress: number; // 마일스톤 진도
      goalAlignment: number; // 목표 일치도
      trajectoryFit: number; // 궤도 적합도
    };
    peerComparison: {
      percentileRank: number; // 백분위
      relativePosition: string; // 상대적 위치
      strengthAreas: string[]; // 강점 영역
      improvementAreas: string[]; // 개선 영역
    };
    standardAlignment: {
      cefrLevel: string; // CEFR 레벨
      levelProgress: number; // 레벨 진도 (0-1)
      nextLevelReadiness: number; // 다음 레벨 준비도
      skillGaps: string[]; // 스킬 격차
    };
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// 성능 알림 및 인사이트
@Entity('performance_insights')
@Index(['userId', 'insightDate', 'priority'])
export class PerformanceInsight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('timestamp')
  @Index()
  insightDate: Date;

  @Column('varchar', { length: 50 })
  insightType: string; // achievement, warning, recommendation, trend

  @Column('varchar', { length: 20 })
  priority: string; // high, medium, low

  @Column('varchar', { length: 200 })
  title: string;

  @Column('text')
  description: string;

  @Column('jsonb')
  insightData: {
    triggerMetrics: Record<string, number>; // 유발 지표
    evidenceData: any[]; // 증거 데이터
    confidenceLevel: number; // 신뢰도
    actionRecommendations: string[]; // 행동 권장사항
    expectedOutcomes: string[]; // 예상 결과
    timeframe: string; // 시간 프레임
    resources: string[]; // 필요 자원
  };

  @Column('boolean', { default: false })
  isRead: boolean;

  @Column('boolean', { default: false })
  isActedUpon: boolean;

  @Column('timestamp', { nullable: true })
  actionDate: Date;

  @Column('jsonb', { nullable: true })
  outcomeData: {
    actualResults: string[]; // 실제 결과
    effectiveness: number; // 효과성 (0-1)
    sideEffects: string[]; // 부작용
    adjustments: string[]; // 조정사항
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export {
  PerformanceMetrics,
  SessionPerformance,
  PerformanceBenchmark,
  PerformanceInsight
};