import { describe, it, expect, beforeEach } from 'vitest'
import { LocalStorageAdapter } from '~/lib/storage/localStorage'
import { STORAGE_KEYS } from '~/lib/storage/keys'

describe('LocalStorageAdapter (async)', () => {
  let adapter: LocalStorageAdapter

  beforeEach(() => {
    adapter = new LocalStorageAdapter()
  })

  it('returns fallback when missing', async () => {
    expect(await adapter.read(STORAGE_KEYS.grammar, [] as unknown[])).toEqual([])
  })

  it('round-trips values', async () => {
    const v = { a: 1, b: ['x', 'y'] }
    await adapter.write(STORAGE_KEYS.grammar, v)
    expect(await adapter.read(STORAGE_KEYS.grammar, null)).toEqual(v)
  })

  it('returns fallback on malformed JSON', async () => {
    localStorage.setItem(STORAGE_KEYS.grammar, '{ not valid')
    expect(await adapter.read(STORAGE_KEYS.grammar, 'fb')).toBe('fb')
  })

  it('remove deletes', async () => {
    await adapter.write(STORAGE_KEYS.log, [1, 2, 3])
    await adapter.remove(STORAGE_KEYS.log)
    expect(await adapter.read(STORAGE_KEYS.log, null)).toBeNull()
  })

  it('append adds one item to the stored collection', async () => {
    await adapter.append(STORAGE_KEYS.log, { id: 1 })
    await adapter.append(STORAGE_KEYS.log, { id: 2 })
    expect(await adapter.read(STORAGE_KEYS.log, [])).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('upsertOne inserts and overwrites a keyed entry in the stored map', async () => {
    await adapter.upsertOne(STORAGE_KEYS.srs, { id: 'A', value: 1 })
    await adapter.upsertOne(STORAGE_KEYS.srs, { id: 'B', value: 2 })
    await adapter.upsertOne(STORAGE_KEYS.srs, { id: 'A', value: 9 })
    expect(await adapter.read(STORAGE_KEYS.srs, {})).toEqual({ A: 9, B: 2 })
  })

  it('clear wipes known keys only', async () => {
    localStorage.setItem('unrelated', 'keep')
    await adapter.write(STORAGE_KEYS.grammar, ['a'])
    await adapter.clear()
    expect(await adapter.read(STORAGE_KEYS.grammar, null)).toBeNull()
    expect(localStorage.getItem('unrelated')).toBe('keep')
  })
})
