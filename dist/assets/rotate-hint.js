// vfempire.com: one-time landscape hint on small portrait touch screens.
(function(){
  try{
    if (sessionStorage.getItem('vf_rot')) return;
    var mm = window.matchMedia('(orientation: portrait)');
    var touch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!mm.matches || !touch || Math.min(screen.width, screen.height) > 820) return;
    sessionStorage.setItem('vf_rot', '1');
    var el = document.createElement('div');
    el.id = 'rothint';
    el.setAttribute('role', 'status');
    el.innerHTML = '<div class="rh"><canvas aria-hidden="true"></canvas><div class="rt">Rotate<b>landscape for the full experience</b></div></div>';
    document.body.appendChild(el);
    var cv = el.querySelector('canvas');
    var g = cv.getContext('2d');
    var S = Math.min(window.innerWidth * 0.7, 320);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(S * dpr); cv.height = Math.round(S * dpr);
    g.scale(dpr, dpr);
    var C = S / 2, N = 380, P = [], TAU = Math.PI * 2;
    var PW = S * 0.36, PH = S * 0.66, EXP = 0.32;
    function sgn(v){ return v < 0 ? -1 : 1; }
    for (var i = 0; i < N; i++){
      var t = (i / N) * TAU;
      var co = Math.cos(t), si = Math.sin(t);
      P.push({ hx: (PW / 2) * sgn(co) * Math.pow(Math.abs(co), EXP),
        hy: (PH / 2) * sgn(si) * Math.pow(Math.abs(si), EXP),
        x: (Math.random() - 0.5) * S * 1.5, y: (Math.random() - 0.5) * S * 1.5,
        vx: 0, vy: 0, ph: Math.random() * TAU, sp: 2.2 + Math.random() * 2.6,
        r: 0.8 + Math.random() * 0.9, ice: Math.random() < 0.14 });
    }
    var ang = 0, av = 0, t0 = 0, gone = false;
    var RMH = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function targetAt(ms){
      if (ms < 1150) return 0;
      if (ms < 2850) return Math.PI / 2;
      if (ms < 4350) return 0;
      return Math.PI / 2;
    }
    function hide(){
      if (gone) return; gone = true;
      el.classList.remove('show');
      setTimeout(function(){ el.remove(); }, 750);
    }
    function frame(now){
      if (gone) return;
      if (!t0) t0 = now;
      var ms = now - t0;
      av = (av + (targetAt(ms) - ang) * 0.045) * 0.86;
      ang += av;
      var ca = Math.cos(ang), sa = Math.sin(ang);
      g.clearRect(0, 0, S, S);
      for (var i = 0; i < P.length; i++){
        var p = P[i];
        var tx = C + p.hx * ca - p.hy * sa;
        var ty = C + p.hx * sa + p.hy * ca;
        p.vx = (p.vx + (tx - p.x) * 0.09) * 0.8;
        p.vy = (p.vy + (ty - p.y) * 0.09) * 0.8;
        p.x += p.vx; p.y += p.vy;
        var a = 0.28 + 0.62 * (0.5 + 0.5 * Math.sin(now * 0.001 * p.sp + p.ph));
        g.fillStyle = p.ice ? 'rgba(29,29,31,' + (a * 0.85).toFixed(3) + ')' : 'rgba(31,111,242,' + a.toFixed(3) + ')';
        g.beginPath();
        g.arc(p.x, p.y, p.r, 0, TAU);
        g.fill();
      }
      if (ms > 6400) { hide(); return; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('show'); }); });
    if (RMH){
      var ca2 = Math.cos(Math.PI / 2), sa2 = Math.sin(Math.PI / 2);
      for (var k = 0; k < P.length; k++){
        var q = P[k];
        g.fillStyle = q.ice ? 'rgba(29,29,31,0.7)' : 'rgba(31,111,242,0.8)';
        g.beginPath();
        g.arc(C + q.hx * ca2 - q.hy * sa2, C + q.hx * sa2 + q.hy * ca2, q.r, 0, TAU);
        g.fill();
      }
      setTimeout(hide, 3800);
    } else {
      requestAnimationFrame(frame);
    }
    if (mm.addEventListener) mm.addEventListener('change', function(e){ if (!e.matches) hide(); });
    el.addEventListener('click', hide);
  }catch(e){}
})();
