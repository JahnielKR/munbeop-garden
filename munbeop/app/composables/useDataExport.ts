import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useToast } from '~/composables/useToast'

/**
 * useDataExport — one-click "take my data" JSON download.
 *
 * collectExportData() reads every syncable key (a complete backup: the user's
 * authored data plus the shared grammar catalog they were using) into one
 * labelled object. downloadJson() turns it into a file the browser saves.
 * exportData() wires the two together with a success/error toast.
 */
const EXPORT_KEYS = [
  STORAGE_KEYS.grammar,
  STORAGE_KEYS.srs,
  STORAGE_KEYS.log,
  STORAGE_KEYS.decks,
  STORAGE_KEYS.customContexts,
  STORAGE_KEYS.inactiveContextIds,
  STORAGE_KEYS.settings,
] as const

export interface ExportPayload {
  exportedAt: string
  app: string
  data: Record<string, unknown>
}

export function useDataExport() {
  const { t } = useI18n()
  const toast = useToast()

  async function collectExportData(): Promise<ExportPayload> {
    const storage = useStorageAdapter()
    const entries = await Promise.all(
      EXPORT_KEYS.map(async (key) => [key, await storage.read<unknown>(key, null)] as const),
    )
    return {
      exportedAt: new Date().toISOString(),
      app: 'munbeop-garden',
      data: Object.fromEntries(entries),
    }
  }

  function downloadJson(obj: unknown, filename: string): void {
    if (typeof document === 'undefined') return
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function exportData(): Promise<void> {
    try {
      const payload = await collectExportData()
      const date = new Date().toISOString().slice(0, 10)
      downloadJson(payload, `mungarden-export-${date}.json`)
      toast.success(t('settings.data.exported'))
    } catch {
      toast.error(t('settings.data.export_error'))
    }
  }

  return { collectExportData, downloadJson, exportData }
}
