import { test, expect } from '@playwright/test';

/**
 * Sermon Writing Workflow E2E Tests
 *
 * 헝가리어 설교문 작성 지원 시스템의 전체 워크플로우 End-to-End 테스트
 * 로그인 → 주제 선택 → 개요 생성 → 작성 → 문법 검사 → 저장까지의 완전한 플로우 검증
 */

test.describe('헝가리어 설교문 작성 완전한 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 시작 전 로그인된 상태로 설정
    await page.goto('/login');

    // 테스트 목회자 계정으로 로그인
    await page.fill('input[name="email"]', 'pastor.test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // 로그인 완료 대기
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('주제부터 완성까지 - 완전한 설교문 작성 플로우', async ({ page }) => {

    // Step 1: 설교문 작성 페이지로 이동
    await test.step('설교문 작성 페이지 접근', async () => {
      await page.goto('/sermon/new');

      await expect(page.locator('h1')).toContainText('새 설교문 작성');
      await expect(page.locator('[data-testid="sermon-editor"]')).toBeVisible();
    });

    // Step 2: 설교 주제 및 성경 구절 입력
    await test.step('설교 주제와 성경 구절 설정', async () => {
      // 주제 입력
      const topicInput = page.locator('input[name="topic"]');
      await expect(topicInput).toBeVisible();
      await topicInput.fill('하나님의 무조건적 사랑');

      // 성경 구절 입력
      const scriptureInput = page.locator('input[name="scripture"]');
      await scriptureInput.fill('요한복음 3:16');

      // 설교 스타일 선택
      await page.selectOption('select[name="style"]', 'traditional');

      // 대상 회중 선택
      await page.selectOption('select[name="audience"]', 'general_congregation');

      // 설교 길이 선택
      await page.selectOption('select[name="duration"]', 'medium'); // 25분
    });

    // Step 3: AI 개요 생성
    await test.step('AI 기반 설교 개요 생성', async () => {
      const generateOutlineBtn = page.locator('button[data-testid="generate-outline"]');
      await expect(generateOutlineBtn).toBeVisible();
      await generateOutlineBtn.click();

      // 생성 중 로딩 표시 확인
      await expect(page.locator('[data-testid="outline-loading"]')).toBeVisible();

      // 개요 생성 완료 대기 (최대 30초)
      await expect(page.locator('[data-testid="generated-outline"]')).toBeVisible({ timeout: 30000 });

      // 생성된 개요 내용 확인
      const outline = page.locator('[data-testid="generated-outline"]');
      await expect(outline.locator('[data-testid="sermon-title"]')).toContainText('Hungarian');
      await expect(outline.locator('[data-testid="sermon-sections"]')).toBeVisible();

      // 최소 3개의 섹션이 있는지 확인
      const sections = outline.locator('[data-testid="outline-section"]');
      await expect(sections).toHaveCount(3, { timeout: 5000 });
    });

    // Step 4: 개요 수정 및 확정
    await test.step('생성된 개요 검토 및 수정', async () => {
      // 첫 번째 섹션 제목 수정
      const firstSectionTitle = page.locator('[data-testid="section-title"]:first-child');
      await firstSectionTitle.dblclick();
      await firstSectionTitle.fill('Bevezetés - Isten szeretetének jelentősége');

      // 수정사항 저장
      await page.click('button[data-testid="save-outline-changes"]');

      // 개요 확정
      const confirmOutlineBtn = page.locator('button[data-testid="confirm-outline"]');
      await confirmOutlineBtn.click();

      await expect(page.locator('[data-testid="writing-interface"]')).toBeVisible();
    });

    // Step 5: 설교문 본문 작성
    await test.step('설교문 본문 작성', async () => {
      // 서론 작성
      const introEditor = page.locator('[data-testid="introduction-editor"]');
      await introEditor.click();

      const introText = `Kedves testvérek! Ma egy különleges témáról szeretnék beszélni veletek:
      Isten végtelen és feltétel nélküli szeretetéről. János evangélium 3:16-ban olvassuk:
      "Mert úgy szerette Isten a világot, hogy egyszülött Fiát adta érte."`;

      await introEditor.fill(introText);

      // 본론 작성
      const bodyEditor = page.locator('[data-testid="body-editor"]');
      await bodyEditor.click();

      const bodyText = `Ez a vers mutatja nekünk Isten szeretetének három fontos jellemzőjét.
      Először is, Isten szeretete univerzális - az egész világra kiterjed.
      Másodszor, Isten szeretete önzetlen - a legnagyobb áldozatot hozta értünk.
      Harmadszor, Isten szeretete végtelen - soha nem fog elfogyni.`;

      await bodyEditor.fill(bodyText);

      // 결론 작성
      const conclusionEditor = page.locator('[data-testid="conclusion-editor"]');
      await conclusionEditor.click();

      const conclusionText = `Záró gondolatként hadd kérjem mindenkitől:
      fogadjuk el ezt a szeretetet, és osszuk meg másokkal is. Ámen.`;

      await conclusionEditor.fill(conclusionText);
    });

    // Step 6: 실시간 문법 검사
    await test.step('실시간 문법 및 문체 검사', async () => {
      // 문법 검사 버튼 클릭
      const grammarCheckBtn = page.locator('button[data-testid="check-grammar"]');
      await grammarCheckBtn.click();

      // 문법 검사 결과 대기
      await expect(page.locator('[data-testid="grammar-results"]')).toBeVisible({ timeout: 15000 });

      // 검사 결과 확인
      const grammarScore = page.locator('[data-testid="grammar-score"]');
      await expect(grammarScore).toBeVisible();

      // 제안사항이 있다면 확인
      const suggestions = page.locator('[data-testid="grammar-suggestion"]');
      const suggestionCount = await suggestions.count();

      if (suggestionCount > 0) {
        // 첫 번째 제안 적용
        const firstSuggestion = suggestions.first();
        await expect(firstSuggestion).toBeVisible();

        const applySuggestionBtn = firstSuggestion.locator('button[data-testid="apply-suggestion"]');
        await applySuggestionBtn.click();

        // 적용 완료 확인
        await expect(page.locator('[data-testid="suggestion-applied"]')).toBeVisible();
      }
    });

    // Step 7: 신학 용어 검토
    await test.step('신학 용어 적절성 검토', async () => {
      const theologyCheckBtn = page.locator('button[data-testid="check-theology"]');
      await theologyCheckBtn.click();

      await expect(page.locator('[data-testid="theology-results"]')).toBeVisible({ timeout: 10000 });

      // 신학 용어들 확인
      const theologicalTerms = page.locator('[data-testid="theological-term"]');
      const termCount = await theologicalTerms.count();

      expect(termCount).toBeGreaterThan(0); // 최소 1개 이상의 신학 용어가 발견되어야 함

      // 용어 설명 팝업 테스트
      if (termCount > 0) {
        await theologicalTerms.first().click();
        await expect(page.locator('[data-testid="term-explanation"]')).toBeVisible();
        await expect(page.locator('[data-testid="korean-meaning"]')).toBeVisible();

        // 팝업 닫기
        await page.click('[data-testid="close-explanation"]');
      }
    });

    // Step 8: 표현 개선 제안
    await test.step('자연스러운 헝가리어 표현 개선', async () => {
      const improveExpressionBtn = page.locator('button[data-testid="improve-expression"]');
      await improveExpressionBtn.click();

      await expect(page.locator('[data-testid="expression-improvements"]')).toBeVisible({ timeout: 15000 });

      // 개선 제안사항 확인
      const improvements = page.locator('[data-testid="expression-improvement"]');
      const improvementCount = await improvements.count();

      if (improvementCount > 0) {
        // 첫 번째 개선사항의 신뢰도 확인
        const confidenceScore = improvements.first().locator('[data-testid="confidence-score"]');
        await expect(confidenceScore).toBeVisible();

        const scoreText = await confidenceScore.textContent();
        const score = parseFloat(scoreText?.replace(/[^\d.]/g, '') || '0');
        expect(score).toBeGreaterThan(0.7); // 70% 이상의 신뢰도

        // 개선사항 적용
        const applyImprovementBtn = improvements.first().locator('button[data-testid="apply-improvement"]');
        await applyImprovementBtn.click();
      }
    });

    // Step 9: 최종 검토 및 미리보기
    await test.step('최종 검토 및 미리보기', async () => {
      const previewBtn = page.locator('button[data-testid="preview-sermon"]');
      await previewBtn.click();

      await expect(page.locator('[data-testid="sermon-preview"]')).toBeVisible();

      // 미리보기 내용 확인
      const previewTitle = page.locator('[data-testid="preview-title"]');
      await expect(previewTitle).toContainText('Isten szeretetéről'); // 헝가리어 제목 포함

      const previewContent = page.locator('[data-testid="preview-content"]');
      await expect(previewContent).toContainText('Kedves testvérek');
      await expect(previewContent).toContainText('János evangélium 3:16');

      // 예상 설교 시간 확인
      const estimatedTime = page.locator('[data-testid="estimated-duration"]');
      await expect(estimatedTime).toBeVisible();
      const timeText = await estimatedTime.textContent();
      expect(timeText).toContain('분'); // 한국어 시간 표시
    });

    // Step 10: 설교문 저장
    await test.step('설교문 저장 및 관리', async () => {
      // 미리보기에서 저장 버튼 클릭
      const saveBtn = page.locator('button[data-testid="save-sermon"]');
      await saveBtn.click();

      // 저장 다이얼로그 확인
      await expect(page.locator('[data-testid="save-dialog"]')).toBeVisible();

      // 설교문 제목 입력 (선택사항)
      const titleInput = page.locator('input[data-testid="sermon-title-input"]');
      await titleInput.fill('하나님의 사랑에 대한 설교 - 2024년 11월');

      // 태그 추가
      const tagInput = page.locator('input[data-testid="sermon-tags"]');
      await tagInput.fill('사랑, 은혜, 요한복음');

      // 최종 저장
      const confirmSaveBtn = page.locator('button[data-testid="confirm-save"]');
      await confirmSaveBtn.click();

      // 저장 성공 메시지 확인
      await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="save-success"]')).toContainText('저장되었습니다');

      // 내 설교문 목록으로 리다이렉트 확인
      await expect(page).toHaveURL(/.*\/sermons\/my-sermons.*/);
    });

    // Step 11: 저장된 설교문 확인
    await test.step('저장된 설교문 목록에서 확인', async () => {
      // 설교문 목록 페이지 확인
      await expect(page.locator('[data-testid="sermon-list"]')).toBeVisible();

      // 방금 저장한 설교문이 목록에 있는지 확인
      const sermonItems = page.locator('[data-testid="sermon-item"]');
      await expect(sermonItems.first()).toContainText('하나님의 사랑에 대한 설교');
      await expect(sermonItems.first()).toContainText('요한복음 3:16');

      // 상태가 '완료'로 표시되는지 확인
      const status = sermonItems.first().locator('[data-testid="sermon-status"]');
      await expect(status).toContainText('완료');
    });
  });

  test('기존 설교문 불러오기 및 편집 플로우', async ({ page }) => {

    await test.step('설교문 목록에서 기존 설교문 선택', async () => {
      await page.goto('/sermons/my-sermons');

      const firstSermon = page.locator('[data-testid="sermon-item"]').first();
      await expect(firstSermon).toBeVisible();

      // 편집 버튼 클릭
      const editBtn = firstSermon.locator('button[data-testid="edit-sermon"]');
      await editBtn.click();

      await expect(page).toHaveURL(/.*\/sermon\/edit\/.*/);
    });

    await test.step('기존 내용 수정', async () => {
      // 기존 내용이 로드되었는지 확인
      const introEditor = page.locator('[data-testid="introduction-editor"]');
      await expect(introEditor).toHaveValue(/Kedves testvérek/);

      // 내용 수정
      const additionalText = '\n\nEz egy fontos üzenet mindannyiunk számára.';
      await introEditor.fill(await introEditor.inputValue() + additionalText);

      // 수정 내용 저장
      const saveBtn = page.locator('button[data-testid="save-changes"]');
      await saveBtn.click();

      await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
    });
  });

  test('설교문 내보내기 기능', async ({ page }) => {

    await test.step('설교문을 PDF로 내보내기', async () => {
      await page.goto('/sermons/my-sermons');

      const firstSermon = page.locator('[data-testid="sermon-item"]').first();
      const exportBtn = firstSermon.locator('button[data-testid="export-sermon"]');
      await exportBtn.click();

      // 내보내기 옵션 확인
      await expect(page.locator('[data-testid="export-options"]')).toBeVisible();

      // PDF 선택
      await page.click('button[data-testid="export-pdf"]');

      // 다운로드 시작 확인
      const downloadPromise = page.waitForDownload();
      await page.click('button[data-testid="confirm-export"]');
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('.pdf');
    });

    await test.step('설교문을 Word 문서로 내보내기', async () => {
      const firstSermon = page.locator('[data-testid="sermon-item"]').first();
      const exportBtn = firstSermon.locator('button[data-testid="export-sermon"]');
      await exportBtn.click();

      // Word 문서 선택
      await page.click('button[data-testid="export-word"]');

      const downloadPromise = page.waitForDownload();
      await page.click('button[data-testid="confirm-export"]');
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('.docx');
    });
  });

  test('오류 처리 및 복구 플로우', async ({ page }) => {

    await test.step('네트워크 오류 시 자동 저장 기능 확인', async () => {
      await page.goto('/sermon/new');

      // 오프라인 모드 시뮬레이션
      await page.context().setOffline(true);

      // 텍스트 입력
      const introEditor = page.locator('[data-testid="introduction-editor"]');
      await introEditor.fill('오프라인에서 작성된 내용');

      // 온라인 복구
      await page.context().setOffline(false);

      // 자동 저장 확인
      await expect(page.locator('[data-testid="auto-save-indicator"]')).toContainText('저장됨');
    });

    await test.step('잘못된 입력 처리', async () => {
      await page.goto('/sermon/new');

      // 빈 주제로 개요 생성 시도
      const generateBtn = page.locator('button[data-testid="generate-outline"]');
      await generateBtn.click();

      // 오류 메시지 확인
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('주제를 입력해주세요');
    });
  });

  test('접근성 및 키보드 네비게이션', async ({ page }) => {

    await test.step('키보드만으로 설교문 작성 가능한지 확인', async () => {
      await page.goto('/sermon/new');

      // Tab 키로 네비게이션
      await page.keyboard.press('Tab');
      await expect(page.locator('input[name="topic"]:focus')).toBeVisible();

      await page.keyboard.type('키보드로 입력한 주제');

      await page.keyboard.press('Tab');
      await page.keyboard.type('로마서 8:28');

      // Enter로 양식 제출
      await page.keyboard.press('Enter');
    });

    await test.step('스크린 리더 호환성 확인', async () => {
      await page.goto('/sermon/new');

      // ARIA 라벨 확인
      const topicInput = page.locator('input[name="topic"]');
      await expect(topicInput).toHaveAttribute('aria-label');

      const generateBtn = page.locator('button[data-testid="generate-outline"]');
      await expect(generateBtn).toHaveAttribute('aria-describedby');
    });
  });
});