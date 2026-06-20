import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLogStore } from '~/stores/log'

vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ append: vi.fn().mockResolvedValue(undefined) }),
}))

describe('logStore.add errorDimension', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })
  it('stores errorDimension on the new entry', async () => {
    const store = useLogStore()
    const entry = await store.add({
      ko: 'A',
      sentence: 's',
      feedback: 'hard',
      errorNote: null,
      errorDimension: 'register',
      reviewState: 'unreviewed',
      contextId: 'banmal',
      contextName: '반말',
    })
    expect(entry.errorDimension).toBe('register')
    expect(store.entries[0]!.errorDimension).toBe('register')
  })
})
