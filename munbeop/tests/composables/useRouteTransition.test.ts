import { describe, it, expect, beforeEach } from 'vitest'
import { useRouteTransition, _resetRouteTransitionForTest } from '~/composables/useRouteTransition'

describe('useRouteTransition', () => {
  beforeEach(() => { _resetRouteTransitionForTest() })

  it('starts with direction = null', () => {
    const { direction } = useRouteTransition()
    expect(direction.value).toBe(null)
  })

  it('setEnter() flips direction to "enter"', () => {
    const { direction, setEnter } = useRouteTransition()
    setEnter()
    expect(direction.value).toBe('enter')
  })

  it('setExit() flips direction to "exit"', () => {
    const { direction, setExit } = useRouteTransition()
    setExit()
    expect(direction.value).toBe('exit')
  })

  it('clear() resets direction to null', () => {
    const { direction, setEnter, clear } = useRouteTransition()
    setEnter()
    expect(direction.value).toBe('enter')
    clear()
    expect(direction.value).toBe(null)
  })

  it('all callers share the same singleton state', () => {
    const a = useRouteTransition()
    const b = useRouteTransition()
    a.setExit()
    expect(b.direction.value).toBe('exit')
  })
})
