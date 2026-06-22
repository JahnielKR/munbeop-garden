// tests/unit/register-transform/master.test.ts
import { describe, it, expect } from 'vitest'
import { MASTER_KEYS, masteryKey, masteryOf } from '~/lib/register-transform'

describe('register mastery (pure)', () => {
  it('tracks the 7 mastery sets keyed by mode:set', () => {
    expect(MASTER_KEYS).toHaveLength(7)
    expect(MASTER_KEYS).toContain('level:formal')
    expect(MASTER_KEYS).toContain('honor:si')
    expect(MASTER_KEYS).not.toContain('level:mixed')
  })
  it('earned only when all 7 are cleared', () => {
    const partial = masteryOf(new Set([masteryKey('level', 'formal')]))
    expect(partial.doneCount).toBe(1)
    expect(partial.total).toBe(7)
    expect(partial.earned).toBe(false)
    const all = masteryOf(new Set(MASTER_KEYS))
    expect(all.earned).toBe(true)
    expect(all.perSet.every((p) => p.done)).toBe(true)
  })
})
