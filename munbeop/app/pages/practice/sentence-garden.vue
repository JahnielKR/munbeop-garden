<!-- app/pages/practice/sentence-garden.vue -->
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
import Bed from '~/components/sentence-garden/Bed.vue'
import Tray from '~/components/sentence-garden/Tray.vue'
import SentenceSummary from '~/components/sentence-garden/SentenceSummary.vue'
import { buildDeckOptions, buildCustomDeckOptions } from '~/components/games/ruleta/cards'
import { useSentenceGarden } from '~/composables/useSentenceGarden'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import { useExampleAudio } from '~/composables/useExampleAudio'
import { useLocalized } from '~/composables/useLocalized'
import { kosForDeck } from '~/lib/cloze'
import { useGrammarStore } from '~/stores/grammar'
import { useCustomDecksStore } from '~/stores/customDecks'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const { tl } = useLocalized()
const toast = useToast()
const grammarStore = useGrammarStore()
const customDecks = useCustomDecksStore()
const sg = useSentenceGarden()
const { playExample } = useExampleAudio()

const phaseUi = ref<'pick' | 'play'>('pick')
const started = ref(false)
const builderOpen = ref(false)
const editingDeckId = ref<string | null>(null)

useGameLeaveGuard(() => started.value && sg.phase.value !== 'done')

const deckOptions = computed(() =>
  buildDeckOptions({
    decks: grammarStore.decks,
    items: grammarStore.items,
    excludedDeckIds: grammarStore.excludedDeckIds,
    allName: t('practice.deck_all'),
  }),
)
const customDeckOptions = computed(() => buildCustomDeckOptions({ decks: customDecks.decks }))
const verdict = computed(() =>
  sg.phase.value === 'right' ? true : sg.phase.value === 'wrong' ? false : null,
)

async function beginDeck(kos: string[]) {
  await sg.start(kos)
  if (sg.sessionItems.value.length === 0) {
    toast.info(t('sentenceGarden.deck_empty'))
    return
  }
  started.value = true
  phaseUi.value = 'play'
}
function onDeckSelect(deckId: string | null) {
  void beginDeck(kosForDeck(grammarStore.items, grammarStore.excludedDeckIds, deckId))
}
function onCustomDeckSelect(deckId: string) {
  const deck = customDecks.deckById(deckId)
  if (deck) void beginDeck(deck.grammarKos)
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
  await sg.next()
  if (sg.phase.value === 'done') await sg.finish()
}
function restart() {
  phaseUi.value = 'pick'
  started.value = false
}

onMounted(async () => {
  if (grammarStore.items.length === 0) {
    try {
      await grammarStore.hydrate()
    } catch (err) {
      console.error('sentence-garden: grammar hydration failed', err)
    }
  }
  if (customDecks.decks.length === 0) {
    try {
      await customDecks.hydrate()
    } catch (err) {
      console.error('sentence-garden: custom-deck hydration failed', err)
    }
  }
})
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="문장 정원" :latin="t('sentenceGarden.title')" />
    <PracticeHelp mode="sentence-garden" />
    <p class="lab__lead">{{ t('sentenceGarden.lead') }}</p>

    <div v-if="phaseUi === 'pick'">
      <p class="lab__pick-title">{{ t('sentenceGarden.pick_deck') }}</p>
      <DeckPicker :options="deckOptions" @select="onDeckSelect" />
      <CustomDeckShelf
        :options="customDeckOptions"
        @select="onCustomDeckSelect"
        @create="onCustomCreate"
        @edit="onCustomEdit"
      />
    </div>

    <template v-else>
      <p
        v-if="sg.runMode.value === 'replay' && sg.phase.value !== 'done'"
        class="lab__replay-note"
        role="status"
      >
        <span aria-hidden="true">🔁</span> {{ t('sentenceGarden.replay_mode_label') }}
      </p>

      <template v-if="sg.phase.value !== 'done' && sg.item.value">
        <ProgressDots
          :total="sg.sessionItems.value.length"
          :progress="sg.index.value"
          :label="t('sentenceGarden.progress_label')"
        />

        <div class="sg-prompt">
          <p class="sg-prompt__meaning">{{ tl(sg.item.value.trans) }}</p>
          <button
            v-if="sg.phase.value !== 'placing'"
            type="button"
            class="sg-prompt__hear"
            @click="playExample(sg.item.value.sentence)"
          >
            <span aria-hidden="true">🔊</span> {{ t('sentenceGarden.hear') }}
          </button>
        </div>

        <Bed
          :placed="sg.placed.value"
          :total="sg.item.value.answer.length"
          :verdict="verdict"
          :label="t('sentenceGarden.bed_label')"
          @remove="sg.removeAt"
        />
        <p
          v-if="sg.phase.value === 'wrong'"
          class="sg-reveal"
          role="status"
          lang="ko"
        >
          {{ t('sentenceGarden.reveal_correct', { correct: sg.item.value.answer.join(' ') }) }}
        </p>
        <Tray
          :cards="sg.tray.value"
          :label="t('sentenceGarden.tray_label')"
          @place="sg.place"
        />

        <div class="sg-actions">
          <button
            v-if="sg.phase.value === 'placing'"
            type="button"
            class="sg-actions__check"
            :disabled="!sg.canCheck.value"
            @click="sg.check"
          >
            {{ t('sentenceGarden.check') }}
          </button>
          <button v-else type="button" class="sg-actions__check" @click="onNext">
            {{ t('sentenceGarden.next') }}
          </button>
        </div>
      </template>

      <SentenceSummary
        v-else
        :score="sg.score.value"
        :failed-count="sg.failedItems.value.length"
        @restart="restart"
        @replay-failed="sg.replayFailed"
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
.sg-prompt { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.sg-prompt__meaning { margin: 0; font-family: var(--font-ui); font-size: var(--text-lg); color: var(--ink); }
.sg-prompt__hear {
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
  font-family: var(--font-pixel-small); font-size: var(--text-xs);
  color: var(--ink); background: var(--surface); border: 2px solid var(--border);
  box-shadow: 2px 2px 0 var(--shadow-cream); padding: 6px 12px;
}
.sg-reveal {
  margin: 0;
  font-family: var(--font-ko);
  font-size: var(--text-md, var(--text-lg));
  color: var(--ink);
  background: var(--surface);
  border-left: 4px solid var(--mastery-tree, #5a8f3c);
  padding: 8px 12px;
}
.sg-actions { display: flex; gap: 12px; }
.sg-actions__check {
  font-family: var(--font-pixel-small); font-size: var(--text-sm);
  color: var(--ink); background: var(--paper-warm, var(--surface)); border: 2px solid var(--border);
  box-shadow: 3px 3px 0 var(--shadow-cream); padding: 8px 18px; cursor: pointer;
}
.sg-actions__check:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
