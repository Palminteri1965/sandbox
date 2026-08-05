// Minimal hand-drawn line/fill icon set (no external icon library, no emoji).
// Consistent 24x24 viewBox, currentColor, matches the "one icon style per
// hierarchy" rule from the design system: outline for UI chrome, filled for
// small decorative marks (star, quote).

function base(inner, { cls = "h-5 w-5", fill = false } = {}) {
  const common = fill
    ? `viewBox="0 0 24 24" class="${cls}" fill="currentColor" aria-hidden="true"`
    : `viewBox="0 0 24 24" class="${cls}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" ${common}>${inner}</svg>`;
}

export const icons = {
  menu: (cls) => base(`<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>`, { cls }),
  close: (cls) => base(`<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>`, { cls }),
  phone: (cls) => base(`<path d="M6.6 10.2c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1v2.8c0 .6-.4 1-1 1C10.6 19.7 4.3 13.4 4.3 5.7c0-.6.4-1 1-1H8.1c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.2z"/>`, { cls }),
  mail: (cls) => base(`<rect x="3.5" y="6" width="17" height="12" rx="1.5"/><path d="M4 7l8 6 8-6"/>`, { cls }),
  pin: (cls) => base(`<path d="M12 21s7-6.7 7-12.3A7 7 0 0 0 5 8.7C5 14.3 12 21 12 21z"/><circle cx="12" cy="8.7" r="2.4"/>`, { cls }),
  clock: (cls) => base(`<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>`, { cls }),
  instagram: (cls) => base(`<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/>`, { cls }),
  facebook: (cls) => base(`<path d="M14 21v-7.5h2.3l.4-3H14V8.4c0-.9.2-1.5 1.5-1.5H17V4.2C16.6 4.1 15.6 4 14.5 4 12.2 4 10.6 5.4 10.6 8v2.5H8.3v3h2.3V21H14z"/>`, { cls, fill: true }),
  camera: (cls) => base(`<path d="M4 8.2h3.2l1.4-2h6.8l1.4 2H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.2a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.4"/>`, { cls }),
  quote: (cls) => base(`<path d="M7.5 9.2c-1.8 0-3.2 1.4-3.2 3.2v5.1h5.3v-5.1H7.5c0-1.2 1-2.1 2.1-2.1V9.2H7.5zM16.6 9.2c-1.8 0-3.2 1.4-3.2 3.2v5.1H18.7v-5.1h-2.1c0-1.2 1-2.1 2.1-2.1V9.2h-2.1z"/>`, { cls, fill: true }),
  arrowRight: (cls) => base(`<line x1="4" y1="12" x2="19" y2="12"/><path d="M13 6l6 6-6 6"/>`, { cls }),
  leaf: (cls) => base(`<path d="M5 19.5c8.5-.3 13-5.3 13.7-13.8-8.6.4-13 5.3-13.7 13.8z"/><path d="M5 19.5c2.6-5.6 6-9.4 10.7-12.2"/>`, { cls }),
  flame: (cls) => base(`<path d="M12 2.5c.9 2.7-1.8 3.8-1.8 6.5a2.7 2.7 0 0 0 5.4 0c0-.9-.4-1.8-.9-2.6 1.8 1 3.6 3.6 3.6 6.3a6.3 6.3 0 1 1-12.6 0c0-3.6 1.8-6.3 3.6-8.1.9-.9 2.2-1.7 2.7-2.1z"/>`, { cls, fill: true }),
  star: (cls) => base(`<path d="M12 3.2l2.5 5.1 5.6.8-4 3.9.9 5.6L12 15.9l-5 2.7.9-5.6-4-3.9 5.6-.8L12 3.2z"/>`, { cls, fill: true }),
  check: (cls) => base(`<path d="M5 13l4.5 4.5L19 8"/>`, { cls }),
  soundOn: (cls) => base(`<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>`, { cls }),
  soundOff: (cls) => base(`<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`, { cls }),
};
