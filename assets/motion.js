/* vfempire.com motion module
   Added 2026-09-16. Vanilla. Zero deps. Self-hosted.
   Progressive enhancement: page works with this script absent.
   Respects prefers-reduced-motion.

   Powers:
     - .rv          reveal-on-scroll (already used elsewhere; this file also handles it)
     - .stag        staggered children reveal, one class flip on view
     - .maskrv      mask-clip heading reveal
     - .draw        hairline draw-in accent
     - .h1-settle   variable-weight settle on first paint
     - [data-magnet]         magnetic mouse-follow on interactive elements
     - [data-hero="auto-mate"]   floating-input hero timeline
*/
(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supportsIO = 'IntersectionObserver' in window;

  // ---------- reveals ----------
  if (supportsIO) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('on');
          revObs.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    document.querySelectorAll('.rv, .stag, .maskrv, .draw').forEach(function (el) {
      revObs.observe(el);
    });
  } else {
    document.querySelectorAll('.rv, .stag, .maskrv, .draw').forEach(function (el) {
      el.classList.add('on');
    });
  }

  // ---------- variable-weight settle ----------
  document.querySelectorAll('.h1-settle').forEach(function (el) {
    requestAnimationFrame(function () {
      setTimeout(function () { el.classList.add('on'); }, 80);
    });
  });

  // ---------- magnetic ----------
  if (!reduce && matchMedia('(hover: hover)').matches) {
    var maxPull = 5; // px, subtle
    document.querySelectorAll('[data-magnet]').forEach(function (el) {
      var raf = 0;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        var tx = Math.max(-1, Math.min(1, dx)) * maxPull;
        var ty = Math.max(-1, Math.min(1, dy)) * maxPull;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
        });
      });
      el.addEventListener('mouseleave', function () {
        if (raf) cancelAnimationFrame(raf);
        el.style.transform = '';
      });
    });
  }

  // ---------- hero timelines ----------
  var heroDrivers = {
    'auto-mate': autoMateHero
  };

  var heroObs = supportsIO ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var el = e.target;
      var key = el.getAttribute('data-hero');
      var driver = heroDrivers[key];
      if (!driver) return;
      if (e.isIntersecting) driver.play(el);
      else driver.pause(el);
    });
  }, { threshold: 0.35 }) : null;

  document.querySelectorAll('[data-hero]').forEach(function (el) {
    if (heroObs) heroObs.observe(el);
    else {
      var driver = heroDrivers[el.getAttribute('data-hero')];
      if (driver) driver.play(el);
    }
  });

  // ---------- Auto-Mate hero timeline ----------
  function autoMateHero() {
    var running = null;
    return {
      play: function (root) {
        if (running) return;
        var q = function (s) { return root.querySelector(s); };
        var text = q('.lh-text');
        var caret = q('.lh-caret');
        var input = q('.lh-input');
        var chips = q('.lh-chips');
        var plan = q('.lh-plan');
        var rows = root.querySelectorAll('.lh-plan .lh-row');
        var done = q('.lh-done');
        var msg = 'rename every .png in Downloads to lowercase';

        var timers = [];
        var t = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
        var reset = function () {
          if (text) text.textContent = '';
          [input, chips, plan, done].forEach(function (el) { if (el) el.classList.remove('on'); });
          if (plan) plan.classList.remove('pressed');
          rows.forEach(function (r) { r.classList.remove('done'); });
        };

        var typeMs = reduce ? 0 : 32;
        var loop = function () {
          reset();
          if (input) t(200, function () { input.classList.add('on'); });
          if (text) {
            for (var i = 0; i < msg.length; i++) (function (i) {
              t(800 + i * typeMs, function () {
                text.textContent = msg.slice(0, i + 1);
              });
            })(i);
          }
          var afterType = 800 + msg.length * typeMs;
          if (chips) t(afterType + 420, function () { chips.classList.add('on'); });
          if (plan) t(afterType + 900, function () { plan.classList.add('on'); });
          rows.forEach(function (r, i) {
            t(afterType + 1300 + i * 220, function () { r.classList.remove('done'); });
          });
          t(afterType + 2400, function () { if (plan) plan.classList.add('pressed'); });
          rows.forEach(function (r, i) {
            t(afterType + 2600 + i * 160, function () { r.classList.add('done'); });
          });
          t(afterType + 3400, function () { if (done) done.classList.add('on'); });
          var loopMs = afterType + 5600;
          running = setTimeout(function () {
            timers.forEach(clearTimeout);
            timers = [];
            loop();
          }, loopMs);
        };

        loop();
        root._amStop = function () {
          if (running) { clearTimeout(running); running = null; }
          timers.forEach(clearTimeout);
          timers = [];
        };
      },
      pause: function (root) {
        if (root._amStop) { root._amStop(); root._amStop = null; }
        running = null;
      }
    };
  }
}());
