/**
 * MINIMAL × charts — the one source both adapters (echarts.js, recharts.js) read.
 *
 * Chart grammar (CHARTS.md):
 *   - No categorical rainbow. A chart has ONE focus series in signal, and context
 *     series in ink steps told apart by dash pattern + direct labels, not by hue.
 *   - Magnitude (heat, density) = signal mixed into paper (the .mn-cell ramp).
 *   - Diverging = ink (below) ↔ paper ↔ signal (above).
 *   - Axes are rulers: hairline baseline, ticks outward, mono labels. Grid = faint horizontals only.
 *   - Tooltip = inverse chip. No shadows, no radius, no area gradients.
 *
 * Values come from the token build, never invented here:
 *   chartTheme({ theme: "dark", signal: "blue", paper: "white" })   // from dist/tokens.js
 *   chartTheme(document.documentElement)                            // live, from computed --mn-* vars
 */
import { tokens, fonts } from "../dist/tokens.js";

/** sRGB per-channel mix — same math as color-mix(in srgb, a p, b) and check-contrast.mjs. */
export function mix(a, b, p) {
  const ch = (h, i) => parseInt(h.slice(i, i + 2), 16);
  return (
    "#" +
    [1, 3, 5]
      .map((i) => Math.round(ch(a, i) * p + ch(b, i) * (1 - p)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

const ROLES = [
  "bg-canvas", "bg-sunken", "ink-primary", "ink-secondary", "ink-tertiary", "ink-disabled",
  "line-strong", "line-default", "line-subtle", "line-faint", "inverse-bg", "inverse-ink",
  "signal-mark", "signal-fill", "signal-text", "signal-on", "signal-wash-pct",
  "font-family-mono", "font-family-sans",
];

/** Resolve role values either from the static build or from live CSS on an element. */
function readRoles(source) {
  if (source && typeof source === "object" && "nodeType" in source) {
    const cs = getComputedStyle(source);
    const out = {};
    for (const r of ROLES) out[r] = cs.getPropertyValue(`--mn-${r}`).trim();
    out.mode = source.closest?.('[data-theme="dark"]') ? "dark"
      : source.closest?.('[data-theme="light"]') ? "light"
      : (matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    return out;
  }
  const { theme = "light", signal = "red", paper = "white" } = source || {};
  const key = `${theme}/${theme === "dark" ? "white" : paper}/${signal}`;
  const t = tokens[key];
  if (!t) throw new Error(`MINIMAL chartTheme: unknown scope "${key}" (theme light|dark, signal red|blue|orange, paper white|warm)`);
  return { ...t, "font-family-mono": fonts.mono, "font-family-sans": fonts.sans, mode: theme };
}

/**
 * @param {{theme?: "light"|"dark", signal?: "red"|"blue"|"orange", paper?: "white"|"warm"} | Element} [source]
 */
export function chartTheme(source) {
  const r = readRoles(source);
  const canvas = r["bg-canvas"];
  const mark = r["signal-mark"];
  const washPct = parseFloat(r["signal-wash-pct"] || "12") / 100;

  return {
    mode: r.mode,
    canvas,
    ink: r["ink-primary"],
    inkSecondary: r["ink-secondary"],
    inkTertiary: r["ink-tertiary"],
    inkDisabled: r["ink-disabled"],
    axis: r["line-strong"],
    frame: r["line-default"],
    grid: r["line-faint"],
    rowRule: r["line-subtle"],
    tooltipBg: r["inverse-bg"],
    tooltipInk: r["inverse-ink"],
    fontMono: r["font-family-mono"],
    fontSans: r["font-family-sans"],

    /** the one series that matters */
    focus: mark,
    focusText: r["signal-text"],
    wash: mix(mark, canvas, washPct),

    /** context series — ink steps, then dashes carry identity. Slot 0 is the strongest. */
    context: [r["ink-primary"], r["ink-secondary"], r["ink-tertiary"], r["ink-disabled"]],
    dash: [[], [6, 4], [2, 3], [10, 3, 2, 3]],
    /** fold everything past 4 context series into this */
    other: r["ink-disabled"],

    /** parts of a whole (stacked, ratio, funnel): ink → pale by order, matches .mn-ratio.
        Pale parts are below 3:1 against paper, so part values must also appear as text. */
    parts: [1, 0.72, 0.5, 0.32, 0.18].map((p) => mix(r["ink-primary"], canvas, p)),

    /** magnitude ramp, paper → signal (5 steps, matches .mn-cell --mn-heat) */
    seq: [0.12, 0.3, 0.5, 0.7, 0.9].map((p) => mix(mark, canvas, p)),
    /** diverging: ink below, paper middle, signal above */
    div: {
      neg: r["ink-primary"],
      negSoft: mix(r["ink-primary"], canvas, 0.35),
      mid: canvas,
      posSoft: mix(mark, canvas, 0.35),
      pos: mark,
    },
  };
}

/** Part i of a whole → fill. Index ≥ 5 reuses the palest step (fold into "other" instead). */
export function partColor(t, i) {
  return t.parts[Math.min(i, t.parts.length - 1)];
}

/** Context slot i → { color, dash }. Index ≥ 4 folds to `other`. */
export function contextSlot(t, i) {
  if (i >= t.context.length) return { color: t.other, dash: [1, 3] };
  return { color: t.context[i], dash: t.dash[i] };
}
