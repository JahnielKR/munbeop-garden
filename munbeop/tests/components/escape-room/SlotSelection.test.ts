import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SlotSelection from '~/components/escape-room/SlotSelection.vue'
import type { SelectionCandidate } from '~/lib/domain'

const ls = (s: string) => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

const candidate: SelectionCandidate = {
  korean: '안녕! 사과가 있어요.',
  question: ls('¿Qué dice halmeoni?'),
  options: [ls('Hay manzanas.'), ls('Hay peras.'), ls('No hay nada.'), ls('Hay café.')],
  correctIndex: 0,
  hints: { free: ls('vocab free'), premium: ls('rule premium') },
}

describe('SlotSelection', () => {
  it('renders the Korean line and the question', () => {
    const w = mount(SlotSelection, {
      props: { candidate, flags: { free: false, premium: false } },
    })
    expect(w.get('[data-testid="slot-korean"]').text()).toContain('안녕! 사과가 있어요.')
    expect(w.get('[data-testid="slot-question"]').text()).toContain('¿Qué dice halmeoni?')
  })

  it('renders 4 option buttons in order', () => {
    const w = mount(SlotSelection, {
      props: { candidate, flags: { free: false, premium: false } },
    })
    const opts = w.findAll('[data-testid="slot-option"]')
    expect(opts).toHaveLength(4)
    expect(opts[0]!.text()).toContain('Hay manzanas.')
    expect(opts[3]!.text()).toContain('Hay café.')
  })

  it('emits "answer" with the clicked option index', async () => {
    const w = mount(SlotSelection, {
      props: { candidate, flags: { free: false, premium: false } },
    })
    await w.findAll('[data-testid="slot-option"]')[2]!.trigger('click')
    expect(w.emitted('answer')).toEqual([[2]])
  })

  it('forwards HintPanel events as "use-free-hint" / "use-premium-hint"', async () => {
    const w = mount(SlotSelection, {
      props: { candidate, flags: { free: false, premium: false } },
    })
    await w.get('[data-testid="hint-free-btn"]').trigger('click')
    await w.get('[data-testid="hint-premium-btn"]').trigger('click')
    expect(w.emitted('use-free-hint')).toBeTruthy()
    expect(w.emitted('use-premium-hint')).toBeTruthy()
  })
})
