/**
 * Toast composable (v2 — variants + stacking).
 *
 * Replaces the v1 single-message-single-timer model with a queue. The
 * Toast component reads `toasts.value` (the array) and renders each
 * entry. Caller picks variant via the per-variant helpers
 * (`toast.success`, `toast.error`, etc.) or the generic `show(text, opts)`
 * — keeps backward-compat with existing callers that just used `show(text)`.
 *
 * Spec contracts (02-primitives.md §11):
 *   - max 3 visible (oldest evicts when a 4th arrives)
 *   - success/info/warning default 3500 ms, error 5500 ms (gives room
 *     to read)
 *   - dismiss(id) removes one; dismiss() clears all
 *   - role + aria-live wiring lives in Toast.vue and reads `variant`
 */

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastEntry {
  id: string
  text: string
  variant: ToastVariant
  duration: number
}

const toasts = ref<ToastEntry[]>([])
const timers = new Map<string, ReturnType<typeof setTimeout>>()
const MAX_VISIBLE = 3
let nextId = 0

function defaultDuration(variant: ToastVariant): number {
  return variant === 'error' ? 5500 : 3500
}

export function useToast() {
  function show(text: string, opts: { variant?: ToastVariant; duration?: number } = {}) {
    const variant = opts.variant ?? 'info'
    const duration = opts.duration ?? defaultDuration(variant)
    const id = `t-${nextId++}`
    const entry: ToastEntry = { id, text, variant, duration }
    // Append + cap to MAX_VISIBLE — oldest entries fall off the head
    const next = [...toasts.value, entry]
    if (next.length > MAX_VISIBLE) {
      const evicted = next.shift()!
      const evictedTimer = timers.get(evicted.id)
      if (evictedTimer) {
        clearTimeout(evictedTimer)
        timers.delete(evicted.id)
      }
    }
    toasts.value = next
    timers.set(
      id,
      setTimeout(() => dismiss(id), duration),
    )
    return id
  }

  function dismiss(id?: string) {
    if (!id) {
      for (const t of timers.values()) clearTimeout(t)
      timers.clear()
      toasts.value = []
      return
    }
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function success(text: string, duration?: number) {
    return show(text, { variant: 'success', duration })
  }
  function error(text: string, duration?: number) {
    return show(text, { variant: 'error', duration })
  }
  function info(text: string, duration?: number) {
    return show(text, { variant: 'info', duration })
  }
  function warning(text: string, duration?: number) {
    return show(text, { variant: 'warning', duration })
  }

  return {
    toasts: readonly(toasts),
    show,
    success,
    error,
    info,
    warning,
    dismiss,
  }
}
