import { describe, it, expect } from 'vitest'
import type { ClozeItem } from '~/lib/domain'

describe('cloze domain', () => {
  it('a ClozeItem fixture type-checks', () => {
    const item: ClozeItem = {
      ko: '-고 싶다',
      sentence: '주말에 영화를 {} 싶어요.',
      answer: '보고',
      distractors: ['봐서', '보지만', '보면'],
      trans: { en: 'x', es: 'x', fr: 'x', 'pt-BR': 'x', th: 'x', id: 'x', vi: 'x', ja: 'x' },
      why: { en: 'x', es: 'x', fr: 'x', 'pt-BR': 'x', th: 'x', id: 'x', vi: 'x', ja: 'x' },
    }
    expect(item.distractors).toHaveLength(3)
  })
})
