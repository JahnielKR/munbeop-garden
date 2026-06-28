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

// FÁCIL / DIFÍCIL render their i18n key under the key-echo stub, so target by it.
function clickFeedback(w: ReturnType<typeof mountCard>, key: string) {
  const btn = w.findAll('button').find((b) => b.text().includes(key))
  if (!btn) throw new Error(`button not found: ${key}`)
  return btn.trigger('click')
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

describe('practice GrammarCard — Korean-only sentence gate', () => {
  it('blocks FÁCIL on a non-Korean sentence and shows the red message', async () => {
    const w = mountCard()
    await w.find('textarea').setValue('hello')
    await clickFeedback(w, 'practice.fb_easy')

    expect(w.emitted('submit')).toBeUndefined()
    const err = w.find('.sentence-error')
    expect(err.exists()).toBe(true)
    expect(err.text()).toContain('practice.sentence_korean_only')
    expect(err.attributes('role')).toBe('alert')
  })

  it('blocks DIFÍCIL on non-Korean input — the note block never opens', async () => {
    const w = mountCard()
    await w.find('textarea').setValue('hola amigo')
    await clickFeedback(w, 'practice.fb_hard')

    expect(w.find('.enote').exists()).toBe(false)
    expect(w.find('.sentence-error').exists()).toBe(true)
  })

  it('blocks input that has no Hangul at all (digits only)', async () => {
    const w = mountCard()
    await w.find('textarea').setValue('1234')
    await clickFeedback(w, 'practice.fb_easy')

    expect(w.emitted('submit')).toBeUndefined()
    expect(w.find('.sentence-error').exists()).toBe(true)
  })

  it('allows FÁCIL with a valid Korean sentence and emits submit', async () => {
    const w = mountCard()
    await w.find('textarea').setValue('저는 학생이에요')
    await clickFeedback(w, 'practice.fb_easy')

    const submit = w.emitted('submit')
    expect(submit).toBeTruthy()
    expect(submit![0]![0]).toMatchObject({ sentence: '저는 학생이에요', feedback: 'easy' })
    expect(w.find('.sentence-error').exists()).toBe(false)
  })

  it('accepts Korean mixed with digits and punctuation', async () => {
    const w = mountCard()
    await w.find('textarea').setValue('3시에 만나요?')
    await clickFeedback(w, 'practice.fb_easy')

    expect(w.emitted('submit')).toBeTruthy()
    expect(w.find('.sentence-error').exists()).toBe(false)
  })

  it('clears the red message as soon as the learner edits the sentence', async () => {
    const w = mountCard()
    await w.find('textarea').setValue('hello')
    await clickFeedback(w, 'practice.fb_easy')
    expect(w.find('.sentence-error').exists()).toBe(true)

    await w.find('textarea').setValue('안녕하세요')
    expect(w.find('.sentence-error').exists()).toBe(false)
  })
})
