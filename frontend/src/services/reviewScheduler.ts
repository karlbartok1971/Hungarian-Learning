// 리뷰 스케줄링 및 알림 시스템
// Hungarian Learning Platform - Review Scheduling Service

import { vocabularyApi } from './vocabularyApi';

export interface ScheduledReview {
  id: string;
  userId: string;
  cardId: string;
  scheduledAt: Date;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reviewType: 'NEW' | 'REVIEW' | 'RELEARNING';
  notificationSent: boolean;
  completed: boolean;
  createdAt: Date;
}

export interface ReviewReminder {
  id: string;
  userId: string;
  type: 'DAILY' | 'WEEKLY' | 'UPCOMING' | 'OVERDUE';
  title: string;
  message: string;
  scheduledAt: Date;
  sent: boolean;
  actions: ReminderAction[];
}

export interface ReminderAction {
  type: 'START_REVIEW' | 'VIEW_PROGRESS' | 'DISMISS';
  label: string;
  url?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string; // "HH:mm" 형식
  upcomingReviewAlert: boolean;
  upcomingReviewMinutes: number;
  overdueAlert: boolean;
  weeklyProgress: boolean;
  weeklyProgressDay: number; // 0=일요일, 6=토요일
  sound: boolean;
  desktop: boolean;
  email: boolean;
  types: {
    newCards: boolean;
    reviewCards: boolean;
    overdueCards: boolean;
    achievements: boolean;
    streakReminder: boolean;
  };
}

export interface ReviewSchedule {
  today: ScheduledReview[];
  upcoming: ScheduledReview[];
  overdue: ScheduledReview[];
  weeklyLoad: Array<{
    date: string;
    count: number;
    difficulty: number;
  }>;
}

class ReviewSchedulingService {
  private scheduleCache = new Map<string, ReviewSchedule>();
  private notificationQueue: ReviewReminder[] = [];
  private isInitialized = false;
  private worker: Worker | null = null;

  // 초기화
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 웹 워커를 사용하여 백그라운드 스케줄링 처리
      if ('Worker' in window) {
        this.worker = new Worker('/workers/reviewScheduler.js');
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
      }

      // 브라우저 알림 권한 요청
      await this.requestNotificationPermission();

      // 로컬 스토리지에서 설정 로드
      this.loadNotificationSettings();

      // 주기적 스케줄 업데이트 시작
      this.startPeriodicUpdates();

      this.isInitialized = true;
      console.log('리뷰 스케줄링 서비스 초기화 완료');
    } catch (error) {
      console.error('스케줄링 서비스 초기화 실패:', error);
    }
  }

  // 웹 워커 메시지 처리
  private handleWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;

    switch (type) {
      case 'SCHEDULE_UPDATE':
        this.handleScheduleUpdate(data);
        break;
      case 'NOTIFICATION_READY':
        this.showNotification(data);
        break;
      case 'REMINDER_DUE':
        this.processReminder(data);
        break;
    }
  }

  // 사용자의 리뷰 스케줄 조회
  async getReviewSchedule(userId: string, forceRefresh = false): Promise<ReviewSchedule> {
    const cacheKey = `schedule_${userId}`;

    if (!forceRefresh && this.scheduleCache.has(cacheKey)) {
      return this.scheduleCache.get(cacheKey)!;
    }

    try {
      // API에서 카드 상태 데이터 가져오기
      const cardStates = await vocabularyApi.getUserCardStates(userId, {
        sortBy: 'nextReview',
        sortOrder: 'asc',
        pageSize: 1000
      });

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const schedule: ReviewSchedule = {
        today: [],
        upcoming: [],
        overdue: [],
        weeklyLoad: []
      };

      // 카드들을 날짜별로 분류
      cardStates.items.forEach(cardState => {
        if (!cardState.nextReview) return;

        const reviewDate = new Date(cardState.nextReview);
        const scheduledReview: ScheduledReview = {
          id: `${cardState.id}_${reviewDate.getTime()}`,
          userId,
          cardId: cardState.cardId,
          scheduledAt: reviewDate,
          priority: this.calculatePriority(cardState),
          reviewType: cardState.state as any,
          notificationSent: false,
          completed: false,
          createdAt: now
        };

        if (reviewDate < today) {
          schedule.overdue.push(scheduledReview);
        } else if (reviewDate < tomorrow) {
          schedule.today.push(scheduledReview);
        } else if (reviewDate < nextWeek) {
          schedule.upcoming.push(scheduledReview);
        }
      });

      // 주간 로드 계산
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        const dayReviews = cardStates.items.filter(card => {
          if (!card.nextReview) return false;
          const reviewDate = new Date(card.nextReview);
          return reviewDate.toDateString() === date.toDateString();
        });

        schedule.weeklyLoad.push({
          date: date.toISOString().split('T')[0],
          count: dayReviews.length,
          difficulty: this.calculateAverageDifficulty(dayReviews)
        });
      }

      // 캐시에 저장
      this.scheduleCache.set(cacheKey, schedule);

      return schedule;
    } catch (error) {
      console.error('리뷰 스케줄 조회 실패:', error);
      throw error;
    }
  }

  // 카드 우선순위 계산
  private calculatePriority(cardState: any): 'HIGH' | 'MEDIUM' | 'LOW' {
    const retrievability = cardState.retrievability || 0;
    const lapses = cardState.lapses || 0;

    if (retrievability < 0.5 || lapses > 2) {
      return 'HIGH';
    } else if (retrievability < 0.8 || lapses > 0) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  // 평균 난이도 계산
  private calculateAverageDifficulty(cardStates: any[]): number {
    if (cardStates.length === 0) return 0;

    const totalDifficulty = cardStates.reduce((sum, card) => {
      return sum + (card.difficulty || 0);
    }, 0);

    return totalDifficulty / cardStates.length;
  }

  // 일일 리뷰 리마인더 설정
  async scheduleDailyReminder(userId: string, time: string): Promise<void> {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // 오늘 시간이 지났으면 내일로 설정
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const reminder: ReviewReminder = {
      id: `daily_${userId}_${Date.now()}`,
      userId,
      type: 'DAILY',
      title: '오늘의 헝가리어 학습',
      message: '새로운 단어들이 기다리고 있어요! 지금 학습을 시작해보세요.',
      scheduledAt: reminderTime,
      sent: false,
      actions: [
        {
          type: 'START_REVIEW',
          label: '학습 시작',
          url: '/vocabulary'
        },
        {
          type: 'VIEW_PROGRESS',
          label: '진도 확인',
          url: '/vocabulary?tab=dashboard'
        },
        {
          type: 'DISMISS',
          label: '나중에'
        }
      ]
    };

    this.notificationQueue.push(reminder);
    await this.saveReminderToStorage(reminder);

    // 웹 워커에 스케줄 전달
    if (this.worker) {
      this.worker.postMessage({
        type: 'SCHEDULE_REMINDER',
        data: reminder
      });
    }
  }

  // 곧 다가올 리뷰 알림
  async scheduleUpcomingReviewAlert(userId: string, minutesBefore: number): Promise<void> {
    try {
      const schedule = await this.getReviewSchedule(userId);
      const now = new Date();
      const alertTime = new Date(now.getTime() + minutesBefore * 60 * 1000);

      const upcomingReviews = schedule.today.filter(review => {
        const reviewTime = new Date(review.scheduledAt);
        return reviewTime > now && reviewTime <= alertTime;
      });

      if (upcomingReviews.length > 0) {
        const reminder: ReviewReminder = {
          id: `upcoming_${userId}_${Date.now()}`,
          userId,
          type: 'UPCOMING',
          title: `${upcomingReviews.length}개의 복습이 곧 시작됩니다`,
          message: `${minutesBefore}분 후에 복습할 단어들이 준비되었습니다.`,
          scheduledAt: alertTime,
          sent: false,
          actions: [
            {
              type: 'START_REVIEW',
              label: '지금 시작',
              url: '/vocabulary'
            },
            {
              type: 'DISMISS',
              label: '나중에'
            }
          ]
        };

        this.notificationQueue.push(reminder);
        await this.saveReminderToStorage(reminder);
      }
    } catch (error) {
      console.error('곧 다가올 리뷰 알림 설정 실패:', error);
    }
  }

  // 밀린 복습 알림
  async checkOverdueReviews(userId: string): Promise<void> {
    try {
      const schedule = await this.getReviewSchedule(userId);

      if (schedule.overdue.length > 0) {
        const reminder: ReviewReminder = {
          id: `overdue_${userId}_${Date.now()}`,
          userId,
          type: 'OVERDUE',
          title: `밀린 복습이 ${schedule.overdue.length}개 있습니다`,
          message: '밀린 복습을 완료하고 학습 리듬을 되찾아보세요!',
          scheduledAt: new Date(),
          sent: false,
          actions: [
            {
              type: 'START_REVIEW',
              label: '밀린 복습 시작',
              url: '/vocabulary?mode=overdue'
            },
            {
              type: 'VIEW_PROGRESS',
              label: '진도 확인',
              url: '/vocabulary?tab=dashboard'
            },
            {
              type: 'DISMISS',
              label: '나중에'
            }
          ]
        };

        this.notificationQueue.push(reminder);
        this.showNotification(reminder);
      }
    } catch (error) {
      console.error('밀린 복습 확인 실패:', error);
    }
  }

  // 주간 진도 리포트
  async scheduleWeeklyProgress(userId: string, dayOfWeek: number): Promise<void> {
    try {
      const stats = await vocabularyApi.getLearningStatistics(userId, {
        period: 'week',
        includesPredictions: true
      });

      const reminder: ReviewReminder = {
        id: `weekly_${userId}_${Date.now()}`,
        userId,
        type: 'WEEKLY',
        title: '주간 학습 리포트',
        message: `이번 주에 ${stats.totalCardsStudied}개의 단어를 학습했습니다! 정확도: ${(stats.averageAccuracy * 100).toFixed(1)}%`,
        scheduledAt: this.getNextWeekday(dayOfWeek),
        sent: false,
        actions: [
          {
            type: 'VIEW_PROGRESS',
            label: '상세 리포트 보기',
            url: '/vocabulary?tab=dashboard'
          },
          {
            type: 'START_REVIEW',
            label: '새 학습 시작',
            url: '/vocabulary'
          },
          {
            type: 'DISMISS',
            label: '확인'
          }
        ]
      };

      this.notificationQueue.push(reminder);
      await this.saveReminderToStorage(reminder);
    } catch (error) {
      console.error('주간 진도 리포트 생성 실패:', error);
    }
  }

  // 다음 요일 날짜 계산
  private getNextWeekday(dayOfWeek: number): Date {
    const now = new Date();
    const currentDay = now.getDay();
    let daysUntil = dayOfWeek - currentDay;

    if (daysUntil <= 0) {
      daysUntil += 7;
    }

    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + daysUntil);
    nextDate.setHours(9, 0, 0, 0); // 오전 9시로 설정

    return nextDate;
  }

  // 알림 표시
  private async showNotification(reminder: ReviewReminder): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.log('브라우저 알림이 비활성화됨:', reminder.title);
      return;
    }

    try {
      const notification = new Notification(reminder.title, {
        body: reminder.message,
        icon: '/icons/app-icon-192.png',
        badge: '/icons/badge-icon.png',
        tag: reminder.id,
        requireInteraction: true,
        actions: reminder.actions.slice(0, 2).map(action => ({
          action: action.type,
          title: action.label
        }))
      });

      notification.onclick = () => {
        if (reminder.actions[0]?.url) {
          window.open(reminder.actions[0].url, '_blank');
        }
        notification.close();
      };

      // 자동으로 10초 후 닫기
      setTimeout(() => {
        notification.close();
      }, 10000);

    } catch (error) {
      console.error('알림 표시 실패:', error);
    }
  }

  // 브라우저 알림 권한 요청
  private async requestNotificationPermission(): Promise<void> {
    if (!('Notification' in window)) {
      console.log('브라우저가 알림을 지원하지 않습니다');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('알림 권한:', permission);
    }
  }

  // 알림 설정 로드
  private loadNotificationSettings(): NotificationSettings {
    const defaultSettings: NotificationSettings = {
      enabled: true,
      dailyReminder: true,
      dailyReminderTime: '09:00',
      upcomingReviewAlert: true,
      upcomingReviewMinutes: 15,
      overdueAlert: true,
      weeklyProgress: true,
      weeklyProgressDay: 0, // 일요일
      sound: true,
      desktop: true,
      email: false,
      types: {
        newCards: true,
        reviewCards: true,
        overdueCards: true,
        achievements: true,
        streakReminder: true
      }
    };

    const savedSettings = localStorage.getItem('vocabularyNotificationSettings');
    if (savedSettings) {
      try {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      } catch (error) {
        console.error('저장된 알림 설정 로드 실패:', error);
      }
    }

    // 기본 설정 저장
    this.saveNotificationSettings(defaultSettings);
    return defaultSettings;
  }

  // 알림 설정 저장
  saveNotificationSettings(settings: NotificationSettings): void {
    try {
      localStorage.setItem('vocabularyNotificationSettings', JSON.stringify(settings));
      console.log('알림 설정 저장됨');
    } catch (error) {
      console.error('알림 설정 저장 실패:', error);
    }
  }

  // 알림 설정 조회
  getNotificationSettings(): NotificationSettings {
    return this.loadNotificationSettings();
  }

  // 리마인더 로컬 스토리지에 저장
  private async saveReminderToStorage(reminder: ReviewReminder): Promise<void> {
    try {
      const key = `reminders_${reminder.userId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(reminder);

      // 최대 50개 리마인더만 저장
      if (existing.length > 50) {
        existing.splice(0, existing.length - 50);
      }

      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.error('리마인더 저장 실패:', error);
    }
  }

  // 주기적 업데이트 시작
  private startPeriodicUpdates(): void {
    // 5분마다 스케줄 업데이트
    setInterval(() => {
      this.scheduleCache.clear();
    }, 5 * 60 * 1000);

    // 1분마다 알림 큐 처리
    setInterval(() => {
      this.processNotificationQueue();
    }, 60 * 1000);

    console.log('주기적 업데이트 시작됨');
  }

  // 알림 큐 처리
  private processNotificationQueue(): void {
    const now = new Date();

    this.notificationQueue.forEach(reminder => {
      if (!reminder.sent && reminder.scheduledAt <= now) {
        this.showNotification(reminder);
        reminder.sent = true;
      }
    });

    // 처리된 리마인더 제거
    this.notificationQueue = this.notificationQueue.filter(
      reminder => !reminder.sent ||
      (now.getTime() - reminder.scheduledAt.getTime()) < 24 * 60 * 60 * 1000
    );
  }

  // 스케줄 업데이트 처리
  private handleScheduleUpdate(data: any): void {
    console.log('스케줄 업데이트:', data);
    // 필요시 UI 업데이트 이벤트 발생
    window.dispatchEvent(new CustomEvent('reviewScheduleUpdated', { detail: data }));
  }

  // 리마인더 처리
  private processReminder(data: any): void {
    console.log('리마인더 처리:', data);
    this.showNotification(data);
  }

  // 정리
  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.scheduleCache.clear();
    this.notificationQueue = [];
    this.isInitialized = false;
  }
}

// 싱글톤 인스턴스
export const reviewScheduler = new ReviewSchedulingService();

// 유틸리티 함수들
export const formatScheduleTime = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `${diffDays}일 후`;
  } else if (diffHours > 0) {
    return `${diffHours}시간 후`;
  } else if (diffMins > 0) {
    return `${diffMins}분 후`;
  } else if (diffMins > -60) {
    return '곧';
  } else {
    return '지남';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'HIGH': return 'text-red-600';
    case 'MEDIUM': return 'text-yellow-600';
    case 'LOW': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

export const getPriorityLabel = (priority: string): string => {
  switch (priority) {
    case 'HIGH': return '높음';
    case 'MEDIUM': return '보통';
    case 'LOW': return '낮음';
    default: return '미정';
  }
};