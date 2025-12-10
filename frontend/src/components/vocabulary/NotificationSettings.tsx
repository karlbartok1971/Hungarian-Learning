// 알림 설정 관리 컴포넌트
// Hungarian Learning Platform - Notification Settings Component

import React, { useState, useEffect } from 'react';
import { reviewScheduler, NotificationSettings } from '../../services/reviewScheduler';

interface NotificationSettingsProps {
  userId: string;
  className?: string;
  onSettingsChange?: (settings: NotificationSettings) => void;
}

const NotificationSettingsComponent: React.FC<NotificationSettingsProps> = ({
  userId,
  className,
  onSettingsChange
}) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    dailyReminder: true,
    dailyReminderTime: '09:00',
    upcomingReviewAlert: true,
    upcomingReviewMinutes: 15,
    overdueAlert: true,
    weeklyProgress: true,
    weeklyProgressDay: 0,
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
  });

  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // 컴포넌트 마운트 시 설정 로드
  useEffect(() => {
    loadSettings();
    checkNotificationPermission();
  }, []);

  // 설정 로드
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const currentSettings = reviewScheduler.getNotificationSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('알림 설정 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 브라우저 알림 권한 확인
  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        // 테스트 알림 표시
        new Notification('알림이 활성화되었습니다!', {
          body: '이제 헝가리어 학습 알림을 받을 수 있습니다.',
          icon: '/icons/app-icon-192.png'
        });
      }
    }
  };

  // 설정 변경 핸들러
  const handleSettingChange = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasChanges(true);
  };

  // 알림 타입 설정 변경
  const handleTypeChange = (type: keyof NotificationSettings['types'], value: boolean) => {
    const newSettings = {
      ...settings,
      types: {
        ...settings.types,
        [type]: value
      }
    };
    setSettings(newSettings);
    setHasChanges(true);
  };

  // 설정 저장
  const saveSettings = async () => {
    try {
      // 알림이 활성화되었는데 브라우저 권한이 없으면 요청
      if (settings.enabled && settings.desktop && notificationPermission !== 'granted') {
        await requestNotificationPermission();
      }

      // 설정 저장
      reviewScheduler.saveNotificationSettings(settings);

      // 일일 리마인더 스케줄 업데이트
      if (settings.enabled && settings.dailyReminder) {
        await reviewScheduler.scheduleDailyReminder(userId, settings.dailyReminderTime);
      }

      setHasChanges(false);

      if (onSettingsChange) {
        onSettingsChange(settings);
      }

      // 성공 알림
      if (notificationPermission === 'granted') {
        new Notification('설정이 저장되었습니다', {
          body: '알림 설정이 성공적으로 업데이트되었습니다.',
          icon: '/icons/app-icon-192.png'
        });
      }

    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 설정 초기화
  const resetSettings = () => {
    const defaultSettings: NotificationSettings = {
      enabled: true,
      dailyReminder: true,
      dailyReminderTime: '09:00',
      upcomingReviewAlert: true,
      upcomingReviewMinutes: 15,
      overdueAlert: true,
      weeklyProgress: true,
      weeklyProgressDay: 0,
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

    setSettings(defaultSettings);
    setHasChanges(true);
  };

  // 요일 이름 배열
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  // 시간 옵션 생성
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('ko-KR', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        options.push(
          <option key={timeString} value={timeString}>
            {displayTime}
          </option>
        );
      }
    }
    return options;
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 max-w-2xl ${className}`}>
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">알림 설정</h2>
        <p className="text-gray-600">
          학습 리마인더와 진도 알림을 설정하여 꾸준한 학습 습관을 만들어보세요.
        </p>
      </div>

      {/* 브라우저 알림 권한 상태 */}
      {notificationPermission !== 'granted' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-yellow-800">브라우저 알림 권한 필요</h3>
              <p className="text-sm text-yellow-700 mt-1">
                알림을 받으려면 브라우저 권한이 필요합니다.
              </p>
            </div>
            <button
              onClick={requestNotificationPermission}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              권한 허용
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* 전체 알림 활성화 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">알림 활성화</h3>
            <p className="text-sm text-gray-600">모든 알림 기능을 켜거나 끕니다</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => handleSettingChange('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* 일일 리마인더 */}
        <div className={`space-y-4 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">일일 학습 리마인더</h3>
              <p className="text-sm text-gray-600">매일 정해진 시간에 학습 알림을 받습니다</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dailyReminder}
                onChange={(e) => handleSettingChange('dailyReminder', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.dailyReminder && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                알림 시간
              </label>
              <select
                value={settings.dailyReminderTime}
                onChange={(e) => handleSettingChange('dailyReminderTime', e.target.value)}
                className="w-40 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {generateTimeOptions()}
              </select>
            </div>
          )}
        </div>

        {/* 곧 다가올 복습 알림 */}
        <div className={`space-y-4 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">곧 다가올 복습 알림</h3>
              <p className="text-sm text-gray-600">복습 시간이 임박했을 때 미리 알려드립니다</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.upcomingReviewAlert}
                onChange={(e) => handleSettingChange('upcomingReviewAlert', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.upcomingReviewAlert && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                미리 알림 (분)
              </label>
              <select
                value={settings.upcomingReviewMinutes}
                onChange={(e) => handleSettingChange('upcomingReviewMinutes', parseInt(e.target.value))}
                className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5분</option>
                <option value={10}>10분</option>
                <option value={15}>15분</option>
                <option value={30}>30분</option>
                <option value={60}>1시간</option>
              </select>
            </div>
          )}
        </div>

        {/* 밀린 복습 알림 */}
        <div className={`flex items-center justify-between ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div>
            <h3 className="font-medium text-gray-900">밀린 복습 알림</h3>
            <p className="text-sm text-gray-600">복습하지 않은 단어가 있을 때 알려드립니다</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.overdueAlert}
              onChange={(e) => handleSettingChange('overdueAlert', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* 주간 진도 리포트 */}
        <div className={`space-y-4 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">주간 진도 리포트</h3>
              <p className="text-sm text-gray-600">매주 학습 성과를 요약해서 알려드립니다</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.weeklyProgress}
                onChange={(e) => handleSettingChange('weeklyProgress', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.weeklyProgress && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                리포트 요일
              </label>
              <select
                value={settings.weeklyProgressDay}
                onChange={(e) => handleSettingChange('weeklyProgressDay', parseInt(e.target.value))}
                className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {weekdays.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 알림 방식 */}
        <div className={`space-y-4 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="font-medium text-gray-900">알림 방식</h3>

          <div className="space-y-3 ml-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.desktop}
                onChange={(e) => handleSettingChange('desktop', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">데스크톱 알림</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(e) => handleSettingChange('sound', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">알림 소리</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.email}
                onChange={(e) => handleSettingChange('email', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">이메일 알림</span>
            </label>
          </div>
        </div>

        {/* 알림 타입 */}
        <div className={`space-y-4 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="font-medium text-gray-900">알림 타입</h3>

          <div className="space-y-3 ml-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.types.newCards}
                onChange={(e) => handleTypeChange('newCards', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">새 단어 학습</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.types.reviewCards}
                onChange={(e) => handleTypeChange('reviewCards', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">복습 카드</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.types.overdueCards}
                onChange={(e) => handleTypeChange('overdueCards', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">밀린 복습</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.types.achievements}
                onChange={(e) => handleTypeChange('achievements', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">성취 알림</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.types.streakReminder}
                onChange={(e) => handleTypeChange('streakReminder', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">연속 학습 리마인더</span>
            </label>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            onClick={resetSettings}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            기본값으로 복원
          </button>

          <div className="space-x-3">
            <button
              onClick={loadSettings}
              disabled={!hasChanges}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              onClick={saveSettings}
              disabled={!hasChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              설정 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsComponent;