# 헝가리어 학습 플랫폼 설정 가이드

## 📋 시스템 요구사항

### 개발 환경
- **Operating System**: macOS, Linux, Windows
- **Node.js**: 18.0.0 이상
- **npm**: 8.0.0 이상
- **PostgreSQL**: 14.0 이상
- **Redis**: 6.0 이상 (선택사항, 캐싱용)

### 권장 개발 도구
- **IDE**: VS Code
- **Extensions**:
  - TypeScript and JavaScript Language Features
  - Prisma
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

## 🛠 상세 설치 가이드

### 1. Node.js 설치

#### macOS (Homebrew 사용)
```bash
# Homebrew가 없다면 먼저 설치
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 설치
brew install node@18
```

#### Linux (Ubuntu/Debian)
```bash
# NodeSource 저장소 추가
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Node.js 설치
sudo apt-get install -y nodejs
```

#### Windows
1. [Node.js 공식 사이트](https://nodejs.org)에서 LTS 버전 다운로드
2. 설치 파일 실행 후 기본 설정으로 설치

### 2. PostgreSQL 설치

#### macOS
```bash
# Homebrew로 설치
brew install postgresql@14

# 서비스 시작
brew services start postgresql@14

# 데이터베이스 생성
createdb hungarian_learning_db
```

#### Linux (Ubuntu/Debian)
```bash
# PostgreSQL 설치
sudo apt update
sudo apt install postgresql postgresql-contrib

# PostgreSQL 서비스 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 데이터베이스 및 사용자 생성
sudo -u postgres psql
CREATE DATABASE hungarian_learning_db;
CREATE USER hungarian_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hungarian_learning_db TO hungarian_user;
\q
```

#### Windows
1. [PostgreSQL 공식 사이트](https://www.postgresql.org/download/windows/)에서 다운로드
2. 설치 시 pgAdmin 포함하여 설치
3. pgAdmin을 통해 데이터베이스 생성

### 3. Redis 설치 (선택사항)

#### macOS
```bash
brew install redis
brew services start redis
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

#### Windows
1. [Redis for Windows](https://github.com/tporadowski/redis/releases) 다운로드
2. 압축 해제 후 redis-server.exe 실행

## 🔧 프로젝트 설정

### 1. 프로젝트 클론 및 초기 설정

```bash
# 저장소 클론 (실제 저장소 URL로 변경)
git clone https://github.com/your-username/hungarian-learning-platform.git
cd Hungarian

# 모든 의존성 설치 (루트에서 실행)
npm install
```

### 2. 환경 변수 설정

#### 백엔드 환경변수 (.env)
```bash
cd backend
cp .env.example .env
```

`.env` 파일을 다음과 같이 수정:

```env
# 서버 설정
PORT=3001
NODE_ENV=development

# 데이터베이스
DATABASE_URL="postgresql://username:password@localhost:5432/hungarian_learning_db"

# Redis (선택사항)
REDIS_URL="redis://localhost:6379"

# JWT 설정
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Google Cloud Speech API (나중에 설정)
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=./config/gcp-credentials.json

# 기타 설정
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=debug
```

#### 프론트엔드 환경변수 (.env.local)
```bash
cd ../frontend
cp .env.example .env.local
```

`.env.local` 파일 수정:

```env
# API 설정
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

# 앱 설정
NEXT_PUBLIC_APP_NAME="헝가리어 학습 플랫폼"
NEXT_PUBLIC_APP_VERSION=1.0.0

# 기능 플래그
NEXT_PUBLIC_ENABLE_SPEECH_RECOGNITION=false
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=false

# 개발 도구
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
```

### 3. 데이터베이스 초기화

```bash
cd backend

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션 실행
npx prisma migrate dev --name init

# 시드 데이터 삽입
npx prisma db seed
```

### 4. 개발 서버 실행

#### 옵션 1: 전체 애플리케이션 실행 (권장)
```bash
# 루트 디렉토리에서
npm run dev
```

이 명령은 다음을 실행합니다:
- 백엔드 서버: http://localhost:3001
- 프론트엔드 서버: http://localhost:3000

#### 옵션 2: 개별 서버 실행
```bash
# 터미널 1: 백엔드
cd backend
npm run dev

# 터미널 2: 프론트엔드
cd frontend
npm run dev
```

### 5. 설정 확인

#### 백엔드 헬스체크
```bash
curl http://localhost:3001/health
```

성공적인 응답:
```json
{
  "success": true,
  "message": "헝가리어 학습 플랫폼 API 서버가 정상 동작 중입니다.",
  "timestamp": "2024-11-22T...",
  "version": "1.0.0"
}
```

#### 프론트엔드 접속
브라우저에서 http://localhost:3000 접속하여 메인 페이지 확인

## 🧪 테스트 설정

### 테스트 데이터베이스 설정
```bash
# 테스트용 데이터베이스 생성
createdb hungarian_learning_test_db

# 테스트 환경변수 추가 (.env.test)
cd backend
echo 'DATABASE_URL="postgresql://username:password@localhost:5432/hungarian_learning_test_db"' > .env.test
```

### 테스트 실행
```bash
# 백엔드 테스트
cd backend
npm test

# 프론트엔드 테스트
cd ../frontend
npm test

# E2E 테스트 (Playwright)
npm run test:e2e
```

## 🚀 빌드 및 배포 준비

### 프로덕션 빌드
```bash
# 루트에서 전체 빌드
npm run build

# 개별 빌드
cd backend && npm run build
cd ../frontend && npm run build
```

### 코드 품질 검사
```bash
# 타입 체크
npm run typecheck

# 린팅
npm run lint

# 자동 수정
npm run lint:fix
```

## 🔍 문제 해결

### 자주 발생하는 문제들

#### 1. 포트 충돌 에러
```
Error: listen EADDRINUSE: address already in use :::3000
```

**해결방법:**
```bash
# 포트 사용 프로세스 찾기
lsof -ti:3000
# 또는
netstat -tulpn | grep 3000

# 프로세스 종료
kill -9 <PID>
```

#### 2. 데이터베이스 연결 실패
```
Error: P1001: Can't reach database server
```

**해결방법:**
1. PostgreSQL 서비스 실행 확인
2. DATABASE_URL 확인
3. 방화벽 설정 확인

#### 3. Node 버전 호환성 문제
```
Error: Unsupported engine
```

**해결방법:**
```bash
# 현재 Node 버전 확인
node --version

# nvm으로 올바른 버전 설치
nvm install 18
nvm use 18
```

#### 4. Prisma 관련 에러
```
Error: Schema parsing error
```

**해결방법:**
```bash
# Prisma 클라이언트 재생성
npx prisma generate

# 스키마 재설정
npx prisma migrate reset
```

### 로그 확인

#### 백엔드 로그
- 개발 환경: 콘솔에서 실시간 확인
- 프로덕션: logs/ 디렉토리 또는 외부 로깅 서비스

#### 프론트엔드 로그
- 브라우저 개발자 도구 Console 탭
- Next.js 빌드 로그: .next/ 디렉토리

## 📚 추가 리소스

### 개발 도구
- [Prisma Studio](https://www.prisma.io/studio): 데이터베이스 GUI
  ```bash
  cd backend
  npx prisma studio
  ```

- [Redis GUI](https://github.com/qishibo/AnotherRedisDesktopManager): Redis 관리 도구

### 문서 및 참고 자료
- [Next.js 문서](https://nextjs.org/docs)
- [Prisma 문서](https://www.prisma.io/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [TypeScript 문서](https://www.typescriptlang.org/docs)

### 커뮤니티 및 지원
- 프로젝트 Issues: GitHub 저장소의 Issues 탭
- 기술 질문: Stack Overflow (태그: hungarian-learning-platform)

---

이 가이드를 따라 설정하시면 로컬 개발 환경에서 헝가리어 학습 플랫폼을 성공적으로 실행할 수 있습니다. 문제가 발생하면 위의 문제 해결 섹션을 참고하거나 프로젝트 저장소에 이슈를 등록해 주세요.