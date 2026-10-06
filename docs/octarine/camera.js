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
