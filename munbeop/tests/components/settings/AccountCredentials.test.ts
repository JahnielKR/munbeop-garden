import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AccountCredentials from '~/components/settings/AccountCredentials.vue'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

const reauthenticate = vi.fn(async () => ({ error: null }))
const updatePassword = vi.fn(async () => ({ error: null }))
const updateEmail = vi.fn(async () => ({ error: null }))
const resetPassword = vi.fn(async () => ({ error: null }))
vi.stubGlobal('useAuth', () => ({ reauthenticate, updatePassword, updateEmail, resetPassword }))

function mountWith(user: unknown) {
  setActivePinia(createPinia())
  useAuthStore().user = user as never
  useToast().dismiss()
  return mount(AccountCredentials)
}

describe('AccountCredentials', () => {
  beforeEach(() => {
    reauthenticate.mockReset()
    reauthenticate.mockResolvedValue({ error: null })
    updatePassword.mockReset()
    updatePassword.mockResolvedValue({ error: null })
    updateEmail.mockReset()
    updateEmail.mockResolvedValue({ error: null })
    resetPassword.mockReset()
    resetPassword.mockResolvedValue({ error: null })
  })

  it('renders nothing for an OAuth-only account', () => {
    const wrapper = mountWith({ identities: [{ provider: 'kakao' }] })
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('renders password + email forms for an email account', () => {
    const wrapper = mountWith({ identities: [{ provider: 'email' }], email: 'a@b.com' })
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
  })

  it('reauthenticates then updates the password and clears both fields', async () => {
    const wrapper = mountWith({ identities: [{ provider: 'email' }] })
    await wrapper.find('#current-password').setValue('old-pass1')
    await wrapper.find('#set-password').setValue('sup3r-secret')
    await wrapper.findAll('form')[0].trigger('submit')
    await flushPromises()
    expect(reauthenticate).toHaveBeenCalledWith('old-pass1')
    expect(updatePassword).toHaveBeenCalledWith('sup3r-secret')
    expect((wrapper.find('#current-password').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#set-password').element as HTMLInputElement).value).toBe('')
    expect(useToast().toasts.value.some((t) => t.variant === 'success')).toBe(true)
  })

  it('rejects the change (no update) when the current password is wrong', async () => {
    reauthenticate.mockResolvedValueOnce({ error: { message: 'Invalid login credentials' } })
    const wrapper = mountWith({ identities: [{ provider: 'email' }] })
    await wrapper.find('#current-password').setValue('wrong')
    await wrapper.find('#set-password').setValue('sup3r-secret')
    await wrapper.findAll('form')[0].trigger('submit')
    await flushPromises()
    expect(updatePassword).not.toHaveBeenCalled()
    expect(useToast().toasts.value.some((t) => t.variant === 'error')).toBe(true)
  })

  it('reauthenticates then requests an email change for a valid address', async () => {
    const wrapper = mountWith({ identities: [{ provider: 'email' }] })
    await wrapper.find('input[type="email"]').setValue('new@example.com')
    await wrapper.find('#email-current-password').setValue('old-pass1')
    await wrapper.findAll('form')[1].trigger('submit')
    await flushPromises()
    expect(reauthenticate).toHaveBeenCalledWith('old-pass1')
    expect(updateEmail).toHaveBeenCalledWith('new@example.com')
    expect(useToast().toasts.value.some((t) => t.variant === 'success')).toBe(true)
  })

  it('blocks the email change when the current password is wrong', async () => {
    reauthenticate.mockResolvedValueOnce({ error: { message: 'Invalid login credentials' } })
    const wrapper = mountWith({ identities: [{ provider: 'email' }] })
    await wrapper.find('input[type="email"]').setValue('new@example.com')
    await wrapper.find('#email-current-password').setValue('wrong')
    await wrapper.findAll('form')[1].trigger('submit')
    await flushPromises()
    expect(updateEmail).not.toHaveBeenCalled()
    expect(useToast().toasts.value.some((t) => t.variant === 'error')).toBe(true)
  })

  it('emails a reset link when the user forgot the current password', async () => {
    const wrapper = mountWith({ identities: [{ provider: 'email' }], email: 'a@b.com' })
    await wrapper.find('.creds__link').trigger('click')
    await flushPromises()
    expect(resetPassword).toHaveBeenCalledWith('a@b.com')
    expect(useToast().toasts.value.some((t) => t.variant === 'success')).toBe(true)
  })

  it('shows an error toast when the password update itself fails', async () => {
    updatePassword.mockResolvedValueOnce({ error: { message: 'weak' } })
    const wrapper = mountWith({ identities: [{ provider: 'email' }] })
    await wrapper.find('#current-password').setValue('old-pass1')
    await wrapper.find('#set-password').setValue('sup3r-secret')
    await wrapper.findAll('form')[0].trigger('submit')
    await flushPromises()
    expect(reauthenticate).toHaveBeenCalled()
    expect(useToast().toasts.value.some((t) => t.variant === 'error')).toBe(true)
  })
})
