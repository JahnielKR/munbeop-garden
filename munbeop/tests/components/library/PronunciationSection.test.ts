import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PronunciationSection from '~/components/library/GrammarStudySheet/PronunciationSection.vue'
import { guideFor } from '~/lib/pronunciation'
import { examplesFor } from '~/lib/grammar-examples'
import type { Grammar } from '~/lib/domain'

const playSyllable = vi.fn()
const playAll = vi.fn()
vi.mock('~/composables/usePronunciationAudio', () => ({
  usePronunciationAudio: () => ({ playSyllable, playAll, stop: vi.fn() }),
}))

function grammar(ko: string): Grammar {
  return { ko, meaning: {} as never, deckId: 'topik-1' }
}

const GUIDED = '-지만' // guideFor -> parts ['지','만'], and has examples

describe('PronunciationSection', () => {
  beforeEach(() => {
    playSyllable.mockReset()
    playAll.mockReset()
  })

  it('renders nothing when the point has no pronunciation guide', () => {
    const wrapper = mount(PronunciationSection, { props: { grammar: grammar('이/가') } })
    expect(guideFor('이/가')).toBeUndefined()
    expect(wrapper.find('.pron-section').exists()).toBe(false)
  })

  it('renders one chip per authored syllable', () => {
    const wrapper = mount(PronunciationSection, { props: { grammar: grammar(GUIDED) } })
    const chips = wrapper.findAll('.pron-chip')
    expect(chips.map((c) => c.text())).toEqual(guideFor(GUIDED)!.parts)
  })

  it('plays a single syllable when its chip is clicked', async () => {
    const wrapper = mount(PronunciationSection, { props: { grammar: grammar(GUIDED) } })
    await wrapper.findAll('.pron-chip')[0]!.trigger('click')
    expect(playSyllable).toHaveBeenCalledWith(guideFor(GUIDED)!.parts[0])
  })

  it('plays all parts in order via the play-all button', async () => {
    const wrapper = mount(PronunciationSection, { props: { grammar: grammar(GUIDED) } })
    await wrapper.get('.pron-all').trigger('click')
    expect(playAll).toHaveBeenCalledWith(guideFor(GUIDED)!.parts)
  })

  it('shows the shortest example sentence in row 2 (with audio)', () => {
    const wrapper = mount(PronunciationSection, { props: { grammar: grammar(GUIDED) } })
    const shortest = [...examplesFor(GUIDED)].sort((a, b) => a.sentence.length - b.sentence.length)[0]!
    expect(wrapper.find('.pron-sentence__ko').text()).toBe(shortest.sentence)
    expect(wrapper.find('[data-testid="example-audio"]').exists()).toBe(true)
  })
})
