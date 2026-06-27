import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChoiceRow from '~/components/numbers-market/ChoiceRow.vue'

describe('ChoiceRow', () => {
  it('renders one button per choice and emits choose with the value', async () => {
    const w = mount(ChoiceRow, { props: { choices: ['세 시 십오 분', '삼 시 십오 분', '세 시 열다섯 분', '두 시 십오 분'] } })
    const btns = w.findAll('[data-testid="speed-choice"]')
    expect(btns).toHaveLength(4)
    await btns[1]!.trigger('click')
    expect(w.emitted('choose')?.[0]).toEqual(['삼 시 십오 분'])
  })
  it('disables buttons when disabled', () => {
    const w = mount(ChoiceRow, { props: { choices: ['가', '나'], disabled: true } })
    expect(w.find('[data-testid="speed-choice"]').attributes('disabled')).toBeDefined()
  })
})
