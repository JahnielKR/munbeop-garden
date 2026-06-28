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

  it('hides the tooltip when the cell is left', async () => {
    const w = mount(ActivityHeatmap, { props: { counts, now } })
    const cell = w.findAll('[data-test="heat-cell"]').find((c) => c.attributes('data-day') === '2026-06-26')!
    await cell.trigger('mouseenter')
    expect(w.find('[data-test="heat-tip"]').exists()).toBe(true)
    await cell.trigger('mouseleave')
    expect(w.find('[data-test="heat-tip"]').exists()).toBe(false)
  })

  it('renders without crash when counts is empty', () => {
    const w = mount(ActivityHeatmap, { props: { counts: {}, now } })
    expect(w.find('[data-test="heat-streak-current"]').text()).toContain('0')
    expect(w.find('[data-test="heat-streak-longest"]').text()).toContain('0')
  })

  it('exposes an accessible group summary on the grid', () => {
    const w = mount(ActivityHeatmap, { props: { counts, now } })
    const gridEl = w.find('.heat-grid')
    expect(gridEl.attributes('role')).toBe('group')
    expect(gridEl.attributes('aria-label')).toContain('stats.activity.grid_summary')
  })

  it('gives each inspectable cell an accessible name (date + count)', () => {
    const w = mount(ActivityHeatmap, { props: { counts, now } })
    const cell = w.findAll('[data-test="heat-cell"]').find((c) => c.attributes('data-day') === '2026-06-26')!
    expect(cell.attributes('role')).toBe('img')
    expect(cell.attributes('aria-label')).toContain('2026')
    expect(cell.attributes('tabindex')).toBe('0')
  })

  it('hides padding / future cells from assistive tech', () => {
    const w = mount(ActivityHeatmap, { props: { counts, now } })
    // A day after "today" (2026-06-26) is a future cell: masked, not focusable.
    const future = w.findAll('[data-test="heat-cell"]').find((c) => c.attributes('data-day') === '2026-06-30')!
    expect(future.attributes('aria-hidden')).toBe('true')
    expect(future.attributes('tabindex')).toBe('-1')
    expect(future.attributes('role')).toBeUndefined()
  })
})
