/**
 * Normalize a `completion` answer for comparison.
 *
 * Removes ALL whitespace (leading, trailing, internal). Korean auxiliary-verb
 * spacing (보조용언) is optional under 한글 맞춤법 §47 — `먹어 보세요` and
 * `먹어보세요` are both correct — so a learner shouldn't be failed over a space.
 * Answers in this game are short single forms, so dropping spaces never makes a
 * genuinely-wrong answer match a right one.
 */
export function normalizeCompletionAnswer(s: string): string {
  return s.replace(/\s+/g, '')
}
