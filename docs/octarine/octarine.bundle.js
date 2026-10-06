/*!
 * perfect-freehand v1.2.2 (https://github.com/steveruizok/perfect-freehand)
 * MIT License, Copyright (c) 2021 Stephen Ruiz Ltd
 * Vendored by Octarine: CommonJS build wrapped to expose window.PerfectFreehand.
 */
(function () {
var exports = {};
var pe=Object.defineProperty;var ge=e=>pe(e,"__esModule",{value:!0});var de=(e,t)=>{ge(e);for(var s in t)pe(e,s,{get:t[s],enumerable:!0})};de(exports,{default:()=>ve,getStroke:()=>ne,getStrokeOutlinePoints:()=>te,getStrokePoints:()=>re});function $(e,t,s,x=h=>h){return e*x(.5-t*(.5-s))}function ce(e){return[-e[0],-e[1]]}function l(e,t){return[e[0]+t[0],e[1]+t[1]]}function a(e,t){return[e[0]-t[0],e[1]-t[1]]}function b(e,t){return[e[0]*t,e[1]*t]}function xe(e,t){return[e[0]/t,e[1]/t]}function R(e){return[e[1],-e[0]]}function B(e,t){return e[0]*t[0]+e[1]*t[1]}function me(e,t){return e[0]===t[0]&&e[1]===t[1]}function Se(e){return Math.hypot(e[0],e[1])}function Pe(e){return e[0]*e[0]+e[1]*e[1]}function A(e,t){return Pe(a(e,t))}function G(e){return xe(e,Se(e))}function ae(e,t){return Math.hypot(e[1]-t[1],e[0]-t[0])}function L(e,t,s){let x=Math.sin(s),h=Math.cos(s),y=e[0]-t[0],n=e[1]-t[1],f=y*h-n*x,d=y*x+n*h;return[f+t[0],d+t[1]]}function K(e,t,s){return l(e,b(a(t,e),s))}function ee(e,t,s){return l(e,b(t,s))}var{min:C,PI:ke}=Math,le=.275,V=ke+1e-4;function te(e,t={}){let{size:s=16,smoothing:x=.5,thinning:h=.5,simulatePressure:y=!0,easing:n=r=>r,start:f={},end:d={},last:D=!1}=t,{cap:S=!0,easing:j=r=>r*(2-r)}=f,{cap:q=!0,easing:c=r=>--r*r*r+1}=d;if(e.length===0||s<=0)return[];let p=e[e.length-1].runningLength,g=f.taper===!1?0:f.taper===!0?Math.max(s,p):f.taper,T=d.taper===!1?0:d.taper===!0?Math.max(s,p):d.taper,oe=Math.pow(s*x,2),_=[],M=[],H=e.slice(0,10).reduce((r,i)=>{let o=i.pressure;if(y){let u=C(1,i.distance/s),W=C(1,1-u);o=C(1,r+(W-r)*(u*le))}return(r+o)/2},e[0].pressure),m=$(s,h,e[e.length-1].pressure,n),U,X=e[0].vector,z=e[0].point,F=z,O=z,E=F,J=!1;for(let r=0;r<e.length;r++){let{pressure:i}=e[r],{point:o,vector:u,distance:W,runningLength:I}=e[r];if(r<e.length-1&&p-I<3)continue;if(h){if(y){let v=C(1,W/s),Z=C(1,1-v);i=C(1,H+(Z-H)*(v*le))}m=$(s,h,i,n)}else m=s/2;U===void 0&&(U=m);let fe=I<g?j(I/g):1,be=p-I<T?c((p-I)/T):1;m=Math.max(.01,m*Math.min(fe,be));let se=(r<e.length-1?e[r+1]:e[r]).vector,Y=r<e.length-1?B(u,se):1,he=B(u,X)<0&&!J,ue=Y!==null&&Y<0;if(he||ue){let v=b(R(X),m);for(let Z=1/13,w=0;w<=1;w+=Z)O=L(a(o,v),o,V*w),_.push(O),E=L(l(o,v),o,V*-w),M.push(E);z=O,F=E,ue&&(J=!0);continue}if(J=!1,r===e.length-1){let v=b(R(u),m);_.push(a(o,v)),M.push(l(o,v));continue}let ie=b(R(K(se,u,Y)),m);O=a(o,ie),(r<=1||A(z,O)>oe)&&(_.push(O),z=O),E=l(o,ie),(r<=1||A(F,E)>oe)&&(M.push(E),F=E),H=i,X=u}let P=e[0].point.slice(0,2),k=e.length>1?e[e.length-1].point.slice(0,2):l(e[0].point,[1,1]),Q=[],N=[];if(e.length===1){if(!(g||T)||D){let r=ee(P,G(R(a(P,k))),-(U||m)),i=[];for(let o=1/13,u=o;u<=1;u+=o)i.push(L(r,P,V*2*u));return i}}else{if(!(g||T&&e.length===1))if(S)for(let i=1/13,o=i;o<=1;o+=i){let u=L(M[0],P,V*o);Q.push(u)}else{let i=a(_[0],M[0]),o=b(i,.5),u=b(i,.51);Q.push(a(P,o),a(P,u),l(P,u),l(P,o))}let r=R(ce(e[e.length-1].vector));if(T||g&&e.length===1)N.push(k);else if(q){let i=ee(k,r,m);for(let o=1/29,u=o;u<1;u+=o)N.push(L(i,k,V*3*u))}else N.push(l(k,b(r,m)),l(k,b(r,m*.99)),a(k,b(r,m*.99)),a(k,b(r,m)))}return _.concat(N,M.reverse(),Q)}function re(e,t={}){var q;let{streamline:s=.5,size:x=16,last:h=!1}=t;if(e.length===0)return[];let y=.15+(1-s)*.85,n=Array.isArray(e[0])?e:e.map(({x:c,y:p,pressure:g=.5})=>[c,p,g]);if(n.length===2){let c=n[1];n=n.slice(0,-1);for(let p=1;p<5;p++)n.push(K(n[0],c,p/4))}n.length===1&&(n=[...n,[...l(n[0],[1,1]),...n[0].slice(2)]]);let f=[{point:[n[0][0],n[0][1]],pressure:n[0][2]>=0?n[0][2]:.25,vector:[1,1],distance:0,runningLength:0}],d=!1,D=0,S=f[0],j=n.length-1;for(let c=1;c<n.length;c++){let p=h&&c===j?n[c].slice(0,2):K(S.point,n[c],y);if(me(S.point,p))continue;let g=ae(p,S.point);if(D+=g,c<j&&!d){if(D<x)continue;d=!0}S={point:p,pressure:n[c][2]>=0?n[c][2]:.5,vector:G(a(S.point,p)),distance:g,runningLength:D},f.push(S)}return f[0].vector=((q=f[1])==null?void 0:q.vector)||[0,0],f}function ne(e,t={}){return te(re(e,t),t)}var ve=ne;

window.PerfectFreehand = exports;
})();
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
/*
 * Octarine camera overlay: a draggable, resizable live camera view.
 *
 *   drag            move
 *   wheel / handle  resize
 *   shift+click     cycle shape (circle, rounded square, wide)
 *   double-click    toggle large (near full-screen) view
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

  let host = null, video = null, msg = null, fullBtn = null;
  let stream = null, enabled = false, full = false;

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
                background: rgba(0,0,0,.55); opacity: 0; transition: opacity .2s; }
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
      fullBtn.innerHTML = O.icon(full ? 'minimize' : 'maximize', 16);
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
      class: 'o-btn icon', title, html: O.icon(icon, 16),
      onpointerdown: (e) => e.stopPropagation(),
      onclick: (e) => { e.stopPropagation(); fn(); }
    });
  }

  function build() {
    const created = O.createHost('camera', CSS);
    host = created.host;
    const root = created.root;

    const box = O.h('div', { class: 'box' });
    video = O.h('video', { autoplay: true, muted: true, playsInline: true });
    video.setAttribute('muted', '');
    msg = O.h('div', { class: 'msg o-ui' }, 'Starting camera…');
    box.append(video, msg);

    fullBtn = button('maximize', '', toggleFull);
    const controls = O.h('div', { class: 'controls o-ui' },
      button('shape', 'Change shape (shift+click)', cycleShape),
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

  /* ---------------- options ---------------- */

  function setShape(shape) {
    if (!SHAPES.includes(shape)) return;
    st.shape = shape;
    st.size = O.clamp(st.size, MIN_SIZE, maxSize());
    layout(); save(); emit();
  }
  function cycleShape() { setShape(SHAPES[(SHAPES.indexOf(st.shape) + 1) % SHAPES.length]); }
  function setMirror(on) { st.mirror = !!on; layout(); save(); emit(); }
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
      } catch (err) {
        O.toast('Camera failed: ' + (err.message || err.name));
        disable();
      }
    }
    emit();
  }

  function state() {
    return { enabled, full, shape: st.shape, mirror: st.mirror, size: st.size, deviceId: st.deviceId };
  }
  function emit() { O.emit('camera:change', state()); }

  return {
    SHAPES,
    enable, disable,
    toggle: () => (enabled ? disable() : enable()),
    isEnabled: () => enabled,
    setShape, cycleShape, setMirror, toggleFull, setSize: resizeTo,
    devices, setDevice, state
  };
});
/*
 * Octarine voice lifter: microphone pass-through to speakers for classroom audio lift.
 * Uses Web Audio API:
 *   MediaStreamAudioSourceNode -> BiquadFilter (high-pass ~100Hz rumble cut)
 *   -> DynamicsCompressorNode (feedback control / leveling) -> GainNode -> AudioDestinationNode
 * Also includes an AnalyserNode for volume metering and safety feedback monitoring.
 */
Octarine.define('voice', function (O) {
  'use strict';

  const st = Object.assign(
    { gain: 1.0, muted: false, deviceId: '', sinkId: '' },
    O.storage.get('voice', {})
  );
  const save = O.debounce(() => O.storage.set('voice', st), 300);

  let audioCtx = null;
  let stream = null;
  let sourceNode = null;
  let filterNode = null;
  let compressorNode = null;
  let gainNode = null;
  let analyserNode = null;
  let meterInterval = null;
  let enabled = false;
  let currentLevel = 0; // 0.0 to 1.0

  function createAudioPipeline(mediaStream) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error('Web Audio API is not supported in this browser.');

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioCtx({ latencyHint: 'interactive' });
    }

    // Highpass filter to eliminate microphone handling noise and low rumble (< 100Hz)
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'highpass';
    filterNode.frequency.setValueAtTime(100, audioCtx.currentTime);

    // Dynamics compressor for gentle peak control and preventing feedback spikes
    compressorNode = audioCtx.createDynamicsCompressor();
    compressorNode.threshold.setValueAtTime(-24, audioCtx.currentTime);
    compressorNode.knee.setValueAtTime(10, audioCtx.currentTime);
    compressorNode.ratio.setValueAtTime(12, audioCtx.currentTime);
    compressorNode.attack.setValueAtTime(0.003, audioCtx.currentTime);
    compressorNode.release.setValueAtTime(0.25, audioCtx.currentTime);

    // Master gain
    gainNode = audioCtx.createGain();
    applyGain();

    // Fast metering
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.5;

    sourceNode = audioCtx.createMediaStreamSource(mediaStream);

    // Connect graph:
    // source -> filter -> compressor -> gain -> destination
    //                                      \-> analyser
    sourceNode.connect(filterNode);
    filterNode.connect(compressorNode);
    compressorNode.connect(gainNode);
    gainNode.connect(analyserNode);
    gainNode.connect(audioCtx.destination);

    // Set audio sink ID if supported (Chromium setSinkId)
    if (st.sinkId && typeof audioCtx.setSinkId === 'function') {
      audioCtx.setSinkId(st.sinkId).catch((err) => {
        console.warn('Could not set output sink:', err);
      });
    }

    startMeter();
  }

  function applyGain() {
    if (!gainNode || !audioCtx) return;
    const targetGain = st.muted ? 0 : st.gain;
    gainNode.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.03);
  }

  function startMeter() {
    stopMeter();
    const data = new Uint8Array(analyserNode.frequencyBinCount);
    meterInterval = setInterval(() => {
      if (!analyserNode || !enabled) return;
      analyserNode.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data[i];
      }
      const avg = sum / data.length;
      currentLevel = Math.min(1, avg / 128);
      O.emit('voice:meter', { level: currentLevel, muted: st.muted, gain: st.gain });
    }, 100);
  }

  function stopMeter() {
    if (meterInterval) {
      clearInterval(meterInterval);
      meterInterval = null;
    }
    currentLevel = 0;
  }

  async function openStream() {
    const constraints = {
      audio: {
        // We explicitly turn off heavy AEC/AGC if possible for natural speech passthrough,
        // but noiseSuppression helps reduce classroom fan hum.
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: true,
        deviceId: st.deviceId ? { exact: st.deviceId } : undefined
      },
      video: false
    };

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      if (st.deviceId && (err.name === 'OverconstrainedError' || err.name === 'NotFoundError')) {
        st.deviceId = '';
        save();
        constraints.audio.deviceId = undefined;
        return navigator.mediaDevices.getUserMedia(constraints);
      }
      throw err;
    }
  }

  function cleanup() {
    stopMeter();
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (sourceNode) {
      sourceNode.disconnect();
      sourceNode = null;
    }
    if (filterNode) {
      filterNode.disconnect();
      filterNode = null;
    }
    if (compressorNode) {
      compressorNode.disconnect();
      compressorNode = null;
    }
    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }
    if (analyserNode) {
      analyserNode.disconnect();
      analyserNode = null;
    }
    if (audioCtx && audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
  }

  async function enable() {
    if (enabled) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      O.toast('Microphone access is not supported in this browser.');
      return;
    }

    try {
      stream = await openStream();
      createAudioPipeline(stream);
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      enabled = true;
      stream.getAudioTracks()[0].addEventListener('ended', () => disable());
      emit();
      O.toast('Voice lifter enabled. Caution: keep microphone away from speakers to prevent feedback.');
    } catch (err) {
      cleanup();
      O.toast('Microphone failed: ' + (err.message || err.name));
      disable();
    }
  }

  function disable() {
    enabled = false;
    cleanup();
    emit();
  }

  function setGain(val) {
    st.gain = O.clamp(parseFloat(val) || 0, 0, 3.0);
    applyGain();
    save();
    emit();
  }

  function setMuted(muted) {
    st.muted = !!muted;
    applyGain();
    save();
    emit();
  }

  function toggleMute() {
    setMuted(!st.muted);
  }

  async function devices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return { inputs: [], outputs: [] };
    const list = await navigator.mediaDevices.enumerateDevices();
    const inputs = list
      .filter((d) => d.kind === 'audioinput')
      .map((d, i) => ({ id: d.deviceId, label: d.label || `Microphone ${i + 1}` }));
    const outputs = list
      .filter((d) => d.kind === 'audiooutput')
      .map((d, i) => ({ id: d.deviceId, label: d.label || `Speaker / Output ${i + 1}` }));
    return { inputs, outputs };
  }

  async function setDevice(id) {
    st.deviceId = id || '';
    save();
    if (enabled) {
      cleanup();
      await enable();
    }
    emit();
  }

  async function setSinkId(id) {
    st.sinkId = id || '';
    save();
    if (audioCtx && typeof audioCtx.setSinkId === 'function') {
      try {
        await audioCtx.setSinkId(st.sinkId);
      } catch (e) {
        console.warn('Failed setting audio output sink:', e);
      }
    }
    emit();
  }

  function state() {
    return {
      enabled,
      gain: st.gain,
      muted: st.muted,
      level: currentLevel,
      deviceId: st.deviceId,
      sinkId: st.sinkId,
      sinkSupported: typeof AudioContext !== 'undefined' && typeof AudioContext.prototype.setSinkId === 'function'
    };
  }

  function emit() {
    O.emit('voice:change', state());
  }

  return {
    enable,
    disable,
    toggle: () => (enabled ? disable() : enable()),
    isEnabled: () => enabled,
    setGain,
    setMuted,
    toggleMute,
    devices,
    setDevice,
    setSinkId,
    state
  };
});
/*
 * Octarine drawing engine: stroke data model and SVG renderer.
 * Supports:
 *   - pen (using PerfectFreehand smooth outline polygon)
 *   - highlighter (translucent stroke)
 *   - shapes: line, arrow, rect, ellipse
 *   - stroke eraser (hit-testing points & bounding box)
 *   - undo / redo stack
 *   - serialization to JSON / SVG / PNG
 */
Octarine.define('draw', function (O) {
  'use strict';

  function distanceToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  // Convert outline points from PerfectFreehand into an SVG path data string
  function getSvgPathFromStroke(stroke) {
    if (!stroke || stroke.length === 0) return '';
    const d = stroke.reduce(
      (acc, [x0, y0], i, arr) => {
        const [x1, y1] = arr[(i + 1) % arr.length];
        acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        return acc;
      },
      ['M', ...stroke[0], 'Q']
    );
    d.push('Z');
    return d.join(' ');
  }

  class DrawingSurface {
    constructor(opts) {
      opts = opts || {};
      this.svg = opts.svg; // existing or newly created SVG element
      this.width = opts.width || 1920;
      this.height = opts.height || 1080;
      this.strokes = []; // active stroke list
      this.undone = [];  // undo stack
      this.activeStroke = null;
      this.activeElement = null;
      this.onChanged = opts.onChanged || (() => {});

      if (!this.svg) {
        this.svg = O.s('svg', {
          viewBox: `0 0 ${this.width} ${this.height}`,
          xmlns: O.SVG_NS,
          width: '100%',
          height: '100%'
        });
      }
      this.setupDOM();
    }

    setupDOM() {
      this.svg.innerHTML = '';
      // Group for completed strokes
      this.strokesGroup = O.s('g', { class: 'o-strokes' });
      // Group for stroke currently being drawn
      this.liveGroup = O.s('g', { class: 'o-live' });
      this.svg.append(this.strokesGroup, this.liveGroup);
    }

    setSize(w, h) {
      this.width = w;
      this.height = h;
      this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    }

    // Hit test a point against a stroke
    hitTest(stroke, x, y, radius) {
      radius = radius || 15;
      const bb = stroke.bbox;
      if (bb) {
        if (x < bb.minX - radius || x > bb.maxX + radius ||
            y < bb.minY - radius || y > bb.maxY + radius) {
          return false;
        }
      }

      if (stroke.tool === 'rect') {
        const [p1, p2] = stroke.points;
        const x1 = Math.min(p1[0], p2[0]), x2 = Math.max(p1[0], p2[0]);
        const y1 = Math.min(p1[1], p2[1]), y2 = Math.max(p1[1], p2[1]);
        return (
          distanceToSegment(x, y, x1, y1, x2, y1) <= radius ||
          distanceToSegment(x, y, x2, y1, x2, y2) <= radius ||
          distanceToSegment(x, y, x2, y2, x1, y2) <= radius ||
          distanceToSegment(x, y, x1, y2, x1, y1) <= radius
        );
      }

      if (stroke.tool === 'ellipse') {
        const [p1, p2] = stroke.points;
        const cx = (p1[0] + p2[0]) / 2, cy = (p1[1] + p2[1]) / 2;
        const rx = Math.abs(p2[0] - p1[0]) / 2, ry = Math.abs(p2[1] - p1[1]) / 2;
        if (rx === 0 || ry === 0) return false;
        const norm = Math.hypot((x - cx) / rx, (y - cy) / ry);
        return Math.abs(norm - 1) * Math.min(rx, ry) <= radius;
      }

      // For pen, highlighter, line, arrow: check distance to polyline segments
      const pts = stroke.points;
      for (let i = 0; i < pts.length - 1; i++) {
        if (distanceToSegment(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]) <= radius) {
          return true;
        }
      }
      return false;
    }

    eraseAt(x, y, radius) {
      let removedAny = false;
      for (let i = this.strokes.length - 1; i >= 0; i--) {
        if (this.hitTest(this.strokes[i], x, y, radius)) {
          this.undone.push({ type: 'erase', stroke: this.strokes[i], index: i });
          this.strokes.splice(i, 1);
          removedAny = true;
        }
      }
      if (removedAny) {
        this.renderAll();
        this.onChanged();
      }
      return removedAny;
    }

    startStroke(tool, color, size, point) {
      this.activeStroke = {
        id: O.uid(),
        tool,
        color,
        size,
        points: [point],
        bbox: { minX: point[0], maxX: point[0], minY: point[1], maxY: point[1] }
      };
      this.liveGroup.innerHTML = '';
      this.activeElement = this.renderStrokeElement(this.activeStroke);
      if (this.activeElement) {
        this.liveGroup.appendChild(this.activeElement);
      }
    }

    updateStroke(point) {
      if (!this.activeStroke) return;
      const s = this.activeStroke;
      const bb = s.bbox;
      bb.minX = Math.min(bb.minX, point[0]);
      bb.maxX = Math.max(bb.maxX, point[0]);
      bb.minY = Math.min(bb.minY, point[1]);
      bb.maxY = Math.max(bb.maxY, point[1]);

      if (s.tool === 'pen' || s.tool === 'highlighter') {
        s.points.push(point);
      } else {
        // Shapes keep [startPoint, currentPoint]
        if (s.points.length === 1) s.points.push(point);
        else s.points[1] = point;
      }

      this.updateStrokeElement(this.activeElement, s);
    }

    finishStroke() {
      if (!this.activeStroke) return;
      const s = this.activeStroke;
      this.liveGroup.innerHTML = '';
      this.activeElement = null;
      this.activeStroke = null;

      // Don't save zero-length strokes
      if (s.points.length < 2 && s.tool !== 'pen') return;

      this.strokes.push(s);
      this.undone = []; // clear redo on new action
      const el = this.renderStrokeElement(s);
      if (el) this.strokesGroup.appendChild(el);
      this.onChanged();
    }

    cancelStroke() {
      this.activeStroke = null;
      this.activeElement = null;
      this.liveGroup.innerHTML = '';
    }

    renderStrokeElement(s) {
      if (s.tool === 'pen' && window.PerfectFreehand) {
        const outline = window.PerfectFreehand.getStroke(s.points, {
          size: s.size,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
          simulatePressure: true
        });
        const pathData = getSvgPathFromStroke(outline);
        return O.s('path', {
          d: pathData,
          fill: s.color,
          'data-id': s.id
        });
      }

      if (s.tool === 'highlighter') {
        const d = 'M ' + s.points.map((p) => `${p[0]} ${p[1]}`).join(' L ');
        return O.s('path', {
          d,
          fill: 'none',
          stroke: s.color,
          'stroke-width': s.size * 2.5,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          opacity: '0.4',
          'data-id': s.id
        });
      }

      if (s.tool === 'line') {
        const [p1, p2] = s.points.length > 1 ? s.points : [s.points[0], s.points[0]];
        return O.s('line', {
          x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1],
          stroke: s.color,
          'stroke-width': s.size,
          'stroke-linecap': 'round',
          'data-id': s.id
        });
      }

      if (s.tool === 'arrow') {
        const [p1, p2] = s.points.length > 1 ? s.points : [s.points[0], s.points[0]];
        const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
        const headLen = Math.max(12, s.size * 2.5);
        const a1 = angle - Math.PI / 7;
        const a2 = angle + Math.PI / 7;
        const hx1 = p2[0] - headLen * Math.cos(a1);
        const hy1 = p2[1] - headLen * Math.sin(a1);
        const hx2 = p2[0] - headLen * Math.cos(a2);
        const hy2 = p2[1] - headLen * Math.sin(a2);
        const d = `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} M ${hx1} ${hy1} L ${p2[0]} ${p2[1]} L ${hx2} ${hy2}`;
        return O.s('path', {
          d,
          fill: 'none',
          stroke: s.color,
          'stroke-width': s.size,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'data-id': s.id
        });
      }

      if (s.tool === 'rect') {
        const [p1, p2] = s.points.length > 1 ? s.points : [s.points[0], s.points[0]];
        const x = Math.min(p1[0], p2[0]), y = Math.min(p1[1], p2[1]);
        const w = Math.abs(p2[0] - p1[0]), h = Math.abs(p2[1] - p1[1]);
        return O.s('rect', {
          x, y, width: w, height: h, rx: 4, ry: 4,
          fill: 'none',
          stroke: s.color,
          'stroke-width': s.size,
          'data-id': s.id
        });
      }

      if (s.tool === 'ellipse') {
        const [p1, p2] = s.points.length > 1 ? s.points : [s.points[0], s.points[0]];
        const cx = (p1[0] + p2[0]) / 2, cy = (p1[1] + p2[1]) / 2;
        const rx = Math.abs(p2[0] - p1[0]) / 2, ry = Math.abs(p2[1] - p1[1]) / 2;
        return O.s('ellipse', {
          cx, cy, rx, ry,
          fill: 'none',
          stroke: s.color,
          'stroke-width': s.size,
          'data-id': s.id
        });
      }

      // Default fallback polyline
      const d = 'M ' + s.points.map((p) => `${p[0]} ${p[1]}`).join(' L ');
      return O.s('path', {
        d,
        fill: 'none',
        stroke: s.color,
        'stroke-width': s.size,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'data-id': s.id
      });
    }

    updateStrokeElement(el, s) {
      if (!el) return;
      if (s.tool === 'pen' && window.PerfectFreehand) {
        const outline = window.PerfectFreehand.getStroke(s.points, {
          size: s.size,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
          simulatePressure: true
        });
        el.setAttribute('d', getSvgPathFromStroke(outline));
        return;
      }
      if (s.tool === 'highlighter' || !['line', 'arrow', 'rect', 'ellipse'].includes(s.tool)) {
        el.setAttribute('d', 'M ' + s.points.map((p) => `${p[0]} ${p[1]}`).join(' L '));
        return;
      }
      if (s.tool === 'line') {
        const [p1, p2] = s.points;
        el.setAttribute('x1', p1[0]); el.setAttribute('y1', p1[1]);
        el.setAttribute('x2', p2[0]); el.setAttribute('y2', p2[1]);
        return;
      }
      if (s.tool === 'arrow') {
        const [p1, p2] = s.points;
        const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
        const headLen = Math.max(12, s.size * 2.5);
        const a1 = angle - Math.PI / 7;
        const a2 = angle + Math.PI / 7;
        const hx1 = p2[0] - headLen * Math.cos(a1);
        const hy1 = p2[1] - headLen * Math.sin(a1);
        const hx2 = p2[0] - headLen * Math.cos(a2);
        const hy2 = p2[1] - headLen * Math.sin(a2);
        el.setAttribute('d', `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} M ${hx1} ${hy1} L ${p2[0]} ${p2[1]} L ${hx2} ${hy2}`);
        return;
      }
      if (s.tool === 'rect') {
        const [p1, p2] = s.points;
        el.setAttribute('x', Math.min(p1[0], p2[0]));
        el.setAttribute('y', Math.min(p1[1], p2[1]));
        el.setAttribute('width', Math.abs(p2[0] - p1[0]));
        el.setAttribute('height', Math.abs(p2[1] - p1[1]));
        return;
      }
      if (s.tool === 'ellipse') {
        const [p1, p2] = s.points;
        el.setAttribute('cx', (p1[0] + p2[0]) / 2);
        el.setAttribute('cy', (p1[1] + p2[1]) / 2);
        el.setAttribute('rx', Math.abs(p2[0] - p1[0]) / 2);
        el.setAttribute('ry', Math.abs(p2[1] - p1[1]) / 2);
        return;
      }
    }

    renderAll() {
      this.strokesGroup.innerHTML = '';
      for (const s of this.strokes) {
        const el = this.renderStrokeElement(s);
        if (el) this.strokesGroup.appendChild(el);
      }
    }

    undo() {
      if (this.strokes.length === 0) return false;
      const s = this.strokes.pop();
      this.undone.push({ type: 'draw', stroke: s });
      this.renderAll();
      this.onChanged();
      return true;
    }

    redo() {
      if (this.undone.length === 0) return false;
      const action = this.undone.pop();
      if (action.type === 'draw') {
        this.strokes.push(action.stroke);
      } else if (action.type === 'erase') {
        this.strokes.splice(action.index, 0, action.stroke);
      }
      this.renderAll();
      this.onChanged();
      return true;
    }

    clear() {
      if (this.strokes.length === 0) return;
      this.undone.push({ type: 'clear', strokes: [...this.strokes] });
      this.strokes = [];
      this.renderAll();
      this.onChanged();
    }

    toJSON() {
      return {
        width: this.width,
        height: this.height,
        strokes: this.strokes
      };
    }

    fromJSON(data) {
      if (!data) return;
      if (data.width && data.height) this.setSize(data.width, data.height);
      this.strokes = Array.isArray(data.strokes) ? data.strokes : [];
      this.undone = [];
      this.renderAll();
      this.onChanged();
    }

    toSVGString(background) {
      const clone = this.svg.cloneNode(true);
      if (background) {
        const rect = O.s('rect', {
          width: '100%',
          height: '100%',
          fill: background
        });
        clone.insertBefore(rect, clone.firstChild);
      }
      const live = clone.querySelector('.o-live');
      if (live) live.remove();
      return new XMLSerializer().serializeToString(clone);
    }

    async toPNGDataURL(background) {
      const svgStr = this.toSVGString(background);
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      return new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = this.width;
          canvas.height = this.height;
          const ctx = canvas.getContext('2d');
          if (background) {
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (e) => {
          URL.revokeObjectURL(url);
          reject(e);
        };
        img.src = url;
      });
    }
  }

  return {
    DrawingSurface,
    getSvgPathFromStroke
  };
});
/*
 * Octarine standalone multipage interactive whiteboard / blackboard.
 * Features:
 *   - Multipage management (add page, next, prev, jump, delete)
 *   - Background themes: white, dark/black, chalkboard green, grid, ruled lines
 *   - Floating customizable tool bar (pen, highlighter, eraser, shapes, colors, size, undo/redo, clear, export)
 *   - Autosave per page to localStorage and import/export to JSON, SVG, PNG
 */
Octarine.define('board', function (O) {
  'use strict';

  const BG_THEMES = [
    { id: 'black', name: 'Blackboard', color: '#1a1a1e', text: '#fff' },
    { id: 'green', name: 'Chalkboard', color: '#16382c', text: '#fff' },
    { id: 'white', name: 'Whiteboard', color: '#ffffff', text: '#111' },
    { id: 'grid', name: 'Grid', color: '#1e222b', text: '#fff', pattern: 'grid' },
    { id: 'ruled', name: 'Ruled', color: '#fcfbfa', text: '#111', pattern: 'ruled' }
  ];

  const PALETTE = [
    '#ffffff', '#ff5252', '#ffeb3b', '#69f0ae', '#40c4ff', '#e040fb', '#ff9800', '#212121'
  ];

  const SIZES = [3, 6, 12, 24];

  const st = Object.assign(
    {
      visible: false,
      tool: 'pen',
      color: '#ffffff',
      size: 6,
      bg: 'black',
      currentPage: 0,
      pages: [{ id: O.uid(), width: 1920, height: 1080, strokes: [] }]
    },
    O.storage.get('board_data', {})
  );

  const saveState = O.debounce(() => {
    O.storage.set('board_data', st);
  }, 400);

  let host = null, root = null, surface = null;
  let boardContainer = null, svgEl = null, toolbarEl = null;
  let pageIndicator = null;
  let isPointerDown = false;

  const CSS = `
    :host { position: fixed; inset: 0; z-index: 2147483000; display: none; touch-action: none; user-select: none; }
    .canvas-layer { position: absolute; inset: 0; width: 100%; height: 100%; cursor: crosshair; }
    
    /* Patterns */
    .bg-grid {
      background-size: 40px 40px;
      background-image: linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
    }
    .bg-ruled {
      background-size: 100% 32px;
      background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
    }

    /* Floating Toolbar */
    .toolbar {
      position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 8px; padding: 6px 12px;
      background: rgba(26, 26, 32, 0.92); backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45); z-index: 10;
      color: #fff;
    }
    .toolbar-grp { display: flex; align-items: center; gap: 4px; border-right: 1px solid rgba(255, 255, 255, 0.15); padding-right: 8px; }
    .toolbar-grp:last-child { border-right: none; padding-right: 0; }
    .swatch {
      width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3);
      cursor: pointer; padding: 0;
    }
    .swatch.active { border-color: #fff; transform: scale(1.15); box-shadow: 0 0 8px currentColor; }
    .size-dot {
      border-radius: 50%; background: currentColor; display: inline-block;
    }
    .page-nav { display: flex; align-items: center; gap: 4px; font-weight: 500; font-size: 13px; }
  `;

  function build() {
    if (host) return;
    const created = O.createHost('whiteboard', CSS);
    host = created.host;
    root = created.root;

    boardContainer = O.h('div', { class: 'canvas-layer' });
    svgEl = O.s('svg', {
      viewBox: '0 0 1920 1080',
      preserveAspectRatio: 'xMidYMid meet',
      style: 'width:100%;height:100%;display:block;'
    });
    boardContainer.appendChild(svgEl);

    surface = new O.draw.DrawingSurface({
      svg: svgEl,
      width: 1920,
      height: 1080,
      onChanged: () => {
        saveCurrentPageData();
        saveState();
      }
    });

    buildToolbar();
    setupPointerEvents();

    root.appendChild(boardContainer);
    root.appendChild(toolbarEl);

    applyTheme(st.bg);
    loadPage(st.currentPage);
  }

  function getSvgCoordinates(e) {
    const rect = svgEl.getBoundingClientRect();
    const scaleX = 1920 / rect.width;
    const scaleY = 1080 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    return [x, y, pressure];
  }

  function setupPointerEvents() {
    boardContainer.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      isPointerDown = true;
      try { boardContainer.setPointerCapture(e.pointerId); } catch (err) {}
      const pt = getSvgCoordinates(e);

      if (st.tool === 'eraser') {
        surface.eraseAt(pt[0], pt[1], st.size * 3);
      } else {
        surface.startStroke(st.tool, st.color, st.size, pt);
      }
      e.preventDefault();
    });

    boardContainer.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;
      // Handle coalesced points if browser supports it for maximum smoothness
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of events) {
        const pt = getSvgCoordinates(ev);
        if (st.tool === 'eraser') {
          surface.eraseAt(pt[0], pt[1], st.size * 3);
        } else {
          surface.updateStroke(pt);
        }
      }
    });

    const pointerUp = (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      if (st.tool !== 'eraser') {
        surface.finishStroke();
      }
    };

    boardContainer.addEventListener('pointerup', pointerUp);
    boardContainer.addEventListener('pointercancel', () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      surface.cancelStroke();
    });
  }

  function buildToolbar() {
    toolbarEl = O.h('div', { class: 'toolbar o-ui' });

    // Drag handle
    const grip = O.h('div', {
      style: { cursor: 'move', display: 'flex', alignItems: 'center', opacity: '0.6' },
      html: O.icon('grip', 16)
    });
    O.dragHelper(grip, {
      onStart: () => {
        const r = toolbarEl.getBoundingClientRect();
        return { x: r.left, y: r.top };
      },
      onMove: (dx, dy, e, c) => {
        toolbarEl.style.left = `${c.x + dx}px`;
        toolbarEl.style.top = `${c.y + dy}px`;
        toolbarEl.style.bottom = 'auto';
        toolbarEl.style.transform = 'none';
      }
    });

    // Tool selectors
    const toolBtns = [
      { id: 'pen', icon: 'pen', title: 'Pen (P)' },
      { id: 'highlighter', icon: 'highlighter', title: 'Highlighter (H)' },
      { id: 'eraser', icon: 'eraser', title: 'Stroke Eraser (E)' },
      { id: 'line', icon: 'line', title: 'Straight Line (L)' },
      { id: 'arrow', icon: 'arrow', title: 'Arrow (A)' },
      { id: 'rect', icon: 'rect', title: 'Rectangle (R)' },
      { id: 'ellipse', icon: 'ellipse', title: 'Circle / Ellipse (C)' }
    ];

    const grpTools = O.h('div', { class: 'toolbar-grp' }, grip);
    toolBtns.forEach((t) => {
      const btn = O.h('button', {
        class: `o-btn icon ${st.tool === t.id ? 'active' : ''}`,
        title: t.title,
        html: O.icon(t.icon, 18),
        onclick: () => setTool(t.id)
      });
      btn.dataset.tool = t.id;
      grpTools.appendChild(btn);
    });

    // Color Swatches
    const grpColors = O.h('div', { class: 'toolbar-grp' });
    PALETTE.forEach((c) => {
      const sw = O.h('button', {
        class: `swatch ${st.color.toLowerCase() === c.toLowerCase() ? 'active' : ''}`,
        style: { background: c, color: c },
        onclick: () => setColor(c)
      });
      sw.dataset.color = c;
      grpColors.appendChild(sw);
    });

    // Stroke size
    const grpSizes = O.h('div', { class: 'toolbar-grp' });
    SIZES.forEach((s) => {
      const dot = O.h('span', {
        class: 'size-dot',
        style: { width: `${Math.min(18, s + 3)}px`, height: `${Math.min(18, s + 3)}px` }
      });
      const btn = O.h('button', {
        class: `o-btn icon ${st.size === s ? 'active' : ''}`,
        title: `Size ${s}px`,
        onclick: () => setSize(s)
      }, dot);
      btn.dataset.size = s;
      grpSizes.appendChild(btn);
    });

    // Undo / Redo / Clear
    const grpHistory = O.h('div', { class: 'toolbar-grp' },
      O.h('button', { class: 'o-btn icon', title: 'Undo (Ctrl+Z)', html: O.icon('undo', 18), onclick: () => surface.undo() }),
      O.h('button', { class: 'o-btn icon', title: 'Redo (Ctrl+Y)', html: O.icon('redo', 18), onclick: () => surface.redo() }),
      O.h('button', { class: 'o-btn icon', title: 'Clear Page', html: O.icon('trash', 18), onclick: () => {
        if (confirm('Clear current whiteboard page?')) surface.clear();
      }})
    );

    // Multipage navigation
    pageIndicator = O.h('span', { style: { minWidth: '40px', textAlign: 'center' } }, '1 / 1');
    const grpPages = O.h('div', { class: 'toolbar-grp page-nav' },
      O.h('button', { class: 'o-btn icon', title: 'Previous Page', html: O.icon('left', 18), onclick: () => prevPage() }),
      pageIndicator,
      O.h('button', { class: 'o-btn icon', title: 'Next Page', html: O.icon('right', 18), onclick: () => nextPage() }),
      O.h('button', { class: 'o-btn icon', title: 'Add New Page', html: O.icon('plus', 18), onclick: () => addPage() })
    );

    // Export options & Close
    const grpExport = O.h('div', { class: 'toolbar-grp' },
      O.h('button', { class: 'o-btn icon', title: 'Export PNG / SVG', html: O.icon('download', 18), onclick: () => showExportMenu() }),
      O.h('button', { class: 'o-btn icon', title: 'Close Board (Esc)', html: O.icon('close', 18), onclick: () => hide() })
    );

    toolbarEl.append(grpTools, grpColors, grpSizes, grpHistory, grpPages, grpExport);
  }

  function setTool(tool) {
    st.tool = tool;
    toolbarEl.querySelectorAll('[data-tool]').forEach((el) => {
      el.classList.toggle('active', el.dataset.tool === tool);
    });
    saveState();
  }

  function setColor(color) {
    st.color = color;
    toolbarEl.querySelectorAll('.swatch').forEach((el) => {
      el.classList.toggle('active', el.dataset.color.toLowerCase() === color.toLowerCase());
    });
    saveState();
  }

  function setSize(size) {
    st.size = size;
    toolbarEl.querySelectorAll('[data-size]').forEach((el) => {
      el.classList.toggle('active', parseInt(el.dataset.size, 10) === size);
    });
    saveState();
  }

  function applyTheme(themeId) {
    st.bg = themeId;
    const theme = BG_THEMES.find((t) => t.id === themeId) || BG_THEMES[0];
    boardContainer.style.backgroundColor = theme.color;
    boardContainer.classList.toggle('bg-grid', theme.pattern === 'grid');
    boardContainer.classList.toggle('bg-ruled', theme.pattern === 'ruled');

    // Default pen color adjustment if contrast is inverted
    if (theme.id === 'white' && st.color === '#ffffff') {
      setColor('#212121');
    } else if (theme.id !== 'white' && st.color === '#212121') {
      setColor('#ffffff');
    }
    saveState();
  }

  function updatePageIndicator() {
    if (pageIndicator) {
      pageIndicator.textContent = `${st.currentPage + 1} / ${st.pages.length}`;
    }
  }

  function saveCurrentPageData() {
    if (!surface || !st.pages[st.currentPage]) return;
    st.pages[st.currentPage] = Object.assign({}, st.pages[st.currentPage], surface.toJSON());
  }

  function loadPage(index) {
    if (index < 0 || index >= st.pages.length) return;
    saveCurrentPageData();
    st.currentPage = index;
    surface.fromJSON(st.pages[st.currentPage]);
    updatePageIndicator();
    saveState();
  }

  function nextPage() {
    if (st.currentPage < st.pages.length - 1) {
      loadPage(st.currentPage + 1);
    } else {
      addPage();
    }
  }

  function prevPage() {
    if (st.currentPage > 0) {
      loadPage(st.currentPage - 1);
    }
  }

  function addPage() {
    saveCurrentPageData();
    st.pages.push({ id: O.uid(), width: 1920, height: 1080, strokes: [] });
    loadPage(st.pages.length - 1);
    O.toast(`Page ${st.pages.length} created`);
  }

  function deleteCurrentPage() {
    if (st.pages.length <= 1) {
      surface.clear();
      return;
    }
    if (confirm(`Delete page ${st.currentPage + 1}?`)) {
      st.pages.splice(st.currentPage, 1);
      const nextIndex = Math.min(st.currentPage, st.pages.length - 1);
      loadPage(nextIndex);
    }
  }

  async function exportPNG() {
    const theme = BG_THEMES.find((t) => t.id === st.bg) || BG_THEMES[0];
    const dataUrl = await surface.toPNGDataURL(theme.color);
    const link = O.h('a', {
      href: dataUrl,
      download: `octarine-board-page-${st.currentPage + 1}-${O.timestamp()}.png`
    });
    link.click();
    O.toast('Exported page as PNG');
  }

  function exportSVG() {
    const theme = BG_THEMES.find((t) => t.id === st.bg) || BG_THEMES[0];
    const svgStr = surface.toSVGString(theme.color);
    O.download(svgStr, `octarine-board-page-${st.currentPage + 1}-${O.timestamp()}.svg`, 'image/svg+xml');
    O.toast('Exported page as SVG');
  }

  function exportJSON() {
    saveCurrentPageData();
    const data = JSON.stringify({ version: '0.2.0', pages: st.pages, bg: st.bg }, null, 2);
    O.download(data, `octarine-board-${O.timestamp()}.json`, 'application/json');
    O.toast('Exported all whiteboard pages as JSON');
  }

  async function importJSON() {
    const file = await O.pickFile('.json');
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data.pages) && data.pages.length > 0) {
        st.pages = data.pages;
        if (data.bg) applyTheme(data.bg);
        loadPage(0);
        O.toast(`Imported ${st.pages.length} pages`);
      }
    } catch (e) {
      O.toast('Failed to load JSON file: ' + e.message);
    }
  }

  function showExportMenu() {
    const choice = prompt('Export format:\n1. PNG (current page)\n2. SVG (current page)\n3. JSON (all pages)\n4. Import JSON file', '1');
    if (choice === '1') exportPNG();
    else if (choice === '2') exportSVG();
    else if (choice === '3') exportJSON();
    else if (choice === '4') importJSON();
  }

  function show(opts) {
    build();
    if (opts && opts.background) applyTheme(opts.background);
    host.style.display = 'block';
    st.visible = true;
    saveState();
    O.emit('board:change', { visible: true });
  }

  function hide() {
    if (!host) return;
    host.style.display = 'none';
    st.visible = false;
    saveState();
    O.emit('board:change', { visible: false });
  }

  function toggle() {
    if (st.visible) hide();
    else show();
  }

  // Keyboard shortcut integration for whiteboard
  O.addKeyHandler((e) => {
    if (!st.visible) return false;
    if (e.key === 'Escape') { hide(); return true; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (e.shiftKey) surface.redo();
      else surface.undo();
      return true;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      surface.redo();
      return true;
    }
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      if (e.key === 'p' || e.key === 'P') { setTool('pen'); return true; }
      if (e.key === 'h' || e.key === 'H') { setTool('highlighter'); return true; }
      if (e.key === 'e' || e.key === 'E') { setTool('eraser'); return true; }
      if (e.key === 'l' || e.key === 'L') { setTool('line'); return true; }
      if (e.key === 'a' || e.key === 'A') { setTool('arrow'); return true; }
      if (e.key === 'r' || e.key === 'R') { setTool('rect'); return true; }
      if (e.key === 'c' || e.key === 'C') { setTool('ellipse'); return true; }
    }
    return false;
  }, 10);

  return {
    show,
    hide,
    toggle,
    isVisible: () => st.visible,
    setTool,
    setColor,
    setSize,
    applyTheme,
    nextPage,
    prevPage,
    addPage,
    deleteCurrentPage,
    exportPNG,
    exportSVG,
    exportJSON,
    importJSON,
    BG_THEMES
  };
});
/*
 * Octarine transparent annotation layer for live slides / web pages.
 * Supports:
 *   - Transparent overlay on top of any page
 *   - Per-slide annotation persistence when hooked to reveal.js or remark.js
 *   - Toggleable draw mode (click-through vs drawing)
 */
Octarine.define('annotate', function (O) {
  'use strict';

  let host = null, root = null, surface = null;
  let overlayContainer = null, svgEl = null, toolbarEl = null;
  let activeSlideKey = 'global';
  let slideStore = O.storage.get('annotations', {});
  let drawingEnabled = false;

  const st = Object.assign(
    {
      visible: false,
      tool: 'pen',
      color: '#ff5252',
      size: 4
    },
    O.storage.get('annotate_settings', {})
  );

  const saveSettings = O.debounce(() => O.storage.set('annotate_settings', st), 300);
  const saveSlides = O.debounce(() => O.storage.set('annotations', slideStore), 500);

  const CSS = `
    :host { position: fixed; inset: 0; z-index: 2147482900; display: none; pointer-events: none; }
    :host(.active) { display: block; }
    :host(.draw-mode) { pointer-events: auto; }
    .overlay-svg { position: absolute; inset: 0; width: 100%; height: 100%; cursor: crosshair; }
    
    .floating-tools {
      position: absolute; top: 20px; right: 20px; pointer-events: auto;
      display: flex; align-items: center; gap: 6px; padding: 4px 8px;
      background: rgba(26, 26, 32, 0.9); backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); color: #fff;
    }
  `;

  function build() {
    if (host) return;
    const created = O.createHost('annotate', CSS);
    host = created.host;
    root = created.root;

    overlayContainer = O.h('div', { class: 'overlay-svg' });
    svgEl = O.s('svg', {
      viewBox: `0 0 ${window.innerWidth} ${window.innerHeight}`,
      style: 'width:100%;height:100%;display:block;'
    });
    overlayContainer.appendChild(svgEl);

    surface = new O.draw.DrawingSurface({
      svg: svgEl,
      width: window.innerWidth,
      height: window.innerHeight,
      onChanged: () => {
        slideStore[activeSlideKey] = surface.toJSON();
        saveSlides();
      }
    });

    buildToolbar();
    setupPointer();

    root.append(overlayContainer, toolbarEl);

    window.addEventListener('resize', () => {
      surface.setSize(window.innerWidth, window.innerHeight);
    });
  }

  function getPoint(e) {
    const rect = svgEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const p = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    return [x, y, p];
  }

  let isDown = false;
  function setupPointer() {
    overlayContainer.addEventListener('pointerdown', (e) => {
      if (!drawingEnabled || e.button !== 0) return;
      isDown = true;
      try { overlayContainer.setPointerCapture(e.pointerId); } catch (err) {}
      const pt = getPoint(e);
      if (st.tool === 'eraser') {
        surface.eraseAt(pt[0], pt[1], st.size * 3);
      } else {
        surface.startStroke(st.tool, st.color, st.size, pt);
      }
      e.preventDefault();
    });

    overlayContainer.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of events) {
        const pt = getPoint(ev);
        if (st.tool === 'eraser') {
          surface.eraseAt(pt[0], pt[1], st.size * 3);
        } else {
          surface.updateStroke(pt);
        }
      }
    });

    const finish = () => {
      if (!isDown) return;
      isDown = false;
      if (st.tool !== 'eraser') surface.finishStroke();
    };

    overlayContainer.addEventListener('pointerup', finish);
    overlayContainer.addEventListener('pointercancel', () => {
      if (!isDown) return;
      isDown = false;
      surface.cancelStroke();
    });
  }

  function buildToolbar() {
    toolbarEl = O.h('div', { class: 'floating-tools o-ui' },
      O.h('button', {
        class: `o-btn ${drawingEnabled ? 'active' : ''}`,
        title: 'Toggle Annotation Pen (Click through vs Draw)',
        html: O.icon('pen', 16),
        onclick: () => setDrawMode(!drawingEnabled)
      }),
      O.h('button', {
        class: 'o-btn icon',
        title: 'Eraser',
        html: O.icon('eraser', 16),
        onclick: () => {
          st.tool = 'eraser';
          setDrawMode(true);
        }
      }),
      O.h('button', {
        class: 'o-btn icon',
        title: 'Undo',
        html: O.icon('undo', 16),
        onclick: () => surface.undo()
      }),
      O.h('button', {
        class: 'o-btn icon',
        title: 'Clear Slide Annotations',
        html: O.icon('trash', 16),
        onclick: () => surface.clear()
      }),
      O.h('button', {
        class: 'o-btn icon',
        title: 'Close Annotation Layer',
        html: O.icon('close', 16),
        onclick: () => disable()
      })
    );
  }

  function setDrawMode(enabled) {
    drawingEnabled = enabled;
    if (host) host.classList.toggle('draw-mode', enabled);
    const penBtn = toolbarEl.querySelector('button');
    if (penBtn) penBtn.classList.toggle('active', enabled);
  }

  function switchSlide(slideKey) {
    if (!surface) return;
    slideStore[activeSlideKey] = surface.toJSON();
    activeSlideKey = slideKey;
    if (slideStore[activeSlideKey]) {
      surface.fromJSON(slideStore[activeSlideKey]);
    } else {
      surface.clear();
      surface.undone = [];
    }
  }

  function enable() {
    build();
    host.classList.add('active');
    setDrawMode(true);
    st.visible = true;
    saveSettings();
    O.emit('annotate:change', { active: true });
  }

  function disable() {
    if (!host) return;
    host.classList.remove('active');
    setDrawMode(false);
    st.visible = false;
    saveSettings();
    O.emit('annotate:change', { active: false });
  }

  function toggle() {
    if (host && host.classList.contains('active')) disable();
    else enable();
  }

  // reveal.js adapter
  function attachReveal(deck) {
    enable();
    setDrawMode(false); // start in click-through mode for presentation
    deck.on('slidechanged', (event) => {
      const key = `reveal-${event.indexh}-${event.indexv}`;
      switchSlide(key);
    });
    // Record current initial slide
    const indices = deck.getIndices();
    switchSlide(`reveal-${indices.h}-${indices.v}`);
  }

  // remark.js adapter
  function attachRemark(slideshow) {
    enable();
    setDrawMode(false);
    slideshow.on('showSlide', (slideIndex) => {
      switchSlide(`remark-${slideIndex}`);
    });
    switchSlide(`remark-${slideshow.getCurrentSlideIndex()}`);
  }

  return {
    enable,
    disable,
    toggle,
    setDrawMode,
    switchSlide,
    attachReveal,
    attachRemark,
    isActive: () => host && host.classList.contains('active')
  };
});
/*
 * Octarine master control panel:
 * A collapsible overlay panel with quick-access badges for:
 *   - Camera: On/Off, shape selection, mirror, full screen, camera picker
 *   - Voice Lifter: On/Off, mute, gain slider, live VU level meter, input device selector
 *   - Whiteboard: Open/Close, theme selection (blackboard, chalkboard, whiteboard, grid, ruled)
 *   - Slide Annotations: Toggle overlay, switch draw vs click-through mode
 *
 * Triggered by:
 *   - Screen corner icon (default top-left, configurable)
 *   - Keyboard shortcut (default ` backtick or Alt+O)
 */
Octarine.define('panel', function (O) {
  'use strict';

  let host = null, root = null, panelEl = null, triggerEl = null;
  let isOpen = false;

  const CSS = `
    :host { position: fixed; z-index: 2147483500; font-family: system-ui, -apple-system, sans-serif; }
    
    /* Corner trigger badge */
    .trigger-btn {
      position: fixed; width: 40px; height: 40px; border-radius: 50%;
      background: rgba(28, 28, 34, 0.85); color: #fff;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.35); cursor: pointer;
      backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.15);
      transition: transform 0.2s, background 0.2s;
    }
    .trigger-btn:hover { transform: scale(1.08); background: #7c5cff; }

    /* Modal / Drawer Panel */
    .panel-backdrop {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45);
      display: none; opacity: 0; transition: opacity 0.25s;
    }
    .panel-window {
      position: fixed; top: 70px; left: 24px; width: 360px; max-width: calc(100vw - 48px);
      background: #1e1e24; color: #f0f0f2; border-radius: 16px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.55); border: 1px solid rgba(255,255,255,0.12);
      display: none; flex-direction: column; overflow: hidden;
      transform: translateY(-8px); opacity: 0; transition: transform 0.25s, opacity 0.25s;
    }
    :host(.open) .panel-backdrop { display: block; opacity: 1; }
    :host(.open) .panel-window { display: flex; transform: translateY(0); opacity: 1; }

    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.08);
      background: #18181e;
    }
    .panel-title { font-weight: 600; font-size: 15px; display: flex; align-items: center; gap: 8px; }
    .panel-body { padding: 16px; display: flex; flex-direction: column; gap: 16px; max-height: 80vh; overflow-y: auto; }

    /* Feature Cards */
    .feature-card {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 10px;
    }
    .feature-head { display: flex; align-items: center; justify-content: space-between; }
    .feature-name { font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; }
    .feature-row { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #aaa; gap: 8px; }

    /* Level Meter */
    .vu-meter {
      height: 8px; width: 100%; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;
    }
    .vu-bar {
      height: 100%; width: 0%; background: #69f0ae; transition: width 0.08s ease-out;
    }
    .vu-bar.hot { background: #ff5252; }

    /* Controls inputs */
    select, input[type=range] {
      background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
      color: #eee; border-radius: 6px; padding: 4px 8px; font-size: 12px; outline: none;
    }
    select { cursor: pointer; }
    select option { background: #1e1e24; color: #fff; }
    input[type=range] { flex: 1; accent-color: #7c5cff; }

    .switch-btn {
      padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500;
      background: rgba(255,255,255,0.08); color: #ddd; border: 1px solid rgba(255,255,255,0.15);
      cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
    }
    .switch-btn.on { background: #7c5cff; color: #fff; border-color: #9275ff; }
  `;

  function init(opts) {
    if (host) return;
    const created = O.createHost('control-panel', CSS);
    host = created.host;
    root = created.root;

    buildDOM(opts);
    setupEvents();
  }

  function buildDOM(opts) {
    // Backdrop
    const backdrop = O.h('div', {
      class: 'panel-backdrop',
      onclick: () => close()
    });

    // Panel Window
    panelEl = O.h('div', { class: 'panel-window o-ui' });

    // Header
    const head = O.h('div', { class: 'panel-header' },
      O.h('div', { class: 'panel-title' },
        O.icon('logo', 20),
        'Octarine Controls'
      ),
      O.h('button', {
        class: 'o-btn icon',
        title: 'Close Panel',
        html: O.icon('close', 18),
        onclick: () => close()
      })
    );

    // Body
    const body = O.h('div', { class: 'panel-body' },
      buildCameraCard(),
      buildVoiceCard(),
      buildBoardCard(),
      buildAnnotateCard()
    );

    panelEl.append(head, body);

    // Trigger button
    triggerEl = O.h('button', {
      class: 'trigger-btn',
      title: `Octarine Classroom Controls (${O.options.panelKey || '`'})`,
      html: O.icon('logo', 22),
      onclick: () => toggle()
    });

    // Positioning of trigger button
    const pos = (opts && opts.trigger) || 'top-left';
    if (pos === 'top-left') {
      triggerEl.style.top = '16px';
      triggerEl.style.left = '16px';
    } else if (pos === 'bottom-left') {
      triggerEl.style.bottom = '16px';
      triggerEl.style.left = '16px';
      panelEl.style.top = 'auto';
      panelEl.style.bottom = '70px';
    } else if (pos === 'top-right') {
      triggerEl.style.top = '16px';
      triggerEl.style.right = '16px';
      panelEl.style.left = 'auto';
      panelEl.style.right = '24px';
    } else if (pos === false) {
      triggerEl.style.display = 'none';
    }

    root.append(backdrop, panelEl, triggerEl);
  }

  function buildCameraCard() {
    const card = O.h('div', { class: 'feature-card' });
    const toggleBtn = O.h('button', {
      class: 'switch-btn',
      html: O.icon('camera', 16) + ' <span>Enable</span>',
      onclick: () => {
        O.camera.toggle();
        updateCameraUI();
      }
    });

    const head = O.h('div', { class: 'feature-head' },
      O.h('span', { class: 'feature-name' }, O.icon('camera', 18), 'Live Camera View'),
      toggleBtn
    );

    const shapeSelect = O.h('select', {
      onchange: (e) => O.camera.setShape(e.target.value)
    },
      O.h('option', { value: 'circle' }, 'Circle'),
      O.h('option', { value: 'rounded' }, 'Rounded Square'),
      O.h('option', { value: 'rect' }, '16:9 Widescreen')
    );

    const mirrorCheck = O.h('input', {
      type: 'checkbox',
      checked: true,
      onchange: (e) => O.camera.setMirror(e.target.checked)
    });

    const fullBtn = O.h('button', {
      class: 'o-btn',
      html: O.icon('maximize', 14) + ' Fullview',
      onclick: () => O.camera.toggleFull()
    });

    const deviceSelect = O.h('select', {
      style: { width: '100%' },
      onchange: (e) => O.camera.setDevice(e.target.value)
    }, O.h('option', { value: '' }, 'Default Camera'));

    const row1 = O.h('div', { class: 'feature-row' },
      O.h('span', {}, 'Shape:'), shapeSelect,
      O.h('label', { style: 'display:flex;align-items:center;gap:4px;cursor:pointer;' }, mirrorCheck, ' Mirror'),
      fullBtn
    );

    const row2 = O.h('div', { class: 'feature-row' },
      deviceSelect
    );

    card.append(head, row1, row2);

    function updateCameraUI() {
      const state = O.camera.state();
      toggleBtn.classList.toggle('on', state.enabled);
      toggleBtn.querySelector('span').textContent = state.enabled ? 'On' : 'Enable';
      shapeSelect.value = state.shape;
      mirrorCheck.checked = state.mirror;
    }

    O.on('camera:change', updateCameraUI);

    // Populate camera devices when opening panel
    O.on('panel:open', async () => {
      const list = await O.camera.devices();
      if (list.length > 0) {
        deviceSelect.innerHTML = '';
        list.forEach((d) => {
          deviceSelect.appendChild(O.h('option', { value: d.id }, d.label));
        });
        deviceSelect.value = O.camera.state().deviceId;
      }
    });

    return card;
  }

  function buildVoiceCard() {
    const card = O.h('div', { class: 'feature-card' });
    const toggleBtn = O.h('button', {
      class: 'switch-btn',
      html: O.icon('mic', 16) + ' <span>Enable</span>',
      onclick: () => {
        O.voice.toggle();
        updateVoiceUI();
      }
    });

    const head = O.h('div', { class: 'feature-head' },
      O.h('span', { class: 'feature-name' }, O.icon('mic', 18), 'Voice Lifter (Mic)'),
      toggleBtn
    );

    const gainSlider = O.h('input', {
      type: 'range', min: '0', max: '2.5', step: '0.05', value: '1.0',
      oninput: (e) => {
        gainVal.textContent = Math.round(e.target.value * 100) + '%';
        O.voice.setGain(e.target.value);
      }
    });
    const gainVal = O.h('span', { style: 'min-width:36px;text-align:right;' }, '100%');

    const muteBtn = O.h('button', {
      class: 'o-btn icon',
      title: 'Mute/Unmute',
      html: O.icon('mic', 16),
      onclick: () => O.voice.toggleMute()
    });

    const vuBar = O.h('div', { class: 'vu-bar' });
    const vuContainer = O.h('div', { class: 'vu-meter' }, vuBar);

    const micSelect = O.h('select', {
      style: { width: '100%' },
      onchange: (e) => O.voice.setDevice(e.target.value)
    }, O.h('option', { value: '' }, 'Default Microphone'));

    const rowGain = O.h('div', { class: 'feature-row' },
      O.h('span', {}, 'Gain:'), gainSlider, gainVal, muteBtn
    );

    const rowMeter = O.h('div', { class: 'feature-row' },
      O.h('span', {}, 'Level:'), vuContainer
    );

    const rowDevice = O.h('div', { class: 'feature-row' },
      micSelect
    );

    card.append(head, rowGain, rowMeter, rowDevice);

    function updateVoiceUI() {
      const state = O.voice.state();
      toggleBtn.classList.toggle('on', state.enabled);
      toggleBtn.querySelector('span').textContent = state.enabled ? 'On' : 'Enable';
      gainSlider.value = state.gain;
      gainVal.textContent = Math.round(state.gain * 100) + '%';
      muteBtn.classList.toggle('active', state.muted);
      muteBtn.innerHTML = O.icon(state.muted ? 'micOff' : 'mic', 16);
    }

    O.on('voice:change', updateVoiceUI);
    O.on('voice:meter', (data) => {
      const pct = Math.round(data.level * 100);
      vuBar.style.width = pct + '%';
      vuBar.classList.toggle('hot', pct > 85);
    });

    O.on('panel:open', async () => {
      const { inputs } = await O.voice.devices();
      if (inputs.length > 0) {
        micSelect.innerHTML = '';
        inputs.forEach((d) => {
          micSelect.appendChild(O.h('option', { value: d.id }, d.label));
        });
        micSelect.value = O.voice.state().deviceId;
      }
    });

    return card;
  }

  function buildBoardCard() {
    const card = O.h('div', { class: 'feature-card' });
    const toggleBtn = O.h('button', {
      class: 'switch-btn',
      html: O.icon('board', 16) + ' <span>Open</span>',
      onclick: () => {
        O.board.toggle();
        close();
      }
    });

    const head = O.h('div', { class: 'feature-head' },
      O.h('span', { class: 'feature-name' }, O.icon('board', 18), 'Interactive Whiteboard'),
      toggleBtn
    );

    const themeSelect = O.h('select', {
      onchange: (e) => O.board.applyTheme(e.target.value)
    });
    O.board.BG_THEMES.forEach((t) => {
      themeSelect.appendChild(O.h('option', { value: t.id }, t.name));
    });

    const row = O.h('div', { class: 'feature-row' },
      O.h('span', {}, 'Theme:'), themeSelect,
      O.h('button', {
        class: 'o-btn',
        html: O.icon('download', 14) + ' Export',
        onclick: () => O.board.exportPNG()
      })
    );

    card.append(head, row);
    return card;
  }

  function buildAnnotateCard() {
    const card = O.h('div', { class: 'feature-card' });
    const toggleBtn = O.h('button', {
      class: 'switch-btn',
      html: O.icon('annotate', 16) + ' <span>Overlay</span>',
      onclick: () => {
        O.annotate.toggle();
        toggleBtn.classList.toggle('on', O.annotate.isActive());
        close();
      }
    });

    const head = O.h('div', { class: 'feature-head' },
      O.h('span', { class: 'feature-name' }, O.icon('annotate', 18), 'Slide Annotations'),
      toggleBtn
    );

    const desc = O.h('div', { style: 'font-size:11px;color:#888;line-height:1.3;' },
      'Draw transparent notes on top of the presentation. Automatically remembers strokes per slide.'
    );

    card.append(head, desc);
    return card;
  }

  function setupEvents() {
    // Keyboard shortcut to open/close panel
    O.addKeyHandler((e) => {
      if (e.key === (O.options.panelKey || '`')) {
        toggle();
        return true;
      }
      return false;
    }, 5);
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    host.classList.add('open');
    O.emit('panel:open', {});
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    host.classList.remove('open');
    O.emit('panel:close', {});
  }

  function toggle() {
    if (isOpen) close();
    else open();
  }

  return {
    init,
    open,
    close,
    toggle,
    isOpen: () => isOpen
  };
});
