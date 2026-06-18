import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStatus } from '~/stores/appStatus'

describe('appStatus', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('starts idle and goes ready after a successful track', async () => {
    const s = useAppStatus()
    expect(s.status).toBe('idle')
    await s.track(async () => {})
    expect(s.status).toBe('ready')
  })

  it('goes error when the tracked fn throws', async () => {
    const s = useAppStatus()
    await s.track(async () => {
      throw new Error('boom')
    })
    expect(s.status).toBe('error')
  })

  it('retry re-runs the last tracked fn and can recover to ready', async () => {
    const s = useAppStatus()
    let attempts = 0
    await s.track(async () => {
      attempts += 1
      if (attempts < 2) throw new Error('transient')
    })
    expect(s.status).toBe('error')
    await s.retry()
    expect(attempts).toBe(2)
    expect(s.status).toBe('ready')
  })

  it('retry is a no-op when nothing has been tracked', async () => {
    const s = useAppStatus()
    await s.retry()
    expect(s.status).toBe('idle')
  })
})
