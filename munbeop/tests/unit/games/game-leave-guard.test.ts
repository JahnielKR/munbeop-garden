import { describe, it, expect, vi } from 'vitest'
import { createLeaveGuard } from '~/composables/useGameLeaveGuard'

function setup(dirty: boolean) {
  const push = vi.fn(async () => {})
  let isDirty = dirty
  const guard = createLeaveGuard({ push }, () => isDirty)
  return { push, guard, setDirty: (v: boolean) => (isDirty = v) }
}

describe('createLeaveGuard', () => {
  it('lets navigation pass when not dirty', () => {
    const { guard } = setup(false)
    expect(guard.onLeave({ fullPath: '/garden' })).toBe(true)
    expect(guard.confirmOpen.value).toBe(false)
  })

  it('blocks navigation and opens the modal when dirty', () => {
    const { guard } = setup(true)
    expect(guard.onLeave({ fullPath: '/garden' })).toBe(false)
    expect(guard.confirmOpen.value).toBe(true)
  })

  it('confirm() re-issues the stashed destination and closes', () => {
    const { guard, push } = setup(true)
    guard.onLeave({ fullPath: '/library' })
    guard.confirm()
    expect(guard.confirmOpen.value).toBe(false)
    expect(push).toHaveBeenCalledWith('/library')
  })

  it('allows the re-issued navigation through right after confirm()', () => {
    const { guard } = setup(true)
    guard.onLeave({ fullPath: '/library' })
    guard.confirm()
    expect(guard.onLeave({ fullPath: '/library' })).toBe(true)
  })

  it('cancel() closes and does not navigate', () => {
    const { guard, push } = setup(true)
    guard.onLeave({ fullPath: '/library' })
    guard.cancel()
    expect(guard.confirmOpen.value).toBe(false)
    expect(push).not.toHaveBeenCalled()
  })

  it('guardedPush navigates directly when clean', () => {
    const { guard, push } = setup(false)
    guard.guardedPush('/practice')
    expect(push).toHaveBeenCalledWith('/practice')
    expect(guard.confirmOpen.value).toBe(false)
  })

  it('guardedPush opens the modal when dirty', () => {
    const { guard, push } = setup(true)
    guard.guardedPush('/practice')
    expect(push).not.toHaveBeenCalled()
    expect(guard.confirmOpen.value).toBe(true)
  })
})
