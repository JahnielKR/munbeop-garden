import { computed, ref, type Ref } from 'vue'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useAuthStore } from '~/stores/auth'
import { useEscapeRoomStore } from '~/stores/escape-room'
import type { PracticeSaveStatus } from '~/lib/practice/persistence'

interface EscapeRoomProgress {
  unlockedCosmetics: string[]
  consecutiveCleanRuns: number
  /** Chosen cosmetic per type ('avatar'|'frame'|'bg'|'set') -> reward id. */
  equipped: Record<string, string>
}

interface EscapePersistenceState {
  tail: Promise<void>
  hydratedUserId: string | null
  hydrationPending: number
  saveStatus: Ref<PracticeSaveStatus>
  pending: PendingEscapeWrite | null
}

interface PendingEscapeWrite {
  userId: string
  snapshot: EscapeRoomProgress
}

// The layout, game and trophy page each instantiate this composable. Keying the
// coordinator by their shared Pinia store keeps readiness and write order truly
// app-scoped instead of local to one caller.
const persistenceByStore = new WeakMap<object, EscapePersistenceState>()

function persistenceState(store: object): EscapePersistenceState {
  const existing = persistenceByStore.get(store)
  if (existing) return existing
  const created: EscapePersistenceState = {
    tail: Promise.resolve(),
    hydratedUserId: null,
    hydrationPending: 0,
    saveStatus: ref('idle'),
    pending: null,
  }
  persistenceByStore.set(store, created)
  return created
}

function enqueue<T>(state: EscapePersistenceState, run: () => Promise<T>): Promise<T> {
  const job = state.tail.then(run)
  state.tail = job.then(() => undefined, () => undefined)
  return job
}

/** Account-scoped persistence for escape-room unlocks and equipped rewards. */
export function useEscapeRoomProgress() {
  const store = useEscapeRoomStore()
  const authStore = useAuthStore()
  const state = persistenceState(store)

  function snapshot(): EscapeRoomProgress {
    return {
      unlockedCosmetics: [...store.unlockedCosmetics],
      consecutiveCleanRuns: store.consecutiveCleanRuns,
      equipped: { ...store.equipped },
    }
  }

  function applySnapshot(value: EscapeRoomProgress): void {
    store.unlockedCosmetics = [...value.unlockedCosmetics]
    store.consecutiveCleanRuns = value.consecutiveCleanRuns
    store.equipped = { ...value.equipped }
  }

  function hydrate(): Promise<void> {
    const userId = authStore.user?.id ?? null
    if (state.hydratedUserId !== userId) state.hydratedUserId = null
    if (state.pending && state.pending.userId !== userId) {
      state.pending = null
      state.saveStatus.value = 'idle'
    }
    state.hydrationPending += 1
    return enqueue(state, async () => {
      try {
        if ((authStore.user?.id ?? null) !== userId) return
        const storage = useStorageAdapter()
        const cloud = await storage.read<Partial<EscapeRoomProgress> | null>(
          STORAGE_KEYS.escapeRoom,
          null,
        )
        // Never apply account A's delayed response after account B signed in.
        if ((authStore.user?.id ?? null) !== userId) return

        const unlocked = cloud?.unlockedCosmetics
        const cleanRuns = cloud?.consecutiveCleanRuns
        const equipped = cloud?.equipped
        store.unlockedCosmetics = Array.isArray(unlocked)
          ? unlocked.filter((id): id is string => typeof id === 'string')
          : []
        store.consecutiveCleanRuns =
          typeof cleanRuns === 'number' && Number.isFinite(cleanRuns) && cleanRuns >= 0
            ? Math.floor(cleanRuns)
            : 0
        store.equipped =
          equipped && typeof equipped === 'object' && !Array.isArray(equipped)
            ? Object.fromEntries(
                Object.entries(equipped).filter(
                  ([type, id]) => typeof type === 'string' && typeof id === 'string',
                ),
              )
            : {}
        state.hydratedUserId = userId
      } finally {
        state.hydrationPending -= 1
      }
    })
  }

  async function commitPending(pending: PendingEscapeWrite): Promise<boolean> {
    const { userId, snapshot: value } = pending
    if (authStore.user?.id !== userId || state.hydratedUserId !== userId) {
      if (authStore.user?.id === userId && state.pending === pending) {
        state.saveStatus.value = 'error'
      }
      return false
    }
    state.saveStatus.value = 'saving'
    try {
      const storage = useStorageAdapter()
      await storage.write(STORAGE_KEYS.escapeRoom, value)
    } catch {
      if (authStore.user?.id === userId && state.pending === pending) {
        state.saveStatus.value = 'error'
      }
      return false
    }
    if (authStore.user?.id !== userId || state.hydratedUserId !== userId) return false
    // Only the newest captured state becomes authoritative. When another write
    // is already queued, leave the live (newer) store untouched until it lands.
    if (state.pending === pending) {
      applySnapshot(value)
      state.pending = null
      state.saveStatus.value = 'saved'
    }
    return true
  }

  function persist(): Promise<boolean> {
    const userId = authStore.user?.id
    if (!userId) return Promise.resolve(false)
    // Capture at invocation time and enqueue even while hydration is pending.
    // The shared FIFO makes the authoritative read finish first; the captured
    // user action is then saved instead of being silently discarded.
    const pending: PendingEscapeWrite = { userId, snapshot: snapshot() }
    state.pending = pending
    state.saveStatus.value = 'saving'
    return enqueue(state, () => commitPending(pending))
  }

  function retrySave(): Promise<boolean> {
    const pending = state.pending
    if (!pending) return Promise.resolve(true)
    state.saveStatus.value = 'saving'
    return enqueue(state, () => commitPending(pending))
  }

  const saveBlocked = computed(
    () => state.saveStatus.value === 'saving' || state.saveStatus.value === 'error',
  )

  return { hydrate, persist, retrySave, saveStatus: state.saveStatus, saveBlocked }
}
