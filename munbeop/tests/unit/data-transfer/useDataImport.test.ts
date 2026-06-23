import { useDataImport } from '~/composables/useDataImport'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { STORAGE_KEYS } from '~/lib/storage'
import { APP_ID } from '~/lib/data-transfer/keys'

const write = vi.fn(async () => {})
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn(), write, remove: vi.fn(), clear: vi.fn() }),
}))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))

const payload = (data: Record<string, unknown>) => ({ exportedAt: 'x', app: APP_ID, data }) as never

beforeEach(() => {
  setActivePinia(createPinia())
  write.mockReset()
  write.mockResolvedValue(undefined)
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
  it('returns false when a write throws', async () => {
    write.mockRejectedValueOnce(new Error('boom'))
    const { applyImport } = useDataImport()
    const ok = await applyImport(payload({ [STORAGE_KEYS.log]: [1] }))
    expect(ok).toBe(false)
  })
})
