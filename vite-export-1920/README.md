# 모임 (Moim) — React + Vite

> Cozy Paper & Wood 디자인의 가족·소모임 일정 관리 앱

## 시작하기

\`\`\`bash
npm install
npm run dev
\`\`\`

브라우저에서 http://localhost:5173 으로 접속하세요.

## 프로젝트 구조

\`\`\`
src/
├── main.jsx              # 엔트리 포인트
├── App.jsx               # 화면 데모 셀렉터 (실제 라우팅으로 교체)
├── styles/
│   └── tokens.css        # 디자인 토큰 (color, type, spacing, shadow)
├── components/
│   ├── Icons.jsx         # 24px 라인 아이콘 세트 (IHome, ICalendar 등)
│   ├── Illustrations.jsx # 일러스트 (IllusLogo, IllusCalendar, IllusHouse)
│   ├── MoimUI.jsx        # 공용 UI (Button, Avatar, Tag, TabBar, AppHeader, BottomSheet, TextField, Card, Section, IconButton)
│   └── Calendar.jsx      # MonthCalendar (월간 캘린더 + 도트)
├── data/
│   └── mock.js           # 데모용 mock 데이터
└── screens/
    ├── LoginScreen.jsx
    ├── HomeScreen.jsx
    ├── GroupCalendarScreen.jsx   # 모임 안 캘린더 + AddScheduleSheet 모달
    ├── GlobalCalendarScreen.jsx  # 모든 모임 통합 캘린더
    ├── NotificationsScreen.jsx
    └── MyPageScreen.jsx
\`\`\`

## 디자인 시스템

`tokens.css` 안의 CSS 변수를 직접 수정해서 테마를 바꿀 수 있습니다.

### 컬러 팔레트
- **Paper (배경)**: `--paper-50/100/200/300`
- **Ink (텍스트)**: `--ink-300/500/700/900`
- **Clay (메인 액센트)**: `--clay`, `--clay-100`, `--clay-600`
- **Wood (서브)**: `--wood`
- **카테고리 6종 도트**: `--tag-mustard/sage/coral/sky/plum/rose` (각 `-bg` suffix 있음)

### 라운드/그림자
- `--r-sm/md/lg/xl/pill`
- `--shadow-1/2/3`

### 타이포
- Pretendard Variable (한국어 가독성)
- 본문 14.5~16px, h1 24px+, 캘린더 셀 60px

## 통합 가이드

1. `App.jsx`의 데모 셀렉터를 react-router-dom으로 교체
2. `data/mock.js`를 실제 API 호출로 대체
3. `tokens.css`의 변수만 변경하면 전체 테마 변경 가능
4. 다크 모드: `<html data-theme="dark">` 또는 `prefers-color-scheme` 미디어 쿼리 추가 (tokens.css에 추가 필요)

## Pretendard 폰트 (선택)

`tokens.css`가 Pretendard를 가정합니다. 설치:

\`\`\`bash
npm install pretendard
\`\`\`

`main.jsx` 상단에 추가:

\`\`\`js
import 'pretendard/dist/web/variable/pretendardvariable.css';
\`\`\`

또는 `index.html`에 CDN:
\`\`\`html
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"/>
\`\`\`

## .gitignore

\`\`\`
node_modules
dist
.DS_Store
\`\`\`
