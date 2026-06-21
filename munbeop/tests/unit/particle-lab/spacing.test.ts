import { describe, it, expect } from 'vitest'
import {
  buildPuzzle,
  correctSpacing,
  gradePuzzle,
  type GapValue,
  type SpacingLevel,
  type SpacingPuzzle,
} from '~/lib/particle-lab'
import { PARTICLE_SENTENCES } from '~/seed/particle-sentences'

/** The standard 한글 맞춤법 띄어쓰기 surface of each Explore sentence. */
const GOLD: Record<string, string> = {
  's01-jeoneun': '저는 학생이에요',
  's02-goyangi': '고양이가 우유를 마셔요',
  's03-hakgyo': '학교에 가요',
  's04-doseogwan': '도서관에서 공부해요',
  's05-jeodo': '저도 커피를 좋아해요',
  's06-achime': '아침에 빵을 먹어요',
  's07-biga': '비가 와요',
  's08-chinguhante': '친구한테 편지를 써요',
  's09-beoseuro': '버스로 학교에 가요',
  's10-ppangman': '빵만 먹어요',
  's11-sagwawa': '사과와 바나나를 사요',
  's12-ahopsibuteo': '아홉 시부터 다섯 시까지 일해요',
  's13-yeonpillo': '연필로 편지를 써요',
  's14-jeodo': '저도 커피를 마셔요',
}

const byId = (id: string) => PARTICLE_SENTENCES.find((s) => s.id === id)!

/** Rebuild the sentence from a puzzle using each gap's CORRECT value. */
function reassemble(p: SpacingPuzzle): string {
  return p.blocks
    .map((b, i) => (i < p.blocks.length - 1 ? b + (p.gaps[i]!.correct === 'space' ? ' ' : '') : b))
    .join('')
}

describe('correctSpacing', () => {
  it('reproduces the standard spacing for all 14 sentences', () => {
    for (const s of PARTICLE_SENTENCES) expect(correctSpacing(s)).toBe(GOLD[s.id])
    expect(Object.keys(GOLD)).toHaveLength(PARTICLE_SENTENCES.length)
  })
})

describe('buildPuzzle — level 1 (chunked tokens)', () => {
  it('splits s01 into word/particle blocks with the right gaps', () => {
    const p = buildPuzzle(byId('s01-jeoneun'), 1)
    expect(p.blocks).toEqual(['저', '는', '학생이에요'])
    expect(p.gaps).toEqual([
      { correct: 'join', kind: 'particle' },
      { correct: 'space', kind: 'eojeol' },
    ])
  })

  it('spaces a number from its counter (s12: 아홉 | 시)', () => {
    const p = buildPuzzle(byId('s12-ahopsibuteo'), 1)
    // blocks: 아홉 | 시 | 부터 | 다섯 | 시 | 까지 | 일해요
    expect(p.blocks).toEqual(['아홉', '시', '부터', '다섯', '시', '까지', '일해요'])
    expect(p.gaps[0]).toEqual({ correct: 'space', kind: 'eojeol' }) // 아홉 | 시
    expect(p.gaps[1]).toEqual({ correct: 'join', kind: 'particle' }) // 시 | 부터
  })
})

describe('buildPuzzle — level 2 (syllables)', () => {
  it('splits s01 into syllables, joining inside the predicate', () => {
    const p = buildPuzzle(byId('s01-jeoneun'), 2)
    expect(p.blocks).toEqual(['저', '는', '학', '생', '이', '에', '요'])
    expect(p.gaps).toEqual([
      { correct: 'join', kind: 'particle' }, // 저 | 는
      { correct: 'space', kind: 'eojeol' }, // 는 | 학
      { correct: 'join', kind: 'word-internal' }, // 학 | 생
      { correct: 'join', kind: 'word-internal' }, // 생 | 이
      { correct: 'join', kind: 'word-internal' }, // 이 | 에
      { correct: 'join', kind: 'word-internal' }, // 에 | 요
    ])
  })
})

describe('buildPuzzle — invariant', () => {
  it('reassembles to correctSpacing at both levels, with gaps = blocks - 1', () => {
    for (const s of PARTICLE_SENTENCES) {
      for (const level of [1, 2] as SpacingLevel[]) {
        const p = buildPuzzle(s, level)
        expect(p.gaps).toHaveLength(p.blocks.length - 1)
        expect(reassemble(p)).toBe(correctSpacing(s))
      }
    }
  })
})

describe('gradePuzzle', () => {
  const p = buildPuzzle(byId('s01-jeoneun'), 1) // gaps: [join, space]

  it('marks all correct when answers match', () => {
    const r = gradePuzzle(p, ['join', 'space'])
    expect(r.correct).toBe(true)
    expect(r.gaps.map((g) => g.correct)).toEqual([true, true])
  })

  it('flags the specific wrong gap', () => {
    const r = gradePuzzle(p, ['space', 'space'] as GapValue[]) // spaced before the particle
    expect(r.correct).toBe(false)
    expect(r.gaps[0]).toEqual({
      index: 0,
      given: 'space',
      correct: false,
      gap: { correct: 'join', kind: 'particle' },
    })
    expect(r.gaps[1]!.correct).toBe(true)
  })

  it('treats a missing answer as join (default)', () => {
    const r = gradePuzzle(p, []) // nothing tapped → all join → the eojeol space is missed
    expect(r.correct).toBe(false)
    expect(r.gaps[0]!.correct).toBe(true) // join is right for the particle gap
    expect(r.gaps[1]!.correct).toBe(false) // missing space at the eojeol boundary
  })
})
