import { describe, expect, it, vi } from 'vitest'
import { SupabaseAdapter } from '~/lib/storage/supabase'
import { STORAGE_KEYS } from '~/lib/storage/keys'
import type { LogEntry } from '~/lib/domain'

const entry: LogEntry = {
  id: 42,
  ko: '-는데',
  sentence: '비가 오는데 나가요.',
  feedback: 'hard',
  errorNote: 'review',
  errorDimension: 'meaning',
  reviewState: 'correct',
  contextId: 'plain',
  contextName: 'Plain',
  date: '2026-08-15T00:00:00.000Z',
}

describe('SupabaseAdapter journal deltas', () => {
  it('uses an idempotent one-row upsert for append retries', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null })
    const from = vi.fn(() => ({ upsert }))
    const adapter = new SupabaseAdapter({ from } as never, 'user-1')

    await adapter.append(STORAGE_KEYS.log, entry)

    expect(from).toHaveBeenCalledWith('user_log')
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 42,
        user_id: 'user-1',
        review_state: 'correct',
      }),
      { onConflict: 'user_id,id' },
    )
  })

  it('updates an existing journal row and never upserts a review edit', async () => {
    const select = vi.fn().mockResolvedValue({ data: [{ id: 42 }], error: null })
    const eqId = vi.fn(() => ({ select }))
    const eqUser = vi.fn(() => ({ eq: eqId }))
    const update = vi.fn(() => ({ eq: eqUser }))
    const upsert = vi.fn()
    const from = vi.fn(() => ({ update, upsert }))
    const adapter = new SupabaseAdapter({ from } as never, 'user-1')

    await expect(
      adapter.updateOne(STORAGE_KEYS.log, { id: entry.id, value: entry }),
    ).resolves.toBe(true)

    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      review_state: 'correct',
      error_note: 'review',
    }))
    expect(update.mock.calls[0]![0]).not.toHaveProperty('id')
    expect(update.mock.calls[0]![0]).not.toHaveProperty('user_id')
    expect(eqUser).toHaveBeenCalledWith('user_id', 'user-1')
    expect(eqId).toHaveBeenCalledWith('id', 42)
    expect(select).toHaveBeenCalledWith('id')
    expect(upsert).not.toHaveBeenCalled()
  })

  it('reports false when an update affects no row', async () => {
    const select = vi.fn().mockResolvedValue({ data: [], error: null })
    const eqId = vi.fn(() => ({ select }))
    const eqUser = vi.fn(() => ({ eq: eqId }))
    const update = vi.fn(() => ({ eq: eqUser }))
    const adapter = new SupabaseAdapter({ from: () => ({ update }) } as never, 'user-1')

    await expect(
      adapter.updateOne(STORAGE_KEYS.log, { id: entry.id, value: entry }),
    ).resolves.toBe(false)
  })
})
