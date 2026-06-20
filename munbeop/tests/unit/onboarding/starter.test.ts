import { describe, it, expect } from 'vitest'
import { STARTER, parseTemplate, BLANK_MARKER } from '~/lib/onboarding/starter'

describe('parseTemplate', () => {
  it('splits a template into before/after around the blank marker', () => {
    expect(parseTemplate(`a${BLANK_MARKER}b`)).toEqual({ before: 'a', after: 'b' })
  })
  it('handles a marker at the start and end', () => {
    expect(parseTemplate(`${BLANK_MARKER}tail`)).toEqual({ before: '', after: 'tail' })
    expect(parseTemplate(`head${BLANK_MARKER}`)).toEqual({ before: 'head', after: '' })
  })
  it('throws when the template has no blank marker', () => {
    expect(() => parseTemplate('no blank here')).toThrow()
  })
})

describe('STARTER', () => {
  it('model sentence equals before + blankAnswer + after', () => {
    const { before, after } = parseTemplate(STARTER.templateKo)
    expect(before + STARTER.blankAnswer + after).toBe(STARTER.modelSentenceKo)
  })
  it('references a non-empty grammar key', () => {
    expect(STARTER.grammarKo.length).toBeGreaterThan(0)
  })
})
