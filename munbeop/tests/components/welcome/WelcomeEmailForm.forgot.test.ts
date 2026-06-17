import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import WelcomeEmailForm from '~/components/welcome/WelcomeEmailForm.vue'

const signIn = vi.fn(async () => ({ error: null }))
const signUp = vi.fn(async () => ({ error: null }))
const signInMagicLink = vi.fn(async () => ({ error: null }))
const resetPassword = vi.fn(async () => ({ error: null }))
vi.stubGlobal('useAuth', () => ({ signIn, signUp, signInMagicLink, resetPassword }))
vi.stubGlobal('useRouter', () => ({ push: vi.fn(async () => {}) }))

describe('WelcomeEmailForm forgot-password', () => {
  beforeEach(() => {
    resetPassword.mockReset()
    resetPassword.mockResolvedValue({ error: null })
  })

  it('shows a forgot-password control only in sign-in mode', () => {
    const signin = mount(WelcomeEmailForm, { props: { mode: 'signin' } })
    expect(signin.find('.email-form__forgot').exists()).toBe(true)

    const signup = mount(WelcomeEmailForm, { props: { mode: 'signup' } })
    expect(signup.find('.email-form__forgot').exists()).toBe(false)

    const magic = mount(WelcomeEmailForm, { props: { mode: 'magic' } })
    expect(magic.find('.email-form__forgot').exists()).toBe(false)
  })

  it('emails a reset link for the typed address and emits info', async () => {
    const wrapper = mount(WelcomeEmailForm, { props: { mode: 'signin' } })
    await wrapper.get('input[type="email"]').setValue('user@example.com')
    await wrapper.get('.email-form__forgot').trigger('click')
    await flushPromises()
    expect(resetPassword).toHaveBeenCalledWith('user@example.com')
    expect(wrapper.emitted('info')).toBeTruthy()
  })

  it('asks for an email first when the field is empty', async () => {
    const wrapper = mount(WelcomeEmailForm, { props: { mode: 'signin' } })
    await wrapper.get('.email-form__forgot').trigger('click')
    expect(resetPassword).not.toHaveBeenCalled()
    expect(wrapper.emitted('error')).toBeTruthy()
  })

  it('surfaces a reset failure as an error', async () => {
    resetPassword.mockResolvedValueOnce({ error: { message: 'rate limited' } })
    const wrapper = mount(WelcomeEmailForm, { props: { mode: 'signin' } })
    await wrapper.get('input[type="email"]').setValue('user@example.com')
    await wrapper.get('.email-form__forgot').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('error')).toBeTruthy()
  })
})
