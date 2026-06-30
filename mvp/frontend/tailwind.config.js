/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-app': 'var(--bg-app)',
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card': 'var(--bg-card)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-quaternary': 'var(--text-quaternary)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        'accent-strong': 'var(--accent-strong)',
        border: 'var(--border)',
        divider: 'var(--divider)',
        good: 'var(--good)',
        warn: 'var(--warn)',
        bad: 'var(--bad)',
        score: 'var(--score)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"PingFang SC"',
          '"Noto Sans SC"',
          'system-ui',
          'sans-serif',
        ],
        display: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"PingFang SC"',
          '"Noto Sans SC"',
          'system-ui',
          'sans-serif',
        ],
        serif: [
          '"Source Serif 4"',
          '"Source Serif Pro"',
          'Georgia',
          '"PingFang SC"',
          'serif',
        ],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
      },
      maxWidth: {
        page: '1280px',
        'page-wide': '1480px',
        chat: '760px',
      },
      borderRadius: {
        xl2: '22px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        modal: 'var(--shadow-modal)',
      },
    },
  },
  plugins: [],
}
