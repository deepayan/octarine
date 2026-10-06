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
      visibility: false,
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
      style: { cursor: 'move', display: 'flex', alignItems: 'center', opacity: '0.6' }
    }, O.icon('grip', 16));
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
        onclick: () => setTool(t.id)
      }, O.icon(t.icon, 18));
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
      O.h('button', { class: 'o-btn icon', title: 'Undo (Ctrl+Z)', onclick: () => surface.undo() }, O.icon('undo', 18)),
      O.h('button', { class: 'o-btn icon', title: 'Redo (Ctrl+Y)', onclick: () => surface.redo() }, O.icon('redo', 18)),
      O.h('button', { class: 'o-btn icon', title: 'Clear Page', onclick: () => {
        if (confirm('Clear current whiteboard page?')) surface.clear();
      }}, O.icon('trash', 18))
    );

    // Multipage navigation
    pageIndicator = O.h('span', { style: { minWidth: '40px', textAlign: 'center' } }, '1 / 1');
    const grpPages = O.h('div', { class: 'toolbar-grp page-nav' },
      O.h('button', { class: 'o-btn icon', title: 'Previous Page', onclick: () => prevPage() }, O.icon('left', 18)),
      pageIndicator,
      O.h('button', { class: 'o-btn icon', title: 'Next Page', onclick: () => nextPage() }, O.icon('right', 18)),
      O.h('button', { class: 'o-btn icon', title: 'Add New Page', onclick: () => addPage() }, O.icon('plus', 18))
    );

    // Export options & Close
    const grpExport = O.h('div', { class: 'toolbar-grp' },
      O.h('button', { class: 'o-btn icon', title: 'Export PNG / SVG', onclick: () => showExportMenu() }, O.icon('download', 18)),
      O.h('button', { class: 'o-btn icon', title: 'Close Board (Esc)', onclick: () => hide() }, O.icon('close', 18))
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
    st.visibility = true;
    saveState();
    O.emit('board:change', { visibility: true });
  }

  function hide() {
    if (!host) return;
    host.style.display = 'none';
    st.visibility = false;
    saveState();
    O.emit('board:change', { visibility: false });
  }

  function toggle() {
    if (st.visibility) hide();
    else show();
  }

  // Keyboard shortcut integration for whiteboard
  O.addKeyHandler((e) => {
    if (!st.visibility) return false;
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
    isVisible: () => st.visibility,
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
