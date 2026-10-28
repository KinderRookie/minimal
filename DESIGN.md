---
name: MINIMAL
version: 0.1.0
description: >-
  계기판(instrument panel) 디자인 문법. 종이 위의 잉크 헤어라인, 한 가지 시그널 색,
  거대한 숫자, 눈금자 컨트롤. 이 파일은 사람과 AI 툴이 모두 읽는 디자인 컨텍스트다.
  실제 구현은 dist/minimal.css(토큰+컴포넌트)와 js/minimal.js(선택 동작)를 쓴다.
default_mode: light
prefix: mn

tokens:
  # 시맨틱 역할 — 이름은 CSS 변수와 1:1: ink.primary → var(--mn-ink-primary)
  color:
    light:
      bg.canvas:      "#FFFFFF"
      bg.sunken:      "#F4F4F2"
      bg.hover:       "#EBEBE8"
      ink.primary:    "#111111"
      ink.secondary:  "#5A5A57"   # 라벨
      ink.tertiary:   "#6B6B68"   # 캡션·힌트
      ink.disabled:   "#BDBDBA"
      line.strong:    "#111111"   # 컨트롤 외곽선, 헤더 룰
      line.default:   "#BDBDBA"   # 플롯 프레임, 푸터 룰
      line.subtle:    "#D6D6D3"   # 테이블 행
      line.faint:     "#EBEBE8"   # 플롯 격자
      inverse.bg:     "#111111"   # 선택 = 반전
      inverse.ink:    "#FFFFFF"
      signal.mark:    "#F23A22"   # 포인터·플레이헤드·큰 숫자 (≥3:1)
      signal.fill:    "#D42A14"   # 글자를 얹는 채움 (흰 글자 ≥4.5:1)
      signal.text:    "#B0220E"   # 작은 시그널 글자 (≥4.5:1)
      signal.wash:    "color-mix(signal.mark 12%, bg.canvas)"
    dark:
      bg.canvas:      "#0D0D0D"
      bg.sunken:      "#161615"
      ink.primary:    "#EDEDEA"
      ink.secondary:  "#A6A6A2"
      ink.tertiary:   "#8F8F8B"
      ink.disabled:   "#464644"
      line.strong:    "#EDEDEA"
      line.default:   "#464644"
      inverse.bg:     "#EDEDEA"
      inverse.ink:    "#0D0D0D"
      signal.mark:    "#FF5A43"
      signal.fill:    "#F23A22"   # 위에 얹는 글자는 #0D0D0D
      signal.text:    "#FF6A55"
  signal_presets:     # <html data-signal="…">
    red:    { mark: "#F23A22", fill: "#D42A14", text: "#B0220E" }   # 기본
    blue:   { mark: "#2246FF", fill: "#2246FF", text: "#1D3DE6" }
    orange: { mark: "#FE4E00", fill: "#C23A00", text: "#A83200" }
  paper:
    white: "#FFFFFF"
    warm:  "#E8E7E0"      # <html data-paper="warm"> — 라이트 전용
  font:
    mono: "IBM Plex Mono, JetBrains Mono, SFMono-Regular, Menlo, Pretendard, monospace"
    sans: "Inter Tight, Helvetica Neue, Helvetica, Arial, Pretendard, sans-serif"
    size: { 2xs: 10px, xs: 11px, sm: 12px, md: 14px, lg: 16px, xl: 20px, 2xl: 28px }
    readout: { sm: 28px, md: 44px, lg: 64px, xl: 104px }
    tracking: { tight: -0.035em, label: 0.14em, wide: 0.24em, mark: 0.55em }
  stroke: { hair: 1px, rule: 1.5px, mark: 3px }
  space: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64]
  control: { sm: 24px, md: 32px, lg: 40px }
  radius: 0           # soft 방언에서만 pill / 10px
  shadow: none        # 없음. 영원히.

consume:
  css: "dist/minimal.css"            # 토큰 + 컴포넌트 한 번에
  js: "js/minimal.js"                # 선택: 숫자 드래그, 더블클릭 리셋, 프리셋 스테퍼, 테마 스위치
  specimen: "preview/index.html"
  templates: ["templates/instrument.html", "templates/console.html", "templates/shell.html", "templates/list.html", "templates/master-detail.html", "templates/agent.html"]
  charts: ["charts/echarts.js", "charts/recharts.js"]   # CHARTS.md
  agents: ["skills/minimal-design/SKILL.md", "skills/minimal-design.mdc", "skills/agents-block.md"]
  verify: "node scripts/check-usage.mjs <dir>"
---

# MINIMAL — 디자인 문법

> 모든 화면은 **악기**다. 바라보는 **필드**가 하나, 값을 맞추는 **패널**이 하나,
> 그리고 사실만 말하는 **상태줄**이 하나 있다.

이 문서는 16장의 레퍼런스(TIDE, WEFT, BUBBLE, FIELD, ODD PARTS, MOSAIC, SPRIG, CUT,
SIX MATERIALS)에서 반복되는 규칙을 뽑아 **문법**으로 정리한 것이다. 컴포넌트 목록보다
먼저 이 규칙을 읽어야 한다. 컴포넌트는 규칙을 적용한 결과일 뿐이다.

---

## 1. 레퍼런스에서 가져온 것

| 레퍼런스 | 가져온 규칙 |
| --- | --- |
| **tide** | 화면 해부(헤더 · 필드 | 패널 · 푸터), 2열 파라미터 그리드, 섹션 룰 + 우측 메타(`96.0 BPM`), 엔게이지 모드 = 시그널 채움(`FREEZE ON / PRESSED LINES HOLD`), 선택 영역 = 시그널 워시 |
| **weft** | 다크 = 단순 반전, 단어 리스트 선택 = 잉크 칩, 재생 중 = 시그널 밑줄, 두 번째 선택(B) = 외곽선, 값 아래의 의미 캡션(`SLOW TURN`, `WARM`) |
| **bubble** | 와이드 트래킹 워드마크(`B U B B L E`), 프리셋 스테퍼 위 메타(`SOUND 03 / 16`), 모드 테이블(TARGET / SHAPE / RATE / DEPTH / NOW), 쉬는 행 = 회색, 일하는 행 = 굵게 |
| **field** | 고밀도 그리드(`--sm`), 모듈레이션된 값 = 시그널 숫자, 숫자 옆 작은 모양 상자, 히트 셀, 스텝 시퀀서(점선 = 빈 칸), 한 줄 힌트 푸터 |
| **odd parts** | 좌측 부품 리스트, 작은 스코프 패널(SPECTRUM, V × I), 예외 액션 = 시그널 외곽선(`REMOVE`), 미니맵 |
| **mosaic** | 0부터 채워지는 눈금자(`--fill`), 허용 범위 밴드, 플레이헤드, 위첨자 카운트(`WOOD¹⁰⁵⁰`), `[ MORE ]` |
| **sprig · cut** | 소프트 방언(라운드 필, 회색 필드) — **핵심 문법이 아니라 방언**으로만 둔다 |
| **six materials** | 따뜻한 종이(`#E8E7E0`), 큰 산세리프 타이틀 |

시그널 색은 레퍼런스의 단색 영역에서 직접 채집했다: 레드 `#FF2A13`·`#E33223` 군집 → `#F23A22`,
블루 `#2246FF`(tide), 오렌지 `#FE4E00`(cut).

---

## 2. 여덟 가지 규칙

### 01 · 면이 아니라 선
모든 상자는 **1px 헤어라인**이다. 그림자, 그라디언트, 둥근 모서리는 없다.
깊이는 높이(elevation)가 아니라 **룰(rule)** 로 만든다 — 헤더 아래 1.5px, 섹션 위 1px, 행 사이 1px subtle.

### 02 · 선택은 반전
고른 것은 **잉크 블록 + 종이색 글자**가 된다. 틴트 배경, 컬러 테두리, 체크 아이콘으로
선택을 표시하지 않는다. 버튼·세그먼트·단어·메뉴·스텝 모두 같은 규칙.

선택에는 두 종류가 있고 표기가 다르다:

| 무엇을 고르나 | 표기 | 예 |
| --- | --- | --- |
| **옵션** — 여러 값 중 하나를 정한다 | 반전 | `1/16`, `STANDARD`, `OCTAVE`, 탭 |
| **대상** — 데이터 안에서 지금 보고 있는 곳을 가리킨다 | 시그널 워시 | 표의 선택 행, 플롯의 선택 구간, tide의 창 |

옵션 선택은 설정이고, 대상 선택은 "지금 여기"를 짚는 손가락이다. 그래서 대상 선택은 시그널을 쓴다.

### 03 · 시그널은 하나
제품마다 강조색은 **하나**. 그리고 **살아 있는 것**에만 쓴다:
- 포인터 ▲, 플레이헤드, 마커 ◎ — 눈금자의 바늘은 **항상** 시그널이다. `--fill` 런과 범위 밴드도 바늘의 연장이다
- 지금 움직이고 있는(모듈레이션 중인) 값의 숫자
- 동작을 바꾸는 **엔게이지 모드**(FREEZE ON, REC)
- 대상 선택의 워시(선택 행·구간), 히트 셀
- 포커스 링

브랜드 장식, 링크 색, 성공/실패 색으로 쓰지 않는다.

### 04 · 값이 주인공
숫자는 **크고(44–104px), 가볍고(300), 탭룰러 숫자**다. 위의 라벨은 작고(11px),
단위는 더 작다(10px). 값이 바뀔 때 폭이 흔들리지 않도록 항상 `tabular-nums`.

### 05 · 라벨은 대문자로 말한다
모노, 대문자, 트래킹. 짧은 명사: `REACH`, `FLOW`, `MIX`. 구분자는 띄어 쓴 ` · ` 과 ` / `.

### 06 · 의미를 말한다
눈금자 밑의 캡션이 숫자를 번역한다: `STEADY`, `WARM`, `EACH NOTE A LITTLE`.
숫자만 있고 의미가 없으면 캡션을 넣을 자리를 먼저 의심하라.

### 07 · 숫자에 손을 댄다
값은 끌어서 바꾼다. **위로 끌면 증가, Shift = 미세, 더블클릭 = 기본값, 화살표 = 한 스텝.**
그리고 푸터가 그 사실을 **한 줄로** 알려준다.

### 08 · 상태줄은 사실만 말한다
왼쪽에 버전, 오른쪽에 측정값(`DSP 1%`, `LAG 112 MS`) — 항상 보인다.
상태는 **단어**(OK · WARN · OFF)이지 신호등 색이 아니다.

---

## 3. 화면 해부

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ W O R D M A R K │ SUBTITLE / KIND     [<] [  PRESET NAME *  ] [>]    [A|B] … │ .mn-header
╞═════════════════════════════════════════════════════════════════════════════╡ ← 1.5px rule
│ ┌───────────────────────────────────────┐ │ REACH          FLOW            │
│ │                              CORNER   │ │ 0.80 s         55 %            │ .mn-params
│ │          field / plot                 │ │ ┃╷╷╷┃╷╷╷┃╷╷╷┃  ┃╷╷╷┃╷╷╷┃╷╷╷┃   │
│ │      ░░░░ wash ░░░░  ◎ marker         │ │      ▲               ▲         │
│ │                                       │ │ ─────────────────────────────  │ .mn-section
│ └───────────────────────────────────────┘ │ GRID                  96.0 BPM │
│ ┃╷╷╷╷╷╷╷╷┃╷╷╷╷╷╷╷╷┃╷╷╷╷╷╷╷╷┃╷╷╷╷╷╷╷╷┃     │ [FREE] [■1/16] [1/8] [1/4]     │ .mn-seg
│ -0.80 S     PRESS A LINE / LEFT = EARLIER │ [        FREEZE        ]        │
├─────────────────────────────────────────────────────────────────────────────┤ ← 1px default
│ NAME 1.0.0      DRAG A NUMBER · SHIFT = FINE · DOUBLE-CLICK = DEFAULT  DSP 1%│ .mn-footer
└─────────────────────────────────────────────────────────────────────────────┘
```

여러 페이지짜리 툴(콘솔·어드민)은 같은 문법의 **앱 셸**을 쓴다:

```
┌ SHARD ────────┬ OPS / ASIA / SHARDS ─────────────── [SEARCH] [A|B] ┐
│ OPS / ASIA    ╞════════════════════════════════════════════════════╡ ← 1.5px rule
│ RUN           │ ASIA · RANKED SQUAD                                │
│ 01 OVERVIEW   │ Shards                         [EXPORT] [■ NEW →]  │ .mn-page__head
│■02 SHARDS  24■│ PLAYERS     PEAK CPU     TICK       BUILD MIX      │ .mn-stats
│ 03 INCIDENTS 2│ 12,408      94 %         59.6 HZ    ███▌▓▓░        │
│ 04 ROLLOUTS   │ [■ALL 24] INCIDENTS 2  NEW ROLLOUT ────────────────│ .mn-tabs
│               │ table · pager · cards · form … (only this scrolls) │
│ ■JL J. LEE    │                                                    │
└───────────────┴────────────────────────────────────────────────────┘
```
사이드바는 색 레일이 아니라 **번호 붙은 목차**, 현재 페이지는 반전. 카드는 떠 있는 상자가 아니라 **룰로 잘린 블록**.

- 필드:패널 ≈ 3:2. 패널 기본 폭 460px(`--mn-panel-width`). 둘 사이에 1px strong 세로 룰.
- 960px 이하에서는 패널이 필드 아래로 내려가고 세로 룰은 가로 룰이 된다.
- 문서형 화면(설정, 스펙시먼)은 `.mn-body--doc`(왼쪽 레일 + 본문).
- 페이지가 여러 개인 툴은 `.mn-shell`(사이드바 목차 + 톱바 + 스크롤되는 본문) — `templates/shell.html`.
- 그 안의 페이지 유형: 목록 관리(`templates/list.html`), 마스터-디테일(`.mn-split`, `templates/master-detail.html`), 에이전트 채팅(`.mn-chat`, `templates/agent.html`).

---

## 4. 색

### 역할
| 역할 | 토큰 | 언제 |
| --- | --- | --- |
| 종이 | `bg.canvas` | 모든 배경. 패널도 같은 종이다 — 카드 배경색을 따로 두지 않는다 |
| 잉크 | `ink.primary` | 값, 선, 선택 블록 |
| 라벨 | `ink.secondary` | 파라미터 라벨, 섹션 제목, 서브타이틀 |
| 힌트 | `ink.tertiary` | 캡션, 푸터 힌트, 쉬는 행 |
| 비활성 | `ink.disabled` | 비활성 컨트롤의 글자 **와 외곽선** |
| 선 | `line.strong / default / subtle / faint` | 컨트롤 / 플롯 프레임 / 행 / 격자 |
| 반전 | `inverse.bg / ink` | 선택 |
| 시그널 | `signal.mark / fill / text / wash` | 살아 있는 것 |

### 시그널 네 갈래 — 왜 넷인가
작은 글자에 4.5:1, 비텍스트에 3:1을 지키면서 레퍼런스의 쨍한 레드를 유지하려면 하나로는 안 된다.
- **mark** — 포인터, 플레이헤드, 마커, **28px 이상의 숫자**. 3:1 이상.
- **fill** — 글자를 얹는 채움(엔게이지 버튼, 시그널 태그). 위 글자(`signal.on`)와 4.5:1.
- **text** — 12px 이하의 시그널 글자(`FX · ON THE ADDED SOUNDS`, 에러 메시지). 4.5:1.
- **wash** — 면적. `mark`를 종이에 12%(다크 22%) 섞은 값. 선택 영역, 수정된 행 라벨, 밴드.

### 상태 규칙
초록/노랑/빨강 팔레트는 **없다**. 상태는 칩 안의 **단어**다.

| 상태 | 표기 |
| --- | --- |
| 정상 | `OK` — `.mn-tag--solid` |
| 쉬는 중 / 꺼짐 | `OFF`, `NIGHT` — `.mn-tag--muted`, 행은 `.is-idle` |
| 지금 봐야 함 | `WARN`, `CLIP`, `ERROR` — `.mn-tag--signal-line` 또는 `.mn-note--signal` |

시그널이 파란 제품에서는 경고도 파랗다. 괜찮다 — 의미는 **단어**가 전달하고, 색은 "지금 봐"만 말한다.
파괴적 액션은 항상 동사로 라벨을 단다(`REMOVE`, `CLEAR`) — 색만으로 위험을 알리지 않는다.
되돌릴 수 없는 파괴적 액션은 `.mn-dialog`로 한 번 확인한다: 제목은 동사 + 대상(`RESTART S-04`),
본문은 결과 한 문장, 확인 버튼은 같은 동사의 `--signal-line`, 취소는 `--ghost`(COMPONENTS.md 참고).

### 금지 조합
- **오렌지 시그널 + 따뜻한 종이**: mark 대비 2.7:1. 쓰지 않는다(`check-contrast`가 명시적으로 skip 처리).
- **`data-diff="hue"` + 빨강/주황 시그널**: 삭제 줄의 연분홍이 시그널 워시(선택된 행)와 겹친다(ΔE 2–7). 토큰 `diff.allow`가 0이라 CSS에서 자동으로 단색으로 남는다 — 파랑 시그널에서만 켜진다.
- 한 화면에 두 시그널: 금지. 예외 없음.
- 시그널 위의 시그널(시그널 채움 버튼 안의 시그널 글리프): 금지.

---

## 5. 타이포그래피

세 개의 목소리만 있다.

| 목소리 | 클래스 | 글꼴 | 크기 | 무게 | 트래킹 | 케이스 |
| --- | --- | --- | --- | --- | --- | --- |
| **마크** (제품 이름) | `.mn-wordmark` | sans | 28 | 400 | 0.55em | UPPER |
| **리드아웃** (값) | `.mn-readout` | sans | 28 / 44 / 64 / 104 | 300 | -0.035em | — |
| **라벨** (계기판의 말) | `.mn-label` 외 | mono | 10 – 12 | 400–500 | 0.14–0.24em | UPPER |

라벨 계열의 단계: `label`(11, secondary) → `caption`(10, tertiary) → `hint`(10, tertiary) → `unit`(10, secondary).
본문 산문은 드물다. 필요하면 sans 14px, `ink.secondary`.

**한글.** 대문자 트래킹은 라틴 장치다. 한글에 0.24em을 주면 음절이 흩어진다.
한글 라벨에는 `.mn-ko`(또는 그 요소에 `lang="ko"`)를 붙여 트래킹을 0.02–0.18em으로 줄인다.
`<html lang="ko">`에 거는 것이 아니라 **한글 라벨 요소**에 건다 — 같은 화면의 `REACH` 같은 영문 라벨은 트래킹을 유지해야 한다.
모노 스택에 Pretendard가 들어 있어 한글 글리프는 자동으로 Pretendard가 받는다.

---

## 6. 선 · 간격 · 형태

- **선 굵기 셋**: `hair 1px`(모든 테두리) · `rule 1.5px`(헤더 아래, 테이블 그룹 끝, 포커스 링) · `mark 3px`(재생 밑줄, 진행 바).
- **간격**: 4px 그리드. 파라미터 그리드 간격 24px, 섹션 사이 24px, 앱 바깥 여백 24/32px.
- **컨트롤 높이**: 24 / 32 / 40. 프리셋 스테퍼는 40.
- **반경 0.** 그림자 없음. 빌드 스크립트가 컴포넌트 CSS의 리터럴 `border-radius`와 `box-shadow`를 거부한다.
- **소프트 방언** `data-dialect="soft"`: 컨트롤은 pill, 패널은 10px, 컨트롤 글꼴은 sans·소문자, 플롯은 회색 면. 색·선·숫자 문법은 그대로다.

---

## 7. 상호작용 문법

| 동작 | 결과 |
| --- | --- |
| 숫자 위로/아래로 드래그 | 값 증감 (`data-drag="x"`면 좌/우) |
| Shift + 드래그 / Shift + 화살표 | 미세 조정 (×0.1) |
| 더블클릭 (숫자 또는 눈금자) | 기본값(`data-default`)으로 |
| 눈금자 클릭·드래그 | 그 위치로 |
| 화살표 | 한 스텝 |
| hover | 컨트롤: `bg.hover` / 드래그 가능한 숫자: 헤어라인 밑줄 |
| focus-visible | 시그널 1.5px 외곽선, 2px 오프셋 (헤어라인과 겹치지 않게) |
| pressed / selected | 반전 |
| disabled | 글자와 외곽선 모두 `ink.disabled`. 투명도로 흐리게 하지 않는다 |
| 스크롤바 | 컨트롤이 아니라 **선**이다. 트랙 없음, 3px 회색 썸(`ink.tertiary`, ≥3:1) → hover `ink.secondary` → 드래그 중 `ink.primary`. 직각, 화살표 버튼 없음, 시그널 금지(스크롤은 "살아 있는 것"이 아니다). `.mn` 안 전부와 `body.mn` 페이지에 자동 적용 |
| 기본값에서 바뀐 프리셋 | 이름 뒤 `*` (`data-dirty`) |

**푸터 힌트 규칙**: 화면에 드래그·더블클릭 같은 숨은 동작이 있으면 푸터 가운데에 한 줄로 쓴다.
형식: `DRAG A NUMBER UP OR DOWN · SHIFT = FINE · DOUBLE-CLICK = DEFAULT`.

---

## 8. 카피 문법

- **라벨은 명사 하나**: `REACH`, `WIDTH`, `TONE`. 두 단어까지: `BUBBLE SIZE`, `NEAR / FAR`.
- **단위는 숫자 옆, 작게, 대문자**: `0.80 S`, `55 %`, `0.0 DB`, `0.15 HZ`. `.mn-readout__unit`이 대문자로 바꾸므로 원문은 `s`, `Hz`로 써도 된다. 비율 단위는 `/ SHARD`처럼 슬래시로.
- **KPI는 `.mn-stat`**: 라벨 · 리드아웃 · 캡션. 기준을 넘은 값만 `.is-live`(시그널 숫자), 캡션에 기준과 판정(`LIMIT 85 % · OVER`).
- **구분자**: 나열은 ` · `, 계층은 ` / `, 대응은 ` = `, 이동은 ` → `.
- **캡션은 형용사/짧은 구**: `STEADY`, `IN BETWEEN`, `EACH NOTE A LITTLE`.
- **상태는 단어**: `OK`, `WARN`, `OFF`, `LIVE`, `SKIPPED`.
- **카운트는 위첨자**: `WOOD¹⁰⁵⁰`. 개수 요약은 라벨 줄에: `FOAM / 350 CELLS / 53 BORN / S`.
- **엔게이지 모드는 상태를 문장으로**: `FREEZE ON / PRESSED LINES HOLD`.
- 느낌표, 이모지, "성공적으로 저장되었습니다!" 금지. `SAVED — PRESET WRITTEN TO SLOT A`.

---

## 9. 모션

계기판은 튀지 않는다. 움직임에도 시그널과 같은 규칙이 걸린다: **살아 있는 것만 움직인다.**

**틀은 거의 움직이지 않는다**
- 상태 전환(hover, 선택)은 80ms linear 또는 즉시.
- 토스트만 160ms ease-out으로 8px 올라온다.
- 패널·메뉴·카드·페이지의 등장 애니메이션, 페이드 인, 스크롤 연출은 없다.
- 로딩(`.mn-meter.is-busy`)과 스트리밍 커서는 **스텝**으로 움직인다 — 매끄러운 글라이드가 아니라 틱.

**모니터는 계속 움직인다** — 스코프, 미터, 스펙트럼처럼 실제로 흐르는 값
- 프레임마다 **다시 그린다**. 값 사이를 트윈·이징으로 잇지 않는다(계기는 보간하지 않는다).
- 지난 흔적은 **잔상(phosphor)**: 잉크 → `ink.disabled` → `line.faint`로 바래 사라진다. 지금 값만 시그널.
- 피크 홀드는 잉크 틱 하나: 잠깐(≈0.6 s) 머문 뒤 일정한 속도로 떨어진다.
- 갱신률은 24–30 fps면 충분하다. 화면 밖이거나 탭이 숨겨지면 멈춘다.
- `prefers-reduced-motion`이면 **한 프레임으로 멈춘다**(빈 상자가 아니라 정지 화면).
- 구현은 `MN.monitor(el, draw, { fps })` — 위 규칙(프레임 상한, 화면 밖 정지, 동작 줄이기)을 대신 지킨다. 앱은 데이터로 그리는 `draw(t, dt)`만 넘긴다.
- 실제 데이터가 멈추면 모니터도 멈춘다. 데이터가 없는데 "살아 보이게" 흔들지 않는다.

---

## 10. 테마와 변형

전부 `<html>`(또는 아무 컨테이너)의 data 속성이다. 섞어 써도 된다.

```html
<html data-theme="dark" data-signal="blue" data-paper="warm" data-dialect="soft">
```

| 속성 | 값 | 비고 |
| --- | --- | --- |
| `data-theme` | `light` / `dark` / (없음 = OS 설정) | 다크는 단순 반전. 시그널만 밝아진다 |
| `data-signal` | (없음 = red) / `blue` / `orange` | 제품당 하나. 한 화면 안에서 섞지 않는다 |
| `data-paper` | (없음 = white) / `warm` | 라이트 전용. 다크에서는 무시 |
| `data-dialect` | (없음 = hard) / `soft` | 반경·컨트롤 글꼴만 |
| `data-diff` | (없음 = 단색) / `hue` | 코드 리뷰가 주 업무인 화면용. 추가/삭제 줄에 옅은 초록/빨강 배경(글자색은 그대로). `data-signal="blue"`에서만 효과가 있다 |

`signal.wash` 같은 파생 토큰은 위 속성이 붙은 모든 스코프에서 다시 계산되므로,
중첩된 컨테이너에 다른 테마를 걸어도 올바르게 따라간다.

---

## 11. 접근성

- 색 조합은 `npm run check:contrast`가 9개 스코프(테마 × 종이 × 시그널) × 14쌍에서 검증한다. `signal.wash`(color-mix)도 수치로 풀어서 그 위의 글자까지 검사한다. diff 틴트는 허용되는 스코프(파랑 시그널)에서 그 위의 글자 대비와, 시그널 워시와의 색 차이(ΔE ≥ 10)까지 검사한다.
- 검증되지 않는 조합은 하나뿐이고 명시적으로 skip된다: 오렌지 시그널 + 따뜻한 종이(사용 금지).
- 작은 시그널 글자는 워시 위에 올리지 않는다(따뜻한 종이에서 4.0:1). 워시 위의 글자는 항상 `ink.primary`.
- 눈금자는 그림 위에 **진짜 `<input type="range">`** 를 투명하게 올린다 — 키보드·스크린리더·폼이 JS 없이 동작한다.
- 리드아웃은 `<output for="…">`. 세그먼트·단어 선택은 라디오 또는 `aria-pressed / aria-selected`.
- 스위치는 `role="switch"` 체크박스. ON/OFF 글자는 `data-on / data-off`로 그린다.
- 시그널로만 전달되는 의미는 없다 — 항상 단어가 함께 있다.
- `prefers-reduced-motion`에서 애니메이션·트랜지션을 끈다.

---

## 12. Do / Don't

| Do | Don't |
| --- | --- |
| 카드를 위 룰로 자른다, 고르는 타일만 테두리 | 카드를 그림자로 띄운다 |
| 사이드바는 번호 목차, 현재 = 반전 | 사이드바를 색 띠로 칠한다 |
| 비율 막대 · 눈금자 게이지 | 파이 · 도넛 · 진행 호 |
| diff는 +/− · 취소선 · 추가 줄 잉크 막대. 색은 `data-diff="hue"`로만 | diff 글자를 빨강/초록으로 칠한다 |
| 운영 변경 전 승인 카드로 멈춘다 | 에이전트가 묻지 않고 배포한다 |
| 로딩은 틱 하는 옅은 막대 | 반짝이는 시머 그라디언트 |
| 1px 선으로 영역을 나눈다 | 카드에 그림자나 회색 배경을 깐다 |
| 모니터는 프레임마다 다시 그리고, 지난 흔적은 회색으로 바랜다 | 값 사이를 이징으로 트윈하거나, 데이터 없이 장식으로 흔든다 |
| 스크롤바는 3px 회색 선 | OS 기본 스크롤바를 그대로 두거나, 둥근 썸·시그널색 스크롤바 |
| 선택을 잉크 블록으로 반전한다 | 선택을 연한 시그널 배경으로 표시한다 |
| 시그널을 포인터·플레이헤드·라이브 값에만 쓴다 | 시그널로 제목·링크·아이콘을 칠한다 |
| 숫자를 크게, 라벨을 작게 | 라벨과 숫자를 같은 크기로 |
| 값 밑에 의미 캡션을 단다 | 숫자만 던져 놓는다 |
| 상태를 `OK` / `WARN` 단어로 | 초록 점 / 빨간 점 |
| 비활성은 회색 외곽선 + 회색 글자 | `opacity: .5` |
| 숨은 조작은 푸터 한 줄로 알린다 | 툴팁에만 숨긴다 |
| 한글 라벨에 `.mn-ko` | 한글에 0.24em 트래킹 |

---

## 13. AI 툴에서 쓰기

이 파일 전체를 컨텍스트로 붙이고, 아래 한 문단을 지시에 덧붙인다.

> MINIMAL 디자인 문법을 따른다. `dist/minimal.css`의 `.mn-*` 클래스와 `--mn-*` 변수만 쓴다.
> 원시 색(hex/rgb), 그림자, border-radius를 직접 쓰지 않는다. 화면은 `.mn-app > .mn-header + .mn-body + .mn-footer`.
> 값은 `.mn-param`(라벨 · 리드아웃 · 눈금자 · 캡션). 선택은 반전. 시그널은 살아 있는 것에만.
> 상태는 단어로. 라벨은 대문자 명사. 푸터에 버전 · 조작 힌트 · 측정값.

마크업 레시피는 `COMPONENTS.md`, 차트는 `CHARTS.md`, 실제 렌더링은 `preview/index.html`·`preview/charts.html`, 완성 화면은 `templates/`.
에이전트용 규칙 파일은 `skills/`, 결과 검증은 `node scripts/check-usage.mjs <작업 폴더>`.

---

## 14. 에이전트 화면

에이전트 대화는 **계기가 쓰는 작업 로그**다. 말풍선 앱처럼 보이지 않게 한다.
- 사용자 말은 오목한 종이 위 헤어라인 상자, 에이전트 말은 상자 없는 산문.
- 생각(reasoning)은 접힌 채로, 시간만 보인다(`THOUGHT · 6.1 S`). 흐르는 동안에만 마지막 몇 줄을 보여준다.
- 도구 호출은 한 줄 기록: 상태 사각 · 도구 이름 · 인자 요약 · 걸린 시간/결과 수. 펼치면 입력과 결과 카드.
- 결과는 카드: 표 · 코드 · diff(+/− · 취소선 · 추가 줄 잉크 막대) · 검색 결과. diff를 복사하면 `+`/`-`/공백이 붙은 unified diff가 나온다. 코드 리뷰 화면은 `data-diff="hue"`로 옅은 초록/빨강 배경을 켤 수 있다(파랑 시그널 전용).
- 운영 환경을 건드리는 행동은 **승인 카드**로 멈춘다 — 무엇을, 정확한 명령, 되돌리는 법. 결정되면 조용해지고 누가 언제 했는지 남는다.
- 시그널: 커서 · 실행 중 도구 · 진행 중 단계 · 대기 중 승인 · 예산 넘은 컨텍스트 · 실행 중 STOP 버튼. 끝난 것은 전부 잉크.
- 상태줄의 연장으로 **실행 패널**(경과 · 도구 수 · 토큰 · 비용 · 컨텍스트 · 건드린 파일 · 권한)을 둘 수 있다.

## 15. 차트 (요약 — 전문은 CHARTS.md)

초점 시리즈 **하나**만 시그널, 나머지는 잉크 단계 + 대시. 범례보다 선 끝 직접 라벨.
크기는 종이 → 시그널 램프, 전체의 부분은 잉크 → 옅게(값은 텍스트로도). 축은 눈금자(기준선 + 바깥 눈금), 격자는 가로 faint만.
목표선은 잉크 대시, 강조 구간은 워시, 툴팁은 반전 칩. 파이 대신 비율 막대, 진행 호 대신 눈금자 게이지.
그라디언트·둥근 막대 금지. 지원: 선 · 막대 · 가로 순위 · 누적 막대/영역 · 비율 · 산점 · 히트맵 · 게이지 · 퍼널 · 워터폴 · 스파크라인.
