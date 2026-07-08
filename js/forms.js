/* ==========================================================================
   Webhook form handler — used by contact/waitlist/booking/gateway1 pages
   ========================================================================== */

(function () {
  'use strict';

  // Placeholder — replace with the real automation webhook URL once it exists
  // (expected this week). While it is '#', no network request is made and the
  // form always shows the success state immediately.
  var WEBHOOK_URL = '#';

  document.querySelectorAll('[data-webhook-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var honeypot = form.querySelector('[data-honeypot]');
      if (honeypot && honeypot.value) return;

      var wrap = form.closest('[data-form-wrap]') || form.parentElement;
      var successEl = wrap.querySelector('[data-form-success]');

      function showSuccess() {
        form.classList.add('is-sent');
        if (successEl) successEl.hidden = false;
      }

      if (WEBHOOK_URL && WEBHOOK_URL !== '#') {
        fetch(WEBHOOK_URL, { method: 'POST', body: new FormData(form) })
          .catch(function () {})
          .then(showSuccess);
      } else {
        showSuccess();
      }
    });
  });
})();
