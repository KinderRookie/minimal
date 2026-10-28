# MINIMAL 컴포넌트

`dist/minimal.css` 한 장이면 전부 동작한다. `js/minimal.js`는 선택 사항이다
(숫자 드래그 · 더블클릭 리셋 · 프리셋 스테퍼 · 테마 스위치 · 토스트).
렌더링 결과는 `preview/index.html`에서 확인한다.

```html
<link rel="stylesheet" href="dist/minimal.css">
<body class="mn"> … </body>
<script src="js/minimal.js"></script>
```

## 공통 규칙

- 접두사는 `mn-`. 블록 `.mn-param`, 요소 `.mn-param__label`, 변형 `.mn-param--sm`, 상태 `.is-live` / `aria-*`.
- 상태는 가능하면 **ARIA 속성**으로 표현한다: `aria-pressed`, `aria-selected`, `aria-checked`, `aria-invalid`, `disabled`.
- 위치·양은 **CSS 변수**로 넘긴다: `--mn-value`(0–1), `--mn-x / --mn-y / --mn-w / --mn-h`, `--mn-heat`, `--mn-pos`, `--mn-cols`.
- 컴포넌트 CSS에는 원시 색, 그림자, 리터럴 radius가 없다. 빌드가 거부한다.

| 파일 | 블록 |
| --- | --- |
| `_base.css` | `.mn` 루트, `color-scheme`(테마를 따라 네이티브 부품도 다크로), 스크롤바(3px 회색 선, 트랙 없음), 포커스 링, 기본 링크, `.mn-ko`, `.mn-sr-only`, `.mn-num` |
| `type.css` | `.mn-wordmark` `.mn-title` `.mn-label` `.mn-subtitle` `.mn-caption` `.mn-hint` `.mn-sep` `.mn-count` `.mn-kbd` `.mn-readout` `.mn-stats` `.mn-stat` |
| `frame.css` | `.mn-app` `.mn-header` `.mn-vrule` `.mn-body` `.mn-main` `.mn-panel` `.mn-rail` `.mn-footer` `.mn-section` `.mn-params` `.mn-stack` `.mn-row` `.mn-rule` |
| `shell.css` | `.mn-shell` `.mn-side` `.mn-top` `.mn-shell__content` `.mn-page` `.mn-initials` `.mn-split` |
| `nav.css` | `.mn-crumbs` `.mn-tabs` `.mn-pager` `.mn-stages` |
| `button.css` | `.mn-btn` `.mn-glyph` `.mn-btn-row` `.mn-stepper` |
| `choice.css` | `.mn-seg` `.mn-words` `.mn-check` `.mn-switch` |
| `param.css` | `.mn-param` `.mn-ruler` `.mn-shape` |
| `field.css` | `.mn-field` `.mn-input` `.mn-select` `.mn-textarea` |
| `form.css` | `.mn-form` `.mn-form__section` `.mn-form__grid` `.mn-form__actions` `.mn-form-error` `.mn-field--required` |
| `card.css` | `.mn-cards` `.mn-card` (`--framed` `--link`) |
| `table.css` | `.mn-table-wrap` `.mn-table` (`__select` `__expand` `__detail` `__actions` `--sticky`) `.mn-sort` `.mn-expand` `.mn-now` `.mn-list` |
| `cells.css` | `.mn-heat` `.mn-cells` `.mn-cell` `.mn-steps` `.mn-step` |
| `plot.css` | `.mn-plot` `.mn-axis` `.mn-wash` `.mn-marker` `.mn-playhead` `.mn-scope` `.mn-wave` `.mn-minimap` `.mn-ratio` `.mn-spark`, SVG 페인트 `.mn-s-*` `.mn-f-*` `.mn-t-*`. 살아 있는 스코프는 `MN.monitor()`로 그린다 |
| `feedback.css` | `.mn-tag` `.mn-note` `.mn-toast` `[data-mn-tip]` `.mn-dialog` `.mn-sheet` `.mn-menu` `.mn-meter` `.mn-empty` `.mn-skeleton` |
| `list.css` | `.mn-toolbar` `.mn-chip` `.mn-bulkbar` `.mn-table-foot` `.mn-index` `.mn-dropdown` (`.mn-menu__item--rich` `--danger`) |
| `chat.css` | `.mn-chat` `.mn-turn` `.mn-caret` `.mn-working` `.mn-reason` `.mn-tool` `.mn-result` `.mn-diff` `.mn-hits` `.mn-approve` `.mn-plan` `.mn-code` `.mn-cite` `.mn-sources` `.mn-attach` `.mn-starters` `.mn-composer` `.mn-model` `.mn-context` |

---

## 프레임 — `.mn-app`

```html
<div class="mn-app">
  <header class="mn-header">
    <div class="mn-header__brand">
      <h1 class="mn-wordmark">Tide</h1>
      <span class="mn-vrule" aria-hidden="true"></span>
      <p class="mn-subtitle">Frond grid <span class="mn-sep">/</span> effect</p>
    </div>
    <div class="mn-header__center"><!-- .mn-stepper --></div>
    <div class="mn-header__end"><!-- A|B, UNDO, REDO, … --></div>
  </header>

  <div class="mn-body">
    <main class="mn-main"><!-- .mn-plot + .mn-axis --></main>
    <aside class="mn-panel"><!-- .mn-params, .mn-section … --></aside>
  </div>

  <footer class="mn-footer">
    <span>Tide 1.0.0</span>
    <span class="mn-footer__hints">Drag a number up or down <span class="mn-sep">·</span> Double-click = default</span>
    <span class="mn-footer__end">DSP 1%</span>
  </footer>
</div>
```

| 변형 | 용도 |
| --- | --- |
| `.mn-body` | 필드 + 패널 (기본, 패널 폭 `--mn-panel-width` = 460px) |
| `.mn-body--rail` | 레일 + 필드 + 패널 (ODD PARTS의 부품 리스트) |
| `.mn-body--doc` | 레일 + 본문 (설정, 문서) |

### 섹션
```html
<section class="mn-section">
  <div class="mn-section__head">
    <h2 class="mn-section__title">Grid</h2>
    <span class="mn-section__meta">96.0 BPM</span>
  </div>
  …
</section>
```
룰은 기본이 제목 **위**. `--under`는 아래, `--bare`는 없음. 시그널 제목은 `.mn-section__title--signal`.

---

## 파라미터 — `.mn-param` (시그니처)

```html
<div class="mn-param">
  <label class="mn-param__label" for="reach">Reach</label>
  <output class="mn-readout" for="reach" data-drag>
    <span class="mn-readout__num">0.80</span><span class="mn-readout__unit">s</span>
  </output>
  <div class="mn-ruler">
    <input class="mn-ruler__input" id="reach" type="range"
           min="0" max="1.6" step="0.01" value="0.80" data-default="0.5">
  </div>
  <span class="mn-param__caption" data-captions="Short,Medium,Long">Medium</span>
</div>
```

- 눈금자 그림은 CSS가 그리고, 투명한 `<input type="range">`가 위에 올라가 실제 조작을 받는다.
- `data-captions="A,B,C"`는 범위를 **같은 폭으로** 나눠 낮은 값 → 높은 값 순서로 고른다(3개면 0–33 % · 33–67 % · 67–100 %). 경계가 고르지 않으면 JS에서 직접 `textContent`를 바꾼다.
- 단위(`.mn-readout__unit`)는 CSS가 대문자로 바꾼다. 비율 단위는 `/ shard`처럼 슬래시로.
- JS 없이 쓸 때는 `.mn-ruler`에 `style="--mn-value: .5"`를 직접 준다.
- `minimal.js`가 붙으면: `--mn-value`·숫자·캡션 동기화, 숫자 드래그, 더블클릭 = `data-default`, Shift = 미세.

| input 속성 | 효과 |
| --- | --- |
| `data-default` | 더블클릭 시 돌아갈 값 (없으면 초기 `value`) |
| `data-decimals` | 표시 자릿수 (없으면 `step`에서 유추) |
| `data-pad="3"` | `001`처럼 0 채움 |
| `data-signed` | 양수에 `+` |

| 클래스 | 효과 |
| --- | --- |
| `.mn-readout.is-live` | 지금 모듈레이션 중 → 시그널 숫자 |
| `.mn-readout--sm / --lg / --xl` | 28 / 64 / 104px |
| `.mn-ruler--fill` | 0부터 값까지 시그널 굵은 선 |
| `.mn-ruler--center` | 가운데부터 값까지 (팬, dB) |
| `.mn-ruler--ink` | 잉크 포인터 (움직이지 않는 값) |
| `.mn-ruler--sm` | 고밀도 그리드용 미니 눈금자 |
| `.mn-ruler__band` + `--mn-from/--mn-to` | 권장 범위 워시 |
| `--mn-ticks` / `--mn-majors` | 눈금 수 (기본 20 / 4) |
| `.mn-param--sm` | 28px 숫자, 고밀도 |
| `.mn-param--inline` | 라벨 왼쪽 |
| `.mn-param__aside` + `.mn-shape` | 숫자 옆 작은 모양 상자 (LFO 곡선, 빈 슬롯 `—`) |
| `.mn-param.is-disabled` | 라벨·숫자 회색 (input에 `disabled`도 함께) |

여러 개는 그리드로: `<div class="mn-params" style="--mn-cols: 3">…</div>`

---

## 스탯 — `.mn-stat` (KPI)

```html
<div class="mn-stats" style="--mn-cols: 4">
  <div class="mn-stat">
    <span class="mn-label">P95 wait</span>
    <p class="mn-readout is-live"><span>41</span><span class="mn-readout__unit">s</span></p>
    <span class="mn-caption">Target 35 s <span class="mn-sep">·</span> over</span>
  </div>
  …
</div>
```
리드아웃은 64px(`--sm` 묶음이면 44px). 기준을 넘은 값만 `.is-live`. 캡션에 기준과 판정을 쓴다.
960px 이하에서 2열.

---

## 앱 셸 — `.mn-shell` (여러 페이지짜리 툴)

조작 화면 하나는 `.mn-app`, **페이지가 여러 개인 툴**(콘솔·어드민·운영)은 `.mn-shell`.
크롬(사이드바 + 톱바)은 고정되고 `.mn-shell__content`만 스크롤된다. 완성 예: `templates/shell.html`.

```html
<body class="mn">
<div class="mn-shell">
  <nav class="mn-side" aria-label="Main">
    <div class="mn-side__head">
      <span class="mn-wordmark">Shard</span>
      <span class="mn-subtitle">Ops <span class="mn-sep">/</span> Asia</span>
    </div>
    <div class="mn-side__nav">
      <ul class="mn-side__group">
        <li class="mn-side__group-label">Run</li>
        <li><a class="mn-side__item" href="…"><span class="mn-side__n">01</span><span class="mn-side__label">Overview</span></a></li>
        <li><a class="mn-side__item" href="…" aria-current="page"><span class="mn-side__n">02</span><span class="mn-side__label">Shards</span><span class="mn-side__count">24</span></a></li>
        <li><a class="mn-side__item" href="…"><span class="mn-side__n">03</span><span class="mn-side__label">Incidents</span><span class="mn-side__count is-live">2</span></a></li>
      </ul>
    </div>
    <div class="mn-side__foot">
      <span class="mn-initials">JL</span>
      <span class="mn-side__who"><span>J. Lee</span><span>On call · until 18:00</span></span>
    </div>
  </nav>

  <header class="mn-top">
    <div class="mn-top__start">
      <button class="mn-btn mn-btn--icon mn-btn--sm mn-shell__toggle" data-mn-nav-toggle aria-label="Menu">≡</button>
      <ol class="mn-crumbs" aria-label="Breadcrumb"><li><a href="…">Ops</a></li><li aria-current="page">Shards</li></ol>
    </div>
    <div class="mn-top__end">…</div>
  </header>

  <main class="mn-shell__content">
    <div class="mn-page">
      <div class="mn-page__head">
        <div class="mn-page__heading">
          <span class="mn-label">Asia · Ranked squad</span>
          <h1 class="mn-page__title">Shards</h1>
          <p class="mn-page__desc">…</p>
        </div>
        <div class="mn-page__actions"><button class="mn-btn mn-btn--solid">New rollout →</button></div>
      </div>
      …
    </div>
  </main>
</div>
```

| | |
| --- | --- |
| 사이드바 | 색 레일이 아니라 **목차**. 번호(`__n`) · 대문자 모노 라벨 · 카운트. 현재 = 반전(`aria-current="page"`) |
| `.mn-side__count.is-live` | 봐야 할 것이 있는 메뉴 — 숫자만 시그널 |
| `.mn-top` | 높이 64px, 아래 1.5px 룰. 왼쪽 브레드크럼, 오른쪽 검색·테마·사용자 |
| `.mn-page` / `--narrow` | 페이지 여백. 설정·폼 페이지는 `--narrow`(880px) |
| `.mn-initials` | 아바타 대신 이니셜 정사각 칩. `--open`(외곽선), `--sm` |
| 960px 이하 | 사이드바는 드로어. `[data-mn-nav-toggle]` 버튼이 열고, 바깥 클릭·Esc가 닫는다 (minimal.js) |
| 커스텀 프로퍼티 | `--mn-side-width`(232px), `--mn-top-height`(64px) |

---

## 내비게이션 — `.mn-crumbs` / `.mn-tabs` / `.mn-pager` / `.mn-stages`

### 브레드크럼
```html
<ol class="mn-crumbs" aria-label="Breadcrumb">
  <li><a href="…">Ops</a></li><li><a href="…">Asia</a></li><li aria-current="page">Shards</li>
</ol>
```

### 탭 — 진짜 tablist
```html
<div class="mn-tabs">
  <div class="mn-tabs__list" role="tablist" aria-label="Shard views">
    <button class="mn-tabs__tab" role="tab" id="t-all" aria-controls="p-all" aria-selected="true">All<sup class="mn-count">24</sup></button>
    <button class="mn-tabs__tab" role="tab" id="t-inc" aria-controls="p-inc" aria-selected="false">Incidents<sup class="mn-count is-live">2</sup></button>
  </div>
  <section class="mn-tabs__panel" role="tabpanel" id="p-all" aria-labelledby="t-all">…</section>
  <section class="mn-tabs__panel" role="tabpanel" id="p-inc" aria-labelledby="t-inc" hidden>…</section>
</div>
```
현재 탭 = 룰 위에 선 잉크 블록. minimal.js가 클릭·← → Home End로 전환하고 `mn:tab` 이벤트를 쏜다.
페이지 이동형 탭이면 `<a class="mn-tabs__tab" aria-current="page">`. `--full`은 폭을 나눠 가진다.
같은 줄의 단어 선택(`.mn-words--row`)은 **값을 고르는 것**, 탭은 **보는 화면을 바꾸는 것**이다.

### 페이지네이션
```html
<nav class="mn-pager" aria-label="Pages">
  <span>41–60 of 1,204</span>
  <ul class="mn-pager__pages">
    <li><button class="mn-pager__item" aria-label="Previous page">&lt;</button></li>
    <li><a class="mn-pager__item" href="…">02</a></li>
    <li><a class="mn-pager__item" href="…" aria-current="page">03</a></li>
    <li class="mn-pager__gap">…</li>
    <li><button class="mn-pager__item" aria-label="Next page">&gt;</button></li>
  </ul>
</nav>
```
페이지 번호는 두 자리(`03`). 범위 텍스트를 항상 함께 쓴다.

### 단계 — `.mn-stages`
```html
<ol class="mn-stages" aria-label="Rollout steps">
  <li class="mn-stage is-done"><span class="mn-stage__mark"></span><span class="mn-stage__label">Build</span><span class="mn-stage__desc">4.13.0</span></li>
  <li class="mn-stage" aria-current="step"><span class="mn-stage__mark"></span><span class="mn-stage__label">Targets</span></li>
  <li class="mn-stage"><span class="mn-stage__mark"></span><span class="mn-stage__label">Review</span></li>
</ol>
```
| 상태 | 표기 |
| --- | --- |
| `.is-done` | 반전 마커, 진한 연결선 |
| `aria-current="step"` | **시그널 외곽선** — 지금 진행 중(살아 있는 것) |
| (기본) | 점선 마커 = 아직 |
| `.is-error` | 시그널 외곽선 + 시그널 라벨 |
마커가 비어 있으면 `01` `02`가 자동으로 붙는다. `--vertical`은 사이드 패널용. 720px 이하 가로형은 현재 단계 라벨만 보인다.

---

## 카드 — `.mn-card`

카드는 **떠 있는 상자가 아니라 룰로 잘린 블록**이다. 기본은 위쪽 1px 잉크 룰뿐.
클릭해서 고르는 타일일 때만 `--framed`로 사방을 두른다. 그림자·회색 배경은 없다.

```html
<div class="mn-cards" style="--mn-card-min: 240px">
  <article class="mn-card">
    <div class="mn-card__head"><span class="mn-card__eyebrow">Release · 4.13</span><span class="mn-card__meta">Oct 21</span></div>
    <h3 class="mn-card__title">Ranked squad rebalance</h3>
    <p class="mn-card__body">…</p>
  </article>

  <article class="mn-card mn-card--framed mn-card--link">
    <div class="mn-card__media"><svg>…</svg><span class="mn-tag mn-tag--solid">Live</span></div>
    <div class="mn-card__head"><h3 class="mn-card__title"><a href="…">Tide</a></h3><span class="mn-card__meta">FX</span></div>
    <p class="mn-card__body mn-card__body--clamp">…</p>
    <div class="mn-card__foot"><span>v1.0.0</span><span class="mn-spacer"></span><span>Updated 2 d</span></div>
  </article>
</div>
```
| | |
| --- | --- |
| `--framed` | 사방 헤어라인. `--strong`이나 `aria-selected="true"`면 잉크 테두리 |
| `--link` | 제목 안의 첫 링크가 카드 전체를 덮는다 — 타깃 하나. hover = `bg.hover`, 포커스 링은 카드에 |
| `__media` | 헤어라인 액자 안의 그림. 꽉 찬 사진(bleed) 금지. `--mn-media-ratio` |
| `__body--clamp` | `--mn-lines`(기본 2)줄 말줄임 |

---

## 폼 — `.mn-form`

```html
<form class="mn-form">
  <div class="mn-form-error" role="alert">
    <p class="mn-form-error__title">2 fields need attention</p>
    <ul class="mn-form-error__list"><li><a href="#f-batch">Batch size · must be 1–6</a></li></ul>
  </div>

  <fieldset class="mn-form__section">
    <legend class="mn-form__legend"><span>Targets</span><span>Step 02 / 04</span></legend>
    <p class="mn-form__hint">…</p>
    <div class="mn-form__grid">
      <label class="mn-field mn-field--required"><span class="mn-field__label">Region</span>…</label>
      <label class="mn-field mn-field--full">…</label>
    </div>
  </fieldset>

  <div class="mn-form__actions mn-form__actions--sticky">
    <p class="mn-form__actions-note">Draft · not started</p>
    <button class="mn-btn mn-btn--ghost" type="button">Back</button>
    <button class="mn-btn mn-btn--solid">Next →</button>
  </div>
</form>
```
섹션 = 위 룰 + 대문자 범례. 필수는 별표가 아니라 **`REQUIRED` 단어**. 에러는 맨 위 요약(필드로 가는 링크) + 필드 밑 `.mn-field__error`.
액션 바는 위 1.5px 룰, 왼쪽 상태 메모, 오른쪽 버튼. 긴 폼은 `--sticky`. 그리드는 720px 이하 1열.
라디오 묶음처럼 `<label>`로 감쌀 수 없는 필드는 `<div class="mn-field">`.

---

## 비율 막대 · 스파크라인 — 라이브러리 없이

```html
<div class="mn-ratio">
  <div class="mn-ratio__bar">
    <span class="mn-ratio__seg" style="--mn-share:.62"></span>
    <span class="mn-ratio__seg is-focus" style="--mn-share:.25"></span>
    <span class="mn-ratio__seg" style="--mn-share:.13"></span>
  </div>
  <ul class="mn-ratio__keys">
    <li class="mn-ratio__key"><i></i>4.12 <b>62%</b></li>
    <li class="mn-ratio__key is-focus"><i></i>4.13 <b>25%</b></li>
    <li class="mn-ratio__key"><i></i>4.11 <b>13%</b></li>
  </ul>
</div>

<svg class="mn-spark" data-values="61,64,62,70,74,79,85,88,91,94" role="img" aria-label="CPU climbing to 94%"></svg>
```
- 비율 막대는 **파이 차트 대신** 쓴다. 조각은 순서대로 잉크 → 옅게(최대 5개, 나머지는 "Other"). 강조할 조각 하나만 `.is-focus`(조각과 키 둘 다).
  옅은 조각은 종이와 3:1이 안 되므로 **값을 키에 반드시 숫자로** 쓴다.
- 스파크라인은 minimal.js가 그린다. `data-type="bars"`, `data-focus="last|max|min|none"`, `data-min`/`data-max`로 축 고정, `--mn-spark-w`/`--mn-spark-h`, `.mn-spark--block`(폭 100%).
  행마다 최소·최대로 정규화되므로 **행끼리 크기를 비교하려면 `data-min`/`data-max`를 같게** 준다. `aria-label`에 추세를 말로 쓴다.

---

## 버튼 — `.mn-btn`

```html
<button class="mn-btn">Generate</button>
<button class="mn-btn" aria-pressed="true"><span class="mn-glyph"></span> Looping</button>
<button class="mn-btn mn-btn--solid">New mix →</button>
<button class="mn-btn mn-btn--signal" aria-pressed="true">Freeze on <span class="mn-sep">/</span> lines hold</button>
<button class="mn-btn mn-btn--signal-line">Remove</button>
<button class="mn-btn mn-btn--ghost">Evolve</button>
<button class="mn-btn mn-btn--bracket">More</button>
<button class="mn-btn mn-btn--icon" aria-label="Next">&gt;</button>
```

| 변형 | 의미 |
| --- | --- |
| (기본) | 가능한 액션 — 외곽선 |
| `aria-pressed="true"` / `.is-on` | 켜짐 — 반전 |
| `--solid` | 주 액션 — 반전 고정 |
| `--signal` | **엔게이지 모드** — 동작이 바뀌는 상태. 화면당 하나 |
| `--signal-line` | 예외·파괴 액션. 동사 라벨 필수 |
| `--ghost` | 상자 없는 단어 |
| `--bracket` | `[ MORE ]` |
| `--icon` | 정사각 (`<` `>` `+` `−` `…`) |
| `--sm` / `--lg` / `--block` | 24 / 40 / 전체 폭 |

글리프: `.mn-glyph`(■) · `--open`(□) · `--dot`(●) · `--signal`(시그널 색).

### 프리셋 스테퍼 — `.mn-stepper`
```html
<div class="mn-stepper" data-items="GLASS GARDEN|SEA FLUTE|SHORE SAND">
  <span class="mn-stepper__meta" data-prefix="SOUND">SOUND 01 / 03</span>
  <button class="mn-btn" aria-label="Previous">&lt;</button>
  <span class="mn-stepper__name" aria-live="polite">GLASS GARDEN</span>
  <button class="mn-btn" aria-label="Next">&gt;</button>
</div>
```
`data-items`가 있으면 JS가 순환시키고 `mn:preset` 이벤트(`detail.index`, `detail.name`)를 쏜다.
값을 고친 뒤에는 `.mn-stepper__name`에 `data-dirty` → `NAME *`.

---

## 선택 — `.mn-seg` / `.mn-words` / `.mn-check` / `.mn-switch`

```html
<!-- 상자 세그먼트 -->
<fieldset class="mn-seg" aria-label="Grid">
  <label class="mn-seg__item"><input type="radio" name="grid"><span class="mn-seg__face">Free</span></label>
  <label class="mn-seg__item"><input type="radio" name="grid" checked><span class="mn-seg__face">1/16</span></label>
</fieldset>

<!-- 붙은 A|B -->
<fieldset class="mn-seg mn-seg--joined mn-seg--fit">…</fieldset>

<!-- 단어 리스트 (탭이면 button + role="tab" + aria-selected) -->
<fieldset class="mn-words mn-words--ink">
  <label class="mn-word"><input type="radio" name="ch" checked><span class="mn-word__face is-live" style="--mn-amount:.4">Octave</span></label>
  <label class="mn-word"><input type="radio" name="ch"><span class="mn-word__face is-alt">Hollow</span></label>
</fieldset>

<label class="mn-check"><input type="checkbox" checked> Ear guard</label>

<label class="mn-switch">Play with DAW
  <input type="checkbox" role="switch" checked>
  <span class="mn-switch__face" data-on="On" data-off="Off"></span>
</label>
```

| 세그먼트 변형 | |
| --- | --- |
| `--joined` | 칸 사이 간격 없음 (A|B, EN|日本語) |
| `--fit` | 내용 폭 |
| `--sm` | 24px |

| 단어 상태 | |
| --- | --- |
| 선택 | 잉크 칩 |
| `.is-alt` | 두 번째 선택(B) — 외곽선 |
| `.is-live` + `--mn-amount` | 재생/모듈레이션 — 시그널 밑줄, 폭 = 양 |
| `--row` / `--ink` / `--lg` | 가로 / 잉크색 기본 / 14px |

카운트: `<span class="mn-word__face">Wood<sup class="mn-count">1050</sup></span>`

---

## 입력 — `.mn-field`

```html
<label class="mn-field">
  <span class="mn-field__label">Tempo <span>BPM</span></span>
  <input class="mn-input" value="400" aria-invalid="true">
  <span class="mn-field__error">Out of range · 20–300</span>
</label>

<span class="mn-select-wrap"><select class="mn-select">…</select></span>
<textarea class="mn-textarea"></textarea>
```
`.mn-input--sm / --lg`, `.mn-input--readout`(타이핑 가능한 큰 숫자). 에러는 단어 먼저: `REQUIRED`, `OUT OF RANGE`.

---

## 표 — `.mn-table` / `.mn-now` / `.mn-list`

좁은 패널에서 넘칠 수 있는 표는 `.mn-table-wrap`으로 감싼다 — 표만 가로 스크롤되고 페이지는 넘치지 않는다.

```html
<div class="mn-table-wrap">
<table class="mn-table">
  <thead><tr><th>Target</th><th>Shape</th><th class="is-num">Rate</th><th>Now</th></tr></thead>
  <tbody>
    <tr class="is-idle"><td>Air</td><td><span class="mn-tag mn-tag--muted">Off</span></td><td class="is-num">0.16 Hz</td><td><span class="mn-now" style="--mn-w:0"></span></td></tr>
    <tr class="is-active"><td>Swirl</td><td><span class="mn-tag mn-tag--solid">Random glide</span></td><td class="is-num">0.20 Hz</td><td><span class="mn-now" style="--mn-pos:.6; --mn-w:.2"></span></td></tr>
  </tbody>
</table>
</div>
```

| | |
| --- | --- |
| `tr.is-idle` | 쉬는 행 — tertiary 글자 |
| `tr.is-active` | 일하는 행 — 첫 칸 굵게 |
| `tr.is-end` | 그룹 끝 — 1.5px strong 룰 |
| `tr[aria-selected="true"]` | 시그널 워시 — **대상** 선택(지금 보고 있는 행). 옵션 선택은 반전 (DESIGN.md 02) |
| `.mn-table--hover` / `--dense` | 행 hover / 26px 행 |
| `.mn-now` `--mn-pos` `--mn-w` | 행 안의 현재값 미터 |
| `.mn-now--trace` | 궤적 + 끝점 |

리스트: `.mn-list > .mn-list__head + .mn-list__item(.mn-list__icon, .mn-list__meta)`.

---

## 셀 — `.mn-heat` / `.mn-steps`

```html
<div class="mn-heat">
  <div class="mn-heat__row">
    <span class="mn-heat__label">Pluck</span>
    <div class="mn-cells" style="--mn-cols: 12">
      <span class="mn-cell" style="--mn-heat: .7"></span> …
    </div>
  </div>
</div>

<div class="mn-steps" style="--mn-cols: 16">
  <button class="mn-step is-empty"><span class="mn-step__n">1</span><span>+</span></button>
  <button class="mn-step" aria-pressed="true"><span class="mn-step__n">2</span><span>+</span></button>
  <button class="mn-step is-accent is-current"><span class="mn-step__n">3</span><span>+</span></button>
</div>
```
`--mn-heat` 0–1 → 시그널 농도. `.is-current` 굵은 외곽선, `.is-off` 흐린 셀. `--mn-cell-ratio`로 비율.
스텝: `.is-empty`(점선), `aria-pressed`(잉크), `.is-accent`(시그널 번호), `.is-current`(재생 중), `.mn-steps--sm`(작은 줄).

---

## 플롯 — `.mn-plot`

```html
<div class="mn-plot" style="height: 400px">
  <div class="mn-wash" style="--mn-x:.4; --mn-w:.15; --mn-y:.3; --mn-h:.4"></div>
  <svg viewBox="0 0 1000 400" preserveAspectRatio="none">
    <path class="mn-s-ink" vector-effect="non-scaling-stroke" d="…"/>
    <path class="mn-s-signal" vector-effect="non-scaling-stroke" d="…"/>
  </svg>
  <span class="mn-marker" style="--mn-x:.47; --mn-y:.5"></span>
  <span class="mn-playhead" style="--mn-pos:.3"></span>
  <span class="mn-plot__label mn-plot__label--tl">Orbit · x(t) × x(t+1.7 ms)</span>
</div>
<div class="mn-axis">
  <div class="mn-axis__scale"></div>
  <div class="mn-axis__labels"><span>-0.80 s</span><span class="mn-axis__mid">Left = earlier</span><span>Now</span></div>
</div>
```

SVG는 색을 직접 쓰지 말고 페인트 클래스를 쓴다 — 테마를 따라간다.

| 클래스 | |
| --- | --- |
| `.mn-s-ink / -mute / -line / -grid / -signal` | stroke |
| `.mn-f-ink / -mute / -signal / -wash / -canvas` | fill |
| `.mn-t-label / -ink` | SVG 텍스트 |

기타: `.mn-plot--grid`(`--mn-grid`), `.mn-plot--strong`, `.mn-marker--ghost`, `.mn-scopes > .mn-scope > .mn-scope__label`,
`.mn-wave > i[style="--h:.6"]`(`.is-live`, `.is-dim`), `.mn-minimap > .mn-wash`.

### 살아 있는 모니터 — `MN.monitor()`

```html
<div class="mn-scope"><span class="mn-scope__label">V × I</span><svg viewBox="0 0 100 100" id="vxi"></svg></div>
<script>
  // svgEl(tag, attrs) = document.createElementNS(SVG, tag) + setAttribute 헬퍼
  const trace = [...Array(8)].map((_, i) => vxi.appendChild(svgEl("polyline", { class: i < 3 ? "mn-s-grid" : i < 6 ? "mn-s-mute" : "mn-s-ink" })));
  const dot = vxi.appendChild(svgEl("circle", { r: 2.2, class: "mn-f-signal" }));
  const m = MN.monitor(vxi, (t, dt) => { /* 최신 데이터로 trace·dot 좌표를 다시 쓴다 */ }, { fps: 30 });
  // 데이터 스트림이 끝나면 m.stop()
</script>
```
- `draw(t, dt, el)`: `t` = 시작 후 초, `dt` = 지난 프레임 후 초(첫 프레임 0). 매 프레임 **다시 그린다** — 트윈 없음.
- 화면 밖·숨은 탭에서는 쉬고, `prefers-reduced-motion`이면 첫 프레임만 그리고 멈춘다.
- 잔상은 오래된 순으로 `mn-s-grid` → `mn-s-mute` → `mn-s-ink`, 지금 값만 `mn-*-signal`. 피크 홀드는 잉크 틱.
- 실제 예시 4종(Sand · V × I · Spectrum · Time)은 `preview/index.html` 08 Plot.

---

## 피드백

```html
<span class="mn-tag mn-tag--solid">OK</span>
<span class="mn-tag mn-tag--signal-line">Warn</span>

<div class="mn-note mn-note--signal" role="alert">
  <span class="mn-note__kind">Clip</span>
  <span class="mn-note__body">Output peaked at +1.2 dB.</span>
  <button class="mn-btn mn-btn--sm">Reset</button>
</div>

<script>MN.toast("Saved", "Preset written to slot A");</script>
<button class="mn-btn" data-mn-tip="Double-click = default">?</button>

<dialog class="mn-dialog">
  <div class="mn-dialog__head"><h3 class="mn-dialog__title">Export</h3><button class="mn-btn mn-btn--sm">Close</button></div>
  <div class="mn-dialog__body">…</div>
  <div class="mn-dialog__foot"><button class="mn-btn mn-btn--ghost">Cancel</button><button class="mn-btn mn-btn--solid">Export</button></div>
</dialog>

<div class="mn-sheet"><div class="mn-sheet__head"><h3 class="mn-sheet__title">Mod / moves by itself</h3><button class="mn-btn mn-btn--sm">Close</button></div> … </div>

<ul class="mn-menu" role="menu"><li role="none"><button class="mn-menu__item" role="menuitem">Save <span class="mn-menu__meta">⌘S</span></button></li></ul>

<span class="mn-meter" style="--mn-value:.6"></span>
<div class="mn-empty">No sounds added <span>Drop a loop to load it</span></div>
```

| | |
| --- | --- |
| 태그 | `--solid` `--muted` `--signal` `--signal-line` `--wash`(수정된 트랙명) |
| 노트 | 기본(잉크) · `--signal`(지금 봐) · `--quiet`(팁) |
| 다이얼로그 | 그림자 없음. 배경막은 어두운 스크림이 아니라 **종이 72%** |
| 파괴 확인 | 아래 레시피. 되돌릴 수 없는 액션에만 |
| 시트 | 패널을 **제자리에서 교체**하는 서브 화면 (MOD) |
| 미터 | `--signal`, `.is-busy`(스텝 애니메이션) |

---

### 파괴적 액션 확인

```html
<button class="mn-btn mn-btn--signal-line" onclick="confirmDlg.showModal()">Restart S-04</button>

<dialog class="mn-dialog" id="confirmDlg" aria-labelledby="cd-t" style="--mn-dialog-w: 420px">
  <div class="mn-dialog__head"><h3 class="mn-dialog__title" id="cd-t">Restart S-04</h3></div>
  <div class="mn-dialog__body"><p>118 players are moved to other shards first. Takes about 40 s.</p></div>
  <div class="mn-dialog__foot">
    <button class="mn-btn mn-btn--ghost" onclick="confirmDlg.close()" autofocus>Cancel</button>
    <button class="mn-btn mn-btn--signal-line" onclick="…">Restart S-04</button>
  </div>
</dialog>
```
제목과 확인 버튼은 **같은 동사 + 대상**. 본문은 결과 한 문장. 기본 포커스는 취소에.
되돌릴 수 있는 액션(UNDO가 있는)은 확인 없이 실행하고 토스트에 UNDO를 단다.

---

## 목록 관리 — 툴바 · 칩 · 일괄 바 · 정렬 · 펼침 · 행 메뉴

완성 예: `templates/list.html`. 순서는 항상 **탭+건수 → 툴바 → 일괄 바 → 표 → 푸터**.

```html
<div class="mn-toolbar">
  <label class="mn-toolbar__search"><span class="mn-sr-only">Search</span><input class="mn-input mn-input--sm" type="search" placeholder="Name or ID"></label>
  <div class="mn-toolbar__filters">
    <button class="mn-chip" aria-pressed="true">KR<sup class="mn-count">412</sup></button>
    <span class="mn-chip is-on">Status <span class="mn-chip__value">Flagged</span><button class="mn-chip__clear" aria-label="Clear">×</button></span>
    <button class="mn-chip mn-chip--add">+ Filter</button>
  </div>
  <div class="mn-toolbar__end">…Columns / Export…</div>
</div>

<div class="mn-bulkbar" data-mn-bulk-for="players" hidden>
  <span class="mn-bulkbar__count">0 selected</span>
  <button class="mn-btn">Message</button>
  <button class="mn-btn mn-btn--signal-line">Ban</button>
  <span class="mn-bulkbar__end"><button class="mn-btn mn-btn--ghost" data-mn-bulk-clear>Clear</button></span>
</div>

<div class="mn-table-wrap">
<table class="mn-table mn-table--hover" id="players" data-mn-select data-mn-sort="local">
  <thead><tr>
    <th class="mn-table__select"><label class="mn-check"><input type="checkbox" aria-label="Select all"></label></th>
    <th class="mn-table__expand"><span class="mn-sr-only">Details</span></th>
    <th aria-sort="ascending"><button class="mn-sort">Player</button></th>
    <th class="is-num" aria-sort="none"><button class="mn-sort">Reports</button></th>
    <th class="mn-table__actions"><span class="mn-sr-only">Actions</span></th>
  </tr></thead>
  <tbody>
    <tr>
      <td class="mn-table__select"><label class="mn-check"><input type="checkbox" aria-label="Select dark_fox"></label></td>
      <td class="mn-table__expand"><button class="mn-expand" aria-expanded="false" aria-controls="d1" aria-label="Details"></button></td>
      <td>dark_fox</td><td class="is-num">9</td>
      <td class="mn-table__actions"><div class="mn-dropdown mn-dropdown--end">
        <button class="mn-btn mn-btn--icon mn-btn--sm" data-mn-menu aria-controls="m1" aria-label="Actions">⋯</button>
        <ul class="mn-menu" id="m1" role="menu">
          <li role="none"><button class="mn-menu__item" role="menuitem">View</button></li>
          <li role="separator" class="mn-menu__sep"></li>
          <li role="none"><button class="mn-menu__item mn-menu__item--danger" role="menuitem">Ban dark_fox</button></li>
        </ul></div></td>
    </tr>
    <tr class="mn-table__detail" id="d1" hidden><td colspan="5">…</td></tr>
  </tbody>
</table>
</div>

<div class="mn-table-foot">
  <span>1–20 of 128</span>
  <div class="mn-table-foot__end">Rows <span class="mn-select-wrap"><select class="mn-select">…</select></span> <nav class="mn-pager">…</nav></div>
</div>
```

| | |
| --- | --- |
| 칩 | 꺼짐 = 외곽선, 켜짐 = 반전, `×`로 해제, 점선 = 필터 추가. 값이 있는 필터는 `STATUS <값>` |
| 선택 | 체크된 행 = **대상 선택 → 시그널 워시**. 헤더 체크박스는 일부 선택 시 indeterminate |
| 일괄 바 | 선택이 있을 때만 나타나는 **반전 띠**. 파괴적 버튼은 `--signal-line` + 확인 다이얼로그 |
| 정렬 | `th[aria-sort]` 안의 `.mn-sort`. 정렬된 열에만 ▲▼, 나머지는 흐린 ↕. `data-mn-sort="local"`이면 클라이언트 정렬(`data-sort`로 키 지정), 아니면 `mn:sort` 이벤트만 |
| 펼침 | `.mn-expand[aria-controls]` → 바로 아래 `tr.mn-table__detail` |
| 행 메뉴 | 마지막 열 `⋯` 드롭다운. 위험 항목은 `--danger` + 구분선 아래 + 동사와 대상 |
| 로딩 | `aria-busy="true"` + `.mn-skeleton`(틱 하는 옅은 막대, 시머 그라디언트 금지) |
| 빈 결과 | `tr.mn-table__empty` 안에 무엇이 없는지 + 필터 해제 버튼 |
| 기타 | `.is-truncate`, `.is-plain`(산세리프 셀), `.is-muted`, `--sticky` + `.mn-table-wrap--scroll` |
| 건수 | 탭 카운트와 푸터 총계는 **같은 데이터에서** 계산한다 |

### 드롭다운 — `.mn-dropdown`
`[data-mn-menu]` 버튼 + `.mn-menu`. ↑↓ Home End, Esc, 바깥 클릭으로 닫힘. `--end`(오른쪽 정렬), `--up`(위로 열림).
`role="menuitemradio"`는 하나만 체크되고 `mn:select`(detail.value)를 쏜다. `menuitemcheckbox`는 메뉴를 닫지 않는다.
두 줄짜리 항목은 `.mn-menu__item--rich` + `__name` `__desc` `__meta`.

---

## 마스터-디테일 — `.mn-split` · `.mn-index`

완성 예: `templates/master-detail.html`. `.mn-shell__content` 안에 둔다(높이가 있어야 각 창이 따로 스크롤).

```html
<main class="mn-shell__content" style="overflow: hidden">
  <div class="mn-split" id="split">
    <section class="mn-split__list" aria-label="Reports">
      <div class="mn-split__head">검색 · 필터</div>
      <div class="mn-split__scroll">
        <ul class="mn-index" role="listbox" aria-label="Cases">
          <li role="none"><button class="mn-index__item is-unread" role="option" aria-selected="true">
            <span class="mn-index__title">#4808 · Aimbot</span>
            <span class="mn-index__sub">ghost.pepper · 3 reports</span>
            <span class="mn-index__meta"><span>28 min</span><span class="mn-tag mn-tag--solid">Open</span></span>
          </button></li>
        </ul>
      </div>
      <div class="mn-split__foot">7 shown</div>
    </section>
    <section class="mn-split__detail">
      <div class="mn-split__scroll"><div class="mn-page">
        <button class="mn-btn mn-btn--sm mn-split__back">‹ Reports</button>
        …
      </div></div>
    </section>
  </div>
</main>
```
`<li>`에는 `role="none"`을 준다 — 그래야 listbox → option 관계가 성립한다. 선택된 항목 = 반전(`aria-selected`). 안 읽은 항목 = `.is-unread`(시그널 사각 점 — 볼 것이 있다). ↑↓로 이동하게 한다.
960px 이하에서는 한 창만: `.mn-split[data-view="detail"]`이면 상세, 아니면 목록. `.mn-split__back`은 그때만 보인다.
`--mn-split-list`(340px)로 목록 폭.

---

## 에이전트 채팅 — `.mn-chat`

완성 예: `templates/agent.html` (실제로 흘러가는 실행 포함). 대화는 **계기가 쓰는 로그**다.
시그널은 살아 있는 것에만: 커서, 실행 중인 도구, 진행 중인 계획 단계, 대기 중인 승인, 예산을 넘은 컨텍스트.

```html
<div class="mn-chat">
  <div class="mn-chat__thread"><div class="mn-chat__inner">
    <div class="mn-chat__day">Today · 14:02</div>

    <article class="mn-turn mn-turn--user">
      <div class="mn-turn__meta"><span class="mn-turn__who">You</span><span>14:02</span></div>
      <div class="mn-turn__body"><p>…</p><div class="mn-attachments">…</div></div>
    </article>

    <article class="mn-turn mn-turn--agent">
      <div class="mn-turn__meta"><span class="mn-turn__who">Agent</span><span>Opus 5.5</span><span>14:02</span></div>

      <details class="mn-reason">
        <summary class="mn-reason__head">Thought <span class="mn-reason__time">6.1 s</span></summary>
        <div class="mn-reason__body">…</div>
      </details>

      <div class="mn-plan">…</div>

      <div class="mn-tools">
        <details class="mn-tool">
          <summary class="mn-tool__head">
            <span class="mn-tool__status"></span><span class="mn-tool__name">search_logs</span>
            <span class="mn-tool__arg">region:SEA since:-15m</span><span class="mn-tool__meta">0.8 s · 3 hits</span>
          </summary>
          <div class="mn-tool__body"><div class="mn-result">…</div></div>
        </details>
      </div>

      <div class="mn-turn__body"><p>…<a class="mn-cite" href="#src-1">1</a> … <span class="mn-caret"></span></p></div>
      <div class="mn-approve">…</div>
    </article>
  </div></div>

  <div class="mn-chat__dock">
    <form class="mn-composer">…</form>
  </div>
</div>
```

| 블록 | 문법 |
| --- | --- |
| `.mn-turn--user` | 가는 테두리 + 오목한 종이, 오른쪽. 말풍선 꼬리·색 없음 |
| `.mn-turn--agent` | 상자 없는 산문, 전체 폭. 제목은 모노 대문자 라벨 |
| `.mn-turn__meta` | `YOU` / `AGENT · 모델 · 시각` — 모노 캡션. 중단되면 `Stopped` 태그 |
| `.mn-caret` | 스트리밍 커서 — 시그널 블록, 스텝 깜빡임 |
| `.mn-working` | 아직 아무것도 안 나왔을 때의 한 줄 |
| `.mn-reason` | `<details>` 접힘이 기본. 끝나면 `Thought · 6.1 s`. 스트리밍 중엔 `.is-live`(시그널 점) + **바로 다음 형제** `.mn-reason__snippet`이 마지막 몇 줄을 보여준다 (닫힌 details는 자기 내용을 숨기므로 안에 넣으면 안 보인다) |
| `.mn-tool` | 상태 사각: 완료 ■ · `.is-running` 시그널 깜빡 · `.is-waiting` 시그널 점선(승인 대기) · `.is-error` 시그널 외곽선 · `.is-denied` 회색 외곽선. 이름은 소문자 그대로 써도 CSS가 대문자로 |
| `.mn-result` | 도구 결과 카드: 머리(종류 · 건수) + 본문(최대 280px 스크롤). 표는 `__body--flush`. `--error`. 긴 결과는 `.mn-result__more`. 머리 오른쪽에 건수 + 버튼을 함께 둘 땐 `.mn-result__end`로 묶는다 |
| `.mn-diff` | 줄번호 · 부호 · 코드. 추가 = 왼쪽 3px 잉크 막대 + `--mn-diff-add`(기본 = 오목 종이) + 굵은 `+`, 삭제 = `--mn-diff-del`(기본 = 투명) + 흐린 글자 + 취소선. 글자를 빨강/초록으로 칠하지 않는다. 옅은 초록/빨강 배경은 컨테이너에 `data-diff="hue"` — `data-signal="blue"`일 때만 켜지고 빨강·주황 시그널에서는 단색으로 남는다. 복사(선택 또는 `[data-mn-copy]` 버튼)는 minimal.js가 unified diff로 바꾼다 |
| `.mn-hits` | 검색 결과: 제목 · 위치 · 본문(`<mark>` = 워시) |
| `.mn-approve` | 대기 중 = 시그널 테두리(살아 있음). 무엇을, 정확히 어떤 명령으로, 되돌릴 수 있는지. `ALLOW ONCE`(solid) · `ALWAYS…` · `DENY`(ghost). 결정 후 `.is-decided` — 조용해지고 누가 언제 했는지 남긴다 |
| `.mn-plan` | 완료 ■ · 현재 시그널 외곽선 · 남은 것 점선. 머리에 `2 / 5` |
| `.mn-code` | 머리(언어 · COPY — `data-mn-copy`) + 본문. 구문 강조는 색이 아니라 굵기·명도(`.c-key` `.c-str` `.c-comment`) |
| `.mn-cite` · `.mn-sources` | 본문 위첨자 상자 번호 → 끝에 출처 목록(번호 · 제목 · 위치) |
| `.mn-attach` | 종류 칩(CSV/LOG/PDF) · 이름 · 크기 · ×. 업로드 중 `.is-uploading` |
| `.mn-starters` | 빈 대화의 제안. 모노 제목 + 한 줄 설명 |
| `.mn-composer` | 필드 + 막대: 첨부 · `.mn-model`(위로 열리는 드롭다운) · 노력(세그먼트) · `.mn-context` · 보내기. 실행 중엔 보내기 → **`--signal` STOP**(엔게이지 모드) |
| `.mn-context` | 미터 + `84K / 1M`. 80% 넘으면 `.is-live` |
| `.mn-composer__menu` | 필드가 `/`로 시작하면 위로 열리는 명령 목록. `ul[role=listbox]` + `li.mn-menu__item--rich[role=option]`, 필드는 `role="combobox" aria-controls aria-activedescendant`. ↑↓ 이동, Enter/Tab 선택, Esc 닫기 — Enter-보내기보다 **먼저** 처리 |
| `.mn-turn__error` | 답변 전체가 실패: 에이전트 턴 안에 `.mn-note--signal`(`FAILED` · 원인 · "Nothing was changed") + `RETRY`. 도구 하나의 실패는 `.mn-tool.is-error` |

minimal.js: `.mn-composer__field`에서 Enter = 컴포저에 `mn:send`(detail.text), Shift+Enter = 줄바꿈, 높이 자동.
스트리밍·도구 실행·승인 흐름 자체는 앱의 몫이다 — `templates/agent.html`의 스크립트가 참고 구현.
스크롤은 **바닥에 붙어 있다가**, 사용자가 위로 올리면 멈추고 `.mn-chat__jump`(↓ Latest)를 보여준다.

---

## 테마 스위치

```html
<fieldset class="mn-seg mn-seg--joined mn-seg--fit">
  <label class="mn-seg__item"><input type="radio" name="t" value="light" data-mn-attr="theme" checked><span class="mn-seg__face">A</span></label>
  <label class="mn-seg__item"><input type="radio" name="t" value="dark"  data-mn-attr="theme"><span class="mn-seg__face">B</span></label>
</fieldset>
```
`data-mn-attr`는 `theme` / `signal` / `paper` / `dialect`. `data-mn-target="#island"`로 대상 바꿈.
