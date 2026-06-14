import { describe, it, expect } from 'vitest'
import { allItems, categoryOf, levelOf, presentCategories, GRAMMAR_TYPE_ORDER } from '~/lib/domain'

describe('spine ko-index', () => {
  it('levelOf resolves the TOPIK level of a known topik pattern', () => {
    const sample = allItems().find((x) => x.source.kind === 'topik')!
    const expected = sample.source.kind === 'topik' ? sample.source.level : undefined
    expect(levelOf(sample.ko)).toBe(expected)
  })

  it('categoryOf resolves a defined type for a typed item', () => {
    const typed = allItems().find((x) => x.type)!
    expect(categoryOf(typed.ko)).toBeDefined()
  })

  it('returns undefined for an unknown ko', () => {
    expect(levelOf('___nope___')).toBeUndefined()
    expect(categoryOf('___nope___')).toBeUndefined()
  })

  it('presentCategories is a non-empty, ordered subset of GRAMMAR_TYPE_ORDER', () => {
    const present = presentCategories()
    expect(present.length).toBeGreaterThan(0)
    for (const c of present) expect(GRAMMAR_TYPE_ORDER).toContain(c)
    const idx = present.map((c) => GRAMMAR_TYPE_ORDER.indexOf(c))
    expect(idx).toEqual([...idx].sort((a, b) => a - b))
  })
})
