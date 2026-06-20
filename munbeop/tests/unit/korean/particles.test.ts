import { describe, it, expect } from 'vitest'
import { attachParticle } from '~/lib/korean'
import { GOLDEN_PARTICLES } from './golden'

describe('attachParticle (golden 60)', () => {
  it.each(GOLDEN_PARTICLES)('$noun + $particle → $surface', ({ noun, particle, surface }) => {
    expect(attachParticle(noun, particle)).toBe(surface)
  })
})
