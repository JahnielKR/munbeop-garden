/**
 * Particle Lab voice playback — one sentence clip at a time.
 *
 * A trimmed sibling of useEscapeRoomAudio's voice channel: module singleton,
 * SSR-safe (guards `window`/`Audio`), error-tolerant (404/codec/autoplay → stay
 * silent). No enable toggle / autoplay — playback is opt-in via the 🔊 button,
 * so a missing OGG simply does nothing.
 */

import type { SpeechLevel } from '~/lib/domain'

const VOICE_VOL = 0.95

let voice: HTMLAudioElement | null = null

function audioAvailable(): boolean {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined'
}

function makeAudio(src: string): HTMLAudioElement | null {
  if (!audioAvailable()) return null
  const a = new Audio(src)
  a.addEventListener('error', () => {
    /* 404 / codec failure — stay silent */
  })
  return a
}

function safePlay(a: HTMLAudioElement | null) {
  if (!a) return
  try {
    const p = a.play()
    if (p && typeof (p as Promise<void>).catch === 'function') {
      ;(p as Promise<void>).catch(() => {
        /* autoplay blocked / file missing — stay silent */
      })
    }
  } catch {
    /* play() threw synchronously (test env) — stay silent */
  }
}

/** Public asset path for a sentence's audio clip at a speech level. */
export function sentenceAudioSrc(id: string, level: SpeechLevel = 'polite'): string {
  return `/particle-lab/audio/sentence-${id}-${level}.ogg`
}

export function useParticleAudio() {
  function playSentence(id: string, level: SpeechLevel = 'polite') {
    if (!audioAvailable() || !id) return
    if (voice) {
      try {
        voice.pause()
      } catch {
        /* dead element */
      }
    }
    const a = makeAudio(sentenceAudioSrc(id, level))
    if (!a) return
    a.volume = VOICE_VOL
    voice = a
    safePlay(a)
  }

  function stop() {
    if (!voice) return
    try {
      voice.pause()
    } catch {
      /* dead element */
    }
    voice = null
  }

  return { playSentence, stop }
}

// Test-only: clear the singleton between cases.
export function _resetParticleAudioForTest() {
  voice = null
}
