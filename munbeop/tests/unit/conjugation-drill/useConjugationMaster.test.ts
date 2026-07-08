import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useConjugationMaster } from '~/composables/useConjugationMaster'
import { useSettingsStore } from '~/stores/settings'
import { useAuthStore } from '~/stores/auth'
import { MASTER_CLASS_IDS } from '~/lib/conjugation-drill/master'

// Mastery now lives in the account-synced settings blob (was global
// localStorage). Mock the adapter so recordRound's persist is a controllable
// no-op and hydrate() can feed a stored blob.
const mockRead = vi.fn(async () => null as unknown)
const mockWrite = vi.fn(async () => {})
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: mockRead, write: mockWrite, remove: vi.fn(), clear: vi.fn() }),
}))

beforeEach(() => {
  setActivePinia(createPinia())
  mockRead.mockReset()
  mockRead.mockResolvedValue(null)
  mockWrite.mockReset()
  mockWrite.mockResolvedValue(undefined)
  localStorage.clear()
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

  it('earns + celebrates once when all classes are cleared, persisting the sticky flag', () => {
    const m = useConjugationMaster()
    for (const k of MASTER_CLASS_IDS) m.recordRound(k, 1)
    expect(m.earned.value).toBe(true)
    expect(m.celebrate.value).toBe(true)
    expect(useSettingsStore().labEarned.conjugation).toBe(true)
  })

  it('a fresh instance after earning does not re-celebrate but stays earned', () => {
    const first = useConjugationMaster()
    for (const k of MASTER_CLASS_IDS) first.recordRound(k, 1)
    const second = useConjugationMaster()
    expect(second.earned.value).toBe(true)
    expect(second.celebrate.value).toBe(false)
  })

  it('stays earned from the sticky flag even when nothing is currently cleared', async () => {
    // A blob that carries only the sticky earned flag (e.g. a later catalog
    // change reset the derived mastery) must still show the badge earned.
    useAuthStore().user = { id: 'u' } as never
    mockRead.mockResolvedValue({ labEarned: { conjugation: true } })
    await useSettingsStore().hydrate()
    const m = useConjugationMaster()
    expect(m.doneCount.value).toBe(0)
    expect(m.earned.value).toBe(true)
  })
})
