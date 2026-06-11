import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import EscapeRoom from '~/components/escape-room/EscapeRoom.vue'
import { useEscapeRoomStore } from '~/stores/escape-room'
import { makeLevel } from '../../unit/escape-room/_fixture'

/** Mount and skip the intro cinematic so the scene is interactive. */
async function mountPlaying(level = makeLevel(), seed = 'seed-test') {
  const w = mount(EscapeRoom, { props: { level, seed } })
  await flushPromises()
  await w.get('[data-testid="cinematic-skip"]').trigger('click')
  return w
}

async function openSlot1(w: VueWrapper) {
  const spot = w
    .findAll('[data-testid="hotspot"]')
    .find((h) => h.attributes('aria-label') === 'h-a-1')!
  await spot.trigger('click')
}

/** Solve all three fixture slots (selection idx 0, completion '이', creation [0,1]). */
async function solveAll() {
  const store = useEscapeRoomStore()
  store.answerSelection('slot-1', 0)
  store.answerCompletion('slot-2', '이')
  store.answerCreation('slot-3', [0, 1])
  await flushPromises()
}

describe('EscapeRoom (integration with store)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('opens on the intro cinematic; the scene appears after skipping', async () => {
    const w = mount(EscapeRoom, { props: { level: makeLevel(), seed: 's' } })
    await flushPromises()
    expect(w.find('[data-testid="cinematic-root"]').exists()).toBe(true)
    await w.get('[data-testid="cinematic-skip"]').trigger('click')
    expect(w.find('[data-testid="cinematic-root"]').exists()).toBe(false)
    expect(w.find('[data-testid="room"]').exists()).toBe(true)
  })

  it('starts a run on mount with the given level and seed', async () => {
    await mountPlaying(makeLevel(), 'seed-test')
    const store = useEscapeRoomStore()
    expect(store.status).toBe('playing')
    expect(store.currentRun?.seed).toBe('seed-test')
  })

  it('shows full hearts initially and loses one per mistake', async () => {
    const w = await mountPlaying()
    expect(w.get('[data-testid="er-hearts"]').text().trim()).toBe('♥ ♥ ♥'.replaceAll(' ', ''))
    await openSlot1(w)
    await w.findAll('[data-testid="slot-option"]')[1]!.trigger('click')
    expect(w.get('[data-testid="er-hearts"]').text()).toContain('♡')
  })

  it('renders a tab per room and switches scene on click', async () => {
    const level = makeLevel({
      rooms: [
        ...makeLevel().rooms,
        {
          id: 'room-b',
          title: {
            en: 'Room B', es: 'Room B', fr: 'Room B', 'pt-BR': 'Room B',
            th: 'Room B', id: 'Room B', vi: 'Room B', ja: 'Room B',
          },
          image: 'rooms/b.png',
          ambientAudio: 'audio/b.ogg',
          hotspots: [],
        },
      ],
    })
    const w = await mountPlaying(level)
    const tabs = w.findAll('[data-testid="room-tab"]')
    expect(tabs).toHaveLength(2)
    await tabs[1]!.trigger('click')
    const store = useEscapeRoomStore()
    expect(store.currentRoomId).toBe('room-b')
  })

  it('opens the right puzzle panel per slot type', async () => {
    const w = await mountPlaying()
    await openSlot1(w)
    expect(w.find('[data-testid="slot-selection"]').exists()).toBe(true)
    await w.get('[data-testid="puzzle-close"]').trigger('click')
    expect(w.find('[data-testid="slot-selection"]').exists()).toBe(false)
  })

  it('answering correctly resolves the slot and closes the panel', async () => {
    const w = await mountPlaying()
    await openSlot1(w)
    await w.findAll('[data-testid="slot-option"]')[0]!.trigger('click')
    const store = useEscapeRoomStore()
    expect(store.resolvedSlots).toContain('slot-1')
    expect(w.find('[data-testid="slot-selection"]').exists()).toBe(false)
  })

  it('completing every slot computes a tier and shows the victory screen', async () => {
    const w = await mountPlaying()
    await solveAll()
    expect(w.find('[data-testid="victory-root"]').exists()).toBe(true)
    expect(w.get('[data-testid="victory-tier"]').text()).toContain('escape.tier_')
    const store = useEscapeRoomStore()
    expect(store.unlockedCosmetics.length).toBe(1)
  })

  it('three mistakes show the game-over screen; retry restarts with a fresh draw', async () => {
    const w = await mountPlaying()
    const store = useEscapeRoomStore()
    store.answerSelection('slot-1', 1)
    store.answerSelection('slot-1', 2)
    store.answerSelection('slot-1', 3)
    await flushPromises()
    expect(w.find('[data-testid="gameover-root"]').exists()).toBe(true)

    await w.get('[data-testid="gameover-retry"]').trigger('click')
    await flushPromises()
    expect(store.status).toBe('playing')
    expect(store.errorsMade).toBe(0)
    expect(store.currentRun?.seed).toBe('seed-test#r1')
    // No cinematic on retry — straight back into the scene.
    expect(w.find('[data-testid="cinematic-root"]').exists()).toBe(false)
    expect(w.find('[data-testid="room"]').exists()).toBe(true)
  })

  it('emits exit from the HUD back button', async () => {
    const w = await mountPlaying()
    await w.get('[data-testid="er-exit"]').trigger('click')
    expect(w.emitted('exit')).toBeTruthy()
  })
})
