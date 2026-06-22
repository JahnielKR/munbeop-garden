import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExampleAudioButton from '~/components/library/GrammarStudySheet/ExampleAudioButton.vue'

const created: FakeAudio[] = []
class FakeAudio {
  src: string
  volume = 1
  play = vi.fn(async () => {})
  pause = vi.fn()
  addEventListener = vi.fn()
  constructor(src?: string) { this.src = src ?? ''; created.push(this) }
}

describe('ExampleAudioButton', () => {
  beforeEach(() => { created.length = 0; vi.stubGlobal('Audio', FakeAudio) })
  afterEach(() => vi.unstubAllGlobals())

  it('renders a labelled button and plays the example on click', async () => {
    const w = mount(ExampleAudioButton, {
      props: { sentence: '학교에 가요.' },
      global: { mocks: { $t: (k: string) => k } },
    })
    const btn = w.find('button')
    expect(btn.attributes('aria-label')).toBe('library.examples.play_audio')
    await btn.trigger('click')
    expect(created.length).toBe(1)
    expect(created[0]!.src).toContain('/grammar-examples/audio/')
  })
})
