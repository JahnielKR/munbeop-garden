import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import Toast from '~/components/ui/Toast.vue'
import type { ToastEntry } from '~/composables/useToast'

// Toast.vue resolves useToast() as a Nuxt auto-import (a global under test).
// Stub it with a controllable queue.
const toasts = ref<ToastEntry[]>([])
vi.stubGlobal('useToast', () => ({ toasts, dismiss: vi.fn() }))

function push(text: string, variant: ToastEntry['variant']) {
  toasts.value.push({ id: toasts.value.length + 1, text, variant, duration: 3500 } as ToastEntry)
}

beforeEach(() => {
  toasts.value = []
})

describe('Toast a11y', () => {
  it('the stack wrapper has no aria-live; each toast carries its own live region', async () => {
    push('saved', 'success')
    const w = mount(Toast)
    await nextTick()

    // No live region on the wrapper — that would double-announce around the
    // per-toast live regions below it.
    expect(w.find('.toast-stack').attributes('aria-live')).toBeUndefined()

    const toast = w.find('.toast')
    expect(toast.exists()).toBe(true)
    expect(toast.attributes('role')).toBe('status')
    expect(toast.attributes('aria-live')).toBe('polite')
  })

  it('an error toast announces assertively via role=alert', async () => {
    push('boom', 'error')
    const w = mount(Toast)
    await nextTick()
    const toast = w.find('.toast')
    expect(toast.attributes('role')).toBe('alert')
    expect(toast.attributes('aria-live')).toBe('assertive')
  })
})
