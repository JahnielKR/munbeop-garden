import { describe, it, expect } from 'vitest'
import { conjugate } from '~/lib/korean'
import { GOLDEN_CONJUGATIONS } from './golden'

describe('conjugate (golden 340)', () => {
  it.each(GOLDEN_CONJUGATIONS)('$dict [$klass] + $ending → $surface', ({ dict, klass, ending, surface }) => {
    expect(conjugate(dict, klass, ending)).toBe(surface)
  })
})
