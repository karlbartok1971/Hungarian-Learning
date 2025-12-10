/**
 * 어휘 API 엔드포인트 (임시 비활성화)
 * TODO: VocabularyService와 동기화 필요
 */

import express from 'express';

export const vocabularyRoutes = express.Router();

// Placeholder endpoint
vocabularyRoutes.get('/status', (_, res) => {
  res.json({
    success: true,
    message: '어휘 API는 준비 중입니다',
  });
});
