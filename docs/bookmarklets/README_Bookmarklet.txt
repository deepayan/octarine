# Octarine – Standalone Webcam Overlay Bookmarklet

Overlay your webcam camera feed directly on **any webpage** — perfect for presentations, lecture slides, screen recordings, live teaching, streaming, or video calls.

**No browser extension needed** — just drag and drop a single bookmarklet to your bookmarks bar.

https://github.com/deepayan/octarine

---

## Features

- **Draggable & Resizable**: Drag to reposition anywhere on the screen. Resize with bottom-right corner handle or mouse scroll wheel.
- **Multiple Shapes**: Toggle between **Circle**, **Rounded Square**, and **16:9 Wide Rectangle** (click the shape icon or Shift+Click the camera).
- **Mirror Feed**: Flip camera view horizontally with a single click.
- **Presenter Fullscreen**: Double-click or click the maximize button for near full-screen presenter view. Double-click or press `Escape` to restore.
- **Multiple Cameras**: Automatically detects multiple video inputs (e.g. face webcam vs document camera) with a one-click switcher.
- **Completely Unobtrusive**:
  - No permanent buttons, banners, or toolbars on the host page.
  - Controls on the camera bubble appear only on hover.
  - When the camera is closed, camera hardware properly turns off (light turns off).
  - **Easy Recovery**: Move mouse to the extreme **top-left corner** to reveal the unobtrusive camera button, press **Alt+C**, or click the bookmarklet again.

---

## Quick Start – Install Bookmarklet (30 seconds)

### Method 1: Drag to Bookmarks Bar (Easiest)
Visit the interactive camera page at `https://deepayan.github.io/octarine/camera.html` (or open `docs/camera.html` locally) and drag the **"📹 Octarine Camera"** button directly to your browser's bookmarks bar.

### Method 2: Create Manually
1. Open your browser bookmarks bar (press `Ctrl+Shift+B` or `Cmd+Shift+B`).
2. Right-click the bookmarks bar → **Add page** (or **Add bookmark**).
3. Name it: `Octarine Camera` (or `Webcam Overlay`).
4. In the **URL / Location** field, paste:

```javascript
javascript:(function(){if(window.OctarineCamera){window.OctarineCamera.toggle();return;}const s=document.createElement('script');s.src='https://deepayan.github.io/octarine/octarine/camera.bundle.js';s.onload=function(){if(window.OctarineCamera)window.OctarineCamera.enable();};document.head.appendChild(s);})();
```

5. Click **Save**.

---

## Usage

1. Open any webpage in your browser (e.g. slides, Wikipedia, PDF viewer, docs).
2. Click your **Octarine Camera** bookmark.
3. Allow camera access when prompted by the browser.
4. Your webcam will appear in a floating circular bubble!
5. **Controls on Hover**:
   - `Shape`: Cycle through Circle, Rounded Square, Rectangular view
   - `Flip`: Mirror horizontal orientation
   - `Camera`: Switch camera device (visible if >1 camera connected)
   - `Maximize`: Large presenter view (or double-click)
   - `Close (×)`: Stop webcam and hide
6. **To Turn Back On After Closing**:
   - Move mouse into the **top-left corner** of the window to reveal the camera button.
   - Or press **Alt+C**.
   - Or click your **Octarine Camera** bookmark again.