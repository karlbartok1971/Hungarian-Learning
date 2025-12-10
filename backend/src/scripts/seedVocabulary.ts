/**
 * 어휘 데이터 Seeding 스크립트
 * 100개 핵심 어휘를 데이터베이스에 삽입
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface VocabularyItemData {
  id: string;
  hungarian: string;
  korean: string;
  category: string;
  level: string;
  wordType: string;
  examples?: any[];
  example?: string;
  etymology?: string;
  relatedWords?: string[];
  usage?: string;
  culturalNote?: string;
}

async function seedVocabulary() {
  console.log('📚 어휘 데이터 Seeding 시작...\n');

  // 두 파일 모두 읽기
  const coreFile = path.join(__dirname, '../data/core-vocabulary-100.json');
  const additionalFile = path.join(__dirname, '../data/vocabulary-additional-80.json');

  let allVocabulary: VocabularyItemData[] = [];

  // Core 20개 (상세 버전)
  if (fs.existsSync(coreFile)) {
    const coreData = JSON.parse(fs.readFileSync(coreFile, 'utf-8'));
    allVocabulary = [...coreData.vocabulary];
    console.log(`✅ 핵심 어휘 20개 (상세) 로드 완료`);
  }

  // Additional 80개 (간결 버전)
  if (fs.existsSync(additionalFile)) {
    const additionalData = JSON.parse(fs.readFileSync(additionalFile, 'utf-8'));
    allVocabulary = [...allVocabulary, ...additionalData.vocabulary];
    console.log(`✅ 추가 어휘 80개 (간결) 로드 완료`);
  }

  console.log(`\n총 ${allVocabulary.length}개 어휘를 데이터베이스에 삽입합니다...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const vocab of allVocabulary) {
    try {
      // 예문 처리 - JSON 형태로 저장
      let exampleJson: any[] = [];
      if (vocab.examples && Array.isArray(vocab.examples)) {
        exampleJson = vocab.examples.map((ex: any) =>
          typeof ex === 'string'
            ? { hu: ex, ko: '', context: '' }
            : { hu: ex.hungarian || '', ko: ex.korean || '', context: ex.context || '' }
        );
      } else if (vocab.example) {
        exampleJson = [{ hu: vocab.example, ko: '', context: '' }];
      }

      // Prisma를 통해 데이터베이스에 삽입
      const created = await prisma.vocabularyItem.upsert({
        where: { id: vocab.id },
        update: {
          hungarian: vocab.hungarian,
          korean: vocab.korean,
          level: vocab.level as any,
          category: vocab.category as any,
          wordType: vocab.wordType as any,
          examples: exampleJson,
          relatedWords: vocab.relatedWords || [],
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          id: vocab.id,
          hungarian: vocab.hungarian,
          korean: vocab.korean,
          level: vocab.level as any,
          category: vocab.category as any,
          wordType: vocab.wordType as any,
          examples: exampleJson,
          relatedWords: vocab.relatedWords || [],
          isActive: true,
        },
      });

      console.log(`   ✅ ${vocab.hungarian} (${vocab.korean})`);
      successCount++;
    } catch (error: any) {
      console.error(`   ❌ 오류 (${vocab.hungarian}):`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Seeding 결과:`);
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ❌ 실패: ${errorCount}개`);
  console.log('='.repeat(60) + '\n');

  // 카테고리별 통계
  const categories = await prisma.vocabularyItem.groupBy({
    by: ['category'],
    _count: true,
  });

  console.log('📊 카테고리별 어휘 수:');
  categories.forEach(cat => {
    console.log(`   ${cat.category}: ${cat._count}개`);
  });
  console.log('');

  return { successCount, errorCount };
}

async function main() {
  try {
    await seedVocabulary();
    console.log('🎉 어휘 Seeding 완료!\n');
  } catch (error) {
    console.error('❌ Seeding 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main();
}

export { seedVocabulary };
