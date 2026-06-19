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

  it('append drops the item silently like write', async () => {
    const adapter = new NoopStorageAdapter()
    await expect(adapter.append(STORAGE_KEYS.log, { id: 1 })).resolves.toBeUndefined()
    await expect(adapter.read(STORAGE_KEYS.log, [])).resolves.toEqual([])
  })

  it('upsertOne drops the entry silently like write', async () => {
    const adapter = new NoopStorageAdapter()
    await expect(adapter.upsertOne(STORAGE_KEYS.srs, { id: 'A', value: { n: 1 } })).resolves.toBeUndefined()
    await expect(adapter.read(STORAGE_KEYS.srs, {})).resolves.toEqual({})
  })
})
