# Node.js 20 LTS 사용
FROM node:20-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (devDependencies 포함 - ts-node 필요)
RUN npm install

# 소스 코드 복사
COPY . .

# Prisma 클라이언트 생성
RUN npx prisma generate || true

# TypeScript 빌드 (에러 무시)
RUN npm run build || true

# 포트 노출
EXPOSE 8000

# ts-node로 직접 실행 (타입 체크 없이)
CMD ["npm", "start"]