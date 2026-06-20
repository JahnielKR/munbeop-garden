import type { ClashFamily, ClashSet } from '~/lib/domain'
import { L } from './locale'

const TOPIC: ClashFamily = {
  id: 'topic', grammarKo: '은/는', invariant: false, afterConsonant: '은', afterVowel: '는',
  label: L('topic', 'tema', 'thème', 'tópico', 'หัวเรื่อง', 'topik', 'chủ đề', '主題'),
}
const SUBJECT: ClashFamily = {
  id: 'subject', grammarKo: '이/가', invariant: false, afterConsonant: '이', afterVowel: '가',
  label: L('subject', 'sujeto', 'sujet', 'sujeito', 'ประธาน', 'subjek', 'chủ ngữ', '主語'),
}

/** Confusable-particle clash sets for the Choque drill. */
export const CLASH_SETS: ClashSet[] = [
  {
    id: 'topic-subject',
    name: L('은/는 vs 이/가', '은/는 vs 이/가', '은/는 vs 이/가', '은/는 vs 이/가', '은/는 vs 이/가', '은/는 vs 이/가', '은/는 vs 이/가', '은/는 vs 이/가'),
    families: [TOPIC, SUBJECT],
  },
]

export function clashSetById(id: string): ClashSet | undefined {
  return CLASH_SETS.find((s) => s.id === id)
}

export const DEFAULT_CLASH_SET_ID = 'topic-subject'
