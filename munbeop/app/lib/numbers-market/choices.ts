import type { MarketItem } from '~/lib/domain'

/**
 * Four distinct whole-reading options for Speed mode: the correct `answer` plus
 * three distractors — same-domain sibling answers first (more confusable), then
 * filled from other domains if the domain has too few items. Pure; the caller
 * passes the shuffle so it stays deterministic in tests.
 */
export function choicesFor(
  item: MarketItem,
  source: readonly MarketItem[],
  shuffleFn: <T>(xs: T[]) => T[],
): string[] {
  const seen = new Set<string>([item.answer])
  const picked: string[] = []
  const sameDomain = shuffleFn(source.filter((i) => i.domain === item.domain && i.answer !== item.answer))
  const otherDomain = shuffleFn(source.filter((i) => i.domain !== item.domain))
  for (const cand of [...sameDomain, ...otherDomain]) {
    if (picked.length >= 3) break
    if (seen.has(cand.answer)) continue
    seen.add(cand.answer)
    picked.push(cand.answer)
  }
  return shuffleFn([item.answer, ...picked])
}
