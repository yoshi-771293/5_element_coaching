# Nav + Destination Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every dead-end CTA in the funnel a real destination page, add a minimal logo-only header, and add a footer Kontakt link — without turning the single-path funnel into a standard multi-page nav site.

**Architecture:** Five static HTML documents (`index.html` + four new pages), no build step, sharing `css/style.css`. The four new pages are simple single-screen pages (no scroll journey, no GSAP/Lenis/Three.js) and load a new lightweight `js/forms.js` instead of the heavy `js/main.js` vendor stack. `index.html` keeps its existing `js/main.js`/vendor scripts unchanged except for removing the now-obsolete URL-placeholder block.

**Tech Stack:** Plain HTML/CSS/vanilla JS. No test runner exists in this project (static site, no `package.json`) — verification steps in this plan are manual checks via the `preview_*` browser tools and `curl`, not automated tests. This matches the project's existing no-build-step architecture; introducing a JS test framework here would be scope creep.

---

### Task 1: Header, form, and focus-visible styles

**Files:**
- Modify: `css/style.css` (append at end of file, after line 597)

- [ ] **Step 1: Append the new CSS block**

Add this to the end of `css/style.css`:

```css

/* ---------- Site header (logo-only, no menu) ---------- */
.site-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 40;
  display: flex; justify-content: center;
  padding: 1.6rem 4vw;
  pointer-events: none;
}
.site-header__mark {
  pointer-events: auto;
  font-family: var(--font-display);
  font-size: clamp(0.85rem, 1.3vw, 1.05rem);
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--gold);
  text-decoration: none;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  opacity: 0.88;
  transition: opacity 0.3s ease;
}
.site-header__mark:hover { opacity: 1; }

/* ---------- Simple single-screen pages (contact/waitlist/booking/gateway1) ---------- */
.page {
  min-height: 100vh; min-height: 100svh;
  display: flex; align-items: center; justify-content: center;
  padding: 8rem 4vw 5rem;
}
.page__hero {
  width: min(640px, 92vw);
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 1.8rem;
}
.page__hero .phoenix--center { margin-bottom: 0.4rem; }

/* ---------- Forms ---------- */
.form-wrap { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 1.4rem; }
.form { width: 100%; display: flex; flex-direction: column; gap: 1.3rem; margin-top: 0.6rem; }
.form.is-sent { display: none; }
.form__field { display: flex; flex-direction: column; gap: 0.5rem; text-align: left; }
.form__field label {
  font-family: var(--font-display);
  font-size: 0.85rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--pristine);
  opacity: 0.75;
}
.form__field input,
.form__field textarea {
  font-family: var(--font-body);
  font-size: 1.05rem;
  color: var(--pristine);
  background: rgba(244,243,234,0.04);
  border: 1px solid rgba(216,192,106,0.3);
  padding: 0.85rem 1rem;
  transition: border-color 0.3s ease, background 0.3s ease;
}
.form__field input:focus,
.form__field textarea:focus {
  outline: none;
  border-color: var(--gold);
  background: rgba(244,243,234,0.07);
}
.form__field textarea { resize: vertical; min-height: 120px; }
.form__honeypot { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.form__submit { align-self: center; margin-top: 0.6rem; }
.form__success { font-size: var(--body); color: var(--gold); }

button.btn { appearance: none; -webkit-appearance: none; background: transparent; cursor: pointer; }

/* ---------- Keyboard focus ---------- */
.btn:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 4px;
}
.site-header__mark:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 6px;
}
```

- [ ] **Step 2: Verify the file is well-formed**

Run: `python3 -c "import re; s=open('css/style.css').read(); print(s.count('{'), s.count('}'))"`
Expected: both numbers equal (braces balanced).

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "Add header, single-screen page, and form styles"
```

---

### Task 2: `js/forms.js`

**Files:**
- Create: `js/forms.js`

- [ ] **Step 1: Write the file**

```js
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
```

- [ ] **Step 2: Verify syntax**

Run: `node --check js/forms.js`
Expected: no output (exit code 0). If `node` isn't installed, run `python3 -c "import subprocess,sys" ` is not applicable — instead visually confirm balanced braces: `python3 -c "s=open('js/forms.js').read(); print(s.count('{'), s.count('}'))"` and expect equal counts.

- [ ] **Step 3: Commit**

```bash
git add js/forms.js
git commit -m "Add placeholder webhook form handler"
```

---

### Task 3: `contact.html`

**Files:**
- Create: `contact.html`

- [ ] **Step 1: Write the file**

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kontakt — The World of the Phoenix</title>
<meta name="description" content="Schreib mir — ich melde mich persönlich bei dir zurück.">
<link rel="icon" type="image/png" href="assets/img/phoenix-gold.png">
<link rel="preload" href="assets/fonts/cinzel-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/cormorant-garamond-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<header class="site-header">
  <a href="index.html" class="site-header__mark">Carmen Zion</a>
</header>

<main class="page">
  <section class="page__hero">
    <img src="assets/img/phoenix-gold.png" alt="" class="phoenix phoenix--center">
    <p class="eyebrow">Lass uns sprechen</p>
    <h1 class="headline">Kontakt</h1>
    <p class="body body--center">Hast du eine Frage zum Founder Circle oder zur Reise der Phoenix?
    Schreib mir — ich melde mich persönlich bei dir.</p>

    <div class="form-wrap" data-form-wrap>
      <form class="form" data-webhook-form novalidate>
        <div class="form__field">
          <label for="contact-name">Name</label>
          <input type="text" id="contact-name" name="name" autocomplete="name" required>
        </div>
        <div class="form__field">
          <label for="contact-email">E-Mail</label>
          <input type="email" id="contact-email" name="email" autocomplete="email" required>
        </div>
        <div class="form__field">
          <label for="contact-message">Nachricht</label>
          <textarea id="contact-message" name="message" required></textarea>
        </div>
        <div class="form__honeypot" aria-hidden="true">
          <label for="contact-website">Website</label>
          <input type="text" id="contact-website" name="website" data-honeypot tabindex="-1" autocomplete="off">
        </div>
        <button type="submit" class="btn btn--gold form__submit">Nachricht senden</button>
      </form>
      <p class="form__success" data-form-success hidden>Danke — deine Nachricht ist angekommen. Ich melde mich persönlich bei dir.</p>
    </div>
  </section>
</main>

<footer class="footer">
  <img src="assets/img/phoenix-gold.png" alt="" class="phoenix phoenix--footer">
  <p class="footer__brand">The World of the Phoenix</p>
  <nav class="footer__nav">
    <a href="contact.html">Kontakt</a>
    <span>·</span>
    <a href="#">Impressum</a>
    <span>·</span>
    <a href="#">Datenschutz</a>
  </nav>
</footer>

<script src="js/forms.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify markup is well-formed**

Run: `python3 -c "import xml.dom.minidom, re; s=open('contact.html').read(); print('OK' if s.count('<form')==s.count('</form>') else 'MISMATCH')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add contact.html
git commit -m "Add contact page"
```

---

### Task 4: `waitlist.html`

**Files:**
- Create: `waitlist.html`

- [ ] **Step 1: Write the file**

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Warteliste — Rise of the Phoenix</title>
<meta name="description" content="Trag dich in die Warteliste für Rise of the Phoenix 2027 ein.">
<link rel="icon" type="image/png" href="assets/img/phoenix-gold.png">
<link rel="preload" href="assets/fonts/cinzel-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/cormorant-garamond-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<header class="site-header">
  <a href="index.html" class="site-header__mark">Carmen Zion</a>
</header>

<main class="page">
  <section class="page__hero">
    <img src="assets/img/phoenix-gold.png" alt="" class="phoenix phoenix--center">
    <p class="eyebrow">Rise of the Phoenix · 2027</p>
    <h1 class="headline">Warteliste</h1>
    <p class="body body--center">Die Türen öffnen sich 2027 — für 60 Frauen. Trag dich in die Warteliste
    ein und du erfährst als Erste, wenn dein Platz bereitsteht.</p>

    <div class="form-wrap" data-form-wrap>
      <form class="form" data-webhook-form novalidate>
        <div class="form__field">
          <label for="waitlist-name">Name</label>
          <input type="text" id="waitlist-name" name="name" autocomplete="name" required>
        </div>
        <div class="form__field">
          <label for="waitlist-email">E-Mail</label>
          <input type="email" id="waitlist-email" name="email" autocomplete="email" required>
        </div>
        <div class="form__honeypot" aria-hidden="true">
          <label for="waitlist-website">Website</label>
          <input type="text" id="waitlist-website" name="website" data-honeypot tabindex="-1" autocomplete="off">
        </div>
        <button type="submit" class="btn btn--copper form__submit">Zur Warteliste eintragen</button>
      </form>
      <p class="form__success" data-form-success hidden>Danke — du stehst auf der Warteliste. Wir melden uns, sobald sich die Türen öffnen.</p>
    </div>
  </section>
</main>

<footer class="footer">
  <img src="assets/img/phoenix-gold.png" alt="" class="phoenix phoenix--footer">
  <p class="footer__brand">The World of the Phoenix</p>
  <nav class="footer__nav">
    <a href="contact.html">Kontakt</a>
    <span>·</span>
    <a href="#">Impressum</a>
    <span>·</span>
    <a href="#">Datenschutz</a>
  </nav>
</footer>

<script src="js/forms.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify markup is well-formed**

Run: `python3 -c "s=open('waitlist.html').read(); print('OK' if s.count('<form')==s.count('</form>') else 'MISMATCH')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add waitlist.html
git commit -m "Add waitlist page"
```

---

### Task 5: `booking.html`

**Files:**
- Create: `booking.html`

- [ ] **Step 1: Write the file**

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Deep Dive Call — Founder Circle</title>
<meta name="description" content="Die Terminbuchung für deinen persönlichen Deep Dive Call öffnet in Kürze.">
<link rel="icon" type="image/png" href="assets/img/phoenix-gold.png">
<link rel="preload" href="assets/fonts/cinzel-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/cormorant-garamond-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<header class="site-header">
  <a href="index.html" class="site-header__mark">Carmen Zion</a>
</header>

<main class="page">
  <section class="page__hero">
    <img src="assets/img/phoenix-gold.png" alt="" class="phoenix phoenix--center">
    <p class="eyebrow">Founder Circle</p>
    <h1 class="headline">Deep Dive Call</h1>
    <p class="body body--center">Die Terminbuchung für deinen persönlichen 60-minütigen Deep Dive Call
    wird gerade eingerichtet. Trag dich ein und wir melden uns, sobald dein Call gebucht werden kann.</p>

    <div class="form-wrap" data-form-wrap>
      <form class="form" data-webhook-form novalidate>
        <div class="form__field">
          <label for="booking-name">Name</label>
          <input type="text" id="booking-name" name="name" autocomplete="name" required>
        </div>
        <div class="form__field">
          <label for="booking-email">E-Mail</label>
          <input type="email" id="booking-email" name="email" autocomplete="email" required>
        </div>
        <div class="form__honeypot" aria-hidden="true">
          <label for="booking-website">Website</label>
          <input type="text" id="booking-website" name="website" data-honeypot tabindex="-1" autocomplete="off">
        </div>
        <button type="submit" class="btn btn--gold form__submit">Benachrichtige mich</button>
      </form>
      <p class="form__success" data-form-success hidden>Danke — wir melden uns bei dir, sobald die Terminbuchung bereitsteht.</p>
    </div>
  </section>
</main>

<footer class="footer">
  <img src="assets/img/phoenix-gold.png" alt="" class="phoenix phoenix--footer">
  <p class="footer__brand">The World of the Phoenix</p>
  <nav class="footer__nav">
    <a href="contact.html">Kontakt</a>
    <span>·</span>
    <a href="#">Impressum</a>
    <span>·</span>
    <a href="#">Datenschutz</a>
  </nav>
</footer>

<script src="js/forms.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify markup is well-formed**

Run: `python3 -c "s=open('booking.html').read(); print('OK' if s.count('<form')==s.count('</form>') else 'MISMATCH')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add booking.html
git commit -m "Add booking placeholder page"
```

---

### Task 6: `gateway1.html`

**Files:**
- Create: `gateway1.html`

- [ ] **Step 1: Write the file**

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gateway 1 — Im Zeichen des Sturms</title>
<meta name="description" content="Gateway 1 öffnet in Kürze. Trag dich ein und erfahre als Erste, wenn deine Reise beginnt.">
<link rel="icon" type="image/png" href="assets/img/phoenix-gold.png">
<link rel="preload" href="assets/fonts/cinzel-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/cormorant-garamond-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<header class="site-header">
  <a href="index.html" class="site-header__mark">Carmen Zion</a>
</header>

<main class="page">
  <section class="page__hero">
    <img src="assets/img/phoenix-gold.png" alt="" class="phoenix phoenix--center">
    <p class="eyebrow">Gateway 1 · Im Zeichen des Sturms</p>
    <h1 class="headline">Fühle</h1>
    <p class="body body--center">Gateway 1 wird gerade vorbereitet und öffnet in Kürze. Trag dich ein
    und du erfährst als Erste, wenn deine Reise beginnen kann.</p>

    <div class="form-wrap" data-form-wrap>
      <form class="form" data-webhook-form novalidate>
        <div class="form__field">
          <label for="gateway1-name">Name</label>
          <input type="text" id="gateway1-name" name="name" autocomplete="name" required>
        </div>
        <div class="form__field">
          <label for="gateway1-email">E-Mail</label>
          <input type="email" id="gateway1-email" name="email" autocomplete="email" required>
        </div>
        <div class="form__honeypot" aria-hidden="true">
          <label for="gateway1-website">Website</label>
          <input type="text" id="gateway1-website" name="website" data-honeypot tabindex="-1" autocomplete="off">
        </div>
        <button type="submit" class="btn btn--water form__submit">Benachrichtige mich</button>
      </form>
      <p class="form__success" data-form-success hidden>Danke — wir melden uns bei dir, sobald Gateway 1 startet.</p>
    </div>
  </section>
</main>

<footer class="footer">
  <img src="assets/img/phoenix-gold.png" alt="" class="phoenix phoenix--footer">
  <p class="footer__brand">The World of the Phoenix</p>
  <nav class="footer__nav">
    <a href="contact.html">Kontakt</a>
    <span>·</span>
    <a href="#">Impressum</a>
    <span>·</span>
    <a href="#">Datenschutz</a>
  </nav>
</footer>

<script src="js/forms.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify markup is well-formed**

Run: `python3 -c "s=open('gateway1.html').read(); print('OK' if s.count('<form')==s.count('</form>') else 'MISMATCH')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add gateway1.html
git commit -m "Add gateway1 placeholder page"
```

---

### Task 7: Wire up `index.html`

**Files:**
- Modify: `index.html:13-30` (add header), `index.html:185` (booking CTA), `index.html:311` (gateway1 CTA), `index.html:351` (waitlist CTA), `index.html:366-374` (footer)

- [ ] **Step 1: Add the header after the progress bar, before `<main>`**

Find (currently lines 27-30):
```html
<!-- Scroll progress hairline -->
<div class="progress" id="progress"></div>

<main id="main">
```

Replace with:
```html
<!-- Scroll progress hairline -->
<div class="progress" id="progress"></div>

<header class="site-header">
  <a href="index.html" class="site-header__mark">Carmen Zion</a>
</header>

<main id="main">
```

- [ ] **Step 2: Fix the "Deep Dive Call" CTA**

Find (currently line 185):
```html
      <a href="#" class="btn btn--gold" data-booking>Deep Dive Call vereinbaren</a>
```

Replace with:
```html
      <a href="booking.html" class="btn btn--gold">Deep Dive Call vereinbaren</a>
```

- [ ] **Step 3: Fix the "Gateway 1" CTA**

Find (currently line 311):
```html
    <a href="#" class="btn btn--water reveal" data-gateway1>Starte jetzt Gateway 1 – Im Zeichen des Sturms</a>
```

Replace with:
```html
    <a href="gateway1.html" class="btn btn--water reveal">Starte jetzt Gateway 1 – Im Zeichen des Sturms</a>
```

- [ ] **Step 4: Fix the "Zur Warteliste" CTA**

Find (currently line 351):
```html
          <a href="#" class="btn btn--copper" data-waitlist>Zur Warteliste</a>
```

Replace with:
```html
          <a href="waitlist.html" class="btn btn--copper">Zur Warteliste</a>
```

- [ ] **Step 5: Add Kontakt to the footer**

Find (currently lines 366-374):
```html
  <footer class="footer">
    <img src="assets/img/phoenix-gold.png" alt="" class="phoenix phoenix--footer">
    <p class="footer__brand">The World of the Phoenix</p>
    <nav class="footer__nav">
      <a href="#">Impressum</a>
      <span>·</span>
      <a href="#">Datenschutz</a>
    </nav>
  </footer>
```

Replace with:
```html
  <footer class="footer">
    <img src="assets/img/phoenix-gold.png" alt="" class="phoenix phoenix--footer">
    <p class="footer__brand">The World of the Phoenix</p>
    <nav class="footer__nav">
      <a href="contact.html">Kontakt</a>
      <span>·</span>
      <a href="#">Impressum</a>
      <span>·</span>
      <a href="#">Datenschutz</a>
    </nav>
  </footer>
```

- [ ] **Step 6: Verify no dead `data-booking`/`data-gateway1`/`data-waitlist` attributes remain**

Run: `grep -n "data-booking\|data-gateway1\|data-waitlist" index.html`
Expected: no output (empty).

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "Wire funnel CTAs to real destination pages, add header and footer Kontakt link"
```

---

### Task 8: Remove obsolete URL-rewriting block from `js/main.js`

**Files:**
- Modify: `js/main.js:9-19`

- [ ] **Step 1: Remove the dead placeholder-URL block**

Find (currently lines 9-19):
```js
  /* ------------------------------------------------------------------
     Konfiguration — vor Livegang eintragen
     ------------------------------------------------------------------ */
  var BOOKING_URL = '#';   // Calendly-Link für den 60-Min Deep Dive Call
  var GATEWAY1_URL = '#';  // Checkout-/Startlink für Gateway 1 (Kurs 1)
  var WAITLIST_URL = '#';  // Formular-Link Warteliste Rise of the Phoenix 2027

  document.querySelectorAll('[data-booking]').forEach(function (a) { a.href = BOOKING_URL; });
  document.querySelectorAll('[data-gateway1]').forEach(function (a) { a.href = GATEWAY1_URL; });
  document.querySelectorAll('[data-waitlist]').forEach(function (a) { a.href = WAITLIST_URL; });

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

Replace with:
```js
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

- [ ] **Step 2: Verify the CTAs still work without it**

Run: `grep -n "BOOKING_URL\|GATEWAY1_URL\|WAITLIST_URL" js/main.js`
Expected: no output (empty) — the anchors now carry their real `href` directly in the HTML from Task 7.

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "Remove obsolete CTA URL-placeholder rewriting from main.js"
```

---

### Task 9: Update `README.md`

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the "Vor dem Livegang eintragen" section**

Find:
```markdown
## Vor dem Livegang eintragen

In `js/main.js` (oben):

- `BOOKING_URL` — Calendly-Link für den 60-Min Deep Dive Call
- `GATEWAY1_URL` — Start-/Checkout-Link Gateway 1
- `WAITLIST_URL` — Formular-Link Warteliste Rise of the Phoenix 2027
```

Replace with:
```markdown
## Seiten

Neben `index.html` (die Scroll-Journey) gibt es vier einfache Ein-Screen-Seiten, die die
Funnel-CTAs auffangen:

- `contact.html` — Kontaktformular (auch aus dem Footer erreichbar)
- `waitlist.html` — Warteliste Rise of the Phoenix 2027
- `booking.html` — Platzhalter für den Deep Dive Call, bis ein echter Calendly-Link existiert
- `gateway1.html` — Platzhalter für Gateway 1, bis der echte Kurs live ist

Alle vier laden `js/forms.js` statt der schweren GSAP/Lenis/Three.js-Bundles.

## Vor dem Livegang eintragen

In `js/forms.js` (oben):

- `WEBHOOK_URL` — die echte Automatisierungs-Webhook-URL, sobald sie bereitsteht. Bis
  dahin ist sie `'#'` und jedes Formular zeigt sofort die Erfolgsmeldung an, ohne eine
  echte Anfrage zu senden.

Impressum und Datenschutz im Footer sind noch `#`-Platzhalter — hier fehlt noch echter
Rechtstext (Pflicht vor Livegang, siehe Code-Review).
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Document new destination pages and WEBHOOK_URL placeholder"
```

---

### Task 10: Full manual verification pass

**Files:** none (verification only)

- [ ] **Step 1: Restart the local server and reload**

Use the `preview_start` tool with the `coaching-mama` config (port 4322), then `preview_eval` to run `window.location.reload()`.

- [ ] **Step 2: Confirm the header appears and the logo mark links home**

`preview_snapshot` on `/index.html` — expect a link named "Carmen Zion" near the top.

- [ ] **Step 3: Click each CTA and confirm it lands on the right page**

`preview_click` on the "Deep Dive Call vereinbaren" link → `preview_eval` `window.location.pathname` → expect `/booking.html`.
Repeat for "Starte jetzt Gateway 1 …" → expect `/gateway1.html`.
Repeat for "Zur Warteliste" → expect `/waitlist.html`.
Repeat for footer "Kontakt" → expect `/contact.html`.

- [ ] **Step 4: Submit each form and confirm the success state**

On each of the 4 pages: `preview_fill` name/email (and message on contact), `preview_click` the submit button, then `preview_snapshot` to confirm the form is hidden and the success text is visible.

- [ ] **Step 5: Confirm the honeypot silently blocks submission**

`preview_eval` to set the hidden `[data-honeypot]` input's value to `"spam"` on one page, then trigger submit — expect the success message does NOT appear (form stays visible, since the handler returns early).

- [ ] **Step 6: Keyboard/focus check**

`preview_eval` to call `.focus()` on the header mark, a CTA button, and a form submit button in turn; confirm each shows the gold focus outline via `preview_inspect` (`outline-color`).

- [ ] **Step 7: Console check**

`preview_console_logs` with `level: "error"` on `index.html` and on one destination page — expect no errors.

- [ ] **Step 8: No further commit needed**

This task is verification-only; if any check fails, fix the relevant file from Tasks 1–9 and re-run the failed step, then amend that task's commit is NOT appropriate — instead make a new commit describing the fix.
