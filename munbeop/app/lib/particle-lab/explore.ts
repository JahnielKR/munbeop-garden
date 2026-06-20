import type { LabReading, LabSentence, ParticleId } from '../domain/particles'

function keyOf(ids: Iterable<ParticleId>): string {
  return [...ids].sort().join('+')
}

/**
 * Find the explicit reading for the current OFF set.
 * Returns null for the all-ON state AND for unlisted combos — the caller
 * falls back to `sentence.trans` (+ a generic colloquial nuance for combos).
 */
export function readingFor(
  sentence: LabSentence,
  off: ReadonlySet<ParticleId>,
): LabReading | null {
  if (off.size === 0) return null
  const key = keyOf(off)
  return sentence.readings.find((r) => keyOf(r.off) === key) ?? null
}

/** Unique toggleable particle ids present in a sentence, in reading order. */
export function toggleableIds(sentence: LabSentence): ParticleId[] {
  const out: ParticleId[] = []
  for (const eojeol of sentence.eojeols)
    for (const token of eojeol)
      if (token.kind === 'particle' && token.toggleable && !out.includes(token.particleId))
        out.push(token.particleId)
  return out
}

/** All particle ids (toggleable or not) — feeds the legend. */
export function particleIds(sentence: LabSentence): ParticleId[] {
  const out: ParticleId[] = []
  for (const eojeol of sentence.eojeols)
    for (const token of eojeol)
      if (token.kind === 'particle' && !out.includes(token.particleId))
        out.push(token.particleId)
  return out
}

/** First sentence index containing a particle — deep link ?focus=<id>. */
export function indexOfParticle(sentences: LabSentence[], id: ParticleId): number {
  return sentences.findIndex((s) => particleIds(s).includes(id))
}
