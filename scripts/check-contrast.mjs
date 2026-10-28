#!/usr/bin/env node
/**
 * MINIMAL contrast check — zero dependency WCAG 2.x verification.
 *
 * Validates foreground/background role pairs in every resolved scope
 * (theme × paper × signal) from dist/tokens.resolved.json.
 *   4.5 — small text (labels are 10–12px, so nearly everything is "small")
 *   3   — non-text marks (pointer, playhead, focus ring) and readouts ≥ 28px
 * Known-unsupported pairings are listed in SKIP with the reason, and documented in DESIGN.md.
 * data-diff="hue" tints are checked where the signal allows them, plus a ΔE gap from the signal wash.
 * Exits 1 on any failure.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const scopes = JSON.parse(readFileSync(join(ROOT, "dist", "tokens.resolved.json"), "utf8"));

/** [foreground, background, required, note] */
const PAIRS = [
  ["ink-primary", "bg-canvas", 4.5],
  ["ink-primary", "bg-sunken", 4.5],
  ["ink-secondary", "bg-canvas", 4.5, "labels"],
  ["ink-secondary", "bg-sunken", 4.5],
  ["ink-tertiary", "bg-canvas", 4.5, "hints / captions"],
  ["inverse-ink", "inverse-bg", 4.5, "selected chip"],
  ["signal-text", "bg-canvas", 4.5, "small signal text"],
  ["signal-on", "signal-fill", 4.5, "label on signal button"],
  ["signal-mark", "bg-canvas", 3, "pointer / playhead / large readout"],
  ["line-strong", "bg-canvas", 3, "control outline"],
  ["ink-primary", "signal-wash", 4.5, "selected row / wash tag"],
  ["signal-text", "bg-hover", 4.5, "signal-line button hover"],
  ["ink-tertiary", "bg-sunken", 4.5, "hovered idle row"],
  ["ink-primary", "bg-hover", 4.5, "hovered control"],
  ["ink-primary", "diff-add", 4.5, "added diff line (data-diff=hue)"],
  ["ink-tertiary", "diff-del", 4.5, "deleted diff line (data-diff=hue)"],
];

/** Pairings the system does not support — documented, not silently passed. */
const SKIP = [
  { scope: "light/warm/orange", pair: "signal-mark/bg-canvas", why: "orange on warm paper is 2.7:1 — DESIGN.md forbids this combination" },
];

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const HEX = /^#[0-9a-f]{6}$/i;

/** signal-wash is color-mix(in srgb, mark p%, canvas) — resolve it per channel so pairs on it are checked too. */
const mix = (a, b, p) =>
  "#" + [1, 3, 5].map((i) => {
    const v = Math.round(parseInt(a.slice(i, i + 2), 16) * p + parseInt(b.slice(i, i + 2), 16) * (1 - p));
    return v.toString(16).padStart(2, "0");
  }).join("").toUpperCase();
/** diff tints exist only where the signal allows them (diff-allow = 1); elsewhere data-diff="hue" stays monochrome. */
const gated = [];
for (const [scope, t] of Object.entries(scopes)) {
  t["signal-wash"] = mix(t["signal-mark"], t["bg-canvas"], parseFloat(t["signal-wash-pct"]) / 100);
  if (t["diff-allow"] !== "1") { gated.push(scope); continue; }
  const p = parseFloat(t["diff-tint-pct"]) / 100;
  t["diff-add"] = mix(t["diff-add-hue"], t["bg-sunken"], p);
  t["diff-del"] = mix(t["diff-del-hue"], t["bg-canvas"], p);
}

let failures = 0;
let checked = 0;
for (const [scope, t] of Object.entries(scopes)) {
  for (const [fg, bg, need, note = ""] of PAIRS) {
    if (!HEX.test(t[fg] ?? "") || !HEX.test(t[bg] ?? "")) continue;
    const skip = SKIP.find((s) => s.scope === scope && s.pair === `${fg}/${bg}`);
    const r = ratio(t[fg], t[bg]);
    checked++;
    if (r + 1e-9 < need) {
      if (skip) {
        console.log(`  skip  ${scope.padEnd(18)} ${fg} on ${bg}  ${r.toFixed(2)} — ${skip.why}`);
        continue;
      }
      failures++;
      console.log(`  FAIL  ${scope.padEnd(18)} ${fg} on ${bg}  ${r.toFixed(2)} < ${need}  ${note}`);
    }
  }
}
/** A deleted-line tint must not read as the signal wash (selected row). CIE76 ΔE on sRGB/D65. */
const lab = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const f = (v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
  const [x, y, z] = [(r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047, r * 0.2126 + g * 0.7152 + b * 0.0722, (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883].map(f);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};
const MIN_DE = 10;
for (const [scope, t] of Object.entries(scopes)) {
  if (!t["diff-del"]) continue;
  const [p, q] = [lab(t["diff-del"]), lab(t["signal-wash"])];
  const de = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  checked++;
  if (de < MIN_DE) {
    failures++;
    console.log(`  FAIL  ${scope.padEnd(18)} diff-del vs signal-wash  ΔE ${de.toFixed(1)} < ${MIN_DE}  deleted line would read as a selected row`);
  }
}
console.log(`  note  diff hue gated off (stays monochrome) in ${gated.length} scopes: ${gated.join(", ")}`);
console.log(failures ? `contrast: ${failures} failure(s) of ${checked} checks` : `contrast: ${checked} checks passed`);
process.exit(failures ? 1 : 0);
