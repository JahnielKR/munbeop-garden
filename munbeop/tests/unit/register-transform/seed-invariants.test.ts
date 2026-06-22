// tests/unit/register-transform/seed-invariants.test.ts
import { describe, it, expect } from 'vitest'
import { REGISTER_ITEMS } from '~/seed/register-transform'
import { itemsFor } from '~/lib/register-transform'
import { LOCALE_CODES, LEVEL_SETS, HONOR_SETS } from '~/lib/domain'

const HANGUL = /^[가-힣ㄱ-ㅎㅏ-ㅣ0-9\s.,!?~%()'"·…\-/]+$/
const LEVELS = ['formal', 'polite', 'casual']
const nonEmptyLocales = (o: unknown) =>
  LOCALE_CODES.every((c) => ((o as Record<string, string>)?.[c]?.trim().length ?? 0) > 0)
const validSet = (mode: string, set: string) =>
  (mode === 'level' ? (LEVEL_SETS as readonly string[]) : (HONOR_SETS as readonly string[])).includes(set)

describe('register-transform seed invariants', () => {
  it('has items in both modes', () => {
    expect(REGISTER_ITEMS.some((i) => i.mode === 'level')).toBe(true)
    expect(REGISTER_ITEMS.some((i) => i.mode === 'honor')).toBe(true)
  })
  for (const [i, it_] of REGISTER_ITEMS.entries()) {
    it(`#${i} ${it_.source} → ${it_.answer} is well-formed`, () => {
      expect(it_.source).toMatch(HANGUL)
      expect(it_.answer).toMatch(HANGUL)
      expect(it_.source).not.toBe(it_.answer)
      expect(['level', 'honor']).toContain(it_.mode)
      expect(LEVELS).toContain(it_.target)
      expect(validSet(it_.mode, it_.set), `${it_.set} valid for ${it_.mode}`).toBe(true)
      if (it_.mode === 'level') expect(it_.set).toBe(it_.target)
      expect(it_.distractors).toHaveLength(3)
      for (const d of it_.distractors) {
        expect(d).toMatch(HANGUL)
        expect(d).not.toBe(it_.answer)
      }
      expect(new Set(it_.distractors).size, 'distractors pairwise distinct').toBe(3)
      expect(nonEmptyLocales(it_.trans), 'trans 8 locales').toBe(true)
      expect(nonEmptyLocales(it_.why), 'why 8 locales').toBe(true)
    })
  }
})

describe('register-transform coverage', () => {
  // Suppletive honorific lexemes, each with the surface fragments that show up in
  // either 해요체 (시+어 → 세: 드세요) or 합쇼체 (드십니다) output, so detection is
  // register-agnostic.
  const SUPPLETIVE = [
    ['드세', '드시', '잡수'], // 먹다/마시다 → 드시다/잡수시다
    ['주무'], // 자다 → 주무시다
    ['계세', '계시'], // 있다/없다 → 계시다/안 계시다
    ['말씀하'], // 말하다 → 말씀하시다
    ['돌아가'], // 죽다 → 돌아가시다
    ['편찮'], // 아프다 → 편찮으시다
    ['드려', '드리'], // 주다 → 드리다 (humble/object)
    ['여쭤', '여쭙'], // 묻다 → 여쭤보다/여쭙다 (humble)
    ['봬', '뵈', '뵙'], // 보다 → 뵙다 (humble)
  ]
  it('level totals ≈ 20 and honor totals ≈ 28', () => {
    expect(itemsFor('level').length).toBeGreaterThanOrEqual(18)
    expect(itemsFor('honor').length).toBeGreaterThanOrEqual(26)
  })
  it('each mastery set has ≥ 4 items', () => {
    for (const set of ['formal', 'polite', 'casual'])
      expect(itemsFor('level', set).length, set).toBeGreaterThanOrEqual(4)
    for (const set of ['verb', 'noun', 'particle', 'si'])
      expect(itemsFor('honor', set).length, set).toBeGreaterThanOrEqual(4)
  })
  it('the verb set exercises the suppletive honorific lexemes', () => {
    const answers = itemsFor('honor', 'verb')
      .map((i) => i.answer)
      .join(' ')
    const covered = SUPPLETIVE.filter((variants) => variants.some((v) => answers.includes(v)))
    expect(covered.length, `covered ${covered.length}/9 suppletive lexemes`).toBeGreaterThanOrEqual(8)
  })
})
