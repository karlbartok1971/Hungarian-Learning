# Hungarian NLP Server (HuSpaCy 통합)

헝가리어 학습 플랫폼을 위한 Python FastAPI 기반 NLP 서버입니다.

## 🚀 빠른 시작

### 1. 로컬 개발 환경

```bash
# Python 가상환경 생성
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 또는
venv\Scripts\activate     # Windows

# 의존성 설치
pip install -r requirements.txt

# 헝가리어 모델 다운로드
python -m spacy download hu_core_news_lg

# 서버 시작
python hungarian_nlp_server.py
```

### 2. 스크립트를 통한 자동 실행

```bash
# 자동 설치 및 실행 (권장)
chmod +x start.sh
./start.sh
```

### 3. Docker 실행

```bash
# Docker 이미지 빌드
docker build -t hungarian-nlp .

# 컨테이너 실행
docker run -p 8001:8001 hungarian-nlp
```

## 📋 API 엔드포인트

### 헬스 체크
- `GET /` - 서버 상태 및 모델 로드 여부 확인
- `GET /health` - 상세 헬스 체크

### 텍스트 분석
- `POST /analyze` - 종합 텍스트 분석 (토큰화, 품사 태깅, NER, 의존성 분석)

```json
{
  "text": "Isten szereti az embereket",
  "include_entities": true,
  "include_dependencies": true,
  "include_sentiment": true
}
```

### 문법 검사
- `POST /check-grammar` - 헝가리어 특화 문법 검사

```json
{
  "text": "A ember jön",
  "level": "B1",
  "check_style": true
}
```

### 신학 용어 조회
- `GET /theological-terms/{term}` - 헝가리어 신학 용어 정보

## 🔧 설정

### 환경 변수

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `HUNGARIAN_NLP_PORT` | `8001` | 서버 포트 |
| `PYTHONPATH` | `.` | Python 경로 |

### 모델 다운로드 우선순위

1. `hu_core_news_lg` (대형 모델 - 가장 정확)
2. `hu_core_news_md` (중형 모델)
3. `hu_core_news_sm` (소형 모델)
4. `blank("hu")` (빈 모델 - 폴백)

## 🛡️ 보안

- CORS 설정: `localhost:3000`, `localhost:3001`, `localhost:3002` 허용
- 입력 검증: Pydantic 모델 기반
- 에러 핸들링: 상세 로그와 사용자 친화적 메시지

## 📊 모니터링

### 로그 레벨
- **INFO**: 일반 동작 로그
- **WARN**: HuSpaCy 모델 로드 실패 등
- **ERROR**: 분석 실패, 서버 오류

### 헬스체크
- Docker: 30초 간격 헬스체크
- Kubernetes: Readiness/Liveness 프로브 지원

## 🔄 Node.js 연동

Node.js 백엔드는 `hungarianNLPClient.ts`를 통해 이 서버와 통신합니다:

```typescript
import { getHungarianNLPClient } from '../lib/hungarianNLPClient';

const client = getHungarianNLPClient('http://localhost:8001');
const result = await client.analyzeText({
  text: "Isten szerete velünk",
  include_entities: true
});
```

## 🐛 문제해결

### 자주 발생하는 문제

1. **모델 다운로드 실패**
```bash
# 수동 다운로드
python -c "import spacy; spacy.download('hu_core_news_lg')"
```

2. **포트 충돌**
```bash
# 다른 포트로 실행
HUNGARIAN_NLP_PORT=8002 python hungarian_nlp_server.py
```

3. **의존성 충돌**
```bash
# 새 가상환경으로 재설치
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

4. **메모리 부족**
- 소형 모델 사용: `hu_core_news_sm`
- 또는 Docker 메모리 증가

## 📈 성능 최적화

### 권장사항
- **프로덕션**: `hu_core_news_lg` 사용
- **개발/테스트**: `hu_core_news_md` 사용
- **제한된 환경**: `hu_core_news_sm` 사용

### 캐싱
- 분석 결과는 Node.js 서버에서 Redis 캐싱
- 중복 요청 최적화

## 📝 개발 노트

### 신학 용어 데이터베이스
현재 54개 기본 용어가 하드코딩되어 있으며, 향후 확장 가능:

- **Theology**: isten, szeretet, kegyelem
- **Christology**: jézus, krisztus
- **Soteriology**: üdvösség, hit, megbocsátás
- **기타 범주들...**

### 문법 규칙
현재 지원하는 헝가리어 특화 규칙:

1. **정관사 규칙**: a/az 올바른 사용
2. **자음/모음 조화**: 헝가리어 음성 규칙
3. **향후 확장**: 격변화, 동사 활용 등

## 🌐 다국어 지원

현재 지원하는 언어:
- **헝가리어**: 주 언어 (HuSpaCy)
- **한국어**: 설명 및 오류 메시지
- **영어**: 기술 용어 및 로그