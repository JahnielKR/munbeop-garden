import { ref, readonly } from 'vue'

/**
 * Escape-room audio — native HTML5 Audio playback for a level's soundscape.
 *
 * A module-singleton (mirrors `useWelcomeMusic`): every caller shares ONE
 * ambient channel, ONE voice channel and a small overlapping SFX pool. Built to
 * be a *safe no-op* off the happy path:
 *   - SSR-safe: nothing touches `window`/`Audio` at import time; each play*
 *     guards `typeof window`/`typeof Audio`.
 *   - error-tolerant: every `play()` is in a try/catch and its rejection is
 *     swallowed (autoplay blocked → stay silent), and every element registers an
 *     `error` listener so a 404/codec failure is silent, not thrown.
 *   - test-safe: under happy-dom `play()` rejects and there is no real media
 *     pipeline — the composable degrades to silence and never throws, so the
 *     existing component tests keep passing.
 *
 * Channels:
 *   - ambient  — ONE looping bed at a time, equal-power-ish crossfade on swap.
 *   - voice    — ONE line at a time; a new line cancels the previous.
 *   - sfx      — fire-and-forget one-shots that MAY overlap (small pool).
 *
 * Master gate: when `enabled` is false, all play* are no-ops and any current
 * ambient/voice is stopped.
 */

const STORAGE_KEY = 'mungarden:escape:audio'

/** Channel mix levels. Ambient sits well under voice so narration reads clearly. */
const AMBIENT_VOL = 0.35
const SFX_VOL = 0.55
const VOICE_VOL = 0.9

/** Max concurrent one-shot SFX elements kept around (older ones get reused). */
const SFX_POOL_SIZE = 6

const enabled = ref(true)
let hydrated = false

/** The single looping ambient bed and the src it is playing (for same-src dedupe). */
let ambient: HTMLAudioElement | null = null
let ambientSrc = ''
/** The single active voice line. */
let voice: HTMLAudioElement | null = null
/** Round-robin pool of one-shot SFX elements. */
const sfxPool: HTMLAudioElement[] = []
let sfxCursor = 0

/** Pending fade timers, so a re-fade can cancel an in-flight one. */
const fadeTimers = new Map<HTMLAudioElement, ReturnType<typeof setInterval>>()

function audioAvailable(): boolean {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined'
}

function readStored(): boolean {
  if (typeof window === 'undefined') return true
  try {
    // Default is "on": only the explicit string 'off' disables.
    return window.localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

function writeStored(on: boolean) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  } catch {
    /* private mode — preference simply doesn't persist */
  }
}

/** Construct a tolerant Audio element; null if Audio is unavailable. */
function makeAudio(src: string): HTMLAudioElement | null {
  if (!audioAvailable()) return null
  const a = new Audio(src)
  // A 404 / codec failure must be silent, never thrown.
  a.addEventListener('error', () => {
    /* stay silent */
  })
  return a
}

/** Kick off playback, swallowing autoplay/file rejections. */
function safePlay(a: HTMLAudioElement | null) {
  if (!a) return
  try {
    const p = a.play()
    if (p && typeof (p as Promise<void>).catch === 'function') {
      ;(p as Promise<void>).catch(() => {
        /* autoplay blocked or file missing — stay silent */
      })
    }
  } catch {
    /* play() threw synchronously (test env) — stay silent */
  }
}

function clearFade(a: HTMLAudioElement) {
  const t = fadeTimers.get(a)
  if (t !== undefined) {
    clearInterval(t)
    fadeTimers.delete(a)
  }
}

/**
 * Ramp `a.volume` from its current value to `to` over `ms`, then run `onDone`.
 * With `ms <= 0` (or no timers, e.g. tests) it sets the volume and finishes
 * synchronously so logic stays deterministic.
 */
function fadeTo(a: HTMLAudioElement, to: number, ms: number, onDone?: () => void) {
  clearFade(a)
  if (ms <= 0 || typeof setInterval === 'undefined') {
    a.volume = clamp01(to)
    onDone?.()
    return
  }
  const from = a.volume
  const steps = 16
  const stepMs = Math.max(1, Math.floor(ms / steps))
  let i = 0
  const timer = setInterval(() => {
    i += 1
    a.volume = clamp01(from + (to - from) * (i / steps))
    if (i >= steps) {
      clearFade(a)
      a.volume = clamp01(to)
      onDone?.()
    }
  }, stepMs)
  fadeTimers.set(a, timer)
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

function stopAmbientInternal(fadeMs: number) {
  const a = ambient
  ambient = null
  ambientSrc = ''
  if (!a) return
  fadeTo(a, 0, fadeMs, () => {
    a.pause()
  })
}

function stopVoiceInternal() {
  const v = voice
  voice = null
  if (!v) return
  clearFade(v)
  v.pause()
}

/**
 * Escape-room audio controls. Same shape on every caller (module-singleton).
 */
export function useEscapeRoomAudio() {
  function hydrate() {
    if (hydrated) return
    hydrated = true
    enabled.value = readStored()
  }

  /** Persist the on/off preference; turning OFF stops all current sound. */
  function setEnabled(on: boolean) {
    enabled.value = on
    writeStored(on)
    if (!on) {
      stopAmbientInternal(0)
      stopVoiceInternal()
    }
  }

  /**
   * Play ONE looping ambient bed, crossfading from the current one. Re-calling
   * with the same src is a no-op (the bed keeps playing — no restart). An
   * empty/falsy src stops the ambient.
   */
  function playAmbient(src: string, opts: { fadeMs?: number } = {}) {
    const fadeMs = opts.fadeMs ?? 600
    if (!enabled.value || !audioAvailable()) return
    if (!src) {
      stopAmbientInternal(fadeMs)
      return
    }
    if (ambient && ambientSrc === src) return // already on this bed — no restart

    // Fade the outgoing bed to 0 then pause it.
    stopAmbientInternal(fadeMs)

    const a = makeAudio(src)
    if (!a) return
    a.loop = true
    a.volume = 0
    ambient = a
    ambientSrc = src
    safePlay(a)
    fadeTo(a, AMBIENT_VOL, fadeMs)
  }

  function stopAmbient(fadeMs = 400) {
    stopAmbientInternal(fadeMs)
  }

  /** Fire-and-forget one-shot. MAY overlap other SFX. Tolerant of missing files. */
  function playSfx(src: string) {
    if (!enabled.value || !audioAvailable() || !src) return
    let a: HTMLAudioElement | null
    if (sfxPool.length < SFX_POOL_SIZE) {
      a = makeAudio(src)
      if (!a) return
      sfxPool.push(a)
    } else {
      // Reuse the oldest slot round-robin so overlapping SFX don't leak elements.
      a = sfxPool[sfxCursor] ?? null
      sfxCursor = (sfxCursor + 1) % SFX_POOL_SIZE
      if (!a) return
      try {
        a.pause()
        a.src = src
        a.currentTime = 0
      } catch {
        /* reassigning src on a dead element — give up on this one-shot */
        return
      }
    }
    a.loop = false
    a.volume = SFX_VOL
    safePlay(a)
  }

  /** Play ONE voice line; a new line replaces the previous. At VOICE_VOL. */
  function playVoice(src: string) {
    if (!enabled.value || !audioAvailable() || !src) return
    stopVoiceInternal()
    const a = makeAudio(src)
    if (!a) return
    a.loop = false
    a.volume = VOICE_VOL
    voice = a
    safePlay(a)
  }

  function stopVoice() {
    stopVoiceInternal()
  }

  /** Stop ambient + voice immediately; in-flight SFX one-shots finish naturally. */
  function stopAll() {
    stopAmbientInternal(0)
    stopVoiceInternal()
  }

  return {
    enabled: readonly(enabled),
    hydrate,
    setEnabled,
    playAmbient,
    stopAmbient,
    playSfx,
    playVoice,
    stopVoice,
    stopAll,
  }
}

// Test-only: clear singletons between cases.
export function _resetEscapeRoomAudioForTest() {
  for (const t of fadeTimers.values()) clearInterval(t)
  fadeTimers.clear()
  enabled.value = true
  hydrated = false
  ambient = null
  ambientSrc = ''
  voice = null
  sfxPool.length = 0
  sfxCursor = 0
}
