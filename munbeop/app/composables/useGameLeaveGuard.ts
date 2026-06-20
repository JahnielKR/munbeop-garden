import { ref, provide, type InjectionKey, type Ref } from 'vue'
import { onBeforeRouteLeave, useRouter, type RouteLocationRaw } from 'vue-router'

export interface GameLeaveGuard {
  /** True while the confirm modal is open. */
  confirmOpen: Ref<boolean>
  /** Proceed with the pending navigation. */
  confirm: () => void
  /** Dismiss the modal and stay. */
  cancel: () => void
  /** Navigate to `to`, prompting first if a round is in progress. */
  guardedPush: (to: RouteLocationRaw) => void
  /** Internal route-leave handler. Returns false to block the navigation. */
  onLeave: (to: { fullPath: string }) => boolean
}

export const GAME_LEAVE_GUARD: InjectionKey<GameLeaveGuard> = Symbol('game-leave-guard')

interface MinimalRouter {
  push: (to: RouteLocationRaw) => Promise<unknown> | void
}

/**
 * Pure navigation-guard state machine — framework-agnostic so it unit-tests
 * without a router/component context.
 */
export function createLeaveGuard(router: MinimalRouter, isDirty: () => boolean): GameLeaveGuard {
  const confirmOpen = ref(false)
  let pendingTo: RouteLocationRaw | null = null
  let confirmed = false

  function onLeave(to: { fullPath: string }): boolean {
    if (confirmed || !isDirty()) return true
    pendingTo = to.fullPath
    confirmOpen.value = true
    return false
  }

  function confirm() {
    confirmOpen.value = false
    const to = pendingTo
    pendingTo = null
    if (to == null) return
    confirmed = true
    void Promise.resolve(router.push(to)).finally(() => {
      confirmed = false
    })
  }

  function cancel() {
    confirmOpen.value = false
    pendingTo = null
  }

  function guardedPush(to: RouteLocationRaw) {
    if (!isDirty()) {
      void router.push(to)
      return
    }
    pendingTo = to
    confirmOpen.value = true
  }

  return { confirmOpen, confirm, cancel, guardedPush, onLeave }
}

/**
 * Binds the core to the real router + route-leave guard and provides it to
 * descendants (GameLeaveConfirm, GameExitButton). Call once per game page.
 */
export function useGameLeaveGuard(isDirty: () => boolean): GameLeaveGuard {
  const router = useRouter()
  const guard = createLeaveGuard(router, isDirty)
  onBeforeRouteLeave((to) => guard.onLeave(to))
  provide(GAME_LEAVE_GUARD, guard)
  return guard
}
