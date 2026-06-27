/** FNV-1a 32-bit hex over the reading's UTF-8 bytes. Deterministic; the Python gen tool replicates it. */
export function numberMarketAudioId(reading: string): string {
  const bytes = new TextEncoder().encode(reading)
  let h = 0x811c9dc5
  for (const b of bytes) {
    h ^= b
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

/** Public asset path for a reading's pre-generated TTS clip. */
export function numberMarketAudioSrc(reading: string): string {
  return `/number-market/audio/${numberMarketAudioId(reading)}.ogg`
}
