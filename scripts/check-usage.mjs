#!/usr/bin/env node
/**
 * MINIMAL usage check — zero dependency. For people and agents, after writing UI.
 *
 *   node scripts/check-usage.mjs <dir> [--css path/to/minimal.css] [--ignore a,b]
 *
 * Reports:
 *   unknown  .mn-* classes and --mn-* variables that minimal.css does not define
 *            (typos, invented modifiers, classes from a newer/older version)
 *   raw      hex / rgb() / hsl() colors, literal box-shadow, literal border-radius
 *            in .css/.scss files, <style> blocks, style="" attributes and JSX style={{…}}
 *            — the grammar forbids them
 * Exit 1 when anything is reported. SVG presentation attributes (fill="#…") are not
 * scanned; use the .mn-s-* / .mn-f-* paint classes there instead.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
if (!args.length || args[0].startsWith("--")) {
  console.error("usage: node check-usage.mjs <dir> [--css path/to/minimal.css] [--ignore a,b]");
  process.exit(2);
}
const target = resolve(args[0]);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const here = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(opt("--css") || join(here, "..", "dist", "minimal.css"));
const ignore = new Set(["node_modules", ".git", "dist", ".next", "build", ...(opt("--ignore") || "").split(",").filter(Boolean)]);

if (!existsSync(cssPath)) {
  console.error(`minimal.css not found at ${cssPath} — pass --css`);
  process.exit(2);
}
const css = readFileSync(cssPath, "utf8");
/** declared tokens + "knobs": inputs components read via var(--mn-x, …) and you set on an element */
const definedVars = new Set([
  ...[...css.matchAll(/(--mn-[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
  ...[...css.matchAll(/var\((--mn-[a-z0-9-]+)/g)].map((m) => m[1]),
]);
const definedClass = (name) =>
  new RegExp(`\\.${name.replace(/[-]/g, "\\-")}(?![a-z0-9_-])`).test(css) ||
  new RegExp(`@keyframes\\s+${name}\\b`).test(css);

const EXT = new Set([".html", ".htm", ".jsx", ".tsx", ".js", ".ts", ".mjs", ".vue", ".svelte", ".astro", ".css", ".scss", ".md", ".mdx"]);
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (ignore.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (EXT.has(extname(name))) files.push(p);
  }
})(target);

const CLASS = /(?<![a-z0-9_-]|--|data-)mn-[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?/g;
const VAR = /--mn-[a-z0-9]+(?:-[a-z0-9]+)*/g;
const RAW = [
  [/#[0-9a-f]{3,8}\b/gi, "raw hex color"],
  [/\b(?:rgba?|hsla?|oklch)\(/gi, "raw color function"],
  [/box-shadow\s*:(?!\s*(?:none|var\())/gi, "box-shadow"],
  [/border(?:-[a-z]+)*-radius\s*:(?!\s*(?:var\(|0\b|inherit|50%))/gi, "literal border-radius"],
];
/** words that look like classes but are API / file names */
const ALLOW = new Set(["mn-design", "mn-ko"]);

const unknown = new Map(); // name -> [file:line]
const raw = [];
const lineOf = (text, idx) => text.slice(0, idx).split("\n").length;
const rel = (p) => p.slice(target.length + 1) || p;

for (const f of files) {
  const text = readFileSync(f, "utf8");
  const isCss = /\.(s?css)$/.test(f);
  // don't treat comments as usage
  const code = isCss ? text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")) : text;

  const wildcard = (m) => code.startsWith("-*", m.index + m[0].length); // prose like `--mn-space-*`
  for (const m of code.matchAll(VAR)) {
    if (definedVars.has(m[0]) || wildcard(m)) continue;
    // a project may define its own --mn-* knobs (e.g. --mn-cols on an element): accept if defined in this file
    if (new RegExp(`${m[0]}\\s*:`).test(code)) continue;
    const key = m[0];
    if (!unknown.has(key)) unknown.set(key, []);
    unknown.get(key).push(`${rel(f)}:${lineOf(code, m.index)}`);
  }
  if (!/\.(md|mdx)$/.test(f)) { // markdown mentions class names in prose
    for (const m of code.matchAll(CLASS)) {
      const name = m[0];
      if (ALLOW.has(name) || definedClass(name) || wildcard(m)) continue;
      if (!unknown.has("." + name)) unknown.set("." + name, []);
      unknown.get("." + name).push(`${rel(f)}:${lineOf(code, m.index)}`);
    }
  }

  // where styles live: whole CSS files; in markup/JS — <style> blocks, style="…" attributes,
  // and JSX style={{…}} objects (camelCase keys: boxShadow, borderRadius, color: "#…")
  const scopes = isCss
    ? [[code, 0]]
    : [
        ...[...code.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => [m[1].replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " ")), m.index + m[0].indexOf(m[1])]),
        ...[...code.matchAll(/style\s*=\s*"([^"]*)"/g)].map((m) => [m[1], m.index]),
        ...[...code.matchAll(/style\s*=\s*\{\{([\s\S]*?)\}\}/g)].map((m) => [m[1], m.index]),
      ];
  const JSX = [
    [/boxShadow\s*:\s*(?!["'`]?none|["'`]?var\()/g, "box-shadow"],
    [/borderRadius\s*:\s*(?!["'`]?(?:var\(|0\b|50%))/g, "literal border-radius"],
  ];
  for (const [chunk, offset] of scopes) {
    for (const [re, what] of [...RAW, ...JSX]) {
      for (const m of chunk.matchAll(re)) {
        raw.push(`${rel(f)}:${lineOf(code, offset + m.index)}  ${what} → ${m[0].trim()}`);
      }
    }
  }
}

let problems = 0;
if (unknown.size) {
  console.log("unknown — not defined in minimal.css:");
  for (const [name, where] of unknown) {
    problems++;
    console.log(`  ${name.padEnd(32)} ${where.slice(0, 3).join(", ")}${where.length > 3 ? ` (+${where.length - 3})` : ""}`);
  }
}
if (raw.length) {
  console.log("raw — use --mn-* tokens / .mn-* classes instead:");
  for (const r of raw) {
    problems++;
    console.log("  " + r);
  }
}
console.log(problems ? `check-usage: ${problems} problem(s) in ${files.length} files` : `check-usage: ${files.length} files clean`);
process.exit(problems ? 1 : 0);
