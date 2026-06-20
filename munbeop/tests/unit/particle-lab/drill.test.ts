import { describe, it, expect } from 'vitest'
import type { DrillItem, LocalizedString } from '~/lib/domain'
import { correctForm, correctSentence, judge, scoreOf } from '~/lib/particle-lab'

const LS = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

const mulSubject: DrillItem = {
  id: 't-mul', cue: LS('cue'), noun: '물', rest: ' 맛있어요.',
  family: 'subject', reason: LS('reason'), trans: LS('trans'),
}
const jeoTopic: DrillItem = {
  id: 't-jeo', cue: LS('cue'), noun: '저', rest: ' 학생이에요.',
  family: 'topic', reason: LS('reason'), trans: LS('trans'),
}
const kokkiri: DrillItem = {
  id: 't-ko', cue: LS('cue'), lead: '코끼리는 ', noun: '코', rest: ' 길어요.',
  family: 'subject', reason: LS('reason'), trans: LS('trans'),
}

describe('drill engine', () => {
  it('derives the expected form from family + batchim', () => {
    expect(correctForm(mulSubject)).toBe('이')
    expect(correctForm(jeoTopic)).toBe('는')
    expect(correctForm(kokkiri)).toBe('가')
  })

  it('assembles the correct sentence including lead', () => {
    expect(correctSentence(kokkiri)).toBe('코끼리는 코가 길어요.')
    expect(correctSentence(mulSubject)).toBe('물이 맛있어요.')
  })

  it('accepts the exact correct choice', () => {
    expect(judge(mulSubject, '이')).toEqual({ kind: 'correct' })
  })

  it('blocks right family with wrong allomorph (받침 slip)', () => {
    expect(judge(mulSubject, '가')).toEqual({
      kind: 'blocked', expected: '이', nounHasBatchim: true,
    })
    expect(judge(jeoTopic, '은')).toEqual({
      kind: 'blocked', expected: '는', nounHasBatchim: false,
    })
  })

  it('flags wrong family as a semantic error', () => {
    expect(judge(mulSubject, '은')).toEqual({
      kind: 'wrong-family', expected: '이', family: 'subject',
    })
    expect(judge(jeoTopic, '가')).toEqual({
      kind: 'wrong-family', expected: '는', family: 'topic',
    })
  })

  it('aggregates score with accuracy and slips', () => {
    const score = scoreOf([
      { itemId: 'a', correct: true, batchimSlips: 1 },
      { itemId: 'b', correct: true, batchimSlips: 0 },
      { itemId: 'c', correct: false, batchimSlips: 2 },
      { itemId: 'd', correct: true, batchimSlips: 0 },
    ])
    expect(score).toEqual({ total: 4, correct: 3, batchimSlips: 3, accuracy: 0.75 })
    expect(scoreOf([])).toEqual({ total: 0, correct: 0, batchimSlips: 0, accuracy: 0 })
  })
})
