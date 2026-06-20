import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorNoteBlock from '~/components/practice/ErrorNoteBlock.vue'

function mountBlock(dimension: string | null = null) {
  return mount(ErrorNoteBlock, { props: { modelValue: '', dimension } })
}

describe('ErrorNoteBlock dimension chips', () => {
  it('renders a chip per dimension and selecting one emits update:dimension', async () => {
    const w = mountBlock(null)
    await w.find('[data-testid="dim-particle"]').trigger('click')
    expect(w.emitted('update:dimension')?.[0]?.[0]).toBe('particle')
  })
  it('tapping the selected chip clears it (emits null)', async () => {
    const w = mountBlock('ending')
    await w.find('[data-testid="dim-ending"]').trigger('click')
    expect(w.emitted('update:dimension')?.[0]?.[0]).toBeNull()
  })
})
