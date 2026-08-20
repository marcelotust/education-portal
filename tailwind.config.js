/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Retro Platformer ground band: grass strip over a dirt band.
        grass: {
          light: '#65a30d',
          dark: '#4d7c0f',
        },
        dirt: {
          light: '#92400e',
          dark: '#743f16',
        },
        // Retro Platformer's shadow/outline color, in place of flat black.
        ink: '#381a41',
        // Border color for a selected control (#143) — orange reads clearly
        // against every tone's own fill, including yellow, unlike a
        // same-family accent would.
        flare: '#f97316',
      },
      fontFamily: {
        // Headings, buttons and any "arcade cabinet" chrome.
        arcade: ['"Press Start 2P"', 'monospace'],
        // Inputs and long-form text: readable at small sizes.
        terminal: ['"VT323"', 'monospace'],
      },
      boxShadow: {
        // Retro Platformer: solid offset shadow, no blur.
        retro: '4px 4px 0px 0px #381a41',
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0.25' },
        },
      },
      animation: {
        blink: 'blink 1s steps(1, end) infinite',
      },
    },
  },
  plugins: [],
};
