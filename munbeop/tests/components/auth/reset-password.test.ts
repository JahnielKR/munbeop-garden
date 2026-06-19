import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ResetPasswordPage from '~/pages/auth/reset-password.vue'
import { useToast } from '~/composables/useToast'

const getSession = vi.fn(async () => ({ data: { session: { user: { id: 'u' } } }, error: null }))
const updatePassword = vi.fn(async () => ({ error: null }))
const navigateTo = vi.fn(async () => {})
vi.stubGlobal('definePageMeta', () => {})
vi.stubGlobal('navigateTo', navigateTo)
vi.stubGlobal('useNuxtApp', () => ({ $supabase: { auth: { getSession } } }))
vi.stubGlobal('useAuth', () => ({ updatePassword }))

describe('reset-password page', () => {
  beforeEach(() => {
    getSession.mockReset()
    getSession.mockResolvedValue({ data: { session: { user: { id: 'u' } } }, error: null })
    updatePassword.mockReset()
    updatePassword.mockResolvedValue({ error: null })
    navigateTo.mockReset()
    useToast().dismiss()
  })

  it('shows the password form when a recovery session exists', async () => {
    const wrapper = mount(ResetPasswordPage)
    await flushPromises()
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('shows an invalid state (no form) when there is no recovery session', async () => {
    getSession.mockResolvedValueOnce({ data: { session: null }, error: null })
    const wrapper = mount(ResetPasswordPage)
    await flushPromises()
    expect(wrapper.find('input[type="password"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('auth.reset_invalid')
    // ...with a way out of the dead end, back to sign in.
    expect(wrapper.find('a[href="/welcome"]').exists()).toBe(true)
  })

  it('updates the password and navigates home on success', async () => {
    const wrapper = mount(ResetPasswordPage)
    await flushPromises()
    await wrapper.find('input[type="password"]').setValue('sup3r-secret')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(updatePassword).toHaveBeenCalledWith('sup3r-secret')
    expect(navigateTo).toHaveBeenCalledWith('/', { replace: true })
  })

  it('keeps the form and shows an error toast on failure', async () => {
    updatePassword.mockResolvedValueOnce({ error: { message: 'weak' } })
    const wrapper = mount(ResetPasswordPage)
    await flushPromises()
    await wrapper.find('input[type="password"]').setValue('sup3r-secret')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(navigateTo).not.toHaveBeenCalled()
    expect(useToast().toasts.value.some((t) => t.variant === 'error')).toBe(true)
  })
})
