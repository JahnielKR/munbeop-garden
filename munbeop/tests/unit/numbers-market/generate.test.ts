import { describe, it, expect } from 'vitest'
import { generateItems, buildFromSpec, randomSpec, GEN_DOMAINS, type GenSpec } from '~/lib/numbers-market/generate'
import { LOCALE_CODES, type NumberDomain } from '~/lib/domain'

/** Deterministic LCG so each test is reproducible without Math.random. */
function lcg(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

describe('number-market generator', () => {
  it('every generated item satisfies the MarketItem invariants', () => {
    for (const domain of GEN_DOMAINS) {
      const rng = lcg(domain.length * 101 + 7)
      // A large sample to exercise the random ranges.
      for (let batch = 0; batch < 40; batch++) {
        for (const it of generateItems(domain, 6, rng)) {
          expect(it.domain, it.id).toBe(domain)
          expect(it.tiles.join(' '), `${it.id} tiles join`).toBe(it.answer)
          expect(it.lures.length, `${it.id} has lures`).toBeGreaterThan(0)
          expect(new Set(it.lures).size, `${it.id} unique lures`).toBe(it.lures.length)
          for (const lure of it.lures) {
            expect(lure.length, `${it.id} empty lure`).toBeGreaterThan(0)
            expect(it.tiles.includes(lure), `${it.id} lure ${lure} collides`).toBe(false)
          }
          expect(it.valueKey.length, `${it.id} valueKey`).toBeGreaterThan(0)
          expect(it.display.length, `${it.id} display`).toBeGreaterThan(0)
          for (const code of LOCALE_CODES) expect(it.trans[code], `${it.id} ${code}`).toBeTruthy()
        }
      }
    }
  })

  it('mixed deck spans every domain', () => {
    const items = generateItems('mixed', 300, lcg(99))
    const domains = new Set(items.map((i) => i.domain))
    for (const d of GEN_DOMAINS) expect(domains.has(d), d).toBe(true)
  })

  it('a single batch has no duplicate prompts or ids', () => {
    const items = generateItems('counting', 30, lcg(5))
    expect(new Set(items.map((i) => i.display)).size).toBe(items.length)
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length)
  })

  it('is deterministic for a given rng seed', () => {
    const a = generateItems('money', 12, lcg(42)).map((i) => i.answer)
    const b = generateItems('money', 12, lcg(42)).map((i) => i.answer)
    expect(a).toEqual(b)
  })

  it('renders the golden readings for known specs', () => {
    const cases: Array<[GenSpec, string, string[]]> = [
      [{ domain: 'counting', nounIdx: 0, n: 3 }, '세 개', ['세', '개']],
      [{ domain: 'counting', nounIdx: -1, n: 20 }, '스무 살', ['스무', '살']],
      [{ domain: 'counting', nounIdx: 4, n: 21 }, '스물한 명', ['스물한', '명']],
      [{ domain: 'sino-basics', n: 16 }, '십육', ['십육']],
      [{ domain: 'sino-basics', n: 350 }, '삼백오십', ['삼백오십']],
      [{ domain: 'time', h: 3, m: 15 }, '세 시 십오 분', ['세', '시', '십오', '분']],
      [{ domain: 'time', h: 12, m: 0 }, '열두 시', ['열두', '시']],
      [{ domain: 'money', n: 12000 }, '만 이천 원', ['만', '이천', '원']],
      [{ domain: 'dates', mth: 6, d: 15 }, '유월 십오 일', ['유월', '십오', '일']],
      [{ domain: 'dates', mth: 10, d: 3 }, '시월 삼 일', ['시월', '삼', '일']],
      [{ domain: 'phone', digits: '0101234', groups: [3, 4] }, '공일공 일이삼사', ['공일공', '일이삼사']],
    ]
    for (const [spec, answer, tiles] of cases) {
      const it = buildFromSpec(spec, 'x')
      expect(it.answer, JSON.stringify(spec)).toBe(answer)
      expect(it.tiles, JSON.stringify(spec)).toEqual(tiles)
    }
  })

  it('valueKey round-trips the displayed quantity for typed grading', () => {
    expect(buildFromSpec({ domain: 'time', h: 9, m: 5 }, 'x').valueKey).toBe('9:05')
    expect(buildFromSpec({ domain: 'dates', mth: 6, d: 15 }, 'x').valueKey).toBe('6/15')
    expect(buildFromSpec({ domain: 'phone', digits: '0101234', groups: [3, 4] }, 'x').valueKey).toBe('0101234')
    expect(buildFromSpec({ domain: 'money', n: 25000 }, 'x').valueKey).toBe('25000')
  })

  it('randomSpec stays within the engine-supported ranges', () => {
    for (const domain of GEN_DOMAINS as NumberDomain[]) {
      const rng = lcg(domain.length + 13)
      for (let i = 0; i < 200; i++) {
        const spec = randomSpec(domain, rng)
        expect(() => buildFromSpec(spec, 's')).not.toThrow()
      }
    }
  })
})
