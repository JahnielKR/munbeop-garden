import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CounterCard from '~/components/counter-drill/CounterCard.vue'
import type { CountItem } from '~/lib/domain'

const item: CountItem = {
  counterId: 'gwon', quantity: 3, noun: '책', system: 'native', answer: '세 권',
  trans: { en: 'three books', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
}
const opts = ['세 권', '삼 권', '셋 권', '세 개']

describe('CounterCard', () => {
  it('renders the prompt noun×quantity and the 4 options', () => {
    const w = mount(CounterCard, { props: { item, options: opts, phase: 'question', picked: null, verdict: null } })
    expect(w.text()).toContain('책')
    expect(w.text()).toContain('3')
    expect(w.findAll('[data-testid="counter-option"]')).toHaveLength(4)
  })

  it('emits answer with the chosen option', async () => {
    const w = mount(CounterCard, { props: { item, options: opts, phase: 'question', picked: null, verdict: null } })
    await w.findAll('[data-testid="counter-option"]')[1]!.trigger('click')
    expect(w.emitted('answer')?.[0]).toEqual(['삼 권'])
  })
})
