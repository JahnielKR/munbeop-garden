import { describe, it, expect } from 'vitest'
import { NoopStorageAdapter } from '~/lib/storage/noop'
import { STORAGE_KEYS } from '~/lib/storage/keys'

describe('NoopStorageAdapter', () => {
  it('read resolves to the fallback (this is what clears stores on sign-out)', async () => {
    const adapter = new NoopStorageAdapter()
    const fallback = { some: 'state' }
    await expect(adapter.read(STORAGE_KEYS.srs, fallback)).resolves.toBe(fallback)
  })

  it('write drops the value silently (post-sign-out hydration seed-writes defaults)', async () => {
    const adapter = new NoopStorageAdapter()
    await adapter.write(STORAGE_KEYS.log, [{ id: 1 }])
    // Nothing persisted anywhere — a later read still yields the fallback.
    await expect(adapter.read(STORAGE_KEYS.log, [])).resolves.toEqual([])
  })

  it('remove and clear are safe no-ops', async () => {
    const adapter = new NoopStorageAdapter()
    await expect(adapter.remove(STORAGE_KEYS.decks)).resolves.toBeUndefined()
    await expect(adapter.clear()).resolves.toBeUndefined()
  })
})
