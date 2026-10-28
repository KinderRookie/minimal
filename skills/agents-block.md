<!-- 이 블록을 프로젝트의 AGENTS.md / CLAUDE.md에 붙인다. <MN>을 실제 MINIMAL 패키지 경로로 바꾼다. -->

## 디자인 (MINIMAL)

UI를 만들거나 고칠 때는 MINIMAL 디자인 문법을 따른다. 패키지 경로: `<MN>`

- 작업 전 `<MN>/DESIGN.md`를 읽는다. 컴포넌트는 `<MN>/COMPONENTS.md`의 해당 절, 차트는 `<MN>/CHARTS.md`.
- 화면은 `<MN>/templates/instrument.html`(조작 화면) · `console.html`(한 화면 운영 툴) · `shell.html`(여러 페이지 툴) · `list.html`(목록 관리) · `master-detail.html` · `agent.html`(에이전트 채팅)에서 시작한다.
- 로드: `<MN>/dist/minimal.css` + `<body class="mn">` (+ 선택 `<MN>/js/minimal.js`).
- `.mn-*` 컴포넌트 우선, 없으면 `--mn-*` 시맨틱 토큰. 원시 색·그림자·border-radius·그라디언트 금지.
- 선택은 반전, 시그널은 살아 있는 것에만(화면당 하나), 상태는 단어(`OK`/`WARN`), 값 밑엔 의미 캡션, 푸터엔 버전·힌트·측정값.
- 차트는 `<MN>/charts/echarts.js` · `recharts.js` 헬퍼만 — 초점 시리즈 하나.
- 끝나기 전에 `node <MN>/scripts/check-usage.mjs <작업 폴더>` 결과가 깨끗해야 한다.
