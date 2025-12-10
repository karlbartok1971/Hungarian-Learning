from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import time

router = APIRouter(prefix="/api/gamification", tags=["gamification"])
security = HTTPBearer()

# Request/Response 모델들
class PointsAwardRequest(BaseModel):
    source: str
    points: int
    metadata: Optional[Dict[str, Any]] = None

class ChallengeJoinRequest(BaseModel):
    challenge_id: str

class GameProfile(BaseModel):
    user_id: str
    total_points: int
    current_level: int
    points_to_next_level: int
    badges_earned: List[Dict[str, Any]]
    statistics: Dict[str, Any]
    preferences: Dict[str, bool]

# 게임화 프로필 조회
@router.get("/profile")
async def get_gamification_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """사용자의 게임화 프로필 조회"""
    # TODO: 실제 사용자 인증 및 데이터베이스 조회 구현
    mock_profile = {
        "success": True,
        "data": {
            "user_profile": {
                "user_id": "user123",
                "total_points": 2850,
                "current_level": 6,
                "points_to_next_level": 650,
                "level_title": "헝가리어 애호가",
                "badges_earned": [
                    {
                        "badge_id": "streak_7_days",
                        "name": "한 주의 달인",
                        "icon": "⭐",
                        "earned_at": "2024-11-20T10:00:00Z",
                        "is_displayed": True
                    },
                    {
                        "badge_id": "vocab_master_100",
                        "name": "어휘 수집가",
                        "icon": "📚",
                        "earned_at": "2024-11-22T14:30:00Z",
                        "is_displayed": True
                    },
                    {
                        "badge_id": "theological_scholar",
                        "name": "신학도",
                        "icon": "⛪",
                        "earned_at": "2024-11-25T09:15:00Z",
                        "is_displayed": True
                    }
                ],
                "statistics": {
                    "total_lessons_completed": 45,
                    "total_quizzes_completed": 128,
                    "current_streak_days": 12,
                    "longest_streak_days": 15,
                    "total_study_time_minutes": 1820,
                    "average_accuracy": 87.5,
                    "perfect_scores_count": 23,
                    "badges_count_by_rarity": {
                        "common": 3,
                        "uncommon": 2,
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
    return mock_profile

# 포인트 지급
@router.post("/award-points")
async def award_points(
    request: PointsAwardRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """사용자에게 포인트 지급 및 게임화 이벤트 처리"""
    # TODO: GameificationEngine을 사용한 실제 포인트 지급 로직 구현
    mock_response = {
        "success": True,
        "data": {
            "points_awarded": request.points * 1.2,  # 보너스 적용 시뮬레이션
            "level_up": False,
            "new_level": None,
            "badges_earned": [],
            "events": [
                {
                    "id": f"event_{int(time.time())}",
                    "event_type": "point_earned",
                    "details": {"points_change": request.points},
                    "display_info": {
                        "title": f"+{request.points} 포인트!",
                        "message": request.source,
                        "icon": "⭐",
                        "color": "#f59e0b",
                        "animation_type": "notification"
                    }
                }
            ]
        }
    }
    return mock_response

# 리더보드 조회
@router.get("/leaderboard")
async def get_leaderboard(
    type: str = "global",
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """리더보드 조회"""
    mock_leaderboard = {
        "success": True,
        "data": {
            "leaderboard": {
                "type": type,
                "period": "2024-11-week4",
                "last_updated": "2024-11-26T12:00:00Z",
                "user_rank": 8,
                "total_participants": 1247,
                "entries": [
                    {
                        "user_id": "user001",
                        "username": "헝가리마스터",
                        "rank": 1,
                        "score": 12500,
                        "level": 12,
                        "badges_count": 24,
                        "country": "KR",
                        "rank_change": 2,
                        "score_change": 850,
                        "streak_days": 45,
                        "achievements": 89
                    },
                    {
                        "user_id": "user002",
                        "username": "설교준비생",
                        "rank": 2,
                        "score": 11800,
                        "level": 11,
                        "badges_count": 21,
                        "country": "KR",
                        "rank_change": -1,
                        "score_change": 650,
                        "streak_days": 28,
                        "achievements": 76
                    }
                ]
            }
        }
    }
    return mock_leaderboard

# 활성 도전과제 조회
@router.get("/challenges")
async def get_active_challenges(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """활성 도전과제 목록 조회"""
    mock_challenges = {
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
                            "id": "learn_words",
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
                    "is_participating": True,
                    "category": "vocabulary",
                    "icon": "📚",
                    "color": "#3b82f6"
                },
                {
                    "id": "weekly_theological",
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
                    "is_participating": True,
                    "category": "theology",
                    "icon": "⛪",
                    "color": "#8b5cf6"
                }
            ]
        }
    }
    return mock_challenges

# 도전과제 참여
@router.post("/join-challenge")
async def join_challenge(
    request: ChallengeJoinRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """도전과제 참여"""
    # TODO: 실제 도전과제 참여 로직 구현
    mock_response = {
        "success": True,
        "data": {
            "challenge_joined": True,
            "challenge_id": request.challenge_id,
            "message": "도전과제에 성공적으로 참여했습니다!",
            "start_time": "2024-11-26T12:00:00Z"
        }
    }
    return mock_response

# 경쟁 이벤트 참여
@router.post("/join-competition")
async def join_competition(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """경쟁 이벤트 참여"""
    # TODO: 실제 경쟁 이벤트 참여 로직 구현
    mock_response = {
        "success": True,
        "data": {
            "competition_joined": True,
            "message": "경쟁 이벤트에 성공적으로 참여했습니다!",
            "participants_count": 235
        }
    }
    return mock_response

# 배지 목록 조회
@router.get("/badges")
async def get_user_badges(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """사용자 배지 목록 조회"""
    mock_badges = {
        "success": True,
        "data": {
            "badges_earned": [
                {
                    "id": "streak_3_days",
                    "name": "꾸준한 시작",
                    "description": "3일 연속으로 학습하였습니다",
                    "type": "streak",
                    "rarity": "common",
                    "icon": "🔥",
                    "earned_at": "2024-11-18T10:00:00Z",
                    "is_displayed": True,
                    "category": "연속 학습"
                },
                {
                    "id": "vocab_master_100",
                    "name": "어휘 수집가",
                    "description": "100개의 헝가리어 단어를 학습했습니다",
                    "type": "vocabulary",
                    "rarity": "common",
                    "icon": "📚",
                    "earned_at": "2024-11-22T14:30:00Z",
                    "is_displayed": True,
                    "category": "어휘 학습"
                },
                {
                    "id": "theological_scholar",
                    "name": "신학도",
                    "description": "50개의 신학 용어를 학습했습니다",
                    "type": "theological",
                    "rarity": "uncommon",
                    "icon": "⛪",
                    "earned_at": "2024-11-25T09:15:00Z",
                    "is_displayed": True,
                    "category": "신학"
                }
            ],
            "available_badges": [
                {
                    "id": "streak_7_days",
                    "name": "한 주의 달인",
                    "description": "일주일 연속 학습을 완주했습니다",
                    "type": "streak",
                    "rarity": "uncommon",
                    "icon": "⭐",
                    "unlock_criteria": {
                        "type": "streak",
                        "threshold": 7,
                        "current_progress": 5
                    },
                    "is_hidden": False,
                    "category": "연속 학습"
                },
                {
                    "id": "night_owl",
                    "name": "올빼미 학습자",
                    "description": "자정 이후에 학습한 용감한 학습자입니다",
                    "type": "special",
                    "rarity": "rare",
                    "icon": "🦉",
                    "is_hidden": True,
                    "unlock_hint": "늦은 밤에도 학습을 게을리하지 않는다면...",
                    "category": "특별"
                }
            ]
        }
    }
    return mock_badges

# 성취 피드 조회
@router.get("/achievements-feed")
async def get_achievements_feed(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """최근 성취 피드 조회"""
    mock_feed = {
        "success": True,
        "data": {
            "recent_achievements": [
                {
                    "id": "achievement_1",
                    "user_id": "user123",
                    "achievement_type": "badge_earned",
                    "achievement_data": {
                        "badge_name": "신학도",
                        "badge_icon": "⛪",
                        "description": "50개의 신학 용어를 학습했습니다"
                    },
                    "points_earned": 200,
                    "timestamp": "2024-11-26T14:30:00Z",
                    "type": "challenge_completed",
                    "celebration_type": "badge",
                    "message": "새로운 배지를 획득했습니다!"
                },
                {
                    "id": "achievement_2",
                    "user_id": "user123",
                    "achievement_type": "level_up",
                    "achievement_data": {
                        "new_level": 6,
                        "level_title": "헝가리어 애호가",
                        "level_icon": "💎",
                        "bonus_points": 300
                    },
                    "points_earned": 300,
                    "timestamp": "2024-11-25T16:45:00Z",
                    "type": "level_achieved",
                    "celebration_type": "level_up",
                    "message": "레벨업했습니다!"
                }
            ],
            "celebration_queue": [
                {
                    "id": "celebration_1",
                    "type": "badge_unlock",
                    "data": {
                        "badge_name": "신학도",
                        "badge_icon": "⛪",
                        "animation": "tada"
                    },
                    "show_duration": 3000
                }
            ]
        }
    }
    return mock_feed

# 학습 진행률 업데이트
@router.post("/update-progress")
async def update_learning_progress(
    lesson_id: str,
    score: int,
    accuracy: float,
    study_time_minutes: int,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """학습 진행률 업데이트 및 게임화 이벤트 처리"""
    # TODO: 실제 학습 진행률 업데이트 및 GameificationEngine 연동
    mock_response = {
        "success": True,
        "data": {
            "progress_updated": True,
            "points_awarded": 85,
            "new_achievements": [],
            "challenge_progress": [
                {
                    "challenge_id": "daily_vocabulary_challenge",
                    "objective_id": "learn_words",
                    "progress_increment": 1,
                    "new_progress": 8,
                    "target": 10
                }
            ],
            "streak_updated": {
                "current_streak": 13,
                "longest_streak": 15,
                "streak_bonus_points": 20
            }
        }
    }
    return mock_response