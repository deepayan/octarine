# Octarine – Webcam Overlay Bookmarklet

Overlay your webcam camera feed directly on **any webpage** — perfect for presentations, screen recordings, live teaching, streaming, or just having fun.

**No extension installation needed** — just a simple bookmarklet.

https://github.com/deepayan/octarine

## Features

- Circular or rounded-square floating webcam window
- Drag to move anywhere on the screen
- Resize by dragging the bottom-right handle
- Close button to stop camera and remove overlay
- Properly stops the camera (light turns off) when closed or page changes
- Works on almost any HTTPS website

## Quick Start – Create the Bookmarklet (30 seconds)

1. **Open your browser bookmarks**  
   Right-click the bookmarks bar → **Add page** (or **New bookmark**)

2. **Name it** something memorable  
   Examples: `Octarine Cam` • `Webcam Overlay` • `Camera PiP`

3. **Paste the code from .js fle** into the **URL** field (copy the entire line that looks like below):

	   javascript:(function(){... ... ...})();

4. **Save the bookmark**
   Test it
   Go to any HTTPS website (e.g. https://wikipedia.org, https://github.com, https://youtube.com)
   Click the bookmark you just created
   Allow camera access when prompted
   → You should see your webcam in a floating rounded-square window


**Want to customize or improve it?**
   You can keep the JavaScript in a separate file for easier editing.
   Steps to maintain the code in a .js file

      Create a file called octarine-bookmarklet.js in this repo
      Paste the code inside the (function(){ ... })(); part (everything except the javascript: prefix)
      When you want to update the bookmarklet:
      Open octarine-bookmarklet.js