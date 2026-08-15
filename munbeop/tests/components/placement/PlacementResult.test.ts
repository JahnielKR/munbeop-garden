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
    expect(w.get('[data-testid="placement-cta"]').attributes('to')).toBe('/practice/ruleta?deck=topik-4')
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

  it('shows an explicit retry and withholds the CTA when saving failed', async () => {
    const w = mount(PlacementResult, {
      props: {
        outcome: { clearedLevel: 2, startingLevel: 3, startingDeckId: 'topik-3' },
        saveError: true,
      },
      global: { stubs, mocks },
    })
    expect(w.find('[data-testid="placement-cta"]').exists()).toBe(false)
    expect(w.text()).toContain('errors.save_failed')
    const retake = w.get('[data-testid="placement-retake"]')
    expect(retake.attributes('disabled')).toBeDefined()
    await retake.trigger('click')
    expect(w.emitted('retake')).toBeUndefined()
    await w.get('[data-testid="placement-retry-save"]').trigger('click')
    expect(w.emitted('retrySave')).toHaveLength(1)
  })

  it('disables retake while the recommendation is still saving', async () => {
    const w = mount(PlacementResult, {
      props: {
        outcome: { clearedLevel: 2, startingLevel: 3, startingDeckId: 'topik-3' },
        saving: true,
      },
      global: { stubs, mocks },
    })
    const retake = w.get('[data-testid="placement-retake"]')
    expect(retake.attributes('disabled')).toBeDefined()
    await retake.trigger('click')
    expect(w.emitted('retake')).toBeUndefined()
  })
})
