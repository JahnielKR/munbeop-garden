import { defineStore } from 'pinia'
import type { SrsState } from '~/lib/domain'
import { freshSrs, getWeight, recalculateMastery } from '~/lib/srs'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useLogStore } from './log'

type SrsMap = Record<string, SrsState>

export const useSrsStore = defineStore('srs', () => {
  const map = ref<SrsMap>({})

  async function hydrate() {
    const storage = useStorageAdapter()
    map.value = await storage.read(STORAGE_KEYS.srs, {} as SrsMap)
  }

  function ensure(ko: string): SrsState {
    if (!map.value[ko]) map.value[ko] = freshSrs()
    return map.value[ko]!
  }

  /** Read a ko's SRS state WITHOUT creating a row — for render/computed reads
   * (creating a seedling on mere display polluted mastery stats). */
  function peek(ko: string): SrsState {
    return map.value[ko] ?? freshSrs()
  }

  function weightFor(ko: string, now: number = Date.now()): number {
    // peek(), NOT ensure(): weighting the draw pool touches every catalog ko,
    // so ensure() would fabricate a seedling row for each untouched grammar and
    // pollute mastery/garden/due stats for the rest of the session. getWeight
    // only reads, so a by-value freshSrs() gives the identical weight.
    return getWeight(peek(ko), now)
  }

  async function markSeen(ko: string, now: number = Date.now()) {
    const storage = useStorageAdapter()
    ensure(ko).lastSeen = now
    // Upsert just this ko's row, not the whole map (the session start fires
    // several markSeen in parallel; a full-map write each time is O(catalog)).
    await storage.upsertOne(STORAGE_KEYS.srs, { id: ko, value: map.value[ko]! })
  }

  async function recalculate(ko: string) {
    const storage = useStorageAdapter()
    const log = useLogStore().entries
    map.value[ko] = recalculateMastery(ko, log)
    await storage.upsertOne(STORAGE_KEYS.srs, { id: ko, value: map.value[ko]! })
  }

  return { map, hydrate, ensure, peek, weightFor, markSeen, recalculate }
})
