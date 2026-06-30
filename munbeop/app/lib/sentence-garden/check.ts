/** Exact-match: the placed eojeol equal the model order (and length). */
export function checkOrder(placed: readonly string[], answer: readonly string[]): boolean {
  return placed.length === answer.length && placed.every((w, i) => w === answer[i])
}
