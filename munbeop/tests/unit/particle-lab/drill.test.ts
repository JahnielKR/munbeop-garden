import { describe, it, expect } from 'vitest'
import type { ClashSet, DrillItem, LocalizedString } from '~/lib/domain'
import { correctForm, correctSentence, deriveOptions, judge, scoreOf } from '~/lib/particle-lab'

const LS = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

const TOPIC_SUBJECT: ClashSet = {
  id: 'topic-subject', name: LS('t'),
  families: [
    { id: 'topic', grammarKo: '은/는', invariant: false, afterConsonant: '은', afterVowel: '는', label: LS('topic') },
    { id: 'subject', grammarKo: '이/가', invariant: false, afterConsonant: '이', afterVowel: '가', label: LS('subject') },
  ],
}
const PLACE: ClashSet = {
  id: 'place', name: LS('place'),
  families: [
    { id: 'static', grammarKo: '에', invariant: true, form: '에', label: LS('static') },
    { id: 'action', grammarKo: '에서', invariant: true, form: '에서', label: LS('action') },
  ],
}

const item = (setId: string, familyIndex: 0 | 1, noun: string, rest: string, lead?: string): DrillItem =>
  ({ id: 't', cue: LS('c'), lead, noun, rest, setId, familyIndex, reason: LS('r'), trans: LS('t') })

const mulSubject = item('topic-subject', 1, '물', ' 맛있어요.')
const jeoTopic = item('topic-subject', 0, '저', ' 학생이에요.')
const kokkiri = item('topic-subject', 1, '코', ' 길어요.', '코끼리는 ')
const ddoChip = item('place', 1, '도서관', ' 공부해요.')

describe('drill engine (clash sets)', () => {
  it('derives the expected form from family + batchim', () => {
    expect(correctForm(mulSubject, TOPIC_SUBJECT)).toBe('이')
    expect(correctForm(jeoTopic, TOPIC_SUBJECT)).toBe('는')
    expect(correctForm(kokkiri, TOPIC_SUBJECT)).toBe('가')
  })

  it('assembles the correct sentence including lead', () => {
    expect(correctSentence(kokkiri, TOPIC_SUBJECT)).toBe('코끼리는 코가 길어요.')
    expect(correctSentence(mulSubject, TOPIC_SUBJECT)).toBe('물이 맛있어요.')
  })

  it('accepts the exact correct choice', () => {
    expect(judge(mulSubject, '이', TOPIC_SUBJECT)).toEqual({ kind: 'correct' })
  })

  it('blocks right family with wrong allomorph (받침 slip)', () => {
    expect(judge(mulSubject, '가', TOPIC_SUBJECT)).toEqual({ kind: 'blocked', expected: '이', nounHasBatchim: true })
    expect(judge(jeoTopic, '은', TOPIC_SUBJECT)).toEqual({ kind: 'blocked', expected: '는', nounHasBatchim: false })
  })

  it('flags wrong family as a semantic error', () => {
    expect(judge(mulSubject, '은', TOPIC_SUBJECT)).toEqual({ kind: 'wrong-family', expected: '이', familyId: 'subject' })
    expect(judge(jeoTopic, '가', TOPIC_SUBJECT)).toEqual({ kind: 'wrong-family', expected: '는', familyId: 'topic' })
  })

  it('derives 4 options for an allomorph set, 2 for an invariant set', () => {
    expect(deriveOptions(TOPIC_SUBJECT)).toEqual(['은', '는', '이', '가'])
    expect(deriveOptions(PLACE)).toEqual(['에', '에서'])
  })

  it('an invariant set is never blocked — wrong choice is wrong-family', () => {
    expect(judge(ddoChip, '에', PLACE)).toEqual({ kind: 'wrong-family', expected: '에서', familyId: 'action' })
    expect(judge(ddoChip, '에서', PLACE)).toEqual({ kind: 'correct' })
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
