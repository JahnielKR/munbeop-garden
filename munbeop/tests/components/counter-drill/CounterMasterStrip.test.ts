import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CounterMasterStrip from '~/components/counter-drill/CounterMasterStrip.vue'
import CounterMasterCelebration from '~/components/counter-drill/CounterMasterCelebration.vue'

const perSet = [
  { id: 'people', ko: '사람', done: true },
  { id: 'things', ko: '사물', done: false },
]

describe('Counter mastery UI', () => {
  afterEach(() => document.body.replaceChildren())

  it('renders visible progress and one pip per counter set', () => {
    const wrapper = mount(CounterMasterStrip, {
      props: { perSet, doneCount: 1, total: 2, earned: false },
    })
    expect(wrapper.findAll('[data-testid="counter-master-pip"]')).toHaveLength(2)
    expect(wrapper.findAll('.master__pip--done')).toHaveLength(1)
    expect(wrapper.text()).toContain('counters.master.progress 1 2')
  })

  it('shows the earned styling when every set is cleared', () => {
    const wrapper = mount(CounterMasterStrip, {
      props: {
        perSet: perSet.map((set) => ({ ...set, done: true })),
        doneCount: 2,
        total: 2,
        earned: true,
      },
    })
    expect(wrapper.get('[data-testid="counter-master"]').classes()).toContain('master--earned')
    expect(wrapper.text()).toContain('counters.master.earned')
  })

  it('focuses the celebration dismiss button and closes on Escape', async () => {
    const wrapper = mount(CounterMasterCelebration, {
      props: { total: 6 },
      attachTo: document.body,
    })
    expect(document.activeElement).toBe(wrapper.get('[data-testid="counter-cel-dismiss"]').element)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('dismiss')).toBeTruthy()
    wrapper.unmount()
  })
})
