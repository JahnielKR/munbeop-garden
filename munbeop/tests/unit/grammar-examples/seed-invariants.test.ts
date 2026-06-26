import { describe, it, expect } from 'vitest'
import { GRAMMAR_EXAMPLES } from '~/seed/grammar-examples'
import { DEFAULT_GRAMMAR } from '~/seed/grammars'
import { LOCALE_CODES } from '~/lib/domain'

const KNOWN_KO = new Set(DEFAULT_GRAMMAR.map((g) => g.ko))
const LEVELS = new Set(['formal', 'polite', 'casual'])
const HANGUL = /^[가-힣ㄱ-ㅎㅏ-ㅣ0-9\s.,!?~%()'"·…\-/]+$/

describe('grammar-examples seed invariants', () => {
  it('is non-empty', () => {
    expect(GRAMMAR_EXAMPLES.length).toBeGreaterThan(0)
  })
  for (const [i, ex] of GRAMMAR_EXAMPLES.entries()) {
    it(`#${i} ${ex.ko} → "${ex.sentence}" is well-formed`, () => {
      expect(KNOWN_KO.has(ex.ko)).toBe(true)
      expect(LEVELS.has(ex.level)).toBe(true)
      expect(ex.sentence.trim().length).toBeGreaterThan(0)
      expect(ex.sentence).toMatch(HANGUL)
      for (const code of LOCALE_CODES) {
        expect((ex.trans as Record<string, string>)[code]?.trim().length ?? 0).toBeGreaterThan(0)
      }
    })
  }

  // Coverage: the TOPIK-1 batch must cover all 12 target points, ≥2 each.
  const TOPIK_1_BATCH = [
    '-아/어요', '-았/었어요', '-ㅂ/습니다', '-(으)세요', '-(으)ㄹ 거예요', '-고',
    '-아/어서', '-지만', '-(으)면', '-ㄴ/는데', '-고 싶다', '-고 있다',
  ]
  for (const ko of TOPIK_1_BATCH) {
    it(`covers ${ko} with ≥2 examples`, () => {
      expect(GRAMMAR_EXAMPLES.filter((e) => e.ko === ko).length).toBeGreaterThanOrEqual(2)
    })
  }

  // Per-FORM coverage for the TOPIK-1 Tier-1 two-form grammars: each grammar
  // whose `ko` names ≥2 distinct surface forms must show an example per form,
  // so the learner sees every alternative — not just one. Each regex matches
  // the form as it surfaces in at least one of that grammar's examples.
  const TIER1_FORM_COVERAGE: Array<{ ko: string; forms: Array<{ label: string; re: RegExp }> }> = [
    { ko: '은/는', forms: [{ label: '은', re: /[가-힣]은[\s.]/ }, { label: '는', re: /[가-힣]는[\s.]/ }] },
    { ko: '이/가', forms: [{ label: '이', re: /[가-힣]이[\s.]/ }, { label: '가', re: /[가-힣]가[\s.]/ }] },
    { ko: '을/를', forms: [{ label: '을', re: /[가-힣]을[\s.]/ }, { label: '를', re: /[가-힣]를[\s.]/ }] },
    { ko: '와/과 · 하고 · (이)랑', forms: [{ label: '와/과', re: /[가-힣][와과][\s.]/ }, { label: '하고', re: /하고/ }, { label: '(이)랑', re: /[가-힣]랑[\s.]/ }] },
    { ko: '에게 / 한테 / 께', forms: [{ label: '에게', re: /에게/ }, { label: '한테', re: /한테/ }, { label: '께', re: /[가-힣]께[\s.]/ }] },
    { ko: '부터 / 까지', forms: [{ label: '부터', re: /부터/ }, { label: '까지', re: /까지/ }] },
    { ko: 'N(이)랑 / 하고 + 같이 / 함께', forms: [{ label: '함께', re: /함께/ }, { label: '같이', re: /같이/ }] },
    { ko: '이다 / 아니다', forms: [{ label: '이다', re: /(이에요|예요|입니다)/ }, { label: '아니다', re: /아니(에요|다|ㅂ니다)/ }] },
    { ko: '있다 / 없다', forms: [{ label: '있다', re: /있(어요|다|습니다|어)/ }, { label: '없다', re: /없(어요|다|습니다|어)/ }] },
    { ko: '-(으)ㄴ 적이 있다/없다', forms: [{ label: '적이 있다', re: /적이 있/ }, { label: '적이 없다', re: /적이 없/ }] },
    { ko: '안 + V / -지 않다', forms: [{ label: '안+V', re: /안 [가-힣]/ }, { label: '-지 않다', re: /지 않/ }] },
    { ko: '못 + V / -지 못하다', forms: [{ label: '못+V', re: /못 [가-힣]/ }, { label: '-지 못하다', re: /지 못/ }] },
    { ko: '좋아하다 / 싫어하다', forms: [{ label: '좋아하다', re: /좋아(해|하)/ }, { label: '싫어하다', re: /싫어(해|하)/ }] },
    { ko: '이 / 그 / 저', forms: [{ label: '이', re: /(^|\s)이 [가-힣]/ }, { label: '그', re: /(^|\s)그 [가-힣]/ }, { label: '저', re: /(^|\s)저 [가-힣]/ }] },
    { ko: '-(으)러 가다/오다', forms: [{ label: '가다', re: /(갔|러 가)/ }, { label: '오다', re: /(왔|러 오)/ }] },
  ]
  for (const { ko, forms } of TIER1_FORM_COVERAGE) {
    for (const { label, re } of forms) {
      it(`${ko} demonstrates the ${label} form`, () => {
        const exs = GRAMMAR_EXAMPLES.filter((e) => e.ko === ko)
        expect(exs.some((e) => re.test(e.sentence))).toBe(true)
      })
    }
  }

  // Per-allomorph coverage: a point whose pattern has phonologically distinct
  // surface forms must demonstrate each one, so the learner sees the form
  // change with the stem — not just three sentences of the same shape.
  const ALLOMORPH_COVERAGE: Array<{ ko: string; label: string; match: RegExp }> = [
    { ko: '-아/어요', label: '하다 → 해요', match: /해요[.!?]/ },
    { ko: '-았/었어요', label: '하다 → 했어요', match: /했어요[.!?]/ },
    { ko: '-ㄴ/는데', label: '받침 형용사 → 은데', match: /은데/ },
  ]
  for (const { ko, label, match } of ALLOMORPH_COVERAGE) {
    it(`${ko} demonstrates the ${label} allomorph`, () => {
      const hit = GRAMMAR_EXAMPLES.some((e) => e.ko === ko && match.test(e.sentence))
      expect(hit).toBe(true)
    })
  }

  // "Above ≠ below": a bank example must never repeat its grammar's canonical
  // `Grammar.example` (which renders in MeaningSection). MeaningSection shows the
  // canonical; ExamplesSection shows the bank — they must differ.
  it('no bank sentence duplicates its grammar canonical example', () => {
    const canonical = new Map(DEFAULT_GRAMMAR.map((g) => [g.ko, g.example]))
    const offenders = GRAMMAR_EXAMPLES.filter((e) => e.sentence === canonical.get(e.ko))
    expect(offenders.map((e) => `${e.ko}: ${e.sentence}`)).toEqual([])
  })
})
