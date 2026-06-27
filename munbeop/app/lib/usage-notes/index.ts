import type { LocalizedString } from '~/lib/domain'
import { USAGE_NOTES } from '~/seed/usage-notes'

/**
 * Usage notes for a grammar point, looked up by {@link Grammar.ko} — the same
 * by-ko pattern as `examplesFor` / `guideFor`. Reading by ko (instead of off the
 * Grammar object) makes the notes visible for logged-in users too: the Supabase
 * catalog only carries ko/meaning/example/trans/deck_id, so notes stored on the
 * Grammar object never reach the UI. Returns undefined when none are authored.
 */
export function notesFor(
  ko: string,
  source: Record<string, LocalizedString> = USAGE_NOTES,
): LocalizedString | undefined {
  return source[ko]
}
