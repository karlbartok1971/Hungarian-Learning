// Analytics Dashboard E2E 테스트
// Hungarian Learning Platform - Analytics Dashboard End-to-End Tests
// T105 [P] [US5] E2E test for analytics dashboard

import { test, expect, Page } from '@playwright/test';

test.describe('Analytics Dashboard E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;

    // 테스트용 사용자로 로그인
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'analytics.e2e.test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');

    // 로그인 성공 대기
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test.describe('Dashboard Navigation and Layout', () => {
    test('should navigate to analytics dashboard and display main sections', async () => {
      // Analytics 페이지로 이동
      await page.click('[data-testid="analytics-nav-link"]');
      await expect(page).toHaveURL(/\/analytics/);

      // 메인 섹션들이 표시되는지 확인
      await expect(page.locator('[data-testid="overall-progress-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="skill-breakdown-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="learning-patterns-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="weakness-analysis-section"]')).toBeVisible();

      // 헤더 제목 확인
      await expect(page.locator('h1')).toContainText('학습 분석');
    });

    test('should show loading states initially and then display data', async () => {
      await page.goto('/analytics');

      // 로딩 스피너 확인
      await expect(page.locator('[data-testid="analytics-loading"]')).toBeVisible();

      // 데이터 로딩 완료 후 로딩 상태가 사라지는지 확인
      await page.waitForSelector('[data-testid="analytics-loading"]', { state: 'hidden' });

      // 실제 데이터 표시 확인
      await expect(page.locator('[data-testid="overall-progress-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="progress-chart"]')).toBeVisible();
    });

    test('should be responsive on different screen sizes', async () => {
      await page.goto('/analytics');
      await page.waitForLoadState('networkidle');

      // 데스크톱 뷰 테스트
      await page.setViewportSize({ width: 1200, height: 800 });
      await expect(page.locator('[data-testid="analytics-grid"]')).toHaveClass(/grid-cols-3/);

      // 태블릿 뷰 테스트
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('[data-testid="analytics-grid"]')).toHaveClass(/grid-cols-2/);

      // 모바일 뷰 테스트
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('[data-testid="analytics-grid"]')).toHaveClass(/grid-cols-1/);
    });
  });

  test.describe('Overall Progress Display', () => {
    test('should display accurate overall progress metrics', async () => {
      await page.goto('/analytics');
      await page.waitForSelector('[data-testid="overall-progress-card"]');

      // 주요 메트릭 확인
      const totalStudyTime = await page.locator('[data-testid="total-study-time"]').textContent();
      const currentLevel = await page.locator('[data-testid="current-level"]').textContent();
      const studyStreak = await page.locator('[data-testid="study-streak"]').textContent();
      const overallAccuracy = await page.locator('[data-testid="overall-accuracy"]').textContent();

      expect(totalStudyTime).toMatch(/\d+/); // 숫자 포함
      expect(currentLevel).toMatch(/^[ABC][12]$/); // CEFR 레벨 형식
      expect(studyStreak).toMatch(/\d+/); // 연속 학습 일수
      expect(overallAccuracy).toMatch(/\d+%/); // 퍼센트 형식

      // 진도 바 확인
      const progressBar = page.locator('[data-testid="level-progress-bar"]');
      await expect(progressBar).toBeVisible();

      const progressPercentage = await progressBar.getAttribute('aria-valuenow');
      expect(Number(progressPercentage)).toBeGreaterThanOrEqual(0);
      expect(Number(progressPercentage)).toBeLessThanOrEqual(100);
    });

    test('should update progress when time period is changed', async () => {
      await page.goto('/analytics');
      await page.waitForLoadState('networkidle');

      // 초기 데이터 저장
      const initialStudyTime = await page.locator('[data-testid="total-study-time"]').textContent();

      // 시간 범위 변경
      await page.click('[data-testid="time-period-dropdown"]');
      await page.click('[data-testid="time-period-30d"]');
      await page.waitForLoadState('networkidle');

      // 데이터가 업데이트되었는지 확인
      await page.waitForFunction(
        (initial) => {
          const current = document.querySelector('[data-testid="total-study-time"]')?.textContent;
          return current !== initial;
        },
        initialStudyTime
      );

      // 새로운 데이터 확인
      const updatedStudyTime = await page.locator('[data-testid="total-study-time"]').textContent();
      expect(updatedStudyTime).not.toBe(initialStudyTime);
    });
  });

  test.describe('Skill Breakdown Analysis', () => {
    test('should display detailed skill performance with charts', async () => {
      await page.goto('/analytics');
      await page.waitForSelector('[data-testid="skill-breakdown-section"]');

      // 각 스킬 카드 확인
      const skills = ['vocabulary', 'pronunciation', 'grammar'];

      for (const skill of skills) {
        const skillCard = page.locator(`[data-testid="${skill}-skill-card"]`);
        await expect(skillCard).toBeVisible();

        // 스킬별 메트릭 확인
        await expect(skillCard.locator('[data-testid="skill-level"]')).toBeVisible();
        await expect(skillCard.locator('[data-testid="skill-progress"]')).toBeVisible();
        await expect(skillCard.locator('[data-testid="skill-accuracy"]')).toBeVisible();

        // 차트 확인
        await expect(skillCard.locator('[data-testid="skill-chart"]')).toBeVisible();
      }

      // 레이더 차트 확인 (전체 스킬 비교)
      await expect(page.locator('[data-testid="skills-radar-chart"]')).toBeVisible();
    });

    test('should show skill-specific recommendations', async () => {
      await page.goto('/analytics');
      await page.waitForSelector('[data-testid="skill-breakdown-section"]');

      // 가장 약한 스킬 클릭
      await page.click('[data-testid="weakest-skill-card"]');

      // 추천사항 모달/섹션 확인
      await expect(page.locator('[data-testid="skill-recommendations"]')).toBeVisible();
      await expect(page.locator('[data-testid="practice-suggestions"]')).toBeVisible();
      await expect(page.locator('[data-testid="improvement-tips"]')).toBeVisible();

      // 실행 가능한 액션 확인
      const actionButtons = page.locator('[data-testid="action-button"]');
      await expect(actionButtons.first()).toBeVisible();

      // "연습 시작" 버튼 클릭
      await page.click('[data-testid="start-practice-button"]');
      await expect(page).toHaveURL(/\/practice/);
    });
  });

  test.describe('Learning Patterns Visualization', () => {
    test('should display study patterns with interactive charts', async () => {
      await page.goto('/analytics');
      await page.waitForSelector('[data-testid="learning-patterns-section"]');

      // 시간대별 성과 차트 확인
      await expect(page.locator('[data-testid="hourly-performance-chart"]')).toBeVisible();

      // 차트 인터랙션 테스트
      await page.hover('[data-testid="hourly-performance-chart"] .recharts-bar');
      await expect(page.locator('[data-testid="chart-tooltip"]')).toBeVisible();

      // 주간 패턴 차트 확인
      await expect(page.locator('[data-testid="weekly-pattern-chart"]')).toBeVisible();

      // 세션 길이 분포 확인
      await expect(page.locator('[data-testid="session-length-chart"]')).toBeVisible();

      // 최적 학습 시간 추천 확인
      const optimalTimes = page.locator('[data-testid="optimal-study-times"]');
      await expect(optimalTimes).toBeVisible();
      await expect(optimalTimes.locator('[data-testid="time-recommendation"]')).toHaveCount(3);
    });

    test('should filter patterns by date range', async () => {
      await page.goto('/analytics');
      await page.waitForSelector('[data-testid="learning-patterns-section"]');

      // 날짜 범위 선택기 확인
      await page.click('[data-testid="date-range-picker"]');
      await page.click('[data-testid="last-30-days-option"]');

      // 차트 업데이트 대기
      await page.waitForLoadState('networkidle');

      // 차트가 업데이트되었는지 확인
      await expect(page.locator('[data-testid="pattern-chart-updated"]')).toBeVisible();

      // 사용자 정의 날짜 범위 테스트
      await page.click('[data-testid="date-range-picker"]');
      await page.click('[data-testid="custom-range-option"]');

      await page.fill('[data-testid="start-date-input"]', '2024-01-01');
      await page.fill('[data-testid="end-date-input"]', '2024-01-31');
      await page.click('[data-testid="apply-date-range"]');

      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-testid="custom-range-applied"]')).toBeVisible();
    });
  });

  test.describe('Weakness Analysis and Recommendations', () => {
    test('should identify and display learning weaknesses', async () => {
      await page.goto('/analytics');
      await page.waitForSelector('[data-testid="weakness-analysis-section"]');

      // 약점 목록 확인
      const weaknessList = page.locator('[data-testid="weaknesses-list"]');
      await expect(weaknessList).toBeVisible();

      // 각 약점 항목 확인
      const weaknessItems = weaknessList.locator('[data-testid="weakness-item"]');
      await expect(weaknessItems).toHaveCountGreaterThan(0);

      // 첫 번째 약점 항목의 구성 요소 확인
      const firstWeakness = weaknessItems.first();
      await expect(firstWeakness.locator('[data-testid="weakness-category"]')).toBeVisible();
      await expect(firstWeakness.locator('[data-testid="severity-indicator"]')).toBeVisible();
      await expect(firstWeakness.locator('[data-testid="confidence-score"]')).toBeVisible();

      // 심각도 색상 확인
      const severityIndicator = firstWeakness.locator('[data-testid="severity-indicator"]');
      const severityClass = await severityIndicator.getAttribute('class');
      expect(severityClass).toMatch(/(critical|high|medium|low)/);
    });

    test('should provide actionable recommendations for weaknesses', async () => {
      await page.goto('/analytics');
      await page.waitForSelector('[data-testid="weakness-analysis-section"]');

      // 약점 항목 클릭
      await page.click('[data-testid="weakness-item"]:first-child');

      // 상세 분석 확인
      await expect(page.locator('[data-testid="weakness-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="specific-areas"]')).toBeVisible();
      await expect(page.locator('[data-testid="recommended-actions"]')).toBeVisible();

      // 추천 액션들 확인
      const recommendations = page.locator('[data-testid="recommendation-item"]');
      await expect(recommendations).toHaveCountGreaterThan(0);

      // 추천 우선순위 확인
      const firstRecommendation = recommendations.first();
      await expect(firstRecommendation.locator('[data-testid="priority-badge"]')).toBeVisible();
      await expect(firstRecommendation.locator('[data-testid="estimated-benefit"]')).toBeVisible();
      await expect(firstRecommendation.locator('[data-testid="time-investment"]')).toBeVisible();

      // 추천 액션 실행
      await page.click('[data-testid="implement-recommendation"]:first-child');
      await expect(page.locator('[data-testid="action-confirmation"]')).toBeVisible();
    });

    test('should compare progress with peers anonymously', async () => {
      await page.goto('/analytics');
      await page.waitForSelector('[data-testid="weakness-analysis-section"]');

      // 동료 비교 섹션으로 스크롤
      await page.scrollIntoViewIfNeeded('[data-testid="peer-comparison-section"]');
      await expect(page.locator('[data-testid="peer-comparison-section"]')).toBeVisible();

      // 비교 차트 확인
      await expect(page.locator('[data-testid="peer-comparison-chart"]')).toBeVisible();

      // 백분위수 표시 확인
      const percentileCards = page.locator('[data-testid="percentile-card"]');
      await expect(percentileCards).toHaveCountGreaterThan(0);

      // 개인정보 보호 알림 확인
      await expect(page.locator('[data-testid="privacy-notice"]')).toBeVisible();
      await expect(page.locator('[data-testid="privacy-notice"]')).toContainText('익명');
    });
  });

  test.describe('Progress Prediction and Forecasting', () => {
    test('should display realistic progress predictions', async () => {
      await page.goto('/analytics');
      await page.waitForSelector('[data-testid="progress-prediction-section"]');

      // 목표 설정 인터페이스 확인
      await page.click('[data-testid="set-learning-goal"]');
      await expect(page.locator('[data-testid="goal-setting-modal"]')).toBeVisible();

      // 목표 레벨 선택
      await page.click('[data-testid="target-level-b1"]');
      await page.click('[data-testid="timeframe-6months"]');
      await page.click('[data-testid="calculate-prediction"]');

      // 예측 결과 확인
      await page.waitForSelector('[data-testid="prediction-results"]');
      await expect(page.locator('[data-testid="achievement-probability"]')).toBeVisible();
      await expect(page.locator('[data-testid="estimated-completion"]')).toBeVisible();
      await expect(page.locator('[data-testid="confidence-interval"]')).toBeVisible();

      // 시나리오별 예측 확인
      const scenarios = page.locator('[data-testid="prediction-scenario"]');
      await expect(scenarios).toHaveCount(3); // conservative, moderate, intensive

      // 각 시나리오 확인
      for (let i = 0; i < 3; i++) {
        const scenario = scenarios.nth(i);
        await expect(scenario.locator('[data-testid="scenario-name"]')).toBeVisible();
        await expect(scenario.locator('[data-testid="study-intensity"]')).toBeVisible();
        await expect(scenario.locator('[data-testid="success-probability"]')).toBeVisible();
      }
    });

    test('should provide milestone tracking', async () => {
      await page.goto('/analytics');
      await page.waitForSelector('[data-testid="progress-prediction-section"]');

      // 마일스톤 타임라인 확인
      await expect(page.locator('[data-testid="milestone-timeline"]')).toBeVisible();

      // 완료된 마일스톤 확인
      const completedMilestones = page.locator('[data-testid="completed-milestone"]');
      await expect(completedMilestones.first()).toBeVisible();

      // 다음 마일스톤 확인
      const nextMilestone = page.locator('[data-testid="next-milestone"]');
      await expect(nextMilestone).toBeVisible();
      await expect(nextMilestone.locator('[data-testid="milestone-progress"]')).toBeVisible();

      // 마일스톤 상세 정보
      await page.click('[data-testid="milestone-details-button"]');
      await expect(page.locator('[data-testid="milestone-requirements"]')).toBeVisible();
      await expect(page.locator('[data-testid="milestone-tips"]')).toBeVisible();
    });
  });

  test.describe('Export and Sharing Features', () => {
    test('should export analytics report in multiple formats', async () => {
      await page.goto('/analytics');
      await page.waitForLoadState('networkidle');

      // 내보내기 버튼 클릭
      await page.click('[data-testid="export-report-button"]');
      await expect(page.locator('[data-testid="export-options"]')).toBeVisible();

      // PDF 내보내기 테스트
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-pdf"]');
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toMatch(/analytics-report.*\.pdf/);
      expect(await download.path()).toBeTruthy();

      // CSV 데이터 내보내기 테스트
      const csvDownloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-csv"]');
      const csvDownload = await csvDownloadPromise;

      expect(csvDownload.suggestedFilename()).toMatch(/learning-data.*\.csv/);
    });

    test('should customize report content before export', async () => {
      await page.goto('/analytics');
      await page.waitForLoadState('networkidle');

      // 커스텀 리포트 생성
      await page.click('[data-testid="create-custom-report"]');
      await expect(page.locator('[data-testid="report-customization"]')).toBeVisible();

      // 리포트 섹션 선택
      await page.check('[data-testid="include-progress-overview"]');
      await page.check('[data-testid="include-skill-analysis"]');
      await page.uncheck('[data-testid="include-peer-comparison"]');

      // 날짜 범위 설정
      await page.fill('[data-testid="report-start-date"]', '2024-01-01');
      await page.fill('[data-testid="report-end-date"]', '2024-01-31');

      // 미리보기 생성
      await page.click('[data-testid="generate-preview"]');
      await expect(page.locator('[data-testid="report-preview"]')).toBeVisible();

      // 리포트 생성
      await page.click('[data-testid="generate-report"]');
      await expect(page.locator('[data-testid="report-generation-success"]')).toBeVisible();
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should load analytics data efficiently', async () => {
      const startTime = Date.now();

      await page.goto('/analytics');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3초 이내 로딩

      // 차트 렌더링 성능 확인
      await expect(page.locator('[data-testid="progress-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="skills-radar-chart"]')).toBeVisible();
    });

    test('should be accessible with keyboard navigation', async () => {
      await page.goto('/analytics');
      await page.waitForLoadState('networkidle');

      // 키보드로 탐색 테스트
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();

      // 스킬 카드 간 탐색
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // 포커스된 요소가 올바르게 표시되는지 확인
      await expect(page.locator(':focus')).toHaveAttribute('data-testid', /skill-card/);

      // ARIA 라벨 확인
      const chartElements = page.locator('[role="img"]');
      await expect(chartElements.first()).toHaveAttribute('aria-label');
    });

    test('should handle errors gracefully', async () => {
      // 네트워크 오류 시뮬레이션
      await page.route('**/api/analytics/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });

      await page.goto('/analytics');

      // 에러 상태 확인
      await expect(page.locator('[data-testid="analytics-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

      // 재시도 버튼 테스트
      await page.unroute('**/api/analytics/**'); // 라우트 복원
      await page.click('[data-testid="retry-button"]');

      // 성공적인 데이터 로딩 확인
      await expect(page.locator('[data-testid="analytics-error"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="overall-progress-card"]')).toBeVisible();
    });
  });
});