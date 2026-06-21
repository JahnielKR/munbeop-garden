import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useConjugationMaster } from '~/composables/useConjugationMaster'
import { MASTER_CLASS_IDS } from '~/lib/conjugation-drill/master'

function fakeStorage() {
  const m = new Map<string, string>()
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
    _map: m,
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', fakeStorage())
})

describe('useConjugationMaster', () => {
  it('does not clear a class when accuracy is below 0.7', () => {
    const m = useConjugationMaster()
    m.recordRound(MASTER_CLASS_IDS[0], 0.5)
    expect(m.doneCount.value).toBe(0)
  })
  it('clears a class at accuracy >= 0.7 and is idempotent (no double count)', () => {
    const m = useConjugationMaster()
    m.recordRound(MASTER_CLASS_IDS[0], 0.7)
    m.recordRound(MASTER_CLASS_IDS[0], 1)
    expect(m.doneCount.value).toBe(1)
  })
  it('earns + celebrates once when all 9 classes are cleared', () => {
    const m = useConjugationMaster()
    for (const k of MASTER_CLASS_IDS) m.recordRound(k, 1)
    expect(m.earned.value).toBe(true)
    expect(m.celebrate.value).toBe(true)
  })
  it('a fresh instance after earning does not re-celebrate but stays earned', () => {
    const first = useConjugationMaster()
    for (const k of MASTER_CLASS_IDS) first.recordRound(k, 1)
    const second = useConjugationMaster()
    expect(second.earned.value).toBe(true)
    expect(second.celebrate.value).toBe(false)
  })
  it('stays earned even if the cleared key is lost (sticky off EARNED_KEY)', () => {
    const first = useConjugationMaster()
    for (const k of MASTER_CLASS_IDS) first.recordRound(k, 1)
    localStorage.removeItem('conjugation-lab.cleared') // wipe progress, keep earned flag
    const second = useConjugationMaster()
    expect(second.earned.value).toBe(true)
  })
})
