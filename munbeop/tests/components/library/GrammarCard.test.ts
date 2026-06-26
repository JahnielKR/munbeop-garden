import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Grammar } from '~/lib/domain'
import GrammarCard from '~/components/library/GrammarCard.vue'

vi.mock('~/stores/srs', () => ({
  useSrsStore: () => ({
    ensure: () => ({ mastery: 'seedling', lastSeen: null }),
    peek: () => ({ mastery: 'seedling', lastSeen: null }),
  }),
}))

const full: Grammar = {
  ko: '은/는',
  meaning: { en: 'topic particle', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  example: '저는 학생이에요.',
  trans: { en: 'I am a student.', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  deckId: 'topik-1',
}
const bare: Grammar = {
  ko: '-다',
  meaning: { en: 'plain ending', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  deckId: 'topik-1',
}

describe('GrammarCard', () => {
  it('renders ko, meaning, example, trans when present', () => {
    const html = mount(GrammarCard, { props: { grammar: full } }).html()
    expect(html).toContain('은/는')
    expect(html).toContain('topic particle')
    expect(html).toContain('저는 학생이에요')
    expect(html).toContain('I am a student')
  })

  it('hides example and trans when undefined', () => {
    const w = mount(GrammarCard, { props: { grammar: bare } })
    expect(w.find('.item__example').exists()).toBe(false)
    expect(w.find('.item__trans').exists()).toBe(false)
  })

  it('emits click when the card is clicked', async () => {
    const w = mount(GrammarCard, { props: { grammar: full } })
    await w.find('button.card').trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
  })
})
