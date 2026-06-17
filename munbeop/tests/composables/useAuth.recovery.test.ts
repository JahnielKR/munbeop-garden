import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '~/composables/useAuth'

const resetPasswordForEmail = vi.fn(async () => ({ error: null }))
const updateUser = vi.fn(async () => ({ error: null }))
vi.stubGlobal('useNuxtApp', () => ({ $supabase: { auth: { resetPasswordForEmail, updateUser } } }))
vi.stubGlobal('useRuntimeConfig', () => ({ public: { appUrl: 'https://app.test' } }))
vi.stubGlobal('useRouter', () => ({ push: vi.fn(async () => {}) }))
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({ setSession: vi.fn(), user: { id: 'u' } }),
}))

describe('useAuth password & email self-service', () => {
  beforeEach(() => {
    resetPasswordForEmail.mockReset()
    updateUser.mockReset()
    resetPasswordForEmail.mockResolvedValue({ error: null })
    updateUser.mockResolvedValue({ error: null })
  })

  it('resetPassword emails a recovery link pointing at /auth/reset-password', async () => {
    const { error } = await useAuth().resetPassword('user@example.com')
    expect(resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
      redirectTo: 'https://app.test/auth/reset-password',
    })
    expect(error).toBeNull()
  })

  it('resetPassword surfaces the supabase error', async () => {
    resetPasswordForEmail.mockResolvedValueOnce({ error: { message: 'rate limited' } })
    const { error } = await useAuth().resetPassword('user@example.com')
    expect(error?.message).toBe('rate limited')
  })

  it('updatePassword updates the user password', async () => {
    const { error } = await useAuth().updatePassword('n3w-p4ss!')
    expect(updateUser).toHaveBeenCalledWith({ password: 'n3w-p4ss!' })
    expect(error).toBeNull()
  })

  it('updateEmail updates the user email with a callback redirect', async () => {
    const { error } = await useAuth().updateEmail('new@example.com')
    expect(updateUser).toHaveBeenCalledWith(
      { email: 'new@example.com' },
      { emailRedirectTo: 'https://app.test/auth/callback' },
    )
    expect(error).toBeNull()
  })
})
