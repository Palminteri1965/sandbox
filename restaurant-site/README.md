# Ember & Oak Steakhouse — Website

A 5-page marketing site for a fictional Seattle steakhouse, built with the
`ui-ux-pro-max` design-system skill: static HTML + Tailwind CSS, bilingual
(EN/ES), with scroll-reveal animation that degrades safely for no-JS clients
and `prefers-reduced-motion`.

## What's here

- `index.html`, `menu.html`, `about.html`, `gallery.html`, `contact.html` —
  generated pages (do not hand-edit; see below).
- `build.mjs` / `lib/icons.mjs` — the content + markup source. Editing the
  site means editing these, then rebuilding.
- `src/input.css` → `dist/styles.css` — Tailwind source and compiled output.
- `js/main.js` — mobile nav, language toggle, sticky header, scroll-reveal
  (vanilla `IntersectionObserver`, no external animation library).

## Rebuilding after a content change

```bash
npm install        # first time only
npm run build      # regenerates *.html and dist/styles.css
```

`npm run watch:css` recompiles Tailwind on save while you edit `src/input.css`
or class names in `build.mjs`.

## Before this goes live

This is a design/dev deliverable, not a finished business setup. Specifically:

1. **Photography.** Every image is a dark placeholder panel with a caption
   (e.g. "Hero photography — dining room by firelight") describing what
   real photo belongs there. Replace them all with professional photography.
2. **Business details are fictional.** Name, address, phone, email, hours,
   menu, and prices are placeholders — swap in the real ones in `build.mjs`
   (`SITE` object at the top, plus each page's content) and rebuild.
3. **Reservation form has no backend.** `contact.html`'s form only shows a
   client-side confirmation message on submit — it doesn't send anything
   anywhere yet. Wire it to your booking system/provider (e.g. OpenTable,
   Resy, Tock, or a form backend) or replace it with their embed.
4. **Social links** (`SITE.instagramHref` / `facebookHref`) are `#` — add the
   real profile URLs.

## Design system

Colors, typography, and layout pattern were generated with:

```bash
python3 ../.claude/skills/ui-ux-pro-max/scripts/search.py \
  "luxury dark moody elegant fine dining editorial" --design-system
```

Palette: near-black charcoal/ink with a warm gold accent; Playfair Display
(headings) + Inter (body). Dark hero/footer sections, warm off-white content
sections — a common upscale-restaurant pattern that keeps the wood-fire/gold
palette from feeling too heavy across a full page.
