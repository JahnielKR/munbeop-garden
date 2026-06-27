import type { MarketItem, NumberDomain } from '~/lib/domain'
import { buildFromSpec, type GenSpec } from '~/lib/numbers-market/generate'

/**
 * Curated, audio-backed pool for Dictation (받아쓰기).
 *
 * Unlike Learn and Speed (which stream procedurally-generated items for endless
 * variety), Dictation needs a *finite* set so every reading has a pre-generated,
 * ear-checked TTS clip. Each entry below is a fixed spec rendered by the shared
 * number engine via {@link buildFromSpec} — so the Korean readings are correct
 * by construction, and the audio manifest (`tools/number-market-audio`) is
 * derived from these exact answers.
 *
 * ~15 per domain. Counter `nounIdx` indexes `COUNT_NOUNS` in `lib/.../glosses`
 * (−1 = age/살). To add variety, add a spec here and regenerate the audio.
 */
type SeedSpec = GenSpec & { id: string }

const SPECS: SeedSpec[] = [
  // ── counting (native prenominal + counter) ──
  { id: 'count-apple-3', domain: 'counting', nounIdx: 0, n: 3 },
  { id: 'count-apple-7', domain: 'counting', nounIdx: 0, n: 7 },
  { id: 'count-cat-2', domain: 'counting', nounIdx: 2, n: 2 },
  { id: 'count-dog-9', domain: 'counting', nounIdx: 3, n: 9 },
  { id: 'count-student-20', domain: 'counting', nounIdx: 4, n: 20 },
  { id: 'count-student-21', domain: 'counting', nounIdx: 4, n: 21 },
  { id: 'count-person-5', domain: 'counting', nounIdx: 5, n: 5 },
  { id: 'count-book-4', domain: 'counting', nounIdx: 7, n: 4 },
  { id: 'count-coffee-2', domain: 'counting', nounIdx: 9, n: 2 },
  { id: 'count-beer-6', domain: 'counting', nounIdx: 10, n: 6 },
  { id: 'count-car-1', domain: 'counting', nounIdx: 11, n: 1 },
  { id: 'count-rose-12', domain: 'counting', nounIdx: 13, n: 12 },
  { id: 'count-ticket-8', domain: 'counting', nounIdx: 15, n: 8 },
  { id: 'count-age-20', domain: 'counting', nounIdx: -1, n: 20 },
  { id: 'count-age-31', domain: 'counting', nounIdx: -1, n: 31 },

  // ── sino-basics (plain number) ──
  { id: 'sino-15', domain: 'sino-basics', n: 15 },
  { id: 'sino-16', domain: 'sino-basics', n: 16 },
  { id: 'sino-58', domain: 'sino-basics', n: 58 },
  { id: 'sino-60', domain: 'sino-basics', n: 60 },
  { id: 'sino-88', domain: 'sino-basics', n: 88 },
  { id: 'sino-100', domain: 'sino-basics', n: 100 },
  { id: 'sino-305', domain: 'sino-basics', n: 305 },
  { id: 'sino-350', domain: 'sino-basics', n: 350 },
  { id: 'sino-777', domain: 'sino-basics', n: 777 },
  { id: 'sino-1000', domain: 'sino-basics', n: 1000 },
  { id: 'sino-1250', domain: 'sino-basics', n: 1250 },
  { id: 'sino-2026', domain: 'sino-basics', n: 2026 },
  { id: 'sino-3000', domain: 'sino-basics', n: 3000 },
  { id: 'sino-4000', domain: 'sino-basics', n: 4000 },
  { id: 'sino-9999', domain: 'sino-basics', n: 9999 },

  // ── time (native hour + Sino minute) ──
  { id: 'time-1-00', domain: 'time', h: 1, m: 0 },
  { id: 'time-2-10', domain: 'time', h: 2, m: 10 },
  { id: 'time-2-25', domain: 'time', h: 2, m: 25 },
  { id: 'time-3-15', domain: 'time', h: 3, m: 15 },
  { id: 'time-4-40', domain: 'time', h: 4, m: 40 },
  { id: 'time-5-30', domain: 'time', h: 5, m: 30 },
  { id: 'time-6-45', domain: 'time', h: 6, m: 45 },
  { id: 'time-7-20', domain: 'time', h: 7, m: 20 },
  { id: 'time-8-08', domain: 'time', h: 8, m: 8 },
  { id: 'time-9-05', domain: 'time', h: 9, m: 5 },
  { id: 'time-9-55', domain: 'time', h: 9, m: 55 },
  { id: 'time-10-50', domain: 'time', h: 10, m: 50 },
  { id: 'time-11-11', domain: 'time', h: 11, m: 11 },
  { id: 'time-12-00', domain: 'time', h: 12, m: 0 },
  { id: 'time-12-30', domain: 'time', h: 12, m: 30 },

  // ── money (Sino + 만 grouping) ──
  { id: 'money-500', domain: 'money', n: 500 },
  { id: 'money-600', domain: 'money', n: 600 },
  { id: 'money-1000', domain: 'money', n: 1000 },
  { id: 'money-1500', domain: 'money', n: 1500 },
  { id: 'money-2500', domain: 'money', n: 2500 },
  { id: 'money-3000', domain: 'money', n: 3000 },
  { id: 'money-8000', domain: 'money', n: 8000 },
  { id: 'money-10000', domain: 'money', n: 10000 },
  { id: 'money-12000', domain: 'money', n: 12000 },
  { id: 'money-15000', domain: 'money', n: 15000 },
  { id: 'money-25000', domain: 'money', n: 25000 },
  { id: 'money-35000', domain: 'money', n: 35000 },
  { id: 'money-47000', domain: 'money', n: 47000 },
  { id: 'money-70000', domain: 'money', n: 70000 },
  { id: 'money-99000', domain: 'money', n: 99000 },

  // ── dates (Sino, month irregulars 유월/시월) ──
  { id: 'date-1-1', domain: 'dates', mth: 1, d: 1 },
  { id: 'date-2-28', domain: 'dates', mth: 2, d: 28 },
  { id: 'date-3-14', domain: 'dates', mth: 3, d: 14 },
  { id: 'date-4-19', domain: 'dates', mth: 4, d: 19 },
  { id: 'date-5-5', domain: 'dates', mth: 5, d: 5 },
  { id: 'date-6-15', domain: 'dates', mth: 6, d: 15 },
  { id: 'date-6-25', domain: 'dates', mth: 6, d: 25 },
  { id: 'date-7-7', domain: 'dates', mth: 7, d: 7 },
  { id: 'date-8-15', domain: 'dates', mth: 8, d: 15 },
  { id: 'date-9-9', domain: 'dates', mth: 9, d: 9 },
  { id: 'date-10-3', domain: 'dates', mth: 10, d: 3 },
  { id: 'date-10-9', domain: 'dates', mth: 10, d: 9 },
  { id: 'date-11-20', domain: 'dates', mth: 11, d: 20 },
  { id: 'date-12-25', domain: 'dates', mth: 12, d: 25 },
  { id: 'date-12-31', domain: 'dates', mth: 12, d: 31 },

  // ── phone / digit strings (Sino digit-by-digit, 공) ──
  { id: 'phone-110', domain: 'phone', digits: '110', groups: [3] },
  { id: 'phone-112', domain: 'phone', digits: '112', groups: [3] },
  { id: 'phone-114', domain: 'phone', digits: '114', groups: [3] },
  { id: 'phone-119', domain: 'phone', digits: '119', groups: [3] },
  { id: 'phone-120', domain: 'phone', digits: '120', groups: [3] },
  { id: 'phone-1004', domain: 'phone', digits: '1004', groups: [4] },
  { id: 'phone-02-1234', domain: 'phone', digits: '021234', groups: [2, 4] },
  { id: 'phone-010-0000', domain: 'phone', digits: '0100000', groups: [3, 4] },
  { id: 'phone-010-1234', domain: 'phone', digits: '0101234', groups: [3, 4] },
  { id: 'phone-010-2580', domain: 'phone', digits: '0102580', groups: [3, 4] },
  { id: 'phone-010-3456', domain: 'phone', digits: '0103456', groups: [3, 4] },
  { id: 'phone-010-9876', domain: 'phone', digits: '0109876', groups: [3, 4] },
  { id: 'phone-010-1111-2222', domain: 'phone', digits: '01011112222', groups: [3, 4, 4] },
  { id: 'phone-010-5678-1234', domain: 'phone', digits: '01056781234', groups: [3, 4, 4] },
  { id: 'phone-010-7777-8888', domain: 'phone', digits: '01077778888', groups: [3, 4, 4] },
]

export const MARKET_ITEMS: MarketItem[] = SPECS.map((s) => buildFromSpec(s, s.id))

export function itemsForDomain(domain: NumberDomain): MarketItem[] {
  return MARKET_ITEMS.filter((i) => i.domain === domain)
}
