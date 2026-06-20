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
    user_settings: [],
    user_custom_decks: [],
  }
  const writes: Array<{ table: string; op: 'upsert' | 'delete' | 'insert'; payload: unknown }> = []
  // Per-table injected error: when set, reads/writes for that table resolve
  // with { error } the way @supabase/supabase-js does on an RLS denial or a
  // network/PostgREST failure (it does NOT throw — it returns the error).
  const errors: Record<string, { message: string } | undefined> = {}
  return {
    data,
    writes,
    errors,
    from(table: string) {
      return {
        select: (_cols?: string) => {
          // Both eq() and order() must return the same chain so call sites
          // can mix-and-match (.select.eq, .select.eq.order, etc).
          const chain = {
            eq: (_col: string, _val: unknown) => chain,
            order: (_col: string, _opts?: unknown) => chain,
            then: (cb: (v: { data: unknown[] | null; error: { message: string } | null }) => unknown) =>
              cb(
                errors[table]
                  ? { data: null, error: errors[table]! }
                  : { data: data[table] ?? [], error: null },
              ),
          }
          return chain
        },
        upsert: (rowOrRows: unknown) => {
          if (errors[table]) return Promise.resolve({ error: errors[table] })
          const arr = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows]
          data[table] = [...(data[table] ?? []), ...arr]
          writes.push({ table, op: 'upsert', payload: rowOrRows })
          return Promise.resolve({ error: null })
        },
        insert: (rowOrRows: unknown) => {
          if (errors[table]) return Promise.resolve({ error: errors[table] })
          const arr = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows]
          data[table] = [...(data[table] ?? []), ...arr]
          writes.push({ table, op: 'insert', payload: rowOrRows })
          return Promise.resolve({ error: null })
        },
        delete: () => ({
          eq: (_col: string, _val: unknown) => {
            if (errors[table]) return Promise.resolve({ error: errors[table] })
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

    it('settings: returns the prefs blob of the user row', async () => {
      client.data.user_settings = [{ prefs: { theme: 'dark', locale: 'es' } }]
      const v = (await adapter.read(STORAGE_KEYS.settings, null)) as { theme: string; locale: string } | null
      expect(v).toEqual({ theme: 'dark', locale: 'es' })
    })

    it('settings: returns fallback when the user has no row', async () => {
      const v = await adapter.read(STORAGE_KEYS.settings, { theme: 'light', locale: 'en' })
      expect(v).toEqual({ theme: 'light', locale: 'en' })
    })
  })

  describe('error_dimension round-trip', () => {
    it('log read maps error_dimension into errorDimension', async () => {
      client.data.user_log = [
        {
          id: 2, ko: 'A', sentence: 'x', feedback: 'hard', error_note: null,
          error_dimension: 'particle', review_state: 'unreviewed',
          context_id: 'banmal', context_name: '반말', created_at: '2026-06-20T00:00:00Z',
        },
      ]
      const entries = (await adapter.read(STORAGE_KEYS.log, [])) as LogEntry[]
      expect(entries[0]?.errorDimension).toBe('particle')
    })

    it('log write includes error_dimension in the upserted row', async () => {
      await adapter.write(STORAGE_KEYS.log, [
        {
          id: 3, ko: 'A', sentence: 'x', feedback: 'hard', errorNote: null,
          errorDimension: 'ending', reviewState: 'unreviewed',
          contextId: 'banmal', contextName: '반말', date: '2026-06-20T00:00:00Z',
        },
      ])
      const upsert = client.writes.find((w) => w.table === 'user_log' && w.op === 'upsert')
      const rows = upsert!.payload as Array<{ error_dimension: string | null }>
      expect(rows[0]?.error_dimension).toBe('ending')
    })
  })

  describe('customDecks round-trip', () => {
    it('write: deletes then upserts snake_case rows into user_custom_decks', async () => {
      client.data.user_custom_decks = [{ id: 'old', user_id: USER }]
      await adapter.write(STORAGE_KEYS.customDecks, [
        {
          id: 'cd1',
          name: 'My Deck',
          colorId: 'jade',
          icon: 'deck-star',
          grammarKos: ['-(으)니까', '-아서/어서'],
          order: 2,
          createdAt: '2026-06-20T00:00:00Z',
        },
      ])
      const ops = client.writes.filter((w) => w.table === 'user_custom_decks')
      expect(ops[0]?.op).toBe('delete')
      const upsert = ops.find((w) => w.op === 'upsert')
      expect(upsert).toBeDefined()
      const rows = upsert!.payload as Array<{
        user_id: string
        id: string
        name: string
        color_id: string
        icon: string
        image_url: string | null
        grammar_kos: string[]
        position: number
        created_at: string
      }>
      expect(rows[0]?.user_id).toBe(USER)
      expect(rows[0]?.id).toBe('cd1')
      expect(rows[0]?.color_id).toBe('jade')
      expect(rows[0]?.icon).toBe('deck-star')
      expect(rows[0]?.image_url).toBeNull()
      expect(rows[0]?.grammar_kos).toEqual(['-(으)니까', '-아서/어서'])
      expect(rows[0]?.position).toBe(2)
      expect(rows[0]?.created_at).toBe('2026-06-20T00:00:00Z')
    })

    it('read: maps snake_case rows into camelCase CustomDeck[]', async () => {
      client.data.user_custom_decks = [
        {
          id: 'cd1',
          name: 'My Deck',
          color_id: 'gold',
          icon: 'deck-heart',
          image_url: 'https://example.com/cover.png',
          grammar_kos: ['-(으)니까'],
          position: 1,
          created_at: '2026-06-20T00:00:00Z',
        },
      ]
      const decks = (await adapter.read(STORAGE_KEYS.customDecks, [])) as Array<{
        id: string
        name: string
        colorId: string
        icon: string
        imageUrl?: string
        grammarKos: string[]
        order: number
        createdAt: string
      }>
      expect(decks[0]?.id).toBe('cd1')
      expect(decks[0]?.colorId).toBe('gold')
      expect(decks[0]?.icon).toBe('deck-heart')
      expect(decks[0]?.imageUrl).toBe('https://example.com/cover.png')
      expect(decks[0]?.grammarKos).toEqual(['-(으)니까'])
      expect(decks[0]?.order).toBe(1)
      expect(decks[0]?.createdAt).toBe('2026-06-20T00:00:00Z')
    })

    it('read: a row with image_url null yields no imageUrl key', async () => {
      client.data.user_custom_decks = [
        {
          id: 'cd2',
          name: 'No Cover',
          color_id: 'sky',
          icon: 'deck-star',
          image_url: null,
          grammar_kos: [],
          position: 0,
          created_at: '2026-06-20T00:00:00Z',
        },
      ]
      const decks = (await adapter.read(STORAGE_KEYS.customDecks, [])) as Array<Record<string, unknown>>
      expect('imageUrl' in decks[0]!).toBe(false)
      expect(decks[0]?.grammarKos).toEqual([])
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

    it('settings: upserts the prefs blob with user_id', async () => {
      await adapter.write(STORAGE_KEYS.settings, { theme: 'dark', locale: 'ja' })
      const upsert = client.writes.find((w) => w.table === 'user_settings' && w.op === 'upsert')
      expect(upsert).toBeDefined()
      const row = upsert!.payload as { user_id: string; prefs: { theme: string; locale: string } }
      expect(row.user_id).toBe(USER)
      expect(row.prefs).toEqual({ theme: 'dark', locale: 'ja' })
    })

    it('grammar: upserts only custom-deck rows to user_custom_grammars (not the catalog)', async () => {
      const L = (s: string) => ({ en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s })
      await adapter.write(STORAGE_KEYS.grammar, [
        { ko: 'CATALOG', meaning: L('x'), deckId: 'topik-1' },
        { ko: 'MINE', meaning: L('y'), deckId: 'custom' },
      ] as never)
      const ops = client.writes.filter((w) => w.table === 'user_custom_grammars')
      expect(ops[0]?.op).toBe('delete')
      const upsert = ops.find((w) => w.op === 'upsert')
      const rows = upsert!.payload as Array<{ ko: string }>
      expect(rows).toHaveLength(1)
      expect(rows[0]?.ko).toBe('MINE')
    })
  })

  describe('error handling', () => {
    // The whole data barrier is client-side over the anon key + RLS, so a
    // failed query surfaces ONLY as the returned { error }. Swallowing it (the
    // old behavior: `(...).data ?? fallback`) makes a transient failure look
    // like "the user has no data" — which then drives a destructive re-seed.
    it('read throws instead of silently returning the fallback on a Supabase error', async () => {
      client.errors.user_progress = { message: 'boom' }
      await expect(adapter.read(STORAGE_KEYS.srs, {})).rejects.toThrow(/boom|failed/i)
    })

    it('read throws when a failed read would otherwise masquerade as an empty log', async () => {
      client.errors.user_log = { message: 'rls denied' }
      await expect(adapter.read(STORAGE_KEYS.log, [])).rejects.toThrow()
    })

    it('write throws when an upsert returns an error', async () => {
      client.errors.user_settings = { message: 'network' }
      await expect(adapter.write(STORAGE_KEYS.settings, { theme: 'dark' })).rejects.toThrow()
    })

    it('write throws when the delete half of a delete-then-upsert fails', async () => {
      client.errors.user_decks = { message: 'timeout' }
      await expect(
        adapter.write(STORAGE_KEYS.decks, [
          { id: 'd1', name: 'D', colorId: 'indigo', order: 0, collapsed: false },
        ]),
      ).rejects.toThrow()
    })
  })

  describe('clear', () => {
    it('deletes from every user_* table (incl. user_settings) but leaves catalog intact', async () => {
      client.data.user_log = [{ id: 1 }]
      client.data.user_progress = [{ ko: 'A' }]
      client.data.user_settings = [{ user_id: 'u' }]
      client.data.grammars = [{ ko: 'X' }]
      client.data.contexts = [{ id: 'banmal' }]
      await adapter.clear()
      expect(client.data.user_log).toHaveLength(0)
      expect(client.data.user_progress).toHaveLength(0)
      expect(client.data.user_settings).toHaveLength(0)
      expect(client.data.grammars).toHaveLength(1)
      expect(client.data.contexts).toHaveLength(1)
    })
  })

  describe('append', () => {
    const entry = {
      id: 5,
      ko: 'A',
      sentence: 'x',
      feedback: 'easy' as const,
      errorNote: null,
      reviewState: 'unreviewed' as const,
      contextId: 'banmal',
      contextName: '반말',
      date: '2026-06-03T00:00:00Z',
    }

    it('log: inserts ONE user_log row (not the whole collection) with snake_case + user_id', async () => {
      await adapter.append(STORAGE_KEYS.log, entry)
      const inserts = client.writes.filter((w) => w.table === 'user_log' && w.op === 'insert')
      expect(inserts).toHaveLength(1)
      expect(Array.isArray(inserts[0]!.payload)).toBe(false)
      const row = inserts[0]!.payload as { user_id: string; ko: string; review_state: string; context_id: string }
      expect(row.user_id).toBe(USER)
      expect(row.ko).toBe('A')
      expect(row.review_state).toBe('unreviewed')
      expect(row.context_id).toBe('banmal')
      // no full-collection upsert happened
      expect(client.writes.some((w) => w.op === 'upsert')).toBe(false)
    })

    it('log: throws when the insert returns a Supabase error', async () => {
      client.errors.user_log = { message: 'boom' }
      await expect(adapter.append(STORAGE_KEYS.log, entry)).rejects.toThrow()
    })

    it('throws for a key that does not support append', async () => {
      await expect(adapter.append(STORAGE_KEYS.srs, {})).rejects.toThrow()
    })
  })

  describe('upsertOne', () => {
    const state = { lastSeen: 1717200000000, easyCount: 2, hardCount: 1, mastery: 'plant' as const }

    it('srs: upserts ONE user_progress row (not the whole map) with snake_case + user_id', async () => {
      await adapter.upsertOne(STORAGE_KEYS.srs, { id: '-(으)니까', value: state })
      const ups = client.writes.filter((w) => w.table === 'user_progress' && w.op === 'upsert')
      expect(ups).toHaveLength(1)
      expect(Array.isArray(ups[0]!.payload)).toBe(false)
      const row = ups[0]!.payload as { user_id: string; ko: string; easy_count: number; hard_count: number; mastery: string }
      expect(row.user_id).toBe(USER)
      expect(row.ko).toBe('-(으)니까')
      expect(row.easy_count).toBe(2)
      expect(row.hard_count).toBe(1)
      expect(row.mastery).toBe('plant')
    })

    it('srs: throws when the upsert returns a Supabase error', async () => {
      client.errors.user_progress = { message: 'boom' }
      await expect(adapter.upsertOne(STORAGE_KEYS.srs, { id: 'A', value: state })).rejects.toThrow()
    })

    it('throws for a key that does not support upsertOne', async () => {
      await expect(adapter.upsertOne(STORAGE_KEYS.log, { id: 'A', value: state })).rejects.toThrow()
    })
  })

  describe('exhaustiveness', () => {
    // read/write handle every StorageKey; the default arm is an assertNever
    // rail, so an unmapped key fails loudly (and adding one fails typecheck)
    // instead of silently returning the fallback / dropping the write.
    it('read throws for an unmapped storage key', async () => {
      await expect(adapter.read('munbeop.v1.bogus' as never, [])).rejects.toThrow()
    })

    it('write throws for an unmapped storage key', async () => {
      await expect(adapter.write('munbeop.v1.bogus' as never, [])).rejects.toThrow()
    })
  })
})

// Keep linter happy about referenced symbols in inline mocks.
vi.fn()
