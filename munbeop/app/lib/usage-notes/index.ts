import type { LocalizedString } from '~/lib/domain'
import { levelOfDeck, type TopikLevel } from '~/lib/library/topik-level'

type NotesByKo = Record<string, LocalizedString>

/**
 * Per-level dynamic import — the exact shape as `stores/grammar.ts:53`. The
 * usage-notes seed is ~4.5 MB of raw `.ts`; importing it statically pulled the
 * whole thing into the /library + /rescue route chunk (a measured 5.5 MB JS
 * download before the first card paints). Loading each TOPIK level on demand
 * keeps it out of the route chunk: opening one grammar fetches only its level
 * (~350 KB–1.1 MB), once, then it's cached.
 */
const loaders: Record<TopikLevel, () => Promise<NotesByKo>> = {
  1: () => import('~/seed/usage-notes/n1').then((m) => m.TOPIK_1_USAGE_NOTES),
  2: () => import('~/seed/usage-notes/n2').then((m) => m.TOPIK_2_USAGE_NOTES),
  3: () => import('~/seed/usage-notes/n3').then((m) => m.TOPIK_3_USAGE_NOTES),
  4: () => import('~/seed/usage-notes/n4').then((m) => m.TOPIK_4_USAGE_NOTES),
  5: () => import('~/seed/usage-notes/n5').then((m) => m.TOPIK_5_USAGE_NOTES),
  6: () => import('~/seed/usage-notes/n6').then((m) => m.TOPIK_6_USAGE_NOTES),
}
const cache = new Map<TopikLevel, NotesByKo>()

async function notesForLevel(level: TopikLevel): Promise<NotesByKo> {
  let notes = cache.get(level)
  if (!notes) {
    notes = await loaders[level]()
    cache.set(level, notes)
  }
  return notes
}

/**
 * Usage notes for a grammar point, looked up by {@link Grammar.ko}. Reading by
 * ko (not off the Grammar object) makes the notes visible for logged-in users
 * too: the Supabase catalog only carries ko/meaning/example/trans/deck_id, so
 * notes stored on the Grammar object never reach the UI. `deckId` selects the
 * TOPIK-level chunk to load; custom/unknown decks have no notes. Async because
 * the per-level seed loads on demand. Returns undefined when none are authored.
 */
export async function notesFor(ko: string, deckId: string): Promise<LocalizedString | undefined> {
  const level = levelOfDeck(deckId)
  if (!level) return undefined
  const notes = await notesForLevel(level)
  return notes[ko]
}
