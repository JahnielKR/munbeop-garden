import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SpacingCard from '~/components/particle-lab/SpacingCard.vue'
import type { LocalizedString } from '~/lib/domain'
import type { GapValue, SpacingPuzzle, SpacingResult } from '~/lib/particle-lab'

const LS = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

// Level-1 puzzle for 저는 학생이에요.
const PUZZLE: SpacingPuzzle = {
  sentenceId: 's01-jeoneun',
  blocks: ['저', '는', '학생이에요'],
  gaps: [
    { correct: 'join', kind: 'particle' },
    { correct: 'space', kind: 'eojeol' },
  ],
}

function mountCard(overrides: Record<string, unknown> = {}) {
  return mount(SpacingCard, {
    props: {
      puzzle: PUZZLE,
      answers: ['join', 'join'] as GapValue[],
      phase: 'question',
      result: null,
      trans: LS('I am a student.'),
      ...overrides,
    },
  })
}

describe('SpacingCard', () => {
  it('renders blocks and one gap between each adjacent pair', () => {
    const w = mountCard()
    expect(w.text()).toContain('저')
    expect(w.text()).toContain('학생이에요')
    expect(w.find('[data-testid="spacing-gap-0"]').exists()).toBe(true)
    expect(w.find('[data-testid="spacing-gap-1"]').exists()).toBe(true)
    expect(w.find('[data-testid="spacing-gap-2"]').exists()).toBe(false)
  })

  it('emits toggle with the gap index', async () => {
    const w = mountCard()
    await w.get('[data-testid="spacing-gap-1"]').trigger('click')
    expect(w.emitted('toggle')).toEqual([[1]])
  })

  it('emits check when the check button is pressed', async () => {
    const w = mountCard()
    await w.get('[data-testid="spacing-check"]').trigger('click')
    expect(w.emitted('check')).toBeTruthy()
  })

  it('reveals the violated rule and the correct sentence on a wrong answer', () => {
    const result: SpacingResult = {
      correct: false,
      gaps: [
        { index: 0, given: 'space', correct: false, gap: { correct: 'join', kind: 'particle' } },
        { index: 1, given: 'space', correct: true, gap: { correct: 'space', kind: 'eojeol' } },
      ],
    }
    const w = mountCard({ phase: 'answered', result, answers: ['space', 'space'] })
    const fb = w.get('[data-testid="spacing-feedback"]')
    expect(fb.text()).toContain('particles.spacing.try_again')
    expect(fb.text()).toContain('particles.spacing.rule_particle')
    expect(fb.text()).toContain('저는 학생이에요')
  })

  it('shows the success verdict when every gap is right', () => {
    const result: SpacingResult = {
      correct: true,
      gaps: [
        { index: 0, given: 'join', correct: true, gap: { correct: 'join', kind: 'particle' } },
        { index: 1, given: 'space', correct: true, gap: { correct: 'space', kind: 'eojeol' } },
      ],
    }
    const w = mountCard({ phase: 'answered', result, answers: ['join', 'space'] })
    expect(w.get('[data-testid="spacing-feedback"]').text()).toContain('particles.spacing.correct')
  })
})
