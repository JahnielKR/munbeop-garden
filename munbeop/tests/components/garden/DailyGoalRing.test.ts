import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DailyGoalRing from '~/components/garden/DailyGoalRing.vue'

describe('DailyGoalRing', () => {
  it('shows the count/goal label while in progress', () => {
    const w = mount(DailyGoalRing, { props: { count: 2, goal: 3 } })
    expect(w.text()).toContain('garden.goal.label') // key-echo stub
  })
  it('shows the done state once the goal is reached', () => {
    const w = mount(DailyGoalRing, { props: { count: 3, goal: 3 } })
    expect(w.text()).toContain('garden.goal.done')
  })
})
