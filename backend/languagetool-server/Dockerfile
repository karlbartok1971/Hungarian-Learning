# LanguageTool 서버 Docker 설정
FROM openjdk:11-jre-slim

# LanguageTool 버전
ENV LANGUAGETOOL_VERSION=6.3

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# LanguageTool 다운로드 및 설치
RUN wget -O LanguageTool-${LANGUAGETOOL_VERSION}.zip \
    https://languagetool.org/download/LanguageTool-${LANGUAGETOOL_VERSION}.zip && \
    unzip LanguageTool-${LANGUAGETOOL_VERSION}.zip && \
    mv LanguageTool-${LANGUAGETOOL_VERSION} languagetool && \
    rm LanguageTool-${LANGUAGETOOL_VERSION}.zip

# LanguageTool 디렉토리로 이동
WORKDIR /app/languagetool

# 헝가리어 사용자 정의 규칙 추가
COPY custom-rules/ ./org/languagetool/rules/hu/

# 포트 설정
EXPOSE 8010

# 헬스체크
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8010/v2/languages || exit 1

# LanguageTool 서버 시작
CMD ["java", "-cp", "languagetool-server.jar", "org.languagetool.server.HTTPServer", \
     "--port", "8010", \
     "--allow-origin", "*", \
     "--languageModel", "/app/languagetool"]