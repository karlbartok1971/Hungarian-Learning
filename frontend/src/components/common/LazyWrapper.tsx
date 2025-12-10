import React, { Suspense, ComponentType, lazy } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="text-sm text-gray-600">컴포넌트를 불러오는 중...</p>
    </div>
  </div>
);

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <DefaultFallback />
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// 컴포넌트 지연 로딩을 위한 HOC
export const withLazyLoading = <P extends object>(
  ComponentToWrap: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const WrappedComponent = (props: P) => {
    return (
      <LazyWrapper fallback={fallback}>
        <ComponentToWrap {...props} />
      </LazyWrapper>
    );
  };

  WrappedComponent.displayName = `withLazyLoading(${ComponentToWrap.displayName || ComponentToWrap.name})`;

  return WrappedComponent;
};

// 페이지 컴포넌트용 지연 로딩 헬퍼
export const createLazyComponent = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
  return lazy(importFunc);
};

// 주요 설교 관련 컴포넌트들을 지연 로딩으로 래핑
export const LazySermonEditor = createLazyComponent(
  () => import('@/components/sermon/SermonEditor')
);

export const LazySermonLibrary = createLazyComponent(
  () => import('@/components/sermon/SermonLibrary')
);

export const LazyTheologicalTermLearning = createLazyComponent(
  () => import('@/components/sermon/TheologicalTermLearning')
);

// 페이지별 지연 로딩 컴포넌트
export const LazyDashboard = createLazyComponent(
  () => import('@/pages/dashboard')
);