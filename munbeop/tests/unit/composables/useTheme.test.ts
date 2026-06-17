import { describe, it, expect, beforeEach } from 'vitest'
import { useTheme, _resetThemeForTest } from '~/composables/useTheme'

/** Controllable matchMedia stand-in (happy-dom's is static). */
function installMatchMedia(initialDark: boolean) {
  let dark = initialDark
  const listeners = new Set<(e: { matches: boolean }) => void>()
  const mql = {
    get matches() {
      return dark
    },
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_t: string, cb: (e: { matches: boolean }) => void) => listeners.add(cb),
    removeEventListener: (_t: string, cb: (e: { matches: boolean }) => void) => listeners.delete(cb),
    addListener: (cb: (e: { matches: boolean }) => void) => listeners.add(cb),
    removeListener: (cb: (e: { matches: boolean }) => void) => listeners.delete(cb),
    dispatchEvent: () => true,
  }
  ;(window as unknown as { matchMedia: () => typeof mql }).matchMedia = () => mql
  return {
    setDark(v: boolean) {
      dark = v
      listeners.forEach((cb) => cb({ matches: v }))
    },
  }
}

const domTheme = () => document.documentElement.dataset.theme

describe('useTheme system/auto', () => {
  beforeEach(() => {
    _resetThemeForTest()
    delete document.documentElement.dataset.theme
    localStorage.clear()
  })

  it('applies an explicit dark/light preference to the DOM and persists it', () => {
    installMatchMedia(false)
    const { setTheme, theme } = useTheme()
    setTheme('dark')
    expect(theme.value).toBe('dark')
    expect(domTheme()).toBe('dark')
    expect(localStorage.getItem('mungarden:theme')).toBe('dark')
    setTheme('light')
    expect(domTheme()).toBeUndefined()
    expect(localStorage.getItem('mungarden:theme')).toBe('light')
  })

  it('resolves system mode to the current OS preference', () => {
    installMatchMedia(true) // OS = dark
    const { setTheme, theme, resolved } = useTheme()
    setTheme('system')
    expect(theme.value).toBe('system')
    expect(resolved.value).toBe('dark')
    expect(domTheme()).toBe('dark')
  })

  it('follows a live OS change while in system mode', () => {
    const mm = installMatchMedia(false) // OS = light
    const { setTheme, resolved } = useTheme()
    setTheme('system')
    expect(resolved.value).toBe('light')
    expect(domTheme()).toBeUndefined()
    mm.setDark(true) // user flips the OS to dark
    expect(resolved.value).toBe('dark')
    expect(domTheme()).toBe('dark')
  })

  it('ignores OS changes when an explicit preference is set', () => {
    const mm = installMatchMedia(false)
    const { setTheme, resolved } = useTheme()
    setTheme('light')
    mm.setDark(true)
    expect(resolved.value).toBe('light')
    expect(domTheme()).toBeUndefined()
  })

  it('hydrate restores a stored system preference and applies the resolved theme', () => {
    installMatchMedia(true)
    localStorage.setItem('mungarden:theme', 'system')
    const { hydrate, theme, resolved } = useTheme()
    hydrate()
    expect(theme.value).toBe('system')
    expect(resolved.value).toBe('dark')
    expect(domTheme()).toBe('dark')
  })
})
