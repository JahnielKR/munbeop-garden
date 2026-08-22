import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Icon from '~/components/ui/Icon.vue'

const utilityIcons = ['check', 'close', 'speaker', 'puzzle'] as const

describe('Icon utility glyphs', () => {
  it.each(utilityIcons)('renders %s as a crisp SVG without system text', (name) => {
    const wrapper = mount(Icon, { props: { name, size: 16 } })

    expect(wrapper.get('svg').attributes('shape-rendering')).toBe('crispEdges')
    expect(wrapper.findAll('path').length).toBeGreaterThan(0)
    expect(wrapper.text()).toBe('')
  })

  it('uses the optional label as the accessible name', () => {
    const wrapper = mount(Icon, { props: { name: 'speaker', label: 'Play audio' } })

    expect(wrapper.get('svg').attributes('aria-label')).toBe('Play audio')
    expect(wrapper.get('svg').attributes('aria-hidden')).toBeUndefined()
  })
})
