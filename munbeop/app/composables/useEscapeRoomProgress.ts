import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useAuthStore } from '~/stores/auth'
import { useEscapeRoomStore } from '~/stores/escape-room'

/**
 * useEscapeRoomProgress — the persistence layer the escape-room store points to
 * with "the persistence layer (consecutive clean runs, unlocked cosmetics) is
 * wired separately by a composable that hydrates on mount and writes on
 * mutations".
 *
 * The store itself is a pure state machine (no storage I/O). This composable
 * is the missing half: it reads/writes the player's cross-run progress
 * (`unlockedCosmetics` + `consecutiveCleanRuns`) through the same
 * `useStorageAdapter()` every other store uses — Supabase when signed in, the
 * noop adapter when signed out. That's why the sidebar profile (usePremios →
 * AccountMenu / Premios / the /trophies page) showed an empty trophy case: the
 * unlocks lived only in memory and never came back after a reload.
 *
 * - hydrate(): pull the cloud blob into the store. Reading through the noop
 *   adapter (signed out) returns the fallback, which clears the previous
 *   user's premios — same load-bearing behaviour the data stores rely on.
 * - persist(): write the store's current progress back, on run end.
 *
 * Mirrors the useSettings() shape (hydrate + a cloud write, both wrapped so a
 * not-yet-deployed table or a network blip never breaks gameplay).
 */
interface EscapeRoomProgress {
  unlockedCosmetics: string[]
  consecutiveCleanRuns: number
  /** Chosen cosmetic per type ('avatar'|'frame'|'bg'|'set') → reward id. */
  equipped: Record<string, string>
}

export function useEscapeRoomProgress() {
  const store = useEscapeRoomStore()
  const authStore = useAuthStore()

  async function hydrate(): Promise<void> {
    try {
      const storage = useStorageAdapter()
      const cloud = await storage.read<Partial<EscapeRoomProgress> | null>(
        STORAGE_KEYS.escapeRoom,
        null,
      )
      const unlocked = cloud?.unlockedCosmetics
      const racha = cloud?.consecutiveCleanRuns
      const eq = cloud?.equipped
      store.unlockedCosmetics = Array.isArray(unlocked)
        ? unlocked.filter((id): id is string => typeof id === 'string')
        : []
      store.consecutiveCleanRuns =
        typeof racha === 'number' && Number.isFinite(racha) && racha >= 0 ? Math.floor(racha) : 0
      store.equipped =
        eq && typeof eq === 'object' && !Array.isArray(eq)
          ? Object.fromEntries(
              Object.entries(eq).filter(
                ([type, id]) => typeof type === 'string' && typeof id === 'string',
              ),
            )
          : {}
    } catch {
      // Table not deployed yet or a network blip — keep whatever's in memory.
      // (A transient read error must NOT wipe progress earned this session.)
    }
  }

  async function persist(): Promise<void> {
    if (!authStore.user) return
    try {
      const storage = useStorageAdapter()
      await storage.write(STORAGE_KEYS.escapeRoom, {
        unlockedCosmetics: store.unlockedCosmetics,
        consecutiveCleanRuns: store.consecutiveCleanRuns,
        equipped: store.equipped,
      } satisfies EscapeRoomProgress)
    } catch {
      // A failed cloud write must never throw into the gameplay UI.
    }
  }

  return { hydrate, persist }
}
