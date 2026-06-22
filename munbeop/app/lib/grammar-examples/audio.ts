/** FNV-1a 32-bit hex over the sentence's UTF-8 bytes. Deterministic; the Python gen tool replicates it. */
export function exampleAudioId(sentence: string): string {
  const bytes = new TextEncoder().encode(sentence)
  let h = 0x811c9dc5
  for (const b of bytes) {
    h ^= b
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

/** Public asset path for a grammar example's pre-generated TTS clip. */
export function exampleAudioSrc(sentence: string): string {
  return `/grammar-examples/audio/${exampleAudioId(sentence)}.ogg`
}
