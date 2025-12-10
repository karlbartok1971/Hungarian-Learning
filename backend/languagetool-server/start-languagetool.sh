#!/bin/bash

# LanguageTool 서버 시작 스크립트

echo "🔧 Starting LanguageTool Hungarian Grammar Server..."

# 환경변수 설정
export LANGUAGETOOL_PORT=${LANGUAGETOOL_PORT:-8010}

# LanguageTool 다운로드 확인
if [ ! -d "languagetool" ]; then
    echo "📥 Downloading LanguageTool..."
    LANGUAGETOOL_VERSION=6.3

    wget -O LanguageTool-${LANGUAGETOOL_VERSION}.zip \
        https://languagetool.org/download/LanguageTool-${LANGUAGETOOL_VERSION}.zip

    unzip LanguageTool-${LANGUAGETOOL_VERSION}.zip
    mv LanguageTool-${LANGUAGETOOL_VERSION} languagetool
    rm LanguageTool-${LANGUAGETOOL_VERSION}.zip

    echo "✅ LanguageTool downloaded successfully"
fi

# 사용자 정의 규칙 복사
if [ -d "custom-rules" ]; then
    echo "📋 Installing custom Hungarian rules..."
    cp -r custom-rules/* languagetool/org/languagetool/rules/hu/ 2>/dev/null || true
    echo "✅ Custom rules installed"
fi

# Java 버전 확인
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
echo "☕ Java version: $JAVA_VERSION"

# LanguageTool 디렉토리로 이동
cd languagetool

# 서버 시작 (헝가리어 특화 설정)
echo "🚀 Starting LanguageTool server on port $LANGUAGETOOL_PORT..."

java \
    -Xmx512m \
    -cp languagetool-server.jar \
    org.languagetool.server.HTTPServer \
    --port $LANGUAGETOOL_PORT \
    --allow-origin "*" \
    --public \
    --languageModel . \
    --config ../languagetool-config.properties

echo "❌ LanguageTool server stopped"