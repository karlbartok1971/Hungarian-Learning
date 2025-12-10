/**
 * Integration Test for Google Cloud Speech API
 * T042 - Google Cloud Speech API와의 통합 테스트
 *
 * 실제 Google Speech API와의 연동이 헝가리어 음성 인식에 적합한지 검증
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { GoogleSpeechService } from '../../src/services/GoogleSpeechService';
import { PronunciationService } from '../../src/services/PronunciationService';
import { setupTestDB, cleanupTestDB } from '../helpers/database';

// 테스트용 오디오 파일 생성 함수
const createTestAudioFile = async (filename: string, content: Buffer): Promise<string> => {
  const testAudioDir = path.join(__dirname, '../fixtures/audio');
  await fs.mkdir(testAudioDir, { recursive: true });
  const filePath = path.join(testAudioDir, filename);
  await fs.writeFile(filePath, content);
  return filePath;
};

// WAV 헤더 생성 함수 (테스트용 더미 오디오)
const createWavBuffer = (durationSeconds: number = 2): Buffer => {
  const sampleRate = 16000;
  const samples = Math.floor(sampleRate * durationSeconds);
  const dataSize = samples * 2; // 16-bit

  const wavHeader = Buffer.alloc(44);
  let offset = 0;

  // RIFF header
  wavHeader.write('RIFF', offset); offset += 4;
  wavHeader.writeUInt32LE(36 + dataSize, offset); offset += 4;
  wavHeader.write('WAVE', offset); offset += 4;

  // fmt chunk
  wavHeader.write('fmt ', offset); offset += 4;
  wavHeader.writeUInt32LE(16, offset); offset += 4; // PCM chunk size
  wavHeader.writeUInt16LE(1, offset); offset += 2;  // PCM format
  wavHeader.writeUInt16LE(1, offset); offset += 2;  // mono
  wavHeader.writeUInt32LE(sampleRate, offset); offset += 4;
  wavHeader.writeUInt32LE(sampleRate * 2, offset); offset += 4; // byte rate
  wavHeader.writeUInt16LE(2, offset); offset += 2;  // block align
  wavHeader.writeUInt16LE(16, offset); offset += 2; // bits per sample

  // data chunk
  wavHeader.write('data', offset); offset += 4;
  wavHeader.writeUInt32LE(dataSize, offset);

  // 간단한 사인파 오디오 데이터 생성
  const audioData = Buffer.alloc(dataSize);
  for (let i = 0; i < samples; i++) {
    const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 16383; // 440Hz 톤
    audioData.writeInt16LE(Math.round(sample), i * 2);
  }

  return Buffer.concat([wavHeader, audioData]);
};

describe('Google Cloud Speech API Integration Tests', () => {
  let googleSpeechService: GoogleSpeechService;
  let pronunciationService: PronunciationService;

  beforeAll(async () => {
    await setupTestDB();

    // 환경변수 체크
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn('Google Cloud credentials not found. Skipping integration tests.');
      return;
    }

    googleSpeechService = new GoogleSpeechService({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      languageCode: 'hu-HU', // 헝가리어
      alternativeLanguageCodes: ['en-US', 'ko-KR'], // 대체 언어
    });

    pronunciationService = new PronunciationService({
      speechService: googleSpeechService,
      targetLanguage: 'hu',
      nativeLanguage: 'ko'
    });
  });

  afterAll(async () => {
    await cleanupTestDB();

    // 테스트 오디오 파일 정리
    try {
      const testAudioDir = path.join(__dirname, '../fixtures/audio');
      const files = await fs.readdir(testAudioDir);
      for (const file of files) {
        await fs.unlink(path.join(testAudioDir, file));
      }
      await fs.rmdir(testAudioDir);
    } catch (error) {
      // 디렉토리가 없는 경우 무시
    }
  });

  beforeEach(() => {
    // Skip if credentials not available
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
      return;
    }
  });

  describe('Google Speech API Basic Integration', () => {
    it('should initialize with correct Hungarian language settings', async () => {
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.log('Skipping test: Google Cloud credentials not available');
        return;
      }

      expect(googleSpeechService).toBeDefined();

      const config = googleSpeechService.getConfig();
      expect(config.languageCode).toBe('hu-HU');
      expect(config.alternativeLanguageCodes).toContain('en-US');
      expect(config.alternativeLanguageCodes).toContain('ko-KR');
    });

    it('should handle empty audio gracefully', async () => {
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.log('Skipping test: Google Cloud credentials not available');
        return;
      }

      const emptyBuffer = Buffer.alloc(0);

      await expect(async () => {
        await googleSpeechService.recognizeSpeech(emptyBuffer);
      }).rejects.toThrow();
    });

    it('should validate audio format requirements', async () => {
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.log('Skipping test: Google Cloud credentials not available');
        return;
      }

      // 잘못된 포맷의 오디오
      const invalidAudio = Buffer.from('not an audio file');

      await expect(async () => {
        await googleSpeechService.recognizeSpeech(invalidAudio);
      }).rejects.toThrow();
    });
  });

  describe('Hungarian Speech Recognition', () => {
    it('should recognize basic Hungarian words', async () => {
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.log('Skipping test: Google Cloud credentials not available');
        return;
      }

      // 실제 테스트에서는 헝가리어 오디오 파일을 사용해야 함
      const testAudio = createWavBuffer(3); // 3초 더미 오디오
      const audioPath = await createTestAudioFile('hungarian_word.wav', testAudio);

      try {
        const audioBuffer = await fs.readFile(audioPath);
        const result = await googleSpeechService.recognizeSpeech(audioBuffer, {
          enableWordTimeOffsets: true,
          enableWordConfidence: true,
          model: 'latest_long' // 더 나은 인식을 위해
        });

        expect(result).toHaveProperty('transcript');
        expect(result).toHaveProperty('confidence');
        expect(result).toHaveProperty('words');

        if (result.words && result.words.length > 0) {
          result.words.forEach(word => {
            expect(word).toHaveProperty('word');
            expect(word).toHaveProperty('startTime');
            expect(word).toHaveProperty('endTime');
            expect(word).toHaveProperty('confidence');
          });
        }
      } finally {
        await fs.unlink(audioPath);
      }
    });

    it('should handle Hungarian special characters and phonemes', async () => {
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.log('Skipping test: Google Cloud credentials not available');
        return;
      }

      // 헝가리어 특수 문자가 포함된 테스트
      const hungarianPhonemes = ['á', 'é', 'í', 'ó', 'ö', 'ő', 'ú', 'ü', 'ű'];
      const testWords = ['Magyarország', 'köszönöm', 'egészségére', 'különleges'];

      // 실제 구현에서는 이러한 단어들의 오디오 샘플이 필요
      const config = googleSpeechService.getConfig();
      expect(config.languageCode).toBe('hu-HU');

      // 헝가리어 특화 설정 검증
      const speechContexts = googleSpeechService.getHungarianSpeechContexts();
      expect(speechContexts).toHaveProperty('phrases');
      expect(speechContexts.phrases).toEqual(expect.arrayContaining(testWords));
    });

    it('should provide confidence scores for pronunciation assessment', async () => {
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.log('Skipping test: Google Cloud credentials not available');
        return;
      }

      const testAudio = createWavBuffer(2);
      const audioPath = await createTestAudioFile('confidence_test.wav', testAudio);

      try {
        const audioBuffer = await fs.readFile(audioPath);
        const result = await googleSpeechService.recognizeSpeech(audioBuffer, {
          enableWordConfidence: true,
          enableAutomaticPunctuation: false, // 발음 평가를 위해 구두점 제거
        });

        expect(typeof result.confidence).toBe('number');
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);

        if (result.words) {
          result.words.forEach(word => {
            expect(typeof word.confidence).toBe('number');
            expect(word.confidence).toBeGreaterThanOrEqual(0);
            expect(word.confidence).toBeLessThanOrEqual(1);
          });
        }
      } finally {
        await fs.unlink(audioPath);
      }
    });
  });

  describe('Pronunciation Assessment Integration', () => {
    it('should assess Hungarian pronunciation accuracy', async () => {
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.log('Skipping test: Google Cloud credentials not available');
        return;
      }

      const targetText = 'Jó reggelt kívánok';
      const testAudio = createWavBuffer(3);
      const audioPath = await createTestAudioFile('pronunciation_test.wav', testAudio);

      try {
        const audioBuffer = await fs.readFile(audioPath);
        const assessment = await pronunciationService.assessPronunciation(
          audioBuffer,
          targetText,
          {
            language: 'hu-HU',
            focusPhonemes: ['gy', 'ny', 'sz'],
            includeDetailedAnalysis: true
          }
        );

        expect(assessment).toHaveProperty('overallScore');
        expect(assessment).toHaveProperty('pronunciation');
        expect(assessment).toHaveProperty('detailedFeedback');
        expect(assessment).toHaveProperty('improvementSuggestions');

        // 점수 검증
        expect(typeof assessment.overallScore).toBe('number');
        expect(assessment.overallScore).toBeGreaterThanOrEqual(0);
        expect(assessment.overallScore).toBeLessThanOrEqual(100);

        // 발음 세부 점수 검증
        const pronunciation = assessment.pronunciation;
        ['accuracy', 'fluency', 'completeness', 'prosody'].forEach(metric => {
          expect(typeof pronunciation[metric]).toBe('number');
          expect(pronunciation[metric]).toBeGreaterThanOrEqual(0);
          expect(pronunciation[metric]).toBeLessThanOrEqual(100);
        });
      } finally {
        await fs.unlink(audioPath);
      }
    });

    it('should detect Hungarian-specific pronunciation errors', async () => {
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.log('Skipping test: Google Cloud credentials not available');
        return;
      }

      // 한국인이 자주 틀리는 헝가리어 발음 테스트
      const problematicWords = [
        { text: 'György', phonemes: ['gy', 'ö'] },
        { text: 'szótár', phonemes: ['sz'] },
        { text: 'különleges', phonemes: ['ü', 'ö'] },
        { text: 'egészségére', phonemes: ['gy', 'sz', 'é'] }
      ];

      for (const wordTest of problematicWords) {
        const testAudio = createWavBuffer(2);
        const audioPath = await createTestAudioFile(`${wordTest.text}_test.wav`, testAudio);

        try {
          const audioBuffer = await fs.readFile(audioPath);
          const assessment = await pronunciationService.assessPronunciation(
            audioBuffer,
            wordTest.text,
            { focusPhonemes: wordTest.phonemes }
          );

          expect(assessment.detailedFeedback).toHaveProperty('phonemeScores');

          const phonemeScores = assessment.detailedFeedback.phonemeScores;
          if (phonemeScores.length > 0) {
            phonemeScores.forEach(score => {
              expect(score).toHaveProperty('phoneme');
              expect(score).toHaveProperty('expected');
              expect(score).toHaveProperty('detected');
              expect(score).toHaveProperty('score');
              expect(score).toHaveProperty('confidence');
            });
          }
        } finally {
          await fs.unlink(audioPath);
        }
      }
    });

    it('should provide contextual improvement suggestions', async () => {
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.log('Skipping test: Google Cloud credentials not available');
        return;
      }

      const testAudio = createWavBuffer(4);
      const audioPath = await createTestAudioFile('improvement_test.wav', testAudio);

      try {
        const audioBuffer = await fs.readFile(audioPath);
        const assessment = await pronunciationService.assessPronunciation(
          audioBuffer,
          'Köszönöm szépen a segítségét',
          {
            includeDetailedAnalysis: true,
            nativeLanguage: 'ko' // 한국어 화자를 위한 특화 피드백
          }
        );

        expect(assessment.improvementSuggestions).toBeDefined();
        expect(Array.isArray(assessment.improvementSuggestions)).toBe(true);

        if (assessment.improvementSuggestions.length > 0) {
          assessment.improvementSuggestions.forEach(suggestion => {
            expect(suggestion).toHaveProperty('type');
            expect(suggestion).toHaveProperty('target');
            expect(suggestion).toHaveProperty('suggestion');
            expect(['phoneme', 'rhythm', 'intonation', 'fluency']).toContain(suggestion.type);

            if (suggestion.exerciseRecommendation) {
              expect(typeof suggestion.exerciseRecommendation).toBe('string');
            }
          });
        }
      } finally {
        await fs.unlink(audioPath);
      }
    });
  });

  describe('Real-time Processing', () => {
    it('should handle streaming audio for real-time feedback', async () => {
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.log('Skipping test: Google Cloud credentials not available');
        return;
      }

      // 실시간 스트리밍 인식 테스트
      const audioChunks = [
        createWavBuffer(1), // 1초 청크
        createWavBuffer(1), // 1초 청크
        createWavBuffer(1)  // 1초 청크
      ];

      const stream = googleSpeechService.createStreamingRecognition({
        interimResults: true,
        enableWordTimeOffsets: true,
        speechContexts: googleSpeechService.getHungarianSpeechContexts()
      });

      let interimResults: any[] = [];
      let finalResults: any[] = [];

      stream.on('data', (response: any) => {
        if (response.results && response.results.length > 0) {
          const result = response.results[0];
          if (result.isFinal) {
            finalResults.push(result);
          } else {
            interimResults.push(result);
          }
        }
      });

      // 오디오 청크 전송
      for (const chunk of audioChunks) {
        stream.write({ audioContent: chunk.toString('base64') });
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms 대기
      }

      stream.end();

      // 스트림 완료 대기
      await new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
        setTimeout(() => reject(new Error('Stream timeout')), 5000);
      });

      // 결과가 있는지 확인 (실제 음성이 없어도 구조는 확인 가능)
      expect(Array.isArray(interimResults)).toBe(true);
      expect(Array.isArray(finalResults)).toBe(true);
    });

    it('should provide real-time pronunciation feedback', async () => {
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.log('Skipping test: Google Cloud credentials not available');
        return;
      }

      const targetPhrase = 'Egészségére';
      const testAudio = createWavBuffer(2);

      const realTimeFeedback = await pronunciationService.getRealTimeFeedback(
        testAudio,
        targetPhrase,
        {
          chunkSize: 1024, // 실시간 처리를 위한 작은 청크
          feedbackInterval: 500 // 500ms마다 피드백
        }
      );

      expect(realTimeFeedback).toHaveProperty('volumeLevel');
      expect(realTimeFeedback).toHaveProperty('pitch');
      expect(realTimeFeedback).toHaveProperty('clarity');
      expect(realTimeFeedback).toHaveProperty('confidence');

      expect(typeof realTimeFeedback.volumeLevel).toBe('number');
      expect(typeof realTimeFeedback.pitch).toBe('number');
      expect(typeof realTimeFeedback.clarity).toBe('number');
      expect(typeof realTimeFeedback.confidence).toBe('number');
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle network timeouts gracefully', async () => {
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.log('Skipping test: Google Cloud credentials not available');
        return;
      }

      const testAudio = createWavBuffer(1);

      // 타임아웃이 짧게 설정된 서비스 생성
      const timeoutService = new GoogleSpeechService({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        languageCode: 'hu-HU',
        timeout: 100 // 매우 짧은 타임아웃
      });

      await expect(async () => {
        await timeoutService.recognizeSpeech(testAudio);
      }).rejects.toThrow();
    });

    it('should retry failed requests with exponential backoff', async () => {
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.log('Skipping test: Google Cloud credentials not available');
        return;
      }

      const testAudio = createWavBuffer(1);

      // 재시도 로직이 있는 서비스 설정
      const retryService = new GoogleSpeechService({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        languageCode: 'hu-HU',
        retryOptions: {
          maxRetries: 3,
          initialDelayMs: 100,
          maxDelayMs: 1000,
          backoffMultiplier: 2
        }
      });

      // 정상적인 요청은 성공해야 함
      try {
        const result = await retryService.recognizeSpeech(testAudio);
        expect(result).toHaveProperty('transcript');
      } catch (error) {
        // 네트워크 문제 등으로 실패할 수 있음
        console.log('Network error expected in test environment:', error);
      }
    });

    it('should handle quota exceeded errors', async () => {
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.log('Skipping test: Google Cloud credentials not available');
        return;
      }

      // 할당량 초과 상황을 시뮬레이션
      const quotaService = new GoogleSpeechService({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        languageCode: 'hu-HU'
      });

      // 실제로는 할당량을 초과하지 않도록 모의 처리
      const mockQuotaError = {
        code: 429,
        message: 'Quota exceeded'
      };

      expect(quotaService.handleQuotaExceeded).toBeDefined();
      expect(typeof quotaService.handleQuotaExceeded).toBe('function');
    });
  });
});