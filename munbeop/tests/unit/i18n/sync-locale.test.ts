import { describe, it, expect, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { syncLocaleToI18n } from '~/lib/i18n/sync-locale'

describe('syncLocaleToI18n', () => {
  it('does not touch i18n when the runtime locale already matches the store', () => {
    const store = ref('en')
    const i18nLocale = ref('en')
    const setLocale = vi.fn()

    syncLocaleToI18n(() => store.value, i18nLocale, setLocale)

    expect(setLocale).not.toHaveBeenCalled()
  })

  it('applies a locale that already differs at mount (cloud value loaded before the bridge)', () => {
    const store = ref('es')
    const i18nLocale = ref('en')
    const setLocale = vi.fn()

    syncLocaleToI18n(() => store.value, i18nLocale, setLocale)

    expect(setLocale).toHaveBeenCalledWith('es')
  })

  it('applies a later store change (e.g. account-switch hydrate) to i18n', async () => {
    const store = ref('en')
    const i18nLocale = ref('en')
    const setLocale = vi.fn((c: string) => {
      i18nLocale.value = c
    })

    syncLocaleToI18n(() => store.value, i18nLocale, setLocale)
    store.value = 'ja'
    await nextTick()

    expect(setLocale).toHaveBeenCalledWith('ja')
  })

  it('stops bridging once the returned handle is called', async () => {
    const store = ref('en')
    const i18nLocale = ref('en')
    const setLocale = vi.fn()

    const stop = syncLocaleToI18n(() => store.value, i18nLocale, setLocale)
    stop()
    store.value = 'fr'
    await nextTick()

    expect(setLocale).not.toHaveBeenCalled()
  })
})
