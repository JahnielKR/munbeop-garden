import type { MasteryLevel, ParticleDef, SrsState } from '../domain'

const RANK: Record<MasteryLevel, number> = { seedling: 0, plant: 1, tree: 2 }

/** Unique grammarKo taught by the lab, in particle-id order (de-duplicated). */
export function particleGrammarKos(defs: ParticleDef[]): string[] {
  const out: string[] = []
  for (const d of defs) if (!out.includes(d.grammarKo)) out.push(d.grammarKo)
  return out
}

export interface ParticleProgress {
  ko: string
  mastery: MasteryLevel
  /** mastery tier ≥ threshold. */
  done: boolean
}

export interface ParticleMasteryView {
  perParticle: ParticleProgress[]
  doneCount: number
  total: number
  /** Every tracked particle is done. */
  earned: boolean
}

/** Project the SRS map onto the tracked particle set at a mastery threshold. */
export function particleMastery(
  grammarKos: string[],
  srsMap: Record<string, SrsState>,
  threshold: MasteryLevel = 'tree',
): ParticleMasteryView {
  const need = RANK[threshold]
  const perParticle: ParticleProgress[] = grammarKos.map((ko) => {
    const mastery = srsMap[ko]?.mastery ?? 'seedling'
    return { ko, mastery, done: RANK[mastery] >= need }
  })
  const doneCount = perParticle.filter((p) => p.done).length
  return { perParticle, doneCount, total: grammarKos.length, earned: doneCount === grammarKos.length }
}
