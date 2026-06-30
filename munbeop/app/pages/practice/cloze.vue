<!-- app/pages/practice/cloze.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import PracticeHelp from '~/components/practice/PracticeHelp.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import DeckPicker from '~/components/games/ruleta/DeckPicker.vue'
import CustomDeckShelf from '~/components/games/ruleta/CustomDeckShelf.vue'
import CustomDeckBuilder from '~/components/games/ruleta/CustomDeckBuilder.vue'
import Modal from '~/components/ui/Modal.vue'
import ClozeCard from '~/components/cloze-drill/ClozeCard.vue'
import ClozeSummary from '~/components/cloze-drill/ClozeSummary.vue'
import { buildDeckOptions, buildCustomDeckOptions } from '~/components/games/ruleta/cards'
import { useClozeDrill } from '~/composables/useClozeDrill'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import { itemsForKos, kosForDeck } from '~/lib/cloze'
import { useGrammarStore } from '~/stores/grammar'
import { useCustomDecksStore } from '~/stores/customDecks'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const toast = useToast()
const grammarStore = useGrammarStore()
const customDecks = useCustomDecksStore()
const drill = useClozeDrill()

const MIN_ITEMS = 3
const phase = ref<'pick' | 'play'>('pick')
const started = ref(false)
const builderOpen = ref(false)
const editingDeckId = ref<string | null>(null)

useGameLeaveGuard(() => started.value && drill.phase.value !== 'done')

const deckOptions = computed(() =>
  buildDeckOptions({
    decks: grammarStore.decks,
    items: grammarStore.items,
    excludedDeckIds: grammarStore.excludedDeckIds,
    allName: t('practice.deck_all'),
  }),
)
const customDeckOptions = computed(() => buildCustomDeckOptions({ decks: customDecks.decks }))

function beginDeck(kos: string[]) {
  if (itemsForKos(kos).length < MIN_ITEMS) {
    toast.info(t('cloze.deck_empty'))
    return
  }
  void drill.start(kos)
  started.value = true
  phase.value = 'play'
}
function onDeckSelect(deckId: string | null) {
  beginDeck(kosForDeck(grammarStore.items, grammarStore.excludedDeckIds, deckId))
}
function onCustomDeckSelect(deckId: string) {
  const deck = customDecks.deckById(deckId)
  if (deck) beginDeck(deck.grammarKos)
}

function onCustomCreate() {
  editingDeckId.value = null
  builderOpen.value = true
}
function onCustomEdit(deckId: string) {
  editingDeckId.value = deckId
  builderOpen.value = true
}
function onBuilderClose() {
  builderOpen.value = false
  editingDeckId.value = null
}

async function onNext() {
  await drill.next()
  if (drill.phase.value === 'done') await drill.finish()
}
function restart() {
  phase.value = 'pick'
  started.value = false
}
function onReplayFailed() {
  drill.replayFailed()
}

onMounted(async () => {
  // Hard refresh / deep link mounts before layout hydration — hydrate idempotently.
  if (grammarStore.items.length === 0) {
    try {
      await grammarStore.hydrate()
    } catch (err) {
      console.error('cloze: grammar hydration failed', err)
    }
  }
  if (customDecks.decks.length === 0) {
    try {
      await customDecks.hydrate()
    } catch (err) {
      console.error('cloze: custom-deck hydration failed', err)
    }
  }
})
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="빈칸 연습" :latin="t('cloze.title')" />
    <PracticeHelp mode="cloze" />
    <p class="lab__lead">{{ t('cloze.lead') }}</p>

    <div v-if="phase === 'pick'">
      <p class="lab__pick-title">{{ t('cloze.pick_deck') }}</p>
      <DeckPicker :options="deckOptions" @select="onDeckSelect" />
      <CustomDeckShelf
        :options="customDeckOptions"
        @select="onCustomDeckSelect"
        @create="onCustomCreate"
        @edit="onCustomEdit"
      />
    </div>

    <template v-else>
      <p v-if="drill.runMode.value === 'replay' && drill.phase.value !== 'done'" class="lab__replay-note" role="status">
        <span aria-hidden="true">🔁</span> {{ t('cloze.replay_mode_label') }}
      </p>
      <ProgressDots
        v-if="drill.phase.value !== 'done'"
        :total="drill.sessionItems.value.length"
        :progress="drill.index.value"
        :label="t('cloze.progress_label')"
      />
      <ClozeCard
        v-if="drill.phase.value !== 'done'"
        :item="drill.item.value"
        :options="drill.displayOptions.value"
        :phase="drill.phase.value"
        :verdict="drill.phase.value === 'right' ? true : drill.phase.value === 'wrong' ? false : null"
        :picked="drill.picked.value"
        @answer="drill.answer"
        @next="onNext"
      />
      <ClozeSummary
        v-else
        :score="drill.score.value"
        :failed-items="drill.failedItems.value"
        @restart="restart"
        @replay-failed="onReplayFailed"
      />
    </template>

    <Modal
      :open="builderOpen"
      :title="t('practice.custom.builder_title')"
      :close-label="t('practice.custom.close')"
      @close="onBuilderClose"
    >
      <CustomDeckBuilder :key="editingDeckId ?? 'new'" :deck-id="editingDeckId" @saved="onBuilderClose" />
    </Modal>
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 20px; }
.lab__lead { margin: 0; font-family: var(--font-ui); color: var(--text-soft); line-height: 1.6; }
.lab__pick-title {
  margin: 0 0 12px; font-family: var(--font-pixel-small); font-size: var(--text-xs);
  letter-spacing: 0.06em; color: var(--text-soft); text-transform: uppercase;
}
.lab__replay-note {
  margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.04em;
  color: var(--text-soft); background: var(--surface); border: 2px dashed var(--border); padding: 8px 12px;
}
</style>
