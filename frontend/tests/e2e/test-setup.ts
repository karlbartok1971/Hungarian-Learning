/**
 * Playwright 테스트 셋업
 * T044 - 각 테스트 실행 전 공통 설정
 */

import { test as base, expect } from '@playwright/test';

// 헝가리어 학습 플랫폼 전용 테스트 픽스처
type HungarianLearningFixtures = {
  authenticatedPage: any;
  pronunciationHelper: any;
  audioMockHelper: any;
};

// 기본 테스트 확장
export const test = base.extend<HungarianLearningFixtures>({
  // 인증된 페이지 픽스처
  authenticatedPage: async ({ page }, use) => {
    // 테스트 사용자로 로그인
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // 로그인 완료 대기
    await expect(page).toHaveURL('/dashboard');

    await use(page);
  },

  // 발음 연습 헬퍼 픽스처
  pronunciationHelper: async ({ page }, use) => {
    const helper = {
      // 연습 세션 시작
      async startPracticeSession(type: 'free' | 'guided' = 'free', difficulty: 'A1' | 'A2' | 'B1' | 'B2' = 'A1') {
        await page.goto('/pronunciation-practice');
        await page.click('[data-testid="start-new-session-button"]');

        await page.click(`[data-testid="practice-type-${type}"]`);
        await page.click(`[data-testid="difficulty-${difficulty.toLowerCase()}"]`);

        if (type === 'guided') {
          // 첫 번째 레슨 선택
          await page.selectOption('[data-testid="lesson-select"]', '1');
        }

        await page.click('[data-testid="create-session-button"]');

        // 세션 로드 대기
        await expect(page.locator('[data-testid="exercise-card"]')).toBeVisible();
      },

      // 오디오 녹음 시뮬레이션
      async simulateRecording(duration: number = 3000) {
        const recordButton = page.locator('[data-testid="record-button"]');
        await recordButton.click();

        // 녹음 상태 확인
        await expect(page.locator('[data-testid="recording-indicator"]')).toBeVisible();

        // 지정된 시간만큼 대기
        await page.waitForTimeout(duration);

        // 녹음 중지
        const stopButton = page.locator('[data-testid="stop-recording-button"]');
        await stopButton.click();

        // 녹음 완료 대기
        await expect(page.locator('[data-testid="recording-indicator"]')).toBeHidden();
      },

      // 발음 평가 제출 및 결과 확인
      async submitAndWaitForAssessment() {
        const submitButton = page.locator('[data-testid="submit-pronunciation-button"]');
        await submitButton.click();

        // 평가 로딩 대기
        await expect(page.locator('[data-testid="assessment-loading"]')).toBeVisible();
        await expect(page.locator('[data-testid="assessment-loading"]')).toBeHidden({ timeout: 15000 });

        // 결과 표시 확인
        await expect(page.locator('[data-testid="assessment-result"]')).toBeVisible();
      },

      // 헝가리어 텍스트 유효성 검증
      async validateHungarianText() {
        const hungarianText = await page.locator('[data-testid="hungarian-text"]').textContent();

        // 헝가리어 특수 문자 포함 확인
        const hungarianChars = /[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/;
        return hungarianChars.test(hungarianText || '');
      },

      // 음소별 피드백 검증
      async validatePhonemeAnalysis() {
        const phonemeFeedback = page.locator('[data-testid="phoneme-feedback"]');
        await expect(phonemeFeedback).toBeVisible();

        // 각 음소별 점수가 있는지 확인
        const phonemeItems = phonemeFeedback.locator('[data-testid^="phoneme-score-"]');
        const count = await phonemeItems.count();

        return count > 0;
      }
    };

    await use(helper);
  },

  // 오디오 모킹 헬퍼 픽스처
  audioMockHelper: async ({ page }, use) => {
    const helper = {
      // Web Audio API 모킹
      async mockWebAudioAPI() {
        await page.addInitScript(() => {
          // AudioContext 모킹
          const originalAudioContext = window.AudioContext || window.webkitAudioContext;

          window.AudioContext = class MockAudioContext {
            sampleRate = 44100;
            currentTime = 0;
            state = 'running';

            createAnalyser() {
              return {
                fftSize: 2048,
                frequencyBinCount: 1024,
                smoothingTimeConstant: 0.8,
                getByteFrequencyData: () => {},
                getByteTimeDomainData: () => {},
                connect: () => {},
                disconnect: () => {}
              };
            }

            createGain() {
              return {
                gain: { value: 1 },
                connect: () => {},
                disconnect: () => {}
              };
            }

            createMediaStreamSource() {
              return {
                connect: () => {},
                disconnect: () => {}
              };
            }

            close() {
              return Promise.resolve();
            }

            resume() {
              return Promise.resolve();
            }
          };

          // MediaRecorder 모킹
          window.MediaRecorder = class MockMediaRecorder extends EventTarget {
            state = 'inactive';
            stream = null;

            constructor(stream) {
              super();
              this.stream = stream;
            }

            start() {
              this.state = 'recording';
              setTimeout(() => {
                this.dispatchEvent(new Event('start'));
              }, 100);
            }

            stop() {
              this.state = 'inactive';
              setTimeout(() => {
                const blob = new Blob(['mock audio data'], { type: 'audio/wav' });
                this.dispatchEvent(new BlobEvent('dataavailable', { data: blob }));
                this.dispatchEvent(new Event('stop'));
              }, 100);
            }

            static isTypeSupported(mimeType) {
              return mimeType.includes('audio');
            }
          };

          // getUserMedia 모킹
          navigator.mediaDevices = navigator.mediaDevices || {};
          navigator.mediaDevices.getUserMedia = async (constraints) => {
            if (constraints.audio) {
              return new MediaStream();
            }
            throw new Error('Permission denied');
          };
        });
      },

      // 마이크 권한 거부 시뮬레이션
      async mockMicrophonePermissionDenied() {
        await page.addInitScript(() => {
          navigator.mediaDevices.getUserMedia = async () => {
            throw new DOMException('Permission denied', 'NotAllowedError');
          };
        });
      },

      // 네트워크 오류 시뮬레이션
      async mockNetworkError(pattern = '**/api/pronunciation/**') {
        await page.route(pattern, route => {
          route.abort('failed');
        });
      },

      // 느린 네트워크 시뮬레이션
      async mockSlowNetwork(pattern = '**/api/pronunciation/**', delay = 5000) {
        await page.route(pattern, async route => {
          await new Promise(resolve => setTimeout(resolve, delay));
          route.continue();
        });
      }
    };

    await use(helper);
  }
});

// 커스텀 expect 매처들
expect.extend({
  // 헝가리어 텍스트 검증
  toBeValidHungarianText(received: string) {
    const hungarianPattern = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s\-.,!?]+$/;
    const pass = hungarianPattern.test(received);

    return {
      message: () =>
        pass
          ? `예상: ${received}이 유효한 헝가리어 텍스트가 아니어야 함`
          : `예상: ${received}이 유효한 헝가리어 텍스트여야 함`,
      pass
    };
  },

  // 음성학적 표기 검증 (IPA)
  toBeValidIPANotation(received: string) {
    // 기본 IPA 문자들과 헝가리어에 사용되는 특수 기호들
    const ipaPattern = /^[a-zɑɒæɛɪɔʊʌəɨɯɤɘɵɞɪʏʊɐɶɜɞʉɪ̟ʊ̟ɨ̟ɯ̟ɤ̟ɘ̟ɵ̟ɞ̟ɨ̠ɯ̠ɤ̠ɘ̠ɵ̠ɞ̠ː.ˈˌ\s\[\]\/]+$/;
    const pass = ipaPattern.test(received);

    return {
      message: () =>
        pass
          ? `예상: ${received}이 유효한 IPA 표기가 아니어야 함`
          : `예상: ${received}이 유효한 IPA 표기여야 함`,
      pass
    };
  },

  // 점수 범위 검증
  toBeValidScore(received: number, min = 0, max = 100) {
    const pass = typeof received === 'number' && received >= min && received <= max;

    return {
      message: () =>
        pass
          ? `예상: ${received}이 ${min}-${max} 범위를 벗어나야 함`
          : `예상: ${received}이 ${min}-${max} 범위 내에 있어야 함`,
      pass
    };
  }
});

export { expect } from '@playwright/test';