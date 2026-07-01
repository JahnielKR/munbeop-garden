import type { GrammarExample } from '~/lib/domain'
import { TOPIK_1_EXAMPLES } from '~/seed/grammar-examples/n1'
import { TOPIK_2_EXAMPLES } from '~/seed/grammar-examples/n2'
import { TOPIK_3_EXAMPLES } from '~/seed/grammar-examples/n3'
import { TOPIK_4_EXAMPLES } from '~/seed/grammar-examples/n4'
import { TOPIK_5_EXAMPLES } from '~/seed/grammar-examples/n5'
import { TOPIK_6_EXAMPLES } from '~/seed/grammar-examples/n6'

/**
 * Sentences excluded from Sentence Garden because they have more than one
 * natural eojeol order (a free sentence-initial time/frequency adverb that a
 * native equally places after the subject/topic). Exact-match validation would
 * unfairly mark a valid rebuild wrong, so we drop them. Found via an adversarial
 * native-Korean review of every short 3-5-eojeol sentence (2026-06-30); the
 * comment records the equally-valid alternative order.
 */
export const SENTENCE_GARDEN_EXCLUDE: ReadonlySet<string> = new Set([
  '요즘 한국어가 점점 재미있어졌어.', // alt: 한국어가 요즘 점점 재미있어졌어.
  '동생은 주말마다 도서관에서 책을 읽는다.', // alt: 주말마다 동생은 도서관에서 책을 읽는다.
  // Existential/stative 있다 sentences: the locative (-에) and subject (-이/가) phrases scramble freely.
  '냉장고에 우유가 있어요.', // alt: 우유가 냉장고에 있어요.
  '책상 위에 안경이 있어.', // alt: 안경이 책상 위에 있어.
  '벽에 가족사진이 걸려 있어요.', // alt: 가족사진이 벽에 걸려 있어요.
  // Free sentence-initial time adverb 지금 that a native equally places after the subject/topic.
  '지금 비가 오는데 우산이 없습니다.', // alt: 비가 지금 오는데 우산이 없습니다.
  '지금 밖에 비가 온다고요?', // alt: 밖에 지금 비가 온다고요?
])

/**
 * Every TOPIK 1-6 grammar-example eligible for Sentence Garden. `selectRounds`
 * still keeps only short (3-5 eojeol) sentences, whose order is effectively
 * rigid, so exact-match stays fair; the EXCLUDE set above removes the handful of
 * short sentences that nonetheless have a second natural order. This reuses the
 * already-authored + audio'd example corpus — no new content, and TOPIK 3-6
 * decks (previously empty here) become playable.
 */
export const SENTENCE_GARDEN_POOL: GrammarExample[] = [
  ...TOPIK_1_EXAMPLES,
  ...TOPIK_2_EXAMPLES,
  ...TOPIK_3_EXAMPLES,
  ...TOPIK_4_EXAMPLES,
  ...TOPIK_5_EXAMPLES,
  ...TOPIK_6_EXAMPLES,
].filter((e) => !SENTENCE_GARDEN_EXCLUDE.has(e.sentence))
