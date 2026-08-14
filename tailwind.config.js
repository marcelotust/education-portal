/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Headings, buttons and any "arcade cabinet" chrome.
        arcade: ['"Press Start 2P"', 'monospace'],
        // Inputs and long-form text: readable at small sizes.
        terminal: ['"VT323"', 'monospace'],
      },
      boxShadow: {
        // Retro Platformer: solid offset shadow, no blur.
        retro: '4px 4px 0px 0px rgba(0,0,0,1)',
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
