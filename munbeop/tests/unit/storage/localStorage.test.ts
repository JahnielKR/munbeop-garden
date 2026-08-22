import { describe, it, expect, beforeEach } from 'vitest'
import { LocalStorageAdapter } from '~/lib/storage/localStorage'
import { STORAGE_KEYS } from '~/lib/storage/keys'
import type { LogEntry } from '~/lib/domain'

describe('LocalStorageAdapter (async)', () => {
  let adapter: LocalStorageAdapter

  beforeEach(() => {
    localStorage.clear()
    adapter = new LocalStorageAdapter()
  })

  const journalEntry = (over: Partial<LogEntry> = {}): LogEntry => ({
    id: 41,
    ko: 'A',
    sentence: 'sentence',
    feedback: 'easy',
    errorNote: null,
    reviewState: 'unreviewed',
    contextId: 'banmal',
    contextName: 'banmal',
    date: '2026-08-22T00:00:00.000Z',
    revision: 0,
    ...over,
  })

  it('returns fallback when missing', async () => {
    expect(await adapter.read(STORAGE_KEYS.grammar, [] as unknown[])).toEqual([])
  })

  it('round-trips values', async () => {
    const v = { a: 1, b: ['x', 'y'] }
    await adapter.write(STORAGE_KEYS.grammar, v)
    expect(await adapter.read(STORAGE_KEYS.grammar, null)).toEqual(v)
  })

  it('returns fallback on malformed JSON', async () => {
    localStorage.setItem(STORAGE_KEYS.grammar, '{ not valid')
    expect(await adapter.read(STORAGE_KEYS.grammar, 'fb')).toBe('fb')
  })

  it('remove deletes', async () => {
    await adapter.write(STORAGE_KEYS.log, [1, 2, 3])
    await adapter.remove(STORAGE_KEYS.log)
    expect(await adapter.read(STORAGE_KEYS.log, null)).toBeNull()
  })

  it('append adds one item to the stored collection', async () => {
    await adapter.append(STORAGE_KEYS.log, { id: 1 })
    await adapter.append(STORAGE_KEYS.log, { id: 2 })
    expect(await adapter.read(STORAGE_KEYS.log, [])).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('append is idempotent when a retry reuses an item id', async () => {
    await adapter.append(STORAGE_KEYS.log, { id: 1, state: 'old' })
    await adapter.append(STORAGE_KEYS.log, { id: 1, state: 'confirmed' })
    expect(await adapter.read(STORAGE_KEYS.log, [])).toEqual([{ id: 1, state: 'confirmed' }])
  })

  it('upsertOne inserts and overwrites a keyed entry in the stored map', async () => {
    await adapter.upsertOne(STORAGE_KEYS.srs, { id: 'A', value: 1 })
    await adapter.upsertOne(STORAGE_KEYS.srs, { id: 'B', value: 2 })
    await adapter.upsertOne(STORAGE_KEYS.srs, { id: 'A', value: 9 })
    expect(await adapter.read(STORAGE_KEYS.srs, {})).toEqual({ A: 9, B: 2 })
  })

  it('increment adds a delta to an activity counter', async () => {
    await expect(adapter.increment(STORAGE_KEYS.activity, '2026-08-21')).resolves.toBe(1)
    await expect(adapter.increment(STORAGE_KEYS.activity, '2026-08-21', 2)).resolves.toBe(3)
    expect(await adapter.read(STORAGE_KEYS.activity, {})).toEqual({
      '2026-08-21': { count: 3 },
    })
  })

  it('restore applies all supplied values and clears null keys', async () => {
    await adapter.write(STORAGE_KEYS.log, [{ id: 1 }])
    await adapter.restore({
      [STORAGE_KEYS.log]: null,
      [STORAGE_KEYS.srs]: { A: { easyCount: 2 } },
    })
    expect(await adapter.read(STORAGE_KEYS.log, null)).toBeNull()
    expect(await adapter.read(STORAGE_KEYS.srs, {})).toEqual({ A: { easyCount: 2 } })
  })

  it('updateOne replaces only an existing collection row and never inserts a missing id', async () => {
    await adapter.write(STORAGE_KEYS.log, [
      { id: 1, state: 'old' },
      { id: 2, state: 'keep' },
    ])
    await expect(
      adapter.updateOne(STORAGE_KEYS.log, { id: 1, value: { id: 1, state: 'new' } }),
    ).resolves.toBe(true)
    await expect(
      adapter.updateOne(STORAGE_KEYS.log, { id: 3, value: { id: 3, state: 'ghost' } }),
    ).resolves.toBe(false)
    expect(await adapter.read(STORAGE_KEYS.log, [])).toEqual([
      { id: 1, state: 'new' },
      { id: 2, state: 'keep' },
    ])
  })

  it('atomically saves/reviews/deletes a journal row with authoritative SRS revisions', async () => {
    const saved = await adapter.saveJournalEntry(journalEntry())
    expect(saved).toMatchObject({
      entry: { id: 41, revision: 0 },
      progress: { ko: 'A', easyCount: 1, hardCount: 0, revision: 1 },
    })
    expect(
      await adapter.read<Record<string, Record<string, unknown>>>(STORAGE_KEYS.srs, {}),
    ).toEqual({
      A: expect.not.objectContaining({ ko: expect.anything() }),
    })

    const reviewed = await adapter.setJournalReview({
      id: 41,
      reviewState: 'incorrect',
      errorNote: 'particle',
      expectedRevision: 0,
    })
    expect(reviewed).toMatchObject({
      entry: { reviewState: 'incorrect', errorNote: 'particle', revision: 1 },
      progress: { easyCount: 0, hardCount: 0, revision: 2 },
    })

    // A lost response retry acknowledges the already-applied pair without
    // incrementing the entry revision a second time.
    const retried = await adapter.setJournalReview({
      id: 41,
      reviewState: 'incorrect',
      errorNote: 'particle',
      expectedRevision: 0,
    })
    expect(retried.entry.revision).toBe(1)

    const deleted = await adapter.deleteJournalEntry({
      id: 41,
      expectedKo: 'A',
      expectedRevision: 1,
    })
    expect(deleted).toMatchObject({ deleted: true, id: 41, progress: { easyCount: 0 } })
    expect(await adapter.read(STORAGE_KEYS.log, [])).toEqual([])
  })

  it('rejects reuse of a stable journal id with different immutable content', async () => {
    await adapter.saveJournalEntry(journalEntry())
    await expect(adapter.saveJournalEntry(journalEntry({ sentence: 'different' }))).rejects.toThrow(
      /different payload/i,
    )
  })

  it('treats reordered but equal journal objects as the same idempotent payload', async () => {
    const first = journalEntry()
    await adapter.saveJournalEntry(first)
    const reordered: LogEntry = {
      revision: 0,
      date: first.date,
      contextName: first.contextName,
      contextId: first.contextId,
      reviewState: first.reviewState,
      errorNote: first.errorNote,
      feedback: first.feedback,
      sentence: first.sentence,
      ko: first.ko,
      id: first.id,
    }
    await expect(adapter.saveJournalEntry(reordered)).resolves.toMatchObject({
      entry: { id: first.id },
    })
  })

  it('never moves lastSeen backwards', async () => {
    const newest = await adapter.markProgressSeen('A', 2000)
    const lateRetry = await adapter.markProgressSeen('A', 1000)
    expect(newest.lastSeen).toBe(2000)
    expect(lateRetry.lastSeen).toBe(2000)
    expect(lateRetry.revision).toBe(newest.revision)
  })

  it('clear wipes known keys only', async () => {
    localStorage.setItem('unrelated', 'keep')
    await adapter.write(STORAGE_KEYS.grammar, ['a'])
    await adapter.clear()
    expect(await adapter.read(STORAGE_KEYS.grammar, null)).toBeNull()
    expect(localStorage.getItem('unrelated')).toBe('keep')
  })
})
