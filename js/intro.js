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
    }, 850);
  }

  function reveal() {
    if (finished) return;
    if (window.__phoenixDust && window.__phoenixDust.burst) {
      window.__phoenixDust.burst();
    }
    if (video) video.classList.add('is-hidden');
    // Das scharfe Logo blendet erst ein, nachdem sich die Partikel zur
    // Phoenix-Silhouette geformt haben (siehe burst()-Timing in main.js).
    setTimeout(function () {
      if (logo) logo.classList.add('is-visible');
    }, 1450);
    setTimeout(finish, 2900);
  }

  if (video) {
    video.addEventListener('timeupdate', function () {
      if (video.duration && video.currentTime >= video.duration - 0.4) {
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

  // Safety net: never trap a visitor behind the intro.
  setTimeout(finish, 4000 + 2900);
})();
