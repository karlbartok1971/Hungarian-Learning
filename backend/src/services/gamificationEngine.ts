import {
  BadgeType,
  BadgeRarity,
  PointSource,
  BadgeDefinition,
  UserBadge,
  LevelDefinition,
  PointTransaction,
  UserGameProfile,
  ChallengeDefinition,
  UserChallenge,
  LeaderboardEntry,
  GameificationEvent
} from '../models/GameificationSystem';

/**
 * 게임화 시스템 엔진
 * 포인트, 배지, 레벨업, 도전과제 등을 관리
 */

export class GameificationEngine {
  private readonly badgeDefinitions: BadgeDefinition[] = [];
  private readonly levelDefinitions: LevelDefinition[] = [];
  private readonly challengeDefinitions: ChallengeDefinition[] = [];

  constructor() {
    this.initializeBadgeDefinitions();
    this.initializeLevelDefinitions();
    this.initializeChallengeDefinitions();
  }

  /**
   * 포인트 획득 처리
   */
  async awardPoints(
    userId: string,
    source: PointSource,
    basePoints: number,
    metadata?: any
  ): Promise<{
    pointsAwarded: number;
    levelUp?: boolean;
    newLevel?: number;
    badgesEarned?: string[];
    events: GameificationEvent[];
  }> {
    const events: GameificationEvent[] = [];

    // 포인트 계산 (보너스 적용)
    let finalPoints = this.calculatePoints(basePoints, source, metadata);

    // 사용자 프로필 업데이트
    const userProfile = await this.getUserProfile(userId);
    const previousLevel = userProfile.current_level;

    userProfile.total_points += finalPoints;

    // 포인트 내역 기록
    const transaction: PointTransaction = {
      id: this.generateId(),
      user_id: userId,
      source,
      points: finalPoints,
      description: this.getPointDescription(source, metadata),
      metadata,
      earned_at: new Date()
    };

    // 포인트 획득 이벤트
    events.push(this.createPointEvent(userId, finalPoints, source));

    // 레벨업 확인
    const levelUpResult = this.checkLevelUp(userProfile);
    let levelUp = false;
    let newLevel = previousLevel;

    if (levelUpResult.levelUp) {
      levelUp = true;
      newLevel = levelUpResult.newLevel!;
      userProfile.current_level = newLevel;
      userProfile.points_to_next_level = levelUpResult.pointsToNextLevel!;

      // 레벨업 이벤트
      events.push(this.createLevelUpEvent(userId, newLevel));

      // 레벨업 보너스 포인트
      const levelDef = this.levelDefinitions.find(l => l.level === newLevel);
      if (levelDef?.unlock_rewards.bonus_points) {
        finalPoints += levelDef.unlock_rewards.bonus_points;
        userProfile.total_points += levelDef.unlock_rewards.bonus_points;
      }
    }

    // 배지 획득 확인
    const newBadges = await this.checkBadgeEligibility(userId, userProfile, source, metadata);
    const badgesEarned: string[] = [];

    for (const badge of newBadges) {
      badgesEarned.push(badge.id);
      events.push(this.createBadgeEvent(userId, badge));

      // 배지 획득 보너스 포인트
      finalPoints += badge.points_reward;
      userProfile.total_points += badge.points_reward;
    }

    // 사용자 프로필 저장
    await this.updateUserProfile(userProfile);

    // 포인트 내역 저장
    await this.savePointTransaction(transaction);

    return {
      pointsAwarded: finalPoints,
      levelUp,
      newLevel: levelUp ? newLevel : undefined,
      badgesEarned: badgesEarned.length > 0 ? badgesEarned : undefined,
      events
    };
  }

  /**
   * 배지 획득 자격 확인
   */
  private async checkBadgeEligibility(
    userId: string,
    userProfile: UserGameProfile,
    source: PointSource,
    metadata?: any
  ): Promise<BadgeDefinition[]> {
    const eligibleBadges: BadgeDefinition[] = [];

    for (const badgeDef of this.badgeDefinitions) {
      // 이미 획득한 배지는 제외
      if (userProfile.badges_earned.some(b => b.badge_id === badgeDef.id)) {
        continue;
      }

      if (this.isBadgeEligible(badgeDef, userProfile, source, metadata)) {
        eligibleBadges.push(badgeDef);

        // 사용자 배지 추가
        const userBadge: UserBadge = {
          badge_id: badgeDef.id,
          earned_at: new Date(),
          is_displayed: eligibleBadges.length <= 3 // 처음 3개는 자동으로 표시
        };

        userProfile.badges_earned.push(userBadge);

        // 희귀도별 통계 업데이트
        userProfile.statistics.badges_count_by_rarity[badgeDef.rarity]++;
      }
    }

    return eligibleBadges;
  }

  /**
   * 배지 획득 조건 확인
   */
  private isBadgeEligible(
    badgeDef: BadgeDefinition,
    userProfile: UserGameProfile,
    source: PointSource,
    metadata?: any
  ): boolean {
    const criteria = badgeDef.unlock_criteria;

    switch (criteria.type) {
      case 'streak':
        return userProfile.statistics.current_streak_days >= criteria.threshold;

      case 'vocabulary_count':
        return (metadata?.vocabulary_learned_count || 0) >= criteria.threshold;

      case 'lessons_completed':
        return userProfile.statistics.total_lessons_completed >= criteria.threshold;

      case 'accuracy_rate':
        return userProfile.statistics.average_accuracy >= criteria.threshold;

      case 'perfect_scores':
        return userProfile.statistics.perfect_scores_count >= criteria.threshold;

      case 'total_points':
        return userProfile.total_points >= criteria.threshold;

      case 'level_reached':
        return userProfile.current_level >= criteria.threshold;

      case 'theological_focus':
        return (metadata?.theological_content_completed || 0) >= criteria.threshold;

      case 'study_time':
        return userProfile.statistics.total_study_time_minutes >= criteria.threshold;

      default:
        return false;
    }
  }

  /**
   * 레벨업 확인
   */
  private checkLevelUp(userProfile: UserGameProfile): {
    levelUp: boolean;
    newLevel?: number;
    pointsToNextLevel?: number;
  } {
    const currentLevel = userProfile.current_level;
    const totalPoints = userProfile.total_points;

    // 다음 레벨 정의 찾기
    const nextLevelDef = this.levelDefinitions.find(l => l.level === currentLevel + 1);

    if (!nextLevelDef) {
      return { levelUp: false }; // 최대 레벨 도달
    }

    if (totalPoints >= nextLevelDef.required_points) {
      // 연속 레벨업 확인
      let newLevel = currentLevel + 1;
      let nextDef = this.levelDefinitions.find(l => l.level === newLevel + 1);

      while (nextDef && totalPoints >= nextDef.required_points) {
        newLevel++;
        nextDef = this.levelDefinitions.find(l => l.level === newLevel + 1);
      }

      const finalNextLevel = this.levelDefinitions.find(l => l.level === newLevel + 1);
      const pointsToNextLevel = finalNextLevel ? finalNextLevel.required_points - totalPoints : 0;

      return {
        levelUp: true,
        newLevel,
        pointsToNextLevel
      };
    }

    return { levelUp: false };
  }

  /**
   * 포인트 계산 (보너스 적용)
   */
  private calculatePoints(basePoints: number, source: PointSource, metadata?: any): number {
    let finalPoints = basePoints;

    // 연속 학습 보너스
    if (metadata?.streak_days >= 7) {
      finalPoints *= 1.5; // 7일 연속: 50% 보너스
    } else if (metadata?.streak_days >= 3) {
      finalPoints *= 1.25; // 3일 연속: 25% 보너스
    }

    // 정확도 보너스
    if (metadata?.accuracy >= 95) {
      finalPoints *= 1.3; // 95% 이상: 30% 보너스
    } else if (metadata?.accuracy >= 85) {
      finalPoints *= 1.15; // 85% 이상: 15% 보너스
    }

    // 첫 번째 시도 성공 보너스
    if (source === PointSource.FIRST_TRY_SUCCESS) {
      finalPoints *= 2; // 100% 보너스
    }

    // 신학 콘텐츠 보너스
    if (metadata?.is_theological_content) {
      finalPoints *= 1.2; // 20% 보너스
    }

    return Math.round(finalPoints);
  }

  /**
   * 도전과제 진행 상황 업데이트
   */
  async updateChallengeProgress(
    userId: string,
    action: string,
    value: number,
    metadata?: any
  ): Promise<{
    challengesCompleted: ChallengeDefinition[];
    events: GameificationEvent[];
  }> {
    const events: GameificationEvent[] = [];
    const challengesCompleted: ChallengeDefinition[] = [];

    // 활성 도전과제 가져오기
    const activeChallenges = await this.getActiveUserChallenges(userId);

    for (const userChallenge of activeChallenges) {
      const challengeDef = this.challengeDefinitions.find(c => c.id === userChallenge.challenge_id);
      if (!challengeDef || userChallenge.is_completed) continue;

      let updated = false;

      // 각 목표에 대해 진행 상황 업데이트
      for (const objective of challengeDef.objectives) {
        const progress = userChallenge.objectives_progress.find(p => p.objective_id === objective.id);
        if (!progress || progress.completed_at) continue;

        // 액션에 따른 진행도 업데이트
        const increment = this.calculateChallengeProgress(objective.id, action, value, metadata);

        if (increment > 0) {
          progress.current_progress = Math.min(progress.current_progress + increment, objective.target_value);
          updated = true;

          // 목표 달성 확인
          if (progress.current_progress >= objective.target_value) {
            progress.completed_at = new Date();
          }
        }
      }

      // 전체 도전과제 완료 확인
      const allCompleted = userChallenge.objectives_progress.every(p => p.completed_at);

      if (allCompleted && !userChallenge.is_completed) {
        userChallenge.is_completed = true;
        userChallenge.completed_at = new Date();
        challengesCompleted.push(challengeDef);

        // 도전과제 완료 이벤트
        events.push(this.createChallengeCompletedEvent(userId, challengeDef));

        // 보상 지급
        await this.awardChallengeRewards(userId, challengeDef);
      }

      if (updated) {
        await this.updateUserChallenge(userChallenge);
      }
    }

    return { challengesCompleted, events };
  }

  /**
   * 리더보드 생성/업데이트
   */
  async updateLeaderboard(type: 'global' | 'weekly' | 'monthly' | 'friends'): Promise<LeaderboardEntry[]> {
    // 사용자 데이터 수집
    const users = await this.getAllUserProfiles();

    // 리더보드 타입에 따른 정렬 및 필터링
    let sortedUsers = users.sort((a, b) => {
      if (type === 'weekly' || type === 'monthly') {
        // 주간/월간은 해당 기간의 포인트로 정렬
        const periodPoints = this.getPeriodPoints(a, type) - this.getPeriodPoints(b, type);
        return periodPoints !== 0 ? periodPoints : b.total_points - a.total_points;
      }

      // 전체/친구는 총 포인트로 정렬
      return b.total_points - a.total_points;
    });

    // 상위 100명 제한
    if (sortedUsers.length > 100) {
      sortedUsers = sortedUsers.slice(0, 100);
    }

    const leaderboard: LeaderboardEntry[] = sortedUsers.map((user, index) => ({
      user_id: user.user_id,
      username: `User${user.user_id.substring(0, 8)}`, // 실제로는 사용자 이름 가져와야 함
      rank: index + 1,
      score: type === 'weekly' || type === 'monthly' ? this.getPeriodPoints(user, type) : user.total_points,
      level: user.current_level,
      badges_count: user.badges_earned.length,
      rank_change: Math.floor(Math.random() * 10) - 5, // 임시 랜덤값
      score_change: Math.floor(Math.random() * 200) - 100 // 임시 랜덤값
    }));

    return leaderboard;
  }

  // === 초기화 메서드들 ===

  private initializeBadgeDefinitions() {
    // 연속 학습 배지들
    this.badgeDefinitions.push(
      {
        id: 'streak_3_days',
        name: '꾸준한 시작',
        description: '3일 연속으로 학습하였습니다',
        type: BadgeType.STREAK,
        rarity: BadgeRarity.COMMON,
        icon: '🔥',
        unlock_criteria: { type: 'streak', threshold: 3 },
        points_reward: 50,
        is_hidden: false,
        category: '연속 학습'
      },
      {
        id: 'streak_7_days',
        name: '한 주의 달인',
        description: '일주일 연속 학습을 완주했습니다',
        type: BadgeType.STREAK,
        rarity: BadgeRarity.UNCOMMON,
        icon: '⭐',
        unlock_criteria: { type: 'streak', threshold: 7 },
        points_reward: 100,
        is_hidden: false,
        category: '연속 학습'
      },
      {
        id: 'streak_30_days',
        name: '철의 의지',
        description: '30일 연속 학습의 위업을 달성했습니다',
        type: BadgeType.STREAK,
        rarity: BadgeRarity.RARE,
        icon: '💪',
        unlock_criteria: { type: 'streak', threshold: 30 },
        points_reward: 300,
        is_hidden: false,
        category: '연속 학습'
      }
    );

    // 어휘 관련 배지들
    this.badgeDefinitions.push(
      {
        id: 'vocab_master_100',
        name: '어휘 수집가',
        description: '100개의 헝가리어 단어를 학습했습니다',
        type: BadgeType.VOCABULARY,
        rarity: BadgeRarity.COMMON,
        icon: '📚',
        unlock_criteria: { type: 'vocabulary_count', threshold: 100 },
        points_reward: 100,
        is_hidden: false,
        category: '어휘 학습'
      },
      {
        id: 'vocab_master_500',
        name: '어휘의 제왕',
        description: '500개의 헝가리어 단어를 마스터했습니다',
        type: BadgeType.VOCABULARY,
        rarity: BadgeRarity.RARE,
        icon: '👑',
        unlock_criteria: { type: 'vocabulary_count', threshold: 500 },
        points_reward: 500,
        is_hidden: false,
        category: '어휘 학습'
      }
    );

    // 신학 특화 배지들
    this.badgeDefinitions.push(
      {
        id: 'theological_scholar',
        name: '신학도',
        description: '50개의 신학 용어를 학습했습니다',
        type: BadgeType.THEOLOGICAL,
        rarity: BadgeRarity.UNCOMMON,
        icon: '⛪',
        unlock_criteria: { type: 'theological_focus', threshold: 50 },
        points_reward: 200,
        is_hidden: false,
        category: '신학'
      },
      {
        id: 'sermon_master',
        name: '설교자의 길',
        description: '설교문 작성에 필요한 모든 기초를 익혔습니다',
        type: BadgeType.THEOLOGICAL,
        rarity: BadgeRarity.EPIC,
        icon: '🙏',
        unlock_criteria: { type: 'theological_focus', threshold: 200 },
        points_reward: 1000,
        is_hidden: false,
        category: '신학'
      }
    );

    // 정확도 배지들
    this.badgeDefinitions.push(
      {
        id: 'accuracy_master',
        name: '정확성의 달인',
        description: '평균 정확도 90% 이상을 달성했습니다',
        type: BadgeType.ACCURACY,
        rarity: BadgeRarity.RARE,
        icon: '🎯',
        unlock_criteria: { type: 'accuracy_rate', threshold: 90 },
        points_reward: 300,
        is_hidden: false,
        category: '성취'
      }
    );

    // 특별/히든 배지들
    this.badgeDefinitions.push(
      {
        id: 'night_owl',
        name: '올빼미 학습자',
        description: '자정 이후에 학습한 용감한 학습자입니다',
        type: BadgeType.SPECIAL,
        rarity: BadgeRarity.RARE,
        icon: '🦉',
        unlock_criteria: { type: 'special_time', threshold: 1 },
        points_reward: 150,
        is_hidden: true,
        unlock_hint: '늦은 밤에도 학습을 게을리하지 않는다면...',
        category: '특별'
      }
    );
  }

  private initializeLevelDefinitions() {
    const levels = [
      { level: 1, required_points: 0, title: '새싹 학습자', description: '헝가리어 여행의 시작', color: '#22c55e' },
      { level: 2, required_points: 100, title: '호기심 많은 탐험가', description: '첫 걸음을 뗀 당신', color: '#3b82f6' },
      { level: 3, required_points: 300, title: '열정적인 학생', description: '꾸준함이 빛나기 시작', color: '#8b5cf6' },
      { level: 4, required_points: 600, title: '성실한 수행자', description: '실력이 눈에 띄게 향상', color: '#f59e0b' },
      { level: 5, required_points: 1000, title: '노련한 학습자', description: '기초를 탄탄히 다진 상태', color: '#ef4444' },
      { level: 6, required_points: 1500, title: '헝가리어 애호가', description: '언어에 대한 사랑이 깊어짐', color: '#06b6d4' },
      { level: 7, required_points: 2100, title: '실력있는 화자', description: '일상 대화가 자유로워짐', color: '#84cc16' },
      { level: 8, required_points: 2800, title: '능숙한 의사소통자', description: '복잡한 주제도 표현 가능', color: '#f97316' },
      { level: 9, required_points: 3600, title: '헝가리어 전문가', description: '전문적 수준에 도달', color: '#a855f7' },
      { level: 10, required_points: 4500, title: '언어의 마스터', description: '원어민 수준의 실력', color: '#dc2626' }
    ];

    this.levelDefinitions.push(...levels.map((level, index) => ({
      ...level,
      icon: ['🌱', '🌿', '🌳', '⭐', '🏆', '💎', '👑', '🦅', '🔥', '🌟'][index],
      unlock_rewards: {
        bonus_points: level.level * 50,
        features: level.level === 5 ? ['advanced_analytics'] :
                 level.level === 8 ? ['community_features'] : [],
        badges: level.level % 3 === 0 ? [`level_${level.level}_master`] : []
      }
    })));
  }

  private initializeChallengeDefinitions() {
    // 일일 도전과제
    this.challengeDefinitions.push({
      id: 'daily_vocabulary_challenge',
      title: '오늘의 어휘 마스터',
      description: '하루에 10개의 새로운 단어를 학습하세요',
      type: 'daily',
      difficulty: 'easy',
      objectives: [
        {
          id: 'learn_10_words',
          description: '새 단어 10개 학습',
          target_value: 10
        }
      ],
      rewards: {
        points: 100,
        badges: ['daily_achiever']
      },
      time_limit: {
        start_date: new Date(),
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        duration_hours: 24
      },
      requirements: {},
      is_active: true,
      metadata: {
        tags: ['vocabulary', 'daily'],
        category: 'learning',
        created_by: 'system',
        is_featured: true
      }
    });

    // 주간 도전과제
    this.challengeDefinitions.push({
      id: 'weekly_theological_focus',
      title: '신학 어휘 집중 주간',
      description: '일주일 동안 신학 관련 콘텐츠에 집중하세요',
      type: 'weekly',
      difficulty: 'medium',
      objectives: [
        {
          id: 'theological_lessons',
          description: '신학 레슨 5개 완료',
          target_value: 5
        },
        {
          id: 'theological_vocabulary',
          description: '신학 어휘 30개 학습',
          target_value: 30
        }
      ],
      rewards: {
        points: 500,
        badges: ['theological_focus_master']
      },
      time_limit: {
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      requirements: {
        min_level: 3
      },
      is_active: true,
      metadata: {
        tags: ['theological', 'weekly'],
        category: 'specialized',
        created_by: 'system',
        is_featured: true
      }
    });
  }

  // === 보조 메서드들 ===

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2);
  }

  private getPointDescription(source: PointSource, metadata?: any): string {
    const descriptions = {
      [PointSource.LESSON_COMPLETION]: '레슨 완료',
      [PointSource.QUIZ_CORRECT_ANSWER]: '퀴즈 정답',
      [PointSource.STREAK_BONUS]: `${metadata?.streak_days}일 연속 학습 보너스`,
      [PointSource.DAILY_GOAL_ACHIEVEMENT]: '일일 목표 달성',
      [PointSource.PERFECT_SCORE]: '만점 달성',
      [PointSource.FIRST_TRY_SUCCESS]: '첫 번째 시도 성공',
      [PointSource.BADGE_EARNED]: `배지 획득: ${metadata?.badge_name}`,
      [PointSource.LEVEL_UP]: `레벨 ${metadata?.level} 달성`
    };

    return descriptions[source] || '포인트 획득';
  }

  private createPointEvent(userId: string, points: number, source: PointSource): GameificationEvent {
    return {
      id: this.generateId(),
      user_id: userId,
      event_type: 'point_earned',
      details: { points_change: points },
      display_info: {
        title: `+${points} 포인트!`,
        message: this.getPointDescription(source),
        icon: '⭐',
        color: '#f59e0b',
        animation_type: 'notification'
      },
      created_at: new Date(),
      shown_to_user: false
    };
  }

  private createLevelUpEvent(userId: string, newLevel: number): GameificationEvent {
    const levelDef = this.levelDefinitions.find(l => l.level === newLevel);

    return {
      id: this.generateId(),
      user_id: userId,
      event_type: 'level_up',
      details: { new_level: newLevel },
      display_info: {
        title: '레벨업!',
        message: `축하합니다! ${levelDef?.title || `레벨 ${newLevel}`}이 되었습니다!`,
        icon: levelDef?.icon || '🎉',
        color: levelDef?.color || '#8b5cf6',
        animation_type: 'celebration'
      },
      created_at: new Date(),
      shown_to_user: false
    };
  }

  private createBadgeEvent(userId: string, badge: BadgeDefinition): GameificationEvent {
    return {
      id: this.generateId(),
      user_id: userId,
      event_type: 'badge_unlocked',
      details: { badge_id: badge.id },
      display_info: {
        title: '새 배지 획득!',
        message: `${badge.icon} ${badge.name}`,
        icon: badge.icon,
        color: this.getBadgeColor(badge.rarity),
        animation_type: 'achievement'
      },
      created_at: new Date(),
      shown_to_user: false
    };
  }

  private createChallengeCompletedEvent(userId: string, challenge: ChallengeDefinition): GameificationEvent {
    return {
      id: this.generateId(),
      user_id: userId,
      event_type: 'challenge_completed',
      details: { challenge_id: challenge.id },
      display_info: {
        title: '도전과제 완료!',
        message: challenge.title,
        icon: '🏆',
        color: '#10b981',
        animation_type: 'celebration'
      },
      created_at: new Date(),
      shown_to_user: false
    };
  }

  private getBadgeColor(rarity: BadgeRarity): string {
    const colors = {
      [BadgeRarity.COMMON]: '#9ca3af',
      [BadgeRarity.UNCOMMON]: '#10b981',
      [BadgeRarity.RARE]: '#3b82f6',
      [BadgeRarity.EPIC]: '#8b5cf6',
      [BadgeRarity.LEGENDARY]: '#f59e0b'
    };
    return colors[rarity];
  }

  private calculateChallengeProgress(objectiveId: string, action: string, value: number, metadata?: any): number {
    // 액션과 목표에 따른 진행도 계산 로직
    if (objectiveId.includes('vocabulary') && action === 'word_learned') {
      return value;
    }
    if (objectiveId.includes('lessons') && action === 'lesson_completed') {
      return value;
    }
    if (objectiveId.includes('accuracy') && action === 'quiz_completed') {
      return metadata?.accuracy >= 85 ? value : 0;
    }
    return 0;
  }

  // === 외부 인터페이스 메서드들 (실제 구현에서는 데이터베이스 연동) ===

  private async getUserProfile(userId: string): Promise<UserGameProfile> {
    // 실제로는 데이터베이스에서 가져옴
    return {} as UserGameProfile;
  }

  private async updateUserProfile(profile: UserGameProfile): Promise<void> {
    // 실제로는 데이터베이스에 저장
  }

  private async savePointTransaction(transaction: PointTransaction): Promise<void> {
    // 실제로는 데이터베이스에 저장
  }

  private async getActiveUserChallenges(userId: string): Promise<UserChallenge[]> {
    // 실제로는 데이터베이스에서 가져옴
    return [];
  }

  private async updateUserChallenge(userChallenge: UserChallenge): Promise<void> {
    // 실제로는 데이터베이스에 저장
  }

  private async awardChallengeRewards(userId: string, challenge: ChallengeDefinition): Promise<void> {
    // 도전과제 완료 보상 지급
    if (challenge.rewards.points > 0) {
      await this.awardPoints(userId, PointSource.CHALLENGE_COMPLETION, challenge.rewards.points);
    }
  }

  private async getAllUserProfiles(): Promise<UserGameProfile[]> {
    // 실제로는 데이터베이스에서 가져옴
    return [];
  }

  private getPeriodPoints(user: UserGameProfile, period: 'weekly' | 'monthly'): number {
    // 실제로는 해당 기간의 포인트 계산
    return Math.floor(Math.random() * 1000);
  }
}

export default GameificationEngine;