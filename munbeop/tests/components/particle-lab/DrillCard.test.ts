import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DrillCard from '~/components/particle-lab/DrillCard.vue'
import type { ClashSet, DrillItem, LocalizedString } from '~/lib/domain'

// useI18n / useLocalized are globally stubbed in tests/setup.ts: t() echoes the
// key (params appended), tl() resolves LocalizedString to its English string.

const LS = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

const SET: ClashSet = {
  id: 'topic-subject', name: LS('t'),
  families: [
    { id: 'topic', grammarKo: '은/는', invariant: false, afterConsonant: '은', afterVowel: '는', label: LS('topic') },
    { id: 'subject', grammarKo: '이/가', invariant: false, afterConsonant: '이', afterVowel: '가', label: LS('subject') },
  ],
}

const item: DrillItem = {
  id: 't-chaek', cue: LS('what is on the table?'), noun: '책', rest: ' 있어요.',
  setId: 'topic-subject', familyIndex: 1, reason: LS('existence takes subject'), trans: LS('there is a book'),
}

function mountCard(overrides: Record<string, unknown> = {}) {
  return mount(DrillCard, {
    props: {
      item, set: SET, phase: 'question', verdict: null, picked: null,
      blockedChoices: new Set(), ...overrides,
    },
  })
}

describe('DrillCard', () => {
  it('renders the cue and the four options', () => {
    const w = mountCard()
    expect(w.text()).toContain('what is on the table?')
    for (const c of ['은', '는', '이', '가'])
      expect(w.find(`[data-testid="drill-option-${c}"]`).exists()).toBe(true)
  })

  it('emits answer with the picked choice', async () => {
    const w = mountCard()
    await w.get('[data-testid="drill-option-이"]').trigger('click')
    expect(w.emitted('answer')).toEqual([['이']])
  })

  it('shows the batchim explanation and disables the blocked option', () => {
    const w = mountCard({
      phase: 'blocked',
      verdict: { kind: 'blocked', expected: '이', nounHasBatchim: true },
      picked: '가',
      blockedChoices: new Set(['가']),
    })
    expect(w.find('[data-testid="drill-blocked"]').exists()).toBe(true)
    expect(w.get('[data-testid="drill-option-가"]').attributes('disabled')).toBeDefined()
  })

  it('reveals the answer and reason in the wrong phase', () => {
    const w = mountCard({
      phase: 'wrong',
      verdict: { kind: 'wrong-family', expected: '이', familyId: 'subject' },
      picked: '은',
    })
    const fb = w.get('[data-testid="drill-feedback"]')
    expect(fb.text()).toContain('책이 있어요.')
    expect(fb.text()).toContain('existence takes subject')
  })
})

describe('DrillCard — contraction', () => {
  const CONTRACTION: ClashSet = {
    id: 'contraction', kind: 'contraction', name: LS('축약'),
    families: [
      { id: 'subject', grammarKo: '이/가', invariant: false, afterConsonant: '이', afterVowel: '가', label: LS('subject') },
      { id: 'subject', grammarKo: '이/가', invariant: false, afterConsonant: '이', afterVowel: '가', label: LS('subject') },
    ],
  }
  const contractionItem: DrillItem = {
    id: 'ct-na', cue: LS('You volunteer to go'), noun: '나', rest: ' 갈게요.',
    setId: 'contraction', familyIndex: 0, reason: LS('나+가 → 내가'), trans: LS('I will go'),
  }
  const mountC = (overrides: Record<string, unknown> = {}) =>
    mount(DrillCard, {
      props: {
        item: contractionItem, set: CONTRACTION, phase: 'question', verdict: null,
        picked: null, blockedChoices: new Set(), ...overrides,
      },
    })

  it('renders the fused-form options', () => {
    const w = mountC()
    for (const c of ['내가', '나가'])
      expect(w.find(`[data-testid="drill-option-${c}"]`).exists()).toBe(true)
  })

  it('reveals the fused sentence without a double pronoun', () => {
    const w = mountC({ phase: 'right', verdict: { kind: 'correct' } })
    const text = w.get('[data-testid="drill-card"]').text()
    expect(text).toContain('내가 갈게요.')
    expect(text).not.toContain('나내가')
  })

  it('shows the contraction explanation (not the 받침 one) when the naive form is picked', () => {
    const w = mountC({
      phase: 'blocked',
      verdict: { kind: 'contraction', expected: '내가' },
      picked: '나가',
      blockedChoices: new Set(['나가']),
    })
    expect(w.find('[data-testid="drill-contraction"]').exists()).toBe(true)
    expect(w.find('[data-testid="drill-blocked"]').exists()).toBe(false)
  })
})
