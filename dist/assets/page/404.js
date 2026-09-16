(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.getElementById('intro').style.display='none';
    return;
  }
  var da=document.getElementById('da'),
      db=document.getElementById('db'),
      dc=document.getElementById('dc'),
      notfound=document.getElementById('notfound'),
      iglow=document.getElementById('iglow'),
      dWrap=document.getElementById('digit-wrap'),
      intro=document.getElementById('intro'),
      rps=document.querySelectorAll('.rp');
  function at(fn,ms){setTimeout(fn,ms)}
  at(function(){iglow.classList.add('on')},300);
  at(function(){da.classList.add('show')},620);
  at(function(){db.classList.add('show')},900);
  at(function(){dc.classList.add('show')},1180);
  at(function(){[da,db,dc].forEach(function(d){d.classList.add('glitch')})},2250);
  at(function(){notfound.classList.add('on')},2400);
  at(function(){
    rps.forEach(function(r){r.classList.add('go')});
    dWrap.classList.add('out');
  },3700);
  at(function(){intro.classList.add('gone')},4250);
  at(function(){intro.style.display='none'},4800);
})();
