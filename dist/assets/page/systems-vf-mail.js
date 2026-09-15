document.querySelectorAll('[data-copy-btn]').forEach(btn=>{
  btn.addEventListener('click',async()=>{
    const pre = btn.parentElement.querySelector('[data-copy]');
    if(!pre) return;
    const cmd = pre.getAttribute('data-copy');
    try { await navigator.clipboard.writeText(cmd); }
    catch(_) {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = cmd; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    const orig = btn.innerHTML;
    btn.classList.add('done');
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12l4 4 10-10"/></svg>';
    const toast = document.getElementById('copyToast');
    toast.classList.add('show');
    setTimeout(()=>{ btn.classList.remove('done'); btn.innerHTML = orig; }, 1800);
    setTimeout(()=>toast.classList.remove('show'), 2000);
  });
});
