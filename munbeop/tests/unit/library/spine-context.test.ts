import { describe, it, expect } from 'vitest'
import type { GrammarItemWithSource } from '~/lib/domain'
import { spineContextOf } from '~/lib/library/spine-context'

describe('spineContextOf', () => {
  it('resolves a TOPIK grammar to its level + theme (real spine)', () => {
    const ctx = spineContextOf('은/는')
    expect(ctx?.kind).toBe('topik')
    if (ctx?.kind === 'topik') {
      expect(ctx.level).toBe(1)
      expect(ctx.themeTitle.length).toBeGreaterThan(0)
    }
  })

  it('returns null for a ko not in the spine (e.g. a custom grammar)', () => {
    expect(spineContextOf('내가만든문법-xyz')).toBeNull()
  })

  it('reads a transversal section from an injected item list', () => {
    const items = [
      { id: 'X1', ko: '-아/어 가다', source: { kind: 'auxiliaries' } },
    ] as unknown as GrammarItemWithSource[]
    expect(spineContextOf('-아/어 가다', items)?.kind).toBe('auxiliaries')
    expect(spineContextOf('missing', items)).toBeNull()
  })
})
