import { defineStore } from 'pinia'
import type { Context, LocalizedString } from '~/lib/domain'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'
import { DEFAULT_CONTEXTS } from '~/seed/contexts'

interface ContextsState {
  custom: Context[]
  inactiveIds: Set<string>
}

const storage = new LocalStorageAdapter()

export const useContextsStore = defineStore('contexts', {
  state: (): ContextsState => ({
    custom: [],
    inactiveIds: new Set(),
  }),
  getters: {
    all(state): Context[] {
      return [...DEFAULT_CONTEXTS, ...state.custom]
    },
    active(state): Context[] {
      return [...DEFAULT_CONTEXTS, ...state.custom].filter((c) => !state.inactiveIds.has(c.id))
    },
    byId() {
      return (id: string) => this.all.find((c) => c.id === id)
    },
  },
  actions: {
    hydrate() {
      this.custom = storage.read(STORAGE_KEYS.customContexts, [] as Context[])
      const inactive = storage.read(STORAGE_KEYS.inactiveContextIds, [] as string[])
      this.inactiveIds = new Set(inactive)
    },
    toggleActive(id: string) {
      if (this.inactiveIds.has(id)) {
        this.inactiveIds.delete(id)
      } else {
        this.inactiveIds.add(id)
      }
      storage.write(STORAGE_KEYS.inactiveContextIds, [...this.inactiveIds])
    },
    addCustom(name: string, scene: LocalizedString): Context | null {
      const exists = this.all.some((c) => c.name === name)
      if (exists) return null
      const ctx: Context = {
        id: `custom_${Date.now()}`,
        name,
        scene,
        category: 'custom',
        builtin: false,
      }
      this.custom.push(ctx)
      storage.write(STORAGE_KEYS.customContexts, this.custom)
      return ctx
    },
  },
})
