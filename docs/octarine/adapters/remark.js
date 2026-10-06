/*
 * Octarine remark.js adapter.
 * Usage:
 *   var slideshow = remark.create();
 *   OctarineRemarkAdapter.attach(slideshow);
 */
window.OctarineRemarkAdapter = {
  attach: function (slideshow, opts) {
    if (!window.Octarine) {
      console.warn('Octarine is not loaded.');
      return;
    }
    window.Octarine.init(Object.assign({
      remark: slideshow,
      trigger: 'top-left'
    }, opts || {}));
  }
};
