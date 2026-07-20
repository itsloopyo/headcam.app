/* ============================================
   Headcam.app — Main JS
   Progressive enhancement — site works without JS
   ============================================ */

(function () {
  'use strict';

  var hero = document.getElementById('hero');
  var nav = document.getElementById('nav');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Sticky nav background on scroll ---
  if (nav && hero) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        nav.classList.toggle('scrolled', !entries[0].isIntersecting);
      },
      { threshold: 0, rootMargin: '-64px 0px 0px 0px' }
    );
    navObserver.observe(hero);
  }

  // --- Mobile nav toggle ---
  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      links.classList.toggle('open');
    });

    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      }
    });
  }

  // --- Scroll reveal ---
  var reveals = document.querySelectorAll('.reveal');

  if (reveals.length > 0) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ============================================
     TrueDepth-style face point cloud
     Follows cursor on desktop, gyroscope on mobile,
     idle sweep otherwise.
     ============================================ */
  var canvas = document.getElementById('face-canvas');
  var visual = document.getElementById('hero-visual');
  if (!canvas || !visual || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var roYaw = document.getElementById('ro-yaw');
  var roPitch = document.getElementById('ro-pitch');
  var roRoll = document.getElementById('ro-roll');

  function buildFace() {
    var pts = [];
    var LAT = 17;
    var LON = 24;
    var i, j, k, e;

    // Head shell: ellipsoid tapered toward the chin
    for (i = 1; i < LAT; i++) {
      var t = (i / LAT) * Math.PI;
      var y = Math.cos(t);
      var r = Math.sin(t);
      var taper = y < 0 ? 1 + 0.34 * y : 1;
      for (j = 0; j < LON; j++) {
        var p = (j / LON) * Math.PI * 2;
        pts.push({
          x: Math.sin(p) * r * 0.8 * taper,
          y: y * 1.15,
          z: Math.cos(p) * r * 0.92 * (y < 0 ? 1 + 0.22 * y : 1),
          f: 0
        });
      }
    }

    // Eyes
    for (e = -1; e <= 1; e += 2) {
      for (k = 0; k < 10; k++) {
        var a = (k / 10) * Math.PI * 2;
        pts.push({ x: e * 0.34 + Math.cos(a) * 0.12, y: 0.28 + Math.sin(a) * 0.08, z: 0.8, f: 1 });
      }
      pts.push({ x: e * 0.34, y: 0.28, z: 0.84, f: 1 });
    }

    // Brows
    for (e = -1; e <= 1; e += 2) {
      for (k = 0; k <= 4; k++) {
        pts.push({ x: e * (0.18 + k * 0.075), y: 0.46, z: 0.82 - k * 0.03, f: 1 });
      }
    }

    // Nose bridge, tip, nostrils
    for (k = 0; k <= 4; k++) {
      pts.push({ x: 0, y: 0.22 - k * 0.12, z: 0.8 + k * 0.07, f: 1 });
    }
    pts.push({ x: -0.11, y: -0.3, z: 0.88, f: 1 });
    pts.push({ x: 0.11, y: -0.3, z: 0.88, f: 1 });

    // Mouth
    for (k = 0; k <= 10; k++) {
      var mx = (k / 10 - 0.5) * 0.56;
      pts.push({ x: mx, y: -0.55, z: 0.76 - Math.abs(mx) * 0.2, f: 1 });
    }

    return pts;
  }

  var points = buildFace();
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0;
  var H = 0;

  function resize() {
    W = visual.clientWidth;
    H = visual.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', function () {
    resize();
    if (reducedMotion) render(0.35, -0.08, 0);
  });

  var yaw = 0.35;
  var pitch = -0.08;
  var mouseYaw = 0;
  var mousePitch = 0;
  var lastPointer = -1e9;
  var gyroActive = false;

  window.addEventListener('mousemove', function (e) {
    mouseYaw = (e.clientX / window.innerWidth - 0.5) * 1.3;
    mousePitch = (e.clientY / window.innerHeight - 0.5) * 0.7;
    lastPointer = performance.now();
  }, { passive: true });

  // --- Gyroscope on mobile: the page tracks YOUR motion ---
  function onOrientation(e) {
    if (e.gamma === null || e.beta === null) return;
    gyroActive = true;
    mouseYaw = Math.max(-1, Math.min(1, e.gamma / 35)) * 0.9;
    mousePitch = Math.max(-1, Math.min(1, (e.beta - 45) / 40)) * -0.5;
    lastPointer = performance.now();
  }

  var motionBtn = document.getElementById('motion-btn');
  var isTouch = window.matchMedia('(hover: none)').matches;

  if (isTouch && !reducedMotion && typeof DeviceOrientationEvent !== 'undefined') {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      if (motionBtn) {
        motionBtn.hidden = false;
        motionBtn.addEventListener('click', function () {
          DeviceOrientationEvent.requestPermission().then(function (state) {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', onOrientation, { passive: true });
              motionBtn.hidden = true;
            }
          }).catch(function () {});
        });
      }
    } else {
      window.addEventListener('deviceorientation', onOrientation, { passive: true });
    }
  }

  function render(ry, rx, rz) {
    ctx.clearRect(0, 0, W, H);

    var cy = Math.cos(ry), sy = Math.sin(ry);
    var cx = Math.cos(rx), sx = Math.sin(rx);
    var cz = Math.cos(rz), sz = Math.sin(rz);
    var R = Math.min(W, H) * 0.33;
    var cxn = W / 2;
    var cyn = H / 2;
    var persp = 3.6;

    for (var i = 0; i < points.length; i++) {
      var pt = points[i];
      var x1 = pt.x * cy + pt.z * sy;
      var z1 = -pt.x * sy + pt.z * cy;
      var y1 = pt.y * cx - z1 * sx;
      var z2 = pt.y * sx + z1 * cx;

      var xr = x1 * cz - y1 * sz;
      var yr = x1 * sz + y1 * cz;

      var s = persp / (persp - z2);
      var px = cxn + xr * s * R;
      var py = cyn - yr * s * R;

      var depth = (z2 + 1.4) / 2.8;
      var alpha, size;
      if (pt.f) {
        alpha = 0.35 + depth * 0.65;
        size = 2.1 * s;
        ctx.fillStyle = 'rgba(255, 176, 115,' + alpha.toFixed(3) + ')';
      } else {
        alpha = 0.08 + depth * 0.5;
        size = 1.4 * s;
        ctx.fillStyle = 'rgba(255, 92, 0,' + alpha.toFixed(3) + ')';
      }

      ctx.beginPath();
      ctx.arc(px, py, size, 0, 6.2832);
      ctx.fill();
    }
  }

  function updateReadouts(ry, rx, rz) {
    if (!roYaw) return;
    var fmt = function (rad) {
      var deg = rad * 57.2958;
      return (deg >= 0 ? '+' : '−') + Math.abs(deg).toFixed(1);
    };
    roYaw.textContent = fmt(ry);
    roPitch.textContent = fmt(rx);
    roRoll.textContent = fmt(rz);
  }

  if (reducedMotion) {
    render(0.35, -0.08, 0);
    updateReadouts(0.35, -0.08, 0);
    return;
  }

  var running = true;
  var visObserver = new IntersectionObserver(function (entries) {
    running = entries[0].isIntersecting;
  }, { threshold: 0 });
  visObserver.observe(visual);

  var frame = 0;

  function tick(now) {
    requestAnimationFrame(tick);
    if (!running) return;

    // Idle sweep when the pointer/gyro has been quiet for a while
    var idleYaw = Math.sin(now * 0.00042) * 0.5;
    var idlePitch = Math.sin(now * 0.00027) * 0.18 - 0.06;
    var w = gyroActive ? 1 : Math.max(0, Math.min(1, 1 - (now - lastPointer - 2500) / 1500));

    var targetYaw = idleYaw * (1 - w) + mouseYaw * w;
    var targetPitch = idlePitch * (1 - w) + mousePitch * w;

    yaw += (targetYaw - yaw) * 0.06;
    pitch += (targetPitch - pitch) * 0.06;
    var roll = yaw * 0.12;

    render(yaw, pitch, roll);

    if (++frame % 5 === 0) updateReadouts(yaw, pitch, roll);
  }

  requestAnimationFrame(tick);
})();
