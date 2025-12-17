import { PrismaClient, CEFRLevel, ExerciseType } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// 데이터 디렉토리 루트
const DATA_ROOT = path.join(__dirname, '../data');

// 레벨 파싱 함수
function parseLevel(dirName: string): CEFRLevel {
    if (dirName.includes('a1')) return CEFRLevel.A1;
    if (dirName.includes('a2')) return CEFRLevel.A2;
    if (dirName.includes('b1')) return CEFRLevel.B1;
    if (dirName.includes('b2')) return CEFRLevel.B2;
    return CEFRLevel.A1;
}

async function seedGrammar() {
    console.log('🚀 문법 레슨 데이터 시딩 시작...');

    // 대상 디렉토리 목록
    const grammarDirs = [
        'grammar-lessons-a1',
        'grammar-lessons-a2',
        'grammar-lessons-b1',
        'grammar-lessons-b2'
    ];

    try {
        for (const dirName of grammarDirs) {
            const dirPath = path.join(DATA_ROOT, dirName);

            // 디렉토리 존재 확인
            if (!fs.existsSync(dirPath)) {
                console.warn(`⚠️ 디렉토리 없음: ${dirPath}`);
                continue;
            }

            const level = parseLevel(dirName);
            const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));

            console.log(`📂 레벨 ${level} 처리 중... (${files.length}개 파일)`);

            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const content = fs.readFileSync(filePath, 'utf-8');

                try {
                    const data = JSON.parse(content);

                    // 1. GrammarLesson 생성 (Upsert)
                    // 유니크 키: [level, orderIndex]
                    const lesson = await prisma.grammarLesson.upsert({
                        where: {
                            level_orderIndex: {
                                level: level,
                                orderIndex: data.orderIndex || 0
                            }
                        },
                        update: {
                            titleKorean: data.titleKorean,
                            titleHungarian: data.titleHungarian,
                            explanationKorean: data.explanationKorean || '',
                            explanationHungarian: data.explanationHungarian || null,
                            grammarRules: data.grammarRules || {}, // JSON 저장
                            examples: data.examples || [],         // JSON 저장
                            koreanInterferenceNotes: data.koreanInterferenceNotes,
                            commonMistakes: data.commonMistakes,
                            comparisonWithKorean: data.comparisonWithKorean,
                            estimatedDuration: data.estimatedDuration || 30,
                            difficultyScore: data.difficultyScore || 1,
                            prerequisites: data.prerequisites || [],
                            tags: data.tags || [],
                            theologicalRelevance: data.theologicalRelevance || false,
                            theologicalExamples: data.theologicalExamples || [],
                            isPublished: data.isPublished !== undefined ? data.isPublished : true
                        },
                        create: {
                            level: level,
                            orderIndex: data.orderIndex || 0,
                            titleKorean: data.titleKorean,
                            titleHungarian: data.titleHungarian,
                            explanationKorean: data.explanationKorean || '',
                            explanationHungarian: data.explanationHungarian || null,
                            grammarRules: data.grammarRules || {},
                            examples: data.examples || [],
                            koreanInterferenceNotes: data.koreanInterferenceNotes,
                            commonMistakes: data.commonMistakes,
                            comparisonWithKorean: data.comparisonWithKorean,
                            estimatedDuration: data.estimatedDuration || 30,
                            difficultyScore: data.difficultyScore || 1,
                            prerequisites: data.prerequisites || [],
                            tags: data.tags || [],
                            theologicalRelevance: data.theologicalRelevance || false,
                            theologicalExamples: data.theologicalExamples || [],
                            isPublished: data.isPublished !== undefined ? data.isPublished : true
                        }
                    });

                    console.log(`  ✅ 레슨 저장 완료: [${level}] ${data.titleKorean}`);

                    // 2. GrammarExercise (연습문제) 처리
                    // 기존 연습문제 삭제 후 재생성 (간단한 동기화를 위해)
                    if (data.exercises && Array.isArray(data.exercises)) {
                        await prisma.grammarExercise.deleteMany({
                            where: { lessonId: lesson.id }
                        });

                        for (let i = 0; i < data.exercises.length; i++) {
                            const ex = data.exercises[i];

                            await prisma.grammarExercise.create({
                                data: {
                                    lessonId: lesson.id,
                                    orderIndex: i + 1,
                                    exerciseType: ExerciseType.MULTIPLE_CHOICE, // 기본값 (JSON 구조에 따라 매핑 필요)
                                    questionKorean: ex.question || ex.kr || '질문 없음',
                                    questionHungarian: ex.hu || null,
                                    correctAnswer: ex.answer || '',
                                    options: ex.options || [], // JSON
                                    explanationKorean: ex.explanation || null,
                                    difficultyLevel: 1
                                }
                            });
                        }
                        console.log(`    -> 연습문제 ${data.exercises.length}개 저장됨`);
                    }

                } catch (parseError) {
                    console.error(`❌ 파일 처리 실패 (${file}):`, parseError);
                }
            }
        }

        console.log('🎉 모든 문법 레슨 시딩 완료!');

    } catch (error) {
        console.error('🚨 치명적 오류:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedGrammar();
