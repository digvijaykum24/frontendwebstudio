/* ==========================================================================
   Frontend Web Studio — Main JS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Preloader ---------- */
  var preloader = document.getElementById('preloader');
  window.addEventListener('load', function () {
    if (preloader) {
      setTimeout(function () { preloader.classList.add('hidden'); }, 250);
    }
  });
  // Fallback in case 'load' already fired or is delayed
  setTimeout(function () {
    if (preloader) preloader.classList.add('hidden');
  }, 1200);

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
    if (scrollProgress) scrollProgress.style.width = progress + '%';
  }

  /* ---------- Hero Cursor Glow ---------- */
  var heroSection = document.getElementById('home');
  var cursorGlow = document.getElementById('cursorGlow');
  if (heroSection && cursorGlow && window.matchMedia('(min-width: 993px)').matches) {
    var glowTicking = false;
    var glowEvent = null;
    heroSection.addEventListener('mousemove', function (e) {
      glowEvent = e;
      if (!glowTicking) {
        glowTicking = true;
        window.requestAnimationFrame(function () {
          var rect = heroSection.getBoundingClientRect();
          var x = ((glowEvent.clientX - rect.left) / rect.width) * 100;
          var y = ((glowEvent.clientY - rect.top) / rect.height) * 100;
          cursorGlow.style.setProperty('--glow-x', x + '%');
          cursorGlow.style.setProperty('--glow-y', y + '%');
          glowTicking = false;
        });
      }
    }, { passive: true });
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
  /* ---------- Scroll Reveal (IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll('.reveal-up');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Pause off-screen card border animation ----------
     The animated gradient card outlines only run while a card is
     actually on screen (toggled via 'in-view'), so scrolling isn't
     fighting dozens of always-on animations at once. */
  var animatedCards = document.querySelectorAll(
    '.service-card, .feature-card, .stat-card, .tech-card, .contact-form-wrap, ' +
    '.portfolio-card, .process-step, .pricing-card, .faq-item'
  );
  if ('IntersectionObserver' in window && animatedCards.length) {
    var cardObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('in-view', entry.isIntersecting);
      });
    }, { rootMargin: '100px 0px' });
    animatedCards.forEach(function (el) { cardObserver.observe(el); });
  } else {
    animatedCards.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Animated Stat Counters ---------- */
  var counters = document.querySelectorAll('.counter');
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }
    window.requestAnimationFrame(step);
  }

  if (counters.length && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = (el.getAttribute('data-target') || '0') + (el.getAttribute('data-suffix') || '');
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
          card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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
