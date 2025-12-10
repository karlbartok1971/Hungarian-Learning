#!/usr/bin/env python3
"""
Hungarian NLP Server using HuSpaCy
헝가리어 자연어 처리를 위한 FastAPI 서버

Node.js 백엔드에서 호출하는 헝가리어 NLP 전용 마이크로서비스
- 텍스트 분석 (토큰화, 품사 태깅, NER)
- 의존성 구문 분석
- 문법 검사
- 헝가리어 특화 규칙 검증
"""

import spacy
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
from loguru import logger
import os
from dotenv import load_dotenv

load_dotenv()

# FastAPI 앱 초기화
app = FastAPI(
    title="Hungarian NLP Server",
    description="HuSpaCy 기반 헝가리어 자연어 처리 서비스",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HuSpaCy 모델 로드
nlp = None

def load_hungarian_model():
    """헝가리어 SpaCy 모델 로드"""
    global nlp
    try:
        # hu_core_news_lg 모델 로드 시도
        nlp = spacy.load("hu_core_news_lg")
        logger.info("Hungarian large model loaded successfully")
    except OSError:
        try:
            # 대안: hu_core_news_md 모델
            nlp = spacy.load("hu_core_news_md")
            logger.info("Hungarian medium model loaded successfully")
        except OSError:
            try:
                # 대안: hu_core_news_sm 모델
                nlp = spacy.load("hu_core_news_sm")
                logger.info("Hungarian small model loaded successfully")
            except OSError:
                # 모델이 없는 경우 빈 모델로 시작
                nlp = spacy.blank("hu")
                logger.warning("No pre-trained Hungarian model found, using blank model")

# 요청/응답 모델들
class TextAnalysisRequest(BaseModel):
    text: str
    include_entities: bool = True
    include_dependencies: bool = True
    include_sentiment: bool = False

class Token(BaseModel):
    text: str
    lemma: str
    pos: str
    tag: str
    start: int
    end: int
    is_theological_term: bool = False

class Sentence(BaseModel):
    text: str
    start: int
    end: int
    sentiment: str = "neutral"
    complexity_score: int = 5
    theological_content: bool = False

class Entity(BaseModel):
    text: str
    label: str
    start: int
    end: int
    confidence: float = 1.0

class Dependency(BaseModel):
    head: str
    child: str
    relation: str
    head_index: int
    child_index: int

class TextAnalysisResponse(BaseModel):
    tokens: List[Token]
    sentences: List[Sentence]
    entities: List[Entity]
    dependencies: List[Dependency]
    metadata: Dict[str, Any]

class GrammarCheckRequest(BaseModel):
    text: str
    level: str = "B1"
    check_style: bool = True

class GrammarError(BaseModel):
    type: str
    position: Dict[str, int]
    original_text: str
    suggested_correction: str
    explanation_korean: str
    severity: str
    confidence: float

class GrammarCheckResponse(BaseModel):
    errors: List[GrammarError]
    corrected_text: str
    confidence_score: float
    overall_score: int

# 헝가리어 신학 용어 데이터베이스 (기본)
THEOLOGICAL_TERMS = {
    'isten': {'korean': '하나님', 'category': 'theology'},
    'jézus': {'korean': '예수', 'category': 'christology'},
    'krisztus': {'korean': '그리스도', 'category': 'christology'},
    'kegyelem': {'korean': '은혜', 'category': 'soteriology'},
    'szeretet': {'korean': '사랑', 'category': 'theology'},
    'üdvösség': {'korean': '구원', 'category': 'soteriology'},
    'hit': {'korean': '믿음', 'category': 'soteriology'},
    'imádság': {'korean': '기도', 'category': 'spiritual_practice'},
    'biblia': {'korean': '성경', 'category': 'biblical_studies'},
    'evangélium': {'korean': '복음', 'category': 'biblical_studies'},
    'szentlélek': {'korean': '성령', 'category': 'pneumatology'},
    'gyülekezet': {'korean': '교회', 'category': 'ecclesiology'},
    'keresztség': {'korean': '세례', 'category': 'sacraments'},
    'úrvacsora': {'korean': '성찬', 'category': 'sacraments'},
    'bűn': {'korean': '죄', 'category': 'hamartiology'},
    'megbocsátás': {'korean': '용서', 'category': 'soteriology'},
    'feltámadás': {'korean': '부활', 'category': 'eschatology'},
    'mennyország': {'korean': '천국', 'category': 'eschatology'},
    'pokol': {'korean': '지옥', 'category': 'eschatology'},
    'prédikáció': {'korean': '설교', 'category': 'homiletics'}
}

# 헝가리어 문법 규칙
HUNGARIAN_GRAMMAR_RULES = [
    {
        'id': 'article_vowel',
        'pattern': r'\ba\s+[aeiouáéíóöőúüű]',
        'correction': lambda m: m.group(0).replace('a ', 'az '),
        'explanation': '모음으로 시작하는 단어 앞에는 "az"를 사용해야 합니다',
        'severity': 'high'
    },
    {
        'id': 'article_consonant',
        'pattern': r'\baz\s+[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]',
        'correction': lambda m: m.group(0).replace('az ', 'a '),
        'explanation': '자음으로 시작하는 단어 앞에는 "a"를 사용해야 합니다',
        'severity': 'high'
    }
]

@app.on_event("startup")
async def startup_event():
    """서버 시작 시 모델 로드"""
    load_hungarian_model()
    logger.info("Hungarian NLP Server started successfully")

@app.get("/")
async def root():
    """헬스 체크"""
    return {
        "message": "Hungarian NLP Server is running",
        "model_loaded": nlp is not None,
        "model_name": nlp.meta.get('name', 'unknown') if nlp else None
    }

@app.post("/analyze", response_model=TextAnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    """텍스트 분석 - 토큰화, 품사 태깅, NER, 의존성 분석"""
    if not nlp:
        raise HTTPException(status_code=500, detail="NLP model not loaded")

    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    try:
        # SpaCy로 텍스트 처리
        doc = nlp(request.text)

        # 토큰 추출
        tokens = []
        for token in doc:
            is_theological = token.lemma_.lower() in THEOLOGICAL_TERMS
            tokens.append(Token(
                text=token.text,
                lemma=token.lemma_,
                pos=token.pos_,
                tag=token.tag_,
                start=token.idx,
                end=token.idx + len(token.text),
                is_theological_term=is_theological
            ))

        # 문장 분할
        sentences = []
        for sent in doc.sents:
            theological_content = any(
                token.lemma_.lower() in THEOLOGICAL_TERMS
                for token in sent
            )

            sentences.append(Sentence(
                text=sent.text,
                start=sent.start_char,
                end=sent.end_char,
                sentiment=analyze_sentiment(sent.text),
                complexity_score=calculate_complexity(sent.text),
                theological_content=theological_content
            ))

        # 명명된 개체 인식
        entities = []
        if request.include_entities:
            for ent in doc.ents:
                entities.append(Entity(
                    text=ent.text,
                    label=ent.label_,
                    start=ent.start_char,
                    end=ent.end_char,
                    confidence=0.9  # SpaCy는 confidence를 직접 제공하지 않음
                ))

            # 신학 용어도 개체로 추가
            for token in doc:
                if token.lemma_.lower() in THEOLOGICAL_TERMS:
                    entities.append(Entity(
                        text=token.text,
                        label="THEOLOGICAL_TERM",
                        start=token.idx,
                        end=token.idx + len(token.text),
                        confidence=1.0
                    ))

        # 의존성 분석
        dependencies = []
        if request.include_dependencies:
            for token in doc:
                if token.dep_ != "ROOT":
                    dependencies.append(Dependency(
                        head=token.head.text,
                        child=token.text,
                        relation=token.dep_,
                        head_index=token.head.i,
                        child_index=token.i
                    ))

        # 메타데이터 계산
        theological_count = sum(1 for token in tokens if token.is_theological_term)
        metadata = {
            "total_words": len(tokens),
            "total_sentences": len(sentences),
            "avg_sentence_length": len(tokens) / len(sentences) if sentences else 0,
            "theological_term_count": theological_count,
            "complexity_level": determine_complexity_level(tokens, sentences)
        }

        return TextAnalysisResponse(
            tokens=tokens,
            sentences=sentences,
            entities=entities,
            dependencies=dependencies,
            metadata=metadata
        )

    except Exception as e:
        logger.error(f"Text analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/check-grammar", response_model=GrammarCheckResponse)
async def check_grammar(request: GrammarCheckRequest):
    """헝가리어 문법 검사"""
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    try:
        errors = []
        corrected_text = request.text

        # 헝가리어 특화 규칙 검사
        for rule in HUNGARIAN_GRAMMAR_RULES:
            matches = list(re.finditer(rule['pattern'], request.text, re.IGNORECASE))
            for match in matches:
                # 수정 제안 생성
                suggested = rule['correction'](match)

                error = GrammarError(
                    type=rule['id'],
                    position={
                        "start": match.start(),
                        "end": match.end()
                    },
                    original_text=match.group(0),
                    suggested_correction=suggested,
                    explanation_korean=rule['explanation'],
                    severity=rule['severity'],
                    confidence=0.95
                )
                errors.append(error)

                # 교정된 텍스트 생성
                corrected_text = corrected_text.replace(
                    match.group(0),
                    suggested,
                    1
                )

        # 전체 점수 계산
        error_penalty = len(errors) * 10
        overall_score = max(0, 100 - error_penalty)

        # 신뢰도 점수
        confidence_score = 1.0 if len(errors) == 0 else 0.8

        return GrammarCheckResponse(
            errors=errors,
            corrected_text=corrected_text,
            confidence_score=confidence_score,
            overall_score=overall_score
        )

    except Exception as e:
        logger.error(f"Grammar check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Grammar check failed: {str(e)}")

@app.get("/theological-terms/{term}")
async def get_theological_term(term: str):
    """신학 용어 정보 조회"""
    term_lower = term.lower()
    if term_lower in THEOLOGICAL_TERMS:
        return {
            "term": term,
            "korean_meaning": THEOLOGICAL_TERMS[term_lower]['korean'],
            "category": THEOLOGICAL_TERMS[term_lower]['category'],
            "found": True
        }
    return {"term": term, "found": False}

@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "model_loaded": nlp is not None,
        "version": "1.0.0"
    }

# 헬퍼 함수들
def analyze_sentiment(text: str) -> str:
    """간단한 감정 분석"""
    positive_words = ['szeretet', 'öröm', 'békesség', 'boldogság', 'kegyelem']
    negative_words = ['szomorú', 'bánat', 'harag', 'bűn', 'szenvedés']

    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)

    if positive_count > negative_count:
        return "positive"
    elif negative_count > positive_count:
        return "negative"
    else:
        return "neutral"

def calculate_complexity(text: str) -> int:
    """문장 복잡도 계산 (1-10)"""
    words = text.split()
    word_count = len(words)

    # 긴 단어 개수
    long_words = len([w for w in words if len(w) > 8])

    # 복잡도 점수
    score = min(10, max(1, (word_count // 3) + long_words))
    return score

def determine_complexity_level(tokens: List[Token], sentences: List[Sentence]) -> str:
    """텍스트의 CEFR 레벨 추정"""
    avg_sentence_length = len(tokens) / len(sentences) if sentences else 0
    theological_ratio = sum(1 for t in tokens if t.is_theological_term) / len(tokens) if tokens else 0

    if avg_sentence_length < 8 and theological_ratio < 0.1:
        return "A1"
    elif avg_sentence_length < 12 and theological_ratio < 0.2:
        return "A2"
    elif avg_sentence_length < 16 and theological_ratio < 0.3:
        return "B1"
    else:
        return "B2"

if __name__ == "__main__":
    # 서버 실행
    port = int(os.getenv("HUNGARIAN_NLP_PORT", "8001"))
    uvicorn.run(
        "hungarian_nlp_server:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )