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
      colors: {
        arcade: {
          black: '#111111',
          green: '#39FF14',
          pink: '#FF00FF',
          cyan: '#00FFFF',
          yellow: '#FFFF00',
        },
      },
      boxShadow: {
        neon: '0 0 8px currentColor, 0 0 24px currentColor',
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
