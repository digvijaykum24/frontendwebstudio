/* ==========================================================================
   Frontend Web Studio — Main JS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Sticky Navbar ---------- */
  var navbar = document.getElementById('navbar');
  function handleNavbarScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  /* ---------- Smooth Scroll for In-Page Links (no #hash in the URL) ---------- */
  var NAVBAR_OFFSET = 90; // navbar height (78px) + a little breathing room
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href').slice(1);
      var targetEl = targetId ? document.getElementById(targetId) : null;
      if (!targetEl) return;
      e.preventDefault();
      var targetY = targetEl.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
      window.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
    });
  });

  /* ---------- Scroll Progress Bar ---------- */
  var scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    if (scrollProgress) scrollProgress.style.transform = 'scaleX(' + (progress / 100) + ')';
  }

  /* ---------- Mobile Menu ---------- */
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  var overlay = document.getElementById('mobileOverlay');

  function openMenu() {
    hamburger.classList.add('active');
    navLinks.classList.add('active');
    overlay.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  hamburger.addEventListener('click', function () {
    if (navLinks.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });
  overlay.addEventListener('click', closeMenu);

  var navLinkItems = document.querySelectorAll('.nav-link, .nav-links .btn-nav');
  navLinkItems.forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth <= 1360) closeMenu();
    });
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1360) closeMenu();
  });

  /* ---------- Active Nav Link on Scroll ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var navAnchors = document.querySelectorAll('.nav-link');

  function setActiveLink() {
    var scrollPos = window.scrollY + 140;
    var currentId = '';
    sections.forEach(function (sec) {
      if (scrollPos >= sec.offsetTop) {
        currentId = sec.getAttribute('id');
      }
    });
    navAnchors.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentId) {
        link.classList.add('active');
      }
    });
  }

  /* ---------- Marquee: only animate while it's on screen ---------- */
  var marquee = document.getElementById('marquee');
  if (marquee && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      marquee.classList.toggle('is-paused', !entries[0].isIntersecting);
    }).observe(marquee);
  }

  /* ---------- Scroll Reveal (fade + slide up, once per element) ---------- */
  // Pricing cards reveal as one group (.pricing-grid): on phones they sit in a
  // horizontal slider, and the next card's peek must stay visible as the
  // "swipe me" hint instead of waiting to be scrolled into view.
  // Heading groups reveal piece by piece (label, title, text) for a cascade.
  // Containers whose children also reveal are left out so nothing fades twice.
  var revealTargets = document.querySelectorAll(
    '.marquee, .section-head > *, .about-content > :not(.stats-grid), .about-image, .stat-card, ' +
    '.service-card, .feature-card, .process-step, .pricing-grid, .pricing-fineprint, .pricing-note, ' +
    '.design-card, .design-pack, .design-perks, .portfolio-card, .portfolio-note, .tech-card, .faq-item, .cta-inner > *, ' +
    '.contact-info > *, .contact-form-wrap, .footer-grid > *'
  );
  var cardSelector = '.stat-card, .service-card, .feature-card, .process-step, .pricing-grid, ' +
    '.pricing-card, .design-card, .design-pack, .portfolio-card, .tech-card';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    revealTargets.forEach(function (el) {
      if (el.matches(cardSelector)) el.classList.add('reveal-3d');
      // Stagger siblings in a grid slightly (capped so long grids don't lag)
      var index = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--reveal-delay', Math.min(index, 5) * 100 + 'ms');
      el.classList.add('reveal');
    });
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        revealObserver.unobserve(el);
        var done = false;
        function finishReveal() {
          if (done) return;
          done = true;
          el.removeEventListener('transitionend', onRevealEnd);
          el.classList.remove('reveal', 'reveal-3d', 'is-visible');
          el.style.removeProperty('--reveal-delay');
        }
        function onRevealEnd(e) {
          if (e.target === el && e.propertyName === 'opacity') finishReveal();
        }
        el.addEventListener('transitionend', onRevealEnd);
        // Fallback in case transitionend never fires (e.g. tab in background)
        setTimeout(finishReveal, 1900);
        el.classList.add('is-visible');
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- 3D Card Tilt (mouse/trackpad only) ---------- */
  // Cards lean toward the pointer with a soft glare; wide cards tilt less so
  // big panels don't swing. Skipped on touch screens and for reduced motion.
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll(cardSelector.replace('.pricing-grid, ', '')).forEach(function (card) {
      var rect = null;
      var maxTilt = 8;
      var tiltFrame = null;
      var px = 0, py = 0;
      card.classList.add('tilt-card');

      function applyTilt() {
        tiltFrame = null;
        if (!rect) return;
        rect = card.getBoundingClientRect(); // stays right if the page scrolls mid-hover
        var x = (px - rect.left) / rect.width;
        var y = (py - rect.top) / rect.height;
        card.style.setProperty('--rx', ((0.5 - y) * maxTilt * 2).toFixed(2) + 'deg');
        card.style.setProperty('--ry', ((x - 0.5) * maxTilt * 2).toFixed(2) + 'deg');
        card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      }

      card.addEventListener('pointerenter', function () {
        // Wait until the scroll reveal has finished with this card
        if (card.classList.contains('reveal')) return;
        rect = card.getBoundingClientRect();
        maxTilt = Math.max(2, Math.min(8, 8 * 320 / rect.width));
        card.classList.add('is-tilting');
      });
      card.addEventListener('pointermove', function (e) {
        if (!rect) return;
        px = e.clientX;
        py = e.clientY;
        if (!tiltFrame) tiltFrame = requestAnimationFrame(applyTilt);
      });
      card.addEventListener('pointerleave', function () {
        rect = null;
        if (tiltFrame) cancelAnimationFrame(tiltFrame);
        tiltFrame = null;
        card.classList.remove('is-tilting');
        ['--rx', '--ry', '--gx', '--gy'].forEach(function (v) { card.style.removeProperty(v); });
      });
    });
  }

  /* ---------- Pricing Slider (mobile card swipe + dots) ---------- */
  var pricingGrid = document.querySelector('.pricing-grid');
  var pricingDots = document.getElementById('pricingDots');
  if (pricingGrid && pricingDots) {
    var pricingCards = pricingGrid.querySelectorAll('.pricing-card');
    var pricingMql = window.matchMedia('(max-width: 640px)');

    function isPricingSliderActive() {
      return pricingMql.matches;
    }

    function buildPricingDots() {
      pricingDots.innerHTML = '';
      pricingCards.forEach(function (card, i) {
        var dot = document.createElement('span');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', function () {
          pricingGrid.scrollTo({
            left: card.offsetLeft - (pricingGrid.clientWidth - card.offsetWidth) / 2,
            behavior: 'smooth'
          });
        });
        pricingDots.appendChild(dot);
      });
    }

    function updateActivePricingDot() {
      var dots = pricingDots.querySelectorAll('span');
      if (!dots.length) return;
      var gridRect = pricingGrid.getBoundingClientRect();
      var gridCenter = gridRect.left + gridRect.width / 2;
      var closestIndex = 0;
      var closestDistance = Infinity;
      pricingCards.forEach(function (card, i) {
        var cardRect = card.getBoundingClientRect();
        var cardCenter = cardRect.left + cardRect.width / 2;
        var distance = Math.abs(gridCenter - cardCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === closestIndex); });
    }

    function syncPricingSlider() {
      if (isPricingSliderActive() && !pricingDots.children.length) {
        buildPricingDots();
      } else if (!isPricingSliderActive() && pricingDots.children.length) {
        pricingDots.innerHTML = '';
      }
    }

    syncPricingSlider();
    pricingGrid.addEventListener('scroll', function () {
      if (isPricingSliderActive()) updateActivePricingDot();
    }, { passive: true });
    window.addEventListener('resize', syncPricingSlider);
  }

  /* ---------- FAQ Accordion ---------- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    question.addEventListener('click', function () {
      var isActive = item.classList.contains('active');
      faqItems.forEach(function (el) { el.classList.remove('active'); });
      if (!isActive) item.classList.add('active');
    });
  });

  /* ---------- Back To Top ---------- */
  var backToTop = document.getElementById('backToTop');
  function updateBackToTop() {
    if (window.scrollY > 500) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  }
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Scroll Listener (batched via rAF) ----------
     Navbar state, scroll progress, active nav link, and the back-to-top
     button all react to scroll — run them together in a single
     requestAnimationFrame callback per frame instead of four separate
     listeners, so scrolling stays smooth instead of doing repeated
     layout/style work on every scroll event. */
  var scrollTicking = false;
  function onScrollUpdates() {
    handleNavbarScroll();
    updateScrollProgress();
    setActiveLink();
    updateBackToTop();
    scrollTicking = false;
  }
  function requestScrollUpdate() {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(onScrollUpdates);
    }
  }
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', updateScrollProgress);
  onScrollUpdates();

  /* ---------- Contact Form Validation + Formspree Submission ---------- */
  var form = document.getElementById('contactForm');
  var formSuccess = document.getElementById('formSuccess');
  var formError = document.getElementById('formError');
  var formSubmitBtn = document.getElementById('formSubmitBtn');
  var submitBtnLabel = formSubmitBtn ? formSubmitBtn.querySelector('.btn-label') : null;
  var defaultBtnHTML = submitBtnLabel ? submitBtnLabel.innerHTML : '';

  function setError(group, message) {
    group.classList.add('error');
    var msg = group.querySelector('.error-msg');
    if (msg) msg.textContent = message;
  }
  function clearError(group) {
    group.classList.remove('error');
    var msg = group.querySelector('.error-msg');
    if (msg) msg.textContent = '';
  }

  function validateField(field) {
    var group = field.closest('.form-group');
    var value = field.value.trim();

    if (field.hasAttribute('required') && value === '') {
      setError(group, 'This field is required.');
      return false;
    }

    if (field.id === 'fullName' && value !== '') {
      if (value.length < 3) {
        setError(group, 'Please enter your full name.');
        return false;
      }
    }

    if (field.id === 'mobile' && value !== '') {
      var phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(value)) {
        setError(group, 'Enter a valid 10-digit mobile number.');
        return false;
      }
    }

    if (field.id === 'email' && value !== '') {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setError(group, 'Enter a valid email address.');
        return false;
      }
    }

    if (field.id === 'message' && value !== '') {
      if (value.length < 10) {
        setError(group, 'Please enter at least 10 characters.');
        return false;
      }
    }

    clearError(group);
    return true;
  }

  if (form) {
    var fields = form.querySelectorAll('input:not([type="hidden"]), select, textarea');
    fields.forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        var group = field.closest('.form-group');
        if (group.classList.contains('error')) validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var isValid = true;

      fields.forEach(function (field) {
        if (!validateField(field)) isValid = false;
      });

      formSuccess.classList.remove('show');
      formError.classList.remove('show');

      if (!isValid) {
        var firstError = form.querySelector('.form-group.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      if (formSubmitBtn) {
        formSubmitBtn.setAttribute('disabled', 'true');
        if (submitBtnLabel) {
          submitBtnLabel.innerHTML = '<i class="fa-solid fa-spinner"></i> Sending...';
        }
      }

      fetch(form.action, {
        method: form.method || 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            formSuccess.classList.add('show');
            form.reset();
            setTimeout(function () {
              formSuccess.classList.remove('show');
            }, 6000);
          } else {
            formError.classList.add('show');
          }
        })
        .catch(function () {
          formError.classList.add('show');
        })
        .finally(function () {
          if (formSubmitBtn) {
            formSubmitBtn.removeAttribute('disabled');
            if (submitBtnLabel) {
              submitBtnLabel.innerHTML = defaultBtnHTML;
            }
          }
        });
    });
  }

});
