/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#0C0A09',
        char: '#1C1917',
        slate: '#44403C',
        ember: {
          DEFAULT: '#A16207',
          light: '#C88B1F',
          dark: '#7A4A05',
        },
        cream: '#FAFAF9',
        bone: '#F1EDE6',
        line: '#D6D3D1',
        danger: '#DC2626',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        displaysc: ['"Playfair Display SC"', 'serif'],
        body: ['Karla', 'sans-serif'],
      },
      maxWidth: {
        content: '1440px',
      },
      letterSpacing: {
        widest2: '0.25em',
      },
      transitionDuration: {
        250: '250ms',
      },
    },
  },
  plugins: [],
};
