import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope, type EffectScope } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { familyFormFor } from '~/lib/particle-lab'
// vi.mock/vi.hoisted are hoisted above every import, so importing the composable
// here (top of file) still receives the mocked stores/seed below.
import { useParticleDrill } from '~/composables/useParticleDrill'

// vi.mock factories are hoisted above module-scope consts, so the fixture and
// spies they reference must be created inside vi.hoisted.
const { FIX, addSpy, createEntryIdSpy, markSeenSpy, recalcSpy } = vi.hoisted(() => {
  const LS = (s: string) => ({ en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s })
  return {
    // f1 = topic (저 → 는), f2/f3 = subject (물 → 이, 커피 → 가).
    FIX: [
      { id: 'f1', cue: LS('c'), noun: '저', rest: ' 학생이에요.', setId: 'topic-subject', familyIndex: 0, reason: LS('r'), trans: LS('t') },
      { id: 'f2', cue: LS('c'), noun: '물', rest: ' 맛있어요.', setId: 'topic-subject', familyIndex: 1, reason: LS('r'), trans: LS('t') },
      { id: 'f3', cue: LS('c'), noun: '커피', rest: ' 좋아요.', setId: 'topic-subject', familyIndex: 1, reason: LS('r'), trans: LS('t') },
    ],
    addSpy: vi.fn(async () => {}),
    createEntryIdSpy: vi.fn(() => 9001),
    markSeenSpy: vi.fn(async () => {}),
    recalcSpy: vi.fn(async () => {}),
  }
})
vi.mock('~/seed/particle-drills', () => ({ PARTICLE_DRILLS: FIX }))
vi.mock('~/stores/log', () => ({
  useLogStore: () => ({ add: addSpy, createEntryId: createEntryIdSpy, entries: [] }),
}))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ markSeen: markSeenSpy, recalculate: recalcSpy }) }))
vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))

describe('useParticleDrill — replay', () => {
  let scope: EffectScope
  beforeEach(() => {
    setActivePinia(createPinia())
    addSpy.mockClear()
    createEntryIdSpy.mockClear()
    createEntryIdSpy.mockReturnValue(9001)
    markSeenSpy.mockClear()
    recalcSpy.mockClear()
    scope = effectScope()
  })
  afterEach(() => {
    scope.stop()
  })

  const make = () => scope.run(() => useParticleDrill('topic-subject'))!

  // Answer the current item right or wrong (wrong = the other family's form → wrong-family).
  async function step(drill: ReturnType<typeof make>, correct: boolean) {
    const it = drill.item.value
    const set = drill.set.value
    const fam = set.families[it.familyIndex]!
    const other = set.families[it.familyIndex === 0 ? 1 : 0]!
    await drill.answer(familyFormFor(correct ? fam : other, it.noun))
    await drill.next()
  }

  it('replayFailed re-drills only the failed items, in replay mode, without re-logging', async () => {
    const drill = make()
    await drill.start()
    await step(drill, false) // miss the first presented item
    await step(drill, true)
    await step(drill, true)
    expect(drill.phase.value).toBe('done')
    expect(drill.failedItems.value).toHaveLength(1)
    expect(addSpy).toHaveBeenCalledTimes(1) // one hard diary entry from the normal round
    const missedId = drill.failedItems.value[0]!.id

    await drill.replayFailed()
    expect(drill.mode.value).toBe('replay')
    expect(drill.sessionItems.value.map((i) => i.id)).toEqual([missedId])

    await step(drill, false) // miss it again — replay must NOT write a diary entry
    expect(drill.phase.value).toBe('done')
    expect(addSpy).toHaveBeenCalledTimes(1) // still 1
    expect(markSeenSpy).toHaveBeenCalled() // replay reinforced SRS via markSeen
  })

  it('replayFailed is a no-op after a perfect round', async () => {
    const drill = make()
    await drill.start()
    await step(drill, true)
    await step(drill, true)
    await step(drill, true)
    expect(drill.failedItems.value).toHaveLength(0)
    await drill.replayFailed()
    expect(drill.mode.value).toBe('normal')
  })

  it('keeps a failed diary write retryable and blocks next until it saves', async () => {
    addSpy.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined)
    const drill = make()
    await drill.start()
    const it = drill.item.value
    const set = drill.set.value
    const other = set.families[it.familyIndex === 0 ? 1 : 0]!
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await drill.answer(familyFormFor(other, it.noun))
    expect(drill.saveStatus.value).toBe('error')
    const index = drill.index.value
    await drill.next()
    expect(drill.index.value).toBe(index)

    await drill.retrySave()
    expect(drill.saveStatus.value).toBe('saved')
    expect(addSpy).toHaveBeenCalledTimes(2)
    expect(createEntryIdSpy).toHaveBeenCalledTimes(1)
    expect(addSpy.mock.calls[0][1]).toBe(9001)
    expect(addSpy.mock.calls[1][1]).toBe(9001)
    errorSpy.mockRestore()
  })

  it('keeps a failed end-of-round credit retryable and blocks a new round', async () => {
    addSpy.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined)
    const drill = make()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await drill.start()
    const familyItem = drill.sessionItems.value.find((item) => item.familyIndex === 1)!
    drill.sessionItems.value.push({ ...familyItem, id: 'f4' })

    while (drill.phase.value !== 'done') await step(drill, true)

    expect(drill.phase.value).toBe('done')
    expect(drill.saveStatus.value).toBe('error')
    const completedItems = drill.sessionItems.value
    await drill.start()
    expect(drill.phase.value).toBe('done')
    expect(drill.sessionItems.value).toBe(completedItems)
    expect(drill.saveStatus.value).toBe('error')

    await drill.retrySave()
    expect(drill.saveStatus.value).toBe('saved')
    expect(addSpy).toHaveBeenCalledTimes(2)
    expect(createEntryIdSpy).toHaveBeenCalledTimes(1)
    expect(addSpy.mock.calls[0][1]).toBe(9001)
    expect(addSpy.mock.calls[1][1]).toBe(9001)
    errorSpy.mockRestore()
  })

  it('does not skip a fresh question when next is emitted twice', async () => {
    const drill = make()
    await drill.start()
    const current = drill.item.value
    const family = drill.set.value.families[current.familyIndex]!
    await drill.answer(familyFormFor(family, current.noun))

    await drill.next()
    const advancedIndex = drill.index.value
    await drill.next()

    expect(drill.index.value).toBe(advancedIndex)
    expect(drill.phase.value).toBe('question')
  })

  it('does not continue account-A credits after account B signs in', async () => {
    useAuthStore().user = { id: 'account-a' } as never
    const drill = make()
    await drill.start()
    const family0 = drill.sessionItems.value.find((item) => item.familyIndex === 0)!
    const family1 = drill.sessionItems.value.find((item) => item.familyIndex === 1)!
    drill.sessionItems.value = [
      family0,
      { ...family0, id: 'f0-copy-1' },
      { ...family0, id: 'f0-copy-2' },
      family1,
      { ...family1, id: 'f1-copy-1' },
      { ...family1, id: 'f1-copy-2' },
    ]
    createEntryIdSpy.mockImplementation(() => 9000 + createEntryIdSpy.mock.calls.length)
    let releaseFirst!: () => void
    addSpy.mockImplementationOnce(
      () => new Promise<void>((resolve) => { releaseFirst = resolve }),
    )

    while (drill.index.value < drill.sessionItems.value.length - 1) {
      const current = drill.item.value
      await drill.answer(familyFormFor(drill.set.value.families[current.familyIndex]!, current.noun))
      await drill.next()
    }
    const last = drill.item.value
    await drill.answer(familyFormFor(drill.set.value.families[last.familyIndex]!, last.noun))
    const finishing = drill.next()
    await vi.waitFor(() => expect(addSpy).toHaveBeenCalledTimes(1))
    useAuthStore().user = { id: 'account-b' } as never
    releaseFirst()
    await finishing

    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(recalcSpy).not.toHaveBeenCalled()
  })
})
