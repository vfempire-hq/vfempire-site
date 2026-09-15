/* ===== header solid on scroll ===== */
const hdr=document.getElementById('hdr');
addEventListener('scroll',()=>hdr.classList.toggle('solid',scrollY>10),{passive:true});

/* ===== mega menus ===== */
const dim=document.getElementById('dim');
const btns=[...document.querySelectorAll('.navbtn')];
let openId=null,closeT=null;
function openMega(id){
  clearTimeout(closeT);
  if(openId===id)return;
  closeAll(false);
  openId=id;
  document.getElementById('mega-'+id).classList.add('on');
  btns.find(b=>b.dataset.mega===id).classList.add('on');
  hdr.classList.add('open');dim.classList.add('on');
}
function closeAll(fade=true){
  if(!openId)return;
  document.getElementById('mega-'+openId).classList.remove('on');
  btns.forEach(b=>b.classList.remove('on'));
  openId=null;
  hdr.classList.remove('open');dim.classList.remove('on');
}
btns.forEach(b=>{
  b.addEventListener('mouseenter',()=>openMega(b.dataset.mega));
  b.addEventListener('click',()=>openId===b.dataset.mega?closeAll():openMega(b.dataset.mega));
});
document.querySelectorAll('.mega').forEach(m=>{
  m.addEventListener('mouseenter',()=>clearTimeout(closeT));
  m.addEventListener('mouseleave',()=>{closeT=setTimeout(closeAll,180)});
});
document.getElementById('nav').addEventListener('mouseleave',e=>{closeT=setTimeout(closeAll,220)});
dim.addEventListener('mouseenter',closeAll);
dim.addEventListener('click',closeAll);
addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
document.querySelectorAll('.mega a').forEach(a=>a.addEventListener('click',()=>closeAll()));

/* ===== solutions explore panel ===== */
const SOL=[
 {t:'Autonomous Operations',d:'One human, a fleet of machine intelligence. Estates run builds, watch signals and keep the ledger while you command from a single rail.',img:'assets/ash.png',tags:['Fleet cockpits','Watchtower signals','Task lanes','Device trust']},
 {t:'Creative Production',d:'Industrial image, video and 3D pipelines with quality gates — renders are judged, retopologised and shipped like product.',img:'assets/imgstudio-library.png',tags:['Image compiler','3D learning harness','Video suite','Asset library']},
 {t:'Communications & Records',d:'Counterparty intelligence, honest drafting and litigation-grade bundles. Every letter recorded, every dispatch gated.',img:'assets/newsroom.png',tags:['Herald desk','Matter bundles','SignIT','Dispatch gates']},
 {t:'Property & Hospitality',d:'Leasing, bookings and property operations — run with the partnership’s ground operations on the Baltic coast.',img:'assets/hellstorm-plate.jpg',tags:['Noirda GmbH','Leasing lanes','Booking ops','Invoicing']},
 {t:'Animation & Media',d:'Character pipelines, designer-toy casts and story engines — the partnership’s media arm under Guardian Network.',img:'assets/neo3d-pinklady.png',tags:['Character lock','Cast pipelines','Story engine','Online sales']}
];
const solT=document.getElementById('solTitle'),solD=document.getElementById('solDesc'),solI=document.getElementById('solImg'),solG=document.getElementById('solTags');
function setSol(i){
  const s=SOL[i];
  solT.innerHTML=s.t+' <span class="ar">→</span>';
  solD.textContent=s.d;solI.src=s.img;
  solG.innerHTML=s.tags.map(t=>'<a href="#systems">'+t+'</a>').join('');
  document.querySelectorAll('.solitem').forEach((el,j)=>el.classList.toggle('on',i===j));
}
document.querySelectorAll('.solitem').forEach((el,i)=>{
  el.addEventListener('mouseenter',()=>setSol(i));
  el.addEventListener('click',()=>setSol(i));
});
setSol(0);

/* ===== reveals ===== */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

/* ===== tab showcase ===== */
const CAPS=[
 '<b>Operate</b> — agent shell and fleet state, live',
 '<b>Create</b> — native 3D studio, character-lock pipeline',
 '<b>Communicate</b> — newsroom and records desk, dispatch-gated',
 '<b>Library</b> — 2,637 assets catalogued across the estate'
];
const stageImgs=[...document.querySelectorAll('#stage img')];
document.querySelectorAll('.pill').forEach(p=>p.addEventListener('click',()=>{
  document.querySelectorAll('.pill').forEach(x=>x.classList.remove('on'));p.classList.add('on');
  const i=+p.dataset.tab;
  stageImgs.forEach((im,j)=>im.classList.toggle('on',i===j));
  document.getElementById('stageA').innerHTML=CAPS[i];
}));

/* ===== typer ===== */
const LINES=[
 'commission estate --rooms creation,finance,comms',
 'grade hardware → tier 1 · fleet ready',
 'mount models: local weights + api cargo',
 'watchtower armed · ledger open · rail live',
 'estate handed over. you have command.'
];
const tl=document.getElementById('tline');
let li=0,ci=0,buf=[];
function type(){
  const line=LINES[li];
  if(ci<=line.length){
    tl.innerHTML=buf.join('')+line.slice(0,ci);
    ci++;setTimeout(type,28+Math.random()*40);
  }else{
    buf.push(line+' <span class="ok">✓</span><br><span class="pr">vf›</span> ');
    if(buf.length>3)buf.shift();
    li=(li+1)%LINES.length;ci=0;
    if(li===0)buf=[];
    setTimeout(type,900);
  }
}
type();

/* ===== marquee duplicate ===== */
const strip=document.getElementById('strip');
strip.innerHTML+=strip.innerHTML;

/* ===== faq ===== */
document.querySelectorAll('.faqrow').forEach(r=>{
  const q=r.querySelector('.faqq'),a=r.querySelector('.faqa');
  q.addEventListener('click',()=>{
    const open=r.classList.toggle('open');
    a.style.maxHeight=open?a.scrollHeight+'px':'0';
  });
});

/* ===== particle dome ===== */
const cv=document.getElementById('dome'),cx=cv.getContext('2d');
const R=520,N=900,pts=[];
for(let i=0;i<N;i++){
  const th=Math.random()*Math.PI*2,ph=Math.acos(Math.random()*2-1);
  pts.push({th,ph,tw:Math.random()*Math.PI*2});
}
let rot=0;
function dome(){
  cx.clearRect(0,0,1100,1100);
  rot+=0.0012;
  for(const p of pts){
    const x=R*Math.sin(p.ph)*Math.cos(p.th+rot);
    const y=R*Math.cos(p.ph);
    const z=R*Math.sin(p.ph)*Math.sin(p.th+rot);
    if(z<-60)continue;
    const s=(z+R)/(2*R);
    const a=(.06+s*.5)*(.6+.4*Math.sin(p.tw+rot*22));
    cx.fillStyle='rgba(244,242,238,'+a.toFixed(3)+')';
    const px=550+x,py=550+y*.92;
    cx.fillRect(px,py,1.6+s,1.6+s);
  }
  requestAnimationFrame(dome);
}
dome();
