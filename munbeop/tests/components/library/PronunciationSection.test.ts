import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PronunciationSection from '~/components/library/GrammarStudySheet/PronunciationSection.vue'
import { guideFor } from '~/lib/pronunciation'
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
    const wrapper = mount(PronunciationSection, { props: { grammar: grammar('의문사') } })
    expect(guideFor('의문사')).toBeUndefined()
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
})
