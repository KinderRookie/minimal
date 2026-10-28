/**
 * MINIMAL × Recharts — prop bundles to spread onto recharts components. No new
 * palette: everything comes from chartTheme() (theme.js), shared with echarts.js.
 *
 *   import { minimalRecharts } from "minimal-design/charts/recharts.js";
 *   const r = minimalRecharts({ theme: "light", signal: "red" });   // or document.documentElement
 *
 *   <LineChart data={rows} margin={r.margin}>
 *     <CartesianGrid {...r.grid} />
 *     <XAxis dataKey="t" {...r.xAxis} />
 *     <YAxis {...r.yAxis} />
 *     <Tooltip {...r.tooltip} />
 *     <ReferenceLine y={35} {...r.target("35 S TARGET")} />
 *     <Line dataKey="sea" {...r.line({ focus: true })} />
 *     <Line dataKey="kr"  {...r.line({ slot: 0 })} />
 *   </LineChart>
 *
 * No wrapper components: recharts is assembled from props, so a spread is enough and
 * nothing here has to follow recharts upgrades.
 */
import { chartTheme, contextSlot, partColor } from "./theme.js";

export function minimalRecharts(source) {
  const t = chartTheme(source);
  const tick = { fill: t.inkSecondary, fontFamily: t.fontMono, fontSize: 10, letterSpacing: "0.08em" };
  const thousands = (v) => (typeof v === "number" ? v.toLocaleString("en-US") : v);

  /** cells for a bar chart: <Bar>{r.cells(rows, i => i === 3)}</Bar> needs <Cell>, so we return fills */
  const barFill = (isFocus) => (isFocus ? t.focus : t.ink);

  return {
    t,
    margin: { top: 12, right: 48, bottom: 4, left: 0 },

    /** faint horizontals only — vertical gridlines don't help reading values */
    grid: { stroke: t.grid, strokeWidth: 1, vertical: false },

    /** the category axis is a ruler: hairline baseline, ticks outward */
    xAxis: {
      stroke: t.axis,
      tick,
      tickLine: { stroke: t.axis },
      axisLine: { stroke: t.axis },
      tickSize: 4,
      tickMargin: 6,
    },
    /** the value axis has no line; the grid carries it */
    yAxis: {
      stroke: t.axis,
      tick,
      tickLine: false,
      axisLine: false,
      width: 48,
      tickFormatter: thousands,
    },

    tooltip: {
      cursor: { stroke: t.focus, strokeWidth: 1 },
      contentStyle: {
        background: t.tooltipBg,
        border: 0,
        borderRadius: 0,
        boxShadow: "none",
        padding: "6px 10px",
        fontFamily: t.fontMono,
        fontSize: 11,
        color: t.tooltipInk,
      },
      itemStyle: { color: t.tooltipInk, padding: 0 },
      labelStyle: { color: t.tooltipInk, letterSpacing: "0.08em", marginBottom: 2 },
      isAnimationActive: false,
    },

    legend: {
      iconType: "plainline",
      iconSize: 14,
      wrapperStyle: { fontFamily: t.fontMono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: t.inkSecondary },
    },

    /** <Line> props. focus → signal 2px with an end dot; otherwise an ink context slot with its dash. */
    line({ focus = false, slot = 0 } = {}) {
      const s = focus ? { color: t.focus, dash: [] } : contextSlot(t, slot);
      return {
        type: "linear",
        stroke: s.color,
        strokeWidth: focus ? 2 : 1.25,
        strokeDasharray: s.dash.length ? s.dash.join(" ") : undefined,
        dot: false,
        activeDot: { r: 3, fill: s.color, stroke: t.canvas, strokeWidth: 1 },
        isAnimationActive: false,
      };
    },

    /** <Bar> props. Pair with <Cell fill={r.barFill(i === focusIndex)} /> to highlight one bar. */
    bar({ slot = 0 } = {}) {
      return { fill: contextSlot(t, slot).color, maxBarSize: 14, radius: 0, isAnimationActive: false };
    },
    barFill,

    /** <ReferenceLine> props for a target / threshold */
    target(label) {
      return {
        stroke: t.ink,
        strokeDasharray: "4 4",
        strokeWidth: 1,
        ifOverflow: "extendDomain",
        label: label ? { value: label, position: "insideTopRight", fill: t.inkSecondary, fontFamily: t.fontMono, fontSize: 10 } : undefined,
      };
    },

    /** <Bar stackId>/<Area stackId> part i: ink → pale, `focus` = signal; paper seams between parts */
    stack(i, { type = "bar", focus = false, group = "total" } = {}) {
      const color = focus ? t.focus : partColor(t, i);
      return type === "area"
        ? { type: "linear", stackId: group, stroke: t.canvas, strokeWidth: 1, fill: color, fillOpacity: 1, dot: false, activeDot: false, isAnimationActive: false }
        : { stackId: group, fill: color, stroke: t.canvas, strokeWidth: 1, maxBarSize: 18, radius: 0, isAnimationActive: false };
    },

    /** Horizontal ranking: <BarChart layout="vertical"> + <XAxis type="number" {...r.hAxis.x}> + <YAxis type="category" {...r.hAxis.y}> */
    hAxis: {
      x: { stroke: t.axis, tick, tickLine: false, axisLine: false, tickFormatter: thousands },
      y: { stroke: t.axis, tick: { ...tick, fill: t.ink }, tickLine: false, axisLine: { stroke: t.axis }, width: 72 },
    },
    hbar() {
      return {
        fill: t.ink,
        maxBarSize: 12,
        radius: 0,
        isAnimationActive: false,
        label: { position: "right", fill: t.inkSecondary, fontFamily: t.fontMono, fontSize: 10 },
      };
    },

    /** Waterfall rows → data with an invisible base. Render two stacked <Bar>s:
        <Bar dataKey="base" stackId="wf" fill="transparent" /> and
        <Bar dataKey="delta" stackId="wf" {...r.bar()}>{rows.map((d,i)=><Cell key={i} {...r.waterfallCell(d, i === focus)} />)}</Bar> */
    waterfall(rows) {
      let run = 0;
      return rows.map((r) => {
        if (r.total) {
          if (r.value !== undefined) run = r.value; // an anchor: "START 12,000"
          return { name: r.name, base: 0, delta: run, kind: "total", value: run };
        }
        const v = r.value;
        const row = { name: r.name, base: v >= 0 ? run : run + v, delta: Math.abs(v), kind: v >= 0 ? "up" : "down", value: v };
        run += v;
        return row;
      });
    },
    waterfallCell(d, isFocus = false) {
      if (isFocus) return { fill: t.focus };
      if (d.kind === "down") return { fill: t.canvas, stroke: t.ink, strokeWidth: 1 };
      if (d.kind === "total") return { fill: t.inkSecondary };
      return { fill: t.ink };
    },

    /** Funnel cells: <Funnel>{stages.map((s,i)=><Cell key={i} fill={r.funnelFill(i, i === focus)} />)}</Funnel> */
    funnelFill(i, isFocus = false) {
      return isFocus ? t.focus : partColor(t, Math.min(i, 3));
    },

    /** Sparkline:
        <LineChart width={96} height={24} data={rows} margin={r.sparkMargin}>
          <Line dataKey="v" {...r.spark} />
          <ReferenceDot x={rows.length - 1} y={rows.at(-1).v} {...r.sparkDot} />
        </LineChart>  (no axes; give the XAxis-less chart index keys) */
    spark: { type: "linear", stroke: t.ink, strokeWidth: 1.25, dot: false, activeDot: false, isAnimationActive: false },
    sparkDot: { r: 2.5, fill: t.focus, stroke: "none", isFront: true, ifOverflow: "visible" },
    sparkMargin: { top: 3, right: 3, bottom: 3, left: 3 },

    /** <ReferenceArea> props for the highlighted window */
    span(label) {
      return {
        fill: t.wash,
        fillOpacity: 1,
        stroke: "none",
        ifOverflow: "visible",
        label: label ? { value: label, position: "insideTopLeft", fill: t.focusText, fontFamily: t.fontMono, fontSize: 10 } : undefined,
      };
    },
  };
}
