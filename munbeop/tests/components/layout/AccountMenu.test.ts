import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import AccountMenu from '~/components/layout/AccountMenu.vue'
import { useAuthStore } from '~/stores/auth'

const signOutAndExit = vi.fn(async () => ({ error: null }))
vi.stubGlobal('useAuth', () => ({ signOutAndExit }))
vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

function mountMenu() {
  return mount(AccountMenu, {
    attachTo: document.body,
    global: { stubs: { LocaleSwitcher: true } },
  })
}

describe('AccountMenu', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    signOutAndExit.mockClear()
    document.body.innerHTML = ''
    useAuthStore().user = { email: 'sol@example.com' } as never
  })

  it('shows the email initial on the avatar', () => {
    const wrapper = mountMenu()
    expect(wrapper.get('.acct__avatar').text()).toBe('S')
  })

  it('opens the popover with email, a settings link, and sign out', async () => {
    const wrapper = mountMenu()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    await wrapper.get('.acct__avatar').trigger('click')
    await nextTick()
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('sol@example.com')
    expect(wrapper.find('a[href="/settings"]').exists()).toBe(true)
    expect(wrapper.find('.acct__signout').exists()).toBe(true)
  })

  it('signs out when sign-out is clicked', async () => {
    const wrapper = mountMenu()
    await wrapper.get('.acct__avatar').trigger('click')
    await nextTick()
    await wrapper.get('.acct__signout').trigger('click')
    expect(signOutAndExit).toHaveBeenCalledTimes(1)
  })

  it('closes when clicking outside', async () => {
    const wrapper = mountMenu()
    await wrapper.get('.acct__avatar').trigger('click')
    await nextTick()
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })
})
