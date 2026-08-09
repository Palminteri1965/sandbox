(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Language toggle (EN / ES) ---------- */
  var LANG_KEY = "eo-lang";
  var lang = localStorage.getItem(LANG_KEY) || "en";
  // Assigned later by the ember sound toggle (if present on the page) so its
  // aria-label stays in sync with language switches after the fact.
  var updateEmberSoundLabel;

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
    if (updateEmberSoundLabel) updateEmberSoundLabel();
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
        siteNav.classList.add("bg-garnet/95", "backdrop-blur", "shadow-lg", "shadow-black/20");
        siteNav.classList.remove("bg-transparent");
      } else {
        siteNav.classList.remove("bg-garnet/95", "backdrop-blur", "shadow-lg", "shadow-black/20");
        siteNav.classList.add("bg-transparent");
      }
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Side nav scroll-spy (one-page layout only) ---------- */
  /* On the 5-page site, side-nav links point at other pages (menu.html,
     etc.) and whichever one matches the current page is already marked
     .is-active server-side — nothing to do here. Only anchor links
     (onepage.html's #menu, #story, ...) get watched, since those all live
     on the same page and the "current" one changes as you scroll. */
  var sideNavItems = document.querySelectorAll("[data-side-nav-item]");
  if (sideNavItems.length && "IntersectionObserver" in window) {
    var sideNavSections = [];
    sideNavItems.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      var section = document.querySelector(href);
      if (section) sideNavSections.push({ link: link, section: section });
    });
    if (sideNavSections.length) {
      var spyObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var match = sideNavSections.filter(function (s) {
              return s.section === entry.target;
            })[0];
            if (!match) return;
            sideNavItems.forEach(function (l) {
              l.classList.remove("is-active");
            });
            match.link.classList.add("is-active");
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      sideNavSections.forEach(function (s) {
        spyObserver.observe(s.section);
      });
    }
  }

  /* ---------- Scroll-linked hero (clip-path reveal + parallax zoom) ---------- */
  /* Vanilla reimplementation of a framer-motion "smooth scroll hero": as the
     tall wrapper scrolls past, the sticky background's clip-path opens from
     an inset rectangle to full-bleed while the media zooms from 170% down
     to 100%. Works with either a background-image div or a <video> (the
     video only autoplays when motion isn't reduced). No React/framer-motion
     needed for this one effect. */
  var scrollHero = document.querySelector("[data-scroll-hero]");
  if (scrollHero) {
    var heroSticky = scrollHero.querySelector("[data-scroll-hero-sticky]");
    var heroBg = scrollHero.querySelector("[data-scroll-hero-bg]");
    var heroIsVideo = !!(heroBg && heroBg.tagName === "VIDEO");
    var heroScrollHeight = parseInt(scrollHero.getAttribute("data-scroll-height"), 10) || 1200;
    function readClipAttr(name, fallback) {
      var v = parseInt(scrollHero.getAttribute(name), 10);
      return isNaN(v) ? fallback : v;
    }
    var heroInitialClipX = readClipAttr("data-initial-clip-x", 25);
    var heroFinalClipX = readClipAttr("data-final-clip-x", 75);
    var heroInitialClipY = readClipAttr("data-initial-clip-y", 25);
    var heroFinalClipY = readClipAttr("data-final-clip-y", 75);

    if (reduceMotion) {
      heroSticky.style.clipPath = "none";
      if (heroBg && heroIsVideo) {
        heroBg.style.transform = "scale(1)";
        heroBg.pause();
      } else if (heroBg) {
        heroBg.style.backgroundSize = "cover";
      }
    } else {
      if (heroIsVideo) {
        // Autoplay is intentionally left off the <video> tag so no-JS/
        // reduced-motion visitors just see the poster frame.
        heroBg.play().catch(function () {
          /* Autoplay can still be blocked by the browser; poster stays put. */
        });
      }

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
          var clipStartX = lerp(heroInitialClipX, 0, t1);
          var clipEndX = lerp(heroFinalClipX, 100, t1);
          var clipStartY = lerp(heroInitialClipY, 0, t1);
          var clipEndY = lerp(heroFinalClipY, 100, t1);
          heroSticky.style.clipPath =
            "polygon(" +
            clipStartX + "% " + clipStartY + "%, " +
            clipEndX + "% " + clipStartY + "%, " +
            clipEndX + "% " + clipEndY + "%, " +
            clipStartX + "% " + clipEndY + "%)";

          if (heroBg) {
            var t2 = clamp(scrolled / (heroScrollHeight + 500), 0, 1);
            var size = lerp(170, 100, t2);
            if (heroIsVideo) {
              heroBg.style.transform = "scale(" + (size / 100).toFixed(3) + ")";
            } else {
              heroBg.style.backgroundSize = size.toFixed(1) + "%";
            }
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

  /* ---------- Static page-hero background video (no scroll-link, just a
     looping autoplay clip) ---------- */
  /* No autoplay attribute on the tag itself — browsers don't honor
     prefers-reduced-motion for native autoplay, so it's started here in JS
     where reduceMotion can gate it, same as the scroll-hero's video. */
  document.querySelectorAll("[data-page-hero-video]").forEach(function (v) {
    if (reduceMotion) {
      v.pause();
    } else {
      v.play().catch(function () {
        /* Autoplay can still be blocked by the browser; poster stays put. */
      });
    }
  });

  /* ---------- Ember crackle sound toggle (opt-in — browsers block audible
     autoplay, so the video stays muted and this lets visitors turn on the
     looping crackle sound themselves) ---------- */
  var soundToggle = document.querySelector("[data-ember-sound-toggle]");
  var emberAudio = document.querySelector("[data-ember-audio]");
  if (soundToggle && emberAudio) {
    var soundLabel = {
      on: { en: "Mute ember crackle sound", es: "Silenciar sonido de brasas" },
      off: { en: "Play ember crackle sound", es: "Activar sonido de brasas" },
    };
    updateEmberSoundLabel = function () {
      var copy = soundLabel[emberAudio.paused ? "off" : "on"];
      soundToggle.setAttribute("aria-label", lang === "es" ? copy.es : copy.en);
    };
    soundToggle.addEventListener("click", function () {
      if (emberAudio.paused) {
        emberAudio.play().catch(function () {
          /* Still blocked (rare) — button just stays in its "off" state. */
        });
      } else {
        emberAudio.pause();
      }
    });
    emberAudio.addEventListener("play", function () {
      soundToggle.classList.add("is-playing");
      soundToggle.setAttribute("aria-pressed", "true");
      updateEmberSoundLabel();
    });
    emberAudio.addEventListener("pause", function () {
      soundToggle.classList.remove("is-playing");
      soundToggle.setAttribute("aria-pressed", "false");
      updateEmberSoundLabel();
    });
    updateEmberSoundLabel();
  }

  /* ---------- Gallery lightbox ---------- */
  var galleryThumbs = document.querySelectorAll("[data-gallery-item]");
  if (galleryThumbs.length) {
    var lightbox = document.querySelector("[data-lightbox]");
    var lightboxImg = document.querySelector("[data-lightbox-img]");
    var lightboxCaption = document.querySelector("[data-lightbox-caption]");
    if (lightbox && lightboxImg) {
      var galleryList = Array.prototype.slice.call(galleryThumbs);
      var currentIndex = -1;
      var lastFocused = null;

      function showAt(index) {
        currentIndex = (index + galleryList.length) % galleryList.length;
        var item = galleryList[currentIndex];
        lightboxImg.classList.remove("is-shown");
        var img = new Image();
        img.onload = function () {
          lightboxImg.src = item.getAttribute("data-image");
          lightboxImg.alt = item.getAttribute("data-caption") || "";
          if (lightboxCaption) lightboxCaption.textContent = item.getAttribute("data-caption") || "";
          // Force a reflow so the fade/scale-in transition replays each time.
          void lightboxImg.offsetWidth;
          lightboxImg.classList.add("is-shown");
        };
        img.src = item.getAttribute("data-image");
      }

      function openLightbox(index, trigger) {
        lastFocused = trigger || document.activeElement;
        showAt(index);
        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
        var closeBtn = lightbox.querySelector("[data-lightbox-close]");
        if (closeBtn) closeBtn.focus();
      }

      function closeLightbox() {
        lightbox.classList.remove("is-open");
        lightboxImg.classList.remove("is-shown");
        document.body.style.overflow = "";
        if (lastFocused) lastFocused.focus();
      }

      galleryList.forEach(function (item, i) {
        item.addEventListener("click", function () {
          openLightbox(i, item);
        });
      });

      var closeEl = lightbox.querySelector("[data-lightbox-close]");
      var prevEl = lightbox.querySelector("[data-lightbox-prev]");
      var nextEl = lightbox.querySelector("[data-lightbox-next]");
      if (closeEl) closeEl.addEventListener("click", closeLightbox);
      if (prevEl) prevEl.addEventListener("click", function () { showAt(currentIndex - 1); });
      if (nextEl) nextEl.addEventListener("click", function () { showAt(currentIndex + 1); });

      lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) closeLightbox();
      });

      document.addEventListener("keydown", function (e) {
        if (!lightbox.classList.contains("is-open")) return;
        if (e.key === "Escape") closeLightbox();
        else if (e.key === "ArrowLeft") showAt(currentIndex - 1);
        else if (e.key === "ArrowRight") showAt(currentIndex + 1);
      });
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
  /* A large, soft ambient glow trails the pointer at rest, and draws in
     tight over links/text (see .is-hovering in input.css). Desktop mice
     only (skips touch/coarse pointers) and off entirely for
     prefers-reduced-motion. */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var emberCursor = document.createElement("div");
    emberCursor.id = "ember-cursor";
    emberCursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(emberCursor);

    var EMBER_BASE_SIZE = 130;
    var EMBER_HOVER_SCALE = 42 / EMBER_BASE_SIZE;
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
      var hovering = !!e.target.closest("a, button, [role='button'], input, textarea, .text-hover-ember");
      hoverScale = hovering ? EMBER_HOVER_SCALE : 1;
      emberCursor.classList.toggle("is-hovering", hovering);
    });

    (function raf() {
      curX += (mouseX - curX) * 0.16;
      curY += (mouseY - curY) * 0.16;
      var half = (EMBER_BASE_SIZE / 2);
      emberCursor.style.transform =
        "translate3d(" + (curX - half) + "px, " + (curY - half) + "px, 0) scale(" + hoverScale + ")";
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
