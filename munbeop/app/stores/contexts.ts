import { defineStore } from 'pinia'
import type { Context, LocalizedString } from '~/lib/domain'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { DEFAULT_CONTEXTS } from '~/seed/contexts'
import { useAuthStore } from '~/stores/auth'

/** Practice needs at least this many active contexts. */
export const MIN_ACTIVE_CONTEXTS = 3

export const useContextsStore = defineStore('contexts', () => {
  const custom = ref<Context[]>([])
  const inactiveIds = ref<string[]>([])
  const authStore = useAuthStore()
  let mutationTail: Promise<void> = Promise.resolve()
  let hydratedUserId: string | null = null

  function enqueueMutation<T>(run: () => Promise<T>): Promise<T> {
    const job = mutationTail.then(run)
    mutationTail = job.then(() => undefined, () => undefined)
    return job
  }

  function safeToMutate(): boolean {
    const userId = authStore.user?.id
    return !userId || hydratedUserId === userId
  }

  function assertSafeToMutate(): void {
    if (!safeToMutate()) throw new Error('Context data is unavailable until account data loads')
  }

  const all = computed<Context[]>(() => [...DEFAULT_CONTEXTS, ...custom.value])
  const active = computed<Context[]>(() =>
    all.value.filter((context) => !inactiveIds.value.includes(context.id)),
  )

  function byId(id: string): Context | undefined {
    return all.value.find((context) => context.id === id)
  }

  function hydrate(): Promise<void> {
    return enqueueMutation(async () => {
      const userId = authStore.user?.id ?? null
      const storage = useStorageAdapter()
      const nextCustom = await storage.read(STORAGE_KEYS.customContexts, [] as Context[])
      const nextInactive = await storage.read(STORAGE_KEYS.inactiveContextIds, [] as string[])
      if ((authStore.user?.id ?? null) !== userId) return
      custom.value = nextCustom
      inactiveIds.value = nextInactive
      hydratedUserId = userId
    })
  }

  function toggleActive(id: string): Promise<boolean> {
    return enqueueMutation(async () => {
      assertSafeToMutate()
      const isInactive = inactiveIds.value.includes(id)
      if (!isInactive && active.value.length <= MIN_ACTIVE_CONTEXTS) return false
      const snapshot = inactiveIds.value
      inactiveIds.value = isInactive
        ? inactiveIds.value.filter((candidate) => candidate !== id)
        : [...inactiveIds.value, id]
      try {
        const storage = useStorageAdapter()
        await storage.write(STORAGE_KEYS.inactiveContextIds, inactiveIds.value)
      } catch (error) {
        inactiveIds.value = snapshot
        throw error
      }
      return true
    })
  }

  function addCustom(name: string, scene: LocalizedString): Promise<Context | null> {
    return enqueueMutation(async () => {
      assertSafeToMutate()
      if (all.value.some((context) => context.name === name)) return null
      const context: Context = {
        id: `custom_${crypto.randomUUID()}`,
        name,
        scene,
        category: 'custom',
        builtin: false,
      }
      const snapshot = custom.value
      custom.value = [...custom.value, context]
      try {
        const storage = useStorageAdapter()
        await storage.write(STORAGE_KEYS.customContexts, custom.value)
      } catch (error) {
        custom.value = snapshot
        throw error
      }
      return context
    })
  }

  function removeCustom(id: string): Promise<boolean> {
    return enqueueMutation(async () => {
      assertSafeToMutate()
      const target = custom.value.find((context) => context.id === id)
      if (!target) return false
      const isActive = !inactiveIds.value.includes(id)
      if (isActive && active.value.length <= MIN_ACTIVE_CONTEXTS) return false

      const customSnapshot = custom.value
      const inactiveSnapshot = inactiveIds.value
      const wasInactive = inactiveIds.value.includes(id)
      custom.value = custom.value.filter((context) => context.id !== id)
      if (wasInactive) {
        inactiveIds.value = inactiveIds.value.filter((candidate) => candidate !== id)
      }
      const storage = useStorageAdapter()
      try {
        // The custom-context blob is the commit point. Write it first: if the
        // optional inactive-id cleanup later fails, only an invisible orphan id
        // remains; the deleted context itself cannot reappear on reload.
        await storage.write(STORAGE_KEYS.customContexts, custom.value)
      } catch (error) {
        custom.value = customSnapshot
        inactiveIds.value = inactiveSnapshot
        throw error
      }
      if (wasInactive) {
        try {
          await storage.write(STORAGE_KEYS.inactiveContextIds, inactiveIds.value)
        } catch (error) {
          // Deletion already committed. Keeping a stale inactive id is harmless
          // and preferable to reporting failure after the context is gone.
          console.error('contexts: inactive-id cleanup failed', error)
        }
      }
      return true
    })
  }

  return { custom, inactiveIds, all, active, byId, hydrate, toggleActive, addCustom, removeCustom }
})
