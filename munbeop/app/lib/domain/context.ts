import type { LocalizedString } from './i18n'

export interface Context {
  id: string
  /** Short Korean name shown as badge, e.g. "반말". NOT translated. */
  name: string
  /** Mini-scene explaining when this context applies, per locale. */
  scene: LocalizedString
  category: 'formalidad' | 'situacional' | 'custom'
  builtin: boolean
}

/**
 * True if the string contains at least one Hangul character — syllables
 * (가-힣), conjoining jamo (ᄀ-ᇿ), or compatibility jamo (ㄱ-ㆎ). Used to
 * keep custom context names visually consistent with the built-in Korean
 * badges (반말, 존댓말, …).
 */
export function isHangulName(value: string): boolean {
  return /[가-힣ᄀ-ᇿ㄰-㆏]/.test(value)
}
