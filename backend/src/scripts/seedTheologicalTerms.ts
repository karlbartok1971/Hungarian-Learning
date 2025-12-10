#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 신학 용어 데이터베이스 시드 스크립트
 * 확장된 헝가리어-한국어 신학 용어 데이터를 데이터베이스에 삽입
 */

const prisma = new PrismaClient();

interface TheologicalTermData {
  id: string;
  hungarian: string;
  korean_meaning: string;
  category: string;
  subcategory?: string;
  difficulty_level: string;
  definition_hungarian: string;
  definition_korean: string;
  etymology?: string;
  pronunciation_ipa?: string;
  example_sentences?: string[];
  biblical_references?: string[];
  english_equivalent?: string;
  latin_equivalent?: string;
  alternative_forms?: string[];
  synonyms?: string[];
  antonyms?: string[];
  related_terms?: string[];
  learning_notes?: string;
  mnemonic_hint?: string;
  cultural_context?: string;
  denominational_differences?: Record<string, string>;
  is_archaic?: boolean;
  first_appearance_year?: number;
  tags?: string[];
  usage_frequency: number;
}

interface SeedData {
  theological_terms: TheologicalTermData[];
}

/**
 * 확장된 신학 용어 데이터
 */
const EXTENDED_THEOLOGICAL_TERMS: TheologicalTermData[] = [
  {
    id: "hu_term_001",
    hungarian: "isten",
    korean_meaning: "하나님",
    category: "theology",
    subcategory: "trinity",
    difficulty_level: "A1",
    definition_hungarian: "A keresztény hit központi alakja, a mindenség Teremtője és Ura.",
    definition_korean: "기독교 신앙의 중심 인물, 우주의 창조주이신 주님",
    etymology: "Ősmagyar eredetű szó, az 'ős' (ős, eredeti) és 'ten' (uralkodó) szavakból",
    pronunciation_ipa: "[ˈiʃtɛn]",
    example_sentences: [
      "Isten szereti az embereket.",
      "Imádkozunk Istenhez minden nap.",
      "Isten végtelen bölcsességgel rendelkezik."
    ],
    biblical_references: ["János 3:16", "1János 4:8", "Ter 1:1"],
    english_equivalent: "God",
    latin_equivalent: "Deus",
    alternative_forms: ["Úr", "Mennyei Atya"],
    synonyms: ["Teremtő", "Mindenható", "Úr"],
    related_terms: ["jézus", "szentlélek", "háromság"],
    learning_notes: "가장 기본적이고 중요한 신학 용어. 모든 기독교 개념의 출발점",
    mnemonic_hint: "'이슈텐'으로 발음. '이슈'처럼 중요한 존재",
    cultural_context: "헝가리 기독교에서는 매우 존경하는 표현으로 사용",
    denominational_differences: {
      "catholic": "Isten, Santo Deus",
      "protestant": "Isten, Úr",
      "orthodox": "Isten"
    },
    is_archaic: false,
    first_appearance_year: 1000,
    tags: ["기본", "필수", "삼위일체", "창조주"],
    usage_frequency: 100
  },
  {
    id: "hu_term_002",
    hungarian: "jézus",
    korean_meaning: "예수",
    category: "christology",
    subcategory: "person_of_christ",
    difficulty_level: "A1",
    definition_hungarian: "Jézus Krisztus, Isten Fia, az emberiség Megváltója.",
    definition_korean: "예수 그리스도, 하나님의 아들, 인류의 구원자",
    etymology: "Héber Jésua névből, görög Iésous-on keresztül",
    pronunciation_ipa: "[ˈjeːzuʃ]",
    example_sentences: [
      "Jézus meghalt értünk a kereszten.",
      "Jézus feltámadt halottaiból.",
      "Jézus tanításait követjük."
    ],
    biblical_references: ["Máté 1:21", "János 14:6", "Róm 6:23"],
    english_equivalent: "Jesus",
    latin_equivalent: "Jesus",
    alternative_forms: ["Jézus Krisztus", "Úr Jézus"],
    synonyms: ["Krisztus", "Megváltó", "Bárány"],
    related_terms: ["krisztus", "megváltás", "kereszt"],
    learning_notes: "기독교 신앙의 핵심. 구원의 유일한 길이신 분",
    mnemonic_hint: "'예주시'로 발음. 예수님이 주신 구원",
    cultural_context: "헝가리에서는 이름으로도 사용되는 신성한 이름",
    denominational_differences: {
      "catholic": "Jézus Krisztus, Megváltó",
      "protestant": "Jézus, Úr",
      "orthodox": "Jézus Krisztus"
    },
    is_archaic: false,
    first_appearance_year: 1000,
    tags: ["기본", "필수", "구원", "십자가"],
    usage_frequency: 95
  },
  // 더 많은 용어들 추가...
  {
    id: "hu_term_003",
    hungarian: "krisztus",
    korean_meaning: "그리스도",
    category: "christology",
    subcategory: "titles_of_christ",
    difficulty_level: "A2",
    definition_hungarian: "A 'felkent' jelentésű cím, Jézus méltóságát kifejező név.",
    definition_korean: "'기름부음받은 자'라는 의미의 칭호, 예수님의 존귀함을 나타내는 이름",
    etymology: "Görög Khristos szóból, amely a héber Mashiah (Messiás) fordítása",
    pronunciation_ipa: "[ˈkriʃtuʃ]",
    example_sentences: [
      "Jézus Krisztus a mi Urunk.",
      "Krisztusban új teremtés vagyunk.",
      "Krisztus szeretete ösztönöz minket."
    ],
    biblical_references: ["Máté 16:16", "2Kor 5:17", "Ef 3:19"],
    english_equivalent: "Christ",
    latin_equivalent: "Christus",
    alternative_forms: ["Felkent", "Messiás"],
    synonyms: ["Messiás", "Felkent", "Király"],
    related_terms: ["jézus", "messiás", "király"],
    learning_notes: "단순한 이름이 아닌 직분과 신분을 나타내는 칭호",
    mnemonic_hint: "'크리스투시'로 발음. 크리스마스의 그 Christ",
    cultural_context: "공식적인 예배와 신학적 담화에서 자주 사용",
    denominational_differences: {
      "catholic": "Krisztus Király",
      "protestant": "Krisztus",
      "orthodox": "Krisztus"
    },
    is_archaic: false,
    first_appearance_year: 1000,
    tags: ["칭호", "메시아", "왕", "구원자"],
    usage_frequency: 80
  },
  {
    id: "hu_term_004",
    hungarian: "szentlélek",
    korean_meaning: "성령",
    category: "pneumatology",
    subcategory: "person_of_spirit",
    difficulty_level: "A2",
    definition_hungarian: "Isten harmadik személye, aki megszentel és vezet bennünket.",
    definition_korean: "하나님의 세 번째 위격, 우리를 거룩하게 하시고 인도하시는 분",
    etymology: "Szent (szent) + lélek (영혼) összetétel",
    pronunciation_ipa: "[ˈsɛntleːlɛk]",
    example_sentences: [
      "A Szentlélek lakik bennünk.",
      "Szentlélek vezérel minket az igazságra.",
      "A Szentlélek ajándékai segítenek."
    ],
    biblical_references: ["János 14:26", "Gal 5:22-23", "ApCsel 2:4"],
    english_equivalent: "Holy Spirit",
    latin_equivalent: "Spiritus Sanctus",
    alternative_forms: ["Szent Szellem", "Vigasztaló"],
    synonyms: ["Vigasztaló", "Isten Lelke"],
    related_terms: ["háromság", "megszentelés", "ajándékok"],
    learning_notes: "삼위일체의 세 번째 위격. 신자의 삶에서 실제적으로 역사하시는 분",
    mnemonic_hint: "'센트렐레크'로 발음. 센터(중심)에 있는 영",
    cultural_context: "은사주의 교회에서 특히 강조되는 개념",
    denominational_differences: {
      "catholic": "Szentlélek, Spiritus Sanctus",
      "protestant": "Szentlélek",
      "orthodox": "Szentlélek"
    },
    is_archaic: false,
    first_appearance_year: 1200,
    tags: ["삼위일체", "은사", "인도", "거룩"],
    usage_frequency: 70
  },
  {
    id: "hu_term_005",
    hungarian: "kegyelem",
    korean_meaning: "은혜",
    category: "soteriology",
    subcategory: "grace",
    difficulty_level: "B1",
    definition_hungarian: "Isten ingyen adott, meg nem érdemelt jósága és szeretete.",
    definition_korean: "하나님께서 거저 주시는, 받을 자격이 없는 선하심과 사랑",
    etymology: "Szláv eredetű, 'kegy' (자비) + '-elem' (접미사)",
    pronunciation_ipa: "[ˈkɛɟɛlɛm]",
    example_sentences: [
      "Kegyelemből vagyunk üdvözülve.",
      "Isten kegyelme elegendő számunkra.",
      "A kegyelem ajándék, nem érdem."
    ],
    biblical_references: ["Ef 2:8-9", "2Kor 12:9", "Róm 3:24"],
    english_equivalent: "grace",
    latin_equivalent: "gratia",
    alternative_forms: ["Isten kegyelme"],
    synonyms: ["irgalom", "jóság"],
    antonyms: ["ítélet", "harag"],
    related_terms: ["üdvösség", "irgalom", "megbocsátás"],
    learning_notes: "기독교 구원론의 핵심 개념. 행위가 아닌 은혜로 구원받는다는 교리",
    mnemonic_hint: "'케졀렘'으로 발음. '케어'하시는 하나님의 '겔(gel)' 같은 부드러운 사랑",
    cultural_context: "개신교에서 특히 강조되는 구원의 원리",
    denominational_differences: {
      "catholic": "kegyelem és cselekedetek",
      "protestant": "sola gratia (오직 은혜)",
      "orthodox": "kegyelem és egyház"
    },
    is_archaic: false,
    first_appearance_year: 1300,
    tags: ["구원", "은혜", "무조건적", "선물"],
    usage_frequency: 85
  },
  {
    id: "hu_term_006",
    hungarian: "üdvösség",
    korean_meaning: "구원",
    category: "soteriology",
    subcategory: "salvation",
    difficulty_level: "B1",
    definition_hungarian: "Isten által adott örök élet és bűnbocsánat.",
    definition_korean: "하나님께서 주시는 영생과 죄 용서",
    etymology: "Üdv (구원) + -össég (명사형 접미사)",
    pronunciation_ipa: "[ˈydvøʃːeːɡ]",
    example_sentences: [
      "Jézusban van az üdvösségünk.",
      "Az üdvösség Isten ajándéka.",
      "Hitre jutottunk az üdvösségre."
    ],
    biblical_references: ["ApCsel 4:12", "Ef 2:8", "Róm 10:9-10"],
    english_equivalent: "salvation",
    latin_equivalent: "salus",
    alternative_forms: ["megváltás", "üdvözülés"],
    synonyms: ["megváltás", "megszabadulás"],
    antonyms: ["kárhozat", "veszedelem"],
    related_terms: ["kegyelem", "hit", "megváltás"],
    learning_notes: "기독교 신앙의 궁극적 목표. 죄와 죽음으로부터의 해방",
    mnemonic_hint: "'위드외셰그'로 발음. '위드(with) 외치는' 기쁨",
    cultural_context: "모든 기독교 종파에서 중심적으로 다루는 주제",
    denominational_differences: {
      "catholic": "üdvösség és szentségek",
      "protestant": "sola fide (오직 믿음)",
      "orthodox": "üdvösség és theosis"
    },
    is_archaic: false,
    first_appearance_year: 1200,
    tags: ["구원", "영생", "해방", "완성"],
    usage_frequency: 75
  }
];

/**
 * 메인 시드 함수
 */
async function main() {
  console.log('🌱 신학 용어 데이터베이스 시드 시작...');

  try {
    // 기존 데이터 정리 (선택적)
    console.log('📝 기존 데이터 확인 중...');
    const existingCount = await prisma.theologicalTerm.count();
    console.log(`기존 신학 용어 수: ${existingCount}개`);

    // 확장된 신학 용어 삽입
    console.log('📚 확장된 신학 용어 데이터 삽입 중...');

    let insertedCount = 0;
    let skippedCount = 0;

    for (const termData of EXTENDED_THEOLOGICAL_TERMS) {
      try {
        // 중복 확인
        const existing = await prisma.theologicalTerm.findUnique({
          where: { hungarian: termData.hungarian }
        });

        if (existing) {
          console.log(`⚠️  이미 존재하는 용어 건너뜀: ${termData.hungarian}`);
          skippedCount++;
          continue;
        }

        // 새 용어 삽입
        await prisma.theologicalTerm.create({
          data: {
            id: termData.id,
            hungarian: termData.hungarian,
            korean_meaning: termData.korean_meaning,
            category: termData.category,
            subcategory: termData.subcategory,
            difficulty_level: termData.difficulty_level,
            definition_hungarian: termData.definition_hungarian,
            definition_korean: termData.definition_korean,
            etymology: termData.etymology,
            pronunciation_ipa: termData.pronunciation_ipa,
            example_sentences: JSON.stringify(termData.example_sentences || []),
            biblical_references: JSON.stringify(termData.biblical_references || []),
            english_equivalent: termData.english_equivalent,
            latin_equivalent: termData.latin_equivalent,
            alternative_forms: JSON.stringify(termData.alternative_forms || []),
            synonyms: JSON.stringify(termData.synonyms || []),
            antonyms: JSON.stringify(termData.antonyms || []),
            related_terms: JSON.stringify(termData.related_terms || []),
            learning_notes: termData.learning_notes,
            mnemonic_hint: termData.mnemonic_hint,
            cultural_context: termData.cultural_context,
            denominational_differences: JSON.stringify(termData.denominational_differences || {}),
            is_archaic: termData.is_archaic || false,
            first_appearance_year: termData.first_appearance_year,
            tags: JSON.stringify(termData.tags || []),
            usage_frequency: termData.usage_frequency,
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        console.log(`✅ 삽입 완료: ${termData.hungarian} (${termData.korean_meaning})`);
        insertedCount++;

      } catch (termError) {
        console.error(`❌ 용어 삽입 실패 (${termData.hungarian}):`, termError);
      }
    }

    // JSON 파일에서 추가 데이터 로드 (있는 경우)
    const jsonFilePath = path.join(__dirname, '../../prisma/theological_terms_extended.json');
    if (fs.existsSync(jsonFilePath)) {
      console.log('📄 외부 JSON 파일에서 추가 데이터 로드 중...');

      const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8')) as SeedData;

      for (const termData of jsonData.theological_terms) {
        try {
          const existing = await prisma.theologicalTerm.findUnique({
            where: { hungarian: termData.hungarian }
          });

          if (existing) {
            skippedCount++;
            continue;
          }

          await prisma.theologicalTerm.create({
            data: {
              id: termData.id,
              hungarian: termData.hungarian,
              korean_meaning: termData.korean_meaning,
              category: termData.category,
              subcategory: termData.subcategory,
              difficulty_level: termData.difficulty_level,
              definition_hungarian: termData.definition_hungarian,
              definition_korean: termData.definition_korean,
              etymology: termData.etymology,
              pronunciation_ipa: termData.pronunciation_ipa,
              example_sentences: JSON.stringify(termData.example_sentences || []),
              biblical_references: JSON.stringify(termData.biblical_references || []),
              english_equivalent: termData.english_equivalent,
              latin_equivalent: termData.latin_equivalent,
              alternative_forms: JSON.stringify(termData.alternative_forms || []),
              synonyms: JSON.stringify(termData.synonyms || []),
              antonyms: JSON.stringify(termData.antonyms || []),
              related_terms: JSON.stringify(termData.related_terms || []),
              learning_notes: termData.learning_notes,
              mnemonic_hint: termData.mnemonic_hint,
              cultural_context: termData.cultural_context,
              denominational_differences: JSON.stringify(termData.denominational_differences || {}),
              is_archaic: termData.is_archaic || false,
              first_appearance_year: termData.first_appearance_year,
              tags: JSON.stringify(termData.tags || []),
              usage_frequency: termData.usage_frequency,
              created_at: new Date(),
              updated_at: new Date()
            }
          });

          insertedCount++;
          console.log(`✅ JSON 데이터 삽입: ${termData.hungarian}`);

        } catch (termError) {
          console.error(`❌ JSON 용어 삽입 실패 (${termData.hungarian}):`, termError);
        }
      }
    }

    // 통계 출력
    const finalCount = await prisma.theologicalTerm.count();
    console.log('\n📊 시드 작업 완료!');
    console.log(`새로 삽입된 용어: ${insertedCount}개`);
    console.log(`건너뛴 용어: ${skippedCount}개`);
    console.log(`총 신학 용어 수: ${finalCount}개`);

    // 카테고리별 통계
    console.log('\n📈 카테고리별 분포:');
    const categoryStats = await prisma.theologicalTerm.groupBy({
      by: ['category'],
      _count: true,
    });

    categoryStats.forEach(stat => {
      console.log(`  ${stat.category}: ${stat._count}개`);
    });

    // 난이도별 통계
    console.log('\n🎯 난이도별 분포:');
    const difficultyStats = await prisma.theologicalTerm.groupBy({
      by: ['difficulty_level'],
      _count: true,
    });

    difficultyStats.forEach(stat => {
      console.log(`  ${stat.difficulty_level}: ${stat._count}개`);
    });

  } catch (error) {
    console.error('❌ 시드 작업 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 스크립트 실행
 */
main()
  .catch((e) => {
    console.error('💥 시드 스크립트 실행 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('🔌 데이터베이스 연결 종료');
    await prisma.$disconnect();
  });