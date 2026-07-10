/* ==========================================================================
   Golden Thread — ein goldener Faden, der sich beim Scrollen durch die
   gesamte Startseite zieht und alle Sektionen verbindet. Er schlängelt sich
   in einem sanften Strom von links nach rechts nach unten, zeichnet sich
   scroll-synchron, trägt einen leuchtenden Kometen-Kopf an der Spitze,
   fließende Lichtpunkte und funkelnde Sparkles.
   ========================================================================== */
(function () {
  'use strict';

  var svg = document.getElementById('goldenThread');
  var main = document.getElementById('main');
  if (!svg || !main || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var line   = svg.querySelector('.thread-line');
  var sparkG = svg.querySelector('.thread-sparkles');
  var moteG  = svg.querySelector('.thread-motes');
  var comet  = svg.querySelector('.thread-comet');

  var SVGNS = 'http://www.w3.org/2000/svg';
  var pathLen = 0;
  var sparkles = [];
  var motes = [];
  var drawn = 0;

  function buildPath() {
    var W = main.clientWidth;
    var H = main.scrollHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    // Sanfte Sinus-Schlängelung: ein Strom, der von links nach rechts pendelt.
    var cx = W * 0.5;
    var amp = Math.min(W * 0.22, 250);
    var wavelength = Math.max(window.innerHeight * 1.45, 640);
    var d = 'M ' + cx.toFixed(1) + ' 0';
    var step = 16;
    for (var y = step; y <= H; y += step) {
      var x = cx + amp * Math.sin((y / wavelength) * Math.PI * 2);
      d += ' L ' + x.toFixed(1) + ' ' + y;
    }
    line.setAttribute('d', d);
    pathLen = line.getTotalLength();
    line.style.strokeDasharray = pathLen;
    line.style.strokeDashoffset = pathLen;

    // Sparkles entlang des Fadens verteilen.
    sparkG.textContent = '';
    sparkles = [];
    var n = Math.max(12, Math.round(H / 340));
    for (var i = 0; i < n; i++) {
      var L = ((i + 0.5) / n) * pathLen + (Math.random() - 0.5) * (pathLen / n) * 0.7;
      L = Math.max(0, Math.min(pathLen, L));
      var pt = line.getPointAtLength(L);
      var c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('cx', pt.x.toFixed(1));
      c.setAttribute('cy', pt.y.toFixed(1));
      c.setAttribute('r', (1.3 + Math.random() * 1.7).toFixed(2));
      c.setAttribute('class', 'thread-spark');
      c.style.setProperty('--tw', (1.6 + Math.random() * 2.4).toFixed(2) + 's');
      c.style.animationDelay = (Math.random() * 2.2).toFixed(2) + 's';
      sparkG.appendChild(c);
      sparkles.push({ el: c, L: L, lit: false });
    }

    // Fließende Lichtpunkte (Strom), die den gezeichneten Faden entlanglaufen.
    if (!motes.length && !reduced) {
      for (var m = 0; m < 5; m++) {
        var mc = document.createElementNS(SVGNS, 'circle');
        mc.setAttribute('r', (1.6 + Math.random()).toFixed(2));
        mc.setAttribute('class', 'thread-mote');
        moteG.appendChild(mc);
        motes.push({ el: mc, phase: m / 5, speed: 0.05 + Math.random() * 0.03 });
      }
    }

    apply(currentProgress);
  }

  var currentProgress = 0;
  function apply(p) {
    currentProgress = p;
    drawn = pathLen * p;
    line.style.strokeDashoffset = (pathLen - drawn);

    if (comet) {
      if (p > 0.003 && p < 0.997 && pathLen) {
        var pt = line.getPointAtLength(drawn);
        comet.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ',' + pt.y.toFixed(1) + ')');
        comet.style.opacity = 1;
      } else {
        comet.style.opacity = 0;
      }
    }

    for (var i = 0; i < sparkles.length; i++) {
      var s = sparkles[i];
      var shouldLit = drawn >= s.L;
      if (shouldLit !== s.lit) {
        s.lit = shouldLit;
        s.el.classList.toggle('is-lit', shouldLit);
      }
    }
  }

  buildPath();

  if (reduced) { apply(1); return; }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.4,
    onUpdate: function (self) { apply(self.progress); },
    onRefresh: buildPath
  });

  // Kontinuierlicher Strom: Lichtpunkte laufen dem gezeichneten Faden nach.
  var last = performance.now();
  (function flow(now) {
    requestAnimationFrame(flow);
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!pathLen || drawn <= 0) {
      for (var i = 0; i < motes.length; i++) motes[i].el.style.opacity = 0;
      return;
    }
    for (var j = 0; j < motes.length; j++) {
      var mo = motes[j];
      mo.phase = (mo.phase + mo.speed * dt) % 1;
      var L = mo.phase * drawn;
      var pt = line.getPointAtLength(L);
      mo.el.setAttribute('cx', pt.x.toFixed(1));
      mo.el.setAttribute('cy', pt.y.toFixed(1));
      // an den Enden aus-/einblenden, damit sie nicht hart auftauchen
      var edge = Math.min(mo.phase, 1 - mo.phase) * 6;
      mo.el.style.opacity = Math.max(0, Math.min(0.9, edge)) * 0.9;
    }
  })(last);

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { buildPath(); ScrollTrigger.refresh(); }, 220);
  });
  window.addEventListener('load', function () {
    setTimeout(function () { buildPath(); ScrollTrigger.refresh(); }, 300);
  });
})();
