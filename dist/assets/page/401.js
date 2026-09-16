(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.getElementById('intro').style.display='none';
    return;
  }
  var d4=document.getElementById('d4'),
      d0=document.getElementById('d0'),
      d1=document.getElementById('d1'),
      restricted=document.getElementById('restricted'),
      iglow=document.getElementById('iglow'),
      dWrap=document.getElementById('digit-wrap'),
      intro=document.getElementById('intro'),
      rps=document.querySelectorAll('.rp');
  function at(fn,ms){setTimeout(fn,ms)}
  at(function(){iglow.classList.add('on')},300);
  at(function(){d4.classList.add('show')},620);
  at(function(){d0.classList.add('show')},900);
  at(function(){d1.classList.add('show')},1180);
  at(function(){[d4,d0,d1].forEach(function(d){d.classList.add('glitch')})},2250);
  at(function(){restricted.classList.add('on')},2400);
  at(function(){
    rps.forEach(function(r){r.classList.add('go')});
    dWrap.classList.add('out');
  },3700);
  at(function(){intro.classList.add('gone')},4250);
  at(function(){intro.style.display='none'},4800);
})();
