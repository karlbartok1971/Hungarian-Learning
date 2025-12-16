
/**
 * 문법 강의 업데이트 스크립트
 * DB에 이미 존재하는 강의들을 JSON 파일 내용으로 강제 업데이트합니다.
 * (스키마 변경이나 데이터 구조 변경 시 사용)
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 문법 강의 데이터 업데이트 시작...\n');

    const levels = ['a1', 'a2', 'b1', 'b2'];
    let totalUpdated = 0;
    let totalErrors = 0;

    for (const level of levels) {
        const dirPath = path.join(__dirname, `../data/grammar-lessons-${level}`);

        console.log(`\n📁 ${level.toUpperCase()} 레벨 업데이트 중...`);

        if (!fs.existsSync(dirPath)) {
            console.log(`   ⚠️  디렉토리 없음: ${dirPath}`);
            continue;
        }

        const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));

        if (files.length === 0) {
            console.log(`   ⚠️  JSON 파일 없음`);
            continue;
        }

        for (const file of files) {
            try {
                const filePath = path.join(dirPath, file);
                const rawData = fs.readFileSync(filePath, 'utf-8');
                const lessonData = JSON.parse(rawData);

                // 업데이트 수행
                const updated = await prisma.grammarLesson.update({
                    where: {
                        level_orderIndex: {
                            level: lessonData.level,
                            orderIndex: lessonData.orderIndex,
                        },
                    },
                    data: {
                        titleKorean: lessonData.titleKorean,
                        titleHungarian: lessonData.titleHungarian || null,
                        explanationKorean: lessonData.explanationKorean,
                        explanationHungarian: lessonData.explanationHungarian || null,
                        grammarRules: lessonData.grammarRules, // JSON 구조 업데이트
                        examples: lessonData.examples,         // 예문 업데이트
                        koreanInterferenceNotes: lessonData.koreanInterferenceNotes || null,
                        commonMistakes: lessonData.commonMistakes || null,
                        comparisonWithKorean: lessonData.comparisonWithKorean || null,
                        estimatedDuration: lessonData.estimatedDuration,
                        difficultyScore: lessonData.difficultyScore,
                        prerequisites: lessonData.prerequisites || [],
                        tags: lessonData.tags || [],
                        theologicalRelevance: lessonData.theologicalRelevance || false,
                        theologicalExamples: lessonData.theologicalExamples || [],
                        isPublished: lessonData.isPublished !== undefined ? lessonData.isPublished : true,
                    },
                });

                console.log(`   ✅ 업데이트: ${updated.level} - ${updated.orderIndex}강 ${updated.titleKorean}`);
                totalUpdated++;
            } catch (error: any) {
                if (error.code === 'P2025') {
                    console.log(`   ⚠️  DB에 없음 (건너뜀): ${file}`);
                } else {
                    console.error(`   ❌ 오류 발생 (${file}):`, error.message);
                    totalErrors++;
                }
            }
        }
    }

    console.log(`\n\n📊 업데이트 완료:`);
    console.log(`   ✅ 업데이트됨: ${totalUpdated}개`);
    console.log(`   ❌ 오류: ${totalErrors}개`);
}

main()
    .catch((e) => {
        console.error('❌ 실행 중 오류 발생:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
