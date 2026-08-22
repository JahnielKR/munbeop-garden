<!-- app/pages/practice/sentence-garden.vue -->
<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
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
import { buildDeckOptions, buildCustomDeckOptions, MIN_CUSTOM_PLAYABLE } from '~/components/games/ruleta/cards'
import { useSentenceGarden } from '~/composables/useSentenceGarden'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import { useExampleAudio } from '~/composables/useExampleAudio'
import { useLocalized } from '~/composables/useLocalized'
import { kosForDeck } from '~/lib/cloze/deck'
import { eligibleRoundCount } from '~/lib/sentence-garden/select'
import { SENTENCE_GARDEN_POOL } from '~/lib/sentence-garden/pool'
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
const builderDirty = ref(false)
const builderBusy = ref(false)
// A tap-order game placed/removed cards without moving focus (it dropped to
// <body> on every tap) and never announced the bed to a screen reader. The
// lab root anchors the post-tap focus move; srAnnounce feeds an sr-only live
// region so each placement/removal is spoken.
const labRoot = ref<HTMLElement | null>(null)
const srAnnounce = ref('')

function focusInLab(selector: string) {
  void nextTick(() => {
    const el = labRoot.value?.querySelector<HTMLElement>(selector)
    el?.focus()
  })
}
function onPlace(card: { id: number; text: string }) {
  sg.place(card)
  srAnnounce.value = t('sentenceGarden.sr_placed', { word: card.text })
  // Keep keyboard focus in the play area (the placed card's button left the DOM):
  // the next tray card, else the Check button IF it's enabled, else a filled bed
  // slot. Guarding on canCheck matters for a decoy overfill — the tray can empty
  // while Check is still disabled, and focusing a disabled button drops to <body>.
  const target = sg.tray.value.length > 0
    ? '.sg-tray__card'
    : sg.canCheck.value
      ? '.sg-actions__check'
      : '.sg-bed__slot--filled'
  focusInLab(target)
}
function onRemove(i: number) {
  const card = sg.placed.value[i]
  sg.removeAt(i)
  if (card) srAnnounce.value = t('sentenceGarden.sr_removed', { word: card.text })
  focusInLab('.sg-tray__card')
}

useGameLeaveGuard(() => builderDirty.value || builderBusy.value || (started.value && (
  sg.phase.value !== 'done' || sg.saving.value || sg.saveError.value
)))

const deckOptions = computed(() =>
  buildDeckOptions({
    decks: grammarStore.decks,
    items: grammarStore.items,
    excludedDeckIds: grammarStore.excludedDeckIds,
    allName: t('practice.deck_all'),
  }),
)
const customDeckOptions = computed(() => {
  const decksById = new Map(customDecks.decks.map((deck) => [deck.id, deck]))
  return buildCustomDeckOptions({
    decks: customDecks.decks,
    catalogKos: grammarStore.items.map((grammar) => grammar.ko),
  }).map((option) => {
    const deck = decksById.get(option.id)
    const count = deck ? eligibleRoundCount(SENTENCE_GARDEN_POOL, deck.grammarKos) : 0
    const tooFew = count < MIN_CUSTOM_PLAYABLE
    return {
      ...option,
      count,
      disabled: tooFew,
      reason: tooFew ? 'too_few' as const : null,
    }
  })
})
const verdict = computed(() =>
  sg.phase.value === 'right' ? true : sg.phase.value === 'wrong' ? false : null,
)

// Round building is synchronous; sg.start fires its SRS mark-seen writes in
// the background. Flipping the UI must never wait on the cloud (a failed write
// used to make the deck tap a silent no-op) — same shape as cloze.vue.
function beginDeck(kos: string[]) {
  sg.start(kos)
  if (sg.sessionItems.value.length === 0) {
    toast.info(t('sentenceGarden.deck_empty'))
    return
  }
  started.value = true
  phaseUi.value = 'play'
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
function closeBuilder() {
  builderDirty.value = false
  builderBusy.value = false
  builderOpen.value = false
  editingDeckId.value = null
}

function requestBuilderClose() {
  if (builderBusy.value) return
  if (builderDirty.value && !window.confirm(t('practice.custom.discard_confirm'))) return
  closeBuilder()
}

async function onNext() {
  await sg.next()
  if (sg.phase.value === 'done') {
    // finish() is best-effort per grammar and reports failure instead of
    // throwing — surface it so a dropped connection doesn't silently eat the
    // round's SRS credit behind a normal-looking summary.
    const ok = await sg.finish()
    if (!ok) toast.error(t('errors.save_failed'))
  }
}
async function onRetrySave() {
  const saved = await sg.retrySave()
  if (!saved) toast.error(t('sentenceGarden.persistence.failed'))
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
  <div ref="labRoot" class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="문장 정원" :latin="t('sentenceGarden.title')" />
    <PracticeHelp mode="sentence-garden" />
    <p class="lab__lead">{{ t('sentenceGarden.lead') }}</p>
    <!-- Screen-reader running commentary for the tap-order interactions. -->
    <p class="sr-only" role="status" aria-live="polite">{{ srAnnounce }}</p>

    <div v-if="phaseUi === 'pick'">
      <p class="lab__pick-title">{{ t('sentenceGarden.pick_deck') }}</p>
      <DeckPicker :options="deckOptions" @select="onDeckSelect" />
      <CustomDeckShelf
        :options="customDeckOptions"
        count-label-key="sentenceGarden.custom_round_count"
        locked-label-key="sentenceGarden.custom_locked_need_rounds"
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

      <div
        v-if="sg.saving.value || sg.saveError.value"
        class="sg-persistence"
        :class="{ 'sg-persistence--error': sg.saveError.value }"
        :role="sg.saveError.value ? 'alert' : 'status'"
      >
        <span>
          {{ sg.saveError.value ? t('sentenceGarden.persistence.failed') : t('sentenceGarden.persistence.saving') }}
        </span>
        <button
          v-if="sg.saveError.value"
          type="button"
          class="sg-persistence__retry"
          data-testid="sentence-garden-save-retry"
          @click="onRetrySave"
        >
          {{ t('sentenceGarden.persistence.retry') }}
        </button>
      </div>

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
          @remove="onRemove"
        />
        <!-- Correct verdict was color-only (green bed border) — announce it in
             text too, like every sibling lab; the wrong case keeps its reveal. -->
        <p v-if="sg.phase.value === 'right'" class="sg-verdict" role="status">
          <span aria-hidden="true">✓</span> {{ t('sentenceGarden.correct') }}
        </p>
        <p
          v-else-if="sg.phase.value === 'wrong'"
          class="sg-reveal"
          role="status"
          lang="ko"
        >
          {{ t('sentenceGarden.reveal_correct', { correct: sg.item.value.answer.join(' ') }) }}
        </p>
        <Tray
          :cards="sg.tray.value"
          :label="t('sentenceGarden.tray_label')"
          @place="onPlace"
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
          <button
            v-else
            type="button"
            class="sg-actions__check"
            :disabled="sg.saving.value || sg.saveError.value"
            @click="onNext"
          >
            {{ t('sentenceGarden.next') }}
          </button>
        </div>
      </template>

      <SentenceSummary
        v-else
        :score="sg.score.value"
        :failed-count="sg.failedItems.value.length"
        :locked="sg.saving.value || sg.saveError.value"
        @restart="restart"
        @replay-failed="sg.replayFailed"
      />
    </template>

    <Modal
      :open="builderOpen"
      :title="t('practice.custom.builder_title')"
      :close-label="t('practice.custom.close')"
      @close="requestBuilderClose"
    >
      <CustomDeckBuilder
        :key="editingDeckId ?? 'new'"
        :deck-id="editingDeckId"
        @dirty="builderDirty = $event"
        @busy="builderBusy = $event"
        @saved="closeBuilder"
      />
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
.sg-verdict {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-pixel-small);
  font-size: var(--text-sm);
  color: var(--mastery-tree, #5a8f3c);
  background: var(--surface);
  border-left: 4px solid var(--mastery-tree, #5a8f3c);
  padding: 8px 12px;
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
.sg-persistence { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 10px 12px; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); background: var(--surface); border-left: 4px solid var(--gold); }
.sg-persistence--error { color: var(--danger); border-left-color: var(--danger); }
.sg-persistence__retry { padding: 6px 10px; color: var(--text); background: var(--paper-warm, var(--surface)); border: 2px solid var(--border-strong); cursor: pointer; font: inherit; }
.sg-persistence__retry:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.sg-actions__check {
  font-family: var(--font-pixel-small); font-size: var(--text-sm);
  color: var(--ink); background: var(--paper-warm, var(--surface)); border: 2px solid var(--border);
  box-shadow: 3px 3px 0 var(--shadow-cream); padding: 8px 18px; cursor: pointer;
}
.sg-actions__check:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
