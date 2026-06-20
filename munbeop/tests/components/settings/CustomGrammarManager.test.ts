import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import CustomGrammarManager from '~/components/settings/CustomGrammarManager.vue'
import { useGrammarStore } from '~/stores/grammar'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))
const L = (s: string) => ({ en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s })

describe('CustomGrammarManager', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = ''
  })

  it('shows the empty state when there are no custom grammars', () => {
    const w = mount(CustomGrammarManager, { attachTo: document.body })
    expect(w.text()).toContain('settings.custom_grammar.empty')
  })

  it('lists a row per custom grammar and opens the confirm modal on delete', async () => {
    const w = mount(CustomGrammarManager, { attachTo: document.body })
    const store = useGrammarStore()
    await store.addCustomGrammar({ ko: '-거든요', meaning: L('reason') })
    await nextTick()
    expect(w.findAll('.cg-row')).toHaveLength(1)
    await w.get('.cg-row__delete').trigger('click')
    await nextTick()
    expect(document.body.querySelector('.modal-overlay')).not.toBeNull()
  })
})
