import { defineStore } from 'pinia'
import type { SrsState } from '~/lib/domain'
import { freshSrs, getWeight, recalculateMastery } from '~/lib/srs'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'
import { useLogStore } from './log'

type SrsMap = Record<string, SrsState>

const storage = new LocalStorageAdapter()

export const useSrsStore = defineStore('srs', () => {
  const map = ref<SrsMap>({})

  async function hydrate() {
    map.value = await storage.read(STORAGE_KEYS.srs, {} as SrsMap)
  }

  function ensure(ko: string): SrsState {
    if (!map.value[ko]) map.value[ko] = freshSrs()
    return map.value[ko]!
  }

  function weightFor(ko: string, now: number = Date.now()): number {
    return getWeight(ensure(ko), now)
  }

  async function markSeen(ko: string, now: number = Date.now()) {
    ensure(ko).lastSeen = now
    await storage.write(STORAGE_KEYS.srs, map.value)
  }

  async function recalculate(ko: string) {
    const log = useLogStore().entries
    map.value[ko] = recalculateMastery(ko, log)
    await storage.write(STORAGE_KEYS.srs, map.value)
  }

  return { map, hydrate, ensure, weightFor, markSeen, recalculate }
})
