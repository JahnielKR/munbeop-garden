// tests/unit/domain/register.test.ts
import { describe, it, expect } from 'vitest'
import { LEVEL_SETS, HONOR_SETS } from '~/lib/domain'
import type { RegisterItem } from '~/lib/domain'

describe('register domain', () => {
  it('exposes the level + honor set literals', () => {
    expect([...LEVEL_SETS]).toEqual(['formal', 'polite', 'casual'])
    expect([...HONOR_SETS]).toEqual(['verb', 'noun', 'particle', 'si'])
  })
  it('a RegisterItem fixture type-checks', () => {
    const item: RegisterItem = {
      source: '저는 학생이에요.', mode: 'level', target: 'formal', set: 'formal',
      answer: '저는 학생입니다.', distractors: ['저는 학생이야.', '나는 학생입니다.', '저는 학생이세요.'],
      trans: { en: 'x', es: 'x', fr: 'x', 'pt-BR': 'x', th: 'x', id: 'x', vi: 'x', ja: 'x' },
      why: { en: 'x', es: 'x', fr: 'x', 'pt-BR': 'x', th: 'x', id: 'x', vi: 'x', ja: 'x' },
    }
    expect(item.distractors).toHaveLength(3)
  })
})
