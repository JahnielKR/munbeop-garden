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

  it('ignores an older completion while the latest hydration is still loading', async () => {
    const s = useAppStatus()
    let finishFirst!: () => void
    let finishSecond!: () => void
    const first = s.track(() => new Promise<void>((resolve) => { finishFirst = resolve }))
    const second = s.track(() => new Promise<void>((resolve) => { finishSecond = resolve }))

    finishFirst()
    await first
    expect(s.status).toBe('loading')

    finishSecond()
    await second
    expect(s.status).toBe('ready')
  })

  it('ignores an older failure after a newer hydration succeeds', async () => {
    const s = useAppStatus()
    let failFirst!: (error: Error) => void
    const first = s.track(() => new Promise<void>((_resolve, reject) => { failFirst = reject }))
    await s.track(async () => {})

    failFirst(new Error('stale failure'))
    await first
    expect(s.status).toBe('ready')
  })
})
