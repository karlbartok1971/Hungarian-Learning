/**
 * 성경 구절 시딩 스크립트
 * 샘플 성경 구절 데이터를 데이터베이스에 추가합니다
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 성경 구절 시딩 시작...\n');

  // 샘플 데이터 로드
  const dataPath = path.join(__dirname, '../data/bible-verses-sample.json');
  const verses = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  let created = 0;
  let skipped = 0;

  for (const verseData of verses) {
    try {
      // 중복 확인
      const existing = await prisma.bibleVerse.findUnique({
        where: {
          book_chapter_verse: {
            book: verseData.book,
            chapter: verseData.chapter,
            verse: verseData.verse,
          },
        },
      });

      if (existing) {
        console.log(`⏭️  이미 존재: ${verseData.book} ${verseData.chapter}:${verseData.verse}`);
        skipped++;
        continue;
      }

      // 새로운 구절 생성
      const verse = await prisma.bibleVerse.create({
        data: {
          book: verseData.book,
          bookHungarian: verseData.bookHungarian,
          chapter: verseData.chapter,
          verse: verseData.verse,
          textHungarian: verseData.textHungarian,
          textKorean: verseData.textKorean,
          grammarAnalysis: verseData.grammarAnalysis,
          difficulty: verseData.difficulty,
          grammarTopics: verseData.grammarTopics,
          vocabularyCount: verseData.vocabularyCount,
          sermonRelevance: verseData.sermonRelevance,
          theologicalTheme: verseData.theologicalTheme,
        },
      });

      console.log(`✅ 생성 완료: ${verse.book} ${verse.chapter}:${verse.verse} - ${verse.difficulty} 레벨`);
      created++;
    } catch (error: any) {
      console.error(`❌ 오류 발생: ${verseData.book} ${verseData.chapter}:${verseData.verse}`, error.message);
    }
  }

  console.log(`\n📊 시딩 완료:`);
  console.log(`   ✅ 새로 생성: ${created}개`);
  console.log(`   ⏭️  이미 존재: ${skipped}개`);
  console.log(`   📖 전체 구절: ${created + skipped}개\n`);
}

main()
  .catch((e) => {
    console.error('❌ 시딩 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
