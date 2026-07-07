import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'
import EscapeRoom from '~/components/escape-room/EscapeRoom.vue'
import { useEscapeRoomStore } from '~/stores/escape-room'
import { makeLevel, ls } from '../../unit/escape-room/_fixture'

/**
 * Wiring tests for EscapeRoom ↔ useEscapeRoomAudio. We STUB the composable so
 * the assertions are about *which calls EscapeRoom makes* (room change → ambient
 * + door sfx, results → correct/wrong sfx, intro/victory → voice), not about the
 * real media pipeline (covered by the composable's own unit test). Stubbing also
 * keeps these from being brittle against fade timing or autoplay behavior.
 */

const audioMock = {
  enabled: ref(true),
  hydrate: vi.fn(),
  setEnabled: vi.fn((on: boolean) => {
    audioMock.enabled.value = on
  }),
  playAmbient: vi.fn(),
  stopAmbient: vi.fn(),
  playSfx: vi.fn(),
  playVoice: vi.fn(),
  stopVoice: vi.fn(),
  stopAll: vi.fn(),
}

vi.mock('~/composables/useEscapeRoomAudio', () => ({
  useEscapeRoomAudio: () => audioMock,
  _resetEscapeRoomAudioForTest: () => {},
}))

/** A two-room level whose hotspots/candidates carry audio (mirrors level 2). */
function makeAudioLevel() {
  const base = makeLevel()
  const slot1 = base.slots[0]
  if (slot1?.type !== 'selection') throw new Error('fixture changed')
  return makeLevel({
    voiceIntroAudio: 'audio/voice/intro.ogg',
    voiceOutroAudio: 'audio/voice/outro.ogg',
    bellTollAudio: 'audio/sfx-bell.ogg',
    rainStopAudio: 'audio/sfx-rain.ogg',
    slots: [
      {
        ...slot1,
        reactionVoiceAudio: 'audio/voice/slot1-react.ogg',
        candidates: slot1.candidates.map((c) => ({ ...c, voiceAudio: 'audio/voice/slot1-mem.ogg' })),
      },
      base.slots[1]!,
      base.slots[2]!,
    ],
    rooms: [
      {
        ...base.rooms[0]!,
        hotspots: [
          { id: 'h-a-1', rect: [0, 0, 100, 100], triggersSlot: 'slot-1' },
          { id: 'cosmetic', rect: [100, 0, 50, 50], cosmeticDetail: ls('egg'), sfx: 'audio/sfx-purr.ogg' },
        ],
      },
      {
        id: 'room-b',
        title: ls('Room B'),
        image: 'rooms/b.png',
        ambientAudio: 'audio/ambient-b.ogg',
        hotspots: [],
      },
    ],
  })
}

async function mountPlaying(level = makeAudioLevel(), seed = 'seed-audio') {
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

describe('EscapeRoom audio wiring', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    audioMock.enabled.value = true
    for (const fn of Object.values(audioMock)) {
      if (typeof fn === 'object' && 'mockClear' in fn) (fn as { mockClear: () => void }).mockClear()
    }
    audioMock.hydrate.mockClear()
    audioMock.playAmbient.mockClear()
    audioMock.playSfx.mockClear()
    audioMock.playVoice.mockClear()
    audioMock.stopAll.mockClear()
    audioMock.setEnabled.mockClear()
  })

  it('hydrates audio on mount', async () => {
    await mountPlaying()
    expect(audioMock.hydrate).toHaveBeenCalled()
  })

  it('starts the room ambient (resolved against imageBase) when play begins', async () => {
    await mountPlaying()
    expect(audioMock.playAmbient).toHaveBeenCalled()
    const lastCall = audioMock.playAmbient.mock.calls.at(-1)!
    expect(lastCall[0]).toBe('/escape-room/test-level/audio/a.ogg')
  })

  it('plays the door sfx on an actual room change, then the new ambient', async () => {
    const w = await mountPlaying()
    audioMock.playSfx.mockClear()
    audioMock.playAmbient.mockClear()
    const tabs = w.findAll('[data-testid="room-tab"]')
    await tabs[1]!.trigger('click')
    await flushPromises()
    expect(audioMock.playSfx).toHaveBeenCalledWith('/escape-room/test-level/audio/sfx-door-wood.ogg')
    expect(audioMock.playAmbient).toHaveBeenCalledWith('/escape-room/test-level/audio/ambient-b.ogg')
  })

  it('plays the select sfx + the slot-1 memory voice when the puzzle opens', async () => {
    const w = await mountPlaying()
    audioMock.playSfx.mockClear()
    audioMock.playVoice.mockClear()
    await openSlot1(w)
    expect(audioMock.playSfx).toHaveBeenCalledWith('/escape-room/test-level/audio/sfx-select.ogg')
    expect(audioMock.playVoice).toHaveBeenCalledWith('/escape-room/test-level/audio/voice/slot1-mem.ogg')
  })

  it('plays a cosmetic hotspot sfx when its hotspot is clicked', async () => {
    const w = await mountPlaying()
    audioMock.playSfx.mockClear()
    const cosmetic = w
      .findAll('[data-testid="hotspot"]')
      .find((h) => h.attributes('aria-label') === 'cosmetic')!
    await cosmetic.trigger('click')
    expect(audioMock.playSfx).toHaveBeenCalledWith('/escape-room/test-level/audio/sfx-purr.ogg')
  })

  it('plays the correct sfx + slot-1 reaction voice on a right answer', async () => {
    const w = await mountPlaying()
    await openSlot1(w)
    audioMock.playSfx.mockClear()
    audioMock.playVoice.mockClear()
    await w.findAll('[data-testid="slot-option"]')[0]!.trigger('click')
    expect(audioMock.playSfx).toHaveBeenCalledWith('/escape-room/test-level/audio/sfx-correct.ogg')
    expect(audioMock.playVoice).toHaveBeenCalledWith('/escape-room/test-level/audio/voice/slot1-react.ogg')
  })

  it('plays the wrong sfx on a wrong answer (and no correct sfx)', async () => {
    const w = await mountPlaying()
    await openSlot1(w)
    audioMock.playSfx.mockClear()
    await w.findAll('[data-testid="slot-option"]')[1]!.trigger('click')
    expect(audioMock.playSfx).toHaveBeenCalledWith('/escape-room/test-level/audio/sfx-wrong.ogg')
    expect(audioMock.playSfx).not.toHaveBeenCalledWith('/escape-room/test-level/audio/sfx-correct.ogg')
  })

  it('plays the wrong sfx (never the success chime / reaction voice) on the game-over mistake', async () => {
    const w = await mountPlaying()
    const store = useEscapeRoomStore()
    await openSlot1(w)
    // Deplete hearts to the brink (fixture maxErrors = 2) without ending the run.
    store.answerSelection('slot-1', 1)
    store.answerSelection('slot-1', 1)
    expect(store.status).toBe('playing')
    await flushPromises()
    audioMock.playSfx.mockClear()
    audioMock.playVoice.mockClear()
    // The next wrong answer — via the UI — is the fatal one → 'game-over'.
    await w.findAll('[data-testid="slot-option"]')[1]!.trigger('click')
    await flushPromises()
    expect(store.status).toBe('gameover')
    expect(audioMock.playSfx).toHaveBeenCalledWith('/escape-room/test-level/audio/sfx-wrong.ogg')
    expect(audioMock.playSfx).not.toHaveBeenCalledWith('/escape-room/test-level/audio/sfx-correct.ogg')
    expect(audioMock.playVoice).not.toHaveBeenCalled()
  })

  it('passes the resolved intro voice URL to the intro cinematic', async () => {
    const w = mount(EscapeRoom, { props: { level: makeAudioLevel(), seed: 's' } })
    await flushPromises()
    // The IntroCinematic is stubbed-through here; assert via its props on the real child.
    const intro = w.findComponent({ name: 'IntroCinematic' })
    expect(intro.props('voiceAudio')).toBe('/escape-room/test-level/audio/voice/intro.ogg')
  })

  it('passes the resolved climax URLs to the victory screen', async () => {
    const w = await mountPlaying()
    const store = useEscapeRoomStore()
    store.answerSelection('slot-1', 0)
    store.answerCompletion('slot-2', '이')
    store.answerCreation('slot-3', [0, 1])
    await flushPromises()
    const victory = w.findComponent({ name: 'VictoryScreen' })
    expect(victory.exists()).toBe(true)
    expect(victory.props('bellTollAudio')).toBe('/escape-room/test-level/audio/sfx-bell.ogg')
    expect(victory.props('rainStopAudio')).toBe('/escape-room/test-level/audio/sfx-rain.ogg')
    expect(victory.props('voiceOutroAudio')).toBe('/escape-room/test-level/audio/voice/outro.ogg')
  })

  it('stops all audio on exit', async () => {
    const w = await mountPlaying()
    await w.get('[data-testid="er-exit"]').trigger('click')
    expect(audioMock.stopAll).toHaveBeenCalled()
  })

  it('stops all audio when the component unmounts (route navigation away)', async () => {
    // Regression: the looping ambient is a module singleton, so leaving the
    // level via the app nav / browser back (exitToBook never runs) kept it
    // playing app-wide until a full reload.
    const w = await mountPlaying()
    expect(audioMock.stopAll).not.toHaveBeenCalled()
    w.unmount()
    expect(audioMock.stopAll).toHaveBeenCalled()
  })

  it('toggles audio from the HUD mute button', async () => {
    const w = await mountPlaying()
    await w.get('[data-testid="er-mute"]').trigger('click')
    expect(audioMock.setEnabled).toHaveBeenCalledWith(false)
  })
})
