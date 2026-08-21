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

  it('append is idempotent when a retry reuses an item id', async () => {
    await adapter.append(STORAGE_KEYS.log, { id: 1, state: 'old' })
    await adapter.append(STORAGE_KEYS.log, { id: 1, state: 'confirmed' })
    expect(await adapter.read(STORAGE_KEYS.log, [])).toEqual([{ id: 1, state: 'confirmed' }])
  })

  it('upsertOne inserts and overwrites a keyed entry in the stored map', async () => {
    await adapter.upsertOne(STORAGE_KEYS.srs, { id: 'A', value: 1 })
    await adapter.upsertOne(STORAGE_KEYS.srs, { id: 'B', value: 2 })
    await adapter.upsertOne(STORAGE_KEYS.srs, { id: 'A', value: 9 })
    expect(await adapter.read(STORAGE_KEYS.srs, {})).toEqual({ A: 9, B: 2 })
  })

  it('increment adds a delta to an activity counter', async () => {
    await expect(adapter.increment(STORAGE_KEYS.activity, '2026-08-21')).resolves.toBe(1)
    await expect(adapter.increment(STORAGE_KEYS.activity, '2026-08-21', 2)).resolves.toBe(3)
    expect(await adapter.read(STORAGE_KEYS.activity, {})).toEqual({
      '2026-08-21': { count: 3 },
    })
  })

  it('restore applies all supplied values and clears null keys', async () => {
    await adapter.write(STORAGE_KEYS.log, [{ id: 1 }])
    await adapter.restore({
      [STORAGE_KEYS.log]: null,
      [STORAGE_KEYS.srs]: { A: { easyCount: 2 } },
    })
    expect(await adapter.read(STORAGE_KEYS.log, null)).toBeNull()
    expect(await adapter.read(STORAGE_KEYS.srs, {})).toEqual({ A: { easyCount: 2 } })
  })

  it('updateOne replaces only an existing collection row and never inserts a missing id', async () => {
    await adapter.write(STORAGE_KEYS.log, [{ id: 1, state: 'old' }, { id: 2, state: 'keep' }])
    await expect(
      adapter.updateOne(STORAGE_KEYS.log, { id: 1, value: { id: 1, state: 'new' } }),
    ).resolves.toBe(true)
    await expect(
      adapter.updateOne(STORAGE_KEYS.log, { id: 3, value: { id: 3, state: 'ghost' } }),
    ).resolves.toBe(false)
    expect(await adapter.read(STORAGE_KEYS.log, [])).toEqual([
      { id: 1, state: 'new' },
      { id: 2, state: 'keep' },
    ])
  })

  it('clear wipes known keys only', async () => {
    localStorage.setItem('unrelated', 'keep')
    await adapter.write(STORAGE_KEYS.grammar, ['a'])
    await adapter.clear()
    expect(await adapter.read(STORAGE_KEYS.grammar, null)).toBeNull()
    expect(localStorage.getItem('unrelated')).toBe('keep')
  })
})
