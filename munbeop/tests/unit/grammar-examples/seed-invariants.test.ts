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

  // Per-FORM coverage for the TOPIK-2 Tier-1 two-form grammars (plan Part B,
  // level 2). Each grammar with ≥2 named surface forms must show an example per
  // form; each regex matches the form as it surfaces in ≥1 of its examples.
  const TIER2_FORM_COVERAGE: Array<{ ko: string; forms: Array<{ label: string; re: RegExp }> }> = [
    { ko: '-(으)ㄴ 후에 / 다음에', forms: [{ label: '후에', re: /후에/ }, { label: '다음에', re: /다음에/ }] },
    { ko: '-(으)ㄹ 수 있다/없다', forms: [{ label: '수 있다', re: /수 있/ }, { label: '수 없다', re: /수 없/ }] },
    { ko: '-(으)ㄹ 필요가 있다/없다', forms: [{ label: '필요가 있다', re: /필요가 있/ }, { label: '필요가 없다', re: /필요가 없/ }] },
    { ko: '-고 나서 / -고 나면', forms: [{ label: '고 나서', re: /고 나서/ }, { label: '고 나면', re: /고 나면/ }] },
    { ko: '-군요 / -구나', forms: [{ label: '군요', re: /군요/ }, { label: '구나', re: /구나/ }] },
    { ko: '-기 쉽다/어렵다', forms: [{ label: '기 쉽다', re: /기 쉬/ }, { label: '기 어렵다', re: /기 어려/ }] },
    { ko: '-다고요? / -(이)라고요?', forms: [{ label: '다고요', re: /다고요/ }, { label: '(이)라고요', re: /라고요/ }] },
    { ko: '-아/어 놓다 / -아/어 두다', forms: [{ label: '놓다', re: /놓/ }, { label: '두다', re: /뒀|두었|둬/ }] },
    { ko: '-아/어야 하다 / 되다', forms: [{ label: '하다', re: /야 해|야 하/ }, { label: '되다', re: /야 돼|야 되/ }] },
    { ko: '-처럼 / -같이', forms: [{ label: '처럼', re: /처럼/ }, { label: '같이', re: /같이/ }] },
    { ko: '때문에 / 기 때문에', forms: [{ label: 'N때문에', re: /[^기] 때문에/ }, { label: '기 때문에', re: /기 때문에/ }] },
    { ko: '아무 N(이)나 / 아무 N도', forms: [{ label: '(이)나', re: /아무 [가-힣]+이나|아무 [가-힣]+나/ }, { label: '도', re: /아무 [가-힣]+도/ }] },
    { ko: '아직 / 벌써 / 이미', forms: [{ label: '아직', re: /아직/ }, { label: '벌써', re: /벌써/ }, { label: '이미', re: /이미/ }] },
  ]
  for (const { ko, forms } of TIER2_FORM_COVERAGE) {
    for (const { label, re } of forms) {
      it(`${ko} demonstrates the ${label} form`, () => {
        const exs = GRAMMAR_EXAMPLES.filter((e) => e.ko === ko)
        expect(exs.some((e) => re.test(e.sentence))).toBe(true)
      })
    }
  }

  // Per-FORM coverage for the TOPIK-3 Tier-1 two-form grammars (plan Part B,
  // level 3).
  const TIER3_FORM_COVERAGE: Array<{ ko: string; forms: Array<{ label: string; re: RegExp }> }> = [
    { ko: '-(으)ㄴ/는 줄 알다/몰랐다', forms: [{ label: '줄 알다', re: /줄 알/ }, { label: '줄 몰랐다', re: /줄 몰랐/ }] },
    { ko: '-(으)ㄹ 줄 알다/모르다', forms: [{ label: '줄 알다', re: /줄 알/ }, { label: '줄 모르다', re: /줄 몰라|줄 모르/ }] },
    { ko: '-기 위해(서) / -을/를 위해(서)', forms: [{ label: '기 위해', re: /기 위해/ }, { label: '을/를 위해', re: /[을를] 위해/ }] },
    { ko: '-는다면 / -(이)라면', forms: [{ label: '는다면', re: /다면/ }, { label: '(이)라면', re: /라면/ }] },
  ]
  for (const { ko, forms } of TIER3_FORM_COVERAGE) {
    for (const { label, re } of forms) {
      it(`${ko} demonstrates the ${label} form`, () => {
        const exs = GRAMMAR_EXAMPLES.filter((e) => e.ko === ko)
        expect(exs.some((e) => re.test(e.sentence))).toBe(true)
      })
    }
  }

  // Per-FORM coverage for the TOPIK-4 Tier-1 grammars (plan Part B, level 4) —
  // incl. the -다고 + cognition-verb slot (≥2 representative verbs shown).
  const TIER4_FORM_COVERAGE: Array<{ ko: string; forms: Array<{ label: string; re: RegExp }> }> = [
    { ko: '-냐고 하다 / -(으)냐고 묻다', forms: [{ label: '냐고 하다', re: /냐고 (하|했|해)/ }, { label: '냐고 묻다', re: /냐고 (묻|물)/ }] },
    { ko: '-(으)ㄹ 듯하다 / -(으)ㄹ 듯이', forms: [{ label: '듯하다', re: /듯(하|해|합)/ }, { label: '듯이', re: /듯이/ }] },
    { ko: '-(으)로서 / -(으)로써', forms: [{ label: '로서', re: /로서/ }, { label: '로써', re: /로써/ }] },
    { ko: '-아/어 봤자 / 봐야', forms: [{ label: '봤자', re: /봤자/ }, { label: '봐야', re: /봐야/ }] },
    { ko: '-고 보다 / -고 보니(까)', forms: [{ label: '고 보다', re: /고 (봐|보다|본|볼)/ }, { label: '고 보니', re: /고 보니/ }] },
    { ko: '-다면서요? / -다며?', forms: [{ label: '다면서요', re: /다면서요/ }, { label: '다며', re: /다며/ }] },
    { ko: '-다고 + 생각하다 / 믿다 / 듣다 / 보다 / 알다 / 느끼다 / 여기다', forms: [{ label: '생각하다', re: /다고 생각/ }, { label: '듣다', re: /다고 (들|듣)/ }, { label: '느끼다', re: /다고 느/ }] },
  ]
  for (const { ko, forms } of TIER4_FORM_COVERAGE) {
    for (const { label, re } of forms) {
      it(`${ko} demonstrates the ${label} form`, () => {
        const exs = GRAMMAR_EXAMPLES.filter((e) => e.ko === ko)
        expect(exs.some((e) => re.test(e.sentence))).toBe(true)
      })
    }
  }

  // Per-FORM coverage for the TOPIK-5 Tier-1 grammars (plan Part B, level 5).
  const TIER5_FORM_COVERAGE: Array<{ ko: string; forms: Array<{ label: string; re: RegExp }> }> = [
    { ko: '-(으)ㄴ/는 듯하다 / 듯싶다', forms: [{ label: '듯하다', re: /듯(하|해|합)/ }, { label: '듯싶다', re: /듯싶/ }] },
    { ko: '-다고 할까 봐 / -다고 할 줄 알았다', forms: [{ label: '할까 봐', re: /할까 봐/ }, { label: '할 줄 알았다', re: /할 줄 알/ }] },
    { ko: '-다는데 / -다더라 / -다더니', forms: [{ label: '다는데', re: /다는데/ }, { label: '다더라', re: /다더라/ }, { label: '다더니', re: /다더니/ }] },
    { ko: '-아/어 뵙다 / 봬요', forms: [{ label: '뵙다', re: /뵙/ }, { label: '봬요', re: /봬요|봬/ }] },
    { ko: '-(으)며 살다 / 지내다', forms: [{ label: '며 살다', re: /며 (살|사)/ }, { label: '며 지내다', re: /지내/ }] },
  ]
  for (const { ko, forms } of TIER5_FORM_COVERAGE) {
    for (const { label, re } of forms) {
      it(`${ko} demonstrates the ${label} form`, () => {
        const exs = GRAMMAR_EXAMPLES.filter((e) => e.ko === ko)
        expect(exs.some((e) => re.test(e.sentence))).toBe(true)
      })
    }
  }

  // Per-FORM coverage for the TOPIK-6 Tier-1 (literary) grammars (plan Part B,
  // level 6) — completes the Tier-1 rollout across all six levels.
  const TIER6_FORM_COVERAGE: Array<{ ko: string; forms: Array<{ label: string; re: RegExp }> }> = [
    { ko: '-(으)련마는 / -(으)련만', forms: [{ label: '련마는', re: /련마는/ }, { label: '련만', re: /련만/ }] },
    { ko: '-건대 / 생각건대 / 바라건대', forms: [{ label: '건대', re: /듣건대|보건대/ }, { label: '생각건대', re: /생각건대/ }, { label: '바라건대', re: /바라건대/ }] },
    { ko: '-로다 / -(이)로다', forms: [{ label: '로다', re: /[^이]로다/ }, { label: '이로다', re: /이로다/ }] },
  ]
  for (const { ko, forms } of TIER6_FORM_COVERAGE) {
    for (const { label, re } of forms) {
      it(`${ko} demonstrates the ${label} form`, () => {
        const exs = GRAMMAR_EXAMPLES.filter((e) => e.ko === ko)
        expect(exs.some((e) => re.test(e.sentence))).toBe(true)
      })
    }
  }
})
