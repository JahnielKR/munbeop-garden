import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useContextsStore, MIN_ACTIVE_CONTEXTS } from '~/stores/contexts'

// Store actions call useStorageAdapter() -> useNuxtApp(); with no client the
// facade returns the Noop adapter (writes dropped), which is all we need to
// exercise the in-memory guard logic.
vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

describe('useContextsStore — toggleActive guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('exposes MIN_ACTIVE_CONTEXTS = 3', () => {
    expect(MIN_ACTIVE_CONTEXTS).toBe(3)
  })

  it('deactivates while above the minimum and returns true', async () => {
    const store = useContextsStore()
    const start = store.active.length // 8 built-ins
    const ok = await store.toggleActive('banmal')
    expect(ok).toBe(true)
    expect(store.active.length).toBe(start - 1)
  })

  it('refuses to drop below the minimum and returns false', async () => {
    const store = useContextsStore()
    // 8 built-ins → deactivate 5 to reach exactly 3 active.
    const ids = store.all.map((c) => c.id)
    for (const id of ids.slice(0, 5)) await store.toggleActive(id)
    expect(store.active.length).toBe(3)
    const refused = await store.toggleActive(ids[5]!) // would make it 2
    expect(refused).toBe(false)
    expect(store.active.length).toBe(3)
  })

  it('always allows re-activating an inactive context', async () => {
    const store = useContextsStore()
    const ids = store.all.map((c) => c.id)
    for (const id of ids.slice(0, 5)) await store.toggleActive(id)
    expect(store.active.length).toBe(3)
    const reactivated = await store.toggleActive(ids[0]!) // turn one back on
    expect(reactivated).toBe(true)
    expect(store.active.length).toBe(4)
  })
})
