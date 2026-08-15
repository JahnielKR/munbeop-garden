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
  it('does not clear a class when accuracy is below 0.7', async () => {
    const m = useConjugationMaster()
    await m.recordRound(MASTER_CLASS_IDS[0], 0.5)
    expect(m.doneCount.value).toBe(0)
  })

  it('clears a class at accuracy >= 0.7 and is idempotent (no double count)', async () => {
    const m = useConjugationMaster()
    await m.recordRound(MASTER_CLASS_IDS[0], 0.7)
    await m.recordRound(MASTER_CLASS_IDS[0], 1)
    expect(m.doneCount.value).toBe(1)
  })

  it('earns + celebrates once when all classes are cleared, persisting the sticky flag', async () => {
    const m = useConjugationMaster()
    for (const k of MASTER_CLASS_IDS) await m.recordRound(k, 1)
    expect(m.earned.value).toBe(true)
    expect(m.celebrate.value).toBe(true)
    expect(useSettingsStore().labEarned.conjugation).toBe(true)
  })

  it('a fresh instance after earning does not re-celebrate but stays earned', async () => {
    const first = useConjugationMaster()
    for (const k of MASTER_CLASS_IDS) await first.recordRound(k, 1)
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

  it('rolls back a failed clear and exposes retry before showing it as saved', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const m = useConjugationMaster()
    for (const klass of MASTER_CLASS_IDS.slice(0, -1)) await m.recordRound(klass, 1)
    const lastClass = MASTER_CLASS_IDS.at(-1)!
    mockWrite.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined)

    await expect(m.recordRound(lastClass, 1)).resolves.toBe(false)
    expect(m.saveStatus.value).toBe('error')
    expect(m.doneCount.value).toBe(MASTER_CLASS_IDS.length - 1)
    expect(m.earned.value).toBe(false)
    expect(m.celebrate.value).toBe(false)
    expect(useSettingsStore().labCleared.conjugation).not.toContain(lastClass)
    expect(useSettingsStore().labEarned.conjugation).toBe(false)

    await expect(m.retrySave()).resolves.toBe(true)
    expect(m.saveStatus.value).toBe('saved')
    expect(m.doneCount.value).toBe(MASTER_CLASS_IDS.length)
    expect(m.earned.value).toBe(true)
    expect(m.celebrate.value).toBe(true)
    errorSpy.mockRestore()
  })
})
