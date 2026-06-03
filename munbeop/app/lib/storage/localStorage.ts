import type { StorageAdapter } from './adapter'
import { STORAGE_KEYS, type StorageKey } from './keys'

export class LocalStorageAdapter implements StorageAdapter {
  async read<T>(key: StorageKey, fallback: T): Promise<T> {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }

  async write<T>(key: StorageKey, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error('LocalStorageAdapter.write failed', { key, err })
    }
  }

  async remove(key: StorageKey): Promise<void> {
    localStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    for (const key of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(key)
    }
  }
}
