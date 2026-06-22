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
  /**
   * When set, no more than `maxCapped` picks (default 1) may satisfy this
   * predicate. Used to stop a single leech from dominating a draw — the SRS
   * weight formula deliberately over-draws leeches, so this is the counter-force.
   */
  capPredicate?: (g: G) => boolean
  maxCapped?: number
}

const PICK_COUNT = 3
const CONTEXTS_PER_PICK = 3

export function createSession<G, C>(p: CreateSessionParams<G, C>): Session<G, C> {
  const { grammarPool, contextPool, weightOf, rng = Math.random, capPredicate, maxCapped = 1 } = p
  if (grammarPool.length < PICK_COUNT) {
    throw new Error(`Need at least 3 grammar items, got ${grammarPool.length}`)
  }
  if (contextPool.length < CONTEXTS_PER_PICK) {
    throw new Error(`Need at least 3 context items, got ${contextPool.length}`)
  }
  let picked = weightedPick(grammarPool, PICK_COUNT, weightOf, rng)
  if (capPredicate) {
    picked = capLeechPicks(picked, grammarPool, weightOf, capPredicate, maxCapped, rng)
  }
  return {
    picks: picked.map((grammarIdx) => ({
      grammarIdx,
      contexts: pickRandomFrom(contextPool, CONTEXTS_PER_PICK, rng),
      progress: 0,
    })),
  }
}

/**
 * Enforce a cap on how many drawn picks satisfy `isLeech`. Keeps the first
 * `maxLeeches` capped picks (in draw order) plus all non-capped picks, then
 * refills the freed slots from the non-leech remainder of the pool (still
 * weighted). If the non-leech pool can't fill the gap, the cap is relaxed
 * rather than ever returning fewer than `picked.length` picks.
 */
export function capLeechPicks<G>(
  picked: readonly G[],
  pool: readonly G[],
  weightOf: (g: G) => number,
  isLeech: (g: G) => boolean,
  maxLeeches: number,
  rng: () => number,
): G[] {
  if (picked.filter(isLeech).length <= maxLeeches) return [...picked]

  const keep: G[] = []
  let keptLeeches = 0
  for (const g of picked) {
    if (isLeech(g)) {
      if (keptLeeches < maxLeeches) {
        keep.push(g)
        keptLeeches++
      }
    } else {
      keep.push(g)
    }
  }

  const need = picked.length - keep.length
  if (need <= 0) return keep

  const keepSet = new Set(keep)
  const refillPool = pool.filter((g) => !isLeech(g) && !keepSet.has(g))
  const result = [...keep, ...weightedPick(refillPool, need, weightOf, rng)]

  // Non-leech pool exhausted — relax rather than under-fill the session.
  if (result.length < picked.length) {
    const have = new Set(result)
    for (const g of picked) {
      if (result.length >= picked.length) break
      if (!have.has(g)) {
        result.push(g)
        have.add(g)
      }
    }
  }
  return result
}

/**
 * Narrow a grammar-index pool to a single deck before drawing.
 * `deckId === null` keeps the whole pool — the "all levels" draw.
 */
export function filterPoolByDeck(
  pool: readonly number[],
  deckIdOf: (idx: number) => string | undefined,
  deckId: string | null,
): number[] {
  if (!deckId) return [...pool]
  return pool.filter((idx) => deckIdOf(idx) === deckId)
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

/**
 * Build a draw pool for a custom deck by mapping each grammar `ko` to its
 * catalog index. Unknown kos (deleted/renamed catalog items) are dropped, so
 * the engine never dereferences a missing row. Duplicate kos collapse to a
 * single index. Unlike {@link filterPoolByDeck} this bypasses the Library
 * `excludedDeckIds` gate entirely — a custom deck is the user's explicit
 * curation and is not subject to the global level filter.
 */
export function filterPoolByCustomDeck(
  grammarKos: readonly string[],
  indexOfKo: (ko: string) => number | undefined,
): number[] {
  return [
    ...new Set(
      grammarKos
        .map((ko) => indexOfKo(ko))
        .filter((idx): idx is number => idx !== undefined && idx >= 0),
    ),
  ]
}
