import type { StorageAdapter, StorageRestore } from './adapter'
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

  async append<T>(key: StorageKey, item: T): Promise<T> {
    const current = await this.read<T[]>(key, [])
    await this.write(key, [...current, item])
    return item
  }

  async upsertOne<V>(key: StorageKey, entry: { id: string | number; value: V }): Promise<void> {
    const map = await this.read<Record<string, V>>(key, {})
    map[String(entry.id)] = entry.value
    await this.write(key, map)
  }

  async increment(
    key: StorageKey,
    id: string | number,
    amount = 1,
  ): Promise<number | null> {
    if (key !== STORAGE_KEYS.activity) {
      throw new Error(`LocalStorageAdapter.increment(${key}) is not supported`)
    }
    if (!Number.isInteger(amount) || amount < 1 || amount > 1000) {
      throw new Error('LocalStorageAdapter.increment amount must be between 1 and 1000')
    }
    const map = await this.read<Record<string, { count: number }>>(key, {})
    const mapKey = String(id)
    const count = (map[mapKey]?.count ?? 0) + amount
    map[mapKey] = { count }
    await this.write(key, map)
    return count
  }

  async restore(data: StorageRestore): Promise<void> {
    const knownKeys = new Set<string>(Object.values(STORAGE_KEYS))
    const snapshot = new Map<string, string | null>()
    try {
      for (const [key, value] of Object.entries(data)) {
        if (!knownKeys.has(key)) continue
        snapshot.set(key, localStorage.getItem(key))
        if (value === null || value === undefined) {
          localStorage.removeItem(key)
        } else {
          const serialized = JSON.stringify(value)
          if (serialized === undefined) throw new Error(`Cannot serialize ${key}`)
          localStorage.setItem(key, serialized)
        }
      }
    } catch (error) {
      for (const [key, value] of snapshot) {
        try {
          if (value === null) localStorage.removeItem(key)
          else localStorage.setItem(key, value)
        } catch {
          // Best effort for the non-cloud fallback.
        }
      }
      throw error
    }
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
