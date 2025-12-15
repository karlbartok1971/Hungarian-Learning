/**
 * 문법 강의 JSON 파일 시딩 스크립트
 * grammar-lessons-a1, a2, b1, b2 디렉토리의 모든 JSON 파일을 읽어서 DB에 시딩합니다
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 문법 강의 시딩 시작...\n');

  const levels = ['a1', 'a2', 'b1', 'b2'];
  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const level of levels) {
    const dirPath = path.join(__dirname, `../data/grammar-lessons-${level}`);

    console.log(`\n📁 ${level.toUpperCase()} 레벨 처리 중...`);

    // 디렉토리 존재 확인
    if (!fs.existsSync(dirPath)) {
      console.log(`   ⚠️  디렉토리 없음: ${dirPath}`);
      continue;
    }

    // JSON 파일 읽기
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));

    if (files.length === 0) {
      console.log(`   ⚠️  JSON 파일 없음`);
      continue;
    }

    console.log(`   📄 파일 ${files.length}개 발견`);

    for (const file of files) {
      try {
        const filePath = path.join(dirPath, file);
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const lessonData = JSON.parse(rawData);

        // 중복 확인
        const existing = await prisma.grammarLesson.findUnique({
          where: {
            level_orderIndex: {
              level: lessonData.level,
              orderIndex: lessonData.orderIndex,
            },
          },
        });

        if (existing) {
          console.log(`   ⏭️  이미 존재: ${lessonData.level} - ${lessonData.orderIndex}강 ${lessonData.titleKorean}`);
          totalSkipped++;
          continue;
        }

        // 새로운 강의 생성
        const lesson = await prisma.grammarLesson.create({
          data: {
            level: lessonData.level,
            orderIndex: lessonData.orderIndex,
            titleKorean: lessonData.titleKorean,
            titleHungarian: lessonData.titleHungarian || null,
            explanationKorean: lessonData.explanationKorean,
            explanationHungarian: lessonData.explanationHungarian || null,
            grammarRules: lessonData.grammarRules,
            examples: lessonData.examples,
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

        console.log(`   ✅ 생성: ${lesson.level} - ${lesson.orderIndex}강 ${lesson.titleKorean}`);
        totalCreated++;
      } catch (error: any) {
        console.error(`   ❌ 오류 발생 (${file}):`, error.message);
        totalErrors++;
      }
    }
  }

  console.log(`\n\n📊 시딩 완료:`);
  console.log(`   ✅ 새로 생성: ${totalCreated}개`);
  console.log(`   ⏭️  이미 존재: ${totalSkipped}개`);
  console.log(`   ❌ 오류: ${totalErrors}개`);
  console.log(`   📚 전체: ${totalCreated + totalSkipped}개\n`);
}

main()
  .catch((e) => {
    console.error('❌ 시딩 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
