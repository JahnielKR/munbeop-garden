import { describe, it, expect } from 'vitest'
import { authErrorKey, AUTH_ERROR_KEYS } from '~/lib/auth/error-message'

describe('authErrorKey — Supabase auth code → i18n key', () => {
  it('maps the known GoTrue codes to specific messages', () => {
    expect(authErrorKey({ code: 'invalid_credentials' })).toBe('auth.error_invalid_credentials')
    expect(authErrorKey({ code: 'email_not_confirmed' })).toBe('auth.error_email_not_confirmed')
    expect(authErrorKey({ code: 'user_already_exists' })).toBe('auth.error_user_exists')
    expect(authErrorKey({ code: 'email_exists' })).toBe('auth.error_user_exists')
    expect(authErrorKey({ code: 'over_request_rate_limit' })).toBe('auth.error_rate_limited')
    expect(authErrorKey({ code: 'over_email_send_rate_limit' })).toBe('auth.error_rate_limited')
    expect(authErrorKey({ code: 'weak_password' })).toBe('auth.error_weak_password')
  })

  it('falls back to the generic key for unknown codes, missing codes, and null', () => {
    expect(authErrorKey({ code: 'brand_new_code' })).toBe('auth.error_generic')
    expect(authErrorKey({})).toBe('auth.error_generic')
    expect(authErrorKey(null)).toBe('auth.error_generic')
    expect(authErrorKey(undefined)).toBe('auth.error_generic')
  })

  it('exports every reachable key (consumed by the i18n parity test)', () => {
    expect(AUTH_ERROR_KEYS).toContain('auth.error_generic')
    for (const key of AUTH_ERROR_KEYS) expect(key).toMatch(/^auth\.error_/)
  })
})
