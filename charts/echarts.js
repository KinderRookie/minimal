/**
 * MINIMAL × ECharts — a theme object plus series helpers. No new colors: everything
 * comes from chartTheme() (theme.js), the same source recharts.js reads.
 *
 *   import * as echarts from "echarts";
 *   import { minimalECharts } from "minimal-design/charts/echarts.js";
 *
 *   const m = minimalECharts(document.documentElement);      // live from CSS, or { theme, signal, paper }
 *   const chart = echarts.init(el, m.theme);
 *   chart.setOption({
 *     xAxis: { type: "category", data: days },
 *     yAxis: { type: "value" },
 *     series: [
 *       { name: "SEA", data: sea, ...m.line({ focus: true }) },   // the one that matters
 *       { name: "KR",  data: kr,  ...m.line({ slot: 0 }) },       // context, ink
 *       { name: "JP",  data: jp,  ...m.line({ slot: 1 }) },       // context, dashed
 *     ],
 *   });
 *
 * Re-theme on data-theme / data-signal changes: dispose and init again with a fresh m.theme
 * (ECharts themes are fixed at init).
 */
import { chartTheme, contextSlot, partColor } from "./theme.js";

const mono = (t, size = 10, color = t.inkSecondary) => ({ fontFamily: t.fontMono, fontSize: size, color });

const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function tooltipRows(t, params) {
  const list = Array.isArray(params) ? params : [params];
  const head = list[0]?.axisValueLabel ?? list[0]?.name ?? "";
  const rows = list
    .filter((p) => p.seriesType !== "heatmap")
    .map((p) => {
      const c = typeof p.color === "string" ? p.color : t.tooltipInk;
      const color = c.toUpperCase() === t.tooltipBg.toUpperCase() ? t.tooltipInk : c;
      const v = Array.isArray(p.value) ? p.value[p.value.length - 1] : p.value;
      return `<div style="display:flex;gap:12px;align-items:center;justify-content:space-between">` +
        `<span><i style="display:inline-block;width:10px;height:2px;margin-right:8px;vertical-align:middle;background:${color}"></i>${esc(p.seriesName)}</span>` +
        `<b style="font-weight:500">${esc(v)}</b></div>`;
    });
  return `<div style="letter-spacing:.06em;margin-bottom:2px;opacity:.7">${esc(head)}</div>${rows.join("")}`;
}

export function minimalECharts(source) {
  const t = chartTheme(source);

  const axisCommon = {
    axisLine: { show: true, lineStyle: { color: t.axis, width: 1 } },
    axisTick: { show: true, inside: false, length: 4, lineStyle: { color: t.axis, width: 1 } },
    axisLabel: { ...mono(t), margin: 10 },
    splitLine: { show: false },
    splitArea: { show: false },
    nameTextStyle: { ...mono(t, 10, t.inkTertiary) },
    nameGap: 14,
  };

  const theme = {
    color: [t.focus, ...t.context],
    backgroundColor: "transparent",
    textStyle: { fontFamily: t.fontMono, color: t.ink },
    title: {
      left: 0,
      top: 0,
      textStyle: { fontFamily: t.fontMono, fontSize: 11, fontWeight: 400, color: t.inkSecondary },
      subtextStyle: { fontFamily: t.fontMono, fontSize: 10, color: t.inkTertiary },
    },
    grid: { left: 8, right: 16, top: 28, bottom: 8, containLabel: true },
    legend: {
      // prefer direct labels (endLabel); the legend is a fallback
      icon: "rect",
      itemWidth: 14,
      itemHeight: 2,
      itemGap: 18,
      textStyle: { ...mono(t, 10, t.inkSecondary) },
      inactiveColor: t.inkDisabled,
    },
    tooltip: {
      backgroundColor: t.tooltipBg,
      borderWidth: 0,
      padding: [6, 10],
      textStyle: { fontFamily: t.fontMono, fontSize: 11, color: t.tooltipInk },
      extraCssText: "border-radius:0;box-shadow:none;",
      // default markers are filled dots in the series color — an ink series vanishes on the
      // ink chip. Draw a short dash instead, in the series color or (for ink) the chip ink.
      formatter: (params) => tooltipRows(t, params),
      axisPointer: {
        type: "line",
        lineStyle: { color: t.focus, width: 1 },
        crossStyle: { color: t.focus, width: 1 },
        label: { backgroundColor: t.tooltipBg, color: t.tooltipInk, fontFamily: t.fontMono, fontSize: 10, borderRadius: 0 },
      },
    },
    axisPointer: { lineStyle: { color: t.focus, width: 1 } },
    categoryAxis: { ...axisCommon, boundaryGap: true },
    valueAxis: {
      ...axisCommon,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: true, lineStyle: { color: t.grid, width: 1 } },
    },
    timeAxis: axisCommon,
    logAxis: { ...axisCommon, splitLine: { show: true, lineStyle: { color: t.grid } } },
    line: {
      symbol: "none",
      smooth: false,
      lineStyle: { width: 1.25 },
      // no emphasis fading: blurring context while reading a tooltip hides the comparison
      emphasis: { disabled: true },
    },
    bar: { barMaxWidth: 14, itemStyle: { borderRadius: 0 } },
    scatter: { symbol: "rect", symbolSize: 4 },
    heatmap: { itemStyle: { borderColor: t.axis, borderWidth: 1 } },
    markLine: {
      symbol: "none",
      lineStyle: { color: t.ink, type: [4, 4], width: 1 },
      label: { ...mono(t, 10, t.inkSecondary), position: "insideEndTop" },
    },
    visualMap: {
      inRange: { color: [t.canvas, ...t.seq] },
      textStyle: { ...mono(t) },
      itemWidth: 10,
      itemHeight: 120,
    },
    dataZoom: {
      borderColor: t.frame,
      fillerColor: t.wash,
      handleStyle: { color: t.canvas, borderColor: t.axis },
      textStyle: { ...mono(t) },
    },
  };

  /** Line series patch. focus=true → signal, 2px, end label in signal text. Otherwise context slot. */
  function line({ focus = false, slot = 0, endLabel = true } = {}) {
    const s = focus ? { color: t.focus, dash: [] } : contextSlot(t, slot);
    return {
      type: "line",
      symbol: "none",
      color: s.color,
      lineStyle: { color: s.color, width: focus ? 2 : 1.25, type: s.dash.length ? s.dash : "solid" },
      z: focus ? 3 : 2,
      endLabel: endLabel
        ? { show: true, formatter: "{a}", ...mono(t, 10, focus ? t.focusText : t.inkSecondary), distance: 6 }
        : undefined,
      labelLayout: { moveOverlap: "shiftY" },
    };
  }

  /** Bar series patch. Pass focusIndex to paint one bar signal and the rest ink. */
  function bar({ focusIndex = -1, slot = 0 } = {}) {
    const base = contextSlot(t, slot).color;
    return {
      type: "bar",
      barMaxWidth: 14,
      itemStyle: {
        borderRadius: 0,
        color: focusIndex < 0 ? base : (p) => (p.dataIndex === focusIndex ? t.focus : base),
      },
    };
  }

  /** Scatter: ink squares; points in `focusSet` (data indices) go signal. */
  function scatter({ focusSet = null, muted = false } = {}) {
    return {
      type: "scatter",
      symbol: "rect",
      symbolSize: 4,
      itemStyle: {
        color: (p) => (focusSet && focusSet.has(p.dataIndex) ? t.focus : muted ? t.inkDisabled : t.ink),
      },
    };
  }

  /** A target / threshold line: dashed ink with a mono label. */
  function target(value, label) {
    return {
      symbol: "none",
      silent: true,
      lineStyle: { color: t.ink, type: [4, 4], width: 1 },
      label: { formatter: label, ...mono(t, 10, t.inkSecondary), position: "insideEndTop" },
      data: [{ yAxis: value }],
    };
  }

  /** A highlighted window (the instrument "wash"): markArea patch. */
  function span(from, to, label = "") {
    return {
      silent: true,
      itemStyle: { color: t.wash },
      label: { show: !!label, formatter: label, ...mono(t, 10, t.focusText), position: "insideTopLeft" },
      data: [[{ xAxis: from }, { xAxis: to }]],
    };
  }

  /** Heatmap visualMap: paper → signal. */
  function heat({ min = 0, max = 1, show = false } = {}) {
    return { min, max, show, calculable: false, inRange: { color: [t.canvas, ...t.seq] } };
  }

  /* ---- parts of a whole ------------------------------------------------- */

  /** Stacked bar/area part i. Parts step ink → pale; `focus` makes this part signal.
      Paper-colored seams separate the parts (no colored borders). */
  function stack(i, { type = "bar", focus = false, group = "total" } = {}) {
    const color = focus ? t.focus : partColor(t, i);
    if (type === "area") {
      return {
        type: "line",
        stack: group,
        symbol: "none",
        color,
        lineStyle: { color: t.canvas, width: 1 },
        areaStyle: { color, opacity: 1 },
        emphasis: { disabled: true },
      };
    }
    return {
      type: "bar",
      stack: group,
      barMaxWidth: 18,
      color,
      itemStyle: { color, borderRadius: 0, borderColor: t.canvas, borderWidth: 1 },
      emphasis: { disabled: true },
    };
  }

  /** Horizontal ranking bars: put the categories on yAxis (inverse: true for top-down)
      and spread this into the series. Value labels sit at the bar end in mono. */
  function hbar({ focusIndex = -1, label = true } = {}) {
    return {
      type: "bar",
      barMaxWidth: 12,
      itemStyle: { borderRadius: 0, color: (p) => (p.dataIndex === focusIndex ? t.focus : t.ink) },
      label: label
        ? { show: true, position: "right", distance: 6, ...mono(t, 10, t.inkSecondary) }
        : { show: false },
    };
  }

  /** One-line ratio bar (the pie replacement) as an ECharts option. parts: [{ name, value }] */
  function ratio(parts, { focus = null } = {}) {
    const total = parts.reduce((a, p) => a + p.value, 0) || 1;
    return {
      grid: { left: 0, right: 48, top: 0, bottom: 22, containLabel: false },
      xAxis: { type: "value", max: total, show: false },
      yAxis: { type: "category", data: [""], show: false },
      tooltip: { trigger: "item" },
      series: parts.map((p, i) => ({
        name: p.name,
        data: [p.value],
        ...stack(i, { focus: p.name === focus }),
        barWidth: 14,
        label: {
          show: true,
          position: "bottom",
          distance: 6,
          formatter: `${p.name} ${Math.round((p.value / total) * 100)}%`,
          ...mono(t, 10, p.name === focus ? t.focusText : t.inkSecondary),
        },
      })),
    };
  }

  /** Funnel: stages ink → pale, the stage with the biggest drop goes signal.
      stages: [{ name, value }] in order. Labels show value and % of the first stage. */
  function funnel(stages, { focus = "drop" } = {}) {
    const first = stages[0]?.value || 1;
    let worst = -1;
    if (focus === "drop") {
      let maxDrop = -1;
      stages.forEach((s, i) => {
        if (!i) return;
        const drop = 1 - s.value / (stages[i - 1].value || 1);
        if (drop > maxDrop) { maxDrop = drop; worst = i; }
      });
    } else if (typeof focus === "number") worst = focus;
    return {
      type: "funnel",
      sort: "none",
      gap: 2,
      minSize: "6%",
      left: 0,
      right: "28%",
      top: 8,
      bottom: 8,
      data: stages.map((s, i) => ({
        ...s,
        itemStyle: { color: i === worst ? t.focus : partColor(t, Math.min(i, 3)), borderWidth: 0 },
      })),
      label: {
        show: true,
        position: "right",
        formatter: (p) => `${p.name}  ${p.value.toLocaleString("en-US")}  ${Math.round((p.value / first) * 100)}%`,
        ...mono(t, 10, t.inkSecondary),
      },
      labelLine: { show: true, length: 8, lineStyle: { color: t.frame, width: 1 } },
      emphasis: { disabled: true },
    };
  }

  /** Waterfall: rows [{ name, value }] (deltas) plus { name, total: true } rows
      ({ name, total: true, value } anchors the running total, e.g. the starting value).
      Returns { categories, series } — increases are ink, decreases hollow, totals inverse-solid,
      `focusIndex` turns one bar signal. Put categories on xAxis. */
  function waterfall(rows, { focusIndex = -1 } = {}) {
    let run = 0;
    const base = [], up = [], down = [], tot = [];
    rows.forEach((r, i) => {
      if (r.total) {
        if (r.value !== undefined) run = r.value; // an anchor: "START 12,000"
        base.push(0); up.push("-"); down.push("-"); tot.push(run);
        return;
      }
      const v = r.value;
      base.push(v >= 0 ? run : run + v);
      up.push(v >= 0 ? v : "-");
      down.push(v < 0 ? -v : "-");
      tot.push("-");
      run += v;
    });
    const sig = (i, fallback) => (i === focusIndex ? t.focus : fallback);
    const n = (v) => Number(v).toLocaleString("en-US");
    const lbl = (fmt) => ({ show: true, position: "top", distance: 4, formatter: fmt, ...mono(t, 10, t.inkSecondary) });
    return {
      categories: rows.map((r) => r.name),
      series: [
        { type: "bar", stack: "wf", data: base, itemStyle: { color: "transparent" }, emphasis: { disabled: true }, tooltip: { show: false }, silent: true },
        { type: "bar", stack: "wf", name: "Up", data: up, barMaxWidth: 18,
          itemStyle: { borderRadius: 0, color: (p) => sig(p.dataIndex, t.ink) },
          label: lbl((p) => `+${n(p.value)}`) },
        { type: "bar", stack: "wf", name: "Down", data: down, barMaxWidth: 18,
          itemStyle: { borderRadius: 0, color: (p) => sig(p.dataIndex, t.canvas), borderColor: t.ink, borderWidth: 1 },
          label: lbl((p) => `−${n(p.value)}`) },
        { type: "bar", stack: "wf", name: "Total", data: tot, barMaxWidth: 18,
          itemStyle: { borderRadius: 0, color: (p) => sig(p.dataIndex, t.inkSecondary) },
          label: { ...lbl((p) => n(p.value)), color: t.ink, fontWeight: 500 } },
      ],
    };
  }

  /* ---- single values ----------------------------------------------------- */

  /** Arc ruler gauge: ticks like .mn-ruler, a signal ▲ needle, the value as a light readout.
      Returns a series ARRAY (band arc + ruler). band: [from, to] in value units, optional. */
  function gauge(value, { min = 0, max = 100, unit = "", label = "", band = null, decimals = 0 } = {}) {
    const common = {
      type: "gauge",
      min, max,
      startAngle: 210,
      endAngle: -30,
      radius: "88%",
      center: ["50%", "58%"],
      splitNumber: 4,
      silent: true,
    };
    const series = [];
    if (band) {
      const f = (band[0] - min) / (max - min), g = (band[1] - min) / (max - min);
      series.push({
        ...common,
        radius: "92%",
        axisLine: { lineStyle: { width: 9, color: [[f, "transparent"], [g, t.wash], [1, "transparent"]] } },
        axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
        pointer: { show: false }, anchor: { show: false }, title: { show: false }, detail: { show: false },
        data: [{ value }],
      });
    }
    series.push({
      ...common,
      axisLine: { lineStyle: { width: 1, color: [[1, t.axis]] } },
      axisTick: { distance: 0, length: 5, splitNumber: 5, lineStyle: { color: t.axis, width: 1 } },
      splitLine: { distance: 0, length: 11, lineStyle: { color: t.axis, width: 1 } },
      axisLabel: { distance: 16, ...mono(t, 10, t.inkSecondary) },
      pointer: {
        icon: "triangle",
        length: 12,
        width: 11,
        offsetCenter: [0, "-74%"],
        itemStyle: { color: t.focus },
      },
      anchor: { show: false },
      progress: { show: false },
      title: { show: !!label, offsetCenter: [0, "34%"], ...mono(t, 10, t.inkSecondary) },
      detail: {
        valueAnimation: false,
        offsetCenter: [0, "4%"],
        fontFamily: t.fontSans,
        fontSize: 44,
        fontWeight: 300,
        color: t.ink,
        formatter: (v) => `{n|${Number(v).toFixed(decimals)}}{u|${unit ? " " + unit.toUpperCase() : ""}}`,
        rich: {
          n: { fontFamily: t.fontSans, fontSize: 44, fontWeight: 300, color: t.ink },
          u: { fontFamily: t.fontMono, fontSize: 10, color: t.inkSecondary, padding: [16, 0, 0, 0] },
        },
      },
      data: [{ value, name: label.toUpperCase() }],
    });
    return series;
  }

  /** Sparkline option for a tiny chart (no axes): ink line, last point signal. */
  function spark(values) {
    return {
      grid: { left: 2, right: 4, top: 4, bottom: 4 },
      xAxis: { type: "category", show: false, boundaryGap: false, data: values.map((_, i) => i) },
      yAxis: { type: "value", show: false, scale: true },
      tooltip: { show: false },
      series: [{
        type: "line",
        data: values.map((v, i) => (i === values.length - 1 ? { value: v, symbol: "circle", symbolSize: 5, itemStyle: { color: t.focus } } : v)),
        symbol: "none",
        lineStyle: { color: t.ink, width: 1.25 },
        emphasis: { disabled: true },
        silent: true,
      }],
    };
  }

  return { t, theme, line, bar, scatter, target, span, heat, stack, hbar, ratio, funnel, waterfall, gauge, spark };
}
