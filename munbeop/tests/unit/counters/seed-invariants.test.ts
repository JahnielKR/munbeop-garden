import { describe, it, expect } from 'vitest'
import { COUNTERS, COUNT_ITEMS, counterById } from '~/seed/counters'
import { nativePrenominal, sinoNumber } from '~/lib/korean'
import { LOCALE_CODES } from '~/lib/domain'

describe('counter seed invariants', () => {
  it('every counter id is unique', () => {
    const ids = COUNTERS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes the ambiguous 분 (people/minutes) and 번 (times/ordinal) splits', () => {
    const byKoSystem = (ko: string, sys: string) => COUNTERS.some((c) => c.ko === ko && c.system === sys)
    expect(byKoSystem('분', 'native')).toBe(true) // honorific people: 세 분
    expect(byKoSystem('분', 'sino')).toBe(true) // minutes: 삼 분
    expect(byKoSystem('번', 'native')).toBe(true) // N times: 세 번
    expect(byKoSystem('번', 'sino')).toBe(true) // ordinal: 삼 번
  })

  it('every item references a real counter with a matching system', () => {
    for (const it of COUNT_ITEMS) {
      const c = counterById(it.counterId)
      expect(c, it.counterId).toBeTruthy()
      expect(it.system, `${it.counterId} system`).toBe(c!.system)
    }
  })

  it("every item's answer is exactly the engine-rendered number + ' ' + counter ko", () => {
    for (const it of COUNT_ITEMS) {
      const c = counterById(it.counterId)!
      const num = it.system === 'native' ? nativePrenominal(it.quantity) : sinoNumber(it.quantity)
      expect(it.answer, `${it.counterId} ${it.quantity}`).toBe(`${num} ${c.ko}`)
    }
  })

  it('every item trans is present in all 8 locales', () => {
    for (const it of COUNT_ITEMS) {
      for (const code of LOCALE_CODES) {
        expect(it.trans[code], `${it.counterId} ${it.quantity} ${code}`).toBeTruthy()
      }
    }
  })

  it('every counter has at least one item', () => {
    const used = new Set(COUNT_ITEMS.map((i) => i.counterId))
    for (const c of COUNTERS) expect(used.has(c.id), `${c.id} has no items`).toBe(true)
  })
})
