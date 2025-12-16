import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Bell as BellIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  User as UserIcon,
  LogOut as LogOutIcon,
  Menu as MenuIcon,
  X as XIcon,
  Command as CommandIcon,
  Flame as FireIcon,
  Sparkles as SparklesIcon,
  Moon as MoonIcon,
  Sun as SunIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 모의 사용자 데이터
  const user = {
    name: '김목사',
    level: 'A2',
    streak: 12,
    points: 2850,
  };

  const notifications = [
    {
      id: 1,
      type: 'achievement',
      title: '새로운 레슨 해금!',
      message: 'B1 문법 - 조건문 학습이 가능합니다',
      time: '5분 전',
      unread: true,
    },
    {
      id: 2,
      type: 'streak',
      title: '12일 연속 학습 달성!',
      message: 'Fire Master 뱃지를 획득했습니다',
      time: '1시간 전',
      unread: true,
    },
    {
      id: 3,
      type: 'reminder',
      title: '오늘의 학습 알림',
      message: '아직 오늘 목표를 달성하지 못했어요',
      time: '3시간 전',
      unread: false,
    },
  ];

  // CMD+K 단축키로 검색창 열기
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsSearchOpen(true);
    }
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/auth/login');
  };

  const quickLinks = [
    { label: 'A1 어휘 학습', href: '/vocabulary/a1', icon: '📚' },
    { label: 'B1 문법 학습', href: '/grammar/b1', icon: '📖' },
    { label: '오늘의 성경', href: '/bible-study', icon: '✝️' },
    { label: '레벨 테스트', href: '/assessment/start', icon: '🎯' },
  ];

  return (
    <>
      {/* 메인 헤더 - Glassmorphism 적용 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between h-20 px-4 lg:px-6">
          {/* 좌측: 햄버거 메뉴 + 로고 */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="lg:hidden h-9 w-9 hover:bg-gray-100/80"
            >
              {isMenuOpen ? (
                <XIcon className="w-5 h-5" />
              ) : (
                <MenuIcon className="w-5 h-5" />
              )}
            </Button>

            {/* 로고 */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/dashboard')}>
              <div className="w-9 h-9 bg-gradient-to-br from-red-500 via-white to-green-600 rounded-xl flex items-center justify-center shadow-md ring-1 ring-black/5">
                <span className="text-xl">🇭🇺</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Hungarian Pro</h1>
                <p className="text-[10px] text-gray-500 -mt-0.5">목회자를 위한 헝가리어</p>
              </div>
            </div>
          </div>

          {/* 우측: 검색 + 액션 버튼들 */}
          <div className="flex items-center gap-2">
            {/* 검색 버튼 (데스크탑) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 bg-gray-100/80 hover:bg-gray-200/80 rounded-xl border border-gray-200/50 transition-all min-w-[280px]"
            >
              <SearchIcon className="w-4 h-4 text-gray-400" />
              <span className="flex-1 text-left">검색...</span>
              <kbd className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-gray-400 bg-white rounded-md border border-gray-200 shadow-sm">
                <CommandIcon className="w-3 h-3" />K
              </kbd>
            </button>

            {/* 모바일 검색 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden h-10 w-10"
            >
              <SearchIcon className="h-5 w-5 text-gray-600" />
            </Button>

            {/* 다크모드 토글 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="h-9 w-9 hidden sm:flex"
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5 text-yellow-500" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-600" />
              )}
            </Button>

            {/* 알림 */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="h-9 w-9 relative"
              >
                <BellIcon className="h-5 w-5 text-gray-600" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <h3 className="text-sm font-semibold text-white">알림</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${notification.unread ? 'bg-indigo-50/50' : ''
                          }`}
                      >
                        <div className="flex gap-3">
                          {notification.unread && (
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0" />
                          )}
                          <div className={notification.unread ? '' : 'ml-5'}>
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                            <p className="text-xs text-indigo-600 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-gray-100">
                    <Button variant="ghost" className="w-full text-sm text-gray-600 hover:text-gray-900">
                      모든 알림 보기
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 설정 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/settings')}
              className="h-9 w-9 hidden sm:flex"
            >
              <SettingsIcon className="w-5 h-5 text-gray-600" />
            </Button>

            {/* 프로필 */}
            <div className="relative ml-1">
              <Button
                variant="ghost"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 h-9 px-2 hover:bg-gray-100/80"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-gray-500">{user.level} 레벨</p>
                </div>
              </Button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-white">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.name}님</p>
                        <p className="text-xs text-indigo-100">{user.points.toLocaleString()}P</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => router.push('/profile')}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>내 프로필</span>
                    </button>
                    <button
                      onClick={() => router.push('/settings')}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      <span>설정</span>
                    </button>
                  </div>

                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      <span>로그아웃</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 커맨드 팔레트 스타일 검색 다이얼로그 (Renovated) */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden border-0 shadow-2xl bg-white/90 backdrop-blur-xl ring-1 ring-black/5 rounded-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>검색</DialogTitle>
          </DialogHeader>

          {/* 검색 입력 영역 */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-sm">
              <SearchIcon className="w-5 h-5 text-white" />
            </div>
            <input
              type="text"
              placeholder="무엇을 찾고 계신가요?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-xl font-medium bg-transparent outline-none placeholder:text-gray-400 text-gray-900"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-gray-400 bg-white rounded-md border border-gray-200/60 shadow-sm">
              <span className="text-sm">⎋</span> ESC
            </kbd>
          </div>

          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            {/* 빠른 이동 (Quick Links) */}
            <div className="p-4">
              <h3 className="px-3 mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                🚀 빠른 이동 (Quick Actions)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => {
                      router.push(link.href);
                      setIsSearchOpen(false);
                    }}
                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-indigo-50/80 transition-all duration-200 border border-transparent hover:border-indigo-100 hover:shadow-sm text-left"
                  >
                    <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all duration-300 scale-100 group-hover:scale-110">
                      {link.icon}
                    </span>
                    <div>
                      <span className="block text-sm font-semibold text-gray-700 group-hover:text-indigo-700">
                        {link.label}
                      </span>
                      <span className="text-[10px] text-gray-400 group-hover:text-indigo-400">바로가기</span>
                    </div>
                    <CommandIcon className="w-3 h-3 ml-auto text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {/* 인기 검색어 (Trending) */}
            <div className="p-4 border-t border-gray-100/50">
              <h3 className="px-3 mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FireIcon className="w-3 h-3 text-orange-400" /> 인기 검색어
              </h3>
              <div className="flex flex-wrap gap-2 px-2">
                {['🇭🇺 헝가리어 인사', '⚡️ 필수 동사 50', '🏰 부다페스트 여행', '✝️ 주기도문'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50/80 hover:bg-white hover:text-indigo-600 hover:ring-2 hover:ring-indigo-100 rounded-lg border border-gray-100 transition-all duration-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* 시스템 메뉴 */}
            <div className="p-2 border-t border-gray-100/50 bg-gray-50/30">
              <button
                onClick={() => router.push('/settings')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SettingsIcon className="w-4 h-4" />
                <span>환경 설정...</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 외부 클릭 시 드롭다운 닫기 */}
      {(showProfileMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </>
  );
};

export default Header;