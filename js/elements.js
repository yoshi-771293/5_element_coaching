/* ==========================================================================
   Elemental field — Three.js Partikelfeld für die Elemental-Coaching-Seite.
   Ein vollflächiges Feld aus glühenden Partikeln, dessen Farbe und Bewegung
   sich sanft an das gerade sichtbare Element anpasst (Wasser, Feuer, Luft,
   Erde). Farbe immer nur als Akzent auf Obsidian — kein flächiger Hintergrund.
   Setzt außerdem --cursor-glow-rgb, damit der Cursor-Glow mitwandert.
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('elementField');
  if (!canvas || typeof THREE === 'undefined') return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Element-Profile: Farbe (0–1), Auftrieb, Schwing-Amplitude & -Tempo.
     rgb wird zusätzlich als CSS-Cursor-Tönung gesetzt. */
  var PROFILES = {
    gold:  { color: [0.847, 0.753, 0.416], rise: 0.55, sway: 0.55, swaySpeed: 0.5, rgb: '216, 192, 106' },
    water: { color: [0.227, 0.549, 0.659], rise: 0.35, sway: 0.70, swaySpeed: 0.4, rgb: '58, 140, 168' },
    fire:  { color: [0.839, 0.361, 0.173], rise: 1.15, sway: 0.35, swaySpeed: 1.2, rgb: '214, 92, 44' },
    air:   { color: [0.698, 0.714, 0.804], rise: 0.45, sway: 1.05, swaySpeed: 0.7, rgb: '178, 182, 205' },
    earth: { color: [0.455, 0.620, 0.290], rise: 0.18, sway: 0.30, swaySpeed: 0.3, rgb: '116, 158, 74' }
  };

  // Abschnitte, die ein Element markieren (data-element="…").
  var marked = Array.prototype.slice.call(document.querySelectorAll('[data-element]'));

  var current = { color: PROFILES.gold.color.slice(), rise: PROFILES.gold.rise, sway: PROFILES.gold.sway, swaySpeed: PROFILES.gold.swaySpeed };
  var targetKey = 'gold';

  function activeProfile() {
    if (!marked.length) return PROFILES.gold;
    var mid = window.innerHeight / 2;
    var best = null, bestDist = Infinity, bestKey = 'gold';
    for (var i = 0; i < marked.length; i++) {
      var r = marked[i].getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      var c = r.top + r.height / 2;
      var d = Math.abs(c - mid);
      if (d < bestDist) { bestDist = d; best = marked[i]; bestKey = marked[i].getAttribute('data-element'); }
    }
    return PROFILES[bestKey] ? (targetKey = bestKey, PROFILES[bestKey]) : PROFILES.gold;
  }

  try {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 14;

    var COUNT = window.innerWidth < 900 ? 150 : 320;
    var positions = new Float32Array(COUNT * 3);
    var phase = new Float32Array(COUNT);
    var speed = new Float32Array(COUNT);
    var swayX = new Float32Array(COUNT);

    var SPREAD_X = 30, SPREAD_Y = 22;
    for (var i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * SPREAD_X;
      positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      phase[i] = Math.random() * Math.PI * 2;
      speed[i] = 0.4 + Math.random() * 0.9;
      swayX[i] = 0.4 + Math.random() * 0.9;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Weicher runder Glow-Sprite auf einem Offscreen-Canvas.
    var sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    var sctx = sprite.getContext('2d');
    var grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 64, 64);
    var tex = new THREE.CanvasTexture(sprite);

    var mat = new THREE.PointsMaterial({
      size: 0.42,
      map: tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.75
    });
    mat.color = new THREE.Color(current.color[0], current.color[1], current.color[2]);

    var points = new THREE.Points(geo, mat);
    scene.add(points);

    var mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    var lastRgb = '';
    var clock = new THREE.Clock();
    var frame = 0;

    (function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      // Aktives Element nur alle paar Frames neu bestimmen (Layout-Reads sparen).
      if (frame % 8 === 0) {
        var p = activeProfile();
        // Farbe & Bewegungsparameter sanft interpolieren.
        var k = 0.05;
        current.color[0] += (p.color[0] - current.color[0]) * k;
        current.color[1] += (p.color[1] - current.color[1]) * k;
        current.color[2] += (p.color[2] - current.color[2]) * k;
        current.rise += (p.rise - current.rise) * k;
        current.sway += (p.sway - current.sway) * k;
        current.swaySpeed += (p.swaySpeed - current.swaySpeed) * k;
        mat.color.setRGB(current.color[0], current.color[1], current.color[2]);
        // Cursor-Glow auf das aktive Element tönen.
        if (p.rgb !== lastRgb) {
          document.body.style.setProperty('--cursor-glow-rgb', p.rgb);
          lastRgb = p.rgb;
        }
      }
      frame++;

      var pos = geo.attributes.position.array;
      var rise = current.rise, sway = current.sway, sSpeed = current.swaySpeed;
      for (var j = 0; j < COUNT; j++) {
        pos[j * 3 + 1] += speed[j] * rise * 0.012;
        pos[j * 3]     += Math.sin(t * sSpeed + phase[j]) * sway * 0.006 * swayX[j];
        if (pos[j * 3 + 1] > SPREAD_Y / 2) {
          pos[j * 3 + 1] = -SPREAD_Y / 2;
          pos[j * 3] = (Math.random() - 0.5) * SPREAD_X;
        }
      }
      geo.attributes.position.needsUpdate = true;

      // Feuer flackert etwas heller.
      var flicker = 0.72 + Math.sin(t * 6.0) * 0.04 * (targetKey === 'fire' ? 1 : 0.2);
      mat.opacity = flicker;

      // Sanfte Kamera-Parallaxe.
      camera.position.x += (mouseX * 0.9 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 0.6 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    })();

    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Bei reduzierter Bewegung: kein Auftrieb, nur ein ruhiges Farbfeld.
    if (reduced) {
      current.rise = 0;
      PROFILES.gold.rise = PROFILES.water.rise = PROFILES.fire.rise = PROFILES.air.rise = PROFILES.earth.rise = 0;
    }
  } catch (e) {
    canvas.style.display = 'none';
  }
})();
