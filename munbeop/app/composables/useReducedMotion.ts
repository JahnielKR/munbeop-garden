import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * Reactive `prefers-reduced-motion: reduce`. Needed for JS/WAAPI-driven motion
 * (motion-v) that CSS `@media (prefers-reduced-motion)` rules can't reach — the
 * app's CSS already honors the preference everywhere else, so this closes the
 * one hole (Bomi's motion-v loops). Starts false (SSR/first paint) and resolves
 * on mount; updates live if the OS setting changes.
 */
export function useReducedMotion(): Ref<boolean> {
  const reduced = ref(false)
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return reduced

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  const apply = () => {
    reduced.value = mq.matches
  }
  onMounted(() => {
    apply()
    mq.addEventListener('change', apply)
  })
  onBeforeUnmount(() => mq.removeEventListener('change', apply))
  return reduced
}
