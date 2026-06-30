<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import DomainPicker from '~/components/numbers-market/DomainPicker.vue'
import ModeToggle from '~/components/numbers-market/ModeToggle.vue'
import PromptStage from '~/components/numbers-market/PromptStage.vue'
import TileTray from '~/components/numbers-market/TileTray.vue'
import MarketSummary from '~/components/numbers-market/MarketSummary.vue'
import MasterStrip from '~/components/numbers-market/MasterStrip.vue'
import ChoiceRow from '~/components/numbers-market/ChoiceRow.vue'
import SpeedHud from '~/components/numbers-market/SpeedHud.vue'
import SpeedSummary from '~/components/numbers-market/SpeedSummary.vue'
import DictationInput from '~/components/numbers-market/DictationInput.vue'
import { useNumberMarket } from '~/composables/useNumberMarket'
import { useNumberSpeed } from '~/composables/useNumberSpeed'
import { useNumberDictation } from '~/composables/useNumberDictation'
import PracticeHelp from '~/components/practice/PracticeHelp.vue'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import type { NumberDomain } from '~/lib/domain'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const m = useNumberMarket()
const s = useNumberSpeed()
const d = useNumberDictation()
const mode = ref<'learn' | 'speed' | 'dictation'>('learn')
const phase = ref<'pick' | 'play'>('pick')
const started = ref(false)

let timer: ReturnType<typeof setInterval> | null = null
function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
function startTimer() {
  stopTimer()
  if (typeof window === 'undefined') return
  timer = setInterval(() => {
    s.tick()
    if (s.phase.value === 'done') stopTimer()
  }, 1000)
}
onBeforeUnmount(stopTimer)

const dirty = () =>
  started.value &&
  (mode.value === 'learn'
    ? m.phase.value !== 'done'
    : mode.value === 'speed'
      ? s.phase.value === 'playing'
      : d.phase.value !== 'done')
useGameLeaveGuard(dirty)

function begin(deckId: string) {
  started.value = true
  phase.value = 'play'
  if (mode.value === 'learn') {
    m.selectDomain(deckId as NumberDomain)
    m.start()
  } else if (mode.value === 'speed') {
    s.start(deckId)
    startTimer()
  } else {
    d.selectDomain(deckId as NumberDomain)
    d.start()
  }
}
function restart() {
  stopTimer()
  phase.value = 'pick'
  started.value = false
}
function playAgain() {
  s.start(s.deckId.value)
  startTimer()
}
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="숫자 시장" :latin="t('numberMarket.title')" />
    <PracticeHelp mode="number-market" />
    <p class="lab__lead">{{ t('numberMarket.lead') }}</p>

    <MasterStrip
      :per-domain="m.master.perDomain.value"
      :done-count="m.master.doneCount.value"
      :total="m.master.total.value"
      :earned="m.master.earned.value"
    />

    <template v-if="phase === 'pick'">
      <ModeToggle v-model="mode" />
      <p class="lab__hint">
        {{ mode === 'speed' ? t('numberMarket.speed.start_hint') : mode === 'dictation' ? t('numberMarket.dictation.listen') : t('numberMarket.build_hint') }}
      </p>
      <button
        v-if="mode === 'speed'"
        type="button"
        class="lab__mixed"
        data-testid="speed-mixed"
        @click="begin('mixed')"
      >🎲 {{ t('numberMarket.speed.deck_mixed') }}</button>
      <DomainPicker @select="begin" />
    </template>

    <template v-else-if="mode === 'learn'">
      <p
        v-if="m.runMode.value === 'replay' && m.phase.value !== 'done'"
        class="lab__replay"
        role="status"
      >
        🔁 {{ t('numberMarket.replay_failed') }}
      </p>
      <ProgressDots
        v-if="m.phase.value !== 'done'"
        :total="m.sessionItems.value.length"
        :progress="m.index.value"
        :label="t('numberMarket.progress')"
      />
      <template v-if="m.phase.value !== 'done'">
        <PromptStage
          :item="m.item.value"
          :reveal="m.phase.value === 'right' || m.phase.value === 'wrong'"
        />
        <p v-if="m.phase.value === 'right'" class="lab__verdict lab__verdict--ok" role="status">
          ✓ {{ t('numberMarket.correct') }}
        </p>
        <p v-else-if="m.phase.value === 'wrong'" class="lab__verdict lab__verdict--no" role="status">
          ✗ {{ t('numberMarket.wrong') }}
        </p>
        <TileTray
          :pool="m.pool.value"
          :built="m.built.value"
          :phase="m.phase.value"
          @place="m.placeTile"
          @undo="m.undoTile"
          @clear="m.clearTiles"
          @submit="m.submit"
        />
        <button
          v-if="m.phase.value === 'right' || m.phase.value === 'wrong'"
          type="button"
          class="lab__next"
          @click="m.next"
        >
          {{ t('numberMarket.next') }}
        </button>
      </template>
      <MarketSummary
        v-else
        :score="m.score.value"
        :failed-items="m.failedItems.value"
        @restart="restart"
        @replay-failed="m.replayFailed"
      />
    </template>

    <template v-else-if="mode === 'speed'">
      <SpeedHud
        :time-left="s.timeLeft.value"
        :score="s.score.value"
        :combo="s.combo.value"
        :best="s.bestScore.value"
      />
      <template v-if="s.phase.value === 'playing'">
        <PromptStage :item="s.item.value" />
        <ChoiceRow :choices="s.choices.value" @choose="s.answer" />
        <!-- Speed has no verdict pause (it advances instantly), so the ✓/✗ never
             shows visually. This hidden live region gives screen-reader users the
             same correct/incorrect feedback as the Learn/Dictation modes. The
             :key forces a re-announce when two answers in a row match. -->
        <p
          v-if="s.lastCorrect.value !== null"
          :key="s.answered.value"
          class="sr-only"
          role="status"
          aria-live="assertive"
        >
          {{ s.lastCorrect.value ? t('numberMarket.correct') : t('numberMarket.wrong') }}
        </p>
      </template>
      <SpeedSummary
        v-else
        :score="s.score.value"
        :best="s.bestScore.value"
        :best-streak="s.bestStreak.value"
        :is-record="s.score.value > 0 && s.score.value >= s.bestScore.value"
        @again="playAgain"
        @restart="restart"
      />
    </template>

    <template v-else>
      <p
        v-if="d.runMode.value === 'replay' && d.phase.value !== 'done'"
        class="lab__replay"
        role="status"
      >
        🔁 {{ t('numberMarket.replay_failed') }}
      </p>
      <ProgressDots
        v-if="d.phase.value !== 'done'"
        :total="d.sessionItems.value.length"
        :progress="d.index.value"
        :label="t('numberMarket.progress')"
      />
      <template v-if="d.phase.value !== 'done'">
        <p class="lab__listen">🎧 {{ t('numberMarket.dictation.listen') }}</p>
        <DictationInput
          :domain="d.item.value.domain"
          :phase="d.phase.value"
          :model-value="d.entry.value"
          @update:model-value="(v) => (d.entry.value = v)"
          @submit="d.submit"
          @replay="d.play"
        />
        <p v-if="d.phase.value === 'right'" class="lab__verdict lab__verdict--ok" role="status">
          ✓ {{ t('numberMarket.correct') }}
        </p>
        <p v-else-if="d.phase.value === 'wrong'" class="lab__verdict lab__verdict--no" role="status">
          ✗ {{ t('numberMarket.wrong') }}
        </p>
        <p
          v-if="d.phase.value === 'right' || d.phase.value === 'wrong'"
          class="lab__reveal"
          role="status"
          lang="ko"
        >{{ d.item.value.answer }} — {{ d.item.value.display }}</p>
        <button
          v-if="d.phase.value === 'right' || d.phase.value === 'wrong'"
          type="button"
          class="lab__next"
          @click="d.next"
        >
          {{ t('numberMarket.next') }}
        </button>
      </template>
      <MarketSummary
        v-else
        :score="d.score.value"
        :failed-items="d.failedItems.value"
        @restart="restart"
        @replay-failed="d.replayFailed"
      />
    </template>
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 18px; }
.lab__lead { margin: 0; font-family: 'Inter', sans-serif; color: var(--ink-soft, var(--text-soft)); line-height: 1.6; }
.lab__hint { margin: 0; font-family: 'Inter', sans-serif; font-size: 13px; color: var(--ink-soft); }
.lab__listen { margin: 0; font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ink-soft); }
.lab__reveal { margin: 0; font-family: 'Noto Sans KR', sans-serif; font-size: 20px; color: var(--accent-bright, #2e7d32); }
.lab__mixed { align-self: flex-start; font-family: 'Noto Sans KR', sans-serif; font-size: 16px; padding: 12px 18px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); cursor: pointer; }
.lab__mixed:hover { border-color: var(--ink); }
.lab__mixed:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.lab__replay { margin: 0; font-family: 'Press Start 2P', monospace; font-size: 10px; color: var(--ink-soft); }
.lab__verdict { margin: 0; font-family: 'Inter', sans-serif; font-size: 15px; }
.lab__verdict--ok { color: var(--accent-bright, #2e7d32); }
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.lab__verdict--no { color: var(--danger, #c62828); }
.lab__next { align-self: flex-start; font-family: 'Inter', sans-serif; font-size: 14px; padding: 10px 18px; background: var(--accent, #2e7d32); color: var(--paper, #fff); border: 2px solid var(--accent, #2e7d32); cursor: pointer; }
.lab__next:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
