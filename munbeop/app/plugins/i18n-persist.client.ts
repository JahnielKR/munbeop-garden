import { useLocaleStore } from '~/stores/locale'
import type { LocaleCode } from '~/lib/domain'

export default defineNuxtPlugin(() => {
  const localeStore = useLocaleStore()
  localeStore.hydrate()
  const { setLocale, locale } = useI18n()
  // Sync stored locale → vue-i18n on app start.
  if (locale.value !== localeStore.current) {
    void setLocale(localeStore.current)
  }
  // Sync vue-i18n changes → store.
  watch(locale, (newLocale) => {
    localeStore.set(newLocale as LocaleCode)
  })
})
