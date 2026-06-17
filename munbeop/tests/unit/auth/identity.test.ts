import { describe, it, expect } from 'vitest'
import { isEmailIdentity } from '~/lib/auth/identity'

describe('isEmailIdentity', () => {
  it('is false for a missing user', () => {
    expect(isEmailIdentity(null)).toBe(false)
    expect(isEmailIdentity(undefined)).toBe(false)
  })

  it('is true when an email identity is present', () => {
    expect(isEmailIdentity({ identities: [{ provider: 'email' }] })).toBe(true)
  })

  it('is true when email is one of several identities (linked accounts)', () => {
    expect(
      isEmailIdentity({ identities: [{ provider: 'google' }, { provider: 'email' }] }),
    ).toBe(true)
  })

  it('is false for an OAuth-only user', () => {
    expect(isEmailIdentity({ identities: [{ provider: 'kakao' }] })).toBe(false)
  })

  it('falls back to app_metadata.provider when identities are absent', () => {
    expect(isEmailIdentity({ app_metadata: { provider: 'email' } })).toBe(true)
    expect(isEmailIdentity({ app_metadata: { provider: 'kakao' } })).toBe(false)
  })

  it('falls back to app_metadata.providers list', () => {
    expect(isEmailIdentity({ app_metadata: { provider: 'kakao', providers: ['kakao', 'email'] } })).toBe(true)
  })
})
