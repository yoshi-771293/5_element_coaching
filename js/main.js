/* ==========================================================================
   The World of the Phoenix — Cinematic Funnel
   GSAP ScrollTrigger · Lenis Smooth Scroll · Three.js Goldstaub
   ========================================================================== */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) document.documentElement.classList.add('reduced-motion');

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
     Reveals — Textblöcke gleiten sanft nach oben (Filmszenen-Wirkung)
     ------------------------------------------------------------------ */
  document.querySelectorAll('.reveal').forEach(function (el) {
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
      { letterSpacing: '0.16em', opacity: 0 },
      {
        letterSpacing: '0.055em', opacity: 1,
        duration: 2.4,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      }
    );
  });

  /* ------------------------------------------------------------------
     Custom Cursor Glow
     ------------------------------------------------------------------ */
  var glow = document.getElementById('cursorGlow');
  if (glow && window.matchMedia('(hover: hover)').matches) {
    var gx = gsap.quickTo(glow, 'x', { duration: 0.7, ease: 'power3.out' });
    var gy = gsap.quickTo(glow, 'y', { duration: 0.7, ease: 'power3.out' });
    window.addEventListener('mousemove', function (e) {
      document.body.classList.add('has-cursor');
      gx(e.clientX);
      gy(e.clientY);
    });
  }

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
        camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.02;
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
