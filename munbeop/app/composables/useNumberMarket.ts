import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { buildRound, tilePool, scoreOf, itemId, type DrillResult } from '~/lib/numbers-market'
import { NUMBER_DOMAINS } from '~/lib/numbers-market/sets'
import type { MarketItem, NumberDomain } from '~/lib/domain'
import { useNumberMarketMaster } from '~/composables/useNumberMarketMaster'
import { useActivityStore } from '~/stores/activity'

export type MarketPhase = 'building' | 'right' | 'wrong' | 'done'
export type MarketRunMode = 'normal' | 'replay'
const ROUND_SIZE = 8

export function useNumberMarket() {
  const master = useNumberMarketMaster()
  const activity = useActivityStore()

  const selectedDomain = ref<NumberDomain>(NUMBER_DOMAINS[0]!.id)
  const sessionItems = ref<MarketItem[]>([])
  const runMode = ref<MarketRunMode>('normal')
  const index = ref(0)
  const phase = ref<MarketPhase>('building')
  const pool = ref<string[]>([])
  const built = ref<string[]>([])
  const results = ref<DrillResult[]>([])

  const item = computed<MarketItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) => results.value.some((r) => r.itemId === itemId(i) && !r.correct)),
  )

  function loadTiles() {
    pool.value = shuffle(tilePool(item.value))
    built.value = []
  }
  function resetRound() {
    index.value = 0
    phase.value = 'building'
    results.value = []
  }

  function selectDomain(id: NumberDomain) {
    selectedDomain.value = id
  }

  function start() {
    runMode.value = 'normal'
    sessionItems.value = buildRound(selectedDomain.value, ROUND_SIZE, shuffle)
    resetRound()
    if (sessionItems.value.length) loadTiles()
  }

  function replayFailed() {
    const failed = failedItems.value
    if (failed.length === 0) return
    runMode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
    loadTiles()
  }

  function placeTile(poolIndex: number) {
    if (phase.value !== 'building') return
    const tile = pool.value[poolIndex]
    if (tile === undefined) return
    built.value = [...built.value, tile]
    pool.value = pool.value.filter((_, i) => i !== poolIndex)
  }

  function undoTile(index?: number) {
    if (phase.value !== 'building' || built.value.length === 0) return
    const i = index === undefined ? built.value.length - 1 : index
    if (i < 0 || i >= built.value.length) return
    const tile = built.value[i]!
    built.value = built.value.filter((_, j) => j !== i)
    pool.value = [...pool.value, tile]
  }

  function clearTiles() {
    if (phase.value !== 'building') return
    pool.value = shuffle([...pool.value, ...built.value])
    built.value = []
  }

  function submit() {
    if (phase.value !== 'building') return
    const correct = built.value.join(' ') === item.value.answer
    results.value.push({ itemId: itemId(item.value), correct })
    phase.value = correct ? 'right' : 'wrong'
    void activity.record()
  }

  function next() {
    if (phase.value === 'building' || phase.value === 'done') return
    if (index.value + 1 >= sessionItems.value.length) {
      phase.value = 'done'
      if (runMode.value === 'normal') master.recordRound(selectedDomain.value, score.value.accuracy)
      return
    }
    index.value += 1
    phase.value = 'building'
    loadTiles()
  }

  return {
    master,
    selectedDomain, sessionItems, runMode, index, phase, pool, built,
    item, score, failedItems,
    selectDomain, start, replayFailed, placeTile, undoTile, clearTiles, submit, next,
  }
}
