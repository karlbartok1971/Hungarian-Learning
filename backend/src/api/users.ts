import express from 'express';
import { asyncHandler } from '../lib/errorHandler';

export const userRoutes = express.Router();

// 사용자 진도 조회
userRoutes.get('/progress', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: '사용자 진도 조회 API 준비 중',
    data: null,
  });
}));

// 사용자 학습 통계 조회
userRoutes.get('/stats', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: '학습 통계 조회 API 준비 중',
    data: null,
  });
}));

// 사용자 설정 조회
userRoutes.get('/settings', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: '사용자 설정 조회 API 준비 중',
    data: null,
  });
}));

// 사용자 설정 업데이트
userRoutes.put('/settings', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: '사용자 설정 업데이트 API 준비 중',
    data: null,
  });
}));