/*!
 * Adapted from madebywild/konterball src/javascripts/app.js and
 * src/stylesheets/base/_layout.scss, revision
 * 1b1a54aec27f36c4337f4206eb35938f530e847a.
 * MIT Copyright (c) 2015 Dan Tello; full notice /licenses/konterball-MIT.txt.
 * Original 1s Power4.easeInOut panels, .1s stagger; Web Animations replaces
 * TweenMax. Native dialogs and reduced-motion handling are new adaptations.
 */
const DURATION = 1000;
const STAGGER = 100;
const EASING = 'cubic-bezier(.77,0,.175,1)';

export function createScreenTransitions() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pending = new Set();
  function wipe(parent = document.body) {
    if (reduced.matches) return;
    const layer = document.createElement('div');
    layer.className = 'kb-wipe'; layer.setAttribute('aria-hidden', 'true');
    const animations = ['green', 'blue', 'pink'].map((color, index) => {
      const panel = document.createElement('div');
      panel.className = `transition-color-screen ${color}`;
      layer.append(panel);
      return panel.animate([
        { transform: 'translateX(-100%)' },
        { transform: 'translateX(0)', offset: .5 },
        { transform: 'translateX(100%)' },
      ], { duration: DURATION * 2, delay: index * STAGGER, easing: EASING, fill: 'both' });
    });
    parent.append(layer); pending.add(layer);
    Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      layer.remove(); pending.delete(layer);
    });
    return () => animations.forEach(animation => animation.cancel());
  }
  function open(dialog) {
    if (dialog.open) return;
    document.querySelectorAll('dialog[open]').forEach(other => other.close());
    dialog.showModal();
    if (reduced.matches) return;
    // A dialog is in the browser top layer, so its panels belong inside it.
    const stopWipe = wipe(dialog);
    const content = dialog.querySelector('.kb-dialog-content');
    const entrance = content?.animate([
      { transform: 'translateX(-110vw)' },
      { transform: 'translateX(0)' },
    ], { duration: DURATION, delay: STAGGER * 3, easing: EASING, fill: 'backwards' });
    dialog.addEventListener('close', () => { stopWipe?.(); entrance?.cancel(); }, { once: true });
  }
  return {
    wipe, open,
    dispose() { for (const layer of pending) layer.remove(); pending.clear(); },
  };
}
