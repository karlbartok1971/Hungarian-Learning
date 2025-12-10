import express from 'express';
import { asyncHandler } from '../lib/errorHandler';
import { AuthService } from '../services/AuthService';
import { authenticateToken } from '../lib/auth';

export const authRoutes = express.Router();

// 로그인
authRoutes.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await AuthService.login({ email, password });

  res.json({
    success: true,
    message: '성공적으로 로그인되었습니다.',
    data: result,
  });
}));

// 회원가입
authRoutes.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, currentLevel, targetLevel, learningGoals } = req.body;

  const result = await AuthService.register({
    name,
    email,
    password,
    currentLevel,
    targetLevel,
    learningGoals,
  });

  res.status(201).json({
    success: true,
    message: '회원가입이 완료되었습니다.',
    data: result,
  });
}));

// 토큰 새로고침
authRoutes.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: '리프레시 토큰이 필요합니다.',
    });
  }

  const result = await AuthService.refreshToken(refreshToken);

  res.json({
    success: true,
    message: '토큰이 갱신되었습니다.',
    data: result,
  });
}));

// 로그아웃
authRoutes.post('/logout', asyncHandler(async (req, res) => {
  // 클라이언트에서 토큰 삭제하도록 안내
  res.json({
    success: true,
    message: '성공적으로 로그아웃되었습니다.',
  });
}));

// 프로필 조회 (인증 필요)
authRoutes.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  const profile = await AuthService.getProfile(userId);

  res.json({
    success: true,
    message: '프로필을 성공적으로 조회했습니다.',
    data: profile,
  });
}));

// 프로필 업데이트 (인증 필요)
authRoutes.put('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const updateData = req.body;

  const updatedProfile = await AuthService.updateProfile(userId, updateData);

  res.json({
    success: true,
    message: '프로필이 성공적으로 업데이트되었습니다.',
    data: updatedProfile,
  });
}));

// 비밀번호 변경 (인증 필요)
authRoutes.put('/password', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  await AuthService.changePassword(userId, currentPassword, newPassword);

  res.json({
    success: true,
    message: '비밀번호가 성공적으로 변경되었습니다.',
  });
}));

// 이메일 인증 (인증 필요)
authRoutes.post('/verify-email', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  await AuthService.verifyEmail(userId);

  res.json({
    success: true,
    message: '이메일 인증이 완료되었습니다.',
  });
}));