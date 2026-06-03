import { ref, readonly } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'mungarden:theme'

// Module-level singleton — all callers share the same reactive ref
const theme = ref<Theme>('light')
let hydrated = false

/**
 * useTheme — light/dark theme state management.
 *
 * Storage: localStorage, key 'mungarden:theme'. Per-device preference
 * (same pattern as locale — NOT synced to Supabase).
 *
 * Activation: writes to `document.documentElement.dataset.theme`. CSS
 * already declared in tokens/colors-dark.css under [data-theme="dark"]
 * handles the visual switch.
 *
 * FOUC mitigation: an inline <script> in app.vue head reads localStorage
 * and sets dataset.theme BEFORE Vue mounts. This composable then
 * synchronises the in-memory ref to that pre-set value.
 */
export function useTheme() {
  function setTheme(next: Theme) {
    theme.value = next
    if (typeof document !== 'undefined') {
      if (next === 'dark') {
        document.documentElement.dataset.theme = 'dark'
      } else {
        delete document.documentElement.dataset.theme
      }
    }
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
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === 'dark' || stored === 'light') {
        theme.value = stored
      }
    } catch {
      // ignore
    }
  }

  return {
    theme: readonly(theme),
    setTheme,
    hydrate,
  }
}
