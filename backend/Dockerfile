# 멀티 스테이지 빌드를 위한 Node.js 이미지
FROM node:18-alpine as base

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 의존성 설치 (프로덕션에 필요한 기본 패키지)
RUN apk add --no-cache \
    dumb-init \
    curl

# 의존성 설치 스테이지
FROM base as dependencies

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production && \
    npm cache clean --force

# 개발 의존성도 설치 (개발 환경용)
FROM base as dev-dependencies
COPY package*.json ./
RUN npm ci

# 개발 환경
FROM dev-dependencies as development

# 소스 코드 복사
COPY . .

# TypeScript 컴파일
RUN npm run build

# 환경변수 설정
ENV NODE_ENV=development
ENV PORT=3001

# 포트 노출
EXPOSE 3001

# 헬스체크
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# 사용자 생성 (보안)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 권한 설정
RUN chown -R nodejs:nodejs /app
USER nodejs

# 애플리케이션 시작
CMD ["dumb-init", "npm", "run", "dev"]

# 프로덕션 환경
FROM base as production

# 프로덕션 의존성 복사
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# 컴파일된 소스 코드 복사
COPY --from=development --chown=nodejs:nodejs /app/dist ./dist
COPY --from=development --chown=nodejs:nodejs /app/package*.json ./

# 환경변수 설정
ENV NODE_ENV=production
ENV PORT=3001

# 포트 노출
EXPOSE 3001

# 헬스체크
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# 사용자 생성 (보안)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 권한 설정
USER nodejs

# 애플리케이션 시작
CMD ["dumb-init", "node", "dist/server.js"]