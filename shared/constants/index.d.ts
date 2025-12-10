export declare const SYSTEM_CONSTANTS: {
    readonly LEARNING_DURATION: {
        readonly A1_TO_A2: 90;
        readonly A2_TO_B1: 120;
        readonly B1_TO_B2: 150;
    };
    readonly DAILY_STUDY_GOALS: {
        readonly BEGINNER: 30;
        readonly INTERMEDIATE: 45;
        readonly ADVANCED: 60;
    };
    readonly VOCABULARY_TARGETS: {
        readonly A1: 500;
        readonly A2: 1000;
        readonly B1: 2000;
        readonly B2: 3500;
    };
    readonly PRONUNCIATION_THRESHOLDS: {
        readonly EXCELLENT: 90;
        readonly GOOD: 75;
        readonly FAIR: 60;
        readonly POOR: 40;
    };
    readonly FILE_LIMITS: {
        readonly AUDIO_MAX_SIZE: number;
        readonly PDF_MAX_SIZE: number;
        readonly AUDIO_FORMATS: readonly ["mp3", "wav", "ogg", "m4a"];
        readonly PDF_FORMATS: readonly ["pdf"];
    };
    readonly AUTH: {
        readonly JWT_EXPIRES_IN: "7d";
        readonly REFRESH_TOKEN_EXPIRES_IN: "30d";
        readonly MAX_LOGIN_ATTEMPTS: 5;
        readonly LOCKOUT_DURATION: number;
    };
    readonly CACHE_TTL: {
        readonly LESSON_CONTENT: number;
        readonly VOCABULARY: number;
        readonly USER_PROGRESS: number;
        readonly PRONUNCIATION_RESULT: number;
    };
};
export declare const HUNGARIAN_LANGUAGE: {
    readonly SPECIAL_CHARACTERS: readonly ["á", "é", "í", "ó", "ö", "ő", "ú", "ü", "ű", "Á", "É", "Í", "Ó", "Ö", "Ő", "Ú", "Ü", "Ű"];
    readonly PHONETIC_FEATURES: {
        readonly VOWEL_HARMONY: readonly ["front", "back", "mixed"];
        readonly CONSONANT_CLUSTERS: readonly ["sz", "gy", "ty", "ny", "ly", "cs", "dz", "dzs"];
    };
    readonly RELIGIOUS_CATEGORIES: readonly ["liturgy", "theology", "scripture", "prayer", "sacrament", "ministry", "worship", "fellowship"];
    readonly GRAMMAR_TOPICS_BY_LEVEL: {
        readonly A1: readonly ["articles", "basic_verbs", "personal_pronouns", "present_tense"];
        readonly A2: readonly ["past_tense", "possessives", "comparatives", "modal_verbs"];
        readonly B1: readonly ["subjunctive", "conditionals", "relative_clauses", "passive_voice"];
        readonly B2: readonly ["advanced_tenses", "complex_sentences", "stylistic_variations"];
    };
};
export declare const UI_CONSTANTS: {
    readonly COLORS: {
        readonly PRIMARY: "#2563eb";
        readonly SUCCESS: "#059669";
        readonly WARNING: "#d97706";
        readonly ERROR: "#dc2626";
        readonly HUNGARIAN_FLAG: {
            readonly RED: "#cd212a";
            readonly WHITE: "#ffffff";
            readonly GREEN: "#436f4d";
        };
    };
    readonly ANIMATION_DURATION: {
        readonly FAST: 150;
        readonly NORMAL: 300;
        readonly SLOW: 500;
    };
    readonly BREAKPOINTS: {
        readonly SM: "640px";
        readonly MD: "768px";
        readonly LG: "1024px";
        readonly XL: "1280px";
    };
    readonly FONT_SIZES: {
        readonly XS: "0.75rem";
        readonly SM: "0.875rem";
        readonly BASE: "1rem";
        readonly LG: "1.125rem";
        readonly XL: "1.25rem";
        readonly '2XL': "1.5rem";
        readonly '3XL': "1.875rem";
    };
};
export declare const API_ENDPOINTS: {
    readonly AUTH: {
        readonly LOGIN: "/auth/login";
        readonly REGISTER: "/auth/register";
        readonly REFRESH: "/auth/refresh";
        readonly LOGOUT: "/auth/logout";
        readonly PROFILE: "/auth/profile";
    };
    readonly USERS: {
        readonly BASE: "/users";
        readonly PROGRESS: "/users/progress";
        readonly STATS: "/users/stats";
        readonly SETTINGS: "/users/settings";
    };
    readonly LESSONS: {
        readonly BASE: "/lessons";
        readonly BY_LEVEL: "/lessons/level/:level";
        readonly COMPLETE: "/lessons/:id/complete";
        readonly PROGRESS: "/lessons/:id/progress";
    };
    readonly VOCABULARY: {
        readonly BASE: "/vocabulary";
        readonly REVIEW: "/vocabulary/review";
        readonly PRACTICE: "/vocabulary/practice";
        readonly STATS: "/vocabulary/stats";
    };
    readonly PRONUNCIATION: {
        readonly BASE: "/pronunciation";
        readonly ASSESS: "/pronunciation/assess";
        readonly PRACTICE: "/pronunciation/practice";
    };
    readonly SERMON: {
        readonly BASE: "/sermon";
        readonly DRAFTS: "/sermon/drafts";
        readonly FEEDBACK: "/sermon/:id/feedback";
        readonly PUBLISH: "/sermon/:id/publish";
    };
    readonly UPLOAD: {
        readonly AUDIO: "/upload/audio";
        readonly PDF: "/upload/pdf";
        readonly IMAGE: "/upload/image";
    };
};
export declare const ERROR_MESSAGES: {
    readonly AUTH: {
        readonly INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다.";
        readonly USER_NOT_FOUND: "사용자를 찾을 수 없습니다.";
        readonly EMAIL_ALREADY_EXISTS: "이미 가입된 이메일입니다.";
        readonly INVALID_TOKEN: "유효하지 않은 토큰입니다.";
        readonly TOKEN_EXPIRED: "토큰이 만료되었습니다.";
    };
    readonly VALIDATION: {
        readonly REQUIRED_FIELD: "필수 입력 항목입니다.";
        readonly INVALID_EMAIL: "유효한 이메일 주소를 입력해주세요.";
        readonly PASSWORD_TOO_SHORT: "비밀번호는 최소 8자 이상이어야 합니다.";
        readonly INVALID_LEVEL: "유효하지 않은 레벨입니다.";
    };
    readonly UPLOAD: {
        readonly FILE_TOO_LARGE: "파일 크기가 너무 큽니다.";
        readonly INVALID_FORMAT: "지원하지 않는 파일 형식입니다.";
        readonly UPLOAD_FAILED: "파일 업로드에 실패했습니다.";
    };
    readonly GENERAL: {
        readonly SERVER_ERROR: "서버 오류가 발생했습니다.";
        readonly NETWORK_ERROR: "네트워크 연결을 확인해주세요.";
        readonly UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.";
    };
};
export declare const SUCCESS_MESSAGES: {
    readonly AUTH: {
        readonly LOGIN_SUCCESS: "성공적으로 로그인되었습니다.";
        readonly REGISTER_SUCCESS: "회원가입이 완료되었습니다.";
        readonly LOGOUT_SUCCESS: "로그아웃되었습니다.";
    };
    readonly LESSON: {
        readonly COMPLETED: "레슨을 완료했습니다!";
        readonly PROGRESS_SAVED: "학습 진도가 저장되었습니다.";
    };
    readonly PRONUNCIATION: {
        readonly EXCELLENT: "훌륭한 발음입니다!";
        readonly GOOD: "좋은 발음이에요!";
        readonly NEEDS_PRACTICE: "조금 더 연습해보세요.";
    };
    readonly SERMON: {
        readonly SAVED: "설교문이 저장되었습니다.";
        readonly PUBLISHED: "설교문이 게시되었습니다.";
    };
};
export declare const REGEX_PATTERNS: {
    readonly EMAIL: RegExp;
    readonly PASSWORD: RegExp;
    readonly HUNGARIAN_WORD: RegExp;
    readonly PHONE_NUMBER: RegExp;
};
//# sourceMappingURL=index.d.ts.map