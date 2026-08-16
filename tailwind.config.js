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
        bg: {
          main: 'var(--bg-main)',
          surface: 'var(--bg-surface)',
          card: 'var(--bg-card)',
          nested: 'var(--bg-nested)',
          border: 'var(--border-subtle)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        lime: {
          DEFAULT: '#C8FF00',
          hover: '#D4FF33',
        },
        warning: '#F59E0B',
        loss: '#EF4444',
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-ibm-plex)', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(200, 255, 0, 0.25)',
        'lime-subtle': '0 4px 20px rgba(200, 255, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
