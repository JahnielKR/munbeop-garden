import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Hotspot from '~/components/escape-room/Hotspot.vue'

describe('Hotspot', () => {
  it('emits "click" when activated', async () => {
    const w = mount(Hotspot, {
      props: { id: 'h-1', rect: [10, 20, 30, 40] },
    })
    await w.get('[data-testid="hotspot"]').trigger('click')
    expect(w.emitted('click')).toBeTruthy()
  })

  it('positions itself absolutely using the rect as percentages of a 320×240 scene', () => {
    const w = mount(Hotspot, {
      props: { id: 'h-1', rect: [32, 24, 64, 48] }, // 10% x, 10% y, 20% w, 20% h
    })
    const style = (w.get('[data-testid="hotspot"]').attributes('style') ?? '').replace(/\s+/g, '')
    expect(style).toContain('left:10%')
    expect(style).toContain('top:10%')
    expect(style).toContain('width:20%')
    expect(style).toContain('height:20%')
  })

  it('uses the id as an aria-label fallback', () => {
    const w = mount(Hotspot, {
      props: { id: 'note-1', rect: [0, 0, 10, 10] },
    })
    expect(w.get('[data-testid="hotspot"]').attributes('aria-label')).toBe('note-1')
  })
})
