import { describe, it, expect } from 'vitest'
import { decideWelcomeRedirect } from '~/middleware/welcome-redirect.global'

describe('decideWelcomeRedirect', () => {
  it('signed-in user hitting / → stays at /', () => {
    expect(
      decideWelcomeRedirect({ path: '/', signedIn: true, welcomed: false }),
    ).toBe(null)
  })

  it('signed-in user hitting /welcome → redirected to /', () => {
    expect(
      decideWelcomeRedirect({ path: '/welcome', signedIn: true, welcomed: false }),
    ).toBe('/')
  })

  it('anon visitor with welcomed flag hitting / → stays at /', () => {
    expect(
      decideWelcomeRedirect({ path: '/', signedIn: false, welcomed: true }),
    ).toBe(null)
  })

  it('anon visitor with no flag hitting / → redirected to /welcome', () => {
    expect(
      decideWelcomeRedirect({ path: '/', signedIn: false, welcomed: false }),
    ).toBe('/welcome')
  })

  it('anon visitor hitting /welcome stays regardless of flag', () => {
    expect(
      decideWelcomeRedirect({ path: '/welcome', signedIn: false, welcomed: true }),
    ).toBe(null)
    expect(
      decideWelcomeRedirect({ path: '/welcome', signedIn: false, welcomed: false }),
    ).toBe(null)
  })

  it('other paths never redirect', () => {
    expect(
      decideWelcomeRedirect({ path: '/practice', signedIn: false, welcomed: false }),
    ).toBe(null)
    expect(
      decideWelcomeRedirect({ path: '/auth/callback', signedIn: false, welcomed: false }),
    ).toBe(null)
  })
})
