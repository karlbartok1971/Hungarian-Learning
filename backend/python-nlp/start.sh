#!/bin/bash

# HuSpaCy 헝가리어 NLP 서버 시작 스크립트

echo "🇭🇺 Starting Hungarian NLP Server with HuSpaCy..."

# 가상환경 생성 (없는 경우)
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# 가상환경 활성화
echo "Activating virtual environment..."
source venv/bin/activate

# 의존성 설치
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# HuSpaCy 헝가리어 모델 다운로드 (아직 설치되지 않은 경우)
echo "Checking Hungarian language model..."
python -c "import spacy; spacy.load('hu_core_news_lg')" 2>/dev/null || {
    echo "Downloading Hungarian language model..."
    python -m spacy download hu_core_news_lg || \
    python -m spacy download hu_core_news_md || \
    python -m spacy download hu_core_news_sm || \
    echo "Warning: No Hungarian model available, using blank model"
}

# 환경 변수 설정
export HUNGARIAN_NLP_PORT=${HUNGARIAN_NLP_PORT:-8001}
export PYTHONPATH=$(pwd)

echo "Starting server on port $HUNGARIAN_NLP_PORT..."

# 서버 시작
python hungarian_nlp_server.py