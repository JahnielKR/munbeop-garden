import type { StorageAdapter } from './adapter'
import { STORAGE_KEYS, type StorageKey } from './keys'

export class LocalStorageAdapter implements StorageAdapter {
  read<T>(key: StorageKey, fallback: T): T {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }

  write<T>(key: StorageKey, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error('LocalStorageAdapter.write failed', { key, err })
    }
  }

  remove(key: StorageKey): void {
    localStorage.removeItem(key)
  }

  clear(): void {
    for (const key of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(key)
    }
  }
}
