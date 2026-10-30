/*!
 * Octarine Micro-Core — shared utilities, events, DOM helpers and Shadow DOM host.
 * https://github.com/deepayan/octarine
 */
(function () {
  'use strict';
  if (window.Octarine && window.Octarine.core) return;

  const script = document.currentScript;
  const BASE = (script && script.src) ? script.src.replace(/[^/?#]*([?#].*)?$/, '') : '';

  const O = window.Octarine = window.Octarine || {};
  O.version = O.version || '0.2.0';
  O.base = O.base || BASE;
  O.options = O.options || {};
  O.core = true;

  /* ------------------------------------------------------------------ */
  /* Events                                                              */
  /* ------------------------------------------------------------------ */

  const bus = new EventTarget();

  /** Subscribe to an Octarine event; returns an unsubscribe function. */
  O.on = function (type, fn) {
    const handler = (e) => fn(e.detail);
    bus.addEventListener(type, handler);
    return () => bus.removeEventListener(type, handler);
  };

  /** Emit an event (also re-dispatched on `document` as `octarine:<type>`). */
  O.emit = function (type, detail) {
    bus.dispatchEvent(new CustomEvent(type, { detail }));
    document.dispatchEvent(new CustomEvent('octarine:' + type, { detail }));
  };

  /* ------------------------------------------------------------------ */
  /* Small helpers                                                       */
  /* ------------------------------------------------------------------ */

  /** Create an HTML element: h('div', {class, style:{}, onclick, ...}, ...children) */
  O.h = function (tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k in el && typeof v !== 'string') el[k] = v;
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const c of children.flat()) {
      if (c != null && c !== false) {
        if (c instanceof Node) {
          el.append(c);
        } else if (typeof c === 'string' && c.trim().startsWith('<')) {
          const tmpl = document.createElement('template');
          tmpl.innerHTML = c;
          el.append(...tmpl.content.childNodes);
        } else {
          el.append(String(c));
        }
      }
    }
    return el;
  };

  const SVG_NS = O.SVG_NS = 'http://www.w3.org/2000/svg';

  /** Create an SVG element with attributes. */
  O.s = function (tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    return el;
  };

  O.clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  O.debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  O.uid = () => Math.random().toString(36).slice(2, 10);
  O.timestamp = () => {
    const d = new Date(), p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  };

  /** localStorage wrapper (JSON, namespaced, never throws). */
  O.storage = {
    prefix: 'octarine.',
    get(key, fallback) {
      try {
        const v = localStorage.getItem(this.prefix + key);
        return v == null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(this.prefix + key, JSON.stringify(value)); return true; }
      catch (e) { console.warn('Octarine: could not save', key, e); return false; }
    },
    remove(key) { try { localStorage.removeItem(this.prefix + key); } catch (e) { /* ignore */ } }
  };

  /** Save data (string or Blob) as a file. */
  O.download = function (data, filename, type) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: type || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = O.h('a', { href: url, download: filename, style: { display: 'none' } });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  /** Ask the user for a file; resolves to a File or null. */
  O.pickFile = function (accept) {
    return new Promise((resolve) => {
      const input = O.h('input', { type: 'file', accept: accept || '', style: { display: 'none' } });
      input.addEventListener('change', () => { resolve(input.files[0] || null); input.remove(); });
      document.body.appendChild(input);
      input.click();
    });
  };

  /** Load a classic script; resolves when loaded. */
  O.loadScript = function (src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Octarine: failed to load ' + src));
      document.head.appendChild(s);
    });
  };

  /* ------------------------------------------------------------------ */
  /* Icons (inline SVG, 24x24, stroke = currentColor)                    */
  /* ------------------------------------------------------------------ */

  const ICONS = {
    logo: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    highlighter: '<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',
    eraser: '<path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l10-10a1 1 0 0 1 1.4 0l5.6 5.6a1 1 0 0 1 0 1.4L13 19"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
    line: '<path d="M5 19 19 5"/>',
    arrow: '<path d="M5 19 19 5"/><path d="M9 5h10v10"/>',
    rect: '<rect x="4" y="5" width="16" height="14" rx="1"/>',
    ellipse: '<ellipse cx="12" cy="12" rx="9" ry="7"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    camera: '<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/>',
    micOff: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/><path d="M3 3l18 18"/>',
    board: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    annotate: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="m8 14 3-5 2 3 3-4"/><path d="M12 17v4"/>',
    download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    upload: '<path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/>',
    maximize: '<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"/>',
    minimize: '<path d="M3 8h5V3M21 8h-5V3M16 21v-5h5M8 21v-5H3"/>',
    shape: '<circle cx="8" cy="8" r="5"/><rect x="11" y="11" width="10" height="10" rx="2"/>',
    grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
    theme: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor"/>',
    flip: '<path d="m8 7-5 5 5 5"/><path d="m16 7 5 5-5 5"/><path d="M12 3v18"/>'
  };
  O.ICONS = ICONS;

  O.iconHTML = function (name, size) {
    size = size || 20;
    return `<svg class="oi" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  };

  O.icon = function (name, size) {
    const html = O.iconHTML(name, size);
    const tmpl = document.createElement('template');
    tmpl.innerHTML = html;
    return tmpl.content.firstElementChild;
  };

  /* ------------------------------------------------------------------ */
  /* Shadow-DOM hosts: isolate our UI from the page's CSS (and v.v.)     */
  /* ------------------------------------------------------------------ */

  O.baseCSS = `
    :host { all: initial; }
    *, *::before, *::after { box-sizing: border-box; }
    .o-ui { font: 13px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #eee; }
    button { font: inherit; color: inherit; background: none; border: 0; padding: 0; margin: 0; cursor: pointer; }
    .o-btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px;
             min-width: 32px; height: 32px; padding: 0 8px; border-radius: 8px;
             background: rgba(255,255,255,.08); color: #eee; white-space: nowrap; }
    .o-btn:hover { background: rgba(255,255,255,.18); }
    .o-btn.active { background: #7c5cff; color: #fff; }
    .o-btn:disabled { opacity: .35; cursor: default; background: rgba(255,255,255,.08); }
    .o-btn.icon { width: 32px; padding: 0; }
    .o-btn:focus-visible { outline: 2px solid #b39dff; outline-offset: 1px; }
    svg.oi { display: block; flex: none; }
  `;

  O.createHost = function (name, css, parent) {
    const host = document.createElement('div');
    host.id = 'octarine-' + name;
    host.className = 'octarine-host';
    const root = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = O.baseCSS + (css || '');
    root.appendChild(style);
    (parent || document.body).appendChild(host);
    return { host, root };
  };

  /** Pointer drag helper: calls onStart(e) -> ctx (or false to cancel), onMove(dx, dy, e, ctx), onEnd(moved, e, ctx). */
  O.dragHelper = function (el, handlers) {
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      if (handlers.filter && !handlers.filter(e)) return;
      const ctx = handlers.onStart ? handlers.onStart(e) : {};
      if (ctx === false) return;
      const x0 = e.clientX, y0 = e.clientY, id = e.pointerId;
      let moved = false;
      try { el.setPointerCapture(id); } catch (err) { /* ignore */ }
      e.preventDefault();
      const move = (ev) => {
        if (ev.pointerId !== id) return;
        const dx = ev.clientX - x0, dy = ev.clientY - y0;
        if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        if (handlers.onMove) handlers.onMove(dx, dy, ev, ctx);
      };
      const up = (ev) => {
        if (ev.pointerId !== id) return;
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        if (handlers.onEnd) handlers.onEnd(moved, ev, ctx);
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
  };

  /* ------------------------------------------------------------------ */
  /* Toast notifications                                                 */
  /* ------------------------------------------------------------------ */

  let toastRoot = null;
  O.toast = function (msg, ms) {
    if (!document.body) { console.log('Octarine:', msg); return; }
    if (!toastRoot) {
      toastRoot = O.createHost('toast', `
        :host { position: fixed; left: 50%; top: 16px; transform: translateX(-50%); z-index: 2147483600;
                display: flex; flex-direction: column; gap: 6px; align-items: center; pointer-events: none; }
        .t { background: rgba(28,28,32,.95); color: #fff; padding: 8px 14px; border-radius: 8px;
             box-shadow: 0 4px 20px rgba(0,0,0,.35); transition: opacity .3s; max-width: 80vw; }
      `).root;
    }
    const t = O.h('div', { class: 't o-ui' }, msg);
    toastRoot.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, ms || 3000);
  };

  /* ------------------------------------------------------------------ */
  /* Keyboard: modules register handlers; first one returning true wins  */
  /* ------------------------------------------------------------------ */

  const keyHandlers = [];
  O.addKeyHandler = function (fn, priority) {
    keyHandlers.push({ fn, priority: priority || 0 });
    keyHandlers.sort((a, b) => b.priority - a.priority);
  };

  const NON_TEXT_INPUTS = /^(checkbox|radio|button|submit|reset|color|file|image)$/;
  function isEditable(t) {
    if (!t || !t.tagName) return false;
    if (t.isContentEditable) return true;
    if (t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return true;
    return t.tagName === 'INPUT' && !NON_TEXT_INPUTS.test(t.type);
  }

  window.addEventListener('keydown', (e) => {
    if (O.options.hotkeys === false) return;
    const t = e.composedPath ? e.composedPath()[0] : e.target;
    if (isEditable(t)) return;
    for (const { fn } of keyHandlers) {
      if (fn(e)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
    }
  }, true);

  /* ------------------------------------------------------------------ */
  /* Module registration helper                                         */
  /* ------------------------------------------------------------------ */

  /** Called by each module file: Octarine.define('camera', O => api). */
  O.define = function (name, factory) {
    if (O[name]) return;
    O[name] = factory(O);
  };
})();

/*
 * Octarine camera overlay: a draggable, resizable live camera view.
 *
 *   drag            move
 *   wheel / handle  resize
 *   shift+click     cycle shape (circle, rounded square, wide)
 *   double-click    toggle large (near full-screen) view
 *   Alt+C           toggle camera on/off
 *   hover top-left  unobtrusive corner trigger to restore camera when off
 */
Octarine.define('camera', function (O) {
  'use strict';

  const SHAPES = ['circle', 'rounded', 'rect'];
  const MIN_SIZE = 80;

  const st = Object.assign(
    { size: 220, shape: 'circle', mirror: true, x: null, y: null, deviceId: '' },
    O.storage.get('camera', {})
  );
  const save = O.debounce(() => O.storage.set('camera', st), 300);

  let host = null, video = null, msg = null, fullBtn = null, devBtn = null;
  let stream = null, enabled = false, full = false;
  let standaloneMode = true;

  /* ---------------- Standalone Hover Trigger ---------------- */
  let triggerHost = null, triggerBtn = null;
  let triggerVisible = false, hideTimer = null;

  const TRIGGER_CSS = `
    :host {
      position: fixed; top: 0; left: 0; width: 0; height: 0;
      z-index: 2147483647; pointer-events: none;
    }
    .trigger-btn {
      position: fixed; top: 10px; left: 10px; width: 38px; height: 38px; border-radius: 50%;
      background: rgba(26, 26, 32, 0.9); color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.22);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; opacity: 0; transform: scale(0.85);
      transition: opacity 0.25s ease, transform 0.25s ease, background 0.2s ease, border-color 0.2s ease;
      pointer-events: none;
    }
    .trigger-btn.visible {
      opacity: 1; transform: scale(1); pointer-events: auto;
    }
    .trigger-btn:hover {
      background: #7c5cff; border-color: #a288ff; transform: scale(1.08);
    }
    .trigger-btn svg { display: block; pointer-events: none; }
  `;

  function buildTrigger() {
    if (triggerHost || !document.body) return;
    const created = O.createHost('camera-trigger', TRIGGER_CSS);
    triggerHost = created.host;
    const root = created.root;

    triggerBtn = O.h('button', {
      class: 'trigger-btn',
      title: 'Turn camera on (Alt+C)',
      onpointerdown: (e) => e.stopPropagation(),
      onclick: (e) => {
        e.stopPropagation();
        toggle();
      }
    }, O.icon('camera', 20));

    root.appendChild(triggerBtn);

    triggerBtn.addEventListener('pointerenter', () => {
      clearTimeout(hideTimer);
      triggerVisible = true;
      triggerBtn.classList.add('visible');
    });

    triggerBtn.addEventListener('pointerleave', () => {
      hideTimer = setTimeout(() => {
        triggerVisible = false;
        triggerBtn.classList.remove('visible');
      }, 350);
    });

    window.addEventListener('pointermove', (e) => {
      if (!standaloneMode) return;
      if (enabled) {
        if (triggerVisible) {
          triggerVisible = false;
          triggerBtn.classList.remove('visible');
        }
        return;
      }
      // Hover zone in extreme top-left (<= 50px)
      const inZone = e.clientX <= 50 && e.clientY <= 50;
      if (inZone) {
        clearTimeout(hideTimer);
        if (!triggerVisible) {
          triggerVisible = true;
          triggerBtn.classList.add('visible');
        }
      } else if (triggerVisible) {
        if (e.clientX > 80 || e.clientY > 80) {
          clearTimeout(hideTimer);
          hideTimer = setTimeout(() => {
            triggerVisible = false;
            triggerBtn.classList.remove('visible');
          }, 300);
        }
      }
    }, { passive: true });
  }

  const CSS = `
    :host { position: fixed; z-index: 2147483100; display: none;
            transition: left .25s, top .25s, width .25s, height .25s; }
    :host(.dragging) { transition: none; }
    .box { position: absolute; inset: 0; overflow: hidden; background: #000;
           border: 3px solid #fff; box-shadow: 0 6px 32px rgba(0,0,0,.6);
           cursor: move; touch-action: none; transition: border-radius .25s; }
    :host(.circle) .box { border-radius: 50%; }
    :host(.rounded) .box { border-radius: 18%; }
    :host(.rect) .box, :host(.full) .box { border-radius: 14px; }
    video { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
    :host(.mirror) video { transform: scaleX(-1); }
    .msg { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
           color: #aaa; text-align: center; padding: 12px; pointer-events: none; }
    .controls { position: absolute; left: 50%; bottom: 8%; transform: translateX(-50%);
                display: flex; gap: 2px; padding: 3px; border-radius: 10px;
                background: rgba(0,0,0,.65); opacity: 0; transition: opacity .2s;
                backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.15); }
    .controls .o-btn { background: transparent; color: #fff; height: 28px; min-width: 28px; width: 28px; padding: 0; }
    .controls .o-btn:hover { background: rgba(255,255,255,.2); }
    .resize { position: absolute; right: 0; bottom: 0; width: 22px; height: 22px; border-radius: 50%;
              background: #fff; border: 3px solid #7c5cff; cursor: nwse-resize; opacity: 0;
              touch-action: none; transition: opacity .2s; }
    :host(.circle) .resize { right: 12%; bottom: 12%; }
    :host(:hover) .controls, :host(:hover) .resize { opacity: 1; }
    :host(.full) .resize { display: none; }
  `;

  /* ---------------- geometry ---------------- */

  function dims() {
    const W = window.innerWidth, H = window.innerHeight;
    if (full) return { x: W * 0.02, y: H * 0.02, w: W * 0.96, h: H * 0.96 };
    const w = st.size;
    const h = st.shape === 'rect' ? Math.round(st.size * 9 / 16) : st.size;
    let x = st.x == null ? W - w - 30 : st.x;
    let y = st.y == null ? H - h - 30 : st.y;
    // keep at least part of the view on screen
    x = O.clamp(x, 40 - w, W - 40);
    y = O.clamp(y, 40 - h, H - 40);
    return { x, y, w, h };
  }

  function maxSize() {
    return Math.max(MIN_SIZE, Math.min(window.innerWidth, window.innerHeight * (st.shape === 'rect' ? 16 / 9 : 1)) * 0.95);
  }

  function layout() {
    if (!host) return;
    const d = dims();
    Object.assign(host.style, { left: d.x + 'px', top: d.y + 'px', width: d.w + 'px', height: d.h + 'px' });
    for (const s of SHAPES) host.classList.toggle(s, !full && st.shape === s);
    host.classList.toggle('full', full);
    host.classList.toggle('mirror', st.mirror);
    if (fullBtn) {
      fullBtn.innerHTML = O.iconHTML(full ? 'minimize' : 'maximize', 16);
      fullBtn.title = full ? 'Restore small view (double-click)' : 'Large view (double-click)';
    }
  }

  /** Resize to `size`, keeping the centre of the view fixed. */
  function resizeTo(size) {
    const before = dims();
    st.size = O.clamp(size, MIN_SIZE, maxSize());
    const w = st.size, h = st.shape === 'rect' ? Math.round(st.size * 9 / 16) : st.size;
    st.x = before.x + (before.w - w) / 2;
    st.y = before.y + (before.h - h) / 2;
    layout();
    save();
    emit();
  }

  /* ---------------- DOM ---------------- */

  function button(icon, title, fn) {
    return O.h('button', {
      class: 'o-btn icon', title,
      onpointerdown: (e) => e.stopPropagation(),
      onclick: (e) => { e.stopPropagation(); fn(); }
    }, O.icon(icon, 16));
  }

  async function checkMultipleDevices() {
    if (!devBtn) return;
    try {
      const list = await devices();
      devBtn.style.display = list.length > 1 ? '' : 'none';
      if (list.length > 1) {
        devBtn.title = `Switch camera device (${list.length} available)`;
      }
    } catch (e) {
      devBtn.style.display = 'none';
    }
  }

  async function cycleDevice() {
    const list = await devices();
    if (list.length <= 1) {
      O.toast('Only 1 camera detected');
      return;
    }
    const currentIdx = list.findIndex((d) => d.id === st.deviceId);
    const nextIdx = (currentIdx + 1) % list.length;
    const next = list[nextIdx];
    await setDevice(next.id);
    O.toast(`Camera: ${next.label || 'Camera ' + (nextIdx + 1)}`, 2000);
  }

  function build() {
    buildTrigger();

    const created = O.createHost('camera', CSS);
    host = created.host;
    const root = created.root;

    const box = O.h('div', { class: 'box' });
    video = O.h('video', { autoplay: true, muted: true, playsInline: true });
    video.setAttribute('muted', '');
    msg = O.h('div', { class: 'msg o-ui' }, 'Starting camera…');
    box.append(video, msg);

    fullBtn = button('maximize', '', toggleFull);
    devBtn = button('camera', 'Switch camera', cycleDevice);
    devBtn.style.display = 'none';

    const controls = O.h('div', { class: 'controls o-ui' },
      button('shape', 'Change shape (shift+click)', cycleShape),
      button('flip', 'Mirror feed', toggleMirror),
      devBtn,
      fullBtn,
      button('close', 'Turn camera off', disable));
    const resize = O.h('div', { class: 'resize', title: 'Drag to resize' });
    root.append(box, controls, resize);

    O.dragHelper(box, {
      onStart: () => {
        if (full) return false;
        host.classList.add('dragging');
        const d = dims();
        return { x: d.x, y: d.y };
      },
      onMove: (dx, dy, e, c) => { st.x = c.x + dx; st.y = c.y + dy; layout(); },
      onEnd: () => { host.classList.remove('dragging'); save(); }
    });

    O.dragHelper(resize, {
      onStart: () => {
        host.classList.add('dragging');
        const d = dims();
        return { size: st.size, ratio: d.h / d.w, x: d.x, y: d.y };
      },
      onMove: (dx, dy, e, c) => {
        st.size = O.clamp(c.size + Math.max(dx, dy / c.ratio), MIN_SIZE, maxSize());
        st.x = c.x; st.y = c.y;
        layout();
      },
      onEnd: () => { host.classList.remove('dragging'); save(); emit(); }
    });

    box.addEventListener('click', (e) => { if (e.shiftKey) cycleShape(); });
    box.addEventListener('dblclick', toggleFull);
    box.addEventListener('wheel', (e) => {
      if (full) return;
      e.preventDefault();
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      resizeTo(st.size * Math.exp(-dy * 0.0015));
    }, { passive: false });

    window.addEventListener('resize', layout);
  }

  /* ---------------- media ---------------- */

  async function openStream() {
    const constraints = (id) => ({
      audio: false,
      video: id ? { deviceId: { exact: id } } : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
    });
    try {
      return await navigator.mediaDevices.getUserMedia(constraints(st.deviceId));
    } catch (err) {
      if (st.deviceId && (err.name === 'OverconstrainedError' || err.name === 'NotFoundError')) {
        st.deviceId = '';
        save();
        return navigator.mediaDevices.getUserMedia(constraints(''));
      }
      throw err;
    }
  }

  function stopStream() {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null;
    if (video) video.srcObject = null;
  }

  async function enable() {
    if (enabled) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      O.toast('Camera access is not available in this browser / context.');
      return;
    }
    enabled = true;
    if (!host) build();
    if (triggerBtn) triggerBtn.classList.remove('visible');
    msg.textContent = 'Starting camera…';
    msg.style.display = '';
    host.style.display = 'block';
    layout();
    emit();
    try {
      stream = await openStream();
      if (!enabled) { stopStream(); return; }   // disabled while waiting for permission
      video.srcObject = stream;
      msg.style.display = 'none';
      stream.getVideoTracks()[0].addEventListener('ended', () => disable());
      checkMultipleDevices();
    } catch (err) {
      O.toast('Camera failed: ' + (err.message || err.name));
      disable();
      return;
    }
    emit();
  }

  function disable() {
    enabled = false;
    full = false;
    stopStream();
    if (host) host.style.display = 'none';
    emit();
  }

  function toggle() {
    if (enabled) disable();
    else enable();
  }

  /* ---------------- options ---------------- */

  function setShape(shape) {
    if (!SHAPES.includes(shape)) return;
    st.shape = shape;
    st.size = O.clamp(st.size, MIN_SIZE, maxSize());
    layout(); save(); emit();
  }
  function cycleShape() { setShape(SHAPES[(SHAPES.indexOf(st.shape) + 1) % SHAPES.length]); }
  function setMirror(on) { st.mirror = !!on; layout(); save(); emit(); }
  function toggleMirror() { setMirror(!st.mirror); }
  function toggleFull() { if (!enabled) return; full = !full; layout(); emit(); }

  async function devices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return [];
    const list = await navigator.mediaDevices.enumerateDevices();
    return list.filter((d) => d.kind === 'videoinput')
      .map((d, i) => ({ id: d.deviceId, label: d.label || `Camera ${i + 1}` }));
  }

  async function setDevice(id) {
    st.deviceId = id || '';
    save();
    if (enabled) {
      stopStream();
      try {
        stream = await openStream();
        video.srcObject = stream;
        checkMultipleDevices();
      } catch (err) {
        O.toast('Camera failed: ' + (err.message || err.name));
        disable();
      }
    }
    emit();
  }

  function setStandalone(val) {
    standaloneMode = !!val;
    if (!standaloneMode && triggerBtn) {
      triggerBtn.classList.remove('visible');
    }
  }

  function state() {
    return { enabled, full, shape: st.shape, mirror: st.mirror, size: st.size, deviceId: st.deviceId };
  }
  function emit() { O.emit('camera:change', state()); }

  // Keyboard shortcut integration: Alt+C toggles camera, Escape restores small view
  O.addKeyHandler((e) => {
    if (e.altKey && (e.key === 'c' || e.key === 'C')) {
      toggle();
      return true;
    }
    if (e.key === 'Escape' && full) {
      toggleFull();
      return true;
    }
    return false;
  }, 10);

  // Initialize trigger host if DOM is already ready
  if (document.readyState !== 'loading') {
    buildTrigger();
  } else {
    document.addEventListener('DOMContentLoaded', buildTrigger, { once: true });
  }

  const api = {
    SHAPES,
    enable, disable, toggle,
    isEnabled: () => enabled,
    setShape, cycleShape,
    setMirror, toggleMirror,
    toggleFull, setSize: resizeTo,
    devices, setDevice, cycleDevice,
    setStandalone,
    state
  };

  if (typeof window !== 'undefined') {
    window.OctarineCamera = api;
  }

  return api;
});

/* Auto-enable standalone camera overlay on injection/load */
(function () {
  'use strict';
  if (typeof window !== 'undefined' && window.OctarineCamera) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => window.OctarineCamera.enable(), { once: true });
    } else {
      window.OctarineCamera.enable();
    }
  }
})();
