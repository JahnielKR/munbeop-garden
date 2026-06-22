import { describe, it, expect } from 'vitest'
import { exampleAudioId, exampleAudioSrc } from '~/lib/grammar-examples/audio'

describe('exampleAudioId (FNV-1a)', () => {
  it('is deterministic and 8 hex chars', () => {
    const a = exampleAudioId('저는 물을 마셔요.')
    expect(a).toMatch(/^[0-9a-f]{8}$/)
    expect(exampleAudioId('저는 물을 마셔요.')).toBe(a) // stable
  })
  it('differs for different sentences', () => {
    expect(exampleAudioId('저는 물을 마셔요.')).not.toBe(exampleAudioId('저는 물을 마십니다.'))
  })
})
describe('exampleAudioSrc', () => {
  it('builds the public path from the hash', () => {
    expect(exampleAudioSrc('저는 물을 마셔요.')).toBe(`/grammar-examples/audio/${exampleAudioId('저는 물을 마셔요.')}.ogg`)
  })
})
