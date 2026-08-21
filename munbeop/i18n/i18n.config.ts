/**
 * vue-i18n runtime options (@nuxtjs/i18n picks this file up from the
 * i18n/ dir by convention).
 *
 * fallbackLocale: keys missing from a locale render the English string
 * instead of the raw key path. All eight locales are kept structurally
 * complete; English remains the defensive fallback for a future missing key
 * or a locale chunk that cannot be loaded.
 */
export default defineI18nConfig(() => ({
  fallbackLocale: 'en',
}))
