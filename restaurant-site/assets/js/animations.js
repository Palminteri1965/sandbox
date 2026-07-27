document.documentElement.classList.remove('no-js');

var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var gsapReady = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

if (gsapReady) {
  gsap.registerPlugin(ScrollTrigger);
}

// All ".reveal" elements are visible by default (see input.css) so that a
// blocked/failed CDN script never leaves content permanently hidden. When
// GSAP is available we switch them to a hidden starting state here, then
// animate them in on scroll — a progressive-enhancement pattern, not a
// requirement for the content to be readable.
function initReveals() {
  if (!gsapReady) return;

  var groups = document.querySelectorAll('[data-reveal-group]');
  groups.forEach(function (group) {
    var items = group.querySelectorAll('.reveal');
    if (!items.length) return;
    gsap.set(items, { opacity: 0, y: prefersReduced ? 0 : 24 });
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: prefersReduced ? 0.01 : 0.5,
      ease: 'power1.out',
      stagger: prefersReduced ? 0 : 0.08,
      scrollTrigger: {
        trigger: group,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  var singles = document.querySelectorAll('.reveal:not([data-reveal-group] .reveal)');
  singles.forEach(function (el) {
    gsap.set(el, { opacity: 0, y: prefersReduced ? 0 : 24 });
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: prefersReduced ? 0.01 : 0.45,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
    });
  });
}

function initHeroEntrance() {
  if (!gsapReady) return;
  var words = document.querySelectorAll('[data-hero-word]');
  if (!words.length) return;
  gsap.set(words, { opacity: 0, y: prefersReduced ? 0 : 20 });
  gsap.to(words, {
    opacity: 1,
    y: 0,
    duration: prefersReduced ? 0.01 : 0.7,
    ease: 'expo.out',
    stagger: prefersReduced ? 0 : 0.06,
    delay: 0.15,
  });

  var subs = document.querySelectorAll('[data-hero-sub]');
  gsap.set(subs, { opacity: 0, y: prefersReduced ? 0 : 14 });
  gsap.to(subs, {
    opacity: 1,
    y: 0,
    duration: prefersReduced ? 0.01 : 0.6,
    ease: 'power1.out',
    stagger: prefersReduced ? 0 : 0.1,
    delay: 0.5,
  });
}

function initHeroParallax() {
  if (!gsapReady || prefersReduced) return;
  var media = document.querySelector('[data-hero-parallax]');
  if (!media) return;
  gsap.to(media, {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: {
      trigger: media,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
}

// Toggles the solid header background on scroll. Works with plain scroll
// events so it functions even when GSAP/ScrollTrigger fails to load.
function initHeader() {
  var header = document.querySelector('[data-site-header]');
  if (!header) return;

  var ticking = false;
  function update() {
    header.classList.toggle('is-scrolled', window.scrollY > 80);
    ticking = false;
  }
  window.addEventListener(
    'scroll',
    function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
  update();
}

function initMobileMenu() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-menu-panel]');
  if (!toggle || !panel) return;

  var tl = null;
  if (gsapReady) {
    tl = gsap
      .timeline({ paused: true })
      .set(panel, { display: 'flex' })
      .fromTo(
        panel,
        { autoAlpha: 0, y: -12 },
        { autoAlpha: 1, y: 0, duration: prefersReduced ? 0.01 : 0.3, ease: 'power1.out' }
      );
  }

  function open() {
    toggle.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    if (tl) {
      tl.play();
    } else {
      panel.hidden = false;
      panel.style.display = 'flex';
    }
  }

  function close() {
    toggle.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    if (tl) {
      tl.reverse();
    } else {
      panel.hidden = true;
      panel.style.display = 'none';
    }
  }

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      close();
    } else {
      open();
    }
  });

  panel.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', close);
  });
}

function initPressScale() {
  if (!gsapReady || prefersReduced) return;
  var pressables = document.querySelectorAll('[data-press]');
  pressables.forEach(function (el) {
    el.addEventListener('pointerdown', function () {
      gsap.to(el, { scale: 0.97, duration: 0.12, ease: 'power1.out' });
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (evt) {
      el.addEventListener(evt, function () {
        gsap.to(el, { scale: 1, duration: 0.2, ease: 'power1.out' });
      });
    });
  });
}

function initLightbox() {
  var dialog = document.querySelector('[data-lightbox]');
  if (!dialog) return;
  var caption = dialog.querySelector('[data-lightbox-caption]');
  var media = dialog.querySelector('[data-lightbox-media]');
  var closeBtn = dialog.querySelector('[data-lightbox-close]');

  document.querySelectorAll('[data-gallery-item]').forEach(function (item) {
    item.addEventListener('click', function () {
      var label = item.getAttribute('data-caption') || '';
      caption.textContent = label;
      media.innerHTML = item.querySelector('.photo-fallback').innerHTML;
      dialog.showModal();
    });
  });

  closeBtn.addEventListener('click', function () {
    dialog.close();
  });
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close();
  });
}

function initContactForm() {
  var form = document.querySelector('[data-contact-form]');
  if (!form) return;
  // `status` and `error` are siblings of the form, not descendants — query
  // from the document, not from `form`.
  var status = document.querySelector('[data-form-status]');
  var error = document.querySelector('[data-form-error]');
  var submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (error) error.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Request failed with ' + response.status);
        form.hidden = true;
        if (status) {
          status.hidden = false;
          status.focus();
        }
      })
      .catch(function () {
        if (error) error.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar solicitud de reserva';
      });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initReveals();
  initHeroEntrance();
  initHeroParallax();
  initHeader();
  initMobileMenu();
  initPressScale();
  initLightbox();
  initContactForm();
});
