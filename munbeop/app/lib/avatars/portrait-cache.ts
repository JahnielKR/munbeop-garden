/**
 * Device-local cache of the chosen profile avatar, mirrored from the synced
 * settings blob. The cloud blob (Supabase) stays the source of truth; this
 * exists only to paint the right portrait on a COLD load before that async read
 * resolves — the same FOUC-avoidance trick useTheme()/useLocaleStore() use for
 * the theme and locale. Without it the sidebar portrait blinks to the email
 * initial ("A" on the accent chip) for the length of the cloud round-trip every
 * time the tab is reloaded (e.g. leaving for another site and coming back).
 *
 * Per-device (not per-account) by design: it is cleared on sign-out, so it only
 * ever holds the currently-signed-in user. A hard reload restores that very
 * Supabase session, so the cache always matches the account about to hydrate.
 */
const KEY = 'mungarden:portrait'

export interface PortraitCache {
  chosenAvatarId: string | null
  unlockedAvatarIds: string[]
}

/** Read + sanitise the cached portrait, or null if absent/unreadable. */
export function readPortraitCache(): PortraitCache | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PortraitCache>
    return {
      chosenAvatarId: typeof parsed.chosenAvatarId === 'string' ? parsed.chosenAvatarId : null,
      unlockedAvatarIds: Array.isArray(parsed.unlockedAvatarIds)
        ? parsed.unlockedAvatarIds.filter((x): x is string => typeof x === 'string')
        : [],
    }
  } catch {
    return null
  }
}

export function writePortraitCache(value: PortraitCache): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    // localStorage unavailable (private browsing, quota) — the cloud blob still
    // loads; we just forgo the first-paint head start.
  }
}

export function clearPortraitCache(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
