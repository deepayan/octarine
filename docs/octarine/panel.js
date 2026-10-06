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
        onclick: () => close()
      }, O.icon('close', 18))
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
      title: "Octarine Classroom Controls (${O.options.panelKey || '`'})",
      onclick: () => toggle()
    }, O.icon('logo', 22));

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
      onclick: () => {
        console.log('toggled camera');
        O.camera.toggle();
        updateCameraUI();
      }
    }, O.icon('camera', 16), O.h('span', {}, 'Enable'));

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
      onclick: () => O.camera.toggleFull()
    }, O.icon('maximize', 14), ' Fullview');

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
      onclick: () => {
        O.voice.toggle();
        updateVoiceUI();
      }
    }, O.icon('mic', 16), O.h('span', {}, 'Enable'));

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
      onclick: () => O.voice.toggleMute()
    }, O.icon('mic', 16));

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
      muteBtn.innerHTML = '';
      muteBtn.appendChild(O.icon(state.muted ? 'micOff' : 'mic', 16));
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
      onclick: () => {
        console.log('toggled board [panel.js]');
        O.board.toggle();
        close();
      }
    }, O.icon('board', 16), O.h('span', {}, 'Open'));

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
        onclick: () => O.board.exportPNG()
      }, O.icon('download', 14), ' Export')
    );

    card.append(head, row);
    return card;
  }

  function buildAnnotateCard() {
    const card = O.h('div', { class: 'feature-card' });
    const toggleBtn = O.h('button', {
      class: 'switch-btn',
      onclick: () => {
        console.log('toggled annotation');
        O.annotate.toggle();
        toggleBtn.classList.toggle('on', O.annotate.isActive());
        close();
      }
    }, O.icon('annotate', 16), O.h('span', {}, 'Overlay'));

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
