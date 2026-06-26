import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn(async () => ({})), upsertOne: vi.fn(), write: vi.fn(), append: vi.fn(), remove: vi.fn(), clear: vi.fn() }),
}))

import { useSrsStore } from '~/stores/srs'

describe('useSrsStore.peek', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('returns a seedling default WITHOUT creating a row', () => {
    const srs = useSrsStore()
    const state = srs.peek('없는거')
    expect(state.mastery).toBe('seedling')
    expect(srs.map['없는거']).toBeUndefined() // <-- the bug guard: no mutation
  })

  it('returns the existing row when present', () => {
    const srs = useSrsStore()
    srs.ensure('있는거').mastery = 'tree'
    expect(srs.peek('있는거').mastery).toBe('tree')
  })
})
