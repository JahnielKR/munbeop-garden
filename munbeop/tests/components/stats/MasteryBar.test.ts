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

  it('segment widths never exceed 100% (no clip from independent rounding)', () => {
    // seedling/plant/tree = 3/3/2 of 8 → independent Math.round is 38+38+25=101,
    // which clips under overflow:hidden. Cumulative rounding keeps the sum ≤ 100.
    const w = mount(MasteryBar, {
      props: { label: 'T', seedling: 3, plant: 3, tree: 2, total: 8, pct: 100 },
    })
    const widths = w.findAll('[data-test="bar-seg"]').map((s) => {
      const m = /width:\s*([\d.]+)%/.exec(s.attributes('style') ?? '')
      return m ? Number(m[1]) : 0
    })
    const sum = widths.reduce((a, b) => a + b, 0)
    expect(sum).toBeLessThanOrEqual(100)
    expect(widths.every((x) => x >= 0)).toBe(true)
  })

  it('leaves an unseen remainder empty (segments sum to the covered pct)', () => {
    // 1 seedling of 4 total → only 25% covered; the bar should not fill the rest.
    const w = mount(MasteryBar, {
      props: { label: 'T', seedling: 1, plant: 0, tree: 0, total: 4, pct: 0 },
    })
    const widths = w.findAll('[data-test="bar-seg"]').map((s) => {
      const m = /width:\s*([\d.]+)%/.exec(s.attributes('style') ?? '')
      return m ? Number(m[1]) : 0
    })
    expect(widths.reduce((a, b) => a + b, 0)).toBe(25)
  })
})
