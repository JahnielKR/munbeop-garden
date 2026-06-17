import { watch, type WatchSource, type WatchStopHandle } from 'vue'

/**
 * Keep the @nuxtjs/i18n runtime locale in lockstep with the locale store.
 *
 * The locale store (and the settings store that drives it on cloud-hydrate)
 * only update `localeStore.current` + localStorage — they cannot call i18n's
 * setLocale(), which must run inside a component setup() (see default.vue's
 * note about the v9 `SyntaxError: 26` when i18n is touched too early).
 *
 * This bridge, mounted once in the layout, watches the store value and applies
 * ANY change to i18n — not just the one at mount. That closes the stale-locale
 * gap: when a different account's locale arrives via settings.hydrate() on
 * SIGNED_IN (while the layout is already mounted), the visible UI follows. The
 * guard skips redundant setLocale calls when the runtime locale already matches.
 *
 * @param source  getter for the desired locale (e.g. `() => localeStore.current`)
 * @param current the live i18n `locale` ref (read-only here, for the guard)
 * @param setLocale the i18n `setLocale` action from useI18n()
 * @returns the watch stop handle (for teardown / tests)
 */
export function syncLocaleToI18n<T extends string>(
  source: WatchSource<T>,
  current: { readonly value: T },
  setLocale: (code: T) => unknown,
): WatchStopHandle {
  return watch(
    source,
    (next) => {
      if (current.value !== next) void setLocale(next)
    },
    { immediate: true },
  )
}
