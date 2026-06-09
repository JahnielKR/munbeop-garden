<script setup lang="ts">
import Badge from '~/components/ui/Badge.vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Card from '~/components/ui/Card.vue'
import Modal from '~/components/ui/Modal.vue'
import MasteryIcon from '~/components/practice/MasteryIcon.vue'
import GrammarStudySheet from '~/components/library/GrammarStudySheet.vue'
import { getMasteryInfo } from '~/lib/srs'
import { useGrammarStore } from '~/stores/grammar'
import { useSrsStore } from '~/stores/srs'
import { useGrammarModal } from '~/composables/useGrammarModal'

const grammarStore = useGrammarStore()
const srsStore = useSrsStore()
const { t } = useI18n()
const { tl } = useLocalized()
const { selected, isOpen, open, close } = useGrammarModal()

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

async function onCardClick(ko: string) {
  await open(ko)
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
              clickable
              @click="onCardClick(item.grammar.ko)"
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
            clickable
            @click="onCardClick(item.grammar.ko)"
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

    <Modal
      :open="isOpen"
      :title="selected?.ko ?? ''"
      :close-label="t('library.modal.close')"
      @close="close"
    >
      <GrammarStudySheet v-if="selected" :key="selected.ko" :grammar="selected" />
    </Modal>
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

/* Header block — full-width pixel-art rectangle.
   Matches the welcome-screen `.opt` button language:
     paper-deep surface · 3px ink-line outline · chunky cream shadow ·
     Press Start 2P type. The left edge thickens to 8px and takes on
     the deck's color as a tier-tag stripe, so a quick glance reads
     "this is TOPIK N" without reading the text. */
.deck-header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  background: var(--paper-deep, var(--paper));
  color: var(--ink);
  border: 3px solid var(--ink-line);
  border-left-width: 8px;
  box-shadow: 3px 3px 0 var(--shadow-cream);
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-align: left;
  cursor: pointer;
  transition:
    background var(--motion-quick, 120ms) var(--ease-out, ease),
    transform var(--motion-quick, 120ms) var(--ease-out, ease),
    box-shadow var(--motion-quick, 120ms) var(--ease-out, ease);
}
.deck-header:hover:not(:disabled) {
  background: var(--hover-bg, var(--paper-deep));
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--shadow-cream);
}
.deck-header:active:not(:disabled) {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 var(--shadow-cream);
}
.deck-header:focus-visible {
  outline: 2px solid var(--focus-ring, var(--gold));
  outline-offset: 3px;
}
.deck-header--static {
  cursor: default;
}
.deck-header--static:hover {
  background: var(--paper-deep, var(--paper));
  transform: none;
  box-shadow: 3px 3px 0 var(--shadow-cream);
}

.deck-header__caret {
  display: inline-block;
  width: 12px;
  font-size: 10px;
  color: var(--ink-soft);
  transition: transform var(--motion-quick, 120ms) var(--ease-out, ease);
}
.deck-header__caret--open {
  transform: rotate(90deg);
}
.deck-title {
  margin: 0;
  flex: 1;
  font: inherit; /* inherit Press Start 2P from the header */
  color: var(--ink);
}
.deck-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 4px 8px;
  background: var(--paper);
  border: 2px solid var(--ink-line);
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: var(--ink-soft);
  font-feature-settings: 'tnum';
}

/* Deck colour stripe — left-border tag using the existing rustic palette.
   No new colour tokens; amber falls back to gold-shadow, rose to red,
   violet to ink-line (advanced/literary feels woody). */
.deck-section--sky    .deck-header { border-left-color: var(--sky); }
.deck-section--jade   .deck-header { border-left-color: var(--jade); }
.deck-section--gold   .deck-header { border-left-color: var(--gold); }
.deck-section--amber  .deck-header { border-left-color: var(--gold-shadow, var(--gold)); }
.deck-section--rose   .deck-header { border-left-color: var(--red); }
.deck-section--violet .deck-header { border-left-color: var(--ink-line); }
.deck-section--orphan .deck-header { border-left-color: var(--ink-soft); }

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
