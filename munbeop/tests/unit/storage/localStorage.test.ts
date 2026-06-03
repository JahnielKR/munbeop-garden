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

  it('clear wipes known keys only', async () => {
    localStorage.setItem('unrelated', 'keep')
    await adapter.write(STORAGE_KEYS.grammar, ['a'])
    await adapter.clear()
    expect(await adapter.read(STORAGE_KEYS.grammar, null)).toBeNull()
    expect(localStorage.getItem('unrelated')).toBe('keep')
  })
})
