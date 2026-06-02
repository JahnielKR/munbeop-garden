import { pickRandomFrom, weightedPick } from '~/lib/srs'

export interface Pick<G, C> {
  grammarIdx: G
  contexts: C[]
  progress: number // 0..3 — number of contexts completed
}

export interface Session<G, C> {
  picks: Pick<G, C>[]
}

export interface CreateSessionParams<G, C> {
  grammarPool: readonly G[]
  contextPool: readonly C[]
  weightOf: (g: G) => number
  rng?: () => number
}

const PICK_COUNT = 3
const CONTEXTS_PER_PICK = 3

export function createSession<G, C>(p: CreateSessionParams<G, C>): Session<G, C> {
  const { grammarPool, contextPool, weightOf, rng = Math.random } = p
  if (grammarPool.length < PICK_COUNT) {
    throw new Error(`Need at least 3 grammar items, got ${grammarPool.length}`)
  }
  if (contextPool.length < CONTEXTS_PER_PICK) {
    throw new Error(`Need at least 3 context items, got ${contextPool.length}`)
  }
  const picked = weightedPick(grammarPool, PICK_COUNT, weightOf, rng)
  return {
    picks: picked.map((grammarIdx) => ({
      grammarIdx,
      contexts: pickRandomFrom(contextPool, CONTEXTS_PER_PICK, rng),
      progress: 0,
    })),
  }
}

export function currentPickOf<G, C>(s: Session<G, C>, i: number): Pick<G, C> {
  const p = s.picks[i]
  if (!p) throw new Error(`No pick at index ${i}`)
  return p
}

export function currentContextOf<G, C>(s: Session<G, C>, i: number): C | undefined {
  const p = currentPickOf(s, i)
  return p.contexts[p.progress]
}

export function advanceProgress<G, C>(s: Session<G, C>, i: number): void {
  const p = currentPickOf(s, i)
  if (p.progress < CONTEXTS_PER_PICK) p.progress++
}

export function isSessionComplete<G, C>(s: Session<G, C>): boolean {
  return s.picks.every((p) => p.progress >= CONTEXTS_PER_PICK)
}
