// tests/components/register-drill/RegisterSummary.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterSummary from '~/components/register-drill/RegisterSummary.vue'
import type { RegisterItem } from '~/lib/domain'

const failed: RegisterItem[] = [{
  source: '할아버지가 자요.', mode: 'honor', target: 'polite', set: 'verb',
  answer: '할아버지께서 주무세요.', distractors: ['x', 'y', 'z'],
  trans: { en: 't' } as never, why: { en: 'w' } as never,
}]
const mocks = { $t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k) }

describe('RegisterSummary', () => {
  it('shows the score and a review button when items were missed', async () => {
    const w = mount(RegisterSummary, {
      props: { score: { correct: 2, total: 3, accuracy: 0.66 }, failedItems: failed },
      global: { mocks },
    })
    expect(w.text()).toContain('register.summary_score')
    expect(w.find('[data-testid="register-replay"]').exists()).toBe(true)
    await w.find('[data-testid="register-replay"]').trigger('click')
    expect(w.emitted('replay-failed')).toBeTruthy()
  })
  it('hides the review button when nothing was missed', () => {
    const w = mount(RegisterSummary, {
      props: { score: { correct: 3, total: 3, accuracy: 1 }, failedItems: [] },
      global: { mocks },
    })
    expect(w.find('[data-testid="register-replay"]').exists()).toBe(false)
    expect(w.find('[data-testid="register-restart"]').exists()).toBe(true)
  })
})
