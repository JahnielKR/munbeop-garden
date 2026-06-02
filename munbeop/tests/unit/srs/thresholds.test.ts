import { describe, it, expect } from 'vitest'
import {
  PROMOTE_TO_PLANT_MIN_TOTAL,
  PROMOTE_TO_PLANT_EASY_RATIO,
  PROMOTE_TO_TREE_MIN_TOTAL,
  PROMOTE_TO_TREE_EASY_RATIO,
  ALMOST_GROUP_MIN_TOTAL,
  ALMOST_GROUP_EASY_RATIO,
} from '~/lib/srs/thresholds'

describe('SRS thresholds', () => {
  it('promote seedling → plant at ≥20 with easy ≥ hard × 1.5', () => {
    expect(PROMOTE_TO_PLANT_MIN_TOTAL).toBe(20)
    expect(PROMOTE_TO_PLANT_EASY_RATIO).toBe(1.5)
  })

  it('promote plant → tree at ≥60 with easy ≥ hard × 2.5', () => {
    expect(PROMOTE_TO_TREE_MIN_TOTAL).toBe(60)
    expect(PROMOTE_TO_TREE_EASY_RATIO).toBe(2.5)
  })

  it('almost group ≥15 with ratio 1.5', () => {
    expect(ALMOST_GROUP_MIN_TOTAL).toBe(15)
    expect(ALMOST_GROUP_EASY_RATIO).toBe(1.5)
  })
})
