import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useContextsStore } from '~/stores/contexts'
import type { LocalizedString } from '~/lib/domain'
import { LOCALE_CODES } from '~/lib/domain'
import { STORAGE_KEYS } from '~/lib/storage'

// Adapter whose write() can be made to reject, to exercise the rollback path.
const write = vi.fn(async () => {})
const read = vi.fn(async () => [] as unknown[])
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read, write, append: vi.fn(), upsertOne: vi.fn(), remove: vi.fn(), clear: vi.fn() }),
}))

function scene(text: string): LocalizedString {
  return Object.fromEntries(LOCALE_CODES.map((c) => [c, text])) as LocalizedString
}

describe('useContextsStore — rollback on cloud write failure', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    write.mockReset()
    write.mockResolvedValue(undefined)
  })

  it('toggleActive restores inactiveIds when the write fails', async () => {
    const store = useContextsStore()
    const before = [...store.inactiveIds]
    write.mockRejectedValueOnce(new Error('cloud down'))
    await expect(store.toggleActive('banmal')).rejects.toThrow('cloud down')
    expect(store.inactiveIds).toEqual(before) // not left deactivated in memory
  })

  it('addCustom removes the optimistic context when the write fails', async () => {
    const store = useContextsStore()
    write.mockRejectedValueOnce(new Error('cloud down'))
    await expect(store.addCustom('우리집', scene('at home'))).rejects.toThrow('cloud down')
    expect(store.custom).toEqual([])
    expect(store.all.some((c) => c.name === '우리집')).toBe(false)
  })

  it('removeCustom restores the context when the write fails', async () => {
    const store = useContextsStore()
    const ctx = await store.addCustom('우리집', scene('at home')) // write resolves
    expect(ctx).not.toBeNull()
    write.mockRejectedValueOnce(new Error('cloud down'))
    await expect(store.removeCustom(ctx!.id)).rejects.toThrow('cloud down')
    expect(store.all.some((c) => c.id === ctx!.id)).toBe(true) // still there
  })

  it('commits deletion before best-effort inactive-id cleanup', async () => {
    const store = useContextsStore()
    const ctx = await store.addCustom('우리집', scene('at home'))
    await store.toggleActive(ctx!.id)
    write.mockClear()
    write
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('cleanup down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(store.removeCustom(ctx!.id)).resolves.toBe(true)

    expect(store.all.some((candidate) => candidate.id === ctx!.id)).toBe(false)
    expect(write.mock.calls.map((call) => call[0])).toEqual([
      STORAGE_KEYS.customContexts,
      STORAGE_KEYS.inactiveContextIds,
    ])
  })
})
