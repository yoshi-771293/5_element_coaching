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

  function finish() {
    if (finished) return;
    finished = true;
    sessionStorage.setItem('introSeen', '1');
    document.documentElement.style.overflow = '';
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
    if (logo) logo.classList.add('is-visible');
    setTimeout(finish, 1500);
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
  setTimeout(finish, 4000 + 1500);
})();
