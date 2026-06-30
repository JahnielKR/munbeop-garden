import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useContextsStore, MIN_ACTIVE_CONTEXTS } from '~/stores/contexts'
import type { LocalizedString } from '~/lib/domain'
import { LOCALE_CODES } from '~/lib/domain'

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
    // Deactivate down to exactly the minimum, then try to go one below.
    const ids = store.all.map((c) => c.id)
    const offCount = store.active.length - MIN_ACTIVE_CONTEXTS
    for (const id of ids.slice(0, offCount)) await store.toggleActive(id)
    expect(store.active.length).toBe(MIN_ACTIVE_CONTEXTS)
    const refused = await store.toggleActive(ids[offCount]!) // still active → would drop below min
    expect(refused).toBe(false)
    expect(store.active.length).toBe(MIN_ACTIVE_CONTEXTS)
  })

  it('always allows re-activating an inactive context', async () => {
    const store = useContextsStore()
    const ids = store.all.map((c) => c.id)
    const offCount = store.active.length - MIN_ACTIVE_CONTEXTS
    for (const id of ids.slice(0, offCount)) await store.toggleActive(id)
    expect(store.active.length).toBe(MIN_ACTIVE_CONTEXTS)
    const reactivated = await store.toggleActive(ids[0]!) // turn one back on
    expect(reactivated).toBe(true)
    expect(store.active.length).toBe(MIN_ACTIVE_CONTEXTS + 1)
  })
})

function scene(text: string): LocalizedString {
  return Object.fromEntries(LOCALE_CODES.map((c) => [c, text])) as LocalizedString
}

describe('useContextsStore — addCustom + removeCustom', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('addCustom creates a custom context and rejects duplicates', async () => {
    const store = useContextsStore()
    const created = await store.addCustom('우리집', scene('at home'))
    expect(created).not.toBeNull()
    expect(created!.category).toBe('custom')
    expect(created!.builtin).toBe(false)
    expect(created!.id.startsWith('custom_')).toBe(true)
    expect(store.all.some((c) => c.name === '우리집')).toBe(true)

    const dup = await store.addCustom('우리집', scene('again'))
    expect(dup).toBeNull()
  })

  it('removeCustom deletes a custom context and scrubs it from inactiveIds', async () => {
    const store = useContextsStore()
    const created = await store.addCustom('우리집', scene('at home'))
    await store.toggleActive(created!.id) // make it inactive first
    expect(store.inactiveIds).toContain(created!.id)

    const ok = await store.removeCustom(created!.id)
    expect(ok).toBe(true)
    expect(store.all.some((c) => c.id === created!.id)).toBe(false)
    expect(store.inactiveIds).not.toContain(created!.id)
  })

  it('removeCustom refuses for built-in ids', async () => {
    const store = useContextsStore()
    const ok = await store.removeCustom('banmal')
    expect(ok).toBe(false)
    expect(store.all.some((c) => c.id === 'banmal')).toBe(true)
  })

  it('removeCustom refuses when it would drop active below the minimum', async () => {
    const store = useContextsStore()
    const created = await store.addCustom('우리집', scene('at home')) // custom is active
    // Deactivate built-ins down to exactly the minimum (the custom stays active).
    const ids = store.all.map((c) => c.id).filter((id) => id !== created!.id)
    const offCount = store.active.length - MIN_ACTIVE_CONTEXTS
    for (const id of ids.slice(0, offCount)) await store.toggleActive(id)
    expect(store.active.length).toBe(MIN_ACTIVE_CONTEXTS)
    const refused = await store.removeCustom(created!.id) // custom is active → would drop below min
    expect(refused).toBe(false)
    expect(store.all.some((c) => c.id === created!.id)).toBe(true)
  })
})
