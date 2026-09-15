// vfempire.com homepage script: hero image, sibling stagger, ratings coverflow.
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

// ratings coverflow
(()=>{
const DATA=[
 {q:'"The dashboards alone changed how we run the floor. Every model, every job, <em class="i">one screen.</em>"',ini:'SL',n:'Systems lead',w:'Logistics group · Malta',s:'COMMAND DASHBOARDS'},
 {q:'"They handed us a machine. Our data has <em class="i">never left the building</em> since."',ini:'CT',n:'CTO',w:'Medical imaging practice · Germany',s:'LOCAL-FIRST SYSTEM'},
 {q:'"Helmsman routed around a model failure at 3am and nobody noticed until the <em class="i">morning report.</em> That sold me."',ini:'OD',n:'Operations director',w:'Fintech · United Kingdom',s:'HELMSMAN ENGINE'},
 {q:'"Commissioning felt like ordering a building. Spec, build, <em class="i">handover, done.</em>"',ini:'MP',n:'Managing partner',w:'Advisory firm · Malta',s:'COMMISSIONED BUILD'},
 {q:'"The model swapped twice since launch. The harness <em class="i">never blinked.</em>"',ini:'PO',n:'Platform owner',w:'Logistics · Germany',s:'HARNESS CORE'},
];
const STAR='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2-5.6-3.2-5.6 3.2 1.3-6.2L3 9.5l6.3-.7z"/></svg>';
const stage=document.getElementById('rtStage'),dots=document.getElementById('rtDots');
DATA.forEach(d=>{
  stage.insertAdjacentHTML('beforeend',`<div class="rt-card"><span class="rt-stars">${STAR.repeat(5)}</span><q>${d.q}</q><div class="rt-who"><span class="rt-av">${d.ini}</span><div><b>${d.n}</b><span>${d.w}</span></div></div><div class="rt-sys">${d.s}</div></div>`);
  dots.insertAdjacentHTML('beforeend','<i></i>');
});
const cards=[...stage.children],ds=[...dots.children],n=DATA.length;let a=0;
function lay(){
  cards.forEach((c,i)=>{
    let d=i-a; if(d>n/2)d-=n; if(d<-n/2)d+=n;
    const abs=Math.abs(d);
    c.style.transform=`translateX(${d*310}px) translateZ(${-abs*190}px) rotateY(${d*-24}deg)`;
    c.style.opacity=abs>2?0:1-abs*.18;
    c.style.zIndex=10-abs;
    c.style.pointerEvents=abs>2?'none':'auto';
    c.classList.toggle('live',d===0);
  });
  ds.forEach((el,i)=>el.classList.toggle('on',i===a));
}
lay();
const go=d=>{a=(a+d+n)%n;lay();};
cards.forEach((c,i)=>c.onclick=()=>{if(i!==a){a=i;lay();hold()}});
ds.forEach((el,i)=>el.onclick=()=>{a=i;lay();hold()});
let t=setInterval(()=>go(1),4000);
function hold(){clearInterval(t);t=setInterval(()=>go(1),4000)}
stage.addEventListener('pointerenter',()=>clearInterval(t));
stage.addEventListener('pointerleave',()=>hold());
})();
