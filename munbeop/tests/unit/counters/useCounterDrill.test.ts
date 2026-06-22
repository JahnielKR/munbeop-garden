import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterDrill } from '~/composables/useCounterDrill'
import { COUNTER_SETS } from '~/lib/counters/sets'

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
})
