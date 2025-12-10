# Quickstart Guide: Hungarian Language Learning Platform

**Date**: 2025-11-20
**Status**: Ready for Development
**Phase**: 1 - Implementation Ready

## Overview

이 문서는 헝가리어 학습 플랫폼의 핵심 개발 환경 설정과 초기 구현을 위한 빠른 시작 가이드입니다.

## Prerequisites

### Required Software
- **Node.js**: 18.0+ (LTS 권장)
- **Python**: 3.11+
- **PostgreSQL**: 15+
- **MongoDB**: 6.0+
- **Redis**: 7.0+

### Development Tools
- **Git**: 2.40+
- **Docker**: 24.0+ (선택사항)
- **VS Code**: 권장 IDE
- **Postman**: API 테스팅

## Project Structure Setup

### 1. Initial Repository Structure

```bash
# 프로젝트 루트 생성
mkdir hungarian-learning-platform
cd hungarian-learning-platform

# 기본 구조 생성
mkdir -p {backend/src/{models,services,api,lib,types},frontend/src/{components,pages,hooks,services,stores,lib,types},shared/{types,constants},docs,scripts,tests}

# Git 초기화
git init
echo "node_modules/
.env*
dist/
build/
*.log
.DS_Store" > .gitignore
```

### 2. Backend Setup (Node.js + TypeScript)

```bash
cd backend

# package.json 초기화
npm init -y

# 필수 의존성 설치
npm install express cors helmet morgan compression
npm install @prisma/client prisma mongodb typeorm redis
npm install jsonwebtoken bcryptjs multer
npm install joi celebrate express-rate-limit

# TypeScript 및 개발 의존성
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/bcryptjs @types/jsonwebtoken
npm install -D ts-node nodemon jest @types/jest
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier

# TypeScript 설정
npx tsc --init
```

### 3. Frontend Setup (React + TypeScript)

```bash
cd ../frontend

# Vite를 사용한 React 프로젝트 생성
npm create vite@latest . -- --template react-ts

# 추가 의존성 설치
npm install @tanstack/react-query zustand
npm install react-router-dom react-hook-form
npm install @hookform/resolvers zod
npm install tailwindcss @tailwindcss/typography @tailwindcss/forms
npm install @radix-ui/react-slot @radix-ui/react-dialog
npm install lucide-react class-variance-authority clsx tailwind-merge

# shadcn/ui 설정
npx shadcn-ui@latest init
```

## Environment Configuration

### 1. Backend Environment (.env)

```bash
# cd backend
cat > .env << EOF
# Application
NODE_ENV=development
PORT=3000
APP_NAME=hungarian-learning-platform
API_VERSION=v1

# Database - PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/hungarian_learning"

# Database - MongoDB
MONGODB_URI="mongodb://localhost:27017/hungarian_learning"

# Database - Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Google Cloud Speech API
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

# File Storage
UPLOAD_DIR=uploads
MAX_FILE_SIZE=50MB

# External APIs
LANGUAGE_TOOL_API_URL=https://api.languagetool.org
LANGUAGE_TOOL_API_KEY=your-api-key

# Logging
LOG_LEVEL=debug
LOG_FORMAT=combined

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:5173
EOF
```

### 2. Frontend Environment (.env)

```bash
# cd frontend
cat > .env << EOF
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_WS_BASE_URL=ws://localhost:3000

# App Configuration
VITE_APP_NAME="헝가리어 학습 플랫폼"
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_SPEECH_RECOGNITION=true
VITE_ENABLE_ANALYTICS=false

# Audio Configuration
VITE_AUDIO_SAMPLE_RATE=16000
VITE_MAX_AUDIO_DURATION=30000

# Google Analytics (선택사항)
VITE_GA_TRACKING_ID=
EOF
```

## Database Setup

### 1. PostgreSQL Schema

```sql
-- 데이터베이스 생성
CREATE DATABASE hungarian_learning;
CREATE USER hungarian_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hungarian_learning TO hungarian_user;

-- 필수 확장
\c hungarian_learning;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### 2. Prisma Setup

```bash
cd backend

# Prisma 초기화
npx prisma init

# schema.prisma 생성 (이미 data-model.md에 정의된 스키마 사용)
```

### 3. MongoDB Indexes

```javascript
// MongoDB 연결 후 실행
use hungarian_learning

// 필수 인덱스 생성
db.vocabulary.createIndex({ "hungarian": "text", "korean": "text" })
db.vocabulary.createIndex({ "cefr_level": 1, "religious_context": 1 })
db.lessons.createIndex({ "cefr_level": 1, "lesson_type": 1 })
db.user_sermon_drafts.createIndex({ "user_id": 1, "status": 1 })
```

## Core Implementation

### 1. Backend API Server (Express + TypeScript)

```typescript
// backend/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { celebrate, errors } from 'celebrate';

import { authRoutes } from './api/auth';
import { userRoutes } from './api/users';
import { progressRoutes } from './api/progress';
import { lessonRoutes } from './api/lessons';
import { vocabularyRoutes } from './api/vocabulary';
import { pronunciationRoutes } from './api/pronunciation';
import { sermonRoutes } from './api/sermons';
import { audioRoutes } from './api/audio';
import { searchRoutes } from './api/search';
import { syncRoutes } from './api/sync';

import { errorHandler } from './lib/errorHandler';
import { authenticateToken } from './lib/auth';

const app = express();

// 미들웨어 설정
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP'
});
app.use(limiter);

// API Routes
const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, authenticateToken, userRoutes);
app.use(`${API_PREFIX}/progress`, authenticateToken, progressRoutes);
app.use(`${API_PREFIX}/lessons`, authenticateToken, lessonRoutes);
app.use(`${API_PREFIX}/vocabulary`, authenticateToken, vocabularyRoutes);
app.use(`${API_PREFIX}/pronunciation`, authenticateToken, pronunciationRoutes);
app.use(`${API_PREFIX}/sermons`, authenticateToken, sermonRoutes);
app.use(`${API_PREFIX}/audio`, authenticateToken, audioRoutes);
app.use(`${API_PREFIX}/search`, authenticateToken, searchRoutes);
app.use(`${API_PREFIX}/sync`, authenticateToken, syncRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

// Error Handling
app.use(errors());
app.use(errorHandler);

export default app;
```

### 2. Frontend App Setup (React + TypeScript)

```tsx
// frontend/src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Lessons = React.lazy(() => import('./pages/Lessons'));
const Vocabulary = React.lazy(() => import('./pages/Vocabulary'));
const Pronunciation = React.lazy(() => import('./pages/Pronunciation'));
const Sermons = React.lazy(() => import('./pages/Sermons'));

// Error Boundary
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AuthProvider } from './providers/AuthProvider';
import { OfflineProvider } from './providers/OfflineProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OfflineProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/lessons" element={<Lessons />} />
                    <Route path="/vocabulary" element={<Vocabulary />} />
                    <Route path="/pronunciation" element={<Pronunciation />} />
                    <Route path="/sermons" element={<Sermons />} />
                  </Routes>
                </Suspense>
                <Toaster />
              </div>
            </Router>
          </OfflineProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
```

### 3. Service Worker Setup

```typescript
// frontend/public/sw.js
const CACHE_NAME = 'hungarian-learning-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  // Add critical assets
];

const API_CACHE = 'api-cache-v1';
const AUDIO_CACHE = 'audio-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          return response || fetch(request).then((fetchResponse) => {
            if (fetchResponse.ok) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Audio files
  if (url.pathname.includes('/audio/')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then((cache) => {
        return cache.match(request) || fetch(request).then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        });
      })
    );
    return;
  }

  // Default caching strategy
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-hungarian') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // Implement offline data synchronization
}
```

## Development Commands

### Package Scripts Setup

```json
// backend/package.json scripts
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:reset": "prisma migrate reset",
    "db:seed": "ts-node scripts/seed.ts"
  }
}
```

```json
// frontend/package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix"
  }
}
```

## Initial Data Seeding

### 1. Sample Vocabulary Data

```typescript
// backend/scripts/seed.ts
import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';

const prisma = new PrismaClient();

const sampleVocabulary = [
  {
    hungarian: 'ház',
    korean: '집',
    english: 'house',
    pronunciation: { ipa: 'haːz', hangul_approximation: '하즈' },
    part_of_speech: 'noun',
    cefr_level: 'A1',
    religious_context: false,
    category: 'home',
    examples: [
      { hungarian: 'Ez az én házam.', korean: '이것은 나의 집이다.', context: 'formal' }
    ]
  },
  {
    hungarian: 'templom',
    korean: '교회, 성전',
    english: 'church, temple',
    pronunciation: { ipa: 'tɛmplom', hangul_approximation: '템플롬' },
    part_of_speech: 'noun',
    cefr_level: 'A2',
    religious_context: true,
    category: 'theology',
    examples: [
      { hungarian: 'Vasárnap templomba megyek.', korean: '일요일에 교회에 간다.', context: 'religious' }
    ]
  }
];

async function seedDatabase() {
  console.log('Seeding database...');

  // MongoDB connection
  const mongoClient = new MongoClient(process.env.MONGODB_URI!);
  await mongoClient.connect();
  const db = mongoClient.db();

  // Insert vocabulary
  await db.collection('vocabulary').insertMany(sampleVocabulary);

  console.log('Database seeded successfully');

  await mongoClient.close();
  await prisma.$disconnect();
}

seedDatabase().catch(console.error);
```

## Testing Setup

### 1. Backend Tests

```typescript
// backend/tests/auth.test.ts
import request from 'supertest';
import app from '../src/app';

describe('Authentication', () => {
  test('should register new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
      current_cefr_level: 'A1'
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(userData.email);
  });

  test('should login with valid credentials', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.access_token).toBeDefined();
  });
});
```

### 2. Frontend Tests

```tsx
// frontend/src/components/__tests__/VocabularyCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VocabularyCard } from '../VocabularyCard';

const mockVocabulary = {
  id: '1',
  hungarian: 'ház',
  korean: '집',
  pronunciation: { ipa: 'haːz' },
  cefr_level: 'A1'
};

test('renders vocabulary card correctly', () => {
  render(<VocabularyCard vocabulary={mockVocabulary} />);

  expect(screen.getByText('ház')).toBeInTheDocument();
  expect(screen.getByText('집')).toBeInTheDocument();
  expect(screen.getByText('haːz')).toBeInTheDocument();
});

test('plays audio when button is clicked', async () => {
  const user = userEvent.setup();
  render(<VocabularyCard vocabulary={mockVocabulary} />);

  const playButton = screen.getByRole('button', { name: /play audio/i });
  await user.click(playButton);

  // Assert audio playback logic
});
```

## Development Workflow

### 1. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Database services (if using Docker)
docker-compose up -d postgres mongodb redis
```

### 2. Development URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **API Documentation**: http://localhost:3000/api-docs

### 3. Common Development Tasks

```bash
# Database migrations
cd backend
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Seed database
npm run db:seed

# Run tests
npm test

# Lint and fix code
npm run lint:fix
```

## Deployment Preparation

### 1. Production Environment

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build

# Docker deployment (optional)
docker build -t hungarian-learning-backend ./backend
docker build -t hungarian-learning-frontend ./frontend
```

### 2. Environment Variables for Production

```bash
# Production .env
NODE_ENV=production
DATABASE_URL="your-production-db-url"
JWT_SECRET="your-production-jwt-secret"
CORS_ORIGIN="https://your-domain.com"
```

## Next Steps

1. **완료된 설정 확인**: 모든 서비스가 정상적으로 실행되는지 확인
2. **API 엔드포인트 구현**: 인증부터 시작하여 순차적으로 구현
3. **프론트엔드 컴포넌트 개발**: UI 컴포넌트 라이브러리 구축
4. **음성 처리 통합**: Google Cloud Speech API 연동
5. **오프라인 기능**: Service Worker 및 IndexedDB 구현
6. **테스트 커버리지**: 핵심 기능에 대한 테스트 작성

---

**Quickstart Status**: ✅ Ready for Implementation
**Estimated Setup Time**: 2-4 hours
**Ready for**: Phase 1 Core Development