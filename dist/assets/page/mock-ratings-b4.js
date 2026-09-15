const DATA=[
 {q:'"The dashboards alone changed how we run the floor. Every model, every job, <em class="i">one screen.</em>"',ini:'SL',n:'Systems lead',w:'Logistics group · Malta',s:'COMMAND DASHBOARDS'},
 {q:'"They handed us a machine, not a subscription. Our data has <em class="i">never left the building</em> since."',ini:'CT',n:'CTO',w:'Medical imaging practice · Germany',s:'LOCAL-FIRST SYSTEM'},
 {q:'"Helmsman routed around a model failure at 3am and nobody noticed until the <em class="i">morning report.</em> That sold me."',ini:'OD',n:'Operations director',w:'Fintech · United Kingdom',s:'HELMSMAN ENGINE'},
 {q:'"Commissioning felt like ordering a building, not buying software. Spec, build, <em class="i">handover, done.</em>"',ini:'MP',n:'Managing partner',w:'Advisory firm · Malta',s:'COMMISSIONED BUILD'},
];
const STAR='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2-5.6-3.2-5.6 3.2 1.3-6.2L3 9.5l6.3-.7z"/></svg>';
document.querySelectorAll('[data-stars]').forEach(s=>s.innerHTML=STAR.repeat(5));
const deck=document.getElementById('deck'),prog=document.getElementById('prog');
DATA.forEach(d=>{
  deck.insertAdjacentHTML('beforeend',`<div class="card"><span class="stars">${STAR.repeat(5)}</span><q>${d.q}</q><div class="who"><span class="av">${d.ini}</span><div><b>${d.n}</b><span>${d.w}</span></div></div><div class="sys">${d.s}</div></div>`);
  prog.insertAdjacentHTML('beforeend','<i><span></span></i>');
});
const cards=[...deck.children],ps=[...prog.children],n=DATA.length;let a=0,busy=false;
function lay(){
  cards.forEach((c,i)=>{
    const o=(i-a+n)%n;
    c.style.transform=`translateY(${o*16}px) scale(${1-o*.05})`;
    c.style.opacity=o>2?0:1;
    c.style.zIndex=n-o;
    c.style.pointerEvents=o===0?'auto':'none';
    c.classList.toggle('live',o===0);
  });
  ps.forEach((el,i)=>{el.classList.remove('run','done');if(i<a)el.classList.add('done');if(i===a)el.classList.add('run');});
}
lay();
function deal(){
  if(busy)return;busy=true;
  const front=cards[a];
  front.classList.add('fly');
  setTimeout(()=>{a=(a+1)%n;front.classList.remove('fly');lay();busy=false;},480);
}
cards.forEach(c=>c.onclick=deal);
let t=setInterval(deal,4200);
deck.addEventListener('pointerenter',()=>clearInterval(t));
deck.addEventListener('pointerleave',()=>{clearInterval(t);t=setInterval(deal,4200)});
