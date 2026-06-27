import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TileTray from '~/components/numbers-market/TileTray.vue'

const base = {
  pool: ['세', '시', '십오', '분', '삼', '열다섯'],
  built: [] as string[],
  phase: 'building' as const,
}

describe('TileTray', () => {
  it('renders one button per pool tile', () => {
    const w = mount(TileTray, { props: base })
    expect(w.findAll('[data-testid="pool-tile"]')).toHaveLength(6)
  })
  it('emits place with the tile index when a pool tile is clicked', async () => {
    const w = mount(TileTray, { props: base })
    await w.findAll('[data-testid="pool-tile"]')[2]!.trigger('click')
    expect(w.emitted('place')?.[0]).toEqual([2])
  })
  it('shows built tiles and emits submit', async () => {
    const w = mount(TileTray, { props: { ...base, built: ['세', '시'] } })
    expect(w.findAll('[data-testid="built-tile"]')).toHaveLength(2)
    await w.find('[data-testid="tile-submit"]').trigger('click')
    expect(w.emitted('submit')).toBeTruthy()
  })
  it('emits undo with the built tile index when a built tile is clicked', async () => {
    const w = mount(TileTray, { props: { ...base, built: ['세', '시'] } })
    await w.findAll('[data-testid="built-tile"]')[0]!.trigger('click')
    expect(w.emitted('undo')?.[0]).toEqual([0])
  })
  it('emits clear when the clear button is clicked', async () => {
    const w = mount(TileTray, { props: { ...base, built: ['세'] } })
    await w.find('.tray__btn').trigger('click') // first .tray__btn is the clear button
    expect(w.emitted('clear')).toBeTruthy()
  })
})
