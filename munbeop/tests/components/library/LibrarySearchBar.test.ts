import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LibrarySearchBar from '~/components/library/LibrarySearchBar.vue'

function mountBar(props: Partial<Record<string, unknown>> = {}) {
  return mount(LibrarySearchBar, {
    props: { query: '', level: null, category: null, mastery: null, zoneLabel: null, resultCount: 0, ...props },
  })
}

describe('LibrarySearchBar', () => {
  it('emits update:query when the user types', async () => {
    const w = mountBar()
    await w.find('input').setValue('은')
    expect(w.emitted('update:query')?.[0]).toEqual(['은'])
  })

  it('emits set-level with a parsed number from the level select', async () => {
    const w = mountBar()
    await w.find('.library-search__level').setValue('3')
    expect(w.emitted('set-level')?.[0]).toEqual([3])
  })

  it('emits set-level null when "all levels" is chosen', async () => {
    const w = mountBar({ level: 3 })
    await w.find('.library-search__level').setValue('')
    expect(w.emitted('set-level')?.[0]).toEqual([null])
  })

  it('emits set-category from the category select', async () => {
    const w = mountBar()
    const select = w.find('.library-search__category')
    const opts = select.findAll('option')
    const firstReal = opts.find((o) => o.element.value !== '')!
    await select.setValue(firstReal.element.value)
    expect(w.emitted('set-category')?.[0]).toEqual([firstReal.element.value])
  })

  it('emits set-mastery from the mastery select', async () => {
    const w = mountBar()
    await w.find('.library-search__mastery').setValue('hard')
    expect(w.emitted('set-mastery')?.[0]).toEqual(['hard'])
  })

  it('emits set-mastery null when "all mastery" is chosen', async () => {
    const w = mountBar({ mastery: 'tree' })
    await w.find('.library-search__mastery').setValue('')
    expect(w.emitted('set-mastery')?.[0]).toEqual([null])
  })

  it('emits clear when the clear button is pressed', async () => {
    const w = mountBar({ query: '은' })
    await w.get('[data-testid="library-search-clear"]').trigger('click')
    expect(w.emitted('clear')).toHaveLength(1)
  })

  it('shows the result count when filtering', () => {
    const w = mountBar({ query: '은', resultCount: 5 })
    expect(w.html()).toContain('library.search.result_count 5')
  })

  it('shows the active-zone banner when a zone label is provided', () => {
    const w = mountBar({ zoneLabel: 'Partículas básicas' })
    expect(w.html()).toContain('library.search.active_zone Partículas básicas')
  })
})
