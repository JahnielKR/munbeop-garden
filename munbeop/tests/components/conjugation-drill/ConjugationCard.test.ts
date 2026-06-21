// tests/components/conjugation-drill/ConjugationCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConjugationCard from '~/components/conjugation-drill/ConjugationCard.vue'

const item = {
  id: '듣다:-아/어요', dict: '듣다', gloss: 'listen', klass: 't_irr',
  ending: '-아/어요', correct: '들어요', options: ['들어요', '듣어요', '들으요', '듣아요'],
}

function factory(phase = 'question', picked: string | null = null) {
  return mount(ConjugationCard, {
    props: { item, options: item.options, phase, verdict: phase === 'wrong' ? false : phase === 'right' ? true : null, picked },
    global: { mocks: { $t: (k: string, p?: any) => (p ? `${k}:${JSON.stringify(p)}` : k) } },
  })
}

describe('ConjugationCard', () => {
  it('renders the dict form and one button per option', () => {
    const w = factory()
    expect(w.text()).toContain('듣다')
    expect(w.findAll('[data-testid^="conj-option-"]')).toHaveLength(4)
  })
  it('emits answer with the chosen option', async () => {
    const w = factory()
    await w.find('[data-testid="conj-option-0"]').trigger('click')
    expect(w.emitted('answer')?.[0]?.[0]).toBe(item.options[0])
  })
  it('on wrong, reveals the correct form and a rule note', () => {
    const w = factory('wrong', '듣어요')
    expect(w.text()).toContain('conjugation.reveal_correct')
    expect(w.text()).toContain('conjugation.rule.t_irr')
  })
})
