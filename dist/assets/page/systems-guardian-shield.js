// Scroll-linked mechanics reveal. IntersectionObserver notes which subsystem
// section is in the middle of the viewport and toggles the corresponding
// SVG ring + counter. Build extracts this to assets/page/ so CSP stays 'self'.
(() => {
  const layers = document.querySelectorAll('[data-mech-layers] .ly');
  const rings = document.querySelectorAll('.mechart .ring');
  const coreGlow = document.querySelector('.mechart .core-glow');
  const counter = document.querySelector('[data-mech-counter]');
  const label = document.querySelector('[data-mech-label]');
  if (!layers.length || !rings.length) return;

  const setActive = (n, labelText) => {
    layers.forEach(l => l.classList.toggle('active', l.dataset.layer === n));
    rings.forEach(r => r.classList.toggle('active', r.dataset.layer === n));
    if (coreGlow) coreGlow.classList.add('active');
    if (counter) counter.textContent = n.padStart(2, '0');
    if (label) label.textContent = labelText;
  };

  // Reduce motion → skip observers, mark everything active
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    layers.forEach(l => l.classList.add('active'));
    rings.forEach(r => r.classList.add('active'));
    if (coreGlow) coreGlow.classList.add('active');
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActive(entry.target.dataset.layer, entry.target.dataset.label || '');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  layers.forEach(l => io.observe(l));
  // Start with the first subsystem highlighted so the page never boots blank
  setActive('1', layers[0].dataset.label || '');
})();
