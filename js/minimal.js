/*!
 * MINIMAL behaviors — optional, zero dependency. Plain script (works from file://).
 *
 * What it adds on top of the CSS (everything still works without it, just less alive):
 *   - .mn-ruler__input  → keeps --mn-value on the ruler and the readout number in sync
 *   - .mn-readout[data-drag] → drag the number (up = more; data-drag="x" for left/right)
 *                         Shift = fine (×0.1) · double-click = default · arrow keys on the ruler
 *   - .mn-param__caption[data-captions="OFF,LOW,MID,HIGH"] → caption follows the value
 *   - .mn-stepper[data-items="A|B|C"] → < > cycle the preset name
 *   - [data-mn-attr="theme|signal|paper|dialect"] inputs → set data-* on <html> (or data-mn-target)
 *   - MN.toast(kind, text)
 *   - .mn-tabs           → click / ←→ Home End switch aria-selected + [hidden] panels (aria-controls)
 *   - [data-mn-nav-toggle] → opens/closes .mn-shell sidebar on narrow screens (Esc closes)
 *   - svg.mn-spark[data-values] → draws the sparkline (data-type="bars", data-focus="last|max|min|none")
 *   - [data-mn-menu] button inside .mn-dropdown → opens its .mn-menu; ↑↓ Home End, Esc, outside click;
 *                         menuitemradio → aria-checked + "mn:select" event (detail.value)
 *   - table.mn-table[data-mn-select] → select-all ⇄ rows (indeterminate), drives .mn-bulkbar[data-mn-bulk-for]
 *   - .mn-sort in th → toggles aria-sort; table[data-mn-sort="local"] also reorders rows ("mn:sort" event)
 *   - .mn-expand[aria-controls] → shows/hides its detail row
 *   - .mn-composer__field → Enter = "mn:send" on the composer (Shift+Enter = newline), auto-grow
 *   - .mn-diff copy      → a selection across diff lines copies as a unified diff ("+" / "-" / " " prefixes)
 *   - [data-mn-copy] button in .mn-result / .mn-code → copies its diff (unified) or <pre> text; MN.diffText(el)
 *   - MN.monitor(el, draw, { fps }) → redraws a live monitor (scope, meter) at a frame rate: no tweening,
 *                         paused off-screen and in hidden tabs, one still frame under reduced motion
 *
 * Markup contract (per param):
 *   <div class="mn-param">
 *     <label class="mn-param__label" for="x">REACH</label>
 *     <output class="mn-readout" for="x" data-drag><span class="mn-readout__num">0.80</span><span class="mn-readout__unit">s</span></output>
 *     <div class="mn-ruler"><input class="mn-ruler__input" id="x" type="range" min="0" max="1" step="0.01" value="0.8" data-default="0.5"></div>
 *   </div>
 */
(function () {
  "use strict";

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  function decimalsOf(input) {
    if (input.dataset.decimals) return Number(input.dataset.decimals);
    const step = input.getAttribute("step") || "1";
    return step === "any" ? 2 : (step.split(".")[1] || "").length;
  }

  function format(input, value) {
    let s = Number(value).toFixed(decimalsOf(input));
    if (input.dataset.pad) s = s.padStart(Number(input.dataset.pad), "0");
    if (input.dataset.signed !== undefined && value > 0) s = "+" + s;
    return s;
  }

  function paramOf(input) {
    return input.closest(".mn-param") || input.closest("[data-mn-param]");
  }

  /** Push the input's value into the drawing + readout + caption. */
  function sync(input) {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const v = Number(input.value);
    const t = max === min ? 0 : (v - min) / (max - min);
    const ruler = input.closest(".mn-ruler");
    if (ruler) ruler.style.setProperty("--mn-value", t.toFixed(4));

    const param = paramOf(input);
    if (!param) return;
    const num = param.querySelector(".mn-readout__num");
    if (num) num.textContent = format(input, v);

    const cap = param.querySelector(".mn-param__caption[data-captions]");
    if (cap) {
      const words = cap.dataset.captions.split(",");
      cap.textContent = words[Math.min(words.length - 1, Math.floor(t * words.length))].trim();
    }
    const dflt = input.dataset.default;
    param.classList.toggle("is-edited", dflt !== undefined && Number(dflt) !== v);
  }

  function setValue(input, v) {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const step = input.step === "any" ? 0 : Number(input.step || 1);
    let next = clamp(v, min, max);
    if (step) next = Math.round((next - min) / step) * step + min;
    input.value = String(next);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function resetToDefault(input) {
    const d = input.dataset.default;
    if (d !== undefined) setValue(input, Number(d));
  }

  function bindParam(input) {
    if (input.__mn) return;
    input.__mn = true;
    if (input.dataset.default === undefined) input.dataset.default = input.getAttribute("value") ?? input.value;
    input.addEventListener("input", () => sync(input));
    input.addEventListener("dblclick", () => resetToDefault(input));
    sync(input);

    const param = paramOf(input);
    const readout = param && param.querySelector(".mn-readout[data-drag]");
    if (!readout) return;

    readout.addEventListener("dblclick", () => resetToDefault(input));
    readout.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      readout.setPointerCapture(e.pointerId);
      const horizontal = readout.dataset.drag === "x";
      const range = Number(input.max || 100) - Number(input.min || 0);
      const start = Number(input.value);
      const origin = horizontal ? e.clientX : e.clientY;
      const move = (ev) => {
        const delta = horizontal ? ev.clientX - origin : origin - ev.clientY;
        const fine = ev.shiftKey ? 0.1 : 1;
        setValue(input, start + (delta / 200) * range * fine);
      };
      const up = () => {
        readout.removeEventListener("pointermove", move);
        readout.removeEventListener("pointerup", up);
        readout.removeEventListener("pointercancel", up);
      };
      readout.addEventListener("pointermove", move);
      readout.addEventListener("pointerup", up);
      readout.addEventListener("pointercancel", up);
    });
  }

  /* Shift = fine on the ruler too: shrink the step while Shift is held. */
  function bindFineKeys(root) {
    root.addEventListener("keydown", (e) => {
      const t = e.target;
      if (!t.classList || !t.classList.contains("mn-ruler__input") || !e.shiftKey) return;
      const dir = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      const step = Number(t.step || 1);
      const fine = (Number(t.max || 100) - Number(t.min || 0)) / 1000;
      t.step = "any";
      setValue(t, Number(t.value) + dir * Math.max(fine, step / 10));
      t.step = String(step);
    });
  }

  function bindStepper(el) {
    if (el.__mn) return;
    el.__mn = true;
    const items = (el.dataset.items || "").split("|").filter(Boolean);
    const name = el.querySelector(".mn-stepper__name");
    const meta = el.querySelector(".mn-stepper__meta");
    if (!items.length || !name) return;
    let i = Math.max(0, items.indexOf(name.textContent.trim()));
    const render = () => {
      name.textContent = items[i];
      name.removeAttribute("data-dirty");
      if (meta) {
        const pad = String(items.length).length;
        const prefix = meta.dataset.prefix ? meta.dataset.prefix + " " : "";
        meta.textContent = `${prefix}${String(i + 1).padStart(Math.max(2, pad), "0")} / ${String(items.length).padStart(2, "0")}`;
      }
      el.dispatchEvent(new CustomEvent("mn:preset", { bubbles: true, detail: { index: i, name: items[i] } }));
    };
    const btns = el.querySelectorAll(".mn-btn");
    btns[0]?.addEventListener("click", () => { i = (i - 1 + items.length) % items.length; render(); });
    btns[btns.length - 1]?.addEventListener("click", () => { i = (i + 1) % items.length; render(); });
    render();
  }

  /* Theme / signal / paper / dialect switches */
  function bindAttr(input) {
    if (input.__mn) return;
    input.__mn = true;
    const attr = input.dataset.mnAttr;
    const target = input.dataset.mnTarget ? document.querySelector(input.dataset.mnTarget) : document.documentElement;
    const apply = () => {
      if (input.type === "radio" && !input.checked) return;
      const value = input.type === "checkbox" ? (input.checked ? input.value : input.dataset.off || "") : input.value;
      if (value) target.setAttribute(`data-${attr}`, value);
      else target.removeAttribute(`data-${attr}`);
    };
    input.addEventListener("change", apply);
    const current = target.getAttribute(`data-${attr}`);
    if (input.type === "radio" && current !== null) input.checked = input.value === current;
    if (input.checked) apply();
  }

  /* Tabs: roving tabindex, arrows move focus + selection (automatic activation) */
  function bindTabs(el) {
    if (el.__mn) return;
    el.__mn = true;
    const tabs = [...el.querySelectorAll('.mn-tabs__tab[role="tab"]')];
    if (!tabs.length) return;
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = t.getAttribute("aria-controls") && document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      el.dispatchEvent(new CustomEvent("mn:tab", { bubbles: true, detail: { id: tab.id, index: tabs.indexOf(tab) } }));
    };
    tabs.forEach((t) => t.addEventListener("click", () => !t.disabled && select(t)));
    el.querySelector(".mn-tabs__list")?.addEventListener("keydown", (e) => {
      const live = tabs.filter((t) => !t.disabled && t.getAttribute("aria-disabled") !== "true");
      const i = live.indexOf(document.activeElement);
      if (i < 0) return;
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: live.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select(live[(next + live.length) % live.length], true);
    });
    select(tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0]);
  }

  /* Shell: sidebar drawer on narrow screens */
  function bindNavToggle(btn) {
    if (btn.__mn) return;
    btn.__mn = true;
    const shell = btn.closest(".mn-shell") || document.querySelector(".mn-shell");
    if (!shell) return;
    const set = (open) => {
      shell.dataset.nav = open ? "open" : "closed";
      btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", () => set(shell.dataset.nav !== "open"));
    shell.addEventListener("click", (e) => {
      if (shell.dataset.nav === "open" && !e.target.closest(".mn-side") && !e.target.closest("[data-mn-nav-toggle]")) set(false);
    });
    document.addEventListener("keydown", (e) => e.key === "Escape" && shell.dataset.nav === "open" && set(false));
    set(false);
  }

  /* Sparkline: polyline (or bars) in ink, one focus point in signal */
  const SVGNS = "http://www.w3.org/2000/svg";
  function drawSpark(svg) {
    const v = (svg.dataset.values || "").split(",").map(Number).filter((n) => !Number.isNaN(n));
    if (v.length < 2) return;
    const W = 100, H = 24, pad = 2;
    const lo = svg.dataset.min !== undefined ? Number(svg.dataset.min) : Math.min(...v);
    const hi = svg.dataset.max !== undefined ? Number(svg.dataset.max) : Math.max(...v);
    const y = (n) => H - pad - ((n - lo) / (hi - lo || 1)) * (H - pad * 2);
    const focus = svg.dataset.focus || "last";
    const fi = focus === "none" ? -1 : focus === "max" ? v.indexOf(Math.max(...v)) : focus === "min" ? v.indexOf(Math.min(...v)) : v.length - 1;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.textContent = "";
    const add = (tag, attrs) => {
      const n = document.createElementNS(SVGNS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      svg.appendChild(n);
      return n;
    };
    if (svg.dataset.type === "bars") {
      const bw = W / v.length;
      v.forEach((n, i) => add("rect", { x: i * bw + bw * 0.15, y: y(n), width: bw * 0.7, height: H - pad - y(n) + 0.01, class: i === fi ? "mn-f-signal" : "mn-f-ink" }));
      return;
    }
    const x = (i) => (i / (v.length - 1)) * W;
    add("polyline", { points: v.map((n, i) => `${x(i).toFixed(2)},${y(n).toFixed(2)}`).join(" "), class: "mn-s-ink", "stroke-width": 1.25, "vector-effect": "non-scaling-stroke", "stroke-linejoin": "round" });
    if (fi >= 0) {
      // a circle would stretch with preserveAspectRatio="none"; a zero-length round-capped line stays round
      add("line", { x1: x(fi), y1: y(v[fi]), x2: x(fi), y2: y(v[fi]), class: "mn-s-signal", "stroke-width": 5, "stroke-linecap": "round", "vector-effect": "non-scaling-stroke" });
    }
  }

  /* Monitors: live data is redrawn frame by frame, the way an instrument refreshes — never tweened.
     draw(t, dt, el): t = seconds since start, dt = seconds since the last drawn frame (0 on the first).
     Off-screen or in a hidden tab the loop sleeps; with prefers-reduced-motion it draws one frame and stops.
     Returns { stop() }. */
  function monitor(el, draw, { fps = 30 } = {}) {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const t0 = performance.now();
    let raf = 0, last = 0, seen = true, stopped = false;
    const frame = (now) => {
      raf = 0;
      if (now - last >= 1000 / fps - 2) {
        draw((now - t0) / 1000, last ? Math.min((now - last) / 1000, 0.25) : 0, el);
        last = now;
      }
      wake();
    };
    const wake = () => {
      if (stopped || raf || !seen || document.hidden || reduce.matches) return;
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (!seen) last = 0; wake(); });
    io.observe(el);
    document.addEventListener("visibilitychange", wake);
    reduce.addEventListener?.("change", wake);
    draw(0, 0, el);
    wake();
    return {
      stop() {
        stopped = true;
        cancelAnimationFrame(raf);
        io.disconnect();
        document.removeEventListener("visibilitychange", wake);
        reduce.removeEventListener?.("change", wake);
      },
    };
  }

  /* Dropdown menu */
  let openMenu = null;
  function closeMenu(focusButton) {
    if (!openMenu) return;
    const { btn, menu } = openMenu;
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    if (focusButton) btn.focus();
    openMenu = null;
  }
  function bindMenu(btn) {
    if (btn.__mn) return;
    btn.__mn = true;
    const menu = document.getElementById(btn.getAttribute("aria-controls")) || btn.parentElement.querySelector(".mn-menu");
    if (!menu) return;
    menu.hidden = true;
    btn.setAttribute("aria-haspopup", "menu");
    btn.setAttribute("aria-expanded", "false");
    const items = () => [...menu.querySelectorAll(".mn-menu__item:not(:disabled)")];
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (openMenu && openMenu.menu === menu) return closeMenu();
      closeMenu();
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      openMenu = { btn, menu };
      (items().find((i) => i.getAttribute("aria-checked") === "true") || items()[0])?.focus();
    });
    menu.addEventListener("keydown", (e) => {
      const list = items();
      const i = list.indexOf(document.activeElement);
      const next = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: list.length - 1 }[e.key];
      if (next !== undefined) { e.preventDefault(); list[(next + list.length) % list.length]?.focus(); }
      if (e.key === "Escape" || e.key === "Tab") closeMenu(e.key === "Escape");
    });
    menu.addEventListener("click", (e) => {
      const item = e.target.closest(".mn-menu__item");
      if (!item || item.disabled) return;
      const role = item.getAttribute("role");
      if (role === "menuitemradio") {
        menu.querySelectorAll('[role="menuitemradio"]').forEach((r) => r.setAttribute("aria-checked", String(r === item)));
      } else if (role === "menuitemcheckbox") {
        item.setAttribute("aria-checked", String(item.getAttribute("aria-checked") !== "true"));
        return; // checkboxes keep the menu open
      }
      btn.dispatchEvent(new CustomEvent("mn:select", { bubbles: true, detail: { value: item.dataset.value ?? item.textContent.trim(), item } }));
      closeMenu(true);
    });
  }
  document.addEventListener("click", (e) => { if (openMenu && !openMenu.menu.contains(e.target)) closeMenu(); });

  /* Managed table: select-all + bulk bar */
  function bindTableSelect(table) {
    if (table.__mnSel) return;
    table.__mnSel = true;
    const all = table.querySelector("thead .mn-table__select input");
    const rows = () => [...table.querySelectorAll("tbody .mn-table__select input")];
    const bar = table.id && document.querySelector(`.mn-bulkbar[data-mn-bulk-for="${table.id}"]`);
    const sync = () => {
      const r = rows(), n = r.filter((x) => x.checked).length;
      if (all) { all.checked = n > 0 && n === r.length; all.indeterminate = n > 0 && n < r.length; }
      if (bar) {
        bar.hidden = n === 0;
        const c = bar.querySelector(".mn-bulkbar__count");
        if (c) c.textContent = `${n} selected`;
      }
      table.dispatchEvent(new CustomEvent("mn:selection", { bubbles: true, detail: { count: n } }));
    };
    all?.addEventListener("change", () => { rows().forEach((x) => (x.checked = all.checked)); sync(); });
    table.addEventListener("change", (e) => { if (e.target.closest("tbody .mn-table__select")) sync(); });
    bar?.querySelector("[data-mn-bulk-clear]")?.addEventListener("click", () => { rows().forEach((x) => (x.checked = false)); sync(); });
    sync();
  }

  /* Sort headers */
  function bindSort(table) {
    if (table.__mnSort) return;
    table.__mnSort = true;
    table.addEventListener("click", (e) => {
      const btn = e.target.closest(".mn-sort");
      if (!btn) return;
      const th = btn.closest("th");
      const dir = th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
      table.querySelectorAll("th[aria-sort]").forEach((h) => h.setAttribute("aria-sort", "none"));
      th.setAttribute("aria-sort", dir);
      if (table.dataset.mnSort === "local") {
        const col = [...th.parentElement.children].indexOf(th);
        const body = table.tBodies[0];
        const groups = [...body.rows].filter((r) => !r.classList.contains("mn-table__detail"))
          .map((r) => [r, r.nextElementSibling?.classList.contains("mn-table__detail") ? r.nextElementSibling : null]);
        const key = (r) => {
          const c = r.cells[col];
          const raw = (c?.dataset.sort ?? c?.textContent ?? "").trim();
          const n = Number(raw.replace(/[^0-9.\-]/g, ""));
          return raw !== "" && /^[\s\d.,%+\-−]+[A-Za-z%]*$/.test(raw) && !Number.isNaN(n) ? n : raw.toLowerCase();
        };
        groups.sort((a, b) => {
          const x = key(a[0]), y = key(b[0]);
          const c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
          return dir === "ascending" ? c : -c;
        });
        groups.forEach(([r, d]) => { body.appendChild(r); if (d) body.appendChild(d); });
      }
      table.dispatchEvent(new CustomEvent("mn:sort", { bubbles: true, detail: { key: th.dataset.key ?? btn.textContent.trim(), dir } }));
    });
  }

  /* Expandable rows */
  function bindExpand(btn) {
    if (btn.__mn) return;
    btn.__mn = true;
    const target = document.getElementById(btn.getAttribute("aria-controls"));
    if (!target) return;
    const set = (open) => { btn.setAttribute("aria-expanded", String(open)); target.hidden = !open; };
    set(btn.getAttribute("aria-expanded") === "true");
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
  }

  /* Composer: Enter sends, Shift+Enter breaks; grow when field-sizing isn't supported */
  function bindComposer(field) {
    if (field.__mn) return;
    field.__mn = true;
    const composer = field.closest(".mn-composer");
    field.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        composer?.dispatchEvent(new CustomEvent("mn:send", { bubbles: true, detail: { text: field.value } }));
      }
    });
    if (!CSS.supports("field-sizing", "content")) {
      const grow = () => { field.style.height = "auto"; field.style.height = Math.min(field.scrollHeight, innerHeight * 0.4) + "px"; };
      field.addEventListener("input", grow);
      grow();
    }
  }

  /* Diff copy: the signs are drawn in their own column, so a plain copy loses them (or splits them
     onto their own lines). Serialize rows as a unified diff instead. */
  function diffText(diff, range) {
    return [...diff.querySelectorAll(".mn-diff__hunk, .mn-diff__line")]
      .filter((row) => !range || range.intersectsNode(row))
      .map((row) => {
        if (row.classList.contains("mn-diff__hunk")) return row.textContent;
        const sign = row.classList.contains("mn-diff__line--add") ? "+" : row.classList.contains("mn-diff__line--del") ? "-" : " ";
        return sign + (row.querySelector(".mn-diff__code")?.textContent ?? "");
      })
      .join("\n");
  }
  document.addEventListener("copy", (e) => {
    const sel = getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const common = range.commonAncestorContainer;
    const el = common.nodeType === 1 ? common : common.parentElement;
    if (!el || el.closest(".mn-diff__code, .mn-diff__hunk")) return; // a fragment of one line copies as-is
    const inside = el.closest(".mn-diff");
    if (!inside && !el.querySelector(".mn-diff")) return;
    // Rebuild the selection with each diff replaced by its unified text, then let layout give the rest its line breaks.
    const holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-99999px;top:0;width:800px";
    const frag = range.cloneContents();
    if (inside) {
      const wrap = document.createElement("div");
      wrap.className = "mn-diff";
      wrap.appendChild(frag);
      holder.appendChild(wrap);
    } else holder.appendChild(frag);
    holder.querySelectorAll("button").forEach((b) => b.remove());
    holder.querySelectorAll(".mn-diff").forEach((d) => {
      const pre = document.createElement("pre");
      pre.textContent = diffText(d);
      d.replaceWith(pre);
    });
    document.body.appendChild(holder);
    const text = holder.innerText.replace(/\n{3,}/g, "\n\n").trim();
    holder.remove();
    e.clipboardData.setData("text/plain", text);
    e.preventDefault();
  });
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-mn-copy]");
    if (!btn) return;
    const box = btn.closest(".mn-result, .mn-code");
    const diff = box?.querySelector(".mn-diff");
    const text = diff ? diffText(diff) : box?.querySelector("pre")?.textContent;
    if (text == null) return;
    navigator.clipboard?.writeText(text);
    const label = (btn.dataset.mnLabel ??= btn.textContent);
    btn.textContent = "Copied";
    setTimeout(() => (btn.textContent = label), 1200);
  });

  function toast(kind, text, { signal = false, ms = 2600 } = {}) {
    let host = document.querySelector(".mn-toaster");
    if (!host) {
      host = document.createElement("div");
      host.className = "mn-toaster";
      host.setAttribute("role", "status");
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = "mn-note mn-toast" + (signal ? " mn-note--signal" : "");
    el.innerHTML = '<span class="mn-note__kind"></span><span class="mn-note__body"></span>';
    el.firstChild.textContent = kind;
    el.lastChild.textContent = text;
    host.appendChild(el);
    setTimeout(() => el.remove(), ms);
    return el;
  }

  function init(root = document) {
    root.querySelectorAll(".mn-ruler__input").forEach(bindParam);
    root.querySelectorAll(".mn-stepper[data-items]").forEach(bindStepper);
    root.querySelectorAll("[data-mn-attr]").forEach(bindAttr);
    root.querySelectorAll(".mn-tabs").forEach(bindTabs);
    root.querySelectorAll("[data-mn-nav-toggle]").forEach(bindNavToggle);
    root.querySelectorAll("svg.mn-spark[data-values]").forEach(drawSpark);
    root.querySelectorAll("[data-mn-menu]").forEach(bindMenu);
    root.querySelectorAll("table.mn-table[data-mn-select]").forEach(bindTableSelect);
    root.querySelectorAll("table.mn-table").forEach((t) => t.querySelector(".mn-sort") && bindSort(t));
    root.querySelectorAll(".mn-expand[aria-controls]").forEach(bindExpand);
    root.querySelectorAll(".mn-composer__field").forEach(bindComposer);
  }

  window.MN = { init, toast, setValue, sync, drawSpark, diffText, monitor };
  bindFineKeys(document);
  if (!document.currentScript || !document.currentScript.hasAttribute("data-manual")) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init());
    else init();
  }
})();
