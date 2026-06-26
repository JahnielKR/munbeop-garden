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

const GUIDED = '-지만' // single form: ['지','만']
const MULTI = '은/는' // two allomorph forms: ['은'] | ['는']

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

  it('renders one chip per syllable and one play-all for a single-form guide', () => {
    const wrapper = mount(PronunciationSection, { props: { grammar: grammar(GUIDED) } })
    const forms = guideFor(GUIDED)!.forms
    expect(forms).toHaveLength(1)
    expect(wrapper.findAll('.pron-chip').map((c) => c.text())).toEqual(forms[0]!.parts)
    expect(wrapper.findAll('.pron-all')).toHaveLength(1)
  })

  it('plays a single syllable when its chip is clicked', async () => {
    const wrapper = mount(PronunciationSection, { props: { grammar: grammar(GUIDED) } })
    await wrapper.findAll('.pron-chip')[0]!.trigger('click')
    expect(playSyllable).toHaveBeenCalledWith(guideFor(GUIDED)!.forms[0]!.parts[0])
  })

  it('plays a form’s parts in order via its play-all button', async () => {
    const wrapper = mount(PronunciationSection, { props: { grammar: grammar(GUIDED) } })
    await wrapper.get('.pron-all').trigger('click')
    expect(playAll).toHaveBeenCalledWith(guideFor(GUIDED)!.forms[0]!.parts)
  })

  it('renders one chip row and one play-all per form for a two-form allomorph', () => {
    const wrapper = mount(PronunciationSection, { props: { grammar: grammar(MULTI) } })
    const forms = guideFor(MULTI)!.forms
    expect(forms).toHaveLength(2)
    const rows = wrapper.findAll('.pron-parts')
    expect(rows).toHaveLength(2)
    expect(wrapper.findAll('.pron-all')).toHaveLength(2)
    expect(rows[0]!.findAll('.pron-chip').map((c) => c.text())).toEqual(forms[0]!.parts)
    expect(rows[1]!.findAll('.pron-chip').map((c) => c.text())).toEqual(forms[1]!.parts)
  })

  it('plays only the clicked form’s parts — never concatenates across forms', async () => {
    const wrapper = mount(PronunciationSection, { props: { grammar: grammar(MULTI) } })
    const forms = guideFor(MULTI)!.forms
    await wrapper.findAll('.pron-all')[1]!.trigger('click')
    expect(playAll).toHaveBeenCalledWith(forms[1]!.parts)
    expect(playAll).not.toHaveBeenCalledWith([...forms[0]!.parts, ...forms[1]!.parts])
  })
})
