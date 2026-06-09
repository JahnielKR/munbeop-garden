<script setup lang="ts">
import Badge from '~/components/ui/Badge.vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Card from '~/components/ui/Card.vue'
import MasteryIcon from '~/components/practice/MasteryIcon.vue'
import { getMasteryInfo } from '~/lib/srs'
import { useGrammarStore } from '~/stores/grammar'
import { useSrsStore } from '~/stores/srs'

const grammarStore = useGrammarStore()
const srsStore = useSrsStore()
const { t } = useI18n()
const { tl } = useLocalized()

/**
 * Group items by deck, ordered by `deck.order`.
 *
 * Empty decks are dropped from the view. Excluded decks (toggled off by the
 * user) are still rendered so toggling them on in the UI brings them back —
 * but if a deck happens to have no matching items at all, it's hidden.
 */
const sections = computed(() => {
  const sortedDecks = [...grammarStore.decks].sort((a, b) => a.order - b.order)
  return sortedDecks
    .map((deck) => {
      const items = grammarStore.items
        .filter((g) => g.deckId === deck.id)
        .map((g) => {
          const level = srsStore.ensure(g.ko).mastery
          return {
            grammar: g,
            level,
            info: getMasteryInfo(level),
          }
        })
      return { deck, items }
    })
    .filter((s) => s.items.length > 0)
})

/** Items whose deckId doesn't match any current deck — render under a fallback section. */
const orphans = computed(() => {
  const known = new Set(grammarStore.decks.map((d) => d.id))
  return grammarStore.items
    .filter((g) => !known.has(g.deckId))
    .map((g) => {
      const level = srsStore.ensure(g.ko).mastery
      return { grammar: g, level, info: getMasteryInfo(level) }
    })
})

function accentFor(masteryCls: string) {
  if (masteryCls === 'mastery-tree') return 'jade'
  if (masteryCls === 'mastery-plant') return 'gold'
  return 'sky'
}

async function onToggleDeck(deckId: string) {
  await grammarStore.toggleDeckCollapsed(deckId)
}
</script>

<template>
  <div class="page">
    <BilingualTitle ko="도서관" :latin="t('title.library')" />
    <p class="lead">{{ t('library.lead') }}</p>

    <section
      v-for="section in sections"
      :key="section.deck.id"
      class="deck-section"
      :class="`deck-section--${section.deck.colorId}`"
    >
      <button
        type="button"
        class="deck-header"
        :aria-expanded="!section.deck.collapsed"
        :aria-controls="`deck-body-${section.deck.id}`"
        @click="onToggleDeck(section.deck.id)"
      >
        <span class="deck-header__caret" :class="{ 'deck-header__caret--open': !section.deck.collapsed }" aria-hidden="true">▸</span>
        <h2 class="deck-title">{{ section.deck.name }}</h2>
        <span class="deck-count">{{ section.items.length }}</span>
      </button>

      <Transition name="collapse">
        <div
          v-show="!section.deck.collapsed"
          :id="`deck-body-${section.deck.id}`"
          class="deck-body"
        >
          <div class="grid">
            <Card
              v-for="item in section.items"
              :key="item.grammar.ko"
              :accent="accentFor(item.info.cls)"
            >
              <div class="item__head">
                <span class="item__ko">{{ item.grammar.ko }}</span>
                <Badge>
                  <MasteryIcon :level="item.level" :size="10" />
                  <span>{{ t(item.info.labelKey) }}</span>
                </Badge>
              </div>
              <div class="item__meaning">{{ tl(item.grammar.meaning) }}</div>
              <div v-if="item.grammar.example" class="item__example">{{ item.grammar.example }}</div>
              <div v-if="item.grammar.trans" class="item__trans">{{ tl(item.grammar.trans) }}</div>
            </Card>
          </div>
        </div>
      </Transition>
    </section>

    <section v-if="orphans.length" class="deck-section deck-section--orphan">
      <header class="deck-header deck-header--static">
        <span class="deck-header__caret" aria-hidden="true">▸</span>
        <h2 class="deck-title">기타 (Otros)</h2>
        <span class="deck-count">{{ orphans.length }}</span>
      </header>
      <div class="deck-body">
        <div class="grid">
          <Card
            v-for="item in orphans"
            :key="item.grammar.ko"
            :accent="accentFor(item.info.cls)"
          >
            <div class="item__head">
              <span class="item__ko">{{ item.grammar.ko }}</span>
              <Badge>
                <MasteryIcon :level="item.level" :size="10" />
                <span>{{ t(item.info.labelKey) }}</span>
              </Badge>
            </div>
            <div class="item__meaning">{{ tl(item.grammar.meaning) }}</div>
            <div v-if="item.grammar.example" class="item__example">{{ item.grammar.example }}</div>
            <div v-if="item.grammar.trans" class="item__trans">{{ tl(item.grammar.trans) }}</div>
          </Card>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.lead {
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
}

.deck-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.deck-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  width: 100%;
  padding: 8px 0;
  border: 0;
  border-bottom: 2px solid var(--border-soft);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  transition: border-color var(--motion-quick, 150ms) var(--ease-out, ease);
}
.deck-header:hover {
  border-bottom-color: var(--ink-soft);
}
.deck-header:focus-visible {
  outline: 2px solid var(--focus-ring, var(--gold));
  outline-offset: 4px;
  border-radius: 2px;
}
.deck-header--static {
  cursor: default;
}
.deck-header__caret {
  display: inline-block;
  font-size: 12px;
  color: var(--ink-soft);
  transition: transform var(--motion-quick, 150ms) var(--ease-out, ease);
}
.deck-header__caret--open {
  transform: rotate(90deg);
}
.deck-title {
  font-family: 'Noto Sans KR', 'Inter', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: var(--ink);
  margin: 0;
  flex: 1;
}
.deck-count {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
  font-feature-settings: 'tnum';
}

/* Deck colour ramp — maps deck.colorId to the existing rustic token palette.
   No new colour tokens introduced; amber falls back to gold-shadow,
   rose to red, violet to ink-soft (advanced/literary feels muted). */
.deck-section--sky    .deck-header { border-bottom-color: var(--sky); }
.deck-section--jade   .deck-header { border-bottom-color: var(--jade); }
.deck-section--gold   .deck-header { border-bottom-color: var(--gold); }
.deck-section--amber  .deck-header { border-bottom-color: var(--gold-shadow, var(--gold)); }
.deck-section--rose   .deck-header { border-bottom-color: var(--red); }
.deck-section--violet .deck-header { border-bottom-color: var(--ink-soft); }
.deck-section--orphan .deck-header { border-bottom-color: var(--border-strong); }

.deck-body {
  overflow: hidden;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* Collapse animation — height + opacity transition.
   Uses max-height for the simplest pure-CSS smooth collapse without JS-measured heights. */
.collapse-enter-active,
.collapse-leave-active {
  transition:
    max-height var(--motion-base, 240ms) var(--ease-out, ease),
    opacity var(--motion-quick, 150ms) var(--ease-out, ease);
  max-height: 4000px;
}
.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.item__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}
.item__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: var(--ink);
}
.item__meaning {
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
  font-size: 14px;
}
.item__example {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  color: var(--ink);
  margin-top: 8px;
}
.item__trans {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ink-soft);
  margin-top: 2px;
}
</style>
