import { describe, it, expect } from 'vitest'
import { decideWelcomeRedirect } from '~/middleware/welcome-redirect.global'

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
