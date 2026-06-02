/**
 * Weighted random selection without replacement.
 * @param pool - source items
 * @param n - desired count; capped at pool.length
 * @param weightOf - returns the weight for one item (must be > 0)
 * @param rng - injectable random; defaults to Math.random for production
 */
export function weightedPick<T>(
  pool: readonly T[],
  n: number,
  weightOf: (item: T) => number,
  rng: () => number = Math.random,
): T[] {
  const remaining = [...pool]
  const picks: T[] = []
  const take = Math.min(n, remaining.length)

  for (let i = 0; i < take; i++) {
    const weights = remaining.map(weightOf)
    const total = weights.reduce((a, b) => a + b, 0)
    if (total <= 0) {
      const idx = Math.floor(rng() * remaining.length)
      picks.push(remaining[idx]!)
      remaining.splice(idx, 1)
      continue
    }
    let r = rng() * total
    let chosen = 0
    for (let j = 0; j < weights.length; j++) {
      r -= weights[j]!
      if (r <= 0) {
        chosen = j
        break
      }
    }
    picks.push(remaining[chosen]!)
    remaining.splice(chosen, 1)
  }
  return picks
}

/**
 * Uniform-random selection without replacement (Fisher-Yates shuffle then slice).
 * Used for picking contexts where every option is equally valid.
 */
export function pickRandomFrom<T>(
  pool: readonly T[],
  n: number,
  rng: () => number = Math.random,
): T[] {
  const arr = [...pool]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr.slice(0, Math.min(n, arr.length))
}
