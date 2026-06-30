import { describe, it, expect } from 'vitest'
import { selectRounds, MIN_EOJEOL, MAX_EOJEOL } from '~/lib/sentence-garden/select'
import type { GrammarExample } from '~/lib/domain'

const L0 = { en: 'x', es: 'x', fr: 'x', 'pt-BR': 'x', th: 'x', id: 'x', vi: 'x', ja: 'x' }
const mk = (ko: string, sentence: string): GrammarExample => ({ ko, sentence, trans: L0, level: 'polite' })

const POOL: GrammarExample[] = [
  mk('-아/어요', '저는 물을 마셔요.'),         // 3 eojeol — ok
  mk('-아/어요', '빵을 먹어요.'),               // 2 eojeol — too short
  mk('-(으)러 가다', '저는 책을 사러 서점에 갔어요.'), // 5 eojeol — ok
  mk('-지 않다', '오늘은 학교에 가지 않아요 정말로 아니요.'), // 6 eojeol — too long
  mk('-네요', '날씨가 정말 좋네요.'),           // 3 eojeol — ok but ko not in deck below
]

describe('selectRounds', () => {
  it('keeps only examples whose ko is in the deck and whose eojeol count is in range', () => {
    const rounds = selectRounds(POOL, ['-아/어요', '-(으)러 가다'], 8, () => 0)
    const sentences = rounds.map((r) => r.sentence)
    expect(sentences).toContain('저는 물을 마셔요.')
    expect(sentences).toContain('저는 책을 사러 서점에 갔어요.')
    expect(sentences).not.toContain('빵을 먹어요.') // too short
    expect(sentences).not.toContain('날씨가 정말 좋네요.') // ko not in deck
  })
  it('respects MIN_EOJEOL/MAX_EOJEOL bounds', () => {
    for (const r of selectRounds(POOL, ['-아/어요', '-(으)러 가다', '-지 않다'], 8, () => 0)) {
      expect(r.answer.length).toBeGreaterThanOrEqual(MIN_EOJEOL)
      expect(r.answer.length).toBeLessThanOrEqual(MAX_EOJEOL)
    }
  })
  it('caps the session size', () => {
    const many = Array.from({ length: 20 }, (_, i) => mk('-아/어요', `저는 물건 ${i}을 봐요.`))
    expect(selectRounds(many, ['-아/어요'], 8, () => 0)).toHaveLength(8)
  })
})
