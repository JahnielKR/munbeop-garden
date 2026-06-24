/**
 * Audio asset naming for the pronunciation "sound it out" clips. One OGG per
 * unique syllable; the filename is the FNV-1a hash of the syllable so identical
 * syllables dedupe across grammar points. The Python gen tool + the manifest
 * contract test replicate this exact hash.
 */

/** FNV-1a 32-bit hex over the syllable's UTF-8 bytes. */
export function syllableAudioId(syllable: string): string {
  const bytes = new TextEncoder().encode(syllable)
  let h = 0x811c9dc5
  for (const b of bytes) {
    h ^= b
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

/** Public asset path for a syllable's pre-generated TTS clip. */
export function syllableAudioSrc(syllable: string): string {
  return `/pronunciation/audio/${syllableAudioId(syllable)}.ogg`
}
