import { describe, expect, it, vi } from 'vitest'
import { notesFor } from '~/lib/usage-notes'
import { USAGE_NOTES_SHARD_BY_LEVEL } from '~/lib/usage-notes/shard-index'

const { loadedShards } = vi.hoisted(() => ({ loadedShards: [] as string[] }))

vi.mock('~/seed/usage-notes/shards/n4-0', async (importOriginal) => {
  loadedShards.push('n4-0')
  return importOriginal()
})
vi.mock('~/seed/usage-notes/shards/n4-1', async (importOriginal) => {
  loadedShards.push('n4-1')
  return importOriginal()
})
vi.mock('~/seed/usage-notes/shards/n4-2', async (importOriginal) => {
  loadedShards.push('n4-2')
  return importOriginal()
})
vi.mock('~/seed/usage-notes/shards/n4-3', async (importOriginal) => {
  loadedShards.push('n4-3')
  return importOriginal()
})
vi.mock('~/seed/usage-notes/shards/n4-4', async (importOriginal) => {
  loadedShards.push('n4-4')
  return importOriginal()
})
vi.mock('~/seed/usage-notes/shards/n5-0', async (importOriginal) => {
  loadedShards.push('n5-0')
  return importOriginal()
})
vi.mock('~/seed/usage-notes/shards/n5-1', async (importOriginal) => {
  loadedShards.push('n5-1')
  return importOriginal()
})
vi.mock('~/seed/usage-notes/shards/n5-2', async (importOriginal) => {
  loadedShards.push('n5-2')
  return importOriginal()
})
vi.mock('~/seed/usage-notes/shards/n5-3', async (importOriginal) => {
  loadedShards.push('n5-3')
  return importOriginal()
})
vi.mock('~/seed/usage-notes/shards/n5-4', async (importOriginal) => {
  loadedShards.push('n5-4')
  return importOriginal()
})

function grammarIn(level: 4 | 5, shardId: string): string {
  const match = Object.entries(USAGE_NOTES_SHARD_BY_LEVEL[level]).find(
    ([, candidate]) => candidate === shardId,
  )
  if (!match) throw new Error(`No grammar indexed for ${shardId}`)
  return match[0]
}

describe('usage-note shard loading', () => {
  it('imports only the shard selected by level and Grammar.ko', async () => {
    expect(loadedShards).toEqual([])

    const firstN4Grammar = grammarIn(4, 'n4-0')
    await expect(notesFor(firstN4Grammar, 'topik-4')).resolves.toBeDefined()
    expect(loadedShards).toEqual(['n4-0'])

    const anotherFromTheSameShard = Object.entries(USAGE_NOTES_SHARD_BY_LEVEL[4]).find(
      ([ko, shardId]) => shardId === 'n4-0' && ko !== firstN4Grammar,
    )?.[0]
    expect(anotherFromTheSameShard).toBeDefined()
    await expect(notesFor(anotherFromTheSameShard!, 'topik-4')).resolves.toBeDefined()
    expect(loadedShards).toEqual(['n4-0'])

    await expect(notesFor('not-authored', 'topik-4')).resolves.toBeUndefined()
    await expect(notesFor(firstN4Grammar, 'custom')).resolves.toBeUndefined()
    expect(loadedShards).toEqual(['n4-0'])

    const n4OnlyGrammar = Object.keys(USAGE_NOTES_SHARD_BY_LEVEL[4]).find(
      (ko) => !(ko in USAGE_NOTES_SHARD_BY_LEVEL[5]),
    )
    expect(n4OnlyGrammar).toBeDefined()
    await expect(notesFor(n4OnlyGrammar!, 'topik-5')).resolves.toBeUndefined()
    expect(loadedShards).toEqual(['n4-0'])

    await expect(notesFor(grammarIn(5, 'n5-4'), 'topik-5')).resolves.toBeDefined()
    expect(loadedShards).toEqual(['n4-0', 'n5-4'])
  })
})
