import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import ContextAddForm from '~/components/settings/ContextAddForm.vue'
import { useContextsStore } from '~/stores/contexts'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

function mountForm() {
  return mount(ContextAddForm)
}

describe('ContextAddForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('rejects a non-Korean name with the korean error', async () => {
    const wrapper = mountForm()
    await wrapper.get('#ctx-name').setValue('banmal')
    await wrapper.get('#ctx-scene').setValue('with a friend')
    await wrapper.get('form').trigger('submit.prevent')
    await nextTick()
    expect(wrapper.text()).toContain('settings.contexts.error_korean')
  })

  it('rejects an empty scene with the scene-required error', async () => {
    const wrapper = mountForm()
    await wrapper.get('#ctx-name').setValue('우리집')
    await wrapper.get('form').trigger('submit.prevent')
    await nextTick()
    expect(wrapper.text()).toContain('settings.contexts.error_scene_required')
  })

  it('calls addCustom with an 8-locale scene and emits created on success', async () => {
    const wrapper = mountForm()
    const store = useContextsStore()
    const spy = vi.spyOn(store, 'addCustom')
    await wrapper.get('#ctx-name').setValue('우리집')
    await wrapper.get('#ctx-scene').setValue('at home')
    await wrapper.get('form').trigger('submit.prevent')
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
    const [name, scene] = spy.mock.calls[0]!
    expect(name).toBe('우리집')
    expect(Object.keys(scene)).toHaveLength(8)
    expect(scene.en).toBe('at home')
    expect(wrapper.emitted('created')).toBeTruthy()
  })

  it('surfaces the duplicate error when addCustom returns null', async () => {
    const wrapper = mountForm()
    const store = useContextsStore()
    vi.spyOn(store, 'addCustom').mockResolvedValue(null)
    await wrapper.get('#ctx-name').setValue('반말')
    await wrapper.get('#ctx-scene').setValue('dup')
    await wrapper.get('form').trigger('submit.prevent')
    await nextTick()
    expect(wrapper.text()).toContain('settings.contexts.error_duplicate')
  })
})
