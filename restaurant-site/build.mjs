// Tiny static-site generator: template literals in, plain .html files out.
// Run with `npm run build:html` (see package.json). No client-side framework;
// this only avoids copy-pasting the nav/footer/head across five pages.
import { writeFileSync } from "node:fs";
import { icons } from "./lib/icons.mjs";

const SITE = {
  name: "Ember & Oak",
  fullName: "Ember & Oak Steakhouse",
  tagline: { en: "Wood-Fired Steaks, Pacific Northwest Soul", es: "Carnes al Fuego de Leña, Alma del Pacífico Noroeste" },
  phoneDisplay: "(206) 555-0142",
  phoneHref: "tel:+12065550142",
  email: "reservations@emberandoak.com",
  addressLine1: "2100 Western Avenue",
  addressLine2: "Seattle, WA 98121",
  mapsHref: "https://maps.google.com/?q=2100+Western+Ave+Seattle+WA+98121",
  instagramHref: "#",
  facebookHref: "#",
};

const escText = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => escText(s).replace(/"/g, "&quot;");

/** Bilingual inline text node. Falls back to English at first paint (no-JS/SEO safe). */
const t = (en, es) => `<span data-en="${escAttr(en)}" data-es="${escAttr(es)}">${escText(en)}</span>`;

/** Bilingual attribute (e.g. placeholder, aria-label) on an existing tag. */
const tAttr = (attrName, en, es) =>
  `${attrName}="${escAttr(en)}" data-attr-name="${attrName}" data-en-attr="${escAttr(en)}" data-es-attr="${escAttr(es)}"`;

/** Renders a real photo (with optional WebP source) in place of the dashed
 * placeholder once one exists for a given spot — same rounded-card shape. */
function photoOrPlaceholder({ image, imageWebp, caption, ratio = "aspect-[4/5]", iconCls = "h-8 w-8", cls = "" }) {
  if (!image) return photoPlaceholder({ caption, ratio, iconCls });
  const bgImage = imageWebp
    ? `background-image: url('${escAttr(image)}'); background-image: image-set(url('${escAttr(imageWebp)}') type('image/webp'), url('${escAttr(image)}') type('image/jpeg'));`
    : `background-image: url('${escAttr(image)}');`;
  return `<div class="${ratio} w-full rounded-sm bg-center bg-cover bg-no-repeat ${cls}" style="${bgImage}"></div>`;
}

function photoPlaceholder({ caption, ratio = "aspect-[4/5]", iconCls = "h-8 w-8" }) {
  return `
  <div class="${ratio} w-full rounded-sm bg-gradient-to-br from-charcoal via-ink to-charcoal relative overflow-hidden flex items-center justify-center text-cream/40">
    <div class="absolute inset-0 opacity-[0.08]" style="background-image: radial-gradient(circle at 20% 20%, #fff 0, transparent 35%), radial-gradient(circle at 80% 60%, #fff 0, transparent 40%);"></div>
    <div class="relative flex flex-col items-center gap-2 px-4 text-center">
      ${icons.camera(iconCls)}
      <p class="text-[11px] uppercase tracking-widest text-cream/50">${escText(caption)}</p>
    </div>
  </div>`;
}

function head({ title, description }) {
  return `<meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escText(title)}</title>
  <meta name="description" content="${escAttr(description)}">
  <meta name="theme-color" content="#1C1917">
  <link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="%231C1917"/><text x="12" y="16.5" font-family="Georgia,serif" font-size="12" fill="%23C88A2E" text-anchor="middle">EO</text></svg>')}">
  <meta property="og:title" content="${escAttr(title)}">
  <meta property="og:description" content="${escAttr(description)}">
  <meta property="og:type" content="restaurant.restaurant">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="dist/styles.css">
  <script>document.documentElement.classList.add('js');</script>`;
}

function nav(active, { items, logoHref = "index.html" } = {}) {
  items = items || [
    { href: "index.html", en: "Home", es: "Inicio", key: "home" },
    { href: "menu.html", en: "Menu", es: "Menú", key: "menu" },
    { href: "about.html", en: "Our Story", es: "Nuestra Historia", key: "about" },
    { href: "gallery.html", en: "Gallery", es: "Galería", key: "gallery" },
    { href: "contact.html", en: "Reservations", es: "Reservas", key: "contact" },
  ];
  const linkCls = (key) => `nav-link${key === active ? " nav-link-active" : ""}`;
  const desktopLinks = items
    .map((i) => `<a href="${i.href}" class="${linkCls(i.key)}"${i.key === active ? ' aria-current="page"' : ""}>${t(i.en, i.es)}</a>`)
    .join("\n        ");
  const mobileLinks = items
    .map(
      (i) =>
        `<a href="${i.href}" class="block py-3 text-base uppercase tracking-wider ${i.key === active ? "text-gold-soft" : "text-cream/90"} border-b border-cream/10"${i.key === active ? ' aria-current="page"' : ""}>${t(i.en, i.es)}</a>`
    )
    .join("\n          ");

  return `
  <header data-site-nav class="fixed inset-x-0 top-0 z-50 transition-colors duration-300 bg-transparent on-dark">
    <nav class="mx-auto max-w-content flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20" aria-label="${escAttr("Primary")}">
      <a href="${logoHref}" class="font-display text-xl sm:text-2xl text-cream tracking-wide">
        Ember<span class="text-gold"> &amp; </span>Oak
      </a>
      <div class="hidden md:flex items-center gap-8">
        ${desktopLinks}
        <button type="button" data-lang-toggle class="text-xs font-semibold tracking-widest border border-cream/30 rounded-full h-9 min-w-[44px] px-3 text-cream/80 hover:text-gold-soft hover:border-gold/60 hover:shadow-[0_0_16px_-4px_rgba(200,138,46,0.65)] transition-all duration-300 cursor-pointer" aria-label="${escAttr("Switch to Spanish")}">ES</button>
        <a href="${SITE.phoneHref}" class="btn-primary">${t("Reserve", "Reservar")}</a>
      </div>
      <div class="flex items-center gap-3 md:hidden">
        <button type="button" data-lang-toggle class="text-xs font-semibold tracking-widest border border-cream/30 rounded-full h-9 min-w-[44px] px-3 text-cream/80 cursor-pointer" aria-label="${escAttr("Switch to Spanish")}">ES</button>
        <button type="button" data-nav-toggle aria-expanded="false" aria-controls="mobile-nav" class="h-11 w-11 flex items-center justify-center text-cream cursor-pointer" aria-label="${escAttr("Open menu")}">
          ${icons.menu("h-6 w-6")}
        </button>
      </div>
    </nav>
    <div id="mobile-nav" data-mobile-nav class="hidden md:hidden flex-col bg-charcoal/98 backdrop-blur px-4 sm:px-6 pb-4">
      ${mobileLinks}
      <a href="${SITE.phoneHref}" class="btn-primary mt-4 w-full">${t("Reserve a Table", "Reservar una Mesa")}</a>
    </div>
  </header>`;
}

function footer() {
  return `
  <footer class="on-dark text-cream/80">
    <div class="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-16 grid gap-12 md:grid-cols-4">
      <div class="md:col-span-2">
        <p class="font-display text-2xl text-cream">${SITE.fullName}</p>
        <p class="mt-3 max-w-sm text-sm leading-relaxed text-cream/60">${t(
          "Dry-aged steaks, live-fire cooking, and Pacific Northwest hospitality in the heart of Seattle.",
          "Carnes maduradas en seco, cocina a fuego vivo y hospitalidad del Pacífico Noroeste en el corazón de Seattle."
        )}</p>
        <div class="mt-6 flex items-center gap-4">
          <a href="${SITE.instagramHref}" class="h-10 w-10 flex items-center justify-center rounded-full border border-cream/20 hover:border-gold hover:text-gold-soft hover:shadow-[0_0_16px_-3px_rgba(200,138,46,0.65)] transition-all duration-300" aria-label="Instagram">${icons.instagram("h-4 w-4")}</a>
          <a href="${SITE.facebookHref}" class="h-10 w-10 flex items-center justify-center rounded-full border border-cream/20 hover:border-gold hover:text-gold-soft hover:shadow-[0_0_16px_-3px_rgba(200,138,46,0.65)] transition-all duration-300" aria-label="Facebook">${icons.facebook("h-4 w-4")}</a>
        </div>
      </div>
      <div>
        <p class="eyebrow">${t("Visit", "Visítanos")}</p>
        <ul class="mt-4 space-y-3 text-sm text-cream/70">
          <li class="flex items-start gap-2">${icons.pin("h-4 w-4 mt-0.5 text-gold shrink-0")}<a href="${SITE.mapsHref}" class="hover:text-gold-soft">${SITE.addressLine1}, ${SITE.addressLine2}</a></li>
          <li class="flex items-start gap-2">${icons.phone("h-4 w-4 mt-0.5 text-gold shrink-0")}<a href="${SITE.phoneHref}" class="hover:text-gold-soft">${SITE.phoneDisplay}</a></li>
          <li class="flex items-start gap-2">${icons.mail("h-4 w-4 mt-0.5 text-gold shrink-0")}<a href="mailto:${SITE.email}" class="hover:text-gold-soft">${SITE.email}</a></li>
        </ul>
      </div>
      <div>
        <p class="eyebrow">${t("Hours", "Horario")}</p>
        <ul class="mt-4 space-y-2 text-sm text-cream/70">
          <li class="flex justify-between gap-4"><span>${t("Tue – Thu", "Mar – Jue")}</span><span>4:30 – 10:00 PM</span></li>
          <li class="flex justify-between gap-4"><span>${t("Fri – Sat", "Vie – Sáb")}</span><span>4:30 – 11:00 PM</span></li>
          <li class="flex justify-between gap-4"><span>${t("Sunday", "Domingo")}</span><span>4:00 – 9:00 PM</span></li>
          <li class="flex justify-between gap-4 text-cream/40"><span>${t("Monday", "Lunes")}</span><span>${t("Closed", "Cerrado")}</span></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-cream/10">
      <div class="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-cream/40">
        <p>&copy; <span data-year>2026</span> ${SITE.fullName}. ${t("All rights reserved.", "Todos los derechos reservados.")}</p>
        <p>${t("Seattle, Washington", "Seattle, Washington")}</p>
      </div>
    </div>
  </footer>`;
}

function scripts() {
  return `
  <script src="js/main.js" defer></script>`;
}

function page({ title, description, active, jsonLd = "", main, navItems, navLogoHref }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${head({ title, description })}
  ${jsonLd}
</head>
<body class="text-cream">
  ${nav(active, { items: navItems, logoHref: navLogoHref })}
  <main>
${main}
  </main>
  ${footer()}
  ${scripts()}
</body>
</html>
`;
}

/* ==================================================================== */
/* Shared bits                                                          */
/* ==================================================================== */

function pageHero({ eyebrow, title, subtitle, ratio = "aspect-[16/9] md:aspect-[21/9]", image, imageWebp }) {
  const bgImage = imageWebp
    ? `background-image: url('${escAttr(image)}'); background-image: image-set(url('${escAttr(imageWebp)}') type('image/webp'), url('${escAttr(image)}') type('image/jpeg'));`
    : image
    ? `background-image: url('${escAttr(image)}');`
    : "";
  const photo = image
    ? `<div class="${ratio} w-full bg-center bg-cover bg-no-repeat" style="${bgImage}"></div>`
    : photoPlaceholder({ caption: eyebrow.en + " — hero photography", ratio, iconCls: "h-10 w-10" });
  // Rather than overlaying a guessed solid color to fake a blend, the photo
  // and its darkening tint both fade to fully transparent over their last
  // ~28%, letting the real body gradient (see input.css) show through
  // underneath — an exact match on every page, whatever its total height.
  const fadeMask = image
    ? `mask-image: linear-gradient(to bottom, black 0%, black 72%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 0%, black 72%, transparent 100%);`
    : "";
  return `
  <section class="relative pt-20">
    <div style="${fadeMask}">${photo}</div>
    <div class="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/50 to-ink/20" style="${fadeMask}"></div>
    <div class="absolute inset-0 flex items-end">
      <div class="mx-auto max-w-content w-full px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
        <p class="eyebrow reveal flex items-center gap-3">
          <span class="h-px w-8 bg-gold/60" aria-hidden="true"></span>
          ${t(eyebrow.en, eyebrow.es)}
        </p>
        <h1 class="mt-4 font-display font-normal uppercase tracking-[0.01em] leading-[0.95] text-cream text-4xl sm:text-6xl lg:text-7xl reveal">${t(title.en, title.es)}</h1>
        ${subtitle ? `<p class="mt-5 max-w-xl font-display italic text-cream/70 text-lg sm:text-xl reveal">${t(subtitle.en, subtitle.es)}</p>` : ""}
      </div>
    </div>
  </section>`;
}

/**
 * Vanilla port of a scroll-linked "smooth scroll hero": the page loads with
 * the media clipped down to a small centered window, and as the user scrolls
 * through a tall wrapper the clip-path opens to full-bleed while the media
 * zooms from 170% down to 100%. All the motion is computed in js/main.js
 * from scroll position — no React/framer-motion dependency.
 *
 * Pass either `image` (+ optional `imageWebp`) for a static photo, or `video`
 * for an autoplaying background clip (used instead of the image when given).
 */
function scrollHero({
  image,
  imageWebp,
  video,
  scrollHeightPx = 1200,
  initialClipX = 25,
  finalClipX = 75,
  initialClipY = 25,
  finalClipY = 75,
  overlayContent,
}) {
  // Plain url() first so browsers without image-set() support keep it; the
  // image-set() declaration after wins the cascade wherever it's understood,
  // handing WebP to browsers that can decode it and JPEG to everyone else.
  const bgImage = imageWebp
    ? `background-image: url('${escAttr(image)}'); background-image: image-set(url('${escAttr(imageWebp)}') type('image/webp'), url('${escAttr(image)}') type('image/jpeg'));`
    : `background-image: url('${escAttr(image)}');`;
  const bg = video
    ? `<video data-scroll-hero-bg class="absolute inset-0 h-full w-full object-cover" style="transform: scale(1.7);"
        muted loop playsinline preload="auto" poster="${escAttr(video.poster || image || "")}">
        ${video.webm ? `<source src="${escAttr(video.webm)}" type="video/webm">` : ""}
        <source src="${escAttr(video.src)}" type="video/mp4">
      </video>`
    : `<div data-scroll-hero-bg class="absolute inset-0 bg-center bg-no-repeat" style="${bgImage} background-size: 170%;"></div>`;
  return `
  <div data-scroll-hero data-scroll-height="${scrollHeightPx}"
    data-initial-clip-x="${initialClipX}" data-final-clip-x="${finalClipX}"
    data-initial-clip-y="${initialClipY}" data-final-clip-y="${finalClipY}"
    class="relative w-full" style="height: calc(${scrollHeightPx}px + 100vh);">
    <div data-scroll-hero-sticky class="sticky top-0 h-screen w-full overflow-hidden bg-ink"
      style="clip-path: polygon(${initialClipX}% ${initialClipY}%, ${finalClipX}% ${initialClipY}%, ${finalClipX}% ${finalClipY}%, ${initialClipX}% ${finalClipY}%);">
      ${bg}
    </div>
    <div class="sticky top-0 -mt-[100vh] h-screen w-full pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/40"></div>
      ${overlayContent}
    </div>
  </div>`;
}

function reservationBand({ formHref = "contact.html" } = {}) {
  return `
  <section class="bg-gold on-light">
    <div class="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      <div>
        <p class="font-display text-2xl sm:text-3xl text-ink">${t("Ready for the wood-fired experience?", "¿Listo para la experiencia al fuego de leña?")}</p>
        <p class="text-ink/70 mt-1 text-sm">${t("Call or email us — a member of our team will confirm within one business day.", "Llámanos o escríbenos: un miembro de nuestro equipo confirmará en un día hábil.")}</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 shrink-0">
        <a href="${SITE.phoneHref}" class="btn-outline-dark bg-ink !text-cream border-ink hover:!bg-charcoal">
          ${icons.phone("h-4 w-4")} ${SITE.phoneDisplay}
        </a>
        <a href="${formHref}" class="btn-outline-dark">${t("Reservation Form", "Formulario de Reserva")}</a>
      </div>
    </div>
  </section>`;
}

/* ==================================================================== */
/* HOME                                                                  */
/* ==================================================================== */

/** "From the Fire" signature-dishes teaser — shared by the home page and the one-page layout. */
function signatureDishesSection({ menuHref = "menu.html" } = {}) {
  return `
  <section class="py-20 sm:py-28 on-dark border-t border-cream/5" data-reveal-group>
    <div class="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl reveal">
        <p class="eyebrow">${t("Signature", "Firma de la Casa")}</p>
        <h2 class="section-heading mt-3 text-cream">${t("From the Fire", "Desde el Fuego")}</h2>
      </div>
      <div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        ${[
          {
            en: ["Dry-Aged Bone-In Ribeye", "45-day dry-aged, hearth-roasted, bone marrow butter."],
            es: ["Ribeye con Hueso Madurado", "Madurado en seco 45 días, asado a la parrilla, mantequilla de tuétano."],
            cap: "Bone-in ribeye on the hearth",
            image: "images/bone-in-ribeye.jpg",
            imageWebp: "images/bone-in-ribeye.webp",
          },
          {
            en: ["Tomahawk for Two", "34oz Pacific Northwest beef, rosemary smoke, chimichurri."],
            es: ["Tomahawk para Dos", "34oz de res del Pacífico Noroeste, humo de romero, chimichurri."],
            cap: "Tomahawk carving table",
            image: "images/tomahawk-carving-table.jpg",
            imageWebp: "images/tomahawk-carving-table.webp",
          },
          {
            en: ["Alder-Planked King Salmon", "Local king salmon, citrus glaze, charred fennel."],
            es: ["Salmón Real en Tabla de Aliso", "Salmón real local, glaseado cítrico, hinojo asado."],
            cap: "Alder-planked salmon",
            image: "images/alder-planked-salmon.jpg",
            imageWebp: "images/alder-planked-salmon.webp",
          },
        ]
          .map(
            (d) => `
        <article class="dish-card group reveal relative">
          ${photoOrPlaceholder({ image: d.image, imageWebp: d.imageWebp, caption: d.cap, ratio: "aspect-[4/5]", cls: "dish-photo" })}
          <h3 class="dish-caption mt-5 font-display text-xl text-cream text-hover-ember inline-block">${t(d.en[0], d.es[0])}</h3>
          <p class="dish-caption mt-2 text-sm text-cream/60 leading-relaxed">${t(d.en[1], d.es[1])}</p>
        </article>`
          )
          .join("\n        ")}
      </div>
      <div class="mt-12 reveal">
        <a href="${menuHref}" class="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-cream border-b border-gold pb-1 hover:text-gold transition-colors">
          ${t("See the Full Menu", "Ver el Menú Completo")} ${icons.arrowRight("h-4 w-4")}
        </a>
      </div>
    </div>
  </section>`;
}

/** Guest quotes — shared by the home page and the one-page layout. */
function testimonialsSection() {
  return `
  <section class="py-20 sm:py-28 on-dark border-t border-cream/5" data-reveal-group>
    <div class="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl mx-auto text-center reveal">
        <p class="eyebrow justify-center flex">${t("Guests", "Comensales")}</p>
        <h2 class="section-heading mt-3 text-cream">${t("What Seattle is Saying", "Lo que Dice Seattle")}</h2>
      </div>
      <div class="mt-12 grid gap-8 md:grid-cols-3">
        ${[
          {
            en: "Best steak I've had in Seattle, full stop. The tomahawk for two is a showstopper.",
            es: "El mejor bistec que he probado en Seattle, sin duda. El tomahawk para dos es espectacular.",
            name: "Danielle R.",
          },
          {
            en: "Warm, unpretentious service and a wine list that actually knows the Northwest.",
            es: "Servicio cálido y sin pretensiones, con una carta de vinos que realmente conoce el Noroeste.",
            name: "Marcus T.",
          },
          {
            en: "The alder-planked salmon converted my steak-only husband. We're already rebooking.",
            es: "El salmón en tabla de aliso convenció a mi esposo, que solo comía carne. Ya reservamos de nuevo.",
            name: "Priya K.",
          },
        ]
          .map(
            (r) => `
        <figure class="reveal bg-white/[0.04] rounded-sm p-8 border border-cream/10 transition-colors duration-300 hover:border-gold/40 hover:bg-white/[0.06]">
          <div class="flex gap-1 text-gold">${icons.star("h-4 w-4")}${icons.star("h-4 w-4")}${icons.star("h-4 w-4")}${icons.star("h-4 w-4")}${icons.star("h-4 w-4")}</div>
          ${icons.quote("h-6 w-6 text-gold/40 mt-4")}
          <blockquote class="mt-2 text-cream/75 leading-relaxed">${t(r.en, r.es)}</blockquote>
          <figcaption class="mt-4 text-sm font-semibold text-cream">${r.name}</figcaption>
        </figure>`
          )
          .join("\n        ")}
      </div>
    </div>
  </section>`;
}

function homeHero() {
  return scrollHero({
    image: "images/hero-steak.jpg",
    imageWebp: "images/hero-steak.webp",
    video: { src: "images/hero-steak.mp4", webm: "images/hero-steak.webm", poster: "images/hero-steak.jpg" },
    scrollHeightPx: 1200,
    // The wordmark occupies the top ~55-60% of the viewport at rest, so the
    // clipped preview starts as a letterbox band clear of the text instead
    // of a centered square — it still opens out to full-bleed on scroll.
    initialClipX: 5,
    finalClipX: 95,
    initialClipY: 66,
    finalClipY: 92,
    overlayContent: `
      <div class="relative h-full w-full flex flex-col justify-between pointer-events-auto">
        <div class="mx-auto max-w-content w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32">
          <p class="eyebrow reveal flex items-center gap-3">
            <span class="h-px w-8 bg-gold/60" aria-hidden="true"></span>
            ${t("Est. 2016 · Seattle, Washington", "Fundado en 2016 · Seattle, Washington")}
          </p>
          <h1 class="mt-5 font-wordmark font-light uppercase text-cream leading-[0.92] tracking-[0.16em] sm:tracking-[0.22em] text-[clamp(2.5rem,7.5vw,7.5rem)] reveal">
            Ember
            <span class="block">
              <span class="text-gold italic normal-case font-normal text-[1.15em] align-[-0.08em] mr-1 sm:mr-4 tracking-normal">&amp;</span>Oak
            </span>
          </h1>
          <p class="mt-7 max-w-md font-wordmark italic text-cream/75 text-xl sm:text-2xl tracking-normal reveal">${t(
            "Wood-fired steaks. Pacific Northwest soul.",
            "Carnes al fuego de leña. Alma del Pacífico Noroeste."
          )}</p>
          <div class="mt-9 flex flex-col sm:flex-row gap-4 reveal">
            <a href="${SITE.phoneHref}" class="btn-primary">${t("Reserve a Table", "Reservar una Mesa")} ${icons.arrowRight("h-4 w-4")}</a>
            <a href="menu.html" class="btn-outline">${t("View the Menu", "Ver el Menú")}</a>
          </div>
        </div>
        <div class="mx-auto max-w-content w-full px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 flex items-center justify-between reveal">
          <p class="text-[11px] tracking-[0.2em] uppercase text-cream/60">${t("A Wood-Fired Kitchen", "Una Cocina de Fuego de Leña")}</p>
          <p class="hidden sm:flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-cream/60">
            ${t("Scroll", "Desplázate")} ${icons.arrowRight("h-3 w-3 rotate-90")}
          </p>
        </div>
        <!-- Opt-in ember crackle sound: the video above stays muted so it can
             autoplay everywhere; browsers block audible autoplay outright,
             so this lets a visitor turn the loop on themselves. -->
        <button type="button" data-ember-sound-toggle aria-pressed="false"
          class="absolute right-4 sm:right-6 lg:right-8 bottom-24 sm:bottom-28 md:bottom-32 h-11 w-11 flex items-center justify-center rounded-full border border-cream/25 bg-ink/40 backdrop-blur-sm text-cream/75 transition-all duration-300 cursor-pointer hover:text-gold-soft hover:border-gold/50 hover:shadow-[0_0_16px_-4px_rgba(200,138,46,0.65)] reveal"
          aria-label="${escAttr("Play ember crackle sound")}">
          <span data-sound-icon-off>${icons.soundOff("h-5 w-5")}</span>
          <span data-sound-icon-on>${icons.soundOn("h-5 w-5")}</span>
        </button>
        <audio data-ember-audio loop preload="none">
          <source src="audio/ember-crackle.ogg" type="audio/ogg">
          <source src="audio/ember-crackle.mp3" type="audio/mpeg">
        </audio>
      </div>`,
  });
}

const homeMain = `
  ${homeHero()}
  ${signatureDishesSection()}

  <section class="py-20 sm:py-28 on-dark border-t border-cream/5" data-reveal-group>
    <div class="mx-auto max-w-content px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-2 items-center">
      <div class="reveal order-2 lg:order-1">
        ${photoPlaceholder({ caption: "Chef searing steaks over open flame", ratio: "aspect-[4/3]" })}
      </div>
      <div class="reveal order-1 lg:order-2">
        <p class="eyebrow">${t("Our Story", "Nuestra Historia")}</p>
        <h2 class="section-heading mt-3 text-cream">${t("Fire is the only Ingredient we can’t Substitute", "El Fuego es el Único Ingrediente que no Podemos Sustituir")}</h2>
        <p class="mt-5 text-cream/70 leading-relaxed">${t(
          "Since day one, every steak at Ember & Oak has touched real fire — oak and alder, never gas. We work directly with Pacific Northwest ranches and day-boat fishermen, and we age our beef in-house because flavor can't be rushed.",
          "Desde el primer día, cada carne en Ember & Oak ha tocado fuego real: roble y aliso, nunca gas. Trabajamos directamente con ranchos del Pacífico Noroeste y pescadores locales, y maduramos nuestra carne en casa porque el sabor no se puede apresurar."
        )}</p>
        <a href="about.html" class="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold-soft border-b border-gold-soft/60 pb-1 hover:text-gold transition-colors">
          ${t("Meet the Kitchen", "Conoce la Cocina")} ${icons.arrowRight("h-4 w-4")}
        </a>
      </div>
    </div>
  </section>

  ${testimonialsSection()}

  ${reservationBand()}
`;

/* ==================================================================== */
/* MENU                                                                  */
/* ==================================================================== */

function menuRow({ en, es, price }) {
  return `
        <li class="flex items-baseline justify-between gap-4 py-4 border-b border-cream/10 reveal transition-colors duration-300 hover:border-gold/50">
          <div>
            <p class="font-display text-lg text-cream text-hover-ember inline-block">${t(en[0], es[0])}</p>
            <p class="text-sm text-cream/55 mt-1 max-w-md">${t(en[1], es[1])}</p>
          </div>
          <p class="font-display text-lg text-gold whitespace-nowrap">${price}</p>
        </li>`;
}

function menuSection({ eyebrow, title, items }) {
  return `
      <div class="mb-16" data-reveal-group>
        <div class="flex items-center gap-4 mb-2 reveal">
          ${icons.flame("h-5 w-5 text-gold")}
          <p class="eyebrow">${t(eyebrow.en, eyebrow.es)}</p>
        </div>
        <h2 class="font-display text-2xl sm:text-3xl text-cream reveal">${t(title.en, title.es)}</h2>
        <ul class="mt-6">
          ${items.map(menuRow).join("\n")}
        </ul>
      </div>`;
}

/** Full menu grid — shared by the menu page and the one-page layout. */
function menuGridSection({ id, intro = "" } = {}) {
  return `
  <section${id ? ` id="${id}"` : ""} class="py-16 sm:py-24">
    ${intro}
    <div class="mx-auto max-w-content px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-x-16">
      <div>
        ${menuSection({
          eyebrow: { en: "To Start", es: "Para Comenzar" },
          title: { en: "Raw Bar & Starters", es: "Barra Fría y Entradas" },
          items: [
            { en: ["Northwest Oysters, Half Dozen", "Mignonette, cocktail sauce, lemon."], es: ["Ostras del Noroeste, Media Docena", "Mignonette, salsa cóctel, limón."], price: "$24" },
            { en: ["Wagyu Beef Tartare", "Smoked egg yolk, capers, rye crisp."], es: ["Tartar de Res Wagyu", "Yema ahumada, alcaparras, pan de centeno."], price: "$22" },
            { en: ["Charred Octopus", "Nduja butter, white bean puree, citrus."], es: ["Pulpo a las Brasas", "Mantequilla de nduja, puré de alubias, cítricos."], price: "$26" },
            { en: ["Roasted Bone Marrow", "Herb gremolata, grilled sourdough."], es: ["Tuétano Asado", "Gremolata de hierbas, pan de masa madre."], price: "$19" },
          ],
        })}
        ${menuSection({
          eyebrow: { en: "From the Sea", es: "Del Mar" },
          title: { en: "Seafood", es: "Mariscos" },
          items: [
            { en: ["Alder-Planked King Salmon", "Citrus glaze, charred fennel, fingerling potato."], es: ["Salmón Real en Tabla de Aliso", "Glaseado cítrico, hinojo asado, papa fingerling."], price: "$42" },
            { en: ["Pan-Seared Halibut", "Brown butter, capers, seasonal vegetable."], es: ["Halibut a la Sartén", "Mantequilla dorada, alcaparras, vegetal de temporada."], price: "$46" },
          ],
        })}
      </div>
      <div>
        ${menuSection({
          eyebrow: { en: "Steaks & Chops", es: "Carnes al Fuego" },
          title: { en: "From the Hearth", es: "Desde la Parrilla" },
          items: [
            { en: ["Filet Mignon, 8oz", "Center-cut, dry-aged 30 days."], es: ["Filet Mignon, 8oz", "Corte central, madurado en seco 30 días."], price: "$58" },
            { en: ["Bone-In Ribeye, 20oz", "Dry-aged 45 days, bone marrow butter."], es: ["Ribeye con Hueso, 20oz", "Madurado en seco 45 días, mantequilla de tuétano."], price: "$74" },
            { en: ["New York Strip, 14oz", "Dry-aged 30 days, black pepper crust."], es: ["New York Strip, 14oz", "Madurado en seco 30 días, costra de pimienta negra."], price: "$62" },
            { en: ["Tomahawk for Two, 34oz", "Rosemary smoke, chimichurri, market price."], es: ["Tomahawk para Dos, 34oz", "Humo de romero, chimichurri, precio de mercado."], price: "$145" },
            { en: ["Wagyu Upgrade, A5", "Add to any cut, priced by the ounce."], es: ["Mejora Wagyu, A5", "Agrégalo a cualquier corte, precio por onza."], price: "+$18/oz" },
          ],
        })}
        ${menuSection({
          eyebrow: { en: "Sides", es: "Acompañamientos" },
          title: { en: "For the Table", es: "Para Compartir" },
          items: [
            { en: ["Truffle Potato Gratin", "Gruyère, thyme."], es: ["Gratín de Papa con Trufa", "Gruyère, tomillo."], price: "$16" },
            { en: ["Charred Broccolini", "Calabrian chili, garlic, lemon."], es: ["Broccolini a las Brasas", "Chile calabrés, ajo, limón."], price: "$14" },
            { en: ["Cast-Iron Mac & Cheese", "Aged cheddar, brioche crumb."], es: ["Mac & Cheese en Hierro Fundido", "Cheddar añejo, migas de brioche."], price: "$15" },
          ],
        })}
      </div>
    </div>
    <div class="mx-auto max-w-content px-4 sm:px-6 lg:px-8 mt-6 border-t border-cream/10 pt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm text-cream/55">
      ${icons.leaf("h-5 w-5 text-gold shrink-0")}
      <p>${t(
        "Beef sourced from Pacific Northwest ranches within 300 miles; seafood from day-boat, sustainable fisheries. Full wine and cocktail list available on request.",
        "Carne proveniente de ranchos del Pacífico Noroeste a menos de 300 millas; mariscos de pesca sostenible del día. Carta completa de vinos y cócteles disponible bajo solicitud."
      )}</p>
    </div>
  </section>`;
}

const menuMain = `
  ${pageHero({
    eyebrow: { en: "Menu", es: "Menú" },
    title: { en: "The Menu", es: "El Menú" },
    subtitle: { en: "Live-fire cooking, dry-aged beef, and a raw bar built on Pacific waters.", es: "Cocina a fuego vivo, carne madurada en seco y una barra de mariscos del Pacífico." },
    image: "images/menu-hero.jpg",
    imageWebp: "images/menu-hero.webp",
  })}

  ${menuGridSection()}

  ${reservationBand()}
`;

/* ==================================================================== */
/* ABOUT                                                                 */
/* ==================================================================== */

/** Kitchen story + values — shared by the about page and the one-page layout. */
function ourStorySections({ id } = {}) {
  return `
  <section${id ? ` id="${id}"` : ""} class="py-20 sm:py-28" data-reveal-group>
    <div class="mx-auto max-w-content px-4 sm:px-6 lg:px-8 grid gap-16 lg:grid-cols-2 items-center">
      <div class="reveal">
        ${photoPlaceholder({ caption: "Executive chef portrait, kitchen pass", ratio: "aspect-[4/5]" })}
      </div>
      <div class="reveal">
        <p class="eyebrow">${t("Since 2016", "Desde 2016")}</p>
        <h2 class="section-heading mt-3 text-cream">${t("A Kitchen Built on One Rule: Real Fire, No Shortcuts", "Una Cocina con una Sola Regla: Fuego Real, sin Atajos")}</h2>
        <p class="mt-5 text-cream/60 leading-relaxed">${t(
          "Ember & Oak opened in Belltown with a simple idea: cook the way ranchers and fishermen along the Sound have for generations — over oak and alder, patiently, without shortcuts. Every steak is dry-aged in our on-site cooler for a minimum of 30 days before it ever sees the hearth.",
          "Ember & Oak abrió en Belltown con una idea simple: cocinar como lo han hecho por generaciones los rancheros y pescadores del Sound, sobre roble y aliso, con paciencia y sin atajos. Cada carne se madura en seco en nuestra propia cava durante un mínimo de 30 días antes de tocar la parrilla."
        )}</p>
        <p class="mt-4 text-cream/60 leading-relaxed">${t(
          "Our executive chef spent a decade in New York steakhouses before returning home to Seattle to build a menu rooted in this region — Puget Sound seafood, Walla Walla produce, and beef from ranches we visit ourselves.",
          "Nuestro chef ejecutivo pasó una década en steakhouses de Nueva York antes de regresar a Seattle para construir un menú arraigado en esta región: mariscos de Puget Sound, productos de Walla Walla y carne de ranchos que visitamos personalmente."
        )}</p>
      </div>
    </div>
  </section>

  <section class="py-20 sm:py-28 on-dark" data-reveal-group>
    <div class="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl reveal">
        <p class="eyebrow">${t("Our Approach", "Nuestro Enfoque")}</p>
        <h2 class="section-heading mt-3 text-cream">${t("Three Things We Won't Compromise On", "Tres Cosas en las que no Transigimos")}</h2>
      </div>
      <div class="mt-12 grid gap-10 md:grid-cols-3">
        ${[
          {
            icon: icons.flame("h-7 w-7 text-gold"),
            en: ["Live Fire, Always", "Every protein touches real oak or alder embers. No gas, no shortcuts, no exceptions."],
            es: ["Fuego Vivo, Siempre", "Cada proteína toca brasas reales de roble o aliso. Sin gas, sin atajos, sin excepciones."],
          },
          {
            icon: icons.leaf("h-7 w-7 text-gold"),
            en: ["Regional Sourcing", "Beef from ranches within 300 miles; seafood from day-boat fishermen we know by name."],
            es: ["Origen Regional", "Carne de ranchos a menos de 300 millas; mariscos de pescadores locales que conocemos por nombre."],
          },
          {
            icon: icons.clock("h-7 w-7 text-gold"),
            en: ["Patience Over Speed", "Beef dry-aged in-house 30–45 days. Flavor takes time, and we don't rush it."],
            es: ["Paciencia sobre Velocidad", "Carne madurada en casa 30–45 días. El sabor toma tiempo y no lo apresuramos."],
          },
        ]
          .map(
            (v) => `
        <div class="reveal">
          <div class="h-14 w-14 rounded-full border border-gold/30 flex items-center justify-center">${v.icon}</div>
          <h3 class="mt-5 font-display text-xl text-cream">${t(v.en[0], v.es[0])}</h3>
          <p class="mt-2 text-cream/60 text-sm leading-relaxed">${t(v.en[1], v.es[1])}</p>
        </div>`
          )
          .join("\n        ")}
      </div>
    </div>
  </section>`;
}

const aboutMain = `
  ${pageHero({
    eyebrow: { en: "Our Story", es: "Nuestra Historia" },
    title: { en: "Built Around the Fire", es: "Construido Alrededor del Fuego" },
    subtitle: { en: "A Belltown kitchen devoted to live fire, dry-aging, and Pacific Northwest ranches.", es: "Una cocina en Belltown dedicada al fuego vivo, la maduración en seco y los ranchos del Pacífico Noroeste." },
  })}

  ${ourStorySections()}

  ${reservationBand()}
`;

/* ==================================================================== */
/* GALLERY                                                               */
/* ==================================================================== */

const galleryCaptions = [
  "Dining room by firelight",
  "Tomahawk carving tableside",
  "Oak-fired hearth in action",
  "Private dining room",
  "Raw bar and oyster service",
  "Bar & cocktail program",
  "Chef plating pass",
  "Seattle waterfront patio",
  "Dry-aging cooler",
];

/** Photo grid — shared by the gallery page and the one-page layout. */
function galleryGridSection({ id, intro = "" } = {}) {
  return `
  <section${id ? ` id="${id}"` : ""} class="py-16 sm:py-24" data-reveal-group>
    <div class="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
      ${intro}
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        ${galleryCaptions
          .map((cap) => `<div class="reveal">${photoPlaceholder({ caption: cap, ratio: "aspect-square" })}</div>`)
          .join("\n        ")}
      </div>
      <p class="mt-8 text-sm text-cream/55 reveal">${t(
        "Photography placeholders shown above — swap in professional interior, food, and lifestyle photography before launch.",
        "Las imágenes de arriba son marcadores de posición: reemplácelas con fotografía profesional de interiores, platos y ambiente antes del lanzamiento."
      )}</p>
    </div>
  </section>`;
}

const galleryMain = `
  ${pageHero({
    eyebrow: { en: "Gallery", es: "Galería" },
    title: { en: "A Taste of the Room", es: "Una Muestra del Ambiente" },
    subtitle: { en: "The dining room, the hearth, and the plates in between.", es: "El comedor, la parrilla y los platos de por medio." },
  })}

  ${galleryGridSection()}

  ${reservationBand()}
`;

/* ==================================================================== */
/* CONTACT                                                               */
/* ==================================================================== */

/** Contact details + reservation form — shared by the contact page and the one-page layout. */
function reservationSection({ id, intro = "" } = {}) {
  return `
  <section${id ? ` id="${id}"` : ""} class="py-16 sm:py-24">
    ${intro}
    <div class="mx-auto max-w-content px-4 sm:px-6 lg:px-8 grid gap-16 lg:grid-cols-5">
      <div class="lg:col-span-2 space-y-10">
        <div>
          <p class="eyebrow">${t("Call Us", "Llámanos")}</p>
          <a href="${SITE.phoneHref}" class="mt-2 flex items-center gap-3 font-display text-2xl text-cream hover:text-gold transition-colors">
            ${icons.phone("h-5 w-5 text-gold")} ${SITE.phoneDisplay}
          </a>
          <p class="text-sm text-cream/55 mt-1">${t("Best for same-week and large-party reservations.", "Ideal para reservas de la misma semana o grupos grandes.")}</p>
        </div>
        <div>
          <p class="eyebrow">${t("Email", "Correo")}</p>
          <a href="mailto:${SITE.email}" class="mt-2 flex items-center gap-3 text-lg text-cream hover:text-gold transition-colors">
            ${icons.mail("h-5 w-5 text-gold")} ${SITE.email}
          </a>
        </div>
        <div>
          <p class="eyebrow">${t("Address", "Dirección")}</p>
          <a href="${SITE.mapsHref}" class="mt-2 flex items-start gap-3 text-lg text-cream hover:text-gold transition-colors">
            ${icons.pin("h-5 w-5 text-gold mt-1 shrink-0")} <span>${SITE.addressLine1}<br>${SITE.addressLine2}</span>
          </a>
        </div>
        <div>
          <p class="eyebrow">${t("Hours", "Horario")}</p>
          <ul class="mt-3 space-y-2 text-cream/60">
            <li class="flex items-center gap-3">${icons.clock("h-4 w-4 text-gold")} <span>${t("Tue – Thu", "Mar – Jue")}: 4:30 – 10:00 PM</span></li>
            <li class="flex items-center gap-3">${icons.clock("h-4 w-4 text-gold")} <span>${t("Fri – Sat", "Vie – Sáb")}: 4:30 – 11:00 PM</span></li>
            <li class="flex items-center gap-3">${icons.clock("h-4 w-4 text-gold")} <span>${t("Sunday", "Domingo")}: 4:00 – 9:00 PM</span></li>
            <li class="flex items-center gap-3 text-cream/35">${icons.clock("h-4 w-4")} <span>${t("Monday: Closed", "Lunes: Cerrado")}</span></li>
          </ul>
        </div>
      </div>

      <div class="lg:col-span-3">
        ${photoPlaceholder({ caption: "Map — 2100 Western Ave, Seattle, WA", ratio: "aspect-[16/9]" })}

        <form data-reservation-form class="mt-10 space-y-6" novalidate>
          <div class="grid sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-cream/80 mb-2" for="name">${t("Full Name", "Nombre Completo")}</label>
              <input id="name" name="name" type="text" required autocomplete="name"
                class="w-full min-h-[44px] rounded-sm border border-cream/20 bg-white/5 px-4 py-3 text-cream placeholder:text-cream/35"
                ${tAttr("placeholder", "Jane Smith", "Juana Pérez")}>
            </div>
            <div>
              <label class="block text-sm font-medium text-cream/80 mb-2" for="party">${t("Party Size", "Número de Personas")}</label>
              <input id="party" name="party" type="number" min="1" max="6" required inputmode="numeric"
                class="w-full min-h-[44px] rounded-sm border border-cream/20 bg-white/5 px-4 py-3 text-cream placeholder:text-cream/35"
                ${tAttr("placeholder", "2", "2")}>
            </div>
          </div>
          <div class="grid sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-cream/80 mb-2" for="email">${t("Email", "Correo Electrónico")}</label>
              <input id="email" name="email" type="email" required autocomplete="email"
                class="w-full min-h-[44px] rounded-sm border border-cream/20 bg-white/5 px-4 py-3 text-cream placeholder:text-cream/35"
                ${tAttr("placeholder", "you@email.com", "tu@correo.com")}>
            </div>
            <div>
              <label class="block text-sm font-medium text-cream/80 mb-2" for="phone">${t("Phone", "Teléfono")}</label>
              <input id="phone" name="phone" type="tel" required autocomplete="tel"
                class="w-full min-h-[44px] rounded-sm border border-cream/20 bg-white/5 px-4 py-3 text-cream placeholder:text-cream/35"
                ${tAttr("placeholder", "(206) 555-0100", "(206) 555-0100")}>
            </div>
          </div>
          <div class="grid sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-cream/80 mb-2" for="date">${t("Preferred Date", "Fecha Preferida")}</label>
              <input id="date" name="date" type="date" required
                class="w-full min-h-[44px] rounded-sm border border-cream/20 bg-white/5 px-4 py-3 text-cream [color-scheme:dark]">
            </div>
            <div>
              <label class="block text-sm font-medium text-cream/80 mb-2" for="time">${t("Preferred Time", "Hora Preferida")}</label>
              <input id="time" name="time" type="time" required
                class="w-full min-h-[44px] rounded-sm border border-cream/20 bg-white/5 px-4 py-3 text-cream [color-scheme:dark]">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-cream/80 mb-2" for="notes">${t("Notes (allergies, occasion)", "Notas (alergias, ocasión)")}</label>
            <textarea id="notes" name="notes" rows="4"
              class="w-full rounded-sm border border-cream/20 bg-white/5 px-4 py-3 text-cream placeholder:text-cream/35"
              ${tAttr("placeholder", "Anniversary dinner, one guest with a shellfish allergy…", "Cena de aniversario, un invitado con alergia a mariscos…")}></textarea>
          </div>
          <button type="submit" class="btn-primary w-full sm:w-auto">${t("Request Reservation", "Solicitar Reserva")}</button>
          <p data-form-status hidden role="status" class="text-sm text-gold font-medium">
            ${t(
              "Thanks — this form is a preview and isn't wired to a booking system yet. Please call us to confirm your table.",
              "Gracias — este formulario es una vista previa y aún no está conectado a un sistema de reservas. Llámanos para confirmar tu mesa."
            )}
          </p>
        </form>
      </div>
    </div>
  </section>`;
}

const contactMain = `
  ${pageHero({
    eyebrow: { en: "Reservations", es: "Reservas" },
    title: { en: "Reserve Your Table", es: "Reserva tu Mesa" },
    subtitle: { en: "Call, email, or send a request below — parties of 7 or more should call directly.", es: "Llama, escribe o envía una solicitud a continuación. Grupos de 7 o más deben llamar directamente." },
    ratio: "aspect-[16/9] md:aspect-[24/9]",
  })}

  ${reservationSection()}
`;

/* ==================================================================== */
/* Structured data + write files                                        */
/* ==================================================================== */

const restaurantJsonLd = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: SITE.fullName,
  servesCuisine: "Steakhouse",
  priceRange: "$$$",
  telephone: SITE.phoneHref.replace("tel:", ""),
  email: SITE.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.addressLine1,
    addressLocality: "Seattle",
    addressRegion: "WA",
    postalCode: "98121",
    addressCountry: "US",
  },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Tuesday", "Wednesday", "Thursday"], opens: "16:30", closes: "22:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Friday", "Saturday"], opens: "16:30", closes: "23:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "16:00", closes: "21:00" },
  ],
})}</script>`;

/* ==================================================================== */
/* ONE-PAGE LAYOUT (preview)                                             */
/* ==================================================================== */

/** Centered chapter heading used to introduce a section within the one-page layout. */
function sectionIntro({ eyebrow, title, subtitle }) {
  return `
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 reveal">
      <p class="eyebrow justify-center flex">${t(eyebrow.en, eyebrow.es)}</p>
      <h2 class="section-heading mt-3 text-cream">${t(title.en, title.es)}</h2>
      ${subtitle ? `<p class="mt-4 font-wordmark italic text-cream/70 text-lg sm:text-xl">${t(subtitle.en, subtitle.es)}</p>` : ""}
    </div>`;
}

const landingNavItems = [
  { href: "#home", en: "Home", es: "Inicio", key: "home" },
  { href: "#menu", en: "Menu", es: "Menú", key: "menu" },
  { href: "#story", en: "Our Story", es: "Nuestra Historia", key: "story" },
  { href: "#gallery", en: "Gallery", es: "Galería", key: "gallery" },
  { href: "#reservations", en: "Reservations", es: "Reservas", key: "reservations" },
];

const landingMain = `
  <div id="home">
    ${homeHero()}
  </div>

  ${signatureDishesSection({ menuHref: "#menu" })}

  ${menuGridSection({
    id: "menu",
    intro: sectionIntro({
      eyebrow: { en: "Menu", es: "Menú" },
      title: { en: "The Menu", es: "El Menú" },
      subtitle: { en: "Live-fire cooking, dry-aged beef, and a raw bar built on Pacific waters.", es: "Cocina a fuego vivo, carne madurada en seco y una barra de mariscos del Pacífico." },
    }),
  })}

  ${ourStorySections({ id: "story" })}

  ${galleryGridSection({
    id: "gallery",
    intro: sectionIntro({
      eyebrow: { en: "Gallery", es: "Galería" },
      title: { en: "A Taste of the Room", es: "Una Muestra del Ambiente" },
      subtitle: { en: "The dining room, the hearth, and the plates in between.", es: "El comedor, la parrilla y los platos de por medio." },
    }),
  })}

  ${testimonialsSection()}

  ${reservationSection({
    id: "reservations",
    intro: sectionIntro({
      eyebrow: { en: "Reservations", es: "Reservas" },
      title: { en: "Reserve Your Table", es: "Reserva tu Mesa" },
      subtitle: { en: "Call, email, or send a request below — parties of 7 or more should call directly.", es: "Llama, escribe o envía una solicitud a continuación. Grupos de 7 o más deben llamar directamente." },
    }),
  })}

  ${reservationBand({ formHref: "#reservations" })}
`;

const pages = [
  {
    file: "index.html",
    title: "Ember & Oak Steakhouse | Wood-Fired Steaks in Seattle, WA",
    description: "Dry-aged, wood-fired steaks and Pacific Northwest seafood in Belltown, Seattle. Reserve your table at Ember & Oak Steakhouse.",
    active: "home",
    jsonLd: restaurantJsonLd,
    main: homeMain,
  },
  {
    file: "menu.html",
    title: "Menu | Ember & Oak Steakhouse",
    description: "Explore our menu of dry-aged steaks, Pacific seafood, and wood-fired sides at Ember & Oak Steakhouse in Seattle.",
    active: "menu",
    main: menuMain,
  },
  {
    file: "about.html",
    title: "Our Story | Ember & Oak Steakhouse",
    description: "Live fire, in-house dry-aging, and Pacific Northwest sourcing — the story behind Ember & Oak Steakhouse in Seattle.",
    active: "about",
    main: aboutMain,
  },
  {
    file: "gallery.html",
    title: "Gallery | Ember & Oak Steakhouse",
    description: "A visual tour of the dining room, hearth, and dishes at Ember & Oak Steakhouse in Seattle.",
    active: "gallery",
    main: galleryMain,
  },
  {
    file: "contact.html",
    title: "Reservations & Contact | Ember & Oak Steakhouse",
    description: "Reserve your table at Ember & Oak Steakhouse in Seattle — call, email, or request a reservation online.",
    active: "contact",
    main: contactMain,
  },
  {
    file: "onepage.html",
    title: "Ember & Oak Steakhouse | Wood-Fired Steaks in Seattle, WA",
    description: "Dry-aged, wood-fired steaks and Pacific Northwest seafood in Belltown, Seattle — menu, story, gallery, and reservations on one continuous page.",
    active: "home",
    jsonLd: restaurantJsonLd,
    main: landingMain,
    navItems: landingNavItems,
    navLogoHref: "#home",
  },
];

for (const p of pages) {
  writeFileSync(new URL(`./${p.file}`, import.meta.url), page(p));
  console.log("wrote", p.file);
}
