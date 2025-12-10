from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
import os
import time
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# FastAPI 앱 생성
app = FastAPI(
    title="Hungarian Learning Platform API",
    description="헝가리어 학습 플랫폼을 위한 백엔드 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3700",
        "https://hungarian-learning.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 인증 스키마
security = HTTPBearer()

# 기본 라우트
@app.get("/")
async def root():
    return {
        "message": "Hungarian Learning Platform API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "서비스가 정상적으로 실행 중입니다."
    }

# API 라우터들 임포트 및 포함
try:
    from src.api.sermon import sermon_routes
    app.include_router(sermon_routes, prefix="/api/sermon", tags=["sermon"])
except ImportError:
    print("Warning: Sermon routes not found")

try:
    from src.api.theologicalTerms import theologicalTermsRoutes
    app.include_router(theologicalTermsRoutes, prefix="/api/theological-terms", tags=["theological-terms"])
except ImportError:
    print("Warning: Theological terms routes not found")

try:
    from src.api.auth import auth_routes
    app.include_router(auth_routes, prefix="/api/auth", tags=["auth"])
except ImportError:
    print("Warning: Auth routes not found")

try:
    from src.api.gamification import router as gamification_router
    app.include_router(gamification_router, tags=["gamification"])
except ImportError:
    print("Warning: Gamification routes not found")

# 개발용 더미 엔드포인트들
@app.post("/api/auth/login")
async def login():
    return {
        "success": True,
        "token": "dummy_token_for_development",
        "user": {
            "id": "1",
            "email": "test@example.com",
            "name": "테스트 사용자"
        }
    }

@app.get("/api/sermon/drafts")
async def get_sermon_drafts():
    return {
        "success": True,
        "data": {
            "sermons": [],
            "total_count": 0,
            "pagination": {
                "limit": 20,
                "offset": 0,
                "has_more": False
            }
        }
    }

@app.post("/api/sermon/generate-outline")
async def generate_outline():
    return {
        "success": True,
        "data": {
            "outline": [
                {"id": "1", "title": "서론", "content": "설교의 시작", "level": 1},
                {"id": "2", "title": "본론 1", "content": "첫 번째 요점", "level": 1},
                {"id": "3", "title": "본론 2", "content": "두 번째 요점", "level": 1},
                {"id": "4", "title": "결론", "content": "설교의 마무리", "level": 1}
            ]
        }
    }

@app.post("/api/sermon/check-grammar")
async def check_grammar():
    return {
        "success": True,
        "data": {
            "suggestions": [],
            "corrected_text": "문법 검사가 완료되었습니다.",
            "confidence_score": 0.95
        }
    }

@app.get("/api/theological-terms/search")
async def search_theological_terms():
    return {
        "success": True,
        "data": {
            "terms": [
                {
                    "id": "1",
                    "hungarian_term": "Isten",
                    "korean_translation": "하나님",
                    "category": "신론",
                    "difficulty_level": "A1",
                    "definition_hungarian": "A keresztény hit központi alakja",
                    "definition_korean": "기독교 신앙의 중심인물",
                    "usage_examples": ["Isten szeret minket"],
                    "biblical_references": ["요 3:16"],
                    "pronunciation_guide": "이슈텐",
                    "related_terms": ["Jézus", "Szentháromság"],
                    "synonyms": [],
                    "is_favorite": False
                }
            ],
            "total_count": 1,
            "pagination": {
                "limit": 20,
                "offset": 0,
                "has_more": False
            }
        }
    }

@app.get("/api/theological-terms/random")
async def get_random_terms():
    return {
        "success": True,
        "data": {
            "terms": [
                {
                    "id": "1",
                    "hungarian_term": "hit",
                    "korean_translation": "믿음",
                    "category": "신학",
                    "difficulty_level": "B1",
                    "definition_hungarian": "Isten iránti bizalom",
                    "definition_korean": "하나님에 대한 신뢰",
                    "usage_examples": ["A hit által üdvözülünk"],
                    "biblical_references": ["엡 2:8"],
                    "pronunciation_guide": "히트",
                    "related_terms": ["üdvösség", "kegyelem"],
                    "synonyms": [],
                    "is_favorite": False
                }
            ]
        }
    }

# 레벨 평가 API 엔드포인트
@app.post("/api/assessment/start")
async def start_assessment():
    return {
        "success": True,
        "data": {
            "session_id": "assess_123_" + str(int(time.time() * 1000)),
            "first_question": {
                "id": "grammar_b1_1",
                "type": "multiple_choice",
                "skill_area": "grammar",
                "question_text": "다음 중 올바른 헝가리어 격변화는?",
                "options": ["a házban", "a házba", "a házról", "a háztól"],
                "time_limit_seconds": 30
            },
            "estimated_duration_minutes": 15,
            "total_questions_estimate": "10-25개"
        }
    }

@app.post("/api/assessment/{session_id}/respond")
async def submit_response(session_id: str):
    return {
        "success": True,
        "data": {
            "response_recorded": True,
            "is_correct": True,
            "next_question": {
                "id": "vocab_b2_1",
                "type": "vocabulary",
                "skill_area": "vocabulary",
                "question_text": '"communion"을 헝가리어로?',
                "time_limit_seconds": 20
            },
            "progress": {
                "questions_completed": 1,
                "estimated_remaining": 12,
                "current_level_estimate": "B1"
            }
        }
    }

@app.post("/api/assessment/{session_id}/complete")
async def complete_assessment(session_id: str):
    return {
        "success": True,
        "data": {
            "assessment_id": f"result_{session_id}",
            "overall_level": "B1",
            "overall_confidence": 78,
            "skill_results": [
                {
                    "skill_area": "grammar",
                    "estimated_level": "B1",
                    "confidence_score": 75,
                    "accuracy_percentage": 70
                },
                {
                    "skill_area": "vocabulary",
                    "estimated_level": "B2",
                    "confidence_score": 82,
                    "accuracy_percentage": 85
                }
            ],
            "recommendations": {
                "suggested_level": "B1",
                "focus_areas": ["grammar", "vocabulary"],
                "estimated_study_hours_weekly": 12,
                "target_timeline_months": 8
            },
            "korean_interference_analysis": {
                "severity": "medium",
                "affected_areas": ["grammar", "vocabulary"],
                "specific_challenges": ["헝가리어 격변화 시스템 적응", "한국어에 없는 발음"]
            }
        }
    }

# 적응형 콘텐츠 추천 API 엔드포인트
@app.post("/api/recommendations/personalized")
async def get_personalized_recommendations():
    return {
        "success": True,
        "data": {
            "primary_recommendations": [
                {
                    "content_item": {
                        "id": "theol_001",
                        "title": "신학 기본 어휘 - 하나님과 삼위일체",
                        "content_type": "theological_terms",
                        "difficulty_level": "A2",
                        "skill_areas": ["vocabulary"],
                        "estimated_duration_minutes": 20,
                        "learning_objectives": ["신학 핵심 용어 20개 습득", "격변화 패턴 이해"],
                        "tags": ["신학", "어휘", "기초"],
                        "theological_relevance": 95
                    },
                    "recommendation_score": {
                        "total_score": 87,
                        "relevance_score": 92,
                        "difficulty_match_score": 85,
                        "learning_style_match": 78,
                        "goal_alignment": 95,
                        "korean_adaptation": 80,
                        "theological_focus": 95,
                        "predicted_engagement": 88,
                        "reasoning": ["설교 목표와 높은 일치도", "현재 레벨에 적합한 난이도", "신학 특화 콘텐츠"]
                    },
                    "personalization_factors": {
                        "adjusted_difficulty": "appropriate",
                        "estimated_completion_time": 22,
                        "suggested_approach": "실제 설교 맥락에서 사용법을 연습하세요",
                        "prerequisite_check": True,
                        "follow_up_suggestions": ["관련 어휘 복습하기", "실제 대화에서 사용해보기"]
                    }
                },
                {
                    "content_item": {
                        "id": "gram_001",
                        "title": "헝가리어 격변화 시스템 - 주격과 대격",
                        "content_type": "grammar",
                        "difficulty_level": "A1",
                        "skill_areas": ["grammar"],
                        "estimated_duration_minutes": 30,
                        "learning_objectives": ["주격과 대격 구분", "기본 격변화 패턴 이해"],
                        "tags": ["문법", "격변화", "기초"]
                    },
                    "recommendation_score": {
                        "total_score": 82,
                        "relevance_score": 85,
                        "difficulty_match_score": 90,
                        "learning_style_match": 75,
                        "goal_alignment": 80,
                        "korean_adaptation": 85,
                        "theological_focus": 70,
                        "predicted_engagement": 78,
                        "reasoning": ["한국인 학습자 특화", "문법 약점 보완", "기초 단계 필수 문법"]
                    },
                    "personalization_factors": {
                        "adjusted_difficulty": "challenging",
                        "estimated_completion_time": 35,
                        "suggested_approach": "한국어와 비교하며 차이점을 파악하세요",
                        "prerequisite_check": True,
                        "follow_up_suggestions": ["격변화 연습 문제 풀기", "실제 문장에서 적용해보기"]
                    }
                }
            ],
            "alternative_options": [
                {
                    "content_item": {
                        "id": "vocab_001",
                        "title": "일상 대화 어휘 - 인사와 기본 표현",
                        "content_type": "vocabulary",
                        "difficulty_level": "A1",
                        "skill_areas": ["vocabulary", "speaking"],
                        "estimated_duration_minutes": 15,
                        "learning_objectives": ["기본 인사 표현 습득"],
                        "tags": ["어휘", "회화", "기초"]
                    },
                    "recommendation_score": {
                        "total_score": 75,
                        "reasoning": ["기초 단계에 적합", "실용적 표현"]
                    }
                }
            ],
            "skill_gap_analysis": {
                "identified_gaps": ["grammar", "writing"],
                "priority_order": ["grammar", "vocabulary", "writing"],
                "gap_closing_content": [
                    {
                        "content_item": {
                            "id": "gram_002",
                            "title": "헝가리어 작문 기초 - 문장 구조 연습",
                            "content_type": "writing",
                            "difficulty_level": "A1"
                        },
                        "recommendation_score": {"total_score": 78}
                    }
                ]
            },
            "learning_path_integration": {
                "current_milestone": "A2 중급 준비 단계",
                "progress_towards_goal": 65,
                "next_milestone_content": [
                    {
                        "content_item": {
                            "id": "milestone_001",
                            "title": "A2 레벨 종합 평가 준비",
                            "content_type": "assessment_prep"
                        }
                    }
                ]
            },
            "session_plan": {
                "warm_up_content": [
                    {
                        "content_item": {
                            "id": "warmup_001",
                            "title": "오늘의 단어 5분 복습",
                            "estimated_duration_minutes": 5
                        }
                    }
                ],
                "main_content": [
                    {
                        "content_item": {
                            "id": "theol_001",
                            "title": "신학 기본 어휘 - 하나님과 삼위일체"
                        }
                    }
                ],
                "review_content": [
                    {
                        "content_item": {
                            "id": "review_001",
                            "title": "어휘 복습 퀴즈",
                            "estimated_duration_minutes": 10
                        }
                    }
                ],
                "total_estimated_time": 35
            }
        }
    }

@app.get("/api/recommendations/content-types")
async def get_content_types():
    return {
        "success": True,
        "data": {
            "content_types": [
                {"id": "grammar", "name": "문법", "description": "헝가리어 문법 규칙과 패턴"},
                {"id": "vocabulary", "name": "어휘", "description": "헝가리어 단어와 표현 학습"},
                {"id": "writing", "name": "작문", "description": "헝가리어 문장 작성과 표현"},
                {"id": "reading", "name": "읽기", "description": "헝가리어 텍스트 읽기와 이해"},
                {"id": "theological_terms", "name": "신학 용어", "description": "설교와 신학 관련 전문 어휘"},
                {"id": "sermon_writing", "name": "설교문 작성", "description": "헝가리어 설교문 작성 연습"},
                {"id": "translation", "name": "번역", "description": "한국어-헝가리어 번역 연습"},
                {"id": "cultural_context", "name": "문화", "description": "헝가리 문화와 맥락 이해"}
            ],
            "difficulty_levels": [
                {"id": "A1", "name": "기초", "description": "헝가리어 입문 수준"},
                {"id": "A2", "name": "초급", "description": "기본적인 의사소통 가능"},
                {"id": "B1", "name": "중급", "description": "일상 상황에서 자유로운 소통"},
                {"id": "B2", "name": "중상급", "description": "복잡한 주제도 이해하고 표현"}
            ],
            "session_types": [
                {"id": "quick_review", "name": "빠른 복습", "duration": "5-15분"},
                {"id": "intensive_study", "name": "집중 학습", "duration": "30-60분"},
                {"id": "assessment_prep", "name": "평가 준비", "duration": "20-40분"},
                {"id": "free_study", "name": "자유 학습", "duration": "사용자 정의"}
            ]
        }
    }

@app.post("/api/recommendations/feedback")
async def submit_recommendation_feedback():
    return {
        "success": True,
        "data": {
            "feedback_recorded": True,
            "updated_preferences": {
                "preferred_content_types": ["theological_terms", "grammar"],
                "optimal_session_duration": 25,
                "difficulty_preference": "challenging"
            },
            "algorithm_adjustment": {
                "learning_style_weights": {
                    "visual": 0.3,
                    "auditory": 0.4,
                    "kinesthetic": 0.3
                },
                "content_type_preferences": {
                    "theological_terms": 0.9,
                    "grammar": 0.8,
                    "vocabulary": 0.7
                }
            },
            "next_recommendation_improvement": "피드백을 반영하여 다음 추천의 정확도가 향상됩니다"
        }
    }

# 학습 분석 API 엔드포인트
@app.get("/api/analytics/dashboard")
async def get_analytics_dashboard():
    return {
        "success": True,
        "data": {
            "overall_progress": {
                "current_level": "A2",
                "level_progress": 68,
                "total_study_hours": 127,
                "streak_days": 12,
                "vocabulary_mastered": 453,
                "grammar_concepts_learned": 28
            },
            "skill_progress": [
                {
                    "skill": "vocabulary",
                    "current_level": "A2",
                    "target_level": "B1",
                    "progress_percentage": 75,
                    "recent_improvement": 8,
                    "strength_areas": ["신학 어휘", "일상 표현"],
                    "weakness_areas": ["추상적 개념", "관용구"]
                },
                {
                    "skill": "grammar",
                    "current_level": "A1",
                    "target_level": "A2",
                    "progress_percentage": 45,
                    "recent_improvement": -2,
                    "strength_areas": ["기본 어순", "현재시제"],
                    "weakness_areas": ["격변화", "과거시제"]
                },
                {
                    "skill": "listening",
                    "current_level": "A2",
                    "target_level": "B1",
                    "progress_percentage": 62,
                    "recent_improvement": 12,
                    "strength_areas": ["느린 발음", "짧은 대화"],
                    "weakness_areas": ["빠른 발음", "방언"]
                },
                {
                    "skill": "speaking",
                    "current_level": "A1",
                    "target_level": "A2",
                    "progress_percentage": 38,
                    "recent_improvement": 5,
                    "strength_areas": ["발음", "인사"],
                    "weakness_areas": ["문법 정확성", "유창성"]
                },
                {
                    "skill": "reading",
                    "current_level": "A2",
                    "target_level": "B1",
                    "progress_percentage": 71,
                    "recent_improvement": 6,
                    "strength_areas": ["짧은 텍스트", "신학 문서"],
                    "weakness_areas": ["긴 문장", "문학적 표현"]
                },
                {
                    "skill": "writing",
                    "current_level": "A1",
                    "target_level": "A2",
                    "progress_percentage": 42,
                    "recent_improvement": 3,
                    "strength_areas": ["단문", "기본 표현"],
                    "weakness_areas": ["복문", "문단 구성"]
                }
            ],
            "recent_sessions": [
                {
                    "date": "2024-11-26",
                    "duration_minutes": 45,
                    "content_types": ["theological_terms", "grammar"],
                    "completion_rate": 85,
                    "accuracy_score": 78,
                    "engagement_level": 92
                },
                {
                    "date": "2024-11-25",
                    "duration_minutes": 30,
                    "content_types": ["vocabulary", "writing"],
                    "completion_rate": 92,
                    "accuracy_score": 82,
                    "engagement_level": 88
                },
                {
                    "date": "2024-11-24",
                    "duration_minutes": 60,
                    "content_types": ["grammar", "reading"],
                    "completion_rate": 78,
                    "accuracy_score": 75,
                    "engagement_level": 85
                }
            ],
            "learning_goals": [
                {
                    "goal_id": "1",
                    "goal_description": "A2 레벨 달성",
                    "target_date": "2024-12-31",
                    "progress_percentage": 68,
                    "milestones_completed": 8,
                    "total_milestones": 12,
                    "estimated_completion_date": "2024-12-28",
                    "is_on_track": True
                },
                {
                    "goal_id": "2",
                    "goal_description": "설교문 500단어 작성 능력",
                    "target_date": "2025-02-01",
                    "progress_percentage": 35,
                    "milestones_completed": 2,
                    "total_milestones": 8,
                    "estimated_completion_date": "2025-02-15",
                    "is_on_track": False
                }
            ],
            "weekly_stats": [
                {"week": "11월 1주", "study_hours": 8.5, "sessions_completed": 12, "average_score": 78, "vocabulary_learned": 45, "grammar_concepts": 3},
                {"week": "11월 2주", "study_hours": 9.2, "sessions_completed": 14, "average_score": 82, "vocabulary_learned": 52, "grammar_concepts": 4},
                {"week": "11월 3주", "study_hours": 7.8, "sessions_completed": 11, "average_score": 75, "vocabulary_learned": 38, "grammar_concepts": 2},
                {"week": "11월 4주", "study_hours": 10.1, "sessions_completed": 16, "average_score": 85, "vocabulary_learned": 63, "grammar_concepts": 5}
            ],
            "performance_insights": {
                "strongest_skill": "vocabulary",
                "weakest_skill": "speaking",
                "optimal_study_time": "오후 2시-4시",
                "learning_velocity": 1.2,
                "predicted_next_level_date": "2024-12-28"
            },
            "korean_adaptation_analysis": {
                "interference_score": 65,
                "common_mistakes": ["격변화 혼동", "어순 오류", "조사 생략"],
                "improvement_trends": ["발음 정확도 향상", "어휘량 증가"],
                "cultural_adaptation_level": 78
            }
        }
    }

@app.get("/api/analytics/skill-trends")
async def get_skill_trends():
    return {
        "success": True,
        "data": {
            "skill_trends": [
                {
                    "skill": "vocabulary",
                    "monthly_data": [
                        {"month": "8월", "score": 65, "progress": 45},
                        {"month": "9월", "score": 72, "progress": 58},
                        {"month": "10월", "score": 78, "progress": 68},
                        {"month": "11월", "score": 83, "progress": 75}
                    ]
                },
                {
                    "skill": "grammar",
                    "monthly_data": [
                        {"month": "8월", "score": 42, "progress": 25},
                        {"month": "9월", "score": 45, "progress": 30},
                        {"month": "10월", "score": 48, "progress": 38},
                        {"month": "11월", "score": 52, "progress": 45}
                    ]
                },
                {
                    "skill": "listening",
                    "monthly_data": [
                        {"month": "8월", "score": 55, "progress": 35},
                        {"month": "9월", "score": 62, "progress": 48},
                        {"month": "10월", "score": 68, "progress": 58},
                        {"month": "11월", "score": 71, "progress": 62}
                    ]
                }
            ],
            "prediction": {
                "next_month_estimates": {
                    "vocabulary": {"score": 88, "progress": 82},
                    "grammar": {"score": 58, "progress": 52},
                    "listening": {"score": 75, "progress": 68}
                },
                "milestone_predictions": [
                    {"milestone": "A2 완료", "estimated_date": "2024-12-28", "confidence": 85},
                    {"milestone": "B1 시작", "estimated_date": "2025-01-15", "confidence": 72}
                ]
            }
        }
    }

@app.post("/api/analytics/study-session")
async def log_study_session():
    return {
        "success": True,
        "data": {
            "session_logged": True,
            "updated_statistics": {
                "total_study_time": "127.5 hours",
                "streak_updated": True,
                "new_streak_days": 13,
                "progress_updated": True,
                "skill_improvements": ["vocabulary", "listening"]
            },
            "achievement_unlocked": {
                "title": "꾸준한 학습자",
                "description": "13일 연속 학습 달성",
                "badge_icon": "🏆",
                "points_earned": 50
            }
        }
    }

# 게임화 시스템 API 엔드포인트
@app.get("/api/gamification/profile")
async def get_user_game_profile():
    return {
        "success": True,
        "data": {
            "user_profile": {
                "user_id": "user_123",
                "total_points": 2450,
                "current_level": 5,
                "level_title": "노련한 학습자",
                "level_icon": "🏆",
                "level_color": "#ef4444",
                "points_to_next_level": 550,
                "next_level_required_points": 3000,
                "badges_earned": [
                    {
                        "badge_id": "streak_7_days",
                        "name": "한 주의 달인",
                        "description": "일주일 연속 학습을 완주했습니다",
                        "icon": "⭐",
                        "rarity": "uncommon",
                        "earned_at": "2024-11-20T10:00:00Z",
                        "is_displayed": True
                    },
                    {
                        "badge_id": "vocab_master_100",
                        "name": "어휘 수집가",
                        "description": "100개의 헝가리어 단어를 학습했습니다",
                        "icon": "📚",
                        "rarity": "common",
                        "earned_at": "2024-11-22T15:30:00Z",
                        "is_displayed": True
                    },
                    {
                        "badge_id": "theological_scholar",
                        "name": "신학도",
                        "description": "50개의 신학 용어를 학습했습니다",
                        "icon": "⛪",
                        "rarity": "uncommon",
                        "earned_at": "2024-11-25T09:15:00Z",
                        "is_displayed": True
                    }
                ],
                "statistics": {
                    "total_lessons_completed": 45,
                    "total_quizzes_completed": 128,
                    "current_streak_days": 12,
                    "longest_streak_days": 15,
                    "total_study_time_minutes": 2850,
                    "average_accuracy": 87.5,
                    "perfect_scores_count": 23,
                    "badges_count_by_rarity": {
                        "common": 3,
                        "uncommon": 4,
                        "rare": 1,
                        "epic": 0,
                        "legendary": 0
                    }
                },
                "preferences": {
                    "show_point_animations": True,
                    "show_badge_notifications": True,
                    "show_level_up_celebrations": True,
                    "public_profile": True,
                    "enable_leaderboard": True
                }
            }
        }
    }

@app.post("/api/gamification/award-points")
async def award_points():
    return {
        "success": True,
        "data": {
            "points_awarded": 125,
            "level_up": True,
            "new_level": 6,
            "new_level_title": "헝가리어 애호가",
            "badges_earned": ["accuracy_master"],
            "events": [
                {
                    "event_type": "point_earned",
                    "title": "+125 포인트!",
                    "message": "퀴즈 완료 및 연속 학습 보너스",
                    "icon": "⭐",
                    "color": "#f59e0b",
                    "animation_type": "notification"
                },
                {
                    "event_type": "level_up",
                    "title": "레벨업!",
                    "message": "축하합니다! 헝가리어 애호가가 되었습니다!",
                    "icon": "💎",
                    "color": "#06b6d4",
                    "animation_type": "celebration"
                },
                {
                    "event_type": "badge_unlocked",
                    "title": "새 배지 획득!",
                    "message": "🎯 정확성의 달인",
                    "icon": "🎯",
                    "color": "#3b82f6",
                    "animation_type": "achievement"
                }
            ]
        }
    }

@app.get("/api/gamification/leaderboard")
async def get_leaderboard():
    return {
        "success": True,
        "data": {
            "leaderboard": {
                "type": "weekly",
                "period": "2024-11-week4",
                "last_updated": "2024-11-26T12:00:00Z",
                "user_rank": 8,
                "total_participants": 156,
                "entries": [
                    {
                        "user_id": "user_001",
                        "username": "헝가리마스터",
                        "rank": 1,
                        "score": 1850,
                        "level": 8,
                        "badges_count": 15,
                        "country": "KR",
                        "rank_change": 2,
                        "score_change": 320
                    },
                    {
                        "user_id": "user_002",
                        "username": "설교준비생",
                        "rank": 2,
                        "score": 1720,
                        "level": 7,
                        "badges_count": 12,
                        "country": "KR",
                        "rank_change": -1,
                        "score_change": 280
                    },
                    {
                        "user_id": "user_003",
                        "username": "언어사랑",
                        "rank": 3,
                        "score": 1680,
                        "level": 7,
                        "badges_count": 11,
                        "country": "KR",
                        "rank_change": 1,
                        "score_change": 290
                    },
                    {
                        "user_id": "user_123",
                        "username": "김학습",
                        "rank": 8,
                        "score": 1420,
                        "level": 5,
                        "badges_count": 8,
                        "country": "KR",
                        "rank_change": 3,
                        "score_change": 125,
                        "is_current_user": True
                    }
                ]
            }
        }
    }

@app.get("/api/gamification/challenges")
async def get_active_challenges():
    return {
        "success": True,
        "data": {
            "active_challenges": [
                {
                    "id": "daily_vocabulary_challenge",
                    "title": "오늘의 어휘 마스터",
                    "description": "하루에 10개의 새로운 단어를 학습하세요",
                    "type": "daily",
                    "difficulty": "easy",
                    "time_remaining_hours": 18,
                    "objectives": [
                        {
                            "id": "learn_10_words",
                            "description": "새 단어 10개 학습",
                            "current_progress": 7,
                            "target_value": 10,
                            "is_completed": False
                        }
                    ],
                    "rewards": {
                        "points": 100,
                        "badges": ["daily_achiever"]
                    },
                    "progress_percentage": 70,
                    "is_participating": True
                },
                {
                    "id": "weekly_theological_focus",
                    "title": "신학 어휘 집중 주간",
                    "description": "일주일 동안 신학 관련 콘텐츠에 집중하세요",
                    "type": "weekly",
                    "difficulty": "medium",
                    "time_remaining_hours": 96,
                    "objectives": [
                        {
                            "id": "theological_lessons",
                            "description": "신학 레슨 5개 완료",
                            "current_progress": 2,
                            "target_value": 5,
                            "is_completed": False
                        },
                        {
                            "id": "theological_vocabulary",
                            "description": "신학 어휘 30개 학습",
                            "current_progress": 18,
                            "target_value": 30,
                            "is_completed": False
                        }
                    ],
                    "rewards": {
                        "points": 500,
                        "badges": ["theological_focus_master"]
                    },
                    "progress_percentage": 45,
                    "is_participating": True
                },
                {
                    "id": "accuracy_perfectionist",
                    "title": "완벽주의자 도전",
                    "description": "연속 5개 퀴즈에서 95% 이상 정확도 달성",
                    "type": "special",
                    "difficulty": "hard",
                    "time_remaining_hours": 72,
                    "objectives": [
                        {
                            "id": "perfect_streak",
                            "description": "95% 이상 정확도로 퀴즈 5개 완료",
                            "current_progress": 2,
                            "target_value": 5,
                            "is_completed": False
                        }
                    ],
                    "rewards": {
                        "points": 300,
                        "badges": ["perfectionist"]
                    },
                    "progress_percentage": 40,
                    "is_participating": False,
                    "requirements": {
                        "min_level": 4,
                        "average_accuracy": 80
                    }
                }
            ]
        }
    }

@app.post("/api/gamification/join-challenge")
async def join_challenge():
    return {
        "success": True,
        "data": {
            "challenge_joined": True,
            "challenge_id": "accuracy_perfectionist",
            "message": "완벽주의자 도전에 참여했습니다!",
            "objectives_initialized": True,
            "good_luck_bonus": 50
        }
    }

@app.get("/api/gamification/badges")
async def get_available_badges():
    return {
        "success": True,
        "data": {
            "badge_categories": [
                {
                    "category": "연속 학습",
                    "badges": [
                        {
                            "id": "streak_3_days",
                            "name": "꾸준한 시작",
                            "description": "3일 연속으로 학습하였습니다",
                            "icon": "🔥",
                            "rarity": "common",
                            "points_reward": 50,
                            "is_earned": True,
                            "earned_at": "2024-11-20T10:00:00Z"
                        },
                        {
                            "id": "streak_7_days",
                            "name": "한 주의 달인",
                            "description": "일주일 연속 학습을 완주했습니다",
                            "icon": "⭐",
                            "rarity": "uncommon",
                            "points_reward": 100,
                            "is_earned": True,
                            "earned_at": "2024-11-22T10:00:00Z"
                        },
                        {
                            "id": "streak_30_days",
                            "name": "철의 의지",
                            "description": "30일 연속 학습의 위업을 달성했습니다",
                            "icon": "💪",
                            "rarity": "rare",
                            "points_reward": 300,
                            "is_earned": False,
                            "progress_percentage": 40
                        }
                    ]
                },
                {
                    "category": "어휘 학습",
                    "badges": [
                        {
                            "id": "vocab_master_100",
                            "name": "어휘 수집가",
                            "description": "100개의 헝가리어 단어를 학습했습니다",
                            "icon": "📚",
                            "rarity": "common",
                            "points_reward": 100,
                            "is_earned": True,
                            "earned_at": "2024-11-25T15:30:00Z"
                        },
                        {
                            "id": "vocab_master_500",
                            "name": "어휘의 제왕",
                            "description": "500개의 헝가리어 단어를 마스터했습니다",
                            "icon": "👑",
                            "rarity": "rare",
                            "points_reward": 500,
                            "is_earned": False,
                            "progress_percentage": 76
                        }
                    ]
                },
                {
                    "category": "신학",
                    "badges": [
                        {
                            "id": "theological_scholar",
                            "name": "신학도",
                            "description": "50개의 신학 용어를 학습했습니다",
                            "icon": "⛪",
                            "rarity": "uncommon",
                            "points_reward": 200,
                            "is_earned": True,
                            "earned_at": "2024-11-26T09:15:00Z"
                        },
                        {
                            "id": "sermon_master",
                            "name": "설교자의 길",
                            "description": "설교문 작성에 필요한 모든 기초를 익혔습니다",
                            "icon": "🙏",
                            "rarity": "epic",
                            "points_reward": 1000,
                            "is_earned": False,
                            "progress_percentage": 25
                        }
                    ]
                },
                {
                    "category": "특별",
                    "badges": [
                        {
                            "id": "night_owl",
                            "name": "???",
                            "description": "???",
                            "icon": "❓",
                            "rarity": "rare",
                            "points_reward": 150,
                            "is_earned": False,
                            "is_hidden": True,
                            "unlock_hint": "늦은 밤에도 학습을 게을리하지 않는다면..."
                        }
                    ]
                }
            ]
        }
    }

@app.get("/api/gamification/achievements-feed")
async def get_achievements_feed():
    return {
        "success": True,
        "data": {
            "recent_achievements": [
                {
                    "id": "achievement_001",
                    "user_id": "user_123",
                    "type": "badge_earned",
                    "title": "새 배지 획득!",
                    "description": "🎯 정확성의 달인 배지를 획득했습니다",
                    "timestamp": "2024-11-26T14:30:00Z",
                    "points_earned": 300,
                    "celebration_type": "badge"
                },
                {
                    "id": "achievement_002",
                    "user_id": "user_123",
                    "type": "level_up",
                    "title": "레벨업 달성!",
                    "description": "레벨 6 '헝가리어 애호가'에 도달했습니다",
                    "timestamp": "2024-11-26T14:25:00Z",
                    "points_earned": 300,
                    "celebration_type": "level_up"
                },
                {
                    "id": "achievement_003",
                    "user_id": "user_123",
                    "type": "streak_milestone",
                    "title": "연속 학습 기록!",
                    "description": "12일 연속 학습을 달성했습니다",
                    "timestamp": "2024-11-26T09:00:00Z",
                    "points_earned": 60,
                    "celebration_type": "streak"
                },
                {
                    "id": "achievement_004",
                    "user_id": "user_123",
                    "type": "challenge_completed",
                    "title": "도전과제 완료!",
                    "description": "'오늘의 어휘 마스터' 도전을 완료했습니다",
                    "timestamp": "2024-11-25T20:45:00Z",
                    "points_earned": 100,
                    "celebration_type": "challenge"
                }
            ],
            "upcoming_milestones": [
                {
                    "type": "streak",
                    "title": "2주 연속 학습",
                    "description": "연속 14일 학습까지 2일 남았습니다",
                    "progress": 12,
                    "target": 14,
                    "estimated_completion": "2024-11-28"
                },
                {
                    "type": "vocabulary",
                    "title": "어휘의 제왕",
                    "description": "500개 단어 학습까지 120개 남았습니다",
                    "progress": 380,
                    "target": 500,
                    "estimated_completion": "2024-12-15"
                }
            ]
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["src"]
    )