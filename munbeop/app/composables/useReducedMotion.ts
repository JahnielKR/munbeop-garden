import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * Reactive `prefers-reduced-motion: reduce` for interactions whose behavior
 * cannot be expressed with CSS alone. Starts false during SSR/first paint,
 * resolves on mount, and updates live if the OS setting changes.
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
