# octarine

The Octarine Layer overlays a camera input, live voice lifter, and interactive multipage whiteboard on any webpage or classroom presentation.

Everything runs 100% locally in the browser with no server-side requirements.

## Features

1. **🎙 Live Voice Lifter**:
   - Web Audio pipeline piping microphone input to computer audio output for classroom speech amplification.
   - Low rumble highpass filter (100 Hz cut) and dynamics compressor for feedback prevention.
   - Live VU level meter, mute toggle, and device input selection.

2. **📹 Resizable & Draggable Live Camera Overlay**:
   - Draggable picture-in-picture circle, rounded square, or 16:9 widescreen camera feed.
   - Corner resize handle + scroll-wheel resizing.
   - Shift-click to cycle shapes.
   - Double-click to toggle near-fullscreen mode.
   - Camera tracks turn off cleanly when disabled.

3. **🖍 Multipage Interactive Whiteboard / Blackboard**:
   - Vector SVG stroke model powered by *perfect-freehand* for pressure-sensitive, smooth ink strokes.
   - Tools: Pen, Highlighter, Stroke Eraser, Straight Line, Arrow, Rectangle, Ellipse.
   - Themes: Blackboard, Chalkboard green, Whiteboard, Grid, and Ruled lines.
   - Multipage support (add page, previous, next, delete).
   - Export to PNG, SVG, or JSON; Import JSON sessions; Undo / Redo history.

4. **✨ Presentation Slide Annotations**:
   - Transparent annotation overlay with click-through toggle.
   - Dedicated adapters for **reveal.js** and **remark.js** with automatic per-slide stroke caching.

5. **⚙️ Control Panel**:
   - Discreet floating badge (default top-left) or shortcut key (`` ` `` backtick).

---

## Usage

### In your own presentation / HTML page

Include the single bundled script:

```html
<script src="https://deepayan.github.io/octarine/octarine/octarine.bundle.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    Octarine.init({
      trigger: 'top-left' // or 'top-right', 'bottom-left', or false
    });
  });
</script>
```

### With reveal.js

```html
<script src="path/to/reveal.js"></script>
<script src="https://deepayan.github.io/octarine/octarine/octarine.bundle.js"></script>
<script src="https://deepayan.github.io/octarine/octarine/adapters/reveal.js"></script>
<script>
  Reveal.initialize({
    plugins: [ OctarineRevealPlugin ]
  });
</script>
```

### With remark.js

```html
<script src="path/to/remark.min.js"></script>
<script src="https://deepayan.github.io/octarine/octarine/octarine.bundle.js"></script>
<script src="https://deepayan.github.io/octarine/octarine/adapters/remark.js"></script>
<script>
  var slideshow = remark.create();
  OctarineRemarkAdapter.attach(slideshow);
</script>
```

### Bookmarklet

To inject Octarine into any web presentation, create a bookmark with the following URL:

```javascript
javascript:(function(){
  if(window.Octarine){window.Octarine.panel.toggle();return;}
  var s=document.createElement('script');
  s.src='https://deepayan.github.io/octarine/octarine/octarine.bundle.js';
  s.onload=function(){Octarine.init();};
  document.head.appendChild(s);
})();
```
