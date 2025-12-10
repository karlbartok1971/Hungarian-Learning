import { defineConfig, devices } from '@playwright/test';

/**
 * 헝가리어 학습 플랫폼 E2E 테스트 설정
 * T044 - 발음 연습 플로우 및 전체 사용자 경험 테스트
 */
export default defineConfig({
  // 테스트 디렉토리
  testDir: './tests/e2e',

  // 테스트 파일 패턴
  testMatch: '**/*.spec.ts',

  // 전체 테스트 실행 시간 제한 (30분)
  globalTimeout: 30 * 60 * 1000,

  // 개별 테스트 시간 제한 (2분)
  timeout: 2 * 60 * 1000,

  // 테스트 실행 설정
  fullyParallel: true, // 병렬 실행
  forbidOnly: !!process.env.CI, // CI에서 .only() 금지
  retries: process.env.CI ? 2 : 0, // CI에서만 재시도
  workers: process.env.CI ? 1 : undefined, // CI에서는 단일 워커

  // 리포터 설정
  reporter: [
    ['html'], // HTML 리포트
    ['junit', { outputFile: 'test-results/junit.xml' }], // JUnit XML
    ['json', { outputFile: 'test-results/results.json' }], // JSON 결과
  ],

  // 공통 테스트 설정
  use: {
    // 기본 URL (로컬 개발 서버)
    baseURL: process.env.BASE_URL || 'http://localhost:3700',

    // 브라우저 설정
    headless: process.env.CI ? true : false, // CI에서는 headless

    // 추적 및 녹화 설정
    trace: 'on-first-retry', // 첫 번째 재시도 시 추적
    screenshot: 'only-on-failure', // 실패 시에만 스크린샷
    video: 'retain-on-failure', // 실패 시 비디오 보관

    // 마이크 권한 기본 허용 (발음 연습을 위해)
    permissions: ['microphone'],

    // 브라우저 컨텍스트 설정
    locale: 'ko-KR', // 한국어 로케일
    timezoneId: 'Asia/Seoul', // 한국 시간대

    // 네트워크 설정
    ignoreHTTPSErrors: true, // HTTPS 오류 무시 (개발 환경)

    // 오디오/비디오 설정 (발음 연습용)
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--use-file-for-fake-audio-capture=tests/fixtures/test-audio.wav',
        '--allow-file-access'
      ]
    }
  },

  // 프로젝트별 브라우저 설정
  projects: [
    // 데스크톱 브라우저들
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // 오디오 처리를 위한 추가 설정
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--autoplay-policy=no-user-gesture-required',
          ]
        }
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Firefox 오디오 설정
        launchOptions: {
          firefoxUserPrefs: {
            'media.navigator.streams.fake': true,
            'media.navigator.permission.disabled': true
          }
        }
      },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // 모바일 브라우저들 (반응형 테스트용)
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        // 모바일에서 마이크 권한 설정
        permissions: ['microphone']
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        permissions: ['microphone']
      },
    },

    // 태블릿 테스트
    {
      name: 'iPad',
      use: {
        ...devices['iPad Pro'],
        permissions: ['microphone']
      },
    },

    // 접근성 테스트용 브라우저
    {
      name: 'chromium-a11y',
      use: {
        ...devices['Desktop Chrome'],
        // 접근성 도구 활성화
        launchOptions: {
          args: ['--force-prefers-reduced-motion']
        }
      },
    }
  ],

  // 테스트 서버 설정 (개발 서버가 실행되지 않은 경우 자동 시작)
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 3700,
    timeout: 120 * 1000, // 2분 대기
    reuseExistingServer: !process.env.CI, // 로컬에서는 기존 서버 재사용
  },

  // 출력 디렉토리
  outputDir: 'test-results',

  // 테스트 데이터 디렉토리
  testIdAttribute: 'data-testid',

  // 글로벌 셋업/티어다운
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.ts'),

  // 테스트별 셋업 파일
  setupFile: './tests/e2e/test-setup.ts',

  // 테스트 메타데이터
  metadata: {
    project: 'Hungarian Learning Platform',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'test'
  },

  // 테스트 패턴 및 제외
  testIgnore: [
    '**/node_modules/**',
    '**/build/**',
    '**/dist/**'
  ],

  // 최대 실패 수 (전체 테스트 중단 조건)
  maxFailures: process.env.CI ? 10 : undefined,

  // 셔드 설정 (대규모 테스트 suite를 위한 병렬 실행)
  shard: process.env.CI ? {
    total: parseInt(process.env.SHARD_TOTAL || '1'),
    current: parseInt(process.env.SHARD_CURRENT || '1')
  } : undefined,
});