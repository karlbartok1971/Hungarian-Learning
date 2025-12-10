# 멀티 스테이지 빌드를 위한 Node.js 이미지
FROM node:18-alpine as base

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 의존성 설치
RUN apk add --no-cache \
    libc6-compat \
    dumb-init \
    curl

# 의존성 설치 스테이지
FROM base as dependencies

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production && \
    npm cache clean --force

# 개발 의존성도 설치
FROM base as dev-dependencies
COPY package*.json ./
RUN npm ci

# 빌드 스테이지
FROM dev-dependencies as builder

# 소스 코드 복사
COPY . .

# Next.js 빌드
RUN npm run build

# 개발 환경
FROM dev-dependencies as development

# 소스 코드 복사
COPY . .

# 환경변수 설정
ENV NODE_ENV=development
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# 포트 노출
EXPOSE 3000

# 헬스체크
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || curl -f http://localhost:3000 || exit 1

# 사용자 생성 (보안)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 권한 설정
RUN chown -R nextjs:nodejs /app
USER nextjs

# 애플리케이션 시작 (개발 모드)
CMD ["dumb-init", "npm", "run", "dev"]

# 프로덕션 환경
FROM base as production

# 프로덕션 의존성 복사
COPY --from=dependencies --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# package.json 복사
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# 환경변수 설정
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# 포트 노출
EXPOSE 3000

# 헬스체크
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# 사용자 생성 (보안)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 권한 설정
USER nextjs

# 애플리케이션 시작
CMD ["dumb-init", "node", "server.js"]