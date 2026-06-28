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

  async append<T>(key: StorageKey, item: T): Promise<void> {
    const current = await this.read<T[]>(key, [])
    await this.write(key, [...current, item])
  }

  async upsertOne<V>(key: StorageKey, entry: { id: string; value: V }): Promise<void> {
    const map = await this.read<Record<string, V>>(key, {})
    map[entry.id] = entry.value
    await this.write(key, map)
  }

  async deleteOne(key: StorageKey, id: string | number): Promise<void> {
    const list = await this.read<Array<{ id: string | number }>>(key, [])
    await this.write(key, list.filter((item) => item.id !== id))
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
