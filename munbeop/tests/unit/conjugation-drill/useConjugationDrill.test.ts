// tests/unit/conjugation-drill/useConjugationDrill.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useConjugationDrill } from '~/composables/useConjugationDrill'

const add = vi.fn()
const createEntryId = vi.fn(() => 5252)
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ add, createEntryId }) }))
vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: 'en' } }) }))

beforeEach(() => {
  setActivePinia(createPinia())
  add.mockClear()
  add.mockResolvedValue(undefined)
  createEntryId.mockClear()
})

describe('useConjugationDrill', () => {
  it('starts a round of N items for the selected class', () => {
    const d = useConjugationDrill()
    d.selectClass('p_irr')
    d.start()
    expect(d.sessionItems.value.length).toBeGreaterThan(0)
    expect(d.sessionItems.value.length).toBeLessThanOrEqual(8)
    expect(d.phase.value).toBe('question')
  })

  it('a wrong answer logs ONE mistake with errorDimension=ending and 활용 LAB', async () => {
    const d = useConjugationDrill()
    d.start()
    const item = d.item.value
    const wrong = item.options.find((o) => o !== item.correct)!
    await d.answer(wrong)
    expect(d.phase.value).toBe('wrong')
    expect(add).toHaveBeenCalledTimes(1)
    expect(add.mock.calls[0][0]).toMatchObject({
      errorDimension: 'ending',
      contextId: 'conjugation-lab',
      contextName: '활용 LAB',
      reviewState: 'incorrect',
      feedback: 'hard',
    })
  })

  it('a correct answer advances without logging', async () => {
    const d = useConjugationDrill()
    d.start()
    await d.answer(d.item.value.correct)
    expect(d.phase.value).toBe('right')
    expect(add).not.toHaveBeenCalled()
  })

  it('replayFailed re-drills only the missed items', async () => {
    const d = useConjugationDrill()
    d.start()
    // miss the first, ace the rest
    while (d.phase.value !== 'done') {
      const it = d.item.value
      if (d.index.value === 0) await d.answer(it.options.find((o) => o !== it.correct)!)
      else await d.answer(it.correct)
      await d.next()
    }
    const failed = d.failedItems.value.length
    expect(failed).toBe(1)
    await d.replayFailed()
    expect(d.mode.value).toBe('replay')
    expect(d.sessionItems.value.length).toBe(1)
  })

  it('a wrong answer in replay mode does NOT log to the feed', async () => {
    const d = useConjugationDrill()
    d.start()
    const it = d.item.value
    await d.answer(it.options.find((o) => o !== it.correct)!) // miss item 0 (logs once, normal)
    await d.replayFailed()
    add.mockClear()
    const r = d.item.value
    await d.answer(r.options.find((o) => o !== r.correct)!) // wrong in replay
    expect(add).not.toHaveBeenCalled()
  })

  it('keeps a failed diary write retryable and blocks next until it saves', async () => {
    add.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined)
    const d = useConjugationDrill()
    d.start()
    const wrong = d.item.value.options.find((o) => o !== d.item.value.correct)!
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await d.answer(wrong)
    expect(d.saveStatus.value).toBe('error')
    const index = d.index.value
    await d.next()
    expect(d.index.value).toBe(index)

    await d.retrySave()
    expect(d.saveStatus.value).toBe('saved')
    expect(add).toHaveBeenCalledTimes(2)
    expect(add.mock.calls.map((call) => call[1])).toEqual([5252, 5252])
    expect(createEntryId).toHaveBeenCalledTimes(1)
    errorSpy.mockRestore()
  })
})
