import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import CustomGrammarAddForm from '~/components/settings/CustomGrammarAddForm.vue'
import { useGrammarStore } from '~/stores/grammar'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

describe('CustomGrammarAddForm', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('rejects a non-Korean ko with the korean error', async () => {
    const w = mount(CustomGrammarAddForm)
    await w.get('#cg-ko').setValue('abc')
    await w.get('#cg-meaning').setValue('you see')
    await w.get('form').trigger('submit.prevent')
    await nextTick()
    expect(w.text()).toContain('settings.custom_grammar.error_korean')
  })

  it('calls addCustomGrammar with an 8-locale meaning and emits created', async () => {
    const w = mount(CustomGrammarAddForm)
    const store = useGrammarStore()
    const spy = vi.spyOn(store, 'addCustomGrammar')
    await w.get('#cg-ko').setValue('-거든요')
    await w.get('#cg-meaning').setValue('giving a reason')
    await w.get('#cg-example').setValue('바빠서 못 갔거든요')
    await w.get('form').trigger('submit.prevent')
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
    const arg = spy.mock.calls[0]![0]
    expect(arg.ko).toBe('-거든요')
    expect(Object.keys(arg.meaning)).toHaveLength(8)
    expect(arg.meaning.en).toBe('giving a reason')
    expect(arg.example).toBe('바빠서 못 갔거든요')
    expect(w.emitted('created')).toBeTruthy()
  })

  it('surfaces the duplicate error when addCustomGrammar returns null', async () => {
    const w = mount(CustomGrammarAddForm)
    const store = useGrammarStore()
    vi.spyOn(store, 'addCustomGrammar').mockResolvedValue(null)
    await w.get('#cg-ko').setValue('-거든요')
    await w.get('#cg-meaning').setValue('dup')
    await w.get('form').trigger('submit.prevent')
    await nextTick()
    expect(w.text()).toContain('settings.custom_grammar.error_duplicate')
  })
})
