import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CustomDeckBuilder from '~/components/games/ruleta/CustomDeckBuilder.vue'
import { useGrammarStore } from '~/stores/grammar'
import { useCustomDecksStore } from '~/stores/customDecks'
import type { Grammar, Deck } from '~/lib/domain'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

const L = (s: string) => ({ en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s })
const DECKS: Deck[] = [{ id: 'topik-1', name: 'TOPIK 1', colorId: 'sky', order: 1, collapsed: false }]
const ITEMS: Grammar[] = ['-아서', '-니까', '-는데', '-거든요', '-잖아요', '-더라고요', '-나요'].map((ko) => ({
  ko, meaning: L(ko), deckId: 'topik-1',
}))

beforeEach(() => {
  setActivePinia(createPinia())
  const g = useGrammarStore()
  g.items = [...ITEMS]
  g.decks = [...DECKS]
})

describe('CustomDeckBuilder', () => {
  it('disables save until a name is entered', async () => {
    const w = mount(CustomDeckBuilder, { props: { deckId: null } })
    const save = w.find('[data-testid="builder-save"]')
    expect((save.element as HTMLButtonElement).disabled).toBe(true)
    await w.find('[data-testid="builder-name"]').setValue('My deck')
    expect((save.element as HTMLButtonElement).disabled).toBe(false)
  })

  it('creates a deck with the selected grammars and emits saved', async () => {
    const w = mount(CustomDeckBuilder, { props: { deckId: null } })
    await w.find('[data-testid="builder-name"]').setValue('Connectors')
    await w.find('[data-testid="grammar-opt--아서"]').trigger('click')
    await w.find('[data-testid="grammar-opt--니까"]').trigger('click')
    // select color and icon to verify round-trip
    await w.find('[data-testid="color-jade"]').trigger('click')
    await w.find('[data-testid="icon-deck-book"]').trigger('click')
    await w.find('[data-testid="builder-save"]').trigger('click')
    await flushPromises()
    const store = useCustomDecksStore()
    expect(store.decks).toHaveLength(1)
    expect(store.decks[0]!.name).toBe('Connectors')
    expect(store.decks[0]!.grammarKos).toEqual(['-아서', '-니까'])
    expect(store.decks[0]!.colorId).toBe('jade')
    expect(store.decks[0]!.icon).toBe('deck-book')
    expect(w.emitted('saved')).toHaveLength(1)
  })

  it('prefills fields when editing an existing deck', async () => {
    const store = useCustomDecksStore()
    const d = await store.addDeck({ name: 'Seed', colorId: 'rose', icon: 'deck-flame', grammarKos: ['-는데'] })
    const w = mount(CustomDeckBuilder, { props: { deckId: d.id } })
    await flushPromises()
    expect((w.find('[data-testid="builder-name"]').element as HTMLInputElement).value).toBe('Seed')
    expect(w.find('[data-testid="grammar-opt--는데"]').classes()).toContain('grammar-opt--on')
  })

  it('deletes a deck (two-step) and emits saved', async () => {
    const store = useCustomDecksStore()
    const d = await store.addDeck({ name: 'Doomed' })
    const w = mount(CustomDeckBuilder, { props: { deckId: d.id } })
    await flushPromises()
    await w.find('[data-testid="builder-delete"]').trigger('click')   // arm
    await w.find('[data-testid="builder-delete-confirm"]').trigger('click')
    await flushPromises()
    expect(store.decks).toHaveLength(0)
    expect(w.emitted('saved')).toHaveLength(1)
  })

  it('filters grammar list by search query', async () => {
    const w = mount(CustomDeckBuilder, { props: { deckId: null } })
    await w.find('[data-testid="builder-search"]').setValue('-아서')
    await flushPromises()
    await w.vm.$nextTick()
    expect(w.find('[data-testid="grammar-opt--아서"]').exists()).toBe(true)
    expect(w.find('[data-testid="grammar-opt--니까"]').exists()).toBe(false)
  })
})
