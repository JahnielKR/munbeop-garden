import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ParticleMasterCelebration from '~/components/particle-lab/ParticleMasterCelebration.vue'

describe('ParticleMasterCelebration a11y', () => {
  afterEach(() => document.body.replaceChildren())

  it('focuses the dismiss button on mount', () => {
    const w = mount(ParticleMasterCelebration, { props: { total: 11 }, attachTo: document.body })
    expect(document.activeElement).toBe(w.get('[data-testid="cel-dismiss"]').element)
    w.unmount()
  })

  it('emits dismiss on Escape', async () => {
    const w = mount(ParticleMasterCelebration, { props: { total: 11 }, attachTo: document.body })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await w.vm.$nextTick()
    expect(w.emitted('dismiss')).toBeTruthy()
    w.unmount()
  })

  it('does not put aria-live on the body text', () => {
    const w = mount(ParticleMasterCelebration, { props: { total: 11 } })
    expect(w.find('.cel__body').attributes('aria-live')).toBeUndefined()
    w.unmount()
  })
})
