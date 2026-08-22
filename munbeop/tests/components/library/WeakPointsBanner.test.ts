import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WeakPointsBanner from '~/components/library/WeakPointsBanner.vue'

const mountBanner = (count = 3) => mount(WeakPointsBanner, { props: { count } })

describe('WeakPointsBanner', () => {
  it('shows the localized summary with the count', () => {
    // i18n stub echoes "<key> <json-params>"; assert the count is interpolated.
    const banner = mountBanner(3)
    expect(banner.text()).toContain('library.weak.summary')
    expect(banner.get('[role="region"]').classes()).toContain('card--red')
  })

  it('emits view when "show them" is clicked', async () => {
    const w = mountBanner()
    await w.get('[data-testid="weak-view"]').trigger('click')
    expect(w.emitted('view')).toHaveLength(1)
  })

  it('emits rescue when "rescue the hardest" is clicked', async () => {
    const w = mountBanner()
    await w.get('[data-testid="weak-rescue"]').trigger('click')
    expect(w.emitted('rescue')).toHaveLength(1)
  })
})
