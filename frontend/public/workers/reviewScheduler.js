// 리뷰 스케줄링을 위한 웹 워커
// Hungarian Learning Platform - Review Scheduler Worker

class ReviewSchedulerWorker {
  constructor() {
    this.timers = new Map();
    this.reminders = new Map();
    this.isActive = true;

    // 메인 스레드에서 메시지 수신
    self.addEventListener('message', this.handleMessage.bind(this));

    // 주기적 체크 시작 (1분마다)
    this.startPeriodicCheck();

    console.log('리뷰 스케줄러 워커 시작됨');
  }

  handleMessage(event) {
    const { type, data } = event.data;

    try {
      switch (type) {
        case 'SCHEDULE_REMINDER':
          this.scheduleReminder(data);
          break;
        case 'CANCEL_REMINDER':
          this.cancelReminder(data.id);
          break;
        case 'UPDATE_SCHEDULE':
          this.updateSchedule(data);
          break;
        case 'GET_STATUS':
          this.sendStatus();
          break;
        case 'STOP':
          this.stop();
          break;
        default:
          console.warn('알 수 없는 메시지 타입:', type);
      }
    } catch (error) {
      console.error('워커 메시지 처리 실패:', error);
      this.postMessage({
        type: 'ERROR',
        data: { error: error.message }
      });
    }
  }

  // 리마인더 스케줄 등록
  scheduleReminder(reminder) {
    const now = new Date();
    const scheduledTime = new Date(reminder.scheduledAt);
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      // 이미 시간이 지났으면 즉시 실행
      this.triggerReminder(reminder);
      return;
    }

    // 타이머 설정
    const timerId = setTimeout(() => {
      this.triggerReminder(reminder);
      this.timers.delete(reminder.id);
    }, delay);

    // 타이머 저장
    this.timers.set(reminder.id, timerId);
    this.reminders.set(reminder.id, reminder);

    console.log(`리마인더 스케줄됨: ${reminder.title} (${delay}ms 후)`);
  }

  // 리마인더 실행
  triggerReminder(reminder) {
    this.postMessage({
      type: 'REMINDER_DUE',
      data: reminder
    });

    // 일일 리마인더의 경우 다음날로 자동 재스케줄
    if (reminder.type === 'DAILY') {
      const nextReminder = {
        ...reminder,
        id: `daily_${reminder.userId}_${Date.now()}`,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      this.scheduleReminder(nextReminder);
    }

    this.reminders.delete(reminder.id);
  }

  // 리마인더 취소
  cancelReminder(reminderId) {
    const timerId = this.timers.get(reminderId);
    if (timerId) {
      clearTimeout(timerId);
      this.timers.delete(reminderId);
    }
    this.reminders.delete(reminderId);
    console.log(`리마인더 취소됨: ${reminderId}`);
  }

  // 스케줄 업데이트
  updateSchedule(scheduleData) {
    this.postMessage({
      type: 'SCHEDULE_UPDATE',
      data: scheduleData
    });
  }

  // 상태 전송
  sendStatus() {
    this.postMessage({
      type: 'STATUS',
      data: {
        activeTimers: this.timers.size,
        activeReminders: this.reminders.size,
        isActive: this.isActive,
        uptime: Date.now() - this.startTime
      }
    });
  }

  // 주기적 체크 시작
  startPeriodicCheck() {
    this.startTime = Date.now();

    // 1분마다 실행
    setInterval(() => {
      this.performPeriodicCheck();
    }, 60 * 1000);

    // 5분마다 상태 전송
    setInterval(() => {
      this.sendStatus();
    }, 5 * 60 * 1000);
  }

  // 주기적 체크 수행
  performPeriodicCheck() {
    const now = new Date();

    // 만료된 타이머 정리
    this.cleanupExpiredTimers();

    // 메모리 사용량 체크
    this.checkMemoryUsage();

    // 상태 업데이트 알림
    if (this.reminders.size > 0) {
      this.postMessage({
        type: 'PERIODIC_UPDATE',
        data: {
          timestamp: now.toISOString(),
          activeReminders: this.reminders.size
        }
      });
    }
  }

  // 만료된 타이머 정리
  cleanupExpiredTimers() {
    const now = Date.now();

    for (const [reminderId, reminder] of this.reminders.entries()) {
      const scheduledTime = new Date(reminder.scheduledAt).getTime();

      // 스케줄 시간이 24시간 이상 지났으면 정리
      if (now - scheduledTime > 24 * 60 * 60 * 1000) {
        this.cancelReminder(reminderId);
      }
    }
  }

  // 메모리 사용량 체크
  checkMemoryUsage() {
    const maxReminders = 100;
    const maxTimers = 100;

    if (this.reminders.size > maxReminders) {
      console.warn(`리마인더가 너무 많음: ${this.reminders.size}`);

      // 오래된 리마인더 정리
      const sortedReminders = Array.from(this.reminders.entries())
        .sort(([,a], [,b]) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        );

      // 가장 오래된 것들 삭제
      const toDelete = sortedReminders.slice(0, sortedReminders.length - maxReminders);
      toDelete.forEach(([id]) => this.cancelReminder(id));
    }

    if (this.timers.size > maxTimers) {
      console.warn(`타이머가 너무 많음: ${this.timers.size}`);
    }
  }

  // 메시지 전송 헬퍼
  postMessage(message) {
    try {
      self.postMessage(message);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  }

  // 워커 중지
  stop() {
    this.isActive = false;

    // 모든 타이머 정리
    for (const timerId of this.timers.values()) {
      clearTimeout(timerId);
    }

    this.timers.clear();
    this.reminders.clear();

    console.log('리뷰 스케줄러 워커 중지됨');
    self.close();
  }
}

// 워커 인스턴스 생성
const worker = new ReviewSchedulerWorker();