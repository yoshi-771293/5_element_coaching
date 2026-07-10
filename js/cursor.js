/* ==========================================================================
   Custom cursor glow — eigenständig, auf allen Seiten, ohne GSAP-Abhängigkeit.
   Folgt der Maus mit sanfter Verzögerung (lerp) und kann über die
   CSS-Variable --cursor-glow-rgb eingefärbt werden (z. B. pro Element).
   ========================================================================== */
(function () {
  'use strict';

  var glow = document.getElementById('cursorGlow');
  if (!glow) return;
  if (!window.matchMedia('(hover: hover)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Ohne Bewegung: Glow einfach direkt an den Cursor heften.
    window.addEventListener('mousemove', function (e) {
      document.body.classList.add('has-cursor');
      glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    }, { passive: true });
    return;
  }

  var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  var cx = tx, cy = ty;
  var active = false;

  window.addEventListener('mousemove', function (e) {
    tx = e.clientX;
    ty = e.clientY;
    if (!active) {
      active = true;
      cx = tx; cy = ty;
      document.body.classList.add('has-cursor');
    }
  }, { passive: true });

  (function loop() {
    cx += (tx - cx) * 0.16;
    cy += (ty - cy) * 0.16;
    glow.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
    requestAnimationFrame(loop);
  })();
})();
