import { describe, it, expect } from 'vitest'
import { normalizeCompletionAnswer } from '~/lib/escape-room/answer'

describe('normalizeCompletionAnswer', () => {
  it('strips leading/trailing whitespace', () => {
    expect(normalizeCompletionAnswer('  이  ')).toBe('이')
  })

  it('ignores internal whitespace (보조용언 spacing, 한글 맞춤법 §47)', () => {
    // A learner may write the auxiliary-verb form spaced or closed; both are valid.
    expect(normalizeCompletionAnswer('먹어 보세요')).toBe(
      normalizeCompletionAnswer('먹어보세요'),
    )
  })

  it('collapses any run of whitespace, including tabs/newlines', () => {
    expect(normalizeCompletionAnswer('가\t보세요')).toBe('가보세요')
    expect(normalizeCompletionAnswer('올리기  전에')).toBe('올리기전에')
  })

  it('leaves a genuinely different answer different', () => {
    expect(normalizeCompletionAnswer('먹어 보세요')).not.toBe(
      normalizeCompletionAnswer('마셔 보세요'),
    )
  })
})
