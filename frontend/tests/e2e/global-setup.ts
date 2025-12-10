/**
 * Playwright 글로벌 셋업
 * T044 - E2E 테스트 환경 초기화
 */

import { FullConfig, chromium } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🔧 E2E 테스트 환경 초기화 중...');

  try {
    // 1. 테스트 브라우저 준비
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // 2. 애플리케이션 헬스 체크
    const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3700';

    console.log(`📡 애플리케이션 연결 확인: ${baseURL}`);

    let retries = 0;
    const maxRetries = 30; // 30초 대기

    while (retries < maxRetries) {
      try {
        await page.goto(baseURL, { timeout: 2000 });
        console.log('✅ 애플리케이션 연결 성공');
        break;
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          throw new Error(`애플리케이션 연결 실패: ${baseURL}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 3. 테스트 데이터베이스 초기화 (API 호출)
    console.log('🗄️ 테스트 데이터 초기화 중...');

    try {
      await page.request.post(`${baseURL}/api/test/reset-database`, {
        headers: { 'Content-Type': 'application/json' },
        data: { environment: 'test' }
      });
      console.log('✅ 테스트 데이터베이스 초기화 완료');
    } catch (error) {
      console.warn('⚠️ 테스트 데이터베이스 초기화 실패 (개발 모드에서는 정상)');
    }

    // 4. 테스트용 사용자 계정 생성
    console.log('👤 테스트 사용자 계정 생성 중...');

    try {
      const response = await page.request.post(`${baseURL}/api/auth/register`, {
        headers: { 'Content-Type': 'application/json' },
        data: {
          email: 'test@example.com',
          password: 'password123',
          name: '테스트 사용자',
          nativeLanguage: 'ko',
          targetLanguage: 'hu',
          currentLevel: 'A1'
        }
      });

      if (response.ok()) {
        console.log('✅ 테스트 사용자 계정 생성 완료');
      }
    } catch (error) {
      console.warn('⚠️ 테스트 사용자 생성 실패 (이미 존재할 수 있음)');
    }

    // 5. 테스트용 샘플 데이터 생성
    console.log('📚 샘플 학습 데이터 생성 중...');

    try {
      // 로그인하여 JWT 토큰 획득
      const loginResponse = await page.request.post(`${baseURL}/api/auth/login`, {
        headers: { 'Content-Type': 'application/json' },
        data: {
          email: 'test@example.com',
          password: 'password123'
        }
      });

      if (loginResponse.ok()) {
        const loginData = await loginResponse.json();
        const token = loginData.token;

        // 샘플 발음 연습 데이터 생성
        await page.request.post(`${baseURL}/api/pronunciation/sample-data`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          data: { environment: 'test' }
        });

        console.log('✅ 샘플 데이터 생성 완료');
      }
    } catch (error) {
      console.warn('⚠️ 샘플 데이터 생성 실패');
    }

    // 6. 브라우저 정리
    await context.close();
    await browser.close();

    // 7. 환경 변수 설정
    process.env.TEST_USER_EMAIL = 'test@example.com';
    process.env.TEST_USER_PASSWORD = 'password123';
    process.env.E2E_SETUP_COMPLETE = 'true';

    console.log('🎉 E2E 테스트 환경 초기화 완료');

  } catch (error) {
    console.error('❌ E2E 테스트 환경 초기화 실패:', error);
    throw error;
  }
}

export default globalSetup;