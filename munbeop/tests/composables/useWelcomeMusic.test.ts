import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWelcomeMusic, _resetWelcomeMusicForTest } from '~/composables/useWelcomeMusic'

class FakeAudio {
  src: string
  loop = false
  volume = 1
  paused = true
  play = vi.fn(async () => { this.paused = false })
  pause = vi.fn(() => { this.paused = true })
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  constructor(src: string) { this.src = src }
}

const STORAGE_KEY = 'mungarden:welcome:music'

describe('useWelcomeMusic', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('Audio', FakeAudio)
    _resetWelcomeMusicForTest()
  })
  afterEach(() => { vi.unstubAllGlobals() })

  it('starts in "off" state with no audio element', () => {
    const { state, ready } = useWelcomeMusic()
    expect(state.value).toBe('off')
    expect(ready.value).toBe(false)
  })

  it('toggle() boots audio on first call and flips to "on"', async () => {
    const { state, ready, toggle } = useWelcomeMusic()
    await toggle()
    expect(state.value).toBe('on')
    expect(ready.value).toBe(true)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('on')
  })

  it('toggle() flips on → off without tearing down audio', async () => {
    const { state, toggle } = useWelcomeMusic()
    await toggle()
    await toggle()
    expect(state.value).toBe('off')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('off')
  })

  it('hydrate() respects a prior "on" preference (but waits for gesture)', () => {
    localStorage.setItem(STORAGE_KEY, 'on')
    const { state, ready, hydrate } = useWelcomeMusic()
    hydrate()
    expect(state.value).toBe('on')
    expect(ready.value).toBe(false)
  })

  it('ensurePlaying() forces state on and starts the audio', async () => {
    const { state, ready, ensurePlaying } = useWelcomeMusic()
    await ensurePlaying()
    expect(state.value).toBe('on')
    expect(ready.value).toBe(true)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('on')
  })

  it('ensurePlaying() overrides a previously-off preference', async () => {
    localStorage.setItem(STORAGE_KEY, 'off')
    const { state, ensurePlaying, hydrate } = useWelcomeMusic()
    hydrate()
    expect(state.value).toBe('off')
    await ensurePlaying()
    expect(state.value).toBe('on')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('on')
  })
})
