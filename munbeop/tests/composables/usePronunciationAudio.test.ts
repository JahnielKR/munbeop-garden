import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { usePronunciationAudio, _resetPronunciationAudioForTest } from '~/composables/usePronunciationAudio'
import { syllableAudioSrc } from '~/lib/pronunciation/audio'

const created: FakeAudio[] = []
class FakeAudio {
  src: string
  volume = 1
  paused = true
  listeners: Record<string, Array<() => void>> = {}
  play = vi.fn(async () => { this.paused = false })
  pause = vi.fn(() => { this.paused = true })
  addEventListener = vi.fn((ev: string, cb: () => void) => {
    ;(this.listeners[ev] ??= []).push(cb)
  })
  fire(ev: string) { (this.listeners[ev] ?? []).forEach((cb) => cb()) }
  constructor(src?: string) { this.src = src ?? ''; created.push(this) }
}

describe('usePronunciationAudio', () => {
  beforeEach(() => {
    created.length = 0
    vi.stubGlobal('Audio', FakeAudio)
    _resetPronunciationAudioForTest()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('playSyllable plays the hashed src for one syllable', () => {
    usePronunciationAudio().playSyllable('요')
    expect(created.length).toBe(1)
    expect(created[0]!.src).toContain(syllableAudioSrc('요'))
    expect(created[0]!.play).toHaveBeenCalled()
  })

  it('playAll advances syllable-by-syllable on `ended`', () => {
    usePronunciationAudio().playAll(['고', '요'], 0)
    expect(created.length).toBe(1)
    expect(created[0]!.src).toContain(syllableAudioSrc('고'))
    created[0]!.fire('ended')
    expect(created.length).toBe(2)
    expect(created[1]!.src).toContain(syllableAudioSrc('요'))
  })

  it('stop() cancels a running sequence', () => {
    const { playAll, stop } = usePronunciationAudio()
    playAll(['고', '요', '다'], 0)
    created[0]!.fire('ended') // -> plays 요 (index 1)
    expect(created.length).toBe(2)
    stop()
    created[1]!.fire('ended') // superseded -> must NOT play 다
    expect(created.length).toBe(2)
    expect(created[1]!.pause).toHaveBeenCalled()
  })

  it('playSyllable supersedes a running sequence', () => {
    const api = usePronunciationAudio()
    api.playAll(['고', '요', '다'], 0)
    api.playSyllable('만')
    const last = created[created.length - 1]!
    expect(last.src).toContain(syllableAudioSrc('만'))
    // The sequence's first clip was paused when superseded.
    expect(created[0]!.pause).toHaveBeenCalled()
  })

  it('is SSR-safe and tolerates a play() rejection', async () => {
    vi.stubGlobal('Audio', undefined)
    _resetPronunciationAudioForTest()
    const { playSyllable, playAll, stop } = usePronunciationAudio()
    expect(() => { playSyllable('요'); playAll(['고'], 0); stop() }).not.toThrow()

    class RejectingAudio extends FakeAudio {
      override play = vi.fn(async () => { throw new Error('NotAllowedError') })
    }
    vi.stubGlobal('Audio', RejectingAudio)
    _resetPronunciationAudioForTest()
    expect(() => usePronunciationAudio().playSyllable('요')).not.toThrow()
    await Promise.resolve()
  })
})
