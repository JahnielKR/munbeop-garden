import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Grammar } from '~/lib/domain'
import GrammarStudySheet from '~/components/library/GrammarStudySheet.vue'

vi.mock('~/stores/srs', () => ({
  useSrsStore: () => ({
    ensure: () => ({ mastery: 'seedling', lastSeen: null }),
    peek: () => ({ mastery: 'seedling', lastSeen: null }),
  }),
}))
vi.mock('~/stores/log', () => ({
  useLogStore: () => ({ entries: [] }),
}))
vi.mock('~/lib/grammar-examples', () => ({
  examplesFor: () => [],
}))

const pushSpy = vi.fn()
vi.stubGlobal('useRouter', () => ({ push: pushSpy }))

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

  it('renders the achievements section; shows ExamplesSection for examples', () => {
    const wrapper = mount(GrammarStudySheet, { props: { grammar: seededGrammar } })
    const html = wrapper.html()
    // The achievements ComingSoon placeholder is replaced by the real section.
    expect(wrapper.find('.ach-section').exists()).toBe(true)
    expect(wrapper.findAll('.ach').length).toBe(6)
    expect(html).not.toContain('library.modal.coming_soon.achievements')
    // ExamplesSection replaces the coming-soon placeholder. With an empty bank
    // it renders nothing — the canonical example lives ONLY in Meaning, shown
    // exactly once (no "above == below" duplicate).
    expect(html).not.toContain('library.modal.coming_soon.examples')
    expect((html.match(/비가 오니까 우산을 챙겨요\./g) ?? []).length).toBe(1)
  })

  it('replaces the audio placeholder with the pronunciation section for a guided point', () => {
    // 의문사 is a skipped category label → no guide → no section; -지만 has one → chips render.
    const unguided = mount(GrammarStudySheet, { props: { grammar: { ...seededGrammar, ko: '의문사' } } })
    expect(unguided.find('.pron-section').exists()).toBe(false)
    const guided = mount(GrammarStudySheet, { props: { grammar: { ...seededGrammar, ko: '-지만' } } })
    expect(guided.find('.pron-section').exists()).toBe(true)
    expect(guided.find('.pron-parts').text()).toContain('지')
  })

  it('practice CTA pushes /practice/ruleta?focus=<ko> (the hub lives at /practice)', async () => {
    const wrapper = mount(GrammarStudySheet, { props: { grammar: seededGrammar } })
    const btn = wrapper.find('.cta__btn')
    await btn.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith({
      path: '/practice/ruleta',
      query: { focus: '-(으)니까' },
    })
  })
})
