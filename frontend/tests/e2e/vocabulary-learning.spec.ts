import { test, expect } from '@playwright/test';

/**
 * 어휘 학습 플로우 E2E 테스트
 *
 * T084 - 헝가리어 학습 플랫폼의 어휘 학습 전체 플로우 End-to-End 테스트
 * 대시보드 → 어휘 게임 → 학습 진도 추적 → 리더보드까지의 완전한 워크플로우 검증
 */

test.describe('헝가리어 어휘 학습 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 시작 전 대시보드로 이동
    await page.goto('/dashboard');

    // 대시보드 로딩 대기
    await expect(page).toHaveTitle(/Hungarian Pro/);
    await expect(page.locator('h1')).toContainText('Hungarian Pro');
  });

  test('완전한 어휘 학습 세션 - 게임 플레이부터 진도 추적까지', async ({ page }) => {
    // Step 1: 대시보드에서 어휘 학습 게임 시작
    await test.step('대시보드에서 어휘 매칭 게임 접근', async () => {
      // 어휘 학습 섹션 확인
      await expect(page.locator('.vocabulary-section, [data-testid="vocabulary-section"]')).toBeVisible();

      // 어휘 매칭 게임 시작 버튼 클릭
      const vocabularyGameButton = page.locator('button', { hasText: /어휘.*게임|Vocabulary.*Game|매칭.*게임/ })
        .or(page.locator('[data-testid="vocabulary-match-game-button"]'));

      await expect(vocabularyGameButton).toBeVisible();
      await vocabularyGameButton.click();

      // 게임 페이지로 이동 확인
      await expect(page).toHaveURL(/.*vocabulary.*game|.*game.*vocabulary.*/);
    });

    // Step 2: 게임 설정 및 초기화
    await test.step('어휘 매칭 게임 설정', async () => {
      await expect(page.locator('h1, h2')).toContainText(/어휘.*매칭|Vocabulary.*Match/);

      // 난이도 선택
      const difficultySelector = page.locator('[data-testid="difficulty-selector"]')
        .or(page.locator('select[name="difficulty"]'))
        .or(page.locator('.difficulty-button[data-level="A1"]'));

      if (await difficultySelector.isVisible()) {
        if (await difficultySelector.getAttribute('tagName') === 'SELECT') {
          await difficultySelector.selectOption('A1');
        } else {
          await difficultySelector.click();
        }
      }

      // 카테고리 선택 (일상생활)
      const categorySelector = page.locator('[data-testid="category-selector"]')
        .or(page.locator('button', { hasText: /일상생활|daily_life/ }));

      if (await categorySelector.isVisible()) {
        await categorySelector.click();
      }

      // 게임 시작
      const startGameButton = page.locator('button', { hasText: /게임.*시작|Start.*Game/ })
        .or(page.locator('[data-testid="start-game-button"]'));

      await expect(startGameButton).toBeVisible();
      await startGameButton.click();

      // 게임 보드 로딩 확인
      await expect(page.locator('.game-board, [data-testid="game-board"]')).toBeVisible();
    });

    // Step 3: 실제 게임 플레이 - 카드 매칭
    await test.step('어휘 카드 매칭 게임 플레이', async () => {
      // 게임 카드들이 표시되는지 확인
      await expect(page.locator('.game-card, [data-testid^="game-card"]')).toHaveCount(12, { timeout: 10000 });

      // 점수 표시 확인
      await expect(page.locator('.score-display, [data-testid="score"]')).toBeVisible();
      await expect(page.locator('.timer, [data-testid="timer"]')).toBeVisible();

      // 첫 번째 매칭 시도
      const hungarianCards = page.locator('[data-testid^="hungarian-card"], .hungarian-card');
      const koreanCards = page.locator('[data-testid^="korean-card"], .korean-card');

      if (await hungarianCards.count() > 0 && await koreanCards.count() > 0) {
        // 첫 번째 헝가리어 카드 클릭
        await hungarianCards.first().click();
        await expect(hungarianCards.first()).toHaveClass(/selected|active|flipped/);

        // 대응하는 한국어 카드 찾기 및 클릭 (ház -> 집)
        const targetKoreanCard = koreanCards.filter({ hasText: '집' })
          .or(koreanCards.locator('[data-korean="집"]'));

        if (await targetKoreanCard.count() > 0) {
          await targetKoreanCard.first().click();

          // 매칭 성공 확인
          await expect(page.locator('.match-success, .correct-match')).toBeVisible({ timeout: 3000 });

          // 점수 증가 확인
          const scoreText = await page.locator('.score-display, [data-testid="score"]').textContent();
          expect(scoreText).toMatch(/\d+/);
        }
      }

      // 추가 매칭 시도 (최소 3개 매칭 완료)
      for (let i = 0; i < 2; i++) {
        // 남은 카드들로 매칭 시도
        const remainingHungarianCards = hungarianCards.filter(':not(.matched):not(.completed)');
        const remainingKoreanCards = koreanCards.filter(':not(.matched):not(.completed)');

        if (await remainingHungarianCards.count() > 0 && await remainingKoreanCards.count() > 0) {
          await remainingHungarianCards.first().click();
          await remainingKoreanCards.first().click();

          // 결과 대기 (성공 또는 실패)
          await page.waitForTimeout(1500);
        }
      }
    });

    // Step 4: 스트릭 및 보너스 시스템 확인
    await test.step('연속 성공 스트릭 및 보너스 시스템 검증', async () => {
      // 스트릭 카운터 확인
      const streakDisplay = page.locator('.streak-counter, [data-testid="streak"]');
      if (await streakDisplay.isVisible()) {
        const streakValue = await streakDisplay.textContent();
        expect(streakValue).toMatch(/\d+/);
      }

      // 보너스 포인트 알림 확인
      const bonusNotification = page.locator('.bonus-notification, .streak-bonus');
      if (await bonusNotification.isVisible()) {
        await expect(bonusNotification).toContainText(/보너스|bonus/i);
      }

      // 시간 보너스 확인
      const timeBonus = page.locator('.time-bonus');
      if (await timeBonus.isVisible()) {
        await expect(timeBonus).toContainText(/빠른|시간|time/i);
      }
    });

    // Step 5: 게임 완료 및 결과 확인
    await test.step('게임 완료 및 성과 확인', async () => {
      // 게임 완료까지 대기 (모든 카드 매칭 완료 또는 시간 종료)
      await page.waitForSelector('.game-completed, .game-over, [data-testid="game-result"]', { timeout: 30000 });

      // 최종 점수 확인
      const finalScore = page.locator('.final-score, [data-testid="final-score"]');
      await expect(finalScore).toBeVisible();

      const scoreText = await finalScore.textContent();
      const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
      expect(score).toBeGreaterThan(0);

      // 게임 통계 확인
      await expect(page.locator('.matches-completed, [data-testid="matches-completed"]')).toBeVisible();
      await expect(page.locator('.accuracy-rate, [data-testid="accuracy"]')).toBeVisible();

      // 경험치 및 레벨 업 확인
      const expGained = page.locator('.exp-gained, [data-testid="exp-gained"]');
      if (await expGained.isVisible()) {
        const expText = await expGained.textContent();
        expect(expText).toMatch(/\d+.*경험치|exp/i);
      }

      // 레벨업 확인 (해당하는 경우)
      const levelUpNotification = page.locator('.level-up, [data-testid="level-up"]');
      if (await levelUpNotification.isVisible()) {
        await expect(levelUpNotification).toContainText(/레벨.*업|level.*up/i);
      }
    });

    // Step 6: 배지 및 성취 확인
    await test.step('새로운 배지 및 성취 획득 확인', async () => {
      // 새로운 배지 획득 알림
      const badgeEarned = page.locator('.badge-earned, [data-testid="badge-earned"]');
      if (await badgeEarned.isVisible()) {
        await expect(badgeEarned).toContainText(/배지|badge/i);

        // 배지 정보 확인
        const badgeName = page.locator('.badge-name, [data-testid="badge-name"]');
        if (await badgeName.isVisible()) {
          const badgeText = await badgeName.textContent();
          expect(badgeText).toBeTruthy();
        }
      }

      // 성취 목록 확인
      const achievementList = page.locator('.achievement-list, [data-testid="achievements"]');
      if (await achievementList.isVisible()) {
        const achievementCount = await achievementList.locator('.achievement-item').count();
        expect(achievementCount).toBeGreaterThan(0);
      }
    });

    // Step 7: 다시 하기 기능
    await test.step('게임 재시작 및 설정 변경', async () => {
      // 다시 하기 버튼
      const playAgainButton = page.locator('button', { hasText: /다시.*하기|Play.*Again/ })
        .or(page.locator('[data-testid="play-again-button"]'));

      if (await playAgainButton.isVisible()) {
        await playAgainButton.click();

        // 게임 설정 화면으로 돌아가는지 확인
        await expect(page.locator('.game-settings, [data-testid="game-settings"]')).toBeVisible();

        // 더 높은 난이도로 변경
        const difficultyA2 = page.locator('.difficulty-button[data-level="A2"]')
          .or(page.locator('option[value="A2"]'))
          .or(page.locator('button', { hasText: 'A2' }));

        if (await difficultyA2.isVisible()) {
          await difficultyA2.click();
        }
      }
    });
  });

  test('어휘 학습 진도 추적 및 분석', async ({ page }) => {
    // Step 1: 학습 분석 페이지 접근
    await test.step('학습 분석 대시보드 접근', async () => {
      // 네비게이션에서 학습 분석 클릭
      const analyticsLink = page.locator('a[href*="analytics"], a[href*="progress"]')
        .or(page.locator('button', { hasText: /분석|진도|Progress|Analytics/ }));

      if (await analyticsLink.isVisible()) {
        await analyticsLink.click();
        await page.waitForURL(/.*analytics|.*progress.*/);
      } else {
        // 직접 URL로 접근
        await page.goto('/analytics');
      }
    });

    // Step 2: 어휘 학습 통계 확인
    await test.step('어휘 학습 통계 및 차트 확인', async () => {
      // 전체 학습한 어휘 수
      const totalVocabulary = page.locator('[data-testid="total-vocabulary"], .total-vocabulary');
      if (await totalVocabulary.isVisible()) {
        const vocabText = await totalVocabulary.textContent();
        expect(vocabText).toMatch(/\d+/);
      }

      // 어휘 숙련도 차트
      const vocabularyChart = page.locator('.vocabulary-chart, [data-testid="vocabulary-progress-chart"]');
      if (await vocabularyChart.isVisible()) {
        await expect(vocabularyChart).toBeVisible();
      }

      // 카테고리별 진도
      const categoryProgress = page.locator('.category-progress, [data-testid="category-progress"]');
      if (await categoryProgress.isVisible()) {
        const categories = categoryProgress.locator('.category-item');
        const categoryCount = await categories.count();
        expect(categoryCount).toBeGreaterThan(0);
      }
    });

    // Step 3: 약한 영역 및 추천 확인
    await test.step('약한 영역 분석 및 개인화 추천', async () => {
      // 약한 영역 표시
      const weakAreas = page.locator('.weak-areas, [data-testid="weak-areas"]');
      if (await weakAreas.isVisible()) {
        const weakAreaItems = weakAreas.locator('.weak-area-item');
        if (await weakAreaItems.count() > 0) {
          // 첫 번째 약한 영역의 개선 추천 확인
          await expect(weakAreaItems.first()).toContainText(/.+/);

          // 추천 연습 버튼 확인
          const practiceRecommendation = weakAreaItems.first().locator('button', { hasText: /연습|Practice/ });
          if (await practiceRecommendation.isVisible()) {
            await expect(practiceRecommendation).toBeVisible();
          }
        }
      }

      // 개인화된 학습 추천
      const recommendations = page.locator('.recommendations, [data-testid="recommendations"]');
      if (await recommendations.isVisible()) {
        const recommendationItems = recommendations.locator('.recommendation-item');
        const recCount = await recommendationItems.count();
        expect(recCount).toBeGreaterThan(0);
      }
    });
  });

  test('소셜 기능 - 리더보드 및 친구 경쟁', async ({ page }) => {
    // Step 1: 리더보드 페이지 접근
    await test.step('리더보드 접근 및 랭킹 확인', async () => {
      // 리더보드 링크 클릭
      const leaderboardLink = page.locator('a[href*="leaderboard"], a[href*="ranking"]')
        .or(page.locator('button', { hasText: /리더보드|순위|Leaderboard|Ranking/ }));

      if (await leaderboardLink.isVisible()) {
        await leaderboardLink.click();
        await page.waitForURL(/.*leaderboard|.*ranking.*/);
      } else {
        await page.goto('/leaderboard');
      }

      // 리더보드 제목 확인
      await expect(page.locator('h1, h2')).toContainText(/리더보드|순위|Leaderboard|Ranking/);
    });

    // Step 2: 글로벌 랭킹 확인
    await test.step('글로벌 리더보드 및 개인 순위 확인', async () => {
      // 전체 리더보드 테이블
      const leaderboardTable = page.locator('.leaderboard-table, [data-testid="leaderboard-table"]');
      if (await leaderboardTable.isVisible()) {
        const leaderEntries = leaderboardTable.locator('.leader-entry, tr');
        const entryCount = await leaderEntries.count();
        expect(entryCount).toBeGreaterThan(0);

        // 1위 사용자 확인
        const topUser = leaderEntries.first();
        await expect(topUser).toContainText(/1|👑|🥇/);

        // 포인트/점수 확인
        await expect(topUser).toContainText(/\d+.*점|points/);
      }

      // 개인 순위 표시 확인
      const myRank = page.locator('.my-rank, [data-testid="my-rank"]');
      if (await myRank.isVisible()) {
        const rankText = await myRank.textContent();
        expect(rankText).toMatch(/\d+.*위|rank/i);
      }
    });

    // Step 3: 주간/월간 리더보드 전환
    await test.step('주간 및 월간 리더보드 전환', async () => {
      // 주간 탭 클릭
      const weeklyTab = page.locator('button', { hasText: /주간|Weekly/ })
        .or(page.locator('[data-testid="weekly-leaderboard-tab"]'));

      if (await weeklyTab.isVisible()) {
        await weeklyTab.click();
        await expect(page.locator('.leaderboard-period')).toContainText(/주간|Weekly/);

        // 주간 리더보드 데이터 확인
        const weeklyLeaders = page.locator('.leaderboard-table .leader-entry');
        if (await weeklyLeaders.count() > 0) {
          await expect(weeklyLeaders.first()).toBeVisible();
        }
      }

      // 월간 탭 클릭
      const monthlyTab = page.locator('button', { hasText: /월간|Monthly/ })
        .or(page.locator('[data-testid="monthly-leaderboard-tab"]'));

      if (await monthlyTab.isVisible()) {
        await monthlyTab.click();
        await expect(page.locator('.leaderboard-period')).toContainText(/월간|Monthly/);
      }
    });

    // Step 4: 친구 활동 및 경쟁 기능
    await test.step('친구 목록 및 경쟁 기능 확인', async () => {
      // 친구 탭 또는 섹션
      const friendsSection = page.locator('.friends-section, [data-testid="friends-section"]')
        .or(page.locator('button', { hasText: /친구|Friends/ }));

      if (await friendsSection.isVisible()) {
        await friendsSection.click();

        // 친구 목록 확인
        const friendsList = page.locator('.friends-list, [data-testid="friends-list"]');
        if (await friendsList.isVisible()) {
          const friendItems = friendsList.locator('.friend-item');
          if (await friendItems.count() > 0) {
            // 첫 번째 친구의 활동 정보 확인
            const firstFriend = friendItems.first();
            await expect(firstFriend).toContainText(/.+/); // 이름이 있는지 확인

            // 친구와 경쟁하기 버튼
            const challengeFriend = firstFriend.locator('button', { hasText: /도전|Challenge/ });
            if (await challengeFriend.isVisible()) {
              await expect(challengeFriend).toBeVisible();
            }
          }
        }
      }

      // 경쟁 이벤트 확인
      const competitionEvents = page.locator('.competition-events, [data-testid="competitions"]');
      if (await competitionEvents.isVisible()) {
        const eventItems = competitionEvents.locator('.event-item');
        if (await eventItems.count() > 0) {
          // 참가 중인 경쟁 확인
          await expect(eventItems.first()).toContainText(/경쟁|Competition|이벤트|Event/);
        }
      }
    });
  });

  test('어휘 학습 오류 처리 및 복구', async ({ page }) => {
    // Step 1: 네트워크 오류 시나리오
    await test.step('네트워크 오류 시 게임 상태 유지', async () => {
      // 어휘 게임 시작
      await page.goto('/vocabulary-game');

      // 게임 시작 후 네트워크 차단
      await page.route('**/api/vocabulary/**', route => route.abort());
      await page.route('**/api/game/**', route => route.abort());

      // 게임 플레이 시도
      const gameCard = page.locator('.game-card').first();
      if (await gameCard.isVisible()) {
        await gameCard.click();
      }

      // 오류 메시지 확인
      const errorMessage = page.locator('.error-message, .network-error, [data-testid="error-message"]');
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
      await expect(errorMessage).toContainText(/네트워크|연결|오류|error|connection/i);

      // 재시도 버튼 확인
      const retryButton = page.locator('button', { hasText: /재시도|다시|Retry/ });
      if (await retryButton.isVisible()) {
        // 네트워크 복구
        await page.unroute('**/api/vocabulary/**');
        await page.unroute('**/api/game/**');

        // 재시도 실행
        await retryButton.click();

        // 게임이 정상 복구되는지 확인
        await expect(page.locator('.game-board')).toBeVisible({ timeout: 10000 });
      }
    });

    // Step 2: 로컬 저장 및 복구
    await test.step('게임 진행 상황 로컬 저장 및 복구', async () => {
      // 게임 중간에 페이지 새로고침
      await page.reload();

      // 게임 복구 확인
      const resumeDialog = page.locator('.resume-game, [data-testid="resume-game"]');
      if (await resumeDialog.isVisible()) {
        await expect(resumeDialog).toContainText(/계속|이어서|Resume|Continue/i);

        // 게임 이어하기
        const continueButton = resumeDialog.locator('button', { hasText: /계속|이어서|Continue/ });
        if (await continueButton.isVisible()) {
          await continueButton.click();
          await expect(page.locator('.game-board')).toBeVisible();
        }
      }
    });
  });

  test('접근성 및 반응형 디자인 검증', async ({ page }) => {
    // Step 1: 키보드 네비게이션
    await test.step('키보드만으로 게임 플레이', async () => {
      await page.goto('/vocabulary-game');

      // Tab 키로 네비게이션
      await page.keyboard.press('Tab'); // 시작 버튼으로
      await page.keyboard.press('Tab'); // 설정으로
      await page.keyboard.press('Enter'); // 게임 시작

      await expect(page.locator('.game-board')).toBeVisible();

      // 방향키로 카드 선택
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter'); // 카드 선택

      // 선택된 카드가 하이라이트되는지 확인
      await expect(page.locator('.game-card.selected, .game-card:focus')).toBeVisible();
    });

    // Step 2: 모바일 반응형 테스트
    await test.step('모바일 뷰포트에서 게임 플레이', async () => {
      // 모바일 화면 크기로 변경
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/vocabulary-game');

      // 모바일에서 게임 요소들이 적절히 표시되는지 확인
      const gameCards = page.locator('.game-card');
      if (await gameCards.count() > 0) {
        // 카드 크기가 터치 친화적인지 확인
        const cardBox = await gameCards.first().boundingBox();
        if (cardBox) {
          expect(cardBox.height).toBeGreaterThanOrEqual(44); // 최소 터치 타겟 크기
          expect(cardBox.width).toBeGreaterThanOrEqual(44);
        }
      }

      // 모바일 네비게이션 확인
      const mobileNav = page.locator('.mobile-nav, .hamburger-menu');
      if (await mobileNav.isVisible()) {
        await expect(mobileNav).toBeVisible();
      }

      // 스크롤 가능한 콘텐츠 확인
      const gameBoard = page.locator('.game-board');
      if (await gameBoard.isVisible()) {
        const boardBox = await gameBoard.boundingBox();
        if (boardBox) {
          expect(boardBox.width).toBeLessThanOrEqual(375);
        }
      }
    });

    // Step 3: 고대비 모드 및 색맹 접근성
    await test.step('색상 접근성 및 고대비 모드', async () => {
      // 고대비 모드 시뮬레이션
      await page.emulateMedia({ colorScheme: 'dark' });

      await page.goto('/vocabulary-game');

      // 다크 모드에서 텍스트 가독성 확인
      const gameCard = page.locator('.game-card').first();
      if (await gameCard.isVisible()) {
        await expect(gameCard).toHaveCSS('color', /.+/);
        await expect(gameCard).toHaveCSS('background-color', /.+/);
      }

      // 색상 외 추가 시각적 피드백 확인
      await gameCard.click();

      // 선택 상태가 색상 외에도 표시되는지 확인 (테두리, 아이콘 등)
      await expect(gameCard).toHaveClass(/selected|active|highlighted/);
    });
  });
});