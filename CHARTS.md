# MINIMAL 차트

차트도 계기판의 일부다. 레퍼런스(tide의 겹친 선, odd parts의 TIME/SPECTRUM 스코프,
mosaic의 팀버 맵)에서 차트는 **잉크 선 위에 시그널 하나**로 그려진다. 무지개 팔레트는 없다.

| 파일 | |
| --- | --- |
| `charts/theme.js` | 단일 원천. 토큰 빌드(`dist/tokens.js`) 또는 실행 중인 CSS(`--mn-*`)에서 값을 읽는다 |
| `charts/echarts.js` | ECharts 테마 객체 + 시리즈 헬퍼 |
| `charts/recharts.js` | Recharts 컴포넌트에 스프레드하는 prop 묶음 |
| `preview/charts.html` | 두 라이브러리 실제 렌더링 + 테마/시그널/종이 전환 |

팔레트는 `theme.js` 한 곳에만 있다. 거기를 고치면 ECharts와 Recharts 차트가 함께 바뀐다.

---

## 문법

### 1. 초점 하나, 나머지는 맥락
차트마다 **지금 봐야 할 시리즈 하나**만 시그널이다. 나머지는 잉크 단계 + 대시 패턴으로 구분한다.

| 슬롯 | 색 | 선 |
| --- | --- | --- |
| focus | `signal.mark` | 2px 실선 |
| context 0 | `ink.primary` | 1.25px 실선 |
| context 1 | `ink.secondary` | `6 4` 대시 |
| context 2 | `ink.tertiary` | `2 3` 점선 |
| context 3 | `ink.disabled` | `10 3 2 3` 일점쇄선 |
| 그 이상 | `ink.disabled` | `1 3` — **기타로 접는다** |

시리즈가 다섯 개를 넘으면 차트를 나누거나 "기타"로 합친다. 색을 더 만들지 않는다.

### 2. 범례보다 직접 라벨
선 끝에 이름을 단다(ECharts `endLabel`). 초점 시리즈의 라벨만 시그널 글자다.
범례는 직접 라벨을 달 수 없을 때의 대안이다.

### 3. 크기 = 종이에 섞인 시그널
히트맵·밀도는 `paper → signal` 5단계(`t.seq`). `.mn-cell`의 `--mn-heat`와 같은 램프다.
발산형은 `ink ← paper → signal`(`t.div`): 아래는 잉크, 위는 시그널.

### 4. 축은 눈금자
- 범주축: 1px 잉크 기준선, **바깥으로** 4px 눈금, 모노 10px 라벨.
- 값축: 선·눈금 없음. **가로 격자만**, `line.faint`. 세로 격자는 값 읽기에 도움이 안 된다.
- 축 이름은 대문자 + 방향: `BRIGHTNESS →`, `DECAY →`, 단위는 `S`, `%`.

### 5. 선택·창·목표
- 강조 구간 = **워시**(`m.span` / `r.span`). 라벨은 시그널 글자, 대문자.
- 목표·임계값 = 잉크 `4 4` 대시 + 모노 라벨(`35 S TARGET`). 시그널이 아니다 — 목표는 살아 있는 값이 아니다.
- 지금 위치 = 시그널 1px 세로선(axisPointer / cursor).

### 6. 툴팁은 반전 칩
잉크 바탕 + 종이 글자, 모노 11px, 반경 0, 그림자 없음. 시리즈 표시는 점이 아니라 **짧은 대시**
(잉크 시리즈가 잉크 칩 위에서 사라지지 않도록 칩 글자색으로 바뀐다).

### 7. 막대·점
- 막대: 잉크, 최대 14px, 반경 0. 강조할 막대 **하나**만 시그널(`focusIndex`).
- 산점: 4px **정사각형**. 선택 집합만 시그널.

### 8. 전체의 부분 (누적·비율·퍼널)
부분은 **잉크 → 옅게** 5단계(`t.parts`), 조각 사이는 종이색 1px 이음매. 강조할 부분 **하나**만 시그널.
옅은 단계는 종이와 3:1이 안 되므로 **부분 값은 반드시 텍스트로도**(라벨·범례·툴팁) 보여준다.
다섯 조각이 넘으면 "Other"로 접는다.

### 9. 단일 값
게이지는 **휜 눈금자**다: 헤어라인 호 · 바깥 눈금 · 시그널 ▲ 바늘 · 가운데 라이트 리드아웃. 진행 호(채워지는 도넛)는 쓰지 않는다.
목표 범위는 호 바깥의 워시 띠. 직선 게이지가 필요하면 입력 없는 `.mn-ruler --ink`(읽기 전용 파라미터)를 쓴다.
KPI 옆 추세는 스파크라인(마지막 점만 시그널).

### 금지
그라디언트 영역 채움 · 3D · 파이/도넛(→ 비율 막대) · 진행 호 게이지(→ 눈금자 게이지) · 둥근 막대 · 그림자 · 애니메이션 진입 효과 ·
범례만으로 시리즈 구분 · 상태색(초록/빨강)으로 좋고 나쁨 표시 · 한 차트에 시그널 두 개.

---

## ECharts

```js
import * as echarts from "echarts";
import { minimalECharts } from "./charts/echarts.js";

const m = minimalECharts(document.documentElement);   // 실행 중인 테마를 그대로 읽는다
// 또는 minimalECharts({ theme: "dark", signal: "blue", paper: "white" })

const chart = echarts.init(el, m.theme, { renderer: "svg" });
chart.setOption({
  tooltip: { trigger: "axis" },
  xAxis: { type: "category", data: minutes },
  yAxis: { type: "value", name: "S" },
  series: [
    { name: "KR",  data: kr,  ...m.line({ slot: 0 }) },
    { name: "JP",  data: jp,  ...m.line({ slot: 1 }) },
    { name: "SEA", data: sea, ...m.line({ focus: true }),
      markLine: m.target(35, "35 S TARGET"),
      markArea: m.span("-13", "NOW", "OVER TARGET") },
  ],
});
```

| 헬퍼 | |
| --- | --- |
| `m.theme` | `echarts.init(el, m.theme)`에 넘기는 테마 객체 |
| `m.line({ focus, slot, endLabel })` | 라인 시리즈 패치 |
| `m.bar({ focusIndex, slot })` | 막대 하나만 시그널 |
| `m.scatter({ focusSet, muted })` | 데이터 인덱스 Set만 시그널 |
| `m.target(value, label)` | `markLine` |
| `m.span(from, to, label)` | `markArea` — 워시 구간 |
| `m.heat({ min, max })` | `visualMap` — 종이 → 시그널 |
| `m.stack(i, { type, focus, group })` | 누적 막대(`type: "bar"`) / 누적 영역(`"area"`) 부분 i |
| `m.hbar({ focusIndex })` | 가로 순위 막대 — 범주는 `yAxis`(`inverse: true`), 끝에 값 라벨 |
| `m.ratio(parts, { focus })` | 한 줄 비율 막대 옵션 전체 (파이 대체) |
| `m.funnel(stages, { focus })` | 퍼널 시리즈. 기본은 **가장 크게 떨어진 단계**가 시그널. 라벨 = 값 · 첫 단계 대비 % |
| `m.waterfall(rows, { focusIndex })` | `{ categories, series }`. 증가 = 잉크, 감소 = 속 빈 막대, 합계 = 회색. `{ total: true, value }`로 시작값 고정 |
| `m.gauge(value, { min, max, unit, label, band, decimals })` | 눈금자 게이지 시리즈 **배열**(밴드 + 눈금자) |
| `m.spark(values)` | 축 없는 작은 차트 옵션 |
| `m.t` | 해석된 값 (`focus`, `context`, `seq`, `div`, `wash` …) |

**테마 전환**: ECharts 테마는 `init` 때 고정된다. `data-theme` / `data-signal`이 바뀌면
`dispose()` 후 새 `m.theme`으로 다시 `init` 한다(`preview/charts.html`의 MutationObserver 참고).

## Recharts

```jsx
import { minimalRecharts } from "./charts/recharts.js";
const r = minimalRecharts(document.documentElement);

<LineChart data={rows} margin={r.margin}>
  <CartesianGrid {...r.grid} />
  <XAxis dataKey="t" {...r.xAxis} />
  <YAxis {...r.yAxis} />
  <Tooltip {...r.tooltip} />
  <ReferenceArea x1="-13" x2="NOW" {...r.span("OVER TARGET")} />
  <ReferenceLine y={35} {...r.target("35 S TARGET")} />
  <Line dataKey="KR"  {...r.line({ slot: 0 })} />
  <Line dataKey="SEA" {...r.line({ focus: true })} />
</LineChart>

<Bar dataKey="v" {...r.bar()}>
  {rows.map((_, i) => <Cell key={i} fill={r.barFill(i === nowIndex)} />)}
</Bar>
```

| 묶음 | |
| --- | --- |
| `r.line` · `r.bar` · `r.barFill(isFocus)` | 선 / 막대 / 막대 하나 강조 |
| `r.stack(i, { type, focus })` | `<Bar stackId>` · `<Area stackId>` 부분 i |
| `r.hAxis.x` · `r.hAxis.y` · `r.hbar()` | `layout="vertical"` 순위 막대 |
| `r.waterfall(rows)` · `r.waterfallCell(d, isFocus)` | 투명 base `<Bar>` + delta `<Bar>`의 `<Cell>` |
| `r.funnelFill(i, isFocus)` | `<Funnel>`의 `<Cell fill>` |
| `r.spark` · `r.sparkDot` · `r.sparkMargin` | `<Line>` + `<ReferenceDot>` |
| `r.target(label)` · `r.span(label)` | 목표선 / 강조 구간 |

게이지는 Recharts에 대응하는 형태가 없다 — ECharts `m.gauge` 또는 읽기 전용 `.mn-param`을 쓴다.

래퍼 컴포넌트는 만들지 않는다. Recharts는 prop으로 조립하는 API라 스프레드면 충분하고,
래퍼를 두면 Recharts 업그레이드 때마다 그 층도 고쳐야 한다.
테마가 바뀌면 `minimalRecharts(...)`를 다시 호출해 리렌더한다.

## 라이브러리 없이

- **스파크라인**: `<svg class="mn-spark" data-values="…">` — minimal.js가 그린다 (COMPONENTS.md).
- **비율 막대**: `.mn-ratio` — 순수 CSS (COMPONENTS.md).

## 순수 SVG / 캔버스

작은 스코프나 단순한 막대·선은 라이브러리 없이 직접 그려도 된다(템플릿들이 그렇게 한다).
**ECharts/Recharts를 쓸 때만** 위 헬퍼가 필수다. 직접 그릴 때는 색을 직접 쓰지 말고 페인트 클래스를 쓴다:
`.mn-s-ink` `.mn-s-signal` `.mn-s-mute` `.mn-s-grid` · `.mn-f-ink` `.mn-f-signal` `.mn-f-wash` · `.mn-t-label`.
캔버스라면 `chartTheme(document.documentElement)`의 값을 쓴다.

`preserveAspectRatio="none"`은 **선**에만 쓴다(`vector-effect="non-scaling-stroke"`와 함께).
막대·점·텍스트는 늘어나므로, 그때는 viewBox를 실제 픽셀 폭으로 맞추거나(`ResizeObserver`) 라이브러리를 쓴다.
