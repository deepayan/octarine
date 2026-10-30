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
