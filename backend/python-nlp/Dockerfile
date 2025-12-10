FROM python:3.11-slim

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# HuSpaCy 헝가리어 모델 다운로드
RUN python -m spacy download hu_core_news_lg || \
    python -m spacy download hu_core_news_md || \
    python -m spacy download hu_core_news_sm || \
    echo "No Hungarian model available, will use blank model"

# 애플리케이션 코드 복사
COPY . .

# 환경 변수 설정
ENV PYTHONPATH=/app
ENV HUNGARIAN_NLP_PORT=8001

# 포트 노출
EXPOSE 8001

# 헬스체크
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# 애플리케이션 실행
CMD ["python", "hungarian_nlp_server.py"]