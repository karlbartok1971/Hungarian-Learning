/**
 * Assessment 검증 및 에러 처리 유틸리티
 * T040 - 평가 플로우의 검증 로직과 에러 처리를 담당
 */

import { AssessmentQuestion } from '@/services/assessmentApi';

// 에러 타입 정의
export enum AssessmentErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  AUDIO_ERROR = 'AUDIO_ERROR',
  MICROPHONE_ERROR = 'MICROPHONE_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AssessmentError {
  type: AssessmentErrorType;
  message: string;
  details?: string;
  recoverable: boolean;
  retryable: boolean;
}

// 검증 규칙 정의
export interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
}

export interface QuestionValidation {
  [key: string]: ValidationRule;
}

// 문제 유형별 검증 규칙
export const QUESTION_TYPE_VALIDATION: Record<string, ValidationRule> = {
  multiple_choice: {
    required: true,
    custom: (value: string) => value.trim().length > 0
  },
  fill_blank: {
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-ZáéíóöőüűÁÉÍÓÖŐÜŰ\s\-']+$/
  },
  audio_recognition: {
    required: true,
    minLength: 2,
    maxLength: 200
  },
  cultural_context: {
    required: true,
    minLength: 10,
    maxLength: 500
  },
  essay: {
    required: true,
    minLength: 50,
    maxLength: 2000
  }
};

// 헝가리어 특수문자 패턴
export const HUNGARIAN_TEXT_PATTERN = /^[a-zA-ZáéíóöőüűÁÉÍÓÖŐÜŰ\s\-'.,!?;:()0-9]+$/;

/**
 * 답변 검증 함수
 */
export const validateAnswer = (
  question: AssessmentQuestion,
  answer: string
): { isValid: boolean; error?: string } => {
  const rule = QUESTION_TYPE_VALIDATION[question.type];
  if (!rule) {
    return { isValid: true };
  }

  // 필수 입력 검증
  if (rule.required && (!answer || answer.trim().length === 0)) {
    return {
      isValid: false,
      error: '답변을 입력해주세요.'
    };
  }

  // 최소 길이 검증
  if (rule.minLength && answer.trim().length < rule.minLength) {
    return {
      isValid: false,
      error: `최소 ${rule.minLength}글자 이상 입력해주세요.`
    };
  }

  // 최대 길이 검증
  if (rule.maxLength && answer.trim().length > rule.maxLength) {
    return {
      isValid: false,
      error: `최대 ${rule.maxLength}글자까지만 입력 가능합니다.`
    };
  }

  // 패턴 검증
  if (rule.pattern && !rule.pattern.test(answer.trim())) {
    return {
      isValid: false,
      error: '올바른 형식의 답변을 입력해주세요.'
    };
  }

  // 커스텀 검증
  if (rule.custom && !rule.custom(answer.trim())) {
    return {
      isValid: false,
      error: '유효하지 않은 답변입니다.'
    };
  }

  // 문제 유형별 추가 검증
  switch (question.type) {
    case 'multiple_choice':
      if (!question.options?.includes(answer)) {
        return {
          isValid: false,
          error: '제공된 선택지 중에서 선택해주세요.'
        };
      }
      break;

    case 'fill_blank':
      // 헝가리어 단어 검증
      if (!HUNGARIAN_TEXT_PATTERN.test(answer)) {
        return {
          isValid: false,
          error: '헝가리어 문자만 입력 가능합니다.'
        };
      }
      break;

    case 'audio_recognition':
      // 공백만 있는지 확인
      if (answer.trim() === '') {
        return {
          isValid: false,
          error: '들은 내용을 정확히 입력해주세요.'
        };
      }
      break;

    case 'cultural_context':
      // 문화적 맥락 답변의 적절성 검증
      if (answer.trim().length < 10) {
        return {
          isValid: false,
          error: '상황에 대한 충분한 설명을 작성해주세요.'
        };
      }
      break;

    case 'essay':
      // 에세이 품질 기본 검증
      const words = answer.trim().split(/\s+/);
      if (words.length < 10) {
        return {
          isValid: false,
          error: '최소 10개 단어 이상 작성해주세요.'
        };
      }
      break;
  }

  return { isValid: true };
};

/**
 * 에러 분류 함수
 */
export const classifyError = (error: any): AssessmentError => {
  const message = error.message || error.toString();

  // 네트워크 에러
  if (error.name === 'NetworkError' || message.includes('fetch')) {
    return {
      type: AssessmentErrorType.NETWORK_ERROR,
      message: '네트워크 연결을 확인해주세요.',
      details: message,
      recoverable: true,
      retryable: true
    };
  }

  // 타임아웃 에러
  if (message.includes('timeout') || message.includes('시간')) {
    return {
      type: AssessmentErrorType.TIMEOUT_ERROR,
      message: '요청 시간이 초과되었습니다.',
      details: message,
      recoverable: true,
      retryable: true
    };
  }

  // 세션 만료
  if (message.includes('세션') || message.includes('session') || error.status === 401) {
    return {
      type: AssessmentErrorType.SESSION_EXPIRED,
      message: '세션이 만료되었습니다. 다시 로그인해주세요.',
      details: message,
      recoverable: false,
      retryable: false
    };
  }

  // 오디오 관련 에러
  if (message.includes('audio') || message.includes('오디오')) {
    return {
      type: AssessmentErrorType.AUDIO_ERROR,
      message: '오디오 재생에 문제가 발생했습니다.',
      details: message,
      recoverable: true,
      retryable: true
    };
  }

  // 마이크 관련 에러
  if (message.includes('microphone') || message.includes('마이크')) {
    return {
      type: AssessmentErrorType.MICROPHONE_ERROR,
      message: '마이크 권한을 확인해주세요.',
      details: message,
      recoverable: true,
      retryable: false
    };
  }

  // 서버 에러
  if (error.status >= 500 || message.includes('서버')) {
    return {
      type: AssessmentErrorType.SERVER_ERROR,
      message: '서버에 일시적인 문제가 발생했습니다.',
      details: message,
      recoverable: true,
      retryable: true
    };
  }

  // 검증 에러
  if (error.status === 400 || message.includes('validation') || message.includes('검증')) {
    return {
      type: AssessmentErrorType.VALIDATION_ERROR,
      message: '입력 데이터에 오류가 있습니다.',
      details: message,
      recoverable: true,
      retryable: false
    };
  }

  // 기타 에러
  return {
    type: AssessmentErrorType.UNKNOWN_ERROR,
    message: '알 수 없는 오류가 발생했습니다.',
    details: message,
    recoverable: false,
    retryable: false
  };
};

/**
 * 에러 복구 전략 제안
 */
export const getRecoveryStrategy = (error: AssessmentError): string[] => {
  const strategies: string[] = [];

  switch (error.type) {
    case AssessmentErrorType.NETWORK_ERROR:
      strategies.push('인터넷 연결 상태를 확인해주세요.');
      strategies.push('Wi-Fi 또는 데이터 연결을 재설정해보세요.');
      strategies.push('잠시 후 다시 시도해주세요.');
      break;

    case AssessmentErrorType.TIMEOUT_ERROR:
      strategies.push('네트워크 연결 속도를 확인해주세요.');
      strategies.push('다른 브라우저 탭을 닫아보세요.');
      strategies.push('잠시 후 다시 시도해주세요.');
      break;

    case AssessmentErrorType.SESSION_EXPIRED:
      strategies.push('다시 로그인해주세요.');
      strategies.push('브라우저 쿠키를 확인해주세요.');
      break;

    case AssessmentErrorType.AUDIO_ERROR:
      strategies.push('볼륨 설정을 확인해주세요.');
      strategies.push('다른 오디오 앱을 종료해보세요.');
      strategies.push('브라우저를 새로고침해주세요.');
      break;

    case AssessmentErrorType.MICROPHONE_ERROR:
      strategies.push('브라우저에서 마이크 권한을 허용해주세요.');
      strategies.push('다른 앱에서 마이크를 사용 중인지 확인해주세요.');
      strategies.push('마이크가 제대로 연결되어 있는지 확인해주세요.');
      break;

    case AssessmentErrorType.SERVER_ERROR:
      strategies.push('잠시 후 다시 시도해주세요.');
      strategies.push('페이지를 새로고침해보세요.');
      strategies.push('계속 문제가 발생하면 관리자에게 문의해주세요.');
      break;

    case AssessmentErrorType.VALIDATION_ERROR:
      strategies.push('입력한 답변을 다시 확인해주세요.');
      strategies.push('필수 항목이 모두 입력되었는지 확인해주세요.');
      break;

    default:
      strategies.push('페이지를 새로고침해주세요.');
      strategies.push('브라우저 캐시를 삭제해보세요.');
      strategies.push('다른 브라우저를 사용해보세요.');
      break;
  }

  return strategies;
};

/**
 * 세션 상태 검증
 */
export const validateSession = (session: any): boolean => {
  if (!session) return false;
  if (!session.id || !session.status) return false;
  if (session.status === 'expired' || session.status === 'completed') return false;
  if (session.timeLimit && session.startedAt) {
    const elapsed = Date.now() - new Date(session.startedAt).getTime();
    const timeLimit = session.timeLimit * 60 * 1000; // 분을 밀리초로
    if (elapsed > timeLimit) return false;
  }
  return true;
};

/**
 * 답변 자동 저장 디바운스
 */
export const createAutoSaveDebounce = (
  saveFunction: (questionId: string, answer: string) => void,
  delay: number = 1000
) => {
  let timeoutId: NodeJS.Timeout;

  return (questionId: string, answer: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      saveFunction(questionId, answer);
    }, delay);
  };
};

/**
 * 진행률 계산
 */
export const calculateProgress = (
  currentIndex: number,
  totalQuestions: number
): { percentage: number; timeEstimate: number } => {
  const percentage = Math.round((currentIndex / totalQuestions) * 100);
  const avgTimePerQuestion = 2; // 분
  const remainingQuestions = totalQuestions - currentIndex;
  const timeEstimate = remainingQuestions * avgTimePerQuestion;

  return { percentage, timeEstimate };
};

/**
 * 브라우저 호환성 검사
 */
export const checkBrowserCompatibility = (): { compatible: boolean; issues: string[] } => {
  const issues: string[] = [];

  // 로컬 스토리지 지원 확인
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch {
    issues.push('로컬 스토리지가 지원되지 않습니다.');
  }

  // 웹 오디오 API 지원 확인
  if (!window.AudioContext && !(window as any).webkitAudioContext) {
    issues.push('오디오 기능이 지원되지 않습니다.');
  }

  // getUserMedia 지원 확인 (마이크용)
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    issues.push('마이크 녹음 기능이 지원되지 않습니다.');
  }

  return {
    compatible: issues.length === 0,
    issues
  };
};