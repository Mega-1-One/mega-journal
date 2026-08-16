/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 60% NEUTRAL BACKGROUND & SURFACES
        bg: {
          main: 'var(--bg-main)',
          surface: 'var(--bg-surface)',
          card: 'var(--bg-card)',
          nested: 'var(--bg-nested)',
          border: 'var(--border-subtle)',
        },
        // 30% PRIMARY STRUCTURAL TONES
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        // 10% BOLD ACCENT
        lime: {
          DEFAULT: '#C8FF00',
          hover: '#B5E600',
          dark: '#9BC900',
          glow: 'rgba(200, 255, 0, 0.12)',
        },
        // SEMANTIC COLORS
        profit: '#C8FF00',
        loss: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-ibm-plex)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
