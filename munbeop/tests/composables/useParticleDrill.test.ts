import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope, type EffectScope } from 'vue'
import { familyFormFor } from '~/lib/particle-lab'
// vi.mock/vi.hoisted are hoisted above every import, so importing the composable
// here (top of file) still receives the mocked stores/seed below.
import { useParticleDrill } from '~/composables/useParticleDrill'

// vi.mock factories are hoisted above module-scope consts, so the fixture and
// spies they reference must be created inside vi.hoisted.
const { FIX, addSpy, markSeenSpy, recalcSpy } = vi.hoisted(() => {
  const LS = (s: string) => ({ en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s })
  return {
    // f1 = topic (저 → 는), f2/f3 = subject (물 → 이, 커피 → 가).
    FIX: [
      { id: 'f1', cue: LS('c'), noun: '저', rest: ' 학생이에요.', setId: 'topic-subject', familyIndex: 0, reason: LS('r'), trans: LS('t') },
      { id: 'f2', cue: LS('c'), noun: '물', rest: ' 맛있어요.', setId: 'topic-subject', familyIndex: 1, reason: LS('r'), trans: LS('t') },
      { id: 'f3', cue: LS('c'), noun: '커피', rest: ' 좋아요.', setId: 'topic-subject', familyIndex: 1, reason: LS('r'), trans: LS('t') },
    ],
    addSpy: vi.fn(async () => {}),
    markSeenSpy: vi.fn(async () => {}),
    recalcSpy: vi.fn(async () => {}),
  }
})
vi.mock('~/seed/particle-drills', () => ({ PARTICLE_DRILLS: FIX }))
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ add: addSpy, entries: [] }) }))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ markSeen: markSeenSpy, recalculate: recalcSpy }) }))
vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))

describe('useParticleDrill — replay', () => {
  let scope: EffectScope
  beforeEach(() => {
    addSpy.mockClear()
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
})
