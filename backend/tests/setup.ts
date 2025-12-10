// 테스트 환경 설정
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/hungarian_test_db';

// 전역 테스트 설정
beforeAll(async () => {
  // 데이터베이스 연결 등 초기 설정
});

afterAll(async () => {
  // 정리 작업
});