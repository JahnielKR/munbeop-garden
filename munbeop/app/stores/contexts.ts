import { defineStore } from 'pinia'
import type { Context, LocalizedString } from '~/lib/domain'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'
import { DEFAULT_CONTEXTS } from '~/seed/contexts'

const storage = new LocalStorageAdapter()

export const useContextsStore = defineStore('contexts', () => {
  const custom = ref<Context[]>([])
  const inactiveIds = ref<Set<string>>(new Set())

  const all = computed<Context[]>(() => [...DEFAULT_CONTEXTS, ...custom.value])
  const active = computed<Context[]>(() =>
    all.value.filter((c) => !inactiveIds.value.has(c.id)),
  )

  function byId(id: string): Context | undefined {
    return all.value.find((c) => c.id === id)
  }

  function hydrate() {
    custom.value = storage.read(STORAGE_KEYS.customContexts, [] as Context[])
    const inactive = storage.read(STORAGE_KEYS.inactiveContextIds, [] as string[])
    inactiveIds.value = new Set(inactive)
  }

  function toggleActive(id: string) {
    const newSet = new Set(inactiveIds.value)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    inactiveIds.value = newSet
    storage.write(STORAGE_KEYS.inactiveContextIds, [...newSet])
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
