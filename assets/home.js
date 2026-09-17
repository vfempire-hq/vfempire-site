// vfempire.com homepage script: hero image, sibling stagger.
(() => {
  const hero = document.getElementById('heroimg');
  if (hero) {
    const ok = () => document.getElementById('corewrap').classList.add('hasimg');
    if (hero.complete && hero.naturalWidth) ok(); else { hero.addEventListener('load', ok); hero.addEventListener('error', () => hero.remove()); }
  }
})();

// stagger siblings
document.querySelectorAll('.bento,.prods,.claims').forEach(g=>{
  [...g.children].forEach((c,i)=>c.style.transitionDelay = (i*90)+'ms');
});
