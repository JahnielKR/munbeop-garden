import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Scene from '~/components/escape-room/Scene.vue'
import type { Room } from '~/lib/domain'

const ls = (s: string) => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

const room: Room = {
  id: 'room-test',
  title: ls('A room'),
  image: 'rooms/test.png',
  ambientAudio: 'audio/test.ogg',
  hotspots: [
    { id: 'note-1', rect: [10, 20, 30, 40], triggersSlot: 'slot-1' },
    { id: 'note-2', rect: [50, 60, 30, 40], triggersSlot: 'slot-2' },
    { id: 'easter', rect: [100, 100, 20, 20], cosmeticDetail: ls('foo') },
  ],
}

describe('Scene', () => {
  it('renders one Hotspot per hotspot entry', () => {
    const w = mount(Scene, { props: { room, imageBase: '/escape-room/level-01/' } })
    expect(w.findAll('[data-testid="hotspot"]')).toHaveLength(3)
  })

  it('builds the bg image src by joining imageBase + room.image', () => {
    const w = mount(Scene, { props: { room, imageBase: '/escape-room/level-01/' } })
    const img = w.get('[data-testid="room-bg"]')
    expect(img.attributes('src')).toBe('/escape-room/level-01/rooms/test.png')
  })

  it('emits "hotspot" with the id when a hotspot is activated', async () => {
    const w = mount(Scene, { props: { room, imageBase: '/escape-room/level-01/' } })
    const hotspots = w.findAll('[data-testid="hotspot"]')
    await hotspots[1]!.trigger('click')
    expect(w.emitted('hotspot')).toEqual([['note-2']])
  })

  describe('solved-variant swap', () => {
    const solvedRoom: Room = { ...room, solvedImage: 'rooms/test-solved.png' }
    const base = '/escape-room/level-02/'
    const src = (w: ReturnType<typeof mount>) =>
      w.get('[data-testid="room-bg"]').attributes('src')

    it('shows the base image until every room slot is resolved', () => {
      expect(src(mount(Scene, { props: { room: solvedRoom, imageBase: base } })))
        .toBe(`${base}rooms/test.png`)
      // partial: only one of the two slots resolved
      expect(src(mount(Scene, { props: { room: solvedRoom, imageBase: base, resolvedSlots: ['slot-1'] } })))
        .toBe(`${base}rooms/test.png`)
    })

    it('swaps to solvedImage once all the room’s slots are resolved', () => {
      expect(src(mount(Scene, { props: { room: solvedRoom, imageBase: base, resolvedSlots: ['slot-1', 'slot-2'] } })))
        .toBe(`${base}rooms/test-solved.png`)
    })

    it('never swaps a room that declares no solvedImage', () => {
      expect(src(mount(Scene, { props: { room, imageBase: base, resolvedSlots: ['slot-1', 'slot-2'] } })))
        .toBe(`${base}rooms/test.png`)
    })
  })
})
