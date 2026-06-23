import { computed } from 'vue'
import { pathProgress, type PathProgress } from '~/lib/paths/progress'
import { useGrammarStore } from '~/stores/grammar'
import { useSrsStore } from '~/stores/srs'

export interface TopikPath {
  deckId: string
  name: string
  progress: PathProgress
}

export function usePaths() {
  const grammarStore = useGrammarStore()
  const srsStore = useSrsStore()

  const paths = computed<TopikPath[]>(() => {
    const decks = [...grammarStore.decks]
      .filter((d) => d.id.startsWith('topik-'))
      .sort((a, b) => a.order - b.order)
    return decks.map((deck) => {
      const kos = grammarStore.items.filter((g) => g.deckId === deck.id).map((g) => g.ko)
      return { deckId: deck.id, name: deck.name, progress: pathProgress(kos, srsStore.map) }
    })
  })

  return { paths }
}
