import type { MarketItem, NumberDomain } from '~/lib/domain'
import { MARKET_ITEMS } from '~/seed/numbers-market'

/** Stable per-item id (MarketItem already carries one). */
export function itemId(i: MarketItem): string {
  return i.id
}

/** Items in a domain. */
export function itemsForDomainList(domain: NumberDomain, source: MarketItem[] = MARKET_ITEMS): MarketItem[] {
  return source.filter((i) => i.domain === domain)
}

/** A shuffled draw of up to `n` items from one domain. */
export function buildRound(
  domain: NumberDomain,
  n: number,
  shuffleFn: <T>(xs: T[]) => T[],
  source: MarketItem[] = MARKET_ITEMS,
): MarketItem[] {
  return shuffleFn(itemsForDomainList(domain, source)).slice(0, n)
}

export interface DrillResult { itemId: string; correct: boolean }
export interface DrillScore { correct: number; total: number; accuracy: number }

export function scoreOf(results: DrillResult[]): DrillScore {
  const correct = results.filter((r) => r.correct).length
  const total = results.length
  return { correct, total, accuracy: total === 0 ? 0 : correct / total }
}
