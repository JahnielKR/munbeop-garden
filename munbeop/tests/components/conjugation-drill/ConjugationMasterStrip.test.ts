import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConjugationMasterStrip from '~/components/conjugation-drill/ConjugationMasterStrip.vue'

const perClass = [
  { klass: 'regular', ko: '규칙', done: true },
  { klass: 'p_irr', ko: 'ㅂ 불규칙', done: false },
]
describe('ConjugationMasterStrip', () => {
  it('shows progress and a pip per class', () => {
    const w = mount(ConjugationMasterStrip, {
      props: { perClass, doneCount: 1, total: 9, earned: false },
      global: { mocks: { $t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k) } },
    })
    expect(w.findAll('[data-testid="conj-pip"]')).toHaveLength(2)
    expect(w.text()).toContain('conjugation.master.progress')
  })
})
