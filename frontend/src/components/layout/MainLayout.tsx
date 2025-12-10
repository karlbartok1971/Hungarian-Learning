import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title = '헝가리어 학습 플랫폼',
  description = '목회자를 위한 전문 헝가리어 학습 플랫폼'
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 데스크톱에서는 기본적으로 사이드바를 열어둠
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // 초기 실행
    handleResize();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);

    // 클린업
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />


        {/* Open Graph 메타 태그 */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />

        {/* Twitter 카드 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <Header
          onMenuToggle={toggleSidebar}
          isMenuOpen={isSidebarOpen}
        />

        <div className="flex">
          {/* 사이드바 */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
          />

          {/* 메인 콘텐츠 영역 */}
          <main className={`
            flex-1 transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}
            min-h-[calc(100vh-64px)]
          `}>
            <div className="p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>

        {/* 전역 스타일 */}
        <style jsx global>{`
          /* 커스텀 스크롤바 */
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }

          /* 애니메이션 */
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }

          .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
          }

          .animate-slide-in {
            animation: slideIn 0.3s ease-out;
          }

          /* 글래스모피즘 효과 */
          .glass {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.18);
          }

          /* 그라데이션 텍스트 */
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          /* 호버 효과 */
          .hover-lift {
            transition: all 0.3s ease;
          }
          .hover-lift:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          }

          /* 포커스 링 개선 */
          .focus-ring {
            transition: all 0.2s ease;
          }
          .focus-ring:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
          }

          /* 인터랙티브 카드 */
          .interactive-card {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .interactive-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }

          /* 로딩 스키마톤 */
          .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
          }

          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }

          /* 프리텐다드 폰트 적용 */
          body {
            font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
            font-feature-settings: "tnum";
            font-variant-numeric: tabular-nums;
          }

          /* 한국어 텍스트 최적화 */
          .korean-text {
            word-break: keep-all;
            line-height: 1.6;
          }

          /* 반응형 텍스트 크기 */
          @media (max-width: 640px) {
            .responsive-text-xl {
              font-size: 1.125rem;
              line-height: 1.75rem;
            }
          }

          /* 다크 모드 대비 (추후 구현) */
          @media (prefers-color-scheme: dark) {
            .dark-mode-support {
              color-scheme: dark;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default MainLayout;