/**
 * Grammar-example voice playback — one clip at a time. A sibling of
 * useParticleAudio: module singleton, SSR-safe, error-tolerant (404/codec/
 * autoplay → silent). No enable toggle / autoplay — opt-in via the 🔊 button.
 */
import { exampleAudioSrc } from '~/lib/grammar-examples/audio'

const VOICE_VOL = 0.95
let voice: HTMLAudioElement | null = null

function audioAvailable(): boolean {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined'
}
function makeAudio(src: string): HTMLAudioElement | null {
  if (!audioAvailable()) return null
  const a = new Audio(src)
  a.addEventListener('error', () => { /* 404 / codec — stay silent */ })
  return a
}
function safePlay(a: HTMLAudioElement | null) {
  if (!a) return
  try {
    const p = a.play()
    if (p && typeof (p as Promise<void>).catch === 'function') {
      ;(p as Promise<void>).catch(() => { /* autoplay blocked / missing — silent */ })
    }
  } catch { /* play() threw synchronously (test env) — silent */ }
}

export function useExampleAudio() {
  function playExample(sentence: string) {
    if (!audioAvailable() || !sentence) return
    if (voice) {
      try { voice.pause() } catch { /* dead element */ }
    }
    const a = makeAudio(exampleAudioSrc(sentence))
    if (!a) return
    a.volume = VOICE_VOL
    voice = a
    safePlay(a)
  }
  function stop() {
    if (!voice) return
    try { voice.pause() } catch { /* dead element */ }
    voice = null
  }
  return { playExample, stop }
}

// Test-only: clear the singleton between cases.
export function _resetExampleAudioForTest() {
  voice = null
}
