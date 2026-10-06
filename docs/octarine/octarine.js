/*!
 * Octarine — a presentation layer for classrooms.
 * Camera overlay, voice lifter and whiteboard, running entirely in the browser.
 * https://github.com/deepayan/octarine
 *
 * This file is the core: it defines the global `Octarine` namespace, shared
 * helpers, and a loader that pulls in the feature modules (camera.js,
 * voice.js, draw.js, board.js, annotate.js, panel.js) from the same directory.
 * If the modules are already present (e.g. in octarine.bundle.js) nothing is
 * loaded.
 *
 * Typical use:
 *     <script src="octarine/octarine.js"></script>
 *     <script>Octarine.init({ board: true });</script>
 */
(function () {
  'use strict';
  if (window.Octarine && window.Octarine.version) return;

  const script = document.currentScript;
  const BASE = (script && script.src) ? script.src.replace(/[^/?#]*([?#].*)?$/, '') : '';

  const O = window.Octarine = { version: '0.2.0', base: BASE, options: {} };

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
      if (c != null && c !== false) el.append(c instanceof Node ? c : String(c));
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
    grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>'
  };
  O.ICONS = ICONS;

  O.icon = function (name, size) {
    size = size || 20;
    return `<svg class="oi" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
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
  /* Modules and loading                                                 */
  /* ------------------------------------------------------------------ */

  const MODULES = [
    ['freehand', 'vendor/perfect-freehand.js'],
    ['camera', 'camera.js'],
    ['voice', 'voice.js'],
    ['draw', 'draw.js'],
    ['board', 'board.js'],
    ['annotate', 'annotate.js'],
    ['panel', 'panel.js']
  ];

  /** Called by each module file: Octarine.define('camera', O => api). */
  O.define = function (name, factory) {
    if (O[name]) return;
    O[name] = factory(O);
  };

  const isLoaded = (name) => (name === 'freehand' ? !!window.PerfectFreehand : !!O[name]);

  O.load = async function () {
    for (const [name, file] of MODULES) {
      if (!isLoaded(name)) await O.loadScript(BASE + file);
    }
  };

  const domReady = () => new Promise((resolve) => {
    if (document.readyState !== 'loading') resolve();
    else document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
  });

  const DEFAULTS = {
    trigger: 'top-left',  // corner for the control-panel button, or false to hide it
    panelKey: '`',        // key that opens/closes the control panel
    hotkeys: true,
    board: false,         // true or {background: 'black'} to show the whiteboard on start
    camera: false,        // true to start the camera on load (asks for permission)
    autosave: true,       // keep whiteboard/annotations in localStorage
    hint: false,          // show a short "press ` for controls" message on start
    reveal: null,         // a Reveal deck to attach slide annotations to
    remark: null          // a remark slideshow to attach slide annotations to
  };

  let initPromise = null;

  /**
   * Load all modules and set up the control panel. Safe to call more than
   * once (later calls only apply adapter / start-up options).
   */
  O.init = function (opts) {
    opts = opts || {};
    if (!initPromise) {
      O.options = Object.assign({}, DEFAULTS, opts);
      initPromise = domReady().then(() => O.load()).then(() => {
        O.panel.init(O.options);
        O.emit('ready', O);
        return O;
      });
    } else {
      Object.assign(O.options, opts);
    }
    return initPromise.then(() => {
      if (opts.reveal) O.annotate.attachReveal(opts.reveal);
      if (opts.remark) O.annotate.attachRemark(opts.remark);
      if (opts.board) O.board.show(typeof opts.board === 'object' ? opts.board : undefined);
      if (opts.camera) O.camera.enable();
      if (opts.hint) O.toast(`Press ${O.options.panelKey} or use the button in the corner for controls`, 5000);
      return O;
    });
  };

  /** Run fn once Octarine is initialised. */
  O.ready = function (fn) {
    if (initPromise) initPromise.then(fn);
    else O.on('ready', fn);
  };

  /**
   * reveal.js plugin:  Reveal.initialize({ plugins: [ Octarine.RevealPlugin ],
   *                                        octarine: { ...options } })
   */
  O.RevealPlugin = function () {
    return {
      id: 'octarine',
      init: (deck) => O.init(Object.assign({}, deck.getConfig().octarine || {}, { reveal: deck }))
    };
  };
})();
