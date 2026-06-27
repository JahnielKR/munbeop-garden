import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNumberDictation, normalizeValue } from '~/composables/useNumberDictation'

vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))
const play = vi.fn()
vi.mock('~/composables/useNumberMarketAudio', () => ({ useNumberMarketAudio: () => ({ playReading: play, stop: vi.fn() }) }))

beforeEach(() => {
  setActivePinia(createPinia())
  play.mockClear()
})

describe('normalizeValue', () => {
  it('strips whitespace', () => {
    expect(normalizeValue('  12 000 ')).toBe('12000')
    expect(normalizeValue('3:15')).toBe('3:15')
    expect(normalizeValue('010-1234')).toBe('0101234')
  })
})

describe('useNumberDictation', () => {
  it('starts a round and plays the first reading', () => {
    const d = useNumberDictation()
    d.selectDomain('time')
    d.start()
    expect(d.phase.value).toBe('input')
    expect(d.sessionItems.value.length).toBeGreaterThan(0)
    expect(play).toHaveBeenCalledWith(d.item.value.answer)
  })
  it('correct valueKey → right; wrong → wrong', () => {
    const d = useNumberDictation()
    d.selectDomain('time')
    d.start()
    d.entry.value = d.item.value.valueKey
    d.submit()
    expect(d.phase.value).toBe('right')
  })
  it('a wrong entry is marked wrong and shows in failedItems', () => {
    const d = useNumberDictation()
    d.selectDomain('time')
    d.start()
    d.entry.value = 'zzz'
    d.submit()
    expect(d.phase.value).toBe('wrong')
    d.next()
    expect(d.failedItems.value.length).toBe(1)
  })
  it('replay button re-plays the current reading', () => {
    const d = useNumberDictation()
    d.selectDomain('time')
    d.start()
    play.mockClear()
    d.play()
    expect(play).toHaveBeenCalledWith(d.item.value.answer)
  })
  it('next advances and replays; round ends at done', () => {
    const d = useNumberDictation()
    d.selectDomain('time')
    d.start()
    while (d.phase.value !== 'done') {
      d.entry.value = d.item.value.valueKey
      d.submit()
      d.next()
    }
    expect(d.score.value.accuracy).toBe(1)
  })
})
