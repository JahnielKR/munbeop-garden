import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import { GAME_LEAVE_GUARD } from '~/composables/useGameLeaveGuard'

function fakeGuard(open = false) {
  return {
    confirmOpen: ref(open),
    confirm: vi.fn(),
    cancel: vi.fn(),
    guardedPush: vi.fn(),
    onLeave: vi.fn(() => true),
  }
}

function mountConfirm(guard: ReturnType<typeof fakeGuard>) {
  return mount(GameLeaveConfirm, {
    attachTo: document.body,
    global: {
      provide: { [GAME_LEAVE_GUARD as symbol]: guard },
      stubs: { Teleport: false },
    },
  })
}

async function flush() {
  await nextTick()
  await nextTick()
}

describe('GameLeaveConfirm', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders no modal when the guard is closed', () => {
    mountConfirm(fakeGuard(false))
    expect(document.body.querySelector('.modal-overlay')).toBeNull()
  })

  it('shows the modal when the guard is open', async () => {
    mountConfirm(fakeGuard(true))
    await flush()
    expect(document.body.querySelector('.modal-overlay')).not.toBeNull()
    expect(document.body.textContent).toContain('games.exit_confirm_body')
  })

  it('calls confirm() when the danger button is clicked', async () => {
    const guard = fakeGuard(true)
    mountConfirm(guard)
    await flush()
    ;(document.body.querySelector('.button[data-variant="danger"]') as HTMLElement).click()
    await flush()
    expect(guard.confirm).toHaveBeenCalled()
  })

  it('calls cancel() when the secondary button is clicked', async () => {
    const guard = fakeGuard(true)
    mountConfirm(guard)
    await flush()
    ;(document.body.querySelector('.button[data-variant="secondary"]') as HTMLElement).click()
    await flush()
    expect(guard.cancel).toHaveBeenCalled()
  })
})
