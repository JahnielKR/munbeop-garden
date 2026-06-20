import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import { GAME_LEAVE_GUARD } from '~/composables/useGameLeaveGuard'

const pushSpy = vi.fn(async () => {})
vi.stubGlobal('useRouter', () => ({ push: pushSpy }))

function fakeGuard() {
  return {
    confirmOpen: ref(false),
    confirm: vi.fn(),
    cancel: vi.fn(),
    guardedPush: vi.fn(),
    onLeave: vi.fn(() => true),
  }
}

describe('GameExitButton', () => {
  beforeEach(() => pushSpy.mockClear())

  it('renders the back button with the games.exit aria-label and nav.practice label', () => {
    const w = mount(GameExitButton)
    const btn = w.get('.game-exit')
    expect(btn.attributes('aria-label')).toBe('games.exit')
    expect(btn.text()).toContain('nav.practice')
  })

  it('pushes directly to /practice when no guard is provided', async () => {
    const w = mount(GameExitButton)
    await w.get('.game-exit').trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/practice')
  })

  it('routes to a custom destination via the to prop', async () => {
    const w = mount(GameExitButton, { props: { to: '/escape-room' } })
    await w.get('.game-exit').trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/escape-room')
  })

  it('routes its click through the injected guard when present', async () => {
    const guard = fakeGuard()
    const w = mount(GameExitButton, {
      global: { provide: { [GAME_LEAVE_GUARD as symbol]: guard } },
    })
    await w.get('.game-exit').trigger('click')
    expect(guard.guardedPush).toHaveBeenCalledWith('/practice')
    expect(pushSpy).not.toHaveBeenCalled()
  })
})
