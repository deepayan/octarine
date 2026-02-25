# octarine

The Octarine Layer overlays a camera input (and eventually a whiteboard) on any webpage, typically a presentation.

## Usage

Typical usage would be to add the camera view to a webpage by adding some javascript and maybe some CSS. This is typically what you want if you are doing this with your own presentation.

See [https://github.com/deepayan/octarine/blob/main/docs/index.html](index.html) for an example.



## Bookmarklet

Another option is to add this as a bookmarklet in your browser. To do this, add a bookmark with the following content:

```javascript
javascript:(function(){
  var l1 = document.createElement('link');
  l1.rel = 'stylesheet';
  l1.type = 'text/css';
  l1.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0';
  l1.media = 'all';
  var l2 = document.createElement('link');
  l2.rel = 'stylesheet';
  l2.type = 'text/css';
  l2.href = 'https://deepayan.github.io/octarine/assets/octarine.css';
  l2.media = 'all';
  var s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = 'https://deepayan.github.io/octarine/assets/octarine.js';
  s.onload = function(){add_video_toggle();};
  document.head.appendChild(l1);
  document.head.appendChild(l2);
  document.head.appendChild(s);
})();
```



