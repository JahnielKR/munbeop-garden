import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AccountWidget from '~/components/layout/AccountWidget.vue'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

const signOutAndExit = vi.fn(async () => ({ error: null }))
vi.stubGlobal('useAuth', () => ({ signOutAndExit }))

describe('AccountWidget', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    signOutAndExit.mockClear()
    signOutAndExit.mockResolvedValue({ error: null })
    useToast().dismiss()
    useAuthStore().user = { email: 'sol@example.com' } as never
  })

  it('renders the signed-in email', () => {
    const wrapper = mount(AccountWidget, { global: { stubs: { Button: { template: '<button><slot/></button>' } } } })
    expect(wrapper.text()).toContain('sol@example.com')
  })

  it('signs out without a toast on success', async () => {
    const wrapper = mount(AccountWidget, { global: { stubs: { Button: { template: '<button><slot/></button>' } } } })
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(signOutAndExit).toHaveBeenCalledTimes(1)
    expect(useToast().toasts.value).toHaveLength(0)
  })

  it('shows an error toast when sign-out fails', async () => {
    signOutAndExit.mockResolvedValueOnce({ error: { message: 'network' } })
    const wrapper = mount(AccountWidget, { global: { stubs: { Button: { template: '<button><slot/></button>' } } } })
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(useToast().toasts.value.some((t) => t.variant === 'error')).toBe(true)
  })
})
