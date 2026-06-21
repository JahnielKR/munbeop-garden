import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  useParticleAudio,
  sentenceAudioSrc,
  _resetParticleAudioForTest,
} from '~/composables/useParticleAudio'

const created: FakeAudio[] = []
class FakeAudio {
  src: string
  volume = 1
  paused = true
  play = vi.fn(async () => {
    this.paused = false
  })
  pause = vi.fn(() => {
    this.paused = true
  })
  addEventListener = vi.fn()
  constructor(src?: string) {
    this.src = src ?? ''
    created.push(this)
  }
}

describe('useParticleAudio', () => {
  beforeEach(() => {
    created.length = 0
    vi.stubGlobal('Audio', FakeAudio)
    _resetParticleAudioForTest()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('derives the public path from the sentence id', () => {
    expect(sentenceAudioSrc('s01-jeoneun')).toBe('/particle-lab/audio/sentence-s01-jeoneun.ogg')
  })

  it('playSentence creates an Audio at the derived src and plays it', () => {
    const { playSentence } = useParticleAudio()
    playSentence('s01-jeoneun')
    expect(created.length).toBe(1)
    expect(created[0]!.src).toContain('/particle-lab/audio/sentence-s01-jeoneun.ogg')
    expect(created[0]!.play).toHaveBeenCalled()
  })

  it('a new playSentence cancels the previous one', () => {
    const { playSentence } = useParticleAudio()
    playSentence('s01-jeoneun')
    const first = created[0]!
    playSentence('s02-goyangi')
    expect(first.pause).toHaveBeenCalled()
    expect(created[created.length - 1]!.src).toContain('sentence-s02-goyangi.ogg')
  })

  it('stop pauses the active clip', () => {
    const { playSentence, stop } = useParticleAudio()
    playSentence('s01-jeoneun')
    const a = created[0]!
    stop()
    expect(a.pause).toHaveBeenCalled()
  })

  it('is SSR-safe and tolerates a play() rejection', async () => {
    vi.stubGlobal('Audio', undefined)
    _resetParticleAudioForTest()
    const { playSentence, stop } = useParticleAudio()
    expect(() => {
      playSentence('s01-jeoneun')
      stop()
    }).not.toThrow()

    class RejectingAudio extends FakeAudio {
      override play = vi.fn(async () => {
        throw new Error('NotAllowedError')
      })
    }
    vi.stubGlobal('Audio', RejectingAudio)
    _resetParticleAudioForTest()
    const { playSentence: play2 } = useParticleAudio()
    expect(() => play2('s01-jeoneun')).not.toThrow()
    await Promise.resolve()
  })
})
