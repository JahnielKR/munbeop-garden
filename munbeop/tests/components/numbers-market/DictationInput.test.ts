import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DictationInput from '~/components/numbers-market/DictationInput.vue'

const base = { domain: 'time' as const, phase: 'input' as const, modelValue: '' }

describe('DictationInput', () => {
  it('emits update:modelValue on input and submit on the form', async () => {
    const w = mount(DictationInput, { props: base })
    const input = w.find('[data-testid="dictation-input"]')
    await input.setValue('3:15')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['3:15'])
    await w.find('form').trigger('submit')
    expect(w.emitted('submit')).toBeTruthy()
  })
  it('emits replay when the 🔊 button is clicked', async () => {
    const w = mount(DictationInput, { props: base })
    await w.find('[data-testid="dictation-replay"]').trigger('click')
    expect(w.emitted('replay')).toBeTruthy()
  })
  it('disables input when not in input phase', () => {
    const w = mount(DictationInput, { props: { ...base, phase: 'right' } })
    expect(w.find('[data-testid="dictation-input"]').attributes('disabled')).toBeDefined()
  })
})
