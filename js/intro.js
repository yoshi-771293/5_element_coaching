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
    intro.classList.add('is-leaving');
    setTimeout(function () {
      intro.classList.add('intro--done');
    }, 650);
  }

  var revealed = false;

  function reveal() {
    if (finished || revealed) return;
    revealed = true;
    // Burst startet, während die Flamme im Video noch sichtbar erlischt —
    // der Phönix wird aus der sterbenden Flamme geboren.
    if (window.__phoenixDust && window.__phoenixDust.burst) {
      window.__phoenixDust.burst();
    }
    // Video läuft weiter und blendet erst verzögert aus, damit Funken und
    // Silhouette über der grau werdenden Flamme erscheinen.
    setTimeout(function () {
      if (video) video.classList.add('is-hidden');
    }, 500);
    // Das scharfe Logo blendet ein, sobald die Glut-Silhouette steht
    // (siehe burst()-Timing in main.js: Form steht nach ~0,9s) — die Glut
    // löst sich danach sichtbar auf, während das scharfe Logo darüber
    // einblendet: die Embers "schmelzen" in das Logo.
    setTimeout(function () {
      if (logo) logo.classList.add('is-visible');
    }, 900);
    setTimeout(finish, 2100);
  }

  if (video) {
    video.addEventListener('timeupdate', function () {
      if (video.duration && video.currentTime >= video.duration - 1.8) {
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
  // komplette Reveal-Sequenz überdauern. Diese endet bis zu ~2,1s NACH dem
  // Video (Logo erscheint erst kurz vor Schluss). Der alte feste Wert von
  // 4800ms feuerte mitten im Ember-Burst des 6s-Flammenvideos und schnitt die
  // Phönix-Enthüllung jedes Mal ab. Jetzt aus der echten Videodauer abgeleitet.
  function armSafetyNet() {
    var secs = (video && video.duration && !isNaN(video.duration)) ? video.duration : 6;
    setTimeout(finish, secs * 1000 + 3000);
  }
  if (video && (!video.duration || isNaN(video.duration))) {
    video.addEventListener('loadedmetadata', armSafetyNet);
  } else {
    armSafetyNet();
  }
  // Absolute letzte Reißleine, falls das Video gar nicht lädt oder hängt.
  setTimeout(finish, 12000);
})();
