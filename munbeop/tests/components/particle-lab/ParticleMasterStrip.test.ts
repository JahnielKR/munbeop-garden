import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ParticleMasterStrip from '~/components/particle-lab/ParticleMasterStrip.vue'
import type { ParticleProgress } from '~/lib/particle-lab'

const per = (ko: string, done: boolean): ParticleProgress => ({
  ko, mastery: done ? 'tree' : 'seedling', done,
})

function mountStrip(overrides: Record<string, unknown> = {}) {
  return mount(ParticleMasterStrip, {
    props: {
      perParticle: [per('은/는', true), per('이/가', false), per('에', false)],
      doneCount: 1,
      total: 3,
      earned: false,
      ...overrides,
    },
  })
}

describe('ParticleMasterStrip', () => {
  it('renders a pip per particle and the progress caption', () => {
    const w = mountStrip()
    expect(w.findAll('.master__pip')).toHaveLength(3)
    expect(w.text()).toContain('particles.master.progress 1 3') // t() echo with params
  })

  it('marks done vs todo particles distinctly', () => {
    const w = mountStrip()
    expect(w.findAll('.master__pip--done')).toHaveLength(1)
    expect(w.findAll('.master__pip--todo')).toHaveLength(2)
  })

  it('shows the earned state', () => {
    const w = mountStrip({
      earned: true,
      doneCount: 3,
      perParticle: [per('은/는', true), per('이/가', true), per('에', true)],
    })
    expect(w.get('[data-testid="particle-master"]').classes()).toContain('master--earned')
    expect(w.text()).toContain('particles.master.earned')
  })
})
