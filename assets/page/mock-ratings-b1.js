const STAR='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2-5.6-3.2-5.6 3.2 1.3-6.2L3 9.5l6.3-.7z"/></svg>';
document.querySelectorAll('[data-stars]').forEach(s=>s.innerHTML=STAR.repeat(5));
document.querySelectorAll('.card').forEach(c=>{
  c.addEventListener('pointermove',e=>{
    const r=c.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    c.style.transform=`rotateY(${x*7}deg) rotateX(${y*-7}deg) translateY(-4px)`;
    c.style.transition='box-shadow .45s ease';
  });
  c.addEventListener('pointerleave',()=>{
    c.style.transition='transform .6s cubic-bezier(.22,1,.36,1), box-shadow .45s ease';
    c.style.transform='';
  });
});
