import express from 'express';
import { asyncHandler } from '../lib/errorHandler';

export const lessonRoutes = express.Router();

// 모든 레슨 조회
lessonRoutes.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: '레슨 목록 조회 API 준비 중',
    data: null,
  });
}));

// 레벨별 레슨 조회
lessonRoutes.get('/level/:level', asyncHandler(async (req, res) => {
  const { level } = req.params;
  res.json({
    success: true,
    message: `${level} 레벨 레슨 조회 API 준비 중`,
    data: null,
  });
}));

// 특정 레슨 조회
lessonRoutes.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: `레슨 ${id} 조회 API 준비 중`,
    data: null,
  });
}));

// 레슨 완료 처리
lessonRoutes.post('/:id/complete', asyncHandler(async (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: `레슨 ${id} 완료 처리 API 준비 중`,
    data: null,
  });
}));

// 레슨 진도 업데이트
lessonRoutes.put('/:id/progress', asyncHandler(async (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: `레슨 ${id} 진도 업데이트 API 준비 중`,
    data: null,
  });
}));