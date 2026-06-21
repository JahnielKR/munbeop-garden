// tests/unit/conjugation-drill/distractors.test.ts
import { describe, it, expect } from 'vitest'
import { buildDistractors } from '~/lib/conjugation-drill/distractors'
import { conjugate, VERBS, ENDINGS } from '~/lib/korean'

const verb = (dict: string) => VERBS.find((v) => v.dict === dict)!

describe('buildDistractors — strategy outputs', () => {
  it('naive-regular: irregular conjugated as regular (듣다)', () => {
    const d = buildDistractors(verb('듣다'), '-아/어요', '들어요')
    expect(d).toContain('듣어요') // ㄷ-irr treated regular
  })
  it('wrong-harmony: 먹다 -아/어요 yields 먹아요', () => {
    const d = buildDistractors(verb('먹다'), '-아/어요', '먹어요')
    expect(d).toContain('먹아요')
  })
  it('eu-error (insert): vowel stem 가다 -(으)니까 yields 가으니까', () => {
    const d = buildDistractors(verb('가다'), '-(으)니까', '가니까')
    expect(d).toContain('가으니까')
  })
  it('eu-error (drop): 받침 stem 먹다 -(으)니까 yields 먹니까', () => {
    const d = buildDistractors(verb('먹다'), '-(으)니까', '먹으니까')
    expect(d).toContain('먹니까')
  })
})

describe('buildDistractors — invariants over the whole dataset', () => {
  const HANGUL = /^[가-힣 ]+$/
  for (const v of VERBS) {
    for (const e of ENDINGS) {
      const correct = conjugate(v.dict, v.klass, e)
      const d = buildDistractors(v, e, correct)
      it(`${v.dict} ${e}: exactly 3, distinct, valid Hangul, never == correct`, () => {
        expect(d).toHaveLength(3)
        expect(new Set(d).size).toBe(3)
        expect(d).not.toContain(correct)
        for (const f of d) expect(f).toMatch(HANGUL)
      })
    }
  }
})
