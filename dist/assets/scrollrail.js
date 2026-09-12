(function(){
  try{
    var DOT="#1f6ff2", CORE="rgba(255,255,255,.95)", GLOW="rgba(31,111,242,.9)", TRAIL="rgba(31,111,242,";
    var DPR = Math.min(window.devicePixelRatio||1, 1.5);
    var RM = false; try{ RM = matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){}
    var doc = document.documentElement;
    var c = document.createElement("canvas");
    c.id = "slkrail";
    document.body.appendChild(c);
    var ctx = c.getContext("2d");
    if (!ctx) { c.remove(); return; }
    var W = 26, H = window.innerHeight, PAD = 16;
    function scrollable(){ return doc.scrollHeight - window.innerHeight > 60; }
    function size(){
      H = window.innerHeight;
      c.width = W * DPR; c.height = H * DPR;
      c.style.display = scrollable() ? "block" : "none";
      kick();
    }
    function dotY(){
      var max = doc.scrollHeight - window.innerHeight;
      var f = max > 0 ? (window.scrollY || 0) / max : 0;
      if (f < 0) f = 0; if (f > 1) f = 1;
      return PAD + f * (H - PAD * 2);
    }
    var trail = [], lastY = dotY(), raf = null;
    function frame(){
      raf = null;
      var y = dotY();
      if (!RM && Math.abs(y - lastY) > 0.4) {
        var d = y - lastY, steps = Math.ceil(Math.abs(d) / 3);
        if (steps > 60) steps = 60;
        for (var i = 1; i <= steps; i++) trail.push({ y: lastY + d * (i / steps), a: 0.55 });
        if (trail.length > 400) trail.splice(0, trail.length - 400);
      }
      lastY = y;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.scale(DPR, DPR);
      for (var t = trail.length - 1; t >= 0; t--) {
        var p = trail[t];
        p.a -= 0.018;
        if (p.a <= 0) { trail.splice(t, 1); continue; }
        ctx.fillStyle = TRAIL + (p.a * 0.6).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(W / 2, p.y, 1.5, 0, 6.2832); ctx.fill();
      }
      ctx.shadowColor = GLOW; ctx.shadowBlur = 11;
      ctx.fillStyle = DOT;
      ctx.beginPath(); ctx.arc(W / 2, y, 3.1, 0, 6.2832); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = CORE;
      ctx.beginPath(); ctx.arc(W / 2, y, 1.2, 0, 6.2832); ctx.fill();
      if (trail.length) raf = requestAnimationFrame(frame);
    }
    function kick(){ if (!raf) raf = requestAnimationFrame(frame); }
    var drag = false;
    function jump(e){
      var f = (e.clientY - PAD) / (H - PAD * 2);
      if (f < 0) f = 0; if (f > 1) f = 1;
      window.scrollTo(0, f * (doc.scrollHeight - window.innerHeight));
    }
    c.addEventListener("pointerdown", function(e){
      drag = true; c.classList.add("drag");
      try { c.setPointerCapture(e.pointerId); } catch(err){}
      jump(e); e.preventDefault();
    });
    c.addEventListener("pointermove", function(e){ if (drag) jump(e); });
    c.addEventListener("pointerup", function(){ drag = false; c.classList.remove("drag"); });
    c.addEventListener("wheel", function(e){ window.scrollBy(0, e.deltaY); }, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", size);
    size();
  }catch(e){}
})();
