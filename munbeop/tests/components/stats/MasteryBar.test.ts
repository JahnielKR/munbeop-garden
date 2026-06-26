import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MasteryBar from '~/components/stats/MasteryBar.vue'

describe('MasteryBar', () => {
  it('renders three segments sized by tier and shows the learned pct', () => {
    const w = mount(MasteryBar, {
      props: { label: 'TOPIK 1', seedling: 2, plant: 1, tree: 1, total: 4, pct: 50 },
    })
    expect(w.text()).toContain('TOPIK 1')
    expect(w.text()).toContain('50%')
    expect(w.findAll('[data-test="bar-seg"]').length).toBe(3)
  })
})
