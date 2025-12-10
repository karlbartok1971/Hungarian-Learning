import { describe, beforeEach, test, expect } from '@jest/globals';
import {
  validateArticleAgreement,
  checkCaseAgreement,
  validateVerbConjugation,
  checkWordOrder,
  analyzeDefiniteConjugation,
  validatePossessiveAgreement,
  checkNumberAgreement,
  detectCommonErrors,
  suggestCorrections,
  calculateConfidence
} from '../../src/utils/grammarUtils';

/**
 * Hungarian Grammar Utilities Unit Tests
 *
 * 헝가리어 설교문 작성을 위한 문법 검사 유틸리티들의 단위 테스트
 * 정관사, 격변화, 동사 활용, 어순 등 헝가리어 핵심 문법 규칙 검증
 */

describe('Hungarian Grammar Utils Unit Tests', () => {

  describe('Article Agreement Validation', () => {
    test('정관사 a/az의 올바른 사용을 검증해야 함', () => {
      // 자음으로 시작하는 단어들
      const consonantWords = [
        { word: 'ember', article: 'a', expected: true },
        { word: 'templomban', article: 'a', expected: true },
        { word: 'királyság', article: 'a', expected: true },
        { word: 'szeretet', article: 'a', expected: true }
      ];

      consonantWords.forEach(({ word, article, expected }) => {
        expect(validateArticleAgreement(article, word)).toBe(expected);
      });

      // 모음으로 시작하는 단어들
      const vowelWords = [
        { word: 'ember', article: 'az', expected: false }, // a가 정확
        { word: 'Úr', article: 'az', expected: true },
        { word: 'ige', article: 'az', expected: true },
        { word: 'ország', article: 'az', expected: true },
        { word: 'evangélium', article: 'az', expected: true }
      ];

      vowelWords.forEach(({ word, article, expected }) => {
        expect(validateArticleAgreement(article, word)).toBe(expected);
      });
    });

    test('복잡한 단어의 정관사 사용을 정확히 판단해야 함', () => {
      const complexCases = [
        { phrase: 'az egyetem', expected: true },
        { phrase: 'a egyetem', expected: false },
        { phrase: 'az istentisztelet', expected: true },
        { phrase: 'a gyülekezet', expected: true },
        { phrase: 'az örömhír', expected: true }
      ];

      complexCases.forEach(({ phrase, expected }) => {
        const [article, word] = phrase.split(' ');
        expect(validateArticleAgreement(article, word)).toBe(expected);
      });
    });
  });

  describe('Case Agreement Validation', () => {
    test('주격-목적격 격변화를 올바르게 검증해야 함', () => {
      const caseTests = [
        {
          noun: 'ember',
          case: 'nominative',
          form: 'ember',
          expected: true
        },
        {
          noun: 'ember',
          case: 'accusative',
          form: 'embert',
          expected: true
        },
        {
          noun: 'könyv',
          case: 'accusative',
          form: 'könyvet',
          expected: true
        },
        {
          noun: 'templom',
          case: 'sublative',
          form: 'templomba',
          expected: true
        },
        {
          noun: 'Isten',
          case: 'dative',
          form: 'Istennek',
          expected: true
        }
      ];

      caseTests.forEach(({ noun, case: grammaticalCase, form, expected }) => {
        expect(checkCaseAgreement(noun, grammaticalCase, form)).toBe(expected);
      });
    });

    test('잘못된 격변화를 감지해야 함', () => {
      const incorrectCases = [
        {
          noun: 'ember',
          case: 'accusative',
          form: 'ember', // 올바른 형태: embert
          expected: false
        },
        {
          noun: 'könyv',
          case: 'accusative',
          form: 'könyv', // 올바른 형태: könyvet
          expected: false
        }
      ];

      incorrectCases.forEach(({ noun, case: grammaticalCase, form, expected }) => {
        expect(checkCaseAgreement(noun, grammaticalCase, form)).toBe(expected);
      });
    });
  });

  describe('Verb Conjugation Validation', () => {
    test('동사의 인칭별 활용을 검증해야 함', () => {
      const conjugationTests = [
        {
          verb: 'van',
          person: 'én',
          form: 'vagyok',
          expected: true
        },
        {
          verb: 'van',
          person: 'te',
          form: 'vagy',
          expected: true
        },
        {
          verb: 'van',
          person: 'ő',
          form: 'van',
          expected: true  // 3인칭 단수에서는 van 생략 가능하지만 명시적 사용도 가능
        },
        {
          verb: 'szeret',
          person: 'én',
          form: 'szeretek',
          expected: true
        },
        {
          verb: 'mond',
          person: 'mi',
          form: 'mondunk',
          expected: true
        }
      ];

      conjugationTests.forEach(({ verb, person, form, expected }) => {
        expect(validateVerbConjugation(verb, person, form)).toBe(expected);
      });
    });

    test('잘못된 동사 활용을 감지해야 함', () => {
      const incorrectConjugations = [
        {
          verb: 'van',
          person: 'én',
          form: 'van', // 올바른 형태: vagyok
          expected: false
        },
        {
          verb: 'szeret',
          person: 'te',
          form: 'szeret', // 올바른 형태: szeretsz
          expected: false
        }
      ];

      incorrectConjugations.forEach(({ verb, person, form, expected }) => {
        expect(validateVerbConjugation(verb, person, form)).toBe(expected);
      });
    });
  });

  describe('Definite vs Indefinite Conjugation', () => {
    test('정활용과 부정활용을 구분해야 함', () => {
      const definitenessTests = [
        {
          sentence: 'Olvasom a könyvet',
          verb: 'olvasom',
          object: 'a könyvet',
          expectedType: 'definite',
          isCorrect: true
        },
        {
          sentence: 'Olvasok könyvet',
          verb: 'olvasok',
          object: 'könyvet',
          expectedType: 'indefinite',
          isCorrect: true
        },
        {
          sentence: 'Olvasom könyvet', // 부정목적어에 정활용 - 틀림
          verb: 'olvasom',
          object: 'könyvet',
          expectedType: 'incorrect',
          isCorrect: false
        },
        {
          sentence: 'Szeretem Istent',
          verb: 'szeretem',
          object: 'Istent',
          expectedType: 'definite',
          isCorrect: true
        }
      ];

      definitenessTests.forEach(({ sentence, verb, object, expectedType, isCorrect }) => {
        const result = analyzeDefiniteConjugation(sentence, verb, object);
        expect(result.type).toBe(expectedType);
        expect(result.isCorrect).toBe(isCorrect);
      });
    });
  });

  describe('Word Order Validation', () => {
    test('기본 어순 SOV를 검증해야 함', () => {
      const wordOrderTests = [
        {
          sentence: 'Én olvasom a könyvet',
          expectedOrder: ['subject', 'verb', 'object'],
          isCorrect: true
        },
        {
          sentence: 'A gyerekek játszanak',
          expectedOrder: ['subject', 'verb'],
          isCorrect: true
        },
        {
          sentence: 'Holnap megyek templomba',
          expectedOrder: ['adverb', 'verb', 'object'],
          isCorrect: true
        }
      ];

      wordOrderTests.forEach(({ sentence, expectedOrder, isCorrect }) => {
        const result = checkWordOrder(sentence);
        expect(result.isCorrect).toBe(isCorrect);
        expect(result.detectedOrder).toEqual(expectedOrder);
      });
    });

    test('비정상적인 어순을 감지해야 함', () => {
      const incorrectOrderTests = [
        {
          sentence: 'Olvasom én a könyvet', // 동사가 주어보다 앞에 오는 경우
          isCorrect: false
        }
      ];

      incorrectOrderTests.forEach(({ sentence, isCorrect }) => {
        const result = checkWordOrder(sentence);
        expect(result.isCorrect).toBe(isCorrect);
      });
    });
  });

  describe('Possessive Agreement Validation', () => {
    test('소유격 일치를 검증해야 함', () => {
      const possessiveTests = [
        {
          possessor: 'én',
          possessed: 'könyvem',
          expected: true
        },
        {
          possessor: 'te',
          possessed: 'könyved',
          expected: true
        },
        {
          possessor: 'ő',
          possessed: 'könyve',
          expected: true
        },
        {
          possessor: 'Péter',
          possessed: 'könyve',
          expected: true
        },
        {
          possessor: 'mi',
          possessed: 'könyvünk',
          expected: true
        }
      ];

      possessiveTests.forEach(({ possessor, possessed, expected }) => {
        expect(validatePossessiveAgreement(possessor, possessed)).toBe(expected);
      });
    });
  });

  describe('Number Agreement Validation', () => {
    test('수 일치를 검증해야 함', () => {
      const numberTests = [
        {
          subject: 'ember',
          verb: 'jön',
          expected: true // 단수-단수
        },
        {
          subject: 'emberek',
          verb: 'jönnek',
          expected: true // 복수-복수
        },
        {
          subject: 'ember',
          verb: 'jönnek', // 단수 주어에 복수 동사
          expected: false
        },
        {
          subject: 'gyerekek',
          verb: 'játszik', // 복수 주어에 단수 동사
          expected: false
        }
      ];

      numberTests.forEach(({ subject, verb, expected }) => {
        expect(checkNumberAgreement(subject, verb)).toBe(expected);
      });
    });
  });

  describe('Common Error Detection', () => {
    test('일반적인 헝가리어 오류를 감지해야 함', () => {
      const commonErrorTests = [
        {
          text: 'A egyetem',
          expectedErrors: [
            {
              type: 'article_vowel_error',
              suggestion: 'Az egyetem',
              position: { start: 0, end: 10 }
            }
          ]
        },
        {
          text: 'Én vagyok tanár vagyok',
          expectedErrors: [
            {
              type: 'verb_duplication',
              suggestion: 'Én tanár vagyok',
              position: { start: 16, end: 22 }
            }
          ]
        },
        {
          text: 'A emberek jönnek',
          expectedErrors: [
            {
              type: 'article_vowel_error',
              suggestion: 'Az emberek jönnek',
              position: { start: 0, end: 8 }
            }
          ]
        }
      ];

      commonErrorTests.forEach(({ text, expectedErrors }) => {
        const detectedErrors = detectCommonErrors(text);
        expect(detectedErrors).toHaveLength(expectedErrors.length);

        detectedErrors.forEach((error, index) => {
          expect(error.type).toBe(expectedErrors[index].type);
          expect(error.suggestion).toBe(expectedErrors[index].suggestion);
        });
      });
    });

    test('올바른 문장은 오류를 감지하지 않아야 함', () => {
      const correctTexts = [
        'Az ember jön.',
        'Én tanár vagyok.',
        'A gyerekek játszanak.',
        'Szeretem az Urat.',
        'Holnap megyek templomba.'
      ];

      correctTexts.forEach(text => {
        const errors = detectCommonErrors(text);
        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('Correction Suggestions', () => {
    test('오류에 대한 적절한 수정 제안을 생성해야 함', () => {
      const correctionTests = [
        {
          originalText: 'A ember jön',
          error: {
            type: 'article_vowel_error',
            position: { start: 0, end: 6 }
          },
          expectedSuggestions: [
            {
              correctedText: 'Az ember jön',
              confidence: 0.95,
              explanation: '모음으로 시작하는 단어 앞에는 "az"를 사용해야 합니다'
            }
          ]
        },
        {
          originalText: 'Olvasom könyvet',
          error: {
            type: 'definite_conjugation_error',
            position: { start: 0, end: 15 }
          },
          expectedSuggestions: [
            {
              correctedText: 'Olvasok könyvet',
              confidence: 0.90,
              explanation: '부정목적어와 함께는 부정활용을 사용해야 합니다'
            },
            {
              correctedText: 'Olvasom a könyvet',
              confidence: 0.85,
              explanation: '정활용을 사용하려면 정목적어("a könyvet")가 필요합니다'
            }
          ]
        }
      ];

      correctionTests.forEach(({ originalText, error, expectedSuggestions }) => {
        const suggestions = suggestCorrections(originalText, error);

        expect(suggestions).toHaveLength(expectedSuggestions.length);

        suggestions.forEach((suggestion, index) => {
          expect(suggestion.correctedText).toBe(expectedSuggestions[index].correctedText);
          expect(suggestion.confidence).toBeCloseTo(expectedSuggestions[index].confidence, 2);
          expect(suggestion.explanation).toBe(expectedSuggestions[index].explanation);
        });
      });
    });
  });

  describe('Confidence Calculation', () => {
    test('수정 제안의 신뢰도를 정확히 계산해야 함', () => {
      const confidenceTests = [
        {
          errorType: 'article_vowel_error',
          context: 'simple_case',
          expectedMinConfidence: 0.9
        },
        {
          errorType: 'definite_conjugation_error',
          context: 'complex_sentence',
          expectedMinConfidence: 0.7
        },
        {
          errorType: 'word_order_error',
          context: 'ambiguous',
          expectedMinConfidence: 0.5
        }
      ];

      confidenceTests.forEach(({ errorType, context, expectedMinConfidence }) => {
        const confidence = calculateConfidence(errorType, context);
        expect(confidence).toBeGreaterThanOrEqual(expectedMinConfidence);
        expect(confidence).toBeLessThanOrEqual(1.0);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('빈 입력과 null 값을 적절히 처리해야 함', () => {
      expect(() => validateArticleAgreement('', 'ember')).toThrow();
      expect(() => validateArticleAgreement('a', '')).toThrow();
      expect(() => checkCaseAgreement(null as any, 'accusative', 'embert')).toThrow();
    });

    test('올바르지 않은 문법 용어를 처리해야 함', () => {
      expect(() => checkCaseAgreement('ember', 'invalid_case' as any, 'ember')).toThrow();
      expect(() => validateVerbConjugation('van', 'invalid_person' as any, 'vagyok')).toThrow();
    });

    test('특수 문자와 구두점을 올바르게 처리해야 함', () => {
      const textWithPunctuation = 'Az ember jön, a gyerek pedig játszik.';
      const errors = detectCommonErrors(textWithPunctuation);
      expect(errors).toHaveLength(0); // 구두점 때문에 오류가 발생하지 않아야 함
    });

    test('대소문자를 적절히 처리해야 함', () => {
      expect(validateArticleAgreement('Az', 'ember')).toBe(true);
      expect(validateArticleAgreement('az', 'Ember')).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('긴 텍스트도 효율적으로 처리해야 함', () => {
      const longText = 'Az ember jön. '.repeat(1000);

      const startTime = Date.now();
      const errors = detectCommonErrors(longText);
      const endTime = Date.now();

      const processingTime = endTime - startTime;
      expect(processingTime).toBeLessThan(1000); // 1초 이내 처리
      expect(errors).toHaveLength(0); // 반복되는 올바른 문장이므로 오류 없음
    });
  });
});

// Mock implementations - 실제 구현될 때까지 사용
const mockValidateArticleAgreement = (article: string, word: string): boolean => {
  if (!article || !word) throw new Error('Invalid input');

  const vowelStarts = word.match(/^[aeiouáéíóöőúüű]/i);
  return vowelStarts ? article.toLowerCase() === 'az' : article.toLowerCase() === 'a';
};

const mockCheckCaseAgreement = (noun: string, grammaticalCase: string, form: string): boolean => {
  if (!noun || !grammaticalCase || !form) throw new Error('Invalid input');

  // 간단한 모의 구현
  const cases: Record<string, Record<string, string>> = {
    'ember': {
      'nominative': 'ember',
      'accusative': 'embert'
    },
    'könyv': {
      'nominative': 'könyv',
      'accusative': 'könyvet'
    }
  };

  return cases[noun]?.[grammaticalCase] === form;
};

// 실제 구현이 완료되면 이 부분을 제거하고 실제 함수들을 import
const validateArticleAgreement = mockValidateArticleAgreement;
const checkCaseAgreement = mockCheckCaseAgreement;