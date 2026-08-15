import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterDrill } from '~/composables/useCounterDrill'
import { COUNTER_SETS } from '~/lib/counters/sets'
import { useSettingsStore } from '~/stores/settings'

vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn(async () => null), write: vi.fn(async () => {}), remove: vi.fn(), clear: vi.fn() }),
}))

beforeEach(() => setActivePinia(createPinia()))

describe('useCounterDrill', () => {
  it('starts a round for a set with 4 options, answer included', () => {
    const d = useCounterDrill()
    d.selectSet(COUNTER_SETS[0]!.id)
    d.start()
    expect(d.phase.value).toBe('question')
    expect(d.displayOptions.value).toHaveLength(4)
    expect(d.displayOptions.value).toContain(d.item.value.answer)
  })

  it('a wrong answer sets phase=wrong; a right answer phase=right', async () => {
    const d = useCounterDrill()
    d.selectSet(COUNTER_SETS[0]!.id)
    d.start()
    const wrong = d.displayOptions.value.find((o) => o !== d.item.value.answer)!
    await d.answer(wrong)
    expect(d.phase.value).toBe('wrong')
  })

  it('replayFailed re-drills only the missed items', async () => {
    const d = useCounterDrill()
    d.selectSet(COUNTER_SETS[0]!.id)
    d.start()
    while (d.phase.value !== 'done') {
      const it = d.item.value
      if (d.index.value === 0) await d.answer(d.displayOptions.value.find((o) => o !== it.answer)!)
      else await d.answer(it.answer)
      await d.next()
    }
    expect(d.failedItems.value.length).toBe(1)
    d.replayFailed()
    expect(d.runMode.value).toBe('replay')
    expect(d.sessionItems.value.length).toBe(1)
  })

  it('exposes mastery and clears the selected set after a strong normal round', async () => {
    const d = useCounterDrill()
    const setId = COUNTER_SETS[0]!.id
    d.selectSet(setId)
    d.start()
    while (d.phase.value !== 'done') {
      await d.answer(d.item.value.answer)
      await d.next()
    }
    expect(d.master.doneCount.value).toBe(1)
    expect(useSettingsStore().labCleared.counter).toContain(setId)
  })
})
