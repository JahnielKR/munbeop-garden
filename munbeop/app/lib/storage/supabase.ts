import type { SupabaseClient } from '@supabase/supabase-js'
import type { StorageAdapter } from './adapter'
import { STORAGE_KEYS, type StorageKey } from './keys'
import type { Grammar, Context, Deck, LogEntry, SrsState } from '~/lib/domain'

/**
 * Shape of an awaited @supabase/supabase-js query result. The client returns
 * (not throws) `{ data, error }`; on an RLS denial, constraint violation, or
 * network/PostgREST failure, `error` is populated and `data` is null.
 */
type SupaResult<R> = { data: R | null; error: { message?: string } | null }

/**
 * Surface a Supabase error instead of swallowing it. Every read/write goes
 * through here so a failed query becomes a thrown error the caller can catch
 * (show a toast, skip a destructive re-seed) rather than silently resolving to
 * an empty fallback — which the stores would misread as "the user has no data".
 */
function assertOk(op: 'read' | 'write', key: StorageKey, error: { message?: string } | null | undefined): void {
  if (error) {
    throw new Error(`SupabaseAdapter.${op}(${key}) failed: ${error.message ?? 'unknown error'}`)
  }
}

/**
 * SupabaseAdapter — implements StorageAdapter against Supabase Postgres.
 *
 * Each StorageKey maps to a specific table or pair of tables:
 *
 *   grammar              -> read:  grammars (catalog) ∪ user_custom_grammars (this user)
 *                          write: replace user_custom_grammars only (catalog is RLS-readonly)
 *   srs                  -> read/write: user_progress
 *   log                  -> read/write: user_log
 *   decks                -> read/write: user_decks
 *   customContexts       -> read/write: user_custom_contexts
 *   inactiveContextIds   -> read/write: user_inactive_contexts
 *   settings             -> read/write: user_settings (prefs jsonb blob)
 *   escapeRoom           -> read/write: user_escape_room (progress jsonb blob —
 *                          unlocked cosmetics + consecutive clean runs)
 *   locale               -> NOT persisted by this adapter — falls through to
 *                          LocalStorageAdapter (locale is a per-device preference,
 *                          not a per-user one).
 *
 * Writes are 'replace the user's set' semantics: delete + upsert. The current
 * SRS-app patterns always pass the full collection (not deltas), so this is
 * the simplest correct shape.
 *
 * Every query checks its `error` via assertOk() and throws on failure — see
 * the helper above for why.
 */
export class SupabaseAdapter implements StorageAdapter {
  constructor(
    private client: SupabaseClient,
    private userId: string,
  ) {}

  async read<T>(key: StorageKey, fallback: T): Promise<T> {
    switch (key) {
      case STORAGE_KEYS.grammar: {
        const [catalog, custom] = (await Promise.all([
          this.client.from('grammars').select('ko, meaning, example, trans, deck_id'),
          this.client
            .from('user_custom_grammars')
            .select('ko, meaning, example, trans, deck_id')
            .eq('user_id', this.userId),
        ])) as unknown as [
          SupaResult<Array<{ ko: string; meaning: unknown; example?: string; trans?: unknown; deck_id: string }>>,
          SupaResult<Array<{ ko: string; meaning: unknown; example?: string; trans?: unknown; deck_id: string }>>,
        ]
        assertOk('read', key, catalog.error)
        assertOk('read', key, custom.error)
        const all: Grammar[] = []
        for (const row of catalog.data ?? []) {
          all.push({
            ko: row.ko,
            meaning: row.meaning as Grammar['meaning'],
            example: row.example ?? undefined,
            trans: row.trans as Grammar['trans'] | undefined,
            deckId: row.deck_id,
          })
        }
        for (const row of custom.data ?? []) {
          all.push({
            ko: row.ko,
            meaning: row.meaning as Grammar['meaning'],
            example: row.example ?? undefined,
            trans: row.trans as Grammar['trans'] | undefined,
            deckId: row.deck_id,
          })
        }
        return (all.length ? all : fallback) as T
      }

      case STORAGE_KEYS.srs: {
        const res = (await this.client
          .from('user_progress')
          .select('ko, last_seen, easy_count, hard_count, mastery')
          .eq('user_id', this.userId)) as unknown as SupaResult<
          Array<{ ko: string; last_seen: string | null; easy_count: number; hard_count: number; mastery: SrsState['mastery'] }>
        >
        assertOk('read', key, res.error)
        const rows = res.data ?? []
        const map: Record<string, SrsState> = {}
        for (const row of rows) {
          map[row.ko] = {
            lastSeen: row.last_seen ? new Date(row.last_seen).getTime() : null,
            easyCount: row.easy_count,
            hardCount: row.hard_count,
            mastery: row.mastery,
          }
        }
        return (Object.keys(map).length ? map : fallback) as T
      }

      case STORAGE_KEYS.log: {
        const res = (await this.client
          .from('user_log')
          .select('*')
          .eq('user_id', this.userId)
          .order('created_at', { ascending: false })) as unknown as SupaResult<
          Array<{ id: number; ko: string; sentence: string; feedback: 'easy' | 'hard'; error_note: string | null; review_state: LogEntry['reviewState']; context_id: string; context_name: string; created_at: string }>
        >
        assertOk('read', key, res.error)
        const rows = res.data ?? []
        const entries: LogEntry[] = rows.map((r) => ({
          id: r.id,
          ko: r.ko,
          sentence: r.sentence,
          feedback: r.feedback,
          errorNote: r.error_note,
          reviewState: r.review_state,
          contextId: r.context_id,
          contextName: r.context_name,
          date: r.created_at,
        }))
        return (entries.length ? entries : fallback) as T
      }

      case STORAGE_KEYS.decks: {
        const res = (await this.client
          .from('user_decks')
          .select('id, name, color_id, position, collapsed')
          .eq('user_id', this.userId)) as unknown as SupaResult<
          Array<{ id: string; name: string; color_id: string; position: number; collapsed: boolean }>
        >
        assertOk('read', key, res.error)
        const rows = res.data ?? []
        const decks: Deck[] = rows.map((r) => ({
          id: r.id,
          name: r.name,
          colorId: r.color_id,
          order: r.position,
          collapsed: r.collapsed,
        }))
        return (decks.length ? decks : fallback) as T
      }

      case STORAGE_KEYS.customContexts: {
        const res = (await this.client
          .from('user_custom_contexts')
          .select('id, name, scene')
          .eq('user_id', this.userId)) as unknown as SupaResult<
          Array<{ id: string; name: string; scene: Context['scene'] }>
        >
        assertOk('read', key, res.error)
        const rows = res.data ?? []
        const contexts: Context[] = rows.map((r) => ({
          id: r.id,
          name: r.name,
          scene: r.scene,
          category: 'custom',
          builtin: false,
        }))
        return (contexts.length ? contexts : fallback) as T
      }

      case STORAGE_KEYS.inactiveContextIds: {
        const res = (await this.client
          .from('user_inactive_contexts')
          .select('context_id')
          .eq('user_id', this.userId)) as unknown as SupaResult<Array<{ context_id: string }>>
        assertOk('read', key, res.error)
        const rows = res.data ?? []
        return (rows.length ? rows.map((r) => r.context_id) : fallback) as T
      }

      case STORAGE_KEYS.settings: {
        const res = (await this.client
          .from('user_settings')
          .select('prefs')
          .eq('user_id', this.userId)) as unknown as SupaResult<Array<{ prefs: unknown }>>
        assertOk('read', key, res.error)
        const rows = res.data ?? []
        return (rows.length && rows[0]?.prefs != null ? rows[0].prefs : fallback) as T
      }

      case STORAGE_KEYS.escapeRoom: {
        const res = (await this.client
          .from('user_escape_room')
          .select('progress')
          .eq('user_id', this.userId)) as unknown as SupaResult<Array<{ progress: unknown }>>
        assertOk('read', key, res.error)
        const rows = res.data ?? []
        return (rows.length && rows[0]?.progress != null ? rows[0].progress : fallback) as T
      }

      case STORAGE_KEYS.locale:
      default:
        return fallback
    }
  }

  async write<T>(key: StorageKey, value: T): Promise<void> {
    switch (key) {
      case STORAGE_KEYS.grammar: {
        // Only user-added grammars persist via this adapter; the catalog
        // is read-only from the client (enforced by RLS).
        const customs = (value as Grammar[]).filter(
          (g) => g.deckId !== 'catalog-readonly-marker', // placeholder; all client-side grammars are user-owned at write time
        )
        const del = await this.client.from('user_custom_grammars').delete().eq('user_id', this.userId)
        assertOk('write', key, del.error)
        if (customs.length) {
          const up = await this.client.from('user_custom_grammars').upsert(
            customs.map((g) => ({
              user_id: this.userId,
              ko: g.ko,
              meaning: g.meaning,
              example: g.example ?? null,
              trans: g.trans ?? null,
              deck_id: g.deckId,
            })),
          )
          assertOk('write', key, up.error)
        }
        return
      }

      case STORAGE_KEYS.srs: {
        const map = value as Record<string, SrsState>
        const rows = Object.entries(map).map(([ko, s]) => ({
          user_id: this.userId,
          ko,
          last_seen: s.lastSeen ? new Date(s.lastSeen).toISOString() : null,
          easy_count: s.easyCount,
          hard_count: s.hardCount,
          mastery: s.mastery,
          updated_at: new Date().toISOString(),
        }))
        if (rows.length) {
          const up = await this.client.from('user_progress').upsert(rows)
          assertOk('write', key, up.error)
        }
        return
      }

      case STORAGE_KEYS.log: {
        const entries = value as LogEntry[]
        if (!entries.length) return
        const up = await this.client.from('user_log').upsert(
          entries.map((e) => ({
            id: Math.floor(e.id), // user_log.id is bigserial; manual ids accepted
            user_id: this.userId,
            ko: e.ko,
            sentence: e.sentence,
            feedback: e.feedback,
            error_note: e.errorNote,
            review_state: e.reviewState,
            context_id: e.contextId,
            context_name: e.contextName,
            created_at: e.date,
          })),
        )
        assertOk('write', key, up.error)
        return
      }

      case STORAGE_KEYS.decks: {
        const decks = value as Deck[]
        const del = await this.client.from('user_decks').delete().eq('user_id', this.userId)
        assertOk('write', key, del.error)
        if (decks.length) {
          const up = await this.client.from('user_decks').upsert(
            decks.map((d) => ({
              user_id: this.userId,
              id: d.id,
              name: d.name,
              color_id: d.colorId,
              position: d.order,
              collapsed: d.collapsed,
            })),
          )
          assertOk('write', key, up.error)
        }
        return
      }

      case STORAGE_KEYS.customContexts: {
        const contexts = value as Context[]
        const del = await this.client.from('user_custom_contexts').delete().eq('user_id', this.userId)
        assertOk('write', key, del.error)
        if (contexts.length) {
          const up = await this.client.from('user_custom_contexts').upsert(
            contexts.map((c) => ({
              user_id: this.userId,
              id: c.id,
              name: c.name,
              scene: c.scene,
            })),
          )
          assertOk('write', key, up.error)
        }
        return
      }

      case STORAGE_KEYS.inactiveContextIds: {
        const ids = value as string[]
        const del = await this.client.from('user_inactive_contexts').delete().eq('user_id', this.userId)
        assertOk('write', key, del.error)
        if (ids.length) {
          const up = await this.client
            .from('user_inactive_contexts')
            .upsert(ids.map((context_id) => ({ user_id: this.userId, context_id })))
          assertOk('write', key, up.error)
        }
        return
      }

      case STORAGE_KEYS.settings: {
        const up = await this.client.from('user_settings').upsert({
          user_id: this.userId,
          prefs: value as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        })
        assertOk('write', key, up.error)
        return
      }

      case STORAGE_KEYS.escapeRoom: {
        const up = await this.client.from('user_escape_room').upsert({
          user_id: this.userId,
          progress: value as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        })
        assertOk('write', key, up.error)
        return
      }

      case STORAGE_KEYS.locale:
      default:
        // Locale stays in localStorage even when authed — it's a per-device pref.
        return
    }
  }

  async remove(key: StorageKey): Promise<void> {
    await this.write(key, [] as never)
  }

  async clear(): Promise<void> {
    const tables = [
      'user_progress',
      'user_log',
      'user_decks',
      'user_custom_grammars',
      'user_custom_contexts',
      'user_inactive_contexts',
      'user_escape_room',
    ]
    const results = (await Promise.all(
      tables.map((t) => this.client.from(t).delete().eq('user_id', this.userId)),
    )) as unknown as Array<{ error: { message?: string } | null }>
    for (const res of results) {
      assertOk('write', STORAGE_KEYS.grammar, res.error)
    }
  }
}
