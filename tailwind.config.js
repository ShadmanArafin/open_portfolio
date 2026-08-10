/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // `xs:` is used by the navbar wordmark and the footer social labels, but
      // was never declared — so those utilities compiled to nothing and the
      // full-width variants stayed permanently hidden.
      screens: {
        xs: '480px',
      },
      colors: {
        bg: 'var(--bg-primary)',
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
        },
        accent: 'var(--accent-color)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        border: 'var(--border-color)',
        'border-hover': 'var(--border-color-hover)',
      },
      // Resolved through CSS variables so the font picker in /admin/appearance
      // actually takes effect, and so the admin can override them for its own
      // UI without touching the site's typography. Defaults live in index.css.
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      maxWidth: {
        1440: '1440px',
        1280: '1280px',
      },
      borderRadius: {
        pill: '9999px',
        '2xl': '24px',
        '3xl': '28px',
      },
      letterSpacing: {
        'tight-hero': '-0.035em',
        'tight-head': '-0.025em',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
        'hero-clip': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
