import { describe, it, expect } from 'vitest'
import { PRACTICE_HELP, helpFor } from '~/seed/practice-help'
import { LOCALE_CODES } from '~/lib/domain'

const MODES = [
  'ruleta', 'particles', 'conjugation', 'register', 'cloze',
  'counters', 'placement', 'number-market', 'rescue', 'escape-room',
  'sentence-garden',
]

describe('practice-help seed invariants', () => {
  it('helpFor resolves a known entry and is undefined otherwise', () => {
    expect(helpFor('register')).toBeTruthy()
    expect(helpFor('does-not-exist')).toBeUndefined()
  })

  it('every registry key is a known practice mode', () => {
    for (const key of Object.keys(PRACTICE_HELP)) {
      expect(MODES, key).toContain(key)
    }
  })

  it('every entry is fully localized in all 8 locales', () => {
    for (const [mode, c] of Object.entries(PRACTICE_HELP)) {
      const content = c!
      expect(content.ko, `${mode} ko`).toBeTruthy()
      for (const code of LOCALE_CODES) {
        expect(content.subtitle[code], `${mode} subtitle ${code}`).toBeTruthy()
        expect(content.concept[code], `${mode} concept ${code}`).toBeTruthy()
      }
      expect(content.howToPlay.length, `${mode} howToPlay empty`).toBeGreaterThan(0)
      content.howToPlay.forEach((step, i) => {
        for (const code of LOCALE_CODES) {
          expect(step[code], `${mode} howToPlay[${i}] ${code}`).toBeTruthy()
        }
      })
      for (const type of content.types ?? []) {
        expect(type.ko, `${mode} type.ko`).toBeTruthy()
        expect(type.example, `${mode} ${type.ko} example`).toBeTruthy()
        for (const code of LOCALE_CODES) {
          expect(type.label[code], `${mode} ${type.ko} label ${code}`).toBeTruthy()
          expect(type.desc[code], `${mode} ${type.ko} desc ${code}`).toBeTruthy()
          expect(type.gloss[code], `${mode} ${type.ko} gloss ${code}`).toBeTruthy()
        }
      }
      if (content.tip) {
        for (const code of LOCALE_CODES) {
          expect(content.tip[code], `${mode} tip ${code}`).toBeTruthy()
        }
      }
    }
  })
})
