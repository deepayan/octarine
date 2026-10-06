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
