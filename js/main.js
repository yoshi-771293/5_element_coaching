/* ==========================================================================
   The World of the Phoenix — Cinematic Funnel
   GSAP ScrollTrigger · Lenis Smooth Scroll · Three.js Goldstaub
   ========================================================================== */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) document.documentElement.classList.add('reduced-motion');

  /* ------------------------------------------------------------------
     Lazy-loaded scene videos — independent of reduced-motion/GSAP so
     these scenes never end up permanently blank
     ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------
     Preloader
     ------------------------------------------------------------------ */
  var preloader = document.getElementById('preloader');
  function hidePreloader() {
    if (preloader) preloader.classList.add('is-done');
  }
  if (document.readyState === 'complete') {
    setTimeout(hidePreloader, 900);
  } else {
    window.addEventListener('load', function () { setTimeout(hidePreloader, 900); });
    setTimeout(hidePreloader, 4000); // Fallback
  }

  /* ------------------------------------------------------------------
     Gateway-Buttons — "Coming soon" Toast statt toter Links
     ------------------------------------------------------------------ */
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function showComingSoon() {
    if (!toast) return;
    toast.textContent = 'Coming soon';
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2600);
  }
  document.querySelectorAll('[data-gateway-btn]').forEach(function (btn) {
    btn.addEventListener('click', showComingSoon);
    // Szenenbilder sind <figure role="button"> — Enter/Space wie ein Button behandeln
    if (btn.tagName !== 'BUTTON') {
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showComingSoon();
        }
      });
    }
  });

  if (prefersReduced || typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------
     Lenis Smooth Scroll (Cinematic Inertia)
     ------------------------------------------------------------------ */
  var lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.35,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ------------------------------------------------------------------
     Scroll-Progress Hairline
     ------------------------------------------------------------------ */
  gsap.to('#progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.4 }
  });

  /* ------------------------------------------------------------------
     Wort-für-Wort-Reveal — Headlines/Statements bauen sich Wort für Wort
     auf, statt als ganzer Block einzublenden (kein Scroll-Jank auf langen
     Fließtext-Absätzen, deshalb bewusst nur auf die kurzen, dramatischen
     Textebenen begrenzt).
     ------------------------------------------------------------------ */
  var WORD_SPLIT_SELECTOR = '.headline, .subline, .statement, .statement-soft, .eyebrow, .gateway__verb';

  function wrapWords(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === Node.TEXT_NODE) {
        var text = child.textContent;
        if (!text.trim()) return;
        var frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach(function (part) {
          if (part === '') return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            var span = document.createElement('span');
            span.className = 'word';
            span.textContent = part;
            frag.appendChild(span);
          }
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        wrapWords(child);
      }
    });
  }

  document.querySelectorAll(WORD_SPLIT_SELECTOR).forEach(function (el) {
    wrapWords(el);
    var words = el.querySelectorAll('.word');
    if (!words.length) return;
    // Der Elternblock trägt evtl. noch die .reveal-Basisregel (opacity:0) —
    // die Sichtbarkeit übernehmen jetzt die einzelnen Wörter.
    gsap.set(el, { opacity: 1 });
    var delay = parseFloat(el.dataset.delay || 0);
    gsap.fromTo(words,
      { opacity: 0, y: 22 },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        delay: delay,
        stagger: 0.045,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      }
    );
  });

  /* ------------------------------------------------------------------
     Reveals — Textblöcke gleiten sanft nach oben (Filmszenen-Wirkung)
     ------------------------------------------------------------------ */
  document.querySelectorAll('.reveal').forEach(function (el) {
    if (el.matches(WORD_SPLIT_SELECTOR)) return; // wird oben Wort für Wort animiert
    var delay = parseFloat(el.dataset.delay || 0);
    gsap.fromTo(el,
      { opacity: 0, y: 46 },
      {
        opacity: 1, y: 0,
        duration: 1.6,
        delay: delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      }
    );
  });

  /* Bilder: weiches Aufblenden mit leichtem Scale-Settle */
  document.querySelectorAll('.reveal-img').forEach(function (el) {
    gsap.fromTo(el,
      { opacity: 0, scale: 1.06 },
      {
        opacity: 1, scale: 1,
        duration: 2.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      }
    );
  });

  /* ------------------------------------------------------------------
     Parallax — Hintergründe bewegen sich langsamer als der Vordergrund
     ------------------------------------------------------------------ */
  document.querySelectorAll('.scene__img[data-speed]').forEach(function (el) {
    var speed = parseFloat(el.dataset.speed || 0.85);
    gsap.fromTo(el,
      { yPercent: -(1 - speed) * 22 },
      {
        yPercent: (1 - speed) * 22,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.scene'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  });

  /* Parallax in Bild-Frames (inneres Bild wandert sanft) */
  document.querySelectorAll('.frame[data-speed] img').forEach(function (img) {
    var frame = img.closest('.frame');
    var speed = parseFloat(frame.dataset.speed || 1.05);
    var shift = (speed - 1) * 120;
    gsap.set(img, { scale: 1.12 });
    gsap.fromTo(img,
      { yPercent: -Math.abs(shift) / 10 },
      {
        yPercent: Math.abs(shift) / 10,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true }
      }
    );
  });

  /* ------------------------------------------------------------------
     Ken Burns — sehr langsamer Zoom auf Vollbild-Szenen
     ------------------------------------------------------------------ */
  document.querySelectorAll('.kenburns').forEach(function (el) {
    var slow = el.classList.contains('kenburns--slow');
    gsap.fromTo(el,
      { scale: 1 },
      {
        scale: slow ? 1.07 : 1.12,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.scene'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        }
      }
    );
  });

  /* ------------------------------------------------------------------
     Headline-Letterspacing — atmet beim Eintritt leicht auf
     ------------------------------------------------------------------ */
  document.querySelectorAll('.headline').forEach(function (el) {
    gsap.fromTo(el,
      { letterSpacing: '0.16em' },
      {
        letterSpacing: '0.055em',
        duration: 2.4,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      }
    );
  });

  /* Custom Cursor Glow lebt jetzt eigenständig in js/cursor.js (auf allen
     Seiten, unabhängig von GSAP). */

  /* ------------------------------------------------------------------
     Three.js — schwebender Goldstaub (subtil, cinematic)
     ------------------------------------------------------------------ */
  var canvas = document.getElementById('dust');
  if (canvas && typeof THREE !== 'undefined') {
    try {
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      var scene3 = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.z = 14;

      var COUNT = window.innerWidth < 900 ? 90 : 190;
      var positions = new Float32Array(COUNT * 3);
      var speeds = new Float32Array(COUNT);
      var phases = new Float32Array(COUNT);
      for (var i = 0; i < COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 34;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
        speeds[i] = 0.12 + Math.random() * 0.35;
        phases[i] = Math.random() * Math.PI * 2;
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Weicher runder Sprite als Partikeltextur
      var c2 = document.createElement('canvas');
      c2.width = c2.height = 64;
      var ctx = c2.getContext('2d');
      var grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(216,192,106,1)');
      grad.addColorStop(0.35, 'rgba(216,192,106,0.55)');
      grad.addColorStop(1, 'rgba(216,192,106,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      var tex = new THREE.CanvasTexture(c2);

      var mat = new THREE.PointsMaterial({
        size: 0.16,
        map: tex,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: new THREE.Color('#D8C06A')
      });
      var points = new THREE.Points(geo, mat);
      scene3.add(points);

      // ---- Phoenix-Silhouette aus dem echten Logo sampeln ----
      // Normalisierte Koordinaten (Aspekt bleibt erhalten); die Welt-Skala
      // wird erst im burst() aus dem tatsächlichen DOM-Rechteck des
      // Intro-Logos berechnet, damit Partikel-Phönix und Logo am Ende
      // pixelgenau deckungsgleich sind.
      var phoenixShape = null;
      (function preparePhoenixSilhouette() {
        var img = new Image();
        img.onload = function () {
          var cw = 110;
          var ch = Math.round(cw * img.naturalHeight / img.naturalWidth);
          var sampleCanvas = document.createElement('canvas');
          sampleCanvas.width = cw;
          sampleCanvas.height = ch;
          var sctx = sampleCanvas.getContext('2d');
          sctx.drawImage(img, 0, 0, cw, ch);
          var data = sctx.getImageData(0, 0, cw, ch).data;
          var pts = [];
          for (var y = 0; y < ch; y += 2) {
            for (var x = 0; x < cw; x += 2) {
              if (data[(y * cw + x) * 4 + 3] > 120) {
                // Zentriert auf (0,0) — deckungsgleich mit dem flex-zentrierten
                // #introLogo, damit Glut-Silhouette und scharfes PNG exakt
                // aufeinander ausgerichtet sind, statt versetzt zu wirken.
                pts.push(
                  (x / cw - 0.5) * 6.6,
                  (0.5 - y / ch) * 6.6,
                  (Math.random() - 0.5) * 0.5
                );
              }
            }
          }
          phoenixShape = { pts: pts, aspect: ch / cw };
        };
        img.src = 'assets/img/phoenix-emblem.png';
      })();

      // Während des Intro-Bursts wird die Maus-Parallaxe der Kamera
      // eingefroren, sonst verschiebt sie die Silhouette gegen das Logo.
      var parallaxLocked = false;

      function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

      window.__phoenixDust = {
        burst: function () {
          var hasShape = phoenixShape && phoenixShape.pts.length >= 60;
          var shapePointCount = hasShape ? Math.floor(phoenixShape.pts.length / 2) : 0;
          var burstCount = hasShape ? Math.min(shapePointCount, 900) : 140;
          var stride = hasShape ? Math.max(1, Math.floor(shapePointCount / burstCount)) : 1;

          // Welt-Skala & -Position exakt aus dem DOM-Rechteck des Intro-Logos
          // ableiten, damit Silhouette und Logo deckungsgleich sind.
          var scaleS = 3.4, centerX = 0, centerY = 0, aspect = 1.19;
          var logoEl = document.getElementById('introLogo');
          if (logoEl) {
            var rect = logoEl.getBoundingClientRect();
            if (rect.width > 0) {
              var worldH = 2 * Math.tan(Math.PI / 6) * camera.position.z; // fov 60°
              var worldPerPx = worldH / window.innerHeight;
              // Das Logo startet mit transform: scale(0.94) — getBoundingClientRect
              // liefert dadurch eine um 6% zu kleine Breite. offsetWidth ist die
              // untransformierte Layout-Breite (= finale scale(1)-Größe), damit die
              // Glut-Silhouette exakt auf das fertige Logo passt. Der Mittelpunkt
              // bleibt unter zentrischer Skalierung invariant, kommt also aus rect.
              scaleS = (logoEl.offsetWidth || rect.width) * worldPerPx;
              centerX = (rect.left + rect.width / 2 - window.innerWidth / 2) * worldPerPx;
              centerY = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * worldPerPx;
            }
          }
          if (hasShape) aspect = phoenixShape.aspect;

          parallaxLocked = true;

          var startPositions = new Float32Array(burstCount * 3);
          var endPositions = new Float32Array(burstCount * 3);
          var burstPositions = new Float32Array(burstCount * 3);

          for (var b = 0; b < burstCount; b++) {
            // Startpunkt: lose Asche/Glut, die von unten aufsteigt
            var angle = Math.random() * Math.PI * 2;
            var radius = 1.2 + Math.random() * 3.5;
            startPositions[b * 3] = Math.cos(angle) * radius;
            startPositions[b * 3 + 1] = -3.5 - Math.random() * 2.5;
            startPositions[b * 3 + 2] = (Math.random() - 0.5) * 2.5;

            if (hasShape) {
              var si = (b * stride) * 2;
              endPositions[b * 3] = centerX + phoenixShape.pts[si] * scaleS;
              endPositions[b * 3 + 1] = centerY + phoenixShape.pts[si + 1] * scaleS * aspect;
              endPositions[b * 3 + 2] = (Math.random() - 0.5) * 0.3;
            } else {
              // Fallback, falls das Logo-Bild noch nicht geladen ist: klassischer Funkenburst
              var a2 = Math.random() * Math.PI * 2;
              var sp = Math.random() * Math.PI - Math.PI / 2;
              var d = 2.5 + Math.random() * 4;
              endPositions[b * 3] = Math.cos(a2) * Math.cos(sp) * d;
              endPositions[b * 3 + 1] = Math.sin(sp) * d + 1.5;
              endPositions[b * 3 + 2] = Math.sin(a2) * Math.cos(sp) * d;
            }
            burstPositions[b * 3] = startPositions[b * 3];
            burstPositions[b * 3 + 1] = startPositions[b * 3 + 1];
            burstPositions[b * 3 + 2] = startPositions[b * 3 + 2];
          }

          var burstGeo = new THREE.BufferGeometry();
          burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
          var burstMat = new THREE.PointsMaterial({
            size: hasShape ? 0.12 : 0.22,
            map: tex,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            color: new THREE.Color('#D8C06A')
          });
          var burstPoints = new THREE.Points(burstGeo, burstMat);
          scene3.add(burstPoints);

          // ---- Freie Glutfunken: steigen neben der Silhouette auf und
          //      verglühen — der "Funkenregen" um die Geburt herum ----
          var sparkCount = 260;
          var sparkPositions = new Float32Array(sparkCount * 3);
          var sparkVel = new Float32Array(sparkCount * 3);
          var sparkPhase = new Float32Array(sparkCount);
          for (var s = 0; s < sparkCount; s++) {
            sparkPositions[s * 3] = (Math.random() - 0.5) * 5.5;
            sparkPositions[s * 3 + 1] = -4.2 - Math.random() * 2;
            sparkPositions[s * 3 + 2] = (Math.random() - 0.5) * 3;
            sparkVel[s * 3] = (Math.random() - 0.5) * 1.6;
            sparkVel[s * 3 + 1] = 2.6 + Math.random() * 4.4;
            sparkVel[s * 3 + 2] = (Math.random() - 0.5) * 1.2;
            sparkPhase[s] = Math.random() * Math.PI * 2;
          }
          var sparkGeo = new THREE.BufferGeometry();
          sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
          var sparkMat = new THREE.PointsMaterial({
            size: 0.09,
            map: tex,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            color: new THREE.Color('#E4B96A')
          });
          var sparkPoints = new THREE.Points(sparkGeo, sparkMat);
          scene3.add(sparkPoints);

          // Pro-Partikel-Drift für die Melt-Phase: leichtes, unterschiedlich
          // schnelles Herabsinken + seitliches Zittern, damit die Glut
          // organisch "wegschmilzt" statt gleichförmig zu verschwinden.
          var meltDrift = new Float32Array(burstCount * 2);
          var meltDelay = new Float32Array(burstCount);
          for (var m = 0; m < burstCount; m++) {
            meltDrift[m * 2] = (Math.random() - 0.5) * 0.6;   // x-Zittern
            meltDrift[m * 2 + 1] = 0.5 + Math.random() * 1.6; // Sink-Distanz
            meltDelay[m] = Math.random() * 0.28;              // gestaffelter Melt-Start
          }

          var start = null;
          var duration = hasShape ? 1750 : 1000;
          var assembleBy = 0.5;   // Anteil der Zeit, bis die Form steht — schneller Einstieg
          var fadeFrom = 0.66;    // langer, sanfter Ausklang: die Glut löst sich auf,
                                   // während darüber das scharfe Logo einblendet ("melt into")
          var riseAmount = 0.4;   // sanfter Aufstieg der fertigen Silhouette

          (function animateBurst(now) {
            if (!start) start = now;
            var elapsed = now - start;
            var t = Math.min(elapsed / duration, 1);
            var formT = easeOutCubic(Math.min(t / assembleBy, 1));

            var pos = burstGeo.attributes.position.array;
            for (var b = 0; b < burstCount; b++) {
              var tx = endPositions[b * 3];
              var ty = endPositions[b * 3 + 1];
              var tz = endPositions[b * 3 + 2];
              pos[b * 3] = startPositions[b * 3] + (tx - startPositions[b * 3]) * formT;
              pos[b * 3 + 1] = startPositions[b * 3 + 1] + (ty - startPositions[b * 3 + 1]) * formT;
              pos[b * 3 + 2] = startPositions[b * 3 + 2] + (tz - startPositions[b * 3 + 2]) * formT;
            }
            burstGeo.attributes.position.needsUpdate = true;

            var tSec = elapsed / 1000;
            var spos = sparkGeo.attributes.position.array;
            for (var s2 = 0; s2 < sparkCount; s2++) {
              spos[s2 * 3] = sparkPositions[s2 * 3] + sparkVel[s2 * 3] * tSec + Math.sin(tSec * 3 + sparkPhase[s2]) * 0.14;
              spos[s2 * 3 + 1] = sparkPositions[s2 * 3 + 1] + sparkVel[s2 * 3 + 1] * tSec;
              spos[s2 * 3 + 2] = sparkPositions[s2 * 3 + 2] + sparkVel[s2 * 3 + 2] * tSec;
            }
            sparkGeo.attributes.position.needsUpdate = true;

            var op;
            if (t < 0.12) {
              op = t / 0.12;
            } else if (t < fadeFrom) {
              op = 1;
            } else {
              op = 1 - (t - fadeFrom) / (1 - fadeFrom);
            }
            op = Math.max(0, Math.min(1, op));
            burstMat.opacity = op * (hasShape ? 0.95 : 1);
            var sparkOp = t < 0.08 ? t / 0.08 : 1 - easeOutCubic(Math.max(0, (t - 0.08) / 0.8));
            sparkMat.opacity = Math.max(0, Math.min(1, sparkOp)) * 0.9;

            if (t < 1) {
              requestAnimationFrame(animateBurst);
            } else {
              scene3.remove(burstPoints);
              burstGeo.dispose();
              burstMat.dispose();
              scene3.remove(sparkPoints);
              sparkGeo.dispose();
              sparkMat.dispose();
            }
          })(performance.now());
        }
      };

      var mouseX = 0, mouseY = 0;
      window.addEventListener('mousemove', function (e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      });

      var clock = new THREE.Clock();
      (function animate() {
        requestAnimationFrame(animate);
        var t = clock.getElapsedTime();
        var pos = geo.attributes.position.array;
        for (var i = 0; i < COUNT; i++) {
          pos[i * 3 + 1] += Math.sin(t * 0.4 + phases[i]) * 0.0012 + speeds[i] * 0.004;
          pos[i * 3] += Math.cos(t * 0.25 + phases[i]) * 0.0009;
          if (pos[i * 3 + 1] > 11) pos[i * 3 + 1] = -11;
        }
        geo.attributes.position.needsUpdate = true;
        points.rotation.y += 0.0004;
        // Während des Intro-Bursts Kamera mittig halten, damit die
        // Partikel-Silhouette deckungsgleich mit dem Logo bleibt.
        var targetX = parallaxLocked ? 0 : mouseX * 0.8;
        var targetY = parallaxLocked ? 0 : -mouseY * 0.5;
        camera.position.x += (targetX - camera.position.x) * (parallaxLocked ? 0.08 : 0.02);
        camera.position.y += (targetY - camera.position.y) * (parallaxLocked ? 0.08 : 0.02);
        camera.lookAt(scene3.position);
        renderer.render(scene3, camera);
      })();

      window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    } catch (e) {
      canvas.style.display = 'none';
    }
  }
})();
