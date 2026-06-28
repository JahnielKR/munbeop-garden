import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SentenceInput from '~/components/practice/SentenceInput.vue'

describe('SentenceInput', () => {
  it('gives the textarea an accessible name (aria-label), not just a placeholder', () => {
    // A placeholder is not a reliable accessible name; the practice sentence box
    // is the most-used control, so it must carry an aria-label. (i18n key-echo
    // stub returns the key.)
    const w = mount(SentenceInput, { props: { modelValue: '' } })
    const ta = w.find('textarea')
    expect(ta.exists()).toBe(true)
    expect(ta.attributes('aria-label')).toBe('practice.sentence_input_label')
  })
})
