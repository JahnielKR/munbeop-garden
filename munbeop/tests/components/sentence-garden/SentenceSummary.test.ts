import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SentenceSummary from '~/components/sentence-garden/SentenceSummary.vue'

describe('SentenceSummary', () => {
  it('shows only restart when nothing failed', () => {
    const w = mount(SentenceSummary, { props: { score: { correct: 3, total: 3 }, failedCount: 0 } })
    expect(w.findAll('button')).toHaveLength(1)
    expect(w.find('section.sg-summary').exists()).toBe(true)
  })
  it('shows the replay button when something failed', () => {
    const w = mount(SentenceSummary, { props: { score: { correct: 1, total: 3 }, failedCount: 2 } })
    expect(w.findAll('button')).toHaveLength(2)
  })
})
