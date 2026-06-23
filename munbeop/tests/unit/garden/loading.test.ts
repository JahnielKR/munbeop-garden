import { describe, it, expect } from 'vitest'
import { heroState } from '~/lib/garden/loading'

describe('heroState', () => {
  it('is loading until the data is ready', () => {
    expect(heroState('idle', false)).toBe('loading')
    expect(heroState('loading', true)).toBe('loading')
    expect(heroState('error', false)).toBe('loading')
  })
  it('is empty when ready with no log entries', () => {
    expect(heroState('ready', true)).toBe('empty')
  })
  it('is tree when ready with entries', () => {
    expect(heroState('ready', false)).toBe('tree')
  })
})
