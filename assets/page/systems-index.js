// Sector and status filters. Without JS every tile stays visible.
(() => {
  const sel = { sector: 'all', status: 'all' };
  const tiles = Array.from(document.querySelectorAll('#pipe .pp'));
  const count = document.getElementById('count');
  const apply = () => {
    let n = 0;
    tiles.forEach(t => {
      const show = (sel.sector === 'all' || t.dataset.sector === sel.sector) && (sel.status === 'all' || t.dataset.status === sel.status);
      t.hidden = !show; if (show) n++;
    });
    count.textContent = n === tiles.length ? 'Showing all ' + n + ' systems.' : 'Showing ' + n + ' of ' + tiles.length + ' systems.';
  };
  document.querySelectorAll('#filters button').forEach(b => {
    b.addEventListener('click', () => {
      sel[b.dataset.f] = b.dataset.v;
      document.querySelectorAll('#filters button[data-f="' + b.dataset.f + '"]').forEach(o => o.setAttribute('aria-pressed', o === b ? 'true' : 'false'));
      apply();
    });
  });
  apply();
})();
