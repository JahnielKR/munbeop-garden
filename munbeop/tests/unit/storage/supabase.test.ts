import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabaseAdapter } from '~/lib/storage/supabase'
import { STORAGE_KEYS } from '~/lib/storage/keys'
import type { LogEntry } from '~/lib/domain'

// Minimal hand-rolled mock that records writes per-table and returns
// configurable read results. Keeps tests independent of the full Supabase
// client shape and avoids pulling MSW or supabase test helpers into the bundle.
function makeMockClient() {
  const data: Record<string, unknown[]> = {
    grammars: [],
    contexts: [],
    user_progress: [],
    user_log: [],
    user_decks: [],
    user_custom_grammars: [],
    user_custom_contexts: [],
    user_inactive_contexts: [],
  }
  const writes: Array<{ table: string; op: 'upsert' | 'delete'; payload: unknown }> = []
  return {
    data,
    writes,
    from(table: string) {
      return {
        select: (_cols?: string) => {
          // Both eq() and order() must return the same chain so call sites
          // can mix-and-match (.select.eq, .select.eq.order, etc).
          const chain = {
            eq: (_col: string, _val: unknown) => chain,
            order: (_col: string, _opts?: unknown) => chain,
            then: (cb: (v: { data: unknown[]; error: null }) => unknown) =>
              cb({ data: data[table] ?? [], error: null }),
          }
          return chain
        },
        upsert: (rowOrRows: unknown) => {
          const arr = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows]
          data[table] = [...(data[table] ?? []), ...arr]
          writes.push({ table, op: 'upsert', payload: rowOrRows })
          return Promise.resolve({ error: null })
        },
        delete: () => ({
          eq: (_col: string, _val: unknown) => {
            const before = (data[table] ?? []).length
            data[table] = []
            writes.push({ table, op: 'delete', payload: { rows: before } })
            return Promise.resolve({ error: null })
          },
        }),
      }
    },
  }
}

const USER = 'user-uuid-fake'

describe('SupabaseAdapter', () => {
  let client: ReturnType<typeof makeMockClient>
  let adapter: SupabaseAdapter

  beforeEach(() => {
    client = makeMockClient()
    adapter = new SupabaseAdapter(client as never, USER)
  })

  describe('read', () => {
    it('grammar: returns catalog ∪ user_custom_grammars merged', async () => {
      client.data.grammars = [{ ko: 'A', meaning: {}, deck_id: 'general' }]
      client.data.user_custom_grammars = [{ ko: 'B', meaning: {}, deck_id: 'general' }]
      const result = (await adapter.read(STORAGE_KEYS.grammar, [])) as Array<{ ko: string }>
      expect(result).toHaveLength(2)
      expect(result.map((g) => g.ko).sort()).toEqual(['A', 'B'])
    })

    it('srs: maps user_progress rows into SrsMap', async () => {
      client.data.user_progress = [
        {
          ko: '-(으)니까',
          last_seen: '2026-06-01T00:00:00Z',
          easy_count: 3,
          hard_count: 1,
          mastery: 'plant',
        },
      ]
      const map = (await adapter.read(STORAGE_KEYS.srs, {})) as Record<string, { easyCount: number; mastery: string }>
      expect(map['-(으)니까']?.easyCount).toBe(3)
      expect(map['-(으)니까']?.mastery).toBe('plant')
    })

    it('log: maps snake_case columns into LogEntry camelCase shape', async () => {
      client.data.user_log = [
        {
          id: 1,
          ko: 'A',
          sentence: 'x',
          feedback: 'easy',
          error_note: null,
          review_state: 'unreviewed',
          context_id: 'banmal',
          context_name: '반말',
          created_at: '2026-06-01T00:00:00Z',
        },
      ]
      const entries = (await adapter.read(STORAGE_KEYS.log, [])) as LogEntry[]
      expect(entries[0]?.errorNote).toBeNull()
      expect(entries[0]?.reviewState).toBe('unreviewed')
      expect(entries[0]?.contextId).toBe('banmal')
    })

    it('inactiveContextIds: returns plain string[] of context ids', async () => {
      client.data.user_inactive_contexts = [{ context_id: 'sns' }, { context_id: 'drama' }]
      const ids = (await adapter.read(STORAGE_KEYS.inactiveContextIds, [])) as string[]
      expect(ids.sort()).toEqual(['drama', 'sns'])
    })

    it('locale: falls through (returns fallback, never touches Supabase)', async () => {
      const v = await adapter.read(STORAGE_KEYS.locale, 'en')
      expect(v).toBe('en')
      // No reads/writes recorded for locale.
      expect(client.writes.filter((w) => w.table.includes('locale'))).toHaveLength(0)
    })
  })

  describe('write', () => {
    it('log: upserts each entry to user_log with snake_case + user_id', async () => {
      await adapter.write(STORAGE_KEYS.log, [
        {
          id: 1,
          ko: 'A',
          sentence: 'x',
          feedback: 'easy',
          errorNote: null,
          reviewState: 'unreviewed',
          contextId: 'banmal',
          contextName: '반말',
          date: '2026-06-03T00:00:00Z',
        },
      ])
      const upsert = client.writes.find((w) => w.table === 'user_log' && w.op === 'upsert')
      expect(upsert).toBeDefined()
      const rows = upsert!.payload as Array<{ user_id: string; review_state: string; context_id: string }>
      expect(rows[0]?.user_id).toBe(USER)
      expect(rows[0]?.review_state).toBe('unreviewed')
      expect(rows[0]?.context_id).toBe('banmal')
    })

    it('srs: upserts each (ko, srs) pair as a user_progress row', async () => {
      await adapter.write(STORAGE_KEYS.srs, {
        '-(으)니까': {
          lastSeen: 1717200000000,
          easyCount: 1,
          hardCount: 0,
          mastery: 'seedling',
        },
      })
      const upsert = client.writes.find((w) => w.table === 'user_progress')
      expect(upsert?.op).toBe('upsert')
    })

    it('inactiveContextIds: deletes all rows then upserts the new list', async () => {
      client.data.user_inactive_contexts = [{ context_id: 'old' }]
      await adapter.write(STORAGE_KEYS.inactiveContextIds, ['sns'])
      const ops = client.writes.filter((w) => w.table === 'user_inactive_contexts')
      expect(ops[0]?.op).toBe('delete')
      expect(ops[1]?.op).toBe('upsert')
    })

    it('locale: no-op (write skipped entirely)', async () => {
      const before = client.writes.length
      await adapter.write(STORAGE_KEYS.locale, 'ja')
      expect(client.writes.length).toBe(before)
    })
  })

  describe('clear', () => {
    it('deletes from every user_* table but leaves catalog (grammars, contexts) intact', async () => {
      client.data.user_log = [{ id: 1 }]
      client.data.user_progress = [{ ko: 'A' }]
      client.data.grammars = [{ ko: 'X' }]
      client.data.contexts = [{ id: 'banmal' }]
      await adapter.clear()
      expect(client.data.user_log).toHaveLength(0)
      expect(client.data.user_progress).toHaveLength(0)
      expect(client.data.grammars).toHaveLength(1)
      expect(client.data.contexts).toHaveLength(1)
    })
  })
})

// Keep linter happy about referenced symbols in inline mocks.
vi.fn()
