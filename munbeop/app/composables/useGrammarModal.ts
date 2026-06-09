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

  watch(
    () => route.query.grammar,
    async (raw) => {
      if (typeof raw !== 'string' || !raw) return
      if (!grammarStore.grammarByKo(raw)) {
        const { grammar: _omit, ...rest } = route.query
        await router.replace({ query: rest })
      }
    },
    { immediate: true },
  )

  async function open(ko: string) {
    if (route.query.grammar === ko) return
    await router.push({ query: { ...route.query, grammar: ko } })
  }

  async function close() {
    const { grammar: _omit, ...rest } = route.query
    await router.replace({ query: rest })
  }

  return { selected, isOpen, open, close }
}
