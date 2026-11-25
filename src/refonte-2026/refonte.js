/* KŌMØ Motion — interactions de la refonte (25/11/2026). Aucune dépendance. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lang = root.lang || 'fr';
  var dec = lang === 'en' ? '.' : ',';
  function fmt(n, digits) { return n.toFixed(digits).replace('.', dec); }

  /* En-tête : fond translucide au défilement, texte clair au-dessus des sections sombres. */
  var header = d.querySelector('[data-header]');
  var darkEls = Array.prototype.slice.call(d.querySelectorAll('.k-hero, .k-dark, .k-footer'));
  function headerState() {
    if (!header) return;
    header.classList.toggle('is-solid', window.scrollY > 8);
    var probe = header.offsetHeight / 2, dark = false;
    for (var i = 0; i < darkEls.length; i++) {
      var r = darkEls[i].getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) { dark = true; break; }
    }
    header.classList.toggle('is-dark', dark);
  }

  /* Menu mobile */
  var btn = d.querySelector('[data-menu]'), sheet = d.querySelector('[data-sheet]');
  function setMenu(open) {
    if (!btn || !sheet) return;
    if (open) {
      sheet.hidden = false;
      requestAnimationFrame(function () { root.classList.add('k-menu-open'); });
      var first = sheet.querySelector('a'); if (first) setTimeout(function () { first.focus(); }, 60);
    } else {
      root.classList.remove('k-menu-open');
      setTimeout(function () { if (!root.classList.contains('k-menu-open')) sheet.hidden = true; }, 460);
    }
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (btn) btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  if (sheet) sheet.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('k-menu-open')) { setMenu(false); btn.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 900 && root.classList.contains('k-menu-open')) setMenu(false); });

  /* Déclaration : les mots s'éclairent au fil de la lecture. */
  var statement = d.querySelector('[data-statement]');
  var words = statement ? statement.querySelectorAll('.w') : [];
  function statementState() {
    if (!statement || reduce) return;
    var r = statement.getBoundingClientRect(), vh = window.innerHeight;
    var p = (vh * 0.82 - r.top) / (r.height + vh * 0.3);
    p = Math.max(0, Math.min(1, p));
    var lit = p * words.length * 1.1;
    for (var i = 0; i < words.length; i++) {
      var o = 0.18 + 0.82 * Math.max(0, Math.min(1, lit - i));
      words[i].style.setProperty('--o', o.toFixed(3));
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; headerState(); statementState(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  headerState(); statementState();

  /* Apparitions liées au contenu (frise, trajectoire, côte, photo). */
  var io = 'IntersectionObserver' in window;
  var reveals = d.querySelectorAll('[data-reveal]');
  if (io && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); ro.unobserve(en.target); } });
    }, { threshold: 0.3 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Scène des mesures : le visuel suit le texte lu. */
  var stage = d.querySelector('[data-stage]');
  var panels = d.querySelectorAll('[data-panel]');
  if (stage && panels.length) {
    var vis = stage.querySelectorAll('[data-vis]'), current = 0;
    var show = function (i) {
      if (i === current) return; current = i;
      vis.forEach(function (v, k) { v.classList.toggle('is-on', k === i); });
    };
    if (io) {
      var po = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) show(+en.target.getAttribute('data-panel')); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      panels.forEach(function (p) { po.observe(p); });
    }
  }
  var inline = d.querySelectorAll('[data-vis-inline]');
  if (io && !reduce) {
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-on'); vo.unobserve(en.target); } });
    }, { threshold: 0.35 });
    inline.forEach(function (el) { vo.observe(el); });
  } else {
    inline.forEach(function (el) { el.classList.add('is-on'); });
  }

  /* Hero : entrée orchestrée, puis tracé d'équilibre en direct. */
  var hero = d.querySelector('[data-hero]');
  if (hero) {
    var start = function () { hero.classList.add('is-in'); };
    if (d.fonts && d.fonts.ready) { Promise.race([d.fonts.ready, new Promise(function (r) { setTimeout(r, 450); })]).then(start); } else { setTimeout(start, 60); }
  }
  var cv = d.querySelector('[data-trace]');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1;
    var outT = d.querySelector('[data-r="t"]'), outA = d.querySelector('[data-r="a"]'), outV = d.querySelector('[data-r="v"]');
    var size = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener('resize', function () { size(); draw(1); });
    var gauss = function () { var u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    var x = 0, y = 0, vx = 0, vy = 0, pts = [], RATE = 14, MAX = RATE * 30, MM = 1.6;
    var stepSim = function () {
      vx = vx * 0.86 - x * 0.045 + gauss() * 0.55; vy = vy * 0.86 - y * 0.03 + gauss() * 0.75;
      x += vx * 0.35; y += vy * 0.35;
      pts.push([x, y]); if (pts.length > MAX) pts.shift();
    };
    var map = function (p) {
      var s = W * 0.031, R = W * 0.37, px = p[0] * s, py = p[1] * s, r = Math.hypot(px, py);
      if (r > 0) { var k = R * Math.tanh(r / R) / r; px *= k; py *= k; }
      return [W / 2 + px, H / 2 + py];
    };
    var draw = function (frac) {
      ctx.clearRect(0, 0, W, H);
      if (pts.length < 2) return;
      var n = pts.length, chunk = 12;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 1.35;
      for (var i = 1; i < n; i += chunk) {
        var age = i / n;
        ctx.strokeStyle = 'rgba(203,166,107,' + (0.06 + 0.86 * age * age).toFixed(3) + ')';
        ctx.beginPath();
        var a = map(pts[i - 1]); ctx.moveTo(a[0], a[1]);
        for (var j = i; j < Math.min(n, i + chunk + 1); j++) { var b = map(pts[j]); ctx.lineTo(b[0], b[1]); }
        ctx.stroke();
      }
      var p = map(pts[n - 1]), q = map(pts[n - 2]);
      var hx = q[0] + (p[0] - q[0]) * frac, hy = q[1] + (p[1] - q[1]) * frac;
      var g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 16);
      g.addColorStop(0, 'rgba(232,206,160,.55)'); g.addColorStop(1, 'rgba(232,206,160,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F2E3C6'; ctx.beginPath(); ctx.arc(hx, hy, 3.2, 0, Math.PI * 2); ctx.fill();
    };
    var readout = function (seconds) {
      if (!outT) return;
      var n = pts.length, sum = 0, path = 0;
      for (var i = 0; i < n; i++) { sum += Math.hypot(pts[i][0], pts[i][1]); if (i) path += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); }
      var amp = n ? 2 * sum / n * MM : 0, vel = n > 1 ? path * MM / (n / RATE) : 0;
      outT.textContent = fmt(seconds, 1) + ' s';
      outA.textContent = fmt(amp, 0) + ' mm';
      outV.textContent = fmt(vel, 1) + ' mm/s';
    };
    if (reduce) {
      for (var k = 0; k < MAX; k++) stepSim();
      draw(1); readout(30);
    } else {
      for (var w = 0; w < RATE * 4; w++) stepSim();
      var running = true, visible = true, last = 0, acc = 0, t0 = 0;
      var loop = function (now) {
        if (!running) return;
        if (!last) { last = now; t0 = now; }
        var dt = Math.min(100, now - last); last = now; acc += dt;
        var stepMs = 1000 / RATE;
        while (acc >= stepMs) { stepSim(); acc -= stepMs; }
        draw(acc / stepMs);
        var el = ((now - t0) / 1000) % 30;
        readout(el);
        requestAnimationFrame(loop);
      };
      var resume = function () { if (!running && visible && !d.hidden) { running = true; last = 0; requestAnimationFrame(loop); } };
      var pause = function () { running = false; };
      requestAnimationFrame(loop);
      d.addEventListener('visibilitychange', function () { if (d.hidden) pause(); else resume(); });
      if (io) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting; if (visible) resume(); else pause();
        }).observe(cv);
      }
    }
  }
})();
