import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('~/lib/grammar-examples', () => ({
  examplesFor: (ko: string) =>
    ko === '-아/어요'
      ? [
          { ko: '-아/어요', sentence: '학교에 가요.', trans: { en: 'I go to school.' }, level: 'polite' },
          { ko: '-아/어요', sentence: '학교에 갑니다.', trans: { en: 'I go to school (formal).' }, level: 'formal' },
        ]
      : [],
}))

import ExamplesSection from '~/components/library/GrammarStudySheet/ExamplesSection.vue'

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
  it('falls back to the canonical example when the bank is empty', () => {
    const w = mountWith({ ko: '-고', example: '밥을 먹고 잤어요.', trans: { en: 'I ate and slept.' } })
    expect(w.findAll('.example')).toHaveLength(1)
    expect(w.text()).toContain('밥을 먹고 잤어요.')
    expect(w.text()).not.toContain('해요체') // no chip on the fallback
  })
  it('renders nothing when there is neither a bank nor a canonical example', () => {
    const w = mountWith({ ko: '-고' })
    expect(w.find('.examples-section').exists()).toBe(false)
  })
})
