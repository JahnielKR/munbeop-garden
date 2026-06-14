import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import GameExitButton from '~/components/games/GameExitButton.vue'

const pushSpy = vi.fn(async () => {})
vi.stubGlobal('useRouter', () => ({ push: pushSpy }))

async function flush() {
  await nextTick()
  await nextTick()
}

function mountButton(props: Record<string, unknown> = {}) {
  return mount(GameExitButton, {
    attachTo: document.body,
    props,
    global: { stubs: { Teleport: false } },
  })
}

describe('GameExitButton', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    pushSpy.mockClear()
  })
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('renders the back button with the games.exit aria-label and nav.practice label', () => {
    const wrapper = mountButton()
    const btn = wrapper.get('.game-exit')
    expect(btn.attributes('aria-label')).toBe('games.exit')
    expect(btn.text()).toContain('nav.practice')
  })

  it('navigates straight to /practice when confirm is false', async () => {
    const wrapper = mountButton()
    await wrapper.get('.game-exit').trigger('click')
    await flush()
    expect(pushSpy).toHaveBeenCalledWith('/practice')
    expect(document.body.querySelector('.modal-overlay')).toBeNull()
  })

  it('opens the confirm modal and does NOT navigate yet when confirm is true', async () => {
    const wrapper = mountButton({ confirm: true })
    await wrapper.get('.game-exit').trigger('click')
    await flush()
    expect(document.body.querySelector('.modal-overlay')).not.toBeNull()
    expect(pushSpy).not.toHaveBeenCalled()
  })

  it('navigates when the danger "leave" button is clicked', async () => {
    const wrapper = mountButton({ confirm: true })
    await wrapper.get('.game-exit').trigger('click')
    await flush()
    const leaveBtn = document.body.querySelector('.button[data-variant="danger"]') as HTMLElement
    leaveBtn.click()
    await flush()
    expect(pushSpy).toHaveBeenCalledWith('/practice')
  })

  it('cancels without navigating when the secondary button is clicked', async () => {
    const wrapper = mountButton({ confirm: true })
    await wrapper.get('.game-exit').trigger('click')
    await flush()
    const cancelBtn = document.body.querySelector('.button[data-variant="secondary"]') as HTMLElement
    cancelBtn.click()
    await flush()
    expect(pushSpy).not.toHaveBeenCalled()
    expect(document.body.querySelector('.modal-overlay')).toBeNull()
  })

  it('routes to a custom destination via the to prop', async () => {
    const wrapper = mountButton({ to: '/escape-room' })
    await wrapper.get('.game-exit').trigger('click')
    await flush()
    expect(pushSpy).toHaveBeenCalledWith('/escape-room')
  })
})
