import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, enableAutoUnmount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import AccountMenu from '~/components/layout/AccountMenu.vue'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

// The teleported popover wires window-level observers (useElementBounding /
// useWindowSize). Unmount every wrapper after its test so those listeners
// don't survive to re-patch a torn-down tree in the next one.
enableAutoUnmount(afterEach)

const signOutAndExit = vi.fn(async () => ({ error: null }))
vi.stubGlobal('useAuth', () => ({ signOutAndExit }))
vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

function mountMenu() {
  return mount(AccountMenu, {
    attachTo: document.body,
    global: { stubs: { LocaleSwitcher: true } },
  })
}

async function openMenu(wrapper: VueWrapper) {
  await wrapper.get('.acct__avatar').trigger('click')
  await nextTick()
}

describe('AccountMenu', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    signOutAndExit.mockClear()
    signOutAndExit.mockResolvedValue({ error: null })
    useToast().dismiss()
    document.body.innerHTML = ''
    useAuthStore().user = { email: 'sol@example.com' } as never
  })

  it('shows the email initial on the framed portrait', () => {
    const wrapper = mountMenu()
    // The initial lives in .acct__inner inside the .acct__avatar trigger, so
    // the button's text content is still exactly the initial.
    expect(wrapper.get('.acct__avatar').text()).toBe('S')
  })

  it('shows the trophy strip and identity when expanded', () => {
    const wrapper = mountMenu()
    expect(wrapper.find('.premios').exists()).toBe(true)
    expect(wrapper.find('.acct__identity').exists()).toBe(true)
  })

  it('collapses to just the framed portrait box (no strip, no identity, no pip)', () => {
    const wrapper = mount(AccountMenu, {
      attachTo: document.body,
      props: { collapsed: true },
      global: { stubs: { LocaleSwitcher: true } },
    })
    expect(wrapper.find('.acct__avatar').exists()).toBe(true)
    // collapsed = ONLY the box: no trophy strip, no identity line, and no count
    // pip (the pip's corner offset peeked past the 64px rail edge — half-clipped).
    expect(wrapper.find('.acct__pip').exists()).toBe(false)
    expect(wrapper.find('.premios').exists()).toBe(false)
    expect(wrapper.find('.acct__identity').exists()).toBe(false)
  })

  it('opens a popover with the email, a trophies link, a settings link, and sign out', async () => {
    const wrapper = mountMenu()
    expect(document.querySelector('[role="menu"]')).toBeNull()
    await openMenu(wrapper)
    expect(document.querySelector('[role="menu"]')).not.toBeNull()
    expect(document.body.textContent).toContain('sol@example.com')
    expect(document.querySelector('a[href="/trophies"]')).not.toBeNull()
    expect(document.querySelector('a[href="/settings"]')).not.toBeNull()
    expect(document.querySelector('.acct__signout')).not.toBeNull()
  })

  it('teleports the popover out of the rail and pins it fixed (never clipped)', async () => {
    const wrapper = mountMenu()
    await openMenu(wrapper)
    // Teleported to <body>, so it is NOT inside the component tree (the rail
    // with overflow:hidden) — that is the whole fix for the clipping bug.
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    const menu = document.querySelector('[role="menu"]') as HTMLElement
    expect(menu.style.position).toBe('fixed')
    expect(menu.style.left).toMatch(/px$/)
    // bottom-anchored to the avatar (top is auto) so it never depends on the
    // menu's own height — no center→corner jump on first open.
    expect(menu.style.bottom).toMatch(/px$/)
    expect(menu.style.top).toBe('auto')
  })

  it('signs out when sign-out is clicked', async () => {
    const wrapper = mountMenu()
    await openMenu(wrapper)
    ;(document.querySelector('.acct__signout') as HTMLElement).click()
    expect(signOutAndExit).toHaveBeenCalledTimes(1)
  })

  it('shows an error toast when sign-out fails', async () => {
    signOutAndExit.mockResolvedValueOnce({ error: { message: 'network' } })
    const wrapper = mountMenu()
    await openMenu(wrapper)
    ;(document.querySelector('.acct__signout') as HTMLElement).click()
    await flushPromises()
    expect(useToast().toasts.value.some((t) => t.variant === 'error')).toBe(true)
  })

  it('stays open on a click inside the menu, closes on a click outside', async () => {
    const wrapper = mountMenu()
    const avatar = wrapper.get('.acct__avatar')
    await openMenu(wrapper)
    expect(avatar.attributes('aria-expanded')).toBe('true')

    // Click inside the teleported menu → dual-ref guard keeps it open.
    const inside = document.querySelector('.acct__email') as HTMLElement
    inside.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(avatar.attributes('aria-expanded')).toBe('true')

    // Click on document.body (outside both refs) → closes.
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(avatar.attributes('aria-expanded')).toBe('false')
  })
})
