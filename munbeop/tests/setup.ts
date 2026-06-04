import { beforeEach } from 'vitest'
import { useTypewriter } from '~/composables/useTypewriter'
import { useWelcomeMusic } from '~/composables/useWelcomeMusic'

beforeEach(() => {
  // Reset localStorage between tests so storage adapter tests stay isolated.
  if (typeof localStorage !== 'undefined') {
    localStorage.clear()
  }
})

// Nuxt auto-imports composables like `useI18n`, `useTypewriter`,
// `useWelcomeMusic` from `#imports` at build time, but Vitest runs source
// files directly without the Nuxt build pipeline. We expose them as
// globals here so SFCs that reference them at setup time resolve under
// `@vue/test-utils`. Tests can still override per-case with
// `vi.stubGlobal`.
const g = globalThis as unknown as Record<string, unknown>
g.useI18n = () => ({ t: (k: string) => k, locale: { value: 'en' } })
g.useTypewriter = useTypewriter
g.useWelcomeMusic = useWelcomeMusic
