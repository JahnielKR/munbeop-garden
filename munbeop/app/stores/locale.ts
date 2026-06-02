import { defineStore } from 'pinia'
import { DEFAULT_LOCALE, LOCALE_CODES, type LocaleCode } from '~/lib/domain'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'

const storage = new LocalStorageAdapter()

function isValid(code: string): code is LocaleCode {
  return (LOCALE_CODES as readonly string[]).includes(code)
}

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    current: DEFAULT_LOCALE as LocaleCode,
  }),
  actions: {
    hydrate() {
      const stored = storage.read<string>(STORAGE_KEYS.locale, DEFAULT_LOCALE)
      this.current = isValid(stored) ? stored : DEFAULT_LOCALE
    },
    set(code: LocaleCode) {
      this.current = code
      storage.write(STORAGE_KEYS.locale, code)
    },
  },
})
