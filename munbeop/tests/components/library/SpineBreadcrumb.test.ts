import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SpineBreadcrumb from '~/components/library/GrammarStudySheet/SpineBreadcrumb.vue'

describe('SpineBreadcrumb', () => {
  it('shows the level (linked to /paths) and theme for a TOPIK grammar', () => {
    const w = mount(SpineBreadcrumb, { props: { ko: '은/는' } })
    const link = w.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/paths')
    // i18n stub echoes the key; the level uses garden.level.
    expect(w.text()).toContain('garden.level')
    expect(w.find('.crumb__theme').text().length).toBeGreaterThan(0)
  })

  it('renders nothing for a grammar that is not in the spine', () => {
    const w = mount(SpineBreadcrumb, { props: { ko: '커스텀-없는-문법' } })
    expect(w.find('nav').exists()).toBe(false)
  })
})
