import { ref, computed, readonly } from 'vue'

/** What the user picked. `system` follows the OS `prefers-color-scheme`. */
export type Theme = 'light' | 'dark' | 'system'
/** What actually paints — `system` is always resolved to one of these. */
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'mungarden:theme'

// Module-level singletons — all callers share the same reactive state.
const theme = ref<Theme>('light')
const systemDark = ref(false)
let mql: MediaQueryList | null = null
let onSystemChange: ((e: { matches: boolean }) => void) | null = null
let hydrated = false

/** The painted theme: the preference, with `system` collapsed to the OS value. */
const resolved = computed<ResolvedTheme>(() =>
  theme.value === 'system' ? (systemDark.value ? 'dark' : 'light') : theme.value,
)

function applyToDom() {
  if (typeof document === 'undefined') return
  if (resolved.value === 'dark') document.documentElement.dataset.theme = 'dark'
  else delete document.documentElement.dataset.theme
}

/**
 * Subscribe to the OS dark-mode query once, so `system` mode follows a live
 * change (the user flips their OS theme while the app is open). Idempotent.
 */
function ensureSystemListener() {
  if (mql || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
  mql = window.matchMedia('(prefers-color-scheme: dark)')
  systemDark.value = mql.matches
  onSystemChange = (e) => {
    systemDark.value = e.matches
    if (theme.value === 'system') applyToDom()
  }
  mql.addEventListener?.('change', onSystemChange as (e: MediaQueryListEvent) => void)
}

/**
 * useTheme — theme preference (light/dark/system) + the resolved theme.
 *
 * Storage: localStorage 'mungarden:theme' (per-device); the settings store
 * additionally mirrors the preference into the synced prefs blob. Activation:
 * writes `document.documentElement.dataset.theme`. An inline <script> in
 * app.vue's head resolves the same value (incl. `system`) before Vue mounts to
 * avoid FOUC; this composable then syncs the ref to that pre-painted value.
 */
export function useTheme() {
  function setTheme(next: Theme) {
    ensureSystemListener()
    theme.value = next
    if (mql) systemDark.value = mql.matches
    applyToDom()
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // localStorage might be unavailable (private browsing, etc.) — fail silently
      }
    }
  }

  function hydrate() {
    if (hydrated) return
    hydrated = true
    ensureSystemListener()
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === 'dark' || stored === 'light' || stored === 'system') theme.value = stored
    } catch {
      // ignore
    }
    applyToDom()
  }

  return {
    theme: readonly(theme),
    resolved: readonly(resolved),
    setTheme,
    hydrate,
  }
}

// Test-only: clear module singletons (and the OS listener) between cases.
export function _resetThemeForTest() {
  if (mql && onSystemChange) {
    mql.removeEventListener?.('change', onSystemChange as (e: MediaQueryListEvent) => void)
  }
  mql = null
  onSystemChange = null
  theme.value = 'light'
  systemDark.value = false
  hydrated = false
}
