/**
 * Playwright 글로벌 티어다운
 * T044 - E2E 테스트 환경 정리
 */

import { FullConfig, chromium } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 E2E 테스트 환경 정리 중...');

  try {
    // 1. 테스트 브라우저 준비
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3700';

    // 2. 테스트 데이터 정리
    console.log('🗑️ 테스트 데이터 정리 중...');

    try {
      // 테스트 사용자로 로그인
      const loginResponse = await page.request.post(`${baseURL}/api/auth/login`, {
        headers: { 'Content-Type': 'application/json' },
        data: {
          email: process.env.TEST_USER_EMAIL || 'test@example.com',
          password: process.env.TEST_USER_PASSWORD || 'password123'
        }
      });

      if (loginResponse.ok()) {
        const loginData = await loginResponse.json();
        const token = loginData.token;

        // 테스트 중 생성된 데이터 정리
        await page.request.delete(`${baseURL}/api/test/cleanup`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          data: { environment: 'test' }
        });

        console.log('✅ 테스트 데이터 정리 완료');
      }
    } catch (error) {
      console.warn('⚠️ 테스트 데이터 정리 중 오류 발생:', error.message);
    }

    // 3. 임시 파일 정리
    console.log('📁 임시 파일 정리 중...');

    try {
      const fs = require('fs').promises;
      const path = require('path');

      // 테스트 결과 디렉토리 확인
      const testResultsDir = path.join(process.cwd(), 'test-results');
      const tempDir = path.join(process.cwd(), 'tests/temp');

      // 이전 테스트 결과 파일 정리 (최근 5개만 보관)
      try {
        const resultFiles = await fs.readdir(testResultsDir);
        const htmlReports = resultFiles
          .filter(file => file.startsWith('playwright-report'))
          .sort()
          .reverse();

        // 최근 5개를 제외하고 삭제
        for (const report of htmlReports.slice(5)) {
          await fs.rmdir(path.join(testResultsDir, report), { recursive: true });
        }
      } catch (error) {
        // 디렉토리가 없는 경우 무시
      }

      // 임시 오디오 파일 정리
      try {
        const tempFiles = await fs.readdir(tempDir);
        for (const file of tempFiles) {
          if (file.endsWith('.wav') || file.endsWith('.mp3')) {
            await fs.unlink(path.join(tempDir, file));
          }
        }
      } catch (error) {
        // 디렉토리가 없는 경우 무시
      }

      console.log('✅ 임시 파일 정리 완료');
    } catch (error) {
      console.warn('⚠️ 임시 파일 정리 중 오류:', error.message);
    }

    // 4. 브라우저 정리
    await context.close();
    await browser.close();

    // 5. 환경 변수 정리
    delete process.env.TEST_USER_EMAIL;
    delete process.env.TEST_USER_PASSWORD;
    delete process.env.E2E_SETUP_COMPLETE;

    // 6. 최종 통계 출력
    console.log('📊 테스트 실행 완료 통계:');
    console.log(`- 설정 URL: ${baseURL}`);
    console.log(`- 테스트 환경: ${process.env.NODE_ENV || 'development'}`);
    console.log(`- 실행 시간: ${new Date().toLocaleString('ko-KR')}`);

    console.log('🎉 E2E 테스트 환경 정리 완료');

  } catch (error) {
    console.error('❌ E2E 테스트 환경 정리 실패:', error);
    // 정리 실패는 치명적이지 않으므로 throw하지 않음
  }
}

export default globalTeardown;