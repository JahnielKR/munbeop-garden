import { defineStore } from 'pinia'
import type { Context, LocalizedString } from '~/lib/domain'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { DEFAULT_CONTEXTS } from '~/seed/contexts'

/** Practice needs at least this many active contexts (see usePractice.ts). */
export const MIN_ACTIVE_CONTEXTS = 3

export const useContextsStore = defineStore('contexts', () => {
  const custom = ref<Context[]>([])
  // Plain array (not Set) — see grammar.ts excludedDeckIds for the same reason.
  const inactiveIds = ref<string[]>([])

  const all = computed<Context[]>(() => [...DEFAULT_CONTEXTS, ...custom.value])
  const active = computed<Context[]>(() =>
    all.value.filter((c) => !inactiveIds.value.includes(c.id)),
  )

  function byId(id: string): Context | undefined {
    return all.value.find((c) => c.id === id)
  }

  async function hydrate() {
    const storage = useStorageAdapter()
    custom.value = await storage.read(STORAGE_KEYS.customContexts, [] as Context[])
    inactiveIds.value = await storage.read(STORAGE_KEYS.inactiveContextIds, [] as string[])
  }

  async function toggleActive(id: string): Promise<boolean> {
    const storage = useStorageAdapter()
    const isInactive = inactiveIds.value.includes(id)
    // Re-activating is always allowed. Deactivating is blocked when it would
    // drop the active set below the practice minimum.
    if (!isInactive && active.value.length <= MIN_ACTIVE_CONTEXTS) {
      return false
    }
    // Optimistic mutate, then persist. Snapshot first so a failed cloud write
    // rolls back the in-memory state instead of leaving the UI out of sync.
    const snapshot = inactiveIds.value
    inactiveIds.value = isInactive
      ? inactiveIds.value.filter((x) => x !== id)
      : [...inactiveIds.value, id]
    try {
      await storage.write(STORAGE_KEYS.inactiveContextIds, inactiveIds.value)
    } catch {
      inactiveIds.value = snapshot
      return false
    }
    return true
  }

  async function addCustom(name: string, scene: LocalizedString): Promise<Context | null> {
    const storage = useStorageAdapter()
    const exists = all.value.some((c) => c.name === name)
    if (exists) return null
    const ctx: Context = {
      id: `custom_${Date.now()}`,
      name,
      scene,
      category: 'custom',
      builtin: false,
    }
    // Immutable add so `snapshot` stays a valid pre-mutation array for rollback.
    const snapshot = custom.value
    custom.value = [...custom.value, ctx]
    try {
      await storage.write(STORAGE_KEYS.customContexts, custom.value)
    } catch {
      custom.value = snapshot
      return null
    }
    return ctx
  }

  async function removeCustom(id: string): Promise<boolean> {
    const target = custom.value.find((c) => c.id === id)
    if (!target) return false // built-in or unknown id — not removable
    const isActive = !inactiveIds.value.includes(id)
    if (isActive && active.value.length <= MIN_ACTIVE_CONTEXTS) {
      return false // removing an active context can't drop us below the minimum
    }
    const storage = useStorageAdapter()
    const customSnap = custom.value
    const inactiveSnap = inactiveIds.value
    const wasInactive = inactiveIds.value.includes(id)
    custom.value = custom.value.filter((c) => c.id !== id)
    if (wasInactive) inactiveIds.value = inactiveIds.value.filter((x) => x !== id)
    try {
      if (wasInactive) await storage.write(STORAGE_KEYS.inactiveContextIds, inactiveIds.value)
      await storage.write(STORAGE_KEYS.customContexts, custom.value)
    } catch {
      custom.value = customSnap
      inactiveIds.value = inactiveSnap
      return false
    }
    return true
  }

  return { custom, inactiveIds, all, active, byId, hydrate, toggleActive, addCustom, removeCustom }
})
