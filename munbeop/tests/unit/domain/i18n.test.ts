import { describe, it, expect } from 'vitest'
import { localized, type LocalizedString } from '~/lib/domain'

const value: LocalizedString = {
  en: 'EN',
  es: 'ES',
  fr: 'FR',
  'pt-BR': 'PT',
  th: 'TH',
  id: 'ID',
  vi: 'VI',
  ja: 'JA',
}

describe('localized()', () => {
  it('returns the requested locale', () => {
    expect(localized(value, 'fr')).toBe('FR')
    expect(localized(value, 'ja')).toBe('JA')
  })

  it('falls back to en when requested locale is empty', () => {
    const partial = { ...value, vi: '' }
    expect(localized(partial, 'vi')).toBe('EN')
  })

  it('returns empty string for undefined input', () => {
    expect(localized(undefined, 'en')).toBe('')
  })
})
