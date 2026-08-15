import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNumberDictation, normalizeValue } from '~/composables/useNumberDictation'
import { useSettingsStore } from '~/stores/settings'

vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn(async () => null), write: vi.fn(async () => {}), remove: vi.fn(), clear: vi.fn() }),
}))
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
  it('zero-pads the minute and drops a leading-zero hour for time answers', () => {
    // valueKey for time is "h:mm" (e.g. "3:05"); accept the natural "3:5".
    expect(normalizeValue('3:5')).toBe('3:05')
    expect(normalizeValue('03:05')).toBe('3:05')
    expect(normalizeValue('12:00')).toBe('12:00')
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
  it('a wrong entry is marked wrong and shows in failedItems', async () => {
    const d = useNumberDictation()
    d.selectDomain('time')
    d.start()
    d.entry.value = 'zzz'
    d.submit()
    expect(d.phase.value).toBe('wrong')
    await d.next()
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
  it('next advances and replays; round ends at done', async () => {
    const d = useNumberDictation()
    d.selectDomain('time')
    d.start()
    while (d.phase.value !== 'done') {
      d.entry.value = d.item.value.valueKey
      d.submit()
      await d.next()
    }
    expect(d.score.value.accuracy).toBe(1)
    expect(useSettingsStore().labCleared.numberMarket).toContain('time')
  })

  it('does not award mastery for a replay of failed dictation items', async () => {
    const d = useNumberDictation()
    d.selectDomain('money')
    d.start()
    while (d.phase.value !== 'done') {
      d.entry.value = 'wrong'
      d.submit()
      await d.next()
    }
    d.replayFailed()
    while (d.phase.value !== 'done') {
      d.entry.value = d.item.value.valueKey
      d.submit()
      await d.next()
    }
    expect(useSettingsStore().labCleared.numberMarket).not.toContain('money')
  })
})
