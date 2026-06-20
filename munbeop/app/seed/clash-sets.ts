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
const OBJECT: ClashFamily = {
  id: 'object', grammarKo: '을/를', invariant: false, afterConsonant: '을', afterVowel: '를',
  label: L('object', 'objeto', 'objet', 'objeto', 'กรรม', 'objek', 'tân ngữ', '目的語'),
}
const PLACE_STATIC: ClashFamily = {
  id: 'place-static', grammarKo: '에', invariant: true, form: '에',
  label: L('place/destination', 'lugar/destino', 'lieu/destination', 'lugar/destino', 'ที่/ปลายทาง', 'tempat/tujuan', 'nơi/đích', '場所・到達点'),
}
const PLACE_ACTION: ClashFamily = {
  id: 'place-action', grammarKo: '에서', invariant: true, form: '에서',
  label: L('place of action', 'lugar de acción', "lieu d'action", 'lugar da ação', 'ที่ทำกิจกรรม', 'tempat aksi', 'nơi hành động', '動作の場所'),
}
const RECIPIENT: ClashFamily = {
  id: 'recipient', grammarKo: '에게 / 한테 / 께', invariant: true, form: '한테',
  label: L('to a person', 'a una persona', 'à une personne', 'a uma pessoa', 'แก่คน', 'kepada orang', 'cho người', '人に'),
}
const ALSO: ClashFamily = {
  id: 'also', grammarKo: '도', invariant: true, form: '도',
  label: L('also', 'también', 'aussi', 'também', 'ด้วย', 'juga', 'cũng', '〜も'),
}
const ONLY: ClashFamily = {
  id: 'only', grammarKo: '만', invariant: true, form: '만',
  label: L('only', 'solo', 'seulement', 'só', 'เท่านั้น', 'hanya', 'chỉ', '〜だけ'),
}
const FROM: ClashFamily = {
  id: 'from', grammarKo: '부터 / 까지', invariant: true, form: '부터',
  label: L('from', 'desde', 'à partir de', 'a partir de', 'ตั้งแต่', 'mulai dari', 'từ', '〜から'),
}
const UNTIL: ClashFamily = {
  id: 'until', grammarKo: '부터 / 까지', invariant: true, form: '까지',
  label: L('until', 'hasta', "jusqu'à", 'até', 'จนถึง', 'sampai', 'đến', '〜まで'),
}

/** A set name that stays Korean across all 8 locales (brand mannerism). */
const pair = (ko: string) => L(ko, ko, ko, ko, ko, ko, ko, ko)

/** Confusable-particle clash sets for the Choque drill. */
export const CLASH_SETS: ClashSet[] = [
  { id: 'topic-subject', name: pair('은/는 vs 이/가'), families: [TOPIC, SUBJECT] },
  { id: 'subject-object', name: pair('이/가 vs 을/를'), families: [SUBJECT, OBJECT] },
  { id: 'place-static-action', name: pair('에 vs 에서'), families: [PLACE_STATIC, PLACE_ACTION] },
  { id: 'place-recipient', name: pair('에 vs 한테'), families: [PLACE_STATIC, RECIPIENT] },
  { id: 'also-only', name: pair('도 vs 만'), families: [ALSO, ONLY] },
  { id: 'from-until', name: pair('부터 vs 까지'), families: [FROM, UNTIL] },
]

export function clashSetById(id: string): ClashSet | undefined {
  return CLASH_SETS.find((s) => s.id === id)
}

export const DEFAULT_CLASH_SET_ID = 'topic-subject'
