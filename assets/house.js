// vfempire.com house script: consent notice + reveal-on-scroll. Loaded deferred on every page.
(() => {
  const el = document.getElementById('consent');
  if (el) {
    let seen = null; try { seen = localStorage.getItem('vf-consent'); } catch (e) {}
    if (seen) el.remove();
    else {
      setTimeout(() => el.classList.add('show'), 1400);
      const choose = v => { try { localStorage.setItem('vf-consent', v); } catch (e) {} el.classList.remove('show'); setTimeout(() => el.remove(), 550); };
      document.getElementById('cacc').onclick = () => choose('accepted');
      document.getElementById('cdec').onclick = () => choose('declined');
    }
  }
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting && (e.intersectionRatio >= .18 || e.boundingClientRect.height > innerHeight * .6)) {
        e.target.classList.add('on'); io.unobserve(e.target);
      }
    });
  }, { threshold: [0, .18] });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
})();
