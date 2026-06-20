import { describe, it, expect } from 'vitest'
import { CLASH_SETS, clashSetById } from '~/seed/clash-sets'
import { PARTICLE_DRILLS } from '~/seed/particle-drills'
import { correctForm, deriveOptions } from '~/lib/particle-lab'

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
      expect(deriveOptions(set), it.id).toContain(form)
    }
  })

  it('each set has at least 5 items and both families are represented', () => {
    for (const set of CLASH_SETS) {
      const items = PARTICLE_DRILLS.filter((i) => i.setId === set.id)
      expect(items.length, set.id).toBeGreaterThanOrEqual(5)
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
})
