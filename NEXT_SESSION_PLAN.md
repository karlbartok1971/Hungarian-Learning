# 📋 Next Session Plan: Admin Page Upgrade & System Stabilization

## 1. 현재 완료된 작업 (Current Status)
- ✅ **Killer Features 구현 완료**:
  - **Swipe Voca**: 틴더 스타일 단어 암기 (애니메이션 적용)
  - **AI Roleplay**: 상황별 회화 채팅 UI (시나리오 선택 가능)
  - **Daily Bible Study**: 말씀 기반 문법 분석 + SWR 연동 + Swipe 모드 통합
- ✅ **Dashboard 고도화**:
  - `useSWR` 기반 실시간 데이터 연동
  - Skeleton Loading 및 에러 핸들링
  - Conquest Map(지도) 제거 후 Roleplay 배너로 대체
- ✅ **Admin Page (기초)**:
  - `frontend/src/pages/admin/index.tsx` UI 구현 (Dashboard, Users, CMS 탭)
  - 레이아웃 분리 (`_app.tsx`에서 사이드바 제외 처리)
  - 전체 국문 패치 완료

---

## 2. 다음 세션 목표 (Goals for Next Session)
**핵심 목표:** "무늬만 관리자 페이지"를 **"실제 제어 가능한 관제탑"**으로 업그레이드.

### A. 백엔드 API 개발 (Admin 전용)
- [ ] `GET /api/admin/stats` 구현: DB에서 실제 총 가입자 수, 학습 데이터 수 조회.
- [ ] `GET /api/admin/users` 구현: 사용자 목록 조회 (Paging 포함).
- [ ] `PATCH /api/admin/users/:id` 구현: 사용자 등급 변경(Premium/Admin) 및 차단 기능.
- [ ] `POST /api/admin/content` 구현: 코드를 건드리지 않고 웹에서 **단어/문법/성경 데이터 추가** 기능.

### B. 프론트엔드 Admin 기능 연동
- [ ] **데이터 연동**: Mock Data 제거하고 `useSWR`로 위 API 연결.
- [ ] **콘텐츠 에디터 (CMS)**:
  - JSON 파일을 직접 수정하지 않고, 폼(Form)을 통해 단어를 추가하는 UI 구현.
  - "오늘의 성경" 문법 분석 데이터를 입력하는 관리자 전용 폼 제작.
- [ ] **보안 강화**: 일반 유저가 `/admin` 접근 시 메인으로 리다이렉트 (Middleware 또는 HOC 적용).

### C. 배포 준비 (Deployment)
- [ ] 최종 빌드 테스트 (`npm run build`)
- [ ] Vercel/Netlify 배포 설정 (`vercel.json` 등)

---

## 3. 주요 파일 위치 (Reference)
- **Admin UI**: `frontend/src/pages/admin/index.tsx`
- **Global Layout**: `frontend/src/pages/_app.tsx` (Line 24: `pagesWithoutLayout` 설정 확인)
- **Backend API**: `backend/src/api/`

---
*Created by Antigravity Agent*
