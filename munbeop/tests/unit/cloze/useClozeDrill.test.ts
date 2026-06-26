// tests/unit/cloze/useClozeDrill.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useClozeDrill } from '~/composables/useClozeDrill'
import type { ClozeItem } from '~/lib/domain'

const add = vi.fn()
const recalculate = vi.fn()
const markSeen = vi.fn()
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ add }) }))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ recalculate, markSeen }) }))
vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: 'en' } }) }))

const items: ClozeItem[] = [
  { ko: '-고 싶다', sentence: '영화를 {} 싶어요.', answer: '보고', distractors: ['봐서', '보지만', '보면'], trans: { en: 't' } as never, why: { en: 'w' } as never },
]
vi.mock('~/lib/cloze', async (orig) => {
  const real = await orig<typeof import('~/lib/cloze')>()
  return { ...real, buildRound: (_kos: string[], _n: number, shuffle: <T>(x: T[]) => T[]) => shuffle(items) }
})

beforeEach(() => {
  setActivePinia(createPinia())
  add.mockClear(); recalculate.mockClear(); markSeen.mockClear()
})

describe('useClozeDrill', () => {
  it('a wrong pick logs ONE hard/incorrect with cloze-lab + recalculates', async () => {
    const d = useClozeDrill()
    await d.start(['-고 싶다'])
    await d.answer('봐서')
    expect(d.phase.value).toBe('wrong')
    expect(add).toHaveBeenCalledTimes(1)
    expect(add.mock.calls[0][0]).toMatchObject({
      ko: '-고 싶다', feedback: 'hard', reviewState: 'incorrect',
      errorDimension: 'other', contextId: 'cloze-lab', contextName: '빈칸 LAB',
    })
    expect(recalculate).toHaveBeenCalledWith('-고 싶다')
  })

  it('a correct pick does not log on pick; finish credits easy/correct', async () => {
    const d = useClozeDrill()
    await d.start(['-고 싶다'])
    await d.answer('보고')
    expect(d.phase.value).toBe('right')
    expect(add).not.toHaveBeenCalled()
    await d.next()           // single item → phase done
    expect(d.phase.value).toBe('done')
    await d.finish()
    expect(add).toHaveBeenCalledTimes(1)
    expect(add.mock.calls[0][0]).toMatchObject({ ko: '-고 싶다', feedback: 'easy', reviewState: 'correct' })
    expect(recalculate).toHaveBeenCalledWith('-고 싶다')
  })

  it('replay mode does not log', async () => {
    const d = useClozeDrill()
    await d.start(['-고 싶다'])
    await d.answer('봐서')      // miss (logs once, normal)
    await d.next()
    d.replayFailed()
    add.mockClear()
    await d.answer('봐서')
    expect(add).not.toHaveBeenCalled()
  })
})
