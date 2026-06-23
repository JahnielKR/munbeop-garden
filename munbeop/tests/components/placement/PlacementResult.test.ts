import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlacementResult from '~/components/placement/PlacementResult.vue'

// No `props` on the stub so `to` falls through to the <a> as a DOM attribute.
const stubs = { NuxtLink: { template: '<a><slot /></a>' } }
const mocks = { $t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k) }

describe('PlacementResult', () => {
  it('shows the cleared level and a CTA to the frontier deck', () => {
    const w = mount(PlacementResult, {
      props: { outcome: { clearedLevel: 3, startingLevel: 4, startingDeckId: 'topik-4' } },
      global: { stubs, mocks },
    })
    expect(w.text()).toContain('placement.result.your_level:{"level":3}')
    expect(w.text()).toContain('placement.result.cta:{"level":4}')
    expect(w.get('[data-testid="placement-cta"]').attributes('to')).toBe('/practice/ruleta')
  })

  it('shows the "just starting" copy when nothing was cleared', () => {
    const w = mount(PlacementResult, {
      props: { outcome: { clearedLevel: 0, startingLevel: 1, startingDeckId: 'topik-1' } },
      global: { stubs, mocks },
    })
    expect(w.text()).toContain('placement.result.just_starting')
  })

  it('emits retake', async () => {
    const w = mount(PlacementResult, {
      props: { outcome: { clearedLevel: 6, startingLevel: 6, startingDeckId: 'topik-6' } },
      global: { stubs, mocks },
    })
    await w.get('[data-testid="placement-retake"]').trigger('click')
    expect(w.emitted('retake')).toHaveLength(1)
  })
})
