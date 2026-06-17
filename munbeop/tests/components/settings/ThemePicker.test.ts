import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemePicker from '~/components/settings/ThemePicker.vue'

describe('ThemePicker', () => {
  it('renders a 3-way radiogroup (light / auto / dark)', () => {
    const w = mount(ThemePicker, { props: { modelValue: 'system' } })
    expect(w.find('[role="radiogroup"]').exists()).toBe(true)
    expect(w.findAll('[role="radio"]')).toHaveLength(3)
  })

  it('marks the current preference as checked', () => {
    const w = mount(ThemePicker, { props: { modelValue: 'dark' } })
    expect(w.get('[data-value="dark"]').attributes('aria-checked')).toBe('true')
    expect(w.get('[data-value="light"]').attributes('aria-checked')).toBe('false')
    expect(w.get('[data-value="system"]').attributes('aria-checked')).toBe('false')
  })

  it('emits the selected preference on click', async () => {
    const w = mount(ThemePicker, { props: { modelValue: 'light' } })
    await w.get('[data-value="dark"]').trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['dark'])
  })

  it('does not re-emit when the current preference is clicked', async () => {
    const w = mount(ThemePicker, { props: { modelValue: 'light' } })
    await w.get('[data-value="light"]').trigger('click')
    expect(w.emitted('update:modelValue')).toBeFalsy()
  })
})
