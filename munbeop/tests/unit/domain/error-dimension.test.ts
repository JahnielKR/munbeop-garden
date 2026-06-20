import { describe, it, expect } from 'vitest'
import { ERROR_DIMENSIONS } from '~/lib/domain'

describe('ERROR_DIMENSIONS', () => {
  it('is exactly the five known failure dimensions in order', () => {
    expect(ERROR_DIMENSIONS).toEqual(['particle', 'ending', 'register', 'word_order', 'other'])
  })
})
