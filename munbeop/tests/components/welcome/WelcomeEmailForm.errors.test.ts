import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import WelcomeEmailForm from '~/components/welcome/WelcomeEmailForm.vue'

// Regression: these paths used to emit the raw English GoTrue message
// ("Invalid login credentials") straight into the welcome dialog in all 8
// locales. They must now emit a localized key (key-echo useI18n stub).
const signIn = vi.fn(async () => ({ error: null as { code?: string; message: string } | null }))
const signUp = vi.fn(async () => ({
  error: null as { code?: string; message: string } | null,
  needsConfirmation: false,
}))
const resetPassword = vi.fn(async () => ({
  error: null as { code?: string; message: string } | null,
}))
vi.stubGlobal('useAuth', () => ({
  signIn,
  signUp,
  signInMagicLink: vi.fn(async () => ({ error: null })),
  resetPassword,
}))
vi.stubGlobal('useRouter', () => ({ push: vi.fn(async () => {}) }))

let errSpy: ReturnType<typeof vi.spyOn>

describe('WelcomeEmailForm — localized auth errors', () => {
  beforeEach(() => {
    signIn.mockReset()
    signUp.mockReset()
    resetPassword.mockReset()
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errSpy.mockRestore()
  })

  async function submit(w: ReturnType<typeof mount>) {
    await w.get('input[type="email"]').setValue('a@b.com')
    const pw = w.find('input[type="password"]')
    if (pw.exists()) await pw.setValue('longenough')
    await w.get('form').trigger('submit')
    await flushPromises()
  }

  it('sign-in with wrong credentials emits the localized key, not the raw message', async () => {
    signIn.mockResolvedValueOnce({
      error: { code: 'invalid_credentials', message: 'Invalid login credentials' },
    })
    const w = mount(WelcomeEmailForm, { props: { mode: 'signin' } })
    await submit(w)
    expect(w.emitted('error')![0]![0]).toBe('auth.error_invalid_credentials')
  })

  it('sign-up on an existing email emits the localized key', async () => {
    signUp.mockResolvedValueOnce({
      error: { code: 'user_already_exists', message: 'User already registered' },
      needsConfirmation: false,
    })
    const w = mount(WelcomeEmailForm, { props: { mode: 'signup' } })
    await submit(w)
    expect(w.emitted('error')![0]![0]).toBe('auth.error_user_exists')
  })

  it('forgot-password rate limit emits the localized key', async () => {
    resetPassword.mockResolvedValueOnce({
      error: {
        code: 'over_email_send_rate_limit',
        message: 'For security purposes, you can only request this after 60 seconds.',
      },
    })
    const w = mount(WelcomeEmailForm, { props: { mode: 'signin' } })
    await w.get('input[type="email"]').setValue('a@b.com')
    await w.get('.email-form__forgot').trigger('click')
    await flushPromises()
    expect(w.emitted('error')![0]![0]).toBe('auth.error_rate_limited')
  })

  it('an unknown code falls back to the generic localized message', async () => {
    signIn.mockResolvedValueOnce({
      error: { code: 'mystery_code', message: 'Server exploded' },
    })
    const w = mount(WelcomeEmailForm, { props: { mode: 'signin' } })
    await submit(w)
    expect(w.emitted('error')![0]![0]).toBe('auth.error_generic')
  })
})
