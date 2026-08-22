import { describe, expect, it } from 'vitest'
import { loadHelpFor } from '~/lib/practice-help/load'

describe('lazy practice help', () => {
  it('loads only the requested mode article', async () => {
    const help = await loadHelpFor('register')
    expect(help.ko).toBe('높임법')
    expect(help.types).toHaveLength(3)
  })
})
