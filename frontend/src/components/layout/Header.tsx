import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Bell as BellIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  User as UserIcon,
  LogOut as LogOutIcon,
  Menu as MenuIcon,
  X as XIcon,
  BookOpen as BookOpenIcon,
  Trophy as TrophyIcon,
  Flame as FireIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentBackground, preloadBackgroundImages } from '@/lib/hungarianBackgrounds';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentBg, setCurrentBg] = useState(getCurrentBackground());

  useEffect(() => {
    preloadBackgroundImages();

    // 1시간마다 배경 업데이트 확인
    const interval = setInterval(() => {
      setCurrentBg(getCurrentBackground());
    }, 3600000);

    return () => clearInterval(interval);
  }, []);

  // 모의 사용자 데이터
  const user = {
    name: '김목사',
    level: 'A2',
    streak: 12,
    points: 2850,
    avatar: null,
  };

  const notifications = [
    {
      id: 1,
      type: 'achievement',
      title: '🎉 새로운 헝가리 문화 레슨!',
      message: '부다페스트 커피 문화 배우기',
      time: '2분 전',
      unread: true,
    },
    {
      id: 2,
      type: 'lesson',
      title: '🔥 12일 연속 학습 달성!',
      message: 'Fire Streak Master 뱃지 획득',
      time: '1시간 전',
      unread: true,
    },
    {
      id: 3,
      type: 'reminder',
      title: '📖 주간 목표 달성',
      message: '이번 주 245분 학습 완료',
      time: '어제',
      unread: false,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden h-10 w-10 hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <XIcon className="w-5 h-5" />
            ) : (
              <MenuIcon className="w-5 h-5" />
            )}
          </Button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-white to-green-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">🇭🇺</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Hungarian Pro</h1>
              <p className="text-xs text-gray-500 hidden md:block">목회자를 위한 헝가리어</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* 사용자 스트릭 및 포인트 (데스크톱만) */}
          <div className="hidden lg:flex items-center space-x-3 mr-4">
            <div className="flex items-center space-x-1 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              <FireIcon className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">{user.streak}일</span>
            </div>
            <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
              <TrophyIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">{user.points.toLocaleString()}P</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="h-10 w-10 px-0 hover:bg-gray-100"
          >
            <SearchIcon className="h-5 w-5" />
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="h-10 w-10 px-0 hover:bg-gray-100 relative"
            >
              <BellIcon className="h-5 w-5" />
              {notifications.some(n => n.unread) && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg">
                  {notifications.filter(n => n.unread).length}
                </span>
              )}
            </Button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <h3 className="text-lg font-semibold">🔔 알림</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-6 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                            notification.unread ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                              notification.unread ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                              <p className="text-xs text-blue-600 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-6 py-3 border-t border-gray-100">
                      <Button variant="ghost" className="w-full text-sm">
                        모든 알림 보기
                      </Button>
                    </div>
                  </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/settings')}
            className="h-10 w-10 px-0 hover:bg-gray-100"
          >
            <SettingsIcon className="w-5 h-5" />
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.level} 레벨</p>
              </div>
            </Button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-lg font-medium text-white">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-lg font-bold">{user.name}님</p>
                          <p className="text-sm text-blue-100">목회자 전용 계정</p>
                          <p className="text-xs text-blue-200">{user.points.toLocaleString()} 포인트</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => router.push('/profile')}
                        className="w-full px-6 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>👤 내 프로필</span>
                      </button>
                      <button
                        onClick={() => router.push('/settings')}
                        className="w-full px-6 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        <span>⚙️ 설정</span>
                      </button>
                    </div>

                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-6 py-3 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-600 flex items-center space-x-3"
                      >
                        <LogOutIcon className="w-4 h-4" />
                        <span>🚪 로그아웃</span>
                      </button>
                    </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 검색 패널 */}
      {isSearchOpen && (
        <div className="bg-white border-b border-gray-200 p-4 shadow-lg">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="🔍 레슨, 단어, 문법, 헝가리 문화를 검색하세요..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoFocus
            />
            <SearchIcon className="absolute left-4 top-4 h-6 w-6 text-gray-400" />

            {/* 인기 검색어 */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">🔥 인기 검색어</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm cursor-pointer hover:bg-blue-200">헝가리어 인사</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm cursor-pointer hover:bg-green-200">종교 용어</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm cursor-pointer hover:bg-purple-200">동사 과거형</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm cursor-pointer hover:bg-orange-200">부다페스트</span>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm cursor-pointer hover:bg-red-200">발라톤 호수</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 클릭 외부 영역 닫기 */}
      {(showProfileMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;