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
