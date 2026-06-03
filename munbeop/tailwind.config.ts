import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.{js,ts}',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
  ],
  theme: {
    extend: {
      colors: {
        // v1 names — kept as deprecated aliases through Phase 1, removed in Phase 2
        muted: 'var(--muted)',
        indigo: 'var(--indigo)',
        seedling: 'var(--seedling)',
        plant: 'var(--plant)',
        tree: 'var(--tree)',
        // v2 names — canonical
        paper: 'var(--paper)',
        'paper-warm': 'var(--paper-warm)',
        'paper-deep': 'var(--paper-deep)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        jade: 'var(--jade)',
        'jade-deep': 'var(--jade-deep)',
        sky: 'var(--sky)',
        red: 'var(--red)',
        'red-deep': 'var(--red-deep)',
        gold: 'var(--gold)',
        'mastery-seedling': 'var(--mastery-seedling)',
        'mastery-plant': 'var(--mastery-plant)',
        'mastery-tree': 'var(--mastery-tree)',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        display: ['Silkscreen', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        ko: ['"Noto Sans KR"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
