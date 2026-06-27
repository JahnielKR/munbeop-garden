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
import { useNumberMarket } from '~/composables/useNumberMarket'
import { useNumberSpeed } from '~/composables/useNumberSpeed'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import type { NumberDomain } from '~/lib/domain'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const m = useNumberMarket()
const s = useNumberSpeed()
const mode = ref<'learn' | 'speed'>('learn')
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
  started.value && (mode.value === 'learn' ? m.phase.value !== 'done' : s.phase.value === 'playing')
useGameLeaveGuard(dirty)

function begin(deckId: string) {
  started.value = true
  phase.value = 'play'
  if (mode.value === 'learn') {
    m.selectDomain(deckId as NumberDomain)
    m.start()
  } else {
    s.start(deckId)
    startTimer()
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
    <p class="lab__lead">{{ t('numberMarket.lead') }}</p>

    <MasterStrip
      :per-domain="m.master.perDomain.value"
      :done-count="m.master.doneCount.value"
      :total="m.master.total.value"
      :earned="m.master.earned.value"
    />

    <template v-if="phase === 'pick'">
      <ModeToggle v-model="mode" />
      <p class="lab__hint">{{ mode === 'speed' ? t('numberMarket.speed.start_hint') : t('numberMarket.build_hint') }}</p>
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

    <template v-else>
      <SpeedHud
        :time-left="s.timeLeft.value"
        :score="s.score.value"
        :combo="s.combo.value"
        :best="s.bestScore.value"
      />
      <template v-if="s.phase.value === 'playing'">
        <PromptStage :item="s.item.value" />
        <ChoiceRow :choices="s.choices.value" @choose="s.answer" />
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
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 18px; }
.lab__lead { margin: 0; font-family: 'Inter', sans-serif; color: var(--ink-soft, var(--text-soft)); line-height: 1.6; }
.lab__hint { margin: 0; font-family: 'Inter', sans-serif; font-size: 13px; color: var(--ink-soft); }
.lab__mixed { align-self: flex-start; font-family: 'Noto Sans KR', sans-serif; font-size: 16px; padding: 12px 18px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); cursor: pointer; }
.lab__mixed:hover { border-color: var(--ink); }
.lab__mixed:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.lab__replay { margin: 0; font-family: 'Press Start 2P', monospace; font-size: 10px; color: var(--ink-soft); }
.lab__verdict { margin: 0; font-family: 'Inter', sans-serif; font-size: 15px; }
.lab__verdict--ok { color: var(--accent-bright, #2e7d32); }
.lab__verdict--no { color: var(--danger, #c62828); }
.lab__next { align-self: flex-start; font-family: 'Inter', sans-serif; font-size: 14px; padding: 10px 18px; background: var(--accent, #2e7d32); color: var(--paper, #fff); border: 2px solid var(--accent, #2e7d32); cursor: pointer; }
.lab__next:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
