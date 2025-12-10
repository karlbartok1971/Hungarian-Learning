import type { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';

import '@/styles/globals.css';

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

// 레이아웃을 사용하지 않을 페이지 목록
const pagesWithoutLayout = ['/login', '/register', '/auth'];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // 정확히 '/' 경로이거나, pagesWithoutLayout에 있는 경로로 시작하는 경우 레이아웃 사용 안함
  const useLayout = router.pathname !== '/' && !pagesWithoutLayout.some(page => router.pathname.startsWith(page));

  return (
    <>
      <Head>
        <title>헝가리어 학습 플랫폼</title>
        <meta name="description" content="한국인을 위한 체계적인 헝가리어 학습 시스템" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* PWA 메타 태그 */}
        <meta name="theme-color" content="#2563eb" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {useLayout ? (
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          ) : (
            <Component {...pageProps} />
          )}
          <Toaster />
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}