import { describe, it, expect } from 'vitest'
import { MIN_PASSWORD_LENGTH, isPasswordLongEnough } from '~/lib/auth/password'

describe('password policy', () => {
  it('enforces the documented 8-character minimum', () => {
    // The auth.password_min i18n string ("At least 8 characters.") hardcodes
    // this value — guard it so the two never drift apart.
    expect(MIN_PASSWORD_LENGTH).toBe(8)
  })

  it('rejects passwords shorter than the minimum', () => {
    expect(isPasswordLongEnough('')).toBe(false)
    expect(isPasswordLongEnough('1234567')).toBe(false)
  })

  it('accepts passwords at or above the minimum', () => {
    expect(isPasswordLongEnough('12345678')).toBe(true)
    expect(isPasswordLongEnough('a-much-longer-passphrase')).toBe(true)
  })
})
