import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Home as HomeIcon,
  BookOpen as BookOpenIcon,
  ClipboardList as ClipboardListIcon,
  TrendingUp as TrendingUpIcon,
  User as UserIcon,
  Settings as SettingsIcon,
  Play as PlayIcon,
  Puzzle as PuzzlePieceIcon,
  PenTool as PenToolIcon,
  GraduationCap as GraduationCapIcon,
  BarChart3 as ChartBarIcon,
  Calendar as CalendarIcon,
  MessageSquare as MessageSquareIcon,
  Flame as FireIcon,
  Trophy as TrophyIcon,
  Star as StarIcon,
  FileText as FileTextIcon,
  Book as BibleIcon
} from 'lucide-react';
import { getDailyHungarianPhrase, getRandomCulturalElement } from '@/lib/hungarianCulture';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string | number;
  submenu?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [dailyPhrase, setDailyPhrase] = useState(getDailyHungarianPhrase());
  const [culturalIcon, setCulturalIcon] = useState(getRandomCulturalElement('icon'));
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  useEffect(() => {
    // 매일 새로운 문구와 아이콘 업데이트
    const updateDaily = () => {
      setDailyPhrase(getDailyHungarianPhrase());
      setCulturalIcon(getRandomCulturalElement('icon'));
    };

    updateDaily();

    // 자정에 업데이트
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      updateDaily();
      // 그 이후로는 24시간마다 업데이트
      setInterval(updateDaily, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, []);

  const menuItems: MenuItem[] = [
    // 1. 대시보드
    {
      id: 'dashboard',
      label: '대시보드',
      icon: <ChartBarIcon className="w-5 h-5" />,
      href: '/dashboard',
    },

    // 2. 학습 경로
    {
      id: 'learning-paths',
      label: '학습 경로',
      icon: <TrendingUpIcon className="w-5 h-5" />,
      href: '/learning-path',
    },

    // 3. 문법 학습
    {
      id: 'grammar',
      label: '문법 학습',
      icon: <BookOpenIcon className="w-5 h-5" />,
      href: '/grammar',
      submenu: [
        {
          id: 'grammar-a1',
          label: 'A1 문법 (기초)',
          icon: <BookOpenIcon className="w-4 h-4" />,
          href: '/grammar/a1',
        },
        {
          id: 'grammar-a2',
          label: 'A2 문법 (초중급)',
          icon: <BookOpenIcon className="w-4 h-4" />,
          href: '/grammar/a2',
        },
        {
          id: 'grammar-b1',
          label: 'B1 문법 (중급)',
          icon: <BookOpenIcon className="w-4 h-4" />,
          href: '/grammar/b1',
        },
        {
          id: 'grammar-b2',
          label: 'B2 문법 (고급)',
          icon: <BookOpenIcon className="w-4 h-4" />,
          href: '/grammar/b2',
        },
      ],
    },

    // 4. 성경 일일 학습 (NEW!)
    {
      id: 'bible-study',
      label: '성경 공부',
      icon: <BibleIcon className="w-5 h-5" />,
      href: '/bible-study',
      badge: 'Daily',
    },

    // 5. 어휘 학습 (Expanded!)
    {
      id: 'vocabulary',
      label: '어휘 학습',
      icon: <GraduationCapIcon className="w-5 h-5" />,
      href: '/vocabulary',
      submenu: [
        {
          id: 'vocab-a1',
          label: 'A1 기초 어휘',
          icon: <div className="w-2 h-2 rounded-full bg-blue-400" />,
          href: '/vocabulary/a1',
        },
        {
          id: 'vocab-a2',
          label: 'A2 초급 어휘',
          icon: <div className="w-2 h-2 rounded-full bg-green-400" />,
          href: '/vocabulary/a2',
        },
        {
          id: 'vocab-b1',
          label: 'B1 중급 어휘',
          icon: <div className="w-2 h-2 rounded-full bg-yellow-400" />,
          href: '/vocabulary/b1',
        },
        {
          id: 'vocab-b2',
          label: 'B2 고급 어휘',
          icon: <div className="w-2 h-2 rounded-full bg-red-400" />,
          href: '/vocabulary/b2',
        },
        {
          id: 'vocab-my',
          label: '나만의 단어장',
          icon: <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />,
          href: '/vocabulary/my',
        },
      ],
    },

    // 6. 작문 연습
    {
      id: 'writing',
      label: '작문 연습',
      icon: <PenToolIcon className="w-5 h-5" />,
      href: '/writing',
    },

    // 7. 레벨 평가
    {
      id: 'assessment',
      label: '레벨 평가',
      icon: <ClipboardListIcon className="w-5 h-5" />,
      href: '/assessment',
      submenu: [
        {
          id: 'assessment-start',
          label: '평가 시작',
          icon: <PlayIcon className="w-4 h-4" />,
          href: '/assessment/start',
        },
        {
          id: 'assessment-history',
          label: '평가 이력',
          icon: <CalendarIcon className="w-4 h-4" />,
          href: '/assessment/history',
        },
      ],
    },

    // 8. 종합 연습
    {
      id: 'exercises',
      label: '종합 연습',
      icon: <PuzzlePieceIcon className="w-5 h-5" />,
      href: '/exercises',
    },

    // 9. 학습 분석
    {
      id: 'analytics',
      label: '학습 분석',
      icon: <ChartBarIcon className="w-5 h-5" />,
      href: '/analytics',
    },
  ];

  const bottomMenuItems: MenuItem[] = [
    {
      id: 'profile',
      label: '내 프로필',
      icon: <UserIcon className="w-5 h-5" />,
      href: '/profile',
    },
    {
      id: 'settings',
      label: '설정',
      icon: <SettingsIcon className="w-5 h-5" />,
      href: '/settings',
    },
  ];

  const handleItemClick = (href: string, hasSubmenu: boolean, itemId: string) => {
    // 항상 페이지 이동
    router.push(href);

    // submenu가 있으면 토글도 실행
    if (hasSubmenu) {
      toggleMenu(itemId);
    }

    // 모바일에서는 사이드바 닫기
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActiveItem = (href: string) => {
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  // 현재 경로에 해당하는 메뉴가 있으면 자동으로 확장
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.submenu && isActiveItem(item.href)) {
        if (!expandedMenus.includes(item.id)) {
          setExpandedMenus(prev => [...prev, item.id]);
        }
      }
    });
  }, [router.pathname]);

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isActive = isActiveItem(item.href);
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus.includes(item.id);

    return (
      <div key={item.id} className="mb-0.5">
        <button
          onClick={() => handleItemClick(item.href, hasSubmenu, item.id)}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group
            ${level > 0 ? 'pl-9' : ''}
            ${isActive
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <span className={`transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </div>

          <div className="flex items-center gap-2">
            {item.badge && (
              <span className={`
                px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider
                ${String(item.badge) === 'Daily' ? 'bg-indigo-100 text-indigo-700' :
                  String(item.badge) === 'NEW' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'}
              `}>
                {item.badge}
              </span>
            )}

            {hasSubmenu && (
              <div className={`transition-transform duration-200 text-gray-400 ${isExpanded ? 'rotate-90' : ''}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            )}
          </div>
        </button>

        {hasSubmenu && isExpanded && (
          <div className="mt-1 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
            {item.submenu!.map((subItem) => renderMenuItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <div className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:z-0
        w-72
      `}>
        {/* 오늘의 헝가리어 */}
        <div className="p-4 bg-gradient-to-r from-yellow-50 via-red-50 to-green-50 m-4 mt-6 rounded-xl border border-red-100">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">오늘의 헝가리어</p>
            <p className="text-sm font-bold text-red-700 mb-1">{dailyPhrase.value}</p>
            <p className="text-xs text-gray-600">{dailyPhrase.nameKorean}</p>
          </div>
        </div>

        {/* 현재 레벨 표시 */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 m-4 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">현재 레벨</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full shadow-sm">A2</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full w-3/4 shadow-inner relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">B1 레벨까지</span>
            <span className="text-blue-600 font-medium">75% 완료</span>
          </div>
        </div>

        {/* 메인 메뉴 */}
        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => renderMenuItem(item))}
          </div>

          {/* 구분선 */}
          <div className="py-4">
            <div className="border-t border-gray-200"></div>
          </div>

          {/* 하단 메뉴 */}
          <div className="space-y-1">
            {bottomMenuItems.map((item) => renderMenuItem(item))}
          </div>
        </nav>

        {/* 사이드바 하단 */}
        <div className="border-t border-gray-200 bg-gradient-to-br from-yellow-50 via-red-50 to-green-50">
          {/* 오늘의 목표 */}
          <div className="p-4">
            <div className="text-center mb-3">
              <p className="text-xs text-gray-600 mb-2">🎯 오늘의 목표</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/70 rounded-lg p-2 border border-blue-200">
                  <div className="flex items-center justify-center mb-1">
                    <BookOpenIcon className="w-3 h-3 text-blue-600 mr-1" />
                    <p className="text-sm font-bold text-blue-600">8/10</p>
                  </div>
                  <p className="text-xs text-gray-600">레슨</p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 border border-green-200">
                  <div className="flex items-center justify-center mb-1">
                    <TrophyIcon className="w-3 h-3 text-green-600 mr-1" />
                    <p className="text-sm font-bold text-green-600">180</p>
                  </div>
                  <p className="text-xs text-gray-600">분</p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 border border-orange-200">
                  <div className="flex items-center justify-center mb-1">
                    <FireIcon className="w-3 h-3 text-orange-600 mr-1" />
                    <p className="text-sm font-bold text-orange-600">12</p>
                  </div>
                  <p className="text-xs text-gray-600">연속일</p>
                </div>
              </div>
            </div>

            {/* 헝가리 명소 컬렉션 */}
            <div className="bg-white/70 rounded-lg p-3 border border-purple-200">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <StarIcon className="w-4 h-4 text-purple-600 mr-1" />
                  <p className="text-sm font-bold text-purple-700">명소 컬렉션</p>
                </div>
                <div className="flex justify-center space-x-1 mb-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center border border-blue-300">
                    <span className="text-xs">🏛️</span>
                  </div>
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center border border-green-300">
                    <span className="text-xs">♨️</span>
                  </div>
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center border border-yellow-300">
                    <span className="text-xs">🏰</span>
                  </div>
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border border-gray-300 opacity-50">
                    <span className="text-xs">🔒</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">3/6 헝가리 명소 해금</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;