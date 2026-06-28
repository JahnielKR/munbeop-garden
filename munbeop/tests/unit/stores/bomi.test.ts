import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBomiStore } from '~/stores/bomi'
import { INACTIVITY_THRESHOLDS } from '~/lib/bomi/poses'

// The store registers a 250 ms setInterval at creation and arms setTimeout
// auto-returns, so fake timers must be installed BEFORE the store is created.
// Cleanup is bound to the store's effect scope via onScopeDispose (not a
// component's onUnmounted), so creating the store here without a component emits
// no warning.
describe('useBomiStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts in the idle pose with no recent activity', () => {
    const bomi = useBomiStore()
    expect(bomi.activePose).toBe('idle')
    expect(bomi.explicitPose).toBeNull()
  })

  it('react() sets an explicit pose and auto-returns after autoReturnMs', () => {
    const bomi = useBomiStore()
    bomi.react('happy') // POSES.happy.autoReturnMs === 600
    expect(bomi.activePose).toBe('happy')

    vi.advanceTimersByTime(599)
    expect(bomi.activePose).toBe('happy')

    vi.advanceTimersByTime(1)
    expect(bomi.explicitPose).toBeNull()
    expect(bomi.activePose).toBe('idle')
  })

  it('a new react() cancels the previous pose auto-return timer', () => {
    const bomi = useBomiStore()
    bomi.react('happy') // autoReturn 600
    vi.advanceTimersByTime(300)
    bomi.react('sad') // autoReturn 500 — happy's 600ms timer must be cancelled
    expect(bomi.activePose).toBe('sad')

    // happy's original deadline (t=600) passes: still 'sad', not reverted.
    vi.advanceTimersByTime(300)
    expect(bomi.activePose).toBe('sad')

    // sad's own deadline (t=300+500) passes: now reverts.
    vi.advanceTimersByTime(200)
    expect(bomi.explicitPose).toBeNull()
    expect(bomi.activePose).toBe('idle')
  })

  it('think() holds the thinking pose with no auto-return', () => {
    const bomi = useBomiStore()
    bomi.think()
    expect(bomi.activePose).toBe('thinking')
    // thinking has no autoReturnMs — survives well past any threshold.
    vi.advanceTimersByTime(INACTIVITY_THRESHOLDS.sleepMs + 5_000)
    expect(bomi.activePose).toBe('thinking')
  })

  it('sleep() holds the sleep pose until cleared', () => {
    const bomi = useBomiStore()
    bomi.sleep()
    expect(bomi.activePose).toBe('sleep')
    vi.advanceTimersByTime(10_000)
    expect(bomi.activePose).toBe('sleep')

    bomi.clearExplicit()
    expect(bomi.explicitPose).toBeNull()
    expect(bomi.activePose).toBe('idle')
  })

  it('clearExplicit() drops the explicit pose and resets the idle timeline', () => {
    const bomi = useBomiStore()
    bomi.react('cheer')
    expect(bomi.activePose).toBe('cheer')
    bomi.clearExplicit()
    expect(bomi.explicitPose).toBeNull()
    expect(bomi.activePose).toBe('idle')
  })

  it('walks the inactivity timeline idle -> play-hat -> sleep', () => {
    const bomi = useBomiStore()
    expect(bomi.activePose).toBe('idle')

    // Just before the play-hat threshold.
    vi.advanceTimersByTime(INACTIVITY_THRESHOLDS.playHatMs - 250)
    expect(bomi.activePose).toBe('idle')

    // Cross into play-hat.
    vi.advanceTimersByTime(250)
    expect(bomi.activePose).toBe('play-hat')

    // Cross into sleep.
    vi.advanceTimersByTime(INACTIVITY_THRESHOLDS.sleepMs - INACTIVITY_THRESHOLDS.playHatMs)
    expect(bomi.activePose).toBe('sleep')
  })

  it('resetActivity() returns an idle-timeline pose back to idle', () => {
    const bomi = useBomiStore()
    vi.advanceTimersByTime(INACTIVITY_THRESHOLDS.playHatMs)
    expect(bomi.activePose).toBe('play-hat')

    bomi.resetActivity()
    expect(bomi.activePose).toBe('idle')
  })

  it('an explicit pose wins over the inactivity timeline', () => {
    const bomi = useBomiStore()
    bomi.sleep() // explicit sleep
    // Advancing past play-hat must not flip it to the timeline pose.
    vi.advanceTimersByTime(INACTIVITY_THRESHOLDS.playHatMs + 1_000)
    expect(bomi.activePose).toBe('sleep')
  })
})
