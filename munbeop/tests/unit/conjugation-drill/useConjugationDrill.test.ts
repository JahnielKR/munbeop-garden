// tests/unit/conjugation-drill/useConjugationDrill.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const add = vi.fn()
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ add }) }))
const srsSpy = vi.fn()
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ markSeen: srsSpy, recalculate: srsSpy }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: 'en' } }) }))

import { useConjugationDrill } from '~/composables/useConjugationDrill'

beforeEach(() => {
  setActivePinia(createPinia())
  add.mockClear()
  srsSpy.mockClear()
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

  it('a wrong answer logs ONE mistake with errorDimension=ending and 활용 LAB, and never touches SRS', async () => {
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
    expect(srsSpy).not.toHaveBeenCalled()
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
})
