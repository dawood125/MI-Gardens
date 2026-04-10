/**
 * MI Gardens — Main JavaScript
 * Pure vanilla JS, no libraries or frameworks
 */

(function () {
  'use strict';

  /* =========================================================
     NAVIGATION — Sticky scroll + transparent hero support
     ========================================================= */
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const isTransparent = nav.classList.contains('nav--transparent');

    function onScroll() {
      if (isTransparent) {
        if (window.scrollY > 60) {
          nav.classList.add('nav--scrolled');
          nav.classList.remove('nav--transparent');
        } else {
          nav.classList.remove('nav--scrolled');
          nav.classList.add('nav--transparent');
        }
      }
    }

    if (isTransparent) {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  /* =========================================================
     MOBILE MENU — Hamburger toggle with slide animation
     ========================================================= */
  function initMobileMenu() {
    const hamburger = document.querySelector('.nav__hamburger');
    const mobileMenu = document.querySelector('.nav__mobile');

    if (!hamburger || !mobileMenu) return;

    let isOpen = false;

    function openMenu() {
      isOpen = true;
      hamburger.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      isOpen = false;
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
      if (isOpen) closeMenu(); else openMenu();
    });

    // Close on mobile link click
    const mobileLinks = mobileMenu.querySelectorAll('.nav__mobile-link');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on resize to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 767 && isOpen) closeMenu();
    });
  }

  /* =========================================================
     SMOOTH SCROLL — Anchor links
     ========================================================= */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* =========================================================
     ACTIVE NAV LINK — Highlight current page
     ========================================================= */
  function initActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === currentPage ||
          (currentPage === '' && href === 'index.html') ||
          (currentPage === 'index.html' && href === './index.html')) {
        link.classList.add('nav__link--active');
      }
      // Check mobile links too
      if (link.classList.contains('nav__mobile-link')) {
        if (href === currentPage ||
            (currentPage === '' && href === 'index.html')) {
          link.classList.add('nav__mobile-link--active');
        }
      }
    });
  }

  /* =========================================================
     SCROLL ANIMATIONS — Fade-in on scroll
     ========================================================= */
  function initScrollAnimations() {
    const elements = document.querySelectorAll(
      '.service-card, .why-us__card, .testimonial-card, .service-full-card, .value-card, .team-card, .timeline__item'
    );

    if (!elements.length) return;

    // Add initial state
    elements.forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      el.style.transitionDelay = (i % 3) * 0.08 + 's';
    });

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* =========================================================
     COUNTER ANIMATION — Stats bar numbers
     ========================================================= */
  function initCounters() {
    const counters = document.querySelectorAll('.stats-bar__number');
    if (!counters.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const rawText = el.textContent.trim();
        const suffix = rawText.replace(/[0-9]/g, '');
        const target = parseInt(rawText.replace(/[^0-9]/g, ''));
        const duration = 1800;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * target);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  /* =========================================================
     CONTACT FORM VALIDATION
     ========================================================= */
  function initContactForm() {
    const form = document.querySelector('.contact-form__form');
    if (!form) return;

    let statusEl = form.querySelector('.form__status');

    function setStatus(message, type) {
      if (!statusEl) {
        statusEl = document.createElement('p');
        statusEl.className = 'form__status';
        statusEl.setAttribute('role', 'status');
        statusEl.setAttribute('aria-live', 'polite');
        form.appendChild(statusEl);
      }

      statusEl.classList.remove('form__status--info', 'form__status--success', 'form__status--error');
      statusEl.classList.add('form__status--' + type);
      statusEl.textContent = message;
    }

    function showError(input, message) {
      const group = input.closest('.form__group');
      if (!group) return;
      const errorEl = group.querySelector('.form__error');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('is-visible');
      }
      input.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
    }

    function clearError(input) {
      const group = input.closest('.form__group');
      if (!group) return;
      const errorEl = group.querySelector('.form__error');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('is-visible');
      }
      input.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
    }

    // Clear errors on input
    form.querySelectorAll('.form__input, .form__textarea, .form__select').forEach(function (input) {
      input.addEventListener('input', function () { clearError(this); });
      input.addEventListener('change', function () { clearError(this); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;

      const name = form.querySelector('#name');
      const email = form.querySelector('#email');
      const message = form.querySelector('#message');

      if (name && !name.value.trim()) {
        showError(name, 'Vul alstublieft uw naam in.');
        valid = false;
      }

      if (email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
          showError(email, 'Vul alstublieft uw e-mailadres in.');
          valid = false;
        } else if (!emailPattern.test(email.value.trim())) {
          showError(email, 'Vul alstublieft een geldig e-mailadres in.');
          valid = false;
        }
      }

      if (message && !message.value.trim()) {
        showError(message, 'Vul alstublieft uw bericht in.');
        valid = false;
      }

      if (!valid) {
        setStatus('Controleer de gemarkeerde velden en probeer opnieuw.', 'error');
        return;
      }

      setStatus('Uw gegevens zijn lokaal gecontroleerd. Dit formulier is momenteel een demo en verzendt nog geen e-mail. Neem tijdelijk contact op via telefoon of e-mail.', 'info');
    });
  }

  /* =========================================================
     INIT ALL
     ========================================================= */
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initMobileMenu();
    initSmoothScroll();
    initActiveNav();
    initScrollAnimations();
    initCounters();
    initContactForm();
  });

})();
