/**
 * vue-i18n runtime options (@nuxtjs/i18n v9 picks this file up from the
 * i18n/ dir by convention).
 *
 * fallbackLocale: keys missing from a locale render the English string
 * instead of the raw key path — the contract the garden feature relies on
 * (garden.* only ships in en/es until the other six locales are
 * translated; same for nav.sidebar_*).
 */
export default defineI18nConfig(() => ({
  fallbackLocale: 'en',
}))
