/*
 * Octarine reveal.js plugin adapter.
 * Usage:
 *   <script src="path/to/reveal.js"></script>
 *   <script src="path/to/octarine.bundle.js"></script>
 *   <script src="path/to/reveal-adapter.js"></script>
 *   <script>
 *     Reveal.initialize({
 *       plugins: [ OctarineRevealPlugin ]
 *     });
 *   </script>
 */
window.OctarineRevealPlugin = {
  id: 'octarine',
  init: function (deck) {
    if (!window.Octarine) {
      console.warn('Octarine is not loaded.');
      return;
    }
    window.Octarine.init({
      reveal: deck,
      trigger: 'top-left'
    });
  }
};
