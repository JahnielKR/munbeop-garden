import { ref, readonly } from 'vue'

export type RouteTransitionDirection = 'enter' | 'exit' | null

// Module-level singleton — all callers share the same reactive ref.
// `enter`: pan-right (welcome → in-app). "Entering the castle."
// `exit`:  pan-left  (in-app → welcome). "Leaving the castle."
// `null`:  any other navigation falls back to the default fade.
const direction = ref<RouteTransitionDirection>(null)

/**
 * useRouteTransition — direction state for the page-level <NuxtPage>
 * transition. The composable mutates a module-level singleton; the
 * top-level app reads `direction` to pick the keyframe (pan-right /
 * pan-left / fade) for the next page-enter.
 *
 * Hook points:
 *   - AuthCallback page + WelcomeEmailForm.submit() → setEnter() before
 *     navigating to /.
 *   - useAuth().signOutAndExit() → setExit() before navigating to /welcome.
 */
export function useRouteTransition() {
  function setEnter() { direction.value = 'enter' }
  function setExit() { direction.value = 'exit' }
  function clear() { direction.value = null }

  return {
    direction: readonly(direction),
    setEnter,
    setExit,
    clear,
  }
}

// Test-only: reset the singleton between cases.
export function _resetRouteTransitionForTest() {
  direction.value = null
}
