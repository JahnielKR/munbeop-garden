import type { LocaleCode, LocalizedString, MarketItem, NumberDomain } from '~/lib/domain'
import { LOCALE_CODES } from '~/lib/domain'
import {
  nativeNumber, nativePrenominal, sinoCardinal, sinoDigitString, sinoMonth, sinoNumber, timeReading,
} from '~/lib/korean/numbers'
import { AGE_NOUN, COUNT_NOUNS, MONTHS, WON, sameAll, type NounDef } from './glosses'

/**
 * Procedural Number Market item generator.
 *
 * Learn and Speed draw an effectively unlimited stream of items from here so
 * the practice never feels predictable. Every Korean *reading* is produced by
 * the golden number engine (`~/lib/korean/numbers`), so correctness is
 * guaranteed by that module's tests; only the gloss vocabulary is curated
 * (see `./glosses`). Lures are authentic L2 errors (wrong number system,
 * wrong grouping, digit-vs-cardinal misreads) so the tile tray stays
 * pedagogically honest.
 *
 * The same builders back the curated Dictation seed (`~/seed/numbers-market`)
 * via {@link buildFromSpec} with fixed, no-RNG specs — one shaping
 * implementation for both the random stream and the audio-backed pool.
 */

export type Rng = () => number

/** A deterministic recipe for one item. The Dictation seed is a list of these. */
export type GenSpec =
  | { domain: 'counting'; nounIdx: number; n: number } // nounIdx < 0 → age (살)
  | { domain: 'sino-basics'; n: number }
  | { domain: 'time'; h: number; m: number }
  | { domain: 'money'; n: number }
  | { domain: 'dates'; mth: number; d: number }
  | { domain: 'phone'; digits: string; groups: number[] }

export const GEN_DOMAINS: NumberDomain[] = ['counting', 'sino-basics', 'time', 'money', 'dates', 'phone']

// ── small pure helpers ───────────────────────────────────────────────────────

function randInt(lo: number, hi: number, rng: Rng): number {
  return lo + Math.floor(rng() * (hi - lo + 1))
}
function pick<T>(xs: readonly T[], rng: Rng): T {
  return xs[Math.floor(rng() * xs.length)]!
}
/** Group an integer with thousands separators ("12000" → "12,000"). Locale-free. */
function groupDigits(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
/** Build a {@link LocalizedString} from a per-locale function. */
function buildGloss(fn: (code: LocaleCode) => string): LocalizedString {
  const out = {} as LocalizedString
  for (const code of LOCALE_CODES) out[code] = fn(code)
  return out
}
/** Up to `count` distinct, non-empty candidates that aren't already tiles. */
function chooseLures(cands: string[], tiles: string[], count = 2): string[] {
  const exclude = new Set(tiles)
  const out: string[] = []
  for (const c of cands) {
    if (!c || exclude.has(c) || out.includes(c)) continue
    out.push(c)
    if (out.length >= count) break
  }
  return out
}
/** Read a number with western thousand-grouping (a common 만-vs-천 error). */
function westernThousands(n: number): string {
  const th = Math.floor(n / 1000)
  const rem = n % 1000
  let s = ''
  if (th) s += sinoCardinal(th) + '천'
  if (rem) s += sinoCardinal(rem)
  return s || sinoCardinal(n)
}

// ── per-domain builders ──────────────────────────────────────────────────────

function buildCounting(nounIdx: number, n: number, id: string): MarketItem {
  const noun: NounDef = nounIdx < 0 ? AGE_NOUN : COUNT_NOUNS[nounIdx]!
  const prenom = nativePrenominal(n)
  const answer = `${prenom} ${noun.counter}`
  const display = noun.bareDisplay ? `${n}${noun.counter}` : `${noun.ko} ${n}${noun.counter}`
  const tiles = [prenom, noun.counter]
  const near = n >= 99 ? n - 1 : n + 1
  const near2 = n >= 98 ? n - 2 : n + 2
  const lures = chooseLures([sinoNumber(n), nativeNumber(n), nativePrenominal(near), nativePrenominal(near2)], tiles)
  const trans = buildGloss((code) => `${n} ${noun.gloss[code]}`)
  return { id, domain: 'counting', display, answer, tiles, lures, valueKey: String(n), trans }
}

function buildSino(n: number, id: string): MarketItem {
  const answer = sinoCardinal(n)
  const display = groupDigits(n)
  const tiles = answer.split(' ')
  const cands: string[] = []
  if (n <= 99) cands.push(nativeNumber(n))
  else if (/^[십백천]/.test(answer)) cands.push('일' + answer) // natural 일백/일천 leading-1 error
  if (n >= 2) cands.push(sinoCardinal(n - 1))
  cands.push(sinoCardinal(n + 1))
  if (n >= 11) cands.push(sinoCardinal(n - (n % 10) + ((n % 10) + 5) % 10)) // ones-digit swap
  const lures = chooseLures(cands, tiles)
  return { id, domain: 'sino-basics', display, answer, tiles, lures, valueKey: String(n), trans: sameAll(display) }
}

function buildTime(h: number, m: number, id: string): MarketItem {
  const answer = timeReading(h, m)
  const display = `${h}:${String(m).padStart(2, '0')}`
  const tiles = answer.split(' ')
  const cands = [sinoNumber(h)]
  if (m > 0) cands.push(nativeNumber(m))
  cands.push(nativePrenominal(h >= 12 ? h - 1 : h + 1))
  cands.push(nativeNumber(h))
  const lures = chooseLures(cands, tiles)
  return { id, domain: 'time', display, answer, tiles, lures, valueKey: display, trans: sameAll(display) }
}

function buildMoney(n: number, id: string): MarketItem {
  const answer = `${sinoCardinal(n)} 원`
  const display = `₩${groupDigits(n)}`
  const tiles = answer.split(' ')
  const cands: string[] = []
  if (n >= 10000) {
    cands.push(westernThousands(n), westernThousands(n + 1000), westernThousands(Math.max(1000, n - 1000)))
  } else {
    if (/^[천백십]/.test(tiles[0]!)) cands.push('일' + tiles[0]!)
    cands.push(sinoCardinal(n >= 200 ? n - 100 : n + 100))
    cands.push(sinoCardinal(n + 100))
    cands.push(sinoCardinal(n + 1000 < 10000 ? n + 1000 : Math.max(100, n - 1000)))
  }
  const lures = chooseLures(cands, tiles)
  return { id, domain: 'money', display, answer, tiles, lures, valueKey: String(n), trans: moneyGloss(n) }
}

function buildDate(mth: number, d: number, id: string): MarketItem {
  const monthTok = sinoMonth(mth)
  const answer = `${monthTok} ${sinoCardinal(d)} 일`
  const display = `${mth}/${d}`
  const tiles = [monthTok, sinoCardinal(d), '일']
  const cands: string[] = []
  if (mth === 6) cands.push('육월')
  else if (mth === 10) cands.push('십월')
  else cands.push(sinoMonth(mth === 12 ? 11 : mth + 1))
  cands.push(nativeNumber(d))
  cands.push(sinoCardinal(d >= 28 ? d - 1 : d + 1))
  const lures = chooseLures(cands, tiles)
  return { id, domain: 'dates', display, answer, tiles, lures, valueKey: `${mth}/${d}`, trans: dateGloss(mth, d) }
}

function buildPhone(digits: string, groups: number[], id: string): MarketItem {
  const chunks: string[] = []
  let i = 0
  for (const g of groups) { chunks.push(digits.slice(i, i + g)); i += g }
  const tiles = chunks.map(sinoDigitString)
  const answer = tiles.join(' ')
  const display = chunks.join('-')
  const cands: string[] = []
  const zeroChunk = tiles.find((t) => t.includes('공'))
  if (zeroChunk) cands.push(zeroChunk.replace(/공/g, '영'))
  const cardChunk = chunks.reduce((a, b) => (b.length > a.length ? b : a), '')
  const cardVal = parseInt(cardChunk, 10)
  if (cardChunk.length >= 2 && cardVal >= 1 && cardVal <= 9999) cands.push(sinoCardinal(cardVal))
  const fc = chunks[0]!
  cands.push(sinoDigitString(fc.slice(0, -1) + (fc[fc.length - 1] === '0' ? '1' : '0')))
  const lures = chooseLures(cands, tiles)
  return { id, domain: 'phone', display, answer, tiles, lures, valueKey: digits, trans: sameAll(display) }
}

// ── glosses that depend on numeric params ────────────────────────────────────

function moneyGloss(n: number): LocalizedString {
  const grouped = groupDigits(n)
  return buildGloss((code) => `${grouped} ${WON[code]}`)
}
function dateGloss(mth: number, d: number): LocalizedString {
  // Each locale writes dates its own way: en is month-day, ja is 6月15日,
  // and es/fr/pt/th/id/vi are all day-month.
  return buildGloss((code) => {
    const mn = MONTHS[code][mth - 1]!
    switch (code) {
      case 'en': return `${mn} ${d}`
      case 'ja': return `${mn}${d}日`
      case 'es': case 'pt-BR': return `${d} de ${mn}`
      default: return `${d} ${mn}` // fr / th / id / vi
    }
  })
}

// ── public API ───────────────────────────────────────────────────────────────

/** Deterministically build one item from a fixed spec (used by the seed). */
export function buildFromSpec(spec: GenSpec, id: string): MarketItem {
  switch (spec.domain) {
    case 'counting': return buildCounting(spec.nounIdx, spec.n, id)
    case 'sino-basics': return buildSino(spec.n, id)
    case 'time': return buildTime(spec.h, spec.m, id)
    case 'money': return buildMoney(spec.n, id)
    case 'dates': return buildDate(spec.mth, spec.d, id)
    case 'phone': return buildPhone(spec.digits, spec.groups, id)
  }
}

/** A random spec for a domain, drawn from curated ranges. */
export function randomSpec(domain: NumberDomain, rng: Rng): GenSpec {
  switch (domain) {
    case 'counting':
      return rng() < 0.18
        ? { domain, nounIdx: -1, n: randInt(1, 60, rng) }
        : { domain, nounIdx: randInt(0, COUNT_NOUNS.length - 1, rng), n: randInt(1, 50, rng) }
    case 'sino-basics': {
      const r = rng()
      const n = r < 0.34 ? randInt(10, 99, rng) : r < 0.67 ? randInt(100, 999, rng) : randInt(1000, 9999, rng)
      return { domain, n }
    }
    case 'time':
      return { domain, h: randInt(1, 12, rng), m: rng() < 0.12 ? 0 : randInt(1, 59, rng) }
    case 'money': {
      const r = rng()
      const n = r < 0.25 ? randInt(1, 9, rng) * 100
        : r < 0.55 ? randInt(1, 9, rng) * 1000 + randInt(0, 9, rng) * 100
        : r < 0.85 ? randInt(1, 9, rng) * 10000 + randInt(0, 9, rng) * 1000
        : randInt(1, 9, rng) * 10000
      return { domain, n }
    }
    case 'dates':
      return { domain, mth: randInt(1, 12, rng), d: randInt(1, 28, rng) }
    case 'phone': {
      const r = rng()
      if (r < 0.22) {
        const code = pick(['119', '112', '114', '120', '110', '118', '1004'], rng)
        return { domain, digits: code, groups: [code.length] }
      }
      const four = () => String(randInt(0, 9999, rng)).padStart(4, '0')
      return r < 0.6
        ? { domain, digits: '010' + four(), groups: [3, 4] }
        : { domain, digits: '010' + four() + four(), groups: [3, 4, 4] }
    }
  }
}

/**
 * A fresh batch of `n` items for a deck (a domain, or 'mixed' across all),
 * avoiding duplicate prompts within the batch. Each item carries a unique id.
 */
export function generateItems(deck: NumberDomain | 'mixed', n: number, rng: Rng = Math.random): MarketItem[] {
  const out: MarketItem[] = []
  const seen = new Set<string>()
  let attempts = 0
  while (out.length < n && attempts < n * 30 + 50) {
    attempts++
    const domain = deck === 'mixed' ? pick(GEN_DOMAINS, rng) : deck
    const item = buildFromSpec(randomSpec(domain, rng), `gen-${domain}-${attempts}`)
    if (seen.has(item.display)) continue
    seen.add(item.display)
    out.push(item)
  }
  return out
}
