import type { LocalizedString } from '~/lib/domain'
import { levelOfDeck } from '~/lib/library/topik-level'
import {
  USAGE_NOTES_SHARD_BY_LEVEL,
  type UsageNotesShardId,
} from './shard-index'

type NotesByKo = Record<string, LocalizedString>
type NotesLoader = () => Promise<NotesByKo>

/**
 * N1 is small enough to remain a single on-demand chunk. N2-N6 are routed by
 * Grammar.ko so opening one study sheet downloads roughly 200-240 KB of source
 * instead of an entire 0.6-1.2 MB TOPIK-level seed.
 */
const loaders: Record<UsageNotesShardId | 'n1', NotesLoader> = {
  n1: () => import('~/seed/usage-notes/n1').then((m) => m.TOPIK_1_USAGE_NOTES),
  'n2-0': () => import('~/seed/usage-notes/shards/n2-0').then((m) => m.USAGE_NOTES),
  'n2-1': () => import('~/seed/usage-notes/shards/n2-1').then((m) => m.USAGE_NOTES),
  'n2-2': () => import('~/seed/usage-notes/shards/n2-2').then((m) => m.USAGE_NOTES),
  'n3-0': () => import('~/seed/usage-notes/shards/n3-0').then((m) => m.USAGE_NOTES),
  'n3-1': () => import('~/seed/usage-notes/shards/n3-1').then((m) => m.USAGE_NOTES),
  'n3-2': () => import('~/seed/usage-notes/shards/n3-2').then((m) => m.USAGE_NOTES),
  'n4-0': () => import('~/seed/usage-notes/shards/n4-0').then((m) => m.USAGE_NOTES),
  'n4-1': () => import('~/seed/usage-notes/shards/n4-1').then((m) => m.USAGE_NOTES),
  'n4-2': () => import('~/seed/usage-notes/shards/n4-2').then((m) => m.USAGE_NOTES),
  'n4-3': () => import('~/seed/usage-notes/shards/n4-3').then((m) => m.USAGE_NOTES),
  'n4-4': () => import('~/seed/usage-notes/shards/n4-4').then((m) => m.USAGE_NOTES),
  'n5-0': () => import('~/seed/usage-notes/shards/n5-0').then((m) => m.USAGE_NOTES),
  'n5-1': () => import('~/seed/usage-notes/shards/n5-1').then((m) => m.USAGE_NOTES),
  'n5-2': () => import('~/seed/usage-notes/shards/n5-2').then((m) => m.USAGE_NOTES),
  'n5-3': () => import('~/seed/usage-notes/shards/n5-3').then((m) => m.USAGE_NOTES),
  'n5-4': () => import('~/seed/usage-notes/shards/n5-4').then((m) => m.USAGE_NOTES),
  'n6-0': () => import('~/seed/usage-notes/shards/n6-0').then((m) => m.USAGE_NOTES),
  'n6-1': () => import('~/seed/usage-notes/shards/n6-1').then((m) => m.USAGE_NOTES),
  'n6-2': () => import('~/seed/usage-notes/shards/n6-2').then((m) => m.USAGE_NOTES),
}

const cache = new Map<UsageNotesShardId | 'n1', Promise<NotesByKo>>()

function loadOnce(id: UsageNotesShardId | 'n1'): Promise<NotesByKo> {
  const cached = cache.get(id)
  if (cached) return cached

  const pending = loaders[id]().catch((error: unknown) => {
    // A transient chunk/network failure must remain retryable.
    cache.delete(id)
    throw error
  })
  cache.set(id, pending)
  return pending
}

/**
 * Usage notes for a grammar point, looked up by {@link Grammar.ko}. Reading by
 * ko (not off the Grammar object) makes the notes visible for logged-in users
 * too: the Supabase catalog only carries ko/meaning/example/trans/deck_id, so
 * notes stored on the Grammar object never reach the UI. `deckId` selects and
 * validates the TOPIK-level shard; custom/unknown decks have no notes. Returns
 * undefined when none are authored.
 */
export async function notesFor(ko: string, deckId: string): Promise<LocalizedString | undefined> {
  const level = levelOfDeck(deckId)
  if (!level) return undefined

  if (level === 1) {
    return (await loadOnce('n1'))[ko]
  }

  const shardByKo: Readonly<Record<string, UsageNotesShardId>> =
    USAGE_NOTES_SHARD_BY_LEVEL[level]
  const shardId = shardByKo[ko]
  if (!shardId) return undefined
  return (await loadOnce(shardId))[ko]
}
