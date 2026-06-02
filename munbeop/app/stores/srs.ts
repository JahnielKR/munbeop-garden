import { defineStore } from 'pinia'
import type { SrsState } from '~/lib/domain'
import { freshSrs, getWeight, recalculateMastery } from '~/lib/srs'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'
import { useLogStore } from './log'

type SrsMap = Record<string, SrsState>

const storage = new LocalStorageAdapter()

export const useSrsStore = defineStore('srs', {
  state: () => ({ map: {} as SrsMap }),
  actions: {
    hydrate() {
      this.map = storage.read(STORAGE_KEYS.srs, {} as SrsMap)
    },
    ensure(ko: string): SrsState {
      if (!this.map[ko]) this.map[ko] = freshSrs()
      return this.map[ko]!
    },
    weightFor(ko: string, now: number = Date.now()): number {
      return getWeight(this.ensure(ko), now)
    },
    markSeen(ko: string, now: number = Date.now()) {
      this.ensure(ko).lastSeen = now
      storage.write(STORAGE_KEYS.srs, this.map)
    },
    recalculate(ko: string) {
      const log = useLogStore().entries
      this.map[ko] = recalculateMastery(ko, log)
      storage.write(STORAGE_KEYS.srs, this.map)
    },
  },
})
