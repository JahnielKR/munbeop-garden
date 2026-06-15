import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsTabs from '~/components/settings/SettingsTabs.vue'

const TABS = [
  { id: 'a', labelKey: 'k.a' },
  { id: 'b', labelKey: 'k.b' },
  { id: 'c', labelKey: 'k.c' },
]

function mountTabs(modelValue = 'a') {
  return mount(SettingsTabs, { props: { tabs: TABS, modelValue }, attachTo: document.body })
}

describe('SettingsTabs', () => {
  it('renders one tab per entry with roving tabindex + aria wiring', () => {
    const wrapper = mountTabs('a')
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(3)
    expect(tabs[0]!.attributes('aria-selected')).toBe('true')
    expect(tabs[1]!.attributes('aria-selected')).toBe('false')
    expect(tabs[0]!.attributes('tabindex')).toBe('0')
    expect(tabs[1]!.attributes('tabindex')).toBe('-1')
    expect(tabs[0]!.attributes('id')).toBe('tab-a')
    expect(tabs[0]!.attributes('aria-controls')).toBe('panel-a')
  })

  it('emits update:modelValue with the clicked tab id', async () => {
    const wrapper = mountTabs('a')
    await wrapper.findAll('[role="tab"]')[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['c']])
  })

  it('ArrowRight moves to next, ArrowLeft wraps to last', async () => {
    const right = mountTabs('a')
    await right.findAll('[role="tab"]')[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(right.emitted('update:modelValue')).toEqual([['b']])

    const left = mountTabs('a')
    await left.findAll('[role="tab"]')[0]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(left.emitted('update:modelValue')).toEqual([['c']])
  })
})
