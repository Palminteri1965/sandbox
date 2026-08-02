(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Language toggle (EN / ES) ---------- */
  var LANG_KEY = "eo-lang";
  var lang = localStorage.getItem(LANG_KEY) || "en";

  function applyLang(next) {
    lang = next === "es" ? "es" : "en";
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-en]").forEach(function (el) {
      var value = lang === "es" ? el.getAttribute("data-es") : el.getAttribute("data-en");
      if (value !== null) el.textContent = value;
    });
    document.querySelectorAll("[data-en-attr]").forEach(function (el) {
      var attrName = el.getAttribute("data-attr-name") || "placeholder";
      var value = lang === "es" ? el.getAttribute("data-es-attr") : el.getAttribute("data-en-attr");
      if (value !== null) el.setAttribute(attrName, value);
    });
    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.textContent = lang === "es" ? "EN" : "ES";
      btn.setAttribute("aria-label", lang === "es" ? "Switch to English" : "Cambiar a español");
    });
    localStorage.setItem(LANG_KEY, lang);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-lang-toggle]");
    if (!btn) return;
    applyLang(lang === "es" ? "en" : "es");
  });

  applyLang(lang);

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("flex");
      mobileNav.classList.toggle("hidden");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.add("hidden");
        mobileNav.classList.remove("flex");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Sticky nav background on scroll ---------- */
  var siteNav = document.querySelector("[data-site-nav]");
  if (siteNav) {
    var onScroll = function () {
      if (window.scrollY > 24) {
        siteNav.classList.add("bg-charcoal/95", "backdrop-blur", "shadow-lg", "shadow-black/20");
        siteNav.classList.remove("bg-transparent");
      } else {
        siteNav.classList.remove("bg-charcoal/95", "backdrop-blur", "shadow-lg", "shadow-black/20");
        siteNav.classList.add("bg-transparent");
      }
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Scroll-linked hero (clip-path reveal + parallax zoom) ---------- */
  /* Vanilla reimplementation of a framer-motion "smooth scroll hero": as the
     tall wrapper scrolls past, the sticky background's clip-path opens from
     an inset rectangle to full-bleed while the image zooms from 170% down
     to 100%. No React/framer-motion needed for this one effect. */
  var scrollHero = document.querySelector("[data-scroll-hero]");
  if (scrollHero) {
    var heroSticky = scrollHero.querySelector("[data-scroll-hero-sticky]");
    var heroBg = scrollHero.querySelector("[data-scroll-hero-bg]");
    var heroScrollHeight = parseInt(scrollHero.getAttribute("data-scroll-height"), 10) || 1200;
    var heroInitialClip = parseInt(scrollHero.getAttribute("data-initial-clip"), 10);
    var heroFinalClip = parseInt(scrollHero.getAttribute("data-final-clip"), 10);
    heroInitialClip = isNaN(heroInitialClip) ? 25 : heroInitialClip;
    heroFinalClip = isNaN(heroFinalClip) ? 75 : heroFinalClip;

    if (reduceMotion) {
      heroSticky.style.clipPath = "none";
      if (heroBg) heroBg.style.backgroundSize = "cover";
    } else {
      (function () {
        var ticking = false;

        function clamp(v, min, max) {
          return Math.max(min, Math.min(max, v));
        }
        function lerp(a, b, t) {
          return a + (b - a) * t;
        }

        function render() {
          ticking = false;
          var rect = scrollHero.getBoundingClientRect();
          var scrolled = clamp(-rect.top, 0, heroScrollHeight + 500);

          var t1 = clamp(scrolled / heroScrollHeight, 0, 1);
          var clipStart = lerp(heroInitialClip, 0, t1);
          var clipEnd = lerp(heroFinalClip, 100, t1);
          heroSticky.style.clipPath =
            "polygon(" +
            clipStart + "% " + clipStart + "%, " +
            clipEnd + "% " + clipStart + "%, " +
            clipEnd + "% " + clipEnd + "%, " +
            clipStart + "% " + clipEnd + "%)";

          if (heroBg) {
            var t2 = clamp(scrolled / (heroScrollHeight + 500), 0, 1);
            heroBg.style.backgroundSize = lerp(170, 100, t2).toFixed(1) + "%";
          }
        }

        function onScroll() {
          if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(render);
          }
        }

        render();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
      })();
    }
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Scroll reveal (IntersectionObserver, no third-party script) ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var STAGGER_MS = 80;

    document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      var items = Array.prototype.slice.call(group.querySelectorAll(".reveal"));
      if (!items.length) return;
      items.forEach(function (item, i) {
        item.style.transitionDelay = (i * STAGGER_MS) + "ms";
      });
      var groupObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            items.forEach(function (item) { item.classList.add("in-view"); });
            groupObserver.disconnect();
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
      );
      groupObserver.observe(group);
    });

    var soloItems = document.querySelectorAll(".reveal:not([data-reveal-group] .reveal)");
    var soloObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          soloObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    soloItems.forEach(function (el) { soloObserver.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* ---------- Ember cursor halo ---------- */
  /* A small trailing glow that follows the pointer, like a drifting ember.
     Desktop mice only (skips touch/coarse pointers) and off entirely for
     prefers-reduced-motion. */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var emberCursor = document.createElement("div");
    emberCursor.id = "ember-cursor";
    emberCursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(emberCursor);

    var mouseX = 0, mouseY = 0, curX = 0, curY = 0, hoverScale = 1;

    document.addEventListener("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      emberCursor.classList.add("is-active");
    });

    document.addEventListener("mouseleave", function () {
      emberCursor.classList.remove("is-active");
    });

    document.addEventListener("mouseover", function (e) {
      hoverScale = e.target.closest("a, button, [role='button'], input, textarea") ? 1.7 : 1;
    });

    (function raf() {
      curX += (mouseX - curX) * 0.16;
      curY += (mouseY - curY) * 0.16;
      emberCursor.style.transform =
        "translate3d(" + (curX - 21) + "px, " + (curY - 21) + "px, 0) scale(" + hoverScale + ")";
      window.requestAnimationFrame(raf);
    })();
  }

  /* ---------- Contact / reservation form (no backend wired yet) ---------- */
  var form = document.querySelector("[data-reservation-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector("[data-form-status]");
      if (status) {
        status.hidden = false;
        applyLang(lang);
      }
      form.reset();
    });
  }
})();
