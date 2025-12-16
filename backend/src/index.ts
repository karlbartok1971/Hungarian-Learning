import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

import { errorHandler } from './lib/errorHandler';
import { connectRedis } from './lib/redis';
import { authRoutes } from './api/auth';
import { userRoutes } from './api/users';
import { lessonRoutes } from './api/lessons';
import { vocabularyRoutes } from './api/vocabulary';
import { uploadRoutes } from './api/upload';
import { assessmentRoutes } from './api/assessment';
import { curriculumRoutes } from './api/curriculum';
import { learningPathRoutes } from './api/learningPath';
import aiTutorRoutes from './api/aiTutor';
import grammarLessonsRoutes from './api/grammarLessons';
import dashboardRoutes from './api/dashboard';
import bibleRoutes from './api/bible';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(helmet()); // 보안 헤더 설정
app.use(morgan('combined')); // 로깅

// CORS 설정
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3700',
    'http://localhost:3900', // 프론트엔드 포트 명시적 허용
    'http://127.0.0.1:3900'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 헬스 체크 엔드포인트
app.get('/health', (_, res) => {
  res.status(200).json({
    success: true,
    message: '헝가리어 학습 플랫폼 API 서버가 정상 동작 중입니다.',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// [Moved & Refactored] 어휘 API는 이제 api/vocabulary.ts 에서 처리됩니다.
// app.use('/api/vocabulary', vocabularyRoutes); 가 이미 설정되어 있습니다.

// API 라우트 설정
app.use((req, res, next) => {
  console.log(`[Middleware] Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/learning-path', learningPathRoutes);
app.use('/api/ai-tutor', aiTutorRoutes);
app.use('/api/grammar-lessons', grammarLessonsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bible', bibleRoutes);

// ---------------------------------------------
// 서버 시작
// ---------------------------------------------
// 에러 핸들러
app.use(errorHandler);

// 404 핸들러 (반드시 가장 마지막에 위치해야 함)
app.use('*', (_, res) => {
  res.status(404).json({
    success: false,
    error: '요청한 API 엔드포인트를 찾을 수 없습니다.',
  });
});

// 서버 시작
app.listen(PORT, async () => {
  console.log(`🚀 헝가리어 학습 플랫폼 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📖 API 문서: http://localhost:${PORT}/health`);
  console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);

  // Redis 연결 시도
  await connectRedis();
});

// 그레이스풀 셧다운
process.on('SIGTERM', () => {
  console.log('SIGTERM 신호 수신. 서버를 우아하게 종료합니다...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT 신호 수신. 서버를 우아하게 종료합니다...');
  process.exit(0);
});

export default app;// Trigger restart
