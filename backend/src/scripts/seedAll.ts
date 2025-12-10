/**
 * 전체 데이터 Seeding 통합 스크립트
 * 문법 강의 + 어휘를 한 번에 seeding
 */

import { PrismaClient } from '@prisma/client';
import { seedGrammarLessons } from './seedGrammarLessons';
import { seedVocabulary } from './seedVocabulary';

const prisma = new PrismaClient();

async function seedAll() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 헝가리어 학습 플랫폼 - 전체 데이터 Seeding 시작');
  console.log('='.repeat(70) + '\n');

  const startTime = Date.now();

  try {
    // 1. 문법 강의 Seeding
    console.log('📝 [1/2] 문법 강의 Seeding...\n');
    const grammarResult = await seedGrammarLessons();

    console.log('\n');

    // 2. 어휘 Seeding
    console.log('📚 [2/2] 어휘 Seeding...\n');
    const vocabularyResult = await seedVocabulary();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // 최종 결과
    console.log('\n' + '='.repeat(70));
    console.log('🎉 전체 Seeding 완료!');
    console.log('='.repeat(70));
    console.log(`\n📊 최종 통계:`);
    console.log(`   문법 강의: ${grammarResult.successCount}개 성공, ${grammarResult.errorCount}개 실패`);
    console.log(`   어휘: ${vocabularyResult.successCount}개 성공, ${vocabularyResult.errorCount}개 실패`);
    console.log(`\n⏱️  총 소요 시간: ${duration}초`);
    console.log('\n✅ 데이터베이스가 학습 콘텐츠로 가득 찼습니다!\n');

    // 데이터베이스 요약 정보
    const grammarCount = await prisma.grammarLesson.count();
    const vocabCount = await prisma.vocabularyItem.count();

    console.log('📈 데이터베이스 현황:');
    console.log(`   총 문법 강의: ${grammarCount}개`);
    console.log(`   총 어휘: ${vocabCount}개`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Seeding 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 직접 실행
if (require.main === module) {
  seedAll();
}

export { seedAll };
