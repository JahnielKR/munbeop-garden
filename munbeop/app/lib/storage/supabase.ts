import type { SupabaseClient } from '@supabase/supabase-js'
import type { StorageAdapter } from './adapter'
import { STORAGE_KEYS, type StorageKey } from './keys'
import type { Grammar, Context, Deck, LogEntry, SrsState } from '~/lib/domain'

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
 *   locale               -> NOT persisted by this adapter — falls through to
 *                          LocalStorageAdapter (locale is a per-device preference,
 *                          not a per-user one).
 *
 * Writes are 'replace the user's set' semantics: delete + upsert. The current
 * SRS-app patterns always pass the full collection (not deltas), so this is
 * the simplest correct shape.
 */
export class SupabaseAdapter implements StorageAdapter {
  constructor(
    private client: SupabaseClient,
    private userId: string,
  ) {}

  async read<T>(key: StorageKey, fallback: T): Promise<T> {
    switch (key) {
      case STORAGE_KEYS.grammar: {
        const [catalog, custom] = await Promise.all([
          this.client.from('grammars').select('ko, meaning, example, trans, deck_id'),
          this.client
            .from('user_custom_grammars')
            .select('ko, meaning, example, trans, deck_id')
            .eq('user_id', this.userId),
        ])
        const all: Grammar[] = []
        for (const row of ((catalog as unknown as { data: Array<{ ko: string; meaning: unknown; example?: string; trans?: unknown; deck_id: string }> | null }).data ?? [])) {
          all.push({
            ko: row.ko,
            meaning: row.meaning as Grammar['meaning'],
            example: row.example ?? undefined,
            trans: row.trans as Grammar['trans'] | undefined,
            deckId: row.deck_id,
          })
        }
        for (const row of ((custom as unknown as { data: Array<{ ko: string; meaning: unknown; example?: string; trans?: unknown; deck_id: string }> | null }).data ?? [])) {
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
        const res = await this.client
          .from('user_progress')
          .select('ko, last_seen, easy_count, hard_count, mastery')
          .eq('user_id', this.userId)
        const rows = ((res as unknown as { data: Array<{ ko: string; last_seen: string | null; easy_count: number; hard_count: number; mastery: SrsState['mastery'] }> | null }).data) ?? []
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
        const res = await this.client
          .from('user_log')
          .select('*')
          .eq('user_id', this.userId)
          .order('created_at', { ascending: false })
        const rows = ((res as unknown as { data: Array<{ id: number; ko: string; sentence: string; feedback: 'easy' | 'hard'; error_note: string | null; review_state: LogEntry['reviewState']; context_id: string; context_name: string; created_at: string }> | null }).data) ?? []
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
        const res = await this.client
          .from('user_decks')
          .select('id, name, color_id, position, collapsed')
          .eq('user_id', this.userId)
        const rows = ((res as unknown as { data: Array<{ id: string; name: string; color_id: string; position: number; collapsed: boolean }> | null }).data) ?? []
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
        const res = await this.client
          .from('user_custom_contexts')
          .select('id, name, scene')
          .eq('user_id', this.userId)
        const rows = ((res as unknown as { data: Array<{ id: string; name: string; scene: Context['scene'] }> | null }).data) ?? []
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
        const res = await this.client
          .from('user_inactive_contexts')
          .select('context_id')
          .eq('user_id', this.userId)
        const rows = ((res as unknown as { data: Array<{ context_id: string }> | null }).data) ?? []
        return (rows.length ? rows.map((r) => r.context_id) : fallback) as T
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
        await this.client.from('user_custom_grammars').delete().eq('user_id', this.userId)
        if (customs.length) {
          await this.client.from('user_custom_grammars').upsert(
            customs.map((g) => ({
              user_id: this.userId,
              ko: g.ko,
              meaning: g.meaning,
              example: g.example ?? null,
              trans: g.trans ?? null,
              deck_id: g.deckId,
            })),
          )
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
        if (rows.length) await this.client.from('user_progress').upsert(rows)
        return
      }

      case STORAGE_KEYS.log: {
        const entries = value as LogEntry[]
        if (!entries.length) return
        await this.client.from('user_log').upsert(
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
        return
      }

      case STORAGE_KEYS.decks: {
        const decks = value as Deck[]
        await this.client.from('user_decks').delete().eq('user_id', this.userId)
        if (decks.length) {
          await this.client.from('user_decks').upsert(
            decks.map((d) => ({
              user_id: this.userId,
              id: d.id,
              name: d.name,
              color_id: d.colorId,
              position: d.order,
              collapsed: d.collapsed,
            })),
          )
        }
        return
      }

      case STORAGE_KEYS.customContexts: {
        const contexts = value as Context[]
        await this.client.from('user_custom_contexts').delete().eq('user_id', this.userId)
        if (contexts.length) {
          await this.client.from('user_custom_contexts').upsert(
            contexts.map((c) => ({
              user_id: this.userId,
              id: c.id,
              name: c.name,
              scene: c.scene,
            })),
          )
        }
        return
      }

      case STORAGE_KEYS.inactiveContextIds: {
        const ids = value as string[]
        await this.client.from('user_inactive_contexts').delete().eq('user_id', this.userId)
        if (ids.length) {
          await this.client
            .from('user_inactive_contexts')
            .upsert(ids.map((context_id) => ({ user_id: this.userId, context_id })))
        }
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
    ]
    await Promise.all(
      tables.map((t) => this.client.from(t).delete().eq('user_id', this.userId)),
    )
  }
}
