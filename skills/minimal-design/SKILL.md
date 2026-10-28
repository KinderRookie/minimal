---
name: minimal-design
description: >-
  MINIMAL 디자인 문법(계기판 UI — 헤어라인, 시그널 하나, 큰 숫자, 눈금자 컨트롤)으로
  UI를 만들거나 고칠 때 코드를 쓰기 전에 따른다. Triggers: 화면/페이지/컴포넌트 제작,
  대시보드·콘솔·툴 UI, 파라미터 패널, 차트, 다크모드, 스타일/CSS 작성, "MINIMAL 스타일로",
  "계기판처럼", mn- 클래스가 있는 프로젝트의 모든 UI 작업.
---

# MINIMAL 디자인 스킬

목표: 누가 만들든 결과가 **같은 악기 계열**로 보이게 한다. 새 스타일을 발명하지 말고
아래 순서로 시스템을 소비한다.

## 0. 패키지 위치를 찾는다

`DESIGN.md`와 `dist/minimal.css`가 함께 있는 폴더가 MINIMAL 패키지다(이하 `<MN>`).

```bash
find . -path '*/dist/minimal.css' -not -path '*/node_modules/.cache/*' | head
```

없으면 사람에게 경로를 묻는다. 기억에서 클래스 이름을 꺼내 쓰지 않는다 — 버전마다 다를 수 있다.
실행 중인 화면의 버전: `getComputedStyle(document.documentElement).getPropertyValue("--mn-version")`.

## 1. 읽는다 (UI 작업 전 필수)

1. `<MN>/DESIGN.md` — 8원칙, 화면 해부, 색·타입·상호작용·카피 규칙. **전부 읽는다.**
2. `<MN>/COMPONENTS.md` — 필요한 컴포넌트 절만 읽는다(`grep -n '^## ' COMPONENTS.md`로 목차).
3. 차트가 있으면 `<MN>/CHARTS.md`.

## 2. 뼈대에서 시작한다

화면 단위 작업이면 빈 파일에서 조립하지 말고 템플릿을 복사해 슬롯만 바꾼다.

| 만들 것 | 시작점 |
| --- | --- |
| 조작 화면 (필드 + 파라미터 패널) | `<MN>/templates/instrument.html` |
| 한 화면짜리 운영 툴 / 대시보드 | `<MN>/templates/console.html` |
| 페이지가 여러 개인 툴 (사이드바 · 탭 · 목록 · 폼) | `<MN>/templates/shell.html` |
| 목록 관리 (검색 · 필터 · 일괄 작업 · 정렬 · 펼침) | `<MN>/templates/list.html` |
| 마스터-디테일 (왼쪽 목록, 오른쪽 상세) | `<MN>/templates/master-detail.html` |
| 에이전트 / AI 채팅 (도구 호출 · 생각 · 승인 · 모델 선택) | `<MN>/templates/agent.html` |
| 설정 · 문서형 | `<MN>/preview/index.html`의 `.mn-body--doc` 구조 |

구조는 한 화면이면 `.mn-app > .mn-header + .mn-body + .mn-footer`, 여러 페이지면 `.mn-shell > .mn-side + .mn-top + .mn-shell__content > .mn-page`. `<body class="mn">`.

## 3. 규칙 (가드레일)

**만들기 전에 찾는다.** 필요한 것이 `.mn-*` 컴포넌트에 있으면 그것을 쓴다. 없을 때만
`--mn-*` **시맨틱** 토큰(`--mn-ink-*`, `--mn-line-*`, `--mn-signal-*`, `--mn-bg-*`)으로 커스텀 CSS를 쓴다.
프리미티브(`--mn-color-*`)는 직접 참조하지 않는다.

**금지**: hex/rgb 색 · 그림자 · 리터럴 border-radius · 그라디언트 · 임의 px 간격(4px 그리드 토큰 사용) ·
`opacity`로 비활성 표현 · 상태용 초록/노랑/빨강 · 한 화면에 시그널 두 가지.

**문법**:
- **옵션** 선택 = 반전(`aria-pressed` / `aria-selected` / checked 라디오). **대상** 선택(데이터 안에서 지금 보는 행·구간) = 시그널 워시(`tr[aria-selected]`, `.mn-wash`). 틴트로 옵션 선택을 표시하지 않는다.
- 시그널은 살아 있는 것에만: 눈금자 바늘(포인터·`--fill`·밴드 — 항상 시그널), 플레이헤드, 모듈레이션 중이거나 기준을 넘은 값(`.is-live`), 엔게이지 모드(`--signal`, 화면당 하나), 대상 선택, 포커스.
- 조작하는 값은 `.mn-param`(라벨 · `.mn-readout` · `.mn-ruler` + 진짜 `<input type="range">` · 캡션), 보기만 하는 KPI는 `.mn-stats > .mn-stat`. 값 밑에 **의미 캡션**을 단다.
- 상태는 단어 칩: `OK` `WARN` `OFF`. 파괴적 액션은 `--signal-line` + 동사 라벨, 되돌릴 수 없으면 `.mn-dialog` 확인(COMPONENTS.md "파괴적 액션 확인").
- 라벨은 대문자 명사 하나(`REACH`, `MAX WAIT`). 구분자 ` · ` ` / ` ` = ` ` → `. 느낌표·이모지 금지.
- 숨은 조작(드래그, 더블클릭)이 있으면 `.mn-footer__hints`에 한 줄로 쓴다. 푸터 왼쪽 버전, 오른쪽 측정값.
- 한글 라벨에는 `.mn-ko`(트래킹 축소). `<html lang="ko">`에 걸지 않는다.
- 테마는 `<html>`의 `data-theme` / `data-signal` / `data-paper` / `data-dialect`. 색을 하드코딩해 다크모드를 만들지 않는다.
- 오렌지 시그널 + 따뜻한 종이 조합은 쓰지 않는다(대비 미달).
- 넓어질 수 있는 표는 `.mn-table-wrap`으로 감싼다.
- 카드는 `.mn-card`(위 룰로 잘린 블록). 고르는 타일만 `--framed`. 그림자·회색 카드 배경 금지.
- 모션: 살아 있는 것만 움직인다. 틀(패널·메뉴·카드)은 등장 애니메이션 없음. 스코프·미터처럼 흐르는 값은 `MN.monitor(el, draw)`로 프레임마다 다시 그리고(트윈 금지), 지난 흔적은 잉크 → 회색으로 바랜다.
- 스크롤바는 `_base.css`가 그린다(3px 회색 선, 트랙 없음). `::-webkit-scrollbar`·`scrollbar-color`를 따로 쓰지 않는다. 숨길 곳(가로 탭 줄 등)만 `scrollbar-width: none`.
- 화면 전환은 `.mn-tabs`(진짜 tablist), 값 고르기는 `.mn-seg`/`.mn-words`. 마법사는 `.mn-stages`, 폼은 `.mn-form`(필수는 `REQUIRED` 단어).
- 파이·도넛 대신 `.mn-ratio`, 진행 호 대신 눈금자 게이지(`m.gauge`), KPI 추세는 `svg.mn-spark[data-values]`.
- 아바타는 `.mn-initials`(이니셜 정사각 칩). 일반 링크는 클래스 없이 `<a>` — 잉크 + 헤어라인 밑줄이 자동.
- 목록: 툴바(`.mn-toolbar` · `.mn-chip`) → `.mn-bulkbar` → `table[data-mn-select]`(`.mn-sort` · `.mn-expand` · `⋯` 드롭다운) → `.mn-table-foot`. 체크된 행은 워시, 로딩은 `.mn-skeleton`.
- 에이전트 채팅: 생각은 접힌 `.mn-reason`(스트리밍 스니펫은 details **다음 형제**), 도구는 `.mn-tool` + `.mn-result`, diff는 +/− · 취소선 · 추가 줄 잉크 막대(글자색 없음, 옅은 초록/빨강 배경은 `data-diff="hue"` + `data-signal="blue"`에서만), 운영 변경은 `.mn-approve`로 멈춘다. 실행 중 보내기 버튼은 `--signal` STOP.

**차트**: ECharts/Recharts를 쓰면 `charts/echarts.js`(`minimalECharts`) · `charts/recharts.js`(`minimalRecharts`) 헬퍼만 쓴다.
초점 시리즈 하나만 `focus: true`, 나머지는 `slot`. 작은 차트는 SVG로 직접 그려도 되며 그때는 `.mn-s-*`/`.mn-f-*` 페인트 클래스만. 팔레트를 새로 만들지 않는다.

**동작**: `<MN>/js/minimal.js`를 로드하면 숫자 드래그·Shift 미세·더블클릭 기본값·프리셋 스테퍼·테마 스위치가 붙는다.
input에 `data-default`를 준다.

## 4. 검증한다 (완료라고 말하기 전에)

```bash
node <MN>/scripts/check-usage.mjs <작업한 폴더> --css <MN>/dist/minimal.css
```

- `unknown`: 없는 클래스/변수(오타, 지어낸 변형) → COMPONENTS.md에서 실제 이름을 찾아 고친다.
- `raw`: 원시 색·그림자·radius → 토큰으로 바꾼다.
- 토큰을 고쳤다면 `<MN>`에서 `npm run build`(가드레일 + 대비 검사)까지 통과시킨다.

가능하면 라이트·다크 두 테마 스크린샷을 찍어 확인한다. 브라우저가 `file://`을 막으면 `<MN>`의 상위 폴더에서 `python3 -m http.server`로 띄운다. 그다음 아래 체크리스트를 스스로 대조한다.

## 5. 자가 점검

- [ ] 상자는 전부 1px 선인가? 그림자·둥근 모서리·회색 카드 배경이 없나?
- [ ] 선택된 것이 반전으로 보이는가?
- [ ] 시그널이 살아 있는 것에만 쓰였나? 화면에 시그널 채움 버튼이 두 개 이상이지 않나?
- [ ] 값이 라벨보다 훨씬 큰가? 숫자는 `tabular-nums`(리드아웃은 자동)인가?
- [ ] 값 밑에 의미 캡션이 있나?
- [ ] 상태가 단어로 표시되는가?
- [ ] 푸터에 버전 · 조작 힌트 · 측정값이 있나?
- [ ] 다크에서도 같은 화면이 반전만 된 모습인가?

## 6. 보고

사람에게 알린다: 쓴 템플릿/컴포넌트, `check-usage` 결과(원문), 시스템에 없어서 커스텀으로 만든 것과
그 이유(시스템에 추가할 후보다), 확인하지 못한 것.
