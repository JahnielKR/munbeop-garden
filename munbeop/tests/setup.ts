import { beforeEach } from 'vitest'

beforeEach(() => {
  // Reset localStorage between tests so storage adapter tests stay isolated.
  if (typeof localStorage !== 'undefined') {
    localStorage.clear()
  }
})

// Nuxt auto-imports composables like `useI18n` from `#imports` at build
// time, but Vitest runs source files directly without the Nuxt build
// pipeline. Test-time stubs cover the auto-imports that Vue SFCs touch at
// setup time; tests can still override per-case with `vi.stubGlobal`.
;(globalThis as unknown as { useI18n: () => { t: (k: string) => string; locale: { value: string } } }).useI18n = () => ({
  t: (k: string) => k,
  locale: { value: 'en' },
})
