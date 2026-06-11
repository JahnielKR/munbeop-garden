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
})
