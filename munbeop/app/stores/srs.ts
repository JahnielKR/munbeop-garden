import { defineStore } from 'pinia'
import type { SrsState } from '~/lib/domain'
import { freshSrs, getWeight, recalculateMastery } from '~/lib/srs'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'
import { useLogStore } from './log'

type SrsMap = Record<string, SrsState>

const storage = new LocalStorageAdapter()

export const useSrsStore = defineStore('srs', () => {
  const map = ref<SrsMap>({})

  function hydrate() {
    map.value = storage.read(STORAGE_KEYS.srs, {} as SrsMap)
  }

  function ensure(ko: string): SrsState {
    if (!map.value[ko]) map.value[ko] = freshSrs()
    return map.value[ko]!
  }

  function weightFor(ko: string, now: number = Date.now()): number {
    return getWeight(ensure(ko), now)
  }

  function markSeen(ko: string, now: number = Date.now()) {
    ensure(ko).lastSeen = now
    storage.write(STORAGE_KEYS.srs, map.value)
  }

  function recalculate(ko: string) {
    const log = useLogStore().entries
    map.value[ko] = recalculateMastery(ko, log)
    storage.write(STORAGE_KEYS.srs, map.value)
  }

  return { map, hydrate, ensure, weightFor, markSeen, recalculate }
})
