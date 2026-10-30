/*!
 * Octarine — a presentation layer for classrooms.
 * Camera overlay, voice lifter and whiteboard, running entirely in the browser.
 * https://github.com/deepayan/octarine
 *
 * This file is the orchestrator: it defines the module registry, loader,
 * default settings, and Octarine.init().
 */
(function () {
  'use strict';
  const O = window.Octarine;
  if (!O) {
    console.error('Octarine: core.js must be loaded before octarine.js');
    return;
  }
  if (O.initialized) return;

  const script = document.currentScript;
  const BASE = (script && script.src) ? script.src.replace(/[^/?#]*([?#].*)?$/, '') : (O.base || '');
  O.base = BASE;

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

  const isLoaded = (name) => (name === 'freehand' ? !!window.PerfectFreehand : !!O[name]);

  O.load = async function () {
    for (const [name, file] of MODULES) {
      if (O.options && O.options[name] === false) continue;
      if (!isLoaded(name)) await O.loadScript(BASE + file);
    }
  };

  const domReady = () => new Promise((resolve) => {
    if (document.readyState !== 'loading') resolve();
    else document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
  });

  const DEFAULTS = {
    trigger: 'top-left',  // corner for the control-panel button, or false to hide it
    panel: true,          // whether to initialize the control panel (set false for standalone board/camera)
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
        O.initialized = true;
        if (O.camera && O.panel && O.options.panel !== false) {
          O.camera.setStandalone(false);
        }
        if (O.panel && O.options.panel !== false) O.panel.init(O.options);
        O.emit('ready', O);
        return O;
      });
    } else {
      Object.assign(O.options, opts);
    }
    return initPromise.then(() => {
      if (opts.reveal && O.annotate) O.annotate.attachReveal(opts.reveal);
      if (opts.remark && O.annotate) O.annotate.attachRemark(opts.remark);
      if (opts.board && O.board) O.board.show(typeof opts.board === 'object' ? opts.board : undefined);
      if (opts.camera && O.camera) O.camera.enable();
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
