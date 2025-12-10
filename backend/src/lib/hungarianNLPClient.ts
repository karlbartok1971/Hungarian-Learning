import axios, { AxiosInstance } from 'axios';

/**
 * Hungarian NLP Client
 * Node.js에서 Python HuSpaCy 서버와 통신하는 클라이언트
 */

export interface HuSpaCyTextAnalysisRequest {
  text: string;
  include_entities?: boolean;
  include_dependencies?: boolean;
  include_sentiment?: boolean;
}

export interface HuSpaCyToken {
  text: string;
  lemma: string;
  pos: string;
  tag: string;
  start: number;
  end: number;
  is_theological_term: boolean;
}

export interface HuSpaCySentence {
  text: string;
  start: number;
  end: number;
  sentiment: string;
  complexity_score: number;
  theological_content: boolean;
}

export interface HuSpaCyEntity {
  text: string;
  label: string;
  start: number;
  end: number;
  confidence: number;
}

export interface HuSpaCyDependency {
  head: string;
  child: string;
  relation: string;
  head_index: number;
  child_index: number;
}

export interface HuSpaCyAnalysisResponse {
  tokens: HuSpaCyToken[];
  sentences: HuSpaCySentence[];
  entities: HuSpaCyEntity[];
  dependencies: HuSpaCyDependency[];
  metadata: {
    total_words: number;
    total_sentences: number;
    avg_sentence_length: number;
    theological_term_count: number;
    complexity_level: string;
  };
}

export interface HuSpaCyGrammarRequest {
  text: string;
  level?: string;
  check_style?: boolean;
}

export interface HuSpaCyGrammarError {
  type: string;
  position: { start: number; end: number };
  original_text: string;
  suggested_correction: string;
  explanation_korean: string;
  severity: string;
  confidence: number;
}

export interface HuSpaCyGrammarResponse {
  errors: HuSpaCyGrammarError[];
  corrected_text: string;
  confidence_score: number;
  overall_score: number;
}

export interface HuSpaCyTheologicalTerm {
  term: string;
  korean_meaning: string;
  category: string;
  found: boolean;
}

export class HungarianNLPClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private isConnected: boolean = false;

  constructor(baseUrl: string = 'http://localhost:8001') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30초 타임아웃
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 응답 인터셉터로 에러 처리
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('HuSpaCy API Error:', error.message);
        throw new Error(`HuSpaCy 서버 통신 실패: ${error.message}`);
      }
    );
  }

  /**
   * 서버 연결 상태 확인
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      this.isConnected = response.status === 200;
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      console.warn('HuSpaCy server is not available:', error);
      return false;
    }
  }

  /**
   * 서버가 준비되었는지 확인 (모델 로드 포함)
   */
  async isReady(): Promise<boolean> {
    try {
      const response = await this.client.get('/');
      return response.data.model_loaded === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 텍스트 분석 (토큰화, 품사 태깅, NER, 의존성 분석)
   */
  async analyzeText(request: HuSpaCyTextAnalysisRequest): Promise<HuSpaCyAnalysisResponse> {
    if (!this.isConnected) {
      const connected = await this.checkConnection();
      if (!connected) {
        throw new Error('HuSpaCy 서버에 연결할 수 없습니다');
      }
    }

    try {
      const response = await this.client.post('/analyze', request);
      return response.data;
    } catch (error) {
      throw new Error(`텍스트 분석 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 문법 검사
   */
  async checkGrammar(request: HuSpaCyGrammarRequest): Promise<HuSpaCyGrammarResponse> {
    if (!this.isConnected) {
      const connected = await this.checkConnection();
      if (!connected) {
        throw new Error('HuSpaCy 서버에 연결할 수 없습니다');
      }
    }

    try {
      const response = await this.client.post('/check-grammar', request);
      return response.data;
    } catch (error) {
      throw new Error(`문법 검사 실패: ${(error as Error).message}`);
    }
  }

  /**
   * 신학 용어 조회
   */
  async getTheologicalTerm(term: string): Promise<HuSpaCyTheologicalTerm> {
    try {
      const response = await this.client.get(`/theological-terms/${encodeURIComponent(term)}`);
      return response.data;
    } catch (error) {
      throw new Error(`신학 용어 조회 실패: ${(error as Error).message}`);
    }
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
        console.log(`HuSpaCy server reconnected after ${i + 1} attempts`);
        return true;
      }

      // 지수 백오프: 1초, 2초, 4초 대기
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    console.error(`Failed to reconnect to HuSpaCy server after ${maxRetries} attempts`);
    return false;
  }

  /**
   * 배치 텍스트 분석 (여러 텍스트를 한 번에 처리)
   */
  async analyzeBatch(texts: string[]): Promise<HuSpaCyAnalysisResponse[]> {
    const results: HuSpaCyAnalysisResponse[] = [];

    // 병렬 처리 (최대 3개씩)
    const batchSize = 3;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const promises = batch.map(text =>
        this.analyzeText({ text, include_entities: true, include_dependencies: true })
      );

      try {
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Batch analysis failed for batch ${i / batchSize + 1}:`, error);
        // 실패한 배치는 개별적으로 재시도
        for (const text of batch) {
          try {
            const result = await this.analyzeText({ text });
            results.push(result);
          } catch (individualError) {
            console.error(`Individual analysis failed for text: ${text.slice(0, 50)}...`);
            // 기본값으로 채움
            results.push({
              tokens: [],
              sentences: [],
              entities: [],
              dependencies: [],
              metadata: {
                total_words: 0,
                total_sentences: 0,
                avg_sentence_length: 0,
                theological_term_count: 0,
                complexity_level: 'A1'
              }
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * 서버 상태 모니터링 시작
   */
  startHealthMonitoring(intervalMs: number = 60000): NodeJS.Timeout {
    return setInterval(async () => {
      const isHealthy = await this.checkConnection();
      if (!isHealthy && this.isConnected) {
        console.warn('HuSpaCy server connection lost, attempting to reconnect...');
        await this.reconnect();
      }
    }, intervalMs);
  }
}

// 싱글톤 인스턴스
let hungarianNLPClient: HungarianNLPClient | null = null;

export function getHungarianNLPClient(baseUrl?: string): HungarianNLPClient {
  if (!hungarianNLPClient) {
    hungarianNLPClient = new HungarianNLPClient(baseUrl);
  }
  return hungarianNLPClient;
}

// 기본 인스턴스 내보내기
export const hungarianNLP = getHungarianNLPClient();