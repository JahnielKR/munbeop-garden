// tests/unit/register-transform/useRegisterMaster.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRegisterMaster } from '~/composables/useRegisterMaster'
import { useSettingsStore } from '~/stores/settings'

// Mastery now persists through the account-synced settings blob (was global
// localStorage); mock the adapter so the persist is a no-op.
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn(async () => null), write: vi.fn(async () => {}), remove: vi.fn(), clear: vi.fn() }),
}))

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('useRegisterMaster', () => {
  it('clears a set at accuracy ≥ 0.7 and persists', () => {
    const m = useRegisterMaster()
    m.recordRound('level', 'formal', 0.6)
    expect(m.doneCount.value).toBe(0)
    m.recordRound('level', 'formal', 0.75)
    expect(m.doneCount.value).toBe(1)
    expect(useSettingsStore().labCleared.register).toContain('level:formal')
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
    expect(useSettingsStore().labEarned.register).toBe(true)
  })
})
