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
    if (isInactive) {
      inactiveIds.value = inactiveIds.value.filter((x) => x !== id)
    } else {
      inactiveIds.value = [...inactiveIds.value, id]
    }
    await storage.write(STORAGE_KEYS.inactiveContextIds, inactiveIds.value)
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
    custom.value.push(ctx)
    await storage.write(STORAGE_KEYS.customContexts, custom.value)
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
    custom.value = custom.value.filter((c) => c.id !== id)
    if (inactiveIds.value.includes(id)) {
      inactiveIds.value = inactiveIds.value.filter((x) => x !== id)
      await storage.write(STORAGE_KEYS.inactiveContextIds, inactiveIds.value)
    }
    await storage.write(STORAGE_KEYS.customContexts, custom.value)
    return true
  }

  return { custom, inactiveIds, all, active, byId, hydrate, toggleActive, addCustom, removeCustom }
})
