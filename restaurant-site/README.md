# Ember & Oak Steakhouse — website

Static site (HTML + Tailwind CSS + GSAP) for a fictional Seattle steakhouse.
Content (name, menu, photos) is placeholder — swap it for the real thing
before launch.

## Develop locally

```bash
npm install
npm run watch:css   # rebuilds dist/styles.css on change
npm run serve       # serves the site at http://localhost:8080
```

Open `index.html` (or any other page) in the browser directly — no build
step is required to just look at the site, since `dist/styles.css` is
committed. Run `npm run build:css` after editing `src/input.css` or any
class names in the HTML, and commit the regenerated `dist/styles.css`.

## Pages

`index.html` (Inicio), `menu.html`, `gallery.html`, `about.html` (Nosotros),
`contact.html` (Contacto + reservation form).

## Before going live

- Replace the OpenTable placeholder link in `contact.html`
  (`YOUR-RESTAURANT-SLUG`) with the real one.
- Replace `YOUR_FORM_ID` in the contact form's `action` with a real
  [Formspree](https://formspree.io/forms) endpoint.
- Swap the `.photo-fallback` placeholder blocks for real photography.
- Update the fictional name, address, phone, hours and menu with the real
  restaurant's details.

## Deployment

Pushes to this branch that touch `restaurant-site/**` auto-deploy to
GitHub Pages via `.github/workflows/pages.yml`.
