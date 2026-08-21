import { useDataImport } from '~/composables/useDataImport'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { STORAGE_KEYS } from '~/lib/storage'
import { APP_ID } from '~/lib/data-transfer/keys'

const restore = vi.fn(async () => {})
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ restore }),
}))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))

const payload = (data: Record<string, unknown>) =>
  ({ exportedAt: 'x', app: APP_ID, data }) as never

beforeEach(() => {
  setActivePinia(createPinia())
  restore.mockReset()
  restore.mockResolvedValue(undefined)
})

describe('useDataImport.applyImport', () => {
  it('restores all present known keys in one call and skips unknown keys', async () => {
    const { applyImport } = useDataImport()
    const ok = await applyImport(
      payload({
        [STORAGE_KEYS.srs]: { A: { easyCount: 1 } },
        [STORAGE_KEYS.log]: [{ id: 1 }],
        'totally.unknown': 9,
      }),
    )

    expect(ok).toBe(true)
    expect(restore).toHaveBeenCalledTimes(1)
    expect(restore).toHaveBeenCalledWith({
      [STORAGE_KEYS.srs]: { A: { easyCount: 1 } },
      [STORAGE_KEYS.log]: [{ id: 1 }],
    })
  })

  it('passes null through so the transaction clears that collection', async () => {
    const { applyImport } = useDataImport()
    await expect(
      applyImport(payload({ [STORAGE_KEYS.customDecks]: null })),
    ).resolves.toBe(true)
    expect(restore).toHaveBeenCalledWith({ [STORAGE_KEYS.customDecks]: null })
  })

  it('returns false when the transactional restore fails', async () => {
    restore.mockRejectedValueOnce(new Error('transaction aborted'))
    const { applyImport } = useDataImport()
    await expect(applyImport(payload({ [STORAGE_KEYS.log]: [] }))).resolves.toBe(false)
  })

  it('does not call storage when the backup has no known keys', async () => {
    const { applyImport } = useDataImport()
    await expect(applyImport(payload({ unknown: 1 }))).resolves.toBe(true)
    expect(restore).not.toHaveBeenCalled()
  })
})
