import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Context, Grammar } from '~/lib/domain'
import GrammarCard from '~/components/practice/GrammarCard.vue'

// The practice card reads mastery off the SRS store; stub it so the test
// doesn't need a hydrated Pinia.
vi.mock('~/stores/srs', () => ({
  useSrsStore: () => ({ peek: () => ({ mastery: 'seedling', lastSeen: null }) }),
}))

const empty = { en: '', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' }

const grammar: Grammar = {
  ko: '은/는',
  meaning: { ...empty, en: 'topic particle' },
  example: '저는 학생이에요.',
  trans: { ...empty, en: 'I am a student.' },
  deckId: 'topik-1',
}

const context: Context = {
  id: 'ctx-1',
  name: '반말',
  scene: { ...empty, en: 'talking to a close friend' },
  category: 'formalidad',
  builtin: true,
}

function mountCard(g: Grammar = grammar) {
  return mount(GrammarCard, { props: { grammar: g, context, progress: 0, pickIndex: 0 } })
}

describe('practice GrammarCard — example reveal', () => {
  it('hides the example until the toggle is clicked', async () => {
    const w = mountCard()
    // Collapsed: only the opt-in toggle, no example text.
    const toggle = w.find('.example-toggle')
    expect(toggle.exists()).toBe(true)
    expect(toggle.text()).toContain('practice.show_example')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(w.find('.example-reveal').exists()).toBe(false)
    expect(w.html()).not.toContain('저는 학생이에요')

    // Reveal on click: example + translation appear, label flips to hide.
    await toggle.trigger('click')
    expect(w.find('.example-reveal').exists()).toBe(true)
    expect(w.html()).toContain('저는 학생이에요')
    expect(w.html()).toContain('I am a student')
    expect(w.find('.example-toggle').text()).toContain('practice.hide_example')
    expect(w.find('.example-toggle').attributes('aria-expanded')).toBe('true')

    // Toggle back off.
    await w.find('.example-toggle').trigger('click')
    expect(w.find('.example-reveal').exists()).toBe(false)
    expect(w.find('.example-toggle').text()).toContain('practice.show_example')
  })

  it('renders no example affordance when the grammar has no example', () => {
    const w = mountCard({ ko: '-다', meaning: { ...empty, en: 'plain ending' }, deckId: 'topik-1' })
    expect(w.find('.example-block').exists()).toBe(false)
    expect(w.find('.example-toggle').exists()).toBe(false)
  })
})

describe('practice GrammarCard — answer is not lost on a failed save', () => {
  function typedCard() {
    const w = mountCard()
    return w
  }

  it('keeps the sentence after submit until progress advances (a confirmed save)', async () => {
    const w = typedCard()
    await w.find('textarea.input').setValue('나는 학생이에요.')

    // Submit (Easy) emits, but the input must NOT clear — the parent has not yet
    // confirmed the cloud write, so a failure would otherwise lose the sentence.
    await w.find('.fb').findAll('button')[0]!.trigger('click')
    expect(w.emitted('submit')).toHaveLength(1)
    expect((w.find('textarea.input').element as HTMLTextAreaElement).value).toBe('나는 학생이에요.')

    // A second tap before confirmation must not double-log the same answer.
    await w.find('.fb').findAll('button')[0]!.trigger('click')
    expect(w.emitted('submit')).toHaveLength(1)

    // The parent confirms by advancing the context → the input clears for the
    // next context.
    await w.setProps({ progress: 1 })
    expect((w.find('textarea.input').element as HTMLTextAreaElement).value).toBe('')
  })

  it('re-enables the actions when an in-flight save resolves without advancing (a failed save)', async () => {
    const w = typedCard()
    await w.find('textarea.input').setValue('나는 학생이에요.')
    await w.find('.fb').findAll('button')[0]!.trigger('click')
    expect(w.emitted('submit')).toHaveLength(1)

    // Parent toggles :submitting true→false on a failure (progress unchanged).
    await w.setProps({ submitting: true })
    await w.setProps({ submitting: false })

    // The sentence is still there and a retry tap submits again.
    expect((w.find('textarea.input').element as HTMLTextAreaElement).value).toBe('나는 학생이에요.')
    await w.find('.fb').findAll('button')[0]!.trigger('click')
    expect(w.emitted('submit')).toHaveLength(2)
  })
})
