// tests/unit/cloze/useClozeDrill.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useClozeDrill } from '~/composables/useClozeDrill'
import type { ClozeItem } from '~/lib/domain'
import { useAuthStore } from '~/stores/auth'

const add = vi.fn()
const createEntryId = vi.fn(() => 8001)
const recalculate = vi.fn()
const markSeen = vi.fn()
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ add, createEntryId }) }))
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
  add.mockClear(); createEntryId.mockClear(); createEntryId.mockReturnValue(8001)
  recalculate.mockClear(); markSeen.mockClear()
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

  it('keeps a failed diary write retryable and never duplicates after SRS failure', async () => {
    add.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined)
    recalculate.mockRejectedValueOnce(new Error('srs offline'))
    const d = useClozeDrill()
    await d.start(['-고 싶다'])
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await d.answer('봐서')
    expect(d.saveStatus.value).toBe('error')
    await d.next()
    expect(d.phase.value).toBe('wrong')

    await d.retrySave()
    expect(d.saveStatus.value).toBe('saved')
    expect(add).toHaveBeenCalledTimes(2)
    expect(createEntryId).toHaveBeenCalledTimes(1)
    expect(add.mock.calls[0][1]).toBe(8001)
    expect(add.mock.calls[1][1]).toBe(8001)
    expect(recalculate).toHaveBeenCalledTimes(1)
    errorSpy.mockRestore()
  })

  it('keeps a failed end-of-round credit retryable without rebuilding it', async () => {
    add.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined)
    const d = useClozeDrill()
    await d.start(['-고 싶다'])
    await d.answer('보고')
    await d.next()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await d.finish()
    expect(d.saveStatus.value).toBe('error')
    const completedItems = d.sessionItems.value
    await d.start(['-고 싶다'])
    expect(d.phase.value).toBe('done')
    expect(d.sessionItems.value).toBe(completedItems)
    expect(d.saveStatus.value).toBe('error')
    await d.retrySave()
    expect(d.saveStatus.value).toBe('saved')
    expect(add).toHaveBeenCalledTimes(2)
    expect(createEntryId).toHaveBeenCalledTimes(1)
    expect(add.mock.calls[0][1]).toBe(8001)
    expect(add.mock.calls[1][1]).toBe(8001)

    await d.finish()
    expect(add).toHaveBeenCalledTimes(2)
    errorSpy.mockRestore()
  })

  it('does not continue account-A credits after account B signs in', async () => {
    useAuthStore().user = { id: 'account-a' } as never
    const d = useClozeDrill()
    await d.start(['-고 싶다'])
    d.sessionItems.value.push({
      ...items[0]!,
      ko: '-아/어서',
      sentence: '비가 {} 집에 있어요.',
      answer: '와서',
    })
    await d.answer('보고')
    await d.next()
    await d.answer('와서')
    await d.next()

    let releaseFirst!: () => void
    add.mockImplementationOnce(() => new Promise<void>((resolve) => { releaseFirst = resolve }))
    const finishing = d.finish()
    await vi.waitFor(() => expect(add).toHaveBeenCalledTimes(1))
    useAuthStore().user = { id: 'account-b' } as never
    releaseFirst()
    await finishing

    expect(add).toHaveBeenCalledTimes(1)
    expect(recalculate).not.toHaveBeenCalled()
  })
})
