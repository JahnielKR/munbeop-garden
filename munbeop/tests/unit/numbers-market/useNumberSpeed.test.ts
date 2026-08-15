import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNumberSpeed } from '~/composables/useNumberSpeed'
import { useSettingsStore } from '~/stores/settings'
import { useAuthStore } from '~/stores/auth'

vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))
// Best score now persists through the account-synced settings blob; mock the
// adapter so the persist is a no-op.
const mockWrite = vi.fn(async () => {})
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn(async () => null), write: mockWrite, remove: vi.fn(), clear: vi.fn() }),
}))

beforeEach(() => {
  setActivePinia(createPinia())
  mockWrite.mockReset()
  mockWrite.mockResolvedValue(undefined)
  if (typeof localStorage !== 'undefined') localStorage.clear()
})

describe('useNumberSpeed', () => {
  it('starts a deck with 4 choices, full timer, zero score', () => {
    const s = useNumberSpeed()
    s.start('time')
    expect(s.phase.value).toBe('playing')
    expect(s.timeLeft.value).toBe(60)
    expect(s.score.value).toBe(0)
    expect(s.choices.value).toHaveLength(4)
    expect(s.choices.value).toContain(s.item.value.answer)
  })

  it('a correct answer scores + grows combo; a wrong answer breaks combo', () => {
    const s = useNumberSpeed()
    s.start('time')
    s.answer(s.item.value.answer)
    expect(s.score.value).toBe(1)
    expect(s.combo.value).toBe(1)
    const wrong = s.choices.value.find((c) => c !== s.item.value.answer)!
    s.answer(wrong)
    expect(s.combo.value).toBe(0)
    expect(s.score.value).toBe(1)
    expect(s.bestStreak.value).toBe(1)
  })

  it('tick counts down and finishes at zero, persisting a best score', async () => {
    const s = useNumberSpeed()
    s.start('mixed')
    s.answer(s.item.value.answer) // score 1
    for (let i = 0; i < 60; i++) s.tick()
    await s.finish()
    expect(s.phase.value).toBe('done')
    expect(s.timeLeft.value).toBe(0)
    expect(useSettingsStore().numberSpeedBest).toEqual({ mixed: 1 })
  })

  it('keeps the higher best score across runs', async () => {
    const s = useNumberSpeed()
    s.start('mixed'); s.answer(s.item.value.answer); s.answer(s.item.value.answer); await s.finish() // best 2
    s.start('mixed'); s.answer(s.item.value.answer); await s.finish() // run scored 1, best stays 2
    expect(s.bestScore.value).toBe(2)
  })

  it('reports a record only when the score strictly beats the previous best', async () => {
    const s = useNumberSpeed()
    s.start('time'); s.answer(s.item.value.answer); await s.finish()
    expect(s.newRecord.value).toBe(true)

    s.start('time'); s.answer(s.item.value.answer); await s.finish()
    expect(s.score.value).toBe(1)
    expect(s.bestScore.value).toBe(1)
    expect(s.newRecord.value).toBe(false)
  })

  it('a domain-specific Speed run can clear that domain mastery', async () => {
    const s = useNumberSpeed()
    s.start('time')
    for (let i = 0; i < 7; i++) s.answer(s.item.value.answer)
    for (let i = 0; i < 3; i++) s.answer('definitely-wrong')
    await s.finish()
    expect(useSettingsStore().labCleared.numberMarket).toContain('time')
  })

  it('mixed Speed does not assign one run to every mastery domain', async () => {
    const s = useNumberSpeed()
    s.start('mixed')
    for (let i = 0; i < 8; i++) s.answer(s.item.value.answer)
    await s.finish()
    expect(useSettingsStore().labCleared.numberMarket).toEqual([])
  })

  it('answering or ticking after done is a no-op', () => {
    const s = useNumberSpeed()
    s.start('time'); s.finish()
    const before = s.score.value
    s.answer(s.item.value.answer)
    s.tick()
    expect(s.score.value).toBe(before)
    expect(s.timeLeft.value).toBe(60)
  })

  it('does not award mastery from a single correct Speed answer', async () => {
    const s = useNumberSpeed()
    s.start('time')
    s.answer(s.item.value.answer)
    await s.finish()
    expect(useSettingsStore().labCleared.numberMarket).not.toContain('time')
  })

  it('serializes the mastery snapshot before the speed-best snapshot', async () => {
    const snapshots: Array<Record<string, unknown>> = []
    let releaseFirst!: () => void
    const firstGate = new Promise<void>((resolve) => { releaseFirst = resolve })
    mockWrite.mockImplementation(async (_key: unknown, value: unknown) => {
      snapshots.push(structuredClone(value as Record<string, unknown>))
      if (snapshots.length === 1) await firstGate
    })
    const s = useNumberSpeed()
    s.start('time')
    for (let i = 0; i < 8; i++) s.answer(s.item.value.answer)

    const finished = s.finish()
    await vi.waitFor(() => expect(mockWrite).toHaveBeenCalledTimes(1))
    expect(s.saveStatus.value).toBe('saving')
    expect((snapshots[0]!.labCleared as { numberMarket: string[] }).numberMarket).toContain('time')
    expect((snapshots[0]!.numberSpeedBest as Record<string, number>).time).toBeUndefined()

    releaseFirst()
    await expect(finished).resolves.toBe(true)
    expect(mockWrite).toHaveBeenCalledTimes(2)
    expect((snapshots[1]!.labCleared as { numberMarket: string[] }).numberMarket).toContain('time')
    expect((snapshots[1]!.numberSpeedBest as Record<string, number>).time).toBe(8)
  })

  it('retries only the record stage when mastery saved but the best-score write failed', async () => {
    mockWrite
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('best response lost'))
      .mockResolvedValueOnce(undefined)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const s = useNumberSpeed()
    s.start('time')
    for (let i = 0; i < 8; i++) s.answer(s.item.value.answer)

    await expect(s.finish()).resolves.toBe(false)
    expect(s.saveStatus.value).toBe('error')
    expect(s.master.doneCount.value).toBe(1)
    expect(useSettingsStore().numberSpeedBest.time).toBeUndefined()
    expect(s.newRecord.value).toBe(false)

    await expect(s.retrySave()).resolves.toBe(true)
    expect(mockWrite).toHaveBeenCalledTimes(3)
    expect(useSettingsStore().numberSpeedBest.time).toBe(8)
    expect(s.newRecord.value).toBe(true)
    errorSpy.mockRestore()
  })

  it('answered increments per answer and resets on start (drives the SR announcer)', () => {
    const s = useNumberSpeed()
    s.start('mixed')
    expect(s.answered.value).toBe(0)
    s.answer(s.item.value.answer)
    s.answer('definitely-wrong')
    expect(s.answered.value).toBe(2)
    s.start('mixed')
    expect(s.answered.value).toBe(0)
  })

  it('does not save account A speed results into account B after a switch', async () => {
    const auth = useAuthStore()
    auth.user = { id: 'account-a' } as never
    const settings = useSettingsStore()
    await settings.hydrate()
    let releaseMastery!: () => void
    mockWrite.mockImplementationOnce(
      () => new Promise<void>((resolve) => { releaseMastery = resolve }),
    )
    const s = useNumberSpeed()
    s.start('time')
    for (let i = 0; i < 8; i++) s.answer(s.item.value.answer)

    const finished = s.finish()
    await vi.waitFor(() => expect(mockWrite).toHaveBeenCalledTimes(1))
    auth.user = { id: 'account-b' } as never
    releaseMastery()
    await expect(finished).resolves.toBe(false)

    expect(mockWrite).toHaveBeenCalledTimes(1)
    expect(settings.numberSpeedBest.time).toBeUndefined()
    expect(s.saveStatus.value).toBe('idle')
  })
})
