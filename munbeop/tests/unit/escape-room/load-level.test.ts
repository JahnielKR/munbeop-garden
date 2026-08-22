import { describe, expect, it } from 'vitest'
import { loadPlayableLevel } from '~/seed/escape-room/load-level'

describe('loadPlayableLevel', () => {
  it('loads the selected playable story', async () => {
    const level = await loadPlayableLevel('level-03')

    expect(level?.id).toBe('level-03')
    expect(level?.rooms.length).toBeGreaterThan(0)
  })

  it('rejects unknown ids without importing a fallback story', async () => {
    await expect(loadPlayableLevel('level-99')).resolves.toBeNull()
  })
})
