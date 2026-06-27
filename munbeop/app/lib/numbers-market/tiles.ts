import type { MarketItem } from '~/lib/domain'

/** The unshuffled tile pool for an item: correct tiles followed by the lures. */
export function tilePool(item: MarketItem): string[] {
  return [...item.tiles, ...item.lures]
}
