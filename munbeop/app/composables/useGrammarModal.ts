import { computed, watch } from 'vue'
import type { Grammar } from '~/lib/domain'
import { useGrammarStore } from '~/stores/grammar'

export function useGrammarModal() {
  const route = useRoute()
  const router = useRouter()
  const grammarStore = useGrammarStore()

  const selected = computed<Grammar | null>(() => {
    const raw = route.query.grammar
    if (typeof raw !== 'string' || !raw) return null
    return grammarStore.grammarByKo(raw) ?? null
  })

  const isOpen = computed(() => selected.value !== null)

  function queryWithoutGrammar() {
    const rest = { ...route.query }
    delete rest.grammar
    return rest
  }

  // Watch BOTH the query and the items array — on a fresh deep-link load,
  // the store hasn't hydrated yet, items is empty, and grammarByKo would
  // wrongly report "unknown" and wipe the URL. The watcher re-fires when
  // items lands and re-validates against real data.
  watch(
    [() => route.query.grammar, () => grammarStore.items.length],
    async ([raw, itemCount]) => {
      if (typeof raw !== 'string' || !raw) return
      if (itemCount === 0) return
      if (!grammarStore.grammarByKo(raw)) {
        await router.replace({ query: queryWithoutGrammar() })
      }
    },
    { immediate: true },
  )

  async function open(ko: string) {
    if (route.query.grammar === ko) return
    await router.push({ query: { ...route.query, grammar: ko } })
  }

  async function close() {
    await router.replace({ query: queryWithoutGrammar() })
  }

  return { selected, isOpen, open, close }
}
