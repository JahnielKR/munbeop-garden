import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WelcomeEmailForm from '~/components/welcome/WelcomeEmailForm.vue'

vi.stubGlobal('useAuth', () => ({
  signIn: vi.fn(async () => ({ error: null })),
  signUp: vi.fn(async () => ({ error: null })),
  signInMagicLink: vi.fn(async () => ({ error: null })),
  resetPassword: vi.fn(async () => ({ error: null })),
}))
vi.stubGlobal('useRouter', () => ({ push: vi.fn(async () => {}) }))

describe('WelcomeEmailForm sign-up password policy', () => {
  it('shows the minimum-length hint only in sign-up mode', () => {
    const signup = mount(WelcomeEmailForm, { props: { mode: 'signup' } })
    expect(signup.find('.email-form__hint').exists()).toBe(true)

    const signin = mount(WelcomeEmailForm, { props: { mode: 'signin' } })
    expect(signin.find('.email-form__hint').exists()).toBe(false)
  })

  it('disables submit until the password meets the minimum length', async () => {
    const wrapper = mount(WelcomeEmailForm, { props: { mode: 'signup' } })
    const submit = () => wrapper.get('.email-form__submit')

    expect(submit().attributes('disabled')).toBeDefined() // empty password

    await wrapper.get('input[type="password"]').setValue('short') // 5 chars
    expect(submit().attributes('disabled')).toBeDefined()

    await wrapper.get('input[type="password"]').setValue('longenough') // 10 chars
    expect(submit().attributes('disabled')).toBeUndefined()
  })

  it('does NOT gate sign-in on password length (legacy accounts)', async () => {
    const wrapper = mount(WelcomeEmailForm, { props: { mode: 'signin' } })
    // Even a short password leaves the sign-in button enabled.
    await wrapper.get('input[type="password"]').setValue('x')
    expect(wrapper.get('.email-form__submit').attributes('disabled')).toBeUndefined()
  })
})
