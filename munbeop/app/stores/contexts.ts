import { defineStore } from 'pinia'
import type { Context, LocalizedString } from '~/lib/domain'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'
import { DEFAULT_CONTEXTS } from '~/seed/contexts'

const storage = new LocalStorageAdapter()

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

  function hydrate() {
    custom.value = storage.read(STORAGE_KEYS.customContexts, [] as Context[])
    inactiveIds.value = storage.read(STORAGE_KEYS.inactiveContextIds, [] as string[])
  }

  function toggleActive(id: string) {
    if (inactiveIds.value.includes(id)) {
      inactiveIds.value = inactiveIds.value.filter((x) => x !== id)
    } else {
      inactiveIds.value = [...inactiveIds.value, id]
    }
    storage.write(STORAGE_KEYS.inactiveContextIds, inactiveIds.value)
  }

  function addCustom(name: string, scene: LocalizedString): Context | null {
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
    storage.write(STORAGE_KEYS.customContexts, custom.value)
    return ctx
  }

  return { custom, inactiveIds, all, active, byId, hydrate, toggleActive, addCustom }
})
