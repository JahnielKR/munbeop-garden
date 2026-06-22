import type { Counter, CountItem } from '~/lib/domain'
import { nativeNumber, nativePrenominal, sinoNumber } from '~/lib/korean'
import { counterById } from '~/seed/counters'

function render(quantity: number, system: 'native' | 'sino', ko: string): string {
  const num = system === 'native' ? nativePrenominal(quantity) : sinoNumber(quantity)
  return `${num} ${ko}`
}

/**
 * Three wrong renderings for a count, in priority order:
 *  1. wrong system  — render with the OTHER number system (세 권 → 삼 권)
 *  2. wrong prenominal — native cardinal instead of prenominal (세 권 → 셋 권)
 *  3. wrong counter — same number, a sibling counter of the same system (세 권 → 세 개)
 * Deduped, never equal to the answer; cross-counter fillers guarantee exactly 3.
 */
export function buildDistractors(item: CountItem, counters: readonly Counter[]): string[] {
  const self = counterById(item.counterId)
  const ko = self?.ko ?? item.answer.split(' ').slice(1).join(' ')

  const wrongSystem = render(item.quantity, item.system === 'native' ? 'sino' : 'native', ko)
  const wrongPrenominal = item.system === 'native' ? `${nativeNumber(item.quantity)} ${ko}` : null

  const seen = new Set<string>([item.answer])
  const picked: string[] = []
  const tryAdd = (s: string | null) => {
    if (!s || seen.has(s)) return
    seen.add(s)
    picked.push(s)
  }

  tryAdd(wrongSystem)
  tryAdd(wrongPrenominal)

  // wrong counter: same number (item's own system), a different counter's ko —
  // same-system counters first for plausibility, then any.
  const sameSystem = counters.filter((c) => c.ko !== ko && c.system === item.system)
  const other = counters.filter((c) => c.ko !== ko && c.system !== item.system)
  for (const c of [...sameSystem, ...other]) {
    if (picked.length >= 3) break
    const num = item.system === 'native' ? nativePrenominal(item.quantity) : sinoNumber(item.quantity)
    tryAdd(`${num} ${c.ko}`)
  }
  return picked.slice(0, 3)
}
