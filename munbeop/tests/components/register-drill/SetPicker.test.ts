// tests/components/register-drill/SetPicker.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModeTabs from '~/components/register-drill/ModeTabs.vue'
import SetPicker from '~/components/register-drill/SetPicker.vue'

const mocks = { $t: (k: string) => k }

describe('ModeTabs', () => {
  it('emits select with the chosen mode', async () => {
    const w = mount(ModeTabs, { props: { mode: 'level' }, global: { mocks } })
    await w.find('[data-testid="register-mode-honor"]').trigger('click')
    expect(w.emitted('select')?.[0]?.[0]).toBe('honor')
  })
})

describe('SetPicker', () => {
  it('renders the level mode sets and emits select', async () => {
    const w = mount(SetPicker, { props: { mode: 'level', selected: 'mixed' }, global: { mocks } })
    expect(w.findAll('[data-testid^="register-set-"]')).toHaveLength(4) // mixed + 3
    await w.find('[data-testid="register-set-formal"]').trigger('click')
    expect(w.emitted('select')?.[0]?.[0]).toBe('formal')
  })
  it('renders the honor mode sets', () => {
    const w = mount(SetPicker, { props: { mode: 'honor', selected: 'mixed' }, global: { mocks } })
    expect(w.findAll('[data-testid^="register-set-"]')).toHaveLength(5) // mixed + 4
  })
})
