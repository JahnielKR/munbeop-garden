import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useToast } from '~/composables/useToast'
import { EXPORT_KEYS, type ExportPayload } from '~/lib/data-transfer/keys'

/**
 * useDataImport — restore a useDataExport backup.
 *
 * applyImport() overwrites each present export key from the payload. The caller
 * reloads on success so every store re-hydrates from the restored storage.
 */
export function useDataImport() {
  const { t } = useI18n()
  const toast = useToast()

  async function applyImport(payload: ExportPayload): Promise<boolean> {
    const storage = useStorageAdapter()
    // `!= null` skips BOTH absent keys and exported nulls: an account with an
    // empty collection exports that key as null (read falls back to null), and
    // writing null through the adapter would delete the target's rows and then
    // throw before the key ever reached `written` — destroying data outside
    // the rollback. Null means "nothing to restore", same as validate.ts.
    const keys = EXPORT_KEYS.filter((key) => payload.data[key] != null)
    if (keys.length === 0) return true

    // 1. Snapshot the current value of every key BEFORE writing anything. A read
    //    failure here aborts with the account completely untouched — better than
    //    starting a restore we can't finish.
    const snapshot = new Map<string, unknown>()
    try {
      for (const key of keys) snapshot.set(key, await storage.read<unknown>(key, null))
    } catch {
      toast.error(t('settings.data.import_error'))
      return false
    }

    // 2. Apply. On any failure, roll the keys we already wrote back to their
    //    snapshot so a half-finished restore never leaves the account in a mixed
    //    old/new state (the bug: a network drop mid-loop half-overwrote it).
    const written: (typeof EXPORT_KEYS)[number][] = []
    try {
      for (const key of keys) {
        await storage.write(key, payload.data[key])
        written.push(key)
      }
      return true
    } catch {
      for (const key of written) {
        const prev = snapshot.get(key)
        try {
          if (prev === null || prev === undefined) await storage.remove(key)
          else await storage.write(key, prev)
        } catch {
          // best-effort rollback — a failing restore can't make things worse
        }
      }
      toast.error(t('settings.data.import_error'))
      return false
    }
  }

  return { applyImport }
}
