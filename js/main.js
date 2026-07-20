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

  // --- Reduced motion: hold the hero demo on its poster frame ---
  var demo = document.querySelector('.hero-app-shot');
  if (demo && demo.tagName === 'VIDEO' && reducedMotion) {
    demo.removeAttribute('autoplay');
    demo.pause();
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
})();
