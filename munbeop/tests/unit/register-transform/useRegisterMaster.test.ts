// tests/unit/register-transform/useRegisterMaster.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useRegisterMaster } from '~/composables/useRegisterMaster'

beforeEach(() => localStorage.clear())

describe('useRegisterMaster', () => {
  it('clears a set at accuracy ≥ 0.7 and persists', () => {
    const m = useRegisterMaster()
    m.recordRound('level', 'formal', 0.6)
    expect(m.doneCount.value).toBe(0)
    m.recordRound('level', 'formal', 0.75)
    expect(m.doneCount.value).toBe(1)
    expect(JSON.parse(localStorage.getItem('register-lab.cleared')!)).toContain('level:formal')
  })
  it('celebrates once when all 7 sets are cleared', () => {
    const m = useRegisterMaster()
    const sets: Array<['level' | 'honor', string]> = [
      ['level', 'formal'], ['level', 'polite'], ['level', 'casual'],
      ['honor', 'verb'], ['honor', 'noun'], ['honor', 'particle'], ['honor', 'si'],
    ]
    for (const [mode, set] of sets) m.recordRound(mode, set, 1)
    expect(m.earned.value).toBe(true)
    expect(m.celebrate.value).toBe(true)
    expect(localStorage.getItem('register-lab.masterEarned')).toBe('1')
  })
})
