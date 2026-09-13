/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Same tokens as the approved mockup (docs/mockups/odolog-mockup.html)
        ink: '#171B1A',
        'ink-muted': '#5B655F',
        line: '#E3E0D6',
        surface: '#FFFFFF',
        'surface-2': '#FBFAF5',
        bg: '#F5F4EF',
        accent: '#0E7A64',
        'accent-ink': '#075142',
        'accent-tint': '#E3F3EE',
        good: '#1F8A4C',
        'good-tint': '#E5F5EA',
        warn: '#B8790A',
        'warn-tint': '#FBF0DC',
        bad: '#C23B2E',
        'bad-tint': '#FBE6E3',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
