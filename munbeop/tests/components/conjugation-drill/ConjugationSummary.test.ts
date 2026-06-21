// tests/components/conjugation-drill/ConjugationSummary.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConjugationSummary from '~/components/conjugation-drill/ConjugationSummary.vue'

const failed = [
  { id: '듣다:-아/어요', dict: '듣다', gloss: 'listen', klass: 't_irr', ending: '-아/어요', correct: '들어요', options: [] },
]
function factory(failedItems = failed) {
  return mount(ConjugationSummary, {
    props: { score: { correct: 7, total: 8, accuracy: 0.875 }, failedItems },
    global: { mocks: { $t: (k: string, p?: any) => (p ? `${k}:${JSON.stringify(p)}` : k) } },
  })
}

describe('ConjugationSummary', () => {
  it('shows the score and a review list of failed items', () => {
    const w = factory()
    expect(w.text()).toContain('conjugation.summary_score')
    expect(w.text()).toContain('들어요')
  })
  it('emits replay-failed and restart', async () => {
    const w = factory()
    await w.find('[data-testid="conj-replay"]').trigger('click')
    expect(w.emitted('replay-failed')).toBeTruthy()
    await w.find('[data-testid="conj-restart"]').trigger('click')
    expect(w.emitted('restart')).toBeTruthy()
  })
  it('hides the review block on a perfect round', () => {
    const w = factory([])
    expect(w.find('[data-testid="conj-replay"]').exists()).toBe(false)
  })
})
