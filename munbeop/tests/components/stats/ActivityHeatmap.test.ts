import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ActivityHeatmap from '~/components/stats/ActivityHeatmap.vue'

const now = new Date(2026, 5, 26, 10).getTime()
const counts = { '2026-06-26': 5, '2026-06-25': 1, '2026-06-24': 2 }

describe('ActivityHeatmap', () => {
  it('renders cells and a footer with current + longest streak', () => {
    const w = mount(ActivityHeatmap, { props: { counts, now } })
    expect(w.findAll('[data-test="heat-cell"]').length).toBeGreaterThan(50)
    const txt = w.text()
    // current streak 3 (24-25-26), longest 3
    expect(w.find('[data-test="heat-streak-current"]').text()).toContain('3')
    expect(w.find('[data-test="heat-streak-longest"]').text()).toContain('3')
    expect(txt).toContain('stats.activity') // i18n key-echo present
  })

  it('moves to the previous year when the prev arrow is clicked', async () => {
    const w = mount(ActivityHeatmap, { props: { counts, now } })
    expect(w.find('[data-test="heat-year"]').text()).toContain('2026')
    await w.find('[data-test="heat-year-prev"]').trigger('click')
    expect(w.find('[data-test="heat-year"]').text()).toContain('2025')
  })

  it('shows a tooltip with the date and count on cell hover', async () => {
    const w = mount(ActivityHeatmap, { props: { counts, now } })
    const cell = w.findAll('[data-test="heat-cell"]').find((c) => c.attributes('data-day') === '2026-06-26')!
    await cell.trigger('mouseenter')
    expect(w.find('[data-test="heat-tip"]').text()).toContain('2026-06-26')
  })
})
