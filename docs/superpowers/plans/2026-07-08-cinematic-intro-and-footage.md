# Cinematic Intro + Footage Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-time flame→ember→phoenix-emblem opening sequence before the funnel, a new sand-video scene before the Rise-of-the-Phoenix block, and swap in the real founder photo and a replacement journey photo.

**Architecture:** A new `js/intro.js` drives a fixed full-screen overlay added at the top of `index.html`'s body. It plays `assets/video/intro-flames.mp4` once, triggers a particle burst by calling `window.__phoenixDust.burst()` (a small new export from the existing Three.js block in `js/main.js`), reveals `assets/img/phoenix-emblem.png`, then fades out and unlocks scroll. A `sessionStorage` flag skips the whole thing on repeat visits within the same session. Separately, a new static `<section>` with `assets/video/rise-sand.mp4` is inserted before the `#rise-of-the-phoenix` section, lazy-loaded via `IntersectionObserver` so it doesn't compete with the intro video for bandwidth on first paint.

**Tech Stack:** Plain HTML/CSS/vanilla JS (matches existing site — no build step). No test runner exists; verification is manual via `preview_*` browser tools, consistent with how this project has been verified throughout.

---

### Task 1: Asset preparation — DONE

**Files:**
- Created: `assets/img/phoenix-emblem.png` (cropped from `~/Documents/coaching-mama/logo/phönix_emblem.png` to remove a baked-in "PNG VERSION/SVG VECTOR VERSION" caption band — cropped to 1024×1220 using the alpha channel's content bounding box)
- Created: `assets/img/carmen-founder.jpg` (converted/resized from `~/Documents/coaching-mama/carmen_founder.png`, 3.8MB → 291KB via `sips -s format jpeg -s formatOptions 82 -Z 1600`)
- Created: `assets/img/journey-woman.jpg` (converted/resized from `~/Documents/coaching-mama/footage/Bild-FounderCircle-Bildschirmfoto 2026-06-02 um 09.52.41.png`, 1.7MB → 220KB, same `sips` command)
- Created: `assets/video/intro-flames.mp4` (copied from `~/Documents/coaching-mama/footage/intro_phönix_flames_being_born.mp4`, 25.6MB, unmodified — no compression tooling available)
- Created: `assets/video/rise-sand.mp4` (copied from `~/Documents/coaching-mama/footage/rise_of_the_phönix_sand.mp4`, 24.8MB, unmodified)

Already complete (done ahead of plan-writing due to time pressure). Remaining tasks build on these five files.

- [x] **Step 1: Verify all five files exist**

Run: `ls -la assets/img/phoenix-emblem.png assets/img/carmen-founder.jpg assets/img/journey-woman.jpg assets/video/intro-flames.mp4 assets/video/rise-sand.mp4`
Expected: all five paths listed with no "No such file" errors.

- [ ] **Step 2: Commit the new assets**

```bash
git add assets/img/phoenix-emblem.png assets/img/carmen-founder.jpg assets/img/journey-woman.jpg assets/video/intro-flames.mp4 assets/video/rise-sand.mp4
git commit -m "Add cinematic intro and footage assets (flame video, sand video, founder photo, journey photo, cropped emblem)"
```

---

### Task 2: CSS for the intro overlay and the new sand scene

**Files:**
- Modify: `css/style.css` (append at end of file)

- [ ] **Step 1: Append the intro overlay and sand-scene CSS**

```css

/* ---------- Opening sequence (flame -> ember burst -> emblem) ---------- */
.intro {
  position: fixed; inset: 0; z-index: 200;
  background: var(--ink);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.intro.intro--done { display: none; }
.intro__video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: opacity 1s ease;
}
.intro__video.is-hidden { opacity: 0; }
.intro__logo {
  position: relative; z-index: 2;
  width: clamp(160px, 22vw, 280px);
  opacity: 0;
  filter: drop-shadow(0 0 40px rgba(216, 192, 106, 0.4));
  transition: opacity 1.4s ease;
}
.intro__logo.is-visible { opacity: 1; }
.intro.is-leaving { opacity: 0; transition: opacity 0.8s ease; pointer-events: none; }
.intro__skip {
  position: absolute; bottom: 2rem; right: 2rem; z-index: 3;
  font-family: var(--font-display);
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--pristine);
  background: transparent;
  border: 1px solid rgba(244, 243, 234, 0.35);
  padding: 0.7rem 1.4rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}
.intro__skip:hover, .intro__skip:focus-visible { opacity: 1; }
.intro__skip:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }

/* ---------- Sand-video scene (before Rise of the Phoenix) ---------- */
.scene--sand { min-height: 100vh; min-height: 100svh; overflow: hidden; }
.scene--sand video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
```

- [ ] **Step 2: Verify braces balanced**

Run: `python3 -c "s=open('css/style.css').read(); print(s.count('{'), s.count('}'))"`
Expected: both numbers equal.

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "Add intro overlay and sand-scene CSS"
```

---

### Task 3: Export a particle burst from the Three.js dust system

**Files:**
- Modify: `js/main.js` (right after `points` is added to `scene3`)

- [ ] **Step 1: Add the burst export**

Find:
```js
      var points = new THREE.Points(geo, mat);
      scene3.add(points);
```

Replace with:
```js
      var points = new THREE.Points(geo, mat);
      scene3.add(points);

      window.__phoenixDust = {
        burst: function () {
          var burstCount = 140;
          var burstPositions = new Float32Array(burstCount * 3);
          var burstVelocities = new Float32Array(burstCount * 3);
          for (var b = 0; b < burstCount; b++) {
            burstPositions[b * 3] = 0;
            burstPositions[b * 3 + 1] = 0;
            burstPositions[b * 3 + 2] = 0;
            var angle = Math.random() * Math.PI * 2;
            var spread = Math.random() * Math.PI - Math.PI / 2;
            var speed = 2.5 + Math.random() * 4;
            burstVelocities[b * 3] = Math.cos(angle) * Math.cos(spread) * speed;
            burstVelocities[b * 3 + 1] = Math.sin(spread) * speed + 1.5;
            burstVelocities[b * 3 + 2] = Math.sin(angle) * Math.cos(spread) * speed;
          }
          var burstGeo = new THREE.BufferGeometry();
          burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
          var burstMat = new THREE.PointsMaterial({
            size: 0.22,
            map: tex,
            transparent: true,
            opacity: 1,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            color: new THREE.Color('#D8C06A')
          });
          var burstPoints = new THREE.Points(burstGeo, burstMat);
          scene3.add(burstPoints);

          var start = null;
          var duration = 1800;
          (function animateBurst(now) {
            if (!start) start = now;
            var elapsed = now - start;
            var t = Math.min(elapsed / duration, 1);
            var pos = burstGeo.attributes.position.array;
            for (var b = 0; b < burstCount; b++) {
              pos[b * 3] = burstVelocities[b * 3] * t;
              pos[b * 3 + 1] = burstVelocities[b * 3 + 1] * t - 2 * t * t;
              pos[b * 3 + 2] = burstVelocities[b * 3 + 2] * t;
            }
            burstGeo.attributes.position.needsUpdate = true;
            burstMat.opacity = 1 - t;
            if (t < 1) {
              requestAnimationFrame(animateBurst);
            } else {
              scene3.remove(burstPoints);
              burstGeo.dispose();
              burstMat.dispose();
            }
          })(performance.now());
        }
      };
```

- [ ] **Step 2: Verify syntax**

Run: `node --check js/main.js`
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "Export a particle burst function from the Three.js dust system"
```

---

### Task 4: `js/intro.js`

**Files:**
- Create: `js/intro.js`

- [ ] **Step 1: Write the file**

```js
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
```

- [ ] **Step 2: Verify syntax**

Run: `node --check js/intro.js`
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add js/intro.js
git commit -m "Add intro sequence controller"
```

---

### Task 5: Insert the intro markup into `index.html`

**Files:**
- Modify: `index.html` (right after `<body>`, before the existing `<!-- Preloader -->` comment)
- Modify: `index.html` (script tags at the bottom)

- [ ] **Step 1: Add the intro markup**

Find:
```html
<body>

<!-- Preloader -->
```

Replace with:
```html
<body>

<!-- Opening sequence -->
<div class="intro" id="intro">
  <video class="intro__video" id="introVideo" src="assets/video/intro-flames.mp4" muted playsinline autoplay></video>
  <img class="intro__logo" id="introLogo" src="assets/img/phoenix-emblem.png" alt="">
  <button class="intro__skip" id="introSkip" type="button">Überspringen</button>
</div>

<!-- Preloader -->
```

- [ ] **Step 2: Load `intro.js` after `main.js`**

Find:
```html
<script src="js/vendor/lenis.min.js"></script>
<script src="js/main.js"></script>
```

Replace with:
```html
<script src="js/vendor/lenis.min.js"></script>
<script src="js/main.js"></script>
<script src="js/intro.js"></script>
```

`intro.js` must run after `main.js` so `window.__phoenixDust` already exists when `intro.js` checks for it. `intro.js` guards with `if (window.__phoenixDust && window.__phoenixDust.burst)`, so it stays safe even if the Three.js block didn't run (reduced-motion users).

- [ ] **Step 3: Verify markup**

Run: `grep -c 'id="intro"' index.html`
Expected: `1`

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Wire the opening sequence into index.html"
```

---

### Task 6: Swap in the founder photo

**Files:**
- Modify: `index.html` (Founder Circle offer scene)

- [ ] **Step 1: Replace the placeholder photo and remove the "coming soon" caption**

Find:
```html
      <figure class="offer__media frame reveal-img">
        <img src="assets/img/talking-head.jpg" alt="Carmen Zion">
        <div class="frame__fade"></div>
        <figcaption class="offer__soon">
          <span class="offer__soon-label">coming soon</span>
          <span class="offer__soon-script">Talking Head</span>
        </figcaption>
      </figure>
```

Replace with:
```html
      <figure class="offer__media frame reveal-img">
        <img src="assets/img/carmen-founder.jpg" alt="Carmen Zion">
        <div class="frame__fade"></div>
      </figure>
```

- [ ] **Step 2: Verify the old placeholder is gone**

Run: `grep -c "talking-head\|offer__soon" index.html`
Expected: `0`

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Replace Founder Circle placeholder photo with the real founder photo"
```

---

### Task 7: Swap the reused storm photo for the journey photo

**Files:**
- Modify: `index.html` (Gateway-1 CTA scene, `journey__media`)

- [ ] **Step 1: Replace the image**

Find:
```html
    <figure class="journey__media frame reveal-img" data-speed="1.04">
      <img src="assets/img/gw-storm.jpg" alt="">
      <div class="frame__fade"></div>
    </figure>
```

Replace with:
```html
    <figure class="journey__media frame reveal-img" data-speed="1.04">
      <img src="assets/img/journey-woman.jpg" alt="">
      <div class="frame__fade"></div>
    </figure>
```

- [ ] **Step 2: Verify only the Gateway 1 scene itself still references gw-storm.jpg**

Run: `grep -n "gw-storm.jpg" index.html`
Expected: exactly one match, inside the `gateway--water` section (not inside `journey__media`).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Replace reused storm photo with the journey photo before the waitlist section"
```

---

### Task 8: New sand-video scene + lazy-load

**Files:**
- Modify: `index.html` (insert new section immediately before `<section class="scene scene--hero scene--world" id="rise-of-the-phoenix">`)
- Modify: `js/main.js` (add lazy-load IntersectionObserver at the end, before the closing `})();`)

- [ ] **Step 1: Insert the new scene**

Find:
```html
  <!-- ============ SZENE 14 · WORLD OF THE PHOENIX ============ -->
  <section class="scene scene--hero scene--world" id="rise-of-the-phoenix">
```

Replace with:
```html
  <!-- ============ SZENE 13B · RISE OF THE PHOENIX SAND ============ -->
  <section class="scene scene--dark scene--sand">
    <video muted loop playsinline preload="none" data-lazy-video="assets/video/rise-sand.mp4"></video>
    <div class="scene__veil"></div>
    <div class="scene__fade scene__fade--top"></div>
    <div class="scene__fade scene__fade--bottom"></div>
  </section>

  <!-- ============ SZENE 14 · WORLD OF THE PHOENIX ============ -->
  <section class="scene scene--hero scene--world" id="rise-of-the-phoenix">
```

- [ ] **Step 2: Add the lazy-load observer to `main.js`**

Find (the final line of the file):
```js
})();
```

Replace with:
```js
  document.querySelectorAll('video[data-lazy-video]').forEach(function (video) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          video.src = video.dataset.lazyVideo;
          video.load();
          video.play().catch(function () {});
          observer.disconnect();
        }
      });
    }, { rootMargin: '300px' });
    observer.observe(video);
  });
})();
```

- [ ] **Step 3: Verify**

Run: `grep -c "data-lazy-video" index.html; grep -c "data-lazy-video" js/main.js`
Expected: `1` for each file.

- [ ] **Step 4: Commit**

```bash
git add index.html js/main.js
git commit -m "Add lazy-loaded sand-video scene before the Rise-of-the-Phoenix section"
```

---

### Task 9: Full manual verification pass

**Files:** none (verification only)

- [ ] **Step 1: Restart the local server and hard-reload**

`preview_start` with the `coaching-mama` config, then clear `sessionStorage` via `preview_eval` (`sessionStorage.clear()`) and reload.

- [ ] **Step 2: Confirm the intro plays and resolves**

`preview_screenshot` shortly after load — expect the flame video. Wait ~6s (video duration), `preview_screenshot` again — expect the emblem logo, then the overlay gone and the normal hero visible. `preview_console_logs` with `level: "error"` — expect none.

- [ ] **Step 3: Confirm session-skip works**

`preview_eval`: `window.location.reload()`. Immediately `preview_screenshot` — expect the hero directly, no intro overlay (since `introSeen` is now set).

- [ ] **Step 4: Confirm the skip button works on a fresh session**

`preview_eval`: `sessionStorage.clear(); window.location.reload();`. Then `preview_click` on `.intro__skip` quickly. `preview_eval` to check `document.getElementById('intro').classList.contains('intro--done')` shortly after — expect `true`, and `document.documentElement.style.overflow` — expect `''`.

- [ ] **Step 5: Confirm the founder and journey photos render**

Scroll to the Founder Circle section, `preview_inspect` on the `offer__media img` — confirm `src` contains `carmen-founder.jpg` and there's no `offer__soon` element in the DOM.

- [ ] **Step 6: Confirm the sand video lazy-loads**

`preview_network` right after page load — confirm `rise-sand.mp4` has NOT been requested yet. Scroll near that scene, then `preview_network` again — confirm it has now been requested.

- [ ] **Step 7: No further commit needed**

Verification-only task. If any check fails, fix the relevant file from Tasks 1–8 and make a new commit describing the fix — do not amend prior commits.
