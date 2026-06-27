<script setup lang="ts">
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Modal from '~/components/ui/Modal.vue'
import GrammarStudySheet from '~/components/library/GrammarStudySheet.vue'
import GrammarCard from '~/components/library/GrammarCard.vue'
import LibrarySearchBar from '~/components/library/LibrarySearchBar.vue'
import Icon from '~/components/ui/Icon.vue'
import { useGrammarStore } from '~/stores/grammar'
import { useGrammarModal } from '~/composables/useGrammarModal'
import { useLibrarySearch } from '~/composables/useLibrarySearch'
import { NuxtLink } from '#components'

const grammarStore = useGrammarStore()
const { t } = useI18n()
const { selected, isOpen, open, close } = useGrammarModal()
const { query, level, category, zoneLabel, isFiltering, results, setLevel, setCategory, clear } =
  useLibrarySearch()

/** Grouped view (shown when not filtering): decks in order, empty decks dropped. */
const sections = computed(() => {
  const sortedDecks = [...grammarStore.decks].sort((a, b) => a.order - b.order)
  return sortedDecks
    .map((deck) => ({
      deck,
      items: grammarStore.catalogItems.filter((g) => g.deckId === deck.id),
    }))
    .filter((s) => s.items.length > 0)
})

/** Catalog items whose deckId matches no current deck — rendered under a
 *  fallback section. User custom grammars are excluded (catalogItems). */
const orphans = computed(() => {
  const known = new Set(grammarStore.decks.map((d) => d.id))
  return grammarStore.catalogItems.filter((g) => !known.has(g.deckId))
})

async function onToggleDeck(deckId: string) {
  await grammarStore.toggleDeckCollapsed(deckId)
}
/** Whether a deck is currently excluded from the practice draw (focus mode). */
function isExcluded(deckId: string): boolean {
  return grammarStore.excludedDeckIds.includes(deckId)
}
/** Toggle a deck in/out of the practice draw. Library visibility is unchanged. */
async function onToggleFocus(deckId: string) {
  await grammarStore.toggleDeck(deckId)
}
async function onCardClick(ko: string) {
  await open(ko)
}
</script>

<template>
  <div class="page">
    <BilingualTitle ko="도서관" :latin="t('title.library')" />
    <p class="lead">{{ t('library.lead') }}</p>
    <NuxtLink class="paths-link" to="/paths">{{ t('library.paths_link') }}</NuxtLink>

    <LibrarySearchBar
      v-model:query="query"
      :level="level"
      :category="category"
      :zone-label="zoneLabel"
      :result-count="results.length"
      @set-level="setLevel"
      @set-category="setCategory"
      @clear="clear"
    />

    <!-- Filtering: a single relevance-ranked flat list. -->
    <template v-if="isFiltering">
      <p v-if="results.length === 0" class="empty">{{ t('library.search.no_results') }}</p>
      <div v-else class="grid">
        <GrammarCard
          v-for="g in results"
          :key="g.ko"
          :grammar="g"
          @click="onCardClick(g.ko)"
        />
      </div>
    </template>

    <!-- Default: grouped, collapsible decks. -->
    <template v-else>
      <section
        v-for="section in sections"
        :key="section.deck.id"
        class="deck-section"
        :class="[`deck-section--${section.deck.colorId}`, { 'deck-section--excluded': isExcluded(section.deck.id) }]"
      >
        <div class="deck-header-row">
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
          <button
            type="button"
            class="deck-focus"
            :class="{ 'deck-focus--off': isExcluded(section.deck.id) }"
            :aria-pressed="!isExcluded(section.deck.id)"
            :aria-label="t('library.focus.label')"
            :title="isExcluded(section.deck.id) ? t('library.focus.include') : t('library.focus.exclude')"
            @click="onToggleFocus(section.deck.id)"
          >
            <span class="deck-focus__icon" aria-hidden="true">
              <!-- On = the pixel-art sprout (shared with the mastery-seedling /
                   achievement badge sprite); off = a resting moon. -->
              <Icon v-if="!isExcluded(section.deck.id)" name="mastery-seedling" :size="24" />
              <template v-else>🌙</template>
            </span>
          </button>
        </div>

        <Transition name="collapse">
          <div v-show="!section.deck.collapsed" :id="`deck-body-${section.deck.id}`" class="deck-body">
            <div class="grid">
              <GrammarCard
                v-for="item in section.items"
                :key="item.ko"
                :grammar="item"
                @click="onCardClick(item.ko)"
              />
            </div>
          </div>
        </Transition>
      </section>

      <section v-if="orphans.length" class="deck-section deck-section--orphan">
        <header class="deck-header deck-header--static">
          <span class="deck-header__caret" aria-hidden="true">▸</span>
          <h2 class="deck-title">기타 ({{ t('library.orphan_section') }})</h2>
          <span class="deck-count">{{ orphans.length }}</span>
        </header>
        <div class="deck-body">
          <div class="grid">
            <GrammarCard
              v-for="item in orphans"
              :key="item.ko"
              :grammar="item"
              @click="onCardClick(item.ko)"
            />
          </div>
        </div>
      </section>
    </template>

    <Modal
      :open="isOpen"
      :title="selected?.ko ?? ''"
      :close-label="t('library.modal.close')"
      @close="close"
    >
      <GrammarStudySheet v-if="selected" :key="selected.ko" :grammar="selected" @navigate="open" />
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
.paths-link {
  align-self: flex-start;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 14px;
  color: var(--link);
  text-decoration: underline;
}
.paths-link:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.empty {
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
}

.deck-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Header row: the collapse button (flexes to fill) + the focus toggle.
   Kept as separate sibling buttons so neither nests inside the other. */
.deck-header-row {
  display: flex;
  align-items: stretch;
  gap: 8px;
}
.deck-header-row .deck-header {
  flex: 1;
  min-width: 0;
}

/* "Focus mode" toggle — rests a deck out of the practice draw without
   hiding it from the Library. Mirrors the .deck-header pixel chrome. */
.deck-focus {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  padding: 0 14px;
  background: var(--paper-deep, var(--paper));
  border: 3px solid var(--ink-line);
  box-shadow: 3px 3px 0 var(--shadow-cream);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition:
    transform var(--motion-quick, 120ms) var(--ease-out, ease),
    box-shadow var(--motion-quick, 120ms) var(--ease-out, ease),
    opacity var(--motion-quick, 120ms) var(--ease-out, ease);
}
.deck-focus:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--shadow-cream);
}
.deck-focus:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 var(--shadow-cream);
}
.deck-focus:focus-visible {
  outline: 2px solid var(--focus-ring, var(--gold));
  outline-offset: 3px;
}
.deck-focus--off {
  opacity: 0.6;
}

/* A rested deck dims its header so a glance reads "not in practice";
   the cards stay full-strength because the Library still shows them. */
.deck-section--excluded .deck-header {
  opacity: 0.5;
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

</style>
