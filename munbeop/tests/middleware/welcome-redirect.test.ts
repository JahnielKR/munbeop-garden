import { describe, it, expect } from 'vitest'
import { decideWelcomeRedirect, isActiveSessionToken } from '~/middleware/welcome-redirect.global'

describe('decideWelcomeRedirect', () => {
  it('signed-in user hitting / → stays at /', () => {
    expect(
      decideWelcomeRedirect({ path: '/', signedIn: true }),
    ).toBe(null)
  })

  it('signed-in user hitting /welcome → redirected to /', () => {
    expect(
      decideWelcomeRedirect({ path: '/welcome', signedIn: true }),
    ).toBe('/')
  })

  it('anon visitor hitting / → always redirected to /welcome (entry-point policy)', () => {
    expect(
      decideWelcomeRedirect({ path: '/', signedIn: false }),
    ).toBe('/welcome')
  })

  it('anon visitor hitting /welcome → stays', () => {
    expect(
      decideWelcomeRedirect({ path: '/welcome', signedIn: false }),
    ).toBe(null)
  })

  it('anon visitor on any app route → redirected to /welcome (mandatory accounts)', () => {
    for (const path of ['/practice', '/library', '/stats', '/log', '/settings']) {
      expect(decideWelcomeRedirect({ path, signedIn: false })).toBe('/welcome')
    }
  })

  it('anon visitor on public/info/auth surfaces → untouched', () => {
    for (const path of ['/pricing', '/features', '/policies', '/auth/callback', '/auth/sign-in']) {
      expect(decideWelcomeRedirect({ path, signedIn: false })).toBe(null)
    }
  })

  it('signed-in user is never redirected away from app routes', () => {
    expect(
      decideWelcomeRedirect({ path: '/practice', signedIn: true }),
    ).toBe(null)
  })
})

describe('isActiveSessionToken', () => {
  const now = 1_700_000_000_000 // ms; now/1000 = 1_700_000_000 s
  const tok = (extra: string) => `{"access_token":"x"${extra}}`

  it('treats a missing or empty value as not signed in', () => {
    expect(isActiveSessionToken(null, now)).toBe(false)
    expect(isActiveSessionToken('', now)).toBe(false)
  })

  it('treats a value with no access_token as not signed in', () => {
    expect(isActiveSessionToken('{"refresh_token":"y"}', now)).toBe(false)
  })

  it('is signed in when expires_at (seconds) is in the future', () => {
    expect(isActiveSessionToken(tok(',"expires_at":1700003600'), now)).toBe(true)
  })

  it('is NOT signed in when expires_at is in the past (the hardening)', () => {
    expect(isActiveSessionToken(tok(',"expires_at":1699996400'), now)).toBe(false)
  })

  it('falls back to presence when there is no expires_at (no regression)', () => {
    expect(isActiveSessionToken(tok(''), now)).toBe(true)
  })

  it('falls back to presence when the value is not parseable JSON (no regression)', () => {
    expect(isActiveSessionToken('garbage "access_token" more', now)).toBe(true)
  })
})
