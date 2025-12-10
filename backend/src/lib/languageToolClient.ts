import axios, { AxiosInstance } from 'axios';

/**
 * LanguageTool Client
 * LanguageTool 서버와 통신하는 Node.js 클라이언트
 * 헝가리어 문법 검사 및 스타일 검증 전용
 */

export interface LanguageToolCheckRequest {
  text: string;
  language?: string;
  enabledRules?: string[];
  disabledRules?: string[];
  enabledCategories?: string[];
  disabledCategories?: string[];
  preferredVariants?: string;
}

export interface LanguageToolMatch {
  message: string;
  shortMessage?: string;
  offset: number;
  length: number;
  replacements: Array<{
    value: string;
    shortDescription?: string;
  }>;
  context: {
    text: string;
    offset: number;
    length: number;
  };
  sentence: string;
  type: {
    typeName: string;
  };
  rule: {
    id: string;
    description: string;
    issueType: string;
    category: {
      id: string;
      name: string;
    };
    subId?: string;
    sourceFile?: string;
  };
  ignoreForIncompleteSentence?: boolean;
  contextForSureMatch?: number;
}

export interface LanguageToolResponse {
  software: {
    name: string;
    version: string;
    buildDate: string;
    apiVersion: number;
    premium: boolean;
    premiumHint?: string;
    status: string;
  };
  warnings?: {
    incompleteResults: boolean;
  };
  language: {
    name: string;
    code: string;
    detectedLanguage: {
      name: string;
      code: string;
      confidence: number;
    };
  };
  matches: LanguageToolMatch[];
}

export interface LanguageToolLanguage {
  name: string;
  code: string;
  longCode: string;
}

export class LanguageToolClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private isConnected: boolean = false;

  constructor(baseUrl: string = 'http://localhost:8010') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30초 타임아웃
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    });

    // 응답 인터셉터로 에러 처리
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('LanguageTool API Error:', error.message);
        throw new Error(`LanguageTool 서버 통신 실패: ${error.message}`);
      }
    );
  }

  /**
   * 서버 연결 상태 확인
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/v2/languages');
      this.isConnected = response.status === 200;
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      console.warn('LanguageTool server is not available:', error);
      return false;
    }
  }

  /**
   * 지원하는 언어 목록 조회
   */
  async getLanguages(): Promise<LanguageToolLanguage[]> {
    try {
      const response = await this.client.get('/v2/languages');
      return response.data;
    } catch (error) {
      throw new Error(`언어 목록 조회 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 텍스트 문법 검사
   */
  async checkText(request: LanguageToolCheckRequest): Promise<LanguageToolResponse> {
    if (!this.isConnected) {
      const connected = await this.checkConnection();
      if (!connected) {
        throw new Error('LanguageTool 서버에 연결할 수 없습니다');
      }
    }

    try {
      // LanguageTool API는 form-encoded 데이터를 요구함
      const params = new URLSearchParams();
      params.append('text', request.text);
      params.append('language', request.language || 'hu'); // 헝가리어 기본값

      if (request.enabledRules && request.enabledRules.length > 0) {
        params.append('enabledRules', request.enabledRules.join(','));
      }

      if (request.disabledRules && request.disabledRules.length > 0) {
        params.append('disabledRules', request.disabledRules.join(','));
      }

      if (request.enabledCategories && request.enabledCategories.length > 0) {
        params.append('enabledCategories', request.enabledCategories.join(','));
      }

      if (request.disabledCategories && request.disabledCategories.length > 0) {
        params.append('disabledCategories', request.disabledCategories.join(','));
      }

      if (request.preferredVariants) {
        params.append('preferredVariants', request.preferredVariants);
      }

      const response = await this.client.post('/v2/check', params);
      return response.data;
    } catch (error) {
      throw new Error(`문법 검사 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 헝가리어 설교문 전용 문법 검사
   */
  async checkHungarianSermon(text: string): Promise<LanguageToolResponse> {
    return await this.checkText({
      text,
      language: 'hu',
      enabledRules: [
        'HU_ARTICLE_AGREEMENT_THEOLOGICAL',
        'HU_ARTICLE_AGREEMENT_CONSONANT',
        'HU_THEOLOGICAL_CASE_AGREEMENT',
        'HU_SERMON_GREETING',
        'HU_INFORMAL_PRONOUN',
        'HU_BIBLE_CITATION_FORMAT',
        'HU_SERMON_CONCLUSION',
        'HU_REPETITIVE_STRUCTURE',
        'HU_THEOLOGICAL_ACCURACY',
        'HU_WORD_ORDER_EMPHASIS',
        'HU_RESPECTFUL_LANGUAGE'
      ],
      disabledRules: [
        'WHITESPACE_RULE', // 공백 규칙 비활성화 (설교문에서는 유연하게)
        'UPPERCASE_SENTENCE_START' // 대문자 시작 규칙 (기도문 등에서 유연하게)
      ]
    });
  }

  /**
   * 기본 헝가리어 문법 검사 (일반 텍스트용)
   */
  async checkHungarianGrammar(text: string): Promise<LanguageToolResponse> {
    return await this.checkText({
      text,
      language: 'hu',
      enabledCategories: [
        'GRAMMAR',
        'TYPOS',
        'STYLE'
      ],
      disabledCategories: [
        'COLLOQUIALISMS' // 구어체 규칙 비활성화
      ]
    });
  }

  /**
   * 문체 검사 (격식도 및 일관성)
   */
  async checkStyle(text: string, formalLevel: 'formal' | 'informal' = 'formal'): Promise<LanguageToolResponse> {
    const disabledRules = formalLevel === 'formal'
      ? ['INFORMAL_PRONOUN', 'COLLOQUIAL_EXPRESSION']
      : ['FORMAL_PRONOUN', 'ARCHAIC_EXPRESSION'];

    return await this.checkText({
      text,
      language: 'hu',
      enabledCategories: ['STYLE', 'REDUNDANCY'],
      disabledRules
    });
  }

  /**
   * 배치 문법 검사 (여러 텍스트를 한 번에 처리)
   */
  async checkBatch(texts: string[]): Promise<LanguageToolResponse[]> {
    const results: LanguageToolResponse[] = [];

    // 병렬 처리 (최대 3개씩)
    const batchSize = 3;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const promises = batch.map(text => this.checkHungarianSermon(text));

      try {
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Batch grammar check failed for batch ${i / batchSize + 1}:`, error);
        // 실패한 배치는 개별적으로 재시도
        for (const text of batch) {
          try {
            const result = await this.checkHungarianSermon(text);
            results.push(result);
          } catch (individualError) {
            console.error(`Individual grammar check failed for text: ${text.slice(0, 50)}...`);
            // 기본값으로 채움
            results.push({
              software: {
                name: 'LanguageTool',
                version: 'unknown',
                buildDate: 'unknown',
                apiVersion: 1,
                premium: false,
                status: 'error'
              },
              language: {
                name: 'Hungarian',
                code: 'hu',
                detectedLanguage: {
                  name: 'Hungarian',
                  code: 'hu',
                  confidence: 1.0
                }
              },
              matches: []
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * 연결 상태 반환
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * 베이스 URL 설정
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
    this.client.defaults.baseURL = url;
    this.isConnected = false; // 재연결 필요
  }

  /**
   * 연결 재시도 (지수 백오프 포함)
   */
  async reconnect(maxRetries: number = 3): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      const connected = await this.checkConnection();
      if (connected) {
        console.log(`LanguageTool server reconnected after ${i + 1} attempts`);
        return true;
      }

      // 지수 백오프: 1초, 2초, 4초 대기
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    console.error(`Failed to reconnect to LanguageTool server after ${maxRetries} attempts`);
    return false;
  }

  /**
   * 서버 상태 모니터링 시작
   */
  startHealthMonitoring(intervalMs: number = 60000): NodeJS.Timeout {
    return setInterval(async () => {
      const isHealthy = await this.checkConnection();
      if (!isHealthy && this.isConnected) {
        console.warn('LanguageTool server connection lost, attempting to reconnect...');
        await this.reconnect();
      }
    }, intervalMs);
  }
}

// 싱글톤 인스턴스
let languageToolClient: LanguageToolClient | null = null;

export function getLanguageToolClient(baseUrl?: string): LanguageToolClient {
  if (!languageToolClient) {
    languageToolClient = new LanguageToolClient(baseUrl);
  }
  return languageToolClient;
}

// 기본 인스턴스 내보내기
export const languageTool = getLanguageToolClient();