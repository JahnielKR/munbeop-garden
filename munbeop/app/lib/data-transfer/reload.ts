/** Thin, mockable wrapper so the import flow can full-reload after a restore. */
export function reloadPage(): void {
  if (typeof window !== 'undefined') window.location.reload()
}
