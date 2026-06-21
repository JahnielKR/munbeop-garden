import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SpacingGap from '~/components/particle-lab/SpacingGap.vue'
import type { Gap } from '~/lib/particle-lab'

const gap: Gap = { correct: 'space', kind: 'eojeol' }

function mountGap(value: 'space' | 'join') {
  return mount(SpacingGap, { props: { index: 1, value, gap, revealed: false } })
}

describe('SpacingGap a11y', () => {
  it('labels the toggle by its current state', () => {
    expect(mountGap('join').get('button').attributes('aria-label')).toBe('particles.spacing.gap_join')
    expect(mountGap('space').get('button').attributes('aria-label')).toBe('particles.spacing.gap_space')
  })

  it('reflects state in aria-pressed', () => {
    expect(mountGap('space').get('button').attributes('aria-pressed')).toBe('true')
    expect(mountGap('join').get('button').attributes('aria-pressed')).toBe('false')
  })
})
