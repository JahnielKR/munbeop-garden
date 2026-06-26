import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ExamplesSection from '~/components/library/GrammarStudySheet/ExamplesSection.vue'

// vi.mock is hoisted above imports by Vitest, so ExamplesSection still gets the mock.
vi.mock('~/lib/grammar-examples', () => ({
  examplesFor: (ko: string) =>
    ko === '-아/어요'
      ? [
          { ko: '-아/어요', sentence: '학교에 가요.', trans: { en: 'I go to school.' }, level: 'polite' },
          { ko: '-아/어요', sentence: '학교에 갑니다.', trans: { en: 'I go to school (formal).' }, level: 'formal' },
        ]
      : [],
}))

const mountWith = (grammar: Record<string, unknown>) =>
  mount(ExamplesSection, {
    props: { grammar },
    global: { mocks: { $t: (k: string) => k }, stubs: {} },
  })

describe('ExamplesSection', () => {
  it('renders one row per bank example with a register chip', () => {
    const w = mountWith({ ko: '-아/어요' })
    expect(w.findAll('.example')).toHaveLength(2)
    expect(w.text()).toContain('학교에 가요.')
    expect(w.text()).toContain('해요체') // polite chip
    expect(w.text()).toContain('합니다체') // formal chip
  })
  it('renders nothing when the bank is empty, even if a canonical example exists', () => {
    // The canonical example lives ONLY in MeaningSection; ExamplesSection must
    // not echo it (that "above == below" duplicate is the bug we removed).
    const w = mountWith({ ko: '-고', example: '밥을 먹고 잤어요.', trans: { en: 'I ate and slept.' } })
    expect(w.find('.examples-section').exists()).toBe(false)
    expect(w.text()).not.toContain('밥을 먹고 잤어요.')
  })
  it('renders nothing when there is neither a bank nor a canonical example', () => {
    const w = mountWith({ ko: '-고' })
    expect(w.find('.examples-section').exists()).toBe(false)
  })
})
