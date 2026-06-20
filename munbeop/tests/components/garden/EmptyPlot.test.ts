import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyPlot from '~/components/garden/EmptyPlot.vue'

describe('EmptyPlot', () => {
  it('renders the empty-state copy and a CTA button', () => {
    const w = mount(EmptyPlot)
    expect(w.text()).toContain('onboarding.empty.title') // key-echo stub
    expect(w.find('button').exists()).toBe(true)
  })
  it('emits "start" when the CTA is clicked', async () => {
    const w = mount(EmptyPlot)
    await w.find('button').trigger('click')
    expect(w.emitted('start')).toBeTruthy()
  })
})
