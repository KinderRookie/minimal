# MINIMAL

계기판(instrument panel) 디자인 문법 — 종이 위의 잉크 헤어라인, 한 가지 시그널 색,
거대한 숫자, 눈금자 컨트롤. 악기·오디오 툴 UI 레퍼런스에서 규칙을 뽑아 토큰 · 컴포넌트 · 동작 · 문서로 만든 것.

**라이브:** https://kinderrookie.github.io/minimal/ — 스펙시먼, 템플릿, 차트를 브라우저에서 바로 본다.

| 경로 | 내용 |
| --- | --- |
| **`DESIGN.md`** | **문법 본체.** 8원칙, 화면 해부, 색·타입·선·상호작용·카피 규칙, Do/Don't. AI 툴 컨텍스트로 그대로 붙인다 |
| `COMPONENTS.md` | 컴포넌트별 마크업 레시피 + 변형 표 |
| `CHARTS.md` · `charts/` | 차트 문법 + ECharts 테마(`echarts.js`) · Recharts prop 묶음(`recharts.js`), 둘 다 `theme.js` 한 원천에서 |
| `skills/` | AI 에이전트 규칙 — Claude Code 스킬(`minimal-design/SKILL.md`), Cursor 룰(`minimal-design.mdc`), AGENTS.md/CLAUDE.md용 블록(`agents-block.md`) |
| `tokens/tokens.json` | 토큰 원천 (primitive · semantic light/dark/derived · variant signal/paper/dialect) |
| `components/*.css` | 컴포넌트 원천 — `--mn-*` 토큰만 소비 |
| `js/minimal.js` | 선택 동작: 숫자 드래그, Shift 미세, 더블클릭 리셋, 프리셋 스테퍼, 테마 스위치, 토스트 |
| `dist/` | 빌드 산출물 — `minimal.css`(올인원), `tokens.css`, `components.css`, `tokens.resolved.json`, `tokens.js` |
| `preview/index.html` | 스펙시먼 — 모든 컴포넌트, 테마/시그널/종이/방언 전환 |
| `preview/charts.html` | 차트 — ECharts·Recharts 실제 렌더링, 테마 전환 시 다시 그림 |
| `templates/instrument.html` | 대표 화면 — 필드 + 파라미터 패널 + 상태줄 (블루 시그널) |
| `templates/console.html` | 같은 문법을 라이브옵스 툴에 적용 — KPI 리드아웃, 지역 표, 히트 그리드 |
| `templates/shell.html` | 여러 페이지짜리 툴 — 사이드바 목차, 브레드크럼, 탭, 표 + 페이지네이션, 카드, 단계 + 폼 |
| `templates/list.html` | 목록 관리 — 탭+건수, 검색, 필터 칩, 일괄 작업 바, 정렬, 펼침 행, 행 메뉴, 스켈레톤, 확인 다이얼로그 |
| `templates/master-detail.html` | 마스터-디테일 — 신고 처리 큐(왼쪽 목록 / 오른쪽 상세·탭·결정 폼), 각 창 독립 스크롤, 모바일은 한 창씩 |
| `templates/agent.html` | 에이전트 채팅 — 생각, 계획, 도구 호출·결과(표·diff·검색), 승인, 스트리밍 답변, 모델 선택, 실행 패널. 실제로 흘러간다 |
| `ref/` | 원본 레퍼런스 이미지 — 타사 제품 스크린샷이라 저장소에는 올리지 않는다(`.gitignore`). 각 레퍼런스에서 무엇을 가져왔는지는 `DESIGN.md` 1절 |

## 쓰기

```html
<link rel="stylesheet" href="dist/minimal.css">
<body class="mn">
  …
  <script src="js/minimal.js"></script>
</body>
```

폰트는 Google Fonts의 IBM Plex Mono · Inter Tight, 한글은 Pretendard를 불러 쓴다
(템플릿 `<head>` 참고). 없으면 Menlo / Helvetica Neue / 시스템 폰트로 떨어진다.

테마는 `<html>`의 data 속성: `data-theme="dark"`, `data-signal="blue|orange"`, `data-paper="warm"`, `data-dialect="soft"`.

## 빌드 · 검증

```bash
npm run build      # 토큰 → 컴포넌트 결합(+가드레일) → WCAG 대비 검증
npm run serve      # http://localhost:4173/preview/  ·  /preview/charts.html  ·  /templates/instrument.html
npm run check:usage -- ../my-app/src   # 다른 프로젝트의 MINIMAL 사용 검증
```

무의존성 Node 스크립트:

- `build-tokens.mjs` — `tokens.json` → `dist/tokens.css` 등. 파생 토큰(`signal.wash`)은 테마/시그널/종이를 바꾸는 모든 스코프에서 다시 계산되도록 출력한다.
- `build-components.mjs` — `components/*.css`를 순서대로 합친다. **원시 색, 그림자, 리터럴 border-radius가 있으면 실패.**
- `check-usage.mjs <dir>` — 프로젝트가 쓰는 `.mn-*` 클래스·`--mn-*` 변수가 실제로 있는지, 원시 색·그림자·radius가 없는지 검사. 에이전트 규칙의 마지막 단계.
- `check-contrast.mjs` — 9개 스코프(테마 × 종이 × 시그널) × 14쌍 WCAG 검증. color-mix로 만든 워시도 수치로 풀어 검사한다. 지원하지 않는 조합(오렌지 + 따뜻한 종이)은 사유와 함께 명시적으로 skip.

## AI 에이전트에 붙이기

- **Claude Code**: `skills/minimal-design/`를 프로젝트의 `.claude/skills/`(또는 `~/.claude/skills/`)에 복사.
- **Cursor**: `skills/minimal-design.mdc`를 `.cursor/rules/`에 복사.
- **그 외(Codex 등)**: `skills/agents-block.md`를 프로젝트 `AGENTS.md`에 붙이고 `<MN>`을 패키지 경로로 바꾼다.
