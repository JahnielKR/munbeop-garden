import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { ErrorDimension, Grammar } from '~/lib/domain'
import { CUSTOM_DECK_ID } from '~/lib/domain'
import { pairsFor } from '~/lib/grammar-pairs'
import { useGrammarStore } from '~/stores/grammar'
import { useLeeches } from '~/composables/useLeeches'

export type RescueStage = 'reread' | 'examples' | 'discriminate' | 'produce'

/**
 * Stage machine for the guided rescue at /practice/rescue?ko=<ko>. Walks
 * re-read → examples → (discriminate, only if a confusable pair exists) →
 * produce. The discriminate stage is omitted when `pairsFor(ko)` is empty so the
 * flow never shows an empty step (discrimination content is N1-only today). The
 * dominant errorDimension is read from the current leech signal to frame the
 * header and emphasise the most relevant stage.
 */
export function useRescueDrill(ko: MaybeRefOrGetter<string>) {
  const grammarStore = useGrammarStore()
  const { leeches } = useLeeches()

  const currentKo = computed(() => toValue(ko))

  const grammar = computed<Grammar | null>(() => grammarStore.grammarByKo(currentKo.value) ?? null)
  const pairs = computed(() => pairsFor(currentKo.value))

  const dominantDimension = computed<ErrorDimension | null>(
    () => leeches.value.find((l) => l.ko === currentKo.value)?.dominantDimension ?? null,
  )

  const hasExamples = computed(() => {
    const item = grammar.value
    if (!item) return false
    // Official grammars have authored example banks loaded on demand. A custom
    // grammar has no bank, so only include this stage when its canonical example
    // can be shown as the fallback.
    return item.deckId !== CUSTOM_DECK_ID || !!item.example
  })

  const stages = computed<RescueStage[]>(() => [
    'reread',
    ...(hasExamples.value ? (['examples'] as const) : []),
    ...(pairs.value.length ? (['discriminate'] as const) : []),
    'produce',
  ])

  const stepIndex = ref(0)
  watch(currentKo, () => {
    stepIndex.value = 0
  })
  const stage = computed<RescueStage>(() => stages.value[stepIndex.value] ?? 'reread')
  const isLast = computed(() => stepIndex.value >= stages.value.length - 1)
  const canBack = computed(() => stepIndex.value > 0)

  function next() {
    if (stepIndex.value < stages.value.length - 1) stepIndex.value++
  }
  function back() {
    if (stepIndex.value > 0) stepIndex.value--
  }

  return { grammar, pairs, dominantDimension, stages, stage, stepIndex, isLast, canBack, next, back }
}
