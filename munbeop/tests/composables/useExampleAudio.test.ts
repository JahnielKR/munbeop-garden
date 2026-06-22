import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useExampleAudio, _resetExampleAudioForTest } from '~/composables/useExampleAudio'
import { exampleAudioSrc } from '~/lib/grammar-examples/audio'

const created: FakeAudio[] = []
class FakeAudio {
  src: string
  volume = 1
  paused = true
  play = vi.fn(async () => { this.paused = false })
  pause = vi.fn(() => { this.paused = true })
  addEventListener = vi.fn()
  constructor(src?: string) { this.src = src ?? ''; created.push(this) }
}

describe('useExampleAudio', () => {
  beforeEach(() => {
    created.length = 0
    vi.stubGlobal('Audio', FakeAudio)
    _resetExampleAudioForTest()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('plays the hashed src for a sentence', () => {
    const { playExample } = useExampleAudio()
    playExample('저는 물을 마셔요.')
    expect(created.length).toBe(1)
    expect(created[0]!.src).toContain(exampleAudioSrc('저는 물을 마셔요.'))
    expect(created[0]!.play).toHaveBeenCalled()
  })
  it('a new play cancels the previous; stop pauses', () => {
    const { playExample, stop } = useExampleAudio()
    playExample('저는 물을 마셔요.')
    const first = created[0]!
    playExample('학교에 가요.')
    expect(first.pause).toHaveBeenCalled()
    stop()
    expect(created[created.length - 1]!.pause).toHaveBeenCalled()
  })
  it('is SSR-safe and tolerates a play() rejection', async () => {
    vi.stubGlobal('Audio', undefined)
    _resetExampleAudioForTest()
    const { playExample, stop } = useExampleAudio()
    expect(() => { playExample('x'); stop() }).not.toThrow()
    class RejectingAudio extends FakeAudio {
      override play = vi.fn(async () => { throw new Error('NotAllowedError') })
    }
    vi.stubGlobal('Audio', RejectingAudio)
    _resetExampleAudioForTest()
    expect(() => useExampleAudio().playExample('x')).not.toThrow()
    await Promise.resolve()
  })
})
