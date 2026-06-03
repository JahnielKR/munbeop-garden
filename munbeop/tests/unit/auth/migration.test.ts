import { describe, it, expect, vi, beforeEach } from 'vitest'
import { migrateLocalToSupabase } from '~/lib/auth/migration'
import { STORAGE_KEYS } from '~/lib/storage/keys'

const SAMPLE_LOG = [
  {
    id: 1,
    ko: '-(으)니까',
    sentence: '시간이 없으니까 빨리 가요',
    feedback: 'easy',
    errorNote: null,
    reviewState: 'unreviewed',
    contextId: 'banmal',
    contextName: '반말',
    date: '2026-06-01T00:00:00Z',
  },
]
const SAMPLE_SRS = {
  '-(으)니까': {
    lastSeen: 1717200000000,
    easyCount: 1,
    hardCount: 0,
    mastery: 'seedling',
  },
}

function seedLocalStorage() {
  localStorage.setItem(STORAGE_KEYS.log, JSON.stringify(SAMPLE_LOG))
  localStorage.setItem(STORAGE_KEYS.srs, JSON.stringify(SAMPLE_SRS))
}

describe('migrateLocalToSupabase', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('writes local log + srs into the cloud adapter and clears those keys', async () => {
    seedLocalStorage()
    const supabaseWrites: Record<string, unknown> = {}
    const fakeAdapter = {
      read: vi.fn().mockResolvedValue([]),
      write: vi.fn().mockImplementation(async (key: string, value: unknown) => {
        supabaseWrites[key] = value
      }),
      remove: vi.fn(),
      clear: vi.fn(),
    }
    const result = await migrateLocalToSupabase(fakeAdapter as never)
    expect(result.migrated).toBe(true)
    expect(supabaseWrites[STORAGE_KEYS.log]).toHaveLength(1)
    expect(supabaseWrites[STORAGE_KEYS.srs]).toBeDefined()
    expect(localStorage.getItem(STORAGE_KEYS.log)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.srs)).toBeNull()
  })

  it('returns migrated:false when localStorage is empty', async () => {
    const adapter = {
      read: vi.fn(),
      write: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    }
    const result = await migrateLocalToSupabase(adapter as never)
    expect(result.migrated).toBe(false)
    expect(adapter.write).not.toHaveBeenCalled()
  })

  it('skips empty array/object values (does not write {} or [])', async () => {
    localStorage.setItem(STORAGE_KEYS.log, JSON.stringify([]))
    localStorage.setItem(STORAGE_KEYS.srs, JSON.stringify({}))
    localStorage.setItem(STORAGE_KEYS.decks, JSON.stringify([{ id: 'general', name: 'X', colorId: 'indigo', order: 0, collapsed: false }]))
    const adapter = {
      read: vi.fn(),
      write: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    }
    const result = await migrateLocalToSupabase(adapter as never)
    expect(result.migrated).toBe(true)
    expect(result.keysCopied).toEqual([STORAGE_KEYS.decks])
    // Only decks should have been written.
    expect(adapter.write).toHaveBeenCalledTimes(1)
  })

  it('leaves the locale key alone (locale stays per-device, never migrates)', async () => {
    seedLocalStorage()
    localStorage.setItem(STORAGE_KEYS.locale, 'ja')
    const adapter = {
      read: vi.fn(),
      write: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn(),
      clear: vi.fn(),
    }
    await migrateLocalToSupabase(adapter as never)
    expect(localStorage.getItem(STORAGE_KEYS.locale)).toBe('ja')
    const writtenKeys = (adapter.write as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0])
    expect(writtenKeys).not.toContain(STORAGE_KEYS.locale)
  })
})
