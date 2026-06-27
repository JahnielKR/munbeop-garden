import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModeToggle from '~/components/numbers-market/ModeToggle.vue'

describe('ModeToggle', () => {
  it('emits update:modelValue when the other mode is clicked', async () => {
    const w = mount(ModeToggle, { props: { modelValue: 'learn' } })
    const speedBtn = w.findAll('[data-testid="mode-option"]')[1]!
    await speedBtn.trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['speed'])
  })
  it('marks the active mode with aria-pressed', () => {
    const w = mount(ModeToggle, { props: { modelValue: 'speed' } })
    const btns = w.findAll('[data-testid="mode-option"]')
    expect(btns[1]!.attributes('aria-pressed')).toBe('true')
    expect(btns[0]!.attributes('aria-pressed')).toBe('false')
  })
})
