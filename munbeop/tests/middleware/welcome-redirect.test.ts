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

  it('other paths never redirect (direct links / deep routes untouched)', () => {
    expect(
      decideWelcomeRedirect({ path: '/practice', signedIn: false }),
    ).toBe(null)
    expect(
      decideWelcomeRedirect({ path: '/auth/callback', signedIn: false }),
    ).toBe(null)
    expect(
      decideWelcomeRedirect({ path: '/practice', signedIn: true }),
    ).toBe(null)
  })
})
