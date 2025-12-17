import { PrismaClient, WordType, CEFRLevel, VocabularyCategory } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// 데이터 디렉토리 경로
const DATA_DIR = path.join(__dirname, '../data/vocabulary');

// 품사 매핑 함수
function mapPosToWordType(pos: string): WordType {
    const normalizedPos = pos.trim().toLowerCase();

    // 한국어 품사 매핑
    if (normalizedPos.includes('명사')) return WordType.NOUN;
    if (normalizedPos.includes('동사')) return WordType.VERB;
    if (normalizedPos.includes('형용사')) return WordType.ADJECTIVE;
    if (normalizedPos.includes('부사')) return WordType.ADVERB;
    if (normalizedPos.includes('대명사')) return WordType.PRONOUN;
    if (normalizedPos.includes('전치사') || normalizedPos.includes('후치사')) return WordType.PREPOSITION;
    if (normalizedPos.includes('접속사')) return WordType.CONJUNCTION;
    if (normalizedPos.includes('감탄사')) return WordType.INTERJECTION;
    if (normalizedPos.includes('조사')) return WordType.PARTICLE;
    if (normalizedPos.includes('수사') || normalizedPos.includes('숫자')) return WordType.NUMERAL;
    if (normalizedPos.includes('관사')) return WordType.DETERMINER;
    if (normalizedPos.includes('표현') || normalizedPos.includes('인사') || normalizedPos.includes('구문')) return WordType.PHRASE;

    // 기본값 (매핑 실패 시) -> 명사로 처리하거나 로그 남김
    console.warn(`⚠️ 알 수 없는 품사: ${pos} -> NOUN으로 대체`);
    return WordType.NOUN;
}

// 레벨 매핑 함수
function mapLevel(levelData: string): CEFRLevel {
    const level = levelData.toUpperCase();
    if (level === 'A1') return CEFRLevel.A1;
    if (level === 'A2') return CEFRLevel.A2;
    if (level === 'B1') return CEFRLevel.B1;
    if (level === 'B2') return CEFRLevel.B2;
    return CEFRLevel.A1; // 기본값
}

async function seedVocabulary() {
    console.log('🚀 어휘 데이터 시딩 시작...');

    try {
        const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.json'));

        for (const file of files) {
            console.log(`📂 처리 중: ${file}`);
            const filePath = path.join(DATA_DIR, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);

            const level = mapLevel(data.level || 'A1');

            // 토픽별 순회
            if (data.topics && Array.isArray(data.topics)) {
                for (const topic of data.topics) {
                    const topicId = topic.id;
                    const topicTitle = topic.title;
                    const emoji = topic.emoji;

                    console.log(`  🔹 토픽: ${topicTitle} (${topic.words.length}개 단어)`);

                    for (const word of topic.words) {
                        try {
                            // 예문 데이터 구성
                            const examples: any[] = [];
                            if (word.exHu || word.exKo) {
                                examples.push({
                                    hu: word.exHu || '',
                                    ko: word.exKo || '',
                                    context: '기본 예문'
                                });
                            }

                            // DB 저장 (Upsert)
                            await prisma.vocabularyItem.create({
                                data: {
                                    hungarian: word.hu,
                                    korean: word.ko,
                                    pronunciation: word.pron,
                                    wordType: mapPosToWordType(word.pos),
                                    level: level,
                                    category: VocabularyCategory.DAILY_LIFE, // 기본 카테고리 (필요 시 로직 개선)
                                    topicId: topicId,
                                    topicTitle: topicTitle,
                                    examples: examples, // JSON으로 저장

                                    // 신학 관련 태그 처리 (토픽 ID로 추론)
                                    isTheological:
                                        topicId.includes('church') ||
                                        topicId.includes('god') ||
                                        topicId.includes('faith'),

                                    // 메타데이터
                                    semanticTags: [topicId, topicTitle],
                                    mnemonics: word.mnemonic || null
                                }
                            });
                        } catch (itemError) {
                            console.error(`❌ 단어 저장 실패 (${word.hu}):`, itemError);
                        }
                    }
                }
            } else {
                console.warn(`⚠️ ${file} 파일에 'topics' 배열이 없습니다.`);
            }
        }

        console.log('✅ 모든 어휘 데이터 시딩 완료!');

    } catch (error) {
        console.error('🚨 치명적 오류 발생:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedVocabulary();
