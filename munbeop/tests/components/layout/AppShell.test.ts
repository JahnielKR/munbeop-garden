import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppShell from '~/components/layout/AppShell.vue'

// AppShell reads the route (surface meta + route-change focus); stub it.
vi.stubGlobal('useRoute', () => ({ meta: {}, fullPath: '/' }))

const stubs = {
  AppSidebar: { template: '<div data-testid="sidebar-stub" />' },
  MobileNavbar: { template: '<nav data-testid="mobilenav-stub" />' },
  Toast: { template: '<div data-testid="toast-stub" />' },
}

describe('AppShell a11y', () => {
  it('renders a skip-to-content link that targets the focusable main region', () => {
    const w = mount(AppShell, { global: { stubs } })

    const link = w.find('a.skip-link')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('#main-content')
    // i18n key-echo stub returns the key.
    expect(link.text()).toBe('a11y.skip_to_content')

    const main = w.find('main#main-content')
    expect(main.exists()).toBe(true)
    // tabindex -1 lets the route-change watcher move the reading cursor here.
    expect(main.attributes('tabindex')).toBe('-1')
  })
})
