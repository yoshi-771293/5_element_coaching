/* ==========================================================================
   Opening sequence — flame video -> ember burst -> phoenix emblem -> reveal
   ========================================================================== */

(function () {
  'use strict';

  var intro = document.getElementById('intro');
  if (!intro) return;

  if (sessionStorage.getItem('introSeen')) {
    intro.classList.add('intro--done');
    return;
  }

  var video = document.getElementById('introVideo');
  var logo = document.getElementById('introLogo');
  var skipBtn = document.getElementById('introSkip');
  var finished = false;

  document.documentElement.style.overflow = 'hidden';

  // Die Goldstaub-Canvas lebt normalerweise als fixer Hintergrund hinter
  // <main> — dort wäre sie während des Intros unsichtbar, weil das
  // Intro-Overlay einen undurchsichtigen Hintergrund hat. Für die Dauer
  // des Bursts wird sie in den Intro-Layer verschoben (zwischen Video und
  // Logo), danach an ihren ursprünglichen Platz zurückgesetzt.
  var dustCanvas = document.getElementById('dust');
  var dustHome = dustCanvas ? dustCanvas.parentNode : null;
  var dustHomeNext = dustCanvas ? dustCanvas.nextSibling : null;
  if (dustCanvas && logo) {
    intro.insertBefore(dustCanvas, logo);
  }

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Finale: das Logo fliegt aus der Bildmitte in die obere linke Ecke —
  // exakt auf die Position des Header-Logos — während der Intro-Hintergrund
  // transparent wird und die Seite dahinter erscheint.
  function flyLogoToHeader(done) {
    var headerImg = document.querySelector('.site-header__logo img');
    var lr = logo ? logo.getBoundingClientRect() : null;
    if (!logo || !headerImg || !lr || lr.width < 1 || typeof logo.animate !== 'function') {
      return done();
    }
    var hr = headerImg.getBoundingClientRect();
    var dx = (hr.left + hr.width / 2) - (lr.left + lr.width / 2);
    var dy = (hr.top + hr.height / 2) - (lr.top + lr.height / 2);
    var s = Math.max(0.05, hr.width / lr.width);
    logo.style.transition = 'none';
    var called = false;
    function once() { if (!called) { called = true; done(); } }
    var anim = logo.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      // Zwischenstation leicht über der direkten Linie — das Logo "fliegt"
      // in einem kleinen Bogen statt stur geradeaus.
      { transform: 'translate(' + (dx * 0.45).toFixed(1) + 'px,' + (dy * 0.62 - 36).toFixed(1) + 'px) scale(' + ((1 + s) / 2).toFixed(3) + ')', opacity: 1, offset: 0.55 },
      { transform: 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')', opacity: 0 }
    ], { duration: 950, easing: 'cubic-bezier(0.55, 0, 0.3, 1)', fill: 'forwards' });
    anim.onfinish = once;
    setTimeout(once, 1500); // Fallback, falls onfinish nie feuert
  }

  function finish() {
    if (finished) return;
    finished = true;
    sessionStorage.setItem('introSeen', '1');
    document.documentElement.style.overflow = '';
    if (dustCanvas && dustHome) {
      if (dustHomeNext) {
        dustHome.insertBefore(dustCanvas, dustHomeNext);
      } else {
        dustHome.appendChild(dustCanvas);
      }
    }
    function done() { intro.classList.add('intro--done'); }
    var logoShown = logo && logo.classList.contains('is-visible');
    if (reducedMotion || !logoShown) {
      // Skip/Fallback: schlichtes Ausblenden ohne Flug
      intro.classList.add('is-leaving');
      setTimeout(done, 700);
      return;
    }
    // Hintergrund wird transparent (Seite + Header erscheinen), das Logo
    // bleibt sichtbar und fliegt in die Ecke aufs Header-Logo.
    intro.classList.add('is-flight');
    flyLogoToHeader(done);
  }

  var revealed = false;

  function reveal() {
    if (finished || revealed) return;
    revealed = true;
    // Ember-Burst startet ~2s vor Videoende (≈ Sekunde 4 der Flamme) —
    // die Glut wirbelt chaotisch auf, formt den Phönix und schmilzt weg.
    if (window.__phoenixDust && window.__phoenixDust.burst) {
      window.__phoenixDust.burst();
    }
    // Video läuft bis zu seinem natürlichen Ende weiter und blendet dann aus.
    setTimeout(function () {
      if (video) video.classList.add('is-hidden');
    }, 2000);
    // Das scharfe Logo "poppt" rein, sobald die Silhouette steht (~1,1s,
    // siehe burst()-Timing in main.js) — die Glut schmilzt darüber weg.
    setTimeout(function () {
      if (logo) logo.classList.add('is-visible');
    }, 1250);
    // Logo hält die Mitte, bis die Seite dahinter bereit ist, dann Abflug.
    setTimeout(finish, 3100);
  }

  if (video) {
    video.addEventListener('timeupdate', function () {
      if (video.duration && video.currentTime >= video.duration - 2.0) {
        reveal();
      }
    });
    video.addEventListener('ended', reveal);
    video.addEventListener('error', finish);
    video.play().catch(finish);
  } else {
    reveal();
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', function () {
      reveal();
      finish();
    });
  }

  // Safety net: never trap a visitor behind the intro — ABER er muss die
  // komplette Reveal-Sequenz überdauern (Burst + Logo-Hold + Flug enden bis
  // zu ~3,1s nach dem Video). Aus der echten Videodauer abgeleitet, damit er
  // nur bei einem wirklich hängenden Video feuert — nie mitten im Reveal.
  function armSafetyNet() {
    var secs = (video && video.duration && !isNaN(video.duration)) ? video.duration : 6;
    setTimeout(finish, secs * 1000 + 3600);
  }
  if (video && (!video.duration || isNaN(video.duration))) {
    video.addEventListener('loadedmetadata', armSafetyNet);
  } else {
    armSafetyNet();
  }
  // Absolute letzte Reißleine, falls das Video gar nicht lädt oder hängt.
  setTimeout(finish, 12000);
})();
