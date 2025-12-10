import { PrismaClient, CEFRLevel, LearningGoal, VocabularyCategory, LessonType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 데이터베이스 시드 시작...');

  // 기본 어휘 데이터
  const vocabularyItems = [
    // A1 레벨 - 기본 인사와 종교 용어
    {
      hungarian: 'Jó napot',
      korean: '안녕하세요',
      phonetic: 'jó napot',
      level: CEFRLevel.A1,
      category: VocabularyCategory.DAILY_LIFE,
      examples: ['Jó napot kívánok!', 'Jó napot, hogy van?'],
      tags: ['인사', '예의'],
    },
    {
      hungarian: 'Isten',
      korean: '하나님',
      phonetic: 'isten',
      level: CEFRLevel.A1,
      category: VocabularyCategory.RELIGIOUS,
      examples: ['Isten áldjon meg!', 'Hiszek az Istenben.'],
      tags: ['종교', '신앙'],
    },
    {
      hungarian: 'templom',
      korean: '교회',
      phonetic: 'templom',
      level: CEFRLevel.A1,
      category: VocabularyCategory.RELIGIOUS,
      examples: ['A templomba megyek.', 'Ez egy gyönyörű templom.'],
      tags: ['건물', '예배'],
    },
    {
      hungarian: 'ima',
      korean: '기도',
      phonetic: 'ima',
      level: CEFRLevel.A1,
      category: VocabularyCategory.RELIGIOUS,
      examples: ['Imádkozom minden nap.', 'Az ima erőt ad.'],
      tags: ['영성', '기도'],
    },
    {
      hungarian: 'lelkész',
      korean: '목사',
      phonetic: 'lelkész',
      level: CEFRLevel.A2,
      category: VocabularyCategory.RELIGIOUS,
      examples: ['A lelkész prédikált.', 'Beszéltem a lelkésszel.'],
      tags: ['직업', '목회'],
    },

    // A2 레벨 - 일상 및 종교 확장
    {
      hungarian: 'prédikáció',
      korean: '설교',
      phonetic: 'prédikáció',
      level: CEFRLevel.A2,
      category: VocabularyCategory.RELIGIOUS,
      examples: ['Nagyon jó volt a prédikáció.', 'A prédikáció témája a szeretet volt.'],
      tags: ['설교', '메시지'],
    },
    {
      hungarian: 'Biblia',
      korean: '성경',
      phonetic: 'biblia',
      level: CEFRLevel.A2,
      category: VocabularyCategory.RELIGIOUS,
      examples: ['Olvasom a Bibliát.', 'A Biblia Isten szava.'],
      tags: ['성경', '말씀'],
    },

    // B1 레벨 - 복잡한 종교 개념
    {
      hungarian: 'lelkiség',
      korean: '영성',
      phonetic: 'lelkiség',
      level: CEFRLevel.B1,
      category: VocabularyCategory.RELIGIOUS,
      examples: ['A lelkiség fontos az életben.', 'Fejlesztem a lelkiségem.'],
      tags: ['영성', '성장'],
    },
    {
      hungarian: 'áldás',
      korean: '축복',
      phonetic: 'áldás',
      level: CEFRLevel.B1,
      category: VocabularyCategory.RELIGIOUS,
      examples: ['Isten áldása legyen veled!', 'Nagy áldás ez a család számára.'],
      tags: ['축복', '은혜'],
    },
  ];

  // 어휘 데이터 삽입
  for (const item of vocabularyItems) {
    await prisma.vocabularyItem.upsert({
      where: { id: `vocab_${item.hungarian.replace(/\s+/g, '_')}` },
      update: {},
      create: {
        id: `vocab_${item.hungarian.replace(/\s+/g, '_')}`,
        ...item,
      },
    });
  }

  console.log('✅ 어휘 데이터 삽입 완료');

  // 기본 레슨 데이터
  const lessons = [
    {
      title: '헝가리어 기본 인사',
      description: '일상생활에서 사용하는 기본적인 인사 표현을 배웁니다.',
      level: CEFRLevel.A1,
      type: LessonType.VOCABULARY,
      category: '인사',
      content: {
        type: 'vocabulary',
        words: ['Jó napot', 'Jó reggelt', 'Jó estét', 'Viszlát'],
        exercises: [
          {
            id: '1',
            type: 'multiple_choice',
            question: '안녕하세요를 헝가리어로?',
            options: ['Jó napot', 'Jó éjszakát', 'Köszönöm', 'Igen'],
            correctAnswer: 'Jó napot',
            explanation: 'Jó napot은 헝가리어로 안녕하세요라는 뜻입니다.',
            points: 10,
          },
        ],
      },
      estimatedDuration: 15,
      difficulty: 1,
      tags: ['인사', 'A1', '기초'],
      isPublished: true,
    },
    {
      title: '종교 기초 어휘',
      description: '기독교 신앙과 관련된 기본 어휘를 학습합니다.',
      level: CEFRLevel.A1,
      type: LessonType.VOCABULARY,
      category: '종교',
      content: {
        type: 'vocabulary',
        words: ['Isten', 'templom', 'ima', 'Biblia'],
        exercises: [
          {
            id: '1',
            type: 'translation',
            question: '다음을 헝가리어로 번역하세요: 하나님',
            correctAnswer: 'Isten',
            explanation: 'Isten은 헝가리어로 하나님을 의미합니다.',
            points: 15,
          },
        ],
      },
      estimatedDuration: 20,
      difficulty: 2,
      tags: ['종교', '어휘', 'A1'],
      isPublished: true,
    },
    {
      title: '기본 설교문 구조',
      description: '헝가리어 설교문의 기본 구조를 이해합니다.',
      level: CEFRLevel.B1,
      type: LessonType.WRITING,
      category: '설교',
      content: {
        type: 'writing',
        prompts: [
          {
            id: '1',
            topic: '사랑',
            instructions: '사랑을 주제로 한 간단한 설교 개요를 작성하세요.',
            minWords: 100,
            maxWords: 200,
            level: CEFRLevel.B1,
            category: 'SERMON',
          },
        ],
        examples: [
          'Bevezetés: Mi a szeretet?',
          'Fő rész: A szeretet példái a Bibliában',
          'Következtetés: Hogyan élhetünk szeretetben?',
        ],
      },
      estimatedDuration: 30,
      difficulty: 5,
      tags: ['설교', '작문', 'B1'],
      isPublished: true,
    },
  ];

  // 레슨 데이터 삽입
  for (const lesson of lessons) {
    await prisma.lesson.upsert({
      where: { id: `lesson_${lesson.title.replace(/\s+/g, '_')}` },
      update: {},
      create: {
        id: `lesson_${lesson.title.replace(/\s+/g, '_')}`,
        ...lesson,
      },
    });
  }

  console.log('✅ 레슨 데이터 삽입 완료');

  // 테스트 사용자 생성
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: '김목사',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      currentLevel: CEFRLevel.A2,
      targetLevel: CEFRLevel.B2,
      learningGoals: [LearningGoal.SERMON_WRITING, LearningGoal.PRONUNCIATION],
      emailVerified: true,
    },
  });

  console.log('✅ 테스트 사용자 생성 완료');

  // 테스트 사용자를 위한 학습 통계 초기화
  await prisma.learningStats.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      studyStreakDays: 5,
      totalStudyTime: 150,
      totalLessons: lessons.length,
      completedLessons: 1,
      totalWords: vocabularyItems.length,
      masteredWords: 3,
      averageScore: 78.5,
      bestScore: 95.0,
      weeklyGoalMinutes: 300,
      weeklyProgressMinutes: 180,
    },
  });

  console.log('✅ 학습 통계 초기화 완료');

  console.log('🎉 데이터베이스 시드 완료!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 시드 실행 중 오류:', e);
    await prisma.$disconnect();
    process.exit(1);
  });