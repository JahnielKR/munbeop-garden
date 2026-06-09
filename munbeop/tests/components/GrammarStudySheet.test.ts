import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Grammar } from '~/lib/domain'

vi.mock('~/stores/srs', () => ({
  useSrsStore: () => ({
    ensure: () => ({ mastery: 'seedling', lastSeen: null }),
  }),
}))
vi.mock('~/stores/log', () => ({
  useLogStore: () => ({ entries: [] }),
}))

const pushSpy = vi.fn()
vi.stubGlobal('useRouter', () => ({ push: pushSpy }))

import GrammarStudySheet from '~/components/library/GrammarStudySheet.vue'

const seededGrammar: Grammar = {
  ko: '-(으)니까',
  meaning: { en: 'because (subjective reason)', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  example: '비가 오니까 우산을 챙겨요.',
  trans: { en: 'It is raining, so I bring an umbrella.', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  usageNotes: { en: 'Use this for subjective reasons. Often paired with imperatives.', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  deckId: 'topik-1',
}
const unseededGrammar: Grammar = {
  ko: '-기만 하다',
  meaning: { en: 'just do X (and nothing else)', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  deckId: 'topik-3',
}

describe('GrammarStudySheet', () => {
  it('renders ko, meaning, example, trans when present', () => {
    const wrapper = mount(GrammarStudySheet, { props: { grammar: seededGrammar } })
    const html = wrapper.html()
    expect(html).toContain('-(으)니까')
    expect(html).toContain('because (subjective reason)')
    expect(html).toContain('비가 오니까')
    expect(html).toContain('It is raining')
  })

  it('renders usageNotes when present', () => {
    const wrapper = mount(GrammarStudySheet, { props: { grammar: seededGrammar } })
    expect(wrapper.html()).toContain('Use this for subjective reasons.')
  })

  it('renders ComingSoonSection for usageNotes when undefined', () => {
    const wrapper = mount(GrammarStudySheet, { props: { grammar: unseededGrammar } })
    expect(wrapper.html()).toContain('library.modal.coming_soon.usage_notes')
  })

  it('always renders ComingSoon for audio, examples, achievements in v1', () => {
    const wrapper = mount(GrammarStudySheet, { props: { grammar: seededGrammar } })
    const html = wrapper.html()
    expect(html).toContain('library.modal.coming_soon.audio')
    expect(html).toContain('library.modal.coming_soon.examples')
    expect(html).toContain('library.modal.coming_soon.achievements')
  })

  it('practice CTA pushes /practice?focus=<ko>', async () => {
    const wrapper = mount(GrammarStudySheet, { props: { grammar: seededGrammar } })
    const btn = wrapper.find('.cta__btn')
    await btn.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith({ path: '/practice', query: { focus: '-(으)니까' } })
  })
})
