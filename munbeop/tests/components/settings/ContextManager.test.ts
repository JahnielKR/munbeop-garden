import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import ContextManager from '~/components/settings/ContextManager.vue'
import { useContextsStore } from '~/stores/contexts'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

function mountManager() {
  return mount(ContextManager, { attachTo: document.body })
}

describe('ContextManager', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = ''
  })

  it('renders a row with a Toggle for every context', () => {
    const wrapper = mountManager()
    const store = useContextsStore()
    expect(wrapper.findAll('.ctx-row')).toHaveLength(store.all.length) // 8 built-ins
    expect(wrapper.findAll('[role="switch"]').length).toBe(store.all.length)
  })

  it('disables the active toggles once only the minimum remain active', async () => {
    const wrapper = mountManager()
    const store = useContextsStore()
    const ids = store.all.map((c) => c.id)
    for (const id of ids.slice(0, 5)) await store.toggleActive(id) // 8 → 3 active
    await nextTick()
    const switches = wrapper.findAll('[role="switch"]')
    const checkedDisabled = switches.filter(
      (s) => s.attributes('aria-checked') === 'true' && s.attributes('disabled') !== undefined,
    )
    expect(checkedDisabled.length).toBe(3)
    expect(wrapper.text()).toContain('settings.contexts.min_active_hint')
  })

  it('shows a delete affordance only for custom contexts', async () => {
    const wrapper = mountManager()
    const store = useContextsStore()
    expect(wrapper.findAll('.ctx-row__delete')).toHaveLength(0)
    await store.addCustom('우리집', store.all[0]!.scene) // reuse a valid LocalizedString
    await nextTick()
    expect(wrapper.findAll('.ctx-row__delete')).toHaveLength(1)
  })

  it('opens the confirm modal when a custom delete is clicked', async () => {
    const wrapper = mountManager()
    const store = useContextsStore()
    await store.addCustom('우리집', store.all[0]!.scene)
    await nextTick()
    await wrapper.get('.ctx-row__delete').trigger('click')
    await nextTick()
    expect(document.body.querySelector('.modal-overlay')).not.toBeNull()
  })
})
