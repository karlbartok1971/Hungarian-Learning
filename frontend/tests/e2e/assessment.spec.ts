import { test, expect } from '@playwright/test';

/**
 * Complete Assessment Flow E2E Tests
 *
 * 헝가리어 학습 플랫폼의 전체 평가 플로우 End-to-End 테스트
 * 사용자 등록 → 레벨 테스트 → 개인화된 학습 경로 생성까지의 완전한 워크플로우 검증
 */

test.describe('헝가리어 학습 플랫폼 - 완전한 평가 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 시작 전 초기 상태로 이동
    await page.goto('/');

    // 페이지 로딩 대기
    await expect(page).toHaveTitle(/헝가리어 학습 플랫폼/);
  });

  test('신규 사용자의 완전한 평가 및 학습 경로 생성 플로우', async ({ page }) => {
    // Step 1: 메인 페이지에서 학습 시작
    await test.step('메인 페이지에서 학습 시작 버튼 클릭', async () => {
      await expect(page.locator('h1')).toContainText('헝가리어로 설교하는 목회자가 되어보세요');

      const startButton = page.locator('button', { hasText: '학습 시작하기' });
      await expect(startButton).toBeVisible();
      await startButton.click();
    });

    // Step 2: 회원가입 또는 로그인
    await test.step('회원가입 진행', async () => {
      // 회원가입 페이지로 이동되었는지 확인
      await expect(page).toHaveURL(/.*\/(register|signup).*/);

      // 회원가입 폼 작성
      await page.fill('input[name="name"]', '김목사');
      await page.fill('input[name="email"]', 'pastor.kim@test.church');
      await page.fill('input[name="password"]', 'SecurePass123!');
      await page.fill('input[name="passwordConfirm"]', 'SecurePass123!');

      // 목회자 특화 정보 입력
      await page.selectOption('select[name="occupation"]', 'pastor');
      await page.fill('input[name="churchName"]', '서울중앙교회');
      await page.selectOption('select[name="experience"]', 'beginner');

      const registerButton = page.locator('button[type="submit"]', { hasText: '회원가입' });
      await registerButton.click();

      // 성공 메시지 또는 리디렉션 확인
      await expect(page).toHaveURL(/.*\/welcome.*/);
    });

    // Step 3: 초기 설정 및 목표 설정
    await test.step('학습 목표 및 선호도 설정', async () => {
      await expect(page.locator('h2')).toContainText('학습 목표를 설정해주세요');

      // 주요 목표 선택
      await page.click('label', { hasText: '헝가리어 설교문 작성' });

      // 목표 수준 선택
      await page.selectOption('select[name="targetLevel"]', 'B2');

      // 주당 학습 가능 시간
      await page.fill('input[name="weeklyHours"]', '10');

      // 선호하는 학습 방식
      await page.check('input[value="visual"]');
      await page.check('input[value="audio"]');

      // 이전 언어 학습 경험
      await page.check('input[value="english"]');

      const nextButton = page.locator('button', { hasText: '다음 단계' });
      await nextButton.click();
    });

    // Step 4: 레벨 테스트 시작
    await test.step('레벨 평가 테스트 시작', async () => {
      await expect(page.locator('h2')).toContainText('헝가리어 실력을 평가해보세요');

      // 평가 설명 읽기
      await expect(page.locator('.assessment-description')).toContainText('약 15-20분 소요');
      await expect(page.locator('.assessment-description')).toContainText('A1부터 B2까지');

      // 평가 시작
      const startAssessmentButton = page.locator('button', { hasText: '평가 시작' });
      await startAssessmentButton.click();

      // 첫 번째 문제 화면 로딩 확인
      await expect(page.locator('.question-container')).toBeVisible();
      await expect(page.locator('.progress-indicator')).toContainText('1 / 20');
    });

    // Step 5: A1 레벨 문제들 풀이
    await test.step('A1 기초 문제 시퀀스 완료', async () => {
      // 문제 1: 기본 인사말 (객관식)
      await expect(page.locator('.question-text')).toContainText('안녕하세요');

      const optionA = page.locator('input[value="A"]');
      await optionA.click();

      const nextQuestionButton = page.locator('button', { hasText: '다음 문제' });
      await nextQuestionButton.click();

      // 문제 2: 기본 어휘 (이미지 선택)
      await page.waitForSelector('.image-question');
      await expect(page.locator('.question-text')).toContainText('사과');

      await page.click('.option-image[data-answer="alma"]');
      await nextQuestionButton.click();

      // 문제 3: 기본 문법 (빈칸 채우기)
      await page.waitForSelector('.fill-blank-question');
      await page.fill('input[name="blank1"]', 'vagyok');
      await nextQuestionButton.click();

      // 진행률 확인
      await expect(page.locator('.progress-indicator')).toContainText('4 / 20');
    });

    // Step 6: 적응형 난이도 조정 확인
    await test.step('적응형 평가 시스템 검증', async () => {
      // A1 문제들을 잘 풀었으므로 A2 문제로 올라가야 함
      await expect(page.locator('.difficulty-indicator')).toContainText('A2');

      // A2 수준의 더 복잡한 문제
      await expect(page.locator('.question-text')).toContainText('과거');

      // 의도적으로 틀린 답 선택 (난이도 조정 확인용)
      await page.click('.option[data-incorrect="true"]');
      await nextQuestionButton.click();

      // 다음 문제는 다시 A1으로 내려가거나 A2 쉬운 문제가 나와야 함
      await page.waitForSelector('.question-container');
    });

    // Step 7: 오디오 문제 처리
    await test.step('발음 및 듣기 문제 완료', async () => {
      // 오디오 재생 버튼이 있는 문제
      await page.waitForSelector('.audio-question');

      const playButton = page.locator('.audio-play-button');
      await playButton.click();

      // 오디오 재생 후 선택
      await page.waitForTimeout(3000); // 오디오 재생 시간
      await page.click('.option[data-audio-answer="correct"]');
      await nextQuestionButton.click();
    });

    // Step 8: 종교 관련 어휘 문제 (B1 수준)
    await test.step('종교 어휘 이해도 평가', async () => {
      await expect(page.locator('.difficulty-indicator')).toContainText('B1');
      await expect(page.locator('.question-text')).toContainText('기도');

      // 종교 용어 매칭 문제
      await page.dragAndDrop('.hungarian-word[data-word="imádság"]', '.korean-word[data-word="기도"]');
      await page.dragAndDrop('.hungarian-word[data-word="egyház"]', '.korean-word[data-word="교회"]');

      await nextQuestionButton.click();
    });

    // Step 9: 평가 완료 및 결과 확인
    await test.step('평가 완료 및 결과 페이지 확인', async () => {
      // 마지막 문제 완료
      await expect(page.locator('.progress-indicator')).toContainText('20 / 20');

      const finishButton = page.locator('button', { hasText: '평가 완료' });
      await finishButton.click();

      // 결과 페이지 로딩 대기
      await page.waitForURL(/.*\/assessment\/results.*/);
      await expect(page.locator('h2')).toContainText('평가 결과');

      // 결과 정보 검증
      await expect(page.locator('.final-level')).toContainText(/A[12]|B[12]/); // A1, A2, B1, B2 중 하나
      await expect(page.locator('.confidence-score')).toBeVisible();
      await expect(page.locator('.detailed-scores')).toBeVisible();

      // 상세 점수 확인
      await expect(page.locator('.score-vocabulary')).toBeVisible();
      await expect(page.locator('.score-grammar')).toBeVisible();
      await expect(page.locator('.score-listening')).toBeVisible();
      await expect(page.locator('.score-cultural')).toBeVisible();
    });

    // Step 10: 개인화된 학습 경로 생성 확인
    await test.step('맞춤형 학습 경로 생성 및 표시', async () => {
      const generatePathButton = page.locator('button', { hasText: '학습 계획 생성' });
      await generatePathButton.click();

      // 학습 경로 생성 대기 (로딩 인디케이터 확인)
      await expect(page.locator('.generating-indicator')).toContainText('개인 맞춤 학습 경로를 생성하고 있습니다');

      // 생성 완료 후 학습 경로 페이지로 이동
      await page.waitForURL(/.*\/learning-path.*/);
      await expect(page.locator('h2')).toContainText('김목사님의 헝가리어 학습 여정');

      // 학습 경로 구성 요소 확인
      await expect(page.locator('.total-duration')).toContainText(/\d+주/);
      await expect(page.locator('.phase-cards')).toHaveCount(4); // A1, A2, B1, B2 단계

      // 각 단계별 정보 확인
      const phaseCards = page.locator('.phase-card');

      await expect(phaseCards.nth(0)).toContainText('A1');
      await expect(phaseCards.nth(0)).toContainText('기초');
      await expect(phaseCards.nth(0)).toContainText('알파벳');

      await expect(phaseCards.nth(3)).toContainText('B2');
      await expect(phaseCards.nth(3)).toContainText('설교');
      await expect(phaseCards.nth(3)).toContainText('고급');
    });

    // Step 11: 학습 시작 확인
    await test.step('첫 번째 학습 모듈 시작', async () => {
      const startLearningButton = page.locator('button', { hasText: '학습 시작하기' });
      await startLearningButton.click();

      // 첫 번째 모듈로 이동
      await page.waitForURL(/.*\/learn\/module\/.*/);
      await expect(page.locator('h3')).toContainText(/알파벳|발음|기초/);

      // 학습 콘텐츠 확인
      await expect(page.locator('.lesson-content')).toBeVisible();
      await expect(page.locator('.progress-sidebar')).toBeVisible();
      await expect(page.locator('.next-lesson-button')).toBeVisible();
    });
  });

  test('기존 사용자의 재평가 플로우', async ({ page }) => {
    // 이미 계정이 있는 사용자의 로그인 및 재평가
    await test.step('기존 사용자 로그인', async () => {
      await page.click('button', { hasText: '로그인' });
      await page.fill('input[name="email"]', 'existing@test.church');
      await page.fill('input[name="password"]', 'ExistingPass123!');
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/.*\/dashboard.*/);
    });

    await test.step('레벨 재평가 요청', async () => {
      await page.click('button', { hasText: '레벨 재평가' });
      await expect(page.locator('.reassessment-warning')).toContainText('이전 학습 진도가 초기화');

      await page.click('button', { hasText: '재평가 진행' });
    });

    await test.step('빠른 재평가 모드 확인', async () => {
      // 재평가는 더 적은 문제로 진행
      await expect(page.locator('.progress-indicator')).toContainText('/ 10'); // 10문제
      await expect(page.locator('.assessment-mode')).toContainText('재평가');
    });
  });

  test('평가 중단 및 재개 기능', async ({ page }) => {
    await test.step('평가 진행 중 일시정지', async () => {
      // 평가 시작 후 몇 문제 진행
      await page.goto('/assessment');
      await page.click('button', { hasText: '평가 시작' });

      // 5문제 정도 진행
      for (let i = 0; i < 5; i++) {
        await page.click('.option:first-child');
        await page.click('button', { hasText: '다음 문제' });
      }

      // 일시정지 버튼 클릭
      await page.click('button', { hasText: '일시정지' });
      await expect(page.locator('.pause-dialog')).toContainText('나중에 이어서');

      await page.click('button', { hasText: '진도 저장 후 종료' });
    });

    await test.step('평가 재개', async () => {
      // 대시보드에서 미완료 평가 확인
      await page.goto('/dashboard');
      await expect(page.locator('.incomplete-assessment')).toBeVisible();

      await page.click('button', { hasText: '평가 이어서 하기' });

      // 저장된 진도에서 재개 확인
      await expect(page.locator('.progress-indicator')).toContainText('6 /');
    });
  });

  test('접근성 및 모바일 반응형 검증', async ({ page }) => {
    await test.step('키보드 네비게이션 테스트', async () => {
      await page.goto('/assessment');

      // Tab 키로 네비게이션
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // 평가 시작

      // 문제에서 방향키로 옵션 선택
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
    });

    await test.step('모바일 뷰포트에서 평가 진행', async () => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone 크기

      await page.goto('/assessment');

      // 모바일에서 UI 요소들이 적절히 표시되는지 확인
      await expect(page.locator('.question-container')).toBeVisible();
      await expect(page.locator('.mobile-progress-bar')).toBeVisible();
      await expect(page.locator('.option-button')).toHaveCSS('min-height', '44px'); // 터치 친화적
    });
  });

  test('오류 상황 처리', async ({ page }) => {
    await test.step('네트워크 오류 시 복구', async () => {
      // 평가 중 네트워크 중단 시뮬레이션
      await page.route('**/api/assessment/**', route => route.abort());

      await page.goto('/assessment');
      await page.click('button', { hasText: '평가 시작' });

      // 오류 메시지 확인
      await expect(page.locator('.error-message')).toContainText('연결 문제');

      // 재시도 버튼
      await page.unroute('**/api/assessment/**'); // 네트워크 복구
      await page.click('button', { hasText: '재시도' });

      await expect(page.locator('.question-container')).toBeVisible();
    });

    await test.step('잘못된 입력 처리', async () => {
      await page.goto('/assessment');

      // 빈 답안 제출 시도
      await page.click('button', { hasText: '다음 문제' });
      await expect(page.locator('.validation-error')).toContainText('답을 선택');
    });
  });
});