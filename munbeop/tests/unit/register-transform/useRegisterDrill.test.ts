// tests/unit/register-transform/useRegisterDrill.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRegisterDrill } from '~/composables/useRegisterDrill'

const add = vi.fn()
const createEntryId = vi.fn(() => 4242)
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ add, createEntryId }) }))
vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: 'en' } }) }))

beforeEach(() => {
  setActivePinia(createPinia())
  add.mockReset()
  add.mockResolvedValue(undefined)
  createEntryId.mockClear()
  createEntryId.mockReturnValue(4242)
})

describe('useRegisterDrill', () => {
  it('starts a round for the selected mode', () => {
    const d = useRegisterDrill('honor', 'mixed')
    d.start()
    expect(d.sessionItems.value.length).toBeGreaterThan(0)
    expect(d.sessionItems.value.every((i) => i.mode === 'honor')).toBe(true)
    expect(d.phase.value).toBe('question')
  })

  it('a wrong answer logs ONE mistake with errorDimension=register and 높임법 LAB', async () => {
    const d = useRegisterDrill('level', 'mixed')
    d.start()
    const item = d.item.value
    const wrong = item.distractors[0]
    await d.answer(wrong)
    expect(d.phase.value).toBe('wrong')
    expect(add).toHaveBeenCalledTimes(1)
    expect(add.mock.calls[0][0]).toMatchObject({
      errorDimension: 'register',
      contextId: 'register-lab',
      contextName: '높임법 LAB',
      reviewState: 'incorrect',
      feedback: 'hard',
    })
  })

  it('a correct answer advances without logging', async () => {
    const d = useRegisterDrill('level', 'mixed')
    d.start()
    await d.answer(d.item.value.answer)
    expect(d.phase.value).toBe('right')
    expect(add).not.toHaveBeenCalled()
  })

  it('keeps a failed mistake pending, blocks next, and retries the same write', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    add.mockRejectedValueOnce(new Error('offline'))
    const d = useRegisterDrill('level', 'mixed')
    d.start()
    const firstIndex = d.index.value
    await d.answer(d.item.value.distractors[0]!)

    expect(d.phase.value).toBe('wrong')
    expect(d.saveError.value).toBe(true)
    await d.next()
    expect(d.index.value).toBe(firstIndex)

    add.mockResolvedValue(undefined)
    await expect(d.retrySave()).resolves.toBe(true)
    expect(d.saveError.value).toBe(false)
    expect(add).toHaveBeenCalledTimes(2)
    expect(add.mock.calls.map((call) => call[1])).toEqual([4242, 4242])
    expect(createEntryId).toHaveBeenCalledTimes(1)
    await d.next()
    expect(d.index.value).toBe(firstIndex + 1)
    errorSpy.mockRestore()
  })

  it('reuses one id when the remote commit succeeds but its response is lost', async () => {
    const remoteIds = new Set<number>()
    let loseResponse = true
    add.mockImplementation(async (_payload: unknown, stableId: number) => {
      remoteIds.add(stableId)
      if (loseResponse) {
        loseResponse = false
        throw new Error('response lost after commit')
      }
    })
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const d = useRegisterDrill('level', 'mixed')
    d.start()

    await d.answer(d.item.value.distractors[0]!)
    expect(d.saveStatus.value).toBe('error')
    await expect(d.retrySave()).resolves.toBe(true)

    expect(add.mock.calls.map((call) => call[1])).toEqual([4242, 4242])
    expect(remoteIds).toEqual(new Set([4242]))
    errorSpy.mockRestore()
  })

  it('replayFailed re-drills only the missed items and suppresses logging', async () => {
    const d = useRegisterDrill('level', 'mixed')
    d.start()
    while (d.phase.value !== 'done') {
      const it = d.item.value
      if (d.index.value === 0) await d.answer(it.distractors[0])
      else await d.answer(it.answer)
      await d.next()
    }
    expect(d.failedItems.value.length).toBe(1)
    await d.replayFailed()
    expect(d.runMode.value).toBe('replay')
    expect(d.sessionItems.value.length).toBe(1)
    add.mockClear()
    const r = d.item.value
    await d.answer(r.distractors[0])
    expect(add).not.toHaveBeenCalled()
  })
})
