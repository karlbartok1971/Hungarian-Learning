/**
 * AI 튜터 서비스
 * Gemini Flash 모델을 활용한 학습 지원 기능
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GrammarQuestionRequest {
  grammarTopic: string;
  question: string;
  userLevel: string; // A1, A2, B1, B2
  context?: string; // 현재 학습 중인 내용
}

export interface VocabularyExplanationRequest {
  word: string;
  userLevel: string;
  requestType: 'examples' | 'etymology' | 'usage' | 'synonyms' | 'full';
}

export interface WritingFeedbackRequest {
  originalText: string;
  userLevel: string;
  writingType: 'sentence' | 'paragraph' | 'sermon';
  focusAreas?: ('grammar' | 'vocabulary' | 'style' | 'theological')[];
}

export interface ExampleGenerationRequest {
  grammarPoint: string;
  difficulty: string;
  count: number;
}

export class AITutorService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Gemini 1.5 Flash 모델 사용 (빠르고 효율적)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * 문법 질문에 답변
   */
  async answerGrammarQuestion(request: GrammarQuestionRequest): Promise<string> {
    const prompt = `
당신은 한국인을 위한 헝가리어 문법 전문 튜터입니다.

**학습자 레벨**: ${request.userLevel}
**문법 주제**: ${request.grammarTopic}
**질문**: ${request.question}
${request.context ? `**현재 학습 내용**: ${request.context}` : ''}

다음 지침을 따라 답변해주세요:
1. 학습자의 레벨(${request.userLevel})에 맞게 설명하세요
2. 한국어로 명확하고 이해하기 쉽게 설명하세요
3. 구체적인 예문을 3-5개 제시하세요 (헝가리어 + 한국어 번역)
4. 흔한 실수나 주의사항이 있다면 알려주세요
5. 추가 학습 팁이나 관련 문법 사항을 제안하세요

답변 형식:
📚 **설명**
[명확한 문법 설명]

📝 **예문**
1. [헝가리어 예문] → [한국어 번역]
2. ...

⚠️ **주의사항**
[흔한 실수나 주의할 점]

💡 **추가 팁**
[학습 조언]
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * 어휘 심화 설명
   */
  async explainVocabulary(request: VocabularyExplanationRequest): Promise<string> {
    const requestTypePrompts = {
      examples: '더 많은 예문을 제공하세요 (10개 이상)',
      etymology: '어원과 단어의 형성 과정을 상세히 설명하세요',
      usage: '다양한 맥락에서의 사용법을 설명하세요',
      synonyms: '유의어, 반의어, 관련 표현을 제시하세요',
      full: '종합적인 설명 (어원, 용법, 예문, 유의어 모두 포함)'
    };

    const prompt = `
당신은 한국인을 위한 헝가리어 어휘 전문 튜터입니다.

**단어**: ${request.word}
**학습자 레벨**: ${request.userLevel}
**요청 내용**: ${requestTypePrompts[request.requestType]}

다음 지침을 따라 답변해주세요:
1. 학습자의 레벨(${request.userLevel})에 맞게 설명하세요
2. 한국어로 명확하게 설명하세요
3. 실제 사용 맥락을 반영한 예문을 제공하세요
4. 신학적/종교적 맥락에서 사용되는 경우 특별히 표시하세요

답변 형식:
🔤 **단어**: ${request.word}

📖 **의미**
[기본 의미와 뉘앙스]

${request.requestType === 'examples' || request.requestType === 'full' ? `
📝 **예문**
1. [헝가리어] → [한국어]
2. ...
` : ''}

${request.requestType === 'etymology' || request.requestType === 'full' ? `
🌱 **어원**
[단어의 기원과 형성 과정]
` : ''}

${request.requestType === 'usage' || request.requestType === 'full' ? `
💬 **용법**
[다양한 맥락에서의 사용]
` : ''}

${request.requestType === 'synonyms' || request.requestType === 'full' ? `
🔄 **관련 표현**
- 유의어: ...
- 반의어: ...
- 관련어: ...
` : ''}

${request.requestType === 'full' ? `
⛪ **신학적 사용**
[종교적 맥락에서의 특별한 의미나 사용법]
` : ''}
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * 작문 첨삭
   */
  async provideFeedback(request: WritingFeedbackRequest): Promise<string> {
    const writingTypeDescriptions = {
      sentence: '문장',
      paragraph: '단락/문단',
      sermon: '설교문'
    };

    const focusAreasText = request.focusAreas?.length
      ? `특히 다음 영역에 집중해주세요: ${request.focusAreas.join(', ')}`
      : '모든 영역을 종합적으로 검토해주세요';

    const prompt = `
당신은 한국인을 위한 헝가리어 작문 첨삭 전문가입니다.

**학습자 레벨**: ${request.userLevel}
**작문 유형**: ${writingTypeDescriptions[request.writingType]}
**검토 요청**: ${focusAreasText}

**학습자의 작문**:
${request.originalText}

다음 지침을 따라 첨삭해주세요:
1. 학습자의 레벨(${request.userLevel})을 고려하여 피드백하세요
2. 문법 오류를 찾아 수정안을 제시하세요
3. 더 자연스러운 표현을 제안하세요
4. 어휘 선택이 적절한지 검토하세요
${request.writingType === 'sermon' ? '5. 신학적/종교적 표현의 적절성을 검토하세요' : ''}
6. 긍정적인 피드백과 개선점을 균형있게 제시하세요

답변 형식:
✅ **잘된 점**
[긍정적인 피드백]

📝 **수정된 버전**
[완전히 수정된 텍스트]

🔧 **상세 수정 사항**

1. **문법**
   - [원문] → [수정] : [설명]

2. **어휘**
   - [원문] → [수정] : [설명]

3. **표현**
   - [원문] → [수정] : [설명]

${request.writingType === 'sermon' ? `
⛪ **신학적 표현**
[종교적 맥락에서의 개선사항]
` : ''}

💡 **학습 조언**
[향후 개선을 위한 팁]

📊 **종합 평가**
- 문법 정확도: [평가]
- 어휘 적절성: [평가]
- 자연스러움: [평가]
${request.writingType === 'sermon' ? '- 신학적 정확성: [평가]' : ''}
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * 예문 생성
   */
  async generateExamples(request: ExampleGenerationRequest): Promise<string> {
    const prompt = `
당신은 한국인을 위한 헝가리어 예문 생성 전문가입니다.

**문법 포인트**: ${request.grammarPoint}
**난이도**: ${request.difficulty}
**요청 개수**: ${request.count}개

다음 지침을 따라 예문을 생성해주세요:
1. 난이도(${request.difficulty})에 맞는 어휘를 사용하세요
2. 실생활에서 자주 사용하는 자연스러운 문장을 만드세요
3. 각 예문은 서로 다른 맥락과 상황을 반영하세요
4. 일부는 일상 대화, 일부는 종교적 맥락에서 사용 가능한 예문으로 하세요
5. 각 예문에 한국어 번역을 제공하세요

답변 형식:
📝 **${request.grammarPoint} 예문 ${request.count}개**

1. [헝가리어 예문]
   → [한국어 번역]
   💬 [사용 맥락 설명]

2. ...

💡 **패턴 요약**
[이 문법 포인트의 핵심 패턴]
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * 학습 조언 생성
   */
  async provideStudyAdvice(userLevel: string, weakAreas: string[]): Promise<string> {
    const prompt = `
당신은 한국인을 위한 헝가리어 학습 컨설턴트입니다.

**학습자 레벨**: ${userLevel}
**약점 영역**: ${weakAreas.join(', ')}

학습자의 현재 수준과 약점을 고려하여 개인화된 학습 조언을 제공해주세요:

1. 각 약점 영역에 대한 구체적인 학습 전략
2. 추천 학습 순서
3. 일일/주간 학습 계획 제안
4. 활용할 수 있는 학습 자료나 방법
5. 설교문 작성 능력 향상을 위한 특별 팁

답변 형식:
🎯 **개인화된 학습 전략**

${weakAreas.map((area, i) => `
${i + 1}. **${area} 개선 전략**
   - 학습 방법: [구체적 방법]
   - 추천 활동: [활동 제안]
   - 예상 기간: [기간]
`).join('\n')}

📅 **추천 학습 계획**

**일일 계획**
- [활동 1]: [시간]
- [활동 2]: [시간]
...

**주간 계획**
- 월: [초점]
- 화: [초점]
...

📚 **추천 자료**
[활용 가능한 자료나 방법]

⛪ **설교문 작성 특화 팁**
[목표 달성을 위한 특별 조언]
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}

export default AITutorService;
