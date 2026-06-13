import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  useEscapeRoomAudio,
  _resetEscapeRoomAudioForTest,
} from '~/composables/useEscapeRoomAudio'

/**
 * Fake Audio element good enough to assert the composable's logic without a
 * real media pipeline. play() resolves by default; tests can swap it to reject
 * to prove autoplay-rejection tolerance.
 */
const created: FakeAudio[] = []
class FakeAudio {
  src: string
  loop = false
  volume = 1
  paused = true
  currentTime = 0
  play = vi.fn(async () => {
    this.paused = false
  })
  pause = vi.fn(() => {
    this.paused = true
  })
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  constructor(src?: string) {
    this.src = src ?? ''
    created.push(this)
  }
}

const STORAGE_KEY = 'mungarden:escape:audio'

describe('useEscapeRoomAudio', () => {
  beforeEach(() => {
    localStorage.clear()
    created.length = 0
    vi.stubGlobal('Audio', FakeAudio)
    _resetEscapeRoomAudioForTest()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('defaults to enabled "on" with nothing playing at import', () => {
    const { enabled } = useEscapeRoomAudio()
    expect(enabled.value).toBe(true)
    // Nothing instantiates an Audio element until a play* call.
    expect(created.length).toBe(0)
  })

  it('hydrate() reads a stored "off" preference', () => {
    localStorage.setItem(STORAGE_KEY, 'off')
    const { enabled, hydrate } = useEscapeRoomAudio()
    hydrate()
    expect(enabled.value).toBe(false)
  })

  it('hydrate() treats a missing key as the default "on"', () => {
    const { enabled, hydrate } = useEscapeRoomAudio()
    hydrate()
    expect(enabled.value).toBe(true)
  })

  it('setEnabled persists the preference', () => {
    const { setEnabled } = useEscapeRoomAudio()
    setEnabled(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('off')
    setEnabled(true)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('on')
  })

  it('playAmbient starts one looping ambient at the ambient volume', () => {
    const { playAmbient } = useEscapeRoomAudio()
    playAmbient('/a/ambient-1.ogg', { fadeMs: 0 })
    expect(created.length).toBe(1)
    const a = created[0]!
    expect(a.loop).toBe(true)
    expect(a.play).toHaveBeenCalled()
  })

  it('playAmbient with the same src does NOT restart (no second element, no extra play)', () => {
    const { playAmbient } = useEscapeRoomAudio()
    playAmbient('/a/ambient-1.ogg', { fadeMs: 0 })
    const first = created[0]!
    const callsBefore = first.play.mock.calls.length
    playAmbient('/a/ambient-1.ogg', { fadeMs: 0 })
    expect(created.length).toBe(1)
    expect(first.play.mock.calls.length).toBe(callsBefore)
  })

  it('playAmbient swaps to a new src (a new element is created and started)', () => {
    const { playAmbient } = useEscapeRoomAudio()
    playAmbient('/a/ambient-1.ogg', { fadeMs: 0 })
    playAmbient('/a/ambient-2.ogg', { fadeMs: 0 })
    expect(created.length).toBe(2)
    expect(created[1]!.src).toContain('ambient-2.ogg')
    expect(created[1]!.play).toHaveBeenCalled()
  })

  it('playAmbient with an empty src stops the current ambient', () => {
    const { playAmbient } = useEscapeRoomAudio()
    playAmbient('/a/ambient-1.ogg', { fadeMs: 0 })
    const a = created[0]!
    playAmbient('', { fadeMs: 0 })
    expect(a.pause).toHaveBeenCalled()
  })

  it('playSfx may overlap (fire-and-forget; each call gets its own element)', () => {
    const { playSfx } = useEscapeRoomAudio()
    playSfx('/a/click.ogg')
    playSfx('/a/click.ogg')
    expect(created.length).toBeGreaterThanOrEqual(2)
    for (const a of created) expect(a.play).toHaveBeenCalled()
  })

  it('playVoice plays one voice; a new voice replaces the previous one', () => {
    const { playVoice } = useEscapeRoomAudio()
    playVoice('/a/voice-1.ogg')
    const first = created[0]!
    playVoice('/a/voice-2.ogg')
    expect(first.pause).toHaveBeenCalled()
    const last = created[created.length - 1]!
    expect(last.src).toContain('voice-2.ogg')
    expect(last.play).toHaveBeenCalled()
  })

  it('stopVoice pauses the active voice', () => {
    const { playVoice, stopVoice } = useEscapeRoomAudio()
    playVoice('/a/voice-1.ogg')
    const v = created[0]!
    stopVoice()
    expect(v.pause).toHaveBeenCalled()
  })

  it('stopAll stops ambient and voice', () => {
    const { playAmbient, playVoice, stopAll } = useEscapeRoomAudio()
    playAmbient('/a/ambient-1.ogg', { fadeMs: 0 })
    const amb = created[0]!
    playVoice('/a/voice-1.ogg')
    const voice = created[created.length - 1]!
    stopAll()
    expect(amb.pause).toHaveBeenCalled()
    expect(voice.pause).toHaveBeenCalled()
  })

  it('when disabled, every play* is a no-op and existing sound stops', () => {
    const { playAmbient, playSfx, playVoice, setEnabled } = useEscapeRoomAudio()
    playAmbient('/a/ambient-1.ogg', { fadeMs: 0 })
    const amb = created[0]!
    setEnabled(false)
    expect(amb.pause).toHaveBeenCalled()
    const countAfterDisable = created.length
    playAmbient('/a/ambient-2.ogg', { fadeMs: 0 })
    playSfx('/a/click.ogg')
    playVoice('/a/voice-1.ogg')
    // No new Audio elements were created while disabled.
    expect(created.length).toBe(countAfterDisable)
  })

  it('tolerates a play() rejection (autoplay blocked) without throwing', async () => {
    class RejectingAudio extends FakeAudio {
      override play = vi.fn(async () => {
        throw new Error('NotAllowedError')
      })
    }
    vi.stubGlobal('Audio', RejectingAudio)
    _resetEscapeRoomAudioForTest()
    const { playAmbient, playSfx, playVoice } = useEscapeRoomAudio()
    expect(() => playAmbient('/a/ambient-1.ogg', { fadeMs: 0 })).not.toThrow()
    expect(() => playSfx('/a/click.ogg')).not.toThrow()
    expect(() => playVoice('/a/voice-1.ogg')).not.toThrow()
    // Let the rejected promises settle so no unhandled rejection leaks.
    await Promise.resolve()
    await Promise.resolve()
  })

  it('is SSR-safe: with no Audio global, play* are silent no-ops', () => {
    vi.stubGlobal('Audio', undefined)
    _resetEscapeRoomAudioForTest()
    const { playAmbient, playSfx, playVoice, stopAll, setEnabled } = useEscapeRoomAudio()
    expect(() => {
      playAmbient('/a/ambient-1.ogg', { fadeMs: 0 })
      playSfx('/a/click.ogg')
      playVoice('/a/voice-1.ogg')
      setEnabled(false)
      stopAll()
    }).not.toThrow()
  })

  it('tolerates a missing-file "error" event without throwing', () => {
    const { playAmbient } = useEscapeRoomAudio()
    playAmbient('/a/missing.ogg', { fadeMs: 0 })
    const a = created[0]!
    // Find the registered 'error' handler and fire it — must not throw.
    const errEntry = a.addEventListener.mock.calls.find((c) => c[0] === 'error')
    expect(errEntry).toBeDefined()
    const handler = errEntry![1] as () => void
    expect(() => handler()).not.toThrow()
  })
})
