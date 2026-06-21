import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SentenceAudioButton from '~/components/particle-lab/SentenceAudioButton.vue'
import { _resetParticleAudioForTest } from '~/composables/useParticleAudio'

const created: FakeAudio[] = []
class FakeAudio {
  src: string
  volume = 1
  play = vi.fn(async () => {})
  pause = vi.fn()
  addEventListener = vi.fn()
  constructor(src?: string) {
    this.src = src ?? ''
    created.push(this)
  }
}

describe('SentenceAudioButton', () => {
  beforeEach(() => {
    created.length = 0
    vi.stubGlobal('Audio', FakeAudio)
    _resetParticleAudioForTest()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders a button with the i18n aria-label', () => {
    const w = mount(SentenceAudioButton, { props: { sentenceId: 's01-jeoneun' } })
    const btn = w.get('[data-testid="sentence-audio"]')
    expect(btn.attributes('aria-label')).toBe('particles.explore.play_audio')
  })

  it('plays the sentence clip on click', async () => {
    const w = mount(SentenceAudioButton, { props: { sentenceId: 's03-hakgyo' } })
    await w.get('[data-testid="sentence-audio"]').trigger('click')
    expect(created.length).toBe(1)
    expect(created[0]!.src).toContain('sentence-s03-hakgyo.ogg')
    expect(created[0]!.play).toHaveBeenCalled()
  })
})
