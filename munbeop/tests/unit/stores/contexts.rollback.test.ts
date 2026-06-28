import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useContextsStore } from '~/stores/contexts'
import type { LocalizedString } from '~/lib/domain'
import { LOCALE_CODES } from '~/lib/domain'

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
    const ok = await store.toggleActive('banmal')
    expect(ok).toBe(false)
    expect(store.inactiveIds).toEqual(before) // not left deactivated in memory
  })

  it('addCustom removes the optimistic context when the write fails', async () => {
    const store = useContextsStore()
    write.mockRejectedValueOnce(new Error('cloud down'))
    const created = await store.addCustom('우리집', scene('at home'))
    expect(created).toBeNull()
    expect(store.custom).toEqual([])
    expect(store.all.some((c) => c.name === '우리집')).toBe(false)
  })

  it('removeCustom restores the context when the write fails', async () => {
    const store = useContextsStore()
    const ctx = await store.addCustom('우리집', scene('at home')) // write resolves
    expect(ctx).not.toBeNull()
    write.mockRejectedValueOnce(new Error('cloud down'))
    const ok = await store.removeCustom(ctx!.id)
    expect(ok).toBe(false)
    expect(store.all.some((c) => c.id === ctx!.id)).toBe(true) // still there
  })
})
