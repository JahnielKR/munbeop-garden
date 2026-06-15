import { beforeEach } from 'vitest'
import {
  computed,
  ref,
  reactive,
  readonly,
  watch,
  watchEffect,
  onMounted,
  onBeforeUnmount,
  onUnmounted,
  nextTick,
} from 'vue'
import { useTypewriter } from '~/composables/useTypewriter'
import { useWelcomeMusic } from '~/composables/useWelcomeMusic'
import { useLocalized } from '~/composables/useLocalized'
import { useTheme } from '~/composables/useTheme'

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
g.useI18n = () => ({
  // Key-echo stub. When interpolation params are passed, append their values
  // so assertions can check them (e.g. t('escape.topik_n', {n: 1}) → 'escape.topik_n 1').
  t: (k: string, params?: Record<string, unknown>) =>
    params ? `${k} ${Object.values(params).join(' ')}` : k,
  locale: { value: 'en' },
})
g.useTypewriter = useTypewriter
g.useWelcomeMusic = useWelcomeMusic
g.useLocalized = useLocalized
g.useTheme = useTheme

// Nuxt's auto-imports module exposes Vue reactivity primitives globally in
// production builds. Tests need the same so SFCs that use `computed` /
// `ref` / `watch` etc. without an explicit import don't ReferenceError.
g.computed = computed
g.ref = ref
g.reactive = reactive
g.readonly = readonly
g.watch = watch
g.watchEffect = watchEffect
g.onMounted = onMounted
g.onBeforeUnmount = onBeforeUnmount
g.onUnmounted = onUnmounted
g.nextTick = nextTick
