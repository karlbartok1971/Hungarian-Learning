"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGEX_PATTERNS = exports.SUCCESS_MESSAGES = exports.ERROR_MESSAGES = exports.API_ENDPOINTS = exports.UI_CONSTANTS = exports.HUNGARIAN_LANGUAGE = exports.SYSTEM_CONSTANTS = void 0;
exports.SYSTEM_CONSTANTS = {
    LEARNING_DURATION: {
        A1_TO_A2: 90,
        A2_TO_B1: 120,
        B1_TO_B2: 150,
    },
    DAILY_STUDY_GOALS: {
        BEGINNER: 30,
        INTERMEDIATE: 45,
        ADVANCED: 60,
    },
    VOCABULARY_TARGETS: {
        A1: 500,
        A2: 1000,
        B1: 2000,
        B2: 3500,
    },
    PRONUNCIATION_THRESHOLDS: {
        EXCELLENT: 90,
        GOOD: 75,
        FAIR: 60,
        POOR: 40,
    },
    FILE_LIMITS: {
        AUDIO_MAX_SIZE: 10 * 1024 * 1024,
        PDF_MAX_SIZE: 50 * 1024 * 1024,
        AUDIO_FORMATS: ['mp3', 'wav', 'ogg', 'm4a'],
        PDF_FORMATS: ['pdf'],
    },
    AUTH: {
        JWT_EXPIRES_IN: '7d',
        REFRESH_TOKEN_EXPIRES_IN: '30d',
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_DURATION: 15 * 60 * 1000,
    },
    CACHE_TTL: {
        LESSON_CONTENT: 60 * 60,
        VOCABULARY: 60 * 60 * 24,
        USER_PROGRESS: 60 * 5,
        PRONUNCIATION_RESULT: 60 * 60 * 24 * 7,
    },
};
exports.HUNGARIAN_LANGUAGE = {
    SPECIAL_CHARACTERS: [
        'á', 'é', 'í', 'ó', 'ö', 'ő', 'ú', 'ü', 'ű',
        'Á', 'É', 'Í', 'Ó', 'Ö', 'Ő', 'Ú', 'Ü', 'Ű'
    ],
    PHONETIC_FEATURES: {
        VOWEL_HARMONY: ['front', 'back', 'mixed'],
        CONSONANT_CLUSTERS: ['sz', 'gy', 'ty', 'ny', 'ly', 'cs', 'dz', 'dzs'],
    },
    RELIGIOUS_CATEGORIES: [
        'liturgy',
        'theology',
        'scripture',
        'prayer',
        'sacrament',
        'ministry',
        'worship',
        'fellowship',
    ],
    GRAMMAR_TOPICS_BY_LEVEL: {
        A1: ['articles', 'basic_verbs', 'personal_pronouns', 'present_tense'],
        A2: ['past_tense', 'possessives', 'comparatives', 'modal_verbs'],
        B1: ['subjunctive', 'conditionals', 'relative_clauses', 'passive_voice'],
        B2: ['advanced_tenses', 'complex_sentences', 'stylistic_variations'],
    },
};
exports.UI_CONSTANTS = {
    COLORS: {
        PRIMARY: '#2563eb',
        SUCCESS: '#059669',
        WARNING: '#d97706',
        ERROR: '#dc2626',
        HUNGARIAN_FLAG: {
            RED: '#cd212a',
            WHITE: '#ffffff',
            GREEN: '#436f4d',
        },
    },
    ANIMATION_DURATION: {
        FAST: 150,
        NORMAL: 300,
        SLOW: 500,
    },
    BREAKPOINTS: {
        SM: '640px',
        MD: '768px',
        LG: '1024px',
        XL: '1280px',
    },
    FONT_SIZES: {
        XS: '0.75rem',
        SM: '0.875rem',
        BASE: '1rem',
        LG: '1.125rem',
        XL: '1.25rem',
        '2XL': '1.5rem',
        '3XL': '1.875rem',
    },
};
exports.API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/profile',
    },
    USERS: {
        BASE: '/users',
        PROGRESS: '/users/progress',
        STATS: '/users/stats',
        SETTINGS: '/users/settings',
    },
    LESSONS: {
        BASE: '/lessons',
        BY_LEVEL: '/lessons/level/:level',
        COMPLETE: '/lessons/:id/complete',
        PROGRESS: '/lessons/:id/progress',
    },
    VOCABULARY: {
        BASE: '/vocabulary',
        REVIEW: '/vocabulary/review',
        PRACTICE: '/vocabulary/practice',
        STATS: '/vocabulary/stats',
    },
    PRONUNCIATION: {
        BASE: '/pronunciation',
        ASSESS: '/pronunciation/assess',
        PRACTICE: '/pronunciation/practice',
    },
    SERMON: {
        BASE: '/sermon',
        DRAFTS: '/sermon/drafts',
        FEEDBACK: '/sermon/:id/feedback',
        PUBLISH: '/sermon/:id/publish',
    },
    UPLOAD: {
        AUDIO: '/upload/audio',
        PDF: '/upload/pdf',
        IMAGE: '/upload/image',
    },
};
exports.ERROR_MESSAGES = {
    AUTH: {
        INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
        USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
        EMAIL_ALREADY_EXISTS: '이미 가입된 이메일입니다.',
        INVALID_TOKEN: '유효하지 않은 토큰입니다.',
        TOKEN_EXPIRED: '토큰이 만료되었습니다.',
    },
    VALIDATION: {
        REQUIRED_FIELD: '필수 입력 항목입니다.',
        INVALID_EMAIL: '유효한 이메일 주소를 입력해주세요.',
        PASSWORD_TOO_SHORT: '비밀번호는 최소 8자 이상이어야 합니다.',
        INVALID_LEVEL: '유효하지 않은 레벨입니다.',
    },
    UPLOAD: {
        FILE_TOO_LARGE: '파일 크기가 너무 큽니다.',
        INVALID_FORMAT: '지원하지 않는 파일 형식입니다.',
        UPLOAD_FAILED: '파일 업로드에 실패했습니다.',
    },
    GENERAL: {
        SERVER_ERROR: '서버 오류가 발생했습니다.',
        NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
        UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
    },
};
exports.SUCCESS_MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: '성공적으로 로그인되었습니다.',
        REGISTER_SUCCESS: '회원가입이 완료되었습니다.',
        LOGOUT_SUCCESS: '로그아웃되었습니다.',
    },
    LESSON: {
        COMPLETED: '레슨을 완료했습니다!',
        PROGRESS_SAVED: '학습 진도가 저장되었습니다.',
    },
    PRONUNCIATION: {
        EXCELLENT: '훌륭한 발음입니다!',
        GOOD: '좋은 발음이에요!',
        NEEDS_PRACTICE: '조금 더 연습해보세요.',
    },
    SERMON: {
        SAVED: '설교문이 저장되었습니다.',
        PUBLISHED: '설교문이 게시되었습니다.',
    },
};
exports.REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    HUNGARIAN_WORD: /^[a-záéíóöőúüűA-ZÁÉÍÓÖŐÚÜŰ\s\-']+$/,
    PHONE_NUMBER: /^\+?[1-9]\d{1,14}$/,
};
//# sourceMappingURL=index.js.map