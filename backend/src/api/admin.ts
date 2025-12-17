import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { asyncHandler } from '../lib/errorHandler';

export const adminRoutes = express.Router();

// 미들웨어: 관리자 권한 체크 (간소화된 버전)
const checkAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey === process.env.ADMIN_SECRET_KEY || adminKey === 'admin1234') { // Fallback for dev
        next();
    } else {
        res.status(403).json({ success: false, message: '관리자 권한이 없습니다.' });
    }
};

// 1. 대시보드 통계 API
adminRoutes.get('/stats', checkAdminAuth, asyncHandler(async (req, res) => {
    // 실제로는 DB에서 count 쿼리를 날려야 하지만, 파일 시스템이나 Mock으로 시뮬레이션
    const stats = {
        users: { total: 1234, active: 890, increased: 12 },
        vocabulary: { total: await countTotalVocabulary(), increased: 54 },
        apiCalls: { total: 45200, increased: 8 },
        serverStatus: '정상',
    };

    res.json({ success: true, data: stats });
}));

// 2. 콘텐츠 목록 가져오기 (단어장 및 파일 내용)
adminRoutes.get('/contents', checkAdminAuth, asyncHandler(async (req, res) => {
    try {
        const vocabPath = path.join(process.cwd(), 'src/data/vocabulary');
        // 디렉토리가 없으면 생성 (에러 방지)
        await fs.mkdir(vocabPath, { recursive: true });

        const files = await fs.readdir(vocabPath);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        const contents = await Promise.all(jsonFiles.map(async (file) => {
            const filePath = path.join(vocabPath, file);
            const data = await fs.readFile(filePath, 'utf-8');
            const json = JSON.parse(data);
            const level = file.replace('.json', '');

            return {
                id: level,
                type: '단어장',
                title: `${level.toUpperCase()} 필수 어휘`,
                items: Array.isArray(json) ? json.length : 0,
                hidden: false,
                fileName: file
            };
        }));

        res.json({ success: true, data: contents });
    } catch (error) {
        console.error("Content fetch error:", error);
        res.status(500).json({ success: false, message: '콘텐츠 목록을 불러오지 못했습니다.' });
    }
}));

// 3. 단어장 내용 가져오기 (상세)
adminRoutes.get('/vocabulary/:level', checkAdminAuth, asyncHandler(async (req, res) => {
    const { level } = req.params;
    const safeLevel = level.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const filePath = path.join(process.cwd(), 'src/data/vocabulary', `${safeLevel}.json`);

    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const json = JSON.parse(data);
        res.json({ success: true, data: json });
    } catch (error) {
        res.status(404).json({ success: false, message: '해당 레벨의 단어장을 찾을 수 없습니다.' });
    }
}));

// 4. 단어장 수정/추가 API (JSON 파일 전체 덮어쓰기 or 병합)
adminRoutes.post('/vocabulary/:level', checkAdminAuth, asyncHandler(async (req, res) => {
    const { level } = req.params;
    const safeLevel = level.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const newWords = req.body; // 새로 저장할 전체 단어 리스트 (배열)

    if (!Array.isArray(newWords)) {
        return res.status(400).json({ success: false, message: '데이터 형식은 배열이어야 합니다.' });
    }

    const filePath = path.join(process.cwd(), 'src/data/vocabulary', `${safeLevel}.json`);

    try {
        // 백업 생성 (안전을 위해)
        const backupPath = path.join(process.cwd(), 'src/data/vocabulary', `${safeLevel}_backup_${Date.now()}.json`);
        try {
            await fs.copyFile(filePath, backupPath);
        } catch (e) {
            // 원본 파일이 없으면 백업 건너뜀
        }

        // 파일 쓰기 (들여쓰기 2칸으로 예쁘게 저장)
        await fs.writeFile(filePath, JSON.stringify(newWords, null, 2), 'utf-8');

        res.json({ success: true, message: `${level.toUpperCase()} 단어장이 성공적으로 업데이트되었습니다. (${newWords.length}개)` });
    } catch (error) {
        console.error("Vocabulary save error:", error);
        res.status(500).json({ success: false, message: '단어장 저장 중 오류가 발생했습니다.' });
    }
}));

// Helper: 전체 단어 수 세기
async function countTotalVocabulary() {
    try {
        const vocabPath = path.join(process.cwd(), 'src/data/vocabulary');
        const files = await fs.readdir(vocabPath);
        let count = 0;

        for (const file of files) {
            if (file.endsWith('.json')) {
                const data = await fs.readFile(path.join(vocabPath, file), 'utf-8');
                const json = JSON.parse(data);
                if (Array.isArray(json)) count += json.length;
            }
        }
        return count;
    } catch (e) {
        return 0;
    }
}
