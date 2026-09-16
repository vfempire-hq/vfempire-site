// vfempire.com house script: consent notice + reveal-on-scroll. Loaded deferred on every page.
(() => {
  const el = document.getElementById('consent');
  if (el) el.remove();
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting && (e.intersectionRatio >= .18 || e.boundingClientRect.height > innerHeight * .6)) {
        e.target.classList.add('on'); io.unobserve(e.target);
        e.target.querySelectorAll('.tr i[data-w]').forEach(i => { i.style.width = i.dataset.w; });
      }
    });
  }, { threshold: [0, .18] });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
})();

// flyout menus: any .nl button[data-m] opens the .fly with that id; #dim closes
(() => {
  const dim = document.getElementById('dim');
  const buttons = document.querySelectorAll('.nl button[data-m]');
  if (!dim || !buttons.length) return;
  let openId = null, closeT = null;
  const openMenu = id => {
    clearTimeout(closeT);
    if (openId && openId !== id) document.getElementById(openId).classList.remove('open');
    document.getElementById(id).classList.add('open');
    dim.classList.add('on'); openId = id;
  };
  const closeAll = () => {
    closeT = setTimeout(() => { if (openId) document.getElementById(openId).classList.remove('open'); dim.classList.remove('on'); openId = null; }, 180);
  };
  buttons.forEach(b => { b.addEventListener('mouseenter', () => openMenu(b.dataset.m)); b.addEventListener('click', () => openMenu(b.dataset.m)); });
  document.querySelectorAll('.fly').forEach(f => { f.addEventListener('mouseenter', () => clearTimeout(closeT)); f.addEventListener('mouseleave', closeAll); });
  const nav = document.querySelector('.nav'); if (nav) nav.addEventListener('mouseleave', closeAll);
  dim.addEventListener('mouseenter', closeAll); dim.addEventListener('click', closeAll);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  document.querySelectorAll('.fly a').forEach(a => a.addEventListener('click', closeAll));
})();

// cookie policy: reset button
(() => {
  const b = document.getElementById('consent-reset');
  if (!b) return;
  b.addEventListener('click', () => { try { localStorage.removeItem('vf-consent'); } catch (e) {} alert('Your cookie choice has been reset. The notice will appear again on your next visit to vfempire.com.'); });
})();
