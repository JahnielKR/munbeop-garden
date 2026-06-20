import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '~/types/database.types'
import type { StorageAdapter } from './adapter'
import { STORAGE_KEYS, type StorageKey } from './keys'
import type { Grammar, Context, Deck, CustomDeck, LogEntry, SrsState } from '~/lib/domain'
import { CUSTOM_DECK_ID } from '~/lib/domain'

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
 * Exhaustiveness rail for the read/write switches: every StorageKey is handled,
 * so this default arm is unreachable and `key` narrows to `never`. Adding a new
 * StorageKey without a case becomes a compile error here (and a loud runtime
 * throw) instead of a silently-dropped write / fallback read.
 */
function assertNever(key: never): never {
  throw new Error(`SupabaseAdapter: unmapped storage key ${String(key)}`)
}

/**
 * SupabaseAdapter — implements StorageAdapter against Supabase Postgres.
 *
 * The client is typed as SupabaseClient<Database> (generated types in
 * ~/types/database.types), so every .from().select()/.upsert() is checked
 * against the real schema: a column rename or type change in a migration now
 * fails `nuxt typecheck` instead of surfacing as a runtime undefined. The only
 * remaining casts are jsonb columns (Json -> the domain LocalizedString shapes),
 * which Postgres can't constrain further.
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
 *   escapeRoom           -> read/write: user_escape_room (progress jsonb blob)
 *   locale               -> NOT persisted by this adapter — falls through to
 *                          LocalStorageAdapter (locale is a per-device preference).
 *
 * Writes are 'replace the user's set' semantics: delete + upsert. The current
 * SRS-app patterns always pass the full collection (not deltas), so this is
 * the simplest correct shape. Every query checks its `error` via assertOk().
 */
export class SupabaseAdapter implements StorageAdapter {
  constructor(
    private client: SupabaseClient<Database>,
    private userId: string,
  ) {}

  /** Map a domain LogEntry to its user_log row — shared by write() and append(). */
  private logRow(e: LogEntry) {
    return {
      id: Math.floor(e.id), // user_log.id is bigserial; manual ids accepted
      user_id: this.userId,
      ko: e.ko,
      sentence: e.sentence,
      feedback: e.feedback,
      error_note: e.errorNote,
      error_dimension: e.errorDimension ?? null,
      review_state: e.reviewState,
      context_id: e.contextId,
      context_name: e.contextName,
      created_at: e.date,
    }
  }

  /** Map one (ko, SrsState) to its user_progress row — shared by write() and upsertOne(). */
  private srsRow(ko: string, s: SrsState) {
    return {
      user_id: this.userId,
      ko,
      last_seen: s.lastSeen ? new Date(s.lastSeen).toISOString() : null,
      easy_count: s.easyCount,
      hard_count: s.hardCount,
      mastery: s.mastery,
      updated_at: new Date().toISOString(),
    }
  }

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
        assertOk('read', key, catalog.error)
        assertOk('read', key, custom.error)
        const all: Grammar[] = []
        for (const row of [...(catalog.data ?? []), ...(custom.data ?? [])]) {
          all.push({
            ko: row.ko,
            meaning: row.meaning as Grammar['meaning'],
            example: row.example ?? undefined,
            trans: (row.trans ?? undefined) as Grammar['trans'] | undefined,
            deckId: row.deck_id,
          })
        }
        return (all.length ? all : fallback) as T
      }

      case STORAGE_KEYS.srs: {
        const { data, error } = await this.client
          .from('user_progress')
          .select('ko, last_seen, easy_count, hard_count, mastery')
          .eq('user_id', this.userId)
        assertOk('read', key, error)
        const map: Record<string, SrsState> = {}
        for (const row of data ?? []) {
          map[row.ko] = {
            lastSeen: row.last_seen ? new Date(row.last_seen).getTime() : null,
            easyCount: row.easy_count,
            hardCount: row.hard_count,
            mastery: row.mastery as SrsState['mastery'],
          }
        }
        return (Object.keys(map).length ? map : fallback) as T
      }

      case STORAGE_KEYS.log: {
        const { data, error } = await this.client
          .from('user_log')
          .select('*')
          .eq('user_id', this.userId)
          .order('created_at', { ascending: false })
        assertOk('read', key, error)
        const entries: LogEntry[] = (data ?? []).map((r) => ({
          id: r.id,
          ko: r.ko,
          sentence: r.sentence,
          feedback: r.feedback as LogEntry['feedback'],
          errorNote: r.error_note,
          errorDimension: (r.error_dimension ?? null) as LogEntry['errorDimension'],
          reviewState: r.review_state as LogEntry['reviewState'],
          contextId: r.context_id,
          contextName: r.context_name,
          date: r.created_at,
        }))
        return (entries.length ? entries : fallback) as T
      }

      case STORAGE_KEYS.decks: {
        const { data, error } = await this.client
          .from('user_decks')
          .select('id, name, color_id, position, collapsed')
          .eq('user_id', this.userId)
        assertOk('read', key, error)
        const decks: Deck[] = (data ?? []).map((r) => ({
          id: r.id,
          name: r.name,
          colorId: r.color_id,
          order: r.position,
          collapsed: r.collapsed,
        }))
        return (decks.length ? decks : fallback) as T
      }

      case STORAGE_KEYS.customDecks: {
        const { data, error } = await this.client
          .from('user_custom_decks')
          .select('id, name, color_id, icon, image_url, grammar_kos, position, created_at')
          .eq('user_id', this.userId)
        assertOk('read', key, error)
        const decks: CustomDeck[] = (data ?? []).map((r) => ({
          id: r.id,
          name: r.name,
          colorId: r.color_id,
          icon: r.icon,
          grammarKos: (r.grammar_kos as string[]) ?? [],
          order: r.position,
          createdAt: r.created_at,
          ...(r.image_url ? { imageUrl: r.image_url } : {}),
        }))
        return (decks.length ? decks : fallback) as T
      }

      case STORAGE_KEYS.customContexts: {
        const { data, error } = await this.client
          .from('user_custom_contexts')
          .select('id, name, scene')
          .eq('user_id', this.userId)
        assertOk('read', key, error)
        const contexts: Context[] = (data ?? []).map((r) => ({
          id: r.id,
          name: r.name,
          scene: r.scene as Context['scene'],
          category: 'custom',
          builtin: false,
        }))
        return (contexts.length ? contexts : fallback) as T
      }

      case STORAGE_KEYS.inactiveContextIds: {
        const { data, error } = await this.client
          .from('user_inactive_contexts')
          .select('context_id')
          .eq('user_id', this.userId)
        assertOk('read', key, error)
        const rows = data ?? []
        return (rows.length ? rows.map((r) => r.context_id) : fallback) as T
      }

      case STORAGE_KEYS.settings: {
        const { data, error } = await this.client
          .from('user_settings')
          .select('prefs')
          .eq('user_id', this.userId)
        assertOk('read', key, error)
        const rows = data ?? []
        return (rows.length && rows[0]?.prefs != null ? rows[0].prefs : fallback) as T
      }

      case STORAGE_KEYS.escapeRoom: {
        const { data, error } = await this.client
          .from('user_escape_room')
          .select('progress')
          .eq('user_id', this.userId)
        assertOk('read', key, error)
        const rows = data ?? []
        return (rows.length && rows[0]?.progress != null ? rows[0].progress : fallback) as T
      }

      case STORAGE_KEYS.locale:
        return fallback
      default:
        return assertNever(key)
    }
  }

  async write<T>(key: StorageKey, value: T): Promise<void> {
    switch (key) {
      case STORAGE_KEYS.grammar: {
        // Only user-authored grammars (the reserved custom deck) persist here;
        // the catalog is read-only from the client (enforced by RLS).
        const customs = (value as Grammar[]).filter((g) => g.deckId === CUSTOM_DECK_ID)
        const del = await this.client.from('user_custom_grammars').delete().eq('user_id', this.userId)
        assertOk('write', key, del.error)
        if (customs.length) {
          const { error } = await this.client.from('user_custom_grammars').upsert(
            customs.map((g) => ({
              user_id: this.userId,
              ko: g.ko,
              meaning: g.meaning as Json,
              example: g.example ?? null,
              trans: (g.trans ?? null) as Json | null,
              deck_id: g.deckId,
            })),
          )
          assertOk('write', key, error)
        }
        return
      }

      case STORAGE_KEYS.srs: {
        const map = value as Record<string, SrsState>
        const rows = Object.entries(map).map(([ko, s]) => this.srsRow(ko, s))
        if (rows.length) {
          const { error } = await this.client.from('user_progress').upsert(rows)
          assertOk('write', key, error)
        }
        return
      }

      case STORAGE_KEYS.log: {
        const entries = value as LogEntry[]
        if (!entries.length) return
        const { error } = await this.client.from('user_log').upsert(entries.map((e) => this.logRow(e)))
        assertOk('write', key, error)
        return
      }

      case STORAGE_KEYS.decks: {
        const decks = value as Deck[]
        const del = await this.client.from('user_decks').delete().eq('user_id', this.userId)
        assertOk('write', key, del.error)
        if (decks.length) {
          const { error } = await this.client.from('user_decks').upsert(
            decks.map((d) => ({
              user_id: this.userId,
              id: d.id,
              name: d.name,
              color_id: d.colorId,
              position: d.order,
              collapsed: d.collapsed,
            })),
          )
          assertOk('write', key, error)
        }
        return
      }

      case STORAGE_KEYS.customDecks: {
        const decks = value as CustomDeck[]
        const del = await this.client.from('user_custom_decks').delete().eq('user_id', this.userId)
        assertOk('write', key, del.error)
        if (decks.length) {
          const { error } = await this.client.from('user_custom_decks').upsert(
            decks.map((d) => ({
              user_id: this.userId,
              id: d.id,
              name: d.name,
              color_id: d.colorId,
              icon: d.icon,
              image_url: d.imageUrl ?? null,
              grammar_kos: d.grammarKos as Json,
              position: d.order,
              created_at: d.createdAt,
            })),
          )
          assertOk('write', key, error)
        }
        return
      }

      case STORAGE_KEYS.customContexts: {
        const contexts = value as Context[]
        const del = await this.client.from('user_custom_contexts').delete().eq('user_id', this.userId)
        assertOk('write', key, del.error)
        if (contexts.length) {
          const { error } = await this.client.from('user_custom_contexts').upsert(
            contexts.map((c) => ({
              user_id: this.userId,
              id: c.id,
              name: c.name,
              scene: c.scene as Json,
            })),
          )
          assertOk('write', key, error)
        }
        return
      }

      case STORAGE_KEYS.inactiveContextIds: {
        const ids = value as string[]
        const del = await this.client.from('user_inactive_contexts').delete().eq('user_id', this.userId)
        assertOk('write', key, del.error)
        if (ids.length) {
          const { error } = await this.client
            .from('user_inactive_contexts')
            .upsert(ids.map((context_id) => ({ user_id: this.userId, context_id })))
          assertOk('write', key, error)
        }
        return
      }

      case STORAGE_KEYS.settings: {
        const { error } = await this.client.from('user_settings').upsert({
          user_id: this.userId,
          prefs: value as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        assertOk('write', key, error)
        return
      }

      case STORAGE_KEYS.escapeRoom: {
        const { error } = await this.client.from('user_escape_room').upsert({
          user_id: this.userId,
          progress: value as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        assertOk('write', key, error)
        return
      }

      case STORAGE_KEYS.locale:
        // Locale stays in localStorage even when authed — it's a per-device pref.
        return
      default:
        return assertNever(key)
    }
  }

  async append<T>(key: StorageKey, item: T): Promise<void> {
    switch (key) {
      case STORAGE_KEYS.log: {
        // One-row insert instead of re-upserting the whole log on every add.
        const { error } = await this.client.from('user_log').insert(this.logRow(item as LogEntry))
        assertOk('write', key, error)
        return
      }
      default:
        throw new Error(`SupabaseAdapter.append(${key}) is not supported`)
    }
  }

  async upsertOne<V>(key: StorageKey, entry: { id: string; value: V }): Promise<void> {
    switch (key) {
      case STORAGE_KEYS.srs: {
        // One-row upsert instead of re-upserting the whole SRS map per card.
        const { error } = await this.client
          .from('user_progress')
          .upsert(this.srsRow(entry.id, entry.value as SrsState))
        assertOk('write', key, error)
        return
      }
      default:
        throw new Error(`SupabaseAdapter.upsertOne(${key}) is not supported`)
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
      'user_settings',
      'user_escape_room',
      'user_custom_decks',
    ] as const
    const results = await Promise.all(
      tables.map((t) => this.client.from(t).delete().eq('user_id', this.userId)),
    )
    for (const res of results) {
      assertOk('write', STORAGE_KEYS.grammar, res.error)
    }
  }
}
