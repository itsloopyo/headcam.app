/* ============================================
   Headcam.app — Main JS
   Progressive enhancement — site works without JS
   ============================================ */

(function () {
  'use strict';

  var hero = document.getElementById('hero');
  var nav = document.getElementById('nav');

  // --- Sticky nav background on scroll ---
  if (nav && hero) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        nav.classList.toggle('scrolled', !entries[0].isIntersecting);
      },
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
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
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // --- Hero cursor-tracking reticle ---
  var tracker = document.getElementById('hero-tracker');
  if (!tracker || !hero) return;
  if (!window.matchMedia('(hover: hover)').matches) return;

  var halfSize = 80;
  var restX = 0.65;
  var restY = 0.45;
  var heroRect = hero.getBoundingClientRect();

  var currentX = heroRect.width * restX;
  var currentY = heroRect.height * restY;
  var targetX = currentX;
  var targetY = currentY;

  hero.addEventListener('mousemove', function (e) {
    heroRect = hero.getBoundingClientRect();
    targetX = e.clientX - heroRect.left;
    targetY = e.clientY - heroRect.top;
  });

  hero.addEventListener('mouseleave', function () {
    heroRect = hero.getBoundingClientRect();
    targetX = heroRect.width * restX;
    targetY = heroRect.height * restY;
  });

  function tick() {
    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;
    tracker.style.transform =
      'translate(' + (currentX - halfSize) + 'px,' + (currentY - halfSize) + 'px)';
    requestAnimationFrame(tick);
  }

  tracker.classList.add('active');
  tick();
})();
