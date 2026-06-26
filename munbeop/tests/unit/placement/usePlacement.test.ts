import { usePlacement } from '~/composables/usePlacement'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const setStartingDeck = vi.fn()
vi.mock('~/stores/settings', () => ({ useSettingsStore: () => ({ setStartingDeck }) }))
vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))

vi.mock('~/seed/placement', () => {
  const mk = (ko: string, level: number, correct: string) => ({
    ko, level: level as never, sentence: `${ko} {}.`, answer: correct,
    distractors: [`${ko}-b`, `${ko}-c`, `${ko}-d`],
    trans: { en: 't' } as never, why: { en: 'w' } as never,
  })
  // 6 identical-per-level items so selection always has enough.
  const bucket = (lvl: number) => Array.from({ length: 6 }, (_, i) => mk(`L${lvl}i${i}`, lvl, `L${lvl}i${i}`))
  return {
    PLACEMENT_ITEMS_BY_LEVEL: { 1: bucket(1), 2: bucket(2), 3: bucket(3), 4: bucket(4), 5: bucket(5), 6: bucket(6) },
    PLACEMENT_ITEMS: [],
  }
})

beforeEach(() => {
  setActivePinia(createPinia())
  setStartingDeck.mockClear()
})

/** Answer the current question; pass `correct` to choose the right/wrong option. */
async function step(p: ReturnType<typeof usePlacement>, correct: boolean) {
  p.answer(correct ? p.item.value.answer : p.item.value.distractors[0])
  await p.next()
}

describe('usePlacement', () => {
  it('a learner who fails level 1 ends placed at topik-1', async () => {
    const p = usePlacement()
    p.start()
    for (let i = 0; i < 4; i++) await step(p, false)
    expect(p.phase.value).toBe('done')
    expect(p.outcome.value?.startingDeckId).toBe('topik-1')
    expect(setStartingDeck).toHaveBeenCalledWith('topik-1')
  })

  it('a learner who clears 1–3 then fails 4 is placed at topik-4', async () => {
    const p = usePlacement()
    p.start()
    for (let i = 0; i < 12; i++) await step(p, true) // clear levels 1,2,3
    await step(p, true)                              // level 4: 1 correct
    for (let i = 0; i < 3; i++) await step(p, false) // then 3 wrong → fail
    expect(p.outcome.value?.startingDeckId).toBe('topik-4')
    expect(setStartingDeck).toHaveBeenCalledWith('topik-4')
  })

  it('exposes 4 display options including the answer', () => {
    const p = usePlacement()
    p.start()
    expect(p.displayOptions.value).toHaveLength(4)
    expect(p.displayOptions.value).toContain(p.item.value.answer)
  })
})
