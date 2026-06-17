import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AccountCredentials from '~/components/settings/AccountCredentials.vue'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

const updatePassword = vi.fn(async () => ({ error: null }))
const updateEmail = vi.fn(async () => ({ error: null }))
vi.stubGlobal('useAuth', () => ({ updatePassword, updateEmail }))

function mountWith(user: unknown) {
  setActivePinia(createPinia())
  useAuthStore().user = user as never
  useToast().dismiss()
  return mount(AccountCredentials)
}

describe('AccountCredentials', () => {
  beforeEach(() => {
    updatePassword.mockReset()
    updatePassword.mockResolvedValue({ error: null })
    updateEmail.mockReset()
    updateEmail.mockResolvedValue({ error: null })
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

  it('updates the password and clears the field', async () => {
    const wrapper = mountWith({ identities: [{ provider: 'email' }] })
    await wrapper.find('input[type="password"]').setValue('sup3r-secret')
    await wrapper.findAll('form')[0].trigger('submit')
    await flushPromises()
    expect(updatePassword).toHaveBeenCalledWith('sup3r-secret')
    expect((wrapper.find('input[type="password"]').element as HTMLInputElement).value).toBe('')
    expect(useToast().toasts.value.some((t) => t.variant === 'success')).toBe(true)
  })

  it('requests an email change for a valid address', async () => {
    const wrapper = mountWith({ identities: [{ provider: 'email' }] })
    await wrapper.find('input[type="email"]').setValue('new@example.com')
    await wrapper.findAll('form')[1].trigger('submit')
    await flushPromises()
    expect(updateEmail).toHaveBeenCalledWith('new@example.com')
    expect(useToast().toasts.value.some((t) => t.variant === 'success')).toBe(true)
  })

  it('shows an error toast when the password update fails', async () => {
    updatePassword.mockResolvedValueOnce({ error: { message: 'weak' } })
    const wrapper = mountWith({ identities: [{ provider: 'email' }] })
    await wrapper.find('input[type="password"]').setValue('sup3r-secret')
    await wrapper.findAll('form')[0].trigger('submit')
    await flushPromises()
    expect(useToast().toasts.value.some((t) => t.variant === 'error')).toBe(true)
  })
})
