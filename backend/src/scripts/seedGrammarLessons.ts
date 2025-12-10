/**
 * 문법 강의 데이터 Seeding 스크립트
 * JSON 파일들을 읽어서 실제 데이터베이스에 삽입
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface GrammarLessonData {
  id: string;
  title: string;
  level: string;
  category: string;
  order: number;
  estimatedDuration: number;
  difficulty: number;
  tags: string[];
  summary: string;
  objectives: string[];
  content: any;
  additionalResources?: any[];
  aiTutorPrompts?: string[];
}

async function seedGrammarLessons() {
  console.log('📚 문법 강의 데이터 Seeding 시작...\n');

  const dataDir = path.join(__dirname, '../data/grammar-lessons');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  console.log(`발견된 문법 강의 파일: ${files.length}개\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const filePath = path.join(dataDir, file);
      const jsonData = fs.readFileSync(filePath, 'utf-8');
      const lessonData: GrammarLessonData = JSON.parse(jsonData);

      console.log(`📖 처리 중: ${lessonData.title} (${lessonData.id})`);

      // Prisma를 통해 데이터베이스에 삽입
      const created = await prisma.grammarLesson.upsert({
        where: { id: lessonData.id },
        update: {
          titleKorean: lessonData.title,
          level: lessonData.level as any,
          orderIndex: lessonData.order,
          explanationKorean: lessonData.summary,
          grammarRules: lessonData.content,
          examples: lessonData.content.examples || [],
          estimatedDuration: lessonData.estimatedDuration,
          difficultyScore: lessonData.difficulty,
          tags: lessonData.tags,
          isPublished: true,
          updatedAt: new Date(),
        },
        create: {
          id: lessonData.id,
          titleKorean: lessonData.title,
          level: lessonData.level as any,
          orderIndex: lessonData.order,
          explanationKorean: lessonData.summary,
          grammarRules: lessonData.content,
          examples: lessonData.content.examples || [],
          estimatedDuration: lessonData.estimatedDuration,
          difficultyScore: lessonData.difficulty,
          tags: lessonData.tags,
          isPublished: true,
        },
      });

      console.log(`   ✅ 성공: ${created.titleKorean}`);
      console.log(`   📊 예문 수: ~${JSON.stringify(lessonData.content.examples || []).length} 항목`);
      console.log(`   🏷️  태그: ${lessonData.tags.join(', ')}\n`);

      successCount++;
    } catch (error: any) {
      console.error(`   ❌ 오류 (${file}):`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Seeding 결과:`);
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ❌ 실패: ${errorCount}개`);
  console.log('='.repeat(60) + '\n');

  return { successCount, errorCount };
}

async function main() {
  try {
    await seedGrammarLessons();
    console.log('🎉 문법 강의 Seeding 완료!\n');
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

export { seedGrammarLessons };
