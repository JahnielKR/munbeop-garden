import { describe, it, expect } from 'vitest'
import { buildRound } from '~/lib/sentence-garden/build'
import type { GrammarExample } from '~/lib/domain'

const ex: GrammarExample = {
  ko: '-아/어요',
  sentence: '저는 물을 마셔요.',
  trans: { en: 'I drink water.', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  level: 'polite',
}

describe('buildRound', () => {
  it('answer is the space-split eojeol of the sentence', () => {
    const r = buildRound(ex, ['빵을'], () => 0)
    expect(r.answer).toEqual(['저는', '물을', '마셔요.'])
    expect(r.ko).toBe('-아/어요')
    expect(r.sentence).toBe('저는 물을 마셔요.')
  })
  it('cards are answer + one decoy, all present, decoy not in answer', () => {
    const r = buildRound(ex, ['빵을'], () => 0)
    expect(r.cards).toHaveLength(r.answer.length + 1)
    expect(r.cards).toContain('빵을')
    for (const w of r.answer) expect(r.cards).toContain(w)
  })
  it('skips decoys already present in the sentence', () => {
    const r = buildRound(ex, ['물을', '빵을'], () => 0)
    // 물을 is in the answer → the next usable decoy (빵을) is chosen
    const decoys = r.cards.filter((c) => !r.answer.includes(c))
    expect(decoys).toEqual(['빵을'])
  })
  it('cards equal answer when no usable decoy exists', () => {
    const r = buildRound(ex, [], () => 0)
    expect(r.cards).toHaveLength(r.answer.length)
    expect(r.cards).not.toContain(undefined)
  })
  it('cards equal answer when every decoy collides with the sentence', () => {
    const r = buildRound(ex, ['저는', '물을', '마셔요.'], () => 0)
    expect(r.cards).toHaveLength(r.answer.length)
  })
})
