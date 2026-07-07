import { useDataImport } from '~/composables/useDataImport'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { STORAGE_KEYS } from '~/lib/storage'
import { APP_ID } from '~/lib/data-transfer/keys'

const write = vi.fn(async () => {})
const read = vi.fn(async () => null as unknown)
const remove = vi.fn(async () => {})
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read, write, remove, clear: vi.fn() }),
}))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))

const payload = (data: Record<string, unknown>) => ({ exportedAt: 'x', app: APP_ID, data }) as never

beforeEach(() => {
  setActivePinia(createPinia())
  write.mockReset()
  write.mockResolvedValue(undefined)
  read.mockReset()
  read.mockResolvedValue(null)
  remove.mockReset()
  remove.mockResolvedValue(undefined)
})

describe('useDataImport.applyImport', () => {
  it('writes each present export key, skips absent and unknown keys, returns true', async () => {
    const { applyImport } = useDataImport()
    const ok = await applyImport(payload({ [STORAGE_KEYS.log]: [1], 'totally.unknown': 9 }))
    expect(ok).toBe(true)
    expect(write).toHaveBeenCalledWith(STORAGE_KEYS.log, [1])
    expect(write).not.toHaveBeenCalledWith('totally.unknown', 9)
    expect(write).not.toHaveBeenCalledWith(STORAGE_KEYS.grammar, expect.anything())
  })
  it('skips exported nulls (empty collections) instead of writing them', async () => {
    // An account with an empty collection exports that key as null (export
    // reads with a null fallback). Writing null through the adapter deletes
    // the target's rows and then throws BEFORE the key reaches the rollback
    // list — restoring such a backup used to wipe the importing account's
    // heatmap/streak history permanently.
    const { applyImport } = useDataImport()
    const ok = await applyImport(
      payload({ [STORAGE_KEYS.activity]: null, [STORAGE_KEYS.log]: [1] }),
    )
    expect(ok).toBe(true)
    expect(write).toHaveBeenCalledWith(STORAGE_KEYS.log, [1])
    expect(write).not.toHaveBeenCalledWith(STORAGE_KEYS.activity, expect.anything())
  })

  it('restores the activity map (heatmap/streak source) — regression: the key was missing from backups', async () => {
    const days = { '2026-07-06': { count: 3 } }
    const { applyImport } = useDataImport()
    const ok = await applyImport(payload({ [STORAGE_KEYS.activity]: days }))
    expect(ok).toBe(true)
    expect(write).toHaveBeenCalledWith(STORAGE_KEYS.activity, days)
  })

  it('returns false when a write throws', async () => {
    write.mockRejectedValueOnce(new Error('boom'))
    const { applyImport } = useDataImport()
    const ok = await applyImport(payload({ [STORAGE_KEYS.log]: [1] }))
    expect(ok).toBe(false)
  })

  it('rolls an already-written key back to its snapshot when a later write fails', async () => {
    // srs is written before log (EXPORT_KEYS order). srs has a pre-import value;
    // its write succeeds, then log's write fails → srs must be restored.
    read.mockImplementation(async (key: string) =>
      key === STORAGE_KEYS.srs ? { mastered: 1 } : null,
    )
    write
      .mockResolvedValueOnce(undefined) // srs write succeeds
      .mockRejectedValueOnce(new Error('net drop')) // log write fails

    const { applyImport } = useDataImport()
    const ok = await applyImport(
      payload({ [STORAGE_KEYS.srs]: { mastered: 2 }, [STORAGE_KEYS.log]: ['x'] }),
    )

    expect(ok).toBe(false)
    // srs rolled back to the pre-import snapshot — not left at the imported value.
    expect(write).toHaveBeenCalledWith(STORAGE_KEYS.srs, { mastered: 1 })
  })

  it('removes a key on rollback when it had no pre-import value (snapshot null)', async () => {
    read.mockResolvedValue(null) // nothing existed before
    write
      .mockResolvedValueOnce(undefined) // srs write succeeds
      .mockRejectedValueOnce(new Error('net drop')) // log write fails

    const { applyImport } = useDataImport()
    const ok = await applyImport(
      payload({ [STORAGE_KEYS.srs]: { mastered: 2 }, [STORAGE_KEYS.log]: ['x'] }),
    )

    expect(ok).toBe(false)
    expect(remove).toHaveBeenCalledWith(STORAGE_KEYS.srs)
  })

  it('aborts untouched when a snapshot read fails (nothing written)', async () => {
    read.mockRejectedValueOnce(new Error('net drop'))
    const { applyImport } = useDataImport()
    const ok = await applyImport(payload({ [STORAGE_KEYS.log]: ['x'] }))
    expect(ok).toBe(false)
    expect(write).not.toHaveBeenCalled()
  })
})
