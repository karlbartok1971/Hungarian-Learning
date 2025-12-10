/**
 * 인증 컨텍스트
 * JWT 토큰 관리 및 사용자 인증 상태 관리
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import apiClient, { ApiResponse, handleApiError } from '@/lib/api';

// 사용자 타입
export interface User {
  id: string;
  email: string;
  name: string;
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2';
  targetLevel: 'A1' | 'A2' | 'B1' | 'B2';
  learningGoals: string[];
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 로그인 입력
export interface LoginInput {
  email: string;
  password: string;
}

// 회원가입 입력
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2';
  targetLevel: 'A1' | 'A2' | 'B1' | 'B2';
  learningGoals: string[];
}

// 인증 컨텍스트 타입
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 페이지 로드 시 사용자 정보 복원
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');

        if (savedUser && accessToken) {
          setUser(JSON.parse(savedUser));

          // 서버에서 최신 사용자 정보 가져오기
          await refreshUser();
        }
      } catch (error) {
        console.error('인증 초기화 실패:', error);
        // 에러 발생 시 로컬 스토리지 클리어
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 로그인
  const login = async (credentials: LoginInput) => {
    try {
      const response = await apiClient.post<ApiResponse<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>>('/api/auth/login', credentials);

      if (response.data.success && response.data.data) {
        const { user, accessToken, refreshToken } = response.data.data;

        // 토큰 및 사용자 정보 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);

        // 대시보드로 리다이렉션
        router.push('/dashboard');
      } else {
        throw new Error(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  };

  // 회원가입
  const register = async (data: RegisterInput) => {
    try {
      const response = await apiClient.post<ApiResponse<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>>('/api/auth/register', data);

      if (response.data.success && response.data.data) {
        const { user, accessToken, refreshToken } = response.data.data;

        // 토큰 및 사용자 정보 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);

        // 회원가입 후 레벨 테스트 모달 또는 대시보드로 이동
        // 여기서는 일단 대시보드로 이동 (나중에 모달 추가)
        router.push('/dashboard');
      } else {
        throw new Error(response.data.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  };

  // 로그아웃
  const logout = () => {
    // 토큰 및 사용자 정보 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    setUser(null);

    // 로그인 페이지로 리다이렉션
    router.push('/auth/login');
  };

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/api/auth/profile');

      if (response.data.success && response.data.data) {
        const updatedUser = response.data.data;

        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('사용자 정보 새로고침 실패:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth 훅
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
