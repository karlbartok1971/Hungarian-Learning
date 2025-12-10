# 헝가리어 학습 플랫폼

> 한국인 목회자를 위한 A1부터 B2까지 체계적인 헝가리어 학습 시스템

## 🎯 프로젝트 목표

이 플랫폼은 한국인 목회자가 헝가리어로 자연스럽게 설교할 수 있는 실력을 기르기 위한 특화된 학습 시스템입니다. A1 기초부터 B2 중급까지 체계적으로 학습하여 헝가리어 설교문 작성과 구두 설교 능력을 향상시키는 것이 목표입니다.

## ✨ 주요 기능

### 🎓 개인화된 학습 경로
- 현재 레벨 정확한 측정
- A1~B2 맞춤형 커리큘럼 생성
- 목회 특화 학습 목표 설정

### 🎤 실시간 발음 평가
- AI 기반 헝가리어 발음 분석
- 실시간 피드백 및 교정
- 종교 어휘 발음 특화 연습

### ✍️ 설교문 작성 지원
- 헝가리어 설교문 구조 가이드
- AI 기반 문법 검사
- 신학적 표현 추천

### 📚 스마트 어휘 학습
- FSRS 알고리즘 기반 간격 반복
- 종교 및 일상 어휘 통합 학습
- 시각적 학습 카드 시스템

### 📊 상세한 학습 분석
- 개인별 학습 패턴 분석
- 약점 파악 및 개선 방안 제시
- 목표 달성 진도 추적

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 14 + React 18
- **Styling**: Tailwind CSS 3.4 + shadcn/ui
- **Language**: TypeScript 5.0+
- **State Management**: Zustand
- **HTTP Client**: React Query + Axios

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT
- **Validation**: Joi

### DevOps & Tools
- **Testing**: Jest, Playwright
- **Code Quality**: ESLint, Prettier
- **Package Manager**: npm workspaces

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- PostgreSQL 14 이상
- Redis 6 이상
- npm 8 이상

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd Hungarian
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   # 백엔드 환경변수
   cp backend/.env.example backend/.env
   # 프론트엔드 환경변수
   cp frontend/.env.example frontend/.env.local
   ```

4. **데이터베이스 설정**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **개발 서버 실행**
   ```bash
   npm run dev
   ```

   - 프론트엔드: http://localhost:3000
   - 백엔드 API: http://localhost:3001
   - API 헬스체크: http://localhost:3001/health

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 타입 검사
npm run typecheck

# 코드 린팅
npm run lint

# 테스트 실행
npm test
```

## 📁 프로젝트 구조

```
Hungarian/
├── backend/                 # Express.js API 서버
│   ├── src/
│   │   ├── api/            # API 라우트
│   │   ├── models/         # 데이터베이스 모델
│   │   ├── services/       # 비즈니스 로직
│   │   └── lib/            # 유틸리티 및 설정
│   ├── prisma/             # 데이터베이스 스키마
│   └── tests/              # 백엔드 테스트
├── frontend/                # Next.js 웹 애플리케이션
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── pages/          # Next.js 페이지
│   │   ├── services/       # API 클라이언트
│   │   └── styles/         # CSS 및 스타일
│   └── tests/              # 프론트엔드 테스트
├── shared/                  # 공유 타입 및 상수
│   ├── types/              # TypeScript 타입 정의
│   └── constants/          # 공통 상수
├── specs/                   # 프로젝트 명세서
└── docs/                    # 문서
```

## 🔧 개발 가이드

### 코딩 규칙

1. **언어 정책**
   - 모든 코드 주석은 한국어로 작성
   - 변수명과 함수명은 영어 사용
   - API 응답 메시지는 한국어

2. **코드 스타일**
   - ESLint + Prettier 설정 준수
   - TypeScript strict 모드 사용
   - 함수형 컴포넌트 및 훅 우선 사용

3. **Git 커밋 메시지**
   ```
   feat: 새로운 기능 추가
   fix: 버그 수정
   docs: 문서 수정
   style: 코드 포맷팅
   refactor: 코드 리팩토링
   test: 테스트 추가/수정
   chore: 빌드 설정 등
   ```

### 브랜치 전략

- `main`: 배포 가능한 안정적인 코드
- `develop`: 개발 중인 기능들 통합
- `feature/*`: 개별 기능 개발
- `hotfix/*`: 긴급 수정

## 📚 API 문서

### 인증 API

#### POST /api/auth/login
사용자 로그인

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "성공적으로 로그인되었습니다.",
  "data": {
    "user": {
      "id": "user_id",
      "name": "김목사",
      "email": "test@example.com",
      "currentLevel": "A2",
      "targetLevel": "B2"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### POST /api/auth/register
사용자 회원가입

**Request Body:**
```json
{
  "name": "김목사",
  "email": "test@example.com",
  "password": "Password123!",
  "currentLevel": "A2",
  "targetLevel": "B2",
  "learningGoals": ["SERMON_WRITING", "PRONUNCIATION"]
}
```

### 학습 API

자세한 API 명세는 [API 문서](./docs/api.md)를 참고하세요.

## 🧪 테스트

### 단위 테스트
```bash
npm test
```

### E2E 테스트
```bash
npm run test:e2e
```

### 테스트 커버리지
```bash
npm run test:coverage
```

## 📈 성능 최적화

### 프론트엔드
- Next.js SSG/ISR 활용
- 이미지 최적화 (next/image)
- 코드 분할 및 레이지 로딩
- Service Worker를 통한 오프라인 지원

### 백엔드
- Redis 캐싱
- 데이터베이스 쿼리 최적화
- API 응답 압축
- rate limiting

## 🔒 보안

- JWT 토큰 기반 인증
- HTTPS 강제 사용
- CORS 정책 적용
- SQL Injection 방지
- XSS 공격 방지

## 🌐 국제화

- 한국어 기본 지원
- 헝가리어 특수문자 지원
- 향후 다국어 확장 가능

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: 새로운 기능 추가'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 지원

- 이슈 신고: GitHub Issues
- 이메일: support@hungarian-learning.com

---

**만든 사람**: CGI Development Team
**버전**: 1.0.0
**마지막 업데이트**: 2024년 11월