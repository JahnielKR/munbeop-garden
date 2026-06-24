/**
 * Pronunciation "sound it out" playback — a sibling of useExampleAudio.
 * Module singleton, SSR-safe, error-tolerant (404/codec/autoplay → silent).
 * No enable toggle / autoplay — opt-in via the chips / play-all button.
 *
 * playSyllable: one syllable clip. playAll: the grammar's syllables in order,
 * chained on each clip's `ended` event (so timing follows the real audio, not
 * a guessed delay), with a small gap. A new play or stop() supersedes a running
 * sequence via a monotonic token.
 */
import { syllableAudioSrc } from '~/lib/pronunciation/audio'

const VOICE_VOL = 0.95
let current: HTMLAudioElement | null = null
let seq = 0

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

export function usePronunciationAudio() {
  function stop() {
    seq++ // invalidate any running sequence
    if (current) {
      try { current.pause() } catch { /* dead element */ }
      current = null
    }
  }

  function playSyllable(syllable: string) {
    if (!audioAvailable() || !syllable) return
    stop()
    const a = makeAudio(syllableAudioSrc(syllable))
    if (!a) return
    a.volume = VOICE_VOL
    current = a
    safePlay(a)
  }

  /** Play each syllable in order, advancing on `ended`, with a gap between. */
  function playAll(syllables: readonly string[], gapMs = 130) {
    if (!audioAvailable() || syllables.length === 0) return
    stop()
    const token = ++seq
    let i = 0
    const playNext = () => {
      if (token !== seq) return // superseded
      if (i >= syllables.length) { current = null; return }
      const syl = syllables[i++]!
      const a = makeAudio(syllableAudioSrc(syl))
      if (!a) return
      a.volume = VOICE_VOL
      current = a
      a.addEventListener('ended', () => {
        if (token !== seq) return
        if (gapMs > 0) setTimeout(playNext, gapMs)
        else playNext()
      })
      safePlay(a)
    }
    playNext()
  }

  return { playSyllable, playAll, stop }
}

// Test-only: clear the singleton between cases.
export function _resetPronunciationAudioForTest() {
  current = null
  seq = 0
}
