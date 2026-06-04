import { ref, readonly } from 'vue'

const STORAGE_KEY = 'mungarden:welcome:music'
const SRC = '/welcome/audio/welcome-loop.mp3'
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

  /**
   * Force music on and start playing. Used by surfaces that count as
   * the user's "intent to enter the experience" — the welcome pulse
   * button is the canonical caller. Idempotent: calling while already
   * playing is a no-op. If the user previously turned music off via
   * the toggle, this overrides that preference (the next ENTER is an
   * intentional re-engagement).
   */
  async function ensurePlaying() {
    if (state.value !== 'on') {
      state.value = 'on'
      writeStored('on')
    }
    if (ready.value && audio && !audio.paused) return
    await play()
  }

  /**
   * Ramp the audio volume to 0 over `durationMs`, then pause. State
   * flips to 'off' and persists so the music UI stays in sync. Called
   * by the welcome→in-app transition so the soundtrack doesn't cut
   * abruptly while the pan plays.
   *
   * If nothing is playing, resolves immediately.
   */
  async function fadeOut(durationMs = 700) {
    if (!audio || audio.paused) return
    const startVolume = audio.volume
    const steps = 20
    const stepDuration = Math.max(1, Math.floor(durationMs / steps))
    for (let i = 1; i <= steps; i += 1) {
      audio.volume = Math.max(0, startVolume * (1 - i / steps))
      await new Promise<void>((resolve) => setTimeout(resolve, stepDuration))
    }
    audio.pause()
    audio.volume = VOLUME // reset so the next ensurePlaying() resumes at the normal level
    state.value = 'off'
    writeStored('off')
  }

  return {
    state: readonly(state),
    ready: readonly(ready),
    hydrate,
    toggle,
    ensurePlaying,
    fadeOut,
  }
}

// Test-only: clear singletons between cases.
export function _resetWelcomeMusicForTest() {
  state.value = 'off'
  ready.value = false
  audio = null
  hydrated = false
}
