import { describe, it, expect } from 'vitest'
import { staticPoseGroup, POSES } from '~/lib/bomi/poses'

// Bomi animates via motion-v (WAAPI), which CSS `prefers-reduced-motion` rules
// can't stop — so the component collapses each pose group with staticPoseGroup()
// when the user asked for reduced motion. Test that pure reduction here.
describe('staticPoseGroup (Bomi reduced-motion)', () => {
  it('collapses keyframe arrays to their resting (last) value', () => {
    const idleBee = POSES.idle.bee!
    // sanity: the live pose really does loop
    expect(idleBee.transition?.repeat).toBe(Infinity)
    expect(Array.isArray(idleBee.animate.y)).toBe(true)

    const staticBee = staticPoseGroup(idleBee)!
    expect(Array.isArray(staticBee.animate.y)).toBe(false)
    expect(staticBee.animate.y).toBe(0) // last frame of [0, -0.5, 0]
    expect(staticBee.animate.rotate).toBe(0)
  })

  it('drops the looping transition (no infinite repeat, zero duration)', () => {
    const staticWings = staticPoseGroup(POSES.idle.wings)!
    expect(staticWings.transition).toEqual({ duration: 0 })
    expect(staticWings.animate.scaleX).toBe(1) // resting flap
  })

  it('passes a non-array scalar through unchanged', () => {
    const g = staticPoseGroup({ animate: { opacity: 1 }, transition: { duration: 2, repeat: Infinity } })!
    expect(g.animate.opacity).toBe(1)
    expect(g.transition).toEqual({ duration: 0 })
  })

  it('passes undefined through', () => {
    expect(staticPoseGroup(undefined)).toBeUndefined()
  })
})
