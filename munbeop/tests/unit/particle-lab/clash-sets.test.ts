import { describe, it, expect } from 'vitest'
import { CLASH_SETS, clashSetById } from '~/seed/clash-sets'
import { PARTICLE_DRILLS } from '~/seed/particle-drills'
import { correctForm, optionsFor, CONTRACTIONS } from '~/lib/particle-lab'

describe('clash sets integrity', () => {
  it('every drill item references a real set + valid family index', () => {
    for (const it of PARTICLE_DRILLS) {
      const set = clashSetById(it.setId)
      expect(set, it.id).toBeTruthy()
      expect(it.familyIndex === 0 || it.familyIndex === 1).toBe(true)
    }
  })

  it('correctForm is a non-empty option of the set for every item', () => {
    for (const it of PARTICLE_DRILLS) {
      const set = clashSetById(it.setId)!
      const form = correctForm(it, set)
      expect(form.length, it.id).toBeGreaterThan(0)
      expect(optionsFor(it, set), it.id).toContain(form)
    }
  })

  it('each set has at least 5 items and both families are represented', () => {
    for (const set of CLASH_SETS) {
      const items = PARTICLE_DRILLS.filter((i) => i.setId === set.id)
      expect(items.length, set.id).toBeGreaterThanOrEqual(5)
      if (set.kind === 'contraction') continue
      expect(items.some((i) => i.familyIndex === 0), set.id).toBe(true)
      expect(items.some((i) => i.familyIndex === 1), set.id).toBe(true)
    }
  })

  it('every drill item id is unique', () => {
    const ids = PARTICLE_DRILLS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every set has at least 10 items after the replay expansion', () => {
    for (const set of CLASH_SETS) {
      const items = PARTICLE_DRILLS.filter((i) => i.setId === set.id)
      expect(items.length, set.id).toBeGreaterThanOrEqual(10)
    }
  })

  it('contraction items are well-formed (familyIndex 0, noun is a known pronoun)', () => {
    const items = PARTICLE_DRILLS.filter((i) => i.setId === 'contraction')
    expect(items.length).toBeGreaterThanOrEqual(10)
    for (const it of items) {
      expect(it.familyIndex, it.id).toBe(0)
      expect(Object.keys(CONTRACTIONS), it.id).toContain(it.noun)
    }
  })
})
