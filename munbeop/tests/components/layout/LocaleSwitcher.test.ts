import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LocaleSwitcher from '~/components/layout/LocaleSwitcher.vue'
import { useSettingsStore } from '~/stores/settings'

// The global useI18n stub only exposes { t, locale }; LocaleSwitcher also
// needs setLocale + locales, so override it for this suite.
const setLocaleSpy = vi.fn()
vi.stubGlobal('useI18n', () => ({
  t: (k: string) => k,
  locale: { value: 'en' },
  locales: { value: [{ code: 'en', name: 'English' }, { code: 'es', name: 'Español' }] },
  setLocale: setLocaleSpy,
}))

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setLocaleSpy.mockClear()
  })

  it('routes a locale change through useSettings (so it syncs to the account)', async () => {
    const wrapper = mount(LocaleSwitcher)
    const settings = useSettingsStore()
    const spy = vi.spyOn(settings, 'setLocale').mockResolvedValue()
    await wrapper.get('select').setValue('es')
    expect(setLocaleSpy).toHaveBeenCalledWith('es')
    expect(spy).toHaveBeenCalledWith('es')
  })
})
