import express from 'express';
import fs from 'fs/promises';
import path from 'path';

export const vocabularyRoutes = express.Router();

/**
 * GET /api/vocabulary/:level
 * 특정 레벨의 단어장 데이터 반환 (JSON 파일 로드)
 */
vocabularyRoutes.get('/:level', async (req, res) => {
  console.log(`[Vocabulary API] Request for level: ${req.params.level}`);
  try {
    const { level } = req.params;
    const safeLevel = level.replace(/[^a-z0-9]/gi, '').toLowerCase();

    // 경로 탐색 로직 (index.ts에 있던 것보다 더 정교하게)
    const possiblePaths = [
      // 1. 현재 실행 위치 기준 (프로젝트 루트에서 실행 시)
      path.join(process.cwd(), 'backend/src/data/vocabulary', `${safeLevel}.json`),
      // 2. src 내부 (개발 환경)
      path.join(process.cwd(), 'src/data/vocabulary', `${safeLevel}.json`),
      // 3. __dirname 기준 (현재 파일 위치: src/api/vocabulary.ts -> ../data/vocabulary)
      path.join(__dirname, '../data/vocabulary', `${safeLevel}.json`),
    ];

    let filePath = '';
    let fileFound = false;

    // 경로 순회하며 파일 찾기
    for (const p of possiblePaths) {
      try {
        await fs.access(p);
        filePath = p;
        fileFound = true;
        console.log(`[Vocabulary API] Found file at: ${p}`);
        break;
      } catch (e) {
        // continue
      }
    }

    if (!fileFound) {
      console.warn(`[Vocabulary API] File not found. Searched in: ${possiblePaths.join(', ')}`);
      return res.status(404).json({ error: '해당 레벨의 단어장을 찾을 수 없습니다.' });
    }

    const data = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(data);
    res.json(jsonData);

  } catch (error) {
    console.error('[Vocabulary API] Error:', error);
    res.status(500).json({ error: '어휘 데이터를 불러오는 중 오류가 발생했습니다.' });
  }
});

// 헬스 체크용
vocabularyRoutes.get('/status', (_, res) => {
  res.json({ success: true, message: 'Vocabulary API Active' });
});
