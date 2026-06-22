import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReviewReminderBanner from '~/components/garden/ReviewReminderBanner.vue'

describe('ReviewReminderBanner', () => {
  it('shows the count and links to the revisit-due session', () => {
    const w = mount(ReviewReminderBanner, { props: { count: 4 } })
    expect(w.text()).toContain('4')
    expect(w.find('a').attributes('href')).toBe('/practice/ruleta?revisit=due')
  })

  it('emits dismiss when the dismiss control is clicked', async () => {
    const w = mount(ReviewReminderBanner, { props: { count: 2 } })
    await w.find('[data-testid="reminder-dismiss"]').trigger('click')
    expect(w.emitted('dismiss')).toHaveLength(1)
  })
})
