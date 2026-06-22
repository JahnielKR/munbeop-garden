// tests/unit/register-transform/sets.test.ts
import { describe, it, expect } from 'vitest'
import { REGISTER_SETS, setsForMode, isValidSet, isMasterySet, LEVEL_KO } from '~/lib/register-transform'

describe('register sets', () => {
  it('level mode = mixed + 3 mastery sets; honor mode = mixed + 4', () => {
    expect(setsForMode('level').map((s) => s.id)).toEqual(['mixed', 'formal', 'polite', 'casual'])
    expect(setsForMode('honor').map((s) => s.id)).toEqual(['mixed', 'verb', 'noun', 'particle', 'si'])
  })
  it('isValidSet accepts mixed + real sets, rejects unknown', () => {
    expect(isValidSet('level', 'formal')).toBe(true)
    expect(isValidSet('level', 'mixed')).toBe(true)
    expect(isValidSet('level', 'verb')).toBe(false)
    expect(isValidSet('honor', 'verb')).toBe(true)
  })
  it('isMasterySet excludes mixed', () => {
    expect(isMasterySet('level', 'formal')).toBe(true)
    expect(isMasterySet('level', 'mixed')).toBe(false)
    expect(REGISTER_SETS.filter((s) => s.mastery)).toHaveLength(7)
  })
  it('LEVEL_KO maps each SpeechLevel to its Korean register term', () => {
    expect(LEVEL_KO).toEqual({ formal: '합쇼체', polite: '해요체', casual: '반말' })
  })
})
