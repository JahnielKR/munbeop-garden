import { defineStore } from 'pinia'
import { DEFAULT_LOCALE, LOCALE_CODES, type LocaleCode } from '~/lib/domain'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'

const storage = new LocalStorageAdapter()

function isValid(code: string): code is LocaleCode {
  return (LOCALE_CODES as readonly string[]).includes(code)
}

export const useLocaleStore = defineStore('locale', () => {
  const current = ref<LocaleCode>(DEFAULT_LOCALE)

  function hydrate() {
    const stored = storage.read<string>(STORAGE_KEYS.locale, DEFAULT_LOCALE)
    current.value = isValid(stored) ? stored : DEFAULT_LOCALE
  }

  function set(code: LocaleCode) {
    current.value = code
    storage.write(STORAGE_KEYS.locale, code)
  }

  return { current, hydrate, set }
})
