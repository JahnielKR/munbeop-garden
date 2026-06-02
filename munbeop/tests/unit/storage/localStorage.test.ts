import { describe, it, expect, beforeEach } from 'vitest'
import { LocalStorageAdapter } from '~/lib/storage/localStorage'
import { STORAGE_KEYS } from '~/lib/storage/keys'

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter

  beforeEach(() => {
    adapter = new LocalStorageAdapter()
  })

  it('returns fallback when missing', () => {
    expect(adapter.read(STORAGE_KEYS.grammar, [] as unknown[])).toEqual([])
  })

  it('round-trips values', () => {
    const v = { a: 1, b: ['x', 'y'] }
    adapter.write(STORAGE_KEYS.grammar, v)
    expect(adapter.read(STORAGE_KEYS.grammar, null)).toEqual(v)
  })

  it('returns fallback on malformed JSON', () => {
    localStorage.setItem(STORAGE_KEYS.grammar, '{ not valid')
    expect(adapter.read(STORAGE_KEYS.grammar, 'fb')).toBe('fb')
  })

  it('remove deletes', () => {
    adapter.write(STORAGE_KEYS.log, [1, 2, 3])
    adapter.remove(STORAGE_KEYS.log)
    expect(adapter.read(STORAGE_KEYS.log, null)).toBeNull()
  })

  it('clear wipes known keys only', () => {
    localStorage.setItem('unrelated', 'keep')
    adapter.write(STORAGE_KEYS.grammar, ['a'])
    adapter.clear()
    expect(adapter.read(STORAGE_KEYS.grammar, null)).toBeNull()
    expect(localStorage.getItem('unrelated')).toBe('keep')
  })
})
