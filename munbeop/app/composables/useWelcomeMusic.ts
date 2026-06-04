import { ref, readonly } from 'vue'

const STORAGE_KEY = 'mungarden:welcome:music'
const SRC = '/welcome/audio/welcome-loop.wav'
const VOLUME = 0.20

export type MusicState = 'on' | 'off'

const state = ref<MusicState>('off')
const ready = ref(false)
let audio: HTMLAudioElement | null = null
let hydrated = false

function readStored(): MusicState {
  if (typeof window === 'undefined') return 'off'
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return v === 'on' ? 'on' : 'off'
  } catch {
    return 'off'
  }
}

function writeStored(next: MusicState) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(STORAGE_KEY, next) } catch { /* private mode */ }
}

function ensureAudio() {
  if (audio) return audio
  audio = new Audio(SRC)
  audio.loop = true
  audio.volume = VOLUME
  audio.addEventListener('error', () => {
    // 404 on the placeholder file or codec failure — stay silent.
    state.value = 'off'
  })
  return audio
}

async function play() {
  const a = ensureAudio()
  try {
    await a.play()
    ready.value = true
  } catch {
    // Autoplay blocked or file missing — flip off and leave the toggle dim.
    state.value = 'off'
  }
}

function pause() {
  if (!audio) return
  audio.pause()
}

/**
 * Welcome-page music. Boots the Audio element only after a user gesture
 * (toggle() is the gesture). Persists "on" / "off" preference per device.
 */
export function useWelcomeMusic() {
  function hydrate() {
    if (hydrated) return
    hydrated = true
    state.value = readStored()
  }

  async function toggle() {
    if (state.value === 'on') {
      state.value = 'off'
      writeStored('off')
      pause()
      return
    }
    state.value = 'on'
    writeStored('on')
    await play()
  }

  return {
    state: readonly(state),
    ready: readonly(ready),
    hydrate,
    toggle,
  }
}

// Test-only: clear singletons between cases.
export function _resetWelcomeMusicForTest() {
  state.value = 'off'
  ready.value = false
  audio = null
  hydrated = false
}
